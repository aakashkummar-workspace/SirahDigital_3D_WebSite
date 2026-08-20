/**
 * The chatbot's knowledge base — every piece of content on this site, as a
 * flat list of searchable entries.
 *
 * The brief was that the bot answers from the website's own content and that
 * anything added or edited later shows up without someone remembering to
 * update the bot. That rules out a hand-written FAQ, which is a second copy of
 * the site that starts drifting the day it is written. So nothing here is
 * authored: the index is derived from src/data/ — the same modules the pages
 * render from — and it is derived generically, at three levels:
 *
 *   a new item in a collection   (a 13th industry, an 11th service)
 *   a new field on an item       (a `caseStudy` line on a project)
 *   a new data file entirely     (src/data/partners.js)
 *
 * The first two fall out of walking objects rather than naming fields. The
 * third is why the imports are a require.context glob instead of seventeen
 * import lines: drop a file into src/data/ and the next build indexes it.
 *
 * The cost of being generic is that the walker sees fields that are not prose
 * — image paths, Tailwind class strings, hex colours, timing constants. Those
 * are filtered by NOISE_KEYS and looksLikeNoise() rather than by an allowlist
 * of good fields, because an allowlist is exactly the thing that would need
 * updating when a field is added.
 *
 * This module is imported only by the chat panel, which is loaded on demand,
 * so none of it is in the initial page bundle.
 */

/* ------------------------------------------------------------------ */
/* What counts as content                                              */
/* ------------------------------------------------------------------ */

// Exports that are configuration rather than content. Indexing these produces
// entries like "SCENE_MS: 5200" that match a stray number and answer nothing.
const NOT_CONTENT = new Set([
  'SCENE_MS',        // carousel timing
  'LEGACY_ANCHORS',  // old-URL redirect map
  'ROUTES',          // route table (nav covers the same ground readably)
  'ROI_INPUTS',      // calculator field config
  'ROI_DEFAULTS',    // calculator starting values
  'VOLUME_PER_EMPLOYEE',
  'ORBIT_NODES',     // decorative positions
]);

// Field names whose values are never prose.
const NOISE_KEYS = new Set([
  'image', 'cover', 'photo', 'icon', 'logo', 'src', 'avatar',
  'alt', 'coverAlt', 'imageAlt',
  'accent', 'hover', 'color', 'colour', 'className', 'theme', 'gradient',
  'angle', 'x', 'y', 'z', 'width', 'height', 'duration', 'delay',
]);

const TITLE_KEYS = ['title', 'name', 'heading', 'label', 'question'];
const SUMMARY_KEYS = ['desc', 'description', 'blurb', 'bio', 'summary', 'answer', 'tagline'];
const URL_KEYS = ['href', 'url', 'link', 'youtubeUrl'];

/**
 * Where an entry from a given export should link. Anything not listed still
 * gets indexed — it just links to the homepage unless the item carries its own
 * href. That fallback is deliberate: an unlisted new export is a content gap,
 * not an error, and a wrong-but-present answer beats a missing one.
 */
const ROUTE_BY_EXPORT = {
  SERVICES: (item) => (item.slug ? `/services#${item.slug}` : '/services'),
  SERVICE_EXPERIENCE: (item) => (item.slug ? `/services#${item.slug}` : '/services'),
  METHODOLOGY: () => '/about#process',
  TECHNOLOGIES: () => '/services',
  INDUSTRIES: (item) => (item.slug ? `/industries/${item.slug}` : '/industries'),
  INDUSTRY_INTELLIGENCE: (item) => (item.slug ? `/industries/${item.slug}` : '/industries'),
  INDUSTRY_WORKFLOWS: (item) => (item.slug ? `/industries/${item.slug}` : '/industries'),
  INDUSTRY_CARDS: (item) => (item.slug ? `/industries/${item.slug}` : '/industries'),
  PRODUCTION_PROJECTS: () => '/products#client-systems',
  DEVELOPMENT_PROJECTS: () => '/products#client-systems',
  CLIENTS: () => '/products#client-systems',
  TEAM: () => '/about',
  FOUNDER: () => '/about',
  LATEST_INSIGHTS: () => '/about',
  HOME_PRODUCTS: (item) => item.href || '/contact',
  COMPANY: () => '/contact',
  SOCIALS: (item) => item.href || item.url || '/contact',
  ROI_INDUSTRIES: () => '/services',
  BUSINESS_SIZES: () => '/services',
  CAROUSEL_CARDS: () => '/',
  SCENES: () => '/',
  NAV_LINKS: (item) => item.href || '/',
};

