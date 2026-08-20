/*
 * The systems, live and in build.
 *
 * ── two audiences, one record ────────────────────────────────────────────
 * The client-systems band on /products reads the newer fields below. The older ones — `client`, `impact`,
 * `phase`, `stack`, `desc` — are what components/home/MissionControl.jsx
 * reads to label its orbit nodes. Nothing currently renders MissionControl,
 * so those fields have no live consumer today, but the component is intact
 * and would break on the next import if they were dropped. Both sets stay.
 *
 *   industry     the sector line under the title on the row. It duplicates
 *                `client` for the live systems on purpose — `client` is the
 *                orbit's field and carries no meaning for the development
 *                projects, which have no client yet.
 *   blurb        the one or two lines the row shows. `desc` is the older, more
 *                technical sentence the orbit still uses; the blurb says the
 *                same thing in business terms and is the one a visitor reads.
 *   flow         what was automated, as stages. Three or four — this is an
 *                editorial detail on a row, not a diagram.
 *   metric /     the single outcome. One per project, deliberately: a row
 *   metricLabel  with three numbers on it is a dashboard again.
 *
 * Development projects carry no metric. They have not produced an outcome
 * yet, and inventing one would be the least honest thing on the page — the
 * row shows `phase` instead.
 *
 * TODO: `href` points at /contact because no per-project route exists. Same
 * convention as data/products.js. Point these at real write-ups the moment
 * those pages are written; until then the row's label says "Enquire about
 * this", which is what a contact form actually is.
 */
export const PRODUCTION_PROJECTS = [
  {
    slug: 'medflow-ai',
    title: 'MedFlow AI Optimizer',
    client: 'Healthcare & Wellness',
    industry: 'Healthcare & Wellness',
    impact: '40% Admin Reduction',
    metric: '40%',
    metricLabel: 'Administrative reduction',
    blurb: 'AI-powered patient operations, from triage to billing and document processing.',
    flow: ['Triage', 'Billing', 'OCR'],
    href: '/contact',
    desc: 'Live production system automating patient triage, billing routing protocols, and OCR scanning pipelines for enterprise clinics.',
  },
  {
    slug: 'nexus-erp',
    title: 'Nexus ERP Core',
    client: 'Logistics & Supply Chain',
    industry: 'Logistics & Supply Chain',
    impact: 'Real-Time Tracking',
    metric: 'Real-time',
    metricLabel: 'Tracking',
    blurb: 'Centralized warehouse operations connected through one system.',
    flow: ['Warehouse', 'ERP', 'Dispatch'],
    href: '/contact',
    desc: 'Bespoke system integration linking multi-warehouse telemetry parameters straight to a centralized corporate dispatch hub.',
  },
  {
    slug: 'omnichannel-retail-bot',
    title: 'OmniChannel Retail Bot',
    client: 'Retail & E-commerce',
    industry: 'Retail & E-commerce',
    impact: '12k+ Active Conversations',
    metric: '12K+',
    metricLabel: 'Active conversations',
    blurb: 'WhatsApp commerce automation for sales and customer follow-up.',
    flow: ['Enquiry', 'Order', 'Follow-up'],
    href: '/contact',
    desc: 'Autonomous WhatsApp Business infrastructure deployed to manage bulk sales, client retargeting, and automatic checkout links.',
  },
];

export const DEVELOPMENT_PROJECTS = [
  {
    slug: 'autonomous-hr',
    title: 'Project Autonomous HR',
    industry: 'Human Resources & Recruitment',
    phase: 'Alpha Testing',
    stack: 'LLM Orchestration',
    blurb: 'AI-assisted candidate screening and interview workflow automation.',
    flow: ['Application', 'Screening', 'Interview', 'Hiring'],
    desc: 'Custom AI agent software built to screen 500+ CVs concurrently and automatically set up logical candidate calendar loops.',
  },
  {
    slug: 'insightforge-bi',
    title: 'InsightForge BI Engine',
    industry: 'Analytics & Reporting',
    phase: 'Beta Architecture',
    stack: 'Next.js + WebGL Data',
    blurb: 'Operational telemetry turned into predictive dashboards.',
    flow: ['Ingest', 'Model', 'Dashboard'],
    desc: 'A hyper-fast system data aggregator converting raw system telemetry parameters into clean, predictive graphic dashboards.',
  },
];
