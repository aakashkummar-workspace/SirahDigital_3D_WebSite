import React from 'react';

/**
 * The tile that closes the row.
 *
 * With only three films in the row, scrolling right used to end on empty
 * track — the gesture worked but arrived nowhere, which reads as a loading
 * failure rather than the end of the list. This is what the scroll now lands
 * on: one destination, the channel.
 *
 * It is deliberately not a card. A fourth cover-shaped tile would be read as a
 * fourth film and its blank frame as a missing image, so this keeps the
 * covers' height and radius — it has to line up with them — and drops
 * everything that makes a cover look like a photograph. What is left is a
 * hairline, an arrow and a label on the page's own background.
 *
 * Narrower than a card, too: at the end of a row a full-width tile suggests
 * there is more behind it, and there isn't.
 *
 * The height is taken from the row rather than from an aspect ratio. A 16/10
 * box at this width would come out barely half as tall as the covers beside
 * it and read as a stub, so the frame stretches: the `li` is a flex row, the
 * link stretches to the row's height, and the frame is the part that grows.
 * `min-h` only matters if this tile is ever the only thing in the track.
 */

const WIDTH = 'w-[62vw] sm:w-[46vw] lg:w-[26vw] xl:w-[22vw] max-w-[300px]';

export default function ExploreMoreCard({ href, label = 'Explore More' }) {
  return (
    <li className={`shrink-0 snap-start flex ${WIDTH}`}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="cta"
        className="interactive-hover group flex w-full flex-col transition-transform duration-500 ease-brand hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div
          className="relative flex-1 min-h-[180px] grid place-items-center rounded-[24px]
            border border-dashed border-white/15 bg-white/[0.02]
            transition-colors duration-500 ease-brand
            group-hover:border-white/30 group-hover:bg-white/[0.04]"
        >
          <span
            aria-hidden="true"
            className="grid place-items-center w-14 h-14 rounded-full border border-white/20
              text-white/70 transition-all duration-500 ease-brand
              group-hover:border-white/40 group-hover:text-white group-hover:scale-105
              motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        {/* sits on the same baseline as the card titles beside it */}
        <p className="mt-5 text-fluid-base font-semibold leading-snug text-white">
          {label}
          <span
            aria-hidden="true"
            className="inline-block ml-2 transition-transform duration-500 ease-brand group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          >
            →
          </span>
        </p>
        <p className="mt-2 text-fluid-xs text-white/45">Watch the full channel on YouTube</p>
      </a>
    </li>
  );
}
