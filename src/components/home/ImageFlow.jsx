"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { CAROUSEL_CARDS } from '@/data/carouselCards';
import styles from './image-flow.module.css';

/*
 * SECTION - Image flow
 *
 * One photograph held on a raised plate with a label above it; the rest of
 * the set shrunk to thumbnails flanking it on both sides; a counter and two
 * arrows in the right gutter. It advances on its own, and advancing slides
 * the whole rank one place over: the incoming thumbnail grows into the
 * middle frame, the outgoing middle frame shrinks back into a thumbnail, and
 * the label on the plate changes over on its own.
 *
 * The growing and the shrinking are the section. Nothing here waits for a
 * click, nothing stops under the pointer, and the easing is long and
 * symmetric so a frame is watched taking hold and letting go rather than
 * snapping between two sizes. The photographs carry it; there is no copy on
 * the plate to read, only a label.
 *
 * -- why nothing is ever cropped ------------------------------------------
 * Every frame in the section is the same 5:7 box at --hero-w, and the only
 * thing separating the middle frame from a thumbnail is a uniform scale() on
 * its transform. The box never changes shape, so object-cover never has
 * anything to trim and a photograph cannot break as it travels in. Sizing
 * the thumbnails with width and height would re-crop the picture on every
 * step and put layout work on the compositor path; this does neither.
 *
 * -- who writes what ------------------------------------------------------
 * CSS owns the geometry: --hero-w and --flow-span are declared per
 * breakpoint and everything else on the stage is derived from them. This
 * file reads those two numbers back and writes one transform and one opacity
 * per frame. It never writes a size, a position or a colour, so there is
 * only ever one description of the layout.
 *
 * -- easing ---------------------------------------------------------------
 * A step is a CSS transition, not a frame loop: nine transitions handed to
 * the compositor cost nothing per frame, where a rAF loop would run for the
 * whole 1600ms against the WebGL field behind the page. The loop comes back
 * only for a drag, which has to track the finger exactly and therefore
 * cannot ease at all - the transition is switched off for the duration and
 * switched back on to let the release settle.
 *
 * -- the autoplay timer ---------------------------------------------------
 * There is no timer. The progress bar's own animation is the clock: the
 * section advances on its animationend, so the bar cannot drift out of step
 * with the slides, and pausing the bar - on focus, off screen, in a hidden
 * tab, mid-drag - pauses the autoplay by construction.
 */

const N = CAROUSEL_CARDS.length;

/* -------------------------------------------------------------------------
 * The rank
 *
 * Indexed by `a`, the distance from the middle: 0 is the centre frame, 1 and
 * 2 the thumbnails either side, 3 the slot a frame slides in from and out
 * to. Both are multiples of --hero-w rather than pixels, so one set of
 * numbers describes the arrangement at every breakpoint and the composition
 * simply scales.
 *
 * The offsets are not evenly spaced, and that is the point: 0.82 puts the
 * first thumbnail just clear of the plate edge (the plate reaches 0.65), and
 * 1.09 leaves a hairline of dark between the two thumbnails rather than
 * pushing the outer one out towards the counter.
 * ---------------------------------------------------------------------- */
const OFFSET = [0, 0.82, 1.09, 1.34];
const SCALE = [1, 0.26, 0.185, 0.13];
const LAST = OFFSET.length - 1;

// One full-width drag of this many hero-widths advances one slide.
const DRAG_PITCH = 0.82;

// Movement under this many px on release was a click, not a drag.
const CLICK_SLOP = 6;

// How long a slide gets before the next one comes round, measured from the
// start of its arrival. The frames take 1600ms of that easing into place
// (see .frame in the stylesheet), so the section is actually in motion for
// well over half of every cycle, which is the point: a frame should be seen
// growing or shrinking far more often than it is seen sitting still.
const AUTOPLAY_MS = 2800;

