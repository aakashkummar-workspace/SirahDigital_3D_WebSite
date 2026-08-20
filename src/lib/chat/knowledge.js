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

  /*
   * Decorative and structural exports — added after the bot was caught
   * answering real questions with them. Each line below is a sentence a
   * visitor actually received:
   *
   *   "do you work with real estate"      -> "1.08"          (ROI_INDUSTRIES)
   *   "do you do data entry automation"   -> "Chaos"         (SCENES)
   *   "do you build dashboards"           -> "Reviewing a build
   *                                           at a colleague's desk."
   *                                                          (CAROUSEL_CARDS)
   *
   * They are not content gaps that a better threshold would have caught. They
   * are copy written for a picture, a slider or an arithmetic coefficient, and
   * no phrasing of a question should ever be answered from them. The generic
   * walker above is still the rule; this is the list of things that are not
   * prose about the business, and it is the cheaper half of the trade — a
   * decorative export added later is a wrong answer, not a missing one, so it
   * is worth naming them.
   */
  'SCENES',          // homepage transformation captions: "Chaos", "Autopilot"
  'CAROUSEL_CARDS',  // photo captions for the about-page carousel
  'SOCIALS',         // profile links; `path` is raw SVG geometry, not a sentence
  'NAV_LINKS',       // the navbar
  'ROI_INDUSTRIES',  // calculator coefficients — automationFit, dealValue
  'BUSINESS_SIZES',  // calculator bands, whose only text is their own label
  'COMPANY_STATS',   // read directly by the `stats` intent, which needs value+label
  'PORTFOLIO_CTA',   // a single button
  'CHANNEL_URL',     // a YouTube URL

  /*
   * The step labels under each industry's flow diagram — 84 of them, and each
   * one a caption of three or four words ("Dispatch — Loads built and
   * released"). They read as content and index as content, but no visitor's
   * question is answered by one: they are the rungs of a picture, meaningless
   * without the diagram around them. Left in, they were 84 short entries in a
   * ~150-entry corpus, and short entries win BM25's length normalisation.
   *
   * The industries themselves answer these questions properly, out of
   * INDUSTRIES and INDUSTRY_CARDS, which is where the prose is.
   */
  'INDUSTRY_WORKFLOWS',
]);

