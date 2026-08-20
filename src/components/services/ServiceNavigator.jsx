"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SERVICE_EXPERIENCE } from '@/data/serviceExperience';

/**
 * The service navigator, in the three forms the design specifies:
 *
 *   rail     — desktop: pinned vertical list, one marker slides to the active
 *   progress — tablet: horizontal progress indicator
 *   chips    — mobile: swipeable chips
 *
 * One component rather than three, so the active/visited logic and the
 * keyboard handling exist once.
 *
 * No cards, no borders — state is carried by weight, colour and a rule.
 */

const RAIL_KEYS = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 };

// Height of the sliding marker, in px. Kept here because the offset maths
// needs to centre the marker against a row, so the two cannot drift apart.
const MARKER_H = 32;

export default function ServiceNavigator({ variant, active, onSelect, reduced = false }) {
  const listRef = useRef(null);
  const total = SERVICE_EXPERIENCE.length;

  // Keep the active chip in view as the visitor scrolls the page, without
  // yanking the whole window — only the rail scrolls.
  useEffect(() => {
    if (variant !== 'chips') return;
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [active, variant]);

  // Where the sliding marker sits. Measured from the active row rather than
  // computed as `index * rowHeight`: these labels wrap at narrower desktop
  // widths, so a fixed step multiplier drifts out of alignment the moment one
  // row becomes two lines. useLayoutEffect so the marker is never painted at
  // a stale offset for a frame.
  const [markerY, setMarkerY] = useState(0);
  useLayoutEffect(() => {
    if (variant !== 'rail') return undefined;
    const ol = listRef.current;
    if (!ol) return undefined;
    const measure = () => {
      const row = ol.querySelector(`[data-idx="${active}"]`);
      if (row) setMarkerY(row.offsetTop + (row.offsetHeight - MARKER_H) / 2);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    // Fires on the hidden→visible transition at `lg` as well as on reflow,
    // so the first desktop paint is measured rather than left at zero.
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, [active, variant]);

  const onKeyDown = (e) => {
    const dir = RAIL_KEYS[e.key];
    if (!dir) return;
    e.preventDefault();
    onSelect(Math.min(total - 1, Math.max(0, active + dir)));
  };

  /* ── Desktop: pinned vertical rail ─────────────────────────────────────
     The rows themselves never change appearance. All of the active-state
     signal is carried by one short bar sliding down the track — the same
     single-cue treatment as the reference. */
  if (variant === 'rail') {
    return (
      <nav aria-label="Services" onKeyDown={onKeyDown}>
        <p className="text-fluid-xs uppercase tracking-[0.3em] font-semibold text-ink/40 mb-5">
          Capabilities
        </p>
        <ol ref={listRef} className="space-y-1">
          {SERVICE_EXPERIENCE.map((s) => {
            const isActive = s.index === active;
            return (
              <li key={s.slug} data-idx={s.index}>
                <button
                  type="button"
                  onClick={() => onSelect(s.index)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group flex items-center gap-3 w-full text-left py-2 pl-3.5 border-l-2 transition-all duration-300 ${
                    isActive
                      ? 'border-brand-blue text-ink font-semibold'
                      : 'border-transparent text-ink/40 hover:text-ink/80 font-normal'
                  }`}
                >
                  <span
                    className={`font-mono text-xs shrink-0 transition-colors ${
                      isActive ? 'text-brand-blue font-bold' : 'text-ink/30 group-hover:text-ink/60'
                    }`}
                  >
                    {s.number}
                  </span>
                  <span className="block text-sm leading-snug">
                    {s.navLabel}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  /* ── Tablet: horizontal progress indicator ───────────────────────────── */
  if (variant === 'progress') {
    const current = SERVICE_EXPERIENCE[active];
    return (
      <nav aria-label="Services" onKeyDown={onKeyDown}>
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-fluid-sm font-bold text-ink">
            <span className="font-mono text-brand-blue mr-2">{current.number}</span>
            {current.navLabel}
          </p>
          <p className="text-fluid-xs font-mono text-ink/40 shrink-0">
            {current.number} / {String(total).padStart(2, '0')}
          </p>
        </div>
        {/* segmented bar — each segment is a jump target */}
        <ol className="mt-3 flex gap-1.5">
          {SERVICE_EXPERIENCE.map((s) => {
            const on = s.index === active;
            const visited = s.index < active;
            return (
              <li key={s.slug} className="flex-1">
                <button
                  type="button" data-cursor="nav"
                  onClick={() => onSelect(s.index)}
                  aria-label={`${s.number}. ${s.navLabel}`}
                  aria-current={on ? 'true' : undefined}
                  // The bar itself is 3px, but the hit area is a full 44px
                  // with the visible track centred inside it.
                  className="w-full min-h-[44px] flex items-center"
                >
                  <span
                    className="block w-full h-[3px] rounded-full transition-all duration-500 ease-brand"
                    style={{
                      background: on
                        ? 'var(--brand-blue)'
                        : visited
                          ? 'rgb(var(--c-muted) / .32)'
                          : 'rgb(var(--c-ink) / .1)',
                    }}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  /* ── Mobile: swipeable chips ─────────────────────────────────────────── */
  return (
    <nav aria-label="Services" onKeyDown={onKeyDown}>
      <ol
        ref={listRef}
        className="flex gap-2 overflow-x-auto no-scrollbar snap-x -mx-6 px-6 py-1"
      >
        {SERVICE_EXPERIENCE.map((s) => {
          const on = s.index === active;
          const visited = s.index < active;
          return (
            <li key={s.slug} className="snap-start shrink-0">
              <button
                type="button" data-cursor="nav"
                data-idx={s.index}
                onClick={() => onSelect(s.index)}
                aria-current={on ? 'true' : undefined}
                className="flex items-center gap-2 min-h-[44px] px-4 rounded-full whitespace-nowrap transition-all duration-400 ease-brand"
                style={{
                  background: on ? 'rgb(var(--c-blue) / .16)' : 'rgb(var(--c-ink) / .04)',
                  opacity: on ? 1 : visited ? 0.45 : 0.75,
                }}
              >
                <span className="font-mono text-fluid-xs" style={{ color: on ? 'var(--brand-blue)' : 'rgb(var(--c-ink) / .45)' }}>
                  {s.number}
                </span>
                <span
                  className="text-fluid-sm"
                  style={{ color: on ? 'rgb(var(--c-text))' : 'rgb(var(--c-muted))', fontWeight: on ? 700 : 500 }}
                >
                  {s.navLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
