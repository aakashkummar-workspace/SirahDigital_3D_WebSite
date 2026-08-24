/** @type {import('next').NextConfig} */
const nextConfig = {
  // A production `next build` and a running `next dev` cannot share one output
  // directory: the build replaces the dev server's unhashed chunks
  // (webpack.js, main.js, pages/_app.js) with hashed production ones, and
  // every asset on the open page starts 404ing.
  //
  // Setting NEXT_DIST_DIR sends a build somewhere else, so a verification
  // build can run while `npm run dev` stays up:
  //   NEXT_DIST_DIR=.next-verify npx next build
  distDir: process.env.NEXT_DIST_DIR || '.next',

  /*
   * ── Where remote images may be fetched from ──────────────────────────
   * next/image does not load a remote URL directly. It rewrites the src to
   * /_next/image?url=…, and that optimizer refuses any hostname not listed
   * here — with a 400, not a redirect to the original. The browser then shows
   * a broken-image icon, which is what the Latest Insights covers on /about
   * were doing: the CMS held correct URLs, Supabase served the files at 200,
   * and the optimizer in between rejected all three.
   *
   * Nothing in the build warns about this. The page renders, the <img> carries
   * a src, and the failure only exists at request time — so it survives a
   * green build and a green deploy and is visible only by looking at the page.
   *
   * Scoped to the public storage path rather than the whole host, so this
   * cannot be used to proxy arbitrary files out of the project. The hostname
   * is not a secret: it is in the src of every CMS image on the public site.
   * MEDIA_HOST overrides it if the bucket ever moves.
   */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.MEDIA_HOST || 'gjbgpyriviixotdroxvg.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  experimental: {
    /*
     * lib/industryImages, lib/productImages and lib/founderImages resolve
     * declared image paths against public/ with fs.existsSync, so a path with
     * no file behind it renders as a placeholder instead of a broken img.
     *
     * That check runs at module scope. During the build it is fine — the repo
     * is on disk. On Vercel it is not: public/ is uploaded as static assets
     * and is NOT traced into the serverless bundle, so when a page regenerates
     * through ISR every lookup returns false and every photograph silently
     * becomes a placeholder. The site would look progressively emptier with
     * nothing in the logs.
     *
     * Tracing is static analysis of imports and cannot see a computed
     * fs.existsSync path, so the directories those three modules probe have to
     * be named. Scoped rather than './public/**' to keep ~14 MB of fonts,
     * carousel and insight artwork out of every function bundle.
     */
    outputFileTracingIncludes: {
      '/**': [
        './public/images/**',
        './public/industries/**',
        './public/products/**',
        './public/team/**',
      ],
    },
  },

  async rewrites() {
    /*
     * The CMS is a separate Vercel project (it runs Next 15 / React 19, while
     * this app is pinned to React 18 by @react-three/fiber v8) but it is
     * served from this domain, so editors only ever see sirahdigital.in/admin.
     *
     * The CMS sets `basePath: '/admin'`, which puts its HTML, its /_next
     * chunks, Payload's REST API and its public/ all under that one prefix —
     * so this single pair of rules is the whole proxy, and none of this app's
     * own /api/* routes are shadowed.
     *
     * `beforeFiles` rather than `afterFiles`: nothing added to this app later
     * can accidentally take precedence over /admin.
     *
     * NB: destinations are inlined at build time. Changing CMS_ORIGIN needs a
     * redeploy, not just an env update.
     */
    const cmsOrigin = process.env.CMS_ORIGIN;
    if (!cmsOrigin) {
      // Local dev without the CMS running is a normal state — the site
      // degrades to its bundled content. Warn rather than fail the build,
      // but make it loud, because in production this means /admin 404s.
      console.warn('[next.config] CMS_ORIGIN is not set — /admin will not be proxied.');
      return [];
    }

    return {
      beforeFiles: [
        { source: '/admin', destination: `${cmsOrigin}/admin` },
        { source: '/admin/:path*', destination: `${cmsOrigin}/admin/:path*` },
      ],
    };
  },

  async redirects() {
    /*
     * Path-level redirects only. Links to the old single-page anchors
     * (/#offer, /#brains …) cannot be handled here — a URL fragment is never
     * sent to the server — so the homepage forwards those on the client.
     * See components/sections/AnchorRedirect.jsx.
     *
     * `statusCode: 301` rather than `permanent: true`, which emits 308.
     * Google treats the two identically, but the long tail that matters for a
     * business selling over WhatsApp — link-preview fetchers, LinkedIn's
     * scraper, email security scanners, older link checkers — implements 301
     * reliably and 308 unevenly. Every source here is GET, so 308's method
     * preservation buys nothing.
     *
     * The root is deliberately absent: '/' renders. It is the URL on every
     * backlink, business card and directory listing the old site accumulated,
     * and it is the one URL that must not change behaviour at cutover.
     */
    return [
      // /hub was this app's landing route before the root became a real page.
      // It never went live publicly; this is insurance against a stray
      // staging link.
      { source: '/hub', destination: '/', statusCode: 301 },

      // ── Routes of the Vite SPA this replaced ──────────────────────────
      // Verified against the live bundle before it was retired.
      { source: '/why-us', destination: '/about', statusCode: 301 },
      { source: '/team', destination: '/about#team', statusCode: 301 },
      { source: '/process', destination: '/about#process', statusCode: 301 },
      // "Our Solutions" listed capabilities — chatbots, CRM automation,
      // WhatsApp — not the three named products. That is /services.
      { source: '/our-solutions', destination: '/services', statusCode: 301 },
      { source: '/solutions', destination: '/services', statusCode: 301 },

      // ── Pre-SPA WordPress URLs still in Google's index ────────────────
      { source: '/about-us', destination: '/about', statusCode: 301 },
      { source: '/home', destination: '/', statusCode: 301 },

      // ── This app's own earlier URLs ───────────────────────────────────
      { source: '/service', destination: '/services', statusCode: 301 },
      { source: '/contact-us', destination: '/contact', statusCode: 301 },

      // /work merged into /products — the products it listed were the same
      // three that page already carried, and the client systems moved with it.
      { source: '/work', destination: '/products', statusCode: 301 },
      { source: '/projects', destination: '/products', statusCode: 301 },
      { source: '/portfolio', destination: '/products', statusCode: 301 },
    ];
  },
};

module.exports = nextConfig;
