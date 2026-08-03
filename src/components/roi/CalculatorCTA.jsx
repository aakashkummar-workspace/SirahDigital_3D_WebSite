"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';
import { money, compact, num } from '@/lib/roi';
import { COMPANY } from '@/data/company';

/**
 * Conversion close, plus the report download.
 *
 * The report opens a print-ready summary in a new window and calls print(),
 * which lets the browser produce the PDF. That keeps a genuinely working
 * download without adding a PDF library, and without a backend — the spec
 * allows a placeholder here, but this is the real thing.
 */
export default function CalculatorCTA({ result, input, accent }) {
  const [blocked, setBlocked] = useState(false);

  const downloadReport = () => {
    const rows = [
      ['Annual cost savings', money(result.annualSavings)],
      ['Hours saved per year', `${compact(result.hoursSaved)} hours`],
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
      ['Average hourly cost', `$${input.hourlyCost}`],
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
<title>AI Automation Impact Report — ${COMPANY.name}</title>
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
  .brand{font-weight:800;letter-spacing:.04em}
  @media print{body{padding:24px}}
</style></head><body>
<p class="brand">${COMPANY.name}</p>
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
    // Let the new document lay out before invoking the print dialog.
    setTimeout(() => w.print(), 350);
  };

  return (
    <div className="mt-12">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/contact"
          className="interactive-hover group inline-flex items-center justify-center gap-3 min-h-[44px] px-7 py-4 rounded-full text-fluid-sm font-bold text-[#04121a] bg-brand-cyan hover:bg-white transition-colors"
        >
          Book My Free AI Strategy Session
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRightIcon />
          </span>
        </Link>

        <button
          type="button"
          onClick={downloadReport}
          className="interactive-hover group inline-flex items-center justify-center gap-3 min-h-[44px] px-7 py-4 rounded-full text-fluid-sm font-semibold text-white transition-colors"
          style={{ background: `${accent}1f`, border: `1px solid ${accent}4d` }}
        >
          Download My AI Automation Report
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
            <path d="M12 3v10.6l3.3-3.3 1.4 1.4L12 16.4l-4.7-4.7 1.4-1.4L12 13.6V3h0zM5 18h14v2H5z" />
          </svg>
        </button>
      </div>

      {blocked && (
        <p role="status" className="mt-4 text-fluid-xs text-amber-400">
          Your browser blocked the report window. Allow pop-ups for this site and try again.
        </p>
      )}

      {/* The honest caveat. These are modelled projections shown to a
          prospect, so the page says so plainly rather than implying they are
          measured results. */}
      <p className="mt-7 max-w-2xl text-fluid-xs leading-relaxed text-white/35">
        <strong className="text-white/55">Indicative estimate.</strong> Figures are modelled from your inputs
        using industry-typical assumptions for automatable workload, transaction handling time and
        implementation cost. They are not a quotation and not a guarantee of results — a scoping call
        replaces them with numbers based on your actual processes.
      </p>
    </div>
  );
}
