"use client";
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { COMPANY } from '@/data/company';
import styles from './kinetic-wordmark.module.css';

// useLayoutEffect writes the fitted size before the browser paints, so the
// wordmark is never briefly the wrong size. It does not exist on the server,
// where React warns if you call it; useEffect never runs there anyway.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * The wordmark, oversized, resolving into a header as you scroll past it.
 *
 * A tall track with a viewport-height panel stuck to it. At the top of the
 * track the name fills the width of the screen; by the bottom it has settled
 * to the size of a section heading, with the company's line underneath it.
 *
 * ── the size is measured, not guessed ────────────────────────────────────
 * The first cut of this set the large size as a hand-picked `vw` number,
 * worked out from an estimate of how wide thirteen characters of Satoshi run
 * at weight 900. The estimate was wrong and the name overflowed the screen
 * with its first and last letters cut off.
 *
 * Guessing again with a smaller number would have been the same mistake with
 * better luck, because the real quantity — the advance width of this exact
 * string, in this exact face, at this weight and tracking — is not something
 * a stylesheet can know and not something worth hardcoding. So the component
 * measures it: render the word, read what it actually came out as, and solve
 * for the size that makes it fill the container.
 *
 * Width scales linearly with font-size (em-based tracking scales with it, and
 * the horizontal squeeze is a constant factor), so one pass is exact rather
 * than iterative:
 *
 *     fitted = currentSize × (targetWidth / currentWidth)
 *
 * That holds for any string, any face and any viewport, which is also what
 * makes the phone layout work with no separate arithmetic: stacked, the
 * element's width is its widest line, and the same solve fits that instead.
 *
 * ── one tween, and only one ──────────────────────────────────────────────
 * GSAP animates a single unitless custom property, `--kt-p`, from 0 to 1.
 * Nothing else. Every visible consequence — the size, the two parallax
 * offsets, both fades — is a calc() off that one number in the stylesheet.
 * There is no arrangement of these parts that can produce a jump, because
 * there is only one value.
 *
 * ── why GSAP here and not a scroll listener ──────────────────────────────
 * `scrub: 0.7`. A plain listener maps scroll position to progress 1:1, which
 * is accurate and feels mechanical — the type stops dead the instant the
 * wheel does. Scrub eases the value toward its target instead, so the
 * movement carries and settles. gsap has been in package.json since the first
 * commit and imported by nothing; this is its first use, hence the dynamic
 * import, which keeps it out of the initial payload and off every other
 * route.
 *
 * ── the pin is CSS ───────────────────────────────────────────────────────
 * `position: sticky`, not ScrollTrigger's `pin: true`, which injects a
 * spacer div and takes over layout. ScrollTrigger is left doing the one thing
 * it is better at, which is producing a smoothed progress value.
 */
export default function KineticWordmark() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const wordRef = useRef(null);

  /*
   * Solve for the font size that makes the word fill its container.
   *
   * Reads its own targets from the stylesheet — --kt-fill (how much of the
   * width to occupy) and --kt-end (the settled size, as a fraction of the
   * large one) — so both stay tunable per breakpoint in CSS, next to the type
   * they describe, and this function stays pure measurement.
   */
  const fit = useCallback(() => {
    const stage = stageRef.current;
    const word = wordRef.current;
    if (!stage || !word) return;

    const cs = getComputedStyle(stage);
    const fill = parseFloat(cs.getPropertyValue('--kt-fill')) || 0.94;
    const end = parseFloat(cs.getPropertyValue('--kt-end')) || 0.26;

    const currentSize = parseFloat(getComputedStyle(word).fontSize);
    // getBoundingClientRect, not offsetWidth: it accounts for the horizontal
    // squeeze the stylesheet applies, so this is the width actually painted
    // rather than the width before the transform.
    const currentWidth = word.getBoundingClientRect().width;
    if (!currentSize || !currentWidth) return;

    const target = stage.clientWidth * fill;
    const fitted = currentSize * (target / currentWidth);

    stage.style.setProperty('--kt-unit', '1px');
    stage.style.setProperty('--kt-max', String(fitted));
    stage.style.setProperty('--kt-min', String(fitted * end));
  }, []);

  useIsomorphicLayoutEffect(() => {
    fit();

    // A webfont swapping in changes every advance width, so the first measure
    // can be of the fallback face. Re-solve once the real one is in.
    document.fonts?.ready.then(fit).catch(() => {});

    // ResizeObserver rather than a window listener: this also catches the
    // scrollbar appearing and any layout change that is not a viewport
    // resize, and it is already throttled to a frame.
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [fit]);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    // Reduced motion: the stylesheet already collapses the track and pins
    // --kt-p at its settled value, so there is nothing to animate and no
    // reason to fetch a tweening engine to agree. The fit above still ran.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let ctx;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      // gsap.context scopes everything created inside it to one handle, so
      // the cleanup below kills the tween and its ScrollTrigger together.
      ctx = gsap.context(() => {
        gsap.fromTo(
          stage,
          { '--kt-p': 0 },
          {
            '--kt-p': 1,
            ease: 'none',
            scrollTrigger: {
              trigger: track,
              // The panel is stuck for exactly the span between these two, so
              // progress 0 is the moment it locks and 1 the moment it
              // releases. The type is never mid-transition off-screen.
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          }
        );
      }, stage);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={trackRef}
      className={styles.track}
      aria-labelledby="kinetic-wordmark"
    >
      <div ref={stageRef} className={styles.stage}>
        <div className={styles.inner}>
          {/*
            * Two spans rather than one string: on a phone the name breaks to
            * two lines, because thirteen characters cannot be both monumental
            * and legible across 390px. The break is a CSS decision — see the
            * media query — and this markup is what gives it something to act
            * on. aria-label keeps it one name to a screen reader either way.
            */}
          <h2
            ref={wordRef}
            id="kinetic-wordmark"
            className={styles.word}
            aria-label={COMPANY.name}
          >
            <span className={styles.part} aria-hidden="true">Sirah</span>
            <span className={styles.part} aria-hidden="true">Digital</span>
          </h2>

          <div className={styles.footer}>
            <p className={styles.line}>{COMPANY.tagline}</p>
            <Link href="/services" className={styles.go}>
              See what we build
              <span aria-hidden="true" className={styles.arrow}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
