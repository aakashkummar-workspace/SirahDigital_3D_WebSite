"use client";
import React, { useCallback } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { AutomationGauge, EfficiencyMeter, ComparisonChart, RevenueSpark } from './Indicators';
import { money, compact } from '@/lib/roi';

/**
 * The live read-out. Every figure tweens from its previous value, so changing
 * a slider reads as the projection moving rather than being replaced.
 */
export default function ImpactDashboard({ result, accent }) {
  // Formatters are stable so AnimatedCounter's effect does not re-run on
  // every parent render and restart its tween mid-flight.
  const fMoney = useCallback((n) => money(n), []);
  const fHours = useCallback((n) => `${compact(n)}h`, []);
  const fPct = useCallback((n) => `${Math.round(n)}%`, []);
  const fMonths = useCallback((n) => (n >= 24 ? '24+ mo' : `${n.toFixed(1)} mo`), []);
  const fTimes = useCallback((n) => `${Math.round(n)}×`, []);

  const headline = [
    {
      label: 'Annual Cost Savings',
      value: result.annualSavings,
      format: fMoney,
      // Says out loud that this is realised cost, not the notional value of
      // every freed hour — the distinction a finance reader will look for.
      note: 'Realised cost avoidance, not the notional value of all freed time',
    },
    {
      label: 'Hours Saved Per Year',
      value: result.hoursSaved,
      format: fHours,
      note: 'Full capacity returned to the team',
    },
  ];

  const secondary = [
    { label: 'First-Year ROI', value: result.roi, format: fPct },
    { label: 'Payback Period', value: result.paybackMonths, format: fMonths },
    { label: 'Revenue Opportunity', value: result.revenueOpportunity, format: fMoney },
    { label: 'Lead Response', value: result.responseImprovement, format: fTimes, suffix: 'faster' },
  ];

  return (
    <div className="min-w-0">
      <p className="text-fluid-xs uppercase tracking-[0.3em] font-semibold" style={{ color: accent }}>
        Live AI impact dashboard
      </p>

      {/* headline figures */}
      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {headline.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl p-5 sm:p-6 min-w-0"
            style={{
              background: `linear-gradient(145deg, ${accent}14, rgba(255,255,255,.02))`,
              border: `1px solid ${accent}2e`,
            }}
          >
            <p className="text-fluid-xs uppercase tracking-[0.18em] text-white/45">{m.label}</p>
            <AnimatedCounter
              value={m.value}
              format={m.format}
              className="mt-3 block font-bold tabular-nums leading-none text-white"
              style={{ fontSize: 'clamp(1.9rem, 1.2rem + 2.4vw, 3rem)' }}
            />
            {m.note && <p className="mt-2 text-fluid-xs text-white/35">{m.note}</p>}
          </div>
        ))}
      </div>

      {/* supporting figures */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {secondary.map((m) => (
          <div key={m.label} className="rounded-xl bg-white/[0.03] p-4 min-w-0">
            <p className="text-fluid-xs text-white/40 truncate">{m.label}</p>
            <AnimatedCounter
              value={m.value}
              format={m.format}
              className="mt-2 block text-fluid-lg font-bold tabular-nums"
              style={{ color: accent }}
            />
            {m.suffix && <p className="text-fluid-xs text-white/30">{m.suffix}</p>}
          </div>
        ))}
      </div>

      {/* visual indicators */}
      <div className="mt-8 space-y-8">
        <AutomationGauge value={result.automationCoverage} accent={accent} />
        <EfficiencyMeter value={result.productivityGain} accent={accent} />
        <ComparisonChart
          before={result.manualHoursPerYear}
          after={Math.max(0, result.manualHoursPerYear - result.hoursSaved)}
          accent={accent}
        />
        <RevenueSpark annualBenefit={result.annualBenefit} accent={accent} />
      </div>
    </div>
  );
}
