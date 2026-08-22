/**
 * Accuracy check for the chatbot.
 *
 *   node scripts/chat-check.mjs            # the fixture suite
 *   node scripts/chat-check.mjs "your question here"
 *
 * The module plumbing lives in chat-harness.mjs; this file is the fixtures and
 * the verdict.
 *
 * ── what changed, and why the old suite passed a broken bot ──────────────
 * This used to assert one thing: that a must-answer question came back with
 * `confidence: high` and a must-refuse question came back refused. Eighteen
 * fixtures, all green — while the live bot was answering "do you work with
 * real estate" with "1.08", "do you do data entry automation" with "Chaos",
 * and "do you build dashboards" with a photo caption. Every one of those was
 * high confidence. Confidence was never a measure of correctness; it only ever
 * said the gate had opened.
 *
 * So a fixture now says *what the answer has to be*:
 *
 *   intent   which handler must claim the question. This is what catches a
 *            regex quietly widening until it swallows its neighbour — the
 *            failure that produced most of the bad answers above, and the one
 *            that is invisible from the reply text alone.
 *   expect   a string or regex the reply must contain. Where the answer is a
 *            fact, this is the fact.
 *   reject   a string or regex it must NOT contain. Used for the answers that
 *            were wrong in a specific, memorable way, so they cannot come back.
 *
 * A fixture may set any combination. `refuse` fixtures assert the opposite:
 * that the question is turned away rather than answered from whichever page
 * shared a word with it.
 *
 * Adding an intent or an FAQ entry means adding a fixture here. That is the
 * whole contract — the suite is the only thing standing between a helpful
 * pattern tweak and a bot that confidently says something untrue.
 */

import { buildChat } from './chat-harness.mjs';

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

