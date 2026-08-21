/**
 * Local retrieval over the site's content index. No network, no API key.
 *
 * This is BM25 — the standard bag-of-words ranking function — over the entries
 * from knowledge.js. It is chosen over naive keyword counting for two reasons
 * that matter on a corpus this small:
 *
 *   IDF   "automation" appears in most entries on this site and carries almost
 *         no signal; "OCR" appears in three and is decisive. Term counting
 *         treats them the same and surfaces the wrong page.
 *   Length normalisation
 *         INDUSTRY_INTELLIGENCE entries are ten times longer than a SERVICES
 *         entry. Without it, the long ones win every query by sheer surface
 *         area.
 *
 * The index is built once when this module first loads, which happens when the
 * visitor opens the chat panel — not on page load.
 */

/**
 * Words too common in English, or too common on this particular site, to
 * discriminate between entries. The site-specific half matters as much as the
 * English half: on a page where nearly everything is about AI automation for
 * business, those three words are stopwords in practice.
 */
const STOPWORDS = new Set([
  // English
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'am', 'do', 'does', 'did', 'doing', 'have', 'has', 'had',
  'i', 'me', 'my', 'we', 'our', 'us', 'you', 'your', 'it', 'its', 'they', 'them',
  'their', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom',
  'how', 'when', 'where', 'why', 'can', 'could', 'will', 'would', 'shall',
  'should', 'may', 'might', 'must', 'of', 'to', 'in', 'on', 'at', 'by', 'for',
  'with', 'about', 'into', 'from', 'up', 'down', 'out', 'off', 'over', 'under',
  'again', 'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'also', 'as', 'get', 'got',
  'tell', 'give', 'show', 'want', 'need', 'like', 'please', 'thanks',
  // Site-specific: true of almost every entry, so they separate nothing
  'sirah', 'digital', 'business', 'businesses', 'solution', 'solutions',
  'service', 'services', 'company', 'help', 'provide', 'offer',
]);

/**
 * Crude suffix stripping so "automating", "automation" and "automate" collide.
 * A real stemmer (Porter) is ~200 lines and buys very little on a corpus of a
 * hundred short marketing entries — the words that actually get searched here
 * are domain nouns, not inflected verbs.
 */
function stem(word) {
  if (word.length <= 4) return word;
  for (const suffix of ['ations', 'ation', 'ements', 'ement', 'ingly', 'ing', 'ies', 'ed', 'es', 's']) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      const root = word.slice(0, word.length - suffix.length);
      return suffix === 'ies' ? `${root}y` : root;
    }
  }
  return word;
}

/**
 * What visitors call things, mapped to what the site calls them.
 *
 * The corpus is written in the company's own register — "Healthcare &
 * Wellness", "Hospitality & Travel", "Custom Web & Mobile Apps". Visitors do
 * not write in that register. They write "do you work with hospitals", "do you
 * do restaurants", "can you build a website", and BM25 scored every one of
 * those at zero, because not one of the words is in the document. The bot then
 * answered from whichever unrelated page shared an incidental term: "do you
 * work with restaurants" came back with the company blurb.
 *
 * This is a vocabulary, not a set of claims. Every line maps a word a person
 * uses to a word the site already uses, and it can state nothing the site does
 * not — the mapping only decides which of our own pages gets read out. That is
 * what makes it safe to author here while facts stay derived.
 *
 * Expansion is query-side only: the document index is untouched, so a synonym
 * can lift a page's rank but can never put a word in its mouth. Terms are
 * added to the query, not substituted, so "hospital" still matches the word
 * "hospital" where it genuinely appears — Al Shifa Hospital stays findable.
 */
