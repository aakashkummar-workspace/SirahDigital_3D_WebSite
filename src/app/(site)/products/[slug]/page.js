import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HOME_PRODUCTS } from '@/data/products';
import { getProduct } from '@/lib/productImages';
import ScreenshotFrame from '@/components/products/ScreenshotFrame';
import FeatureRow from '@/components/products/FeatureRow';
import ScreenshotTour from '@/components/products/ScreenshotTour';
import DetailGrid from '@/components/products/DetailGrid';
import QuoteRow from '@/components/products/QuoteRow';
import Reveal from '@/components/ui/Reveal';
import CTABand from '@/components/sections/CTABand';

import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
/*
 * One product's page.
 *
 * Structure follows the reference the redesign was briefed against: hero,
 * one wide screenshot, a three-column feature row, a tour of further shots,
 * a closing band. What it does not follow is that reference's palette — the
 * page sits on the site's particle field in the site's dark type like every
 * other route, because a white editorial page bolted onto this site would
 * read as a different website.
 *
 * Three sections sit inside that spine and render only when the product's data
 * carries them: what you get, the quotes, and what happens to your data. Aura
 * is the only product with all three today — it has its own product site to
 * source them from — and the other two pages are the same page minus those
 * blocks rather than a different layout. Order is deliberate: mechanism (the
 * feature row), then result, then proof, then the terms. The trust block is
 * last because it is what a buyer reads once they already want the thing, and
 * it is the one place on the page that says what the product cannot do.
 *
 * The tour is a fourth such section, and Aura no longer carries it: one frame
 * says what the product looks like, and the two further captions were two more
 * screenshots nobody had taken. The other two products still list theirs.
 *
 * Routing mirrors industries/[slug]: the only other dynamic route here, and
 * the shape worth having exactly one of. params is read synchronously — this
 * is Next 14, not 15.
 *
 * Nothing on this page paints a background. The layout's WebGL field is
 * behind every route and a section fill here would cover it.
 */

export function generateStaticParams() {
  return HOME_PRODUCTS.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }) {
  const product = HOME_PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default function ProductPage({ params }) {
  // Screenshots are resolved against public/ here, so a shot that has not
  // been taken yet renders as a captioned placeholder rather than a broken
  // image. See lib/productImages.js.
  const product = getProduct(params.slug);
  if (!product) notFound();

  const detail = product.detail;

  return (
    <article className="pb-8 pt-14 md:pt-20">
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <header className="mx-auto w-full max-w-[1100px] px-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-fluid-sm font-medium text-brand-muted transition-colors hover:text-white"
        >
          <span aria-hidden="true">←</span> Products
        </Link>

        <div className="mt-10 max-w-[760px]">
          {detail?.tagline && (
            <Reveal duration={700} y={12}>
              <p className="text-[0.6875rem] font-medium uppercase tracking-[0.42em] text-brand-cyan">
                {detail.tagline}
              </p>
            </Reveal>
          )}

          <Reveal delay={110} duration={700} y={24}>
            <h1 className="mt-6 text-balance text-[clamp(2rem,1.1rem+2.9vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white">
              {product.title}
            </h1>
          </Reveal>

          <Reveal delay={220} duration={700} y={16}>
            <p className="mt-7 max-w-[560px] text-[1.0625rem] leading-[1.7] text-brand-muted/70">
              {detail?.summary || product.description}
            </p>
          </Reveal>

          {/*
           * "Book a demo", not "Buy now". There is still no checkout route —
           * the label the /work card used to carry promised a purchase that
           * landed on a contact form. This says what actually happens.
           *
           * The same test applies to the "Get it now" beside it: it is allowed
           * only because the product it belongs to has a landing page of its
           * own to receive the click. See `landingUrl` in data/productDetails.
           */}
          <Reveal delay={320} duration={700} y={14}>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              {/* Carries the product, so the enquiry form on the other end
                  opens with this one already ticked rather than asking a
                  visitor who just read a whole page about it. See
                  PRESELECT_PARAM in sections/ContactForm.jsx. */}
              <PrimaryButton href={`/contact?product=${product.slug}`} arrow>
                Book a demo
              </PrimaryButton>
              {/* A product with a landing page of its own gets a second
                  button pointing at it; everything else keeps the quiet link
                  to the client systems. Both sit beside "Book a demo" rather
                  than replacing it — the demo is still the action this site
                  is asking for. */}
              {detail?.landingUrl ? (
                <SecondaryButton
                  href={detail.landingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  arrow
                >
                  Get it now
                </SecondaryButton>
              ) : (
                <Link
                  href="/products"
                  className="text-fluid-sm font-medium text-brand-muted transition-colors hover:text-white"
                >
                  See our work
                </Link>
              )}
            </div>
          </Reveal>

          {/* The reassurances a product states under its own CTA, when it has
              them. A list rather than one string with separators, so a screen
              reader gets three items and a narrow viewport can wrap between
              them instead of mid-clause. */}
          {detail?.assurances?.length > 0 && (
            <Reveal delay={400} duration={700} y={12}>
              <ul
                role="list"
                className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8125rem] text-brand-muted/55"
              >
                {detail.assurances.map((line) => (
                  <li key={line} className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="h-1 w-1 rounded-full bg-brand-cyan/50"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>
      </header>

      {/* ── hero screenshot ──────────────────────────────────────────────── */}
      {detail?.heroShot && (
        <div className="mx-auto mt-16 w-full max-w-[1100px] px-6 md:mt-20">
          <Reveal y={24} duration={780}>
            <ScreenshotFrame shot={detail.heroShot} priority />
          </Reveal>
        </div>
      )}

      {/* ── features ─────────────────────────────────────────────────────── */}
      {detail?.features?.length > 0 && (
        <div className="mt-24 md:mt-32">
          <FeatureRow features={detail.features} />
        </div>
      )}

      {/* ── what you get ─────────────────────────────────────────────────── */}
      {detail?.outcomes?.items?.length > 0 && (
        <div className="mt-28 md:mt-40">
          <DetailGrid section={detail.outcomes} id="what-you-get" columns={2} />
        </div>
      )}

      {/* ── tour ─────────────────────────────────────────────────────────── */}
      {detail?.screenshots?.length > 0 && (
        <div className="mt-28 md:mt-40">
          <ScreenshotTour screenshots={detail.screenshots} />
        </div>
      )}

      {/* ── proof ────────────────────────────────────────────────────────── */}
      {detail?.quotes?.length > 0 && (
        <div className="mt-28 md:mt-40">
          <QuoteRow quotes={detail.quotes} />
        </div>
      )}

      {/* ── your data ────────────────────────────────────────────────────── */}
      {detail?.trust?.items?.length > 0 && (
        <div className="mt-28 md:mt-40">
          <DetailGrid section={detail.trust} id="your-data" columns={3} />
        </div>
      )}

      {/* Reused rather than rebuilt — the band is the site's standard closing
          transition into the footer, the same one /industries lands on. */}
      <div className="mt-28 md:mt-36">
        {/* A product with its own offer states it here; the rest fall back to
            the walkthrough line, which is true of all three. */}
        <CTABand
          href={`/contact?product=${product.slug}`}
          title={detail?.offer?.title || `Want to see ${product.title} on your data?`}
          subtitle={
            detail?.offer?.subtitle ||
            'Book a walkthrough and we will show you how it fits your operation.'
          }
        />
      </div>
    </article>
  );
}
