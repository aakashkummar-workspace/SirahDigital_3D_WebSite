import React from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import { ArrowRightIcon } from '@/components/ui/icons';

/**
 * Closes every inner route. On a single page the contact section was always
 * just below whatever you were reading; split across pages, each one needs
 * its own way back to the form.
 */
export default function CTABand({
  title = 'Ready to automate the busywork?',
  subtitle = 'Book a 45-minute strategy call and we will map the highest-leverage automation in your operation.',
}) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <Reveal>
        <div className="rounded-3xl border p-10 md:p-14 text-center relative overflow-hidden pointer-events-auto bg-gradient-to-br from-[#0d2030] via-[#0b1524] to-[#12102a] border-cyan-400/20">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />
          <div className="relative">
            <AnimatedHeading text={title} className="text-3xl md:text-4xl font-bold" />
            <p className="mt-5 text-brand-muted max-w-xl mx-auto">{subtitle}</p>
            <Link
              href="/contact"
              className="mt-9 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-opacity"
            >
              Book Free Consultation
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