const SYNONYMS = {
  // Industries, by what the customer calls their own business.
  hospital: ['healthcare', 'clinic', 'patient'],
  clinic: ['healthcare', 'patient'],
  doctor: ['healthcare', 'clinic', 'patient'],
  patient: ['healthcare'],
  medical: ['healthcare', 'clinic'],
  dental: ['healthcare', 'clinic'],
  dentist: ['healthcare', 'clinic'],
  pharmacy: ['healthcare'],
  ayurveda: ['healthcare', 'clinic'],
  nutrition: ['healthcare', 'wellness'],
  school: ['education', 'student', 'edtech'],
  college: ['education', 'student'],
  university: ['education', 'student'],
  student: ['education'],
  institute: ['education', 'student'],
  coaching: ['education', 'student'],
  tuition: ['education', 'student'],
  academy: ['education', 'student'],
  restaurant: ['hospitality', 'guest', 'booking'],
  cafe: ['hospitality', 'guest'],
  hotel: ['hospitality', 'guest', 'booking'],
  resort: ['hospitality', 'guest'],
  shop: ['retail', 'ecommerce', 'inventory'],
  store: ['retail', 'ecommerce', 'inventory'],
  supermarket: ['retail', 'inventory'],
  ecommerce: ['retail', 'inventory'],
  factory: ['manufacturing', 'production'],
  plant: ['manufacturing', 'production'],
  lawyer: ['legal', 'contract', 'document'],
  advocate: ['legal', 'contract', 'document'],
  law: ['legal'],
  court: ['legal'],
  property: ['estate', 'lead'],
  realtor: ['estate', 'lead'],
  broker: ['estate', 'lead'],
  apartment: ['estate'],
  car: ['automotive', 'vehicle'],
  vehicle: ['automotive'],
  dealership: ['automotive', 'vehicle'],
  garage: ['automotive'],
  courier: ['logistics', 'delivery'],
  shipping: ['logistics', 'delivery'],
  fleet: ['logistics', 'delivery', 'route'],
  transport: ['logistics', 'delivery'],
  warehouse: ['logistics', 'inventory'],
  recruitment: ['resources', 'candidate', 'interview'],
  recruiting: ['resources', 'candidate', 'interview'],
  candidate: ['resources', 'interview'],
  contractor: ['construction', 'project'],
  builder: ['construction', 'project'],
  civil: ['construction'],
  accountant: ['professional', 'document'],
  consultant: ['professional'],

  // Services, by what people ask for rather than what the card is titled.
  website: ['web', 'app'],
  webpage: ['web'],
  site: ['web'],
  app: ['mobile', 'web'],
  application: ['mobile', 'web', 'app'],
  android: ['mobile', 'app'],
  ios: ['mobile', 'app'],
  bot: ['chatbot', 'agent'],
  assistant: ['chatbot', 'voice', 'agent'],
  invoice: ['document', 'ocr'],
  bill: ['document', 'ocr'],
  receipt: ['document', 'ocr'],
  scan: ['document', 'ocr'],
  scanning: ['document', 'ocr'],
  paperwork: ['document', 'ocr'],
  report: ['dashboard', 'intelligence'],
  reporting: ['dashboard', 'intelligence'],
  analytics: ['dashboard', 'intelligence'],
  dashboard: ['intelligence'],
  api: ['integration'],
  connect: ['integration'],
  integrate: ['integration'],
  crm: ['erp'],
  erp: ['crm'],
};

/**
 * Query words plus their synonyms — expanded before stemming, not after.
 *
 * The order is the whole subtlety. Stemming first would mean looking the table
 * up under stems: "invoices" stems to "invoic" while "invoice" stays
 * "invoice", so one key could never serve both and half the entries here would
 * silently never fire. Expanding on the written word and stemming the result
 * means the table is keyed on English, and both the query term and the synonym
 * reach the index through exactly the path a document word took.
 */
function synonymsFor(word) {
  // The written word, then the obvious singulars — "hospitals", "clinics",
  // "industries" — so the table needs one entry per idea, not per inflection.
  const forms = [word];
  if (word.endsWith('ies')) forms.push(`${word.slice(0, -3)}y`);
  if (word.endsWith('es')) forms.push(word.slice(0, -2));
  if (word.endsWith('s')) forms.push(word.slice(0, -1));

  for (const form of forms) {
    if (SYNONYMS[form]) return SYNONYMS[form];
  }
  return [];
}

function words(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s+#-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
}

export function tokenize(text) {
  return words(text).map(stem).filter((word) => word.length > 1);
}

/**
 * A query as a list of *concepts* rather than a flat list of terms.
 *
 * Each concept is one thing the visitor asked about, carrying every stem that
 * counts as having found it — the word itself plus its synonyms. Grouping
 * matters because of what coverage means. Coverage is the share of the
 * question an entry explains, and it is the term that refuses off-topic
 * matches; flattening synonyms into the term list would inflate the
 * denominator, so "do you work with hospitals" would go from two things asked
 * to five, and an entry answering it perfectly would score 3/5 and be turned
 * away for not covering enough of a question it covered entirely.
 *
 * So a concept is matched if any of its stems is present, and it counts once.
 * Synonyms can raise a score; they can no longer lower a coverage.
 */
