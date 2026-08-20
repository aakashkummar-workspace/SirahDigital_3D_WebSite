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

/*
 * Two sets, because a placeholder is defined by its distance from the page,
 * not by its own value. On dark, every stop sits clearly *above* #16142C so
 * the card reads as an object rather than a hole; on white the same logic
 * runs the other way — the stops sit below #FFFFFF, in the cool greys the
 * rest of the light theme is built from, so a row of them reads as a row of
 * waiting frames rather than five dark slabs punched into the page.
 *
 * Selected by the --cover-set custom property so the choice happens in CSS
 * and no component has to subscribe to the theme to render a placeholder.
 * The geometry — the off-centre focal point, the 115%/85% spread — is shared,
 * which is what keeps the same card recognisable across a theme switch.
 */
const SPOTS = [
  '26% 16%', '72% 20%', '45% 78%', '80% 70%', '15% 62%',
];

const DARK_STOPS = [
  ['#363165', '#272348', '#1F1C3B'],
  ['#322D5D', '#242044', '#1C1937'],
  ['#3A3470', '#2A2650', '#211E42'],
  ['#2E2955', '#211E3F', '#1A1733'],
  ['#343061', '#262246', '#1E1B39'],
];

const LIGHT_STOPS = [
  ['#EEF0F7', '#E4E7F1', '#D8DCEA'],
  ['#ECEFF6', '#E1E5F0', '#D5D9E8'],
  ['#F0F1F8', '#E6E9F3', '#DADEEC'],
  ['#EAEDF5', '#DFE3EE', '#D3D8E6'],
  ['#EFF1F7', '#E5E8F2', '#D9DDEB'],
];

const ramp = (stops) => SPOTS.map((at, i) =>
  `radial-gradient(115% 85% at ${at}, ${stops[i][0]} 0%, ${stops[i][1]} 52%, ${stops[i][2]} 100%)`);

const PLACEHOLDERS = ramp(DARK_STOPS);
const PLACEHOLDERS_LIGHT = ramp(LIGHT_STOPS);

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
      className={`${ZOOM} cover-plate`}
      style={{
        // Both plates ride on the element; --cover-plate picks one. The
        // light block in globals.css is what flips it, so the choice is
        // resolved before paint rather than after hydration.
        '--cover-dark': PLACEHOLDERS[tone % PLACEHOLDERS.length],
        '--cover-light': PLACEHOLDERS_LIGHT[tone % PLACEHOLDERS_LIGHT.length],
        background: 'var(--cover-plate, var(--cover-dark))',
      }}
    />
  );
}
