// Slugs are already in place so /services#ai-agents deep links work today,
// and so a future /services/[slug] route needs no data migration.
export const SERVICES = [
  { slug: 'ai-agents', title: 'AI Agents & Virtual Employees', desc: 'Autonomous cognitive systems built to execute end-to-end operational loops.' },
  { slug: 'chatbots-voice', title: 'AI Chatbots & Voice Assistants', desc: 'Context-aware LLM agents handling natural multi-lingual customer pipelines.' },
  { slug: 'workflow-automation', title: 'Workflow & Process Automation', desc: 'Connecting fragmented legacy systems to run fully untethered loops.' },
  { slug: 'web-mobile-apps', title: 'Custom Web & Mobile Apps', desc: 'High-performance enterprise dashboards and bespoke cross-platform setups.' },
  { slug: 'crm-erp', title: 'CRM & ERP Solutions', desc: 'Tailored databases tracking resource orchestration and operational lifecycles.' },
  { slug: 'saas-development', title: 'SaaS Product Development', desc: 'Multi-tenant cloud architectures engineered for rapid customer onboarding.' },
  { slug: 'whatsapp-automation', title: 'WhatsApp Business Automation', desc: 'Massive scale automated outreach and customer interactive transaction channels.' },
  { slug: 'document-processing', title: 'AI Document Processing & OCR', desc: 'Extracting structured data parameters straight from chaotic text layouts.' },
  { slug: 'api-integration', title: 'API Dev & System Integration', desc: 'Writing clean, future-ready microservices that glue core operations together.' },
  { slug: 'bi-dashboards', title: 'Business Intelligence Dashboards', desc: 'Aggregating telemetry maps to render clean, actionable real-time insights.' },
];

// The three pillars behind how the work gets delivered.
// Accents run the brand ramp: Primary Accent → Secondary Accent → Highlight.
export const METHODOLOGY = [
  { title: 'Automate', accent: 'text-brand-indigo', hover: 'hover:border-brand-indigo/40', desc: 'Eliminate repetitive workflow structures with high-availability enterprise AI agents.' },
  { title: 'Simplify', accent: 'text-brand-purple', hover: 'hover:border-brand-purple/40', desc: 'Deconstruct complex operations into intuitive, custom software applications.' },
  { title: 'Scale', accent: 'text-brand-cyan', hover: 'hover:border-brand-cyan/40', desc: 'Launch cloud-ready API infrastructures positioned to grow alongside your business.' },
];
