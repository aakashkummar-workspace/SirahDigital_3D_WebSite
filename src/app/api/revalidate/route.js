import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

/*
 * Cache invalidation, called by the CMS when content changes.
 *
 * The site serves static ISR output. This endpoint is what turns an edit in
 * the admin into a live change within seconds, instead of waiting for the
 * next natural revalidation or a redeploy.
 *
 * ── Verification ─────────────────────────────────────────────────────────
 * The CMS signs an HMAC-SHA256 over `<timestamp>.<raw body>` using the shared
 * REVALIDATE_SECRET. Checking a signature over the body — rather than just
 * accepting a bearer token — also proves the body was not altered in transit,
 * and the timestamp bounds how long a captured request stays replayable.
 *
 * timingSafeEqual, not ===, because a plain string compare returns early on
 * the first differing byte and leaks the correct prefix over enough attempts.
 *
 * ── Setup ────────────────────────────────────────────────────────────────
 * REVALIDATE_SECRET must be byte-identical to the value in the CMS's .env.
 * A mismatch fails closed and silently: edits save fine in the admin and
 * simply never appear here. If content is not updating, check this first.
 */

const MAX_SKEW_MS = 5 * 60 * 1000;

const safeEqual = (a, b) => {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  // timingSafeEqual throws on a length mismatch, which would itself be a
  // timing signal. Compare lengths first and bail uniformly.
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    // Refuse rather than fall open. An unconfigured secret must never mean
    // "accept everything".
    return NextResponse.json({ ok: false, error: 'Not configured.' }, { status: 503 });
  }

  const timestamp = request.headers.get('x-sirah-timestamp');
  const signature = request.headers.get('x-sirah-signature');
  if (!timestamp || !signature) {
    return NextResponse.json({ ok: false, error: 'Unsigned request.' }, { status: 401 });
  }

  const age = Date.now() - Number(timestamp);
  if (!Number.isFinite(age) || Math.abs(age) > MAX_SKEW_MS) {
    return NextResponse.json({ ok: false, error: 'Stale request.' }, { status: 401 });
  }

  // The raw text, not a re-serialised object — re-serialising would reorder
  // keys and break the signature for no reason.
  const raw = await request.text();
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest('hex');

  if (!safeEqual(signature, expected)) {
    return NextResponse.json({ ok: false, error: 'Bad signature.' }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(raw || '{}');
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed body.' }, { status: 400 });
  }

  const tags = Array.isArray(body.tags) ? body.tags : [];
  const paths = Array.isArray(body.paths) ? body.paths : [];

  for (const tag of tags) revalidateTag(String(tag));
  for (const path of paths) revalidatePath(String(path));

  return NextResponse.json({ ok: true, revalidated: { tags, paths }, at: Date.now() });
}
