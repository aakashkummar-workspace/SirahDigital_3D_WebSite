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

  async redirects() {
    // Path-level redirects only. Links to the old single-page anchors
    // (/#offer, /#brains …) cannot be handled here — a URL fragment is never
    // sent to the server — so the homepage forwards those on the client.
    // See components/sections/AnchorRedirect.jsx.
    return [
      // The landing page moved to /hub. 307 rather than 308 on purpose: a
      // permanent redirect on the root URL is cached hard by every browser
      // that sees it once, and undoing that is a support problem rather than
      // a deploy. Flip `permanent` to true once /hub is settled.
      { source: '/', destination: '/hub', permanent: false },

      { source: '/team', destination: '/about', permanent: true },
      { source: '/process', destination: '/about', permanent: true },
      { source: '/service', destination: '/services', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },

      // /work merged into /products — the products it listed were the same
      // three that page already carried, and the case studies moved with it.
      // The fragment is not sent to the server, so these land at the top of
      // /products rather than on the case studies; that is the right landing
      // for /work itself, and the two below inherit it.
      { source: '/work', destination: '/products', permanent: true },
      { source: '/projects', destination: '/products', permanent: true },
      { source: '/portfolio', destination: '/products', permanent: true },
    ];
  },
};

module.exports = nextConfig;
