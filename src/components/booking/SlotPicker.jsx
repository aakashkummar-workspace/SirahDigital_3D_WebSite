"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Choosing a time, on the visitor's side.
 *
 * The public counterpart to the SlotCalendar in the CMS admin. Same data, read
 * through /api/slots, but deliberately not the same component: the admin one can
 * create, cancel and bulk-generate, and none of that should exist in a bundle
 * served to the public even behind a disabled button.
 *
 * ── Why a date rail and not a list of days ───────────────────────────────
 * The first version rendered one expandable row per day. With a real calendar
 * generated — Mon–Sat over a 45-day window — that is thirty-nine rows, so the
 * Confirm button sat several screens below the times and choosing a slot meant
 * scrolling back down past everything to commit. On a phone it was worse: the
 * whole booking step was longer than the page it lived on.
 *
 * The rail fixes the cause rather than the symptom. Days scroll sideways in a
 * fixed-height strip, only the selected day's times are ever rendered, and the
 * entire control is a predictable ~260px tall no matter how much availability
 * exists — so Confirm is always within a thumb's reach of the times.
 *
 * ── Why dates come from the server as strings ────────────────────────────
 * `local_date` and `local_time` are computed in the CMS, in the target zone, and
 * are never re-derived here. A visitor in Dubai and a visitor in Delhi must see
 * a 15:00 IST slot described as 15:00, because that is the time the founder will
 * be at their desk — and `new Date(slot.starts_at)` in the browser would show
 * each of them something different and both of them something wrong.
 */

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * The weekday of a civil date.
 *
 * Read in UTC on purpose: a date like "2026-08-20" has no zone, and letting the
 * browser interpret it locally is what shifts a slot onto the wrong day for
 * anyone west of Greenwich. Same rule the CMS follows.
 */
