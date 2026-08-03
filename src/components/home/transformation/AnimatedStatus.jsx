"use client";
import React from 'react';
import { GLYPH_PATHS } from '@/components/ui/icons';

/*
 * The status strip under each scene's artwork.
 *
 * Glyph is picked by the scene's `statusTone` rather than pasted into the copy,
 * so the data file holds words and nothing else.
 */
const TONE_GLYPH = {
  alert: GLYPH_PATHS.warning,
  bolt: GLYPH_PATHS.bolt,
  rocket: GLYPH_PATHS.rocket,
};

export default function AnimatedStatus({ scene, run }) {
  return (
    <div
      className="flex items-center justify-center gap-2.5 rounded-full px-4 py-2.5 min-w-0"
      style={{
        background: `${scene.accent}14`,
        border: `1px solid ${scene.accent}3d`,
      }}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill={scene.accent} aria-hidden="true">
        <path d={TONE_GLYPH[scene.statusTone] || TONE_GLYPH.bolt}>
          {run && <animate attributeName="opacity" values="0.55;1;0.55" dur="1.6s" repeatCount="indefinite" />}
        </path>
      </svg>
      <span
        className="font-mono text-fluid-xs tracking-wide truncate"
        style={{ color: scene.accentSoft }}
      >
        {scene.status}
      </span>
    </div>
  );
}
