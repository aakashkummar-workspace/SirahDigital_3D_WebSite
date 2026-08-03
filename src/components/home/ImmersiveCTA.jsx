"use client";
import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import LogoMark from '@/components/ui/LogoMark';
import useInView from '@/hooks/useInView';
import { useReducedMotion, useIsMobile } from '@/hooks/useMediaQuery';
import { ArrowRightIcon } from '@/components/ui/icons';

/*
 * Closing CTA — fullscreen, 3D mark, one line of copy, one button. Nothing
 * else, per the spec.
 *
 * The WebGL mark is code-split and only mounted once this section is close to
 * the viewport. On phones and under a reduced-motion preference it falls back
 * to the vector LogoMark, which is sharp at any size and costs nothing — that
 * is the "reduce Three.js complexity on mobile" requirement, and it finally
 * gives LogoMark a job.
 */
const CTALogo3D = dynamic(() => import('@/components/three/CTALogo3D'), { ssr: false });

export default function ImmersiveCTA() {
  // Generous rootMargin so the canvas has begun loading by the time it is seen.
  const [ref, near] = useInView({ threshold: 0, rootMargin: '400px 0px 0px 0px' });
  const [copyRef, copyIn] = useInView({ threshold: 0.35 });
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const use3D = near && !reduced && !isMobile;
  const shown = copyIn || reduced;

  return (
    <section
      ref={ref}
      aria-labelledby="cta-title"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
    >
      {/* Layered background wash — depth without a panel or border */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[130vw] max-w-[1100px] max-h-[1100px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(closest-side, rgba(99,102,241,.22), transparent 70%)' }}
        />
        <div
          className="absolute left-[18%] top-[24%] w-[46vw] h-[46vw] max-w-[520px] max-h-[520px] rounded-full blur-3xl animate-breathe"
          style={{ background: 'radial-gradient(closest-side, rgba(168,85,247,.18), transparent 70%)' }}
        />
        <div
          className="absolute right-[14%] bottom-[18%] w-[40vw] h-[40vw] max-w-[460px] max-h-[460px] rounded-full blur-3xl animate-breathe"
          style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,.16), transparent 70%)', animationDelay: '1.8s' }}
        />
      </div>

      {/* 3D mark */}
      <div className="relative w-full max-w-[420px] aspect-square mx-auto" aria-hidden="true">
        {use3D ? (
          <CTALogo3D />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-12">
            <LogoMark className="w-full h-auto drop-shadow-[0_0_40px_rgba(99,102,241,0.45)]" gradientId="ctaMark" />
          </div>
        )}
      </div>

      {/* Copy */}
      <div
        ref={copyRef}
        className="relative max-w-3xl -mt-4 md:-mt-8"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'none' : 'translateY(24px)',
          transition: reduced ? 'none' : 'opacity 900ms cubic-bezier(.22,.61,.36,1), transform 900ms cubic-bezier(.22,.61,.36,1)',
        }}
      >
        <AnimatedHeading
          id="cta-title"
          as="h2"
          text="Ready to automate the busywork?"
          stagger={50}
          className="text-fluid-3xl font-bold tracking-tight leading-[1.05]"
        />

        <Link
          href="/contact"
          className="mt-12 inline-flex items-center justify-center gap-3 min-h-[44px] px-9 py-4 rounded-full text-fluid-base font-bold text-[#04121a] bg-brand-cyan hover:bg-white transition-colors duration-300"
        >
          Book Free Consultation
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
