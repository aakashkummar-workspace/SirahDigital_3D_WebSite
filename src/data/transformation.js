/**
 * Copy and theming for the homepage "Visual Transformation Story".
 *
 * ── TODO: verify before launch ───────────────────────────────────────────
 * Every string below came from the reference design package, not from Sirah
 * Digital's own records. It carries specific claims — "42 Unhandled Leads",
 * "+340% increase in booked client meetings", "99.8% process accuracy",
 * "Zero lost leads", "6+ hours", "60% time wasted" — and names third-party
 * products (HubSpot, Google Calendar, WhatsApp). Confirm or replace all of it
 * before this goes live. Nothing else in the codebase depends on the wording.
 *
 * ── Colour note ──────────────────────────────────────────────────────────
 * Crimson and emerald sit outside the Sirah palette. They are used only as
 * story signals — alert marks, the revenue line, the rim light on the figure.
 * Every structural colour stays on brand (#16142C / #6366F1 / #A855F7 /
 * #22D3EE / #FFFFFF / #CBD5E1).
 */

// One source of truth for the scene duration: feeds both the autoplay timeout
// and the CSS animationDuration on the progress bar. Never hardcode 3s.
export const SCENE_MS = 3000;

export const SCENES = [
  {
    id: 'chaos',
    tab: 'Chaos',
    tabLong: 'Scene 1: Chaos',
    phase: 'BEFORE: Manual Operations Chaos',
    accent: '#F43F5E',       // crimson — semantic only
    accentSoft: '#FDA4AF',
    title: 'Drowning in Paperwork, Unanswered Texts & Missed Leads',
    body:
      'Business owner spending 14 hours a day trapped in manual data entry, ringing phones, lost WhatsApp inquiries, and spreadsheets. Stress is high, growth is stalled, and sales are slipping to faster competitors.',
    points: [
      'Average lead response time: 6+ hours',
      '60% time wasted on repetitive admin work',
      'High human error in manual CRM entries',
    ],
    status: '42 Unhandled Leads • Manual Chaos • 14hr Workday',
    statusTone: 'alert',
  },
  {
    id: 'sirah-ai',
    tab: 'Sirah AI',
    tabLong: 'Scene 2: Sirah AI',
    phase: 'TRANSFORMATION: Sirah Digital AI Deployment',
    accent: '#22D3EE',       // brand Highlight
    accentSoft: '#6366F1',
    title: 'Autonomous AI Workflows Take Over the Repetitive Work',
    body:
      'Sirah Digital connects the entire tech stack. Custom AI agents respond to WhatsApp in 10 seconds, qualify prospects, update HubSpot CRM, lock calendar appointments, and email audit PDF reports automatically.',
    points: [
      'WhatsApp & Voice AI handle inbound 24/7',
      'Instant CRM sync & automated document parsing',
      'Google Calendar auto-locking for meetings',
    ],
    status: 'Sirah Multi-Agent Swarm Connected & Active',
    statusTone: 'bolt',
  },
  {
    id: 'autopilot',
    tab: 'Autopilot',
    tabLong: 'Scene 3: Autopilot',
    phase: 'AFTER: Peaceful Scalability & 3x Revenue',
    accent: '#34D399',       // emerald — semantic only
    accentSoft: '#6EE7B7',
    title: 'Relaxed, Scaled Business with Skyrocketing Revenue',
    body:
      'The business owner works peacefully from a clean desk with laptop open. Revenue graphs trend sharply upwards. Clients receive instant world-class care, and the business grows effortlessly on autopilot.',
    points: [
      '15+ hours freed up every single week',
      '+340% increase in booked client meetings',
      'Zero lost leads & 99.8% process accuracy',
    ],
    status: 'Revenue +340% • 100% Autopilot • Zero Stress',
    statusTone: 'rocket',
  },
];

// The four systems the AI core wires together in scene 2.
export const ORBIT_NODES = [
  { id: 'whatsapp', label: 'WhatsApp', angle: -90 },
  { id: 'crm', label: 'CRM', angle: 0 },
  { id: 'calendar', label: 'Calendar', angle: 90 },
  { id: 'email', label: 'Email', angle: 180 },
];
