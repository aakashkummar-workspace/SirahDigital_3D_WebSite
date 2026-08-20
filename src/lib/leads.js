// Persisting a consultation enquiry into the CMS.
//
// Server-only: reads CMS_API_BASE and LEAD_INTAKE_SECRET, and must never be imported
// into a client component — the secret is the whole authorisation for writing to
// `leads`, and bundling it would hand the internet write access to the CRM.
//
// The CMS side is POST /api/lead-intake (sirah-cms/src/endpoints/index.ts),
// which exists because `leads.create` is `noone` and the two apps are separate
// processes, so there is no Local API to write through.

import crypto from 'crypto';

const CMS_API_BASE = (process.env.CMS_API_BASE || '').replace(/\/$/, '');
const SECRET = process.env.LEAD_INTAKE_SECRET;
const IP_SALT = process.env.IP_HASH_SALT;

/** Can an enquiry actually be stored? Both halves are required. */
export const leadStoreConfigured = Boolean(CMS_API_BASE && SECRET);

/**
 * Salted SHA-256 of the caller's IP, for abuse investigation only.
 *
 * Hashed here, in the site's own process, so the raw address never crosses the
 * wire to the CMS and cannot be recovered from its database.
 *
 * Without a salt this would be trivially reversible — the entire IPv4 space is
 * about four billion hashes, which is minutes of GPU time — so an unset
 * IP_HASH_SALT stores nothing rather than storing something that only looks
 * anonymous.
 */
export function hashIp(request) {
  if (!IP_SALT) return '';
  // Behind a proxy the socket address is the proxy's. x-forwarded-for is a
  // client-controlled header, so this is good enough to correlate abuse and
  // deliberately not treated as identification.
  const fwd = request.headers.get('x-forwarded-for') || '';
  const ip = fwd.split(',')[0].trim() || request.headers.get('x-real-ip') || '';
  if (!ip) return '';
  return crypto.createHash('sha256').update(`${IP_SALT}:${ip}`).digest('hex');
}

/**
 * Write the lead. Throws on any failure so the caller decides what a failure
 * costs the visitor — this module does not get to swallow a lost enquiry.
 */
export async function storeLead(lead) {
  if (!leadStoreConfigured) throw new Error('Lead store is not configured.');

  const res = await fetch(`${CMS_API_BASE}/lead-intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SECRET}`,
    },
    body: JSON.stringify(lead),
    // A slow or sleeping CMS must not hold the visitor's request open.
    signal: AbortSignal.timeout(10_000),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`lead-intake ${res.status}: ${raw.slice(0, 200)}`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
}
