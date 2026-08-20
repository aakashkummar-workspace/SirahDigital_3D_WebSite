"use client";
import React from 'react';

/*
 * The visualization is ONE object with many configurations — not seven
 * illustrations taking turns.
 *
 * This module holds the target geometry for each capability. Nothing here
 * renders on its own: VisualizationContainer keeps a single persistent core,
 * a single set of eight nodes, eight spokes and eight mesh links permanently
 * mounted, and interpolates them toward whichever target is active. Nodes fly
 * to new positions, rings expand and contract, links fade in and out — the
 * object is never destroyed and rebuilt.
 *
 * Because every state declares exactly NODE_COUNT nodes, node 3 in the AI core
 * is the same DOM element as node 3 in the analytics sphere. That identity is
 * what makes the transition a morph rather than a swap. States needing fewer
 * points park the surplus at low alpha rather than removing them.
 */

export const NODE_COUNT = 8;
export const VIEW = 400;
const C = VIEW / 2;

const INDIGO = 'rgb(var(--c-indigo))';
const PURPLE = 'rgb(var(--c-purple))';
const CYAN = 'rgb(var(--c-cyan))';

// Place a node on an ellipse around the centre. Deterministic — no random.
const onRing = (i, count, rx, ry = rx, phaseDeg = -90) => {
  const a = ((phaseDeg + (i / count) * 360) * Math.PI) / 180;
  return { x: C + Math.cos(a) * rx, y: C + Math.sin(a) * ry };
};

const node = (pos, r, a = 1, color = CYAN) => ({ ...pos, r, a, color });

/* ── 01 Neural AI Core ──────────────────────────────────────────────────
   Three concentric orbits around a dense core. The resting configuration. */
const aiCore = {
  accent: CYAN,
  core: { r: 46, a: 1 },
  rings: [78, 120, 160],
  ringAlpha: 1,
  spokes: 0.35,
  mesh: 0,
  detail: 'none',
  nodes: [
    ...[0, 1, 2].map((i) => node(onRing(i, 3, 78), 7, 1, CYAN)),
    ...[0, 1, 2].map((i) => node(onRing(i, 3, 120, 120, 30), 6, 1, CYAN)),
    ...[0, 1].map((i) => node(onRing(i, 2, 160, 160, 60), 5, 1, CYAN)),
  ],
};

/* ── 02 Communication Network ───────────────────────────────────────────
   The core throws messages outward; three points collapse inward to sit
   under the waveform. */
const communicationHub = {
  accent: CYAN,
  core: { r: 44, a: 1 },
  rings: [96, 138, 138],
  ringAlpha: 0.6,
  spokes: 1,
  mesh: 0,
  detail: 'waveform',
  nodes: [
    ...[0, 1, 2, 3, 4].map((i) => node(onRing(i, 5, 140, 126), 9, 1, CYAN)),
    ...[0, 1, 2].map((i) => node({ x: 168 + i * 32, y: 292 }, 4, 0.55, CYAN)),
  ],
};

/* ── 03 Automation Engine ───────────────────────────────────────────────
   The ring collapses and the nodes fan out into a left-to-right pipeline. */
const workflowEngine = {
  accent: CYAN,
  core: { r: 20, a: 0.5 },
  rings: [150, 150, 150],
  ringAlpha: 0.12,
  spokes: 0.25,
  mesh: 1,
  detail: 'none',
  nodes: [
    node({ x: 66, y: 200 }, 11, 1, CYAN),
    node({ x: 138, y: 126 }, 8, 1, CYAN),
    node({ x: 138, y: 274 }, 8, 1, CYAN),
    node({ x: 214, y: 200 }, 10, 1, CYAN),
    node({ x: 290, y: 132 }, 7, 1, CYAN),
    node({ x: 290, y: 268 }, 7, 1, CYAN),
    node({ x: 348, y: 168 }, 5, 0.9, CYAN),
    node({ x: 348, y: 232 }, 5, 0.9, CYAN),
  ],
};