// Field names whose values are never prose.
const NOISE_KEYS = new Set([
  'image', 'cover', 'photo', 'icon', 'logo', 'src', 'avatar',
  'alt', 'coverAlt', 'imageAlt',
  'accent', 'hover', 'color', 'colour', 'className', 'theme', 'gradient',
  'angle', 'x', 'y', 'z', 'width', 'height', 'duration', 'delay',
  // `voice` names the typeface a client's wordmark is set in — 'serif',
  // 'grotesk', 'didone'. It was becoming the summary of every client, so the
  // bot introduced Al Shifa Hospital as "book".
  'voice', 'font', 'typeface', 'variant', 'span', 'order', 'priority',
  // Positions and identifiers. `slug` is still used for titles and URLs below;
  // it just has no business being matched as prose.
  'slug', 'id', 'key', 'index',
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
  PRODUCT_DETAILS: (item) => (item.slug ? `/products/${item.slug}` : '/products'),
  PORTFOLIO_CATEGORIES: () => '/products#client-systems',
  MEMBER_PROJECTS: () => '/products#client-systems',
  TESTIMONIALS: () => '/products#client-systems',
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
  PRODUCT_DETAILS: 'Product',
  PORTFOLIO_CATEGORIES: 'Client work',
  MEMBER_PROJECTS: 'Client work',
  INDUSTRY_WORKFLOWS: 'Industry workflow',
  TESTIMONIALS: 'Testimonial',
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

  // SVG path geometry. data/socials.js carries one `path` per network, and the
  // field name is not on the noise list because "path" is a perfectly ordinary
  // word elsewhere. Shape catches it: a move-to command followed by a run of
  // coordinates, which no sentence looks like.
  if (/^[MmZzLlHhVvCcSsQqTtAa][\s\d.,-]/.test(value) && /\d/.test(value)) return true;

  // A bare number. ROI_INDUSTRIES is off the index now, but a stray figure
  // under any field is never an answer to anything — "1.08" was a real reply.
  if (/^[\d.,%+-]+$/.test(value)) return true;

  return false;
}

/**
 * Whether a string can stand as the sentence shown under a result.
 *
 * Stricter than looksLikeNoise, and deliberately so: the body may contain any
 * readable fragment, because matching on it costs nothing. The *summary* is
 * quoted back to the visitor as the answer, so a fragment that is technically
 * readable but says nothing — a one-word enum value, a repeat of the title —
 * is worse than having no summary at all, which at least makes the entry
 * unable to answer on its own.
 */
function looksLikeSentence(value, title) {
  if (!value || looksLikeNoise(value)) return false;
  if (title && value.trim().toLowerCase() === title.trim().toLowerCase()) return false;
  // One short word: 'serif', 'grotesk', 'mono', 'caps', 'book', 'didone'.
  if (!/\s/.test(value) && value.length < 18) return false;
  return true;
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

/** "aura-transcriber" -> "Aura Transcriber". Used when a record has no title. */
function humanizeSlug(slug) {
  return String(slug)
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** One indexable record. `body` is what search matches; `summary` is shown. */
function toEntry(item, exportName, index) {
  const isObject = item && typeof item === 'object' && !Array.isArray(item);

  const title = isObject
    ? // The slug is the fallback ahead of the export name, and it is what
      // stops twelve INDUSTRY_CARDS all being called "Industry" and five
      // PRODUCT_DETAILS all being called "Product Details". Those titles were
      // what the visitor saw under an answer, and they identified nothing.
      firstString(item, TITLE_KEYS) || (item.slug ? humanizeSlug(item.slug) : '')
    : typeof item === 'string'
      ? item
      : '';

  const declared = isObject ? firstString(item, SUMMARY_KEYS) : '';
  const summary = looksLikeSentence(declared, title) ? declared : '';

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
    // The fallback used to be `collectText(item)[1]` — whatever readable string
    // happened to land second. On CLIENTS that was the `voice` token, so the
    // bot's answer to "do you work with hospitals" was "Al Shifa Hospital —
    // book". Pick the longest fragment that actually reads as a sentence, and
    // accept having no summary when nothing does: an entry with no summary is
    // barred from answering on its own (see answer.js), which is the correct
    // outcome for a record that carries nothing to say.
    summary:
      summary ||
      (isObject
        ? collectText(item)
            .filter((text) => looksLikeSentence(text, title))
            .sort((a, b) => b.length - a.length)[0] || ''
        : ''),
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

        /*
         * A lookup whose values are *lists* — INDUSTRY_WORKFLOWS keyed by
         * industry, MEMBER_PROJECTS keyed by team member. Neither branch below
         * fitted it: `isLookup` requires object values, so both fell through to
         * "one object export, one entry" and collapsed. INDUSTRY_WORKFLOWS —
         * seven workflow steps across twelve industries, eighty-four records —
         * became a single entry titled "Industry workflow" whose whole summary
         * was "Booked online or by phone". Forty client projects under
         * MEMBER_PROJECTS became one entry called "Member Projects".
         *
         * Each item is indexed on its own, carrying the key it was filed under
         * so a step keeps the industry it belongs to.
         */
        const isListLookup =
          values.length > 1 && values.every((v) => Array.isArray(v) && v.length > 0);

        if (isListLookup) {
          for (const [key, list] of Object.entries(value)) {
            list.forEach((child, i) => {
              if (!child || typeof child !== 'object') return;
              const entry = toEntry({ ...child, group: humanizeSlug(key) }, exportName, `${key}-${i}`);
              if (entry) entries.push(entry);
            });
          }
        } else if (isLookup) {
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
