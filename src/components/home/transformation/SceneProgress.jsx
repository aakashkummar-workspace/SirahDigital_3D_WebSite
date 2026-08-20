"use client";
import React from 'react';
import { SCENE_MS } from '@/data/transformation';

/**
 * The 3-second countdown rail across the top of the card.
 *
 * Pure CSS, remounted with `key={tick}` by the parent. Not React state — that
 * would be sixty re-renders a second through a subtree holding three mounted
 * SVG scenes. Not requestAnimationFrame either: that would be a second clock
 * running alongside the timeout, and two independent clocks drift.
 *
 * `scaleX` from a left origin, never `width` — width is a layout operation
 * every frame, transform is compositor-only.
 *
 * Decorative: the authoritative state is `aria-pressed` on the switcher, so
 * this is hidden from assistive tech rather than given a progressbar role,
 * which would want `aria-valuenow` updated per frame.
 */
export default function SceneProgress({ accent, running }) {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] overflow-hidden">
      <div className="absolute inset-0 bg-white/[0.06]" />
      <div
        className="absolute inset-0 origin-left"
        style={{
          background: accent,
          transform: running ? undefined : 'scaleX(0)',
          opacity: running ? 1 : 0.3,
          animation: running ? `scene-progress ${SCENE_MS}ms linear both` : 'none',
        }}
      />
    </div>
  );
}
