import { ROI_INDUSTRIES, BUSINESS_SIZES, VOLUME_PER_EMPLOYEE } from '@/data/roi';

/**
 * The ROI model.
 *
 * Every assumption is a named constant in one block so the whole model can be
 * retuned without reading the arithmetic. Nothing here is hardcoded to produce
 * a flattering number — change an input and the result moves with it, and a
 * business that is already 90% automated correctly sees very little upside.
 *
 * ── TODO: calibrate against real engagements before launch ───────────────
 * These are industry-plausible defaults, not Sirah's measured results. The
 * output is presented to prospects as an indicative estimate for exactly this
 * reason.
 */

const A = {
  /** Working weeks per year, allowing for leave and public holidays. */
  WEEKS_PER_YEAR: 46,
  /** Contracted hours in a working week, used for the productivity share. */
  HOURS_PER_WEEK: 40,

  /**
   * Share of *repetitive* work that AI automation can realistically absorb.
   * Deliberately well under 100%: exception handling, judgement calls and
   * relationship work stay with people.
   */
  BASE_AUTOMATABLE: 0.62,
  /** Hard ceiling on coverage, whatever the multipliers produce. */
  MAX_COVERAGE: 0.88,

  /** Minutes of human time each transaction consumes today. */
  MINUTES_PER_LEAD: 8,
  MINUTES_PER_CALL: 6,
  MINUTES_PER_DOC: 4,

  /**
   * The share of freed hours that becomes an actual cash saving.
   *
   * This is the most important constant in the model and the one most often
   * got wrong. Freeing 10,000 hours does not remove 10,000 hours of payroll —
   * most of it is capacity redeployed onto work the team could not get to
   * before. Only a minority shows up as avoided cost: overtime not paid,
   * contractors not hired, roles not backfilled.
   *
   * The full time recovered is still reported, as hours and as productivity.
   * It simply is not all counted as money, because it is not.
   */
  SAVINGS_REALISATION: 0.35,

  /**
   * Relative conversion uplift from replying in seconds rather than hours,
   * scaled by how much of the funnel is actually automated.
   */
  MAX_CONVERSION_UPLIFT: 0.12,

  /** Typical first response time before automation, in minutes. */
  RESPONSE_BEFORE_MINS: 360,
  /** After: an AI agent replies effectively immediately. */
  RESPONSE_AFTER_MINS: 0.5,

  /**
   * Engagement cost: a fixed base per business size, plus scope.
   * Per seat covers rollout, integration and training; per transaction covers
   * building and running the automation that handles that volume.
   */
  COST_PER_SEAT: 240,
  COST_PER_1K_TRANSACTIONS: 600,
  /** Ongoing support, hosting and model costs as a share of build, per year. */
  RUN_COST_SHARE: 0.25,
};

