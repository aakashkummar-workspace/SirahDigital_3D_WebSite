import Hero from '@/components/sections/Hero';
import HomeProductsBlock from '@/components/home/HomeProductsBlock';
import TrustedClientsMarquee from '@/components/home/TrustedClientsMarquee';
import ImageFlow from '@/components/home/ImageFlow';
import KineticWordmark from '@/components/home/KineticWordmark';
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

      {/* Insights & Success Stories is deliberately absent here — it lives on
          /about only. The component and its data stay in place for that page. */}
      {/* HomeProductsBlock is back, directly under the hero. It was removed
          when the hero's pinned stage presented all three products itself;
          that stage went too, which left the three products with no mention
          anywhere on the landing page. */}
      <Hero />
      <HomeProductsBlock />
      <TrustedClientsMarquee />
      <ImageFlow />
      {/* The wordmark, oversized, resolving into a heading as it is scrolled
          past — a beat between the carousel and the closing CTA. */}
      <KineticWordmark />
      <ImmersiveCTA />
    </>
  );
}
