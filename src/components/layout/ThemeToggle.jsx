"use client";
import React from 'react';
import useTheme from '@/hooks/useTheme';
import { DARK, LIGHT } from '@/lib/theme';

/**
 * The light/dark switch, as it sits in the navbar's right-hand cluster.
 *
 * Two things about it are less obvious than they look.
 *
 * It renders at a fixed 44x44 (the same touch target the mobile trigger beside
 * it uses) and both icons are always in the DOM, cross-faded and counter-
 * rotated rather than swapped. A conditional `{isLight ? <Sun/> : <Moon/>}`
 * would change the *markup* between server and client, which is the one thing
 * the boot script cannot paper over: the server has no idea what the visitor
 * chose, so it would render the wrong icon and then hydrate over it. Keeping
 * both mounted means only opacity and transform differ, and CSS resolves those
 * from the attribute before React ever runs.
 *
 * For the same reason the accessible name stays generic until `mounted`. An
 * aria-label that named the destination state ("Switch to light theme") would
 * be wrong for half of visitors during the first paint, and a screen reader
 * that has already announced it will not hear the correction.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, mounted, toggle } = useTheme();
  const isLight = mounted && theme === LIGHT;

  return (
    <button
      type="button"
      onClick={toggle}
      // Before mount, say what the control *is* rather than what it will do.
      aria-label={mounted ? `Switch to ${isLight ? DARK : LIGHT} theme` : 'Switch theme'}
      title={mounted ? `Switch to ${isLight ? DARK : LIGHT} theme` : 'Switch theme'}
      // aria-pressed rather than a role=switch: this is a toggle button, and
      // its pressed state is "light is on".
      aria-pressed={mounted ? isLight : undefined}
      className={`relative w-11 h-11 shrink-0 rounded-lg grid place-items-center
        border border-ink/10 text-brand-text
        transition-colors duration-300 ease-brand
        hover:border-ink/25 hover:bg-ink/[0.06]
        focus-visible:outline-none ${className}`}
    >
      {/*
        Both glyphs occupy the same grid cell. The sun scales up out of the
        moon rather than sliding, so the swap reads as one object changing
        state instead of two objects trading places.
      */}
      <span className="relative block w-5 h-5">
        {/* Moon — shown on dark, i.e. "you are here". */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-brand
            motion-reduce:transition-none ${
              isLight ? 'opacity-0 scale-50 -rotate-90' : 'opacity-100 scale-100 rotate-0'
            }`}
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>

        {/* Sun — shown on light. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-brand
            motion-reduce:transition-none ${
              isLight ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-90'
            }`}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </span>
    </button>
  );
}
