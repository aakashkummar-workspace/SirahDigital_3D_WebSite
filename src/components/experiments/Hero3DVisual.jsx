// EXPERIMENTAL: hero 3D visual — the swap point.
// Safe to remove without affecting the rest of the website.

import React from 'react';
import HeroAIConsole from './HeroAIConsole';

/**
 * One seam between the hero and whatever 3D experiment is currently being
 * evaluated. The hero imports this and nothing else; this imports exactly one
 * experiment. Comparing two concepts is then a one-line edit here rather than
 * surgery on the hero, and the hero's markup stays identical across the
 * comparison — which is the only way the comparison is worth anything.
 *
 * Currently mounted:
 *   Experiment #3 — AI Console (components/experiments/HeroAIConsole)
 *
 * To show nothing at all, return null. The hero's right-hand column is a real
 * column with or without this: the copy column's width is what decides where
 * the heading wraps, so the column has to stay either way.
 */
export default function Hero3DVisual({ bridge }) {
  return <HeroAIConsole bridge={bridge} />;
}
