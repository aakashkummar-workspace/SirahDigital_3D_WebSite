import { PageHeader } from '@/components/sections/SectionHeader';
import IndustryExplorer from '@/components/industries/IndustryExplorer';
import CTABand from '@/components/sections/CTABand';

export const metadata = {
  title: 'Industries We Serve',
  description:
    'AI automation built for healthcare, manufacturing, education, real estate, retail and e-commerce, logistics, professional services, hospitality, HR, legal, construction and automotive.',
  alternates: { canonical: '/industries' },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Target Industries"
        title="Automation built for how your sector actually runs."
        subtitle="Domain-specific AI solutions engineered for twelve highly specialized corporate segments."
      />

      {/* Master/detail: pick a sector on the left, read its whole record on
          the right. Wider than the old 6xl grid because the split view needs
          the rail and the panel side by side without either one cramping. */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <IndustryExplorer />
      </section>

      <CTABand
        title="Work in a sector we have not listed?"
        subtitle="The underlying systems transfer. Tell us how your operation runs and we will map it."
      />
    </>
  );
}
