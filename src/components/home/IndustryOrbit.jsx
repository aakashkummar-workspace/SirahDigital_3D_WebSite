"use client";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import useInView from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { INDUSTRIES } from '@/data/industries';
import { ArrowRightIcon } from '@/components/ui/icons';

/*
 * SECTION 4 — Target Industries
 *
 * Sirah Digital at the centre, industries orbiting it.
 *
 * The rotation is driven by requestAnimationFrame rather than a CSS
 * animation, because the spec asks the orbit to *slow* on hover rather than
 * stop: the angular speed eases toward a slower target and back, which a CSS
 * animation cannot do without a visible jump. Only two transform strings are
 * written per frame per satellite, and no React state changes, so this costs
 * nothing measurable.
 *
 * Mobile gets a swipe rail instead — an orbit at phone width is unreadable,
 * and the spec calls for a mobile-first alternative rather than a scaled-down
 * desktop layout.
 */

const ORBITING = INDUSTRIES.slice(0, 8);
const ACCENTS = ['#22D3EE', '#22D3EE', '#22D3EE'];
// % of the stage that satellites orbit at. Each label extends outward from
// its dot, so the ring has to sit far enough inside the stage that the widest
// one ("Logistics & Supply Chain") still fits. At 42 the stage overflowed its
// own box in the 768–1023 range and widened the whole page, because nothing
// here clips.
const RADIUS = 37;
const BASE_SPEED = 0.045;   // degrees per millisecond-ish, scaled by delta
const SLOW_SPEED = 0.008;

export default function IndustryOrbit() {
  const [ref, inView] = useInView({ threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(0);

  const stageRef = useRef(null);
  const satelliteRefs = useRef([]);
  const angle = useRef(0);
  const speed = useRef(BASE_SPEED);
  const targetSpeed = useRef(BASE_SPEED);
  const active = inView || reduced;

  const setSatellite = useCallback((i) => (el) => { satelliteRefs.current[i] = el; }, []);

  useEffect(() => {
    // Static, evenly spaced ring when motion is reduced or the section is off
    // screen — the layout still reads, it simply does not move. Centring is
    // handled by the -translate-x/y-1/2 classes, so only left/top are set.
    if (reduced || !inView) {
      satelliteRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = (((i / ORBITING.length) * 360 - 90) * Math.PI) / 180;
        el.style.left = `${50 + Math.cos(a) * RADIUS}%`;
        el.style.top = `${50 + Math.sin(a) * RADIUS}%`;
      });
      return;
    }

    let raf = 0;
    let last = 0;
    const tick = (t) => {
      const dt = last ? Math.min(t - last, 50) : 16;
      last = t;
      // ease the angular speed toward its target so hover slows it smoothly
      speed.current += (targetSpeed.current - speed.current) * Math.min(1, dt / 260);
      angle.current = (angle.current + speed.current * dt) % 360;

      satelliteRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = ((angle.current + (i / ORBITING.length) * 360 - 90) * Math.PI) / 180;
        el.style.left = `${50 + Math.cos(a) * RADIUS}%`;
        el.style.top = `${50 + Math.sin(a) * RADIUS}%`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, inView]);

  const slow = () => { targetSpeed.current = SLOW_SPEED; };
  const resume = () => { targetSpeed.current = BASE_SPEED; };

  const current = ORBITING[selected] ?? ORBITING[0];

  return (
    <section ref={ref} aria-labelledby="industries-title" className="relative max-w-6xl mx-auto px-6 py-28 md:py-36">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-fluid-xs uppercase tracking-[0.35em] font-semibold text-brand-cyan">Where we work</p>
        <AnimatedHeading
          id="industries-title"
          text="Target Industries"
          className="mt-5 text-fluid-2xl font-bold tracking-tight"
        />
        <p className="mt-6 text-fluid-base leading-relaxed text-brand-muted">
          Domain-specific AI automation engineered for highly specialized corporate segments.
        </p>
      </div>

      {/* ================= Desktop / tablet: the orbit ===================== */}
      <div
        ref={stageRef}
        className="hidden md:block relative mx-auto mt-20 w-full max-w-3xl"
        style={{ aspectRatio: '1 / 1' }}
        onMouseLeave={resume}
      >
        {/* orbit rails */}
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
          {[84, 62, 40].map((size, i) => (
            <span
              key={size}
              className="absolute rounded-full border border-white/[0.07]"
              style={{ width: `${size}%`, height: `${size}%` }}
            />
          ))}
        </div>

        {/* centre — a soft scrim lifts the copy off the particle field behind
            it, which is otherwise busy enough to cost legibility */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{ width: '40%', height: '34%', background: 'radial-gradient(closest-side, rgba(22,20,44,.92), rgba(22,20,44,0))' }}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-6 w-[46%]">
          <p className="text-fluid-lg font-extrabold tracking-tight">
            <span className="text-white">SIRAH </span>
            <span className="text-brand-cyan">
              DIGITAL
            </span>
          </p>
          {/* Remounted on selection change so the description fades in
              rather than swapping text in place. */}
          <p
            key={current.slug}
            className="mt-4 text-fluid-xs leading-relaxed text-brand-muted"
            style={{ animation: reduced ? undefined : 'fade-in 500ms cubic-bezier(.22,.61,.36,1) both' }}
          >
            {current.desc}
          </p>
        </div>

        {/* satellites — real buttons, so the orbit is keyboard reachable */}
        {ORBITING.map((industry, i) => {
          const on = selected === i;
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <button
              key={industry.slug}
              ref={setSatellite(i)}
              type="button"
              onMouseEnter={() => { setSelected(i); slow(); }}
              onFocus={() => { setSelected(i); slow(); }}
              onBlur={resume}
              onClick={() => setSelected(i)}
              aria-pressed={on}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 min-h-[44px] px-4 py-2 rounded-full whitespace-nowrap transition-colors duration-300"
              style={{
                left: '50%',
                top: '50%',
                background: on ? `${accent}1f` : 'transparent',
              }}
            >
              <span
                className="rounded-full shrink-0 transition-all duration-300"
                style={{
                  width: on ? 12 : 8,
                  height: on ? 12 : 8,
                  background: accent,
                }}
              />
              <span
                className="text-fluid-sm font-semibold transition-all duration-300"
                style={{ color: on ? '#FFFFFF' : '#CBD5E1', letterSpacing: on ? '0.01em' : 0 }}
              >
                {industry.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= Mobile: swipe rail ============================== */}
      <div className="md:hidden mt-14">
        <ul
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6 pb-2"
          aria-label="Industries we serve - swipe to browse"
        >
          {ORBITING.map((industry, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <li key={industry.slug} className="snap-center shrink-0 w-[78vw] max-w-sm">
                <div className="h-full py-6">
                  <span
                    className="block w-10 h-10 rounded-full mb-5"
                    style={{ background: `radial-gradient(closest-side, ${accent}, ${accent}22)` }}
                    aria-hidden="true"
                  />
                  <h3 className="text-fluid-xl font-bold tracking-tight" style={{ color: accent }}>
                    {industry.title}
                  </h3>
                  <p className="mt-4 text-fluid-sm leading-relaxed text-brand-muted">{industry.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-fluid-xs text-white/40">Swipe to browse →</p>
      </div>

      <div className="mt-16 flex justify-center">
        <Link
          href="/industries"
          className="inline-flex items-center gap-2 min-h-[44px] px-7 py-3 rounded-full font-medium text-brand-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          See all twelve industries
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