/**
 * Where a frame sits and how big it is, for a signed distance from the
 * middle. `d` is fractional during a drag, so the two tables are
 * interpolated rather than looked up - a frame is almost never at a whole
 * slot, and stepping between them would judder under the finger.
 */
function place(d) {
  const a = Math.min(Math.abs(d), LAST);
  const i = Math.floor(a);
  const j = Math.min(i + 1, LAST);
  const t = a - i;
  const off = OFFSET[i] + (OFFSET[j] - OFFSET[i]) * t;
  const scale = SCALE[i] + (SCALE[j] - SCALE[i]) * t;
  return { off: d < 0 ? -off : off, scale, a };
}

const pad2 = (n) => String(n).padStart(2, '0');

function Chevron({ back }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={back ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ImageFlow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Nothing that depends on a measurement is rendered until the first effect
  // has run, so the server markup and the first client render agree.
  const [ready, setReady] = useState(false);

  const reduced = useReducedMotion();
  const router = useRouter();

  const stageRef = useRef(null);
  const framesRef = useRef([]);
  // Read back from CSS, never typed here. See the note at the top.
  const metricsRef = useRef({ heroW: 0, span: 2 });
  // Each frame's last distance from the middle, so the one frame that wraps
  // from one end of the loop to the other can be told to jump rather than
  // travel the whole way across.
  const prevRef = useRef(new Float32Array(N).fill(99));
  const indexRef = useRef(0);
  const posRef = useRef(0);
  const dragRef = useRef(null);
  const travelRef = useRef(0);
  const firstRef = useRef(true);
  const flagsRef = useRef({ held: false, onScreen: true, tabVisible: true, dragging: false });

  /*
   * What is allowed to stop the section, and what deliberately is not.
   *
   * Hovering is not. It used to be — the whole stage paused under the
   * pointer — and on a section this tall that is most of the screen, so a
   * pointer left anywhere near it froze the flow and the section read as a
   * still image that only moved when an arrow was pressed. Holding on hover
   * is a good idea for a strip of small thumbnails and a bad one for a
   * full-width stage.
   *
   * Keyboard focus still holds it, which is the pause mechanism that
   * actually matters: someone tabbing to the arrows is not fighting a
   * moving target. A reduced-motion preference stops the autoplay outright,
   * further down.
   */
  const syncPaused = useCallback(() => {
    const f = flagsRef.current;
    setPaused(f.held || f.dragging || !f.onScreen || !f.tabVisible);
  }, []);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const first = framesRef.current[0];
    if (!stage || !first) return;
    // offsetWidth on a scaled element is its layout width, which is exactly
    // --hero-w - the value every offset in OFFSET is a multiple of.
    const heroW = first.offsetWidth || 0;
    const raw = getComputedStyle(stage).getPropertyValue('--flow-span');
    const span = Math.max(0, parseInt(raw, 10) || 2);
    metricsRef.current = { heroW, span };
  }, []);

  /**
   * One transform and one opacity per frame, for a position that is whole
   * between steps and fractional under a drag.
   *
   * `snap` kills the transition for every frame - used for the first paint,
   * for a resize, and for each move of a drag. Individual frames snap too,
   * without being asked: past the exit slot a frame is invisible, and the
   * one that wraps has to be allowed to teleport or it would sail back
   * across the stage behind the others.
   */
  const applyLayout = useCallback((pos, snap) => {
    const frames = framesRef.current;
    const { heroW, span } = metricsRef.current;
    if (!heroW) return;
    const prev = prevRef.current;
    const exit = span + 1;
    const fadeFrom = span + 0.1;
    const half = N / 2;

    for (let i = 0; i < N; i++) {
      const el = frames[i];
      if (!el) continue;

      // Signed distance from the middle, wrapped the short way round so a
      // frame leaving one end reappears at the other.
      let d = i - pos;
      d = ((((d + half) % N) + N) % N) - half;

      const { off, scale, a } = place(d);
      const opacity = a <= fadeFrom ? 1 : Math.max(0, 1 - (a - fadeFrom) / 0.9);
      const jump = a > exit + 0.001 || prev[i] > exit + 0.001;

      el.style.transitionProperty = snap || jump ? 'none' : 'transform, opacity';
      el.style.transform =
        `translate3d(${(off * heroW).toFixed(2)}px, 0, 0) scale(${scale.toFixed(4)})`;
      el.style.opacity = opacity.toFixed(3);
      // Descending with distance, so the middle frame is always the one on
      // top and the thumbnails stack outwards behind it.
      el.style.zIndex = String(40 - Math.round(a * 8));
      el.style.pointerEvents = opacity > 0.85 ? 'auto' : 'none';
      el.dataset.current = a < 0.5 ? 'true' : 'false';

      prev[i] = a;
    }
  }, []);

  const go = useCallback((delta) => {
    setIndex((i) => ((((i + delta) % N) + N) % N));
  }, []);

  /* ---- settle on every step --------------------------------------- */

  useEffect(() => {
    if (firstRef.current) measure();
    indexRef.current = index;
    posRef.current = index;
    applyLayout(index, firstRef.current);
    firstRef.current = false;
    setReady(true);
  }, [index, measure, applyLayout]);

  /* ---- input, visibility, resize ----------------------------------- */

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      // The arrows live inside the stage. Capturing the pointer for a drag
      // that starts on one of them would take the press away from the button.
      if (e.target.closest('button')) return;
      try { stage.setPointerCapture(e.pointerId); } catch { /* not fatal */ }
      dragRef.current = { id: e.pointerId, x: e.clientX, base: indexRef.current, travel: 0 };
      travelRef.current = 0;
      stage.dataset.dragging = 'true';
      flagsRef.current.dragging = true;
      syncPaused();
    };

    const onPointerMove = (e) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x;
      d.travel = Math.max(d.travel, Math.abs(dx));
      const pitch = metricsRef.current.heroW * DRAG_PITCH;
      if (!pitch) return;
      posRef.current = d.base - dx / pitch;
      // Direct manipulation: under the finger, not easing towards it.
      applyLayout(posRef.current, true);
    };

    const onPointerUp = (e) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.id) return;
      dragRef.current = null;
      travelRef.current = d.travel;
      stage.dataset.dragging = 'false';
      flagsRef.current.dragging = false;
      syncPaused();
      try { stage.releasePointerCapture(e.pointerId); } catch { /* already gone */ }

      const settled = ((((Math.round(posRef.current) % N) + N) % N));
      if (settled === indexRef.current) {
        // Same slide: the effect above will not fire, so ease it back here.
        posRef.current = settled;
        applyLayout(settled, false);
      } else {
        setIndex(settled);
      }
    };

    const onClick = (e) => {
      // Swallow the click that ends a drag.
      if (travelRef.current >= CLICK_SLOP) { travelRef.current = 0; return; }
      const el = e.target.closest('[data-frame-index]');
      if (!el) return;
      const i = Number(el.dataset.frameIndex);
      if (i === indexRef.current) {
        const href = CAROUSEL_CARDS[i]?.href;
        if (href) router.push(href);
        return;
      }
      setIndex(i);
    };

    const onKeyDown = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      go(e.key === 'ArrowRight' ? 1 : -1);
    };

    // Named rather than produced by a factory, because these have to be the
    // same function objects at removeEventListener time.
    const onFocusIn = () => { flagsRef.current.held = true; syncPaused(); };
    const onFocusOut = () => { flagsRef.current.held = false; syncPaused(); };
    const onTabVisibility = () => {
      flagsRef.current.tabVisible = document.visibilityState === 'visible';
      syncPaused();
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);
    stage.addEventListener('click', onClick);
    stage.addEventListener('keydown', onKeyDown);
    stage.addEventListener('focusin', onFocusIn);
    stage.addEventListener('focusout', onFocusOut);
    document.addEventListener('visibilitychange', onTabVisibility);

    // Autoplay only runs while the section is actually on screen.
    let io;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          flagsRef.current.onScreen = entry.isIntersecting;
          syncPaused();
        },
        { rootMargin: '120px 0px' }
      );
      io.observe(stage);
    }

    // A resize changes --hero-w, so every offset changes with it. It must
    // not animate: the frames have not moved between slots, the ruler has.
    let resizeFrame = 0;
    const onResize = () => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        measure();
        applyLayout(posRef.current, true);
      });
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      io?.disconnect();
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointercancel', onPointerUp);
      stage.removeEventListener('click', onClick);
      stage.removeEventListener('keydown', onKeyDown);
      stage.removeEventListener('focusin', onFocusIn);
      stage.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('visibilitychange', onTabVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, [applyLayout, measure, syncPaused, go, router]);

  /* ---- render ------------------------------------------------------ */

  const current = CAROUSEL_CARDS[index] || CAROUSEL_CARDS[0];

  return (
    <section
      aria-label="Gallery"
      /* clip rather than hidden: it stops the outermost frames pushing the
         page sideways without creating a scroll container, and unlike hidden
         it leaves the vertical axis genuinely visible. */
      className="relative py-20 md:py-28 [overflow-x:clip]"
    >
      <div className="mx-auto max-w-[1400px] px-6">
        <div
          ref={stageRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Image gallery. Use the left and right arrow keys to move between slides."
          className={styles.stage}
          data-dragging="false"
        >
          {/* The plate. Static - the frames travel across it, it does not
              move with them - so the label and the line of copy change over
              in place rather than sliding in from the side. */}
          <div className={styles.panel}>
            <div className={styles.eyebrowRow}>
              <span key={`eyebrow-${index}`} className={`${styles.eyebrow} ${styles.textIn}`}>
                {current.eyebrow}
              </span>
            </div>

            {/* Reserves the space the middle frame is drawn over. The frames
                are siblings of the plate rather than children of it, because
                a thumbnail has to be able to sit outside it. Below this the
                plate is empty on purpose — see --pad-b in the stylesheet. */}
            <div className={styles.slot} aria-hidden="true" />

            {/* The autoplay clock. Rendered only once the first effect has
                run, so the server markup matches, and never under reduced
                motion - the global rule there collapses every animation to
                0.001ms, and this one advancing the section would spin it. */}
            {ready && !reduced && (
              <span
                key={`clock-${index}`}
                className={styles.progress}
                style={{
                  animationDuration: `${AUTOPLAY_MS}ms`,
                  animationPlayState: paused ? 'paused' : 'running',
                }}
                onAnimationEnd={() => go(1)}
                aria-hidden="true"
              />
            )}
          </div>

          {CAROUSEL_CARDS.map((card, i) => (
            <article
              key={card.id}
              ref={(el) => { framesRef.current[i] = el; }}
              data-frame-index={i}
              data-current="false"
              className={styles.frame}
              /* Invisible until the first layout pass has placed it, so the
                 nine frames are never seen stacked on top of one another. */
              style={{ opacity: 0 }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${N}. ${card.caption || card.alt || ''}`}
            >
              <Image
                src={card.src}
                alt={card.alt || ''}
                fill
                draggable={false}
                /* The box is --hero-w wide and scale() only ever shrinks it,
                   so the largest this is ever drawn at is --hero-w itself. */
                sizes="(max-width: 767px) 250px, 300px"
              />
            </article>
          ))}

          <div className={styles.controls}>
            <p className={styles.count}>
              <span className={styles.countNow}>{pad2(index + 1)}</span>
              <span className={styles.countAll}>/ {pad2(N)}</span>
            </p>
            <div className={styles.arrows}>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => go(-1)}
                aria-label="Previous slide"
              >
                <Chevron back />
              </button>
              <button
                type="button"
                className={styles.arrow}
                onClick={() => go(1)}
                aria-label="Next slide"
              >
                <Chevron />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