function partsOf(localDate) {
  const [y, m, d] = localDate.split('-').map(Number);
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "15:30" → "3:30 pm". The stored value stays 24-hour; only the label changes. */
function formatTime(localTime) {
  const [h, m] = localTime.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function SlotPicker({ value, onChange, refreshKey = 0, onAvailability }) {
  const [slots, setSlots] = useState(null); // null = still loading
  const [openDay, setOpenDay] = useState('');
  const railRef = useRef(null);

  useEffect(() => {
    let live = true;

    fetch('/api/slots', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { slots: [] }))
      .then((body) => {
        if (!live) return;
        const list = Array.isArray(body.slots) ? body.slots : [];
        setSlots(list);
        onAvailability?.(list.length);
      })
      .catch(() => {
        if (!live) return;
        setSlots([]);
        // An unreachable API and a full calendar are the same thing to the
        // person looking at the page: nothing to pick. Reporting 0 either way
        // keeps the button off rather than live over an empty list.
        onAvailability?.(0);
      });

    return () => {
      live = false;
    };
    // `onAvailability` is deliberately not a dependency. Parents pass an inline
    // arrow, so including it would re-run this fetch on every render — one
    // request per keystroke while somebody types their name.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  /** Grouped by day, in the order the server sent them — soonest first. */
  const days = useMemo(() => {
    const map = new Map();
    for (const s of slots || []) {
      const list = map.get(s.local_date) || [];
      list.push(s);
      map.set(s.local_date, list);
    }
    return [...map.entries()];
  }, [slots]);

  // Open the first day with times in it, so the common case — "the soonest
  // available slot" — needs no navigation at all.
  useEffect(() => {
    if (!openDay && days.length) setOpenDay(days[0][0]);
  }, [days, openDay]);

  if (slots === null) {
    return (
      <p role="status" className="text-fluid-sm text-brand-muted">
        Loading available times…
      </p>
    );
  }

  /*
   * Nothing free.
   *
   * Covers a genuinely full calendar and an unreachable CMS alike — the visitor
   * can act on neither, and both leave them needing a way to reach us that is
   * not this page. Stating "no times" and offering nothing else is how a booking
   * page loses someone who was ready to book.
   */
  if (!days.length) {
    return (
      <div className="rounded-xl border border-ink/10 p-6">
        <p className="text-fluid-sm text-brand-muted">
          There are no free times on the calendar at the moment.
        </p>
        <p className="mt-3 text-fluid-sm text-brand-muted">
          Email{' '}
          <a href="mailto:support@sirahdigital.in" className="text-brand-blue hover:underline">
            support@sirahdigital.in
          </a>{' '}
          and we will find you one.
        </p>
      </div>
    );
  }

  const times = days.find(([d]) => d === openDay)?.[1] || [];
  const selected = times.find((s) => String(s.id) === String(value));
  const openParts = openDay ? partsOf(openDay) : null;

  /** Nudge the rail by roughly one screen of chips. */
  const scrollRail = (dir) => {
    railRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };

  return (
    <div>
      {/* ── The date rail ──────────────────────────────────────────────── */}
      <div className="relative">
        {/* Arrows are pointer-only affordances: the rail is swipeable on touch
            and reachable by keyboard through the chips themselves, so hiding
            them below `sm` removes two tap targets that do nothing useful on a
            phone and buys the chips the full width instead. */}
        <button
          type="button"
          onClick={() => scrollRail(-1)}
          aria-label="Earlier dates"
          className="absolute left-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-space text-ink/70 transition-colors hover:border-ink/30 hover:text-ink sm:flex"
        >
          ‹
        </button>

        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth py-1 sm:px-11"
        >
          {days.map(([date, list]) => {
            const { d, m, weekday } = partsOf(date);
            const isOpen = date === openDay;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setOpenDay(date)}
                aria-pressed={isOpen}
                aria-label={`${DAYS_LONG[weekday]} ${d} ${MONTHS_LONG[m - 1]}, ${list.length} times`}
                className={
                  'flex min-h-[72px] w-[68px] shrink-0 snap-start flex-col items-center justify-center gap-0.5 ' +
                  'rounded-xl border transition-colors ' +
                  (isOpen
                    ? 'border-brand-blue bg-brand-blue/15 text-ink'
                    : 'border-ink/10 text-ink/70 hover:border-ink/25 hover:text-ink')
                }
              >
                <span className="text-[0.7rem] uppercase tracking-wide text-ink/45">
                  {DAYS_SHORT[weekday]}
                </span>
                <span className="text-[1.05rem] font-semibold leading-none">{d}</span>
                <span className="text-[0.68rem] text-ink/40">{MONTHS_SHORT[m - 1]}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollRail(1)}
          aria-label="Later dates"
          className="absolute right-0 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink/15 bg-space text-ink/70 transition-colors hover:border-ink/30 hover:text-ink sm:flex"
        >
          ›
        </button>
      </div>

      {/* ── Times for the selected day ─────────────────────────────────── */}
      {openParts && (
        <p className="mt-5 text-[0.8rem] font-medium text-ink/70">
          {DAYS_LONG[openParts.weekday]} {openParts.d} {MONTHS_LONG[openParts.m - 1]}
        </p>
      )}

      {/*
        * auto-fill rather than a fixed column count: ten times land as 2 columns
        * on a narrow phone and 4 on a desktop without a breakpoint for each, and
        * the 44px minimum height keeps every one of them a legal touch target.
        */}
      <div
        className="mt-3 grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))' }}
      >
        {times.map((slot) => {
          const isSel = String(value) === String(slot.id);
          return (
            <button
              key={slot.id}
              type="button"
              aria-pressed={isSel}
              onClick={() => onChange(isSel ? '' : slot.id)}
              className={
                'min-h-[44px] rounded-lg border px-2 text-[14px] transition-colors ' +
                (isSel
                  ? 'border-brand-blue bg-brand-blue text-white'
                  : 'border-ink/15 text-ink/80 hover:border-ink/30 hover:text-ink')
              }
            >
              {formatTime(slot.local_time)}
            </button>
          );
        })}
      </div>

      {/* The zone is stated once, here, rather than on every button. Every slot
          carries the same one, and repeating it forty times is noise — but
          omitting it entirely is how somebody abroad books 3pm their time. */}
      <p className="mt-3 text-[0.78rem] text-ink/45">
        All times{' '}
        {slots[0]?.time_zone === 'Asia/Kolkata' ? 'India Standard Time (IST)' : slots[0]?.time_zone}.
      </p>

      {/*
        * What they have actually chosen, restated.
        *
        * The selection is a highlighted button somewhere in a grid, which stops
        * being visible the moment they scroll to the consent box — and "did that
        * register?" at the last step before paying attention costs bookings.
        * Echoing it in one line directly above Confirm makes the answer the last
        * thing read before committing.
        */}
      {selected && openParts && (
        <p className="mt-5 rounded-xl border border-brand-blue/40 bg-brand-blue/10 px-4 py-3 text-[0.85rem] text-ink">
          Selected:{' '}
          <span className="font-semibold">
            {DAYS_LONG[openParts.weekday]} {openParts.d} {MONTHS_LONG[openParts.m - 1]}
            {' at '}
            {formatTime(selected.local_time)}
          </span>
        </p>
      )}
    </div>
  );
}
