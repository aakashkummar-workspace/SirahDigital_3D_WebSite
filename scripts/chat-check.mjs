/**
 * Smoke test for the chatbot's knowledge index and answers.
 *
 *   node scripts/chat-check.mjs            # summary + fixture questions
 *   node scripts/chat-check.mjs "your question here"
 *
 * Why a harness rather than a plain import: src/lib/chat is written for the
 * Next bundle — ESM `.js` in a CommonJS package, the `@/` alias, and a
 * `require.context` glob that only webpack implements. Node can run none of
 * that directly. So this copies the real source into a temp directory with
 * three mechanical rewrites (extension, alias, and the glob swapped for
 * generated static imports) and runs *that*. The logic under test is the
 * shipped logic — only the module plumbing differs.
 *
 * The point is to check answers without a browser: retrieval quality is the
 * part most likely to be quietly wrong, and clicking through a chat panel is a
 * slow way to find out.
 */

import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const CHAT_DIR = path.join(ROOT, 'src', 'lib', 'chat');
const TMP = path.join(ROOT, '.chat-check');

async function build() {
  await rm(TMP, { recursive: true, force: true });
  await mkdir(path.join(TMP, 'data'), { recursive: true });

  // 1. Data modules — rewrite sibling specifiers to carry the .mjs extension.
  const dataFiles = (await readdir(DATA_DIR)).filter((f) => f.endsWith('.js'));
  for (const file of dataFiles) {
    const source = await readFile(path.join(DATA_DIR, file), 'utf8');
    const rewritten = source.replace(/from '\.\/([A-Za-z0-9_-]+)'/g, "from './$1.mjs'");
    await writeFile(path.join(TMP, 'data', file.replace(/\.js$/, '.mjs')), rewritten);
  }

  // 2. Stand in for require.context with generated static imports.
  const imports = dataFiles
    .map((file, i) => `import * as m${i} from './data/${file.replace(/\.js$/, '.mjs')}';`)
    .join('\n');
  const list = dataFiles.map((file, i) => `{ file: '${file}', module: m${i} }`).join(',\n  ');
  await writeFile(
    path.join(TMP, 'dataModules.mjs'),
    `${imports}\nexport const MODULES = [\n  ${list},\n];\n`,
  );

  // 3. knowledge.js — swap the glob loader for the generated list.
  const knowledge = await readFile(path.join(CHAT_DIR, 'knowledge.js'), 'utf8');
  const patched = knowledge.replace(
    /function loadDataModules\(\)[\s\S]*?\n}/,
    'function loadDataModules() {\n  return MODULES;\n}',
  );
  if (patched === knowledge) throw new Error('could not patch loadDataModules — did it get renamed?');
  await writeFile(
    path.join(TMP, 'knowledge.mjs'),
    `import { MODULES } from './dataModules.mjs';\n${patched}`,
  );

  // 4. search.js imports nothing; persona.js and answer.js need their
  //    specifiers rewritten. Sibling modules are listed rather than globbed so
  //    a new file in lib/chat fails loudly here instead of being silently
  //    left out of the check.
  await writeFile(path.join(TMP, 'search.mjs'), await readFile(path.join(CHAT_DIR, 'search.js'), 'utf8'));

  const rewrite = (source) =>
    source
      .replace(/from '@\/data\/([A-Za-z0-9_-]+)'/g, "from './data/$1.mjs'")
      .replace(/from '\.\/knowledge'/g, "from './knowledge.mjs'")
      .replace(/from '\.\/search'/g, "from './search.mjs'")
      .replace(/from '\.\/persona'/g, "from './persona.mjs'");

  for (const name of ['persona', 'answer']) {
    await writeFile(
      path.join(TMP, `${name}.mjs`),
      rewrite(await readFile(path.join(CHAT_DIR, `${name}.js`), 'utf8')),
    );
  }

  return {
    knowledge: await import(pathToFileURL(path.join(TMP, 'knowledge.mjs')).href),
    answer: await import(pathToFileURL(path.join(TMP, 'answer.mjs')).href),
  };
}

/* ------------------------------------------------------------------ */

const FIXTURES = [
  'What are Sirah’s products?',
  'How is automation useful for my business?',
  'How can I scale my business?',
  'What services do you provide?',
  'Book a free call',
  'Do you work with hospitals?',
  'Can you do OCR on invoices?',
  'Do you build WhatsApp bots?',
  'Who is the founder?',
  'How much does it cost?',
  'Where are you located?',
  'What is your process?',
  'Do you have client testimonials?',
  'What technology do you use?',
  'hi',
  'my name is Riyaz',
  'thanks',
  'who are you',
].map((q) => ({ q, expect: 'answer' }));

/**
 * The other half of the test, and the half that was missing.
 *
 * Retrieval always returns its best match, so the only thing standing between
 * an off-topic question and a confident wrong answer is the relevance gate in
 * answer.js. A gate with no test is a gate that quietly opens: these are the
 * questions that must be refused, and they fail the run if they get answered.
 *
 * They are also what stops the thresholds being tuned by feel. Loosening the
 * gate to rescue one stubborn real question will light these up immediately.
 */
const MUST_REFUSE = [
  'can I drink hot water during winter season?',
  'Do you sell pet insurance?',
  'what is the capital of France?',
  'how do I cook plain rice?',
  'who won the cricket world cup?',
  'what is the weather tomorrow?',
  'can you write me a poem about the sea?',
].map((q) => ({ q, expect: 'refuse' }));

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
  return lines.join('\n');
}

const { knowledge, answer } = await build();

console.log('═══ INDEX ═══');
console.log(`entries : ${knowledge.KNOWLEDGE_STATS.entries}`);
console.log(`sources : ${knowledge.KNOWLEDGE_STATS.sources.join(', ')}`);
console.log(`kinds   : ${knowledge.KNOWLEDGE_STATS.kinds.join(', ')}`);

const custom = process.argv.slice(2);
const cases = custom.length
  ? custom.map((q) => ({ q, expect: null }))
  : [...FIXTURES, ...MUST_REFUSE];

console.log('\n═══ ANSWERS ═══');
let failures = 0;

for (const { q, expect } of cases) {
  const reply = answer.answerQuestion(q);
  const refused = reply.intent === 'out-of-scope';

  // A refusal is a pass or a failure depending entirely on what was asked, so
  // the verdict compares against the fixture's own expectation rather than
  // treating "high confidence" as universally good. Answering the hot-water
  // question confidently is the bug, not the goal.
  let verdict = '    ';
  if (expect === 'answer') {
    const ok = !refused && reply.confidence === 'high';
    if (!ok) failures += 1;
    verdict = ok ? 'PASS' : 'FAIL';
  } else if (expect === 'refuse') {
    if (!refused) failures += 1;
    verdict = refused ? 'PASS' : 'FAIL';
  }

  console.log(`\n[${verdict}] Q: ${q}`);
  console.log(render(reply));
}

if (!custom.length) {
  const total = cases.length;
  console.log(
    `\n═══ ${total - failures}/${total} as expected ` +
      `(${FIXTURES.length} must answer, ${MUST_REFUSE.length} must refuse) ═══`,
  );
}

await rm(TMP, { recursive: true, force: true });
if (failures > 0) process.exitCode = 1;
