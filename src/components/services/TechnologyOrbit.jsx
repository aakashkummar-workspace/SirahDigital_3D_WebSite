"use client";
import React, { useId } from 'react';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import useInView from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { TECHNOLOGIES } from '@/data/serviceExperience';

/**
 * The technology ecosystem: Sirah Digital at the centre, the stack around it,
 * everything joined by animated connection lines.
 *
 * No cards, and no logos boxed in tiles — each technology is a lit node and
 * its name, nothing more.
 *
 * Positions are computed once from fixed angles rather than animated, so this
 * whole section costs a single SVG paint. Movement comes from the data
 * running along the connections, which is a CSS animation on stroke-dashoffset
 * and therefore free of layout work.
 */

const CX = 400;
const CY = 300;
// Each node's label runs outward from it, and the longest ("WhatsApp") needs
// roughly 90 viewBox units of clearance. RX is held well inside the 800-unit
// stage so no label is cut off by the page's overflow guard.
const RX = 236;   // horizontal orbit radius
const RY = 178;   // vertical — an ellipse reads as depth rather than a flat ring

const NODES = TECHNOLOGIES.map((tech, i) => {
  // Start at the top and step evenly around the ellipse.
  const angle = (i / TECHNOLOGIES.length) * Math.PI * 2 - Math.PI / 2;
  return {
    ...tech,
    x: CX + Math.cos(angle) * RX,
    y: CY + Math.sin(angle) * RY,
    // Labels on the left half read outward to the left.
    anchor: Math.cos(angle) < -0.25 ? 'end' : Math.cos(angle) > 0.25 ? 'start' : 'middle',
  };
});

