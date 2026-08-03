import { SERVICES } from './services';

// The site's route map. Navbar and Footer both read from here, so adding a
// page is a single edit rather than three.
export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    // Deep links into the service grid — each card carries its slug as an id.
    menu: SERVICES.slice(0, 4).map((s) => ({ label: s.title, href: `/services#${s.slug}` })),
  },
  { label: 'Industries', href: '/industries' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Every crawlable route, with the priority hints the sitemap uses.
export const ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/industries', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/work', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.9, changeFrequency: 'yearly' },
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
  '#work': '/work',
  '#process': '/about',
  '#brains': '/about',
  '#contact': '/contact',
  '#send-message': '/contact',
};
