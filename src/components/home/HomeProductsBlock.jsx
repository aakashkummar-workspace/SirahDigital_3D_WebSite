import React from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { HOME_PRODUCTS } from '@/data/products';
import { PRODUCT_DETAILS } from '@/data/productDetails';
import styles from './home-products.module.css';

/**
 * The products, as one row directly under the hero.
 *
 * ── how many across ──────────────────────────────────────────────────────
 * All of them, on one row, up to a cap of five — MAX_PER_ROW below. The count
 * is handed to the stylesheet twice, as `--cols` for the track list and as
 * `data-cols` for the row-edge rules, because nth-child() cannot take a
 * var(). Both come off the same number so they cannot disagree.
 *
 * A sixth product would wrap onto a second row rather than making the first
 * one narrower; the stylesheet draws that case correctly. Five is where the
 * columns get too narrow for a readable measure — the note in
 * home-products.module.css has the arithmetic.
 *
 * ── what was cut, and why ────────────────────────────────────────────────
 * This started as a bordered block with, per product, a "PRODUCT" eyebrow, a
 * name, a tagline, a two-line description and an "Explore <name> →" link.
 * That is five pieces of type in a column whose job is to make one name
 * memorable, and the name was competing with all the others.
 *
 * What is left is a numeral, the name, and two lines. The eyebrow said
 * "PRODUCT" once per product inside a section already headed Products, and the
 * "Explore" text went because the whole column is already the link — the
 * arrow is the affordance, and it moves on hover.
 *
 * The line under the name is data/products.js `description`, not the tagline
 * in productDetails.js. It was the tagline for a while, on the argument that
 * the tagline is the sentence written to stand on its own. True, but it
 * stands on its own by naming nothing: "Every call, accounted for" and "A
 * wellness OS for modern practices" tell a first-time reader which product
 * they would be clicking into and nothing about what it does. The
 * description is where the nouns are — Tamil and English, GTM measurement,
 * clients and programs and billing — and two lines of those is what makes a
 * row of names worth reading. The tagline still opens each product's own
 * page, where the name above it has already done that job.
 *
 * The surrounding plate went too. A border around columns that already have
 * rules between them is a second statement of the same boundary, and the
 * reference for this layout has no box at all — just the rules.
 *
 * ── the numeral ──────────────────────────────────────────────────────────
 * Large and very quiet: it is a counter, not a heading, and it exists to give
 * the eye somewhere to land before the name. aria-hidden, so the link's
 * accessible name is the product and its line rather than "01 Aura
 * Transcriber Every call…".
 */
// The widest a single row goes. Past this the columns are too narrow to carry
// a description without it turning into a spec table — see the note on the
// one-row tier in home-products.module.css, which has the measurements.
const MAX_PER_ROW = 5;

export default function HomeProductsBlock() {
  const cols = Math.min(HOME_PRODUCTS.length, MAX_PER_ROW);

  return (
    <section
      aria-labelledby="home-products-label"
      // Breathing room either side. It carried only a top pad before, so it
      // sat tight under the hero and ran straight into the client marquee.
      //
      // 1440 rather than the 1240 this ran at. The extra 200px is what makes
      // one row work: it is the difference between four columns at ~300px,
      // where every description breaks to three lines, and four at ~348px,
      // where they hold at two.
      className="section-alt relative mx-auto w-full max-w-[1440px] px-6 pt-20 pb-14 md:pt-28 md:pb-20"
    >
      <Reveal y={24} duration={600}>
        <h2 id="home-products-label" className={styles.label}>
          [ Products ]
        </h2>
      </Reveal>

      <Reveal y={24} duration={600} delay={80}>
        <div
          className={styles.block}
          data-cols={cols}
          style={{ '--cols': cols }}
        >
          {HOME_PRODUCTS.map((product, i) => {
            const detail = PRODUCT_DETAILS[product.slug];
            return (
              // The whole column is the link. A name that moves and an arrow
              // that slides are one gesture, so they belong to one target
              // rather than a card with a link buried in it.
              <Link key={product.id} href={product.href} className={styles.col}>
                <span className={styles.num} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <h3 className={styles.title}>{product.title}</h3>

                <p className={styles.desc}>
                  {product.description || detail?.tagline}
                </p>

                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
