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
        <p className="text-fluid-xs uppercase tracking-[0.3em] font-semibold text-white/35 mb-7">
          Capabilities
        </p>
        {/* The track and marker live outside the <ol>, not inside it. Two
            reasons: only <li> is valid as a child of <ol>, and `space-y-1`
            targets every child after the first — which silently added a 4px
            top margin to the absolutely-positioned marker and pushed it off
            the row it was supposed to sit against. */}
        <div className="relative">
          {/* the track the marker runs down */}
          <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-px bg-white/10" />
          {/* the marker — the whole of the active state */}
          <span
            aria-hidden="true"
            className="absolute top-0"
            style={{
              left: '-0.5px',
              width: 2,
              height: MARKER_H,
              background: '#22D3EE',
              transform: `translateY(${markerY}px)`,
              transition: reduced ? 'none' : 'transform 320ms cubic-bezier(.22,.61,.36,1)',
            }}
          />
          <ol ref={listRef} className="space-y-1">
            {SERVICE_EXPERIENCE.map((s) => (
              <li key={s.slug} data-idx={s.index}>
                <button
                  type="button"
                  onClick={() => onSelect(s.index)}
                  aria-current={s.index === active ? 'true' : undefined}
                  data-cursor="nav"
                  className="interactive-hover group flex items-baseline gap-3 w-full text-left pl-5 pr-2 min-h-[44px]"
                >
                  <span className="font-mono text-fluid-xs shrink-0 text-white/40 transition-colors duration-300 group-hover:text-brand-cyan">
                    {s.number}
                  </span>
                  <span className="block text-fluid-sm leading-tight font-medium text-brand-muted transition-colors duration-300 group-hover:text-white">
                    {s.navLabel}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    );
  }

  /* ── Tablet: horizontal progress indicator ───────────────────────────── */
  if (variant === 'progress') {
    const current = SERVICE_EXPERIENCE[active];
    return (
      <nav aria-label="Services" onKeyDown={onKeyDown}>
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-fluid-sm font-bold text-white">
            <span className="font-mono text-brand-cyan mr-2">{current.number}</span>
            {current.navLabel}
          </p>
          <p className="text-fluid-xs font-mono text-white/40 shrink-0">
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
                        ? '#22D3EE'
                        : visited
                          ? 'rgba(203,213,225,.32)'
                          : 'rgba(255,255,255,.1)',
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
                  background: on ? 'rgba(34,211,238,.14)' : 'rgba(255,255,255,.04)',
                  opacity: on ? 1 : visited ? 0.45 : 0.75,
                }}
              >
                <span className="font-mono text-fluid-xs" style={{ color: on ? '#22D3EE' : 'rgba(255,255,255,.45)' }}>
                  {s.number}
                </span>
                <span
                  className="text-fluid-sm"
                  style={{ color: on ? '#FFFFFF' : '#CBD5E1', fontWeight: on ? 700 : 500 }}
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
