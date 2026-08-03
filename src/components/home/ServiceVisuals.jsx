"use client";
import React from 'react';

/*
 * The four service illustrations, one per chapter.
 *
 * All of them are SVG plus CSS transforms — no extra WebGL contexts. The page
 * already runs one particle canvas; adding four more would cost far more than
 * these are worth, and these stay smooth on a mid-range phone.
 *
 * Each accepts `active` so animation only runs once the chapter is on screen,
 * and `reduced` to fall back to a static composition.
 */

const INDIGO = '#6366F1';
const PURPLE = '#A855F7';
const CYAN = '#22D3EE';

const Defs = ({ id }) => (
  <defs>
    <linearGradient id={`${id}-stroke`} x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stopColor={CYAN} />
      <stop offset="55%" stopColor={INDIGO} />
      <stop offset="100%" stopColor={PURPLE} />
    </linearGradient>
    <radialGradient id={`${id}-glow`}>
      <stop offset="0%" stopColor={INDIGO} stopOpacity="0.55" />
      <stop offset="100%" stopColor={INDIGO} stopOpacity="0" />
    </radialGradient>
  </defs>
);

/* AI Agents & Virtual Employees — a figure drawn as nodes, with satellites
   orbiting it. Reads as a digital human without being literal. */
export function AgentVisual({ active, reduced }) {
  const run = active && !reduced;
  const satellites = [
    { r: 118, dur: 18, size: 7, color: CYAN, from: 0 },
    { r: 148, dur: 26, size: 5, color: PURPLE, from: 120 },
    { r: 92, dur: 14, size: 4, color: INDIGO, from: 240 },
  ];

  return (
    <svg viewBox="0 0 360 360" className="w-full h-auto" role="img" aria-label="An abstract digital figure surrounded by orbiting data points">
      <Defs id="agent" />
      <circle cx="180" cy="180" r="150" fill="url(#agent-glow)" opacity={run ? 0.9 : 0.4} />

      {/* orbit rails */}
      {satellites.map((s, i) => (
        <circle key={i} cx="180" cy="180" r={s.r} fill="none" stroke="white" strokeOpacity="0.07" />
      ))}

      {/* figure: head, shoulders, spine — built from strokes and nodes */}
      <g className={run ? 'animate-float-y' : undefined} style={{ transformOrigin: '180px 180px' }}>
        <circle cx="180" cy="128" r="34" fill="none" stroke="url(#agent-stroke)" strokeWidth="2" />
        <circle cx="180" cy="128" r="34" fill={INDIGO} fillOpacity="0.09" />
        <path d="M128 246c8-34 26-52 52-52s44 18 52 52" fill="none" stroke="url(#agent-stroke)" strokeWidth="2" strokeLinecap="round" />
        <path d="M180 162v32" stroke="url(#agent-stroke)" strokeWidth="2" strokeLinecap="round" />

        {/* facial / neural nodes */}
        {[[168, 120], [192, 120], [180, 140], [162, 134], [198, 134]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill={CYAN}>
            {run && <animate attributeName="opacity" values="0.35;1;0.35" dur={`${2 + i * 0.35}s`} repeatCount="indefinite" />}
          </circle>
        ))}
        <path d="M168 120L180 140L192 120M162 134L180 140L198 134" fill="none" stroke={CYAN} strokeOpacity="0.4" strokeWidth="1" />
      </g>

      {/* orbiting satellites */}
      {satellites.map((s, i) => (
        <g key={i} style={{ transformOrigin: '180px 180px' }}>
          {run && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`${s.from} 180 180`}
              to={`${s.from + 360} 180 180`}
              dur={`${s.dur}s`}
              repeatCount="indefinite"
            />
          )}
          <circle cx={180 + s.r} cy="180" r={s.size} fill={s.color} />
          <circle cx={180 + s.r} cy="180" r={s.size * 2.6} fill={s.color} fillOpacity="0.16" />
        </g>
      ))}
    </svg>
  );
}

