"use client";
import React, { useState } from 'react';
import { Slider, Select } from './Controls';
import { ROI_INPUTS, ROI_INDUSTRIES, BUSINESS_SIZES } from '@/data/roi';
import s from './calculator.module.css';

/**
 * "Tell us a little about your business."
 *
 * ── Progressive disclosure ───────────────────────────────────────────────
 * All six inputs still drive the model; they are not all shown at once.
 * Industry, business size, team size and manual hours are what a visitor can
 * answer immediately and what moves the answer most. Hourly cost and current
 * automation level are assumptions — they have defensible defaults, and asking
 * for them up front turns a calculator into a form.
 *
 * They are one click away rather than hidden: someone who wants to challenge
 * the assumptions can, and should.
 */

const PRIMARY = ['teamSize', 'manualHours'];

export default function ConfigPanel({ input, set, accent, derived }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const primary = ROI_INPUTS.filter((d) => PRIMARY.includes(d.id));
  const advanced = ROI_INPUTS.filter((d) => !PRIMARY.includes(d.id));

  return (
    <div className="min-w-0">
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/45">
        Your business
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Select
          label="Industry"
          value={input.industry}
          options={ROI_INDUSTRIES}
          accent={accent}
          onChange={set('industry')}
        />
        <Select
          label="Business size"
          value={input.businessSize}
          options={BUSINESS_SIZES}
          accent={accent}
          onChange={set('businessSize')}
        />
      </div>

      <div className="mt-9 space-y-7">
        {primary.map((def) => (
          <Slider key={def.id} def={def} value={input[def.id]} accent={accent} onChange={set(def.id)} />
        ))}
      </div>

      {/* ── advanced assumptions ─────────────────────────────────────────── */}
      <div className="mt-9">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          aria-controls="roi-advanced"
          className={`${s.disclosure} ${showAdvanced ? s.disclosureOpen : ''} inline-flex items-center gap-2 text-[13px] font-medium`}
        >
          <svg
            viewBox="0 0 12 12"
            className={`${s.disclosureIcon} h-3 w-3`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M4.5 2.5L8 6l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Advanced assumptions
        </button>

        {/* Unmounted rather than hidden with CSS, so the sliders inside are not
            in the tab order while collapsed. */}
        {showAdvanced && (
          <div id="roi-advanced" className="mt-7 space-y-7">
            {advanced.map((def) => (
              <Slider key={def.id} def={def} value={input[def.id]} accent={accent} onChange={set(def.id)} />
            ))}
          </div>
        )}
      </div>

      {/* What the model assumed rather than asked for. Stated plainly — a
          reader who disagrees with these can discount the result accordingly,
          which they cannot do if the derivation is invisible. */}
      <p className="mt-9 max-w-[46ch] text-[12px] leading-relaxed text-white/40">
        Lead, call and document volumes are estimated from your team size - about{' '}
        {derived.monthlyLeads.toLocaleString('en-US')} leads,{' '}
        {derived.monthlyCalls.toLocaleString('en-US')} calls and{' '}
        {derived.monthlyDocs.toLocaleString('en-US')} documents a month.
      </p>
    </div>
  );
}
