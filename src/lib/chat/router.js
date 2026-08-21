import Anthropic from '@anthropic-ai/sdk';

/*
 * Understanding the question, as opposed to matching its words.
 *
 * ── why this exists ──────────────────────────────────────────────────────
 * answer.js routes by regex: eighteen content intents, each with a `test`.
 * A question that matches none of them falls through to retrieval, which
 * scores on words. That is how "how to call sirah digital" — a request for a
 * phone number — came back with Aura Transcriber, an AI call-recording
 * product. The word "call" matched. Nothing understood the question.
 *
 * The fixture suite passed 113/113 while that was happening, because the
 * fixtures are the phrasings the regexes were written for. A closed loop
 * cannot find the phrasings nobody thought of, and visitors only ever type
 * those.
 *
 * ── what this does, and what it deliberately does not ────────────────────
 * It routes, and nothing else. Claude picks which of the existing intents the
 * question belongs to; the intent's own handler then writes the answer, with
 * the same copy and the same links it always used. No answer text is
 * generated here. That keeps every reply reviewed and on-brand, and means a
 * bad routing decision is a wrong-but-real answer rather than an invented one.
 *
 * ── failure is not an error ──────────────────────────────────────────────
 * No API key, a timeout, a refusal, a malformed reply, an intent that does not
 * exist: every one returns null, and answer.js runs its regexes exactly as
 * before. The bot is never worse than it was, which is what makes this safe to
 * deploy before the key is set.
 */

const MODEL = 'claude-opus-5';

// Short enough that the whole catalogue is cheap to send, specific enough that
// the boundaries between neighbours are decidable. Ids must match answer.js.
const INTENT_CATALOGUE = [
  ['contact', 'Wants to reach a human: phone number, email, address, "how do I call/contact you", directions to the office.'],
  ['booking', 'Wants to schedule a consultation, call, meeting or demo at a particular time.'],
  ['pricing', 'Asks what something costs, budget, rates, quotes, "is it expensive".'],
  ['services', 'Asks what services are offered, in general.'],
  ['products', 'Asks about the product range in general.'],
  ['product', 'Asks about one named product (e.g. Aura, NUSI, Analytics Agents).'],
  ['industries', 'Asks which industries or sectors are served, in general.'],
  ['industry-fit', 'Asks whether a specific named industry or business type is served.'],
  ['capability', 'Asks whether a specific capability can be built (chatbot, OCR, dashboard, integration).'],
  ['automation-benefit', 'Asks why automation is worth it, what problems it solves, ROI, time saved.'],
  ['scale', 'Asks about growing or scaling the business.'],
  ['process', 'Asks how the work is run: methodology, stages, what happens after signing.'],
  ['tech-stack', 'Asks which technologies, tools, frameworks or platforms are used.'],
  ['team', 'Asks about the people, founders, staff or size of the company.'],
  ['clients', 'Asks who the clients are, or for references.'],
  ['work', 'Asks to see past work, projects or examples.'],
  ['achievements', 'Asks about results, awards, numbers or track record.'],
  ['about', 'Asks what the company is, its story, mission or location.'],
];

const SYSTEM = `You route visitor questions on the website of Sirah Digital, an AI automation company in Chennai, India.

Pick the single intent that best matches what the visitor is trying to find out. Reply with that intent's id.

Intents:
${INTENT_CATALOGUE.map(([id, desc]) => `- ${id}: ${desc}`).join('\n')}
- none: the question does not fit any intent above, or is not about this company at all.

Rules:
- Route on what the visitor WANTS, not on words they happen to share with a product name. "How do I call you" is contact, not a call-recording product.
- Questions may arrive in English or Tamil. Route both the same way.
- A vague or conversational message that is not a question about the company is none.
- Prefer none over a poor fit. A wrong intent gives the visitor a confidently irrelevant answer.`;

const SCHEMA = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      enum: [...INTENT_CATALOGUE.map(([id]) => id), 'none'],
    },
  },
  required: ['intent'],
  additionalProperties: false,
};

/*
 * A slow router is worse than no router: the visitor is watching a spinner,
 * and the regexes below would have answered instantly. Give up early and let
 * them.
 */
const TIMEOUT_MS = 4000;

let client = null;
const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 1 });
  return client;
};

/**
 * The intent id this question belongs to, or null to fall back to the regexes.
 *
 * `known` is the list of intent ids answer.js will actually dispatch, passed in
 * rather than imported so the catalogue above cannot quietly drift away from
 * the handlers. An id Claude returns that is not in that list is discarded.
 */
export async function routeIntent(question, known = []) {
  const anthropic = getClient();
  if (!anthropic) return null;

  const text = String(question || '').trim();
  if (!text) return null;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 256,
      system: SYSTEM,
      messages: [{ role: 'user', content: text }],
      output_config: {
        format: { type: 'json_schema', schema: SCHEMA },
        // Routing is a one-step decision against a fixed list. Low effort is
        // the whole point — this call sits in front of every question and its
        // latency is the visitor's latency.
        effort: 'low',
      },
    });

    // Fable/Opus safety classifiers can decline; there is no content to read.
    if (response.stop_reason === 'refusal') return null;

    const block = response.content.find((b) => b.type === 'text');
    if (!block) return null;

    const { intent } = JSON.parse(block.text);
    if (!intent || intent === 'none') return null;
    return known.includes(intent) ? intent : null;
  } catch {
    // Timeout, network, rate limit, bad JSON — all the same answer.
    return null;
  }
}
