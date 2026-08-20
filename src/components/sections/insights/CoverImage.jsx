import React from 'react';
import Image from 'next/image';

/**
 * The card's cover slot.
 *
 * Every card in this section is designed around a landscape photograph, so
 * this component always fills the same box whether or not the photograph
 * exists yet. When `src` is set it renders a real image; until then it paints
 * a neutral plate of identical geometry, which is what lets the covers be
 * dropped in later without touching a single layout rule.
 *
 * The placeholder is deliberately not an illustration or an icon — a drawing
 * would read as the final artwork and would have to be removed again. These
 * are flat, near-black washes in the site's own background tones, varied just
 * enough that a row of them reads as several distinct cards rather than one
 * long block. No accent colour appears anywhere in them.
 */

// Every stop sits clearly above the page's own #16142C, so a card reads as a
// deliberate object rather than a hole in the background. They stay neutral —
// the tonal spread is what a photograph would occupy, not an accent.
const PLACEHOLDERS = [
  'radial-gradient(115% 85% at 26% 16%, #363165 0%, #272348 52%, #1F1C3B 100%)',
  'radial-gradient(115% 85% at 72% 20%, #322D5D 0%, #242044 52%, #1C1937 100%)',
  'radial-gradient(115% 85% at 45% 78%, #3A3470 0%, #2A2650 52%, #211E42 100%)',
  'radial-gradient(115% 85% at 80% 70%, #2E2955 0%, #211E3F 52%, #1A1733 100%)',
  'radial-gradient(115% 85% at 15% 62%, #343061 0%, #262246 52%, #1E1B39 100%)',
];

// The zoom lives here rather than on the card so the frame stays put and only
// the picture moves — the same behaviour once real photographs are in place.
const ZOOM =
  'absolute inset-0 w-full h-full transition-transform duration-[900ms] ease-brand group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100';

// Mirrors the card's own widths in MediaCard (86vw / 72vw / 46vw / 42vw,
// capped at 620px) so the browser fetches one size down rather than the full
// plate. The source stills are ~3MB each; without this every visitor pays for
// all of them at full resolution.
const SIZES =
  '(max-width: 640px) 86vw, (max-width: 1024px) 72vw, (max-width: 1280px) 46vw, 620px';

export default function CoverImage({ src, alt = '', tone = 0 }) {
  if (src) {
    // `fill` rather than intrinsic dimensions: the frame is a fixed 16/10 and
    // the stills are not all 16/10, so the box has to win and object-cover
    // trims the difference.
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={SIZES}
        className={`${ZOOM} object-cover`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={ZOOM}
      style={{ background: PLACEHOLDERS[tone % PLACEHOLDERS.length] }}
    />
  );
}
