import Hero from '@/components/sections/Hero';
import MethodologyJourney from '@/components/home/MethodologyJourney';
import InsightsSuccessStories from '@/components/sections/InsightsSuccessStories';
import ImmersiveCTA from '@/components/home/ImmersiveCTA';
import AnchorRedirect from '@/components/sections/AnchorRedirect';

export const metadata = {
  // `absolute` opts out of the root layout's "%s | Sirah Digital" template,
  // which would otherwise append the brand a second time.
  title: { absolute: 'Sirah Digital | Intelligent Business Automation Systems' },
  description:
    'We build AI agents, chatbots, workflow automation and custom software that let businesses automate, simplify, and scale. Based in Chennai, serving 10,000+ businesses.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      {/* Forwards links to the old #offer / #brains style anchors */}
      <AnchorRedirect />

      <Hero />
      <MethodologyJourney />
      <InsightsSuccessStories />
      <ImmersiveCTA />
    </>
  );
}
