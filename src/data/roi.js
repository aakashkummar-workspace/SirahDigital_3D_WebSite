/**
 * Reference data for the AI Automation ROI calculator.
 *
 * ── TODO: replace with Sirah Digital's own figures before launch ─────────
 * `automationFit`, `dealValue`, `baseConversion`, `readiness` and
 * `investmentBase` below are industry-plausible estimates, not Sirah's
 * measured results. They drive numbers a prospect will read as a forecast,
 * so they should be replaced with real engagement data. Every one of them is
 * a single named constant precisely so that swap is a one-line edit.
 *
 * The calculator surfaces a visible "indicative estimate" disclaimer for the
 * same reason — see CalculatorCTA.
 */

export const ROI_INDUSTRIES = [
  {
    id: 'healthcare',
    label: 'Healthcare',
    automationFit: 1.12,      // admin-heavy, highly repetitive — automates well
    dealValue: 1400,          // average value of one converted enquiry
    baseConversion: 0.22,
    recommendations: ['AI Receptionist', 'Appointment Automation', 'CRM Automation', 'Medical Document OCR', 'WhatsApp Follow-up'],
  },
  {
    id: 'real-estate',
    label: 'Real Estate',
    automationFit: 1.08,
    dealValue: 3200,
    baseConversion: 0.14,
    recommendations: ['Lead Response AI', 'Viewing Scheduler', 'CRM Autopilot', 'Contract OCR', 'WhatsApp Nurture'],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    automationFit: 1.05,
    dealValue: 5600,
    baseConversion: 0.18,
    recommendations: ['Production Dashboards', 'Predictive Maintenance', 'Supplier Workflow Automation', 'Purchase Order OCR'],
  },
  {
    id: 'retail',
    label: 'Retail',
    automationFit: 1.1,
    dealValue: 240,
    baseConversion: 0.31,
    recommendations: ['Inventory Automation', 'Customer Support AI', 'Order Processing', 'Marketing Automation', 'WhatsApp Commerce'],
  },
  {
    id: 'education',
    label: 'Education',
    automationFit: 1.02,
    dealValue: 1900,
    baseConversion: 0.2,
    recommendations: ['Admissions AI', 'Student Records OCR', 'Enrolment Workflow', 'Parent Communication Bot'],
  },
  {
    id: 'finance',
    label: 'Finance',
    automationFit: 1.15,      // the most process-driven of the set
    dealValue: 4200,
    baseConversion: 0.16,
    recommendations: ['KYC Document AI', 'Onboarding Automation', 'Compliance Workflow', 'Reporting Dashboards'],
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    automationFit: 1.06,
    dealValue: 480,
    baseConversion: 0.28,
    recommendations: ['Booking AI', 'Virtual Concierge', 'Review Response Automation', 'WhatsApp Reservations'],
  },
  {
    id: 'construction',
    label: 'Construction',
    automationFit: 0.94,      // more physical work, less of it automatable
    dealValue: 8500,
    baseConversion: 0.12,
    recommendations: ['Project Tracking', 'Material Ordering Automation', 'Blueprint Document AI', 'Subcontractor Workflow'],
  },
  {
    id: 'professional-services',
    label: 'Professional Services',
    automationFit: 1.13,
    dealValue: 3800,
    baseConversion: 0.19,
    recommendations: ['Document Intelligence', 'Client Onboarding AI', 'Time & Billing Automation', 'Proposal Generation'],
  },
  {
    id: 'automotive',
    label: 'Automotive',
    automationFit: 1.0,
    dealValue: 2600,
    baseConversion: 0.17,
    recommendations: ['Service Booking AI', 'Parts Inventory Automation', 'Garage CRM', 'Follow-up Automation'],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    automationFit: 1.09,
    dealValue: 2200,
    baseConversion: 0.21,
    recommendations: ['Route Optimisation', 'Shipment Tracking AI', 'Delivery Notification Bot', 'Freight Document OCR'],
  },
  {
    id: 'technology',
    label: 'Technology',
    automationFit: 1.11,
    dealValue: 4800,
    baseConversion: 0.15,
    recommendations: ['Support Triage AI', 'API Integration Layer', 'Onboarding Automation', 'Usage Analytics'],
  },
];

export const BUSINESS_SIZES = [
  // `readiness` scales how much of the theoretical automation a business of
  // this maturity actually realises in year one.
  // `investmentBase` is the fixed part of a typical engagement.
  { id: 'startup', label: 'Startup', readiness: 0.9, investmentBase: 6000 },
  { id: 'small', label: 'Small Business', readiness: 0.96, investmentBase: 12000 },
  { id: 'growing', label: 'Growing Business', readiness: 1.04, investmentBase: 24000 },
  { id: 'enterprise', label: 'Enterprise', readiness: 1.1, investmentBase: 48000 },
];

/**
 * The four inputs that actually move the answer.
 *
 * An earlier version asked for monthly leads, calls and documents as three
 * more sliders. They are gone: nine controls made the panel a form rather than
 * a simulator, and in practice nobody knows their document volume to the
 * nearest five hundred. Those volumes are now derived from team size (see
 * VOLUME_PER_EMPLOYEE below), so every metric — including revenue opportunity
 * — still works, with less asked of the visitor.
 */
export const ROI_INPUTS = [
  { id: 'teamSize', label: 'Team Size', min: 5, max: 1000, step: 5, unit: 'employees', hint: 'People whose work automation would touch' },
  { id: 'hourlyCost', label: 'Average Employee Hourly Cost', min: 10, max: 150, step: 1, unit: '$/hour', prefix: '$', hint: 'Fully loaded cost, not just salary' },
  { id: 'manualHours', label: 'Manual Hours Per Week', min: 1, max: 60, step: 1, unit: 'hrs/person', hint: 'Repetitive work per person, per week' },
  { id: 'currentAutomation', label: 'Current Automation Level', min: 0, max: 100, step: 1, unit: '%', suffix: '%', hint: 'How much already runs without a person' },
];

/**
 * Monthly transaction volume per employee, used to derive the figures the
 * sliders no longer ask for. Chosen so a 40-person business lands on roughly
 * the volumes the old defaults used, and everything scales from there.
 *
 * TODO: calibrate per industry if the spread turns out to matter.
 */
export const VOLUME_PER_EMPLOYEE = {
  leads: 10,
  calls: 22,
  docs: 62,
};

export const ROI_DEFAULTS = {
  teamSize: 40,
  hourlyCost: 32,
  manualHours: 14,
  currentAutomation: 15,
  industry: 'professional-services',
  businessSize: 'growing',
};
