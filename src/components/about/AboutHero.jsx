import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { FOUNDER } from '@/data/team';
import { founderHero } from '@/lib/founderImages';
import styles from './about-hero.module.css';

import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
/**
 * The About page's opening: a full-bleed photograph with the headline on it.
 *
 * ── the image is a background, not an <img> ──────────────────────────────
 * It is decoration behind type, carrying nothing the copy does not already
 * say, so it takes no alt text and no layout slot. That also lets the scrim
 * be another background layer in the same rule rather than an absolutely
 * positioned sibling, and lets the stylesheet swap in a smaller file on a
 * phone with a media query — neither of which an <img> would allow as
 * cleanly.
 *
 * The two custom properties are the only thing the component tells the
 * stylesheet about the image. Which file, and nothing else: where it sits,
 * how it is cropped and how hard it is scrimmed are all decisions made
 * against the frame itself, and they live in the CSS next to the measurements
 * that justify them.
 */
export default function AboutHero() {
  const hero = founderHero();

  return (
    <section className={styles.bleed} aria-labelledby="about-hero-title">
      <div
        className={`${styles.stage} ${hero.wide ? '' : styles.stageTight}`}
        style={
          hero.src
            ? {
                '--hero-image': `url(${hero.src})`,
                '--hero-image-sm': `url(${hero.small})`,
              }
            : undefined
        }
        data-has-image={hero.src ? 'true' : 'false'}
      >
        <div className={styles.inner}>
          <div className={styles.copy}>
            <Reveal y={18} duration={700}>
              {/* His title, not "About Sirah Digital" — the page is already
                  called that, and this is the line that says who the man in
                  the photograph is. */}
              <span className={styles.eyebrow}>{FOUNDER.title}</span>
            </Reveal>

            <Reveal y={22} duration={750} delay={90}>
              <h1 id="about-hero-title" className={styles.title}>
                Scale your business with{' '}
                <span className={styles.name}>{FOUNDER.name}</span>
              </h1>
            </Reveal>

            <Reveal y={16} duration={700} delay={180}>
              <p className={styles.standfirst}>
                Helping businesses move from manual operations to intelligent
                automation - and to the hours, clarity and scale that follow.
              </p>
            </Reveal>

            <Reveal y={14} duration={650} delay={260}>
              <div className={styles.actions}>
                <PrimaryButton href="/contact" arrow>
                  Get in touch
                </PrimaryButton>
                {/* Outlined rather than the usual text link: a bare link over
                    a photograph has no edge and no contrast guarantee. */}
                <SecondaryButton href="/services">
                  Explore services
                </SecondaryButton>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
