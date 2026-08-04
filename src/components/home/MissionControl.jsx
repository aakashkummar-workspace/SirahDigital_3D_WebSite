"use client";
import React, { useId, useState } from 'react';
import Link from 'next/link';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import useInView from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { PRODUCTION_PROJECTS, DEVELOPMENT_PROJECTS } from '@/data/projects';
import { ArrowRightIcon } from '@/components/ui/icons';

/*
 * SECTION 3 — Live Systems
 *
 * A mission-control view: one AI core with the real production systems and
 * R&D builds wired to it, data running down the connections.
 *
 * Node labels and detail text are the existing project records — client,
 * stack, impact, phase and description are used as they are.
 *
 * Desktop lays the systems out radially around the core. Mobile drops to a
 * tap-to-expand list threaded on a vertical bus — the radial arrangement is
 * unreadable at phone width, so it is not simply scaled down.
 */

const LIVE = '#22D3EE';    // Highlight — running in production
const BUILD = '#A855F7';   // Secondary Accent — in development
const CORE = '#6366F1';    // Primary Accent — the core itself

const SYSTEMS = [
  ...PRODUCTION_PROJECTS.map((p) => ({
    slug: p.slug,
    label: p.client,
    title: p.title,
    tech: p.client,
    outcome: p.impact,
    desc: p.desc,
    status: 'Live',
    color: LIVE,
  })),
  ...DEVELOPMENT_PROJECTS.map((p) => ({
    slug: p.slug,
    label: p.stack,
    title: p.title,
    tech: p.stack,
    outcome: p.phase,
    desc: p.desc,
    status: 'In build',
    color: BUILD,
  })),
];

// Radial positions on a 900x620 stage, laid out by hand so the labels never
// collide. Three systems left, two right.
//
// The x values are held well inside the stage because each node's label
// extends outward from it — the longest ("Logistics & Supply Chain") needs
// roughly 195 viewBox units of run-off, so anything nearer the edge than that
// gets its label clipped by the page's overflow guard.
const LAYOUT = [
  { x: 258, y: 118, anchor: 'end' },
  { x: 214, y: 330, anchor: 'end' },
  { x: 272, y: 542, anchor: 'end' },
  { x: 648, y: 176, anchor: 'start' },
  { x: 662, y: 452, anchor: 'start' },
];

const CX = 450;
const CY = 310;

function Detail({ system }) {
  return (
    <div className="min-h-[132px]">
      <p className="text-fluid-xs font-mono uppercase tracking-[0.3em]" style={{ color: system.color }}>
        {system.status} · {system.tech}
      </p>
      <p className="mt-3 text-fluid-lg font-bold text-white">{system.title}</p>
      <p className="mt-2 text-fluid-sm font-semibold" style={{ color: system.color }}>{system.outcome}</p>
      <p className="mt-3 text-fluid-sm leading-relaxed text-brand-muted max-w-xl">{system.desc}</p>
    </div>
  );
}

