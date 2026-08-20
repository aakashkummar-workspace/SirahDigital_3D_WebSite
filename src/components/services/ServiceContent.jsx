"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { ArrowRightIcon } from '@/components/ui/icons';

/**
 * One capability, as a block that scrolls past the pinned rail.
 *
 * ── Two states, not one ──────────────────────────────────────────────────
 * This used to key everything off `active`, which meant every block except
 * the current one sat at opacity 0. Blocks are shorter than the viewport, so
 * three of the four on screen at any moment were blank — the rail marker
 * moved while nothing visible explained why, which is exactly what made the
 * scroll effect hard to read.
 *
 * The two concerns are now separate:
 *
 *   seen    latched the first time the block scrolls into view, and drives
 *           the staggered lift-in. Latched so it never replays on the way
 *           back up.
 *   active  drives emphasis only — the wrapper dims to DIM when this is not
 *           the capability being read.
 *
 * Nested opacity multiplies, so those two rules cover all three states with
 * no extra branching: unseen is DIM x 0 = 0, seen-but-not-active is DIM x 1,
 * and active is 1 x 1.
 */

// Dim, not hidden — and the exact value is a contrast budget, not taste.
//
// Everything in a dimmed block is composited against the page's #16142C, so
// the dim eats contrast. The binding constraint is the smallest normal-weight
// text: the problem line at 18px (~13.5pt, under the 18pt large-text
// threshold) needs the full 4.5:1 of WCAG AA, not the 3:1 the 32px and 52px
// lines get. Measured in Chrome: slate-400 at 0.55 came out at 2.99:1 — a
// clear fail — which is why the problem line is now slate-300 and this sits
// at 0.60. That pairing measures ~5:1 while still reading as clearly
// secondary to the active block.
const DIM = 0.6;

export default function ServiceContent({ service, active, registerRef }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const [seen, setSeen] = useState(false);

  // Reduced motion gets everything immediately; there is no entrance to play.
  useEffect(() => {
    if (reduced) { setSeen(true); return undefined; }
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setSeen(true); return undefined; }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setSeen(true); io.disconnect(); }
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const rise = (delay) => ({
    opacity: seen ? 1 : 0,
    transform: seen ? 'none' : 'translate3d(0, 18px, 0)',
    transition: reduced
      ? 'none'
      : `opacity 700ms cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 700ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
  });

  return (
    <section
      ref={(el) => { sectionRef.current = el; registerRef(el); }}
      id={`service-${service.slug}`}
      data-index={service.index}
      aria-labelledby={`service-title-${service.slug}`}
      /* 72px navbar + ~56px sticky chip bar + breathing room on mobile; from
          md the chip bar is gone and only the navbar has to be cleared. */
      className="scroll-mt-[9.5rem] md:scroll-mt-28 py-14 md:py-20 border-b border-white/10 last:border-b-0"
      style={{
        opacity: active ? 1 : DIM,
        // The dim is contrast, not motion, so it still applies under
        // prefers-reduced-motion — it just arrives instantly.
        transition: reduced ? 'none' : 'opacity 500ms cubic-bezier(.22,.61,.36,1)',
      }}
    >
      <div className="w-full">
        {/* Step Badge & System Label */}
        <div className="flex items-center gap-3" style={rise(0)}>
          <span className="font-mono text-fluid-base font-bold text-cyan-400">
            {service.number}
          </span>
          <span className="text-white/30 font-mono text-fluid-xs">/</span>
          <span className="text-fluid-xs uppercase tracking-[0.25em] text-white/40 font-semibold">{service.system}</span>
        </div>

        {/* Heading — the tight leading is what makes 52px read as editorial
            rather than merely big. text-4xl used to ship its own line-height,
            which is why the old `leading-tight` never took effect. */}
        <div className="relative mt-6" style={rise(60)}>
          <AnimatedHeading
            as="h2"
            id={`service-title-${service.slug}`}
            text={service.title}
            className="text-fluid-2xl font-bold tracking-tight leading-[1.06] text-white max-w-3xl"
          />
        </div>

        {/* Problem Statement — slate-300 rather than slate-400: this is the
            smallest normal-weight text in the block, so it sets the contrast
            floor once the block is dimmed. See DIM. */}
        <p className="mt-7 text-fluid-base leading-relaxed text-slate-300 max-w-3xl" style={rise(120)}>
          <strong className="text-white font-semibold mr-1.5">Current Challenge:</strong>
          {service.problem}
        </p>

        {/* Solution Description — the lead line, the largest body text here.
            Brightest of the three so hierarchy reads by weight of colour as
            well as size, now that the problem line has been lifted. */}
        <p className="mt-6 text-fluid-lg leading-[1.4] text-white/90 max-w-3xl" style={rise(180)}>
          {service.desc}
        </p>

        {/* Outcome / Payoff — no glyph. This line used to open with a
            four-pointed sparkle, which at this size and in this colour read
            as a Gemini badge stamped on every one of the ten capabilities.
            The cyan is enough on its own to mark the line as the payoff. */}
        <p className="mt-7 text-fluid-lg leading-[1.4] font-medium text-cyan-400/90 max-w-3xl" style={rise(240)}>
          {service.outcome}
        </p>

        {/* CTA Button — Text link only with arrow */}
        <div style={rise(300)}>
          <Link
            href="/contact"
            data-cursor="cta"
            className="group mt-10 inline-flex items-center gap-2.5 min-h-[44px] text-fluid-base font-semibold text-white hover:text-brand-blue transition-colors duration-300"
          >
            <span>{service.cta}</span>
            <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
