"use client";
import React from 'react';
import Link from 'next/link';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import useInView from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { ArrowRightIcon } from '@/components/ui/icons';

/**
 * Full-screen close: large type, one button, nothing else.
 *
 * This used to ask the shared WebGL particle field to reassemble the logo
 * behind it while in view, over a window event. That background has been
 * removed from the site, so the request had nobody listening and is gone with
 * it. The section is unchanged otherwise — it was never drawing the particles
 * itself.
 */
export default function FullScreenCTA() {
  // The section-level useInView that used to drive the background focus is
  // gone with it. `copyRef` stays — that one reveals the copy, and is nothing
  // to do with the particles.
  const [copyRef, copyIn] = useInView({ threshold: 0.35 });
  const reduced = useReducedMotion();
  const shown = copyIn || reduced;

  return (
    <section
      aria-labelledby="services-cta-title"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
    >
      <div
        ref={copyRef}
        className="relative max-w-3xl"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'none' : 'translateY(26px)',
          transition: reduced
            ? 'none'
            : 'opacity 1000ms cubic-bezier(.22,.61,.36,1), transform 1000ms cubic-bezier(.22,.61,.36,1)',
        }}
      >
        <AnimatedHeading
          as="h2"
          id="services-cta-title"
          text="Let us build yours."
          stagger={60}
          className="text-fluid-3xl font-bold tracking-tight leading-[1.02]"
        />

        <Link
          href="/contact"
          className="mt-14 inline-flex items-center justify-center gap-3 min-h-[44px] px-9 py-4 rounded-full text-fluid-base font-bold text-[#04121a] bg-brand-cyan hover:bg-white transition-colors duration-300"
        >
          Book Free Consultation
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
