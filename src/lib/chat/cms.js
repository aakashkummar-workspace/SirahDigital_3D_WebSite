/**
 * Builds the chatbot's knowledge index from the CMS instead of the bundle.
 *
 * ── the problem this solves ──────────────────────────────────────────────
 * knowledge.js builds its index with `require.context` over src/data — a
 * webpack *build-time* glob. That index is frozen into the JS bundle, so a
 * service added in the CMS could never be answered no matter how many times
 * the site revalidated: revalidateTag re-renders pages, and a module-level
 * constant is not a page.
 *
 * This module fetches the same content over Payload's REST API at request
 * time, normalises it into the entry shape knowledge.js produces, and hands it
 * to answerQuestion. Server-only — it reads CMS_URL and must never reach a
 * browser.
 *
 * ── how it stays fresh, with no CMS changes ──────────────────────────────
 * The CMS already pings /api/revalidate with a per-collection tag on every
 * save (services, industries, team, …) — see sirah-cms/src/hooks/revalidate.ts.
 * So rather than inventing a `chat-knowledge` tag and teaching the CMS to send
 * it, each fetch below is tagged with the tag that collection *already*
 * broadcasts. Editing a service invalidates the services fetch and nothing
 * else, and the next question sees the new copy. No CMS edit was required to
 * make that work.
 *
 * ── degradation ──────────────────────────────────────────────────────────
 * Every failure path returns null and is dropped: no CMS_URL, a refused
 * connection, a non-200, a timeout, a shape that does not parse. The caller
 * merges what came back over the static index per source, so a CMS that is
 * asleep, half-seeded or unreachable costs nothing — the bot answers from the
 * bundle exactly as it did before. That is deliberate: a chatbot that dies
 * because a free-tier CMS is cold-starting is worse than a slightly stale one.
 */

const CMS_URL = process.env.CMS_URL;
const TIMEOUT_MS = 5000;
const PER_PAGE = 200;

/* ------------------------------------------------------------------ */
/* Field plucking — mirrors knowledge.js so both indexes agree          */
/* ------------------------------------------------------------------ */

const TITLE_KEYS = ['title', 'name', 'heading', 'label', 'authorName', 'question'];
const SUMMARY_KEYS = [
  'desc', 'description', 'blurb', 'bio', 'summary', 'excerpt', 'quote', 'answer', 'tagline',
];

/**
 * Flattens Payload's lexical richText into plain words.
 *
 * Only `root`, `children` and `text` are walked. Recursing over every value of
 * every object would also pull in format flags, ids and version numbers, which
 * are noise that BM25 would happily score against.
 */
function plain(node, depth = 0) {
  if (node == null || depth > 12) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map((n) => plain(n, depth + 1)).filter(Boolean).join(' ');
  if (typeof node !== 'object') return '';
  if (typeof node.text === 'string') return node.text;
  if (node.root) return plain(node.root, depth + 1);
  if (node.children) return plain(node.children, depth + 1);
  return '';
}

function pluck(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      const flat = plain(value).trim();
      if (flat) return flat;
    }
  }
  return '';
}

