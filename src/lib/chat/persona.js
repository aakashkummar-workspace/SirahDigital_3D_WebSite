/**
 * The conversational layer — everything the bot says that is not an answer.
 *
 * answer.js knows facts. This knows manners: greetings, thanks, goodbyes, who
 * it is, what it can do, remembering a name, and the small talk that arrives
 * before anyone gets to a real question. The split matters because the two have
 * opposite update rules — answer.js must never contain an authored fact, and
 * this file is nothing but authored lines.
 *
 * ── why every line is a pair ─────────────────────────────────────────────
 * The bot answers in English and Tamil, so each response is `{ en, ta }` and
 * `pick()` chooses. Responses are functions rather than strings because most of
 * them interpolate the visitor's remembered name, and Tamil puts it in a
 * different place in the sentence than English does — a shared template with a
 * substitution would force one language's word order onto the other.
 *
 * ── what is deliberately English in both ─────────────────────────────────
 * Anything read out of site data: service names, industry names, project
 * titles. The site itself is written in English, so translating a *frame*
 * around English content is honest and translating the content would be
 * inventing Tamil copy nobody has approved. Frames are translated; data is not.
 */

import { COMPANY } from '@/data/company';
import { SOCIALS } from '@/data/socials';

export const LANGS = ['en', 'ta'];
export const DEFAULT_LANG = 'en';

/** Chooses a language out of an `{ en, ta }` pair, falling back to English. */
export function pick(pair, lang) {
  if (!pair) return '';
  return pair[lang] ?? pair[DEFAULT_LANG] ?? '';
}

/* ------------------------------------------------------------------ */
/* Panel chrome                                                        */
/* ------------------------------------------------------------------ */

export const UI = {
  title: { en: 'Sirah AI', ta: 'Sirah AI' },
  status: { en: 'Online', ta: 'ஆன்லைனில்' },
  placeholder: {
    en: 'Ask about services, industries, pricing…',
    ta: 'சேவைகள், துறைகள், விலை பற்றி கேளுங்கள்…',
  },
  send: { en: 'Send', ta: 'அனுப்பு' },
  close: { en: 'Close chat', ta: 'அரட்டையை மூடு' },
  typing: { en: 'Sirah AI is typing', ta: 'Sirah AI தட்டச்சு செய்கிறது' },
  langToggle: { en: 'தமிழில் பேசு', ta: 'Switch to English' },
  restart: { en: 'Start over', ta: 'மீண்டும் தொடங்கு' },
  disclaimer: {
    en: 'Answers come from this site’s own pages.',
    ta: 'பதில்கள் இந்த இணையதளத்தின் பக்கங்களிலிருந்தே வருகின்றன.',
  },
  leadTitle: { en: 'Leave your details', ta: 'உங்கள் விவரங்களை பகிருங்கள்' },
  leadName: { en: 'Your name', ta: 'உங்கள் பெயர்' },
  leadEmail: { en: 'Email address', ta: 'மின்னஞ்சல் முகவரி' },
  leadMessage: { en: 'What do you need help with?', ta: 'உங்களுக்கு என்ன உதவி தேவை?' },
  leadSubmit: { en: 'Send to the team', ta: 'குழுவிற்கு அனுப்பு' },
  leadSending: { en: 'Sending…', ta: 'அனுப்புகிறது…' },
  leadDone: {
    en: 'Got it - the team will be in touch shortly.',
    ta: 'கிடைத்தது - குழு விரைவில் தொடர்பு கொள்ளும்.',
  },
  leadCancel: { en: 'Cancel', ta: 'ரத்து' },
};

/**
 * What the bot says when the question is not its business.
 *
 * A retrieval bot will always return *something* — BM25 ranks the whole corpus
 * and hands back the top of it no matter how irrelevant the best match is. Left
 * alone, "can I drink hot water in winter?" gets answered with whichever page
 * shares an incidental word, which makes the bot look broken and, worse, makes
 * everything else it says less believable.
 *
 * So an out-of-scope question gets a refusal, not a guess. It names the four
 * things it does cover so the visitor can re-aim, and it does not ask for their
 * contact details — nobody who asked about hot water wants a sales call.
 */
