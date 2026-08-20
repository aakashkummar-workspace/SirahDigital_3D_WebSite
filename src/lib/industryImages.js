import fs from 'node:fs';
import path from 'node:path';
import { INDUSTRIES } from '@/data/industries';

/*
 * Server-only. Resolves each sector's photograph against what is actually in
 * public/, once per build.
 *
 * industries.js names a photograph for every sector, but the files are still
 * being sourced. Rather than ship broken <img> tags until they land, a path
 * with no file behind it becomes `image: null` and the tile falls back to its
 * captioned placeholder. Drop a file into public/industries/ and it appears
 * with no other change.
 *
 * The warning matters as much as the fallback: without it, a typo in a path
 * would silently render as "photograph not added yet" and look identical to
 * the intended state.
 *
 * This cannot live in data/industries.js — that module is imported by client
 * components, and node:fs would not survive the bundle.
 */

const PUBLIC_DIR = path.join(process.cwd(), 'public');

export const INDUSTRIES_WITH_IMAGES = INDUSTRIES.map((industry) => {
  if (!industry.image) return industry;
  const onDisk = fs.existsSync(path.join(PUBLIC_DIR, industry.image));
  return onDisk ? industry : { ...industry, image: null };
});

export function getIndustry(slug) {
  return INDUSTRIES_WITH_IMAGES.find((i) => i.slug === slug);
}

const missing = INDUSTRIES.filter((i) => i.image && !getIndustry(i.slug).image);
if (missing.length) {
  console.warn(
    `[industries] ${missing.length}/${INDUSTRIES.length} photographs not found under public/ - ` +
      `those tiles render as placeholders:\n  ` +
      missing.map((i) => i.image).join('\n  ')
  );
}
