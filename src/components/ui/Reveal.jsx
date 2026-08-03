"use client";
import React, { useEffect, useRef, useState } from 'react';

/**
 * Fades and lifts its children into view the first time they are scrolled to.
 * Pass `delay` (ms) to stagger a row of cards.
 *
 * Falls back to showing content immediately when IntersectionObserver is not
 * available, or when the visitor has asked for reduced motion — the content
 * must never be left invisible.
 */
const FROM = {
  up: (d) => `translateY(${d}px)`,
  down: (d) => `translateY(-${d}px)`,
  left: (d) => `translateX(-${d}px)`,
  right: (d) => `translateX(${d}px)`,
  zoom: () => 'scale(0.94)',
};

export default function Reveal({
  children,
  delay = 0,
  y = 26,
  duration = 700,
  className = '',
  direction = 'up',
  blur = false,
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const [instant, setInstant] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setInstant(true);
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : (FROM[direction] || FROM.up)(y),
        filter: blur && !shown ? 'blur(6px)' : 'none',
        transition: instant
          ? 'none'
          : `opacity ${duration}ms cubic-bezier(.22,.61,.36,1) ${delay}ms,
             transform ${duration}ms cubic-bezier(.22,.61,.36,1) ${delay}ms,
             filter ${duration}ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
        willChange: shown ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
