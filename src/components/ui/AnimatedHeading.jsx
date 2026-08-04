"use client";
import React, { useEffect, useRef, useState } from 'react';

/**
 * Heading that lifts in a word at a time when it scrolls into view.
 *
 * Splitting on words rather than letters keeps the node count sane and, more
 * importantly, lets the browser wrap normally — per-letter spans break line
 * breaking on long headlines.
 *
 * `highlight` renders that word (or trailing phrase) in the brand gradient.
 */
export default function AnimatedHeading({
  text,
  highlight,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  stagger = 55,
  highlightClass = 'text-brand-cyan',
  // Passed through so a section can point aria-labelledby at the heading.
  ...rest
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
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = String(text).split(' ');
  const highlightWords = highlight ? String(highlight).split(' ') : [];
  const highlightFrom = highlight ? words.length - highlightWords.length : -1;

  return (
    <Tag ref={ref} className={className} {...rest}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          // Outer span clips, inner one moves — gives a "rising out of the
          // line" feel rather than the whole word sliding across the page.
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: '0.08em' }}
        >
          <span
            className={`inline-block ${i >= highlightFrom && highlightFrom >= 0 ? highlightClass : ''}`}
            style={{
              opacity: shown ? 1 : 0,
              transform: shown ? 'none' : 'translateY(0.9em)',
              transition: instant
                ? 'none'
                : `opacity 640ms cubic-bezier(.22,.61,.36,1) ${delay + i * stagger}ms,
                   transform 640ms cubic-bezier(.22,.61,.36,1) ${delay + i * stagger}ms`,
            }}
          >
            {word}
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  );
}
