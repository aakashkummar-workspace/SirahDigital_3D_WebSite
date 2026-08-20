import { NextResponse } from 'next/server';
import { storeLead, hashIp, leadStoreConfigured } from '@/lib/leads';
import { claimSlot, bookingConfigured } from '@/lib/slots';
import { consentRecord } from '@/data/consent';
import { normalise } from '@/lib/whatsapp';

/**
 * POST /api/book — the whole booking, in one request.
 *
 * ── Why this is not /api/contact with an extra field ─────────────────────
 * They do different things on failure, and that is the only distinction that
 * matters. A contact enquiry that half-lands is recoverable: the row is in the
 * CMS, someone reads it, they get a reply. A booking that half-lands is a person
 * who believes they have a call in the diary. So this route refuses to report
 * success unless the slot was actually claimed, whereas /api/contact deliberately
 * returns ok when the lead was stored and only the notifications failed.
 *
 * ── Why the lead is stored before the slot is claimed ────────────────────
 * Not for tidiness — the CMS looks the lead up by email to find the WhatsApp
 * number, and it does that inside the booking call. Claim first and the booking
 * is created against a lead that does not exist yet, so `inviteePhone` is empty
 * and all three WhatsApp messages are skipped for a booking that otherwise looks
 * perfectly healthy. The order is load-bearing.
 *
 * It also means someone who fills in the form and then abandons the calendar is
 * still a lead worth following up, which is how /book behaved before.
 */

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const {
    firstName = '', lastName = '', email = '', phone = '', company = '',
    slotId, consent = false,
    /*
     * Set by the contact form, which stored this person a moment ago through
     * /api/contact — with their message and product interests on the row.
     *
     * Writing a second lead here would not be a harmless duplicate: the CMS
     * matches a booking to its lead by email, most recent first, so the newer
     * and emptier row would win and the team email would lose the brief.
     *
     * Trusting the client with this is deliberate and safe. The worst a forged
     * `true` achieves is that the sender's own lead is not stored — it grants
     * nothing, reveals nothing, and there is no incentive to send it.
     */
    leadAlreadyStored = false,
    // Hidden field no human ever fills in; bots do. Same trap as /api/contact.
    website = '',
  } = body || {};

  if (website) {
    // Silently accept so the bot does not learn it was caught. Nothing is
    // stored and no slot is claimed.
    return NextResponse.json({ ok: true });
  }

  const trimmed = {
    firstName: String(firstName).trim().slice(0, 120),
    lastName: String(lastName).trim().slice(0, 120),
    email: String(email).trim().slice(0, 200),
    phone: String(phone).trim().slice(0, 40),
    company: String(company).trim().slice(0, 200),
  };

  if (!trimmed.firstName) {
    return NextResponse.json({ ok: false, error: 'Please tell us your name.' }, { status: 422 });
  }
  if (!isEmail(trimmed.email)) {
    return NextResponse.json({ ok: false, error: 'That email address does not look right.' }, { status: 422 });
  }
  if (normalise(trimmed.phone).length < 10) {
    return NextResponse.json(
      { ok: false, error: 'Please add a WhatsApp number we can reach you on.' },
      { status: 422 },
    );
  }
  if (!Number.isInteger(Number(slotId)) || Number(slotId) <= 0) {
    return NextResponse.json({ ok: false, error: 'Please choose a time.' }, { status: 422 });
  }
  /*
   * Consent refused server-side, not merely `required` on the checkbox — the
   * same rule /api/contact enforces, and for the same reason: storing someone's
   * details without it is the thing DPDP actually prohibits, and a submission
   * that never went through our form must not be able to skip it.
   */
  if (consent !== true) {
    return NextResponse.json(
      { ok: false, error: 'Please tick the consent box so we may contact you.' },
      { status: 422 },
    );
  }

  if (!bookingConfigured) {
    console.error('[book] booking is not configured — CMS_API_BASE / LEAD_INTAKE_SECRET missing');
    return NextResponse.json(
      { ok: false, error: 'Bookings are unavailable just now. Please email support@sirahdigital.in.' },
      { status: 503 },
    );
  }

  const submittedAt = new Date().toISOString();
  const name = [trimmed.firstName, trimmed.lastName].filter(Boolean).join(' ');

  // ── The lead, first ───────────────────────────────────────────────────
  if (leadStoreConfigured && leadAlreadyStored !== true) {
    try {
      await storeLead({
        ...trimmed,
        message: 'Booked a consultation call via /book.',
        interests: [],
        sourcePath: '/book',
        consentGivenAt: submittedAt,
        consentText: consentRecord(),
        ipHash: hashIp(request),
      });
    } catch (err) {
      /*
       * Logged and carried on, deliberately.
       *
       * A failed lead write costs the WhatsApp messages for this booking — the
       * CMS will find no lead, so no phone number, so it sends nothing. That is
       * a real loss. Refusing the booking over it would be a bigger one: the
       * person came to arrange a call, the calendar is available, and turning
       * them away because our CRM hiccuped trades a booking for a database row.
       *
       * The enquiry is inlined into the log because at this point that line is
       * the only copy of it that exists.
       */
      console.error('[book] lead store FAILED — reminders will not send:', err?.message, {
        ...trimmed,
        submittedAt,
      });
    }
  }

  // ── Then the slot ─────────────────────────────────────────────────────
  const result = await claimSlot({
    slotId: Number(slotId),
    name,
    email: trimmed.email,
    phone: trimmed.phone,
  });

  if (!result.ok) {
    /*
     * 409 is handed straight through so the picker can tell the two apart. A
     * lost race is not an error the visitor caused and not one they need to
     * leave the page over — the picker refreshes and asks them to choose again.
     */
    return NextResponse.json(
      { ok: false, taken: Boolean(result.taken), error: result.error },
      { status: result.taken ? 409 : 502 },
    );
  }

  /*
   * No confirmation is sent from here. The booking's WhatsApp message, the
   * two reminders and the team email all go out from the CMS job, off the
   * timestamps on the booking row. Sending one here as well would be a second
   * implementation of "has this already gone", and the two would eventually
   * disagree — most likely by messaging someone twice.
   */
  return NextResponse.json({
    ok: true,
    bookingId: result.bookingId,
    startAt: result.startAt,
    timeZone: result.timeZone,
  });
}
