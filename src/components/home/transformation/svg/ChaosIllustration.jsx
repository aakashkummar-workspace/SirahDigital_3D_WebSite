"use client";
import React from 'react';
import SceneDefs from './SceneDefs';
import DeskWorker, { Monitor } from './DeskWorker';
import { GLYPH_PATHS } from '@/components/ui/icons';

/*
 * SCENE 1 — Manual Operations Chaos.
 *
 * The figure is hunched and typing frantically. Around him: paper scattering
 * outward, notifications piling up, a ringing phone, tangled cabling, and a
 * screen full of conflicting alert windows.
 *
 * Every delay and angle is derived from the item's index — never Math.random(),
 * which would differ between the server and client renders and throw a
 * hydration mismatch.
 */

const CRIMSON = '#F43F5E';
const AMBER = '#FBBF24';

// Papers thrown outward from the desk. Direction feeds the shared `burst`
// keyframe through --tx / --ty, the same mechanism MethodologyJourney uses.
const PAPERS = [
  { x: 150, y: 300, rot: -18, tx: '-30px', ty: '-46px', d: 0 },
  { x: 196, y: 316, rot: 22, tx: '-52px', ty: '-24px', d: 420 },
  { x: 118, y: 322, rot: 9, tx: '-40px', ty: '-58px', d: 840 },
  { x: 470, y: 300, rot: -12, tx: '44px', ty: '-40px', d: 260 },
  { x: 528, y: 314, rot: 26, tx: '58px', ty: '-20px', d: 680 },
];

// Notification cards crowding the head.
const ALERTS = [
  { x: 96, y: 96, w: 104, label: '17 missed calls', dur: 2600, d: 0 },
  { x: 128, y: 44, w: 118, label: '42 unread chats', dur: 3100, d: 380 },
  { x: 358, y: 52, w: 96, label: 'CRM error', dur: 2900, d: 760 },
];