export default function TechnologyOrbit() {
  const [ref, inView] = useInView({ threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const run = inView && !reduced;
  const shown = inView || reduced;

  return (
    <section
      ref={ref}
      aria-labelledby="ecosystem-title"
      className="relative max-w-6xl mx-auto px-6 py-28 md:py-36"
    >
      <div className="max-w-2xl">
        <p className="text-fluid-xs uppercase tracking-[0.35em] font-semibold text-brand-cyan">
          Technology ecosystem
        </p>
        <AnimatedHeading
          id="ecosystem-title"
          text="Built on the stack the work actually needs."
          className="mt-5 text-fluid-2xl font-bold tracking-tight"
        />
      </div>

      {/* ── Tablet and desktop: the orbit ───────────────────────────────── */}
      <div className="hidden sm:block relative mt-16 w-full" style={{ aspectRatio: '800 / 600' }}>
        <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <radialGradient id={`${uid}-core`}>
              <stop offset="0%" stopOpacity="0.7" style={{ stopColor: "rgb(var(--c-indigo))" }} />
              <stop offset="70%" stopOpacity="0.1" style={{ stopColor: "rgb(var(--c-indigo))" }} />
              <stop offset="100%" stopOpacity="0" style={{ stopColor: "rgb(var(--c-indigo))" }} />
            </radialGradient>
          </defs>

          <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" strokeOpacity="0.07" style={{ stroke: 'rgb(var(--c-ink))' }} />
          <ellipse cx={CX} cy={CY} rx={RX * 0.62} ry={RY * 0.62} fill="none" strokeOpacity="0.05" style={{ stroke: 'rgb(var(--c-ink))' }} />

          {/* spokes from the centre, each carrying a travelling pulse */}
          {NODES.map((n, i) => (
            <g key={n.name}>
              <line x1={CX} y1={CY} x2={n.x} y2={n.y} strokeOpacity="0.11" strokeWidth="1" style={{ stroke: 'rgb(var(--c-ink))' }} />
              <line
                x1={CX} y1={CY} x2={n.x} y2={n.y}
                strokeWidth="2" strokeLinecap="round" strokeDasharray="10 150"
                style={{
                  stroke: n.accent,
                  animation: run ? `flow ${3 + i * 0.3}s linear ${i * 0.22}s infinite` : undefined,
                  opacity: shown ? 1 : 0,
                  transition: 'opacity 900ms ease',
                }}
              />
            </g>
          ))}

          {/* ring links, so the stack reads as connected to itself too */}
          {NODES.map((n, i) => {
            const next = NODES[(i + 1) % NODES.length];
            return (
              <line
                key={`ring-${n.name}`}
                x1={n.x} y1={n.y} x2={next.x} y2={next.y}
                strokeOpacity="0.07" strokeWidth="1" style={{ stroke: 'rgb(var(--c-ink))' }}
                style={{ opacity: shown ? 1 : 0, transition: `opacity 900ms ease ${i * 60}ms` }}
              />
            );
          })}

          {/* nodes */}
          {NODES.map((n, i) => (
            <g key={`node-${n.name}`} style={{ opacity: shown ? 1 : 0, transition: `opacity 700ms ease ${200 + i * 70}ms` }}>
              <circle cx={n.x} cy={n.y} r="26" fillOpacity="0.1" style={{ fill: n.accent }} />
              <circle cx={n.x} cy={n.y} r="9" style={{ fill: n.accent }}>
                {run && <animate attributeName="r" values="9;11.5;9" dur={`${2.4 + i * 0.25}s`} repeatCount="indefinite" />}
              </circle>
              <text
                x={n.anchor === 'end' ? n.x - 24 : n.anchor === 'start' ? n.x + 24 : n.x}
                y={n.anchor === 'middle' ? (n.y < CY ? n.y - 30 : n.y + 38) : n.y + 6}
                textAnchor={n.anchor}
                className="fill-ink font-semibold"
                style={{ fontSize: 19 }}
              >
                {n.name}
              </text>
            </g>
          ))}

          {/* centre */}
          <circle cx={CX} cy={CY} r="62" fillOpacity="0.14" strokeOpacity="0.45" style={{ fill: "rgb(var(--c-indigo))", stroke: "rgb(var(--c-indigo))" }} />
          <text x={CX} y={CY - 4} textAnchor="middle" className="fill-ink font-extrabold" style={{ fontSize: 21 }}>SIRAH</text>
          <text x={CX} y={CY + 20} textAnchor="middle" className="font-extrabold" style={{ fontSize: 21, fill: 'rgb(var(--c-purple))' }}>DIGITAL</text>
        </svg>
      </div>

      {/* ── Mobile: the same relationship as a threaded list ────────────── */}
      <div className="sm:hidden mt-14 relative">
        <span aria-hidden="true" className="absolute left-[7px] top-4 bottom-4 w-px bg-ink/10" />
        <span
          aria-hidden="true"
          className="absolute left-[7px] top-4 bottom-4 w-px"
          style={{
            background: 'rgb(var(--c-cyan))',
            opacity: shown ? 0.8 : 0,
            transition: 'opacity 1s ease',
          }}
        />
        <p className="relative flex items-center gap-4 pb-6">
          <span className="w-[15px] h-[15px] rounded-full shrink-0" style={{ background: 'rgb(var(--c-indigo))' }} />
          <span className="text-fluid-base font-extrabold">
            <span className="text-ink">SIRAH </span>
            <span className="text-brand-purple">DIGITAL</span>
          </span>
        </p>
        <ul className="relative space-y-1">
          {NODES.map((n, i) => (
            <li key={n.name} className="flex items-center gap-4 min-h-[44px]"
              style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateX(-10px)',
                transition: reduced ? 'none' : `opacity 600ms ease ${i * 70}ms, transform 600ms cubic-bezier(.22,.61,.36,1) ${i * 70}ms` }}>
              <span className="w-[15px] h-[15px] rounded-full shrink-0 grid place-items-center">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: n.accent }} />
              </span>
              <span className="text-fluid-sm font-semibold text-brand-muted">{n.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
