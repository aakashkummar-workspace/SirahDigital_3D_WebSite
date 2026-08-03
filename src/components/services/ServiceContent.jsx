"use client";
import React from 'react';
import Link from 'next/link';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import VisualizationContainer from './VisualizationContainer';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { ArrowRightIcon } from '@/components/ui/icons';
import { STATE_ACCENT } from './VisualizationStates';

/**
 * One capability, occupying one viewport.
 *
 * The copy now reads as a three-beat argument rather than a description:
 *
 *   Problem   — what it costs you today, in muted text
 *   Solution  — what we build, the existing service description
 *   Outcome   — the business result, in the brand gradient
 *
 * and closes on an inline CTA written in that capability's own voice.
 *
 * On mobile the visualization sits between the heading and the description,
 * which is the reading order the design specifies. On tablet and desktop the
 * persistent visualization is mounted once by PinnedExperience instead, so the
 * inline copy here is hidden above `md`.
 *
 * Layout alternates a little between services to create rhythm without ever
 * becoming a repeated pattern.
 */
export default function ServiceContent({ service, active, registerRef }) {
  const reduced = useReducedMotion();
  const shown = active || reduced;
  const offset = service.index % 2 === 1;
  const accent = STATE_ACCENT[service.visual] || '#22D3EE';

  // `filter: none` rather than `blur(0)` once revealed: a zero blur still
  // promotes every one of these to its own compositing layer, and there are
  // thirty of them on this page.
  const rise = (delay) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translate3d(0, 22px, 0)',
    transition: reduced
      ? 'none'
      : `opacity 800ms cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 800ms cubic-bezier(.22,.61,.36,1) ${delay}ms, filter 800ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
    filter: shown ? 'none' : 'blur(4px)',
  });

  return (
    <section
      ref={registerRef}
      id={`service-${service.slug}`}
      data-index={service.index}
      aria-labelledby={`service-title-${service.slug}`}
      className="min-h-[88vh] md:min-h-screen flex flex-col justify-center py-20 md:py-24 scroll-mt-32"
    >
      <div className={offset ? 'lg:pl-10' : ''}>
        {/* number, rule, and the system this capability runs on */}
        <div className="flex items-center gap-4" style={rise(0)}>
          <span className="font-mono text-fluid-xs" style={{ color: accent }}>{service.number}</span>
          <span
            aria-hidden="true"
            className="h-px w-12 origin-left transition-transform duration-700 ease-brand"
            style={{
              background: `linear-gradient(90deg, ${accent}, transparent)`,
              transform: shown ? 'scaleX(1)' : 'scaleX(0)',
            }}
          />
          <span className="text-fluid-xs uppercase tracking-[0.28em] text-white/40">{service.system}</span>
        </div>

        {/* Heading. A gradient sweep runs across it once it lands — the words
            still stagger in from AnimatedHeading underneath. */}
        <div className="relative mt-7" style={rise(80)}>
          <AnimatedHeading
            as="h2"
            id={`service-title-${service.slug}`}
            text={service.title}
            className="text-fluid-2xl font-bold tracking-tight leading-[1.08] max-w-2xl"
          />
          {shown && !reduced && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(100deg, transparent 35%, ${accent}2e 50%, transparent 65%)`,
                backgroundSize: '260% 100%',
                animation: 'text-sweep 2600ms cubic-bezier(.22,.61,.36,1) 500ms 1 both',
                mixBlendMode: 'screen',
              }}
            />
          )}
        </div>

        {/* Mobile only: the visualization sits between heading and description */}
        <div className="md:hidden mt-10" style={rise(140)}>
          <VisualizationContainer state={service.visual} variant="inline" run={active} />
        </div>

        {/* Problem — what this costs today */}
        <p
          className="mt-8 flex items-start gap-3 text-fluid-sm leading-relaxed text-white/45 max-w-lg"
          style={rise(160)}
        >
          <span aria-hidden="true" className="mt-[0.55em] h-px w-5 shrink-0 bg-white/25" />
          {service.problem}
        </p>

        {/* Solution — the existing service description, untouched */}
        <p className="mt-5 text-fluid-base leading-relaxed text-brand-muted max-w-lg" style={rise(220)}>
          {service.desc}
        </p>

        {/* Outcome — the payoff, in the brand gradient */}
        <p
          className="mt-7 text-fluid-lg font-semibold leading-snug max-w-xl bg-gradient-to-r from-brand-cyan via-brand-indigo to-brand-purple bg-clip-text text-transparent"
          style={rise(300)}
        >
          {service.outcome}
        </p>

        {/* Inline CTA in this capability's own voice. Glows, stretches its
            arrow, and draws an underline on hover. */}
        <div style={rise(380)}>
          <Link
            href="/contact"
            data-cursor="cta"
            className="interactive-hover group relative mt-10 inline-flex items-center gap-3 min-h-[44px] pr-1 text-fluid-sm font-bold text-white transition-transform duration-300 hover:translate-x-1"
            style={{ '--charge': `${accent}44` }}
          >
            <span
              aria-hidden="true"
              className="absolute -inset-x-3 -inset-y-2 rounded-full opacity-0 transition-opacity duration-400 group-hover:opacity-100"
              style={{ background: `${accent}14`, animation: 'cta-charge 2.2s ease-in-out infinite' }}
            />
            <span className="relative">{service.cta}</span>
            {/* arrow that stretches its tail on hover */}
            <span className="relative flex items-center" style={{ color: accent }}>
              <span
                aria-hidden="true"
                className="block h-px w-0 origin-left transition-all duration-400 ease-brand group-hover:w-5"
                style={{ background: accent }}
              />
              <span className="transition-transform duration-400 ease-brand group-hover:translate-x-0.5">
                <ArrowRightIcon />
              </span>
            </span>
            <span
              aria-hidden="true"
              className="absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-brand group-hover:scale-x-100"
              style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
