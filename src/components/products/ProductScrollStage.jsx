"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './product-stage.module.css';

/*
 * A pinned stage: one item at a time, described by a panel stuck to the
 * viewport, with an arc tracing forward down the left as you scroll.
 *
 * A tall track with a viewport-height panel stuck to it. Scrolling the track
 * does not scroll the panel — it advances which item the panel describes,
 * handing one to the next and tracing the arc forward as it goes.
 *
 * ── what it renders now ──────────────────────────────────────────────────
 * This was written for the three products and took them as its only shape.
 * The two bands on /products have since swapped treatments — the products are
 * on the rotating cylinder and this stage carries the custom software
 * portfolio — so it takes a generic `items` array instead. Nothing in the
 * scroll mechanism cares what is in them.
 *
 *   items[]  { key, title, tagline, body, lines, href, ctaLabel }
 *
 * `body` renders as a paragraph and `lines` as a short list ({ name, note }
 * each). An item may carry either: a product is one thing with a description,
 * a portfolio category is a group of things.
 *
 * ── what changed, and why it was stuck ───────────────────────────────────
 * This used to scrub opacity continuously from scroll position: every item
 * faded as `1 - |pos - i| / 0.62`. Two things followed from that, and both
 * were visible.
 *
 * The first is that the fade band is symmetric, so at the midpoint between two
 * items BOTH sat at opacity 0.194 — every item shares one grid cell, so
 * that is two headings and two paragraphs printed on top of each other while
 * the panel as a whole went nearly blank. The second is that the band was
 * 0.62 items wide, which at one item per viewport is roughly 24vh of
 * scrolling spent in that state. It was not a glitch you passed through; you
 * could stop in it, and scrolling slowly meant living in it.
 *
 * So the transition is no longer scrubbed. Scroll decides *which* item is
 * current — an integer — and the change between them is a timed CSS
 * transition that cannot be parked in the middle of. The two fades are
 * staggered rather than simultaneous (the outgoing is gone before the
 * incoming arrives), so there is no moment where both are legible.
 *
 * ── hysteresis ───────────────────────────────────────────────────────────
 * The index only changes once the scroll position is clear of the boundary by
 * BAND. Without it, a scroll that comes to rest near a handover point — or a
 * trackpad's residual jitter — flips the index back and forth, which is the
 * other half of what read as "stuck".
 *
 * ── what is deliberately outside React ───────────────────────────────────
 * The arc's lead stroke. It is the one thing that genuinely should track
 * scroll continuously, so it is written to the DOM node inside the rAF
 * instead of through state. Routing it through React would re-render every
 * <article> subtree and every SVG node on each frame, which is what the
 * scrubbed version did and part of why it did not feel smooth.
 *
 * ── what is deliberately NOT in JS ───────────────────────────────────────
 * Whether the stage pins at all. That is a media query in the CSS module:
 * hooks/useMediaQuery is false during SSR and on first paint, so branching
 * here would flash a pinned stage at a phone before settling. The component
 * always writes `data-state`; the stylesheet only gives it meaning at 1024px
 * and up under full motion, and below that the items are an ordinary
 * stacked list that needs no override to stay visible.
 */

// The arc, and where each item sits on it.
//
// P0 (20,40) C (200,160) (200,560) -> P3 (20,680): endpoints pinned to the far
// left, belly swelling right to (155,360), opening leftward. The dots sit on
// the inside of the curve, alongside the figures they mark.
//
// Computed rather than written out. The three literal points that used to live
// here were the curve evaluated at t = 0.25 / 0.5 / 0.75 for exactly three
// items, and slicing that fixed array to the item count meant a fourth
// item silently got no dot -- the arc kept three, the panel showed four,
// and nothing errored. The spacing rule below is the one already in use:
// t = (i + 1) / (n + 1), which reproduces 0.25 / 0.5 / 0.75 exactly at n = 3.
//
// `at` is the fraction of the path the lead stroke runs to. Using t for it is
// an approximation of arc length, and the same one the literal values made.
const ARC_P0 = [20, 40];
const ARC_C1 = [200, 160];
const ARC_C2 = [200, 560];
const ARC_P3 = [20, 680];

const bezier = (t, [x0, y0], [x1, y1], [x2, y2], [x3, y3]) => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * x0 + b * x1 + c * x2 + d * x3,
    y: a * y0 + b * y1 + c * y2 + d * y3,
  };
};

const dotsFor = (n) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / (n + 1);
    return { ...bezier(t, ARC_P0, ARC_C1, ARC_C2, ARC_P3), at: t };
  });

const ARC_D = 'M 20 40 C 200 160, 200 560, 20 680';

// Where the panel comes to rest, matching `top` on .panel in the stylesheet.
// The site's navbar is a fixed 72px bar; a panel stuck at 0 sits under it.
const STICKY_TOP = 72;

// How far past the halfway point the scroll has to travel before the current
// item hands over. 0.08 of an item ≈ 8vh — enough to swallow trackpad
// jitter, small enough that the handover still lands where you expect it.
const BAND = 0.08;

