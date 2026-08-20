/**
 * Theme plumbing — the single source of truth for how light/dark is stored,
 * read and broadcast.
 *
 * The palette itself lives in globals.css as two blocks of channel triplets
 * (`:root, [data-theme="dark"]` and `[data-theme="light"]`); nothing here
 * knows a colour. All this module owns is the *switch*: which of the two
 * blocks is live, where that choice persists, and how non-CSS consumers —
 * chiefly the WebGL background, which paints outside the cascade — hear about
 * a change.
 *
 * Deliberately free of React so the no-FOUC boot script in app/layout.js can
 * mirror these exact constants inline. If a key changes here it must change
 * there too; they are re-stated rather than imported because that script has
 * to run before any bundle loads.
 */

export const THEME_STORAGE_KEY = 'sirah-theme';
export const THEME_ATTRIBUTE = 'data-theme';

/** Fired on `window` after the attribute flips. detail: { theme }. */
export const THEME_EVENT = 'sirah:theme';

export const DARK = 'dark';
export const LIGHT = 'light';

/**
 * Dark stays the default when nothing is stored and the OS expresses no
 * preference — it is the theme the brand shipped on, and the one the hero
 * particle field was composed for.
 */
export const DEFAULT_THEME = DARK;

const isTheme = (v) => v === DARK || v === LIGHT;

/** What the visitor last chose, or null if they never have. */
export function storedTheme() {
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(v) ? v : null;
  } catch {
    // Safari in private mode throws on localStorage access rather than
    // returning null. A visitor who cannot persist a choice should still get
    // a working toggle for the session.
    return null;
  }
}

/** What the OS asks for, or null if it has no opinion / we cannot ask. */
export function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return null;
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return LIGHT;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return DARK;
  return null;
}

/** Explicit choice wins over the OS, which wins over the brand default. */
export function resolveTheme() {
  return storedTheme() || systemTheme() || DEFAULT_THEME;
}

/** Whatever is on <html> right now — the truth the boot script already set. */
export function currentTheme() {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const v = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return isTheme(v) ? v : DEFAULT_THEME;
}

/**
 * Flip the theme.
 *
 * Three things move together and all three matter:
 *   - `data-theme` selects the palette block.
 *   - `color-scheme` tells the UA to draw form controls, the caret and the
 *     default scrollbar to match; without it a light page keeps dark native
 *     widgets and looks broken in exactly the places CSS cannot reach.
 *   - `theme-color` repaints the mobile browser chrome around the page.
 *
 * `persist: false` is for previews (hover-to-peek, a settings demo) that
 * should not overwrite a real choice.
 */
export function applyTheme(theme, { persist = true } = {}) {
  const next = isTheme(theme) ? theme : DEFAULT_THEME;
  const root = document.documentElement;

  root.setAttribute(THEME_ATTRIBUTE, next);
  root.style.colorScheme = next;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === LIGHT ? '#FFFFFF' : '#16142C');

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* see storedTheme */
    }
  }

  // The WebGL field, the 2D canvases and anything else painting outside the
  // cascade cannot observe an attribute change on their own. CSS-driven
  // components ignore this entirely and just re-cascade.
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: next } }));

  return next;
}

/**
 * A token expression -> a concrete hex, by asking the browser.
 *
 * Needed wherever a colour leaves CSS entirely. The particle field's tint is
 * the case that forced it: PinnedExperience hands an accent to
 * BACKGROUND_TINT_EVENT, which ends up in THREE.Color.set(), and three's
 * parser knows hex, rgb() and named colours — it has never heard of var(),
 * and a string it cannot parse leaves the colour at its previous value with
 * a console warning.
 *
 * The probe is the only honest way to do this: --c-cyan resolves differently
 * depending on which palette block won *and* on whether the element sits
 * inside a .theme-invert subtree, so reading the variable off :root would be
 * right only by coincidence. Appending to <body> and reading back the
 * computed colour asks the cascade the same question the renderer would.
 *
 * One forced style resolution per call, on a theme change or a section
 * change. Not something to put in a render loop.
 */
export function resolveCssColor(value, fallback = '#22D3EE') {
  if (typeof document === 'undefined' || !value) return fallback;
  // Already concrete — nothing to resolve.
  if (!String(value).includes('var(')) return value;

  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden;pointer-events:none';
  probe.style.color = value;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();

  const parts = computed.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return fallback;
  return `#${parts.slice(0, 3)
    .map((n) => Math.round(Number(n)).toString(16).padStart(2, '0'))
    .join('')}`;
}
