import {
  Activity, Award, BadgeCheck, BarChart3, BedDouble, BellRing, Bot, Boxes,
  BookOpen, Building2, CalendarCheck, Car, CheckCircle2, ClipboardList,
  CreditCard, Factory, FileSearch, FileSignature, FileText, FlaskConical,
  FolderOpen, Gavel, GraduationCap, Hammer, Handshake, KeyRound, LogIn,
  LogOut, MapPin, MessageSquare, MessagesSquare, Navigation, Package, Phone,
  Rocket, Route, ScanSearch, ShieldCheck, ShoppingCart, Sparkles, Stethoscope,
  TrendingUp, Truck, UserCheck, UserPlus, Users, Wrench, Workflow,
} from 'lucide-react';

/*
 * Step title → icon.
 *
 * timeline.md asks for icons to map automatically from the step name, so
 * there is no icon field in the workflow data and adding a step needs no
 * icon decision. The cost of that is this table: eighty-four step titles
 * across twelve industries all have to land on something sensible.
 *
 * Rules are ordered and the first match wins, which is what lets the
 * specific ones sit above the general. "Performance Review" has to be read
 * before "review", "Attendance Tracking" before "tracking", and "Warehouse
 * Allocation" before the bare "allocation" that Room and Course also match.
 * Reordering this list is therefore not safe — verify against every title
 * afterwards.
 */
const ICON_RULES = [
  // ── Specific phrases, ahead of the general words inside them ──────────
  [/performance review/, Award],
  [/client success/, Award],
  [/progress/, TrendingUp],
  [/attendance/, UserCheck],
  [/live track/, MapPin],
  [/document review/, FileSearch],
  [/service request/, MessagesSquare],
  // Check-in and check-out sit above the people rule below, or "Guest
  // Check-in" resolves on "guest" and never reaches them.
  [/check-in/, LogIn],
  [/check-out/, LogOut],
  [/consultation/, Stethoscope],
  // Split, because a hotel's Property and an agent's Site Visit are
  // adjacent steps on the same page and must not draw the same glyph.
  [/property/, Building2],
  [/site visit/, MapPin],
  [/site execution|execution/, Hammer],
  [/warehouse/, Boxes],
  [/room/, BedDouble],
  [/course/, BookOpen],
  [/case intake|intake/, FolderOpen],
  [/court/, Gavel],

  // ── Measurement and outcomes ──────────────────────────────────────────
  [/analytic|dashboard/, BarChart3],
  [/^reports?$/, FileText],

  // ── Prompts and conversation ──────────────────────────────────────────
  [/reminder|notification|follow-?up/, BellRing],
  [/feedback/, MessageSquare],
  [/interview/, MessagesSquare],
  [/call/, Phone],

  // ── Scheduling ────────────────────────────────────────────────────────
  [/kickoff/, Rocket],
  [/appointment|booking|schedul/, CalendarCheck],

  // ── Intelligence ──────────────────────────────────────────────────────
  [/reception|^ai\b/, Bot],
  [/qualification|recommendation/, Sparkles],
  [/screening/, ScanSearch],
  [/diagnos|monitoring|machine/, Activity],

  // ── Assurance ─────────────────────────────────────────────────────────
  [/quality|inspection/, ShieldCheck],
  [/compliance/, ShieldCheck],
  [/approval/, BadgeCheck],
  [/testing/, FlaskConical],

  // ── Paperwork ─────────────────────────────────────────────────────────
  [/offer|proposal/, FileSignature],
  [/drafting|documentation|records?|document/, FileText],

  // ── People ────────────────────────────────────────────────────────────
  [/enquiry|lead|applied|candidate/, UserPlus],
  [/onboarding/, UserCheck],
  [/training|admission/, GraduationCap],
  [/parent|customer|guest|client/, Users],
  [/negotiation/, Handshake],

  // ── Goods and movement ────────────────────────────────────────────────
  [/cart/, ShoppingCart],
  [/payment/, CreditCard],
  [/order/, Package],
  [/dispatch|shipment|delivery/, Truck],
  [/route/, Route],
  [/tracking/, Navigation],
  [/material|procurement|inventory|allocation/, Boxes],

  // ── Work ──────────────────────────────────────────────────────────────
  [/production|manufactur/, Factory],
  [/planning|plan/, ClipboardList],
  [/repair|maintenance/, Wrench],
  [/vehicle/, Car],
  [/handover/, KeyRound],
  [/closure|closed|confirm/, CheckCircle2],
];

// Anything the table misses still renders — a generic workflow glyph rather
// than a hole in the row.
const FALLBACK = Workflow;

export function iconFor(title) {
  const t = String(title).toLowerCase();
  for (const [pattern, Icon] of ICON_RULES) {
    if (pattern.test(t)) return Icon;
  }
  return FALLBACK;
}
