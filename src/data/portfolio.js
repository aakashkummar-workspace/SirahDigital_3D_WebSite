/*
 * The custom software portfolio, grouped by what the system does rather than
 * by who it was built for.
 *
 *   id       stable key, also the DOM id the panel carries
 *   name     the category, as the panel headline
 *   projects the builds inside it
 *     name   the build, as supplied
 *     note   one line saying what kind of system it is, or null
 *
 * ── where the copy came from, and what to check ──────────────────────────
 * The categories, the groupings and every project name are taken verbatim
 * from cylinder.md and are not to be reworded here.
 *
 * The three BrainLit entries are the exception and came later, from Sirah
 * Digital directly on 19 Aug 2026: a 3D website, a chatbot and a CRM. They
 * are filed under three different categories rather than kept together,
 * because this list groups by what a system DOES and not by who it was built
 * for — the same client appearing three times is the file working correctly.
 * BrainLit is also in data/clients.js, and the website is Aakash Kummar's
 * build in data/teamProjects.js.
 *
 * `note` is the part that needs a second pair of eyes. The brief spelled out
 * exactly two of them — Sheizen's "Nutrition & Dietician Platform" and
 * Alshifa Ayush's "Hospital Management Platform" — and those two are
 * reproduced word for word. The rest were written to fill the same slot and
 * are deliberately the most conservative line that could be true: each one
 * restates its own category applied to its own name, and claims nothing about
 * the engagement that the name and the grouping do not already say.
 *
 * That is a low bar on purpose, because these are real clients and a
 * descriptive line about someone else's system is a claim about their
 * business. Anything more specific — scale, modules, outcomes, integrations —
 * has to come from Sirah Digital rather than be inferred here. Replace them
 * as the real descriptions arrive; nothing downstream depends on the wording,
 * and a `note` of null renders the name on its own.
 *
 * Several of these clients also appear in data/clients.js under their trading
 * names (Sheizen Wellness, Al Shifa Hospital, Fortune Innovatives, Stansford
 * International School, B² Consultants, Interlock Bricks, Sivakasi Crackers).
 * The two lists are not wired together: that one is a marquee of who, this is
 * a portfolio of what, and matching the names up is a judgement call for the
 * company rather than a join this file should make.
 */
export const PORTFOLIO_CATEGORIES = [
  {
    id: 'healthcare-systems',
    name: 'Healthcare Systems',
    projects: [
      // Both notes below are the brief's own words.
      { name: 'Sheizen', note: 'Nutrition & Dietician Platform' },
      { name: 'Alshifa Ayush', note: 'Hospital Management Platform' },
    ],
  },
  {
    id: 'education-platforms',
    name: 'Education Platforms',
    projects: [
      { name: 'Fortune Innovatives CRM', note: 'Custom CRM' },
      { name: 'Sansfort School CRM', note: 'School management CRM' },
      { name: 'B2 Consultancy', note: 'Consultancy CRM' },
    ],
  },
  {
    id: 'operations-erp',
    name: 'Operations & ERP',
    projects: [
      { name: 'RD Interlock', note: 'Operations system' },
      { name: 'A1 Sivakasi', note: 'Operations system' },
      { name: 'BrainLit CRM', note: 'Customer relationship management' },
    ],
  },
  {
    id: 'marketing-automation',
    name: 'Marketing Automation',
    projects: [
      { name: 'Evokz', note: 'Marketing automation' },
      { name: 'WhatsApp Bots', note: 'Conversational automation' },
      { name: 'BrainLit Chatbot', note: 'Conversational automation' },
    ],
  },
  {
    id: 'digital-experiences',
    name: 'Digital Experiences',
    projects: [
      { name: '3D Websites', note: 'Fortune Innovatives' },
      { name: 'BrainLit', note: '3D website' },
    ],
  },
];

// The panel CTA. One destination for all five: the client systems live in
// one place, and five deep links to anchors that do not exist yet would be
// five broken promises.
//
// The label was "View Case Studies". Nothing on the far end is a case study —
// the rows it lands on carry a metric and a line each, and no project has a
// write-up of its own — so it now names what is actually there.
export const PORTFOLIO_CTA = {
  label: 'View client systems',
  href: '/products#client-systems',
};
