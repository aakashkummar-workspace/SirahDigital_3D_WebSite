"use client";
import { useCallback, useEffect, useState } from 'react';
import {
  DARK,
  LIGHT,
  DEFAULT_THEME,
  THEME_EVENT,
  THEME_STORAGE_KEY,
  applyTheme,
  currentTheme,
  storedTheme,
  systemTheme,
} from '@/lib/theme';

/**
 * Read and set the active theme from a client component.
 *
 * Returns `{ theme, mounted, setTheme, toggle }`.
 *
 * On the server and on the very first client render this reports
 * DEFAULT_THEME regardless of what the boot script actually applied. That is
 * deliberate: the server has no way to know the visitor's choice, so any
 * attempt to render the real value in that pass is a hydration mismatch. The
 * true value arrives in the effect below, one tick later — which is why
 * `mounted` is returned alongside it. Anything whose *markup* differs per
 * theme (an icon, an aria-label) should stay neutral until `mounted` is true;
 * anything styled purely in CSS needs none of this, because the attribute was
 * already correct before first paint.
 *
 * There is no context provider. The state that matters lives on <html>, every
 * consumer hears the same window event, and a provider would only add a tree
 * that has to be threaded through the two server layouts to reach the navbar.
 */
export default function useTheme() {
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(currentTheme());
    setMounted(true);

    const onTheme = (e) => {
      const next = e?.detail?.theme;
      if (next) setThemeState(next);
    };
    window.addEventListener(THEME_EVENT, onTheme);

    // Another tab switching theme should carry over to this one. `newValue`
    // is null when the key is removed, which we treat as "fall back to the
    // system preference" rather than ignoring it.
    const onStorage = (e) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      applyTheme(e.newValue || systemTheme() || DEFAULT_THEME, { persist: false });
    };
    window.addEventListener('storage', onStorage);

    // Follow the OS only while the visitor has made no explicit choice of
    // their own. Once they have, their choice outranks it in resolveTheme()
    // and it would be rude to override it here.
    const mq = window.matchMedia?.('(prefers-color-scheme: light)');
    const onSystem = (e) => {
      if (storedTheme()) return;
      applyTheme(e.matches ? LIGHT : DARK, { persist: false });
    };
    mq?.addEventListener?.('change', onSystem);

    return () => {
      window.removeEventListener(THEME_EVENT, onTheme);
      window.removeEventListener('storage', onStorage);
      mq?.removeEventListener?.('change', onSystem);
    };
  }, []);

  const setTheme = useCallback((next) => { applyTheme(next); }, []);
  const toggle = useCallback(() => {
    applyTheme(currentTheme() === LIGHT ? DARK : LIGHT);
  }, []);

  return { theme, mounted, setTheme, toggle, isLight: theme === LIGHT };
}