export const OUT_OF_SCOPE = {
  en:
    'That one is outside what I can help with. I only answer questions about Sirah Digital - ' +
    'our services, the industries we work in, our products and past work, pricing, or how to ' +
    'reach the team.',
  ta:
    'அது என்னால் உதவ முடியாத ஒன்று. நான் Sirah Digital பற்றி மட்டுமே பதிலளிக்கிறேன் - ' +
    'எங்கள் சேவைகள், நாங்கள் பணியாற்றும் துறைகள், தயாரிப்புகள், முந்தைய பணிகள், விலை, ' +
    'அல்லது குழுவை எப்படி தொடர்புகொள்வது.',
};

export const GREETING = {
  en: 'Hello! I’m Sirah’s AI assistant. How can I help you improve your business today?',
  ta: 'வணக்கம்! நான் Sirah-வின் AI உதவியாளர். இன்று உங்கள் வணிகத்தை மேம்படுத்த நான் எப்படி உதவலாம்?',
};

/** The chips under the greeting. Booking first — it is the goal. */
export const QUICK_REPLIES = {
  en: [
    { label: 'Book a free call', primary: true },
    { label: 'What services do you provide?' },
    { label: 'Which industries do you work with?' },
    { label: 'How is automation useful for my business?' },
  ],
  ta: [
    { label: 'இலவச ஆலோசனை பதிவு', primary: true, send: 'Book a free call' },
    { label: 'என்ன சேவைகள் வழங்குகிறீர்கள்?', send: 'What services do you provide?' },
    { label: 'எந்த துறைகளில் பணியாற்றுகிறீர்கள்?', send: 'Which industries do you work with?' },
    { label: 'தானியக்கம் எப்படி உதவும்?', send: 'How is automation useful for my business?' },
  ],
};

/* ------------------------------------------------------------------ */
/* Fun facts                                                           */
/* ------------------------------------------------------------------ */

const FUN_FACTS = {
  en: [
    'The first chatbot, ELIZA, was written in 1966 - it worked entirely by rephrasing what you typed back at you as a question.',
    'Most businesses automate the same three things first: intake, follow-up and reporting. They are also the three that eat the most hours.',
    'Automation does not need to be clever to pay. A rule that never forgets to send the second email will beat a person who sometimes does.',
    'The costliest process in most companies is the one nobody has written down, because nobody can see what it costs.',
  ],
  ta: [
    'முதல் சாட்பாட் ELIZA 1966-ல் உருவாக்கப்பட்டது - நீங்கள் எழுதியதையே கேள்வியாக மாற்றித் திருப்பிக் கேட்பதுதான் அதன் வேலை.',
    'பெரும்பாலான நிறுவனங்கள் முதலில் தானியக்கமாக்குவது மூன்றுதான்: விசாரணை, தொடர்தொடர்பு, அறிக்கை. அவைதான் அதிக நேரத்தை விழுங்குபவையும்.',
    'தானியக்கம் புத்திசாலியாக இருக்க வேண்டியதில்லை. இரண்டாவது மின்னஞ்சலை மறக்காமல் அனுப்பும் ஒரு விதி, சில நேரம் மறக்கும் ஒரு நபரை விட சிறந்தது.',
    'பெரும்பாலான நிறுவனங்களில் அதிக செலவு பிடிக்கும் செயல்முறை, யாரும் எழுதி வைக்காததுதான் - ஏனெனில் அதன் விலை யாருக்கும் தெரிவதில்லை.',
  ],
};

/* ------------------------------------------------------------------ */
/* Name handling                                                       */
/* ------------------------------------------------------------------ */

/**
 * Pulls a name out of an introduction.
 *
 * Deliberately narrow. It only fires on an explicit introduction, never on a
 * bare word — "automation" typed alone should be a question about automation,
 * not the bot deciding the visitor is called Automation. The stop-list catches
 * the handful of things people actually type after "I'm" that are not names.
 */
