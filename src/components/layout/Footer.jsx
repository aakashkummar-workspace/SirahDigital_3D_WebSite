import React from 'react';
import Link from 'next/link';
import BrandLockup from './BrandLockup';
import { COMPANY } from '@/data/company';
import { SOCIALS } from '@/data/socials';
import { MailIcon, PhoneIcon, PinIcon, SocialIcon } from '@/components/ui/icons';

const COLUMNS = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Process', href: '/about#process' },
      { label: 'Our Work', href: '/work' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'AI Business Automation', href: '/services#workflow-automation' },
      { label: 'Chatbot Development', href: '/services#chatbots-voice' },
      { label: 'CRM Automation', href: '/services#crm-erp' },
      { label: 'All Services', href: '/services' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Industries', href: '/industries' },
      { label: 'Book a Call', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const muted = 'text-brand-muted';
  const link = 'text-brand-muted hover:text-white';

  return (
    <footer className="relative z-10 border-t pointer-events-auto bg-space-deep/90 border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr] gap-10 lg:gap-8">

          {/* Brand */}
          <div className="max-w-sm">
            <BrandLockup size="md" />

            <p className={`mt-6 text-sm leading-relaxed ${muted}`}>{COMPANY.blurb}</p>

            <Link
              href="/contact"
              className="mt-8 inline-flex items-center px-7 py-3.5 rounded-xl font-bold text-white bg-brand-cyan hover:bg-white transition-colors"
            >
              Book Free Consultation
            </Link>

            <div className="mt-8 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                  className="w-11 h-11 rounded-xl grid place-items-center transition-colors bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  <SocialIcon path={s.path} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-white">{col.title}</h4>
              {/* Rows carry their own 44px minimum, so the list needs less
                  gap than it did when the links were bare text. */}
              <ul className="mt-4 space-y-1">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className={`inline-flex items-center min-h-[44px] text-sm transition-colors ${link}`}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white">Contact</h4>
            <ul className="mt-4 space-y-1">
              <li>
                <a href={`mailto:${COMPANY.email}`} className={`flex items-center min-h-[44px] gap-3 text-sm transition-colors ${link}`}>
                  <MailIcon className="w-4 h-4 shrink-0 text-brand-cyan" />
                  {COMPANY.email}
                </a>
              </li>
              <li>
                <a href={COMPANY.phoneHref} className={`flex items-center min-h-[44px] gap-3 text-sm transition-colors ${link}`}>
                  <PhoneIcon className="w-4 h-4 shrink-0 text-brand-cyan" />
                  {COMPANY.phone}
                </a>
              </li>
              <li className={`flex items-start gap-3 pt-3 text-sm ${muted}`}>
                <PinIcon className="w-4 h-4 mt-0.5 shrink-0 text-brand-cyan" />
                <address className="not-italic leading-relaxed">
                  {COMPANY.address.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </address>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`text-sm ${muted}`}>© {year} {COMPANY.name}. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className={`inline-flex items-center min-h-[44px] text-sm transition-colors ${link}`}>Privacy Policy</Link>
            <Link href="/terms" className={`inline-flex items-center min-h-[44px] text-sm transition-colors ${link}`}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
