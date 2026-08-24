import { NextResponse } from 'next/server';
import { rescheduleBooking, bookingConfigured } from '@/lib/slots';

/**
 * POST /api/reschedule — move an existing booking to a different time.
 *
 * ── Why this exists rather than the page calling the CMS directly ────────
 * The same reason /api/book does: LEAD_INTAKE_SECRET is the entire
 * authorisation for writing to the CMS, so it has to stay on this side. The
 * browser sends a reschedule token, which authorises exactly one booking; this
 * route is what turns that into a call the CMS will accept.
 *
 * ── What it deliberately does not validate ───────────────────────────────
 * Nothing about whether the move is allowed. The 24-hour cutoff and the
 * two-move cap live in the CMS endpoint, because a link sits in a WhatsApp chat
 * for hours and the only check worth having is the one made at the moment of
 * the write. Duplicating the rules here would mean two places to change and one
 * of them going stale.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const token = String(body?.token || '').trim();
  const slotId = Number(body?.slotId);

  if (!token) {
    return NextResponse.json({ ok: false, error: 'That reschedule link is not valid.' }, { status: 400 });
  }
  if (!Number.isInteger(slotId) || slotId <= 0) {
    return NextResponse.json({ ok: false, error: 'Please choose a time.' }, { status: 422 });
  }

  if (!bookingConfigured) {
    console.error('[reschedule] booking is not configured — CMS_API_BASE / LEAD_INTAKE_SECRET missing');
    return NextResponse.json(
      { ok: false, error: 'We could not reach the booking system. Please email support@sirahdigital.in.' },
      { status: 503 },
    );
  }

  const result = await rescheduleBooking({ token, slotId });

  if (!result.ok) {
    /*
     * 409 for a lost race, so the page can re-fetch the list and let them pick
     * again — the same recovery BookingIntake already has for a first booking.
     * Everything else is a plain refusal with the CMS's own wording, which is
     * written for the visitor rather than for a log.
     */
    return NextResponse.json(
      { ok: false, taken: Boolean(result.taken), error: result.error },
      { status: result.taken ? 409 : 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    startAt: result.startAt,
    timeZone: result.timeZone,
    movesUsed: result.movesUsed,
  });
}
