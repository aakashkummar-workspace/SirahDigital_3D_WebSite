import fs from 'node:fs';
import path from 'node:path';
import { HOME_PRODUCTS } from '@/data/products';
import { PRODUCT_DETAILS } from '@/data/productDetails';

/*
 * Server-only. Resolves every product screenshot against what is actually in
 * public/, once per build.
 *
 * This is lib/industryImages.js applied to a second content type, and for the
 * same reason: data/productDetails.js names a screenshot for every slot, and
 * none of those files exist yet. Rather than ship broken <img> tags until they
 * are taken, a path with no file behind it becomes `src: null` and the frame
 * renders its caption as a placeholder instead. Drop a file into
 * public/products/<slug>/ and it appears with no other change.
 *
 * The warning matters as much as the fallback. Without it a typo in a path
 * would silently render as "screenshot not added yet" and look identical to
 * the intended state — which, with every single file currently missing, is a
 * state this feature will sit in for a while.
 *
 * This cannot live in data/productDetails.js: that module is imported by the
 * product card components, and node:fs would not survive the client bundle.
 */

const PUBLIC_DIR = path.join(process.cwd(), 'public');

/*
 * Intrinsic size, straight out of the PNG header.
 *
 * A PNG's IHDR chunk starts at byte 16 and its first two 32-bit fields are
 * width and height, so 24 bytes off the front of the file is the whole job —
 * no image library, and nothing decoded.
 *
 * The point is the crop. The frame's well is a 16/10 box with object-fit:
 * cover, which is right for a placeholder and wrong for a real screenshot of
 * a wider shape: a 2.07:1 dashboard dropped into a 1.6:1 well loses about a
 * tenth of its width off each side, and the first thing off the left edge is
 * the sidebar. Handing the real ratio to the component lets the box take the
 * shape of the image instead of the image taking the shape of the box.
 *
 * Returns null for anything that is not a PNG, which is the signal to keep
 * the default ratio rather than an error — a JPEG screenshot would simply be
 * framed at 16/10 until someone teaches this function SOI markers.
 */
function intrinsicSize(absPath) {
  let fd;
  try {
    fd = fs.openSync(absPath, 'r');
    const head = Buffer.alloc(24);
    if (fs.readSync(fd, head, 0, 24, 0) < 24) return null;
    if (head.toString('hex', 0, 8) !== '89504e470d0a1a0a') return null;
    const width = head.readUInt32BE(16);
    const height = head.readUInt32BE(20);
    return width > 0 && height > 0 ? { width, height } : null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

// A shot is { src, caption, desc? }. `src` is nulled when the file is missing,
// and `width`/`height` are added when it is there and readable.
function resolveShot(shot) {
  if (!shot?.src) return shot;
  const abs = path.join(PUBLIC_DIR, shot.src);
  if (!fs.existsSync(abs)) return { ...shot, src: null };
  return { ...shot, ...(intrinsicSize(abs) || {}) };
}

export const PRODUCT_DETAILS_WITH_IMAGES = Object.fromEntries(
  Object.entries(PRODUCT_DETAILS).map(([slug, detail]) => [
    slug,
    {
      ...detail,
      heroShot: resolveShot(detail.heroShot),
      screenshots: (detail.screenshots || []).map(resolveShot),
    },
  ])
);

export function getProductDetail(slug) {
  return PRODUCT_DETAILS_WITH_IMAGES[slug];
}

/* Both halves of a product in one call, for the page that renders both. */
export function getProduct(slug) {
  const product = HOME_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;
  return { ...product, detail: getProductDetail(slug) };
}

// ── build-time report ──────────────────────────────────────────────────────
const declared = Object.values(PRODUCT_DETAILS).flatMap((d) =>
  [d.heroShot, ...(d.screenshots || [])].filter((s) => s?.src).map((s) => s.src)
);
const missing = declared.filter((src) => !fs.existsSync(path.join(PUBLIC_DIR, src)));
if (missing.length) {
  console.warn(
    `[products] ${missing.length}/${declared.length} screenshots not found under public/ - ` +
      `those frames render as captioned placeholders:\n  ` +
      missing.join('\n  ')
  );
}
