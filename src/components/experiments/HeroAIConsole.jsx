"use client";
// EXPERIMENTAL: AI Console Hero
// Safe to remove without affecting the rest of the website.
//
// To remove this experiment:
//   1. in components/experiments/Hero3DVisual.jsx, return null (or swap in a
//      different experiment) — that file is the only thing that imports this
//   2. delete HeroAIConsole.jsx, HeroAIConsoleScene.jsx and heroConsoleArt.js
// Nothing else references any of the three. No global style, no background
// component and no other 3D component on the site is involved.

import React from 'react';
import dynamic from 'next/dynamic';
import useMediaQuery, { useReducedMotion } from '@/hooks/useMediaQuery';

/**
 * Mount point and policy for the hero scene.
 *
 * Everything deciding *whether* and *how much* the composition animates lives
 * here; the scene takes three props and obeys them. That split is what keeps
 * the experiment one deletable unit, and what makes the reduced-motion and
 * mobile behaviour readable in one screen instead of scattered through the
 * geometry.
 *
 * ── Loading ──────────────────────────────────────────────────────────────
 * ssr:false because three touches window at import. It also keeps the WebGL
 * bundle off the critical path: the hero copy is the content, and it must not
 * wait on a decorative object to paint.
 *
 * ── Reduced motion ───────────────────────────────────────────────────────
 * Both the cursor response and the idle drift go. The robot, the panels and
 * the platform stay, fully lit, in their neutral pose, and the canvas switches
 * to frameloop="demand" so it draws once and then leaves the GPU alone. The
 * panels carry their dashboards either way — nothing in this scene is only
 * legible while it moves, which is the first thing it was checked against.
 *
 * ── Mobile ───────────────────────────────────────────────────────────────
 * There is no cursor, so there is nothing to answer and no touch gesture is
 * invented to stand in for one. The idle drift stays: it is slow enough to
 * cost nothing and it is the whole reason the thing does not read as a static
 * image. The scene sits in the band the hero grid already reserves beneath the
 * copy, at a slightly smaller fill so the outer panels keep their air on a
 * frame that much wider than it is tall.
 */

const Scene = dynamic(() => import('./HeroAIConsoleScene'), {
  ssr: false,
  // No spinner. A loading state for a decorative object draws attention to its
  // absence; empty space reads as intentional.
  loading: () => null,
});

export default function HeroAIConsole({ bridge }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduced = useReducedMotion();

  return (
    <div
      // aria-hidden: the cards restate what the page already says in text —
      // the same three product names, descriptions and links are in the DOM
      // cards this scene hands off to — so announcing "canvas" to a screen
      // reader adds noise, not meaning.
      aria-hidden="true"
      // pointer-events-none is load-bearing, not tidiness: the canvas covers
      // the entire stage, including the headline and both hero buttons, and the
      // cursor is tracked on window precisely so it never has to intercept
      // anything to feel responsive.
      //
      // Full-stage rather than a column, because the composition travels from
      // the side of the screen to the middle as the products come in. Sizing
      // the canvas to the composition instead would mean resizing it every
      // frame of that travel, and every resize reallocates the drawing buffer.
      className="pointer-events-none absolute inset-0 select-none"
      // Normally 1, and the scene dims its own materials as a card comes
      // forward — that way the card being presented stays lit while everything
      // around it stands down. A reduced-motion visitor has no frame loop to do
      // that in, so for them the stage dims the whole canvas from here instead.
      // No card ever leaves the ring in that mode, so there is nothing inside
      // the canvas that needs to stay bright.
      style={{ opacity: 'var(--hero-scene-dim, 1)' }}
    >
      <Scene
        interactive={isDesktop && !reduced}
        idle={!reduced}
        compact={!isDesktop}
        bridge={bridge}
      />
    </div>
  );
}
