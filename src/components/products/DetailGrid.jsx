import React from 'react';
import Reveal from '@/components/ui/Reveal';
import SectionLead from './SectionLead';
import { iconFor } from './productIcons';

/*
 * A headed grid of title + paragraph items, with an optional list of caveats
 * under it. Used twice on every product page: once for what the product tells
 * you, once for what it does with your data.
 *
 * One component for both because they are the same object — a set of short
 * claims, each needing a sentence or two — and two would have drifted apart on
 * spacing the first time either was touched. What differs is the data:
 * `outcomes` names no icons and gets a plain grid, `trust` names one per item
 * and gets a glyph. FeatureRow always draws an icon, so this is not that
 * component with a flag added; six icons above six one-line headings is a lot
 * of decoration for a section whose point is the reading.
 *
 * `limits` is the part worth not losing in a later refactor. On Aura it carries
 * the unsupported handsets and the calls the product cannot record; on NUSI the
 * setup fee; on Analytics Agents the fact that it is not finished. It is set as
 * body copy under a rule rather than as a warning: these products state such
 * things in the same voice as everything else, and a red box would make a
 * deliberate disclosure look like an error.
 *
 * `limitsHeading` renames that block. It defaults to "What it does not do",
 * which is right for a shipped product listing what it cannot handle and wrong
 * for one listing where it has got to — hence Analytics Agents' "Where it is
 * today".
 *
 * Server component; Reveal is the only client leaf.
 */
export default function DetailGrid({ section, id, columns = 3 }) {
  if (!section?.items?.length) return null;
  const { title, subtitle, items, limits, links, limitsHeading } = section;

  // Two-up reads better for three long items, three-up for six short ones.
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section aria-labelledby={id} className="mx-auto w-full max-w-[1100px] px-6">
      <SectionLead id={id} title={title} subtitle={subtitle} />

      <ul role="list" className={`mt-14 grid gap-x-10 gap-y-12 md:mt-16 ${gridCols}`}>
        {items.map((item, i) => {
          const Icon = item.icon ? iconFor(item.icon) : null;
          return (
            <li key={item.title}>
              {/* Delay resets per row so the third card in row two does not
                  wait on the whole grid before it appears. */}
              <Reveal y={14} duration={620} delay={(i % 3) * 90}>
                {Icon && (
                  <Icon
                    className="mb-5 h-5 w-5 text-brand-cyan"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}
                <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-[1.7] text-brand-muted/70">
                  {item.desc}
                </p>
              </Reveal>
            </li>
          );
        })}
      </ul>

      {limits?.length > 0 && (
        <Reveal y={14} duration={640} delay={100}>
          <div className="mt-16 border-t border-white/10 pt-8">
            <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.42em] text-white/30">
              {limitsHeading || 'What it does not do'}
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              {limits.map((limit) => (
                <li key={limit} className="flex max-w-[80ch] gap-4">
                  <span aria-hidden="true" className="select-none text-white/25">
                    -
                  </span>
                  <span className="text-[0.9375rem] leading-[1.7] text-brand-muted/60">
                    {limit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      {links?.length > 0 && (
        <Reveal y={12} duration={620} delay={140}>
          <ul role="list" className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
            {links.map((link) => (
              <li key={link.href}>
                {/* These pages live on the product's own site, not this one, so
                    they are plain anchors rather than next/link, and the glyph
                    says the tab is going to change. */}
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fluid-sm font-medium text-brand-muted transition-colors hover:text-white"
                >
                  {link.label}{' '}
                  <span aria-hidden="true" className="text-white/30">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </section>
  );
}
