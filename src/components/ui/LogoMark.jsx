"use client";
import React, { useMemo } from 'react';
import { LOGO_OUTER, LOGO_HOLES } from '@/components/three/sirahLogoOutline';

// Draws the mark as vector, straight from the traced outline. Sharper than
// scaling down logo.png, and it carries no wordmark.
export default function LogoMark({ className = '', gradientId = 'sirahMark' }) {
  const { d, viewBox } = useMemo(() => {
    const rings = [LOGO_OUTER, ...LOGO_HOLES];
    const all = rings.flat();
    const xs = all.map((p) => p[0]);
    const ys = all.map((p) => -p[1]);        // SVG y grows downward
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad = 0.15;

    const ring = (pts) =>
      pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(3)},${(-y).toFixed(3)}`).join('') + 'Z';

    return {
      d: rings.map(ring).join(' '),
      viewBox: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
    };
  }, []);

  return (
    <svg viewBox={viewBox} className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#4f7cf0" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${gradientId})`} fillRule="evenodd" />
    </svg>
  );
}
