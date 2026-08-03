import React from 'react';

// The contact glyphs were previously pasted into both the footer and the
// contact section as raw path data. One definition, two consumers.
//
// Exported as raw strings as well as components: the components return a whole
// <svg>, which cannot be nested inside another SVG. The transformation story's
// scene 2 draws these glyphs inside its own <svg>, so it consumes GLYPH_PATHS
// directly and positions each with its own transform.
//
// All paths are authored on a 24x24 grid.
export const GLYPH_PATHS = {
  mail: 'M3 6.5A1.5 1.5 0 014.5 5h15A1.5 1.5 0 0121 6.5v11a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 17.5v-11zm2.2.5l6.8 5 6.8-5H5.2z',
  phone: 'M6.6 3h-2A1.6 1.6 0 003 4.7C3 13.1 10.9 21 19.3 21a1.6 1.6 0 001.7-1.6v-2a1 1 0 00-.8-1l-3.4-.7a1 1 0 00-1 .4l-1 1.3a13 13 0 01-5.2-5.2l1.3-1a1 1 0 00.4-1l-.7-3.4a1 1 0 00-1-.8z',
  pin: 'M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z',
  whatsapp:
    'M12 2a10 10 0 00-8.7 15l-1.3 4.9 5-1.3A10 10 0 1012 2zm0 2.2a7.8 7.8 0 016.6 11.9l-.3.5.7 2.5-2.6-.7-.5.3A7.8 7.8 0 1112 4.2zm-3 3.7c-.2 0-.5.1-.8.4-.2.4-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.4 3.9 2.1.9 2.6.7 3 .7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3-1.7-.8c-.2-.1-.4-.2-.6.1l-.8 1c-.1.2-.3.2-.6.1-.2-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.8-.1-.3 0-.4.1-.5l.5-.6.2-.4v-.5l-.8-1.9c-.2-.4-.4-.4-.6-.4z',
  crm: 'M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 18.5v-13zM6 7v2h12V7H6zm0 4v2h7v-2H6zm0 4v2h9v-2H6z',
  calendar: 'M7 2v2H5.5A2.5 2.5 0 003 6.5v12A2.5 2.5 0 005.5 21h13a2.5 2.5 0 002.5-2.5v-12A2.5 2.5 0 0018.5 4H17V2h-2v2H9V2H7zM5 10h14v8.5a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5V10zm2.5 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  check: 'M9.6 16.2L5.4 12l-1.4 1.4 5.6 5.6L20.4 8.2 19 6.8z',
  bolt: 'M13 2L4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z',
  warning: 'M12 2.5L1.5 21h21L12 2.5zm0 5.2l6.8 11.8H5.2L12 7.7zm-1 3.8v4h2v-4h-2zm0 5.5v2h2v-2h-2z',
  rocket: 'M14.5 2c3 0 5.5 1.2 7.5 3.2-.5 5.4-3 8.8-6.6 11l.4 4.3-3.6 2.1-1.3-4.2-3.3-3.3-4.2-1.3 2.1-3.6 4.3.4C11.9 7 14 4 14.5 2zm1.7 5.1a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM4.6 17.2c1-1 2.5-1 3.4 0 1 1 1 2.5 0 3.4-.7.7-2.5 1-4.4 1.3.3-1.9.6-3.7 1-4.7z',
};

// Kept for the existing component wrappers below.
const PATHS = GLYPH_PATHS;

const Filled = ({ name, className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d={PATHS[name]} />
  </svg>
);

export const MailIcon = (props) => <Filled name="mail" {...props} />;
export const PhoneIcon = (props) => <Filled name="phone" {...props} />;
export const PinIcon = (props) => <Filled name="pin" {...props} />;

export const SocialIcon = ({ path, className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d={path} />
  </svg>
);

export const CalendarIcon = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const ChevronDownIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
