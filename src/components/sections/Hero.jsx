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
          <span className="inline-block text-xs uppercase tracking-[0.3em] font-semibold text-cyan-400 mb-4">
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
          <div className="mt-10 flex flex-wrap items-center gap-8">
            <Link
              href="/contact"
              className="text-base font-semibold text-white hover:text-cyan-400 transition-colors pointer-events-auto flex items-center gap-1.5"
            >
              Start an automation audit →
            </Link>
            <Link
              href="/work"
              className="text-base font-semibold text-slate-400 hover:text-white transition-colors pointer-events-auto flex items-center gap-1.5"
            >
              See our work →
            </Link>
          </div>
        </Reveal>
      </div>
      <div aria-hidden className="hidden lg:block" />
    </section>
  );
}
