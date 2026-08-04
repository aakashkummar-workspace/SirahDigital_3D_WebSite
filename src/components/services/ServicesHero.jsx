"use client";
import React from 'react';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import useInView from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/**
 * Page opening: large type, a small supporting paragraph, and deliberately no
 * buttons — the design wants the hero to hand straight over to the experience
 * rather than offer an exit.
 *
 * The heading is set as four stacked lines so it reads as a statement rather
 * than a sentence, and each line rises on its own beat.
 */
const LINES = ['SYSTEMS', 'THAT THINK,', 'AUTOMATE', 'AND SCALE'];

export default function ServicesHero() {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const reduced = useReducedMotion();
  const shown = inView || reduced;

  return (
    <section
      ref={ref}
      aria-labelledby="services-hero-title"
      className="relative min-h-[60vh] flex flex-col justify-center max-w-6xl mx-auto px-6 pt-12 pb-12"
    >
      <p
        className="text-fluid-xs uppercase tracking-[0.35em] font-semibold text-brand-cyan"
        style={{
          opacity: shown ? 1 : 0,
          transition: reduced ? 'none' : 'opacity 700ms ease',
        }}
      >
        Capabilities
      </p>

      <h1 id="services-hero-title" className="mt-8 font-bold tracking-tight leading-[0.94]">
        {LINES.map((line, i) => (
          <span key={line} className="block overflow-hidden">
            <span
              className="block"
              style={{
                fontSize: 'clamp(2.5rem, 1.1rem + 6.6vw, 7rem)',
                color: '#FFFFFF',
                opacity: shown ? 1 : 0,
                transform: shown ? 'none' : 'translateY(0.5em)',
                transition: reduced
                  ? 'none'
                  : `opacity 900ms cubic-bezier(.22,.61,.36,1) ${140 + i * 110}ms, transform 900ms cubic-bezier(.22,.61,.36,1) ${140 + i * 110}ms`,
              }}
            >
              {line}
            </span>
          </span>
        ))}
      </h1>

      <p
        className="mt-12 text-fluid-base leading-relaxed text-brand-muted max-w-md"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'none' : 'translateY(18px)',
          transition: reduced
            ? 'none'
            : 'opacity 900ms cubic-bezier(.22,.61,.36,1) 620ms, transform 900ms cubic-bezier(.22,.61,.36,1) 620ms',
        }}
      >
        Ten core capabilities, delivered end to end — scoped, built, deployed and handed over running.
        Scroll to explore the ecosystem.
      </p>

      {/* Scroll affordance — the hero's only outbound signal, and it points
          down into the experience rather than away from the page. */}
      <div
        aria-hidden="true"
        className="mt-16 flex items-center gap-3"
        style={{ opacity: shown ? 1 : 0, transition: reduced ? 'none' : 'opacity 900ms ease 900ms' }}
      >
        <span className="relative block w-px h-16 overflow-hidden bg-white/10">
          <span
            className="absolute inset-x-0 h-6 bg-gradient-to-b from-transparent via-brand-cyan to-transparent"
            style={{ animation: reduced ? undefined : 'scroll-hint 2.4s ease-in-out infinite' }}
          />
        </span>
      </div>
    </section>
  );
}
