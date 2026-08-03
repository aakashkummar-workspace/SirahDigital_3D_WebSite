"use client";
import React from 'react';
import SceneDefs from './SceneDefs';
import { GLYPH_PATHS } from '@/components/ui/icons';
import { ORBIT_NODES } from '@/data/transformation';

/*
 * SCENE 2 — Sirah Digital AI Deployment.
 *
 * No person: a glowing AI core wired to the four systems it operates, with
 * data packets running the connections.
 *
 * The orbit deliberately does NOT rotate. A rotating group needs every node
 * counter-rotated by an equal and opposite transform to keep its glyph and
 * label upright, and rotating labels are unreadable anyway. TechnologyOrbit
 * on /services already establishes the alternative: fixed positions with all
 * the motion carried by travelling pulses and node pulsing. Cheaper, more
 * legible, less code.
 *
 * A faint desk silhouette is kept at low opacity so the horizon persists
 * across the dissolve from scene 1 and into scene 3 — without it the middle
 * scene reads as a jump cut.
 */

const CYAN = '#22D3EE';
const INDIGO = '#6366F1';

const CX = 320;
const CY = 226;
const RX = 186;
const RY = 132;

const GLYPHS = {
  whatsapp: GLYPH_PATHS.whatsapp,
  crm: GLYPH_PATHS.crm,
  calendar: GLYPH_PATHS.calendar,
  email: GLYPH_PATHS.mail,
};

const NODES = ORBIT_NODES.map((n, i) => {
  const rad = (n.angle * Math.PI) / 180;
  return {
    ...n,
    i,
    x: CX + Math.cos(rad) * RX,
    y: CY + Math.sin(rad) * RY,
  };
});

export default function AIOrbit({ run, idBase }) {
  return (
    <svg
      viewBox="0 0 640 480"
      className="w-full h-full"
      role="img"
      aria-label="A glowing AI core at the centre, wired to WhatsApp, CRM, Calendar and Email, with data packets travelling along each connection"
    >
      <SceneDefs idBase={idBase} accent={CYAN} accentSoft={INDIGO} />

      {/* the horizon carried over from the other two scenes */}
      <g opacity="0.08">
        <path d="M70 342 H600 L612 360 H58 Z" fill="#CBD5E1" />
        <rect x="58" y="360" width="554" height="15" fill="#CBD5E1" />
      </g>

      {/* orbit rails */}
      <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="#FFFFFF" strokeOpacity="0.08" />
      <ellipse cx={CX} cy={CY} rx={RX * 0.6} ry={RY * 0.6} fill="none" stroke="#FFFFFF" strokeOpacity="0.05" />

      {/* core aura */}
      <circle cx={CX} cy={CY} r="150" fill={`url(#${idBase}-glow)`} opacity={run ? 0.9 : 0.4} />

      {/* connections, each carrying a packet outward */}
      {NODES.map((n) => (
        <g key={`link-${n.id}`}>
          <line x1={CX} y1={CY} x2={n.x} y2={n.y} stroke="#FFFFFF" strokeOpacity="0.14" strokeWidth="1.8" />
          <line
            x1={CX} y1={CY} x2={n.x} y2={n.y}
            stroke={CYAN} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="11 140"
            style={{
              animation: run ? `flow ${2400 + n.i * 260}ms linear ${n.i * 180}ms infinite` : undefined,
              opacity: run ? 1 : 0.25,
            }}
          />
        </g>
      ))}

      {/* particles converging on the core */}
      {run && [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <circle
            key={`p-${i}`}
            cx={CX + Math.cos(a) * 96} cy={CY + Math.sin(a) * 76} r="2.6" fill={INDIGO}
            style={{
              '--tx': `${-Math.cos(a) * 78}px`,
              '--ty': `${-Math.sin(a) * 62}px`,
              animation: `burst 2200ms ease-in ${i * 320}ms infinite`,
            }}
          />
        );
      })}

      {/* the core */}
      <g style={{ transformOrigin: `${CX}px ${CY}px` }} className={run ? 'animate-breathe' : undefined}>
        <circle cx={CX} cy={CY} r="72" fill={CYAN} fillOpacity="0.13" />
      </g>
      {run && [0, 1].map((i) => (
        <circle
          key={`ring-${i}`}
          cx={CX} cy={CY} r="46" fill="none" stroke={CYAN} strokeOpacity="0.55" strokeWidth="1.8"
          style={{ transformOrigin: `${CX}px ${CY}px`, animation: `pulse-ring 2800ms ease-out ${i * 1400}ms infinite` }}
        />
      ))}
      <circle cx={CX} cy={CY} r="46" fill={INDIGO} fillOpacity="0.5" stroke={CYAN} strokeOpacity="0.9" strokeWidth="2.2" />
      <circle cx={CX} cy={CY} r="23" fill={CYAN} fillOpacity="0.55">
        {run && <animate attributeName="r" values="23;27;23" dur="2.2s" repeatCount="indefinite" />}
      </circle>
      <text x={CX} y={CY + 5} textAnchor="middle" fill="#FFFFFF" style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1.5 }}>
        AI
      </text>

      {/* the four systems */}
      {NODES.map((n) => {
        const below = n.y > CY + 40;
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r="40" fill={CYAN} fillOpacity="0.09" />
            <rect
              x={n.x - 22} y={n.y - 22} width="44" height="44" rx="13"
              fill="#141B33" stroke={CYAN} strokeOpacity="0.6" strokeWidth="1.9"
            >
              {run && <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur={`${2200 + n.i * 300}ms`} repeatCount="indefinite" />}
            </rect>
            <path
              d={GLYPHS[n.id]}
              fill={CYAN}
              transform={`translate(${n.x - 13} ${n.y - 13}) scale(1.08)`}
            />
            <text
              x={n.x}
              y={below ? n.y + 56 : n.y - 34}
              textAnchor="middle"
              fill="#FFFFFF"
              style={{ fontSize: 15, fontWeight: 700 }}
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