export default function MissionControl() {
  const [ref, inView] = useInView({ threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(0);
  const uid = useId().replace(/:/g, '');
  const active = inView || reduced;
  const current = SYSTEMS[selected];

  return (
    <section ref={ref} aria-labelledby="live-title" className="relative max-w-6xl mx-auto px-6 py-28 md:py-36">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="relative grid place-items-center w-2.5 h-2.5">
            <span className="relative w-2 h-2 rounded-full" style={{ background: LIVE }} />
          </span>
          <p className="text-fluid-xs uppercase tracking-[0.35em] font-semibold text-brand-cyan">Mission control</p>
        </div>
        <AnimatedHeading id="live-title" text="Live Systems" className="mt-5 text-fluid-2xl font-bold tracking-tight" />
        <p className="mt-6 text-fluid-base leading-relaxed text-brand-muted">
          Enterprise production systems currently running, alongside ongoing digital R&amp;D.
        </p>
      </div>

      {/* ================= Desktop: radial mission control =================
          One aspect-ratio box holds the SVG stage and the interactive nodes
          in the same coordinate space, so the buttons land exactly on the
          ends of the connection lines at any width. */}
      <div className="hidden lg:block mt-20">
      <div className="relative w-full" style={{ aspectRatio: '900 / 620' }}>
        <svg viewBox="0 0 900 620" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id={`${uid}-core`}>
              <stop offset="0%" stopColor={CORE} stopOpacity="0.85" />
              <stop offset="70%" stopColor={CORE} stopOpacity="0.12" />
              <stop offset="100%" stopColor={CORE} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* core aura + rails — sized to sit inside the ring of nodes */}
          {[88, 128, 168].map((r, i) => (
            <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="white" strokeOpacity={0.07 - i * 0.015} />
          ))}

          {/* connections, with data travelling out to each system */}
          {SYSTEMS.map((s, i) => {
            const p = LAYOUT[i];
            const d = `M${CX} ${CY} Q ${(CX + p.x) / 2} ${(CY + p.y) / 2 + (p.y < CY ? -50 : 50)} ${p.x} ${p.y}`;
            const on = selected === i;
            return (
              <g key={s.slug}>
                <path d={d} fill="none" stroke="white" strokeOpacity={on ? 0.28 : 0.12} strokeWidth="1.5" style={{ transition: 'stroke-opacity 400ms' }} />
                <path
                  d={d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={on ? 2.5 : 1.8}
                  strokeLinecap="round"
                  strokeDasharray="12 190"
                  style={{
                    animation: active && !reduced ? `flow ${2.8 + i * 0.45}s linear ${i * 0.35}s infinite` : undefined,
                    opacity: active ? 1 : 0,
                    transition: 'opacity 900ms ease, stroke-width 300ms ease',
                  }}
                />
              </g>
            );
          })}

          {/* the core */}
          <circle cx={CX} cy={CY} r="62" fill={CORE} fillOpacity="0.1" />
          <circle cx={CX} cy={CY} r="42" fill={CORE} fillOpacity="0.22" stroke={CORE} strokeOpacity="0.55" />
          <text x={CX} y={CY - 4} textAnchor="middle" className="fill-white font-bold" style={{ fontSize: 17 }}>AI</text>
          <text x={CX} y={CY + 16} textAnchor="middle" className="fill-white/60" style={{ fontSize: 12, letterSpacing: 2 }}>CORE</text>
        </svg>

        {/* System nodes as real buttons, positioned over the stage.
            Buttons rather than SVG shapes so they are focusable, reachable by
            keyboard and announced without extra ARIA plumbing. */}
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          {SYSTEMS.map((s, i) => {
            const p = LAYOUT[i];
            const on = selected === i;
            return (
              <button
                key={s.slug}
                type="button"
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
                aria-pressed={on}
                className="absolute flex items-center gap-3 rounded-full px-3 py-2 min-h-[44px] transition-opacity duration-500 ease-brand"
                style={{
                  left: `${(p.x / 900) * 100}%`,
                  top: `${(p.y / 620) * 100}%`,
                  transform: `translate(${p.anchor === 'end' ? '-100%' : '0'}, -50%)`,
                  flexDirection: p.anchor === 'end' ? 'row-reverse' : 'row',
                  pointerEvents: 'auto',
                  opacity: active ? 1 : 0,
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                <span className="relative grid place-items-center shrink-0" style={{ width: 26, height: 26 }}>
                  <span
                    className="absolute inset-0 rounded-full transition-opacity duration-300"
                    style={{ background: s.color, opacity: on ? 0.14 : 0 }}
                  />
                  <span
                    className="relative rounded-full transition-all duration-300"
                    style={{
                      width: on ? 16 : 11,
                      height: on ? 16 : 11,
                      background: s.color,
                    }}
                  />
                </span>
                <span
                  className="text-fluid-sm font-semibold whitespace-nowrap transition-colors duration-300"
                  style={{ color: on ? '#FFFFFF' : '#CBD5E1' }}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

        {/* Read-out for the selected system */}
        <div className="mt-10 max-w-3xl" aria-live="polite">
          <Detail system={current} />
        </div>
      </div>

      {/* ================= Mobile / tablet: tap-to-expand bus ============== */}
      <ul className="lg:hidden mt-14 relative">
        {/* vertical bus the systems hang off */}
        <span aria-hidden="true" className="absolute left-[13px] top-3 bottom-3 w-px bg-white/10" />
        <span
          aria-hidden="true"
          className="absolute left-[13px] top-3 bottom-3 w-px"
          style={{
            background: `linear-gradient(180deg, ${CORE}, ${LIVE} 60%, ${BUILD})`,
            opacity: active ? 0.85 : 0,
            transition: 'opacity 1s ease',
          }}
        />

        <li className="relative flex items-center gap-4 pb-8">
          <span className="relative grid place-items-center w-[27px] h-[27px] shrink-0">
            <span className="absolute inset-0 rounded-full blur-md" style={{ background: CORE, opacity: 0.6 }} />
            <span className="relative w-4 h-4 rounded-full" style={{ background: CORE }} />
          </span>
          <span className="text-fluid-sm font-mono uppercase tracking-[0.3em] text-white/70">AI Core</span>
        </li>

        {SYSTEMS.map((s, i) => {
          const on = selected === i;
          return (
            <li key={s.slug} className="relative">
              <button
                type="button"
                onClick={() => setSelected(on ? -1 : i)}
                aria-expanded={on}
                aria-controls={`${uid}-panel-${i}`}
                className="w-full flex items-center gap-4 py-3 min-h-[44px] text-left"
              >
                <span className="relative grid place-items-center w-[27px] h-[27px] shrink-0">
                  <span
                    className="absolute inset-0 rounded-full blur-md transition-opacity duration-300"
                    style={{ background: s.color, opacity: on ? 0.7 : 0.28 }}
                  />
                  <span
                    className="relative rounded-full transition-all duration-300"
                    style={{ width: on ? 15 : 11, height: on ? 15 : 11, background: s.color }}
                  />
                </span>
                <span className="flex-1 text-fluid-base font-semibold" style={{ color: on ? '#FFFFFF' : '#CBD5E1' }}>
                  {s.label}
                </span>
                <span
                  className="text-fluid-xs font-mono uppercase tracking-widest shrink-0"
                  style={{ color: s.color }}
                >
                  {s.status}
                </span>
              </button>

              <div
                id={`${uid}-panel-${i}`}
                className="overflow-hidden transition-all duration-500 ease-brand"
                style={{ maxHeight: on ? 420 : 0, opacity: on ? 1 : 0 }}
              >
                <div className="pl-[43px] pb-8 pt-1">
                  <Detail system={s} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-14 flex justify-center lg:justify-start">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 min-h-[44px] px-7 py-3 rounded-full font-medium text-brand-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          See the full deployment hub
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
