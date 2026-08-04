"use client";
import React from 'react';
import Link from 'next/link';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { ArrowRightIcon } from '@/components/ui/icons';
import { STATE_ACCENT } from './VisualizationStates';
import ServicePanel from './ServicePanel';

export default function ServiceContent({ service, active, registerRef }) {
  const reduced = useReducedMotion();
  const shown = active || reduced;
  const accent = STATE_ACCENT[service.visual] || '#22D3EE';

  const rise = (delay) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translate3d(0, 22px, 0)',
    transition: reduced
      ? 'none'
      : `opacity 800ms cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 800ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
  });

  return (
    <section
      ref={registerRef}
      id={`service-${service.slug}`}
      data-index={service.index}
      aria-labelledby={`service-title-${service.slug}`}
      className="min-h-[75vh] md:min-h-screen flex flex-col justify-center py-16 md:py-24 scroll-mt-32"
    >
      <div className="w-full">
        {/* number, rule, and the system this capability runs on */}
        <div className="flex items-center gap-4" style={rise(0)}>
          <span className="font-mono text-fluid-sm font-bold" style={{ color: accent }}>{service.number}</span>
          <span
            aria-hidden="true"
            className="h-px w-16 origin-left transition-transform duration-700 ease-brand"
            style={{
              background: accent,
              transform: shown ? 'scaleX(1)' : 'scaleX(0)',
            }}
          />
          <span className="text-fluid-xs uppercase tracking-[0.28em] text-white/50 font-semibold">{service.system}</span>
        </div>

        {/* Heading */}
        <div className="relative mt-6" style={rise(80)}>
          <AnimatedHeading
            as="h2"
            id={`service-title-${service.slug}`}
            text={service.title}
            className="text-fluid-3xl font-bold tracking-tight leading-[1.1] text-white max-w-3xl"
          />
        </div>

        {/* Problem — what this costs today */}
        <p
          className="mt-8 flex items-start gap-4 text-fluid-base leading-relaxed text-slate-300 max-w-3xl"
          style={rise(160)}
        >
          <span aria-hidden="true" className="mt-[0.6em] h-px w-6 shrink-0 bg-slate-500" />
          {service.problem}
        </p>

        {/* Solution — the service description */}
        <p className="mt-6 text-fluid-lg leading-relaxed text-white/80 max-w-3xl" style={rise(220)}>
          {service.desc}
        </p>

        {/* Outcome — the payoff */}
        <p
          className="mt-8 text-fluid-xl font-semibold leading-snug max-w-3xl text-cyan-300"
          style={rise(300)}
        >
          {service.outcome}
        </p>

        {/* Inline CTA */}
        <div style={rise(380)}>
          <Link
            href="/contact"
            data-cursor="cta"
            className="interactive-hover group relative mt-10 inline-flex items-center gap-3 min-h-[44px] text-fluid-base font-bold text-white transition-transform duration-300 hover:translate-x-2"
          >
            <span className="relative">{service.cta}</span>
            <span className="relative flex items-center" style={{ color: accent }}>
              <span className="transition-transform duration-400 ease-brand group-hover:translate-x-1">
                <ArrowRightIcon />
              </span>
            </span>
          </Link>
        </div>

        {/* The capability's own panel. Each one owns a fixed diagram and
            scrolls past the pinned rail, rather than a single shared object
            morphing in place. `run` is the active flag, so only the
            capability being read is ever animating. */}
        <div className="mt-12 md:mt-14 max-w-3xl" style={rise(460)}>
          <ServicePanel state={service.visual} label={service.system} run={active} />
        </div>
      </div>
    </section>
  );
}
