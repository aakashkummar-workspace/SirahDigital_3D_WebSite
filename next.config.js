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
      { source: '/team', destination: '/about', permanent: true },
      { source: '/process', destination: '/about', permanent: true },
      { source: '/projects', destination: '/work', permanent: true },
      { source: '/portfolio', destination: '/work', permanent: true },
      { source: '/service', destination: '/services', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
    ];
  },
};

module.exports = nextConfig;
