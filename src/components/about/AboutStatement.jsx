import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { SocialIcon } from '@/components/ui/icons';
import { COMPANY } from '@/data/company';
import { FOUNDER } from '@/data/team';
import { SOCIALS } from '@/data/socials';
import styles from './about-statement.module.css';

/**
 * The closing block: one statement, one quote, one row of links.
 *
 * All three sit in a single column against the oversized wordmark, rather
 * than the statement being set against it and the quote running full width
 * underneath. One column reads as one voice — the company's line, then the
 * founder's, then where to find him — where the split version read as two
 * separate sections that happened to share a heading.
 *
 * ── what this deliberately does not say ──────────────────────────────────
 * This section has been cut twice: a second explanatory paragraph about
 * spreadsheets and handoffs, both of the founder's statement paragraphs, the
 * "Previously" pills for Procter & Gamble and Reckitt Benckiser, and the
 * "From the founder" label above the quote.
 *
 * None of it was wrong; there was just too much of it for a page that has
 * already made its case. By the time a reader arrives here the hero has named
 * him, the figures have said what the company has done, and the roster has
 * shown who does it. What is left to say is what the work is *for*, and the
 * quote says that in one line.
 *
 * The credibility that mattered is still here, in the attribution — his name
 * and his title under his own words. The "14+ years" that used to sit in the
 * removed paragraph is not repeated: it is the first figure in the stat band,
 * which now sits directly under the hero, and data/team.js warns that the
 * number appearing twice on one page is how the two drift apart.
 *
 * FOUNDER.statement and FOUNDER.brands are no longer rendered anywhere. They
 * stay in data/team.js on purpose — lib/chat/knowledge.js indexes every
 * export in data/, so the chatbot can still answer on them.
 *
 * The wordmark is decoration and is marked aria-hidden: the section sits on a
 * page titled About, and announcing "ABOUT" again before the statement is
 * noise. It is also why the column sits to the right — the two overlap by
 * design, and the word runs behind the type rather than beside it.
 */
export default function AboutStatement() {
  return (
    <section className={styles.section} aria-labelledby="about-statement">
      <h2 id="about-statement" className="sr-only">
        About {COMPANY.name}
      </h2>

      <div className={styles.inner}>
        <span className={styles.wordmark} aria-hidden="true">
          About
        </span>

        <div className={styles.copy}>
          <Reveal y={18} duration={700}>
            <p className={styles.lead}>{COMPANY.blurb}</p>
          </Reveal>

          <Reveal y={14} duration={650} delay={120}>
            <figure className={styles.quote}>
              <blockquote className={styles.quoteText}>{FOUNDER.quote}</blockquote>
              <figcaption className={styles.by}>
                <span className={styles.byName}>{FOUNDER.name}</span>
                <span className={styles.byRole}>{FOUNDER.title}</span>
              </figcaption>
            </figure>
          </Reveal>

          <Reveal y={10} duration={600} delay={220}>
            <ul role="list" className={styles.socials}>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    target={s.href.startsWith('http') ? '_blank' : undefined}
                    rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className={styles.social}
                  >
                    <SocialIcon path={s.path} className="w-4 h-4" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
