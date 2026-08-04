"use client";
import React, { useId } from 'react';
import { STATES, DetailLayer, NODE_COUNT, VIEW } from './VisualizationStates';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/**
 * One capability's media panel — the wide plate that scrolls past the pinned
 * rail, matching the reference layout where each step owns its own panel
 * rather than sharing a single morphing object.
 *
 * This deliberately does NOT reuse VisualizationContainer. That component
 * exists to interpolate one persistent object between states, which is the
 * right tool when a single pinned element has to change shape. Here every
 * panel owns exactly one fixed state, so there is nothing to interpolate:
 * the geometry is read straight out of STATES and rendered as static
 * attributes. Ten rAF loops running down a long page is precisely the cost
 * that buys nothing.
 *
 * `run` is the only moving part. It gates the packet flow, the float and the
 * detail overlay's SMIL, and PinnedExperience passes it true for the active
 * capability only — so at most one panel is ever animating. Opacity and
 * `visibility: hidden` do not stop SMIL; only leaving the node unmounted
 * does, which is what DetailLayer's `run` prop already handles.
 */

const CENTRE = VIEW / 2;

/**
 * Node positions come out of `onRing`, which is trigonometry, and Math.cos /
 * Math.sin are only specified to within an implementation-defined error — the
 * Node build that renders on the server and the V8 in the browser disagree in
 * the last couple of ULP. Rendering the raw float straight into an SVG
 * attribute therefore trips React's hydration check with diffs like
 * `61.43593539448983` vs `61.43593539448986`.
 *
 * VisualizationContainer never hit this because it wrote geometry through
 * setAttribute after mount, already rounded. Here the values are in the
 * server-rendered markup, so they have to be pinned to a fixed precision at
 * the point of emission. Two decimals is well below a device pixel at any
 * panel size.
 */
const f = (v) => Number(v).toFixed(2);

export default function ServicePanel({ state, label, run = false, className = '' }) {
  const reduced = useReducedMotion();
  // Ten panels are mounted at once and DetailLayer emits gradients and
  // animations by id — without a per-instance namespace they collide and the
  // browser resolves every reference to whichever one parsed last.
  const uid = useId().replace(/:/g, '');

  const cfg = STATES[state] || STATES['ai-core'];
  const accent = cfg.accent;
  const alive = run && !reduced;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-space-deep/70 ${className}`}
    >
      {/* The artwork's viewBox is square, so the plate is kept close to square
          too — a wide plate letterboxes it and leaves most of the panel empty.
          5:4 is near enough that the default preserveAspectRatio only trims a
          little off each side, which is also the proportion the reference
          panels use. */}
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className={`w-full aspect-[5/4] ${alive ? 'animate-float-y' : ''}`}
        role="img"
        aria-label={label ? `Diagram of the ${label}` : 'Capability diagram'}
      >
        {/* orbit rails */}
        {cfg.rings.map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx={CENTRE} cy={CENTRE} r={r}
            fill="none" stroke="#FFFFFF" strokeWidth="1.6"
            opacity={(cfg.ringAlpha * (0.5 - i * 0.12)).toFixed(3)}
          />
        ))}

        {/* mesh links between neighbouring nodes */}
        {cfg.mesh > 0 && cfg.nodes.map((n, i) => {
          const m = cfg.nodes[(i + 1) % NODE_COUNT];
          return (
            <line
              key={`mesh-${i}`}
              x1={f(n.x)} y1={f(n.y)} x2={f(m.x)} y2={f(m.y)}
              stroke="#FFFFFF" strokeWidth="1.4"
              opacity={(cfg.mesh * n.a * m.a * 0.55).toFixed(3)}
            />
          );
        })}

        {/* spokes from the core, each carrying a travelling packet */}
        {cfg.spokes > 0 && cfg.nodes.map((n, i) => (
          <g key={`spoke-${i}`}>
            <line
              x1={CENTRE} y1={CENTRE} x2={f(n.x)} y2={f(n.y)}
              stroke={accent} strokeOpacity="0.28" strokeWidth="1.6"
              opacity={(cfg.spokes * n.a).toFixed(3)}
            />
            <line
              x1={CENTRE} y1={CENTRE} x2={f(n.x)} y2={f(n.y)}
              stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="9 120"
              opacity={alive ? (cfg.spokes * n.a).toFixed(3) : 0}
              style={{ animation: alive ? `flow ${2200 + i * 240}ms linear ${i * 160}ms infinite` : undefined }}
            />
          </g>
        ))}

        {/* core */}
        <circle
          cx={CENTRE} cy={CENTRE} r={cfg.core.r}
          fill={accent} fillOpacity="0.3" stroke={accent} strokeOpacity="0.85" strokeWidth="2"
          opacity={cfg.core.a}
        />

        {/* the detail that carries this particular capability */}
        {cfg.detail !== 'none' && (
          <g aria-hidden="true">
            <DetailLayer kind={cfg.detail} accent={accent} run={alive} idBase={`${uid}-${state}`} />
          </g>
        )}

        {/* nodes, on top of everything they connect */}
        {cfg.nodes.map((n, i) => (
          <circle
            key={`node-${i}`}
            cx={f(n.x)} cy={f(n.y)} r={n.r} fill={n.color || accent} opacity={n.a}
          />
        ))}
      </svg>
    </div>
  );
}
