"use client";
import React from 'react';
import { SCENES } from '@/data/transformation';

/*
 * The three scene tabs.
 *
 * Plain buttons with aria-pressed inside a labelled group, matching the house
 * pattern in IndustryOrbit and MissionControl — not role="tablist". Three tabs
 * pointing aria-controls at one swapping panel is a half-implementation with
 * more ways to be wrong than right.
 *
 * All three buttons keep tabIndex 0 — deliberately NOT roving tabindex. With
 * autoplay changing the active scene every three seconds, a roving tab stop
 * would move itself around under the user's fingers. This is one case where
 * the standard widget pattern is actively wrong for autoplaying content.
 *
 * Mobile is a segmented row of three equal pills rather than a scroll rail;
 * three items fit a 320px viewport, and a rail would be a horizontal-scroll
 * risk for no benefit.
 */

const KEYS = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };

export default function SceneSwitcher({ active, onSelect }) {
  const onKeyDown = (e) => {
    if (e.key === 'Home') {
      e.preventDefault();
      onSelect(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      onSelect(SCENES.length - 1);
      return;
    }
    const dir = KEYS[e.key];
    if (!dir) return;
    e.preventDefault();
    onSelect((active + dir + SCENES.length) % SCENES.length);
  };

  return (
    <div
      role="group"
      aria-label="Choose a scene"
      onKeyDown={onKeyDown}
      className="flex w-full md:w-auto items-stretch gap-1 rounded-full bg-ink/[0.04] p-1"
    >
      {SCENES.map((scene, i) => {
        const on = i === active;
        return (
          <button
            key={scene.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-pressed={on}
            className="relative flex-1 md:flex-none min-h-[44px] px-3 sm:px-4 md:px-5 rounded-full text-fluid-xs font-semibold whitespace-nowrap transition-colors duration-400 ease-brand"
            style={{
              background: on ? `${scene.accent}1f` : 'transparent',
              color: on ? '#FFFFFF' : '#CBD5E1',
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-400"
                style={{
                  background: scene.accent,
                  opacity: on ? 1 : 0.45,
                }}
              />
              <span className="truncate">
                {/* full label from md up, short label on phones */}
                <span className="md:hidden">{scene.tab}</span>
                <span className="hidden md:inline">{scene.tabLong}</span>
              </span>
            </span>
            {/* accent underline on the active tab, desktop only */}
            <span
              aria-hidden="true"
              className="hidden md:block absolute left-4 right-4 bottom-1 h-px rounded-full transition-opacity duration-400"
              style={{ background: scene.accent, opacity: on ? 0.8 : 0 }}
            />
          </button>
        );
      })}
    </div>
  );
}
