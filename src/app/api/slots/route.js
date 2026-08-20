import { NextResponse } from 'next/server';
import { listOpenSlots } from '@/lib/slots';

/**
 * GET /api/slots — the open times, for the booking page.
 *
 * ── Why the browser does not call the CMS directly ───────────────────────
 * It could: /api/public/slots on the CMS is unauthenticated and returns nothing
 * personal. Going through here anyway buys two things. The CMS origin stays
 * off the public network surface, so it needs no CORS entry for the site and
 * cannot be probed from a stranger's page. And the site keeps one place to
 * decide what a failure looks like — an empty list, never a broken fetch — which
 * is what SlotPicker is written against.
 *
 * ── Why it is re-fetched rather than rendered into the page ──────────────
 * A time that was free when the page was built may be gone by the time someone
 * finishes typing their number. The picker re-fetches after a failed claim, and
 * this is the route it re-fetches from.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const slots = await listOpenSlots();

  return NextResponse.json(
    { slots },
    {
      // Availability is stale the instant someone books. A CDN holding this for
      // even a minute would show times that are gone and turn every booking
      // into a race the visitor loses at the last step.
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
