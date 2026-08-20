import React from 'react';
import Avatar from '@/components/ui/Avatar';
import styles from './client-review.module.css';

/*
 * A client's word on one member, as the card in the supplied reference.
 *
 * The reference is a testimonial panel: a rounded, translucent card; the
 * subject's picture in a rounded frame straddling the card's left edge, half
 * in and half out; the quote and a five-star rating to the right of it; an
 * oversized quotation mark in the top-right corner.
 *
 * ── the overhang ─────────────────────────────────────────────────────────
 * The frame hangs 60% of its own width outside the card. That is one number,
 * --overhang, and it is used twice: once to pull the frame left, once to pad
 * the wrapper by the same amount so the picture lands on the page's left
 * margin instead of off the edge of it. The two can't drift apart.
 *
 * The frame is opaque, so the card's border simply passes behind it and reads
 * as interrupted — which is what the reference shows.
 *
 * ── the picture is 3:4, not the reference's 1:2 ──────────────────────────
 * The reference frames a pair of trousers and is twice as tall as it is wide.
 * These are faces. A 1:2 crop of a headshot takes the sides off it, so the
 * frame is 3:4 — the same rounded portrait shape the page already used, at
 * the reference's proportions rather than its subject's.
 */

// One star, drawn rather than typed: the ★ glyph is a different weight and
// sits on a different baseline in every font that has it.
function Star() {
  return (
    <svg className={styles.star} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.51 6.16 20.57l1.11-6.5-4.72-4.6 6.53-.95z" />
    </svg>
  );
}

export default function ClientReview({ member }) {
  if (!member?.review) return null;

  return (
    <div className={styles.wrap}>
      <figure className={styles.card}>
        {/* Decorative. The quote is already marked up as one below. */}
        <span className={styles.mark} aria-hidden="true">&rdquo;</span>

        <div className={`${styles.frame} group`}>
          <Avatar
            src={member.photo}
            name={member.name}
            textClass="text-3xl"
            className={styles.photo}
          />
        </div>

        <div className={styles.body}>
          <blockquote className={styles.quote}>
            <p>{member.review}</p>
          </blockquote>

          {/*
            * role="img" with a label, so this is announced once as "Rated 5
            * out of 5" rather than as five unexplained graphics.
            */}
          <div className={styles.stars} role="img" aria-label="Rated 5 out of 5">
            <Star />
            <Star />
            <Star />
            <Star />
            <Star />
          </div>
        </div>
      </figure>
    </div>
  );
}
