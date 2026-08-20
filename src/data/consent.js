/**
 * The consent notice shown on the consultation form.
 *
 * DPDP Act 2023 requires an explicit, unticked opt-in and — per §13.4 of the
 * CMS architecture — that the *exact wording displayed* is stored with the
 * submission, so that a copy change next year cannot rewrite what someone
 * actually agreed to.
 *
 * ── Why this is a module constant and not a form field ───────────────────
 * The obvious shortcut is to render the notice, then submit its text along with
 * the form. That makes the record worthless as evidence: anyone can POST a
 * consent notice that was never on screen, and the row would look identical to
 * a real one. Instead the text lives here, the form renders it, and the API
 * route stores this same constant — the browser only ever sends the boolean.
 * Client and server read one string from one place, so they cannot disagree.
 *
 * ── Changing this text ───────────────────────────────────────────────────
 * Edit freely. Rows already written keep the wording they were shown, which is
 * the entire point. Bump CONSENT_VERSION at the same time so the two can be
 * told apart at a glance in the admin without diffing prose.
 */

export const CONSENT_VERSION = '2026-08-1';

export const CONSENT_TEXT =
  'I agree that SIRAH DIGITAL may contact me by email, phone or WhatsApp about ' +
  'this enquiry, and may store the details I have submitted for that purpose. ' +
  'I understand my details are kept for 24 months, are never sold or shared for ' +
  'anyone else’s marketing, and that I can ask for them to be deleted at any ' +
  'time by emailing support@sirahdigital.in.';

/*
 * What is written to leads.consentText. The version travels with the prose
 * because the prose alone does not tell you which revision it is, and the
 * column is the only record that survives a redeploy.
 */
export const consentRecord = () => `[${CONSENT_VERSION}] ${CONSENT_TEXT}`;
