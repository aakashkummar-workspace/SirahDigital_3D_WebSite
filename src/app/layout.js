import "./globals.css";
import { COMPANY } from "@/data/company";
import { SOCIALS } from "@/data/socials";

/**
 * Typefaces are self-hosted, not loaded here.
 *
 * The site had no webfont at all originally, then Inter Tight via
 * next/font/google. It now runs three faces declared in
 * globals.css — Cormorant Garamond for headings, Satoshi for body, Zodiak
 * for digits.
 * next/font is gone from this file entirely: none of the three is in Google's
 * catalogue, so none of them can come through it.
 *
 * What that costs, and why it is accepted: next/font does two things a plain
 * @font-face does not — it emits a <link rel=preload> for the file, and it
 * derives a size-adjusted local fallback so the swap does not shift layout.
 * Both are given up here. The mitigation is that all three files are small
 * variable cuts (~110KB together, less than the single Google pairing that
 * preceded them) and every one is declared font-display: swap.
 *
 * Geist, Satoshi and General Sans were the brief's original choices. Satoshi
 * is now in. The note that used to sit here claiming it "would need a
 * licence" was wrong — Fontshare is free for commercial use — and that error
 * is what kept it out for so long.
 */

/**
 * Theme boot — runs before first paint, ahead of every bundle.
 *
 * Without this the server would emit its default theme, the page would paint
 * in it, and the toggle's stored value would only land once React hydrated:
 * a visible flash of the wrong theme on every navigation-free load. The
 * script is inline and synchronous for exactly that reason — a module, a
 * defer, or anything React-driven is already too late.
 *
 * Precedence matches resolveTheme() in lib/theme.js: an explicit stored
 * choice, then the OS preference, then dark as the brand default. The key and
 * the attribute name are restated as literals rather than imported because
 * nothing can be imported at this point in the document.
 *
 * The try/catch is not defensive padding: reading localStorage *throws* in
 * Safari's private mode rather than returning null, and an uncaught throw
 * here would take out the whole inline block and leave <html> unset.
 */
const THEME_BOOT = `(function(){try{var k='sirah-theme',v=null;try{v=localStorage.getItem(k)}catch(e){}var t=(v==='light'||v==='dark')?v:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');var r=document.documentElement;r.setAttribute('data-theme',t);r.style.colorScheme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#FFFFFF':'#16142C')}catch(e){}})();`;

export const metadata = {
  // metadataBase lets every page declare a relative canonical and lets OG
  // image paths resolve to absolute URLs.
  metadataBase: new URL(COMPANY.url),
  title: {
    default: "Sirah Digital | Intelligent Business Automation Systems",
    // Each route supplies its own title; this wraps it.
    template: "%s | Sirah Digital",
  },
  description: "Automate, simplify, and scale through custom software.",
  openGraph: {
    siteName: "Sirah Digital",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }) {
  return (
    /*
     * data-theme is emitted as the default and then corrected in place by
     * THEME_BOOT below. React re-reads <html>'s attributes at hydration and
     * finds one it did not write, hence suppressHydrationWarning — it is
     * scoped to this element only and does not extend to the tree inside.
     */
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Must be the first thing in the document that executes. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        {/*
          Repaints the mobile browser chrome to match the page. The value
          here is only the pre-boot default; THEME_BOOT and applyTheme()
          both rewrite it, so the tag has to exist before either runs.
        */}
        <meta name="theme-color" content="#16142C" />

        {/*
         * Preload, by hand.
         *
         * This is the half of next/font worth recovering. Without it the
         * browser does not discover a font until it has parsed the CSS,
         * matched a rule and laid out an element that needs it — three
         * round-trips deep — so the first paint is in the fallback and the
         * swap is visible. These three tags start all three files with the
         * document.
         *
         * crossOrigin is required even though these are same-origin: font
         * fetches are CORS-mode by spec, and a preload whose mode does not
         * match the later fetch is discarded and re-fetched, which is worse
         * than not preloading at all.
         */}
        <link rel="preload" href="/fonts/cormorant-garamond.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/satoshi.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/zodiak.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      {/* overflow-x-hidden guarantees the "no horizontal scrolling" rule
          holds even if a decorative glow overshoots the viewport. */}
      <body className="bg-space antialiased m-0 p-0 overflow-x-hidden">
        {/*
          Organization schema. The site this replaced shipped one and this app
          did not, which was a straight regression: it is what ties the brand
          name, the Chennai address and the social profiles together into a
          single entity for Google, rather than leaving them to be inferred.

          Built from data/company.js and data/socials.js so it cannot drift
          from the footer and the contact page. sameAs takes profile pages
          only — the WhatsApp click-to-chat link is a deep link, not a profile,
          and listing it there says nothing true about identity.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: COMPANY.name,
              url: COMPANY.url,
              logo: `${COMPANY.url}/logo.png`,
              email: COMPANY.email,
              telephone: COMPANY.phone,
              description: COMPANY.blurb,
              address: {
                '@type': 'PostalAddress',
                streetAddress: COMPANY.addressOneLine,
                addressLocality: 'Chennai',
                addressRegion: 'Tamil Nadu',
                postalCode: '600044',
                addressCountry: 'IN',
              },
              sameAs: SOCIALS.filter((s) => s.label !== 'WhatsApp').map((s) => s.href),
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
