"use client";
import React from 'react';
import { ArrowRightIcon } from '@/components/ui/icons';

/*
 * Next Scene, plus the play/pause control that satisfies WCAG 2.2.2 — any
 * content that auto-updates for longer than five seconds needs a mechanism to
 * pause it, and this loops forever.
 */
export default function SceneControls({ accent, playing, onNext, onToggle }) {
  return (
    <div className="mt-9 flex items-center gap-3">
      <button
        type="button"
        onClick={onNext}
        className="group inline-flex flex-1 sm:flex-none items-center justify-center gap-2.5 min-h-[44px] px-6 rounded-full text-fluid-sm font-semibold text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
      >
        Next Scene
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          <ArrowRightIcon />
        </span>
      </button>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={!playing}
        aria-label={playing ? 'Pause the story' : 'Play the story'}
        className="inline-grid place-items-center w-11 h-11 min-h-[44px] shrink-0 rounded-full transition-colors"
        style={{ background: `${accent}1f`, color: accent }}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          {playing ? (
            <path d="M8 5h3.5v14H8V5zm4.5 0H16v14h-3.5V5z" />
          ) : (
            <path d="M8 5l11 7-11 7V5z" />
          )}
        </svg>
      </button>
    </div>
  );
}
