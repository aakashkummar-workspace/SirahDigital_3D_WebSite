"use client";
import React, { useId } from 'react';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { num } from '@/lib/roi';

/**
 * The three live indicators: a radial gauge for automation coverage, a linear
 * meter for productivity, and a before/after comparison for hours.
 *
 * All three animate purely through CSS transitions on a single property, so
 * they cost nothing per frame and settle correctly under reduced motion.
 */

/** Automation coverage as a radial gauge. */
export function AutomationGauge({ value, accent }) {
  const uid = useId().replace(/:/g, '');
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: 132, height: 132 }}>
        <svg viewBox="0 0 132 132" className="w-full h-full -rotate-90">
          <defs>
            <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="55%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <circle cx="66" cy="66" r={R} fill="none" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="10" />
          <circle
            cx="66" cy="66" r={R} fill="none" stroke={`url(#${uid}-g)`} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,.61,.36,1)' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-fluid-xl font-bold tabular-nums text-white leading-none">{Math.round(pct)}%</p>
            <p className="mt-1 text-fluid-xs text-white/40">covered</p>
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-fluid-sm font-semibold text-white">Automation Coverage</p>
        <p className="mt-2 text-fluid-xs leading-relaxed text-brand-muted">
          Share of your repeatable operations running without a person once these systems are live.
        </p>
      </div>
    </div>
  );
}

/** Productivity improvement as a horizontal meter. */
export function EfficiencyMeter({ value, accent }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-fluid-sm font-semibold text-white">Productivity Improvement</p>
        <p className="font-mono text-fluid-sm font-bold tabular-nums" style={{ color: accent }}>
          +{pct.toFixed(1)}%
        </p>
      </div>
      <div className="mt-3 h-2.5 rounded-full bg-white/[0.07] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: '#22D3EE',
            transition: 'width 900ms cubic-bezier(.22,.61,.36,1)',
          }}
        />
      </div>
      <p className="mt-2 text-fluid-xs text-white/35">
        Capacity returned to the team as a share of total working hours.
      </p>
    </div>
  );
}

/** Hours before and after, side by side. */
export function ComparisonChart({ before, after, accent }) {
  const reduced = useReducedMotion();
  const max = Math.max(before, 1);
  const afterPct = Math.max(2, (after / max) * 100);
  const fmt = (n) => num(Math.round(n));

  return (
    <div>
      <p className="text-fluid-sm font-semibold text-white">Manual Hours Per Year</p>
      <div className="mt-4 space-y-3">
        {[
          { label: 'Today', pct: 100, value: before, fill: 'rgba(255,255,255,.16)', text: '#CBD5E1' },
          { label: 'With Sirah', pct: afterPct, value: after, fill: accent, text: '#FFFFFF' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-fluid-xs text-white/45">{row.label}</span>
            <div className="flex-1 h-7 rounded-lg bg-white/[0.04] overflow-hidden min-w-0">
              <div
                className="h-full rounded-lg flex items-center justify-end pr-3"
                style={{
                  width: `${row.pct}%`,
                  background: row.fill,
                  transition: reduced ? 'none' : 'width 950ms cubic-bezier(.22,.61,.36,1)',
                }}
              >
                <span className="font-mono text-fluid-xs font-bold tabular-nums whitespace-nowrap" style={{ color: row.text }}>
                  {fmt(row.value)}h
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Small sparkline showing cumulative benefit building over 12 months. */
export function RevenueSpark({ annualBenefit, accent }) {
  const uid = useId().replace(/:/g, '');
  const pts = [...Array(13)].map((_, i) => {
    // Benefit ramps as systems go live rather than landing on day one.
    const ramp = Math.min(1, Math.pow(i / 12, 0.72));
    return { x: (i / 12) * 300, y: 70 - ramp * 62 };
  });
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  return (
    <div>
      <p className="text-fluid-sm font-semibold text-white">Cumulative Benefit, Year One</p>
      <svg viewBox="0 0 300 80" className="mt-3 w-full h-auto" role="img" aria-label="Benefit accumulating across the first twelve months">
        <defs>
          <linearGradient id={`${uid}-f`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L300 80 L0 80 Z`} fill={`url(#${uid}-f)`} />
        <path
          d={d} fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
          pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: 0, transition: 'stroke 600ms ease' }}
        />
        <circle cx="300" cy={pts[12].y} r="4" fill={accent} />
      </svg>
      <div className="flex justify-between text-fluid-xs text-white/30 font-mono">
        <span>Month 1</span>
        <span>Month 12</span>
      </div>
    </div>
  );
}
