/*
 * The twelve sectors, in the order they appear in the industries gallery.
 *
 * `slug` is the URL segment (/industries/healthcare) and the key everything
 * else joins on — industryIntelligence.js looks its records up by it, so a
 * slug is not safe to rename on its own.
 *
 * `image` is a /public path. Drop the twelve files into public/images/industries/
 * named after the slug and the gallery picks them up with no other change;
 * until then a tile renders as a clean captioned placeholder rather than a
 * broken image. Landscape. The widest a tile is ever rendered is 526px, so a
 * source below ~1100px wide will soften on a high-DPR screen.
 *
 * `alt` describes the photograph rather than repeating the sector name, which
 * is already the tile's caption and its link text. It doubles as the shot
 * list for whoever sources the images.
 */
export const INDUSTRIES = [
  {
    slug: 'healthcare',
    title: 'Healthcare & Wellness',
    desc: 'Automated clinic workflows, smart patient scheduling, and OCR record processing.',
    image: '/images/industries/healthcare.png',
    alt: 'A clinician reviewing patient vitals on a tablet beside a hospital monitor.',
  },
  {
    slug: 'manufacturing',
    title: 'Manufacturing',
    desc: 'Predictive maintenance scheduling, production dashboards, and IoT system integrations.',
    image: '/images/industries/manufacturing.png',
    alt: 'Robotic arms working along an automated production line on a factory floor.',
  },
  {
    slug: 'education',
    title: 'Education & EdTech',
    desc: 'Interactive custom learning portals, AI grading assistants, and student management applications.',
    image: '/images/industries/education.png',
    alt: 'A student working on a tablet at a shared desk in a bright lecture room.',
  },
  {
    slug: 'real-estate',
    title: 'Real Estate',
    desc: 'Automated lead tracking systems, custom CRM workflows, and property portfolio analytics portals.',
    image: '/images/industries/real-estate.png',
    alt: 'A modern low-rise residential building lit at dusk behind landscaped grounds.',
  },
  {
    slug: 'retail-ecommerce',
    title: 'Retail & E-commerce',
    desc: 'SaaS inventory prediction dashboards, automated WhatsApp support channels, and custom checkout apps.',
    image: '/images/industries/retail-ecommerce.png',
    alt: 'A point-of-sale terminal on a counter in a softly lit clothing store.',
  },
  {
    slug: 'logistics',
    title: 'Logistics & Supply Chain',
    desc: 'Live route optimization networks, delivery tracking architectures, and cargo data hubs.',
    image: '/images/industries/logistics.png',
    alt: 'A forklift operator moving pallets between tall racking in a distribution warehouse.',
  },
  {
    slug: 'professional-services',
    title: 'Professional Services',
    desc: 'AI document processing, automated legal/accounting operations, and custom BI dashboards.',
    image: '/images/industries/professional-services.png',
    alt: 'Four colleagues reviewing documents together around a meeting table.',
  },
  {
    slug: 'hospitality-travel',
    title: 'Hospitality & Travel',
    desc: 'Autonomous guest booking bots, virtual concierge systems, and automated billing operations.',
    image: '/images/industries/hospitality-travel.png',
    alt: 'A guest arriving with luggage at a warmly lit hotel reception desk.',
  },
  {
    slug: 'human-resources',
    title: 'Human Resources & Recruitment',
    desc: 'Automated CV screening tools, intelligent interview loops, and employee onboarding apps.',
    image: '/images/industries/human-resources.png',
    alt: 'Two people shaking hands across a desk at the close of an interview.',
  },
  {
    slug: 'legal',
    title: 'Legal Services',
    desc: 'Smart AI contract analysis systems, discovery document processing tools, and legal workflow engines.',
    image: '/images/industries/legal.png',
    alt: 'A brass balance scale beside bound volumes on a lawyer’s desk.',
  },
  {
    slug: 'construction',
    title: 'Construction & Engineering',
    desc: 'Live project tracking tools, material supply dashboards, and custom blueprints systems.',
    image: '/images/industries/construction.png',
    alt: 'Two engineers in hard hats reading plans on a city construction site.',
  },
  {
    slug: 'automotive',
    title: 'Automotive',
    desc: 'Inventory telemetry dashboards, customer garage CRM integrations, and predictive parts procurement dashboards.',
    image: '/images/industries/automotive.png',
    alt: 'A finished car on an automated assembly line in a vehicle plant.',
  },
];
