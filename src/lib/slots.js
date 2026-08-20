// Reading availability and claiming a time, against the CMS.
//
// Server-only, and for the same reason lib/leads.js is: booking needs
// LEAD_INTAKE_SECRET, which is the entire authorisation for writing to the CMS.
// Importing this into a client component would ship that secret to the browser
// and hand the internet the ability to create calendar events on the founder's
// calendar.
//
// The CMS side is sirah-cms/src/endpoints/slots.ts —
//   GET  /api/public/slots   open times, no auth, nothing personal on it
//   POST /api/public/book    claims a slot, creates the event, writes the booking

const CMS_URL = (process.env.CMS_URL || '').replace(/\/$/, '');
const SECRET = process.env.LEAD_INTAKE_SECRET;

/** Can times be shown at all? Reading needs only a reachable CMS. */
export const slotsConfigured = Boolean(CMS_URL);

/** Can a booking actually be made? Writing needs the shared secret too. */
export const bookingConfigured = Boolean(CMS_URL && SECRET);

/**
 * The open times, soonest first.
 *
 * Returns [] rather than throwing on any failure. The booking page renders a
 * "call us instead" fallback when the list is empty, which is the right answer
 * for both "there is genuinely nothing free" and "the CMS is down" — the visitor
 * needs a way forward, not a distinction between two causes they cannot act on.
 * The cause is logged for us.
 */
export async function listOpenSlots({ days = 45 } = {}) {
  if (!slotsConfigured) return [];

  try {
    const res = await fetch(`${CMS_URL}/api/public/slots?days=${days}`, {
      // Availability changes the moment somebody books, so a cached response is
      // a response that offers a time which has already gone.
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('[slots] list failed', res.status);
      return [];
    }
    const body = await res.json();
    return Array.isArray(body.slots) ? body.slots : [];
  } catch (err) {
    console.error('[slots] list failed', err?.message);
    return [];
  }
}

/**
 * Claim a time.
 *
 * Unlike the read above, this reports failure honestly — the visitor is
 * mid-booking and an error they are not told about becomes a call they think
 * they have and nobody is coming to.
 *
 * `taken` is separated from the other failures because it is the one the page
 * can recover from by itself: refresh the list and let them pick again, rather
 * than sending them to email over a race they lost by two seconds.
 */
export async function claimSlot({ slotId, name, email, phone }) {
  if (!bookingConfigured) {
    return { ok: false, error: 'Booking is not configured.' };
  }

  try {
    const res = await fetch(`${CMS_URL}/api/public/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SECRET}`,
      },
      body: JSON.stringify({ slotId, name, email, phone }),
      // Creating a Google Calendar event is two network hops away, so this is
      // more generous than the lead store — but still bounded, because a hung
      // request holds the visitor on a spinner with no way out.
      signal: AbortSignal.timeout(20_000),
    });

    const body = await res.json().catch(() => ({}));

    if (res.status === 409) {
      return { ok: false, taken: true, error: body.message || 'That time has just been taken.' };
    }
    if (!res.ok) {
      console.error('[slots] book failed', res.status, body.message);
      return { ok: false, error: body.message || 'We could not confirm that time.' };
    }

    return { ok: true, bookingId: body.bookingId, startAt: body.startAt, timeZone: body.timeZone };
  } catch (err) {
    console.error('[slots] book failed', err?.message);
    return { ok: false, error: 'We could not reach the booking system just now.' };
  }
}
