"use client";
import React, { useEffect, useId, useState } from 'react';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import useInView from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { SCENES } from '@/data/transformation';
import useSceneClock from './useSceneClock';
import SceneSwitcher from './SceneSwitcher';
import SceneStage from './SceneStage';
import SceneNarrative from './SceneNarrative';
import SceneProgress from './SceneProgress';
import SceneControls from './SceneControls';
import AnimatedStatus from './AnimatedStatus';

/*
 * The homepage centrepiece: a three-scene story that plays itself.
 *
 * Chaos → Sirah AI → Autopilot, advancing every three seconds and looping
 * forever. Clicking a tab jumps immediately and restarts the window without
 * stopping autoplay; the play/pause button is the only thing that stops it.
 *
 * Note on the container: this section is rendered inside a bordered card, a
 * deliberate deviation from the "no cards" rule the other homepage sections
 * follow. That was an explicit design decision to match the reference, not an
 * oversight — please don't "fix" it.
 */
export default function VisualTransformationStory() {
  // once:false gives a live signal that stops the clock and the SMIL when the
  // section scrolls away. `seen` latches separately so the entrance reveal
  // does not replay every time the visitor scrolls back past.
  const [ref, inView] = useInView({ threshold: 0.15, rootMargin: '0px 0px -10% 0px', once: false });
  const [seen, setSeen] = useState(false);
  useEffect(() => { if (inView) setSeen(true); }, [inView]);

  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');

  const { index, tick, playing, manual, onScreen, goTo, next, toggle } = useSceneClock({
    count: SCENES.length,
    inView,
    reduced,
  });

  const scene = SCENES[index];
  const run = onScreen && !reduced;
  const shown = seen || reduced;

  return (
    <section
      ref={ref}
      aria-labelledby="transformation-title"
      className="relative max-w-6xl mx-auto px-6 py-28 md:py-36"
    >
      <div
        className="relative overflow-hidden rounded-2xl lg:rounded-3xl border bg-space-raised/70 p-5 sm:p-8 lg:p-12 transition-[border-color,transform,opacity] duration-1000 ease-brand"
        style={{
          borderColor: `${scene.accent}2e`,
          opacity: shown ? 1 : 0,
          transform: shown ? 'none' : 'translateY(26px)',
        }}
      >
        {/* Countdown rail. key={tick} remounts it on exactly the signal that
            restarts the timer, so bar and clock cannot drift apart. */}
        <SceneProgress key={tick} accent={scene.accent} running={playing && onScreen && !reduced} />

        <div className="relative z-10">
          {/* ── header ────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="text-fluid-xs uppercase tracking-[0.35em] font-semibold text-brand-cyan">
                Visual transformation story
              </p>
              <AnimatedHeading
                id="transformation-title"
                text="The Journey From Chaos to AI Autopilot"
                className="mt-5 text-fluid-2xl font-bold tracking-tight max-w-xl"
              />
            </div>
            <div className="md:shrink-0">
              <SceneSwitcher active={index} onSelect={goTo} />
            </div>
          </div>

          {/* ── body ──────────────────────────────────────────────────── */}
          <div className="mt-10 lg:mt-14 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-8 lg:gap-14 items-center">

            {/* narrative — second on mobile so the artwork leads */}
            <div className="order-2 lg:order-1 min-w-0">
              {/* Announce only user-driven changes. A plain aria-live here
                  would speak over the visitor every three seconds, forever. */}
              <div aria-live={manual ? 'polite' : 'off'} aria-atomic="true">
                <SceneNarrative key={index} scene={scene} reduced={reduced} />
              </div>
              <SceneControls
                accent={scene.accent}
                playing={playing}
                onNext={next}
                onToggle={toggle}
              />
            </div>

            {/* artwork */}
            <div className="order-1 lg:order-2 min-w-0">
              <div
                className="relative rounded-xl lg:rounded-2xl border bg-space-deep/70 p-3 sm:p-5 overflow-hidden transition-[border-color] duration-1000 ease-brand"
                style={{ borderColor: `${scene.accent}24` }}
              >
                <SceneStage index={index} run={run} idBase={uid} />

                {/* desktop: banner sits over the artwork inside the panel */}
                <div className="hidden lg:block absolute inset-x-5 bottom-5">
                  <AnimatedStatus scene={scene} run={run} />
                </div>
              </div>

              {/* mobile and tablet: banner captions the panel from below */}
              <div className="lg:hidden mt-4">
                <AnimatedStatus scene={scene} run={run} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
