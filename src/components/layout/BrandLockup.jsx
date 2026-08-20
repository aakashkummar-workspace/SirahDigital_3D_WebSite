import React from 'react';

// The logo mark plus wordmark, identical in the navbar and the footer apart
// from its size. Extracted rather than written out twice while both files
// were being rewritten for the multi-page layout.
//
// The mark used to sit inside a rounded tile — a cyan hairline border over a
// 5% cyan fill. It is bare now, at roughly the tile's old outer size, so the
// logo reads as itself rather than as an icon in a button. Nothing else about
// the lockup changed, and because both the navbar and the footer render this
// one component, removing the tile here removed it from both.
const SIZES = {
  sm: { img: 'w-9' },
  md: { img: 'w-10' },
};

export default function BrandLockup({ size = 'sm', interactive = false, className = '' }) {
  const s = SIZES[size] || SIZES.sm;

  return (
    <span className={`flex items-center gap-3 ${className}`}>
      {/* The real mark, lifted off its white background so its own
          blue-to-magenta gradient shows exactly as drawn.
          `interactive` used to brighten the tile's border; with no tile to
          brighten it lifts the mark itself. The parent <a> carries `group`. */}
      <img
        src="/logo-mark.png"
        alt=""
        className={`${s.img} h-auto transition-transform duration-300 ease-brand ${
          interactive ? 'group-hover:scale-105 motion-reduce:group-hover:scale-100' : ''
        }`}
      />
      {/* Solid white throughout. "DIGITAL" was cyan, which on the dark bar
          read as a link rather than as half the company's name and lost the
          wordmark its second half at a glance. */}
      <span className="text-xl font-extrabold tracking-tight whitespace-nowrap text-ink">
        SIRAH DIGITAL
      </span>
    </span>
  );
}
