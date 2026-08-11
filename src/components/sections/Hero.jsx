import React from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { ArrowRightIcon } from '@/components/ui/icons';
import { COMPANY } from '@/data/company';
// EXPERIMENTAL: Living Automation Core — safe to remove, see components/experiments/
import LivingAutomationCore from '@/components/experiments/LivingAutomationCore';

/**
 * The homepage hero.
 *
 * Two columns, but only one of them has anything in it. The right-hand column
 * is an empty spacer: the mark is the site's fixed particle canvas, which
 * offsets itself into the right half of the viewport while it is assembled
 * (see SirahCanvas). Giving it a real column here is what keeps the copy out
 * of its way — the spacer is load-bearing, not decoration.
 *
 * Below lg the mark cannot sit beside anything, so the spacer becomes vertical
 * instead and the canvas drops the mark into it. That is why the phone layout
 * reserves 32vh under the CTA and then appears to leave it empty.
 *
 * The copy column is capped at 520px and the paragraph at 420px. Both are
 * deliberately narrower than the grid: at these sizes the measure is what
 * makes the heading read as a display setting rather than a wall of text, and
 * the column's width is what decides where the heading wraps.
 *
 * The entrance is a single sequence — eyebrow, heading, paragraph, CTA — at
 * 700ms each on the brand ease-out, 120ms apart. Reveal fires on
 * IntersectionObserver, and the hero is above the fold, so in practice that is
 * "on load", once.
 *
 * NB: this used to run the heading through AnimatedHeading, which lifts it a
 * word at a time. Over five lines that ran past a second before the paragraph
 * could start. The heading now moves as one block, which is both what the
 * brief asked for and the quieter of the two.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center lg:min-h-[92vh]">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center px-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="max-w-[520px]">
          <Reveal duration={700} y={12}>
            <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.42em] text-white/40">
              {COMPANY.name}
            </span>
          </Reveal>

          {/* 32px under the eyebrow, 40px under the heading, 56px under the
              paragraph — the hero's whole rhythm is these three numbers. */}
          <Reveal delay={120} duration={700} y={24}>
            {/* text-pretty, not text-balance. The column's width is what
                decides the wrap and that is deliberate; all this does is stop
                the greedy fill from leaving "scale." alone on the last line.
                Browsers without it just wrap normally. */}
            <h1 className="mt-8 text-pretty text-[clamp(2.5rem,1.15rem+3.5vw,3.375rem)] font-bold leading-[0.98] tracking-[-0.03em] text-white">
              {COMPANY.tagline}
            </h1>
          </Reveal>

          <Reveal delay={240} duration={700} y={16}>
            <p className="mt-10 max-w-[420px] text-[1.0625rem] leading-[1.7] text-brand-muted/75">
              Empowering 10,000+ businesses through custom AI-powered solutions, bespoke software
              applications, and purpose-driven engineering.
            </p>
          </Reveal>

          <Reveal delay={360} duration={700} y={16}>
            <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-5">
              <Link
                href="/contact"
                className="hero-cta hero-cta--primary inline-flex min-h-[52px] items-center gap-2.5 rounded-full bg-white pl-7 pr-6 text-[0.9375rem] font-semibold text-space"
              >
                Start an automation audit
                <ArrowRightIcon className="hero-cta__arrow h-4 w-4" />
              </Link>

              <Link
                href="/work"
                className="hero-cta hero-cta--ghost inline-flex min-h-[52px] items-center gap-2 text-[0.9375rem] font-semibold text-white/55"
              >
                See our work
                <ArrowRightIcon className="hero-cta__arrow h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* The mark's room. A column beside the copy on a desktop, a band
            beneath it on a phone.

            EXPERIMENTAL: Living Automation Core
            Safe to remove without affecting the rest of the website — delete
            the <LivingAutomationCore /> line below and its import above, and
            this returns to the empty spacer it has always been. */}
        <div aria-hidden className="relative h-[32vh] lg:h-[min(34rem,60vh)]">
          <LivingAutomationCore />
        </div>
      </div>
    </section>
  );
}
