"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ServiceNavigator from './ServiceNavigator';
import ServiceContent from './ServiceContent';
import VisualizationContainer from './VisualizationContainer';
import { SERVICE_EXPERIENCE } from '@/data/serviceExperience';
import { STATE_ACCENT } from './VisualizationStates';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { BACKGROUND_TINT_EVENT } from '@/components/three/SiteBackground';

/**
 * The core of the page: pinned navigation, scrolling content, and one
 * persistent visualization that morphs between capabilities.
 *
 * A single IntersectionObserver decides which capability is active. Alongside
 * it a rAF-throttled scroll listener writes a continuous 0-1 progress value —
 * used by the navigation rail so its fill tracks the scroll rather than
 * stepping once per capability. Progress lives in a ref and is pushed to the
 * rail through a CSS custom property and a low-frequency state update, so
 * scrolling does not re-render the ten mounted sections.
 *
 * Layout per breakpoint — three genuinely different arrangements:
 *
 *   mobile  chips pinned under the navbar; each service renders its own
 *           visualization between its heading and description
 *   tablet  horizontal progress indicator with the visualization pinned
 *           above the content as a banner
 *   desktop three columns — navigation | content | visualization. The visual
 *           column is deliberately the widest: the design calls for roughly
 *           40% text to 60% visual, so the page reads technology-first.
 */

// Navbar is 72px; the pinned bar sits directly beneath it.
const NAV_OFFSET = 72;

export default function PinnedExperience() {
  const [active, setActive] = useState(0);
  const [railProgress, setRailProgress] = useState(0);
  const sectionRefs = useRef([]);
  const scopeRef = useRef(null);
  const vizRef = useRef(null);
  const reduced = useReducedMotion();
  // While a click-to-jump scroll is in flight, ignore the observer so the
  // navigator does not flicker through every section on the way.
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
      // The middle band decides — a section counts as active once it owns the
      // centre of the viewport, not the moment its top edge appears.
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1], rootMargin: '-25% 0px -30% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* Continuous scroll progress for the rail, plus a little parallax on the
     visualization so the three depth layers — particles behind, visualization
     in the middle, type in front — separate as the page moves. */
  useEffect(() => {
    if (reduced) { setRailProgress(1); return undefined; }
    let frame = 0;
    let last = -1;
    const update = () => {
      frame = 0;
      const el = scopeRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const raw = span > 0 ? (-r.top) / span : 0;
      const p = Math.min(1, Math.max(0, raw));
      // Only re-render when the rail would visibly change.
      const rounded = Math.round(p * 100) / 100;
      if (rounded !== last) { last = rounded; setRailProgress(rounded); }
      if (vizRef.current) {
        vizRef.current.style.transform = `translate3d(0, ${(p - 0.5) * -26}px, 0)`;
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  const activeService = SERVICE_EXPERIENCE[active] ?? SERVICE_EXPERIENCE[0];
  const accent = STATE_ACCENT[activeService.visual] || '#22D3EE';

  /* Tell the shared particle field which capability is being read. It eases
     its colour toward this accent and swells briefly on each change, so the
     background belongs to the active capability instead of sitting behind it.
     Released on unmount so other routes get the neutral field back. */
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(BACKGROUND_TINT_EVENT, { detail: { accent, energy: reduced ? 0 : 1 } })
    );
  }, [accent, reduced]);
  useEffect(() => () => {
    window.dispatchEvent(new CustomEvent(BACKGROUND_TINT_EVENT, { detail: null }));
  }, []);

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
    <div className="relative" ref={scopeRef}>
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

      {/* ── Tablet: horizontal progress + banner visualization ──────────── */}
      <div
        className="hidden md:block lg:hidden sticky z-30 bg-space/85 backdrop-blur-xl pt-4 pb-5"
        style={{ top: NAV_OFFSET }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <ServiceNavigator variant="progress" active={active} onSelect={goTo} progress={railProgress} reduced={reduced} />
          <VisualizationContainer state={activeService.visual} variant="banner" className="mt-4" run />
        </div>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-full h-10 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(22,20,44,.85), rgba(22,20,44,0))' }}
        />
      </div>

      {/* max-w-7xl only for this section: the 40/60 split needs the extra room,
          and squeezing it into 6xl would leave the copy column unreadable. */}
      <div className="max-w-7xl mx-auto px-6">
        {/* 224px is the narrowest the rail can be before "Workflow Automation"
            wraps to two lines. The remaining space still splits ~40/60 between
            copy and visual, which is the ratio the design asks for. */}
        <div className="lg:grid lg:grid-cols-[224px_minmax(0,0.92fr)_minmax(0,1.38fr)] lg:gap-8 xl:gap-12">

          {/* ── Desktop: pinned rail ─────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky" style={{ top: NAV_OFFSET + 48 }}>
              <ServiceNavigator
                variant="rail"
                active={active}
                onSelect={goTo}
                progress={railProgress}
                reduced={reduced}
              />
            </div>
          </div>

          {/* ── Scrolling content, every breakpoint ──────────────────────── */}
          <div>
            {SERVICE_EXPERIENCE.map((service) => (
              <ServiceContent
                key={service.slug}
                service={service}
                active={service.index === active}
                registerRef={registerRef(service.index)}
              />
            ))}
          </div>

          {/* ── Desktop: pinned visualization ────────────────────────────── */}
          <div className="hidden lg:block">
            <div
              className="sticky flex items-center"
              style={{ top: NAV_OFFSET + 40, height: `calc(100vh - ${NAV_OFFSET + 80}px)` }}
            >
              <div ref={vizRef} className="w-full will-change-transform">
                <VisualizationContainer state={activeService.visual} variant="pinned" run />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