const ANSWER_FIXTURES = [
  /* ── contact and booking ─────────────────────────────────────────
   * The phone number is asserted on every route into the contact answer,
   * because the bug this replaced was not a missing answer — it was the
   * social_media intent claiming these questions and replying "WhatsApp is
   * the fastest if you want a person" with a row of links out. `reject`
   * carries that sentence so it cannot return quietly. */
  { q: 'how do I contact you', intent: 'contact', expect: '+91 97899 61631', reject: /whatsapp is the fastest/i },
  { q: 'what is your phone number', intent: 'contact', expect: '+91 97899 61631' },
  { q: 'give me your email', intent: 'contact', expect: 'support@sirahdigital.in' },
  { q: 'can I call you', intent: 'contact', expect: '+91 97899 61631' },
  { q: 'whatsapp number', intent: 'contact', expect: '+91 97899 61631', reject: /wa\.link|instagram|facebook/i },
  { q: 'where are you located', intent: 'contact', expect: 'Chennai' },
  { q: 'where is your office', intent: 'contact', expect: 'Pallavaram' },
  { q: 'how do I get in touch', intent: 'contact', expect: '+91 97899 61631' },

  // Booking must send people to /book. It spent a long time describing a
  // calendar and linking to /contact, which does not have one.
  { q: 'Book a free call', intent: 'booking', expect: '45' },
  { q: 'I want to book a consultation', intent: 'booking', link: '/book' },
  { q: 'how do I book a demo', intent: 'booking', link: '/book' },
  { q: 'can I schedule a meeting', intent: 'booking', link: '/book' },
  { q: 'is the consultation free', intent: 'booking', expect: 'free' },
  { q: 'I want to talk to someone', intent: 'booking', link: '/book' },

  /* ── who the company is ──────────────────────────────────────────
   * The first of these was refused as off-topic in production. It is the
   * plainest question a company website is asked. */
  { q: 'what does sirah digital do', intent: 'about', expect: 'SIRAH DIGITAL' },
  { q: 'what is sirah digital', intent: 'about' },
  { q: 'tell me about your company', intent: 'about' },
  { q: 'what is your mission', intent: 'about' },
  { q: 'who is the founder', intent: 'team', expect: 'Mohamed Riyaz' },
  { q: 'who are your clients', intent: 'clients' },
  { q: 'do you have client testimonials', intent: 'clients' },

  /* ── the lists ───────────────────────────────────────────────────── */
  { q: 'What services do you provide?', intent: 'services', expect: '10 services' },
  { q: 'what solutions do you offer', intent: 'services' },
  { q: 'Which industries do you work with?', intent: 'industries', expect: '12 sectors' },
  { q: 'What are Sirah’s products?', intent: 'products' },
  { q: 'what is your process', intent: 'process' },
  { q: 'what technology do you use', intent: 'tech-stack' },
  { q: 'How is automation useful for my business?', intent: 'automation-benefit' },
  { q: 'How can I scale my business?', intent: 'scale' },

  /* ── capability lookups ──────────────────────────────────────────
   * All of these were wrong in production, and the reject clauses name the
   * exact wrong answers: a photo caption, an animation label, an industry
   * card, an exam-prep product. */
  { q: 'do you build chatbots', intent: 'capability', expect: 'AI Chatbots & Voice Assistants' },
  { q: 'do you do voice agents', intent: 'capability', expect: 'AI Chatbots & Voice Assistants' },
  { q: 'can you build a mobile app', intent: 'capability', expect: 'Custom Web & Mobile Apps', reject: /TNPSC/i },
  { q: 'do you build websites', intent: 'capability', expect: 'Custom Web & Mobile Apps' },
  { q: 'do you do crm integration', intent: 'capability', expect: /CRM|Integration/i, reject: /Automotive/i },
  { q: 'can you automate invoices', intent: 'capability', expect: /OCR|Document/i },
  { q: 'do you do ocr', intent: 'capability', expect: /OCR/i },
  { q: 'do you build dashboards', intent: 'capability', expect: /Dashboards|Intelligence/i, reject: /colleague|carousel|3D website/i },
  { q: 'do you do data entry automation', intent: 'capability', reject: /^Chaos|Autopilot/i },
  { q: 'can you handle whatsapp automation', intent: 'capability', expect: /WhatsApp/i },

  /* ── industry lookups ────────────────────────────────────────────
   * "1.08" was the real answer to the real-estate question — the ROI
   * calculator's automation-fit coefficient, read out as prose. */
  { q: 'do you work with hospitals', intent: 'industry-fit', expect: 'Healthcare' },
  { q: 'do you work with schools', intent: 'industry-fit', expect: 'Education' },
  { q: 'do you work with restaurants', intent: 'industry-fit', expect: 'Hospitality' },
  { q: 'do you work with real estate', intent: 'industry-fit', expect: 'Real Estate', reject: /1\.0|1\.1/ },
  { q: 'do you serve manufacturing', intent: 'industry-fit', expect: 'Manufacturing' },
  { q: 'have you worked with a car dealership', intent: 'industry-fit', expect: 'Automotive' },

  /* ── products, by name ───────────────────────────────────────────
   * Aura is asserted on the site's own copy, which describes it reading
   * recordings the handset already made. The CMS description of the same
   * product says "in real time", which is not how it works — see the note
   * in src/lib/chat/cms.js. */
  { q: 'what is aura', intent: 'product', expect: /recordings/i },
  { q: 'is aura real time', intent: 'product', reject: /multi-agent frameworks/i },
  { q: 'what is nusi', intent: 'product', expect: /nutrition/i },
  { q: 'what are analytics agents', intent: 'product', expect: /measurement|analytics/i },

  /* ── pricing ─────────────────────────────────────────────────────── */
  { q: 'How much does it cost?', intent: 'pricing', expect: 'free' },
  { q: 'do you have packages', intent: 'pricing' },
  { q: 'what is your hourly rate', intent: 'pricing' },
  { q: 'how much does aura cost', intent: 'pricing' },
  { q: 'is it expensive', intent: 'pricing' },

  /* ── the authored FAQ ────────────────────────────────────────────
   * Every one of these was an out-of-scope refusal or a wrong retrieval hit
   * before faq.js existed. The facts asserted are the ones with a source. */
  { q: 'what are your working hours', intent: 'faq:hours', expect: 'Monday to Saturday' },
  { q: 'are you open on sunday', intent: 'faq:hours', expect: /Sunday is closed/i },
  { q: 'do you do seo', intent: 'faq:not-offered', expect: /not on our list/i },
  { q: 'do you run google ads', intent: 'faq:not-offered' },
  { q: 'do you do social media marketing', intent: 'faq:not-offered' },
  { q: 'how long does a project take', intent: 'faq:timeline', expect: '+91 97899 61631' },
  { q: 'do you provide support after launch', intent: 'faq:support', expect: '24/7' },
  { q: 'do you offer maintenance', intent: 'faq:support' },
  { q: 'do you sign an nda', intent: 'faq:legal-terms' },
  { q: 'who owns the source code', intent: 'faq:legal-terms' },
  { q: 'what is your refund policy', intent: 'faq:refund-payment' },
  { q: 'do you offer a free trial', intent: 'faq:trial', expect: /no self-serve trial/i },
  { q: 'can I try aura', intent: 'faq:trial' },
  { q: 'are you hiring', intent: 'faq:careers', expect: 'support@sirahdigital.in' },
  { q: 'do you take interns', intent: 'faq:careers' },
  { q: 'is my data safe', intent: 'faq:data-privacy', expect: /never sold/i },
  { q: 'do you use cookies', intent: 'faq:data-privacy' },
  { q: 'do you work with international clients', intent: 'faq:reach', expect: 'Chennai' },
  { q: 'can you work remotely', intent: 'faq:reach' },
  { q: 'how many years of experience do you have', intent: 'faq:experience', expect: '14+' },
  { q: 'how many clients do you have', intent: 'faq:experience', expect: '50+' },
  { q: 'how many employees do you have', intent: 'faq:experience' },
  { q: 'do you speak tamil', intent: 'faq:languages', expect: /Tamil and English/i },
  { q: 'your office timings', intent: 'faq:hours', expect: 'Monday to Saturday' },
  { q: 'why should I choose you', intent: 'faq:why-us', expect: '14+' },
  { q: 'what makes you different', intent: 'faq:why-us' },
  { q: 'do you have any awards', intent: 'faq:awards', expect: /does not list awards/i },

  /* ── problems described rather than services named ───────────────
   * People do not arrive asking for "AI Document Processing & OCR". They
   * arrive saying where the time goes. Each of these was a wrong answer:
   * the persona menu, the staff list, and an off-topic refusal. */
  // Both assert what the answer must *not* be rather than pinning an intent:
  // several handlers answer a problem statement well, and which one wins is a
  // judgement call that may reasonably change. What may not change is
  // answering "I can walk you through any of these" — the bot's own menu — or
  // reciting the staff list because the sentence contained the word "team".
  { q: 'can you help me reduce manual work', intent: 'automation-benefit', reject: /walk you through any of these/i },
  { q: 'my team wastes time on data entry', reject: /Mohamed Riyaz/ },
  { q: 'can you connect my tally to whatsapp', intent: 'capability' },
  { q: 'do you have experience with wordpress', intent: 'capability' },

  /* ── persona ─────────────────────────────────────────────────────── */
  { q: 'hi', intent: 'greeting' },
  { q: 'good morning', intent: 'greeting' },
  { q: 'my name is Riyaz', intent: 'name_capture', expect: 'Riyaz' },
  { q: 'thanks', intent: 'thanks' },
  { q: 'bye', intent: 'bye' },
  { q: 'who are you', intent: 'bot_identity' },
  { q: 'are you a bot', intent: 'bot_identity' },
  { q: 'what can you do', intent: 'capabilities' },
  // Both were refused as off-topic. A bot that answers "help" with "that is
  // outside what I can help with" has lost the visitor in one message.
  { q: 'help', intent: 'capabilities' },
  { q: '?', intent: 'capabilities' },
  { q: 'are you on instagram', intent: 'social_media' },
  { q: 'call me back', intent: 'lead' },

  /* ── typo tolerance ──────────────────────────────────────────────
   * "contct" is the one that matters. When the navbar came off the index the
   * word "contact" left the corpus vocabulary, and the spellchecker started
   * snapping it to "contract" — so "how do I contact you" was answered with
   * the note about NDAs. See INTENT_VOCAB in answer.js. */
  { q: 'wat servcies do u provide', intent: 'services' },
  { q: 'how mch does it cost', intent: 'pricing' },
  { q: 'contct', intent: 'contact', expect: '+91 97899 61631' },
  { q: 'tell me abt aura', intent: 'product' },

  /* ── questions carrying two intents ──────────────────────────────
   * No branching here — first match wins, and these assert which one that is
   * so the precedence cannot drift silently. */
  { q: 'what services do you offer and how much do they cost', intent: 'services' },
  { q: 'i need a chatbot for my clinic, what will it cost', intent: 'pricing' },

  /*
   * Adjacent services the site does not sell. The right answer is a plain
   * "no, here is what we do" from faq:not-offered — not a refusal. That
   * entry's own note puts it better than I can: going silent "costs the
   * visitor's belief in everything else the bot said".
   */
  { q: 'do you do wedding photography', intent: 'faq:not-offered' },
  { q: 'what is the best software for video editing', intent: 'faq:not-offered' },

  /*
   * Out-of-scope asks that must NOT be refused.
   *
   * capability already answers these honestly — "I cannot match that to
   * anything we list, and I would rather say so than guess", then the ten
   * it does. That is the right reply to "can you build me a house": a
   * refusal would tell the visitor nothing, and a yes would be a lie.
   *
   * Pinned as fixtures because the fix for the genuine over-triggers below
   * is to narrow these same intents, and narrowing them too far turns these
   * five into refusals without anyone noticing.
   */
  { q: 'can you build me a house', intent: 'capability' },
  { q: 'do you provide loans for small business', intent: 'capability' },
  { q: 'can you automate my car', intent: 'capability' },
  { q: 'do you provide accounting and tax filing', intent: 'capability' },
  { q: 'can you help me write a resume', intent: 'faq:careers' },

  /*
   * The reported bug, pinned.
   *
   * "how to call sirah digital" returned Aura Transcriber, an AI call
   * recording product: contact matched "call you" and "call us" but not the
   * company by name, so the question fell through to retrieval and the word
   * "call" scored against the product.
   *
   * Worth remembering that no retriever could have answered it — the number
   * is read from COMPANY.phone inside the handler and was never indexed.
   * Only the intent can reach it.
   */
  { q: 'how to call sirah digital', intent: 'contact', reject: /Aura/ },
  { q: 'how do i call you', intent: 'contact' },
  { q: 'i want to call sirah', intent: 'contact' },

  /*
   * Tamil.
   *
   * Every answer these reach was already written — 113 lines of authored
   * Tamil across answer.js, faq.js and persona.js — and none of it was
   * reachable, because all 44 routing patterns were ASCII and the tokenizer
   * deleted Tamil before retrieval ever saw it.
   *
   * These assert the trigger. The reply language is asserted by the harness
   * itself: `ask()` runs replyLanguage(q) exactly as /api/chat does, so a
   * Tamil question that came back in English would show up as a missing
   * `expect` here rather than passing quietly.
   */
  { q: 'எப்படி தொடர்பு கொள்வது', intent: 'contact', expect: '97899' },
  { q: 'உங்கள் தொலைபேசி எண் என்ன', intent: 'contact' },
  { q: 'எந்த சேவைகளை வழங்குகிறீர்கள்', intent: 'services' },
  { q: 'உங்கள் தயாரிப்புகள் என்ன', intent: 'products' },
  { q: 'எந்த துறைகளில் வேலை செய்கிறீர்கள்', intent: 'industries' },
  { q: 'நேரம் பதிவு செய்ய வேண்டும்', intent: 'booking' },
  { q: 'உங்கள் விலை என்ன', intent: 'pricing' },
  { q: 'எவ்வளவு செலவாகும்', intent: 'pricing' },
  { q: 'உங்கள் குழுவில் யார் இருக்கிறார்கள்', intent: 'team' },
  { q: 'எப்படி வேலை செய்கிறீர்கள்', intent: 'process' },
  { q: 'எந்த தொழில்நுட்பம் பயன்படுத்துகிறீர்கள்', intent: 'tech-stack' },
  { q: 'உங்கள் வாடிக்கையாளர்கள் யார்', intent: 'clients' },

  /*
   * Tamil persona and FAQ.
   *
   * The first two are regression pins, not new coverage: வணக்கம் and நன்றி
   * were already in persona.js and had never once matched. They sat inside
   * \b(…)\b groups, and \b is defined on [A-Za-z0-9_] — there is no word
   * boundary after a Tamil letter, so the alternative could not fire. Any
   * Tamil added inside a \b group is dead on arrival; it has to be a
   * top-level branch.
   */
  { q: 'வணக்கம்', intent: 'greeting' },
  { q: 'நன்றி', intent: 'thanks' },
  { q: 'நீங்கள் யார்', intent: 'bot_identity' },
  { q: 'என்ன செய்ய முடியும்', intent: 'capabilities' },
  { q: 'எப்படி இருக்கிறீர்கள்', intent: 'casual' },
  { q: 'உங்கள் வேலை நேரம் என்ன', intent: 'faq:hours' },
  { q: 'எவ்வளவு நாட்கள் ஆகும்', intent: 'faq:timeline' },
  { q: 'தமிழில் பேச முடியுமா', intent: 'faq:languages' },
  { q: 'இலவச டெமோ இருக்கிறதா', intent: 'faq:trial' },
  { q: 'ஏன் உங்களை தேர்வு செய்ய வேண்டும்', intent: 'faq:why-us' },
  { q: 'என் தரவு பாதுகாப்பாக இருக்குமா', intent: 'faq:data-privacy' },
  { q: 'வேலை வாய்ப்பு இருக்கிறதா', intent: 'faq:careers' },

  /*
   * The last five intents, and the two collisions they exposed.
   *
   * industry-fit keys on the interrogative -ஆ. Without it
   * "எப்படி வேலை செய்கிறீர்கள்" — how do you work — was claimed by
   * industry-fit instead of process, because Tamil marks a yes/no question
   * with a particle on the verb rather than with word order.
   *
   * automation-benefit versus persona's capabilities: "தானியக்கம் எப்படி
   * உதவும்" is a question about automation, "நீங்கள் எப்படி உதவ முடியும்"
   * is a question about the bot. Both were the second, until capabilities was
   * anchored to the second person.
   */
  { q: 'நீங்கள் சாட்பாட் உருவாக்க முடியுமா', intent: 'capability' },
  { q: 'உங்கள் நிறுவனம் பற்றி சொல்லுங்கள்', intent: 'about' },
  { q: 'மருத்துவமனைகளுடன் வேலை செய்கிறீர்களா', intent: 'industry-fit' },
  { q: 'எப்படி வேலை செய்கிறீர்கள்', intent: 'process' },
  { q: 'தானியக்கம் எப்படி உதவும்', intent: 'automation-benefit' },
  { q: 'நீங்கள் எப்படி உதவ முடியும்', intent: 'capabilities' },
  { q: 'Aura பற்றி சொல்லுங்கள்', intent: 'product' },

  /*
   * Tamil reaching English content, and the chips staying in Tamil.
   *
   * The corpus is English and stays English — a service added in the CMS this
   * morning has no Tamil anywhere. These pass through the cross-lingual
   * concept layer instead: the query expands to English variants and matches
   * the document the visitor was asking about. No translation, no staleness.
   *
   * The last four are the quick-reply chips. They carried an English `send`
   * because nothing could route the Tamil, so tapping one flipped the
   * conversation back to English on the visitor's first tap.
   */
  // Claimed by services before it reaches retrieval, because the Tamil for
  // 'what do you do' is in that intent. Listing the ten is a fair answer to
  // 'what do you do for hospitals'; pinned as-is so a future widening of
  // industry-fit shows up here as a deliberate change rather than a surprise.
  { q: 'மருத்துவமனைகளுக்கு என்ன செய்கிறீர்கள்', intent: 'services' },
  { q: 'பள்ளிகளுக்கான தீர்வு', expect: /Education|education/ },
  { q: 'கிடங்கு மேலாண்மை', expect: /Logistics|logistics/ },
  { q: 'இலவச ஆலோசனை பதிவு', intent: 'booking' },
  { q: 'என்ன சேவைகள் வழங்குகிறீர்கள்?', intent: 'services' },
  { q: 'எந்த துறைகளில் பணியாற்றுகிறீர்கள்?', intent: 'industries' },
  { q: 'தானியக்கம் எப்படி உதவும்?', intent: 'automation-benefit' },
];

