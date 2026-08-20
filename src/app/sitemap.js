import { COMPANY } from '@/data/company';
import { ROUTES } from '@/data/nav';

/*
 * One entry per crawlable route, from data/nav.js.
 *
 * No `lastModified`. Next would happily take `new Date()` here, but that is
 * evaluated at build time, so every URL would claim to have changed on every
 * deploy — including the pages that did not. Google learns to distrust the
 * field and then discounts it site-wide, which costs us the real signal later
 * when these pages are CMS-driven and carry an actual updatedAt.
 *
 * An absent lastmod is strictly better than a false one.
 */
export default function sitemap() {
  return ROUTES.map((r) => ({
    url: `${COMPANY.url}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
