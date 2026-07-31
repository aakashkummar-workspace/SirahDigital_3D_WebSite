// WhatsApp notifications via the Sirah Messenger gateway (chat.sirahagents.com).
//
// Contract, taken from the manager UI's own client:
//   POST {BASE}/send/text
//   headers: { apikey: <instance token> }
//   body:    { number: "<msisdn>", text: "<message>" }
//
// The instance is identified by the token, not by a path segment, so
// WHATSAPP_INSTANCE is kept only for logging and error messages.

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

// Sent to the person who filled in the form, on the number they typed.
//
// NB: WhatsApp bold is a *single* asterisk. Markdown's **double** asterisk is
// not supported — it renders the extra asterisks literally — so the emphasis
// below is deliberately single-starred.
export function formatConfirmation(lead) {
  return [
    `Hi ${lead.firstName},`,
    '',
    'Thank you for contacting *SIRAH DIGITAL*.',
    '',
    'We have successfully received your inquiry. One of our AI solutions experts will contact you shortly to schedule your complimentary *45-minute AI Strategy Consultation* at a time convenient for you.',
    '',
    'If you have any additional information or specific requirements, please feel free to reply to this message. We will be happy to assist you.',
    '',
    'We look forward to speaking with you.',
    '',
    '*Kind regards,*',
    '*Team SIRAH DIGITAL*',
  ].join('\n');
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
  lines.push('', '*Needs:*', lead.message, '', `_via ${lead.source}_`);
  return lines.join('\n');
}
