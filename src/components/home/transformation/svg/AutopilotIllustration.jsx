"use client";
import React from 'react';
import SceneDefs from './SceneDefs';
import DeskWorker, { Monitor } from './DeskWorker';
import { GLYPH_PATHS } from '@/components/ui/icons';

/*
 * SCENE 3 — Peaceful Scalability.
 *
 * Same desk, same person, same coordinates as scene 1 — that is what makes the
 * dissolve read as the man un-hunching rather than as two different pictures
 * swapping. What changes around him: the paper and alerts are gone, the screen
 * carries a climbing revenue chart, the tangled cabling is replaced by two
 * clean flow lines, and success badges drift in.
 */

const EMERALD = '#34D399';
const CYAN = '#22D3EE';

const BADGES = [
  { x: 92, y: 92, w: 122, label: 'Zero lost leads', d: 200 },
  { x: 126, y: 40, w: 108, label: '+340% meetings', d: 620 },
  { x: 396, y: 60, w: 104, label: '99.8% accuracy', d: 1040 },
];

export default function AutopilotIllustration({ run, idBase }) {
  return (
    <svg
      viewBox="0 0 640 480"
      className="w-full h-full"
      role="img"
      aria-label="The same business owner sitting upright and relaxed at a clean desk, with a climbing revenue chart on screen and success badges floating nearby"
    >
      <SceneDefs idBase={idBase} accent={EMERALD} accentSoft="#6EE7B7" />

      {/* two clean flow lines where the tangled cabling used to be */}
      <g fill="none" strokeLinecap="round">
        <path d="M356 372 C420 396, 500 396, 560 380" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="2.4" />
        <path d="M356 388 C420 412, 500 412, 560 396" stroke="#FFFFFF" strokeOpacity="0.07" strokeWidth="2.4" />
        <path
          d="M356 372 C420 396, 500 396, 560 380"
          stroke={EMERALD} strokeWidth="2.6" strokeDasharray="10 120"
          style={{ animation: run ? 'flow 2600ms linear infinite' : undefined, opacity: run ? 1 : 0.3 }}
        />
        <path
          d="M356 388 C420 412, 500 412, 560 396"
          stroke={CYAN} strokeWidth="2.6" strokeDasharray="10 120"
          style={{ animation: run ? 'flow 3100ms linear 400ms infinite' : undefined, opacity: run ? 1 : 0.3 }}
        />
      </g>

      {/* revenue dashboard on the monitor */}
      <Monitor idBase={idBase} accent={EMERALD}>
        {/* window chrome */}
        <circle cx="408" cy="162" r="3.4" fill={EMERALD} fillOpacity="0.8" />
        <circle cx="419" cy="162" r="3.4" fill={CYAN} fillOpacity="0.6" />
        <circle cx="430" cy="162" r="3.4" fill="#FFFFFF" fillOpacity="0.25" />

        {/* filled area under the trend */}
        <path
          d="M404 288 L440 262 L476 270 L512 232 L548 240 L580 196 L580 296 L404 296 Z"
          fill={EMERALD} fillOpacity={run ? 0.18 : 0}
          style={{ transition: 'fill-opacity 1200ms ease 500ms' }}
        />
        {/* the trend line draws itself on entry */}
        <path
          d="M404 288 L440 262 L476 270 L512 232 L548 240 L580 196"
          fill="none" stroke={EMERALD} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
          pathLength="1"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: run ? 0 : 1,
            transition: 'stroke-dashoffset 1700ms cubic-bezier(.22,.61,.36,1)',
          }}
        />
        {/* the point it's climbing toward */}
        <circle cx="580" cy="196" r="5" fill={EMERALD} style={{ opacity: run ? 1 : 0, transition: 'opacity 400ms ease 1600ms' }}>
          {run && <animate attributeName="r" values="5;7.5;5" dur="1.8s" repeatCount="indefinite" />}
        </circle>
        {/* bars along the bottom */}
        {[0.4, 0.62, 0.52, 0.8, 0.7, 1].map((h, i) => (
          <rect
            key={i}
            x={406 + i * 30} y={296 - h * 34} width="17" rx="3"
            height={run ? h * 34 : 3}
            fill={CYAN} fillOpacity="0.45"
            style={{ transition: `height 900ms cubic-bezier(.22,.61,.36,1) ${400 + i * 90}ms, y 900ms cubic-bezier(.22,.61,.36,1) ${400 + i * 90}ms` }}
          />
        ))}
      </Monitor>

      <DeskWorker mood="calm" run={run} idBase={idBase} accent={EMERALD} />

      {/* coffee cup with rising steam */}
      <g>
        <path d="M196 306 H228 L224 336 H200 Z" fill="#2A2450" stroke="#3B3468" strokeWidth="1.7" />
        <path d="M228 312 C238 312, 238 326, 228 326" stroke="#3B3468" strokeWidth="1.7" fill="none" />
        {run && [0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${205 + i * 7} 302 C${203 + i * 7} 294, ${208 + i * 7} 290, ${206 + i * 7} 282`}
            stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" fill="none"
            style={{ animation: `steam-rise ${2600 + i * 400}ms ease-out ${i * 700}ms infinite` }}
          />
        ))}
      </g>

      {/* success badges */}
      {BADGES.map((b, i) => (
        <g
          key={i}
          style={{ animation: run ? `alert-pop 720ms cubic-bezier(.22,.61,.36,1) ${b.d}ms both, float-y ${3200 + i * 400}ms ease-in-out ${b.d}ms infinite` : undefined }}
        >
          <rect x={b.x} y={b.y} width={b.w} height="34" rx="17"
            fill="#0F2A22" stroke={EMERALD} strokeOpacity="0.5" strokeWidth="1.8" />
          <circle cx={b.x + 18} cy={b.y + 17} r="9" fill={EMERALD} fillOpacity="0.9" />
          <path d={GLYPH_PATHS.check} fill="#08130F" transform={`translate(${b.x + 11} ${b.y + 10}) scale(0.6)`} />
          <text x={b.x + 34} y={b.y + 22} fill="#A7F3D0" style={{ fontSize: 13, fontWeight: 600 }}>{b.label}</text>
        </g>
      ))}

      {/* ambient sparkles */}
      {run && [
        { x: 78, y: 232, d: 0 },
        { x: 566, y: 122, d: 800 },
        { x: 108, y: 398, d: 1500 },
        { x: 590, y: 320, d: 2100 },
      ].map((s, i) => (
        <g key={i} style={{ animation: `float-y ${3000 + i * 420}ms ease-in-out ${s.d}ms infinite`, opacity: 0.8 }}>
          <path
            d={`M${s.x} ${s.y - 9} L${s.x + 2.6} ${s.y - 2.6} L${s.x + 9} ${s.y} L${s.x + 2.6} ${s.y + 2.6} L${s.x} ${s.y + 9} L${s.x - 2.6} ${s.y + 2.6} L${s.x - 9} ${s.y} L${s.x - 2.6} ${s.y - 2.6} Z`}
            fill={i % 2 ? CYAN : EMERALD}
          >
            <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" />
          </path>
        </g>
      ))}
    </svg>
  );
}
