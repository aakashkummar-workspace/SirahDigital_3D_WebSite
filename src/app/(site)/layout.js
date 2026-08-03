import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SiteBackground from '@/components/three/SiteBackground';

/**
 * Chrome for every public page.
 *
 * `(site)` is a route group: the parentheses keep it out of the URL, so the
 * homepage is still `/`. The navbar, footer and WebGL background are declared
 * once here instead of being re-imported by each page, and because the layout
 * does not remount on navigation the particle field survives route changes.
 *
 * This is a server component — Navbar and SiteBackground carry their own
 * "use client" and render as client leaves inside it.
 */
export default function SiteLayout({ children }) {
  return (
    <div className="relative min-h-screen font-sans selection:bg-brand-indigo/30 text-brand-text bg-space">
      {/* First tab stop: jump past the navigation straight to the content. */}
      <a href="#main" className="skip-link">Skip to content</a>

      <SiteBackground />

      <div className="pointer-events-auto">
        <Navbar />
      </div>

      {/* pt-[72px] clears the fixed navbar. It lived on the hero when there
          was only one page; every route needs it now. */}
      <main id="main" className="relative z-10 w-full pt-[72px]">{children}</main>

      <Footer />
    </div>
  );
}
