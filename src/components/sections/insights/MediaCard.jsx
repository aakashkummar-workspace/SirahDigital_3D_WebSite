import React from 'react';
import CoverImage from './CoverImage';

/**
 * One card.
 *
 * Cover, then the title, then a description if the CMS carries one. Nothing
 * else: no category, no author, no date, no reading time.
 *
 * The cover is the card. It carries roughly nine tenths of the height, and the
 * single line beneath it is the only text on screen.
 *
 * This used to take a `kind` and render testimonials too. Those were removed
 * along with the second carousel, so the branch went with them.
 */

// Widths, not a grid: the track scrolls horizontally and the card after the
// last visible one has to be partly in view, which is the cue that the row
// continues. Roughly one card on a phone, one and a third on a tablet, and a
// little over two on a desktop — each leaving the next one peeking.
const WIDTH =
  'w-[86vw] sm:w-[72vw] lg:w-[46vw] xl:w-[42vw] max-w-[620px]';

export default function MediaCard({ item, tone = 0 }) {
  return (
    <li className={`shrink-0 snap-start ${WIDTH}`}>
      <a
        href={item.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="cta"
        className="interactive-hover group block transition-transform duration-500 ease-brand hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {/* the cover — the whole point of the card */}
        <div className="relative overflow-hidden rounded-[24px] bg-space-raised aspect-[16/10] transition-shadow duration-500 ease-brand group-hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,.8)]">
          <CoverImage src={item.cover} alt={item.coverAlt || ''} tone={tone} />
          {/* hairline, not a border: keeps the cover's edge readable against
              the page without drawing a box around every card */}
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/10"
          />

          {/*
           * Play button.
           *
           * Every card in this row opens a film on YouTube, and nothing on the
           * card said so — a cover and a caption reads as an article. This is
           * the one mark that makes it obvious before the click.
           *
           * Decoration, not a control: the whole card is already the <a>, so
           * this is aria-hidden and pointer-events-none. A real <button> here
           * would be a second tab stop to the same destination, and it would
           * swallow clicks meant for the card.
           *
           * The scale sits on the circle rather than on the wrapper so it
           * grows about its own centre while the cover behind it zooms.
           */}
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center pointer-events-none"
          >
            <span
              className="grid place-items-center w-16 h-16 rounded-full
                bg-black/45 backdrop-blur-sm ring-1 ring-white/40
                shadow-[0_8px_30px_-8px_rgba(0,0,0,.9)]
                transition-all duration-500 ease-brand
                group-hover:scale-[1.08] group-hover:bg-black/55 group-hover:ring-white/70
                motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            >
              {/* Nudged right by 2px: a triangle centred on its bounding box
                  looks left-of-centre inside a circle, because its mass sits
                  toward the flat edge. */}
              <svg viewBox="0 0 24 24" className="w-6 h-6 translate-x-[2px] fill-white">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
              </svg>
            </span>
          </span>
        </div>

        {/*
         * The only text on the card.
         *
         * Clamped at three lines, not two. These were headline fragments when
         * the clamp was written; they are now full sentences — the longest
         * runs 119 characters, which wraps to three at this measure and was
         * being cut mid-sentence with an ellipsis. Three lines fits every
         * current caption. A longer one will still truncate, which is the
         * intended behaviour: the clamp is what keeps one long title from
         * pushing its card taller than the rest of the row.
         */}
        <p className="mt-5 text-fluid-base font-semibold leading-snug text-white line-clamp-3">
          {item.title}
        </p>

        {/* The description, when the CMS carries one.
            Optional on purpose: most entries are a cover and a caption, and an
            empty paragraph would leave uneven gaps down the row. Two lines,
            dimmer and lighter than the title, so the hierarchy holds. */}
        {item.description ? (
          <p className="mt-2 text-fluid-sm leading-relaxed text-brand-muted/80 line-clamp-2">
            {item.description}
          </p>
        ) : null}
      </a>
    </li>
  );
}
