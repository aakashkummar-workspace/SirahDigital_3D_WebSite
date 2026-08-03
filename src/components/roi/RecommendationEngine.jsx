"use client";
import React from 'react';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/**
 * Suggests the systems that fit the selected industry, as chips that animate
 * in when the selection changes.
 *
 * Keyed on the industry id so the whole set remounts and re-staggers rather
 * than swapping labels in place.
 */
export default function RecommendationEngine({ industry, accent }) {
  const reduced = useReducedMotion();

  return (
    <div>
      <p className="text-fluid-sm font-semibold text-white">
        Recommended for {industry.label}
      </p>
      <ul key={industry.id} className="mt-4 flex flex-wrap gap-2.5">
        {industry.recommendations.map((r, i) => (
          <li
            key={r}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 min-h-[36px] text-fluid-xs font-semibold"
            style={{
              background: `${accent}14`,
              border: `1px solid ${accent}3d`,
              color: '#FFFFFF',
              animation: reduced ? undefined : `alert-pop 520ms cubic-bezier(.22,.61,.36,1) ${i * 70}ms both`,
            }}
          >
            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
