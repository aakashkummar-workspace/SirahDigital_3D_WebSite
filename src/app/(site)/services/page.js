import ServicesHero from '@/components/services/ServicesHero';
import PinnedExperience from '@/components/services/PinnedExperience';
import FullScreenCTA from '@/components/services/FullScreenCTA';

export const metadata = {
  title: 'AI Automation Services',
  description:
    'AI agents and virtual employees, chatbots and voice assistants, workflow automation, custom web and mobile apps, CRM and ERP, SaaS builds, WhatsApp automation, OCR, API integration and BI dashboards.',
  alternates: { canonical: '/services' },
};

/*
 * Three regions, in the order the design lays out:
 *
 *   Hero                → large type, no buttons, hands over to the experience
 *   PinnedExperience    → pinned navigation, scrolling capabilities, and the
 *                         one persistent visualization
 *   FullScreenCTA       → one line, one button, particles converging
 *
 * The page is a server component; each region is a client leaf that owns its
 * own scroll observation.
 *
 * The technology ecosystem orbit sat between the experience and the CTA and
 * was removed. Its component still exists at components/services/
 * TechnologyOrbit.jsx, unmounted — the stack is already named per capability
 * inside the experience, so the orbit repeated it a second time.
 */
export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <PinnedExperience />
      <FullScreenCTA />
    </>
  );
}
