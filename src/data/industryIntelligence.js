import { INDUSTRIES } from './industries';

/**
 * The Industry Intelligence Explorer reads from here.
 *
 * `title` is never redefined below — it is looked up from INDUSTRIES so there
 * is exactly one copy of each sector name in the repo. The short `desc` in
 * INDUSTRIES stays where it is; the explorer's detail panel needs a longer
 * `summary`, four concrete outcomes, a delivery guarantee and a stack, so
 * those live here.
 *
 * ── copy status ──────────────────────────────────────────────────────────
 * TODO: review before launch. `metric`, `outcomes`, `guarantee` and `stack`
 * were written to fill the panel's slots against plausible sector work, not
 * lifted from signed client engagements. Replace any of it freely — nothing else
 * in the codebase depends on the wording. The `metric` figures in particular
 * should be swapped for numbers you can stand behind publicly.
 *
 * `accent` cycles the brand ramp (highlight → primary → secondary) so
 * neighbouring rail entries never share a colour.
 */

const ACCENTS = ['rgb(var(--c-cyan))', 'rgb(var(--c-indigo))', 'rgb(var(--c-purple))'];

const INTELLIGENCE = [
  {
    slug: 'healthcare',
    tagline: 'Clinical Operations & Patient Flow',
    icon: 'healthcare',
    metric: { value: '64%', label: 'Reduction in Admin Hours' },
    summary:
      'Automated clinic workflows, intelligent appointment scheduling, OCR-driven record digitisation and consent-aware follow-up journeys across every patient touchpoint.',
    outcomes: [
      'Automated reminders & no-show recovery',
      'OCR intake from scans, forms and lab reports',
      'Smart triage routing across departments',
      'Audit-ready patient communication logs',
    ],
    guarantee: 'Encrypted record pipelines with role-scoped access on every hop.',
    stack: ['Twilio', 'FHIR', 'Azure OCR', 'Supabase'],
  },
  {
    slug: 'manufacturing',
    tagline: 'Predictive Operations & Plant Telemetry',
    icon: 'manufacturing',
    metric: { value: '3.4x', label: 'Faster Fault Detection' },
    summary:
      'Predictive maintenance scheduling, live production dashboards and IoT integrations that pull machine telemetry into one operational picture.',
    outcomes: [
      'Failure prediction from live sensor drift',
      'Line-level OEE dashboards in real time',
      'Automated work-order dispatch',
      'Supplier and inventory reorder triggers',
    ],
    guarantee: 'Edge-buffered ingestion - no telemetry lost during network drops.',
    stack: ['MQTT', 'InfluxDB', 'Grafana', 'Node-RED'],
  },
  {
    slug: 'education',
    tagline: 'Learning Platforms & Academic AI',
    icon: 'education',
    metric: { value: '5x', label: 'Faster Grading Cycles' },
    summary:
      'Interactive learning portals, AI grading assistants and student management applications that carry a cohort from enrolment through to results.',
    outcomes: [
      'AI-assisted grading with tutor override',
      'Personalised learning path generation',
      'Attendance and progress alerting to parents',
      'Single portal for staff, students and admin',
    ],
    guarantee: 'Every AI-graded submission keeps a reviewable human-decision trail.',
    stack: ['Next.js', 'OpenAI', 'Moodle API', 'Postgres'],
  },
  {
    slug: 'real-estate',
    tagline: 'Lead Intelligence & Portfolio Analytics',
    icon: 'real-estate',
    metric: { value: '2.6x', label: 'More Qualified Viewings' },
    summary:
      'Automated lead tracking, custom CRM workflows and property portfolio analytics that route a serious buyer to the right agent within minutes.',
    outcomes: [
      'Instant lead scoring and agent routing',
      'Automated viewing scheduling and reminders',
      'Portfolio yield and occupancy dashboards',
      'Document collection through to handover',
    ],
    guarantee: 'Every enquiry is attributed to source, agent and outcome.',
    stack: ['HubSpot', 'WhatsApp API', 'Mapbox', 'Supabase'],
  },
  {
    slug: 'retail-ecommerce',
    tagline: 'Commerce Automation & Demand Forecasting',
    icon: 'retail-ecommerce',
    metric: { value: '41%', label: 'Lift in Repeat Purchases' },
    summary:
      'Inventory prediction dashboards, automated WhatsApp support channels and custom checkout applications tuned to how your catalogue actually sells.',
    outcomes: [
      'Stock-out forecasting before it costs a sale',
      'Automated cart recovery across channels',
      'Returns and RMA handled without a ticket',
      'Live margin view by SKU and channel',
    ],
    guarantee: 'Catalogue, stock and order state stay consistent across channels.',
    stack: ['Shopify', 'Klaviyo', 'BigQuery', 'Stripe'],
  },
  {
    slug: 'logistics',
    tagline: 'Route Intelligence & Fleet Orchestration',
    icon: 'logistics',
    metric: { value: '27%', label: 'Lower Cost Per Delivery' },
    summary:
      'Live route optimisation networks, delivery tracking architectures and cargo data hubs that keep dispatch, driver and customer on the same clock.',
    outcomes: [
      'Continuous route re-optimisation on traffic',
      'Customer-facing live tracking links',
      'Proof-of-delivery capture and reconciliation',
      'Fleet utilisation and idle-time analytics',
    ],
    guarantee: 'Position and status events reconcile even after offline stretches.',
    stack: ['Google Maps', 'Kafka', 'PostGIS', 'Redis'],
  },
  {
    slug: 'professional-services',
    tagline: 'Document Intelligence & Practice Automation',
    icon: 'professional-services',
    metric: { value: '6x', label: 'Faster File Turnaround' },
    summary:
      'AI document processing, automated accounting and advisory operations, and custom BI dashboards that show utilisation before the month closes.',
    outcomes: [
      'Structured data out of client PDFs and scans',
      'Automated engagement and billing workflows',
      'Utilisation and realisation dashboards',
      'Deadline tracking across every client file',
    ],
    guarantee: 'Client data stays partitioned per engagement, end to end.',
    stack: ['Claude', 'Xero', 'Power BI', 'S3'],
  },
  {
    slug: 'hospitality-travel',
    tagline: 'Guest Journey & Revenue Automation',
    icon: 'hospitality-travel',
    metric: { value: '3.1x', label: 'More Direct Bookings' },
    summary:
      'Autonomous guest booking bots, virtual concierge systems and automated billing operations that run from first enquiry to post-stay review.',
    outcomes: [
      'Multilingual booking and concierge agents',
      'Automated upsell at the right moment',
      'Channel-manager and PMS synchronisation',
      'Post-stay review and feedback capture',
    ],
    guarantee: 'Rate and availability stay in sync across every channel.',
    stack: ['Cloudbeds', 'WhatsApp API', 'Stripe', 'Twilio'],
  },
  {
    slug: 'human-resources',
    tagline: 'Talent Pipelines & Onboarding Systems',
    icon: 'human-resources',
    metric: { value: '72%', label: 'Less Time-to-Shortlist' },
    summary:
      'Automated CV screening, intelligent interview loops and employee onboarding applications that get a new hire productive in their first week.',
    outcomes: [
      'CV screening ranked against the live role',
      'Interview scheduling without the back-and-forth',
      'Offer, contract and e-signature flow',
      'Day-one provisioning across every system',
    ],
    guarantee: 'Screening criteria are explicit, logged and reviewable per candidate.',
    stack: ['Greenhouse', 'OpenAI', 'DocuSign', 'Slack'],
  },
  {
    slug: 'legal',
    tagline: 'Contract Analysis & Matter Workflows',
    icon: 'legal',
    metric: { value: '8x', label: 'Faster Contract Review' },
    summary:
      'AI contract analysis systems, discovery document processing tools and legal workflow engines that surface the clause that matters first.',
    outcomes: [
      'Clause extraction with risk flagging',
      'Discovery search across whole matters',
      'Matter and deadline tracking dashboards',
      'Precedent library that stays current',
    ],
    guarantee: 'Every extraction cites the source document and page.',
    stack: ['Claude', 'Elasticsearch', 'DocuSign', 'Postgres'],
  },
  {
    slug: 'construction',
    tagline: 'Project Control & Site Intelligence',
    icon: 'construction',
    metric: { value: '34%', label: 'Fewer Schedule Overruns' },
    summary:
      'Live project tracking tools, material supply dashboards and custom blueprint systems that keep site, office and supplier on one programme.',
    outcomes: [
      'Programme slippage flagged as it happens',
      'Material demand forecasting per phase',
      'Site progress capture from mobile',
      'Subcontractor compliance and cost tracking',
    ],
    guarantee: 'Drawings, revisions and approvals stay version-locked.',
    stack: ['Procore API', 'Power BI', 'AutoCAD', 'Azure'],
  },
  {
    slug: 'automotive',
    tagline: 'Dealer Telemetry & Service CRM',
    icon: 'automotive',
    metric: { value: '2.9x', label: 'Higher Service Retention' },
    summary:
      'Inventory telemetry dashboards, garage CRM integrations and predictive parts procurement that keep bays full and stock lean.',
    outcomes: [
      'Service due prediction and automated recall',
      'Parts demand forecasting per model',
      'Workshop bay scheduling and load balancing',
      'Customer lifetime value by vehicle',
    ],
    guarantee: 'Vehicle, owner and service history resolve to a single record.',
    stack: ['Zoho CRM', 'BigQuery', 'Twilio', 'Looker'],
  },
];

const bySlug = Object.fromEntries(INDUSTRIES.map((i) => [i.slug, i]));

export const INDUSTRY_INTELLIGENCE = INTELLIGENCE.map((item, index) => {
  const industry = bySlug[item.slug];
  if (!industry) throw new Error(`industryIntelligence: unknown slug "${item.slug}"`);
  return {
    ...item,
    index,
    number: String(index + 1).padStart(2, '0'),
    title: industry.title, // from INDUSTRIES — not duplicated
    desc: industry.desc,   // from INDUSTRIES — not duplicated
    accent: ACCENTS[index % ACCENTS.length],
  };
});
