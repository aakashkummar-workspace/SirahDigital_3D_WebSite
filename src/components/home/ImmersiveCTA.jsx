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
      className="section-alt relative min-h-[45vh] flex flex-col items-center justify-center text-center px-6 py-20 border-t border-ink/10"
    >
      {/* Copy */}
      <div
        ref={copyRef}
        className="relative max-w-3xl"
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
          className="text-fluid-3xl font-bold tracking-tight leading-[1.05] text-ink"
        />

        <Link
          href="/contact"
          className="mt-8 inline-flex items-center justify-center gap-2 text-lg font-bold text-ink hover:text-brand-blue transition-colors duration-300"
        >
          <span>Book Free Consultation</span>
          <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>
    </section>
  );
}
