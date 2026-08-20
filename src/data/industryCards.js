/*
 * Card copy for the /industries grid, keyed by slug.
 *
 * Separate from data/industries.js on purpose: that module is imported by the
 * homepage orbit, the sector detail pages and the image resolver, and none of
 * them wants this. Separate from data/industryWorkflows.js too — that holds
 * the seven-step timeline each detail page draws, which is the full story. A
 * card has room for the headline version and nothing more.
 *
 *   blurb  one line, verb first. It says what gets automated, not what the
 *          sector is — the title already did that.
 *   flow   three or four stages, in order. These are the page's whole visual
 *          language: an automation company should show workflows rather than
 *          photographs of the industries it works in.
 *
 * Keep both short. The blurb wraps to two lines at the card's width and the
 * flow to two rows on a phone; anything longer starts pushing the cards in a
 * row out of alignment with each other.
 */
export const INDUSTRY_CARDS = {
  healthcare: {
    blurb: 'Automate patient journeys from enquiry to follow-up.',
    flow: ['Enquiry', 'Appointment', 'Follow-up'],
  },
  manufacturing: {
    blurb: 'Move a quote to dispatch without the paperwork in between.',
    flow: ['Enquiry', 'Quotation', 'Production', 'Dispatch'],
  },
  education: {
    blurb: 'Turn enquiries into enrolments without manual chasing.',
    flow: ['Lead', 'Counselling', 'Enrollment', 'Follow-up'],
  },
  'real-estate': {
    blurb: 'Qualify leads and fill the site-visit calendar on their own.',
    flow: ['Lead', 'Qualification', 'Site Visit', 'Conversion'],
  },
  'retail-ecommerce': {
    blurb: 'Answer, recommend and reorder across every channel.',
    flow: ['Enquiry', 'Recommendation', 'Order', 'Follow-up'],
  },
  logistics: {
    blurb: 'Track every order from processing to doorstep.',
    flow: ['Order', 'Processing', 'Tracking', 'Delivery'],
  },
  'professional-services': {
    blurb: 'Take a lead to a signed proposal without the admin.',
    flow: ['Lead', 'Qualification', 'Proposal', 'Conversion'],
  },
  'hospitality-travel': {
    blurb: 'Confirm bookings and follow up with every guest.',
    flow: ['Enquiry', 'Booking', 'Confirmation', 'Follow-up'],
  },
  'human-resources': {
    blurb: 'Screen applications and schedule interviews automatically.',
    flow: ['Application', 'Screening', 'Interview', 'Hiring'],
  },
  legal: {
    blurb: 'Move matters from first enquiry to closed file.',
    flow: ['Enquiry', 'Consultation', 'Case', 'Follow-up'],
  },
  construction: {
    blurb: 'Estimate, track and close projects in one system.',
    flow: ['Enquiry', 'Estimate', 'Project', 'Completion'],
  },
  automotive: {
    blurb: 'Book test drives and follow up until the sale.',
    flow: ['Enquiry', 'Test Drive', 'Follow-up', 'Purchase'],
  },
};
