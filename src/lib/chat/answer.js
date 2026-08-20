/**
 * Turns a visitor's question into a reply, using only the content index.
 *
 * Three paths, in order:
 *
 *   1. Persona — greetings, thanks, goodbyes, names, fun facts, who it is.
 *      Authored lines, in persona.js, and nothing to do with site content.
 *   2. Intent handlers — the questions the chips ask, plus the obvious
 *      neighbours (pricing, contact, booking, location). These get a written
 *      frame around live data rather than a raw result list, because "what
 *      services do you provide?" wants the list of ten, not the three services
 *      that happen to rank highest against those four words.
 *   3. BM25 retrieval over everything else.
 *
 * The frames are the only authored sentences here, and they are deliberately
 * thin — one connective line around content pulled from the index at call time.
 * A frame says "we work across {n} sectors"; it never names the sectors. So
 * adding a thirteenth industry changes the answer without anyone editing this
 * file, which is the same guarantee knowledge.js makes.
 *
 * ── bilingual ────────────────────────────────────────────────────────────
 * Frames are `{ en, ta }` pairs. The *data* they wrap stays in English,
 * because the site is written in English and machine-translating a service
 * name into Tamil would be inventing copy nobody has approved. So a Tamil
 * answer reads as a Tamil sentence introducing English proper nouns, which is
 * how the language is actually used here.
 *
 * ── purity ───────────────────────────────────────────────────────────────
 * No conversation state lives here. The remembered name and the turn count
 * arrive as arguments and any change to them leaves as `setName`/`clearName`
 * on the reply; the panel owns the conversation. That is what lets the build
 * check answer hundreds of fixtures through the same module without them
 * bleeding into each other.
 *
 * The one exception is `ACTIVE`, the index being read — see its own note for
 * why that is safe and what would break it.
 *
 * ── where the index comes from ───────────────────────────────────────────
 * By default the one webpack froze into the bundle. Pass `ctx.knowledge` to
 * answer from a CMS-built index instead; /api/chat does exactly that.
 *
 * What this cannot do, and does not pretend to: reason. It matches and it
 * quotes. A question whose answer is not written down somewhere on the site
 * gets an honest miss and a route to a human, not an invention.
 */

import { COMPANY } from '@/data/company';
import { FOUNDER } from '@/data/team';
import { KNOWLEDGE } from './knowledge';
import { FAQ, CONSULT } from './faq';
import { search, bySource, correctQuery, tokenize, unknownTerms } from './search';
import {
  CONTACT_CARD,
  DEFAULT_LANG,
  GREETING as GREETING_PAIR,
  OUT_OF_SCOPE,
  PERSONA_INTENTS,
  QUICK_REPLIES as QUICK_REPLIES_BY_LANG,
  pick,
} from './persona';

/* ------------------------------------------------------------------ */
/* Relevance gate                                                      */
/* ------------------------------------------------------------------ */

/**
 * How good a retrieval hit has to be before it is allowed to become an answer.
 *
 * BM25 always returns a ranked list. Nothing in it knows whether the best match
 * is *good* — only that it beat the others. So without a floor, an off-topic
 * question gets whichever page shares an incidental word, and the bot answers
 * "can I drink hot water in winter?" with Manufacturing.
 *
 * Two numbers, because they catch different failures:
 *
 *   SCORE    the match has to be substantive at all.
 *   COVERAGE the match has to explain most of the *question*. This is the one
 *            that stops the hot-water case: five content words went in, one
 *            of them incidentally matched, so coverage is 0.2 and the hit is
 *            refused however hard that single term scored.
 *
 * ANSWER is the bar for stating something as the answer. SUGGEST is the lower
 * bar for offering it as "the closest I found". Below SUGGEST the honest reply
 * is that the question is not ours, and that is what gets sent.
 *
 * These are empirical, and scripts/chat-check.mjs is where they are held
 * honest — it carries must-answer and must-refuse fixtures on both sides of
 * the line. Move a number, run the check.
 */
const ANSWER = { score: 2.2, coverage: 0.5 };
const SUGGEST = { score: 1.35, coverage: 0.34 };
// Below SUGGEST but not nothing: enough of a signal to ask, not enough to
// assert. It lowers the *score* bar only and keeps SUGGEST's coverage bar,
// which is what separates a vague on-topic question ("chatbots?" — one word,
// fully covered, modest score) from an off-topic one ("can I drink hot water
// in winter" — one incidental word out of five). Dropping coverage here let
// every must-refuse fixture through as a "did you mean…?"; the coverage term
// is the whole guard, and the score is only choosing how loudly to answer.
const MAYBE = { score: 0.9, coverage: SUGGEST.coverage };

/**
 * A question that cannot stand on its own.
 *
 * "How much does that cost?" carries almost no content words, so retrieval
 * scores it near zero and the gate above would refuse it — even though it is
 * a perfectly normal thing to say two messages into a conversation. When a
 * question is this short and leans on a pronoun, it is about whatever was
 * just discussed, so it is re-asked as the previous intent instead.
 */
const FOLLOW_UP = /\b(it|its|that|this|they|them|those|more|again)\b/i;
const FOLLOW_UP_MAX_WORDS = 8;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * The index the current call is answering from.
 *
 * answerQuestion may be handed a CMS-built index (see cms.js) instead of the
 * bundled one, and the intents below read it through listEntries. Threading it
 * through fourteen respond() signatures would be noise, so it is set once at
 * the top of answerQuestion and read synchronously beneath it.
 *
 * The invariant that makes that safe: **answerQuestion never awaits.** It is
 * synchronous from entry to return, so no second call can interleave and swap
 * this out mid-answer. If retrieval ever becomes async, this has to become a
 * parameter — there is no third option.
 */
let ACTIVE = KNOWLEDGE;

function listEntries(source) {
  return bySource(ACTIVE, source);
}

/* ------------------------------------------------------------------ */
/* Scoped retrieval                                                    */
/* ------------------------------------------------------------------ */

/**
 * Retrieval restricted to the part of the index that could possibly answer.
 *
 * "do you work with hospitals" is a question with exactly twelve candidate
 * answers, and the whole-corpus search was not choosing between them — it was
 * choosing between them and a hundred and thirty other things, and losing.
 * Real replies it produced: the company blurb for restaurants, an Automotive
 * card for schools, an insights article for "is Aura real time".
 *
 * None of that is a ranking bug. BM25 is comparing an industry page against a
 * project write-up that happens to be longer and share a word, and it has no
 * way to know that the question named a *sector*. The question shape knows.
 * So the intents below read the shape, hand this the sources that could
 * answer, and let ranking do the easy version of its job.
 *
 * ── the WeakMap is not an optimisation ──────────────────────────────────
 * search() caches its BM25 index against the identity of the array it is
 * given. A fresh `.filter()` on every question is a fresh array, so every
 * question would rebuild an index — and, worse, the cache would grow one
 * entry per question for as long as the process lived. Memoising the slice
 * per (index, sources) keeps both the identity and the cache stable.
 */
