"use client";
import React from 'react';

/*
 * The left column: phase badge, scene title, prose and three points.
 *
 * Keyed on the scene index by the parent so the whole block re-enters with the
 * shared `fade-in` keyframe on every change.
 *
 * The title is a plain <h3>, deliberately not AnimatedHeading — that component
 * runs its own IntersectionObserver on mount, and remounting it every three
 * seconds would attach and tear down an observer on a loop for no visual gain.
 */
export default function SceneNarrative({ scene, reduced }) {
  const enter = (delay) => ({
    animation: reduced ? undefined : `fade-in 620ms cubic-bezier(.22,.61,.36,1) ${delay}ms both`,
  });

  return (
    <div className="min-w-0">
      <span
        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-fluid-xs font-semibold"
        style={{
          ...enter(0),
          background: `${scene.accent}1a`,
          color: scene.accentSoft,
          border: `1px solid ${scene.accent}44`,
        }}
      >
        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full" style={{ background: scene.accent }} />
        {scene.phase}
      </span>

      <h3
        className="mt-6 text-fluid-xl font-bold tracking-tight leading-[1.15] text-ink"
        style={enter(70)}
      >
        {scene.title}
      </h3>

      <p className="mt-5 text-fluid-sm leading-relaxed text-brand-muted" style={enter(140)}>
        {scene.body}
      </p>

      <ul className="mt-7 space-y-3">
        {scene.points.map((point, i) => (
          <li
            key={point}
            className="flex items-start gap-3 text-fluid-sm text-brand-muted"
            style={enter(210 + i * 70)}
          >
            <span
              aria-hidden="true"
              className="mt-[0.5em] w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: scene.accent }}
            />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
