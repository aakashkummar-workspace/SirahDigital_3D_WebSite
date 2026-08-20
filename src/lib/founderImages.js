import fs from 'node:fs';
import path from 'node:path';
import { FOUNDER } from '@/data/team';

/*
 * Server-only. Resolves the About hero's artwork against what is on disk.
 *
 * Same shape as lib/productImages.js and lib/industryImages.js, and here for
 * the same reason: the hero is full-bleed and wants a landscape shot, while
 * the only founder image the team roster carries is a 293x512 portrait.
 * Stretching that across a hero is visibly soft, so the two cases are told
 * apart rather than pretended to be the same.
 *
 *   src    the widest asset available
 *   small  a narrower cut for phones, or null. Never upscaled past the
 *          source, so this is absent when the source is small to begin with
 *   wide   whether `src` is a genuine landscape hero. The stylesheet branches
 *          on it: false gets a heavier scrim and a slight blur, so a small
 *          portrait reads as a treatment rather than as a bad image
 *
 * The assets are generated from the supplied PNG, which is 1.4MB — far too
 * heavy for something above the fold. public/team/riyaz-hero.jpg is the same
 * frame at 1536px and 77KB; -sm is 1024px and 41KB for phones, where `cover`
 * crops the sides off anyway and the extra pixels would never be seen.
 */

const PUBLIC_DIR = path.join(process.cwd(), 'public');

const HERO = '/team/riyaz-hero.jpg';
const HERO_SM = '/team/riyaz-hero-sm.jpg';

const onDisk = (src) => Boolean(src) && fs.existsSync(path.join(PUBLIC_DIR, src));

export function founderHero() {
  if (onDisk(HERO)) {
    return { src: HERO, small: onDisk(HERO_SM) ? HERO_SM : HERO, wide: true };
  }
  // No landscape hero: fall back to the roster portrait rather than nothing.
  if (onDisk(FOUNDER.photo)) {
    return { src: FOUNDER.photo, small: FOUNDER.photo, wide: false };
  }
  // Neither on disk: the hero drops the image layer entirely rather than
  // rendering a broken one. The scrim and the type carry it.
  return { src: null, small: null, wide: false };
}
