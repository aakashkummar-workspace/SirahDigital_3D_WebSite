import { LATEST_INSIGHTS } from '@/data/insightsData';

/*
 * The Latest Insights row, from the CMS.
 *
 * Server-only. Reads CMS_API_BASE and must never reach a client bundle.
 *
 * Until now this row was a hardcoded array in data/insightsData.js, so adding
 * a film meant a code change and a deploy. The `insights` collection in the
 * CMS has carried the right fields all along — cover, title, description,
 * youtubeUrl — and nothing read them. This is the wire.
 *
 * ── degradation ──────────────────────────────────────────────────────────
 * Every failure path falls back to the bundled array: no CMS_API_BASE, a
 * refused connection, a timeout, a non-200, or an empty collection. That last
 * one matters — an editor who has not added anything yet should see the
 * existing row, not an empty carousel.
 *
 * Cached under the `insights` tag, which the CMS already broadcasts on save
 * (see the collection's afterChange hook), so publishing a change shows up
 * within seconds rather than at the next deploy.
 */

const CMS_API_BASE = (process.env.CMS_API_BASE || '').replace(/\/$/, '');
const TIMEOUT_MS = 5000;

/*
 * The card reads `cover` as a plain URL string. Payload returns the whole
 * media doc at depth=1, and its `url` is already absolute — s3Storage's
 * generateFileURL builds it from S3_PUBLIC_URL. A relation left empty comes
 * back null, and the card falls back to a neutral plate of the same shape.
 */
const toCard = (doc) => ({
  id: doc.id != null ? `cms-${doc.id}` : doc.slug,
  cover: doc.cover?.url ?? null,
  coverAlt: doc.cover?.alt ?? '',
  title: doc.title,
  description: doc.description ?? null,
  youtubeUrl: doc.youtubeUrl ?? null,
  category: doc.category ?? null,
  duration: doc.duration ?? null,
  date: doc.date ?? null,
  theme: doc.theme ?? null,
});

export async function getLatestInsights() {
  if (!CMS_API_BASE) return LATEST_INSIGHTS;

  try {
    const res = await fetch(
      `${CMS_API_BASE}/insights?limit=24&depth=1&sort=order&where[_status][equals]=published`,
      {
        headers: { Accept: 'application/json' },
        next: { tags: ['insights'], revalidate: 3600 },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!res.ok) return LATEST_INSIGHTS;

    const json = await res.json();
    const docs = Array.isArray(json?.docs) ? json.docs : [];
    // A card with no title has nothing to render under the cover.
    const cards = docs.filter((d) => d?.title).map(toCard);
    return cards.length ? cards : LATEST_INSIGHTS;
  } catch {
    return LATEST_INSIGHTS;
  }
}
