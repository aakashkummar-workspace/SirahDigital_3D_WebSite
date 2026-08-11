"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ServiceNavigator from './ServiceNavigator';
import ServiceContent from './ServiceContent';
import { SERVICE_EXPERIENCE } from '@/data/serviceExperience';
import { useReducedMotion } from '@/hooks/useMediaQuery';

// The navbar detaches into a floating pill once you scroll — 12px down from
// the top, 74px tall including its border — so its bottom edge sits at 86px,
// not 72. Anything pinned under it has to clear that or it tucks behind the
// pill. Flush at exactly 86 rather than a few px below: a small gap between
// two fixed bars just lets a sliver of the page shimmer through as it
// scrolls. Keep in step with PILL_TOP in components/layout/Navbar.jsx.
const NAV_OFFSET = 86;
// Breathing room between the sticky navbar and the pinned rail. The reference
// layout pins its rail 224px down, but its header is far taller than our 72px
// navbar; this is the equivalent gap rather than the equivalent number.
const RAIL_OFFSET = NAV_OFFSET + 72;

export default function PinnedExperience() {
  const [active, setActive] = useState(0);
  const sectionRefs = useRef([]);
  const reduced = useReducedMotion();
  const jumping = useRef(false);

  const registerRef = useCallback((i) => (el) => { sectionRefs.current[i] = el; }, []);

  useEffect(() => {
    const els = sectionRefs.current.filter(Boolean);
    if (!els.length) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const ratios = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(Number(e.target.dataset.index), e.intersectionRatio));
        if (jumping.current) return;
        let best = -1;
        let bestRatio = 0;
        ratios.forEach((ratio, i) => {
          if (ratio > bestRatio) { bestRatio = ratio; best = i; }
        });
        if (best >= 0 && bestRatio > 0) setActive(best);
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1], rootMargin: '-25% 0px -30% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // `activeService` and its `accent` existed only to push the active
  // capability's colour to the shared particle field, so the background took
  // on the colour of whatever was being read. That background is gone, and
  // nothing else in this component consumed either value — so both are gone
  // with it, along with the STATE_ACCENT import.

  const goTo = useCallback((i) => {
    const el = sectionRefs.current[i];
    if (!el) return;
    setActive(i);
    jumping.current = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.clearTimeout(goTo._t);
    goTo._t = window.setTimeout(() => { jumping.current = false; }, 900);
  }, []);

  return (
    <div className="relative">
      {/* ── Mobile: swipeable chips, pinned under the navbar ────────────── */}
      <div
        className="md:hidden sticky z-30 bg-space/85 backdrop-blur-xl py-3"
        style={{ top: NAV_OFFSET }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <ServiceNavigator variant="chips" active={active} onSelect={goTo} reduced={reduced} />
        </div>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-full h-8 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(22,20,44,.85), rgba(22,20,44,0))' }}
        />
      </div>

      {/* ── Tablet: horizontal progress indicator ──────────── */}
      <div
        className="hidden md:block lg:hidden sticky z-30 bg-space/85 backdrop-blur-xl pt-4 pb-5"
        style={{ top: NAV_OFFSET }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <ServiceNavigator variant="progress" active={active} onSelect={goTo} reduced={reduced} />
        </div>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-full h-10 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(22,20,44,.85), rgba(22,20,44,0))' }}
        />
      </div>

      {/* ── Desktop: 2 columns (Pinned Navigation + Full Width Content) ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 xl:gap-16">

          {/* ── Desktop: pinned rail ─────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky" style={{ top: RAIL_OFFSET }}>
              <ServiceNavigator
                variant="rail"
                active={active}
                onSelect={goTo}
                reduced={reduced}
              />
            </div>
          </div>

          {/* ── Wide Scrolling content ──────────────────────────────────── */}
          <div className="w-full">
            {SERVICE_EXPERIENCE.map((service) => (
              <ServiceContent
                key={service.slug}
                service={service}
                active={service.index === active}
                registerRef={registerRef(service.index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
