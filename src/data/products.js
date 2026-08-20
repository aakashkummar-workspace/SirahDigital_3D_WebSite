/*
 * The three products, in the order they are numbered wherever they appear.
 *
 *   id           stable key; also the slug, and the folder name under
 *                public/products/ that holds the screenshots
 *   slug         the URL segment — same string as `id`, named separately
 *                because routing reads `slug` and nothing should have to
 *                know those two are the same
 *   title        the product name — the loudest thing in its entry
 *   description  two lines at the width the homepage column gives it, so
 *                roughly 85 characters. This is the line a reader actually
 *                sees under the product name on the homepage — the tagline in
 *                productDetails.js is shorter and belongs to the product's
 *                own page, and the summary there is the paragraph. Keep the
 *                nouns concrete; this is also the page's meta description
 *   href         the product's own page
 *
 * The `label` field is gone. It rendered a small "PRODUCT" eyebrow above
 * every entry, which said the same word three times inside a section already
 * headed Products.
 *
 * The per-product `cta` string is gone too. All three said "Explore <name>";
 * the action belongs in the component rather than repeated three times here.
 *
 * This file is the "Homepage card" half of the product record — the same
 * split the CMS uses (sirah-cms/src/collections/Products.ts has a "Homepage
 * card" tab and a "Product page" tab). The page half lives in
 * data/productDetails.js. Keeping the shapes aligned is deliberate: when the
 * site is wired to Payload, each file maps to one tab.
 *
 * `href` used to be /contact on every entry, with a standing TODO to point it
 * somewhere real. /products/<slug> is that somewhere — see
 * app/(site)/products/[slug]/page.js. A checkout still does not exist, so the
 * action on the far end is "Book a demo" rather than a purchase.
 */
export const HOME_PRODUCTS = [
  {
    id: 'aura-transcriber',
    slug: 'aura-transcriber',
    title: 'Aura Transcriber',
    description:
      'Every telecaller call transcribed in Tamil and English, then read for what converts.',
    href: '/products/aura-transcriber',
  },
  {
    id: 'analytics-agents',
    slug: 'analytics-agents',
    title: 'Analytics Agents',
    description:
      'Website measurement planned, built and monitored, with tracking that keeps itself correct.',
    href: '/products/analytics-agents',
  },
  {
    id: 'nusi',
    slug: 'nusi',
    title: 'NUSI',
    description:
      'A whole nutrition practice in one workspace: clients, programs, AI coaching and billing.',
    href: '/products/nusi',
  },
  {
    id: 'tnpsc-mentors',
    slug: 'tnpsc-mentors',
    title: 'TNPSC Mentors',
    description:
      'TNPSC exam prep in Tamil and English — solved past papers, mocks and daily tests.',
    href: '/products/tnpsc-mentors',
  },
  {
    id: 'lexdraft',
    slug: 'lexdraft',
    title: 'LexDraft',
    description:
      'Practice management for Indian advocates — cases, drafting, billing and research in one place.',
    href: '/products/lexdraft',
  },
];
