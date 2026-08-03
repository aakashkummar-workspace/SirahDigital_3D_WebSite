"use client";
import { useEffect, useState } from 'react';

/**
 * Subscribes to a media query. Returns false during SSR and on the first
 * client render, then settles — so never branch layout on this alone where a
 * flash would be visible; use it to scale motion and geometry, and let CSS
 * handle layout.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

// Motion is opt-out for anyone who has asked their OS to reduce it.
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

// Used to thin out particle counts and skip the heavier 3D on small screens.
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
