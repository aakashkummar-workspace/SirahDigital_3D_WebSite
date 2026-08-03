import { COMPANY } from '@/data/company';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Internal preview route and the lead endpoint.
      disallow: ['/animations', '/api/'],
    },
    sitemap: `${COMPANY.url}/sitemap.xml`,
  };
}