const scopes = new WeakMap();

function scoped(sources) {
  let byKey = scopes.get(ACTIVE);
  if (!byKey) {
    byKey = new Map();
    scopes.set(ACTIVE, byKey);
  }
  const key = sources.join(',');
  let corpus = byKey.get(key);
  if (!corpus) {
    const wanted = new Set(sources);
    corpus = ACTIVE.filter((entry) => wanted.has(entry.source));
    byKey.set(key, corpus);
  }
  return corpus;
}

/**
 * Best match within a slice, or null if nothing in it is a real answer.
 *
 * The bar is higher than the whole-corpus gate, and deliberately: within a
 * slice, *something* always matches reasonably well — every industry page
 * talks about automation — so a low bar here would answer "do you work with
 * pet insurance" with whichever sector came closest. Returning null is what
 * lets the caller say no.
 */
function bestIn(query, sources, { score = 2.0, coverage = 0.5 } = {}) {
  const corpus = scoped(sources);
  if (!corpus.length) return null;
  // titleBoost: within a slice, the entry *named* after what was asked for is
  // the answer. See the note on search().
  const [top] = search(query, corpus, { limit: 3, titleBoost: true });
  if (!top || top.score < score || top.coverage < coverage) return null;
  if (!(top.entry.summary || '').trim()) return null;
  return top.entry;
}

/**
 * The shape of a "can you do X" question, and the verbs that make up the
 * shape rather than the subject of it. Both are read by the capability
 * intent's test — see the note there for why the second one is needed.
 */
const CAPABILITY_SHAPE =
  /\b(do|does|can|could|would|will) (you|u|sirah|sirah digital)\b[\s\S]{0,40}\b(do|build|make|develop|create|handle|offer|provide|automate|design|integrate|implement|deliver|support|manage|help|connect|link|sync|have)\b|\bare you able to\b|\bable to build\b|\bcan you help me\b/;

// Run through tokenize so these are stemmed exactly as the question will be —
// "automate", "automating" and "automation" all collapse to the same root, and
// a hand-written list of surface forms would miss two of the three.
const CAPABILITY_VERBS = new Set(
  tokenize(
    'build make develop create handle automate design integrate implement deliver manage able ' +
      // `connect`, `link` and `sync` joined the list when "can you connect my
      // Tally to WhatsApp" — an integration question with a service that answers
      // it exactly — came back as off-topic, because none of those words counted
      // as asking for anything.
      'connect link sync have experience',
  ),
);

/**
 * Whether a question is about *us*.
 *
 * Most intents are safe without this, because their trigger words only ever
 * come up in the company's own context — nobody says "industries" or "OCR" by
 * accident. Pricing is the exception: "price", "cost" and "how much" are
 * ordinary English about anything at all, so the pricing intent answered "what
 * is the price of gold today?" with our consultation blurb.
 *
 * Three ways a question qualifies, in the order they are cheapest to check:
 *
 *   a pronoun or the company name  — "your pricing", "how much does it cost"
 *   brevity                        — "how much?", which is a follow-up, and
 *                                    the previous answer supplies the subject
 *   a word the site actually uses  — "how much for a chatbot", where "chatbot"
 *                                    is in the corpus and "gold" is not
 *
 * The third is the one doing real work, and it is why this reads the index
 * rather than a list: the set of things we can be asked the price of is the
 * set of things we have written about, and that changes without this file.
 */
const SELF_REFERENCE = /\b(you|your|yours|u|sirah|we|our|us|it|its|this|that|they|them|these|those)\b/;

const vocabularies = new WeakMap();

function corpusVocabulary() {
  let vocab = vocabularies.get(ACTIVE);
  if (!vocab) {
    vocab = new Set();
    for (const entry of ACTIVE) {
      for (const term of tokenize(`${entry.title || ''} ${entry.body || ''}`)) vocab.add(term);
    }
    vocabularies.set(ACTIVE, vocab);
  }
  return vocab;
}

function aboutUs(question, triggers) {
  if (SELF_REFERENCE.test(question)) return true;
  if (question.trim().split(/\s+/).length <= 3) return true;

  const vocab = corpusVocabulary();
  // The trigger words are excluded deliberately. "price" matching the corpus
  // would qualify every question containing it, which is the whole set this
  // guard exists to split.
  return tokenize(question).some((term) => !triggers.has(term) && vocab.has(term));
}

const PRICING_TRIGGERS = new Set(
  tokenize('price pricing cost quote quotation budget fee charge package plan tier retainer rate expensive cheap afford much'),
);

const SERVICE_SOURCES = ['SERVICES', 'SERVICE_EXPERIENCE'];
const INDUSTRY_SOURCES = ['INDUSTRIES', 'INDUSTRY_CARDS', 'INDUSTRY_INTELLIGENCE'];
const PRODUCT_SOURCES = ['HOME_PRODUCTS', 'PRODUCT_DETAILS'];

/**
 * The product a question names, if it names one.
 *
 * Matched on the product's own title rather than a written-out list, so a
 * product added in the CMS is recognised without an edit here. The first word
 * carries the match because that is how people refer to them — "what is aura",
 * "does nusi do billing" — and it has to be long enough not to collide with an
 * ordinary word.
 *
 * ── which description wins ───────────────────────────────────────────────
 * PRODUCT_DETAILS first, then the longest summary. The ordering is a
 * correctness rule, not a formatting preference.
 *
 * PRODUCT_DETAILS is the product's own page copy, written against the product
 * as built and annotated in src/data/productDetails.js with where each line
 * came from. The CMS `products` collection describes the same three products
 * independently, and for Aura it is wrong: it says Aura "records thousands of
 * telecaller conversations in real time", and Aura does not work that way — it
 * reads the recordings the handset's dialer has already written, after the
 * call ends. The page copy says so explicitly, and says it was changed
 * *because* the earlier real-time claim described a demo nobody could give.
 *
 * A longest-wins tiebreak picked the CMS sentence, because the wrong
 * description happens to be the wordier one. Naming the source is what stops a
 * bot repeating a claim the product page exists to correct.
 *
 * The CMS row still wants fixing — this makes the bot right, not the database.
 */
const PRODUCT_PRIORITY = ['PRODUCT_DETAILS', 'HOME_PRODUCTS'];

function betterProduct(a, b) {
  if (!a) return b;
  const rank = (entry) => {
    const index = PRODUCT_PRIORITY.indexOf(entry.source);
    return index === -1 ? PRODUCT_PRIORITY.length : index;
  };
  if (rank(b) !== rank(a)) return rank(b) < rank(a) ? b : a;
  return (b.summary || '').length > (a.summary || '').length ? b : a;
}

