"use client";
import React, { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PORTFOLIO_CATEGORIES, PORTFOLIO_CTA } from '@/data/portfolio';
import styles from './portfolio-cylinder.module.css';

/*
 * SECTION — a rotating cylinder of panels.
 *
 * Panels stand on the surface of an invisible cylinder. The cylinder turns;
 * the panels do not. Whichever one is facing the viewer is the active one,
 * and it alone shows its lines and its CTA.
 *
 * ── what it renders now ──────────────────────────────────────────────────
 * This was written for the five custom-software categories and read them
 * straight out of data/portfolio.js. The two bands on /products have since
 * swapped treatments — the cylinder carries the products and the pinned arc
 * stage carries the portfolio — so the content arrives as props:
 *
 *   items[]  { id, name, lines: [{ name, note }], cta: { label, href } }
 *
 * The portfolio data stays as the default, so the component still renders
 * what it always did when called with no arguments. Panel count is read off
 * `items` rather than fixed at five; the geometry below is written in terms
 * of N and needed no other change.
 *
 * ── the geometry, which is the whole thing ───────────────────────────────
 * A panel is placed by `rotateY(i * STEP) translateZ(R)`. That alone does
 * NOT give you a cylinder seen from outside — it puts the front panel R
 * closer to the camera than the pivot, so perspective magnifies it by
 * P / (P - R). At the first values here that was 1.53x: the front panel
 * rendered half again as wide as it really was, filled the frame, and nothing
 * ever appeared to recede. It read as one flat oversized card.
 *
 * The fix is one transform on the stage: `translateZ(-R)`. That pushes the
 * cylinder's axis back by its own radius, so the front panel lands at z = 0
 * and renders at true size, while the panels either side fall away to
 * z = -0.69R and are scaled down by perspective. Front true, sides receding,
 * is what the eye reads as a curved surface.
 *
 * ── CSS 3D, not WebGL ────────────────────────────────────────────────────
 * The brief asks for the category and project names to be semantic text
 * "outside WebGL" — the usual way to keep a canvas scene accessible: draw in
 * canvas, mirror the words in hidden DOM. There is no canvas here, so there
 * is no mirror to keep in sync: the words on screen ARE the semantic text.
 * It also serves the brief's other instruction, that typography is the hero.
 * DOM text is hinted by the browser at whatever size it lands on; canvas text
 * is a texture.
 *
 * ── nothing in the frame loop touches React, or the cascade ──────────────
 * The section renders once. After that the loop writes `opacity` and one
 * NON-inheriting custom property per panel, straight to the DOM.
 *
 * The non-inheriting part is a performance decision, not a detail. An earlier
 * pass drove everything from a single inherited `--a`, which is tidy to read
 * and expensive to run: changing an inherited custom property invalidates
 * every descendant that might resolve it, so five panels meant five subtree
 * style recalculations per frame, every frame. `--s` is declared
 * `inherits: false`, and the one value a child needs is written to that child
 * directly.
 */

/*
 * The portfolio categories in this component's own shape — the default, and
 * the only caller that used to exist. `lines` is the generic name for "the
 * things listed on a panel"; for a category those are its projects.
 */
const DEFAULT_ITEMS = PORTFOLIO_CATEGORIES.map((category) => ({
  id: category.id,
  name: category.name,
  lines: category.projects,
  cta: PORTFOLIO_CTA,
}));

/*
 * N and STEP used to be module constants read off PORTFOLIO_CATEGORIES at
 * import time. They are derived per instance now — see the component — because
 * the panel count is whatever `items` holds: five for the portfolio, four for
 * the products.
 *
 * Geometry holds at both counts. Adjacent panels intersect unless
 * radius > (w/2) / tan(180/N), which is 0.69x the panel width at five panels
 * and 0.5x at four. At --w: 460px that is 317px and 230px respectively,
 * against a --radius of 480px.
 */

/*
 * How fast it turns, in degrees per second. A full revolution in 28s, each
 * panel at the front for 5.5 of them.
 *
 * This has been raised twice — 4.5, then 9, now 13 — and the first two both
 * read as slow. Worth noting why, because the number was never the whole
 * story: a panel that is only fully lit at one instant feels sluggish however
 * fast the cylinder turns, because most of what you see is mid-fade. PLATEAU
 * below is the other half of the fix, and it is widened here to buy back the
 * reading time that the extra speed costs.
 */
const BASE_SPEED = 13;

