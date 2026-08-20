"use client";
import React, { useCallback } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { Meter } from './Controls';
import SavingsCurve from './SavingsCurve';
import { money, compact, num } from '@/lib/roi';

/**
 * "Here's what automation could save you."
 *
 * Every figure the old dashboard showed is still here. What changed is the
 * hierarchy: one hero number, one supporting number, then everything else as
 * quiet rows of text. The previous version gave ten metrics ten cards, which
 * made all ten equally loud and therefore none of them legible as the answer.
 *
 * No metric gets its own container. Separation is whitespace and type weight.
 */
export default function ResultPanel({ result, accent }) {
  // Stable formatters — AnimatedCounter effects depend on them, and a new
  // function identity each render would restart every tween mid-flight.
  const fMoney = useCallback((n) => money(n), []);
  const fHours = useCallback((n) => `${compact(n)}h`, []);
  const fPct = useCallback((n) => `${Math.round(n)}%`, []);
  const fPctSigned = useCallback((n) => `+${n.toFixed(1)}%`, []);
  const fMonths = useCallback((n) => (n >= 24 ? '24+ mo' : `${n.toFixed(1)} mo`), []);
  const fTimes = useCallback((n) => `${Math.round(n)}×`, []);
  const fHoursFull = useCallback((n) => `${num(Math.round(n))}h`, []);

  const secondary = [
    { label: 'First-year ROI', value: result.roi, format: fPct },
    { label: 'Payback period', value: result.paybackMonths, format: fMonths },
    { label: 'Revenue opportunity', value: result.revenueOpportunity, format: fMoney },
    { label: 'Lead response', value: result.responseImprovement, format: fTimes, suffix: 'faster' },
  ];

  const after = Math.max(0, result.manualHoursPerYear - result.hoursSaved);
  // Bar widths are relative to today's figure, which is always the larger of
  // the two — so "today" is full width and the comparison reads at a glance.
  const afterPct = result.manualHoursPerYear > 0 ? (after / result.manualHoursPerYear) * 100 : 0;

  return (
    <div className="min-w-0">
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink/45">
        Estimated impact
      </h2>

      {/* ── primary: annual savings ──────────────────────────────────────── */}
      <div className="mt-8">
        <p className="text-[13px] text-ink/55">Estimated annual savings</p>
        <AnimatedCounter
          value={result.annualSavings}
          format={fMoney}
          className="mt-2 block font-semibold tabular-nums leading-[0.95] tracking-tight text-ink"
          style={{ fontSize: 'clamp(3rem, 1.9rem + 4.4vw, 4rem)' }}
        />
        <p className="mt-3 max-w-[42ch] text-[12px] leading-relaxed text-ink/40">
          Realised cost avoidance - not the notional value of every freed hour.
        </p>
      </div>

      {/* ── secondary: hours ─────────────────────────────────────────────── */}
      <div className="mt-9">
        <AnimatedCounter
          value={result.hoursSaved}
          format={fHours}
          className="block font-semibold tabular-nums leading-none text-ink"
          style={{ fontSize: 'clamp(1.6rem, 1.2rem + 1.4vw, 2rem)' }}
        />
        <p className="mt-2 text-[13px] text-ink/55">Hours saved per year</p>
      </div>

      {/* ── supporting figures, as text rows rather than cards ───────────── */}
      <dl className="mt-10 divide-y divide-ink/[0.06] border-y border-ink/[0.06]">
        {secondary.map((m) => (
          <div key={m.label} className="flex items-baseline justify-between gap-4 py-3.5">
            <dt className="text-[13px] text-ink/55">{m.label}</dt>
            <dd className="flex shrink-0 items-baseline gap-1.5">
              <AnimatedCounter
                value={m.value}
                format={m.format}
                className="text-[16px] font-semibold tabular-nums text-ink"
              />
              {m.suffix && <span className="text-[12px] text-ink/40">{m.suffix}</span>}
            </dd>
          </div>
        ))}
      </dl>

      {/* ── automation coverage ──────────────────────────────────────────── */}
      <section aria-labelledby="roi-coverage" className="mt-11">
        <AnimatedCounter
          value={result.automationCoverage}
          format={fPct}
          className="block font-semibold tabular-nums leading-none text-ink"
          style={{ fontSize: 'clamp(1.9rem, 1.4rem + 1.8vw, 2.4rem)' }}
        />
        <h3 id="roi-coverage" className="mt-2 text-[13px] text-ink/55">
          Automation coverage
        </h3>
        <Meter value={result.automationCoverage} accent={accent} />
        <p className="mt-3 max-w-[46ch] text-[12px] leading-relaxed text-ink/40">
          Share of repeatable operations that could run without manual intervention.
        </p>
      </section>

      {/* ── productivity ─────────────────────────────────────────────────── */}
      <section aria-labelledby="roi-productivity" className="mt-9">
        <div className="flex items-baseline justify-between gap-4">
          <h3 id="roi-productivity" className="text-[13px] text-ink/55">
            Productivity improvement
          </h3>
          <AnimatedCounter
            value={result.productivityGain}
            format={fPctSigned}
            className="shrink-0 text-[16px] font-semibold tabular-nums text-ink"
          />
        </div>
        <Meter value={result.productivityGain} accent={accent} />
      </section>

      {/* ── manual hours, before and after ───────────────────────────────── */}
      <section aria-labelledby="roi-hours" className="mt-11">
        <h3 id="roi-hours" className="text-[13px] text-ink/55">
          Manual hours per year
        </h3>

        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] text-ink/70">Today</span>
              <AnimatedCounter
                value={result.manualHoursPerYear}
                format={fHoursFull}
                className="shrink-0 text-[15px] font-semibold tabular-nums text-ink"
              />
            </div>
            <div className="mt-2.5 h-[2px] rounded-sm bg-ink/25" aria-hidden="true" />
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] text-ink/70">With Sirah</span>
              <AnimatedCounter
                value={after}
                format={fHoursFull}
                className="shrink-0 text-[15px] font-semibold tabular-nums"
                style={{ color: accent }}
              />
            </div>
            <div className="mt-2.5 h-[2px] rounded-sm bg-ink/10" aria-hidden="true">
              <div
                className="h-full rounded-sm transition-[width] duration-700 ease-brand"
                style={{ width: `${afterPct}%`, background: accent }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── savings over time ────────────────────────────────────────────── */}
      <div className="mt-11">
        <SavingsCurve annualBenefit={result.annualBenefit} accent={accent} />
      </div>
    </div>
  );
}
