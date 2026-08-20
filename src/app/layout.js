import "./globals.css";
import { COMPANY } from "@/data/company";

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
    <html lang="en">
      <head>
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
        {children}
      </body>
    </html>
  );
}
