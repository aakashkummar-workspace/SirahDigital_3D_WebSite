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
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-b border-ink/10">
      <Reveal>
        <div className="text-center relative pointer-events-auto">
          <AnimatedHeading text={title} className="text-3xl md:text-5xl font-bold text-ink" />
          <p className="mt-5 text-brand-muted max-w-xl mx-auto text-base md:text-lg">{subtitle}</p>
          {/* The subtitle promises a 45-minute call, so this goes to the
              calendar rather than the enquiry form. */}
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center gap-2 text-lg font-bold text-ink hover:text-brand-blue transition-colors"
          >
            <span>Book Free Consultation</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
