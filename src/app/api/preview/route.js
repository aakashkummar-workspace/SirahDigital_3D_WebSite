import crypto from 'crypto';
import { redirect } from 'next/navigation';
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

/*
 * Draft preview.
 *
 * The admin's "Preview" button links here with a signed token. Once draft mode
 * is on, the data layer requests `?draft=true` from the CMS, so an editor sees
 * unpublished work rendered by the real site rather than imagined from a form.
 *
 * Draft mode sets a cookie, so anyone holding it can read unpublished content.
 * That is why the token is signed and time-boxed rather than being a static
 * `?preview=true` — the usual shortcut, and the usual way staging copy leaks.
 *
 * `path` is validated as a site-relative path. Without that check this is an
 * open redirect: `/api/preview?path=https://evil.example` would bounce a
 * visitor off-site carrying the site's own domain in the referrer.
 */

const MAX_AGE_MS = 10 * 60 * 1000;

const safeEqual = (a, b) => {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export async function GET(request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'Not configured.' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const timestamp = searchParams.get('ts');
  const path = searchParams.get('path') || '/';

  if (!token || !timestamp) {
    return NextResponse.json({ ok: false, error: 'Missing token.' }, { status: 401 });
  }

  const age = Date.now() - Number(timestamp);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) {
    return NextResponse.json({ ok: false, error: 'Preview link has expired.' }, { status: 401 });
  }

  // A leading '//' is protocol-relative and would leave the site, so a bare
  // startsWith('/') check is not enough on its own.
  if (!path.startsWith('/') || path.startsWith('//')) {
    return NextResponse.json({ ok: false, error: 'Invalid path.' }, { status: 400 });
  }

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${path}`).digest('hex');
  if (!safeEqual(token, expected)) {
    return NextResponse.json({ ok: false, error: 'Bad token.' }, { status: 401 });
  }

  (await draftMode()).enable();
  redirect(path);
}
