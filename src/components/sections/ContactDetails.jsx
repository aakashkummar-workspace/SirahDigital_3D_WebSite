import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { COMPANY } from '@/data/company';
import { MailIcon, PhoneIcon, PinIcon, CalendarIcon, ArrowRightIcon } from '@/components/ui/icons';

export default function ContactDetails() {
  return (
    <div>
      <Reveal>
        <div className="rounded-2xl border p-8 relative overflow-hidden pointer-events-auto bg-gradient-to-br from-[#0d2030] via-[#0b1524] to-[#12102a] border-cyan-400/20">
          <CalendarIcon className="w-11 h-11 text-cyan-400" />
          <h2 className="mt-6 text-2xl font-bold">Book Free Consultation</h2>
          <p className="mt-3 text-sm text-brand-muted">45 minutes strategy call with our AI experts.</p>
          {/* TODO: point at the real booking link (Calendly / Google Calendar) */}
          <a
            href="#send-message"
            className="mt-7 w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition-opacity"
          >
            Schedule Now
            <ArrowRightIcon />
          </a>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <ul className="mt-10 space-y-6">
          <li>
            <a href={`mailto:${COMPANY.email}`} className="flex items-center gap-4 transition-colors text-gray-200 hover:text-white">
              <MailIcon className="w-6 h-6 shrink-0 text-cyan-400" />
              <span className="text-lg">{COMPANY.email}</span>
            </a>
          </li>
          <li>
            <a href={COMPANY.phoneHref} className="flex items-center gap-4 transition-colors text-gray-200 hover:text-white">
              <PhoneIcon className="w-6 h-6 shrink-0 text-cyan-400" />
              <span className="text-lg">{COMPANY.phone}</span>
            </a>
          </li>
          <li className="flex items-start gap-4 text-gray-300">
            <PinIcon className="w-6 h-6 shrink-0 text-cyan-400 mt-0.5" />
            <address className="not-italic text-lg leading-relaxed">{COMPANY.addressOneLine}</address>
          </li>
        </ul>
      </Reveal>
    </div>
  );
}
