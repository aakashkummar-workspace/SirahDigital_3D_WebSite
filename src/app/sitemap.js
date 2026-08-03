import { COMPANY } from '@/data/company';
import { ROUTES } from '@/data/nav';

// One entry per route. The single-page site had nothing to list here.
export default function sitemap() {
  const lastModified = new Date();
  return ROUTES.map((r) => ({
    url: `${COMPANY.url}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
