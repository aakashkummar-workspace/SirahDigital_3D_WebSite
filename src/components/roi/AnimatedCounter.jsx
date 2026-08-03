"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/**
 * Counts from the previous value to the new one whenever inputs change, so a
 * metric never abruptly replaces itself.
 *
 * The tween writes to the DOM node directly rather than through React state —
 * eight of these run at once, and a re-render per frame per counter would be
 * the entire frame budget. Only the formatted string is written.
 */
export default function AnimatedCounter({ value, format, duration = 900, className = '', style }) {
  const ref = useRef(null);
  const from = useRef(value);
  const raf = useRef(0);
  const reduced = useReducedMotion();
  // Keeps the server render and the first client render identical.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const start = from.current;
    const end = value;

    if (reduced || !mounted || start === end) {
      from.current = end;
      el.textContent = format(end);
      return undefined;
    }

    let t0 = null;
    const tick = (t) => {
      if (t0 === null) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      // easeOutCubic — fast to settle, no overshoot on a financial figure
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = format(start + (end - start) * e);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else from.current = end;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, format, duration, reduced, mounted]);

  return (
    <span ref={ref} className={className} style={style}>
      {format(value)}
    </span>
  );
}