const NAME_PATTERNS = [
  /^(?:my name is|i am|i'm|im|call me|this is)\s+([a-z஀-௿][a-z஀-௿.'-]{1,24})/i,
  /^(?:என்\s*பெயர்)\s+([a-z஀-௿][a-z஀-௿.'-]{1,24})/i,
];

const NOT_NAMES = new Set([
  'looking', 'interested', 'here', 'trying', 'just', 'not', 'sure', 'good', 'fine',
  'ok', 'okay', 'from', 'the', 'a', 'an', 'in', 'at', 'with', 'wondering', 'asking',
  'new', 'back', 'busy', 'ready', 'sorry',
]);

export function detectName(text) {
  const raw = String(text || '').trim();
  for (const re of NAME_PATTERNS) {
    const m = raw.match(re);
    if (!m) continue;
    const candidate = m[1].replace(/[.'-]+$/, '');
    if (NOT_NAMES.has(candidate.toLowerCase())) return null;
    // Title-case Latin names; leave Tamil script alone, which has no case.
    return /^[a-z]/i.test(candidate)
      ? candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase()
      : candidate;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Conversational intents                                              */
/* ------------------------------------------------------------------ */

/**
 * Each entry is `{ id, test, respond(ctx, lang) }` where ctx carries the
 * remembered `name`. First match wins, so order is precedence.
 *
 * A respond() may return `setName` or `clearName` alongside its text; answer.js
 * passes those back to the panel, which owns the conversation state. Nothing in
 * lib/chat holds mutable state of its own — the same module answers for every
 * visitor on the server during the build check, so it must stay pure.
 */
export const PERSONA_INTENTS = [
  {
    id: 'name_correction',
    test: /\b(not my name|wrong name|that('| i)s not my name|call me something else|forget my name)\b/i,
    respond: () => ({
      clearName: true,
      text: {
        en: 'My mistake - I’ve forgotten it. What should I call you?',
        ta: 'என் தவறு - மறந்துவிட்டேன். உங்களை என்ன அழைக்க வேண்டும்?',
      },
    }),
  },

  {
    id: 'name_capture',
    test: (q) => detectName(q) !== null,
    respond: (ctx, lang, q) => {
      const name = detectName(q);
      return {
        setName: name,
        text: {
          en: `The pleasure is mine, **${name}**. What would you like to know about Sirah Digital?`,
          ta: `உங்களை சந்தித்ததில் மகிழ்ச்சி, **${name}**! Sirah Digital பற்றி என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?`,
        },
        followUps: QUICK_REPLIES[lang].slice(0, 3),
      };
    },
  },

  {
    id: 'my_name_query',
    test: /\b(what('| i)s my name|do you (know|remember) my name|who am i)\b/i,
    respond: (ctx) => ({
      text: ctx.name
        ? {
            en: `You’re **${ctx.name}** - I’ve got it.`,
            ta: `நீங்கள் **${ctx.name}** - எனக்கு நினைவிருக்கிறது.`,
          }
        : {
            en: 'You haven’t told me yet. Say "my name is…" and I’ll remember it for this conversation.',
            ta: 'நீங்கள் இன்னும் சொல்லவில்லை. "என் பெயர்…" என்று சொல்லுங்கள், இந்த உரையாடல் முழுவதும் நினைவில் வைத்திருப்பேன்.',
          },
    }),
  },

  {
    id: 'bot_identity',
    test: /\b(who are you|what are you|are you (a )?(real|human|bot|robot|ai)|your name|chatgpt)\b/i,
    respond: () => ({
      text: {
        en:
          'I’m Sirah Digital’s assistant - not a person, and not a general-purpose AI. I answer from ' +
          'what this site publishes: services, industries, products, past work and how to reach the team. ' +
          'Anything outside that, I’ll hand you to someone who actually knows.',
        ta:
          'நான் Sirah Digital-இன் உதவியாளர் - ஒரு நபர் அல்ல, பொது AI-யும் அல்ல. இந்த இணையதளத்தில் ' +
          'வெளியிடப்பட்டவற்றிலிருந்தே பதிலளிக்கிறேன்: சேவைகள், துறைகள், தயாரிப்புகள், முந்தைய பணிகள், ' +
          'தொடர்பு விவரங்கள். அதற்கு வெளியே இருந்தால், உண்மையில் தெரிந்தவரிடம் உங்களை அனுப்புவேன்.',
      },
      followUps: QUICK_REPLIES[DEFAULT_LANG].slice(1, 3),
    }),
  },

  {
    id: 'capabilities',
    // The bare-word alternative at the end, because a visitor typing "help" on
    // its own was getting the out-of-scope refusal — the bot telling the person
    // asking for help that help is outside what it can help with. Same for a
    // lone question mark, which is somebody saying "I don't know what to ask".
    // `help me` was a bare alternative here and it claimed "can you help me
    // reduce manual work" — a description of a real problem, answered with the
    // bot's own menu. Only the standalone plea keeps it now; the rest is the
    // capability intent's, where a problem statement belongs.
    test: /\b(what can you do|how (can|do) you help|what do you know)\b|^\s*(help|help me|options|menu|\?+|hlp)\s*[.!?]*$/i,
    respond: (ctx, lang) => ({
      text: {
        en: 'I can walk you through any of these - or just ask in your own words.',
        ta: 'இவற்றில் எதைப் பற்றியும் நான் விளக்குகிறேன் - அல்லது உங்கள் சொந்த வார்த்தைகளில் கேளுங்கள்.',
      },
      followUps: QUICK_REPLIES[lang],
    }),
  },

  {
    id: 'fun_fact',
    test: /\b(fun fact|tell me something|interesting|surprise me|did you know)\b/i,
    respond: (ctx, lang) => {
      const pool = FUN_FACTS[lang] || FUN_FACTS.en;
      // Indexed off the turn count rather than randomly, so repeated asks walk
      // the list instead of repeating — and so the build check is deterministic.
      const fact = pool[(ctx.turn || 0) % pool.length];
      return { text: { en: fact, ta: fact } };
    },
  },

  {
    id: 'social_media',
    /*
     * Narrowed twice, and the second time is the one that matters.
     *
     * "whatsapp" alone was never enough — "do you build WhatsApp bots?" is a
     * question about our services, and answering it with a list of our own
     * profiles is a non-sequitur. That guard is still here.
     *
     * What it did not catch was the other direction: somebody asking how to
     * *reach us* who happens to say the word. "whatsapp number", "can I
     * whatsapp you", "I want to talk to someone" all landed here and got
     * "WhatsApp is the fastest if you want a person" plus a row of links out
     * to Facebook, Instagram and YouTube. Asking a company for its number and
     * being redirected into a messaging app is not an answer to the question,
     * and the social row made it read like a bot changing the subject.
     *
     * So this intent now only fires on questions that are actually about the
     * profiles — "are you on instagram", "social media", "where can I follow
     * you". Everything about reaching a human belongs to answer.js's contact
     * intent, which leads with the phone number and a time to book, and it
     * gets there because this no longer claims it first.
     */
    test: (q) =>
      // "do you do social media marketing" is a question about our services
      // — and the answer is no, which faq.js says. Answering it with our own
      // Instagram link reads as agreement.
      !/\b(do|does|can|could|will|would) (you|u|sirah)\b[\s\S]{0,30}\b(marketing|management|managing|posting|handle|run|do|offer|provide)\b/i.test(q) &&
      (/\b(social media|follow (you|us)|your (socials|profiles|handles)|facebook|instagram|youtube|linkedin|twitter)\b/i.test(q) ||
      // WhatsApp only when the sentence is about the account itself, never
      // when it is about contacting us or about building something.
        (/\bwhatsapp\b/i.test(q) &&
          /\b(page|channel|profile|handle|account|group|community|follow)\b/i.test(q) &&
          !/\b(bot|bots|chatbot|automat\w+|integrat\w+|api|build|develop|set ?up)\b/i.test(q))),
    respond: () => ({
      text: {
        en: 'We’re on these — worth a follow if you want to see what we ship.',
        ta: 'நாங்கள் இவற்றில் இருக்கிறோம் — நாங்கள் என்ன உருவாக்குகிறோம் என்பதைப் பார்க்க பின்தொடரலாம்.',
      },
      links: SOCIALS.map((s) => ({ label: s.label, href: s.href, external: true })),
      followUps: ['How do I contact you?', 'Book a free call'],
    }),
  },

  {
    id: 'thanks',
    test: /\b(thank|thanks|thx|appreciate|நன்றி)\b/i,
    respond: (ctx) => ({
      text: ctx.name
        ? {
            en: `Any time, **${ctx.name}**. Anything else you want to dig into?`,
            ta: `எப்போது வேண்டுமானாலும், **${ctx.name}**. வேறு ஏதாவது தெரிந்து கொள்ள வேண்டுமா?`,
          }
        : {
            en: 'Any time. Anything else you want to dig into?',
            ta: 'எப்போது வேண்டுமானாலும். வேறு ஏதாவது தெரிந்து கொள்ள வேண்டுமா?',
          },
    }),
  },

  {
    id: 'bye',
    test: /\b(bye|goodbye|see you|later|that('| i)s all|no thanks|nothing else)\b/i,
    respond: (ctx) => ({
      text: ctx.name
        ? {
            en: `Good talking to you, **${ctx.name}**. The consultation is free whenever you want it.`,
            ta: `உங்களுடன் பேசியது மகிழ்ச்சி, **${ctx.name}**. ஆலோசனை எப்போதும் இலவசம்.`,
          }
        : {
            en: 'Good talking to you. The consultation is free whenever you want it.',
            ta: 'உங்களுடன் பேசியது மகிழ்ச்சி. ஆலோசனை எப்போதும் இலவசம்.',
          },
      // /book, not /contact: the calendar this sentence promises is there.
      links: [{ label: 'Pick a time', href: '/book', primary: true }],
    }),
  },

  {
    id: 'greeting',
    test: /^\s*(hi|hey+|hello|yo|good (morning|afternoon|evening)|namaste|vanakkam|வணக்கம்)\b/i,
    respond: (ctx, lang) => ({
      text: ctx.name
        ? {
            en: `Hello again, **${ctx.name}**! How can I help you improve your business today?`,
            ta: `மீண்டும் வணக்கம், **${ctx.name}**! இன்று உங்கள் வணிகத்தை மேம்படுத்த எப்படி உதவலாம்?`,
          }
        : GREETING,
      followUps: QUICK_REPLIES[lang],
    }),
  },

  {
    id: 'casual',
    test: /\b(how are you|how('| i)s it going|what('| i)s up|sup)\b/i,
    respond: () => ({
      text: {
        en: 'Running well, thank you - and pointed entirely at your business. What are you trying to fix?',
        ta: 'நன்றாக இயங்குகிறேன், நன்றி - முழு கவனமும் உங்கள் வணிகத்தில். எதைச் சரிசெய்ய முயல்கிறீர்கள்?',
      },
    }),
  },

  {
    id: 'lead',
    /*
     * The visitor offering *their* details, not asking for ours.
     *
     * `get in touch` was in here, so "how do I get in touch?" — a request for
     * the company's phone number — unfolded a name-and-email form instead of
     * answering. The distinction this intent has to hold is direction: "call
     * me back" is a lead, "how do I call you" is the contact intent, and the
     * only thing keeping them apart is that the phrases below all put the
     * visitor on the receiving end.
     */
    test: /\b(contact me|call me back|ring me|reach me|my (email|number|details)|leave (my )?details|take my (number|details))\b/i,
    respond: () => ({
      text: {
        en: 'Happy to pass you to the team. Leave your details and they’ll come back to you.',
        ta: 'உங்களை குழுவிடம் அனுப்ப மகிழ்ச்சி. உங்கள் விவரங்களை பகிருங்கள், அவர்கள் தொடர்பு கொள்வார்கள்.',
      },
      leadForm: true,
    }),
  },
];

/** The contact card, shared by the contact intent and the lead hand-off. */
export const CONTACT_CARD = {
  email: COMPANY.email,
  phone: COMPANY.phone,
  phoneHref: COMPANY.phoneHref,
  address: COMPANY.addressOneLine,
};
