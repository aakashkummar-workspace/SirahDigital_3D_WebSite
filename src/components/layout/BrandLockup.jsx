import React from 'react';

// The logo tile plus wordmark, identical in the navbar and the footer apart
// from its size. Extracted rather than written out twice while both files
// were being rewritten for the multi-page layout.
const SIZES = {
  sm: { box: 'w-11 h-11', img: 'w-7' },
  md: { box: 'w-12 h-12', img: 'w-8' },
};

export default function BrandLockup({ size = 'sm', interactive = false, className = '' }) {
  const s = SIZES[size] || SIZES.sm;

  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span
        className={`${s.box} rounded-xl grid place-items-center border transition-colors border-cyan-400/30 bg-cyan-400/5 ${
          interactive ? 'group-hover:border-cyan-400/60' : ''
        }`}
      >
        {/* The real mark, lifted off its white background so its own
            blue-to-magenta gradient shows exactly as drawn. */}
        <img src="/logo-mark.png" alt="" className={`${s.img} h-auto`} />
      </span>
      <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
        <span className="text-white">SIRAH </span>
        <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
          DIGITAL
        </span>
      </span>
    </span>
  );
}
