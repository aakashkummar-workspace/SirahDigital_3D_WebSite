import React from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import { ArrowRightIcon } from '@/components/ui/icons';

export default function CTABand({
  title = 'Ready to automate the busywork?',
  subtitle = 'Book a 45-minute strategy call and we will map the highest-leverage automation in your operation.',
}) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-b border-white/10">
      <Reveal>
        <div className="text-center relative pointer-events-auto">
          <AnimatedHeading text={title} className="text-3xl md:text-5xl font-bold text-white" />
          <p className="mt-5 text-slate-300 max-w-xl mx-auto text-base md:text-lg">{subtitle}</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center gap-2 text-lg font-bold text-white hover:text-cyan-400 transition-colors"
          >
            <span>Book Free Consultation</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