/* AI Chatbots & Voice Assistants — a live waveform. */
export function ChatbotVisual({ active, reduced }) {
  const run = active && !reduced;
  const bars = [0.35, 0.62, 0.9, 0.5, 0.75, 1, 0.55, 0.85, 0.4, 0.7, 0.95, 0.45, 0.8, 0.6, 0.3];

  return (
    <svg viewBox="0 0 360 360" className="w-full h-auto" role="img" aria-label="An animated voice waveform between two conversation markers">
      <Defs id="bot" />
      <circle cx="180" cy="180" r="140" fill="url(#bot-glow)" opacity={run ? 0.85 : 0.35} />

      {/* listening rings */}
      <circle cx="180" cy="180" r="128" fill="none" stroke="white" strokeOpacity="0.07" />
      <circle cx="180" cy="180" r="96" fill="none" stroke="white" strokeOpacity="0.05" />

      {/* waveform */}
      <g>
        {bars.map((h, i) => {
          const x = 76 + i * 15;
          const full = 150;
          return (
            <rect
              key={i}
              x={x}
              y={180 - full / 2}
              width="6"
              rx="3"
              height={full}
              fill="url(#bot-stroke)"
              style={{
                transformOrigin: `${x + 3}px 180px`,
                transform: `scaleY(${run ? h : h * 0.5})`,
                animation: run ? `wave ${1.1 + (i % 4) * 0.22}s ease-in-out ${i * 55}ms infinite` : undefined,
                transition: 'transform 600ms cubic-bezier(.22,.61,.36,1)',
              }}
            />
          );
        })}
      </g>

      {/* conversation markers */}
      <g opacity="0.9">
        <rect x="52" y="86" width="74" height="30" rx="15" fill={INDIGO} fillOpacity="0.16" stroke={INDIGO} strokeOpacity="0.4" />
        <rect x="234" y="252" width="74" height="30" rx="15" fill={CYAN} fillOpacity="0.14" stroke={CYAN} strokeOpacity="0.4" />
        {[68, 82, 96].map((cx, i) => (
          <circle key={i} cx={cx} cy="101" r="3.5" fill={INDIGO}>
            {run && <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" begin={`${i * 0.2}s`} repeatCount="indefinite" />}
          </circle>
        ))}
        {[250, 264, 278].map((cx, i) => (
          <circle key={i} cx={cx} cy="267" r="3.5" fill={CYAN}>
            {run && <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" begin={`${0.6 + i * 0.2}s`} repeatCount="indefinite" />}
          </circle>
        ))}
      </g>
    </svg>
  );
}

/* Workflow & Process Automation — connected nodes with data travelling the
   links between them. */
export function WorkflowVisual({ active, reduced }) {
  const run = active && !reduced;
  const nodes = [
    { x: 60, y: 180, r: 13, c: CYAN },
    { x: 150, y: 92, r: 10, c: INDIGO },
    { x: 150, y: 268, r: 10, c: INDIGO },
    { x: 240, y: 180, r: 11, c: PURPLE },
    { x: 310, y: 104, r: 8, c: CYAN },
    { x: 310, y: 256, r: 8, c: CYAN },
  ];
  const links = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [1, 2]];

  return (
    <svg viewBox="0 0 360 360" className="w-full h-auto" role="img" aria-label="A network of process nodes with data flowing along the connections">
      <Defs id="flow" />
      <circle cx="180" cy="180" r="150" fill="url(#flow-glow)" opacity={run ? 0.8 : 0.3} />

      {links.map(([a, b], i) => {
        const p = `M${nodes[a].x} ${nodes[a].y} Q ${(nodes[a].x + nodes[b].x) / 2} ${(nodes[a].y + nodes[b].y) / 2 - 26} ${nodes[b].x} ${nodes[b].y}`;
        return (
          <g key={i}>
            <path d={p} fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1.5" />
            <path
              d={p}
              fill="none"
              stroke="url(#flow-stroke)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="14 220"
              style={{ animation: run ? `flow ${3.2 + i * 0.4}s linear ${i * 0.3}s infinite` : undefined, opacity: run ? 1 : 0 }}
            />
          </g>
        );
      })}

      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r * 2.4} fill={n.c} fillOpacity="0.12" />
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.c}>
            {run && <animate attributeName="r" values={`${n.r};${n.r * 1.18};${n.r}`} dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" />}
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* Custom Web & Mobile Apps — a dashboard rendered on a tilted plane. */
export function DashboardVisual({ active, reduced }) {
  const run = active && !reduced;
  const bars = [0.45, 0.68, 0.55, 0.86, 0.72, 1];

  return (
    <div
      className="relative w-full"
      style={{ perspective: '1100px' }}
      role="img"
      aria-label="A tilted analytics dashboard with a trend line and bar chart"
    >
      <div
        className={`relative transition-transform duration-1000 ease-brand ${run ? 'animate-float-y' : ''}`}
        style={{
          transform: run
            ? 'rotateX(16deg) rotateY(-19deg) rotateZ(2deg)'
            : 'rotateX(10deg) rotateY(-10deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* back plate */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl"
          style={{ background: `linear-gradient(135deg, ${INDIGO}55, ${PURPLE}33)`, transform: 'translateZ(-60px) scale(0.92)' }}
        />

        {/* the panel — a surface, not a card: no border, no shadow box */}
        <div className="relative rounded-3xl overflow-hidden bg-space-raised/80 backdrop-blur-xl p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: CYAN }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: INDIGO }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: PURPLE }} />
          </div>

          {/* trend line */}
          <svg viewBox="0 0 320 110" className="mt-6 w-full h-auto">
            <Defs id="dash" />
            <path
              d="M4 92 L56 68 L108 76 L160 40 L212 52 L264 20 L316 28"
              fill="none"
              stroke="url(#dash-stroke)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              style={{
                strokeDasharray: 1,
                strokeDashoffset: run ? 0 : 1,
                transition: 'stroke-dashoffset 1800ms cubic-bezier(.22,.61,.36,1)',
              }}
            />
            <path
              d="M4 92 L56 68 L108 76 L160 40 L212 52 L264 20 L316 28 L316 110 L4 110 Z"
              fill={INDIGO}
              fillOpacity={run ? 0.14 : 0}
              style={{ transition: 'fill-opacity 1400ms ease 400ms' }}
            />
          </svg>

          {/* bars */}
          <div className="mt-6 flex items-end gap-2.5 h-24">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md"
                style={{
                  height: `${(run ? h : 0.12) * 100}%`,
                  background: `linear-gradient(180deg, ${CYAN}, ${INDIGO})`,
                  opacity: 0.85,
                  transition: `height 900ms cubic-bezier(.22,.61,.36,1) ${i * 90}ms`,
                }}
              />
            ))}
          </div>

          {/* sweeping highlight */}
          {run && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-1/3"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent)',
                animation: 'sweep 5s ease-in-out infinite',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export const SERVICE_VISUALS = {
  'ai-agents': AgentVisual,
  'chatbots-voice': ChatbotVisual,
  'workflow-automation': WorkflowVisual,
  'web-mobile-apps': DashboardVisual,
};