/* ── 04 Enterprise Dashboard ────────────────────────────────────────────
   Nodes settle onto a trend line and the panel corners. */
const enterpriseDashboard = {
  accent: CYAN,
  core: { r: 14, a: 0.28 },
  rings: [170, 170, 170],
  ringAlpha: 0.08,
  spokes: 0,
  mesh: 0.5,
  detail: 'dashboard',
  nodes: [
    node({ x: 108, y: 264 }, 6, 1, CYAN),
    node({ x: 156, y: 226 }, 6, 1, CYAN),
    node({ x: 204, y: 238 }, 6, 1, CYAN),
    node({ x: 252, y: 190 }, 6, 1, CYAN),
    node({ x: 300, y: 152 }, 8, 1, CYAN),
    node({ x: 108, y: 132 }, 4, 0.35, CYAN),
    node({ x: 300, y: 132 }, 4, 0.35, CYAN),
    node({ x: 204, y: 132 }, 4, 0.25, CYAN),
  ],
};

/* ── 05 Enterprise Database ─────────────────────────────────────────────
   A hexagonal mesh: every record connected to every neighbour. */
const businessNetwork = {
  accent: CYAN,
  core: { r: 34, a: 0.9 },
  rings: [124, 124, 66],
  ringAlpha: 0.4,
  spokes: 0.8,
  mesh: 1,
  detail: 'none',
  nodes: [
    ...[0, 1, 2, 3, 4, 5].map((i) => node(onRing(i, 6, 126), 9, 1, CYAN)),
    ...[0, 1].map((i) => node(onRing(i, 2, 62, 62, 45), 5, 0.8, CYAN)),
  ],
};

/* ── 06 Document Intelligence ───────────────────────────────────────────
   Nodes line up as fields down a page, then extracted values to the right. */
const documentScanner = {
  accent: CYAN,
  core: { r: 12, a: 0.2 },
  rings: [180, 180, 180],
  ringAlpha: 0.06,
  spokes: 0,
  mesh: 0,
  detail: 'document',
  nodes: [
    ...[0, 1, 2, 3, 4].map((i) => node({ x: 142, y: 132 + i * 38 }, 4.5, 0.9, CYAN)),
    ...[0, 1, 2].map((i) => node({ x: 282, y: 152 + i * 74 }, 7, 1, CYAN)),
  ],
};

/* ── 07 Analytics Sphere ────────────────────────────────────────────────
   Everything returns to a ring — data points distributed over a globe. */
const analyticsSphere = {
  accent: CYAN,
  core: { r: 54, a: 0.75 },
  rings: [124, 124, 124],
  ringAlpha: 0.85,
  spokes: 0.5,
  mesh: 0.35,
  detail: 'sphere',
  nodes: [...Array(NODE_COUNT)].map((_, i) =>
    node(onRing(i, NODE_COUNT, 124), i % 2 ? 6 : 8, 1, CYAN)
  ),
};

export const STATES = {
  'ai-core': aiCore,
  'communication-hub': communicationHub,
  'workflow-engine': workflowEngine,
  'enterprise-dashboard': enterpriseDashboard,
  'business-network': businessNetwork,
  'document-scanner': documentScanner,
  'analytics-sphere': analyticsSphere,
};

export const STATE_ACCENT = Object.fromEntries(
  Object.entries(STATES).map(([k, v]) => [k, v.accent])
);

/* ──────────────────────────────────────────────────────────────────────
 * Detail overlays.
 *
 * These are the parts that genuinely cannot morph — a waveform is not a
 * document. They cross-fade over the morphing skeleton, which carries the
 * continuity, so the switch never reads as the whole picture being replaced.
 * ────────────────────────────────────────────────────────────────────── */

