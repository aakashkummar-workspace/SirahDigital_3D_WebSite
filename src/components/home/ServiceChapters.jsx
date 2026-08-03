"use client";
import React from 'react';
import Link from 'next/link';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import useInView from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { SERVICES } from '@/data/services';
import { SERVICE_VISUALS } from './ServiceVisuals';
import { ArrowRightIcon } from '@/components/ui/icons';

/*
 * SECTION 2 — What We Build
 *
 * Four full-width chapters instead of a grid of cards. Text and visual swap
 * sides each chapter; on mobile every chapter stacks visual-then-text in one
 * column, which is the reading order that makes sense on a phone regardless
 * of which side it sat on at desktop width.
 *
 * The four chapters are the first four SERVICES entries — the same set the
 * card grid showed, with the same copy.
 */

const CHAPTERS = SERVICES.slice(0, 4);
const ACCENTS = ['#6366F1', '#22D3EE', '#A855F7', '#6366F1'];

function Chapter({ service, index }) {
  const [ref, inView] = useInView({ threshold: 0.2, rootMargin: '0px 0px -12% 0px' });
  const reduced = useReducedMotion();
  const Visual = SERVICE_VISUALS[service.slug];
  const accent = ACCENTS[index % ACCENTS.length];
  const textFirst = index % 2 === 0;
  const active = inView || reduced;

  const shift = (delay, fromX = 0) => ({
    opacity: active ? 1 : 0,
    transform: active ? 'none' : `translate3d(${fromX}px, 26px, 0)`,
    transition: reduced
      ? 'none'
      : `opacity 900ms cubic-bezier(.22,.61,.36,1) ${delay}ms, transform 900ms cubic-bezier(.22,.61,.36,1) ${delay}ms`,
  });

  return (
    <article
      ref={ref}
      aria-labelledby={`chapter-${service.slug}`}
      className="relative py-20 md:py-28 lg:py-36"
    >
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">

        {/* Copy ---------------------------------------------------------- */}
        <div className={`order-2 ${textFirst ? 'lg:order-1' : 'lg:order-2'}`}>
          {/* Floating chapter number — sits behind the heading, decorative */}
          <span
            aria-hidden="true"
            className="block font-mono font-bold leading-none select-none"
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 7rem)',
              color: accent,
              opacity: active ? 0.16 : 0,
              transform: active ? 'none' : 'translateY(20px)',
              transition: reduced ? 'none' : 'opacity 1100ms ease, transform 1100ms cubic-bezier(.22,.61,.36,1)',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="-mt-6 md:-mt-10">
            <div style={shift(120)}>
              {/* as="h3" keeps the outline h1 → h2 → h3; AnimatedHeading
                  renders the tag itself, so it must not be wrapped in one. */}
              <AnimatedHeading
                as="h3"
                id={`chapter-${service.slug}`}
                text={service.title}
                className="text-fluid-2xl font-bold tracking-tight leading-[1.08]"
              />
            </div>

            {/* short rule in the chapter's accent */}
            <div
              aria-hidden="true"
              className="mt-7 h-px origin-left"
              style={{
                width: 96,
                background: `linear-gradient(90deg, ${accent}, transparent)`,
                transform: active ? 'scaleX(1)' : 'scaleX(0)',
                transition: reduced ? 'none' : 'transform 900ms cubic-bezier(.22,.61,.36,1) 320ms',
              }}
            />

            {/* Deliberately small against the heading — the spec asks for a
                very small supporting description under large typography. */}
            <p className="mt-7 text-fluid-sm leading-relaxed text-brand-muted max-w-md" style={shift(240)}>
              {service.desc}
            </p>
          </div>
        </div>

        {/* Visual -------------------------------------------------------- */}
        <div
          className={`order-1 ${textFirst ? 'lg:order-2' : 'lg:order-1'} relative`}
          style={{
            opacity: active ? 1 : 0,
            transform: active ? 'none' : `translate3d(${textFirst ? 30 : -30}px, 0, 0) scale(0.96)`,
            transition: reduced
              ? 'none'
              : 'opacity 1100ms cubic-bezier(.22,.61,.36,1) 80ms, transform 1100ms cubic-bezier(.22,.61,.36,1) 80ms',
          }}
        >
          {/* ambient wash so the visual sits in light rather than on a panel */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 blur-3xl"
            style={{ background: `radial-gradient(closest-side, ${accent}22, transparent 72%)` }}
          />
          <div className="mx-auto w-full max-w-md lg:max-w-lg">
            {Visual && <Visual active={active} reduced={reduced} />}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ServiceChapters() {
  return (
    <section aria-labelledby="build-title" className="relative">
      <div className="max-w-6xl mx-auto px-6 pt-28 md:pt-36">
        <p className="text-fluid-xs uppercase tracking-[0.35em] font-semibold text-brand-cyan">Capabilities</p>
        <AnimatedHeading
          id="build-title"
          text="What We Build"
          className="mt-5 text-fluid-2xl font-bold tracking-tight"
        />
        <p className="mt-6 text-fluid-base leading-relaxed text-brand-muted max-w-2xl">
          Ten core capabilities, from autonomous AI agents to the dashboards that prove they are working.
        </p>
      </div>

      {CHAPTERS.map((service, i) => (
        <Chapter key={service.slug} service={service} index={i} />
      ))}

      <div className="max-w-6xl mx-auto px-6 pb-8 flex justify-center">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 min-h-[44px] px-7 py-3 rounded-full font-medium text-brand-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          See all ten services
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