export const ASSUMPTIONS = A;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function calculateROI(input) {
  const industry = ROI_INDUSTRIES.find((i) => i.id === input.industry) || ROI_INDUSTRIES[0];
  const size = BUSINESS_SIZES.find((s) => s.id === input.businessSize) || BUSINESS_SIZES[0];

  const teamSize = Math.max(1, input.teamSize);
  const hourlyCost = Math.max(1, input.hourlyCost);

  // You cannot automate what is already automated — the remaining headroom is
  // what any of this can act on. At 100% current automation the upside is nil,
  // which is the honest answer.
  const headroom = 1 - clamp(input.currentAutomation, 0, 100) / 100;
  const coverage = clamp(
    A.BASE_AUTOMATABLE * industry.automationFit * size.readiness * headroom,
    0,
    A.MAX_COVERAGE
  );

  /* ── derived volumes ──────────────────────────────────────────────────
     Leads, calls and documents scale with headcount rather than being asked
     for directly — four honest inputs beat nine guessed ones. */
  const monthlyLeads = Math.round(teamSize * VOLUME_PER_EMPLOYEE.leads);
  const monthlyCalls = Math.round(teamSize * VOLUME_PER_EMPLOYEE.calls);
  const monthlyDocs = Math.round(teamSize * VOLUME_PER_EMPLOYEE.docs);

  /* ── time ─────────────────────────────────────────────────────────────── */
  const manualHoursPerYear = teamSize * input.manualHours * A.WEEKS_PER_YEAR;

  const transactionsPerYear =
    (monthlyLeads * A.MINUTES_PER_LEAD +
      monthlyCalls * A.MINUTES_PER_CALL +
      monthlyDocs * A.MINUTES_PER_DOC) * 12;
  const transactionHoursPerYear = transactionsPerYear / 60;

  const hoursSaved = (manualHoursPerYear + transactionHoursPerYear) * coverage;

  /* ── money ──────────────────────────────────────────────────────────────
     Only the realised share of freed time is counted as cash. The rest is
     real value, but it is capacity, and it is reported as hours instead. */
  const labourSavings = hoursSaved * hourlyCost * A.SAVINGS_REALISATION;

  const annualLeads = monthlyLeads * 12;
  const conversionUplift = A.MAX_CONVERSION_UPLIFT * coverage;
  const revenueOpportunity =
    annualLeads * industry.baseConversion * conversionUplift * industry.dealValue;

  const totalTransactions = (monthlyLeads + monthlyCalls + monthlyDocs) * 12;
  const buildCost =
    size.investmentBase +
    teamSize * A.COST_PER_SEAT +
    (totalTransactions / 1000) * A.COST_PER_1K_TRANSACTIONS;
  const investment = buildCost * (1 + A.RUN_COST_SHARE);

  const annualSavings = labourSavings;
  const annualBenefit = annualSavings + revenueOpportunity;

  const roi = investment > 0 ? ((annualBenefit - investment) / investment) * 100 : 0;
  const paybackMonths = annualBenefit > 0 ? (investment / annualBenefit) * 12 : 0;

  /* ── ratios ───────────────────────────────────────────────────────────── */
  const totalWorkHours = teamSize * A.HOURS_PER_WEEK * A.WEEKS_PER_YEAR;
  const productivityGain = totalWorkHours > 0 ? (hoursSaved / totalWorkHours) * 100 : 0;

  // Where the business lands overall: what it already automates, plus what
  // this would add on top of the remainder.
  const automationCoverage = clamp(input.currentAutomation + coverage * headroom * 100, 0, 99);

  const responseImprovement = A.RESPONSE_BEFORE_MINS / A.RESPONSE_AFTER_MINS;

  return {
    coverage,
    annualSavings,
    revenueOpportunity,
    annualBenefit,
    hoursSaved,
    manualHoursPerYear: manualHoursPerYear + transactionHoursPerYear,
    productivityGain: clamp(productivityGain, 0, 100),
    roi,
    paybackMonths,
    automationCoverage,
    investment,
    responseImprovement,
    industry,
    size,
    // surfaced so the report can show what was assumed on the visitor's behalf
    monthlyLeads,
    monthlyCalls,
    monthlyDocs,
  };
}

/* ── formatting ─────────────────────────────────────────────────────────── */

export const money = (n) => {
  const v = Math.round(n);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(v >= 100_000 ? 0 : 1)}K`;
  return `$${v}`;
};

/**
 * Thousands separators with an explicit locale.
 *
 * Bare toLocaleString() reads the *runtime's* locale, and the Node server and
 * the visitor's browser do not have to agree — an en-IN server renders 100000
 * as "1,00,000" while an en-US browser renders "100,000", which React reports
 * as a hydration mismatch and repaints. Pinning the locale makes both sides
 * produce the same string.
 */
export const num = (n) => Number(n).toLocaleString('en-US');

export const compact = (n) => {
  const v = Math.round(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(v >= 100_000 ? 0 : 1)}K`;
  return `${v}`;
};
