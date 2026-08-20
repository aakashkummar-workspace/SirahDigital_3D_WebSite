import { HOME_PRODUCTS } from '@/data/products';
import PortfolioCylinder from '@/components/portfolio/PortfolioCylinder';
import { PRODUCT_DETAILS } from '@/data/productDetails';
import ProductScrollStage from '@/components/products/ProductScrollStage';
import { PORTFOLIO_CATEGORIES, PORTFOLIO_CTA } from '@/data/portfolio';
import ProjectList from '@/components/projects/ProjectList';
import Reveal from '@/components/ui/Reveal';
import CTABand from '@/components/sections/CTABand';

export const metadata = {
  title: 'Products & Work',
  description:
    'Aura Transcriber, Analytics Agents and NUSI - three products Sirah Digital has built - alongside the live client systems behind them: clinical workflow automation, multi-warehouse ERP integration and WhatsApp commerce infrastructure.',
  alternates: { canonical: '/products' },
};

/*
 * Everything Sirah Digital has built — the products, then the client systems.
 *
 * This page is the merge of /products and /work. Those two listed the same
 * products twice: this page's rows, and a `ProductShowcase` plate on
 * /work that has been deleted. /work now redirects here. The three product
 * detail pages at /products/<slug> are untouched — this is the index, not
 * the whole story.
 *
 * ── three bands, deliberately unalike ────────────────────────────────────
 *
 * The products are a rotating cylinder — one product facing you at a time,
 * turning slowly. The custom software portfolio is a pinned stage: oversized
 * figures, an arc, one category at a time. The client systems are a quiet row
 * list. That contrast is the point: a product you can buy and a system we
 * built for one client are different offers, and the page should not need a
 * label to tell you which one you are looking at.
 *
 * The first two treatments used to be the other way round. They were swapped
 * deliberately — the cylinder gives each product a face of its own, which is
 * what a thing you can buy wants, while the arc's numbered run suits a
 * portfolio you read down.
 *
 * What holds them together is the measure. /work ran at 1160px and this ran
 * at 1100; both halves are now 1100, inside work_redesign.md §18's range.
 * ProjectList and the stage's own module each carry that number.
 *
 * ── on the two sets of numbers ───────────────────────────────────────────
 * Both the stage and the rows count from 01. That was avoided while both were
 * plain rows, because two identical figures at two sizes read as a mistake.
 * The stage changes the calculus: its figures run to 7rem against the client
 * rows' 0.75rem, under a different treatment, a screen of scroll apart. They
 * no longer look like one sequence someone mis-numbered — they look like two
 * lists, which is what they are.
 *
 * No surfaces. Deleting ProductShowcase took the site's only card-grid-on-a-
 * plate with it, and the ROI calculator's scrim moved to /contact. Both bands
 * here are type and hairline rules over the particle field, untouched, which
 * is what work_redesign.md §4 and §23 ask for.
 */

/*
 * The products, in the cylinder's shape.
 *
 * Only what a panel renders. PRODUCT_DETAILS also carries heroShot and
 * screenshots, and the cylinder is a client component — passing the whole
 * record would serialise every screenshot path into the RSC payload for a
 * section that shows no images.
 *
 * `description` from HOME_PRODUCTS is the note rather than `summary` from
 * PRODUCT_DETAILS, and the difference matters here: the summaries run to
 * ~230 characters, which at a 460px panel is eight lines and overflows the
 * fixed panel height the cylinder needs to keep its headings aligned. The
 * descriptions are written to about 85 characters for exactly this kind of
 * column.
 */
const PRODUCT_PANELS = HOME_PRODUCTS.map((product) => ({
  id: product.id,
  name: product.title,
  lines: [
    {
      name: PRODUCT_DETAILS[product.slug]?.tagline || product.title,
      note: product.description,
    },
  ],
  cta: { label: `Explore ${product.title}`, href: product.href },
}));

/*
 * The portfolio categories, in the stage's shape.
 *
 * One item per category, its projects as the item's lines. All five share one
 * CTA — see the note on PORTFOLIO_CTA in data/portfolio.js.
 */
const PORTFOLIO_ITEMS = PORTFOLIO_CATEGORIES.map((category) => ({
  key: category.id,
  title: category.name,
  lines: category.projects,
  href: PORTFOLIO_CTA.href,
  ctaLabel: PORTFOLIO_CTA.label,
}));
export default function ProductsPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1100px] px-6 pb-4 pt-20 md:pt-28">
        <div className="max-w-[760px]">
          <Reveal duration={700} y={12}>
            <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.42em] text-white/40">
              What we&rsquo;ve built
            </span>
          </Reveal>

          {/*
           * work_redesign.md's heading rather than products_final.md's,
           * because it is the one line that covers both halves of the page —
           * a product we sell and a system we built for a client are both
           * "systems built around real operational problems", and the route
           * being called /products does not make the client systems below any
           * less of one.
           */}
          <Reveal delay={120} duration={700} y={24}>
            <h1 className="mt-7 text-balance text-[clamp(2rem,1.1rem+2.9vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white">
              Systems built around real operational problems.
            </h1>
          </Reveal>

          <Reveal delay={240} duration={700} y={16}>
            <p className="mt-7 max-w-[560px] text-[1.0625rem] leading-[1.7] text-brand-muted/70">
              Four products anyone can run, and the client systems we built
              the same way - from production automation to emerging AI.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── products ─────────────────────────────────────────────────────── */}
      {/*
       * The products on a slowly turning cylinder, one facing the viewer at a
       * time. Client component, because a frame loop drives the rotation.
       *
       * No screenshots here. The frames that used to sit in this band moved
       * out with the redesign — the type is the visual now, and a screenshot
       * on a panel turning in 3D fights it for the eye. Every shot still
       * renders on that product's own page, which is where someone who wants
       * to see the product rather than read about it is going.
       */}
      <div id="products" className="scroll-mt-28 pt-16 md:pt-24">
        <PortfolioCylinder
          title="Products"
          /* Deliberately does not open on "Four products anyone can run" —
             the page intro two screens up already opens on exactly that, and
             the pair read as one line printed twice. */
          subtitle="Each one started as a problem a client was paying people to solve by hand."
          items={PRODUCT_PANELS}
        />
      </div>

      {/* ── custom software portfolio ─────────────────────────────────── */}
      {/*
       * The client systems by category, on the pinned arc stage: the panel
       * sticks to the viewport and scrolling advances which category it
       * describes, tracing the curve as it goes.
       *
       * 68svh per item rather than the default screen each. Five categories at
       * a full viewport apiece would be five screens of scroll for one band,
       * which is longer than the rest of the page put together.
       */}
      <div id="portfolio" className="scroll-mt-28 pt-28 md:pt-40">
        <ProductScrollStage
          label="[ Custom software ]"
          items={PORTFOLIO_ITEMS}
          itemHeight="68svh"
        />
      </div>

      {/* ── client work ──────────────────────────────────────────────────── */}
      {/* scroll-mt-28 clears the fixed navbar — every inbound link that used
          to point at /work now points at this anchor.
          The anchor is #client-systems, not #case-studies. There are no case
          studies to link to yet — no per-project page exists — so nothing on
          the site promises one any more. Renamed rather than dropped because
          several inbound links land here. */}
      <div id="client-systems" className="scroll-mt-28 pt-28 md:pt-40">
        <ProjectList />
      </div>

      <div className="mt-28 md:mt-36">
        <CTABand
          title="Have a workflow worth automating?"
          subtitle="Let's build the system around it."
        />
      </div>
    </>
  );
}