/**
 * Questions that must be turned away.
 *
 * Retrieval always returns its best match, so the only thing between an
 * off-topic question and a confident wrong answer is the relevance gate. A
 * gate with no test is a gate that quietly opens.
 *
 * They also stop the thresholds being tuned by feel: loosening the gate to
 * rescue one stubborn real question lights these up immediately.
 */
const REFUSE_FIXTURES = [
  'can I drink hot water during winter season?',
  'Do you sell pet insurance?',
  'what is the capital of France?',
  'how do I cook plain rice?',
  'who won the cricket world cup?',
  'what is the weather tomorrow?',
  'can you write me a poem about the sea?',
  'what is the price of gold today?',
  'how do I fix my car engine?',
  'tell me a joke about elephants',

  /*
   * Near misses — off-topic questions built out of the site's own vocabulary.
   *
   * The ten above share almost no words with the corpus, so they are refused
   * by term coverage alone and would stay refused under almost any gate. They
   * cannot tell you a threshold is too loose. These can: every one contains a
   * word the index is full of — automate, business, price, contact, build,
   * offer, services, software, data, team — while asking for something the
   * site does not do.
   *
   * A gate is a boundary between two populations. Ten far-away negatives only
   * locate one of them. Do not move a threshold against a set that lacks
   * these.
   */
  'do you sell laptops',
  'what is the price of bitcoin today',
  'how do I contact my bank',
  'do you offer visa services',
  'what time does the post office open',
  'who is the CEO of Google',
  'do you sell mobile data plans',
  'can you repair my laptop screen',
  'can your team paint my office',
  'how much does a flight to Delhi cost',
  'what are the office timings of the passport seva kendra',
  'do you sell health insurance for my team',
  'can you teach me python programming',
];

