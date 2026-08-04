"use client";
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandLockup from './BrandLockup';
import { NAV_LINKS } from '@/data/nav';
import { ChevronDownIcon } from '@/components/ui/icons';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setMobileOpen(false); setOpenMenu(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Navigating with the mobile sheet open would otherwise leave it covering
  // the page it just moved to.
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(false);
  }, [pathname]);

  // Replaces the old IntersectionObserver scrollspy: with real routes the
  // current page is simply the current path. startsWith keeps the parent
  // highlighted on future nested routes such as /services/ai-agents.
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  // Small delay on leave so the pointer can travel into the dropdown.
  const openNow = () => { clearTimeout(closeTimer.current); setOpenMenu(true); };
  const closeSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpenMenu(false), 140); };

  // Sits invisibly over the hero and only takes on a surface once you scroll,
  // so it reads as floating navigation rather than a bar stuck to the page.
  const shell = scrolled
    ? 'bg-space/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/30'
    : 'bg-transparent border-b border-transparent';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${shell}`}>
      <nav className="max-w-7xl mx-auto px-5 h-[72px] flex items-center gap-6">
        <Link href="/" className="shrink-0 group" aria-label="Sirah Digital — home">
          <BrandLockup size="sm" interactive />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-6 mx-auto">
          {NAV_LINKS.map((link) => (
            <li
              key={link.label}
              className="relative"
              onMouseEnter={link.menu ? openNow : undefined}
              onMouseLeave={link.menu ? closeSoon : undefined}
            >
              <Link
                href={link.href}
                className={`relative flex items-center justify-center gap-1.5 text-sm font-semibold transition-colors py-2 px-2 min-h-[44px] ${
                  isActive(link.href) ? 'text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setOpenMenu(false)}
              >
                {link.label}
                {link.menu && (
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${openMenu ? 'rotate-180' : ''}`} />
                )}
              </Link>

              {link.menu && (
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 w-64 transition-all duration-200 ${
                    openMenu ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible'
                  }`}
                >
                  <ul className="rounded-xl border border-white/10 p-2 backdrop-blur-xl bg-[#0b0e17]/95 shadow-2xl">
                    {link.menu.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setOpenMenu(false)}
                          className="flex items-center min-h-[40px] px-3 py-2 rounded-lg text-sm transition-colors text-slate-300 hover:text-white hover:bg-white/5"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/services"
                        onClick={() => setOpenMenu(false)}
                        className="flex items-center min-h-[40px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors text-cyan-400 hover:text-cyan-300"
                      >
                        All services →
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="ml-auto lg:ml-0 flex items-center gap-2 shrink-0">
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center text-sm font-semibold text-white hover:text-cyan-400 transition-colors whitespace-nowrap gap-1"
          >
            Book Free Consultation →
          </Link>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="lg:hidden w-10 h-10 rounded-lg grid place-items-center border border-white/10 text-white"
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

      {/* Mobile sheet */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 border-t border-white/5 bg-[#0b0e17]/95 ${
          mobileOpen ? 'max-h-[520px]' : 'max-h-0 border-t-0'
        }`}
      >
        <ul className="px-5 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
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
              className="block text-center px-6 py-3 font-bold text-white hover:text-cyan-400"
            >
              Book Free Consultation →
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
