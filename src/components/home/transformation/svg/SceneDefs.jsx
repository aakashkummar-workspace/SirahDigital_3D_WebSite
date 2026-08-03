"use client";
import React from 'react';

/**
 * Gradients shared by the three scenes.
 *
 * Every id is namespaced with `idBase`, which comes from useId() at the
 * section root. All three scenes are mounted at once and DeskWorker is
 * instantiated twice, so unnamespaced ids would collide silently — SVG
 * resolves a duplicate id to whichever element the parser saw first, and the
 * second figure would quietly borrow the first one's lighting.
 */
export default function SceneDefs({ idBase, accent, accentSoft }) {
  return (
    <defs>
      {/* Rim light: the monitor is the light source, so the figure is lit from
          screen-side. This is what sells "sitting in front of a display" far
          more than any anatomical detail does. */}
      <linearGradient id={`${idBase}-body`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#241F42" />
        <stop offset="62%" stopColor="#2C2650" />
        <stop offset="100%" stopColor={accent} stopOpacity="0.42" />
      </linearGradient>

      <linearGradient id={`${idBase}-skin`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#3A3357" />
        <stop offset="55%" stopColor="#4A4270" />
        <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
      </linearGradient>

      <linearGradient id={`${idBase}-hair`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#17142C" />
        <stop offset="100%" stopColor={accent} stopOpacity="0.3" />
      </linearGradient>

      {/* Screen wash — tints the monitor face in the scene's accent. */}
      <linearGradient id={`${idBase}-screen`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
        <stop offset="100%" stopColor={accent} stopOpacity="0.07" />
      </linearGradient>

      {/* Light spilling from the monitor across the desk. */}
      <linearGradient id={`${idBase}-spill`} x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
        <stop offset="100%" stopColor={accent} stopOpacity="0" />
      </linearGradient>

      <radialGradient id={`${idBase}-glow`}>
        <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
        <stop offset="70%" stopColor={accent} stopOpacity="0.1" />
        <stop offset="100%" stopColor={accent} stopOpacity="0" />
      </radialGradient>

      {/* Contact shadow. Without this the whole composition floats. */}
      <radialGradient id={`${idBase}-shadow`}>
        <stop offset="0%" stopColor="#07060F" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#07060F" stopOpacity="0" />
      </radialGradient>

      <linearGradient id={`${idBase}-stroke`} x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stopColor={accentSoft} />
        <stop offset="100%" stopColor={accent} />
      </linearGradient>

      {/* Clips the iris so it can sit inside the almond without spilling. */}
      <clipPath id={`${idBase}-eye`}>
        <path d="M286 172 C291 167, 299 167, 303 173 C299 180, 291 180, 286 172 Z" />
      </clipPath>
    </defs>
  );
}