/* ------------------------------------------------------------------ */
/* Running                                                             */
/* ------------------------------------------------------------------ */

const matches = (pattern, text) =>
  pattern instanceof RegExp ? pattern.test(text) : String(text).includes(pattern);

/** Everything a fixture is allowed to assert against, as one string. */
function haystack(reply) {
  return [
    reply.text,
    reply.extra,
    reply.lead?.title,
    ...(reply.bullets || []).flatMap((b) => [b.title, b.detail]),
    ...(reply.links || []).map((l) => l.label),
    reply.contact && [reply.contact.phone, reply.contact.email, reply.contact.address].join(' '),
  ]
    .filter(Boolean)
    .join(' · ');
}

function check(fixture, reply) {
  const problems = [];
  const text = haystack(reply);

  if (fixture.intent && reply.intent !== fixture.intent) {
    problems.push(`intent was "${reply.intent || 'retrieval'}", wanted "${fixture.intent}"`);
  }
  if (fixture.expect && !matches(fixture.expect, text)) {
    problems.push(`missing ${fixture.expect}`);
  }
  if (fixture.reject && matches(fixture.reject, text)) {
    problems.push(`contains ${fixture.reject}, which it must not`);
  }
  if (fixture.link && !(reply.links || []).some((l) => l.href === fixture.link)) {
    problems.push(`no link to ${fixture.link}`);
  }
  return problems;
}

