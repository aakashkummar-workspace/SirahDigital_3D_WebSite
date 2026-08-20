"use client";
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import MediaCard from './MediaCard';
import ExploreMoreCard from './ExploreMoreCard';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/**
 * A horizontal row of cards.
 *
 * The scrolling is the browser's own — overflow plus scroll snapping — not a
 * transform driven by React. That gives trackpad, touch and shift-wheel
 * gestures for free, keeps the arrows and the gesture in perfect agreement
 * because there is only one source of truth, and means an interrupted scroll
 * never leaves the row stranded mid-card.
 *
 * The arrows sit outside the cards, vertically centred on the covers, and
 * only appear once there is a gutter to put them in. Below that the row is a
 * swipe, which is the expected gesture on touch anyway; the cards are links,
 * so a keyboard still reaches every one of them by tabbing and the row
 * scrolls to follow focus.
 */

// Matches the `gap-7` on the track. One constant so a click always advances by
// exactly one card and can never drift out of step with the layout.
const GAP = 28;

function ArrowButton({ side, onClick, disabled, label }) {
  const isLeft = side === 'left';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-cursor="nav"
      className={`hidden lg:grid absolute top-[42%] -translate-y-1/2 z-10 place-items-center
        w-12 h-12 rounded-full border border-white/12 bg-space-deep/80 text-white/70
        transition-all duration-300 ease-brand
        hover:border-white/30 hover:text-white
        disabled:opacity-0 disabled:pointer-events-none
        ${isLeft ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d={isLeft ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function MediaCarousel({ title, items, exploreUrl }) {
  const trackRef = useRef(null);
  const reduced = useReducedMotion();
  const headingId = `carousel-${useId().replace(/:/g, '')}`;
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    // 2px of slack: fractional widths mean scrollLeft rarely lands exactly on
    // the maximum, and without it the right arrow never disables.
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    // The card widths are in vw, so a resize changes how many fit and whether
    // the row can scroll at all.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', sync);
      ro?.disconnect();
    };
  }, [sync]);

  const step = useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild;
    const amount = card ? card.offsetWidth + GAP : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: reduced ? 'auto' : 'smooth' });
  }, [reduced]);

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="text-fluid-xl font-semibold tracking-tight text-white">
        {title}
      </h3>

      <div className="relative mt-8 md:mt-10">
        <ArrowButton side="left" onClick={() => step(-1)} disabled={atStart} label={`Scroll ${title} backward`} />
        <ArrowButton side="right" onClick={() => step(1)} disabled={atEnd} label={`Scroll ${title} forward`} />

        {/* py-5 is not decoration: overflow-x forces the cross axis to scroll
            too, so without it the hover lift and the card shadow are clipped
            off at the top and bottom of the track. */}
        <ul
          ref={trackRef}
          role="list"
          className="flex gap-7 overflow-x-auto no-scrollbar snap-x snap-mandatory py-5"
        >
          {items.map((item, i) => (
            <MediaCard key={item.id} item={item} tone={i} />
          ))}
          {/* last in the track, so it is what scrolling right arrives at */}
          {exploreUrl && <ExploreMoreCard href={exploreUrl} />}
        </ul>
      </div>
    </section>
  );
}
