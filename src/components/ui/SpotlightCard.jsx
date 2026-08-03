"use client";
import React, { useRef } from 'react';

/**
 * Card wrapper with a highlight that follows the cursor across the surface,
 * plus a thin gradient edge that lights up on hover.
 *
 * The pointer position is written straight to CSS custom properties on the
 * node instead of going through React state — this fires on every mousemove,
 * and re-rendering a component per frame for a decorative glow is not worth it.
 */
export default function SpotlightCard({
  children,
  className = '',
  glow = 'rgba(56, 189, 248, 0.14)',   // cyan-400, low alpha
  as: Tag = 'div',
  ...rest
}) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <Tag
      ref={ref}
      onMouseMove={onMove}
      className={`group/spot relative overflow-hidden ${className}`}
      {...rest}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), ${glow}, transparent 65%)`,
        }}
      />
      <span className="relative block h-full">{children}</span>
    </Tag>
  );
}
