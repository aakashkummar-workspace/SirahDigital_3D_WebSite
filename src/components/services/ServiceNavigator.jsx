"use client";
import React, { useEffect, useRef } from 'react';
import { SERVICE_EXPERIENCE } from '@/data/serviceExperience';

/**
 * The service navigator, in the three forms the design specifies:
 *
 *   rail     — desktop: pinned vertical list, active glows, completed dim
 *   progress — tablet: horizontal progress indicator
 *   chips    — mobile: swipeable chips
 *
 * One component rather than three, so the active/visited logic and the
 * keyboard handling exist once.
 *
 * No cards, no borders — state is carried by weight, colour and a rule.
 */

const RAIL_KEYS = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 };

export default function ServiceNavigator({ variant, active, onSelect, progress, reduced = false }) {
  const listRef = useRef(null);
  const total = SERVICE_EXPERIENCE.length;

  // Keep the active chip in view as the visitor scrolls the page, without
  // yanking the whole window — only the rail scrolls.
  useEffect(() => {
    if (variant !== 'chips') return;
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [active, variant]);

  const onKeyDown = (e) => {
    const dir = RAIL_KEYS[e.key];
    if (!dir) return;
    e.preventDefault();
    onSelect(Math.min(total - 1, Math.max(0, active + dir)));
  };

  /* ── Desktop: pinned vertical rail ─────────────────────────────────────
     The fill is driven by `progress` — a continuous 0-1 value from the page's
     scroll position, not a step per item — so the rail keeps moving between
     capabilities instead of jumping on each change. Two sparks ride the lit
     part of the rail so it reads as a live line rather than a bar. */
  if (variant === 'rail') {
    const fill = typeof progress === 'number' ? progress : (active + 1) / total;
    return (
      <nav aria-label="Services" onKeyDown={onKeyDown}>
        <p className="text-fluid-xs uppercase tracking-[0.3em] font-semibold text-white/35 mb-7">
          Capabilities
        </p>
        <ol className="relative space-y-1">
          {/* progress rule: dim rail, bright fill following the scroll */}
          <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-px bg-white/10" />
          <span
            aria-hidden="true"
            className="absolute left-0 top-1 w-px origin-top"
            style={{
              height: 'calc(100% - 8px)',
              transform: `scaleY(${Math.max(0.02, fill)})`,
              background: 'linear-gradient(180deg,#6366F1,#A855F7 55%,#22D3EE)',
              boxShadow: '0 0 12px 1px rgba(99,102,241,.5)',
              transition: 'transform 260ms linear',
            }}
          />
          {/* energy travelling the lit section */}
          {!reduced && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1 w-px overflow-hidden pointer-events-none"
              style={{ height: `calc((100% - 8px) * ${Math.max(0.02, fill)})` }}
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className="absolute -left-[2px] w-[5px] h-[5px] rounded-full"
                  style={{
                    background: '#22D3EE',
                    boxShadow: '0 0 10px 3px rgba(34,211,238,.75)',
                    '--rail-h': '100%',
                    animation: `rail-spark ${3200 + i * 900}ms linear ${i * 1500}ms infinite`,
                  }}
                />
              ))}
            </span>
          )}
          {SERVICE_EXPERIENCE.map((s) => {
            const on = s.index === active;
            const visited = s.index < active;
            return (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => onSelect(s.index)}
                  aria-current={on ? 'true' : undefined}
                  data-cursor="nav"
                  className="interactive-hover group relative flex items-baseline gap-3 w-full text-left pl-5 pr-2 min-h-[44px] transition-all duration-500 ease-brand hover:opacity-100 hover:translate-x-1.5"
                  style={{
                    opacity: on ? 1 : visited ? 0.34 : 0.62,
                    transform: on ? 'translateX(4px)' : 'none',
                  }}
                >
                  {/* the active marker, and a dot that appears on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-500 ease-brand"
                    style={{
                      width: on ? 9 : 5,
                      height: on ? 9 : 5,
                      background: on ? '#22D3EE' : 'rgba(255,255,255,.25)',
                      boxShadow: on ? '0 0 14px 3px rgba(34,211,238,.7)' : 'none',
                    }}
                  />
                  <span
                    className="font-mono text-fluid-xs shrink-0 transition-all duration-500 group-hover:text-brand-cyan"
                    style={{
                      color: on ? '#22D3EE' : 'rgba(255,255,255,.4)',
                      // the number lifts and brightens as it becomes current
                      transform: on ? 'translateY(-1px) scale(1.12)' : 'none',
                      display: 'inline-block',
                      textShadow: on ? '0 0 14px rgba(34,211,238,.6)' : 'none',
                    }}
                  >
                    {s.number}
                  </span>
                  <span className="relative">
                    <span
                      className="block text-fluid-sm leading-tight transition-all duration-500 group-hover:text-white"
                      style={{
                        color: on ? '#FFFFFF' : '#CBD5E1',
                        fontWeight: on ? 700 : 500,
                        textShadow: on ? '0 0 22px rgba(34,211,238,.45)' : 'none',
                      }}
                    >
                      {s.navLabel}
                    </span>
                    {/* underline that draws in on hover */}
                    <span
                      aria-hidden="true"
                      className="absolute left-0 -bottom-0.5 h-px w-full origin-left scale-x-0 transition-transform duration-400 ease-brand group-hover:scale-x-100"
                      style={{ background: 'linear-gradient(90deg,#22D3EE,transparent)' }}
                    />
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
                        ? 'linear-gradient(90deg,#6366F1,#22D3EE)'
                        : visited
                          ? 'rgba(203,213,225,.32)'
                          : 'rgba(255,255,255,.1)',
                      boxShadow: on ? '0 0 12px 1px rgba(34,211,238,.5)' : 'none',
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
