import React from 'react';
import Reveal from '@/components/ui/Reveal';
import IndustryCard from './IndustryCard';
import { INDUSTRIES_WITH_IMAGES } from '@/lib/industryImages';

/*
 * The industries grid.
 *
 * This was a twelve-column masonry wall — tiles spanning 5, 4 or 3 columns in
 * a rotating pattern so the seams moved on every row. It read as an edited
 * gallery, which was the intent, and as a Pinterest board, which was not. It
 * is now three equal columns, two on a tablet, one on a phone, with every
 * card the same width and every card in a row the same height.
 *
 * Nothing here paints a background. The site layout's particle field sits
 * behind every route and the gaps between cards are where it shows through —
 * which is also why the gutters are generous now rather than tight.
 *
 * Server component. Reveal is the only client leaf.
 */

// Cards enter left to right across a row rather than all at once. Modulo the
// desktop column count, so the top row cascades and nothing below the fold
// waits on a delay it will never be seen paying.
const STAGGER_MS = 80;
const COLUMNS = 3;

export default function IndustryGallery() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6">
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {INDUSTRIES_WITH_IMAGES.map((industry, i) => (
          // The li and the Reveal both stretch so every card in a row shares
          // a height and their Explore links land on one line.
          <li key={industry.slug} className="flex">
            <Reveal
              y={24}
              duration={600}
              delay={(i % COLUMNS) * STAGGER_MS}
              className="flex w-full"
            >
              <IndustryCard industry={industry} />
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