/*
 * Scroll adds to that speed rather than setting it. Capped, because a fling
 * on a trackpad can report thousands of pixels in one frame, and DECAY is how
 * fast the boost bleeds back to nothing once scrolling stops.
 */
const SCROLL_GAIN = 0.05;
const SCROLL_CAP = 22;
const DECAY = 2.2;

// A slow tilt on X, so the cylinder is never quite side-on.
const TILT_DEG = 1.6;
const TILT_MS = 13000;

/*
 * How much of the gap to the next panel the front one stays FULLY active
 * across, either side. 0.42 of the step — +/-30deg at five panels — so a
 * panel arrives, holds its full state for about 4.7 seconds, then hands over.
 * Fewer panels means a wider step, so each one holds for correspondingly
 * longer, which is the right behaviour: there is less to come.
 *
 * Without this the active state peaked at exactly one instant and every panel
 * was permanently mid-fade, which is what "the headings get hidden" was.
 *
 * Widened from 0.34 alongside the speed increase. At 13deg/s a 0.34 plateau
 * would hold for only 3.8s, and the point of going faster was to feel livelier
 * rather than to leave less time to read.
 */
const PLATEAU = 0.42;

const mod = (n, m) => ((n % m) + m) % m;
// Shortest signed distance between two angles, in degrees: -180..180.
const shortestDelta = (a, b) => mod(a - b + 180, 360) - 180;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function PortfolioCylinder({
  title = 'Custom Software Portfolio',
  subtitle = 'Real systems built for healthcare, education, operations, marketing and digital experiences.',
  items = DEFAULT_ITEMS,
}) {
  // Panel count and the angle between neighbours, per instance. Both were
  // module constants; everything downstream already read them as values.
  const N = items.length;
  const STEP = 360 / N;

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const panelRefs = useRef([]);
  const detailRefs = useRef([]);

  // Where the cylinder is pointing, in degrees. Not state: it changes every
  // frame and nothing in React needs to know.
  const angle = useRef(0);
  const boost = useRef(0);
  const front = useRef(-1);

  /*
   * Set only while the pointer is on a CTA, or focus is inside one.
   *
   * This used to be set by hovering the whole section, which stopped the
   * cylinder dead the moment the mouse crossed it — the "gets stuck" this
   * looked like. The section no longer reacts to being hovered at all.
   *
   * The CTA still does, and that is not the same bug: it is a link travelling
   * roughly 75px a second across the screen, and a link that slides out from
   * under the cursor as you reach for it is a link nobody clicks. Landing on
   * it stops it. A deliberate local pause, not the section freezing as you
   * approach it.
   */
  const held = useRef(false);

  // Turn to face a given panel. Used by focus, so a keyboard can reach a CTA
  // that is currently facing away.
  const faceIndex = useCallback((i) => {
    angle.current += shortestDelta(i * STEP, angle.current);
  }, [STEP]);

  useEffect(() => {
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (!stage || !section) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    /*
     * Reduced motion: no rotation, no loop, no listeners. The stylesheet
     * flattens the cylinder into a plain stacked list at the same query, so
     * all five categories are simply present and readable. Everything is
     * written fully active once, so nothing is left at opacity 0.
     */
    if (reduced) {
      panelRefs.current.forEach((el) => {
        if (!el) return;
        el.style.opacity = '1';
        el.style.setProperty('--s', '1');
        el.dataset.front = 'true';
      });
      detailRefs.current.forEach((el) => {
        if (el) el.style.opacity = '1';
      });
      return;
    }

    let raf = 0;
    let last = 0;

    const onScroll = () => {
      const y = window.scrollY;
      const dy = Math.abs(y - (onScroll.prev ?? y));
      onScroll.prev = y;
      boost.current = Math.min(boost.current + dy * SCROLL_GAIN, SCROLL_CAP);
    };
    onScroll.prev = window.scrollY;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      // Clamped: a backgrounded tab resumes with a huge delta, which would
      // otherwise snap the cylinder round several turns in one frame.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      boost.current *= Math.exp(-DECAY * dt);
      if (!held.current) {
        angle.current = mod(angle.current + (BASE_SPEED + boost.current) * dt, 360);
      }

      const tilt = Math.sin((now / TILT_MS) * Math.PI * 2) * TILT_DEG;
      /*
       * translateZ first, so the whole cylinder is pushed back by its own
       * radius before it is turned — the note at the top of this file is
       * about this line. `var(--radius)` rather than a number, because the
       * radius is a media query in the stylesheet and reading it back into JS
       * would mean re-reading it on every resize.
       */
      stage.style.transform =
        'translateZ(calc(var(--radius) * -1)) ' +
        `rotateX(${tilt.toFixed(3)}deg) rotateY(${(-angle.current).toFixed(3)}deg)`;

      // Which panel owns pointer events. Changes five times a revolution, so
      // the attribute write is gated on it actually changing.
      const nearest = mod(Math.round(angle.current / STEP), N);
      if (nearest !== front.current) {
        const prev = panelRefs.current[front.current];
        if (prev) prev.dataset.front = 'false';
        const next = panelRefs.current[nearest];
        if (next) next.dataset.front = 'true';
        front.current = nearest;
      }

      for (let i = 0; i < N; i += 1) {
        const el = panelRefs.current[i];
        if (!el) continue;

        // Distance from dead ahead, as a fraction of the gap to the next
        // panel: 0 facing the viewer, 1 where its neighbour stands.
        const off = Math.abs(shortestDelta(i * STEP, angle.current)) / STEP;
        // Flat 1 across the plateau, then down to 0 at the neighbour.
        const a = clamp01((1 - off) / (1 - PLATEAU));

        // Steep, so a panel turned away is a ghost rather than a slab of
        // foreshortened text competing with the one being read.
        el.style.opacity = (0.04 + 0.96 * a ** 2.4).toFixed(3);
        el.style.setProperty('--s', (0.94 + 0.06 * a).toFixed(4));

        const detail = detailRefs.current[i];
        if (detail) {
          const d = clamp01((a - 0.55) / 0.45);
          detail.style.opacity = d.toFixed(3);
          detail.style.transform = `translateY(${((1 - d) * 10).toFixed(2)}px)`;
        }
      }
    };

    /*
     * The loop only runs while the section is on screen. /products already
     * carries a pinned scroll stage and the site's WebGL particle field, and
     * all three want the same main thread; a cylinder turning behind three
     * screens of other content is work nobody can see. `last` is cleared on
     * the way back in so the first frame after resuming computes a normal
     * delta rather than one covering the whole absence.
     */
    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      // A little early, so it is already turning by the time it is looked at.
      { rootMargin: '200px 0px' }
    );
    io.observe(section);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      stop();
      window.removeEventListener('scroll', onScroll);
    };
    // N and STEP are derived from `items`, so the loop is rebuilt if the
    // caller ever swaps the content out. In practice both bands mount with a
    // fixed list and this runs once.
  }, [N, STEP]);

  const hold = () => { held.current = true; };
  const release = () => { held.current = false; };

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="portfolio-title">
      <div className={styles.head}>
        <h2 id="portfolio-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.sub}>{subtitle}</p>
      </div>

      {/* The camera. perspective lives here so that rotating the stage inside
          it does not rotate the vanishing point with it. */}
      <div className={styles.viewport}>
        <div ref={stageRef} className={styles.stage}>
          {items.map((item, i) => (
            <article
              key={item.id}
              ref={(el) => { panelRefs.current[i] = el; }}
              className={styles.panel}
              // Panel 0 starts dead ahead, so it owns pointer events until
              // the loop's first tick says otherwise.
              data-front={i === 0 ? 'true' : 'false'}
              // The panel's own place on the cylinder. Static: the stage
              // turns, the panels stay where they were mounted.
              style={{ '--i': i, '--step': `${STEP}deg` }}
            >
              <h3 className={styles.category}>{item.name}</h3>

              <div
                ref={(el) => { detailRefs.current[i] = el; }}
                className={styles.detail}
              >
                <ul role="list" className={styles.projects}>
                  {item.lines.map((line) => (
                    <li key={line.name} className={styles.project}>
                      <span className={styles.projectName}>{line.name}</span>
                      {line.note && (
                        <span className={styles.projectNote}>{line.note}</span>
                      )}
                    </li>
                  ))}
                </ul>

                {item.cta && (
                  <Link
                    href={item.cta.href}
                    className={styles.cta}
                    // Local pause, so the link stops travelling once you are
                    // on it. The section itself never pauses.
                    onMouseEnter={hold}
                    onMouseLeave={release}
                    // A CTA facing away is invisible but still tabbable, so
                    // focusing it turns the cylinder to face it.
                    onFocus={() => { faceIndex(i); hold(); }}
                    onBlur={release}
                  >
                    {item.cta.label}
                    <span aria-hidden="true" className={styles.arrow}>→</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
