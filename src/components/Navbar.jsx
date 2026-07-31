"use client";
import React, { useEffect, useRef, useState } from 'react';

const OFFER_ITEMS = [
  { label: 'AI Agents & Virtual Employees', href: '#offer' },
  { label: 'Workflow & Process Automation', href: '#offer' },
  { label: 'Custom Web & Mobile Apps', href: '#offer' },
  { label: 'CRM, ERP & SaaS Builds', href: '#offer' },
];

const LINKS = [
  { label: 'Hub', href: '#hub' },
  { label: 'What We Offer', href: '#offer', menu: OFFER_ITEMS },
  { label: 'Industries', href: '#industries' },
  { label: 'Why Us', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Brains', href: '#brains' },
  { label: 'Contact', href: '#contact' },
];

const SECTION_IDS = ['hub', 'process', 'offer', 'work', 'industries', 'brains', 'contact'];

export default function Navbar() {
  const [active, setActive] = useState('hub');
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  // Underline whichever section is currently filling the viewport.
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.intersectionRatio));
        let best = null, bestRatio = 0;
        seen.forEach((ratio, id) => {
          if (ratio > bestRatio) { bestRatio = ratio; best = id; }
        });
        if (best) setActive(best);
      },
      { threshold: [0.15, 0.35, 0.6, 0.85], rootMargin: '-88px 0px -40% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile sheet on escape, and lock nothing else about the page.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setMobileOpen(false); setOpenMenu(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (link) =>
    active === link.href.slice(1) || (link.label === 'What We Offer' && active === 'offer');

  // Small delay on leave so the pointer can travel into the dropdown.
  const openNow = () => { clearTimeout(closeTimer.current); setOpenMenu(true); };
  const closeSoon = () => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpenMenu(false), 140); };

  // Sits invisibly over the hero and only takes on a surface once you scroll,
  // so it reads as floating navigation rather than a bar stuck to the page.
  const shell = scrolled
    ? 'bg-[#06070c]/70 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/30'
    : 'bg-transparent border-b border-transparent';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${shell}`}>
      <nav className="max-w-7xl mx-auto px-5 h-[72px] flex items-center gap-6">
        {/* Brand */}
        <a href="#hub" className="flex items-center gap-3 shrink-0 group">
          <span
            className={`w-11 h-11 rounded-xl grid place-items-center border transition-colors border-cyan-400/30 bg-cyan-400/5 group-hover:border-cyan-400/60`}
          >
            {/* The real mark, lifted off its white background so its own
                blue-to-magenta gradient shows exactly as drawn. */}
            <img src="/logo-mark.png" alt="Sirah Digital" className="w-7 h-auto" />
          </span>
          <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
            <span className="text-white">SIRAH </span>
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">DIGITAL</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-7 mx-auto">
          {LINKS.map((link) => (
            <li
              key={link.label}
              className="relative"
              onMouseEnter={link.menu ? openNow : undefined}
              onMouseLeave={link.menu ? closeSoon : undefined}
            >
              <a
                href={link.href}
                className={`relative flex items-center gap-1.5 text-[15px] font-semibold transition-colors py-2 ${
                  isActive(link)
                    ? 'text-cyan-400'
                    : 'text-gray-200 hover:text-white'
                }`}
                onClick={() => setOpenMenu(false)}
              >
                {link.label}
                {link.menu && (
                  <svg
                    viewBox="0 0 20 20"
                    className={`w-4 h-4 transition-transform duration-200 ${openMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span
                  className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-cyan-400 transition-all duration-300 ${
                    isActive(link) ? 'w-full opacity-100' : 'w-0 opacity-0'
                  }`}
                />
              </a>

              {link.menu && (
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 w-72 transition-all duration-200 ${
                    openMenu ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible'
                  }`}
                >
                  <ul
                    className={`rounded-2xl border p-2 shadow-2xl backdrop-blur-xl bg-[#0a0a12]/95 border-white/10`}
                  >
                    {link.menu.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          onClick={() => setOpenMenu(false)}
                          className={`block px-3 py-2.5 rounded-xl text-sm transition-colors text-gray-300 hover:text-white hover:bg-white/5`}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="ml-auto lg:ml-0 flex items-center gap-2 shrink-0">
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-opacity whitespace-nowrap"
          >
            Book Free Consultation
          </a>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className={`lg:hidden w-10 h-10 rounded-full grid place-items-center border border-white/10 bg-white/5`}
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
        className={`lg:hidden overflow-hidden transition-all duration-300 border-t border-white/5 bg-[#06080f]/95 ${mobileOpen ? 'max-h-[520px]' : 'max-h-0 border-t-0'}`}
      >
        <ul className="px-5 py-4 space-y-1">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-3 rounded-xl font-semibold transition-colors ${
                  isActive(link)
                    ? 'text-cyan-400 bg-cyan-400/10'
                    : 'text-gray-200 hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="block text-center px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
            >
              Book Free Consultation
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
