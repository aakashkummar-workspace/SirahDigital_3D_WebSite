import React from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import { ArrowRightIcon } from '@/components/ui/icons';

/**
 * `href` exists so a page that knows what the enquiry is about can say so.
 *
 * A product page passes `/contact?product=<slug>`, which arrives at the
 * contact form as a pre-selected chip — see the note on PRESELECT_PARAM in
 * sections/ContactForm.jsx. Everywhere else keeps the bare /contact it always
 * had, and the default below is what makes that true without every caller
 * having to say so.
 */
export default function CTABand({
  title = 'Ready to automate the busywork?',
  subtitle = 'Book a 45-minute strategy call and we will map the highest-leverage automation in your operation.',
  href = '/contact',
}) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-b border-white/10">
      <Reveal>
        <div className="text-center relative pointer-events-auto">
          <AnimatedHeading text={title} className="text-3xl md:text-5xl font-bold text-white" />
          <p className="mt-5 text-slate-300 max-w-xl mx-auto text-base md:text-lg">{subtitle}</p>
          {/* The subtitle promises a 45-minute call, so this goes to the
              calendar rather than the enquiry form. */}
          <Link
            href={href}
            className="mt-8 inline-flex items-center justify-center gap-2 text-lg font-bold text-white hover:text-brand-blue transition-colors"
          >
            <span>Book Free Consultation</span>
            <ArrowRightIcon />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
