import React from 'react';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import MediaCarousel from './insights/MediaCarousel';
import { LATEST_INSIGHTS, CHANNEL_URL } from '@/data/insightsData';

/**
 * Insights.
 *
 * A row of large landscape cards, each one a film.
 *
 * This section used to carry a second row, Customer Success Stories, built
 * from the same carousel and filled with placeholder testimonials. It was
 * removed, so what is left here is the educational content only — which is
 * also why the eyebrow reads "Insights" rather than naming both.
 *
 * The section previously painted itself white on a site that is dark
 * everywhere else, which also hid the fixed particle field behind it. It now
 * runs on the page's own background, so the covers are the only bright thing
 * in view. That is the whole idea: the imagery leads, the title follows, and
 * there is nothing else to read until you click.
 */
export default function InsightsSuccessStories() {
  return (
    <section
      aria-labelledby="insights-title"
      className="relative py-28 md:py-40 lg:py-48"
    >
      {/* Wider than the site's usual max-w-7xl. The cards have to be large and
          cinematic and still leave the next one peeking, which needs more room
          than a text column does. */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <header className="max-w-3xl">
          <span className="block text-fluid-xs font-semibold uppercase tracking-[0.3em] text-ink/35">
            Insights
          </span>
          <AnimatedHeading
            as="h2"
            id="insights-title"
            text="Learn From Real AI Implementations"
            className="mt-5 text-fluid-2xl font-bold tracking-tight leading-[1.1] text-ink"
          />
          <p className="mt-6 text-fluid-base leading-relaxed text-brand-muted/80 max-w-xl">
            Explore educational AI content from Sirah Digital along with real client transformation stories.
          </p>
        </header>

        <div className="mt-20 md:mt-28">
          <MediaCarousel
            title="Latest Insights"
            items={LATEST_INSIGHTS}
            exploreUrl={CHANNEL_URL}
          />
        </div>
      </div>
    </section>
  );
}
