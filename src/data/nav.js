import { SERVICES } from './services';
import { HOME_PRODUCTS } from './products';
import { TEAM } from './team';
import { INDUSTRIES } from './industries';

// The site's route map. Navbar and Footer both read from here, so adding a
// page is a single edit rather than three.
export const NAV_LINKS = [
  // The landing page is the root itself. It is the URL on every business
  // card, backlink and WhatsApp forward the old site accumulated, so it
  // renders rather than redirects — see next.config.js, where /hub is now
  // the one pointing here.
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    // Deep links into the service grid — each card carries its slug as an id.
    menu: SERVICES.slice(0, 4).map((s) => ({ label: s.title, href: `/services#${s.slug}` })),
    // The "see everything" row at the foot of the dropdown. It lives here
    // rather than in Navbar because it used to be hardcoded inside the shared
    // `link.menu &&` block, which appended "All services →" to the Products
    // menu as well. Data per item is what stops that recurring.
    menuFooter: { label: 'All services', href: '/services' },
  },
  {
    label: 'Products',
    href: '/products',
    // Each product is a whole route rather than an anchor, unlike Services.
    // Only three, so the menu is the full set.
    //
    // Note the desktop dropdown is the only place any of this appears:
    // Navbar's mobile sheet renders NAV_LINKS flat and ignores `menu`. On a
    // phone this is one "Products" link to the page itself.
    menu: HOME_PRODUCTS.map((p) => ({ label: p.title, href: p.href })),
    menuFooter: { label: 'All products', href: '/products' },
  },
  { label: 'Industries', href: '/industries' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Every crawlable route, with the priority hints the sitemap uses.
export const ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/products', priority: 0.9, changeFrequency: 'monthly' },
  // Spread rather than listed, so a fourth product needs no edit here.
  ...HOME_PRODUCTS.map((p) => ({
    path: p.href,
    priority: 0.8,
    changeFrequency: 'monthly',
  })),
  { path: '/industries', priority: 0.8, changeFrequency: 'monthly' },
  // One per sector. These were missing entirely, which left twelve
  // statically-generated pages — each with its own metadata and the longest
  // tail on the site — discoverable only by crawling the gallery. Spread, so
  // a new sector needs no edit here. Below /industries, above the team pages.
  ...INDUSTRIES.map(({ slug }) => ({
    path: `/industries/${slug}`,
    priority: 0.6,
    changeFrequency: 'monthly',
  })),
  // No /work entry — it redirects to /products, and a sitemap should not
  // advertise a URL that 301s.
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  // One per member, spread rather than listed so a new hire needs no edit
  // here. Lower priority than /about: these are depth behind the roster, not
  // entry points competing with it.
  ...TEAM.map(({ slug }) => ({
    path: `/${slug}`,
    priority: 0.5,
    changeFrequency: 'monthly',
  })),
  { path: '/contact', priority: 0.9, changeFrequency: 'yearly' },
  // Every "Book Free Consultation" on the site lands here, so it is a primary
  // conversion page, not an afterthought — hence parity with /contact. The
  // calendar itself is a third-party iframe with nothing to crawl; what ranks is
  // this page's own copy.
  { path: '/book', priority: 0.9, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
];

// Old single-page anchors mapped to the routes that replaced them. A hash is
// never sent to the server, so this cannot be a next.config redirect — the
// homepage resolves it on the client instead. See components/AnchorRedirect.
export const LEGACY_ANCHORS = {
  '#hub': '/',
  '#offer': '/services',
  '#industries': '/industries',
  '#work': '/products',
  '#process': '/about',
  '#brains': '/about',
  '#contact': '/contact',
  '#send-message': '/contact',
};
