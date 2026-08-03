"use client";
import { useCallback, useEffect, useReducer, useState } from 'react';
import { SCENE_MS } from '@/data/transformation';

/**
 * The autoplay clock for the transformation story.
 *
 * State is one atomic object so no transition can be lost, and every action
 * bumps a monotonic `tick`. That single detail solves three problems at once:
 *
 *   1. The 3-second window restarts on any user gesture, because `tick` is the
 *      effect's dependency — it clears the pending timeout and starts a fresh
 *      one.
 *   2. Re-clicking the *already active* tab still resets the clock. With a
 *      plain `setIndex(2)` when the index is already 2, React bails out of the
 *      re-render, the effect never re-runs, and the same gesture would reset
 *      the timer sometimes and not others.
 *   3. The progress bar keys off `tick`, so the bar and the timer restart on
 *      exactly the same signal and cannot drift apart.
 *
 * The next index is computed inside the reducer from previous state, so the
 * effect body reads nothing but `dispatch`. There is no stale closure to trap.
 */

function reducer(state, action) {
  switch (action.type) {
    case 'next':
      return { ...state, index: (state.index + 1) % action.count, tick: state.tick + 1, manual: false };
    case 'goto':
      return { ...state, index: action.index, tick: state.tick + 1, manual: true };
    case 'toggle':
      return { ...state, playing: !state.playing, tick: state.tick + 1 };
    case 'setPlaying':
      return state.playing === action.playing ? state : { ...state, playing: action.playing, tick: state.tick + 1 };
    default:
      return state;
  }
}

export default function useSceneClock({ count, inView, reduced }) {
  const [state, dispatch] = useReducer(reducer, { index: 0, tick: 0, playing: true, manual: false });
  const { index, tick, playing, manual } = state;

  // A background tab throttles setTimeout to a second and eventually to a
  // minute, while IntersectionObserver still reports the section as visible.
  // Without this the story creeps forward while nobody is watching and the
  // visitor comes back to an arbitrary scene.
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const onChange = () => setTabVisible(!document.hidden);
    onChange();
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  // useMediaQuery reports false during SSR and the first client render, then
  // settles. Initialising `playing` from it would latch the wrong value and
  // never correct, so it is synced here instead.
  useEffect(() => {
    if (reduced) dispatch({ type: 'setPlaying', playing: false });
  }, [reduced]);

  const onScreen = inView && tabVisible;

  // StrictMode double-invokes this in development: the timeout is set, cleared
  // and set again. Harmless — the cleanup is correct.
  useEffect(() => {
    if (!playing || !onScreen) return undefined;
    const id = window.setTimeout(() => dispatch({ type: 'next', count }), SCENE_MS);
    return () => window.clearTimeout(id);
  }, [tick, playing, onScreen, count]);

  const goTo = useCallback((i) => dispatch({ type: 'goto', index: i }), []);
  const next = useCallback(() => dispatch({ type: 'next', count }), [count]);
  const toggle = useCallback(() => dispatch({ type: 'toggle' }), []);

  return { index, tick, playing, manual, onScreen, goTo, next, toggle };
}
