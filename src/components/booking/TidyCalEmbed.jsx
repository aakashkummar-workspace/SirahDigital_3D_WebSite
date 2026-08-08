"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

/**
 * TidyCal inline embed.
 *
 * Wraps TidyCal's official website embed — a marker div plus their embed.js,
 * which finds the div and injects the booking iframe. Nothing here talks to
 * TidyCal's API, polls anything, or stores a booking: TidyCal keeps its
 * existing pipeline (Google Calendar event, Google Meet link, confirmation
 * email) exactly as it works on the current live site.
 *
 * ── Why the script is injected per-mount ─────────────────────────────────
 * embed.js scans for `.tidycal-embed` once, when it loads. On a client-side
 * route change the script is already in the document, so it never re-scans and
 * the second visit to this page renders an empty div. Appending a fresh script
 * on mount and removing it on unmount forces the scan every time, which is why
 * this is not a plain next/script tag.
 *
 * ── data-path ────────────────────────────────────────────────────────────
 * "<username>/<booking-type-slug>", e.g. "sirahdigital/45-min-strategy-call".
 * Drop the slug to show every public booking type instead.
 *
 * Set NEXT_PUBLIC_TIDYCAL_PATH in .env.local. It is NEXT_PUBLIC_ because the
 * embed runs in the browser; it is a public booking URL, not a secret.
 */

const SCRIPT_SRC = 'https://tidycal.com/js/embed.js';

export default function TidyCalEmbed({
  path = process.env.NEXT_PUBLIC_TIDYCAL_PATH,
  className = '',
}) {
  const holder = useRef(null);
  // The iframe can take a moment on a cold load; without this the page shows
  // an unexplained empty box.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!path || !holder.current) return undefined;

    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);

    // TidyCal gives no ready callback, so watch the holder for the iframe it
    // injects rather than guessing with a timeout.
    const observer = new MutationObserver(() => {
      if (holder.current?.querySelector('iframe')) setReady(true);
    });
    observer.observe(holder.current, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      script.remove();
    };
  }, [path]);

  /*
   * No path configured.
   *
   * Renders a real route to the enquiry form rather than a broken embed or a
   * dead '#'. Someone who came here to book still gets somewhere useful, and
   * the reason is stated in dev so it is not a silent blank.
   */
  if (!path) {
    return (
      <div className={`rounded-xl border border-white/10 p-8 text-center ${className}`}>
        <p className="text-fluid-sm text-brand-muted">
          The booking calendar is not connected yet.
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-brand-cyan px-6 py-3 text-fluid-sm font-semibold text-[#04121a] transition-colors hover:bg-white"
        >
          Send us a message instead <span aria-hidden="true">→</span>
        </Link>
        {process.env.NODE_ENV !== 'production' && (
          <p className="mt-5 text-fluid-xs text-white/35">
            Set NEXT_PUBLIC_TIDYCAL_PATH in .env.local — e.g. sirahdigital/45-min-strategy-call
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* TidyCal's iframe carries its own light theme, so it sits on a plain
          light surface rather than being forced to match the dark page — a
          half-recoloured third-party widget looks broken, not branded. */}
      <div className="overflow-hidden rounded-xl bg-white">
        <div ref={holder} className="tidycal-embed min-h-[620px]" data-path={path} />
      </div>

      {!ready && (
        <p role="status" className="mt-4 text-center text-fluid-xs text-white/40">
          Loading available times…
        </p>
      )}

      <noscript>
        <p className="mt-4 text-center text-fluid-sm text-brand-muted">
          The booking calendar needs JavaScript.{' '}
          <Link href="/contact" className="text-brand-cyan underline">
            Send us a message instead
          </Link>
          .
        </p>
      </noscript>
    </div>
  );
}
