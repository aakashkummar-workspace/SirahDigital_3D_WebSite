import { PageHeader } from '@/components/sections/SectionHeader';
import ProjectGrid from '@/components/sections/ProjectGrid';
import AIAutomationROICalculator from '@/components/roi/AIAutomationROICalculator';
import CTABand from '@/components/sections/CTABand';

export const metadata = {
  title: 'Our Work',
  description:
    'Live enterprise production systems and ongoing R&D from Sirah Digital — clinical workflow automation, multi-warehouse ERP integration, WhatsApp commerce infrastructure and more. Model your own automation ROI.',
  alternates: { canonical: '/work' },
};

/*
 * The proof, then the projection: visitors see the systems already running,
 * then model what the same approach is worth in their own operation, and land
 * on the CTA with a number in mind.
 */
export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Project Deployment Hub"
        title="Systems in production, and what comes next."
        subtitle="Running enterprise deployments alongside the digital R&D initiatives currently in build."
      />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <ProjectGrid />
      </section>

      <AIAutomationROICalculator />

      <CTABand
        title="Want something like this for your operation?"
        subtitle="Every system here started as a 45-minute call about where the time was going."
      />
    </>
  );
}
