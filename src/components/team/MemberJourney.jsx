import React from 'react';
import Reveal from '@/components/ui/Reveal';
import styles from './member-journey.module.css';

/*
 * A member's builds, threaded onto a serpentine line.
 *
 * The layout follows the reference supplied for this page: a curve running
 * down the middle, entries alternating either side of it, a dot where each
 * entry meets the curve.
 *
 * ── no numerals, deliberately ────────────────────────────────────────────
 * The reference numbers its entries 01 to 05 and this does not, because the
 * brief for these pages says not to. It is also the right call on its own
 * terms: the reference is numbering the *steps of a process*, where the order
 * is the meaning. Here the entries are the systems one person has built, and
 * numbering them would invent a ranking — a "01" against one client's platform
 * and "07" against another says something nobody intended.
 *
 * ── how the curve stays on the dots ──────────────────────────────────────
 * The path and the dots are generated from the same three constants, so they
 * cannot drift:
 *
 *   every entry gets one cubic segment, SEG units tall, bulging AMP to the
 *   side its card is on. For a cubic whose two control points share an x, the
 *   apex at t = 0.5 sits at CX + 0.75 * AMP — which is where the dot goes.
 *
 * The rail is stretched to the list's exact height with
 * preserveAspectRatio="none", so one segment always maps to one row however
 * tall the rows end up. That stretch would normally distort the stroke and
 * squash the dots into ellipses; the stroke is protected by
 * vector-effect="non-scaling-stroke", and the dots are DOM elements outside
 * the SVG rather than <circle>s inside it.
 */

// viewBox units. CX is the middle of the rail; AMP is how far the curve swings
// off it; SEG is one entry's share of the height.
const CX = 100;
const AMP = 62;
const SEG = 100;

// Where the apex of a segment lands, as a percentage across the rail. The
// dots are positioned with this, so it is derived rather than typed twice.
const APEX = ((CX + 0.75 * AMP) / (CX * 2)) * 100; // 73.25
const APEX_LEFT = 100 - APEX; // 26.75

function serpentine(count) {
  let d = `M ${CX} 0`;
  for (let i = 0; i < count; i += 1) {
    // Even entries sit right of the curve, odd ones left — so the curve
    // reaches toward whichever side the card is on.
    const dir = i % 2 === 0 ? 1 : -1;
    const y = i * SEG;
    const cp = CX + dir * AMP;
    d += ` C ${cp} ${y + SEG * 0.25}, ${cp} ${y + SEG * 0.75}, ${CX} ${y + SEG}`;
  }
  return d;
}

export default function MemberJourney({ projects }) {
  const count = projects.length;

  return (
    <div className={styles.journey} style={{ '--count': count }}>
      {/* Decoration. The list beside it carries every word. */}
      <div className={styles.rail} aria-hidden="true">
        <svg
          className={styles.curve}
          viewBox={`0 0 ${CX * 2} ${count * SEG}`}
          preserveAspectRatio="none"
        >
          <path
            className={styles.path}
            d={serpentine(count)}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {projects.map((project, i) => (
          <span
            key={project.name}
            className={styles.dot}
            style={{
              '--i': i,
              '--x': `${i % 2 === 0 ? APEX : APEX_LEFT}%`,
            }}
          />
        ))}
      </div>

      {/*
        * A ul, not an ol. The entries are what one person has built, in no
        * order that means anything — and an ol would announce a position to a
        * screen reader that the page deliberately does not show.
        */}
      <ul role="list" className={styles.list}>
        {projects.map((project, i) => (
          <li key={project.name} className={styles.item} style={{ '--i': i }}>
            <Reveal
              className={styles.cell}
              y={16}
              duration={650}
              delay={Math.min(i, 4) * 90}
            >
              <div className={styles.card}>
                <h3 className={styles.name}>
                  {project.name}
                  {project.wip && (
                    <span className={styles.wip}>In development</span>
                  )}
                </h3>
                <p className={styles.desc}>{project.desc}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
