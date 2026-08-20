"use client";
import React, { useId } from 'react';
import { money } from '@/lib/roi';
import s from './calculator.module.css';

/**
 * Cumulative benefit over the first twelve months.
 *
 * Kept from the old dashboard because it says something the headline figure
 * cannot — that the return compounds — but reduced to a single line, one fill
 * and two labels. No axes, no gridlines, no border, no card.
 *
 * The curve is linear accumulation, which is the honest shape: the model
 * produces an annual benefit and divides it across the year. Drawing a
 * flattering hockey stick would be inventing a ramp the model does not
 * describe.
 *
 * Rendered as inline SVG with a viewBox and no fixed width, so it scales to
 * its container without a resize listener or a charting dependency.
 */

const W = 600;
const H = 150;
const PAD_Y = 10;

export default function SavingsCurve({ annualBenefit, accent }) {
  const gradientId = useId().replace(/:/g, '');

  const monthly = annualBenefit / 12;
  const points = Array.from({ length: 13 }, (_, i) => {
    const x = (i / 12) * W;
    // 0 at the baseline, annualBenefit at the top of the plot area.
    const y = H - PAD_Y - (i / 12) * (H - PAD_Y * 2);
    return { x, y, value: monthly * i };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <section aria-labelledby="roi-curve-title" className="min-w-0">
      <div className="flex items-baseline justify-between gap-4">
        <h3 id="roi-curve-title" className="text-[13px] text-ink/60">
          Potential savings over 12 months
        </h3>
        <p className="shrink-0 text-[15px] font-semibold tabular-nums text-ink">
          {money(annualBenefit)}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-5 h-[130px] w-full sm:h-[150px]"
        role="img"
        aria-label={`Cumulative benefit rising to approximately ${money(annualBenefit)} by month twelve.`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopOpacity="0.16" style={{ stopColor: accent }} />
            <stop offset="100%" stopOpacity="0" style={{ stopColor: accent }} />
          </linearGradient>
        </defs>

        {/* Baseline only — no gridlines. It anchors the curve without turning
            the figure into a chart. */}
        <line x1="0" y1={H} x2={W} y2={H} style={{ stroke: 'rgb(var(--c-ink) / 0.10)' }} strokeWidth="1" vectorEffect="non-scaling-stroke" />

        <path className={s.curveArea} d={area} fill={`url(#${gradientId})`} />
        <path
          className={s.curvePath}
          d={line}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          // Without this the non-uniform viewBox scaling stretches the stroke
          // horizontally and the line reads thicker at the right-hand end.
          vectorEffect="non-scaling-stroke"
          style={{ stroke: accent }}
        />
      </svg>

      <div className="mt-3 flex items-center justify-between text-[12px] text-ink/35">
        <span>Month 1</span>
        <span>Month 12</span>
      </div>
    </section>
  );
}
