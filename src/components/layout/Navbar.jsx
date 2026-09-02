"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLockup from './BrandLockup';
import { NAV_LINKS } from '@/data/nav';
import { ChevronDownIcon } from '@/components/ui/icons';

/**
 * The bar detaches from the viewport edges on scroll and becomes a floating
 * capsule — a "detached pill navbar".
 *
 * The trick is that nothing morphs. The bar carries `rounded-full` at all
 * times; at rest it simply spans the full width, so the rounded corners sit
 * off-screen and it reads as a plain edge-to-edge bar. Scrolling past the
 * threshold only insets it — 12px down, a proportional gap either side — and
 * the capsule that was always there becomes visible. No element resizes its
 * contents, and nothing runs per frame.
 *
 * Unlike the reference, our bar stays fully transparent at rest so it keeps
 * floating invisibly over the hero. That means the surface and the detach
 * arrive together in one move, and `backdrop-filter` never composites over
 * the fixed WebGL canvas until there is actually something to sit on.
 */

// Inset while floating. Proportional rather than fixed, so the gap looks the
// same on a phone and on a 27" display; clamped at both ends so it never
// collapses to nothing or eats the nav's own content.
const PILL_INSET = 'clamp(8px, 5vw, 80px)';
const PILL_TOP = 12;
// Symmetrical ease-in-out. The project's `ease-brand` is an ease-out, which
// makes the bar leap away from the edge; the settle at both ends is most of
// why this motion reads as deliberate.
const PILL_EASE = 'cubic-bezier(0.77, 0, 0.175, 1)';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The label of the item whose dropdown is open, or null. This was a
  // boolean, which is the whole reason hovering Products also opened the
  // Services panel: every item with a `menu` gated on the same flag.
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setMobileOpen(false); setOpenMenu(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Navigating with the mobile sheet open would otherwise leave it covering
  // the page it just moved to.
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  // Replaces the old IntersectionObserver scrollspy: with real routes the
  // current page is simply the current path. startsWith is what keeps a
  // parent highlighted on a nested route such as /products/nusi.
  //
  // '/' has to be exact, though. Every path starts with '/', so Home would
  // otherwise render active on every page of the site.
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  /*
   * Contact, clicked from a product page, carries the product.
   *
   * The two CTAs on a product page already do this — see products/[slug] —
   * but "the contact button" is often this one, and a visitor who has just
   * read the whole Aura page and reaches for the nav means the same thing as
   * one who reaches for the button under the hero. Arriving at a blank "which
   * product?" row either way is the bit that reads as the site not paying
   * attention.
   *
   * Narrow on purpose: only the Contact link, and only from a product's own
   * page. /products (the index) is not one product, so it is left alone, and
   * every other nav item keeps the href data/nav.js gives it.
   */
  const productSlug = pathname.startsWith('/products/') ? pathname.split('/')[2] : null;
  const hrefFor = (href) =>
    href === '/contact' && productSlug ? `/contact?product=${productSlug}` : href;

  // Small delay on leave so the pointer can travel into the dropdown.
  // `label` rather than `true`: one item open at a time, by name.
  const openNow = (label) => { clearTimeout(closeTimer.current); setOpenMenu(label); };
  const closeSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpenMenu(null), 140); };

  // Sits invisibly over the hero and only takes on a surface once you scroll,
  // so it reads as floating navigation rather than a bar stuck to the page.
  // A full border rather than border-b now: this is a capsule, not a bar with
  // an edge along the bottom.
  // Also solid whenever the mobile sheet is open: the sheet now lives inside
  // the bar and has no fill of its own, so at the top of the page an open menu
  // would otherwise be unreadable text floating over the hero.
  const surface = scrolled || mobileOpen
    ? 'bg-space/80 backdrop-blur-xl border border-white/[0.06] shadow-lg shadow-black/30'
    : 'bg-transparent border border-transparent';

  return (
    // The header is now only a positioning shell. Its padding is what detaches
    // the bar; the bar itself carries the surface.
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        padding: scrolled ? `${PILL_TOP}px ${PILL_INSET}` : '0px',
        transition: `padding 500ms ${PILL_EASE}`,
      }}
    >
      <div
        className={`mx-auto transition-all duration-500 ${surface} ${
          // The sheet is the last child, so it inherits the capsule - a 520px
          // tall pill would be absurd. overflow-hidden has to be conditional
          // too: the desktop Services dropdown hangs below the bar with
          // `absolute top-full`, and a permanent clip would cut it off. Safe
          // to gate on mobileOpen because the sheet and its trigger are both
          // lg:hidden, so the flag is never set at desktop widths.
          mobileOpen ? 'rounded-[28px] overflow-hidden' : 'rounded-full'
        } ${
          // Our bar is already capped at 1280, so on a wide screen the header
          // padding alone would change nothing and the detach would be
          // invisible. Dropping the cap reproduces the reference's shrink.
          // Below 1280 the padding creates the inset and this cap is inert,
          // so the two never double-apply.
          scrolled ? 'max-w-6xl' : 'max-w-7xl'
        }`}
        style={{ transitionTimingFunction: PILL_EASE }}
      >
        {/* Tighter gaps between lg and xl. The desktop links appear at lg
            (1024), which is also where the floating inset bites hardest —
            measured, the row needed 945px inside a 920px bar. Recovering it
            from spacing keeps the pill fully detached at that width instead
            of flattening the inset for every viewport. */}
        <nav className="px-4 xl:px-5 h-[72px] flex items-center gap-4 xl:gap-6">
        <Link href="/" className="shrink-0 group" aria-label="Sirah Digital - home">
          <BrandLockup size="sm" interactive />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-4 xl:gap-6 mx-auto">
          {NAV_LINKS.map((link) => (
            <li
              key={link.label}
              className="relative"
              onMouseEnter={link.menu ? () => openNow(link.label) : undefined}
              onMouseLeave={link.menu ? closeSoon : undefined}
              // Focus bubbles in React, so tabbing into the trigger or any
              // item inside the panel keeps it open for keyboard users.
              onFocus={link.menu ? () => openNow(link.label) : undefined}
              onBlur={link.menu ? closeSoon : undefined}
            >
              <Link
                href={hrefFor(link.href)}
                className={`relative flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors py-2 px-2 min-h-[44px] ${
                  isActive(link.href) ? 'text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setOpenMenu(null)}
                aria-expanded={link.menu ? openMenu === link.label : undefined}
              >
                {link.label}
                {link.menu && (
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${openMenu === link.label ? 'rotate-180' : ''}`} />
                )}
              </Link>

              {link.menu && (
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 w-64 transition-all duration-200 ${
                    openMenu === link.label ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible'
                  }`}
                >
                  <ul className="rounded-xl border border-white/10 p-2 backdrop-blur-xl bg-[#0b0e17]/95 shadow-2xl">
                    {link.menu.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center min-h-[40px] px-3 py-2 rounded-lg text-sm transition-colors text-slate-300 hover:text-white hover:bg-white/5"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    {/* The "see everything" link, from data. It used to be a
                        hardcoded "All services →" sitting inside this shared
                        block, which meant the Products menu ended with a link
                        to /services. */}
                    {link.menuFooter && (
                      <li>
                        <Link
                          href={link.menuFooter.href}
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center min-h-[40px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors text-brand-blue hover:text-white"
                        >
                          {link.menuFooter.label} →
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="ml-auto lg:ml-0 flex items-center gap-2 shrink-0">
          {/* This button names a booking, so it owes the visitor a calendar.
              /book is now that calendar — one form, times on the page, done in
              a single submit — so it is the honest destination for this label,
              and landing on a six-field enquiry form instead is the kind of
              mismatch that loses the ones who were ready to commit.
              "Contact" is still in the nav above for anyone with a question.

              NB: the href below still points at /contact. That predates this
              change and is left alone deliberately — flipping where a nav CTA
              goes is a content decision, not a side effect of dropping a
              booking vendor. */}
          <Link
            href="/contact"
            className="hidden md:inline-flex items-center text-sm font-semibold text-white hover:text-brand-blue transition-colors whitespace-nowrap gap-1"
          >
            Book Free Consultation →
          </Link>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="lg:hidden w-11 h-11 rounded-lg grid place-items-center border border-white/10 text-white"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
        </nav>

        {/* Mobile sheet — now nested inside the bar so it drops out of the
            capsule rather than out of a full-width header behind it. */}
        <div
          className={`lg:hidden transition-all duration-300 border-t border-white/5 ${
            mobileOpen ? 'max-h-[80svh] overflow-y-auto' : 'max-h-0 overflow-hidden border-t-0'
          }`}
        >
          <ul className="px-5 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={hrefFor(link.href)}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-3 font-semibold transition-colors ${
                    isActive(link.href) ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-6 py-3 font-bold text-white transition-colors hover:text-brand-blue"
              >
                Book Free Consultation →
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