export function DetailLayer({ kind, accent, run, idBase }) {
  if (kind === 'waveform') {
    const bars = [0.42, 0.7, 1, 0.56, 0.88, 0.64, 0.96, 0.48, 0.76];
    return (
      <g>
        {bars.map((h, i) => {
          const x = 156 + i * 11;
          return (
            <rect
              key={i} x={x} y={200 - 34} width="5" rx="2.5" height="68"
              style={{
                fill: accent,
                transformOrigin: `${x + 2.5}px 200px`,
                transform: `scaleY(${run ? h : h * 0.45})`,
                animation: run ? `wave ${1 + (i % 4) * 0.22}s ease-in-out ${i * 60}ms infinite` : undefined,
                transition: 'transform 600ms cubic-bezier(.22,.61,.36,1)',
              }}
            />
          );
        })}
      </g>
    );
  }

  if (kind === 'dashboard') {
    return (
      <g>
        <rect x="92" y="112" width="216" height="180" rx="10" fill="none" strokeOpacity="0.22" strokeWidth="1.6" style={{ stroke: accent }} />
        <path d="M108 264 L156 226 L204 238 L252 190 L300 152" fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" style={{ strokeDasharray: 1, strokeDashoffset: run ? 0 : 1, transition: 'stroke-dashoffset 1500ms cubic-bezier(.22,.61,.36,1)', stroke: accent }} />
        <path d="M108 264 L156 226 L204 238 L252 190 L300 152 L300 292 L108 292 Z" fillOpacity={run ? 0.14 : 0} style={{ transition: 'fill-opacity 1100ms ease 400ms', fill: accent }} />
        {[0.4, 0.62, 0.5, 0.78, 0.66].map((h, i) => (
          <rect
            key={i} x={110 + i * 40} y={292 - h * 40} width="18" rx="3"
            height={run ? h * 40 : 3} fillOpacity="0.4"
            style={{ fill: CYAN, transition: `height 850ms cubic-bezier(.22,.61,.36,1) ${300 + i * 80}ms, y 850ms cubic-bezier(.22,.61,.36,1) ${300 + i * 80}ms` }}
          />
        ))}
      </g>
    );
  }

  if (kind === 'document') {
    return (
      <g>
        <rect x="112" y="104" width="122" height="196" rx="9" fillOpacity="0.07" strokeOpacity="0.14" strokeWidth="1.6" style={{ fill: INDIGO, stroke: "rgb(var(--c-text))" }} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x="156" y={128 + i * 38} width={i % 2 ? 54 : 66} height="6" rx="3" fillOpacity="0.2" style={{ fill: "rgb(var(--c-text))" }} />
        ))}
        {run && (
          <g>
            <rect x="112" y="104" width="122" height="2.6" style={{ fill: accent }}>
              <animate attributeName="y" values="108;296;108" dur="4.2s" repeatCount="indefinite" />
            </rect>
            <rect x="112" y="104" width="122" height="30" fillOpacity="0.13" style={{ fill: accent }}>
              <animate attributeName="y" values="108;296;108" dur="4.2s" repeatCount="indefinite" />
            </rect>
          </g>
        )}
      </g>
    );
  }

  if (kind === 'sphere') {
    return (
      <g>
        {[-82, -42, 0, 42, 82].map((dy) => (
          <ellipse key={dy} cx={C} cy={C + dy} rx={Math.sqrt(Math.max(0, 124 * 124 - dy * dy))} ry="15" fill="none" strokeOpacity="0.2" strokeWidth="1.6" style={{ stroke: accent }} />
        ))}
        <g style={{ transformOrigin: `${C}px ${C}px` }}>
          {run && <animateTransform attributeName="transform" type="rotate" from={`0 ${C} ${C}`} to={`360 ${C} ${C}`} dur="30s" repeatCount="indefinite" />}
          {[30, 62].map((rx) => (
            <ellipse key={rx} cx={C} cy={C} rx={rx} ry="124" fill="none" strokeOpacity="0.16" strokeWidth="1.6" style={{ stroke: accent }} />
          ))}
        </g>
      </g>
    );
  }

  return null;
}