function conceptsIn(text) {
  const out = [];
  const seen = new Set();

  for (const word of words(text)) {
    const root = stem(word);
    if (root.length <= 1 || seen.has(root)) continue;
    seen.add(root);

    const variants = new Set([root]);
    for (const extra of synonymsFor(word)) {
      const stemmed = stem(extra);
      if (stemmed.length > 1) variants.add(stemmed);
    }
    out.push({ term: root, variants: [...variants] });
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Index                                                               */
/* ------------------------------------------------------------------ */

// BM25 constants. k1 damps the effect of repeating a term (a page saying
// "OCR" eight times is not eight times more about OCR); b controls how hard
// length normalisation bites. These are the standard defaults and there is no
// tuning set here to justify moving them.
const K1 = 1.5;
const B = 0.75;

function buildIndex(entries) {
  const docs = entries.map((entry) => {
    const tokens = tokenize(entry.body);
    const frequencies = new Map();
    for (const token of tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1);
    // Kept separately from the body so a match can be told apart from a
    // mention — see `titleBoost` in search().
    return { entry, frequencies, length: tokens.length, title: new Set(tokenize(entry.title || '')) };
  });

  // How many documents contain each term — the input to IDF.
  const documentFrequency = new Map();
  for (const doc of docs) {
    for (const token of doc.frequencies.keys()) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }

  const averageLength = docs.reduce((sum, d) => sum + d.length, 0) / (docs.length || 1);

  /*
   * How many entries share each URL — the input to the dedupe rule below.
   *
   * A URL that belongs to one subject is an identity: `/industries/healthcare`
   * is reached by INDUSTRIES, INDUSTRY_INTELLIGENCE and INDUSTRY_CARDS, which
   * are three descriptions of one industry, and the visitor should see it once.
   * A URL that dozens of entries share is a *listing*:
   * `/products` is where every client, every project and every
   * portfolio row points, and collapsing those would leave one client standing
   * for all of them.
   *
   * Counting is what tells them apart, and it costs one pass at index time.
   * The alternative — naming the listing routes in a constant — is a list that
   * goes stale the first time somebody adds a page.
   */
  const urlFrequency = new Map();
  for (const doc of docs) {
    const url = doc.entry.url || '';
    urlFrequency.set(url, (urlFrequency.get(url) || 0) + 1);
  }

  return { docs, documentFrequency, averageLength, urlFrequency, total: docs.length };
}

/**
 * Built indexes, keyed by the entry array they were built from.
 *
 * This used to be a single `let index = null` that ignored its argument after
 * the first call. That was invisible while there was only ever one index — and
 * became a real bug the moment /api/chat started passing a CMS-built one: the
 * first array to reach this function was cached for the life of the process,
 * so every later question was scored against whichever index happened to warm
 * up first, CMS content included or not depending on timing.
 *
 * A WeakMap keyed on the array itself is the fix: a new array is a new index,
 * and an array nobody holds any more is collectable. Rebuilding costs a couple
 * of milliseconds for a corpus this size, which is far cheaper than answering
 * from the wrong corpus.
 */
const indexes = new WeakMap();

function getIndex(entries) {
  let built = indexes.get(entries);
  if (!built) {
    built = buildIndex(entries);
    indexes.set(entries, built);
  }
  return built;
}

/* ------------------------------------------------------------------ */
/* Query                                                               */
/* ------------------------------------------------------------------ */

/**
 * Rank entries against a query.
 *
 * Returns `{ entry, score, matched }` sorted best-first. `matched` is the list
 * of query terms the entry actually contains — the answer composer uses it to
 * decide whether a result is worth showing as a direct answer or only as a
 * suggestion.
 */
/**
 * Rank entries against a query.
 *
 * `titleBoost` rewards an entry whose *name* contains what was asked for,
 * rather than merely mentioning it somewhere. Off by default, because across
 * the whole corpus a name match is only one signal among several. On for the
 * scoped lookups, where it is close to the entire question: somebody asking
 * "do you build dashboards" wants the service called Business Intelligence
 * Dashboards, not the one whose description happens to say "enterprise
 * dashboards" in passing — and BM25 alone cannot see the difference, because
 * the word sits in the body either way.
 *
 * It is also what makes those lookups survive the index being rebuilt from the
 * CMS. Descriptions there carry extra prose fields, which lengthens the
 * document and drags its score down through length normalisation; the title
 * does not change, so a signal anchored to the title holds steady while an
 * absolute score threshold does not.
 */
export function search(query, entries, { limit = 5, minScore = 0.6, titleBoost = false } = {}) {
  // Concepts, with synonyms attached — query side only. buildIndex tokenizes
  // plainly, so a document is never indexed under a word it does not contain.
  const concepts = conceptsIn(query);
  if (!concepts.length) return [];

  const { docs, documentFrequency, averageLength, urlFrequency, total } = getIndex(entries);

  const results = [];
  for (const doc of docs) {
    let score = 0;
    const matched = [];

    for (const concept of concepts) {
      // The best-scoring stem of the concept, not the sum of them: a document
      // that happens to say both "hospital" and "clinic" has found one thing
      // the visitor asked about, not two, and should not out-rank the page
      // that is actually about it.
      let best = 0;
      let bestTerm = null;

      for (const term of concept.variants) {
        const frequency = doc.frequencies.get(term);
        if (!frequency) continue;

        // Standard BM25 IDF. The +1 inside the log keeps it positive for terms
        // present in more than half the corpus, which would otherwise score
        // negative and push a genuinely matching entry below a non-matching one.
        const containing = documentFrequency.get(term) || 0;
        const idf = Math.log(1 + (total - containing + 0.5) / (containing + 0.5));

        const numerator = frequency * (K1 + 1);
        const denominator = frequency + K1 * (1 - B + (B * doc.length) / averageLength);
        const termScore = idf * (numerator / denominator);

        // A synonym is evidence, not the visitor's own word, so it is worth
        // slightly less than the term actually typed. Enough of a tilt that a
        // page saying "hospital" still beats one saying only "healthcare",
        // while both stay comfortably ahead of a page saying neither.
        const weighted = term === concept.term ? termScore : termScore * 0.85;
        if (weighted > best) {
          best = weighted;
          bestTerm = term;
        }
      }

      if (best > 0) {
        score += best;
        matched.push(bestTerm);
      }
    }

    if (score > 0) {
      // Reward covering more of the question. Two entries can score alike when
      // one matches a single rare term hard and the other matches every term
      // moderately — the second is nearly always the better answer.
      const coverage = matched.length / concepts.length;
      let weighted = score * (0.5 + 0.5 * coverage);

      if (titleBoost) {
        const named = concepts.filter((c) => c.variants.some((t) => doc.title.has(t))).length;
        weighted *= 1 + named / concepts.length;
      }

      results.push({ entry: doc.entry, score: weighted, matched, coverage });
    }
  }

  const ranked = results
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score);

  // Collapse entries that say the same thing.
  //
  // The same fact is often indexed from more than one export — an industry is
  // in INDUSTRIES for the listing page and again in INDUSTRY_CARDS for the
  // homepage grid, with identical titles. Both match, both rank adjacently,
  // and the visitor sees "Manufacturing" printed twice with the same sentence
  // under it, which reads as a broken bot rather than a thorough one.
  //
  // Keyed on title plus destination: two entries that send you to the same
  // place under the same name are one answer. The highest scorer survives,
  // because the sort has already run.
  // Keyed on the destination when the destination identifies one subject, and
  // on title-plus-destination otherwise. Title alone was not enough: the same
  // industry is titled "Healthcare & Wellness" in INDUSTRIES, "Healthcare" in
  // INDUSTRY_CARDS and "Healthcare & Wellness" again in
  // INDUSTRY_INTELLIGENCE, so a title key let the short one through and the
  // visitor got the same industry twice under two names. The highest scorer
  // survives, because the sort has already run.
  const IDENTIFYING = 4;
  const seen = new Set();
  const deduped = [];
  for (const result of ranked) {
    const url = result.entry.url || '';
    const key =
      url && (urlFrequency.get(url) || 0) <= IDENTIFYING
        ? url
        : `${result.entry.title}`.trim().toLowerCase() + '|' + url;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(result);
    if (deduped.length >= limit) break;
  }

  return deduped;
}

/* ------------------------------------------------------------------ */
/* Spelling tolerance                                                  */
/* ------------------------------------------------------------------ */

/**
 * Corrects typos against the corpus's own vocabulary.
 *
 * Exact-token retrieval has a hard edge: "chatbtos" scores zero against every
 * document that talks about chatbots, so a single slipped key turns a good
 * question into a refusal. The live sirahdigital.in bot handles this with a
 * Levenshtein pass over its keyword lists, and it is the main reason that bot
 * feels forgiving — so the same tolerance is applied here, against the index
 * vocabulary rather than a hand-written keyword list, which means it covers
 * every word the site actually uses without anyone maintaining a list.
 *
 * Only unknown tokens are touched: a word already in the corpus is correct by
 * definition. The edit budget scales with length because one edit in a
 * four-letter word is usually a different word, while two in a twelve-letter
 * word is still obviously the same one.
 */
const vocabularies = new WeakMap();

/**
 * The words the site actually uses, spelled as it spells them.
 *
 * Built from raw text rather than from the search index, and the difference
 * matters twice over. The index is stemmed, so it holds "servic", not
 * "services" — snapping a typo to a stem produces a word no intent regex will
 * ever match. And the index drops stopwords, which here includes domain words
 * like "service" and "provide" that are too common to *rank* on but are
 * exactly what a misspelled question needs corrected in order to hit an
 * intent. Correcting for the reader, not for the ranker.
 */
function vocabulary(entries) {
  let vocab = vocabularies.get(entries);
  if (!vocab) {
    vocab = new Set();
    for (const entry of entries) {
      const text = `${entry.title || ''} ${entry.summary || ''} ${entry.body || ''}`;
      for (const word of text.toLowerCase().match(/[a-z][a-z0-9+#-]{2,}/g) || []) {
        vocab.add(word);
      }
    }
    vocabularies.set(entries, vocab);
  }
  return vocab;
}

/** Standard Levenshtein, bailing out as soon as the budget is blown. */
function editDistance(a, b, budget) {
  if (Math.abs(a.length - b.length) > budget) return budget + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (row[j] < best) best = row[j];
    }
    if (best > budget) return budget + 1;
    prev = row;
  }
  return prev[b.length];
}

const budgetFor = (word) => (word.length <= 4 ? 0 : word.length <= 7 ? 1 : 2);

/**
 * Returns the query with unknown words snapped to the nearest corpus term.
 *
 * Returns the original string when nothing was changed, so callers can tell
 * whether a correction happened — worth knowing, because a question that only
 * matched after correction deserves slightly more suspicion than one that
 * matched as typed.
 */
export function correctQuery(query, entries, protectedWords) {
  const corpus = vocabulary(entries);
  /*
   * The words the bot listens for are correction *targets* as well as
   * protected spellings.
   *
   * "contct" is one edit from "contact" and it is the most common typo a
   * contact form gets. The corpus could not fix it, because "contact" appears
   * nowhere in the site's own prose — it was only ever the label of a nav
   * link, and the navbar is not indexed. So the typo fell through uncorrected
   * and the question was refused as off-topic. A word an intent tests for is
   * a word the bot understands, which makes it exactly the sort of thing a
   * misspelling should be snapped to.
   */
  const vocab = protectedWords?.size ? new Set([...corpus, ...protectedWords]) : corpus;
  const words = String(query || '').split(/(\s+)/);
  let changed = false;

  const corrected = words.map((word) => {
    if (/^\s*$/.test(word)) return word;
    const bare = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!bare || bare.length < 4 || vocab.has(bare)) return word;
    // A word the bot's own intents test for is spelled correctly by
    // definition, whether or not the site's copy happens to contain it.
    //
    // This is not belt-and-braces. "contact" appeared in the corpus only as
    // the label of a nav link; when the navbar came off the index, the word
    // left the vocabulary, and the very next question — "how do I contact
    // you?" — was silently rewritten to "how do I contract you?" and answered
    // with the note about NDAs. One edit away from a real word is exactly
    // where a spellchecker does its worst damage, and the words it must never
    // touch are precisely the ones the bot is listening for.
    if (protectedWords?.has(bare)) return word;

    const budget = budgetFor(bare);
    if (budget === 0) return word;

    let best = null;
    let bestDistance = budget + 1;
    for (const term of vocab) {
      if (Math.abs(term.length - bare.length) > budget) continue;
      const distance = editDistance(bare, term, budget);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = term;
        if (distance === 1) break;
      }
    }
    if (!best) return word;
    changed = true;
    return word.replace(/[a-zA-Z0-9]+/, best);
  });

  return { text: changed ? corrected.join('') : String(query || ''), changed };
}

/**
 * Query terms the corpus has never seen — words in no entry at all.
 *
 * Used by the answer composer to tell "the closest thing on the site" apart
 * from a coincidence. "what is the price of gold today?" matches LexDraft on
 * *price* and *today* and scores well enough to be offered as a suggestion,
 * but the word the question is actually about — gold — appears nowhere in the
 * index. A term with a document frequency of zero is the subject the site has
 * nothing to say about, and offering the nearest page anyway is how a bot ends
 * up recommending legal software to somebody asking about bullion.
 *
 * Synonyms count as knowing the word: "hospital" is not unknown just because
 * the copy says "healthcare".
 */
export function unknownTerms(query, entries) {
  const { documentFrequency } = getIndex(entries);
  return conceptsIn(query)
    .filter((concept) => concept.variants.every((term) => !documentFrequency.get(term)))
    .map((concept) => concept.term);
}

/** Every entry of a given kind, for questions answered by a list. */
export function byKind(entries, kind) {
  return entries.filter((entry) => entry.kind === kind);
}

/** Every entry from a given data export, for questions answered by a list. */
export function bySource(entries, source) {
  return entries.filter((entry) => entry.source === source);
}
