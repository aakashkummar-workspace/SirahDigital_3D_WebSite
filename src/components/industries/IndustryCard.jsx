import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StepFlow from '@/components/ui/StepFlow';
import { INDUSTRY_CARDS } from '@/data/industryCards';

/*
 * One sector in the industries grid.
 *
 * This replaces the photographic tile the page used to be built from. The
 * change is the point of the redesign: twelve edge-to-edge photographs, each
 * sourced differently, read as a stock gallery, and a company that sells
 * automation should be showing workflows instead. So the card is typographic
 * — name, one line, the stages, an action — and the photograph is demoted to
 * a texture behind it.
 *
 * ── the image ────────────────────────────────────────────────────────────
 * Kept, not deleted: the files exist and the detail pages still use them. But
 * at 9% opacity and fully desaturated, one consistent treatment across all
 * twelve, it is a grain in the surface rather than a picture. That is what
 * makes the set read as one system — the photographs no longer differ from
 * each other in any way the eye can act on.
 *
 * ── hierarchy ────────────────────────────────────────────────────────────
 * Title, then blurb, then flow, then action, in descending weight. The flow
 * is deliberately the quietest thing that still reads: it is the page's
 * visual language, not its message.
 *
 * Server component. The card's whole interaction is CSS (`.ind-card` in
 * globals.css) and its entrance belongs to the grid's Reveal, so there is
 * nothing here to hydrate.
 */
export default function IndustryCard({ industry }) {
  const card = INDUSTRY_CARDS[industry.slug];

  return (
    <Link
      href={`/industries/${industry.slug}`}
      aria-label={`${industry.title} - explore`}
      className="ind-card group relative flex h-full w-full flex-col overflow-hidden rounded-[14px] border p-7 sm:p-8"
    >
      {industry.image && (
        <Image
          src={industry.image}
          alt=""
          aria-hidden="true"
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="ind-card__media object-cover"
        />
      )}

      {/* Everything below sits above the texture. */}
      <div className="relative">
        <h2 className="text-[1.375rem] font-semibold leading-[1.25] tracking-[-0.015em] text-ink">
          {industry.title}
        </h2>

        {card && (
          <p className="mt-3 text-[0.9375rem] leading-[1.6] text-brand-muted/70">
            {card.blurb}
          </p>
        )}
      </div>

      {card && <StepFlow steps={card.flow} className="relative mt-7" />}

      {/* mt-auto pins the action to the bottom edge, so a row of cards has
          its Explore links on one line however differently the blurbs and
          flows above them wrap. */}
      <span className="ind-card__go relative mt-auto flex items-center gap-2 pt-7 text-[0.8125rem] font-medium text-ink/60">
        Explore
        <span aria-hidden="true" className="ind-card__go-arrow">
          →
        </span>
      </span>
    </Link>
  );
}
