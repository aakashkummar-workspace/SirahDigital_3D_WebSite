import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { COMPANY_STATS } from '@/data/company';
import styles from './stat-band.module.css';

/*
 * Three figures on one plate.
 *
 * The rest of the site is type over the background with nothing behind it.
 * This block is the exception on purpose: it is the only place a visitor is
 * asked to take three unrelated numbers in at a glance, and a plate is what
 * makes them read as one statement rather than three floating claims. The
 * plate is a 4%-white wash with a single accent bloom behind it — no card
 * shadow, no solid fill, so the site background still shows through it.
 *
 * Server component. Reveal is the only client leaf.
 *
 * Reusable: it takes its data from COMPANY_STATS by default but accepts a
 * `stats` prop, so the homepage can carry the same band without a second
 * component being written for it.
 */
export default function StatBand({ stats = COMPANY_STATS, className = '' }) {
  return (
    <section
      aria-label="Sirah Digital in numbers"
      className={`mx-auto w-full max-w-[1160px] px-6 ${className}`}
    >
      <Reveal y={16} duration={650}>
        <div className={styles.plate}>
          <ul role="list" className={styles.grid}>
            {stats.map((stat, i) => (
              <li key={stat.label} className={styles.cell}>
                {/* The stagger is per figure, not per plate — the numbers
                    land one after another as the band arrives. */}
                <Reveal y={12} duration={600} delay={120 + i * 110}>
                  <span className={styles.value}>{stat.value}</span>
                  <span className={styles.label}>{stat.label}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
