import React from 'react';
import Reveal from '@/components/ui/Reveal';

/*
 * The title + standfirst above one section of a product page.
 *
 * Deliberately not sections/SectionHeader.jsx. That component is the site's
 * general-purpose section head: a `text-4xl` AnimatedHeading with a fixed
 * `mb-16`. This page is set on a clamped editorial scale — the h1 and the tour
 * headings both use clamp() — and dropping a 4xl heading between them would
 * read as a heading from a different page. Same reason /products/[slug] does
 * not adopt the reference design's white palette.
 *
 * Shared by both headed sections on the page — what you get, and what happens
 * to your data — which is why it is a component rather than two copies of the
 * same two elements. It is separate from DetailGrid because a headed section
 * that is not a grid is the obvious next caller.
 *
 * Server component; Reveal is the only client leaf.
 */
export default function SectionLead({ title, subtitle, id }) {
  return (
    <div className="max-w-[640px]">
      <Reveal y={14} duration={640}>
        <h2
          id={id}
          className="text-[clamp(1.5rem,1.15rem+1.3vw,2.125rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-white"
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal y={12} duration={640} delay={90}>
          <p className="mt-4 text-[1rem] leading-[1.7] text-brand-muted/70">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
