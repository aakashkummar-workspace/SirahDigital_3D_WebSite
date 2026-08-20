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
import { search, bySource, correctQuery } from './search';
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
    test: /\b(book|appointment|consultation|schedule|meeting|call back|demo)\b/,
    respond: () => ({
      text: {
        en:
          'Happy to set that up. Consultations are free, run about 45 minutes, and you can pick a slot ' +
          'straight from the calendar - it confirms instantly and sends a Google Meet link.',
        ta:
          'மகிழ்ச்சியுடன் ஏற்பாடு செய்கிறேன். ஆலோசனை இலவசம், சுமார் 45 நிமிடங்கள். நாட்காட்டியிலிருந்தே ' +
          'நேரத்தைத் தேர்வு செய்யலாம் - உடனடியாக உறுதி செய்யப்பட்டு Google Meet இணைப்பு அனுப்பப்படும்.',
      },
      links: [{ label: 'Book a free consultation', href: '/contact', primary: true }],
      followUps: ['What services do you provide?', 'What are Sirah’s products?'],
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
    test: /(\bautomat\w*\b[\s\S]*\b(useful|benefit|help|why|worth|value|roi|save|saving|good|point|advantage)\b)|(\b(useful|benefit|help|why|worth|value|roi|save|saving|should i|advantage)\b[\s\S]*\bautomat)|(\b(problem(s)?|issue(s)?|challenge(s)?|pain|struggle|bottleneck)\b[\s\S]*\b(solve|fix|help|handle|address)\b)|(\b(solve|fix)\b[\s\S]*\b(problem(s)?|issue(s)?|challenge(s)?)\b)/,
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
    test: /\b(tech(nology|nologies|nical)?|stack|tools?|built with|platform(s)? do you use|integrat\w+)\b/,
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
    id: 'team',
    test: /\b(team|founder|staff|people|employee(s)?|ceo)\b/,
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
    test: /\b(contact|email|phone|call you|reach|address|office|located|location|where are you)\b/,
    // Read straight off the company record so a change of address or number
    // never leaves a stale copy in the bot — the same record the footer and
    // the contact page render.
    respond: () => ({
      text: {
        en: 'You can reach us directly - or book a slot and skip the back-and-forth.',
        ta: 'நேரடியாக எங்களை தொடர்பு கொள்ளலாம் - அல்லது நேரம் பதிவு செய்து காத்திருப்பைத் தவிர்க்கலாம்.',
      },
      contact: CONTACT_CARD,
      links: [
        { label: 'Book a free consultation', href: '/contact', primary: true },
        { label: 'Contact page', href: '/contact' },
      ],
    }),
  },

  {
    id: 'pricing',
    test: /\b(price|pricing|cost|quote|budget|how much|fee(s)?|charge)\b/,
    respond: () => ({
      text: {
        en:
          'Pricing depends on scope - the systems we build range from a single automated workflow to a ' +
          'full platform, so there is no list price that would be honest. The consultation is free and ' +
          'ends with a scoped estimate.',
        ta:
          'விலை பணியின் அளவைப் பொறுத்தது - ஒரு தானியக்க பணிப்பாய்வு முதல் முழு தளம் வரை நாங்கள் ' +
          'உருவாக்குகிறோம், எனவே ஒரே நிலையான விலை சொல்வது நேர்மையாக இருக்காது. ஆலோசனை இலவசம், ' +
          'அதன் முடிவில் தெளிவான மதிப்பீடு கிடைக்கும்.',
      },
      links: [
        { label: 'Book a free consultation', href: '/contact', primary: true },
        { label: 'Send us the details', href: '/contact' },
      ],
      followUps: ['What services do you provide?'],
    }),
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
    // "tell me about the company" carries none of the earlier patterns — no
    // "about you", no "your company" — and was missing entirely.
    test: /\babout (you|us|sirah|the company|your company)\b|\b(who is sirah|company|agency|story|history|mission|vision|values|purpose)\b/,
    respond: () => ({
      text: {
        en: `${COMPANY.name} - ${COMPANY.blurb || COMPANY.tagline}`,
        ta: `${COMPANY.name} - ${COMPANY.blurb || COMPANY.tagline}`,
      },
      links: [
        { label: 'About us', href: '/about', primary: true },
        { label: 'See the work', href: '/products#client-systems' },
      ],
      followUps: ['What services do you provide?', 'Which industries do you work with?'],
    }),
  },
];

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

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
  const { text: spelled, changed } = correctQuery(raw, ACTIVE);
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

  // 2 — content intents.
  for (const intent of INTENTS) {
    if (!intent.test.test(normalized)) continue;
    const reply = intent.respond();
    if (!reply) continue;
    return {
      ...reply,
      text: resolve(reply.text, lang),
      extra: resolve(reply.extra, lang),
      confidence: 'high',
      intent: intent.id,
    };
  }

  // 3a — a question that leans on the last one.
  //
  // "How much for that?" has no content words of its own, so retrieval would
  // score it near zero and the gate would refuse a perfectly ordinary thing to
  // say mid-conversation. Re-ask it as the previous intent instead.
  const words = raw.split(/\s+/).filter(Boolean);
  if (ctx.lastIntent && words.length <= FOLLOW_UP_MAX_WORDS && FOLLOW_UP.test(raw)) {
    const previous = INTENTS.find((i) => i.id === ctx.lastIntent);
    if (previous) {
      const reply = previous.respond();
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

  // 3b — retrieval over everything else, on the corrected spelling.
  const results = search(spelled, ACTIVE, { limit: 4 });
  const best = results[0];

  const answers = best && best.score >= ANSWER.score && best.coverage >= ANSWER.coverage;
  const suggests = best && best.score >= SUGGEST.score && best.coverage >= SUGGEST.coverage;

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
    best.coverage >= MAYBE.coverage
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
