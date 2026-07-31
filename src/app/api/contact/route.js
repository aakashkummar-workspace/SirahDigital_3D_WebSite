import { NextResponse } from 'next/server';
import {
  sendWhatsAppText, formatLead, formatConfirmation, normalise,
  whatsappConfigured, whatsappReady,
} from '@/lib/whatsapp';

// Where leads go. Set LEAD_WEBHOOK_URL in .env.local to the endpoint that
// should receive them (Evolution API, n8n, Make, a CRM, whatever). With it
// unset the route still accepts and validates the submission and logs it to
// the server console, so the form is usable in development.
const WEBHOOK = process.env.LEAD_WEBHOOK_URL;
const WEBHOOK_TOKEN = process.env.LEAD_WEBHOOK_TOKEN;

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const {
    firstName = '', lastName = '', email = '', phone = '', company = '', message = '',
    // Hidden field no human ever fills in; bots do.
    website = '',
  } = body || {};

  if (website) {
    // Silently accept so the bot does not learn it was caught.
    return NextResponse.json({ ok: true });
  }

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

  const lead = {
    ...trimmed,
    source: 'sirahdigital.in — consultation form',
    submittedAt: new Date().toISOString(),
  };

  // Confirm to the person on the number they typed, and alert the team if a
  // team recipient is configured. Both are best-effort: a gateway failure must
  // not cost us the lead, so we log and carry on rather than failing the POST.
  let confirmed = false;
  let notified = false;

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
    if (!confirmed && !notified) console.log('[lead] nothing configured to receive this, logging:', lead);
    return NextResponse.json({ ok: true, delivered: false, confirmed, notified });
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
      return NextResponse.json(
        { ok: false, error: 'We could not submit that just now. Please email us instead.' },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error('[lead] webhook failed', err?.message, lead);
    return NextResponse.json(
      { ok: false, error: 'We could not submit that just now. Please email us instead.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, delivered: true, confirmed, notified });
}