function render(reply) {
  const flag = { high: 'OK  ', low: 'WEAK', none: 'MISS' }[reply.confidence] || '?   ';
  const lines = [`  [${flag}] ${reply.intent ? `intent:${reply.intent}` : 'retrieval'}`];
  if (reply.text) lines.push(`  ${reply.text.replace(/\n+/g, ' ').slice(0, 180)}`);
  if (reply.lead) lines.push(`  → ${reply.lead.title} (${reply.lead.kind}) ${reply.lead.href}`);
  for (const b of (reply.bullets || []).slice(0, 4)) {
    lines.push(`    • ${b.title}${b.detail ? ` — ${b.detail.slice(0, 80)}` : ''}`);
  }
  if (reply.extra) lines.push(`  ${reply.extra.slice(0, 160)}`);
  if (reply.contact) lines.push(`  ${reply.contact.email} · ${reply.contact.phone}`);
  if (reply.links?.length) lines.push(`  [ ${reply.links.map((l) => l.href).join('  ')} ]`);
  return lines.join('\n');
}

const chat = await buildChat();
const { replyLanguage } = chat.lang;

/*
 * Ask the way the route asks.
 *
 * /api/chat calls replyLanguage(question) before answerQuestion and passes the
 * result in; the check used to call answerQuestion bare, so lang defaulted to
 * 'en' and every reply came back English no matter what was asked. A Tamil
 * fixture would have proved the trigger fired and nothing about the answer —
 * which is the half that visitors read.
 */
