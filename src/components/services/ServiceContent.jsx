"use client";
import React from 'react';
import Link from 'next/link';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { ArrowRightIcon } from '@/components/ui/icons';

export default function ServiceContent({ service, active, registerRef }) {
  const reduced = useReducedMotion();
  const shown = active || reduced;

  const rise = (delay) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translate3d(0, 16px, 0)',
    transition: reduced
      ? 'none'
      : `opacity 600ms cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 600ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
  });

  return (
    <section
      ref={registerRef}
      id={`service-${service.slug}`}
      data-index={service.index}
      aria-labelledby={`service-title-${service.slug}`}
      className="scroll-mt-28 py-10 md:py-14 border-b border-white/10 last:border-b-0"
    >
      <div className="w-full">
        {/* Step Badge & System Label */}
        <div className="flex items-center gap-3" style={rise(0)}>
          <span className="font-mono text-sm font-bold text-cyan-400">
            {service.number}
          </span>
          <span className="text-white/30 font-mono text-xs">/</span>
          <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-semibold">{service.system}</span>
        </div>

        {/* Heading */}
        <div className="relative mt-4" style={rise(60)}>
          <AnimatedHeading
            as="h2"
            id={`service-title-${service.slug}`}
            text={service.title}
            className="text-2xl md:text-4xl font-bold tracking-tight text-white max-w-3xl leading-tight"
          />
        </div>

        {/* Problem Statement */}
        <p className="mt-5 text-sm md:text-base leading-relaxed text-slate-400 max-w-3xl" style={rise(120)}>
          <strong className="text-slate-200 font-semibold mr-1.5">Current Challenge:</strong>
          {service.problem}
        </p>

        {/* Solution Description */}
        <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-300 max-w-3xl" style={rise(180)}>
          {service.desc}
        </p>

        {/* Outcome / Payoff */}
        <p className="mt-5 text-base md:text-lg font-medium text-cyan-400/90 max-w-3xl" style={rise(240)}>
          ✦ {service.outcome}
        </p>

        {/* CTA Button — Text link only with arrow */}
        <div style={rise(300)}>
          <Link
            href="/contact"
            data-cursor="cta"
            className="group mt-6 inline-flex items-center gap-2 text-base font-semibold text-white hover:text-cyan-400 transition-colors duration-300"
          >
            <span>{service.cta}</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
