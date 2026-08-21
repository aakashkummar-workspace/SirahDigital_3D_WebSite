/*
 * Which language to answer in.
 *
 * The panel has an EN/த toggle, and until now that toggle was the only input:
 * whatever it said, the bot answered in. So a visitor with the toggle on Tamil
 * who typed "What services do you provide?" got a Tamil reply. The toggle
 * describes the interface, not the question.
 *
 * Answer in the language the question was asked in. That is what a person
 * does, and it needs no toggle at all — the toggle stays for the placeholder,
 * the chips and the lead form, and becomes the tiebreaker for input that
 * carries no signal of its own.
 */

// Tamil occupies one contiguous Unicode block. Any character inside it is
// unambiguous — no other script shares the range — so one test is enough and
// there is nothing to train or configure.
const TAMIL = /[\u0B80-\u0BFF]/;

export const DEFAULT_LANG = 'en';
export const LANGS = ['en', 'ta'];

/**
 * The language a reply should be written in.
 *
 * `uiLang` is the toggle, used only when the question itself says nothing —
 * an empty box, or "ok", or a bare "?".
 *
 * Deliberately not a ratio: a single Tamil word in an otherwise English
 * sentence still means the visitor reads Tamil, and answering in Tamil is the
 * safer error. The reverse is not true — Latin script appears inside Tamil
 * sentences constantly (product names, "AI", "OCR"), so presence of Latin
 * proves nothing and is not tested for.
 */
export function replyLanguage(question, uiLang) {
  const text = String(question || '');
  if (TAMIL.test(text)) return 'ta';

  // No Tamil, but real words: the question is in English.
  if (/[A-Za-z]{2}/.test(text)) return 'en';

  // Digits, punctuation or nothing — fall back to what the interface is set to.
  return LANGS.includes(uiLang) ? uiLang : DEFAULT_LANG;
}
