"use client";
// EXPERIMENTAL: Living Automation Core
// Safe to remove without affecting the rest of the website.
//
// To remove the experiment entirely:
//   1. delete the <LivingAutomationCore /> line and its import in
//      components/sections/Hero.jsx
//   2. delete this directory (components/experiments/)
// Nothing else references it. No global styles, no background component and no
// other 3D component is involved.

import React from 'react';
import dynamic from 'next/dynamic';
import useMediaQuery, { useReducedMotion } from '@/hooks/useMediaQuery';

/**
 * Mount point and policy for the hero's 3D object.
 *
 * Everything that decides *whether* and *how much* the object animates lives
 * here; the scene itself just obeys. That split is what keeps the experiment
 * one deletable unit.
 *
 * ── Loading ──────────────────────────────────────────────────────────────
 * ssr:false because three touches window at import. It also keeps the whole
 * WebGL bundle out of the server render and off the critical path — the hero
 * copy is the content, and it must not wait for a decorative object.
 *
 * ── Reduced motion ───────────────────────────────────────────────────────
 * prefers-reduced-motion drops both the cursor tilt and the idle rotation.
 * The object stays, fully lit and readable, and simply does not move. It was
 * designed to hold up static — that is the first of the spec's own tests.
 *
 * ── Mobile ───────────────────────────────────────────────────────────────
 * There is no cursor, so there is nothing to react to and no fake touch
 * gesture is invented. The object is smaller, keeps only its idle rotation,
 * and sits under the copy in the band the hero already reserves.
 */

const Scene = dynamic(() => import('./LivingAutomationCoreScene'), {
  ssr: false,
  // No spinner. A loading state for a decorative object draws attention to
  // its absence; empty space reads as intentional.
  loading: () => null,
});

export default function LivingAutomationCore() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduced = useReducedMotion();

  return (
    <div
      // aria-hidden: the object carries no information. Everything it gestures
      // at is already said by the heading beside it, and announcing "canvas"
      // to a screen reader adds noise, not meaning.
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none"
    >
      <Scene
        interactive={isDesktop && !reduced}
        idle={!reduced}
        scale={isDesktop ? 1 : 0.72}
      />
    </div>
  );
}
