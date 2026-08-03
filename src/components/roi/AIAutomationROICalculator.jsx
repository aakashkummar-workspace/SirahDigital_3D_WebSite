"use client";
import React, { useMemo, useReducer } from 'react';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import ROISlider, { SelectField } from './ROISlider';
import ImpactDashboard from './ImpactDashboard';
import RecommendationEngine from './RecommendationEngine';
import CalculatorCTA from './CalculatorCTA';
import { ROI_INPUTS, ROI_DEFAULTS, ROI_INDUSTRIES, BUSINESS_SIZES } from '@/data/roi';
import { calculateROI } from '@/lib/roi';

/**
 * Interactive business-value simulator.
 *
 * State is one reducer over the whole input set, and the model is a pure
 * function memoised on it — so every control updates the entire dashboard in
 * the same render, and nothing recalculates unless an input actually changed.
 *
 * ── Surface ──────────────────────────────────────────────────────────────
 * The whole calculator sits on one near-opaque card. This page renders over
 * the fixed WebGL particle field, and dense figures and 6px slider tracks are
 * unreadable against a moving starfield — the card is what makes the numbers
 * legible. It is deliberately solid rather than translucent, and deliberately
 * not backdrop-blurred: a blur this large over a canvas that repaints every
 * frame is a real cost on mobile for no gain over an opaque fill.
 */

const ACCENTS = ['#6366F1', '#A855F7', '#22D3EE'];

function reducer(state, action) {
  if (state[action.key] === action.value) return state;   // no-op, no re-render
  return { ...state, [action.key]: action.value };
}

export default function AIAutomationROICalculator() {
  const [input, dispatch] = useReducer(reducer, ROI_DEFAULTS);
  const set = (key) => (value) => dispatch({ key, value });

  const result = useMemo(() => calculateROI(input), [input]);
  const accent = ACCENTS[ROI_INDUSTRIES.findIndex((i) => i.id === input.industry) % ACCENTS.length];

  return (
    <section aria-labelledby="roi-title" className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
      <div
        className="relative overflow-hidden rounded-3xl border p-6 sm:p-10 lg:p-14 transition-[border-color] duration-1000 ease-brand"
        style={{ background: '#191634', borderColor: `${accent}2e` }}
      >
        {/* ambient light inside the card, retinted per industry */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none transition-[background] duration-1000 ease-brand"
          style={{ background: `radial-gradient(70% 55% at 78% 12%, ${accent}1c, transparent 68%)` }}
        />

        <div className="relative z-10">
          {/* ── header ───────────────────────────────────────────────────── */}
          <header className="max-w-3xl">
            <p className="text-fluid-xs uppercase tracking-[0.35em] font-semibold text-brand-cyan">
              Interactive ROI engine
            </p>
            <AnimatedHeading
              id="roi-title"
              text="Calculate Your Annual AI Automation Savings"
              className="mt-5 text-fluid-2xl font-bold tracking-tight bg-gradient-to-r from-brand-cyan via-brand-indigo to-brand-purple bg-clip-text text-transparent"
            />
            <p className="mt-6 text-fluid-base leading-relaxed text-brand-muted">
              Four questions about how your business runs today. The dashboard updates as you move.
            </p>
          </header>

          {/* ── two columns on desktop, stacked below ───────────────────── */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] gap-10 lg:gap-14 items-start">

            {/* configuration */}
            <div
              className="min-w-0 rounded-2xl p-6 sm:p-7 lg:sticky lg:top-28"
              style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.07)' }}
            >
              <p className="text-fluid-xs uppercase tracking-[0.3em] font-semibold" style={{ color: accent }}>
                AI business configuration
              </p>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <SelectField
                  label="Industry"
                  value={input.industry}
                  options={ROI_INDUSTRIES}
                  accent={accent}
                  onChange={set('industry')}
                />
                <SelectField
                  label="Business Size"
                  value={input.businessSize}
                  options={BUSINESS_SIZES}
                  accent={accent}
                  onChange={set('businessSize')}
                />
              </div>

              <div className="mt-8 space-y-8">
                {ROI_INPUTS.map((def) => (
                  <ROISlider
                    key={def.id}
                    def={def}
                    value={input[def.id]}
                    accent={accent}
                    onChange={set(def.id)}
                  />
                ))}
              </div>

              {/* what the model assumed rather than asked — stated, not hidden */}
              <p className="mt-8 text-fluid-xs leading-relaxed text-white/35">
                Lead, call and document volumes are estimated from your team size
                (~{result.monthlyLeads.toLocaleString('en-US')} leads,
                {' '}{result.monthlyCalls.toLocaleString('en-US')} calls and
                {' '}{result.monthlyDocs.toLocaleString('en-US')} documents a month).
              </p>

              <div className="mt-8 pt-7" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
                <RecommendationEngine industry={result.industry} accent={accent} />
              </div>
            </div>

            {/* live dashboard */}
            <div className="min-w-0">
              {/* Inputs change faster than a screen reader can usefully follow,
                  so the region is not a live region; the numbers are readable
                  on demand rather than announced on every slider step. */}
              <ImpactDashboard result={result} accent={accent} />
              <CalculatorCTA result={result} input={input} accent={accent} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
