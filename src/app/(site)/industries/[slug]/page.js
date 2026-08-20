import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INDUSTRIES } from '@/data/industries';
import { INDUSTRY_INTELLIGENCE } from '@/data/industryIntelligence';
import { INDUSTRY_WORKFLOWS } from '@/data/industryWorkflows';
import { getIndustry } from '@/lib/industryImages';
import WorkflowTimeline from '@/components/industries/WorkflowTimeline';

import { SecondaryButton } from '@/components/ui/Button';
/*
 * One sector's page — the target of every tile in the gallery.
 *
 * industries_page.md asks for the tiles to open a dedicated page and says to
 * keep existing routing, but no per-slug route had been built, so twelve
 * tiles would otherwise have led to twelve 404s. The spec designs the gallery
 * and not this, so the layout here is deliberately plain: transparent over
 * the site's particle field like every other route, carrying the same type
 * and palette as the gallery it came from. The copy is the sector data that
 * was already in the repo.
 */

const bySlug = Object.fromEntries(INDUSTRY_INTELLIGENCE.map((i) => [i.slug, i]));

export function generateStaticParams() {
  return INDUSTRIES.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }) {
  const industry = INDUSTRIES.find((i) => i.slug === params.slug);
  if (!industry) return {};
  return {
    title: industry.title,
    description: industry.desc,
    alternates: { canonical: `/industries/${industry.slug}` },
  };
}

export default function IndustryPage({ params }) {
  // Resolved against public/, so a photograph that has not been added yet
  // drops the block rather than rendering a broken image.
  const industry = getIndustry(params.slug);
  if (!industry) notFound();

  const detail = bySlug[industry.slug];

  const workflow = INDUSTRY_WORKFLOWS[industry.slug];

  return (
    /*
     * The prose column stays at 860px — that is a readable measure and the
     * copy should not get wider. The timeline is the exception: seven nodes
     * across 860px leaves about 110px each, which is not enough for an icon,
     * a title and a line of description. It gets its own wider container
     * rather than the text being stretched to accommodate it.
     */
    <article className="pb-28 pt-14 md:pb-36 md:pt-20">
      <div className="mx-auto max-w-[860px] px-6">
        <Link
          href="/industries"
          className="inline-flex items-center gap-2 text-fluid-sm font-medium text-brand-muted transition-colors hover:text-white"
        >
          <span aria-hidden="true">←</span> Industries
        </Link>

        <header className="mt-10">
          {detail?.tagline && (
            <p className="text-fluid-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">
              {detail.tagline}
            </p>
          )}
          <h1 className="mt-4 text-fluid-2xl font-bold leading-[1.1] tracking-tight text-white">
            {industry.title}
          </h1>
          <p className="mt-6 max-w-[640px] text-fluid-base leading-relaxed text-brand-muted">
            {detail?.summary || industry.desc}
          </p>
        </header>
      </div>

      {workflow && (
        <div className="mx-auto mt-12 max-w-6xl px-6">
          <WorkflowTimeline steps={workflow} />
        </div>
      )}

      <div className="mx-auto max-w-[860px] px-6">
      {detail?.metric && (
        <p className="mt-12 flex items-baseline gap-4 border-t border-white/10 pt-8">
          <span className="text-fluid-2xl font-bold leading-none tracking-tight text-white">
            {detail.metric.value}
          </span>
          <span className="text-fluid-sm text-brand-muted">{detail.metric.label}</span>
        </p>
      )}

      {detail?.outcomes?.length > 0 && (
        <section className="mt-14">
          <h2 className="text-fluid-lg font-semibold tracking-tight text-white">What we build</h2>
          <ul className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {detail.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-3 text-fluid-sm leading-relaxed text-brand-muted">
                <span
                  aria-hidden="true"
                  className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-cyan"
                />
                {outcome}
              </li>
            ))}
          </ul>
        </section>
      )}

      {detail?.guarantee && (
        <p className="mt-14 border-l-2 border-brand-cyan pl-6 text-fluid-base leading-relaxed text-white">
          {detail.guarantee}
        </p>
      )}

      {detail?.stack?.length > 0 && (
        <section className="mt-14">
          <h2 className="text-fluid-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">
            Typical stack
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {detail.stack.map((tool) => (
              <li
                key={tool}
                className="rounded-full border border-white/10 px-3.5 py-1.5 text-fluid-xs text-brand-muted"
              >
                {tool}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16 border-t border-white/10 pt-10">
        {/* Was a hand-rolled bordered pill with its own hover colour — the
            same control .btn-secondary already describes, so it uses that. */}
        <SecondaryButton href="/contact" arrow>
          Book a free consultation
        </SecondaryButton>
      </div>
      </div>
    </article>
  );
}
