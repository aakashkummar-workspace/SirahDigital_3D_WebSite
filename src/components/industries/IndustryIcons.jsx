import React from 'react';

/*
 * One line glyph per sector, plus the two the detail panel needs.
 *
 * All are authored on a 24x24 grid and drawn with `currentColor` strokes, so
 * a single `style={{ color: accent }}` on the wrapper tints the whole icon —
 * the rail and the panel render the same glyph at different sizes without a
 * second definition.
 *
 * Shapes only: the wrapping <svg>, its viewBox and its stroke settings live in
 * <IndustryIcon> below, so nothing here can drift out of alignment.
 */
const SHAPES = {
  healthcare: (
    <>
      <path d="M12 19.6C7.6 16.6 4.2 13.8 4.2 10.4A3.8 3.8 0 0 1 10.7 7.8L12 9.2l1.3-1.4a3.8 3.8 0 0 1 6.5 2.6c0 3.4-3.4 6.2-7.8 9.2Z" />
      <path d="M4.6 12.6h3.2l1.4-2.4 1.9 4.6 1.5-3 1 1.8h3.8" />
    </>
  ),
  manufacturing: (
    <>
      <path d="M3 20h18" />
      <path d="M3.4 20V9.6l5 3.2V9.6l5 3.2V6.4l5 3.2V20" />
      <path d="M7 16.4h1.6M12 16.4h1.6M17 16.4h1.6" />
    </>
  ),
  education: (
    <>
      <path d="M12 4 2.8 8.6 12 13.2l9.2-4.6L12 4Z" />
      <path d="M6.6 10.9v4.4c0 1.7 2.4 3 5.4 3s5.4-1.3 5.4-3v-4.4" />
      <path d="M21.2 8.6v5" />
    </>
  ),
  'real-estate': (
    <>
      <path d="M4 20.5V8.2L12 3.5l8 4.7v12.3" />
      <path d="M3 20.5h18" />
      <path d="M9.6 20.5v-4.8h4.8v4.8" />
      <path d="M8.6 10.8h1.6M13.8 10.8h1.6" />
    </>
  ),
  'retail-ecommerce': (
    <>
      <path d="M5.2 8h13.6l-1.1 12.1H6.3L5.2 8Z" />
      <path d="M9 8V6.2a3 3 0 0 1 6 0V8" />
      <path d="M9 11.4v1.2a3 3 0 0 0 6 0v-1.2" />
    </>
  ),
  logistics: (
    <>
      <path d="M2.8 6.4h10.8v10.2H2.8z" />
      <path d="M13.6 9.6h3.9l3.7 3.6v3.4h-7.6" />
      <circle cx="7.4" cy="18.6" r="1.9" />
      <circle cx="16.8" cy="18.6" r="1.9" />
    </>
  ),
  'professional-services': (
    <>
      <path d="M3.2 7.8h17.6v11.4H3.2z" />
      <path d="M9 7.8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.8" />
      <path d="M3.2 12.8h17.6" />
      <path d="M10.6 12.8h2.8" />
    </>
  ),
  'hospitality-travel': (
    <>
      <path d="M3 19.6V7.4" />
      <path d="M3 13.2h18v6.4" />
      <path d="M21 13.2v-1.6a2.6 2.6 0 0 0-2.6-2.6h-6.6v4.2" />
      <circle cx="7.2" cy="10.6" r="1.9" />
    </>
  ),
  'human-resources': (
    <>
      <circle cx="9.4" cy="8.2" r="3.1" />
      <path d="M3.4 20a6 6 0 0 1 12 0" />
      <path d="M16.4 5.6a3.1 3.1 0 0 1 0 5.6" />
      <path d="M17.4 14.6A6 6 0 0 1 20.6 20" />
    </>
  ),
  legal: (
    <>
      <path d="M12 4.2v15.4" />
      <path d="M6.6 19.6h10.8" />
      <path d="M4 8.4h16" />
      <path d="M4 8.4 1.8 13.2a2.9 2.9 0 0 0 4.4 0L4 8.4Z" />
      <path d="M20 8.4l-2.2 4.8a2.9 2.9 0 0 0 4.4 0L20 8.4Z" />
    </>
  ),
  construction: (
    <>
      <path d="M3.6 19.6h16.8" />
      <path d="M5.8 16.6v-2.2a6.2 6.2 0 0 1 12.4 0v2.2" />
      <path d="M5.4 16.6h13.2" />
      <path d="M10.1 9.4V6.2a1.9 1.9 0 0 1 3.8 0v3.2" />
    </>
  ),
  automotive: (
    <>
      <path d="M3.4 16.4v-3.6l1.9-4.2A2.2 2.2 0 0 1 7.3 7.3h9.4a2.2 2.2 0 0 1 2 1.3l1.9 4.2v3.6" />
      <path d="M3.4 12.8h17.2" />
      <circle cx="7.4" cy="16.6" r="1.8" />
      <circle cx="16.6" cy="16.6" r="1.8" />
    </>
  ),
};

export function IndustryIcon({ name, className = 'w-5 h-5' }) {
  const shape = SHAPES[name];
  if (!shape) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shape}
    </svg>
  );
}

// Outcome ticks in the detail panel.
export const CheckCircleIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8.6" />
    <path d="M8.4 12.2l2.5 2.5 4.7-5" />
  </svg>
);

// The guarantee callout.
export const ShieldIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.2l7 2.6v5.4c0 4.2-2.9 7.7-7 9.6-4.1-1.9-7-5.4-7-9.6V5.8l7-2.6Z" />
    <path d="M9 12.1l2.2 2.2 4-4.2" />
  </svg>
);
