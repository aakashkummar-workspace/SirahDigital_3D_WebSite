/**
 * The clients shown in the Trusted Across Industries row.
 *
 *   name   the client, and — until artwork exists — the wordmark that is drawn
 *   voice  how that wordmark is set. See below.
 *   logo   path to a mark under /public/clients, or null
 *   url    the client's own site, or null for no link
 *
 * ── voice ────────────────────────────────────────────────────────────────
 * The row is modelled on a press strip — the "as seen in" band of publication
 * mastheads, where Forbes, VOGUE and the Guardian each appear in their own
 * typeface and the variety is the whole effect. We do not have client logos,
 * so the variety is made typographically instead: every name is set in one of
 * six treatments, and they sit on a shared baseline.
 *
 * The six are defined as .cmark--<voice> in globals.css and draw on three
 * faces the site already loads — no extra download for any of them:
 *
 *   didone   Cormorant, uppercase, widely tracked        — the VOGUE register
 *   serif    Cormorant, semibold, sentence case          — the Forbes register
 *   grotesk  Satoshi, extrabold, tight                   — a modern tech mark
 *   caps     Satoshi, small uppercase, very wide tracking — a quiet legal mark
 *   book     Zodiak, bold, sentence case                 — a third serif voice
 *   mono     the system monospace, uppercase             — a technical mark
 *
 * Assigned per client rather than cycled by index, so the row is stable: with
 * a cycle, adding one client re-styles every client after it. The only rule
 * when adding or reordering is that neighbours should not share a voice —
 * including the wrap from the last entry back to the first, since the row
 * loops.
 *
 * Length is the other consideration. `caps` and `mono` are the widest per
 * character, so a long name in either runs to a banner; the longest entry
 * here is deliberately in `serif`, which is the most compact of the six.
 *
 * ── logo ─────────────────────────────────────────────────────────────────
 * null everywhere for now, so every entry draws the client's name as a
 * wordmark instead. That is not a placeholder to be embarrassed about: the
 * row is monochrome by design, and a name set in the one permitted colour is
 * exactly as on-brief as a flattened logo would be — and the six voices are
 * what a row of real logos would have given us anyway.
 *
 * To use real artwork, drop it in as /public/clients/<slug>.png (transparent
 * PNG or SVG) and point `logo` at it. The mark flattens whatever it is given
 * to a single colour with a CSS filter, so a full-colour logo needs no
 * preparation — see .cmark-logo in globals.css. `voice` is ignored for an
 * entry that has a logo, since the artwork carries its own identity.
 *
 * ── url ──────────────────────────────────────────────────────────────────
 * null everywhere too. An entry with a url renders as a link and takes a
 * pointer cursor; without one it renders as plain text. These are left empty
 * rather than guessed — a row of wrong links is worse than one of none.
 */
export const CLIENTS = [
  { name: 'Sheizen Wellness', voice: 'serif', logo: null, url: null },
  { name: 'Sivakasi Crackers', voice: 'caps', logo: null, url: null },
  { name: 'Fortune Innovatives', voice: 'grotesk', logo: null, url: null },
  { name: 'Interlock Bricks', voice: 'book', logo: null, url: null },
  // The longest name in the list, so it takes the most compact of the six.
  { name: 'Stansford International School', voice: 'serif', logo: null, url: null },
  { name: 'B² Consultants', voice: 'didone', logo: null, url: null },
  { name: 'GV Mart', voice: 'grotesk', logo: null, url: null },
  { name: 'Al Shifa Hospital', voice: 'book', logo: null, url: null },
  { name: 'KnowMind Universe', voice: 'mono', logo: null, url: null },
  /*
   * Added 19 Aug 2026. We built three systems for BrainLit — a 3D website, a
   * chatbot and a CRM — and they are listed individually under the categories
   * that describe them in data/portfolio.js. The website is Aakash Kummar's
   * build; see data/teamProjects.js.
   *
   * `didone` because the name is short enough to carry the widest tracking of
   * the six, and because it closes the loop against the `serif` of the first
   * entry rather than repeating it.
   */
  { name: 'BrainLit', voice: 'didone', logo: null, url: null },
];
