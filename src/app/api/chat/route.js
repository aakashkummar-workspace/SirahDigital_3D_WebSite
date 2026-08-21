import { NextResponse } from 'next/server';
import { answerQuestion, INTENT_IDS } from '@/lib/chat/answer';
import { routeIntent } from '@/lib/chat/router';
import { replyLanguage } from '@/lib/chat/lang';
import { KNOWLEDGE } from '@/lib/chat/knowledge';
import { fetchCmsKnowledge, mergeKnowledge } from '@/lib/chat/cms';

/*
 * Answers a chat question from the CMS.
 *
 * ── why this route exists ────────────────────────────────────────────────
 * The bot's index used to be built by `require.context` over src/data — a
 * webpack build-time glob, frozen into the JS bundle. Content added in the CMS
 * could never be answered, because there was nothing at runtime to read it,
 * and revalidateTag cannot invalidate a module constant.
 *
 * Here the index is assembled per request from Payload's REST API, cached by
 * Next under the same per-collection tags the CMS already broadcasts on save.
 * So the sequence is: an editor saves a service → the CMS signs and POSTs
 * /api/revalidate with tag `services` → that tag's fetch below is invalidated
 * → the next question is answered from the new copy. Typically seconds, and
 * nothing in the CMS had to change for it to work.
 *
 * ── the fetch is cached, the answer is not ───────────────────────────────
 * `dynamic = 'force-dynamic'` applies to this route's own response: every
 * question must actually run through answerQuestion. The expensive part — the
 * CMS round trip — is cached by tag inside fetchCmsKnowledge, so a hot index
 * costs nothing and the route stays a pure function of (question, index).
 *
 * ── degradation ──────────────────────────────────────────────────────────
 * If the CMS is unset, asleep or broken, fetchCmsKnowledge returns nothing and
 * mergeKnowledge falls back to the bundled index per source. The visitor gets
 * the same answers the bot gave before any of this existed; `source` in the
 * response says which index actually answered, so a stale bot is diagnosable
 * rather than mysterious.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_QUESTION = 500;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request.' }, { status: 400 });
  }

  const question = String(body?.question || '').slice(0, MAX_QUESTION);
  if (!question.trim()) {
    return NextResponse.json({ ok: false, error: 'Ask a question.' }, { status: 422 });
  }

  /*
   * Answer in the language the question was asked in, not the language the
   * interface happens to be set to. The panel's EN/த toggle drives the
   * placeholder, the chips and the lead form; it used to drive this too, which
   * is how an English question came back in Tamil.
   */
  const lang = replyLanguage(question, body?.lang);

  /*
   * Routing and the CMS read are independent, so they run together — the
   * router's latency is hidden behind a fetch that was happening anyway.
   * routeIntent resolves to null whenever it cannot help (no API key, a
   * timeout, an unknown id), and answerQuestion then falls back to its
   * regexes exactly as before.
   */
  const [cms, routedIntent] = await Promise.all([
    fetchCmsKnowledge(),
    routeIntent(question, INTENT_IDS),
  ]);
  const knowledge = mergeKnowledge(KNOWLEDGE, cms);

  const reply = answerQuestion(question, {
    knowledge,
    lang,
    routedIntent,
    // Conversation state is the panel's, and it is echoed back on every
    // request rather than held here. This route is stateless by construction:
    // there is no session to leak between visitors.
    name: typeof body?.name === 'string' ? body.name.slice(0, 40) : null,
    turn: Number.isFinite(body?.turn) ? body.turn : 0,
    // What the last answer was about, so "how much for that?" resolves.
    lastIntent: typeof body?.lastIntent === 'string' ? body.lastIntent.slice(0, 40) : null,
  });

  return NextResponse.json({
    ok: true,
    reply,
    // Which index answered, and how big it was. The panel ignores this; it is
    // for anyone wondering why the bot has not noticed a CMS edit.
    source: cms.ok ? 'cms+static' : 'static',
    entries: knowledge.length,
  });
}