function productNamed(question) {
  let best = null;
  for (const entry of scoped(PRODUCT_SOURCES)) {
    const title = (entry.title || '').toLowerCase();
    if (!title) continue;
    const first = title.split(/\s+/)[0];
    const named =
      question.includes(title) ||
      (first.length >= 4 && new RegExp(`\\b${first}\\b`).test(question));
    if (!named) continue;
    if (!(entry.summary || '').trim()) continue;
    best = betterProduct(best, entry);
  }
  return best;
}

/** "a, b and c" — used wherever a frame reads out a short list inline. */
function sentenceList(items, max = 3) {
  const shown = items.slice(0, max);
  if (shown.length === 0) return '';
  if (shown.length === 1) return shown[0];
  return `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
}

function toLink(entry) {
  return { label: entry.title, href: entry.url, kind: entry.kind };
}

function toBullet(entry) {
  return { title: entry.title, detail: entry.summary, href: entry.url, kind: entry.kind };
}

/* ------------------------------------------------------------------ */
/* Intents                                                             */
/* ------------------------------------------------------------------ */

/**
 * Each intent is `{ id, test, respond }`. `test` is matched against the
 * lowercased question; first match wins, so order is precedence — the more
 * specific patterns sit above the broader ones. `respond` returns `text` as an
 * `{ en, ta }` pair, resolved against the caller's language before it leaves.
 */
const INTENTS = [
  {
    id: 'booking',
    test: /\b(book|booking|appointment|consultation|schedule|meeting|call back|callback|demo|free call|talk to (you|someone|somebody|a human|a person)|speak to (someone|somebody|a human|a person)|slot)\b/,
    // The link used to be /contact, under a sentence promising a calendar.
    // /contact is a form, a map and the ROI calculator; the calendar is on
    // /book, and has been since the TidyCal flow was replaced. So the bot
    // described one page and sent the visitor to another — the single most
    // expensive inaccuracy in here, because it broke the one journey the whole
    // widget exists to start.
    respond: () => ({
      text: {
        en:
          `Happy to set that up. The consultation is free, runs ${CONSULT.minutes} minutes, and you ` +
          'pick the time yourself off the calendar — it confirms on the spot, and the Google Meet ' +
          'link comes through an hour before we start.',
        ta:
          `மகிழ்ச்சியுடன் ஏற்பாடு செய்கிறேன். ஆலோசனை இலவசம், ${CONSULT.minutes} நிமிடங்கள். நாட்காட்டியிலிருந்தே ` +
          'நேரத்தைத் தேர்வு செய்யலாம் — உடனடியாக உறுதி செய்யப்படும், Google Meet இணைப்பு ஒரு மணி நேரம் ' +
          'முன்பு வந்துவிடும்.',
      },
      links: [
        { label: 'Pick a time', href: '/book', primary: true },
        { label: 'Contact page', href: '/contact' },
      ],
      contact: CONTACT_CARD,
      followUps: ['What are your working hours?', 'What services do you provide?'],
    }),
  },

  {
    id: 'products',
    test: /\bproduct(s)?\b|\bbuild\b.*\bown\b|\bplatform(s)?\b|\bapp(s)? (do|does) you\b/,
    respond: () => {
      const products = listEntries('HOME_PRODUCTS');
      if (!products.length) return null;
      return {
        text: {
          en: `Sirah Digital builds ${products.length} products of its own:`,
          ta: `Sirah Digital தனது சொந்த ${products.length} தயாரிப்புகளை உருவாக்குகிறது:`,
        },
        bullets: products.map(toBullet),
        links: products.map(toLink),
        followUps: ['What services do you provide?', 'How is automation useful for my business?'],
      };
    },
  },

  {
    id: 'services',
    // `solution(s)` sits here rather than with the problem-shaped questions
    // below, and the order is what decides it: "what solutions do you offer"
    // is someone asking for the menu, not describing a problem.
    test: /\bservice(s)?\b|\bsolution(s)?\b|\bwhat do you (do|offer|provide)\b|\bcapabilit(y|ies)\b|\boffering(s)?\b/,
    respond: () => {
      const services = listEntries('SERVICES');
      if (!services.length) return null;
      const lead = sentenceList(services.slice(0, 3).map((s) => s.title.toLowerCase()));
      return {
        text: {
          en: `We deliver ${services.length} services, spanning ${lead} and more:`,
          ta: `நாங்கள் ${services.length} சேவைகளை வழங்குகிறோம் - ${lead} உள்ளிட்டவை:`,
        },
        bullets: services.map(toBullet),
        links: [{ label: 'See all services', href: '/services', primary: true }],
        followUps: ['How can I scale my business?', 'Book a free call'],
      };
    },
  },

  {
    id: 'automation-benefit',
    // Three shapes of the same question, and they need three alternatives.
    // Both orderings around "automation", because the chip asks it one way
    // ("How is automation useful…") and people type it the other ("why should
    // I automate") — a single `.*` between the halves only ever matches one.
    // And the problem-shaped phrasing, which never says "automation" at all:
    // "what problems do you solve" wants exactly this answer.
    /*
     * A fourth shape was added last: the visitor describing the problem
     * without ever asking a question. "my team wastes time on data entry",
     * "we do everything manually", "this is eating my whole week" — none of
     * them contains "automation", "benefit" or "problem", so all three fell
     * through every intent and were refused as off-topic. Somebody stating the
     * exact thing this company sells against, told it was not our subject.
     *
     * The pillars answer is the right one for all of them: it says what
     * automation is worth, in three places, with real outcomes underneath.
     */
    test: /(\bautomat\w*\b[\s\S]*\b(useful|benefit|help|why|worth|value|roi|save|saving|good|point|advantage)\b)|(\b(useful|benefit|help|why|worth|value|roi|save|saving|should i|advantage)\b[\s\S]*\bautomat)|(\b(problem(s)?|issue(s)?|challenge(s)?|pain|struggle|bottleneck)\b[\s\S]*\b(solve|fix|help|handle|address)\b)|(\b(solve|fix)\b[\s\S]*\b(problem(s)?|issue(s)?|challenge(s)?)\b)|(\b(wast(e|es|ing)|manual|manually|repetitive|tedious|by hand|too much time|time.?consuming|eating (up )?(my|our)|spend(ing|s)? (hours|too long|all day))\b)/,
    respond: () => {
      const pillars = listEntries('METHODOLOGY');
      // Real outcomes from shipped work, not claims — these come off the same
      // records /products renders, so they can never overstate what it says.
      const proof = listEntries('PRODUCTION_PROJECTS')
        .map((p) => p.summary)
        .filter(Boolean);

      return {
        text: {
          en: 'Automation pays off in three places, and they are the three things we build around:',
          ta: 'தானியக்கம் மூன்று இடங்களில் பலன் தருகிறது - அந்த மூன்றைச் சுற்றியே நாங்கள் கட்டமைக்கிறோம்:',
        },
        bullets: pillars.map(toBullet),
        extra: proof.length
          ? {
              en: `In live systems that has looked like: ${sentenceList(proof, 2)}.`,
              ta: `நடைமுறை அமைப்புகளில் இது இப்படி இருந்தது: ${sentenceList(proof, 2)}.`,
            }
          : null,
        links: [
          { label: 'Estimate your savings', href: '/services', primary: true },
          { label: 'See the work', href: '/products#client-systems' },
        ],
        followUps: ['How can I scale my business?', 'Book a free call'],
      };
    },
  },

  {
    id: 'scale',
    test: /\bscal(e|ing)\b|\bgrow(th|ing)?\b|\bexpand\b/,
    respond: () => {
      const scale = listEntries('METHODOLOGY').find((m) => /scale/i.test(m.title));
      const relevant = search('scale infrastructure cloud integration growth', ACTIVE, {
        limit: 4,
      });
      return {
        text: {
          en: scale
            ? `${scale.summary} Scaling is the third step of how we work - automate first, simplify what is left, then grow on top of it.`
            : 'We scale businesses by automating the repetitive work first, simplifying what remains, and building infrastructure that grows with you.',
          ta: 'முதலில் திரும்பத் திரும்ப வரும் வேலையை தானியக்கமாக்கி, மிச்சமிருப்பதை எளிமையாக்கி, அதன் மேல் வளரக்கூடிய கட்டமைப்பை உருவாக்குகிறோம். வளர்ச்சி எங்கள் பணிமுறையின் மூன்றாவது படி.',
        },
        bullets: relevant.map((r) => toBullet(r.entry)),
        links: [
          { label: 'Book a free consultation', href: '/contact', primary: true },
          { label: 'How we work', href: '/about' },
        ],
        followUps: ['What services do you provide?', 'Which industries do you work with?'],
      };
    },
  },

  {
    id: 'industries',
    test: /\bindustr(y|ies)\b|\bsector(s)?\b|\bvertical(s)?\b|\bwho do you work with\b/,
    respond: () => {
      const industries = listEntries('INDUSTRIES');
      if (!industries.length) return null;
      return {
        text: {
          en: `We work across ${industries.length} sectors:`,
          ta: `நாங்கள் ${industries.length} துறைகளில் பணியாற்றுகிறோம்:`,
        },
        bullets: industries.map(toBullet),
        links: [{ label: 'Browse industries', href: '/industries', primary: true }],
        followUps: ['What services do you provide?', 'Book a free call'],
      };
    },
  },

  {
    id: 'pricing',
    // `package|plan|tier|retainer|rate|expensive|afford` were missing, and
    // "do you have packages" was being refused as off-topic — a buying
    // question, turned away by the bot whose job is to catch buying questions.
    test: (question) =>
      /\b(price|pricing|cost|costs|quote|quotation|budget|how much|fee(s)?|charge(s)?|packages?|plans?|tiers?|retainer|rate(s)?|expensive|cheap|afford)\b/.test(question) &&
      // …and about our work, not about gold, petrol or anything else that has
      // a price. See aboutUs().
      aboutUs(question, PRICING_TRIGGERS),
    respond: () => ({
      text: {
        en:
          'Pricing depends on scope — the systems we build run from a single automated workflow to ' +
          'a full platform, so there is no list price that would be honest. The ' +
          `${CONSULT.minutes}-minute consultation is free and ends with a scoped estimate for your ` +
          'job specifically.',
        ta:
          'விலை பணியின் அளவைப் பொறுத்தது — ஒரு தானியக்கப் பணிப்பாய்வு முதல் முழுத் தளம் வரை நாங்கள் ' +
          `உருவாக்குகிறோம், எனவே ஒரே நிலையான விலை சொல்வது நேர்மையாக இருக்காது. ${CONSULT.minutes} நிமிட ` +
          'ஆலோசனை இலவசம், அதன் முடிவில் தெளிவான மதிப்பீடு கிடைக்கும்.',
      },
      links: [
        { label: 'Book a free consultation', href: '/book', primary: true },
        // The ROI calculator is the last block on /contact — no anchor of its
        // own, so this links to the page rather than to an id that is not there.
        { label: 'Estimate your savings', href: '/contact' },
      ],
      followUps: ['What services do you provide?', 'How do I contact you?'],
    }),
  },

  {
    id: 'clients',
    test: /\b(testimonial(s)?|review(s)?|reference(s)?|who are your clients|client list|trusted by)\b/,
    respond: () => {
      const clients = listEntries('CLIENTS');
      if (!clients.length) return null;
      return {
        text: {
          en: `${clients.length} businesses have trusted us with their systems:`,
          ta: `${clients.length} நிறுவனங்கள் தங்கள் அமைப்புகளை எங்களிடம் ஒப்படைத்துள்ளன:`,
        },
        bullets: clients.map(toBullet),
        links: [{ label: 'See the work', href: '/products#client-systems', primary: true }],
        followUps: ['Book a free call'],
      };
    },
  },

  {
    /*
     * "do you work with hospitals", "any clients in real estate", "do you
     * serve schools". Twelve possible answers, and the whole-corpus search was
     * not reliably finding them — see the note on scoped().
     *
     * The refusal branch is the half that matters. A sector we do not list is
     * answered by saying so and naming what we do list, rather than by handing
     * over the nearest industry and letting the visitor assume. It stops short
     * of "no": the twelve are the sectors with pages, not a statement about
     * who we will take on, and the call is where that gets decided.
     */
    id: 'industry-fit',
    // `experience (with|in)` used to be here and it caught "do you have
    // experience with WordPress" — a tooling question, answered with the list
    // of twelve sectors. Sector questions name a sector; "experience in
    // healthcare" still lands via `any … in`, and the rest is the capability
    // intent's.
    test: /\b(work|worked|working|deal|dealt) (with|for|in)\b|\bdo you serve\b|\b(clients|projects|customers) (in|with|for)\b|\bany (clients|experience|work) in\b/,
    respond: (question) => {
      const industries = listEntries('INDUSTRIES');
      const match = bestIn(question, INDUSTRY_SOURCES, { score: 2.2, coverage: 0.5 });

      if (match) {
        return {
          text: {
            en: `Yes — ${match.title} is one of the ${industries.length} sectors we work in. ${match.summary}`,
            ta: `ஆம் — ${match.title} நாங்கள் பணியாற்றும் ${industries.length} துறைகளில் ஒன்று. ${match.summary}`,
          },
          lead: { title: match.title, kind: match.kind, href: match.url },
          links: [
            { label: match.title, href: match.url, primary: true },
            { label: 'Book a free consultation', href: '/book' },
          ],
          followUps: ['What services do you provide?', 'Book a free call'],
        };
      }

      if (!industries.length) return null;
      return {
        text: {
          en:
            `That is not one of the ${industries.length} sectors we have pages for — but the systems ` +
            'underneath are the same wherever the work is, so it is worth asking rather than ' +
            'assuming. Here is what we do list:',
          ta:
            `அது நாங்கள் பட்டியலிட்டுள்ள ${industries.length} துறைகளில் இல்லை — ஆனால் அடிப்படை அமைப்புகள் ` +
            'எல்லா இடத்திலும் ஒன்றுதான், எனவே கேட்பது நல்லது. நாங்கள் பட்டியலிடுபவை:',
        },
        bullets: industries.map(toBullet),
        links: [
          { label: 'Browse industries', href: '/industries', primary: true },
          { label: 'Book a free consultation', href: '/book' },
        ],
        followUps: ['What services do you provide?', 'Book a free call'],
      };
    },
  },

  {
    /*
     * "do you build websites", "can you automate invoices", "do you do OCR".
     *
     * The single most common shape of question a services bot gets, and the
     * one the whole-corpus search was worst at: it answered "do you build
     * dashboards" with a photo caption and "do you do CRM integration" with
     * the Automotive industry card. Ten candidate answers, scoped.
     *
     * The no branch matters as much as the yes. faq.js already names the
     * things we are asked for and do not sell; this catches everything else
     * that is not on the list, and answers it with the list instead of with
     * whatever ranked highest.
     */
    id: 'capability',
    test: (question) => {
      if (!CAPABILITY_SHAPE.test(question)) return false;
      /*
       * The question also has to name something.
       *
       * "what does sirah digital do" fits the shape exactly — a verb, the
       * company, another verb — and it is not a question about a capability at
       * all; it is the broadest question on the site, and this intent was
       * answering it with "I cannot match that to anything we list", which is
       * a bad reply to the one question every visitor asks.
       *
       * What separates it from "do you build chatbots" is that once the
       * stopwords and the verbs are gone, nothing is left. So that is the
       * test: if the question names no subject, this intent has no business
       * claiming it, and it falls through to `about` where it belongs.
       */
      return tokenize(question).some((term) => !CAPABILITY_VERBS.has(term));
    },
    respond: (question) => {
      const services = listEntries('SERVICES');
      // Coverage sits at a third rather than a half because these questions
      // are written long — "do you do data entry automation" is three content
      // words for a service whose name contains one of them. The score bar
      // carries the weight instead, and the fallback below is safe: an
      // unmatched question gets the list, never a guess.
      const match =
        bestIn(question, SERVICE_SOURCES, { score: 2.2, coverage: 0.33 }) ||
        bestIn(question, PRODUCT_SOURCES, { score: 2.6, coverage: 0.5 });

      if (match) {
        const others = search(question, scoped(SERVICE_SOURCES), { limit: 4 })
          .map((r) => r.entry)
          .filter((e) => e.url !== match.url)
          .slice(0, 2);

        return {
          text: {
            en: `Yes — that is ${match.title}. ${match.summary}`,
            ta: `ஆம் — அது ${match.title}. ${match.summary}`,
          },
          lead: { title: match.title, kind: match.kind, href: match.url },
          bullets: others.map(toBullet),
          links: [
            { label: match.title, href: match.url, primary: true },
            { label: 'Book a free consultation', href: '/book' },
          ],
          followUps: ['How much does it cost?', 'Book a free call'],
        };
      }

      if (!services.length) return null;
      return {
        text: {
          en:
            'I cannot match that to anything we list, and I would rather say so than guess. ' +
            `These are the ${services.length} we do — if yours is close to one of them, the ` +
            'consultation is the fastest way to find out:',
          ta:
            'அதை நாங்கள் பட்டியலிட்டுள்ள எதனுடனும் பொருத்த முடியவில்லை — ஊகிப்பதை விட இதைச் சொல்வதே சரி. ' +
            `நாங்கள் செய்யும் ${services.length}:`,
        },
        bullets: services.map(toBullet),
        links: [
          { label: 'See all services', href: '/services', primary: true },
          { label: 'Book a free consultation', href: '/book' },
        ],
        followUps: ['Book a free call', 'How do I contact you?'],
      };
    },
  },

  {
    id: 'process',
    test: /\b(process|how do you work|methodology|approach|steps|what happens next|onboard)\b/,
    respond: () => {
      const pillars = listEntries('METHODOLOGY');
      if (!pillars.length) return null;
      return {
        text: {
          en: `How we work, in ${pillars.length} steps:`,
          ta: `நாங்கள் எப்படி பணியாற்றுகிறோம் - ${pillars.length} படிகளில்:`,
        },
        bullets: pillars.map(toBullet),
        links: [{ label: 'How we work', href: '/about', primary: true }],
        followUps: ['Book a free call'],
      };
    },
  },

  {
    id: 'tech-stack',
    // Was `…|tools?|integrat\w+`, and those two took questions this cannot
    // answer. "do you do CRM integration" is a question about the CRM & ERP
    // *service* and was being answered with a list of eight technologies; so
    // was "can you integrate with my ERP". The test now needs the question to
    // actually be about tooling, and the services intent above keeps the rest.
    test: /\b(tech stack|technolog\w+|what tech|which tech|built with|what (tools|frameworks?)|which (tools|frameworks?|platforms?)|tools do you use|platform(s)? do you use|programming language)\b/,
    respond: () => {
      const tech = listEntries('TECHNOLOGIES');
      if (!tech.length) return null;
      return {
        text: {
          en: `We build on ${tech.length} core technologies:`,
          ta: `${tech.length} முக்கிய தொழில்நுட்பங்களின் மேல் நாங்கள் கட்டமைக்கிறோம்:`,
        },
        bullets: tech.map(toBullet),
        links: [{ label: 'See our services', href: '/services', primary: true }],
      };
    },
  },

  {
    id: 'team',
    // A bare `team` matched "my team wastes time on data entry" — a visitor
    // describing their own problem, answered with our staff list. `people` was
    // worse for the same reason. The question has to be about *our* team.
    test: /\b(your|the|sirah'?s) (team|staff|people|engineers|developers)\b|\bfounder\b|\bceo\b|\bwho (works|is) (at|in|for)\b|\bteam members?\b|\bmeet the team\b/,
    respond: () => {
      // Read off the record rather than the index. knowledge.js picks an
      // entry's title from `title` before `name`, and FOUNDER carries both —
      // so the indexed entry is "Founder & Technical Architect" and the man's
      // name is not in it. Answering "who is the founder?" without naming him
      // is the one thing that question cannot do.
      const team = listEntries('TEAM');
      const lead = FOUNDER?.name
        ? `${FOUNDER.name}, ${FOUNDER.title || FOUNDER.role}`
        : null;
      const bio = FOUNDER?.bio || '';
      return {
        text: {
          en: lead
            ? `${lead} - ${bio} The wider team is ${team.length} specialists across AI automation, solution engineering and digital growth.`
            : `Our team is ${team.length} specialists across AI automation, solution engineering and digital growth.`,
          ta: lead
            ? `${lead} - ${bio} விரிவான குழுவில் AI தானியக்கம், தீர்வு பொறியியல், டிஜிட்டல் வளர்ச்சி ஆகியவற்றில் ${team.length} நிபுணர்கள் உள்ளனர்.`
            : `எங்கள் குழுவில் AI தானியக்கம், தீர்வு பொறியியல், டிஜிட்டல் வளர்ச்சி ஆகியவற்றில் ${team.length} நிபுணர்கள் உள்ளனர்.`,
        },
        bullets: team.map(toBullet),
        links: [{ label: 'Meet the team', href: '/about', primary: true }],
      };
    },
  },

  {
    id: 'work',
    test: /\b(case stud(y|ies)|portfolio|project(s)?|example(s)?|work you)\b/,
    respond: () => {
      const live = listEntries('PRODUCTION_PROJECTS');
      const building = listEntries('DEVELOPMENT_PROJECTS');
      return {
        text: {
          en: `${live.length} systems are live in production and ${building.length} more are in build.`,
          ta: `${live.length} அமைப்புகள் நடைமுறையில் இயங்குகின்றன, மேலும் ${building.length} உருவாக்கத்தில் உள்ளன.`,
        },
        bullets: [...live, ...building].map(toBullet),
        links: [{ label: 'See all work', href: '/products#client-systems', primary: true }],
        followUps: ['Book a free call'],
      };
    },
  },

  {
    id: 'contact',
    // `mobile` and a bare `number` were in here and both were too greedy:
    // "can you build a mobile app" is a services question, and "how many
    // employees" is not a request for our phone number. They are spelled out
    // as the phrases people actually use instead.
    test: /\b(contact|email|e-mail|phone|mobile number|whatsapp number|contact number|phone number|call you|call us|ring you|reach (you|us|the team)|get in touch|address|office|located|location|where are you|directions|map)\b/,
    /*
     * Read straight off the company record, so a change of address or number
     * never leaves a stale copy in the bot — the same record the footer and the
     * contact page render.
     *
     * ── why this answer leads with the phone number ──────────────────────
     * "whatsapp number" and "I want to talk to someone" used to be taken by the
     * social_media persona intent, which replied "WhatsApp is the fastest if
     * you want a person" and offered a row of social profiles. A visitor asking
     * how to reach a company is asking for its phone number, and being handed a
     * link out to a messaging app instead is a redirect away from the thing
     * they asked for. persona.js no longer claims those questions; they land
     * here, and here answers with the number, the address and a time to book.
     */
    respond: () => ({
      // The sentence names the number and stops there. Email and address are
      // in the card directly beneath it, already tappable — restating them
      // here printed every detail twice in one bubble.
      text: {
        en:
          `Call ${COMPANY.phone} — that is the quickest way to us. Email and the office address ` +
          `are below. If you would rather have a proper conversation, pick a time: the ` +
          `${CONSULT.minutes}-minute consultation is free.`,
        ta:
          `${COMPANY.phone} என்ற எண்ணில் அழைப்பதுதான் வேகமானது. மின்னஞ்சலும் அலுவலக முகவரியும் கீழே ` +
          `உள்ளன. விரிவாகப் பேச வேண்டுமெனில் நேரம் தேர்வு செய்யுங்கள் — ${CONSULT.minutes} நிமிட ` +
          `ஆலோசனை இலவசம்.`,
      },
      contact: CONTACT_CARD,
      // No "Call us" button here: the contact card above already renders the
      // number as a tel: link and the address below it, so a second one would
      // be the same action twice. These are the two things the card cannot do.
      links: [
        { label: 'Book a free consultation', href: '/book', primary: true },
        { label: 'Contact page', href: '/contact' },
      ],
      followUps: ['What are your working hours?', 'Book a free call'],
    }),
  },

  {
    /*
     * "does Aura do X", "what is NUSI", "is Aura real time".
     *
     * Below `pricing`, which is not where a "most specific wins" ordering
     * would put it. "how much does Aura cost" names a product and is a pricing
     * question, and answering it with a description of Aura is a dodge — the
     * one thing a pricing answer must not be. So pricing claims the money
     * questions first and this takes the rest.
     *
     * It also settles a question the whole-corpus search kept getting wrong.
     * "is aura real time" was answered with an insights article about
     * multi-agent frameworks that self-correct "in real time" — a phrase match
     * on a page with nothing to do with the product. Reading the product's own
     * copy is both the right answer and the accurate one.
     */
    id: 'product',
    test: (question) => productNamed(question) !== null,
    respond: (question) => {
      const product = productNamed(question);
      if (!product) return null;
      const related = search(product.title, scoped(PRODUCT_SOURCES), { limit: 3 })
        .map((r) => r.entry)
        .filter((e) => e.url !== product.url);

      return {
        text: { en: product.summary, ta: product.summary },
        lead: { title: product.title, kind: product.kind, href: product.url },
        bullets: related.map(toBullet),
        links: [
          { label: `About ${product.title}`, href: product.url, primary: true },
          { label: 'Book a free consultation', href: '/book' },
        ],
        followUps: ['How much does it cost?', 'What are Sirah’s products?'],
      };
    },
  },

  {
    id: 'achievements',
    // Counts read off the index, never a claim. "We have delivered a lot" is
    // the sentence this intent exists to avoid.
    test: /\b(achievement(s)?|track record|results|stats|statistics|numbers|how many|accomplish\w*|success)\b/,
    respond: () => {
      const live = listEntries('PRODUCTION_PROJECTS');
      const clients = listEntries('CLIENTS');
      const industries = listEntries('INDUSTRIES');
      const services = listEntries('SERVICES');
      if (!live.length && !clients.length) return null;
      return {
        text: {
          en:
            `${clients.length} clients, ${live.length} systems live in production, ` +
            `${services.length} services across ${industries.length} sectors. The work itself:`,
          ta:
            `${clients.length} வாடிக்கையாளர்கள், ${live.length} அமைப்புகள் நடைமுறையில், ` +
            `${industries.length} துறைகளில் ${services.length} சேவைகள். பணிகள்:`,
        },
        bullets: live.map(toBullet),
        links: [{ label: 'See the work', href: '/products#client-systems', primary: true }],
        followUps: ['Book a free call', 'Which industries do you work with?'],
      };
    },
  },

  {
    id: 'about',
    /*
     * "what does sirah digital do" was refused as off-topic — the plainest
     * question anybody asks a company's website, turned away by its own bot.
     * Nothing here matched it: the services intent tests `what do you do`, in
     * the second person, and the visitor had written the company's name
     * instead. The first alternative below covers both, and any other subject
     * in the middle: "what does sirah build", "what do you people actually do".
     */
    test: /\bwhat (do|does|is|are)\b[\s\S]{0,24}\b(do|doing|build|make|offer|about|specialis\w+|specializ\w+)\b|\babout (you|us|sirah|the company|your company)\b|\b(who is sirah|what is sirah|company|agency|story|history|mission|vision|values|purpose)\b/,
    respond: () => {
      const services = listEntries('SERVICES');
      const industries = listEntries('INDUSTRIES');
      return {
        text: {
          en:
            `${COMPANY.name} — ${COMPANY.blurb || COMPANY.tagline}` +
            (services.length
              ? ` In practice: ${services.length} services across ${industries.length} sectors, plus products of our own.`
              : ''),
          ta:
            `${COMPANY.name} — ${COMPANY.blurb || COMPANY.tagline}` +
            (services.length ? ` ${industries.length} துறைகளில் ${services.length} சேவைகள்.` : ''),
        },
        links: [
          { label: 'About us', href: '/about', primary: true },
          { label: 'See all services', href: '/services' },
          { label: 'See the work', href: '/products#client-systems' },
        ],
        followUps: ['What services do you provide?', 'Which industries do you work with?'],
      };
    },
  },
];

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Every literal word the bot's own patterns listen for.
 *
 * Handed to correctQuery as the set it must not touch. Derived from the regex
 * sources rather than written out, because a hand-kept list is a list that
 * goes stale the first time somebody adds an intent — and going stale here is
 * silent: the word simply starts being rewritten into something else before
 * any intent gets to see it.
 *
 * Built once at module load. The regexes are constants; nothing about them can
 * change at runtime.
 */
const INTENT_VOCAB = (() => {
  const words = new Set();
  const sources = [
    ...INTENTS.map((i) => i.test),
    ...FAQ.map((f) => f.test),
    ...PERSONA_INTENTS.map((p) => p.test),
    CAPABILITY_SHAPE,
  ];

  for (const test of sources) {
    if (!(test instanceof RegExp)) continue; // several tests are functions
    /*
     * Whole words only — a run of letters that the pattern does not go on to
     * extend. `technolog\w+` and `vacanc\w*` are stems, not words, and adding
     * them here was worse than useless: the spellchecker takes this set as
     * targets, "technology" is one deletion from "technolog", and the query
     * "what technology do you use" was silently rewritten to a fragment that
     * `technolog\w+` then failed to match. The intent stopped firing on its
     * own keyword.
     *
     * So a match is kept only when the next character is not a quantifier and
     * not the start of an escape class.
     */
    for (const match of test.source.matchAll(/[a-z]{4,}/g)) {
      const next = test.source[match.index + match[0].length];
      if (next === '*' || next === '+' || next === '?' || next === '\\') continue;
      words.add(match[0]);
    }
  }
  return words;
})();

const LANGS_SET = new Set(['en', 'ta']);

/** Resolves an `{ en, ta }` pair, or passes a plain string through unchanged. */
function resolve(value, lang) {
  if (value == null) return '';
  return typeof value === 'string' ? value : pick(value, lang);
}

/**
 * Answer a question.
 *
 * Always returns a reply object — there is no throw and no empty state. The
 * worst case is `confidence: 'none'`, which the panel renders as a plain
 * "I don't have that" plus a route to a human.
 *
 * `ctx` carries the conversation: `lang`, the remembered `name`, and the `turn`
 * count. Any change the reply wants to make to that state comes back on the
 * reply itself as `setName` / `clearName`.
 */
export function answerQuestion(question, ctx = {}) {
  // Set before anything reads it, and never awaited past — see ACTIVE's note.
  ACTIVE = Array.isArray(ctx.knowledge) && ctx.knowledge.length ? ctx.knowledge : KNOWLEDGE;
  const lang = LANGS_SET.has(ctx.lang) ? ctx.lang : DEFAULT_LANG;
  const state = { name: ctx.name || null, turn: ctx.turn || 0 };
  const raw = String(question || '').trim();

  // Spelling is corrected once, up front, and everything downstream of the
  // persona layer reads the corrected text.
  //
  // Before the intent tests, not just before retrieval: "what servcies do you
  // provide" cannot be rescued by retrieval at all, because the corrected word
  // is a stopword and gets filtered straight back out. Only the services
  // intent can answer it, and only if it sees the corrected spelling.
  //
  // Persona still reads `raw`. A name is not a typo — running "my name is
  // Rijaz" through a spellchecker aimed at the site's vocabulary is how you
  // greet somebody by the wrong name.
  const { text: spelled, changed } = correctQuery(raw, ACTIVE, INTENT_VOCAB);
  const normalized = spelled.toLowerCase();

  if (!normalized) {
    return {
      text: resolve(
        {
          en: 'Ask me anything about Sirah Digital.',
          ta: 'Sirah Digital பற்றி எதையும் கேளுங்கள்.',
        },
        lang,
      ),
      confidence: 'none',
    };
  }

  // 1 — persona. Checked first so "hi" is a greeting rather than a weak BM25
  // hit, and so an introduction is never mistaken for a question.
  for (const intent of PERSONA_INTENTS) {
    const matched =
      typeof intent.test === 'function' ? intent.test(raw) : intent.test.test(raw);
    if (!matched) continue;
    const reply = intent.respond(state, lang, raw);
    if (!reply) continue;
    return {
      ...reply,
      text: resolve(reply.text, lang),
      confidence: 'high',
      intent: intent.id,
    };
  }

  // 2 — the authored FAQ.
  //
  // Above the content intents rather than below them, because these are the
  // questions the site has no page for: hours, timelines, contract terms,
  // careers, the services we do not sell. Retrieval cannot answer any of them
  // — there is nothing indexed to retrieve — so before this layer existed they
  // fell all the way through to "that is outside what I can help with".
  //
  // The ordering is safe only because faq.js keeps its tests narrow; a loose
  // one here silently outranks the site's own copy. See the note in that file.
  for (const entry of FAQ) {
    if (!entry.test.test(normalized)) continue;
    const reply = entry.respond(lang);
    if (!reply) continue;
    return {
      ...reply,
      text: resolve(reply.text, lang),
      confidence: 'high',
      intent: `faq:${entry.id}`,
    };
  }

  // 3 — content intents.
  //
  // `test` may be a function as well as a regex — the product intent has to
  // read the live index to know the product names, which a constant regex
  // cannot do — and `respond` is handed the question, because the scoped
  // lookups rank against it rather than returning a fixed list.
  for (const intent of INTENTS) {
    const matched =
      typeof intent.test === 'function' ? intent.test(normalized) : intent.test.test(normalized);
    if (!matched) continue;
    const reply = intent.respond(normalized);
    if (!reply) continue;
    return {
      ...reply,
      text: resolve(reply.text, lang),
      extra: resolve(reply.extra, lang),
      confidence: 'high',
      intent: intent.id,
    };
  }

  // 4a — a question that leans on the last one.
  //
  // "How much for that?" has no content words of its own, so retrieval would
  // score it near zero and the gate would refuse a perfectly ordinary thing to
  // say mid-conversation. Re-ask it as the previous intent instead.
  const words = raw.split(/\s+/).filter(Boolean);
  if (ctx.lastIntent && words.length <= FOLLOW_UP_MAX_WORDS && FOLLOW_UP.test(raw)) {
    const previous = INTENTS.find((i) => i.id === ctx.lastIntent);
    if (previous) {
      // The scoped intents rank against the question, and a pronoun does not
      // rank against anything — they return null and the miss falls through to
      // retrieval below, which is the correct outcome for "how much for that?"
      // when the previous answer was a scoped lookup.
      const reply = previous.respond(normalized);
      if (reply) {
        return {
          ...reply,
          text: resolve(reply.text, lang),
          extra: resolve(reply.extra, lang),
          confidence: 'high',
          intent: previous.id,
          followedUp: true,
        };
      }
    }
  }

  // 4b — retrieval over everything else, on the corrected spelling.
  const results = search(spelled, ACTIVE, { limit: 4 });
  const best = results[0];

  /*
   * An entry may only *state* an answer if it has something to state.
   *
   * The score gate above asks whether a match is relevant. It has no opinion
   * on whether the thing matched can be read aloud, and the fall-through below
   * quotes `summary || title` — so an entry with no summary answered with its
   * own title, as a whole sentence, on its own. Real replies this produced:
   *
   *     "do you work with hospitals"  ->  "Al Shifa Hospital"
   *     "do you serve manufacturing"  ->  "Manufacturing"
   *
   * Both matched the right thing. Neither said anything. A client name is a
   * fine bullet under an answer and is not an answer, so an entry that cannot
   * carry the sentence is demoted to a suggestion, where it renders as a link
   * under a line that does read as English.
   *
   * The threshold is deliberately low. It is not a quality bar on the copy —
   * it is the difference between a sentence and a label.
   */
  const MIN_ANSWER_SUMMARY = 24;
  const speakable = (entry) => (entry?.summary || '').trim().length >= MIN_ANSWER_SUMMARY;

  const answers =
    best && best.score >= ANSWER.score && best.coverage >= ANSWER.coverage && speakable(best.entry);

  /*
   * A suggestion also has to be about something the site has heard of.
   *
   * "the closest thing on the site" is a fair offer when the visitor asked
   * about our subject and phrased it awkwardly. It is not fair when they asked
   * about something else entirely and two incidental words matched: "what is
   * the price of gold today?" scored LexDraft at 0.67 coverage on *price* and
   * *today*, and would have been offered legal-practice software as the
   * nearest answer.
   *
   * The tell is a term with no document frequency at all. `gold` is in no
   * entry, so the question's actual subject is one the index cannot speak to,
   * and the honest reply is the refusal rather than a near miss. Only the
   * suggestion is gated: a hit strong enough to clear the ANSWER bar has
   * covered the question on its own terms and does not need this.
   */
  const strayTerms = best ? unknownTerms(spelled, ACTIVE) : [];
  const suggests =
    best &&
    best.score >= SUGGEST.score &&
    best.coverage >= SUGGEST.coverage &&
    (answers || strayTerms.length === 0);

  // Between "answerable" and "not our subject" there is a real band: the
  // question is clearly about us but too vague to answer, or it was only
  // rescued by spellcheck. Guessing out loud — "did you mean X?" — is what
  // the live sirahdigital.in bot does there, and it beats both a wrong answer
  // and a flat refusal, because a wrong guess costs the visitor one tap.
  if (
    !answers &&
    !suggests &&
    best &&
    best.score >= MAYBE.score &&
    best.coverage >= MAYBE.coverage &&
    // Same guard as the suggestion above, for the same reason. Without it the
    // gold question simply moved down a rung and came back as "I am not
    // certain I follow. Did you mean **LexDraft**?" — which is the wrong page
    // offered in a politer voice.
    strayTerms.length === 0
  ) {
    return {
      text: resolve(
        {
          en: `I am not certain I follow. Did you mean **${best.entry.title}**?`,
          ta: `எனக்கு சரியாக புரியவில்லை. நீங்கள் **${best.entry.title}** பற்றி கேட்கிறீர்களா?`,
        },
        lang,
      ),
      followUps: [best.entry.title, ...QUICK_REPLIES_BY_LANG[lang].slice(0, 2)],
      confidence: 'low',
      intent: 'clarify',
      corrected: changed,
    };
  }

  // Not our subject. Say so, offer the things that are, and do not ask for
  // their details — a contact form under a refusal reads as a bot that would
  // rather capture a lead than admit it does not know.
  if (!answers && !suggests) {
    return {
      text: resolve(OUT_OF_SCOPE, lang),
      followUps: QUICK_REPLIES_BY_LANG[lang],
      confidence: 'none',
      intent: 'out-of-scope',
    };
  }

  return {
    text: answers
      ? best.entry.summary || best.entry.title
      : resolve(
          {
            en: 'I did not find a direct answer, but this is the closest on the site:',
            ta: 'நேரடியான பதில் கிடைக்கவில்லை, ஆனால் இணையதளத்தில் இதுவே மிக நெருக்கமானது:',
          },
          lang,
        ),
    // `lead` is the headline result, not a form flag — the check harness
    // prints it. Contact capture is `offerLead`, which renders a button the
    // visitor can ignore rather than unfolding a form at them, and only on a
    // partial answer: on-topic but unresolved is exactly when a human helps.
    lead: answers
      ? { title: best.entry.title, kind: best.entry.kind, href: best.entry.url }
      : null,
    offerLead: !answers,
    bullets: (answers ? results.slice(1) : results).map((r) => toBullet(r.entry)),
    links: [{ label: 'Book a free consultation', href: '/contact', primary: true }],
    confidence: answers ? 'high' : 'low',
  };
}

/** Kept as the English defaults so existing callers keep working unchanged. */
export const QUICK_REPLIES = QUICK_REPLIES_BY_LANG[DEFAULT_LANG];
export const GREETING = GREETING_PAIR[DEFAULT_LANG];

/** Language-aware versions, for the panel. */
export { QUICK_REPLIES_BY_LANG, GREETING_PAIR };
