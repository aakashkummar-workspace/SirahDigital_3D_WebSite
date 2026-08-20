"use client";
import React, { useEffect } from 'react';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import useInView from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { ArrowRightIcon } from '@/components/ui/icons';
import { BACKGROUND_FOCUS_EVENT } from '@/components/three/SiteBackground';

import { PrimaryButton } from '@/components/ui/Button';
/**
 * Full-screen close: large type, one button, nothing else.
 *
 * "Background particles converge toward the logo" is done with the particle
 * field the site already has rather than a second canvas. While this section
 * owns the viewport it asks the shared background to reassemble the mark and
 * centre it; on the way out it releases it again. The request goes over a
 * window event, so the section and the canvas stay decoupled — no context
 * provider threaded through a server layout, and no import cycle.
 */
export default function FullScreenCTA() {
  const [ref, inView] = useInView({ threshold: 0.4, once: false });
  const [copyRef, copyIn] = useInView({ threshold: 0.35 });
  const reduced = useReducedMotion();
  const shown = copyIn || reduced;

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(BACKGROUND_FOCUS_EVENT, {
        detail: inView ? { assembled: true, align: 'center' } : null,
      })
    );
    // Release the background if this unmounts mid-view (route change).
    return () => {
      window.dispatchEvent(new CustomEvent(BACKGROUND_FOCUS_EVENT, { detail: null }));
    };
  }, [inView]);

  return (
    <section
      ref={ref}
      aria-labelledby="services-cta-title"
      className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-6 overflow-hidden"
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

        <PrimaryButton href="/contact" className="mt-14">
          Book Free Consultation
          <ArrowRightIcon className="btn-arrow" />
        </PrimaryButton>
      </div>
    </section>
  );
}
