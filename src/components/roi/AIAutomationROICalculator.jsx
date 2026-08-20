"use client";
import React, { useMemo, useReducer } from 'react';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import ConfigPanel from './ConfigPanel';
import ResultPanel from './ResultPanel';
import CalculatorCTA from './CalculatorCTA';
import { ROI_DEFAULTS } from '@/data/roi';
import { calculateROI } from '@/lib/roi';
import s from './calculator.module.css';

/**
 * Interactive automation savings calculator.
 *
 * State is one reducer over the whole input set and the model is a pure
 * function memoised on it, so every control updates the whole read-out in the
 * same render and nothing recalculates unless an input actually changed.
 * `calculateROI` is untouched by this redesign — the change is visual and
 * structural only.
 *
 * ── Surface ──────────────────────────────────────────────────────────────
 * The previous version sat on one near-opaque #191634 card, because dense
 * figures are unreadable over the WebGL particle field behind this page. That
 * reasoning was correct and still is — removing the card outright made the
 * lower half of the read-out (coverage, productivity, the hours comparison,
 * the savings curve) genuinely hard to read against the particles.
 *
 * So the card is gone but the contrast is not: a heavily feathered radial
 * scrim sits behind the content and fades to nothing before any edge. It reads
 * as depth rather than as a panel — no border, no corner, no blur.
 *
 * The particle background itself is untouched: no component, config, opacity,
 * density, speed, colour or animation. The scrim is a content-layer element
 * drawn above the canvas, which is the layer this redesign owns.
 *
 * ── One accent ───────────────────────────────────────────────────────────
 * Brand cyan, and only brand cyan: slider fill, the meters, the curve, the
 * primary CTA. It used to rotate by industry index, which encoded nothing.
 */
const ACCENT = 'rgb(var(--c-cyan))';

function reducer(state, action) {
  if (state[action.key] === action.value) return state;   // no-op, no re-render
  return { ...state, [action.key]: action.value };
}

export default function AIAutomationROICalculator() {
  const [input, dispatch] = useReducer(reducer, ROI_DEFAULTS);
  const set = (key) => (value) => dispatch({ key, value });

  const result = useMemo(() => calculateROI(input), [input]);

  return (
    <section aria-labelledby="roi-title" className="relative mx-auto max-w-[1160px] px-6 py-24 md:py-32">
      <div className={s.scrim} aria-hidden="true" />

      <div className={s.content}>
      {/* ── hero ────────────────────────────────────────────────────────── */}
      <header className="max-w-[38ch]">
        <AnimatedHeading
          id="roi-title"
          text="See what automation could save."
          className="font-semibold leading-[1.05] tracking-tight text-ink"
          style={{ fontSize: 'clamp(2.25rem, 1.5rem + 3vw, 3.5rem)' }}
        />
        <p className="mt-6 max-w-[52ch] text-[16px] leading-relaxed text-ink/55">
          Adjust a few details about your business to estimate your potential automation impact.
        </p>
      </header>

      {/* ── inputs and results ──────────────────────────────────────────────
          Two columns of one calculator, not two panels. The gap does the
          separating; there is no divider and no container on either side.

          The configuration sticks on desktop so the numbers stay in view while
          a slider is being dragged — the whole point of the thing is watching
          the result move. */}
      <div className="mt-16 grid grid-cols-1 items-start gap-14 md:mt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        <div className="min-w-0 lg:sticky lg:top-28">
          <ConfigPanel
            input={input}
            set={set}
            accent={ACCENT}
            derived={result}
          />
        </div>

        {/* Not an aria-live region: inputs change faster than a screen reader
            can usefully follow, so the figures are readable on demand rather
            than announced on every slider step. */}
        <ResultPanel result={result} accent={ACCENT} />
      </div>

      {/* ── recommendations ─────────────────────────────────────────────────
          Inline text rather than a row of pills. The set changes with the
          industry, so it is keyed on the industry id and re-reads naturally. */}
      <div className="mt-20 border-t border-ink/[0.06] pt-8">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink/45">
          Recommended automations
        </h2>
        <p key={result.industry.id} className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-ink/70">
          {result.industry.recommendations.join(' · ')}
        </p>
      </div>

      {/* ── close ───────────────────────────────────────────────────────── */}
      <div className="mt-14">
        <CalculatorCTA result={result} input={input} />
      </div>
      </div>
    </section>
  );
}