/** Everything textual on a record, for retrieval to match against. */
function collectBody(item) {
  const parts = [];
  for (const [key, value] of Object.entries(item || {})) {
    if (['id', 'createdAt', 'updatedAt', '_status'].includes(key)) continue;
    if (typeof value === 'string') parts.push(value);
    else if (value && typeof value === 'object') {
      const flat = plain(value);
      if (flat) parts.push(flat);
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 4000);
}

/* ------------------------------------------------------------------ */
/* What to fetch, and what each record becomes                         */
/* ------------------------------------------------------------------ */

/**
 * `source` and `kind` deliberately reuse the names the static index uses, so
 * every intent in answer.js keeps working untouched — `listEntries('SERVICES')`
 * does not care whether the entries came from a file or a database.
 *
 * `tag` is the tag the CMS already broadcasts for that collection.
 */
const COLLECTIONS = [
  {
    path: 'services', tag: 'services', source: 'SERVICES', kind: 'Service',
    url: (d) => (d.slug ? `/services#${d.slug}` : '/services'),
  },
  {
    path: 'industries', tag: 'industries', source: 'INDUSTRIES', kind: 'Industry',
    url: (d) => (d.slug ? `/industries/${d.slug}` : '/industries'),
  },
  {
    path: 'products', tag: 'products', source: 'HOME_PRODUCTS', kind: 'Product',
    // Was `d.href`, a field the Payload products collection does not define —
    // so this always fell through to /contact. Built from the slug instead,
    // which the collection does have, matching the industries line above.
    url: (d) => (d.slug ? `/products/${d.slug}` : '/products'),
  },
  {
    path: 'case-studies', tag: 'case-studies',
    // One collection, two sources — the `stage` select is what the case-study
    // band on /products uses to split "live in production" from "in build",
    // and the bot quotes those counts, so it has to split them the same way.
    source: (d) => (d.stage === 'development' ? 'DEVELOPMENT_PROJECTS' : 'PRODUCTION_PROJECTS'),
    kind: (d) => (d.stage === 'development' ? 'Project in build' : 'Live project'),
    url: () => '/products#client-systems',
  },
  {
    path: 'clients', tag: 'clients', source: 'CLIENTS', kind: 'Client',
    url: () => '/products#client-systems',
  },
  {
    path: 'team', tag: 'team',
    // isFounder promotes a member into the source the team intent reads first.
    source: (d) => (d.isFounder ? 'FOUNDER' : 'TEAM'),
    kind: 'Team',
    url: () => '/about',
  },
  {
    path: 'testimonials', tag: 'testimonials', source: 'TESTIMONIALS', kind: 'Testimonial',
    url: () => '/products#client-systems',
  },
  {
    path: 'insights', tag: 'insights', source: 'LATEST_INSIGHTS', kind: 'Insight',
    url: (d) => (d.href || d.url || '/about'),
  },
  {
    path: 'posts', tag: 'posts', source: 'LATEST_INSIGHTS', kind: 'Insight',
    url: (d) => (d.slug ? `/about#${d.slug}` : '/about'),
  },
];

/**
 * Globals hold one document rather than a list. Each is scanned for array
 * fields and every item in them becomes an entry — the shape of `methodology`
 * is defined in the CMS and can change there, so reading it structurally is
 * what keeps this from breaking on the next field rename.
 */
const GLOBALS = [
  { path: 'methodology', tag: 'methodology', source: 'METHODOLOGY', kind: 'How we work', url: () => '/services' },
  { path: 'site-settings', tag: 'site-settings', source: 'COMPANY', kind: 'About Sirah', url: () => '/contact' },
];

/* ------------------------------------------------------------------ */
/* Fetching                                                            */
/* ------------------------------------------------------------------ */

async function get(path, tag) {
  if (!CMS_URL) return null;
  try {
    const res = await fetch(`${CMS_URL}/api/${path}`, {
      headers: { Accept: 'application/json' },
      // The tag is what /api/revalidate already invalidates on a CMS save.
      // The revalidate window is the backstop for a webhook that never lands.
      next: { tags: [tag], revalidate: 3600 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Unreachable, refused, timed out, or not JSON. All the same to the caller.
    return null;
  }
}

function toEntry(doc, spec) {
  const title = pluck(doc, TITLE_KEYS);
  if (!title) return null;
  const resolve = (value) => (typeof value === 'function' ? value(doc) : value);
  return {
    kind: resolve(spec.kind),
    source: resolve(spec.source),
    title,
    summary: pluck(doc, SUMMARY_KEYS),
    body: collectBody(doc),
    url: spec.url(doc),
  };
}

/**
 * Fetches everything and returns a flat entry list.
 *
 * Collections are fetched concurrently — the whole point of this living behind
 * one route handler is that a visitor waits for the slowest fetch, not the sum
 * of them. A source that fails is simply absent from the result, which is what
 * lets the caller fall back to the bundle per source rather than wholesale.
 */
export async function fetchCmsKnowledge() {
  if (!CMS_URL) return { entries: [], sources: new Set(), ok: false };

  const collectionJobs = COLLECTIONS.map(async (spec) => {
    const json = await get(`${spec.path}?limit=${PER_PAGE}&depth=0`, spec.tag);
    const docs = Array.isArray(json?.docs) ? json.docs : null;
    if (!docs) return [];
    return docs.map((d) => toEntry(d, spec)).filter(Boolean);
  });

  const globalJobs = GLOBALS.map(async (spec) => {
    const json = await get(`globals/${spec.path}?depth=0`, spec.tag);
    if (!json || typeof json !== 'object') return [];
    const out = [];
    // The global itself is one entry when it carries a title of its own.
    const own = toEntry(json, spec);
    if (own) out.push(own);
    for (const value of Object.values(json)) {
      if (!Array.isArray(value)) continue;
      for (const item of value) {
        if (!item || typeof item !== 'object') continue;
        const entry = toEntry(item, spec);
        if (entry) out.push(entry);
      }
    }
    return out;
  });

  const settled = await Promise.all([...collectionJobs, ...globalJobs]);
  const entries = settled.flat();
  const sources = new Set(entries.map((e) => e.source));

  return { entries, sources, ok: entries.length > 0 };
}

/**
 * Merges CMS entries over the static index, one source at a time.
 *
 * Per source, not wholesale: a CMS that has been seeded with services but not
 * yet with team should answer services from the database and team from the
 * bundle. Replacing the whole index the moment one collection returned would
 * silently empty every answer the CMS has no rows for.
 */
export function mergeKnowledge(staticEntries, cms) {
  if (!cms?.entries?.length) return staticEntries;
  const overridden = cms.sources;
  const kept = staticEntries.filter((e) => !overridden.has(e.source));
  return [...cms.entries, ...kept];
}
