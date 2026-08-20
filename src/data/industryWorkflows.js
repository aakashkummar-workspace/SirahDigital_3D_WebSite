/*
 * The workflow each industry page visualises, keyed by slug.
 *
 * Step titles are taken verbatim from timeline.md — they are the spec's own
 * wording and should not drift. The one-line descriptions are written here:
 * the timeline nodes carry a title and a short line under it, and a title
 * alone leaves the second line empty on every node of every page.
 *
 * Keep descriptions to four or five words. On desktop a node is about 150px
 * wide, so anything longer wraps to a third line and pushes the row out of
 * alignment with its neighbours.
 *
 * Icons are not stored here. They are derived from the step title by
 * components/industries/workflowIcons.js, so adding a step needs no icon
 * decision and no import.
 */
export const INDUSTRY_WORKFLOWS = {
  healthcare: [
    { title: 'Patient Appointment', desc: 'Booked online or by phone' },
    { title: 'AI Reception', desc: 'Queries answered, intent captured' },
    { title: 'Doctor Scheduling', desc: 'Matched to the right slot' },
    { title: 'Visit & Consultation', desc: 'Clinician sees the full history' },
    { title: 'Digital Records', desc: 'Notes and scans filed by OCR' },
    { title: 'Follow-up Automation', desc: 'Reminders and no-show recovery' },
    { title: 'Analytics Dashboard', desc: 'Load, outcomes and gaps' },
  ],
  manufacturing: [
    { title: 'Production Request', desc: 'Lands from sales or ERP' },
    { title: 'AI Planning', desc: 'Line and shift plan generated' },
    { title: 'Inventory Check', desc: 'Stock and lead times reconciled' },
    { title: 'Machine Monitoring', desc: 'Live telemetry off the floor' },
    { title: 'Quality Inspection', desc: 'Defects caught before dispatch' },
    { title: 'Dispatch', desc: 'Loads built and released' },
    { title: 'Performance Analytics', desc: 'Yield, downtime and OEE' },
  ],
  education: [
    { title: 'Student Enquiry', desc: 'Captured from any channel' },
    { title: 'Admission Automation', desc: 'Forms, fees and verification' },
    { title: 'Course Allocation', desc: 'Batches and electives assigned' },
    { title: 'Attendance Tracking', desc: 'Marked and reconciled daily' },
    { title: 'Learning Analytics', desc: 'Risk surfaced early' },
    { title: 'Parent Notifications', desc: 'Scheduled and event-driven' },
    { title: 'Reports', desc: 'Termly records, generated once' },
  ],
  'real-estate': [
    { title: 'Lead Captured', desc: 'Portal, advert or walk-in' },
    { title: 'AI Qualification', desc: 'Budget and intent scored' },
    { title: 'Property Matching', desc: 'Inventory ranked per buyer' },
    { title: 'Site Visit Booking', desc: 'Slots held and confirmed' },
    { title: 'Negotiation', desc: 'Offers tracked in one thread' },
    { title: 'Documentation', desc: 'Agreements drafted and signed' },
    { title: 'Deal Closed', desc: 'Handover and payout recorded' },
  ],
  'retail-ecommerce': [
    { title: 'Customer Visit', desc: 'Storefront or shop floor' },
    { title: 'Product Recommendation', desc: 'Ranked on behaviour and stock' },
    { title: 'Cart', desc: 'Held, recovered, re-priced' },
    { title: 'Payment', desc: 'Any method, one reconciliation' },
    { title: 'Order Processing', desc: 'Picked, packed and allocated' },
    { title: 'Delivery', desc: 'Dispatched and tracked' },
    { title: 'Customer Feedback', desc: 'Collected and routed' },
  ],
  logistics: [
    { title: 'Order Received', desc: 'Booked across every channel' },
    { title: 'Warehouse Allocation', desc: 'Nearest node holding stock' },
    { title: 'Route Optimization', desc: 'Sequenced against live traffic' },
    { title: 'Shipment', desc: 'Manifested and released' },
    { title: 'Live Tracking', desc: 'Position and ETA per consignment' },
    { title: 'Delivery', desc: 'Proof captured at the door' },
    { title: 'Performance Dashboard', desc: 'Cost per drop and SLA' },
  ],
  'professional-services': [
    { title: 'Client Enquiry', desc: 'Qualified before it reaches you' },
    { title: 'Discovery Call', desc: 'Notes and actions transcribed' },
    { title: 'Proposal', desc: 'Scoped, priced and sent' },
    { title: 'Project Kickoff', desc: 'Workspace and plan provisioned' },
    { title: 'Execution', desc: 'Time, tasks and approvals tracked' },
    { title: 'Delivery', desc: 'Handover pack assembled' },
    { title: 'Client Success', desc: 'Renewals and referrals prompted' },
  ],
  'hospitality-travel': [
    { title: 'Booking', desc: 'Direct or through any OTA' },
    { title: 'Confirmation', desc: 'Instant, on the guest’s channel' },
    { title: 'Room Allocation', desc: 'Assigned on preference and load' },
    { title: 'Guest Check-in', desc: 'Digital, ahead of arrival' },
    { title: 'Service Requests', desc: 'Routed to the right team' },
    { title: 'Check-out', desc: 'Billed and settled automatically' },
    { title: 'Feedback', desc: 'Collected while it still matters' },
  ],
  'human-resources': [
    { title: 'Candidate Applied', desc: 'Sourced from every channel' },
    { title: 'Resume Screening', desc: 'Ranked against the role' },
    { title: 'Interview', desc: 'Scheduled, scored and recorded' },
    { title: 'Offer', desc: 'Generated and tracked to signature' },
    { title: 'Onboarding', desc: 'Accounts, assets and paperwork' },
    { title: 'Training', desc: 'Assigned by role and progress' },
    { title: 'Performance Review', desc: 'Cycles run without chasing' },
  ],
  legal: [
    { title: 'Case Intake', desc: 'Conflicts checked at the door' },
    { title: 'Document Review', desc: 'Clauses extracted and compared' },
    { title: 'Legal Drafting', desc: 'Built from approved precedent' },
    { title: 'Approval', desc: 'Routed by matter and value' },
    { title: 'Court Process', desc: 'Dates, filings and bundles' },
    { title: 'Compliance', desc: 'Obligations tracked to deadline' },
    { title: 'Closure', desc: 'Archived with an audit trail' },
  ],
  construction: [
    { title: 'Project Planning', desc: 'Scope, programme and budget' },
    { title: 'Material Procurement', desc: 'Ordered against the schedule' },
    { title: 'Site Execution', desc: 'Daily logs from the field' },
    { title: 'Progress Tracking', desc: 'Measured against the plan' },
    { title: 'Quality Check', desc: 'Snags raised and closed' },
    { title: 'Handover', desc: 'Drawings and certificates issued' },
    { title: 'Maintenance', desc: 'Planned against asset life' },
  ],
  automotive: [
    { title: 'Vehicle Booking', desc: 'Slot held against bay capacity' },
    { title: 'Inspection', desc: 'Condition captured on arrival' },
    { title: 'Diagnosis', desc: 'Fault codes read and priced' },
    { title: 'Repair', desc: 'Parts reserved, work authorised' },
    { title: 'Testing', desc: 'Road and bench verification' },
    { title: 'Delivery', desc: 'Handed back with the record' },
    { title: 'Service Reminder', desc: 'Next due, predicted' },
  ],
};
