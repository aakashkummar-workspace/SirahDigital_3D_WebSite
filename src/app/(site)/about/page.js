import AboutHero from '@/components/about/AboutHero';
import AboutStatement from '@/components/about/AboutStatement';
import StatBand from '@/components/sections/StatBand';
import TeamGrid from '@/components/sections/TeamGrid';
import InsightsSuccessStories from '@/components/sections/InsightsSuccessStories';
import MethodologyGrid from '@/components/sections/MethodologyGrid';
import CTABand from '@/components/sections/CTABand';
import { FOUNDER } from '@/data/team';

export const metadata = {
  title: 'About Us',
  description:
    `How Sirah Digital works - automate, simplify, scale - and the team behind it. Founded by ${FOUNDER.name}, AI automation engineers and digital growth specialists based in Chennai.`,
  alternates: { canonical: '/about' },
};

/**
 * The page opens on the founder, then on the people, then on the argument.
 *
 * Two things this page used to do and no longer does, both for the same
 * reason — it was saying things twice:
 *
 *   The founder plate is gone. It led with his portrait and his name set
 *   large, one screen under a hero that does exactly that at full width.
 *   Everything below that identity row — the statement, the prior brands,
 *   the quote, the links — moved into AboutStatement, which is where it
 *   reads as the same voice continuing rather than as a second introduction.
 *
 *   The client marquee is gone. "Trusted Across Industries" is the hub's
 *   argument to a stranger; on a page about who we are it was a detour
 *   between the hero and the point. It still runs on the homepage.
 *
 * Order: the hero names him, the figures say what the company has done, the
 * roster shows he is not the whole of it, and the statement closes with what
 * the work is for. The numbers sit that high because they are the fastest
 * thing on the page to read and the only part that is pure evidence.
 */
export default function AboutPage() {
  return (
    <>
      <AboutHero />

      {/* The figures, straight under the hero — the fastest read on the page. */}
      <div className="mt-16 md:mt-24">
        <StatBand />
      </div>

      {/* The people. */}
      <section id="team" className="max-w-7xl mx-auto px-6 pt-20 pb-4 md:pt-28 scroll-mt-28">
        <TeamGrid />
      </section>

      {/* What the work is for, in as few words as it takes. */}
      <div className="mt-20 md:mt-28">
        <AboutStatement />
      </div>

      {/*
        How the work runs. This is where /process lands.

        METHODOLOGY has been in data/services.js all along, but the two
        components that render it were imported by no page at all — so the old
        site's /process URL redirected here to nothing, the footer's
        "/about#process" link pointed at an id that did not exist, and both
        chatbot indexes cited /services for a methodology question /services
        does not answer. Mounting it here is what makes all three true.
      */}
      <section
        id="process"
        className="max-w-7xl mx-auto px-6 pt-20 md:pt-28 scroll-mt-28"
        aria-labelledby="process-title"
      >
        <h2 id="process-title" className="text-3xl md:text-4xl font-semibold tracking-tight">
          How we work
        </h2>
        <p className="mt-4 max-w-2xl text-brand-muted">
          Every engagement runs the same three stages, so you always know which one you are in.
        </p>
        <div className="mt-12">
          <MethodologyGrid />
        </div>
      </section>

      <div className="mt-4 md:mt-8">
        <InsightsSuccessStories />
      </div>

      <CTABand />
    </>
  );
}
