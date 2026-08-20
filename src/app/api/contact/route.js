import { NextResponse } from 'next/server';
import {
  sendWhatsAppText, formatLead, formatConfirmation, normalise,
  whatsappConfigured, whatsappReady,
} from '@/lib/whatsapp';
import { storeLead, hashIp, leadStoreConfigured } from '@/lib/leads';
import { consentRecord } from '@/data/consent';
import { HOME_PRODUCTS } from '@/data/products';

// Where leads go. Set LEAD_WEBHOOK_URL in .env.local to the endpoint that
// should receive them (Evolution API, n8n, Make, a CRM, whatever). With it
// unset the route still accepts and validates the submission and logs it to
// the server console, so the form is usable in development.
const WEBHOOK = process.env.LEAD_WEBHOOK_URL;
const WEBHOOK_TOKEN = process.env.LEAD_WEBHOOK_TOKEN;

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// The forms that legitimately post here. /book no longer does — it posts to
// /api/book, which stores its own lead and then claims the slot in one request —
// but the value stays allowed because rows written by the old flow carry it and
// it remains a truthful sourcePath.
const KNOWN_SOURCES = new Set(['/contact', '/book']);

/*
 * What the product-interest chips are allowed to say.
 *
 * Allowlisted for the same reason sourcePath is: the value ends up in front of
 * a human deciding how to follow up, so an arbitrary caller-supplied string is
 * a small injection into that judgement. The set is known, short, and derived
 * from the products themselves so a fourth needs no edit here.
 *
 * `custom-software` and `not-sure` are the two non-product options the form
 * offers alongside them — see INTEREST_OPTIONS in
 * components/sections/ContactForm.jsx. Neither is in HOME_PRODUCTS, so both
 * have to be written out here; the labels must match the chips, because this
 * map is what the lead and the WhatsApp notification are worded from.
 */
