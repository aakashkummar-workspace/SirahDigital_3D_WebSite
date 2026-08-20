import { SERVICES } from './services';

/**
 * The /services page reads its running order from here rather than from the
 * SERVICES array directly, because the design specifies its own sequence and
 * its own short navigation labels.
 *
 * `title` and `desc` are never redefined here — they are looked up from
 * SERVICES so there is exactly one copy of the service wording in the repo.
 *
 * ── problem / outcome / cta ──────────────────────────────────────────────
 * TODO: review before launch. The design asks each capability to read as
 * Problem → Solution → Business Outcome, and to close on an inline CTA in its
 * own voice. The service records carried only a title and a description, so
 * the `problem`, `outcome` and `cta` lines below were written to fill those
 * slots. `title` and `desc` still come from SERVICES and are untouched.
 * Replace any of this freely — nothing else depends on the wording.
 */
const EXPERIENCE = [
  { slug: 'ai-agents', navLabel: 'AI Agents', visual: 'ai-core', system: 'Neural AI Core',
    problem: 'Your best people spend their day being the glue between systems.',
    outcome: 'Entire operational loops run without a person in the middle.',
    cta: 'Build My AI Workforce' },
  { slug: 'chatbots-voice', navLabel: 'Chatbots', visual: 'communication-hub', system: 'Communication Network',
    problem: 'Enquiries arrive at midnight, in three languages, and wait until Monday.',
    outcome: 'Customer conversations handled in any language, around the clock.',
    cta: 'Automate My Conversations' },
  { slug: 'workflow-automation', navLabel: 'Workflow Automation', visual: 'workflow-engine', system: 'Automation Engine',
    problem: 'Work stalls in the gaps between tools nobody ever connected.',
    outcome: 'Systems that could not talk to each other now run as one.',
    cta: 'Automate My Business' },
  { slug: 'web-mobile-apps', navLabel: 'Custom Software', visual: 'enterprise-dashboard', system: 'Enterprise Dashboard',
    problem: 'Off-the-shelf software forces your process to fit its assumptions.',
    outcome: 'One system your team actually wants to open, on every device.',
    cta: 'Design My Platform' },
  { slug: 'crm-erp', navLabel: 'CRM & ERP', visual: 'business-network', system: 'Enterprise Database',
    problem: 'The real numbers live in four systems and one spreadsheet.',
    outcome: 'Every resource, deal and lifecycle in a single source of truth.',
    cta: 'Unify My Operations' },
  { slug: 'whatsapp-automation', navLabel: 'WhatsApp Automation', visual: 'communication-hub', system: 'Conversation Hub',
    problem: 'Customers message the channel they like; nobody is staffed for it.',
    outcome: 'Sales and support at scale on the channel customers already use.',
    cta: 'Scale My Channel' },
  { slug: 'document-processing', navLabel: 'OCR', visual: 'document-scanner', system: 'Document Intelligence',
    problem: 'The information you need is trapped in PDFs and scans.',
    outcome: 'Structured, searchable data out of documents nobody had time to read.',
    cta: 'Digitise My Documents' },
  { slug: 'bi-dashboards', navLabel: 'Business Intelligence', visual: 'analytics-sphere', system: 'Analytics Sphere',
    problem: 'Every decision waits on someone rebuilding the same report.',
    outcome: 'The number you need to decide, ready before you ask for it.',
    cta: 'See My Numbers Live' },
  { slug: 'api-integration', navLabel: 'API Integrations', visual: 'workflow-engine', system: 'Integration Layer',
    problem: 'Each new tool adds another island to your stack.',
    outcome: 'New tools plug into your stack instead of fragmenting it.',
    cta: 'Connect My Stack' },
  { slug: 'saas-development', navLabel: 'SaaS Platforms', visual: 'enterprise-dashboard', system: 'Cloud Platform',
    problem: 'Every new customer costs you engineering time to onboard.',
    outcome: 'A product that onboards customers without onboarding engineers.',
    cta: 'Launch My Platform' },
];

const bySlug = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));

export const SERVICE_EXPERIENCE = EXPERIENCE.map((item, i) => {
  const service = bySlug[item.slug];
  if (!service) throw new Error(`serviceExperience: unknown slug "${item.slug}"`);
  return {
    ...item,
    index: i,
    number: String(i + 1).padStart(2, '0'),
    title: service.title,   // from SERVICES — not duplicated
    desc: service.desc,     // from SERVICES — not duplicated
  };
});

/**
 * The technology ecosystem, exactly as named in the design.
 * Angles are fixed rather than computed so the ring never reflows between
 * server and client render.
 */
export const TECHNOLOGIES = [
  { name: 'Next.js', accent: 'rgb(var(--c-cyan))' },
  { name: 'OpenAI', accent: 'rgb(var(--c-indigo))' },
  { name: 'Claude', accent: 'rgb(var(--c-purple))' },
  { name: 'Gemini', accent: 'rgb(var(--c-cyan))' },
  { name: 'Supabase', accent: 'rgb(var(--c-indigo))' },
  { name: 'Docker', accent: 'rgb(var(--c-purple))' },
  { name: 'WhatsApp', accent: 'rgb(var(--c-cyan))' },
  { name: 'AWS', accent: 'rgb(var(--c-indigo))' },
];