const ask = (q, ctx = {}) => answerQuestion(q, { lang: replyLanguage(q), ...ctx });
const { answerQuestion } = chat;
const { KNOWLEDGE_STATS } = chat.knowledge;

console.log('═══ INDEX ═══');
console.log(`entries : ${KNOWLEDGE_STATS.entries}`);
console.log(`sources : ${KNOWLEDGE_STATS.sources.join(', ')}`);
console.log(`kinds   : ${KNOWLEDGE_STATS.kinds.join(', ')}`);

const argv = process.argv.slice(2);

/*
 * --scores — the calibration table.
 *
 * answer.js:86-88 says of the gates: "These are empirical… Move a number, run
 * the check." The check could not show you a number. It reported pass or fail
 * against a threshold without ever printing what the threshold was compared
 * to, so a change that moved every score halfway to a cliff looked identical
 * to one that moved nothing.
 *
 * This prints the raw retrieval score and coverage behind every fixture,
 * whether or not an intent claimed it. Diff it across a change:
 *
 *     node scripts/chat-check.mjs --scores > /tmp/before.txt
 *     …edit…
 *     node scripts/chat-check.mjs --scores | diff /tmp/before.txt -
 *
 * For a change that must not touch English — the Unicode tokenizer — an empty
 * diff is the whole proof.
 */
