"use client";
import React, { useState } from 'react';
import { ArrowRightIcon } from '@/components/ui/icons';
import { money, compact, num } from '@/lib/roi';
import { COMPANY } from '@/data/company';

import { PrimaryButton } from '@/components/ui/Button';
/**
 * Conversion close, plus the report download.
 *
 * The report opens a print-ready summary in a new window and calls print(),
 * which lets the browser produce the PDF. That keeps a genuinely working
 * download without adding a PDF library and without a backend.
 *
 * ── Presentation ─────────────────────────────────────────────────────────
 * Two equally-weighted pill buttons used to sit here, which made the visitor
 * choose between them rather than read one as the next step. The strategy
 * session is the primary action; the report is a quiet text link beside it.
 * The report generation itself is unchanged.
 */
export default function CalculatorCTA({ result, input }) {
  const [blocked, setBlocked] = useState(false);

  const downloadReport = () => {
    const rows = [
      ['Annual cost savings', money(result.annualSavings)],
      ['Hours saved per month', `${compact(result.hoursSaved / 12)} hours`],
      ['Revenue opportunity', money(result.revenueOpportunity)],
      ['Estimated ROI', `${Math.round(result.roi)}%`],
      ['Payback period', `${result.paybackMonths.toFixed(1)} months`],
      ['Automation coverage', `${Math.round(result.automationCoverage)}%`],
      ['Productivity improvement', `+${result.productivityGain.toFixed(1)}%`],
      ['Indicative investment', money(result.investment)],
    ];
    const inputs = [
      ['Industry', result.industry.label],
      ['Business size', result.size.label],
      ['Team size', `${input.teamSize} employees`],
      ['Average hourly cost', `₹${num(input.hourlyCost)}`],
      ['Manual hours per week', `${input.manualHours} per person`],
      ['Current automation', `${input.currentAutomation}%`],
    ];
    // Volumes the model inferred rather than asked for — stated plainly so
    // the reader can challenge them.
    const derived = [
      ['Monthly leads', num(result.monthlyLeads)],
      ['Monthly customer calls', num(result.monthlyCalls)],
      ['Documents processed monthly', num(result.monthlyDocs)],
    ];

    const cell = (a, b, strong) =>
      `<tr><td>${a}</td><td class="${strong ? 'v strong' : 'v'}">${b}</td></tr>`;

    const html = `<!doctype html><html><head><meta charset="utf-8">
<title>AI Automation Impact Report - ${COMPANY.name}</title>
<style>
  *{box-sizing:border-box}
  body{font:14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#16142c;margin:0;padding:48px}
  h1{font-size:26px;margin:0 0 6px}
  h2{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#6366F1;margin:34px 0 10px}
  .sub{color:#666;margin:0 0 8px}
  table{width:100%;border-collapse:collapse}
  td{padding:9px 0;border-bottom:1px solid #eceaf5}
  .v{text-align:right;font-variant-numeric:tabular-nums}
  .strong{font-weight:700;font-size:16px}
  .note{margin-top:36px;padding:14px 16px;background:#f6f5fc;border-left:3px solid #6366F1;color:#444;font-size:12px}
  .brandrow{display:flex;align-items:center;gap:12px;margin:0 0 18px}
  .brandrow img{width:40px;height:auto;display:block}
  .brand{font-weight:800;font-size:18px;letter-spacing:.04em}
  @media print{body{padding:24px}}
</style></head><body>
<div class="brandrow"><img id="logo" src="${window.location.origin}/logo-mark.png" alt="" width="40"><span class="brand">${COMPANY.name}</span></div>
<h1>AI Automation Impact Report</h1>
<p class="sub">Prepared for a ${result.size.label.toLowerCase()} in ${result.industry.label}.</p>
<h2>Projected annual impact</h2>
<table>${rows.map(([a, b], i) => cell(a, b, i < 2)).join('')}</table>
<h2>Recommended systems</h2>
<p>${result.industry.recommendations.join(' &middot; ')}</p>
<h2>Your inputs</h2>
<table>${inputs.map(([a, b]) => cell(a, b)).join('')}</table>
<h2>Estimated from your team size</h2>
<table>${derived.map(([a, b]) => cell(a, b)).join('')}</table>
<p class="note"><strong>Indicative estimate.</strong> These figures are modelled from the inputs above using
industry-typical assumptions. They are not a quotation and not a guarantee of results. A scoping call produces
figures based on your actual processes. ${COMPANY.email} &middot; ${COMPANY.phone}</p>
</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=1000');
    if (!w) { setBlocked(true); return; }
    setBlocked(false);
    w.document.write(html);
    w.document.close();
    w.focus();
    // Print once the logo has loaded — the window is about:blank, so the image
    // is fetched after write() and printing at once would catch it half-drawn.
    // The timeout is the fallback for a logo that fails or never settles.
    const logo = w.document.getElementById('logo');
    let printed = false;
    const printOnce = () => {
      if (printed) return;
      printed = true;
      w.print();
    };
    if (logo && !logo.complete) {
      logo.onload = printOnce;
      logo.onerror = printOnce;
      setTimeout(printOnce, 2500);
    } else {
      setTimeout(printOnce, 350);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
        <PrimaryButton href="/contact">
          Book a free AI strategy session
          <span className="btn-arrow">
            <ArrowRightIcon />
          </span>
        </PrimaryButton>

        <button
          type="button"
          onClick={downloadReport}
          className="interactive-hover group inline-flex min-h-[44px] items-center gap-2 text-[14px] font-medium text-white/60 transition-colors hover:text-white"
        >
          Download the automation report
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

      {blocked && (
        <p role="status" className="mt-4 text-[12px] text-amber-400">
          Your browser blocked the report window. Allow pop-ups for this site and try again.
        </p>
      )}

      {/* The honest caveat. These are modelled projections shown to a
          prospect, so the page says so plainly rather than implying they are
          measured results. */}
      <p className="mt-8 max-w-[62ch] text-[12px] leading-relaxed text-white/35">
        <strong className="font-medium text-white/55">Indicative estimate.</strong> Figures are modelled from
        your inputs using industry-typical assumptions for automatable workload, transaction handling time and
        implementation cost. They are not a quotation and not a guarantee of results - a scoping call replaces
        them with numbers based on your actual processes.
      </p>
    </div>
  );
}
