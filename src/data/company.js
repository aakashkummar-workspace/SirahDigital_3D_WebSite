// Single source of truth for company details. Consumed by the footer, the
// contact page, the sitemap and page metadata — change it here only.
export const COMPANY = {
  name: 'SIRAH DIGITAL',
  // Overridable so a staging deploy does not emit production canonicals and
  // a production sitemap. Drives metadataBase, robots, sitemap and every
  // page's canonical.
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sirahdigital.in',
  email: 'support@sirahdigital.in',
  phone: '+91 97899 61631',
  phoneHref: 'tel:+919789961631',
  address: ['8th Floor, Innovate,', 'Featherlite - The', 'Address, Pallavaram,', 'Chennai - 600044'],
  addressOneLine: '8th Floor, Innovate, Featherlite - The Address, Pallavaram, Chennai - 600044',
  blurb:
    'Transforming businesses with intelligent AI automation solutions. We help you work smarter, scale faster, and grow without limits.',
  tagline: 'Building intelligent systems that automate, simplify, and scale.',
};

/*
 * The figures the company stands on, rendered by StatBand.
 *
 *   value  the figure itself — short enough to survive at 3.5rem
 *   label  what it counts, in one line
 *
 * Supplied by Sirah Digital. This was three for a long time, on the argument
 * that a fourth turns a credibility line into a dashboard. Four is the new
 * ceiling, and it holds for the same reason the old limit did: the plate is
 * one row, and a figure that wraps to a second row stops being a headline.
 * Do not add a fifth without redesigning the band.
 *
 * The years figure is the same one the founder's statement carries in
 * data/team.js — change both together or they will contradict each other on
 * the same page.
 *
 * StatBand maps over this array and is count-agnostic; what is not is
 * stat-band.module.css, whose grid names the column count explicitly.
 */
export const COMPANY_STATS = [
  { value: '14+', label: 'Years of experience' },
  { value: '50+', label: 'Happy clients' },
  { value: '20+', label: 'Customised softwares' },
  { value: '24/7', label: 'Support available' },
];
