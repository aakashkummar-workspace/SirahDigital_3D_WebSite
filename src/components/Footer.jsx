"use client";
import React from 'react';

export const COMPANY = {
  email: 'support@sirahdigital.in',
  phone: '+91 97899 61631',
  phoneHref: 'tel:+919789961631',
  address: ['8th Floor, Innovate,', 'Featherlite – The', 'Address, Pallavaram,', 'Chennai – 600044'],
  addressOneLine: '8th Floor, Innovate, Featherlite – The Address, Pallavaram, Chennai – 600044',
  blurb:
    'Transforming businesses with intelligent AI automation solutions. We help you work smarter, scale faster, and grow without limits.',
};

// TODO: swap the '#' placeholders for the real profile URLs.
const SOCIALS = [
  { label: 'Facebook', href: '#', path: 'M13.5 9H15V6.5h-1.9C11 6.5 10.2 7.7 10.2 9.3V11H8.5v2.5h1.7V21h2.8v-7.5h1.9l.3-2.5h-2.2V9.6c0-.4.2-.6.5-.6z' },
  { label: 'WhatsApp', href: '#', path: 'M12 3a9 9 0 00-7.8 13.5L3 21l4.7-1.2A9 9 0 1012 3zm0 2a7 7 0 016 10.6l-.3.5.6 2.2-2.3-.6-.5.3A7 7 0 1112 5zm-2.7 3.4c-.2 0-.5.1-.7.4-.2.3-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.6 4 3.5 1.9.8 2.3.6 2.7.6.4 0 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.6-.3-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4z' },
  { label: 'Instagram', href: '#', path: 'M12 8.1A3.9 3.9 0 1015.9 12 3.9 3.9 0 0012 8.1zm0 6.4A2.5 2.5 0 1114.5 12 2.5 2.5 0 0112 14.5zm5-6.6a.9.9 0 11-.9-.9.9.9 0 01.9.9zM20 8a4.5 4.5 0 00-1.2-3.2A4.6 4.6 0 0015.6 3.6C14.3 3.5 10 3.5 8.7 3.6A4.6 4.6 0 005.5 4.8 4.5 4.5 0 004.3 8c-.1 1.3-.1 5.3 0 6.6a4.5 4.5 0 001.2 3.2 4.6 4.6 0 003.2 1.2c1.3.1 5.6.1 6.9 0a4.6 4.6 0 003.2-1.2A4.5 4.5 0 0020 14.6c.1-1.3.1-5.3 0-6.6zm-1.7 8a2.6 2.6 0 01-1.4 1.4c-1 .4-3.3.3-4.4.3s-3.4.1-4.4-.3a2.6 2.6 0 01-1.4-1.4c-.4-1-.3-3.3-.3-4.4s-.1-3.4.3-4.4a2.6 2.6 0 011.4-1.4c1-.4 3.3-.3 4.4-.3s3.4-.1 4.4.3a2.6 2.6 0 011.4 1.4c.4 1 .3 3.3.3 4.4s.1 3.4-.3 4.4z' },
  { label: 'YouTube', href: '#', path: 'M21.6 8.2s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.8C16.1 5.2 12 5.2 12 5.2s-4.1 0-6.9.2c-.4 0-1.2 0-1.9.8-.6.6-.8 2-.8 2S2.2 9.8 2.2 11.4v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.7.8 1.7.7 2.1.8 1.6.2 6.7.2 6.7.2s4.1 0 6.9-.2c.4 0 1.2 0 1.9-.8.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2zM10.1 14.7V9.4l5.2 2.7-5.2 2.6z' },
];

const COLUMNS = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#brains' },
      { label: 'Our Process', href: '#process' },
      { label: 'Testimonials', href: '#work' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'AI Business Automation', href: '#offer' },
      { label: 'Chatbot Development', href: '#offer' },
      { label: 'CRM Automation', href: '#offer' },
      { label: 'Marketing Automation', href: '#offer' },
    ],
  },
];

const RESOURCES = [
  { label: 'Support', href: `mailto:${COMPANY.email}` },
  { label: 'Book a Call', href: '#contact' },
];

const ICONS = {
  mail: 'M3 6.5A1.5 1.5 0 014.5 5h15A1.5 1.5 0 0121 6.5v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-11zm2.2.5l6.8 5 6.8-5H5.2z',
  phone: 'M6.6 3h-2A1.6 1.6 0 003 4.7C3 13.1 10.9 21 19.3 21a1.6 1.6 0 001.7-1.6v-2a1 1 0 00-.8-1l-3.4-.7a1 1 0 00-1 .4l-1 1.3a13 13 0 01-5.2-5.2l1.3-1a1 1 0 00.4-1l-.7-3.4a1 1 0 00-1-.8z',
  pin: 'M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z',
};

export default function Footer() {
  const year = new Date().getFullYear();
  const muted = 'text-gray-400';
  const link = 'text-gray-400 hover:text-white';
  const heading = 'text-white';

  return (
    <footer
      className={`relative z-10 border-t pointer-events-auto bg-[#050509]/90 border-white/5 backdrop-blur-xl`}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr_0.8fr] gap-10 lg:gap-8">

          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span
                className={`w-12 h-12 rounded-xl grid place-items-center border border-cyan-400/30 bg-cyan-400/5`}
              >
                <img src="/logo-mark.png" alt="" className="w-8 h-auto" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                <span className={heading}>SIRAH </span>
                <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                  DIGITAL
                </span>
              </span>
            </div>

            <p className={`mt-6 text-sm leading-relaxed ${muted}`}>{COMPANY.blurb}</p>

            <a
              href="#contact"
              className="mt-8 inline-flex items-center px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-opacity"
            >
              Book Free Consultation
            </a>

            <div className="mt-8 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                  className={`w-11 h-11 rounded-xl grid place-items-center transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Company / Services */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className={`font-bold ${heading}`}>{col.title}</h4>
              <ul className="mt-6 space-y-4">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className={`text-sm transition-colors ${link}`}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className={`font-bold ${heading}`}>Contact</h4>
            <ul className="mt-6 space-y-4">
              <li>
                <a href={`mailto:${COMPANY.email}`} className={`flex items-start gap-3 text-sm transition-colors ${link}`}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" fill="currentColor"><path d={ICONS.mail} /></svg>
                  {COMPANY.email}
                </a>
              </li>
              <li>
                <a href={COMPANY.phoneHref} className={`flex items-start gap-3 text-sm transition-colors ${link}`}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" fill="currentColor"><path d={ICONS.phone} /></svg>
                  {COMPANY.phone}
                </a>
              </li>
              <li className={`flex items-start gap-3 text-sm ${muted}`}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" fill="currentColor"><path d={ICONS.pin} /></svg>
                <address className="not-italic leading-relaxed">
                  {COMPANY.address.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </address>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className={`font-bold ${heading}`}>Resources</h4>
            <ul className="mt-6 space-y-4">
              {RESOURCES.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={`text-sm transition-colors ${link}`}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className={`border-t border-white/5`}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`text-sm ${muted}`}>© {year} SIRAH DIGITAL. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="/privacy" className={`text-sm transition-colors ${link}`}>Privacy Policy</a>
            <a href="/terms" className={`text-sm transition-colors ${link}`}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
