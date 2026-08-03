"use client";
import React, { useId } from 'react';
import { num } from '@/lib/roi';

/**
 * One configuration control.
 *
 * A native <input type="range"> under custom styling rather than a div-based
 * slider: the native control already handles keyboard stepping, Home/End,
 * touch dragging and the ARIA value contract correctly, and a hand-rolled
 * replacement would have to reimplement all of it to be usable.
 *
 * The filled portion of the track is a CSS custom property so the fill moves
 * without re-rendering anything but this input's own style attribute.
 */
export default function ROISlider({ def, value, accent, onChange }) {
  const id = useId().replace(/:/g, '');
  const pct = ((value - def.min) / (def.max - def.min)) * 100;

  const display = `${def.prefix || ''}${num(value)}${def.suffix || ''}`;

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-fluid-sm font-semibold text-white">
          {def.label}
        </label>
        <output
          htmlFor={id}
          className="font-mono text-fluid-sm font-bold tabular-nums shrink-0"
          style={{ color: accent }}
        >
          {display}
        </output>
      </div>

      <input
        id={id}
        type="range"
        className="roi-range mt-1"
        min={def.min}
        max={def.max}
        step={def.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-describedby={def.hint ? `${id}-hint` : undefined}
        // The visible <output> already reads the number, but screen readers
        // announce the raw value — units make that intelligible.
        aria-valuetext={`${display} ${def.unit}`}
        style={{ '--fill': `${pct}%`, '--accent': accent }}
      />

      <div className="flex items-center justify-between gap-3 -mt-1">
        <span className="text-fluid-xs text-white/30 font-mono">
          {def.prefix || ''}{num(def.min)}{def.suffix || ''}
        </span>
        {def.hint && (
          <span id={`${id}-hint`} className="text-fluid-xs text-white/35 text-center truncate">
            {def.hint}
          </span>
        )}
        <span className="text-fluid-xs text-white/30 font-mono">
          {def.prefix || ''}{num(def.max)}{def.suffix || ''}
        </span>
      </div>
    </div>
  );
}

/**
 * Shared select. IndustrySelector and BusinessSizeSelector are the same
 * control with different options, so they are one component rather than two
 * near-identical ones.
 */
export function SelectField({ label, value, options, accent, onChange }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-fluid-sm font-semibold text-white">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="roi-select mt-3 w-full min-h-[44px] rounded-xl bg-white/[0.04] px-4 pr-11 text-fluid-sm text-white transition-colors focus:outline-none"
        style={{ border: `1px solid ${accent}33` }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