export default function ChaosIllustration({ run, idBase }) {
  const anim = (name, dur, delay = 0, ease = 'ease-in-out') =>
    run ? `${name} ${dur}ms ${ease} ${delay}ms infinite` : undefined;

  return (
    <svg
      viewBox="0 0 640 480"
      className="w-full h-full"
      role="img"
      aria-label="A business owner hunched at a desk typing frantically, surrounded by scattering paperwork, a ringing phone and stacking error notifications"
    >
      <SceneDefs idBase={idBase} accent={CRIMSON} accentSoft="#FDA4AF" />

      {/* tangled cabling behind the desk */}
      <g stroke="#2A2450" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M420 372 C452 402, 380 414, 418 440 C446 458, 520 442, 546 420" />
        <path d="M470 372 C500 396, 442 420, 478 440" />
        <path d="M356 372 C336 398, 398 408, 374 436" />
      </g>

      {/* screen full of conflicting alert windows */}
      <Monitor idBase={idBase} accent={CRIMSON}>
        {[
          { x: 408, y: 168, w: 118, h: 62, r: -3 },
          { x: 442, y: 196, w: 124, h: 66, r: 4 },
          { x: 420, y: 232, w: 132, h: 58, r: -2 },
        ].map((w, i) => (
          <g key={i} transform={`rotate(${w.r} ${w.x + w.w / 2} ${w.y + w.h / 2})`}>
            <rect x={w.x} y={w.y} width={w.w} height={w.h} rx="5"
              fill="#2A1230" stroke={CRIMSON} strokeOpacity="0.55" strokeWidth="1.8" />
            <rect x={w.x} y={w.y} width={w.w} height="12" rx="5" fill={CRIMSON} fillOpacity="0.28" />
            <path d={GLYPH_PATHS.warning} fill={CRIMSON} transform={`translate(${w.x + 8} ${w.y + 20}) scale(0.62)`}>
              {run && <animate attributeName="opacity" values="0.45;1;0.45" dur={`${1.1 + i * 0.3}s`} repeatCount="indefinite" />}
            </path>
            <path d={`M${w.x + 30} ${w.y + 30} H${w.x + w.w - 12}`} stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
            <path d={`M${w.x + 30} ${w.y + 42} H${w.x + w.w - 30}`} stroke="#FFFFFF" strokeOpacity="0.16" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </Monitor>

      <DeskWorker mood="stressed" run={run} idBase={idBase} accent={CRIMSON} />

      {/* sweat beading off the brow */}
      {run && [0, 1].map((i) => (
        <ellipse
          key={i}
          cx={318 + i * 9} cy={166 + i * 14} rx="3.4" ry="4.6"
          fill="#7DD3FC" fillOpacity="0.85"
          style={{ '--tx': `${10 + i * 5}px`, '--ty': '26px', animation: `burst 1900ms ease-in ${i * 620}ms infinite` }}
        />
      ))}

      {/* ringing phone, tilting on the desk */}
      <g style={{ transformOrigin: '182px 300px', animation: anim('head-scan', 260, 0), '--scan': '9deg' }}>
        <rect x="166" y="272" width="34" height="56" rx="7" fill="#2A1230" stroke={CRIMSON} strokeWidth="2.2" />
        <circle cx="183" cy="300" r="9" fill={CRIMSON}>
          {run && <animate attributeName="opacity" values="1;0.35;1" dur="0.6s" repeatCount="indefinite" />}
        </circle>
        {/* ring arcs */}
        {run && [0, 1].map((i) => (
          <g key={i}>
            <path d={`M${206 + i * 9} ${284 - i * 5} A ${18 + i * 9} ${18 + i * 9} 0 0 1 ${206 + i * 9} ${316 + i * 5}`}
              stroke={CRIMSON} strokeWidth="2.4" fill="none" strokeLinecap="round">
              <animate attributeName="opacity" values="0;1;0" dur="1.2s" begin={`${i * 0.28}s`} repeatCount="indefinite" />
            </path>
            <path d={`M${160 - i * 9} ${284 - i * 5} A ${18 + i * 9} ${18 + i * 9} 0 0 0 ${160 - i * 9} ${316 + i * 5}`}
              stroke={CRIMSON} strokeWidth="2.4" fill="none" strokeLinecap="round">
              <animate attributeName="opacity" values="0;1;0" dur="1.2s" begin={`${i * 0.28}s`} repeatCount="indefinite" />
            </path>
          </g>
        ))}
      </g>

      {/* paper flying off the desk */}
      {PAPERS.map((p, i) => (
        <g
          key={i}
          style={run ? { '--tx': p.tx, '--ty': p.ty, animation: `burst 2600ms ease-out ${p.d}ms infinite` } : { opacity: 0.75 }}
        >
          <rect
            x={p.x} y={p.y} width="42" height="52" rx="3"
            fill="#CBD5E1" fillOpacity="0.16" stroke="#CBD5E1" strokeOpacity="0.42" strokeWidth="1.6"
            transform={`rotate(${p.rot} ${p.x + 21} ${p.y + 26})`}
          />
          <path
            d={`M${p.x + 8} ${p.y + 14} H${p.x + 32} M${p.x + 8} ${p.y + 24} H${p.x + 26} M${p.x + 8} ${p.y + 34} H${p.x + 30}`}
            stroke="#CBD5E1" strokeOpacity="0.35" strokeWidth="1.8" strokeLinecap="round"
            transform={`rotate(${p.rot} ${p.x + 21} ${p.y + 26})`}
          />
        </g>
      ))}

      {/* notification cards stacking up */}
      {ALERTS.map((a, i) => (
        <g key={i} style={{ animation: run ? `alert-pop 700ms cubic-bezier(.22,.61,.36,1) ${a.d}ms both, float-y ${a.dur}ms ease-in-out ${a.d}ms infinite` : undefined }}>
          <rect x={a.x} y={a.y} width={a.w} height="34" rx="8"
            fill="#2A1230" stroke={CRIMSON} strokeOpacity="0.5" strokeWidth="1.8" />
          <circle cx={a.x + 18} cy={a.y + 17} r="8" fill={CRIMSON} fillOpacity="0.9" />
          <path d="M0 -4 V1 M0 3.4 V4" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" transform={`translate(${a.x + 18} ${a.y + 17})`} />
          <text x={a.x + 32} y={a.y + 22} fill="#FECDD3" style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</text>
        </g>
      ))}

      {/* floating error glyphs */}
      {run && [
        { x: 86, y: 210, s: 0.7, d: 0 },
        { x: 412, y: 104, s: 0.55, d: 900 },
        { x: 62, y: 268, s: 0.5, d: 1700 },
      ].map((e, i) => (
        <path
          key={i}
          d={GLYPH_PATHS.warning}
          fill={AMBER}
          transform={`translate(${e.x} ${e.y}) scale(${e.s})`}
          style={{ animation: `float-y ${2800 + i * 500}ms ease-in-out ${e.d}ms infinite`, opacity: 0.75 }}
        />
      ))}
    </svg>
  );
}
