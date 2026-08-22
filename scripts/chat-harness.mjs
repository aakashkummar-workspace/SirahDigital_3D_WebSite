/**
 * Loads src/lib/chat into plain Node, so the bot can be questioned without a
 * browser.
 *
 * src/lib/chat is written for the Next bundle: ESM `.js` inside a CommonJS
 * package, the `@/` alias, and a `require.context` glob that only webpack
 * implements. Node runs none of that. So this copies the real source into a
 * temp directory with three mechanical rewrites — extension, alias, and the
 * glob swapped for generated static imports — and imports *that*. The logic
 * under test is the shipped logic; only the module plumbing differs.
 *
 * Extracted from chat-check.mjs when a second caller appeared. Both the
 * fixture run and any one-off question go through here, which is what stops
 * the two drifting into testing different builds of the same bot.
 *
 *     import { buildChat } from './chat-harness.mjs';
 *     const { answerQuestion, KNOWLEDGE, cleanup } = await buildChat();
 */

import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const CHAT_DIR = path.join(ROOT, 'src', 'lib', 'chat');

/**
 * Sibling modules of lib/chat, listed rather than globbed.
 *
 * A new file in lib/chat that nobody adds here fails loudly on the first
 * import rather than being silently left out of the check — which is the
 * failure mode that matters, because a module the harness cannot see is a
 * module whose answers are never tested.
 */
const CHAT_MODULES = ['search', 'faq', 'persona', 'lang', 'answer'];

export async function buildChat({ tmpDir = '.chat-check' } = {}) {
  const TMP = path.join(ROOT, tmpDir);
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
  if (patched === knowledge) {
    throw new Error('could not patch loadDataModules — did it get renamed?');
  }
  await writeFile(
    path.join(TMP, 'knowledge.mjs'),
    `import { MODULES } from './dataModules.mjs';\n${patched}`,
  );

  // 4. The rest of lib/chat, with their specifiers rewritten.
  const rewrite = (source) =>
    source
      .replace(/from '@\/data\/([A-Za-z0-9_-]+)'/g, "from './data/$1.mjs'")
      .replace(/from '\.\/([a-zA-Z0-9_-]+)'/g, "from './$1.mjs'");

  for (const name of CHAT_MODULES) {
    await writeFile(
      path.join(TMP, `${name}.mjs`),
      rewrite(await readFile(path.join(CHAT_DIR, `${name}.js`), 'utf8')),
    );
  }

  const knowledgeModule = await import(pathToFileURL(path.join(TMP, 'knowledge.mjs')).href);
  const answerModule = await import(pathToFileURL(path.join(TMP, 'answer.mjs')).href);
  /*
   * search and lang are exposed as whole modules, not spread, because the
   * check needs what answerQuestion throws away: the raw BM25 score and
   * coverage behind a reply, and the language the question was read as.
   * A finished reply cannot tell you why a gate opened.
   */
  const searchModule = await import(pathToFileURL(path.join(TMP, 'search.mjs')).href);
  const langModule = await import(pathToFileURL(path.join(TMP, 'lang.mjs')).href);

  return {
    ...knowledgeModule,
    ...answerModule,
    knowledge: knowledgeModule,
    answer: answerModule,
    search: searchModule,
    lang: langModule,
    cleanup: () => rm(TMP, { recursive: true, force: true }),
  };
}