if (argv.includes('--scores')) {
  const { search } = chat.search;
  const K = chat.knowledge.KNOWLEDGE;
  const rows = [
    ...ANSWER_FIXTURES.map((f) => [f.q, f.intent || '']),
    ...REFUSE_FIXTURES.map((q) => [q, 'REFUSE']),
  ];
  console.log("\n═══ SCORES ═══");
  for (const [q, want] of rows) {
    const reply = ask(q);
    const top = search(q, K, { limit: 1 })[0];
    const score = top ? top.score.toFixed(3) : '—';
    const cov = top ? top.coverage.toFixed(2) : '—';
    console.log(
      [String(score).padStart(7), String(cov).padStart(5), (reply.intent || 'retrieval').padEnd(22), want.padEnd(22), q].join('  '),
    );
  }
  await chat.cleanup();
  process.exit(0);
}

const custom = argv;

if (custom.length) {
  console.log('\n═══ ANSWERS ═══');
  for (const q of custom) {
    console.log(`\nQ: ${q}`);
    console.log(render(ask(q)));
  }
  await chat.cleanup();
  process.exit(0);
}

console.log('\n═══ ANSWERS ═══');
const failures = [];

for (const fixture of ANSWER_FIXTURES) {
  const reply = ask(fixture.q);
  const problems = reply.intent === 'out-of-scope' ? ['refused a question it must answer'] : check(fixture, reply);

  if (problems.length) {
    failures.push({ q: fixture.q, problems });
    console.log(`\n[FAIL] Q: ${fixture.q}`);
    for (const problem of problems) console.log(`       ${problem}`);
    console.log(render(reply));
  } else {
    console.log(`[PASS] ${fixture.q}  →  ${reply.intent}`);
  }
}

console.log('\n═══ REFUSALS ═══');
for (const q of REFUSE_FIXTURES) {
  const reply = ask(q);
  const refused = reply.intent === 'out-of-scope';
  if (refused) {
    console.log(`[PASS] ${q}`);
  } else {
    failures.push({ q, problems: [`answered as "${reply.intent || 'retrieval'}" instead of refusing`] });
    console.log(`\n[FAIL] Q: ${q}`);
    console.log(render(reply));
  }
}

const total = ANSWER_FIXTURES.length + REFUSE_FIXTURES.length;
console.log(
  `\n═══ ${total - failures.length}/${total} as expected ` +
    `(${ANSWER_FIXTURES.length} must answer, ${REFUSE_FIXTURES.length} must refuse) ═══`,
);

if (failures.length) {
  console.log('\nFailed:');
  for (const f of failures) console.log(`  ${f.q} — ${f.problems.join('; ')}`);
}

await chat.cleanup();
if (failures.length > 0) process.exitCode = 1;
