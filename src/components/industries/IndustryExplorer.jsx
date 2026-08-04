"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { INDUSTRY_INTELLIGENCE } from '@/data/industryIntelligence';
import { IndustryIcon, CheckCircleIcon, ShieldIcon } from './IndustryIcons';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { ArrowRightIcon } from '@/components/ui/icons';

/*
 * Industry Intelligence Explorer — master/detail split view.
 *
 *   ≥lg   two columns: a pinned sector rail on the left, one detail panel on
 *         the right. Nothing scrolls the page; selection swaps the panel.
 *   <lg   the same rail turns into a horizontal snap carousel and the panel
 *         drops underneath it. One detail renderer serves both — a phone gets
 *         the full record, not a truncated one.
 *
 * Semantics are a real tablist: roving tabindex, arrow keys wrap, Home/End
 * jump to the ends, and the panel is labelled by whichever tab is current.
 * Automatic activation (focus selects) is the correct pattern here because
 * switching panels is free — no request, no route change.
 *
 * Accent colour is per sector and drives the icon tile, the active rail state,
 * the guarantee callout and the ambient glow, so every panel reads as the same
 * component wearing a different colour rather than twelve separate designs.
 */

const TOTAL = INDUSTRY_INTELLIGENCE.length;

export default function IndustryExplorer() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const railRef = useRef(null);
  const tabRefs = useRef([]);

  const item = INDUSTRY_INTELLIGENCE[active];
  const accent = item.accent;

  const setTab = useCallback((i) => (el) => { tabRefs.current[i] = el; }, []);

  /* Keep the current chip centred while the rail is horizontal. The rail is
     scrolled directly rather than via scrollIntoView, which would also move
     the page when the panel below is taller than the viewport.
     Offsets come from rects, not offsetLeft: the rail is not a positioned
     ancestor, so offsetLeft would be measured against something further up
     the tree and the rail would land on the wrong card. */
  useEffect(() => {
    const rail = railRef.current;
    const el = tabRefs.current[active];
    if (!rail || !el || rail.scrollWidth <= rail.clientWidth) return;
    const railBox = rail.getBoundingClientRect();
    const elBox = el.getBoundingClientRect();
    const delta = elBox.left - railBox.left - (railBox.width - elBox.width) / 2;
    rail.scrollTo({ left: rail.scrollLeft + delta, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

  const onKeyDown = (e) => {
    let next = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (active + 1) % TOTAL;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (active - 1 + TOTAL) % TOTAL;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TOTAL - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  // Staggered entrance for the panel's parts. The wrapper is keyed on the
  // slug, so every selection replays it instead of swapping text in place.
  const rise = (delay) =>
    reduced ? undefined : { animation: `fade-in 560ms cubic-bezier(.22,.61,.36,1) ${delay}ms both` };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-7">
      {/* ── Master: the sector rail ───────────────────────────────────────────
          min-w-0 is load-bearing below lg, where the explicit minmax(0,…)
          columns do not apply: a grid item defaults to min-width:auto, so the
          twelve-card row would size the column to its full ~3300px instead of
          scrolling inside it, and drag the panel out of the viewport with it. */}
      <div className="min-w-0">
        <div
          ref={railRef}
          role="tablist"
          aria-label="Industries we serve"
          onKeyDown={onKeyDown}
          /* scroll-pl-6 matches the px-6 bleed: without it snap-mandatory
             aligns the first card to the scrollport edge and swallows the
             rail's left padding, so the list starts flush to the screen. */
          className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-pl-6 -mx-6 px-6 pb-3 lg:mx-0 lg:px-0 lg:pb-0 lg:flex-col lg:gap-2.5 lg:overflow-visible lg:snap-none lg:scroll-pl-0"
        >
          {INDUSTRY_INTELLIGENCE.map((sector, i) => {
            const on = i === active;
            return (
              <button
                key={sector.slug}
                ref={setTab(i)}
                type="button"
                role="tab"
                id={`sector-tab-${sector.slug}`}
                aria-selected={on}
                aria-controls="sector-panel"
                tabIndex={on ? 0 : -1}
                data-idx={i}
                onClick={() => setActive(i)}
                className="group snap-start shrink-0 w-[16.5rem] lg:w-full flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ease-brand lg:hover:translate-x-1"
                style={{
                  borderColor: on ? `${sector.accent}80` : 'rgba(255,255,255,.06)',
                  background: on
                    ? `linear-gradient(100deg, ${sector.accent}24, rgba(12,10,26,.92) 65%)`
                    : 'rgba(12,10,26,.88)',
                }}
              >
                {/* icon tile */}
                <span
                  aria-hidden="true"
                  className="grid place-items-center w-10 h-10 shrink-0 rounded-xl border transition-all duration-300 ease-brand"
                  style={{
                    color: sector.accent,
                    borderColor: `${sector.accent}${on ? '55' : '2e'}`,
                    background: `${sector.accent}${on ? '26' : '12'}`,
                  }}
                >
                  <IndustryIcon name={sector.icon} className="w-[1.15rem] h-[1.15rem]" />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className="block text-fluid-sm leading-snug transition-colors duration-300 group-hover:text-white"
                    style={{ color: on ? '#FFFFFF' : '#E2E8F0', fontWeight: on ? 700 : 600 }}
                  >
                    {sector.title}
                  </span>
                  <span className="mt-0.5 block truncate text-fluid-xs text-white/45">
                    {sector.tagline}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="shrink-0 transition-all duration-300 ease-brand group-hover:translate-x-0.5"
                  style={{ color: on ? sector.accent : 'rgba(255,255,255,.28)' }}
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-fluid-xs text-white/35 lg:hidden">Swipe to browse the twelve sectors →</p>
      </div>

      {/* ── Detail: the intelligence panel ────────────────────────────────── */}
      <div
        role="tabpanel"
        id="sector-panel"
        aria-labelledby={`sector-tab-${item.slug}`}
        tabIndex={0}
        /* Sticky and self-start, not stretched: twelve sectors make the rail
           taller than any single record, so the panel follows the scroll
           instead of growing a half-page of dead space beneath its content.
           The background is near-opaque — the site's particle field sits
           behind every page and reads as noise through a translucent panel. */
        className="relative min-w-0 overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0B0A18]/95 p-5 sm:p-7 lg:p-8 lg:sticky lg:top-28 lg:self-start lg:min-h-[32rem]"
      >
        <div key={item.slug} className="relative">
          {/* header: identity on the left, the headline number on the right */}
          <div className="flex flex-wrap items-start justify-between gap-4" style={rise(0)}>
            <div className="flex items-start gap-4 min-w-0">
              <span
                aria-hidden="true"
                className="grid place-items-center w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl border"
                style={{
                  color: accent,
                  borderColor: `${accent}55`,
                  background: `${accent}1f`,
                }}
              >
                <IndustryIcon name={item.icon} className="w-6 h-6 sm:w-7 sm:h-7" />
              </span>
              <div className="min-w-0">
                <h3 className="text-fluid-xl font-bold tracking-tight leading-[1.15]">{item.title}</h3>
                <p className="mt-1.5 text-fluid-sm font-medium" style={{ color: accent }}>
                  {item.tagline}
                </p>
              </div>
            </div>

            <p className="shrink-0 max-w-[13.5rem] rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-2.5 font-mono text-fluid-xs leading-snug text-emerald-300">
              <span className="font-bold">{item.metric.value}</span> {item.metric.label}
            </p>
          </div>

          {/* what we build here */}
          <p className="mt-7 max-w-2xl text-fluid-sm leading-relaxed text-brand-muted" style={rise(80)}>
            {item.summary}
          </p>

          {/* outcomes */}
          <p
            className="mt-8 font-mono text-fluid-xs uppercase tracking-[0.26em] text-white/40"
            style={rise(140)}
          >
            Operational impact &amp; outcomes
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {item.outcomes.map((outcome, i) => (
              <li
                key={outcome}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3"
                style={rise(180 + i * 60)}
              >
                <span aria-hidden="true" className="shrink-0" style={{ color: accent }}>
                  <CheckCircleIcon />
                </span>
                <span className="text-fluid-xs leading-snug text-slate-200">{outcome}</span>
              </li>
            ))}
          </ul>

          {/* the delivery promise */}
          <p
            className="mt-4 flex items-start gap-3 rounded-xl border px-4 py-3.5 text-fluid-xs leading-relaxed text-slate-200"
            style={{ borderColor: `${accent}26`, background: `${accent}0a`, ...rise(440) }}
          >
            <span aria-hidden="true" className="mt-px shrink-0" style={{ color: accent }}>
              <ShieldIcon />
            </span>
            <span>
              <span className="font-semibold text-white">Architectural Guarantee: </span>
              {item.guarantee}
            </span>
          </p>

          {/* stack + the two ways forward */}
          <div
            className="mt-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"
            style={rise(500)}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-fluid-xs uppercase tracking-[0.18em] text-white/35">Stack:</span>
              {item.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-fluid-xs text-white/65"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/work"

                className="inline-flex items-center min-h-[44px] rounded-xl border border-white/10 bg-white/[0.03] px-5 text-fluid-xs font-semibold text-brand-muted transition-colors duration-300 hover:bg-white/[0.07] hover:text-white"
              >
                See Related Work
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 min-h-[44px] rounded-xl px-5 text-fluid-xs font-bold text-white transition-all duration-300 hover:brightness-110"
                style={{
                  background: '#22D3EE',
                }}
              >
                Build This Solution
                <span className="transition-transform duration-300 ease-brand group-hover:translate-x-0.5">
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
