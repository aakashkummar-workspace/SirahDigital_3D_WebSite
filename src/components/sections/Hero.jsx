import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { ArrowRightIcon } from '@/components/ui/icons';
import { COMPANY } from '@/data/company';

import { PrimaryButton, GhostButton } from '@/components/ui/Button';
/**
 * The homepage hero.
 *
 * It used to be a pinned stage, and it is worth knowing what it was, because
 * most of what has been deleted here only made sense as part of it: a tall
 * track whose scroll advanced a timeline, a viewport-sized sticky child, a 3D
 * scene of product cards circling a robot, and a frame loop that faded a DOM
 * card in as its 3D counterpart finished flying to the centre of the screen.
 *
 * The scene went first, then the product run. With nothing left to drive there
 * is no track, no sticky child, no frame loop and no scroll timeline — the hero
 * is one screen of copy standing over the site layout's particle field. That is
 * also why this is no longer a client component: nothing here needs the browser.
 *
 * Two files are deliberately left in place rather than deleted, both now
 * unreferenced:
 *   heroStageTimeline.js  — the sequence as arithmetic, so it can come back
 *                           without being rewritten
 *   components/experiments/ — the robot scene
 *
 * HOME_PRODUCTS is no longer read here. The three products currently appear
 * nowhere on the homepage; the chat knowledge base is the only other consumer.
 */
export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      // Top-aligned on a phone, centred from lg — the copy takes most of a
      // small viewport, so centring it there only pushes it off the fold.
      // The 72px is the fixed navbar the site layout clears with padding.
      //
      // pt-12 on a phone, not pt-24: the layout already spends 72px clearing
      // the navbar, and another 96px on top of that pushed the second CTA
      // below the fold on a 667px screen. The generous spacing the brief asks
      // for is still there from sm up, where there is room for it.
      className="ambient-orbs relative flex min-h-[calc(100svh-72px)] items-start overflow-hidden pt-12 sm:pt-24 lg:items-center lg:pt-0"
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        {/* Capped well under the grid: at this measure the heading reads as a
            display setting rather than a wall of text, and this width is what
            decides where it wraps. Leaving the right-hand half clear is also
            what gives the particle mark somewhere to sit. */}
        <div className="max-w-[520px]">
          <Reveal duration={700} y={12}>
            <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.42em] text-ink/40">
              {COMPANY.name}
            </span>
          </Reveal>

          {/* 32px under the eyebrow, 40px under the heading, 56px under the
              paragraph — the hero's whole rhythm is these three numbers. */}
          <Reveal delay={120} duration={700} y={24}>
            {/* text-pretty, not text-balance. The column's width is what decides
                the wrap and that is deliberate; all this does is stop the greedy
                fill from leaving "scale." alone on the last line. */}
            <h1
              id="hero-title"
              className="mt-8 text-pretty text-[clamp(2.5rem,1.15rem+3.5vw,3.375rem)] font-bold leading-[0.98] tracking-[-0.03em] text-ink"
            >
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
              <PrimaryButton href="/contact">
                Start an automation audit
                <ArrowRightIcon className="btn-arrow h-4 w-4" />
              </PrimaryButton>

              <GhostButton href="/products#client-systems">
                See our work
                <ArrowRightIcon className="btn-arrow h-4 w-4" />
              </GhostButton>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
