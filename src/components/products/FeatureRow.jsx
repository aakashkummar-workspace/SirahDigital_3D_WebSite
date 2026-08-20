import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { iconFor } from './productIcons';

/*
 * The three-column feature row — the reference layout's middle band.
 *
 * Icon, title, one paragraph, stacked; three across from 768px, one per row
 * below it. No card, no border, no plate: the columns sit directly on the
 * site's particle field the way the rest of the page does, separated by space
 * rather than by a box. Boxing them would make three short paragraphs look
 * like a pricing table.
 *
 * Server component; Reveal is the only client leaf.
 */
export default function FeatureRow({ features }) {
  if (!features?.length) return null;

  return (
    <section aria-label="Features" className="mx-auto w-full max-w-[1100px] px-6">
      <ul role="list" className="grid gap-x-10 gap-y-12 md:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = iconFor(feature.icon);
          return (
            <li key={feature.title}>
              <Reveal y={14} duration={620} delay={i * 110}>
                <Icon
                  className="h-5 w-5 text-brand-cyan"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="mt-5 text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.7] text-brand-muted/70">
                  {feature.desc}
                </p>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
