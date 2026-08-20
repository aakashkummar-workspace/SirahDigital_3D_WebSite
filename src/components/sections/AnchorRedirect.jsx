"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LEGACY_ANCHORS } from '@/data/nav';

/**
 * Rescues links to the old single-page site.
 *
 * A URL fragment is never sent to the server, so `sirahdigital.in/#offer`
 * arrives here as a plain request for `/` — next.config redirects cannot see
 * it and cannot rewrite it. The only place that hash is visible is the
 * browser, so the landing page forwards it on arrival.
 *
 * The root now 307s to /hub, and a browser carries the fragment across a
 * redirect whose target has none of its own — so `/#offer` becomes
 * `/hub#offer` and still lands here.
 *
 * Rendered by the landing page only; every other route was never reachable by
 * anchor. Uses replace() so the dead anchor URL does not sit in history.
 */
export default function AnchorRedirect() {
  const router = useRouter();

  useEffect(() => {
    const target = LEGACY_ANCHORS[window.location.hash];
    if (target && target !== '/hub') router.replace(target);
  }, [router]);

  return null;
}
