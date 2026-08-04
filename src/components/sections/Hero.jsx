import React from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import { COMPANY } from '@/data/company';

export default function Hero() {
  return (
    <section className="min-h-[calc(100vh-72px)] max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
      <div className="max-w-xl">
        <Reveal>
          <span className="inline-block text-xs uppercase tracking-[0.3em] font-semibold border px-3.5 py-1.5 rounded-full mb-6 text-slate-300 border-slate-700 bg-slate-800/40">
            Sirah Digital
          </span>
        </Reveal>
        <Reveal delay={90}>
          <AnimatedHeading
            as="h1"
            text={COMPANY.tagline}
            stagger={45}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white"
          />
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-6 text-lg md:text-xl leading-relaxed text-slate-300">
            Empowering 10,000+ businesses through custom AI-powered solutions, bespoke software
            applications, and purpose-driven engineering.
          </p>
        </Reveal>
        <Reveal delay={270}>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 rounded-full font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-all pointer-events-auto"
            >
              Start an automation audit
            </Link>
            <Link
              href="/work"
              className="px-6 py-3 rounded-full font-medium border transition-all pointer-events-auto border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-white"
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
