import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/layout/ChatWidget';

/**
 * Chrome for every public page.
 *
 * `(site)` is a route group: the parentheses keep it out of the URL, so the
 * homepage is still `/`. The navbar and footer are declared once here instead
 * of being re-imported by each page.
 *
 * The WebGL particle field that used to mount here has been removed. The 3D
 * logo on the homepage CTA and the internal /animations lab are unaffected —
 * they render their own canvases and still use the geometry helpers in
 * components/three/SirahCanvas.
 *
 * This is a server component — Navbar carries its own "use client" and renders
 * as a client leaf inside it. ChatWidget is a second: it has no directive of
 * its own, but next/script does, so it opens a client boundary all the same.
 */
export default function SiteLayout({ children }) {
  return (
    <div className="relative min-h-screen font-sans selection:bg-brand-indigo/30 text-brand-text bg-space">
      {/* First tab stop: jump past the navigation straight to the content. */}
      <a href="#main" className="skip-link">Skip to content</a>

      <div className="pointer-events-auto">
        <Navbar />
      </div>

      {/* pt-[72px] clears the fixed navbar. It lived on the hero when there
          was only one page; every route needs it now. */}
      <main id="main" className="relative z-10 w-full pt-[72px]">{children}</main>

      <Footer />

      {/* Last, mirroring the "just before </body>" the LeadConnector snippet
          asks for. Placement in this tree is cosmetic — the component renders
          null and the widget appends itself to <body> — but the route group is
          not: mounting here rather than in the root layout is what keeps the
          bubble off /animations and the 404 page. */}
      <ChatWidget />
    </div>
  );
}
