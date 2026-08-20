import Reveal from '@/components/ui/Reveal';
import IndustryGallery from '@/components/industries/IndustryGallery';
import CTABand from '@/components/sections/CTABand';

export const metadata = {
  title: 'Industries We Transform',
  description:
    'Custom AI automation for healthcare, manufacturing, education, real estate, retail and e-commerce, logistics, professional services, hospitality, HR, legal, construction and automotive.',
  alternates: { canonical: '/industries' },
};

/*
 * Industries.
 *
 * Nothing on this page paints a background. The site layout's WebGL particle
 * field sits behind every route, and the gaps between cards are where it
 * shows through — a section fill here would cover it, which is the one thing
 * this page must not do.
 *
 * The header used to be squeezed as tight as it would go, so that two rows of
 * photographic tiles could clear the fold. That was the wrong thing to
 * optimise. The grid below is twelve cards deep whatever happens, the second
 * row was never going to be the reason someone stayed, and starving the
 * heading to buy it made the page open on a wall of images instead of on a
 * sentence. The heading is now the strongest thing on the page and it is
 * given the room to be.
 */
export default function IndustriesPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1280px] px-6 pb-16 pt-20 md:pb-20 md:pt-28">
        <div className="max-w-[760px]">
          <Reveal duration={700} y={12}>
            <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.42em] text-white/40">
              Industries
            </span>
          </Reveal>

          <Reveal delay={120} duration={700} y={24}>
            <h1 className="mt-7 text-balance text-[clamp(2rem,1.1rem+2.9vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white">
              Automation, shaped around your industry.
            </h1>
          </Reveal>

          <Reveal delay={240} duration={700} y={16}>
            <p className="mt-7 max-w-[520px] text-[1.0625rem] leading-[1.7] text-brand-muted/70">
              We design AI-powered systems around the workflows, teams and
              challenges unique to your industry.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-label="Industries" className="pb-28 md:pb-36">
        <IndustryGallery />
      </section>

      {/* Reused rather than rebuilt — the band is the site's standard closing
          transition into the footer, and the page needs a landing rather than
          a drop off the last card. */}
      <CTABand
        title="Have a workflow worth automating?"
        subtitle="Let's build the system around it."
      />
    </>
  );
}
