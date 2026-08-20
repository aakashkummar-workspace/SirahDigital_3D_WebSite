"use client";
import React, { useEffect, useRef } from 'react';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import useInView from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { METHODOLOGY } from '@/data/services';

/*
 * SECTION 1 — Our Methodology
 *
 * The three milestones as a journey along one glowing line rather than three
 * cards. Desktop runs it horizontally; mobile is a genuine vertical timeline,
 * not the same layout squeezed.
 *
 * Scroll progress is written to a CSS custom property rather than React
 * state, so the line fills at frame rate without re-rendering the section.
 */

// One accent across all three milestones. The colours here cycled by index
// and never encoded anything, so three of them was noise rather than meaning.
const ACCENTS = [
  { dot: '#22D3EE', name: 'cyan' },
  { dot: '#22D3EE', name: 'cyan' },
  { dot: '#22D3EE', name: 'cyan' },
];

function Milestone({ item, index, reduced }) {
  const [ref, inView] = useInView({ threshold: 0.5, rootMargin: '0px 0px -15% 0px' });
  const accent = ACCENTS[index] || ACCENTS[0];
  const active = inView || reduced;

  return (
    <li
      ref={ref}
      className="relative flex md:flex-col items-start md:items-center gap-6 md:gap-0 md:flex-1 md:text-center"
    >
      {/* Node ------------------------------------------------------------ */}
      <span className="relative shrink-0 grid place-items-center w-16 h-16 md:w-20 md:h-20" aria-hidden="true">

        {/* core */}
        <span
          className="relative rounded-full transition-all duration-700 ease-brand"
          style={{
            width: active ? 22 : 12,
            height: active ? 22 : 12,
            background: accent.dot,
          }}
        />
      </span>

      {/* Copy ------------------------------------------------------------ */}
      <div
        className="md:mt-10 md:px-4 md:max-w-xs transition-all duration-700 ease-brand"
        style={{
          opacity: active ? 1 : 0,
          transform: active ? 'none' : 'translateY(18px)',
          transitionDelay: reduced ? '0ms' : '180ms',
        }}
      >
        <p className="text-fluid-xs font-mono tracking-[0.3em] uppercase" style={{ color: accent.dot }}>
          {String(index + 1).padStart(2, '0')}
        </p>
        <h3 className="mt-3 text-fluid-xl font-bold tracking-tight" style={{ color: accent.dot }}>
          {item.title}
        </h3>
        <p className="mt-4 text-fluid-sm leading-relaxed text-brand-muted">{item.desc}</p>
      </div>
    </li>
  );
}

export default function MethodologyJourney() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const reduced = useReducedMotion();

  // Fill the connecting line as the section travels through the viewport.
  useEffect(() => {
    if (reduced) {
      trackRef.current?.style.setProperty('--progress', '1');
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      const track = trackRef.current;
      if (!el || !track) return;
      const r = el.getBoundingClientRect();
      // 0 as the section enters, 1 once it is most of the way through.
      const raw = (window.innerHeight * 0.85 - r.top) / (r.height * 0.72);
      track.style.setProperty('--progress', String(Math.min(1, Math.max(0, raw))));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="methodology-title"
      className="relative max-w-6xl mx-auto px-6 py-28 md:py-36"
    >
      <div className="text-center max-w-2xl mx-auto mb-20 md:mb-28">
        <p className="text-fluid-xs uppercase tracking-[0.35em] font-semibold text-brand-cyan">How we work</p>
        <AnimatedHeading
          id="methodology-title"
          text="Our Methodology"
          className="mt-5 text-fluid-2xl font-bold tracking-tight"
        />
      </div>

      <div ref={trackRef} className="relative" style={{ '--progress': 0 }}>
        {/* Connecting line ------------------------------------------------
            Vertical down the left on mobile, horizontal across on desktop.
            Both are a dim rail with a bright fill scaled by --progress. */}
        <div aria-hidden="true" className="absolute left-8 top-0 bottom-0 w-px md:hidden">
          <div className="absolute inset-0 bg-white/10" />
          <div
            className="absolute inset-x-0 top-0 origin-top"
            style={{
              height: '100%',
              transform: 'scaleY(var(--progress))',
              background: '#22D3EE',
            }}
          />
        </div>

        <div aria-hidden="true" className="hidden md:block absolute left-0 right-0 top-10 h-px">
          <div className="absolute inset-0 bg-white/10" />
          <div
            className="absolute inset-y-0 left-0 w-full origin-left"
            style={{
              transform: 'scaleX(var(--progress))',
              background: '#22D3EE',
            }}
          />
        </div>

        <ol className="relative flex flex-col md:flex-row gap-16 md:gap-8">
          {METHODOLOGY.map((item, i) => (
            <Milestone key={item.title} item={item} index={i} reduced={reduced} />
          ))}
        </ol>
      </div>
    </section>
  );
}