/**
 * Human-readable category, shown to the visitor as "— Service" under a result
 * and used by the answer composer to group. Derived from the export name when
 * absent, so a new export is labelled sensibly without being listed here.
 */
const KIND_BY_EXPORT = {
  SERVICES: 'Service',
  SERVICE_EXPERIENCE: 'Service',
  METHODOLOGY: 'How we work',
  TECHNOLOGIES: 'Technology',
  INDUSTRIES: 'Industry',
  INDUSTRY_INTELLIGENCE: 'Industry',
  INDUSTRY_WORKFLOWS: 'Industry workflow',
  INDUSTRY_CARDS: 'Industry',
  PRODUCTION_PROJECTS: 'Live project',
  DEVELOPMENT_PROJECTS: 'Project in build',
  CLIENTS: 'Client',
  TEAM: 'Team',
  FOUNDER: 'Team',
  LATEST_INSIGHTS: 'Insight',
  HOME_PRODUCTS: 'Product',
  COMPANY: 'About Sirah',
  ROI_INDUSTRIES: 'ROI calculator',
  BUSINESS_SIZES: 'ROI calculator',
  CAROUSEL_CARDS: 'Highlight',
  SCENES: 'Highlight',
};

function humanizeExportName(name) {
  return name
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/* Reading src/data                                                    */
/* ------------------------------------------------------------------ */

/**
 * Every module in src/data, resolved at build time by webpack.
 *
 * require.context rather than explicit imports so a newly added data file is
 * picked up on the next build with no edit here — the third level of the
 * auto-update guarantee described at the top. It is a webpack API and Next 14
 * builds with webpack, but it is wrapped because a bundler that does not
 * implement it should degrade to an empty index (bot says it cannot help)
 * rather than crash the page it is mounted on.
 */
function loadDataModules() {
  try {
    // eslint-disable-next-line no-undef
    const ctx = require.context('../../data', false, /\.js$/);

    // Deduplicated by module identity, and it is load-bearing rather than
    // defensive: webpack's context lists the same file under more than one
    // request form, so ctx.keys() walks src/data twice. Indexing both copies
    // doubled every entry — and because the bot's frames read their numbers
    // off the index, it told visitors we deliver 20 services and work across
    // 24 sectors. The counts, not just the index size, are what this protects.
    //
    // Identity rather than filename: whichever key resolves it, webpack hands
    // back the same module object, so this holds regardless of the key shapes
    // a future webpack version emits.
    const seen = new Set();
    const modules = [];
    for (const key of ctx.keys()) {
      const module = ctx(key);
      if (!module || seen.has(module)) continue;
      seen.add(module);
      modules.push({ file: key.replace('./', ''), module });
    }
    return modules;
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Turning arbitrary data into searchable text                         */
/* ------------------------------------------------------------------ */

/**
 * Strings that are markup, paths or styling rather than something a visitor
 * would read. Checked by shape, not by field name, so it also catches a class
 * string that arrives under a field nobody thought to add to NOISE_KEYS.
 */
function looksLikeNoise(value) {
  if (value.length < 2) return true;
  if (/^[/#.]/.test(value)) return true;                     // /images/x.png, #anchor
  if (/^https?:\/\//.test(value)) return true;
  if (/^(rgba?|hsla?)\(/.test(value)) return true;
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return true;          // hex colour
  if (/\.(png|jpe?g|svg|webp|gif|mp4)$/i.test(value)) return true;
  // Tailwind-ish: "text-brand-cyan", "hover:border-brand-cyan/40"
  if (/^[a-z0-9:/[\]-]+$/.test(value) && /-/.test(value) && !/\s/.test(value)) return true;
  return false;
}

/** Collect every readable string inside a value, depth-limited. */
function collectText(value, depth = 0, out = []) {
  if (depth > 5 || value == null) return out;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed && !looksLikeNoise(trimmed)) out.push(trimmed);
    return out;
  }
  if (typeof value === 'number') {
    out.push(String(value));
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectText(item, depth + 1, out);
    return out;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (NOISE_KEYS.has(key)) continue;
      collectText(child, depth + 1, out);
    }
  }
  return out;
}

function firstString(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

/** One indexable record. `body` is what search matches; `summary` is shown. */
function toEntry(item, exportName, index) {
  const isObject = item && typeof item === 'object' && !Array.isArray(item);

  const title = isObject
    ? firstString(item, TITLE_KEYS)
    : typeof item === 'string'
      ? item
      : '';

  const summary = isObject ? firstString(item, SUMMARY_KEYS) : '';

  // Everything readable, including the title and any field added later. The
  // title is repeated so a title-word match scores above a body-only match
  // without needing a separate field-weighting pass in the scorer.
  const body = [title, title, summary, ...collectText(item)].filter(Boolean).join(' . ');

  if (!body.trim()) return null;

  const route = ROUTE_BY_EXPORT[exportName];
  const url = (isObject && firstString(item, URL_KEYS)) || (route ? route(isObject ? item : {}) : '/');

  return {
    id: `${exportName}:${(isObject && (item.slug || item.id)) || index}`,
    kind: KIND_BY_EXPORT[exportName] || humanizeExportName(exportName),
    source: exportName,
    title: title || KIND_BY_EXPORT[exportName] || humanizeExportName(exportName),
    summary: summary || (isObject ? collectText(item)[1] || '' : ''),
    body,
    url,
  };
}

/* ------------------------------------------------------------------ */
/* The index                                                           */
/* ------------------------------------------------------------------ */

function buildKnowledge() {
  const entries = [];

  for (const { module } of loadDataModules()) {
    for (const [exportName, value] of Object.entries(module)) {
      if (NOT_CONTENT.has(exportName)) continue;
      if (typeof value === 'function' || typeof value === 'number') continue;

      if (Array.isArray(value)) {
        value.forEach((item, i) => {
          const entry = toEntry(item, exportName, i);
          if (entry) entries.push(entry);
        });
      } else if (value && typeof value === 'object') {
        // A single object export (COMPANY, FOUNDER) is one entry — unless it
        // is a lookup keyed by slug (INDUSTRY_INTELLIGENCE), in which case each
        // value is its own entry. Distinguished by whether the values are
        // themselves objects, which is what a lookup looks like.
        const values = Object.values(value);
        const isLookup =
          values.length > 1 && values.every((v) => v && typeof v === 'object' && !Array.isArray(v));

        if (isLookup) {
          for (const [key, child] of Object.entries(value)) {
            const entry = toEntry({ slug: key, ...child }, exportName, key);
            if (entry) entries.push(entry);
          }
        } else {
          const entry = toEntry(value, exportName, 0);
          if (entry) entries.push(entry);
        }
      }
    }
  }

  return entries;
}

/** Every piece of site content, flat. Built once per bundle load. */
export const KNOWLEDGE = buildKnowledge();

/** Diagnostics for the smoke test — see scripts/chat-check.mjs. */
export const KNOWLEDGE_STATS = {
  entries: KNOWLEDGE.length,
  sources: [...new Set(KNOWLEDGE.map((e) => e.source))].sort(),
  kinds: [...new Set(KNOWLEDGE.map((e) => e.kind))].sort(),
};
