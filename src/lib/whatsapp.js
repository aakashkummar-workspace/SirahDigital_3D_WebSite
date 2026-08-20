// WhatsApp notifications via the Sirah Messenger gateway (chat.sirahagents.com).
//
// Contract, taken from the manager UI's own client:
//   POST {BASE}/send/text
//   headers: { apikey: <instance token> }
//   body:    { number: "<msisdn>", text: "<message>" }
//
// The instance is identified by the token, not by a path segment, so
// WHATSAPP_INSTANCE is kept only for logging and error messages.

import { COMPANY } from '@/data/company';

const BASE = (process.env.WHATSAPP_API_URL || '').replace(/\/$/, '');
const KEY = process.env.WHATSAPP_API_KEY;
const INSTANCE = process.env.WHATSAPP_INSTANCE || 'default';
const TO = process.env.WHATSAPP_TO;
const DEFAULT_CC = (process.env.WHATSAPP_DEFAULT_CC || '91').replace(/[^\d]/g, '');

// Can we message anyone at all?
export const whatsappReady = Boolean(BASE && KEY);
// Is a team recipient configured?
export const whatsappConfigured = Boolean(BASE && KEY && TO);

/**
 * Gateways want digits only — no +, spaces or dashes. People type their number
 * every which way, so also handle a leading 0 (trunk prefix) and a bare
 * national number with no country code.
 */
export function normalise(input) {
  let n = String(input || '').replace(/[^\d]/g, '');
  if (!n) return '';
  n = n.replace(/^0+/, '');                     // 0 98765 43210 -> 9876543210
  if (n.length <= 10 && DEFAULT_CC) n = DEFAULT_CC + n;
  return n;
}

export async function sendWhatsAppText({ to = TO, text }) {
  if (!BASE || !KEY) throw new Error('WhatsApp gateway is not configured.');
  const number = normalise(to);
  if (!number) throw new Error('No WhatsApp recipient configured.');

  const res = await fetch(`${BASE}/send/text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY },
    body: JSON.stringify({ number, text }),
    signal: AbortSignal.timeout(10_000),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`WhatsApp gateway ${res.status} on instance "${INSTANCE}": ${raw.slice(0, 200)}`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}

/*
 * The public booking page, for the message below.
 *
 * It used to be built from NEXT_PUBLIC_TIDYCAL_PATH and point at tidycal.com.
 * The calendar is ours now, so this is simply our own /book — which means it can
 * no longer be misconfigured to point at a calendar nobody reads, and there is
 * no env var left to forget when the booking type is renamed.
 */
const BOOKING_URL = `${COMPANY.url}/book`;

/**
 * Sent to the person who filled in either form, on the number they typed.
 *
 * ── Why it no longer says we will call to schedule ───────────────────────
 * It used to promise that "one of our AI solutions experts will contact you
 * shortly to schedule your consultation at a time convenient for you". That was
 * written when the form was the whole funnel. Both forms now hand straight over
 * to the calendar, so the sentence contradicts what the person is looking at —
 * and for anyone who has just picked a slot it reads as though the booking did
 * not register.
 *
 * ── Who this message is really for ───────────────────────────────────────
 * The one who filled in the form and then closed the tab without choosing a
 * time. They are the reason it carries the booking link: it is the only way they
 * can finish without waiting for someone to chase them. Whoever does book gets
 * this a moment before their confirmation, which is why it promises nothing the
 * confirmation will contradict.
 *
 * NB: WhatsApp bold is a *single* asterisk. Markdown's **double** asterisk is
 * not supported — it renders the extra asterisks literally — so the emphasis
 * below is deliberately single-starred.
 */
export function formatConfirmation(lead) {
  const lines = [
    `Hi ${lead.firstName},`,
    '',
    'Thank you for contacting *SIRAH DIGITAL*. We have received your enquiry.',
    '',
    'Your next step is to pick a time for your complimentary *45-minute AI Strategy Consultation*.',
  ];

  if (BOOKING_URL) {
    lines.push('', 'Choose a slot here:', BOOKING_URL);
  }

  lines.push(
    '',
    'If you have already chosen a time, you will receive a separate confirmation - nothing more to do.',
    '',
    'Reply to this message any time if you have questions or specific requirements.',
    '',
    '*Kind regards,*',
    '*Team SIRAH DIGITAL*',
  );

  return lines.join('\n');
}

// Human-readable lead summary for the team's WhatsApp.
export function formatLead(lead) {
  const lines = [
    '*New consultation request*',
    '',
    `*Name:* ${[lead.firstName, lead.lastName].filter(Boolean).join(' ')}`,
    `*Email:* ${lead.email}`,
  ];
  if (lead.phone) lines.push(`*Phone:* ${lead.phone}`);
  if (lead.company) lines.push(`*Company:* ${lead.company}`);
  // Above the free-text needs, not below it: this is the one line that says
  // which of us should pick the enquiry up.
  if (lead.interests?.length) lines.push(`*Interested in:* ${lead.interests.join(', ')}`);
  lines.push('', '*Needs:*', lead.message, '', `_via ${lead.source}_`);
  return lines.join('\n');
}
