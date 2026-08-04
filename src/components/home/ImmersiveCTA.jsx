"use client";
import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import LogoMark from '@/components/ui/LogoMark';
import useInView from '@/hooks/useInView';
import { useReducedMotion, useIsMobile } from '@/hooks/useMediaQuery';
import { ArrowRightIcon } from '@/components/ui/icons';

const CTALogo3D = dynamic(() => import('@/components/three/CTALogo3D'), { ssr: false });

export default function ImmersiveCTA() {
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
      className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden py-24"
    >
      {/* 3D mark */}
      <div className="relative w-full max-w-[380px] aspect-square mx-auto" aria-hidden="true">
        {use3D ? (
          <CTALogo3D />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-12">
            <LogoMark className="w-full h-auto" gradientId="ctaMark" />
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
          className="text-fluid-3xl font-bold tracking-tight leading-[1.05] text-white"
        />

        <Link
          href="/contact"
          className="mt-10 inline-flex items-center justify-center gap-3 min-h-[44px] px-9 py-4 rounded-full text-fluid-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors duration-300"
        >
          Book Free Consultation
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}
