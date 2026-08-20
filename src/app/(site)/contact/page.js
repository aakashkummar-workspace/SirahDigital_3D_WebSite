import Reveal from '@/components/ui/Reveal';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import ContactDetails from '@/components/sections/ContactDetails';
import ContactForm from '@/components/sections/ContactForm';
import ContactMap from '@/components/sections/ContactMap';
import AIAutomationROICalculator from '@/components/roi/AIAutomationROICalculator';
import { COMPANY } from '@/data/company';

import { PrimaryButton } from '@/components/ui/Button';
export const metadata = {
  title: 'Contact & Free Consultation',
  description:
    'Book a free 45-minute AI strategy consultation with Sirah Digital. Chennai-based AI automation engineers. Reach us by email, phone or WhatsApp.',
  alternates: { canonical: '/contact' },
};

/**
 * Contact.
 *
 * The hero does not use the shared <PageHeader />. That component is on four
 * other routes and its eyebrow is a bordered pill, which is the one thing on
 * this page that would read as a badge rather than a label — so the hero is
 * written out here instead of widening PageHeader with props that only this
 * route would ever pass.
 *
 * Everything renders on the server except the form and the map, which are the
 * two client leaves.
 *
 * The vertical rhythm is fixed rather than fluid — 80 / 100 between hero, form
 * and map, then 120 to the footer — because the gaps increasing are what tell
 * you the blocks are separate.
 *
 * The ROI calculator is the last block, moved here when /work merged into
 * /products. It brings its own py-24/32, so the 120px to the footer is the
 * only spacing this page still states for it.
 */
export default function ContactPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-20">
        <Reveal>
          <span className="block text-fluid-xs font-semibold uppercase tracking-[0.3em] text-white/35">
            Get in touch
          </span>
        </Reveal>

        <Reveal delay={90}>
          <AnimatedHeading
            as="h1"
            text="Let’s discuss your next AI project."
            stagger={45}
            className="mt-5 max-w-3xl text-fluid-3xl font-bold leading-[1.08] tracking-tight text-white"
          />
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-6 max-w-xl text-fluid-base leading-relaxed text-brand-muted/85">
            Tell us where the time goes in your operation, and we will map the
            highest-leverage automation in it. Forty-five minutes, no charge, and an
            honest answer on whether it is worth building.
          </p>
        </Reveal>

        <Reveal delay={260}>
          {/* Scrolls to the form rather than linking anywhere: this page IS the
              booking flow now — details, then the calendar in place — so a link
              would only reload the page the visitor is already on. The label is
              honest because the form does end in a booking. */}
          <PrimaryButton href="#contact-form" className="mt-9" arrow>
            Book Free Consultation
          </PrimaryButton>
        </Reveal>
      </section>

      {/* Hero → form: 80px */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <Reveal>
            <ContactForm />
          </Reveal>
          <Reveal delay={120}>
            <ContactDetails />
          </Reveal>
        </div>
      </section>

      {/* Form → map: 100px. */}
      <section className="mx-auto mt-[100px] max-w-6xl px-6">
        <Reveal>
          <ContactMap />
        </Reveal>
      </section>

      {/*
       * The calculator, last.
       *
       * It used to sit on /work, between the client systems and that page's
       * closing CTA — the arc was "systems we built, then what the same
       * approach is worth to you, then book a call". /work has merged into
       * /products and that page is now purely a record of what exists, so the
       * projection moved to the page the arc always ended on.
       *
       * It keeps its own 120px to the footer, which is the gap the map used
       * to carry — the rhythm noted above is unchanged, the last block in it
       * is just a different one.
       */}
      <div className="pb-[120px]">
        <AIAutomationROICalculator />
      </div>

      {/* Machine-readable company details for search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: COMPANY.name,
            url: COMPANY.url,
            email: COMPANY.email,
            telephone: COMPANY.phone,
            address: { '@type': 'PostalAddress', streetAddress: COMPANY.addressOneLine, addressCountry: 'IN' },
          }),
        }}
      />
    </>
  );
}