const KNOWN_INTERESTS = new Map([
  ...HOME_PRODUCTS.map((p) => [p.slug, p.title]),
  ['custom-software', 'Custom Software'],
  ['not-sure', 'Not sure yet'],
]);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const {
    firstName = '', lastName = '', email = '', phone = '', company = '', message = '',
    // Explicit DPDP opt-in. A boolean, not the notice text — the wording is a
    // server-side constant so a crafted POST cannot invent a consent notice
    // that was never displayed. See src/data/consent.js.
    consent = false,
    // Which form this came from. Allowlisted below rather than trusted: it is
    // written to the lead and read by a human deciding how to follow up, so an
    // arbitrary caller-supplied string would be a small injection into that
    // judgement — and the set of forms is known and short.
    sourcePath = '/contact',
    // Which products the enquiry named, as slugs. Optional: most enquiries are
    // not about a specific product, and the form does not require it.
    interest = [],
    // Hidden field no human ever fills in; bots do.
    website = '',
  } = body || {};

  if (website) {
    // Silently accept so the bot does not learn it was caught.
    return NextResponse.json({ ok: true });
  }

  /*
   * Resolved to the product's own title rather than kept as a slug. Everything
   * downstream of here is read by a person — a WhatsApp message, a CMS row, a
   * webhook payload someone eyeballs — and "aura-transcriber" is not what any
   * of them should be showing. Unknown values are dropped silently rather than
   * rejected: a stale chip should not cost us the enquiry.
   */
  const interests = (Array.isArray(interest) ? interest : [])
    .slice(0, KNOWN_INTERESTS.size)
    .map((id) => KNOWN_INTERESTS.get(String(id)))
    .filter(Boolean);

  const trimmed = {
    firstName: String(firstName).trim().slice(0, 120),
    lastName: String(lastName).trim().slice(0, 120),
    email: String(email).trim().slice(0, 200),
    phone: String(phone).trim().slice(0, 40),
    company: String(company).trim().slice(0, 200),
    message: String(message).trim().slice(0, 4000),
  };

  if (!trimmed.firstName) {
    return NextResponse.json({ ok: false, error: 'Please tell us your name.' }, { status: 422 });
  }
  if (!isEmail(trimmed.email)) {
    return NextResponse.json({ ok: false, error: 'That email address does not look right.' }, { status: 422 });
  }
  if (!trimmed.message) {
    return NextResponse.json({ ok: false, error: 'Please tell us what you need.' }, { status: 422 });
  }
  // The confirmation goes out on WhatsApp, so we need a usable number.
  const leadNumber = normalise(trimmed.phone);
  if (leadNumber.length < 10) {
    return NextResponse.json(
      { ok: false, error: 'Please add a WhatsApp number we can reach you on.' },
      { status: 422 }
    );
  }
  /*
   * Consent is refused server-side, not just marked `required` on the input.
   * The checkbox is what a person sees; this is what makes it true of every
   * submission, including ones that never went through the form. Storing
   * someone's details without it is the thing DPDP actually prohibits, so this
   * is a hard 422 rather than a stored row with an empty consent column.
   */
  if (consent !== true) {
    return NextResponse.json(
      { ok: false, error: 'Please tick the consent box so we may contact you.' },
      { status: 422 }
    );
  }

  const submittedAt = new Date().toISOString();
  const lead = {
    ...trimmed,
    interests,
    source: 'sirahdigital.in - consultation form',
    submittedAt,
  };

  /*
   * Store first, notify second.
   *
   * The order is deliberate. A WhatsApp message is a courtesy that can be
   * re-sent by hand; the row is the only thing that still exists tomorrow. If
   * the gateway is up and the CMS is down, writing the row first means the
   * enquiry survives — whereas notifying first and crashing loses it entirely,
   * which is the failure this whole change exists to end.
   */
  // Which form this came from, allowlisted. Recorded on the lead so the team can
  // tell an enquiry with a written brief from a straight booking — the two flows
  // are otherwise identical now, and both end on the calendar.
  const form = KNOWN_SOURCES.has(sourcePath) ? sourcePath : '/contact';

  let stored = false;
  if (leadStoreConfigured) {
    try {
      await storeLead({
        ...trimmed,
        /*
         * The "[Interested in: ...]" prefix that used to be glued onto the
         * message is gone: Leads now has a real `interests` column, so the
         * answer is stored as data rather than smuggled through prose. The
         * booking email reads it from there.
         */
        message: trimmed.message,
        interests,
        sourcePath: form,
        consentGivenAt: submittedAt,
        consentText: consentRecord(),
        ipHash: hashIp(request),
      });
      stored = true;
    } catch (err) {
      // Loud, and with the lead inlined: this log line is the only remaining
      // copy of the enquiry when the CMS is unreachable.
      console.error('[lead] CMS store FAILED - enquiry exists only in this log:', err?.message, lead);
    }
  }

  // Confirm to the person on the number they typed, and alert the team if a
  // team recipient is configured. Both are best-effort: a gateway failure must
  // not cost us the lead, so we log and carry on rather than failing the POST.
  let confirmed = false;
  let notified = false;

  /*
   * Sent from both forms, because both now end on the calendar.
   *
   * This was briefly restricted to /contact, when that form finished with "we
   * will be in touch shortly" and /book went on to the calendar — the old
   * wording promised a call to schedule, which contradicted anyone mid-booking.
   * Both flows are the same now, and formatConfirmation was rewritten to suit
   * them: it acknowledges the enquiry and carries the booking link rather than
   * promising to arrange the time for them.
   *
   * Its real audience is whoever fills in a form and then closes the tab without
   * choosing a slot. The link is how they finish unaided; for anyone who does
   * book, it simply arrives a moment before their confirmation and contradicts
   * none of it.
   */
  if (whatsappReady) {
    try {
      await sendWhatsAppText({ to: leadNumber, text: formatConfirmation(lead) });
      confirmed = true;
    } catch (err) {
      console.error('[lead] WhatsApp confirmation failed:', err?.message, leadNumber);
    }
  }

  if (whatsappConfigured) {
    try {
      await sendWhatsAppText({ text: formatLead(lead) });
      notified = true;
    } catch (err) {
      console.error('[lead] WhatsApp team notify failed:', err?.message, lead);
    }
  }

  if (!WEBHOOK) {
    /*
     * Nothing kept it and nothing announced it — the state this route used to be
     * in permanently. Tell the visitor to email instead rather than showing a
     * success message over a lost enquiry: a cheerful "we will be in touch"
     * that nobody can act on is worse than an honest failure, because they stop
     * chasing us.
     */
    if (!stored && !confirmed && !notified) {
      console.error('[lead] NOTHING configured to store or receive this:', lead);
      return NextResponse.json(
        { ok: false, error: 'We could not submit that just now. Please email support@sirahdigital.in instead.' },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, delivered: false, stored, confirmed, notified });
  }

  try {
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WEBHOOK_TOKEN ? { Authorization: `Bearer ${WEBHOOK_TOKEN}` } : {}),
      },
      body: JSON.stringify(lead),
      // Never let a slow downstream hang the visitor's request.
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      // Log the lead so a downstream outage does not lose it outright.
      console.error('[lead] webhook rejected', res.status, lead);
      return webhookFailed(stored, confirmed, notified);
    }
  } catch (err) {
    console.error('[lead] webhook failed', err?.message, lead);
    return webhookFailed(stored, confirmed, notified);
  }

  return NextResponse.json({ ok: true, delivered: true, stored, confirmed, notified });
}

/*
 * The webhook is an *extra* destination, so whether its failure is the visitor's
 * problem depends on whether anything else kept the enquiry.
 *
 * Stored in the CMS: we have it, someone will see it in the admin, and telling
 * the person to email us instead would produce a duplicate and imply we lost
 * something we did not. Nothing stored: the webhook was the last chance, and
 * they need to know it did not land.
 */
function webhookFailed(stored, confirmed, notified) {
  if (stored) {
    return NextResponse.json({ ok: true, delivered: false, stored, confirmed, notified });
  }
  return NextResponse.json(
    { ok: false, error: 'We could not submit that just now. Please email support@sirahdigital.in instead.' },
    { status: 502 }
  );
}
