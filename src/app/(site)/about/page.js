import SectionHeader, { PageHeader } from '@/components/sections/SectionHeader';
import MethodologyGrid from '@/components/sections/MethodologyGrid';
import TeamGrid from '@/components/sections/TeamGrid';
import CTABand from '@/components/sections/CTABand';
import { COMPANY } from '@/data/company';

export const metadata = {
  title: 'About Us',
  description:
    'How Sirah Digital works — automate, simplify, scale — and the team behind it. AI automation engineers and digital growth specialists based in Chennai.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Sirah Digital"
        title="Engineering that removes work, not adds to it."
        subtitle={COMPANY.blurb}
      />

      {/* id kept so /about#process from the footer lands here */}
      <section id="process" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-28">
        <SectionHeader
          title="Our Methodology"
          align="center"
          subtitle="Three stages, applied to every engagement in the same order."
        />
        <MethodologyGrid />
      </section>

      <section id="team" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-28">
        <TeamGrid />
      </section>

      <CTABand />
    </>
  );
}
