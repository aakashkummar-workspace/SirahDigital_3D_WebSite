// Names, roles and bios carried over from sirahdigital.in/team.
// Photos live in /public/team/ under these filenames; a missing file falls
// back to an initials badge rather than a broken image.
/*
 * The founder.
 *
 *   role       the line the team roster used, kept because the chat index and
 *              anything else reading this file still expects it
 *   title      the shorter line the founder spotlight shows under the name
 *   bio        one sentence, for consumers that have room for exactly one
 *   statement  the spotlight's own copy, two short paragraphs. Written from
 *              the founder profile supplied by Sirah Digital and cut to the
 *              length a page will actually be read at
 *   brands     prior work, as names only. Rendered as labels rather than
 *              links: neither company endorses Sirah Digital and neither URL
 *              was given, so linking them would be an invention
 *   quote      his own line about what the company is for
 *
 * `14+` here and COMPANY_STATS in data/company.js state the same number on
 * the same page. They must move together.
 */
export const FOUNDER = {
  name: 'Mohamed Riyaz',
  role: 'Founder - SIRAH DIGITAL',
  title: 'Founder & Technical Architect',
  bio: 'Visionary leader driving AI-powered digital growth and automation-focused business solutions at SIRAH DIGITAL.',
  statement: [
    'Founder of Sirah Digital and a Technical Architect with 14+ years designing analytics, automation and growth systems.',
    'Global brand work has kept him inside the systems businesses run on every day - which is where every Sirah Digital build starts.',
  ],
  brands: ['Procter & Gamble', 'Reckitt Benckiser'],
  quote: 'The purpose of Sirah Digital is not to replace people with AI, but to support them.',
  photo: '/team/mohamed-riyaz.jpg',
};

/*
 * ── the `review` lines are placeholder copy ──────────────────────────────
 * Every other string in this file came from Sirah Digital. The `review` on
 * each member did not: it is written copy, sitting in the client-testimonial
 * card on that member's page so the layout can be judged with real-length
 * text in it. Replace each one with what the client actually said before this
 * goes live — a testimonial is a claim someone else is supposed to have made,
 * and invented ones are the kind of thing that gets a site in trouble.
 *
 * No client is named against a quote, deliberately. The reference this card
 * was built from carries no attribution either, so there is nothing here that
 * puts words in a named company's mouth. When the real quotes arrive, add the
 * person and company alongside them — an attributed testimonial is worth
 * several unattributed ones.
 */

/*
 * The roster.
 *
 * `slug` is each member's own page, and it is a TOP-LEVEL route — /monisha,
 * not /team/monisha. That is what was asked for, and it is worth knowing that
 * it puts five names in the same namespace as /about and /contact: a future
 * page called /salman would collide. app/(site)/[member] declares
 * `dynamicParams = false`, so only these five resolve and anything else 404s
 * rather than rendering an empty member page.
 *
 * One first name each, matching the slugs the pages were asked for. Kept short
 * deliberately — these are URLs people say out loud.
 */
export const TEAM = [
  // `alsoRole` is a second designation, and only Jesheeba carries one. The
  // roster on /about shows `role` alone — five cards want one line each — and
  // her own page shows both, alsoRole first. Nothing else needs to know: every
  // other consumer reads `role` and is unaffected.
  { slug: 'jesheeba', name: 'M. Jesheeba Fathima', role: 'AI Automation Engineer', alsoRole: 'Digital Growth Specialist', bio: 'Driving strategic digital transformation and growth initiatives for businesses.', photo: '/team/jesheeba-fathima.jpg', review: 'She understood how our stock actually moves before she proposed anything, which is rarer than it sounds. Orders, inventory and customer follow-ups now run from one screen, and enquiries stopped falling through on WhatsApp. Every conversation with her is practical rather than theoretical.' },
  { slug: 'monisha', name: 'SS. Monisha', role: 'AI Automation Engineer', bio: 'Building intelligent AI-driven automation & delivering AI-enabled automation systems.', photo: '/team/monisha.jpg', review: 'She spent time on how our clinic really runs before a line of code was written, and the platform reflects that. Appointments, records and patient follow-ups sit in one place now, and the front desk has stopped keeping its own parallel register.' },
  { slug: 'salman', name: 'S. Sayed Salman', role: 'AI Solution Engineer', bio: 'Helping business automate workflows & uncover insights with Data + AI', photo: '/team/sayed-salman.jpg', review: 'He turned a pile of monthly exports into something we can actually ask questions of. Drafting work that used to sit with one person takes minutes now, and the output still reads like our firm wrote it. Straight answers throughout, no jargon.' },
  { slug: 'samad', name: 'Abdul Samad', role: 'AI Solution Engineer', bio: 'Developing intelligent automation systems and AI-powered solutions.', photo: '/team/abdul-samad.jpg', review: 'He listens properly before he builds. Every system he has given us came out of the way our team already works, so nobody had to be trained into anything. He says plainly when something is a bad idea instead of quietly building it, and every handover has come in on the date he gave us.' },
  { slug: 'aakash', name: 'I. Aakash Kummar', role: 'AI Automation Engineer', bio: 'Creating scalable AI workflows and automation systems.', photo: '/team/aakash-kummar.jpg', review: 'Admissions, fees and transport lived in six different spreadsheets before this. He built the CRM around the way our staff already worked, so nobody had to be retrained into it. Reports that used to take a morning now take one click.' },
];

export const memberBySlug = (slug) => TEAM.find((m) => m.slug === slug) || null;
