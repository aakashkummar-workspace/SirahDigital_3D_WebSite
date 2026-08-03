import React from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import { COMPANY } from '@/data/company';

// Homepage hero. The right column stays empty on purpose — the WebGL mark
// mounted by the site layout settles into it.
//
// min-h is measured against the viewport minus the 72px fixed navbar, which
// the layout now pads for.
export default function Hero() {
  return (
    <section className="min-h-[calc(100vh-72px)] max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
      <div className="max-w-xl">
        <Reveal>
          <span className="inline-block text-xs uppercase tracking-[0.3em] font-semibold border px-3 py-1 rounded-full mb-6 text-blue-400 border-blue-500/20 bg-blue-500/5">
            Sirah Digital
          </span>
        </Reveal>
        <Reveal delay={90}>
          <AnimatedHeading
            as="h1"
            text={COMPANY.tagline}
            stagger={45}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          />
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-brand-muted">
            Empowering 10,000+ businesses through custom AI-powered solutions, bespoke software
            applications, and purpose-driven engineering.
          </p>
        </Reveal>
        <Reveal delay={270}>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full font-medium text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:opacity-90 shadow-lg shadow-indigo-500/20 transition-all pointer-events-auto"
            >
              Start an automation audit
            </Link>
            <Link
              href="/work"
              className="px-6 py-3 rounded-full font-medium border transition-all pointer-events-auto border-white/10 bg-white/5 hover:bg-white/10"
            >
              See our work
            </Link>
          </div>
        </Reveal>
      </div>
      <div aria-hidden className="hidden lg:block" />
    </section>
  );
}
