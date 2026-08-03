import Hero from '@/components/sections/Hero';
import MethodologyJourney from '@/components/home/MethodologyJourney';
import VisualTransformationStory from '@/components/home/transformation/VisualTransformationStory';
import IndustryOrbit from '@/components/home/IndustryOrbit';
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

/*
 * The homepage is a cinematic sequence, not a stack of grids: each section
 * uses a different visual language.
 *
 *   Hero                       — unchanged
 *   MethodologyJourney         — glowing line, three milestone nodes
 *   VisualTransformationStory  — three-scene story, plays itself every 3s
 *   IndustryOrbit              — industries orbiting the brand
 *   ImmersiveCTA               — fullscreen close with the 3D mark
 *
 * Every section here is card-free EXCEPT VisualTransformationStory, which is
 * deliberately rendered inside a bordered card to match its reference design.
 * That was an explicit decision — it is not an oversight to be tidied up.
 *
 * The "What We Build" chapters and the "Live Systems" mission control were
 * removed from this page. Their content still has a home: the full service
 * list lives on /services and the production systems on /work, both reachable
 * from the navbar and the footer.
 */
export default function HomePage() {
  return (
    <>
      {/* Forwards links to the old #offer / #brains style anchors */}
      <AnchorRedirect />

      <Hero />
      <MethodologyJourney />
      <VisualTransformationStory />
      <IndustryOrbit />
      <ImmersiveCTA />
    </>
  );
}
