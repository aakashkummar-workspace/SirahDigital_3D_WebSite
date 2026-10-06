import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import {
  sendWhatsAppText, formatLead, formatConfirmation, normalise,
  whatsappConfigured, whatsappReady,
} from '@/lib/whatsapp';
import { storeLead, hashIp, leadStoreConfigured } from '@/lib/leads';
import { consentRecord } from '@/data/consent';
import { HOME_PRODUCTS } from '@/data/products';
import { isEmail, isPhone, PHONE_HINT } from '@/lib/validate';

// Where leads go. Set LEAD_WEBHOOK_URL in .env.local to the endpoint that
// should receive them (Evolution API, n8n, Make, a CRM, whatever). With it
// unset the route still accepts and validates the submission and logs it to
// the server console, so the form is usable in development.
const WEBHOOK = process.env.LEAD_WEBHOOK_URL;
const WEBHOOK_TOKEN = process.env.LEAD_WEBHOOK_TOKEN;

/*
 * isEmail and isPhone now come from src/lib/validate.js, shared with the two
 * forms and with /api/book. The local copy this replaces accepted "a@b." — a
 * trailing dot and no TLD — and there was no phone rule here beyond a length.
 */

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
  // The reply goes out on WhatsApp, so the number has to be a real one.
  // Same ten-digit rule as the booking route and both forms — see validate.js.
  if (!isPhone(trimmed.phone)) {
    return NextResponse.json({ ok: false, error: PHONE_HINT }, { status: 422 });
  }
  // Gateway form (country code prepended, digits only) for the send below.
  const leadNumber = normalise(trimmed.phone);
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

  // Which form this came from, allowlisted. Recorded on the lead so the team can
  // tell an enquiry with a written brief from a straight booking — the two flows
  // are otherwise identical now, and both end on the calendar.
  const form = KNOWN_SOURCES.has(sourcePath) ? sourcePath : '/contact';

  let stored = false;
  let confirmed = false;
  let notified = false;

  /*
   * The three jobs run together, not one after another.
   *
   * They are independent: the WhatsApp messages do not read the stored row, and
   * the row does not wait on them. Run in sequence the visitor sat through the
   * CMS write and two gateway calls back to back — up to 30 seconds in the worst
   * case — on the "One moment…" button. Each job still catches its own failure,
   * so one being down never costs the others, and the lead row is still written
   * even if both messages fail.
   *
   * The confirmation is sent from both forms because both end on the calendar;
   * its real audience is whoever closes the tab without choosing a slot.
   */
  const storing = (
(async () => {
      if (!leadStoreConfigured) return;
      try {
        await storeLead({
          ...trimmed,
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
    })()
  );

  const messaging = Promise.all([
    (async () => {
      if (!whatsappReady) return;
      try {
        await sendWhatsAppText({ to: leadNumber, text: formatConfirmation(lead) });
        confirmed = true;
      } catch (err) {
        console.error('[lead] WhatsApp confirmation failed:', err?.message, leadNumber);
      }
    })(),
    (async () => {
      if (!whatsappConfigured) return;
      try {
        await sendWhatsAppText({ text: formatLead(lead) });
        notified = true;
      } catch (err) {
        console.error('[lead] WhatsApp team notify failed:', err?.message, lead);
      }
    })(),
  ]);

  await storing;
  /*
   * The visitor does not wait for WhatsApp once the lead is safe.
   *
   * The gateway can be slow or down — a disconnected session answers only after
   * the full 10-second timeout, twice over — and the messages are a courtesy:
   * the stored row is the enquiry. So when the row exists the sends carry on
   * after the response (waitUntil keeps the function alive for them) and the
   * button clears as soon as the CMS write is done. When nothing was stored the
   * messages may be the only record, so that case still waits for them and
   * reports honestly below.
   */
  if (stored) {
    waitUntil(messaging);
  } else {
    await messaging;
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
