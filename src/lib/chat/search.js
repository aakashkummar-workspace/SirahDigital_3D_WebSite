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

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s+#-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .map(stem)
    .filter((word) => word.length > 1);
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
    return { entry, frequencies, length: tokens.length };
  });

  // How many documents contain each term — the input to IDF.
  const documentFrequency = new Map();
  for (const doc of docs) {
    for (const token of doc.frequencies.keys()) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }

  const averageLength = docs.reduce((sum, d) => sum + d.length, 0) / (docs.length || 1);

  return { docs, documentFrequency, averageLength, total: docs.length };
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
export function search(query, entries, { limit = 5, minScore = 0.6 } = {}) {
  const terms = tokenize(query);
  if (!terms.length) return [];

  const { docs, documentFrequency, averageLength, total } = getIndex(entries);

  const results = [];
  for (const doc of docs) {
    let score = 0;
    const matched = [];

    for (const term of terms) {
      const frequency = doc.frequencies.get(term);
      if (!frequency) continue;

      matched.push(term);

      // Standard BM25 IDF. The +1 inside the log keeps it positive for terms
      // present in more than half the corpus, which would otherwise score
      // negative and push a genuinely matching entry below a non-matching one.
      const containing = documentFrequency.get(term) || 0;
      const idf = Math.log(1 + (total - containing + 0.5) / (containing + 0.5));

      const numerator = frequency * (K1 + 1);
      const denominator = frequency + K1 * (1 - B + (B * doc.length) / averageLength);
      score += idf * (numerator / denominator);
    }

    if (score > 0) {
      // Reward covering more of the question. Two entries can score alike when
      // one matches a single rare term hard and the other matches every term
      // moderately — the second is nearly always the better answer.
      const coverage = matched.length / terms.length;
      results.push({ entry: doc.entry, score: score * (0.5 + 0.5 * coverage), matched, coverage });
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
  const seen = new Set();
  const deduped = [];
  for (const result of ranked) {
    const key = `${result.entry.title}`.trim().toLowerCase() + '|' + (result.entry.url || '');
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
export function correctQuery(query, entries) {
  const vocab = vocabulary(entries);
  const words = String(query || '').split(/(\s+)/);
  let changed = false;

  const corrected = words.map((word) => {
    if (/^\s*$/.test(word)) return word;
    const bare = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!bare || bare.length < 4 || vocab.has(bare)) return word;

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

/** Every entry of a given kind, for questions answered by a list. */
export function byKind(entries, kind) {
  return entries.filter((entry) => entry.kind === kind);
}

/** Every entry from a given data export, for questions answered by a list. */
export function bySource(entries, source) {
  return entries.filter((entry) => entry.source === source);
}
