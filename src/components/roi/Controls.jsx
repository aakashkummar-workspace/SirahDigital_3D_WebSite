"use client";
import React, { useId } from 'react';
import { num } from '@/lib/roi';
import s from './calculator.module.css';

/**
 * The calculator's input controls.
 *
 * The design rule is that the *number* is the information and the slider is
 * only the instrument for changing it. So the value is set large and in white,
 * the track is 2px, and the min/max ends are dropped entirely — the slider
 * cannot travel past them, so labelling them was telling the visitor something
 * the control already enforces.
 */

export function Slider({ def, value, accent, onChange }) {
  const id = useId().replace(/:/g, '');
  const pct = ((value - def.min) / (def.max - def.min)) * 100;
  const display = `${def.prefix || ''}${num(value)}${def.suffix || ''}`;

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[13px] leading-snug text-ink/60">
          {def.label}
        </label>
        <output
          htmlFor={id}
          className="shrink-0 text-[19px] font-semibold tabular-nums leading-none text-ink"
        >
          {display}
        </output>
      </div>

      <input
        id={id}
        type="range"
        className={s.slider}
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-describedby={def.hint ? `${id}-hint` : undefined}
        // The visible <output> reads the number, but a screen reader announces
        // the raw value — the unit is what makes "40" mean something.
        aria-valuetext={`${display} ${def.unit}`}
        style={{ '--fill': `${pct}%`, '--accent': accent }}
      />

      {def.hint && (
        <p id={`${id}-hint`} className="-mt-1 text-[12px] leading-snug text-ink/40">
          {def.hint}
        </p>
      )}
    </div>
  );
}

export function Select({ label, value, options, accent, onChange }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[13px] text-ink/60">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${s.select} mt-2 text-[16px] font-medium`}
        style={{ '--accent': accent }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * A thin horizontal meter.
 *
 * Used for automation coverage and productivity in place of the donut gauge
 * and the segmented efficiency bar the previous version drew. It carries the
 * same information — a proportion — with none of the dashboard furniture.
 *
 * `aria-hidden` because every one of these sits directly beneath the same
 * figure written as text. Announcing it twice adds nothing for a screen
 * reader; the number is the accessible representation.
 */
export function Meter({ value, accent }) {
  return (
    <div className={`${s.meterTrack} mt-4`} aria-hidden="true">
      <div
        className={s.meterFill}
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: accent }}
      />
    </div>
  );
}
