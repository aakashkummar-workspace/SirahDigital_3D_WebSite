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
    <section className="max-w-6xl mx-auto px-6 py-24">
      <Reveal>
        <div className="rounded-3xl border p-10 md:p-14 text-center relative overflow-hidden pointer-events-auto bg-slate-900/90 border-slate-800">
          <div className="relative">
            <AnimatedHeading text={title} className="text-3xl md:text-4xl font-bold text-white" />
            <p className="mt-5 text-slate-300 max-w-xl mx-auto">{subtitle}</p>
            <Link
              href="/contact"
              className="mt-9 inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
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
