"use client";
import React, { useState } from 'react';

const initialsOf = (name = '') =>
  name
    .replace(/[^A-Za-z\s.]/g, '')
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/**
 * Portrait that degrades gracefully: if the file is missing or fails to load,
 * it swaps to a gradient initials badge rather than a broken-image icon.
 */
export default function Avatar({ src, name, className = '', textClass = 'text-3xl', dim = true }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className} grid place-items-center font-bold text-white bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 ${textClass}`}
        aria-label={name}
        role="img"
      >
        {initialsOf(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      // pointer-events-none keeps image-editing browser extensions (the Adobe
      // "Ps" badge, for one) from latching onto hover. Hover effects still work
      // because they are driven by the parent wrapper, not the image itself.
      //
      // Portraits are shot on bright studio backdrops, which read hot against a
      // near-black page. Knocking back brightness and saturation settles them
      // into the design; hovering restores the full image.
      className={
        `${className} object-cover object-top select-none pointer-events-none ` +
        (dim
          ? 'brightness-[0.82] saturate-[0.85] contrast-[1.05] transition-[filter] duration-500 ' +
            'group-hover:brightness-100 group-hover:saturate-100'
          : '')
      }
    />
  );
}
