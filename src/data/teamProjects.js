import { TEAM } from './team';

/*
 * What each member has built, keyed by their slug in data/team.js.
 *
 *   name   the build
 *   desc   one line, as supplied
 *   wip    true where the list said "(In Development)"
 *
 * ── provenance ───────────────────────────────────────────────────────────
 * Every name and every description here is reproduced verbatim from the list
 * Sirah Digital supplied. Nothing is inferred, reworded or tidied — these are
 * client systems, and a description of someone else's software is a claim
 * about their business.
 *
 * Two entries have since been corrected by Sirah Digital, on 19 Aug 2026, and
 * no longer read as the original list did: Aakash's "Sansfort" is "Sansfort
 * International School", and Garden Sip is a WhatsApp automation platform
 * rather than the "business management and operational platform" first
 * supplied. Both came from the same source as the rest of the file. Aakash's
 * BrainLit entry was added the same day and from the same source.
 *
 * "(In Development)" is lifted out of the name into `wip` rather than left in
 * the string. It is a status, not part of what the thing is called, and the
 * page renders it as its own small tag — which also means the titles read as
 * titles instead of half of them carrying a parenthetical.
 *
 * ── the overlaps are real ────────────────────────────────────────────────
 * Several builds appear under more than one person, because more than one
 * person worked on them:
 *
 *   Sheizen Wellness      Samad, Aakash
 *   Alshifa Ayush         Samad, Monisha
 *   LexDraft              Samad, Salman
 *   Evokz / Evokz Marketing, and Fortune Innovatives / Fortune Innovatives
 *   Website, are listed under two people each under slightly different names
 *   and with different descriptions.
 *
 * Those pairs are deliberately NOT merged into one shared record. The supplied
 * list gives each person their own name and their own line for the same build
 * — Samad's Alshifa Ayush is "Hospital and patient management platform for
 * Ayurveda clinics", Monisha's is "Ayurveda hospital management and patient
 * engagement platform" — and collapsing them would mean choosing one person's
 * description over another's. If these should read identically wherever they
 * appear, that is a content decision to make once and apply here.
 */
export const MEMBER_PROJECTS = {
  samad: [
    { name: 'Sheizen Wellness', desc: 'Nutritionist and dietitian client management platform.' },
    { name: 'Aura Transcriber', desc: 'AI-powered call recording and transcription platform.' },
    { name: 'LexDraft', desc: 'Legal document drafting and automation system.' },
    { name: 'Alshifa Ayush', desc: 'Hospital and patient management platform for Ayurveda clinics.' },
    { name: 'A1 Sivakasi', desc: 'Invoice automation and business operations system.' },
    { name: 'B2 Consultancy', desc: 'CRM platform for managing students, leads, and operations.' },
    { name: 'TNPSC Mentors', desc: 'Learning platform for TNPSC aspirants.' },
    { name: 'Evokz', desc: 'AI marketing automation and content management tool.' },
  ],

  aakash: [
    { name: 'Sheizen Wellness', desc: 'Nutritionist and dietitian client management platform.' },
    { name: 'Fortune Innovatives', desc: 'End-to-end educational institute CRM platform.' },
    { name: 'Sansfort International School', desc: 'School management CRM for admins, teachers, students, and transport.' },
    { name: 'Garden Sip', desc: 'WhatsApp automation platform.' },
    { name: 'NUSI', desc: 'Healthcare practice management platform for nutritionists and dietitians.' },
    /*
     * Supplied 19 Aug 2026, and the only entry in this file that names its
     * author: Sirah Digital said the BrainLit website is Aakash's build, so it
     * is listed here and under no one else.
     *
     * We also built BrainLit a chatbot and a CRM — both are in
     * data/portfolio.js — but nothing said who built those, and putting them
     * on this page would be inventing an attribution.
     */
    { name: 'BrainLit', desc: 'Immersive 3D website build.' },
  ],

  salman: [
    { name: 'Analytics Agent', desc: 'AI-powered business analytics and decision-making agent.', wip: true },
    { name: 'LexDraft', desc: 'AI legal drafting and document generation platform.', wip: true },
  ],

  monisha: [
    { name: 'Alshifa Ayush', desc: 'Ayurveda hospital management and patient engagement platform.' },
    { name: 'Fortune Innovatives Website', desc: 'Corporate website and digital presence platform.' },
    { name: 'RD Interlocks', desc: 'Operations and workflow management system for brick manufacturing.' },
    { name: 'Evokz Marketing', desc: 'Marketing automation and campaign management platform.' },
    { name: 'Knowmind Universe', desc: 'Psychology SaaS platform with assessments and analytics.' },
    { name: 'IWIS', desc: 'Enterprise workflow and information management system.', wip: true },
  ],

  jesheeba: [
    { name: 'Installtec', desc: 'CRM platform for installation and service operations.', wip: true },
    { name: 'Combo Dress', desc: 'Inventory and order management system for apparel business.' },
    { name: 'GV Mart', desc: 'CRM and business management platform.', wip: true },
    { name: 'Wasi', desc: 'WhatsApp automation and customer engagement platform.', wip: true },
  ],
};

export const projectsFor = (slug) => MEMBER_PROJECTS[slug] || [];

/*
 * Every member must have a list, and every list must belong to a member.
 *
 * Thrown at import time rather than checked at render, the same way
 * data/productDetails.js guards its own slugs: a member page that silently
 * renders an empty journey looks like a design decision, and a list keyed to
 * a slug nobody has is invisible until someone goes looking for it.
 */
const slugs = new Set(TEAM.map((m) => m.slug));
const orphans = Object.keys(MEMBER_PROJECTS).filter((s) => !slugs.has(s));
if (orphans.length) {
  throw new Error(`[teamProjects] no member in TEAM matches: ${orphans.join(', ')}`);
}
const missing = TEAM.filter((m) => !MEMBER_PROJECTS[m.slug]).map((m) => m.slug);
if (missing.length) {
  throw new Error(`[teamProjects] no projects listed for: ${missing.join(', ')}`);
}