export default function ProductScrollStage({
  items,
  label = '[ Products ]',
  // How much scroll each item is given. The default is one screen; a band with
  // more items than that is comfortable at passes a smaller value, so the
  // section does not become one screen of scroll per item however many it
  // holds.
  itemHeight = '100svh',
}) {
  const trackRef = useRef(null);
  const panelRef = useRef(null);
  const leadRef = useRef(null);

  // Which item the panel is describing. An integer, and the only piece of
  // scroll-derived state React ever sees.
  const [active, setActive] = useState(0);
  // Mirrors `active` for the rAF, which must not close over a stale render.
  const activeRef = useRef(0);

  const count = items.length;
  const last = Math.max(count - 1, 1);

  // n points of arithmetic, so cheap enough on its own — memoised because the
  // effect below closes over it and would otherwise re-subscribe every render.
  const dots = useMemo(() => dotsFor(count), [count]);

  const setActiveIndex = useCallback(
    (i) => {
      const next = Math.min(Math.max(i, 0), Math.max(count - 1, 0));
      if (next === activeRef.current) return;
      activeRef.current = next;
      setActive(next);
    },
    [count]
  );

  useEffect(() => {
    const track = trackRef.current;
    const panel = panelRef.current;
    if (!track || !panel) return;

    let raf = 0;
    const measure = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      // Measured, not assumed: the panel is shorter than the viewport by the
      // navbar it sits below, so window.innerHeight is the wrong divisor.
      const scrollable = rect.height - panel.offsetHeight;

      // Not a stage — the stacked fallback, where the track is only as tall as
      // its content. Reset rather than leaving the last scrubbed value behind.
      if (scrollable <= 0) {
        setActiveIndex(0);
        if (leadRef.current) leadRef.current.style.strokeDashoffset = '1';
        return;
      }

      const p = Math.min(Math.max((STICKY_TOP - rect.top) / scrollable, 0), 1);
      const pos = p * last;

      // The arc, straight to the node — see the note above.
      if (leadRef.current && dots.length) {
        const lead = dots[0].at + p * (dots[dots.length - 1].at - dots[0].at);
        leadRef.current.style.strokeDashoffset = String(1 - lead);
      }

      // Hand over only once clear of the boundary. Math.round on the far side
      // rather than ±1, so flinging past two items lands on the right one.
      const current = activeRef.current;
      if (pos > current + 0.5 + BAND || pos < current - 0.5 - BAND) {
        setActiveIndex(Math.round(pos));
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [last, setActiveIndex, dots]);

  /*
   * Tabbing to an item that is currently faded out would otherwise put the
   * focus ring on something invisible. Every item stays in the DOM and in the
   * accessibility tree — only opacity and pointer-events change, never
   * visibility — so instead of taking the hidden ones out of the tab order,
   * focus brings its item forward. Keyboard then walks the stage the way
   * scrolling does.
   */
  const onFocusItem = useCallback((i) => setActiveIndex(i), [setActiveIndex]);

  return (
    <div
      ref={trackRef}
      className={styles.track}
      style={{
        '--item-height': itemHeight,
        '--track-height': `calc(${count} * var(--item-height))`,
      }}
    >
      <div ref={panelRef} className={styles.panel}>
        <div className={styles.inner}>
          {/* heading — above the items, with the arc running past both */}
          <div className={styles.head}>
            {/* The label is the section's heading. Kept as an <h2> rather than
                a <span> so the document outline still has a node here, the
                same way ProjectList's quiet group labels are headings. */}
            <h2 className={styles.label}>{label}</h2>
          </div>

          {/* arc */}
          <div className={styles.rail} aria-hidden="true">
            <svg
              className={styles.arc}
              viewBox="0 0 240 720"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* The lead stroke was flat white at 42%, 1px wide, over a 10%
                    track — which is to say very nearly invisible against the
                    particle field. It is the brand ramp now, at three times
                    the width, with the glow in the stylesheet. */}
                <linearGradient id="arcLeadRamp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: "rgb(var(--c-cyan))" }} />
                  <stop offset="55%" style={{ stopColor: "rgb(var(--c-indigo))" }} />
                  <stop offset="100%" style={{ stopColor: "rgb(var(--c-purple))" }} />
                </linearGradient>
              </defs>

              {/* pathLength="1" renormalises the curve so stroke-dasharray
                  works in fractions and nothing has to measure the path. */}
              <path className={styles.arcTrack} d={ARC_D} pathLength="1" />
              <path
                ref={leadRef}
                className={styles.arcLead}
                d={ARC_D}
                pathLength="1"
                strokeDasharray="1"
                // Fully retracted until the first measure lands, so the arc
                // does not flash complete before hydration.
                strokeDashoffset="1"
              />
              {dots.map((dot, i) => (
                <circle
                  key={i}
                  className={`${styles.dot} ${i === active ? styles.dotOn : ''}`}
                  cx={dot.x}
                  cy={dot.y}
                  r={i === active ? 6.5 : 4}
                />
              ))}
            </svg>
          </div>

          {/* items */}
          <div className={styles.items}>
            {items.map((item, i) => (
              <article
                key={item.key}
                className={styles.item}
                // One attribute drives opacity, offset, stacking order and
                // hit-testing, all from the stylesheet. 'before' and 'after'
                // differ only in which way the item drifts as it leaves.
                data-state={
                  i === active ? 'active' : i < active ? 'before' : 'after'
                }
              >
                <span className={styles.num} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div>
                  <h3 className={styles.name}>{item.title}</h3>

                  {item.tagline && (
                    <p className={styles.tagline}>{item.tagline}</p>
                  )}

                  {item.body && <p className={styles.body}>{item.body}</p>}

                  {/* The list form, for an item that is a group of things
                      rather than one thing with a description. */}
                  {item.lines?.length > 0 && (
                    <ul role="list" className={styles.lines}>
                      {item.lines.map((line) => (
                        <li key={line.name} className={styles.line}>
                          <span className={styles.lineName}>{line.name}</span>
                          {line.note && (
                            <span className={styles.lineNote}>{line.note}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.href && (
                    <Link
                      href={item.href}
                      className={styles.go}
                      onFocus={() => onFocusItem(i)}
                    >
                      {item.ctaLabel || `Explore ${item.title}`}
                      <span aria-hidden="true" className={styles.arrow}>
                        →
                      </span>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
