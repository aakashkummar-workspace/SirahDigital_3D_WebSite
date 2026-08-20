import { HOME_PRODUCTS } from './products';

/*
 * The "Product page" half of each product record — everything /products/<slug>
 * renders that the row on /products does not. Keyed by slug so the route can look
 * one up without a scan, mirroring the INDUSTRIES / INDUSTRY_INTELLIGENCE
 * split next door.
 *
 * Field names match sirah-cms/src/collections/Products.ts's "Product page" tab
 * (heroShot ↔ heroImage, features[] { title, desc, icon }) so that wiring this
 * to Payload later is a field rename at most, not a reshape. Aura's extra
 * sections are the exception — see the CMS note at the foot of this file.
 *
 * ── on the copy ────────────────────────────────────────────────────────────
 * Every string below is marked with where it came from:
 *
 *   TODO(copy): drafted     — written for this build. Plausible, consistent
 *                             with the one-liner in products.js, and NOT
 *                             confirmed by anyone who works on the product.
 *                             Review before this page is advertised anywhere.
 *   (products_home.md)      — lifted from the earlier spec at the repo root,
 *                             which carries real long-form copy for NUSI.
 *                             Trustworthy.
 *   (aura.sirahagents.com)  — taken from Aura's own live product site: the
 *                             product team's own words, and the source that
 *                             outranks the other two where they disagree.
 *
 * They did disagree. Aura's entry used to describe real-time transcription of a
 * call in progress; the product reads recordings the handset's own dialer has
 * already written, after the call ends. The drafted copy is gone rather than
 * softened, and the homepage one-liner in products.js was corrected with it.
 *
 * Analytics Agents has no long-form source anywhere in the repo, so all three
 * of its features are drafted. It needs a review pass more than the other two —
 * more so now that Aura's is sourced.
 *
 * ── on the screenshots ─────────────────────────────────────────────────────
 * One frame per product, and no tours. Three captioned placeholders on a page
 * are three promises to take screenshots; one is enough to say what a product
 * looks like.
 *
 * NUSI's is a real file. The other two are still paths with nothing behind
 * them, which is fine: lib/productImages.js checks each against disk at build
 * time and nulls the ones that are missing, so a frame with no file renders as
 * a captioned placeholder in the same box. Drop a PNG at the named path and it
 * appears with no code change — at its own aspect ratio, which that module
 * reads off the file.
 *
 * The captions are load-bearing, not decorative — they are what the placeholder
 * shows, and they are what tells whoever takes the screenshots which screen
 * each slot wants.
 */
export const PRODUCT_DETAILS = {
  'aura-transcriber': {
    // (aura.sirahagents.com) — the product's own tagline, in the <title> of
    // its site and the footer of every page on it.
    tagline: 'Every call, accounted for',
    // (aura.sirahagents.com hero) — condensed from the headline and standfirst.
    //
    // Note what this no longer says. The previous copy here promised real-time
    // transcription and a supervisor reading a call in progress; the product
    // does not work that way. Aura reads the recordings the handset's own
    // dialer has already written, after the call ends. Live transcription was
    // a demo nobody could have given.
    summary:
      'Aura reads the call recordings your telecallers’ own phones already make, writes them down in Tamil and English, and tells you what they add up to: which days convert, which people convert, and which objection keeps ending the conversation.',
    // (aura.sirahagents.com — the three lines under its hero CTA) Short enough
    // to sit on one row beside the buttons, and each one answers an objection
    // that otherwise stops a reader before the page does its work.
    assurances: [
      'Nothing to install',
      'No obligation',
      'We’ll tell you honestly if it isn’t a fit',
    ],
    /*
     * Aura's own landing page, which is where "Get it now" in the hero goes.
     *
     * It is the one product here with a site of its own, so it is the one
     * product whose hero has somewhere to send a reader who is already sold.
     * The other two fall back to the "See our work" link, because sending them
     * to a page that does not exist is worse than sending them to the work.
     *
     * Note where this does NOT go: there is still no checkout anywhere in this
     * company's estate. The far end of this link is Aura's own hero, whose CTA
     * is "Book my call". "Get it now" is the strongest label the destination
     * can carry without lying about what happens next.
     */
    landingUrl: 'https://aura.sirahagents.com/',

    /*
     * The only image on this page.
     *
     * The caption is not "the call dashboard" any more, which is what this
     * slot was reserved for and waited on. The file that arrived is
     * aura.sirahagents.com's hero: one call, the customer line and the agent
     * line, and beside them the fields pulled out of it — quantity, product,
     * site, rate quoted, value, next step — under "sent to your CRM". That is
     * a better first frame than a dashboard would have been, because it shows
     * the transformation the third feature below describes, but the caption
     * has to say what is actually in the picture.
     *
     * The path still reads 01-dashboard.png. Renaming it would break nothing
     * but is not worth a churned file; the caption is what the page shows.
     */
    heroShot: {
      src: '/products/aura-transcriber/01-dashboard.png',
      caption: 'One call, and the fields pulled out of it',
    },
    /*
     * These three are the four steps on aura.sirahagents.com, compressed.
     *
     * The page carried both for a while: this row, and a "How it works"
     * section spelling out the same four steps at length underneath it. They
     * said the same things in the same order — the phone records, the upload
     * happens by itself, the details come out, it lands in the CRM — so the
     * longer one is gone and what it knew is folded in here. The CRM names in
     * particular were worth keeping; the second telling of them was not.
     */
    features: [
      {
        // (aura.sirahagents.com — "How it works", steps 1 and 2)
        title: 'Nothing to install',
        desc: 'Your team keeps its own handsets and numbers, and your customer installs nothing. The recording uploads by itself, encrypted in transit, and retries if the connection drops.',
        icon: 'mic',
      },
      {
        // (aura.sirahagents.com — "Built for how Tamil Nadu sells")
        title: 'Tamil and English, code-switched',
        desc: 'Including the half-and-half sentences people actually speak. Not an English product with a translation bolted on.',
        icon: 'languages',
      },
      {
        // (aura.sirahagents.com — steps 3 and 4)
        title: 'Straight into your CRM',
        desc: 'Quantity, product, site, rate, value and next step come out of the conversation as fields, then arrive in LeadSquared, HubSpot, Freshsales, Pipedrive and seven more as a lead nobody typed twice. No CRM? Use Aura’s own board.',
        icon: 'search',
      },
    ],

    /*
     * ── the sections below are Aura-only ────────────────────────────────────
     * Both keys are optional and render only when present, so the other two
     * products are unaffected by their absence. Aura has its own product site
     * to source them from — aura.sirahagents.com, plus its /compatibility,
     * /security and /consent pages — and these are the two things on it that a
     * buyer decides on and a feature row cannot hold: what the product tells
     * you, and what it does with the recordings.
     *
     * Neither has a counterpart in sirah-cms's Products "Product page" tab.
     * See the note at the foot of this file.
     */

    // (aura.sirahagents.com — "What you get: six answers a call log will never
    // give you.") Four of the six. The two dropped — "consolidated, not raw"
    // and "built for how Tamil Nadu sells" — are both already said above, in
    // the summary and in the second feature, and repeating them here was most
    // of why this section ran long. The remaining four are the ones a call log
    // genuinely cannot answer, which is the claim the section is making.
    outcomes: {
      title: 'What you get',
      subtitle: 'Answers a call log will never give you.',
      items: [
        {
          title: 'Which days actually convert',
          desc: 'Calls and leads, day by day, so staffing Monday morning stops being a guess.',
        },
        {
          title: 'Which telecaller actually converts',
          desc: 'Not who dialled the most. Who turned calls into leads - and, because every call is written down, what they say that the others do not.',
        },
        {
          title: 'The objections, counted',
          desc: 'What people actually push back on, across every call, ranked. Not the one your loudest telecaller mentioned in the meeting.',
        },
        {
          title: 'Something to train on',
          desc: 'A real call where the objection was handled well, in writing, ready to read out in Monday’s huddle.',
        },
      ],
    },

    // (aura.sirahagents.com — "From people using it") Both quotes are on the
    // product site, attributed as they are here. Left word for word: trimming
    // someone else's testimonial to fit a layout is not an editing decision
    // this file gets to make.
    quotes: [
      {
        quote:
          'Our conversion rate is five times what it was. We are not calling more people, we finally know which calls are worth following up.',
        source: 'RD Interlock Bricks',
      },
      {
        quote:
          'The insights are what we train the team on now. Our objection handling is a different thing from what it was, because everyone can see what actually worked on a real call.',
        source: 'Fortune Innovatives',
      },
    ],

    /*
     * (aura.sirahagents.com/security and /consent)
     *
     * `limits` is not a hedge and should not be edited into one. Aura's own
     * site states these plainly — the handsets it cannot use, the calls it
     * cannot record — on the stated grounds that a buyer discovering them
     * during procurement is worse than reading them up front. Carrying the
     * strengths here without them would make this page the softer version of
     * the product's own, which is the wrong way round.
     *
     * A third limit used to sit here: no SOC 2 or ISO 27001, no uptime SLA, no
     * SSO, database in Seoul. It is gone from this page and only this page.
     * That is procurement detail rather than a reason a reader would walk away
     * mid-page, and the security link below opens on the paragraph that says
     * it. The two that remain are different in kind — they decide whether the
     * product works at all for a given team, and a reader on the wrong
     * handsets should learn it here rather than on a call.
     */
    trust: {
      title: 'What that means for your data',
      subtitle: 'Including the parts that are not finished.',
      items: [
        {
          title: 'Isolation enforced by the database',
          desc: 'Every table holding your data sits behind a forced Postgres row-level security policy, and the application connects as a role that cannot bypass it.',
          icon: 'shield',
        },
        {
          title: 'Recording announced by default',
          desc: 'The handset plays a tone into the call when capture begins, and every call carries a flag for whether it played - so it is something you can check rather than assert.',
          icon: 'bell',
        },
        {
          title: 'Retention you set, erasure you can prove',
          desc: 'Ninety days out of the box. Erasing a call cascades through transcript, extracted fields and lead, then writes a signed receipt into your audit log.',
          icon: 'trash',
        },
      ],
      limits: [
        'Pixel, Motorola and Nokia handsets cannot be used for capture: the Google Dialer keeps recordings in private app storage Android blocks every other app from reading. Samsung, Xiaomi, Redmi, POCO, Realme, Oppo, Vivo and OnePlus handsets work.',
        'WhatsApp, Telegram and Signal calls cannot be recorded. Android gives the messaging app exclusive use of the microphone, so any recorder receives silence - Aura captures the metadata of those calls, not the audio.',
      ],
      links: [
        { label: 'Phone compatibility', href: 'https://aura.sirahagents.com/compatibility' },
        { label: 'How Aura handles your data', href: 'https://aura.sirahagents.com/security' },
        { label: 'Call recording and consent', href: 'https://aura.sirahagents.com/consent' },
      ],
    },

    /*
     * (aura.sirahagents.com — "What you get for asking")
     *
     * The closing band's default copy asks for a 45-minute strategy call about
     * automation in general. Aura sells on something more specific: they read a
     * week of your actual calls and tell you what was in them, before you
     * commit to anything. That offer is the reason the page converts, so it
     * replaces the generic band copy rather than sitting above it.
     */
    offer: {
      title: 'A read of your own calls, before you decide anything',
      subtitle:
        'Tell us how your team sells today. We’ll come back with what Aura would have pulled out of a week of your calls.',
    },
  },

  /*
   * ── Analytics Agents ──────────────────────────────────────────────────────
   *
   * Sourced from "Analytics Agent — Development Specification" v1.3 (April
   * 2026), the internal engineering document at the repo root. Everything
   * below traces to a section of it, marked per field.
   *
   * Three things in that document are deliberately NOT on this page:
   *
   *   P&G and Reckitt. The spec names them as the kind of architecture it
   *   designs backwards from — "200–800 brand websites across 40+ countries".
   *   They are not clients. Naming them on a public product page would read as
   *   a customer list, which is the single most damaging thing this page could
   *   get wrong, so the scale is described and the logos are not.
   *
   *   The team, the timeline and the phasing. Who builds it, in what order,
   *   for how long, and what it costs to run are internal planning. A buyer
   *   needs the availability, which `limits` states plainly; they do not need
   *   the month-by-month plan.
   *
   *   The module numbers. A1–A6, B1–B6, C1–C2 and the eight core services are
   *   how the build is organised, not how the product is bought. What each
   *   module does is here; its label is not.
   *
   * No `heroShot`. There is no screenshot to take — the product is mid-build,
   * and a mocked-up dashboard for something not yet running would be the one
   * image on this page that is not evidence of anything.
   *
   * No `landingUrl` either, so the hero keeps the "See our work" link rather
   * than a "Get it now" button pointing at a signup that does not exist.
   */
  'analytics-agents': {
    // (spec §12, North star) — "an autonomous analytics governance layer that
    // any enterprise can plug in and trust."
    tagline: 'An autonomous analytics governance layer',
    // (spec §05 and §06) — Mode A takes a site from "domain registered" to
    // "fully measured and compliant"; Mode B "runs forever".
    //
    // The old copy here was drafted blind, and described a different product:
    // agents that "connect to the CRM, the spreadsheets, the warehouse" and
    // raise business insights. What is actually being built governs analytics
    // implementations — GTM, GA4, consent — and the reporting agents sit on
    // top of that rather than being the point.
    summary:
      'Analytics Agents takes a website from registered domain to a complete, compliant measurement setup - then keeps it correct forever. It plans the tracking, builds the GTM changes, proves every event fires, and watches for the day one stops.',
    // (spec §02 principles P3/P4, and §08 the onboarding journey)
    assurances: [
      'Runs on the stack you already have',
      'Nothing fires without approval',
      'Every action audited',
    ],
    features: [
      {
        // (spec §05, Mode A: crawl → plan → build → validate → privacy →
        // sign-off; §11 targets under four hours per site)
        title: 'Onboards a site in hours',
        desc: 'Crawl and classify the pages, generate the measurement plan, build the GTM tags and triggers in their own workspace, then drive a real browser to prove each event fires before any of it goes live.',
        icon: 'search',
      },
      {
        // (spec §06, Mode B: health monitor, anomaly detection, drift detector)
        title: 'Then watches it forever',
        desc: 'Continuous validation, statistical anomaly detection on volumes and conversion rates, and a re-crawl that catches the landing pages marketing shipped without telling the analytics team.',
        icon: 'eye',
      },
      {
        // (spec §04, Core 2 Connector Framework — the launch connector list)
        title: 'Plugs into the stack you run',
        desc: 'Google Tag Manager, GA4, BigQuery, OneTrust, ServiceNow and Slack, through one connector layer that holds the credentials, the retries and the rate limits.',
        icon: 'database',
      },
    ],

    // (spec §06 and §07) — the four things the continuous loop and the
    // always-on agents produce. Written as what a buyer receives rather than
    // as the modules that produce it.
    outcomes: {
      title: 'What you get',
      subtitle: 'The work an analytics team never has time to do.',
      items: [
        {
          // (spec §06 B2, and §11: under 30 minutes for P1)
          title: 'Anomalies inside thirty minutes',
          desc: 'Event drops, conversion gaps and parameter drift, segmented by region, device and browser - with the known causes suppressed, so a campaign launch and Black Friday do not read as failures.',
        },
        {
          // (spec §06 B4, Root Cause Analyzer)
          title: 'A cause, with the evidence',
          desc: 'Each issue is correlated against tag version history, site deployments and consent-config changes, and comes back with ranked causes and confidence scores - including “we do not know” when that is the honest answer.',
        },
        {
          // (spec §06 B5/B6, Remediation and Ticketing)
          title: 'Fixes that route themselves',
          desc: 'What can be fixed in the tag manager is prepared as a reviewable change and verified after it publishes. What needs a developer becomes a ticket that already carries the diagnosis and the steps to reproduce it.',
        },
        {
          // (spec §07 C1/C2, the reporting and insight agents)
          title: 'Reports without an analyst ticket',
          desc: 'Ask in plain language and get the chart, the narrative and the lineage behind it - with an indicator on every metric saying whether it is currently clean or affected by an open issue.',
        },
      ],
    },

    /*
     * (spec §02 design implications, §04 Core 6, §07 C2 considerations)
     *
     * This section is doing more work here than on the other two products.
     * Aura and NUSI are running software a buyer can be shown; this is not
     * yet, so what there is to evaluate is how it is being built. The three
     * items are the guarantees the architecture is organised around, and the
     * `limits` say where the thing actually is.
     */
    trust: {
      title: 'How it stays trustworthy',
      subtitle: 'Governance is the product, not a setting inside it.',
      // Overrides DetailGrid's default heading. These are not things the
      // product refuses to do; they are where it currently stands.
      limitsHeading: 'Where it is today',
      items: [
        {
          title: 'Nothing fires blind in production',
          desc: 'Every change is a versioned, reviewable artifact. Tag edits are built in a separate workspace, published only once approved, and rolled back in one step.',
          icon: 'shield',
        },
        {
          title: 'Isolation is structural',
          desc: 'Every record carries its client, brand and region, and tenants are separated at the data layer rather than by a filter somebody remembered to add to a query.',
          icon: 'lock',
        },
        {
          title: 'Numbers trace back to a query',
          desc: 'The insight agent quotes nothing it cannot trace to a query against the warehouse, shows its confidence, and is built to answer “I do not know” rather than fill the gap.',
          icon: 'bot',
        },
      ],
      limits: [
        'Analytics Agents is in build, not on sale. The platform core and the site-onboarding work come first, with pilot clients from late 2026 - so the conversation to have now is a design-partner one, not a signup.',
        'SOC 2 and the GDPR data-processing agreement are in progress rather than complete. If your procurement needs either signed before a pilot can start, raise it early and we will give you the real timeline instead of a hopeful one.',
      ],
    },

    // (spec §01) — the reference architecture it is designed against:
    // hundreds of brand sites, dozens of regions, one governed measurement
    // plan. The offer is the honest version of a demo for a product that is
    // still being built: a scoping conversation, not a trial.
    offer: {
      title: 'Bring us your messiest measurement setup',
      subtitle:
        'Tell us how many sites, how many regions and which stack they run on. We will tell you what governing them would actually involve.',
    },
  },

  nusi: {
    // (nusi.in) — its hero eyebrow reads "AI Wellness OS · for wellness
    // practices"; the <title> is "A wellness OS for modern healthcare
    // businesses". This is the two of them at eyebrow length.
    tagline: 'A wellness OS for modern practices',
    // (nusi.in hero + "The NUSI deal")
    //
    // The second sentence is the product's actual position and is not
    // decoration: NUSI charges the practice and nobody else, which is the
    // thing every competitor comparison turns on. The old copy here — lifted
    // from products_home.md — described "doctor management and daily
    // operations through intelligent automation" and never mentioned it.
    summary:
      'NUSI runs a nutrition practice from one workspace: clients, programs, AI meal plans, voice coaching, plate-vision analysis, appointments and billing. You subscribe to the platform; your clients use it free.',
    // (nusi.in — the three lines under its hero CTAs)
    assurances: ['14-day free trial', 'No card required', 'DPDP-ready'],
    // Aura's landing page is aura.sirahagents.com; this is NUSI's. Drives the
    // "Get it now" button in the hero — see app/(site)/products/[slug]/page.js.
    landingUrl: 'https://nusi.in/',
    /*
     * The only image on this page, and the only real screenshot on any of
     * them: a live workspace rather than a mockup. Its own dimensions decide
     * the frame's shape — lib/productImages.js reads them off the PNG — so the
     * sidebar is not cropped away by the placeholder's 16/10 box.
     *
     * It shows a demo workspace with demo clients on it. Worth a look before
     * any future replacement is dropped in at this path: a screenshot of a
     * real practice would be somebody's actual client list.
     */
    heroShot: {
      src: '/products/nusi/01-practice-dashboard.png',
      caption: 'The practice dashboard',
    },
    features: [
      {
        // (nusi.in — "Everything in one place, finally." / "Your workspace,
        // your rules.")
        title: 'The whole practice, one workspace',
        desc: 'Clients, programs, assessments, appointments, messaging and billing in one place, instead of four tools and a spreadsheet. Each workspace is an isolated tenant.',
        icon: 'users',
      },
      {
        // (nusi.in — "Calm intelligence, woven through every screen.")
        title: 'AI where the work already is',
        desc: 'Voice journaling, plate-vision macro tracking and weekly summaries, built into the screens you use rather than bolted on as a chatbot. Every suggestion passes a review queue before a client sees it.',
        icon: 'bot',
      },
      {
        /*
         * (nusi.in — "The NUSI deal" and its pricing section)
         *
         * The figure is the Starter plan's monthly price as published on
         * nusi.in. It is the one number on this page that goes stale on
         * somebody else's schedule, so it is deliberately the only one: the
         * per-plan detail stays on their pricing section, which the trust
         * links below point at.
         */
        title: 'One subscription, clients never pay',
        desc: 'Every client gets your branded app, chat, plans and reminders at no cost to them, and there are no per-client fees. Plans start at ₹3,999 a month, each with a 14-day trial.',
        icon: 'smartphone',
      },
    ],

    // (nusi.in — the feature grid) Four of the eight it lists. The four left
    // out — voice logging, plate vision, the branded client app and the shared
    // workspace — are all said above, in the features. These four are the ones
    // that are not: the jobs that were being done by hand before.
    outcomes: {
      title: 'What you get',
      subtitle: 'The parts of a practice that stop being done by hand.',
      items: [
        {
          title: 'Programs that practically design themselves',
          desc: 'AI-assisted templates for weight loss, PCOD, diabetes, sports nutrition and twenty more specializations. Edit anything, ship in minutes.',
        },
        {
          title: 'Booking, reminders and video, sorted',
          desc: 'Clients book from your calendar and get automatic reminders that cut no-shows. Every session opens a built-in video room - no links to juggle.',
        },
        {
          title: 'Analytics that read like a story',
          desc: 'Compliance, momentum and retention surfaced as patterns rather than pivot tables. Know who needs a check-in before they ghost.',
        },
        {
          title: 'Billing the way India bills',
          desc: 'Razorpay subscriptions, automatic GST invoices, and failed-payment recovery on day 3, 7 and 14.',
        },
      ],
    },

    /*
     * (nusi.in — "Built to be trusted with health data." and its FAQ)
     *
     * No `quotes` key: nusi.in carries no testimonials, and the named person
     * on its hero is a mock client card inside a product illustration, not a
     * customer. Aura has two because Aura's site has two. Inventing one here
     * to match the shape of that page would be the worst thing on this page.
     *
     * The two `limits` are the site's own words rather than a hedge invented
     * for balance: the setup fee is stated under its pricing, and "assistive"
     * is how its FAQ answers "How accurate is the AI?". Both are things a
     * buyer would otherwise meet after signing.
     */
    trust: {
      title: 'What that means for your data',
      subtitle: 'Health records, so the specifics matter.',
      items: [
        {
          title: 'Every workspace is its own tenant',
          desc: 'Your clients, programs and notes never mix with another practice’s data, and access is enforced server-side by role - owners, nutritionists and staff each see exactly what their role allows.',
          icon: 'shield',
        },
        {
          title: 'You control the AI',
          desc: 'Suggestions pass through a review queue. Nothing reaches a client without your sign-off.',
          icon: 'bot',
        },
        {
          title: 'Your data stays exportable',
          desc: 'Built with India’s DPDP expectations in mind. You own your records and can export them - and workspaces are verified by the NUSI team, so the practitioners on it are who they say they are.',
          icon: 'lock',
        },
      ],
      limits: [
        'A one-time setup fee applies per plan, covering account setup, branding, data import and training. GST invoicing is included; more AI, storage or client slots are add-ons.',
        'Plate Vision and the AI summaries are assistive rather than diagnostic - a fast first estimate, with a review queue so nothing reaches a client without your sign-off.',
      ],
      links: [
        { label: 'Pricing', href: 'https://nusi.in/#pricing' },
        { label: 'Security and trust', href: 'https://nusi.in/#security' },
        { label: 'Questions, answered', href: 'https://nusi.in/#faq' },
      ],
    },

    // (nusi.in — its closing band, "Pay for the platform. Run your whole
    // practice - freely.")
    offer: {
      title: 'Start free for 14 days',
      subtitle:
        'Bring your clients, programs and AI into one platform they never pay for. No card required.',
    },
  },

  /*
   * ── TNPSC Mentors ─────────────────────────────────────────────────────────
   *
   * Sourced from tnpscmentors.in. Like nusi.in it is a Vite SPA whose copy
   * lives in a lazily-loaded chunk rather than in the served HTML, so the
   * strings below come from its LandingPage bundle.
   *
   * A note on voice. That site is written in Tanglish — "Download பண்ணுங்க",
   * "30 second-ல install பண்ணலாம்" — because that is how its readers speak,
   * and every line has an English pair beside it. This page uses the English
   * halves. Reproducing the code-switching here would be dressing up as an
   * audience this site does not have; describing it, which the second feature
   * does, is the honest version.
   */
  'tnpsc-mentors': {
    // (tnpscmentors.in) — "TNPSC Exam prelims preparation - in Tamil and
    // English", at eyebrow length.
    tagline: 'Prelims prep, fully bilingual',
    // (tnpscmentors.in hero, plus its "PAM Method" section)
    summary:
      'TNPSC Mentors drills the last five years of previous-year papers, then aptitude, then full-length mocks — every question server-graded and explained on screen, in Tamil and English. Free to start, and ₹1,699 unlocks the whole prelims kit.',
    // (tnpscmentors.in — the three lines under its hero CTAs)
    assurances: [
      'No payment to download',
      'Works on any Android phone',
      'Fully bilingual',
    ],
    landingUrl: 'https://tnpscmentors.in/',
    /*
     * The signed-in dashboard rather than the marketing page: Kural of the day,
     * the current-affairs strip, the credit balance in the header and the
     * starter challenge below it. It shows the thing a student actually opens,
     * which is what the other product frames on this site do too.
     */
    heroShot: {
      src: '/products/tnpsc-mentors/01-dashboard.png',
      caption: 'The aspirant dashboard',
    },
    features: [
      {
        // (tnpscmentors.in — "The PAM Method: Previous year question paper →
        // Aptitude → Mocks")
        title: 'Past papers first, mocks last',
        desc: 'The PAM method: drill the last five years until the pattern is obvious, master the most scoreable marks in aptitude, then sit full-length mocks under exam conditions.',
        icon: 'trending-up',
      },
      {
        // (tnpscmentors.in — "Fully bilingual - Tamil and English, switch
        // anytime" and "server-graded · explained every question")
        title: 'Bilingual, not translated',
        desc: 'Tamil and English throughout, switchable at any time, with an explanation on screen after every server-graded question rather than an answer key at the end.',
        icon: 'languages',
      },
      {
        // (tnpscmentors.in — "Study on any device" and its install steps)
        title: 'On the phone they already have',
        desc: 'The Android app installs in about thirty seconds, or it opens in any browser. One account, and progress follows the student across phone, tablet and laptop.',
        icon: 'smartphone',
      },
    ],

    // (tnpscmentors.in — its feature grid and the Prelims Kit contents)
    outcomes: {
      title: 'What you get',
      subtitle: 'For a paper where two marks cost another year.',
      items: [
        {
          title: 'Previous-year questions, explained',
          desc: 'Group 1, 2 and 4 papers going back years, each question carrying a detailed bilingual explanation instead of a bare answer.',
        },
        {
          title: 'A current affairs test every day',
          desc: 'Refreshed daily and covering August 2025 onward — the one section that goes stale fastest, kept current so nobody has to.',
        },
        {
          title: 'The Vettri Nichayam marathon',
          desc: 'Thirteen papers, ten sectional and three full-length, with a downloadable schedule and a 45-day revision plan to run them against.',
        },
        {
          title: 'A trend report, not a syllabus',
          desc: 'Which topics actually keep reappearing, read out of the papers themselves — plus 3,000-odd subject-wise questions and aptitude short notes.',
        },
      ],
    },

    /*
     * (tnpscmentors.in — its pricing section, FAQ, and the consent gate in its
     * index.html)
     *
     * No `quotes`: the site carries none. The two `limits` are its own
     * disclosures, both stated on its own pages — it explains the Play Protect
     * warning at length rather than hiding it, and it prints the TNPSC
     * disclaimer in its footer.
     */
    trust: {
      title: 'What it costs, and what it does not do',
      subtitle: 'Stated the way the app states it.',
      limitsHeading: 'Worth knowing before you install',
      items: [
        {
          title: 'The free tier is usable on its own',
          desc: 'Fifty credits on signup and ten more each day, one credit per question, plus a full 200-question mock. Payment happens inside the app, only on an upgrade.',
          icon: 'users',
        },
        {
          title: 'One payment, not a subscription',
          desc: 'The Premium Prelims Kit is a ₹1,699 one-time unlock — set against a coaching centre’s ₹15,000 — with a ₹499 monthly option for anyone who would rather not commit.',
          icon: 'trending-up',
        },
        {
          title: 'Nothing tracks anyone before they agree',
          desc: 'Analytics and advertising tags load only after a visitor accepts, and are absent from the installed apps entirely, so the privacy declaration those apps ship with stays true.',
          icon: 'lock',
        },
      ],
      limits: [
        'The Android app is not on the Play Store yet — verification is in progress, so installing it shows the standard sideload warning, which the site explains rather than hides. iPhone and iPad use the web app; a native iOS build is not out.',
        'TNPSC Mentors is not affiliated with the Tamil Nadu Public Service Commission, and says so in its own footer.',
      ],
      links: [
        { label: 'Privacy policy', href: 'https://tnpscmentors.in/privacy' },
        { label: 'Payment policy', href: 'https://tnpscmentors.in/payment-policy' },
        { label: 'Refunds and cancellation', href: 'https://tnpscmentors.in/refund-policy' },
      ],
    },

    /*
     * The closing band's button is the site's standard consultation CTA, so
     * this copy has to be worth clicking it for. "Download the app" would not
     * be — that is what the hero's own button is for.
     *
     * What a visitor to *this* site is actually evaluating is whether the
     * machine under an exam-prep app transfers to their field, which it does:
     * bilingual content, credits, server-graded tests and an offline-capable
     * app are not TNPSC-specific.
     */
    offer: {
      title: 'The engine under it is not exam-specific',
      subtitle:
        'Bilingual content, a credit system, server-graded tests and an app that works offline — tell us what your learners need and we will map it onto the same machine.',
    },
  },

  /*
   * ── LexDraft ──────────────────────────────────────────────────────────────
   *
   * Sourced from the "LexDraft — Product Specification & Summary" artifact,
   * dated 19 Aug 2026. That document is marked Confidential and its own footer
   * says to verify pricing before external distribution, so three kinds of
   * thing in it are deliberately NOT on this page:
   *
   *   The rupee figures. The spec prices Solo, Practice and Firm to the rupee
   *   and then tells the reader to check those numbers against live pricing
   *   before anything external. A public page is as external as it gets, so
   *   the plan *shape* is described — per seat, never per matter or per
   *   generation, annual discount, trial without a card — and the numbers are
   *   left to the sales conversation the CTA opens. Add them here once someone
   *   has confirmed them against the live plans.
   *
   *   The quotas. AI drafts per month, title reports per cycle, portal user
   *   caps and seat ceilings are all configuration that moves.
   *
   *   The control plane. SuperAdmin, tenant impersonation and the platform
   *   audit views are how the product is operated, not what a firm buys.
   *
   * `landingUrl` is absent: LexDraft has no public site yet, only this spec.
   * The hero therefore keeps "See our work" rather than a "Get it now" button
   * pointing nowhere.
   */
  lexdraft: {
    // (spec masthead) — "Practice management, built for Indian advocates."
    tagline: 'Built for Indian advocates',
    // (spec lede, condensed) — the tagline under its headline is the sentence
    // that matters most here: "Not adapted for them — designed around the way
    // Indian practice actually works."
    summary:
      'LexDraft puts cases, drafting, billing and research under one document-first interface, with Indian-format templates and citations drawn from central and state statutes — built for the BNS, BNSS and BSA era, for eCourts, and for the DPDP Act.',
    // (spec — "14-day free trial with no card", the per-seat model, and the
    // data-residency chip)
    assurances: [
      '14-day trial, no card',
      'Priced per seat, never per matter',
      'Indian data residency',
    ],
    /*
     * The Solo dashboard: the plan chip in the sidebar, the AI-document
     * allowance counting down at the foot of it, and the four-step start
     * checklist. It shows the plan-aware home the spec describes rather than a
     * marketing render.
     */
    heroShot: {
      src: '/products/lexdraft/01-dashboard.png',
      caption: 'The practice dashboard',
    },
    features: [
      {
        // (spec — AI drafting, and the Sanhita translator)
        title: 'Drafting that knows the statute',
        desc: 'A brief becomes a court-ready pleading in Indian format with the right citations behind it — and the Sanhita translator maps IPC to BNS, CrPC to BNSS and Evidence to BSA with notes on what changed.',
        icon: 'search',
      },
      {
        // (spec — Cases/Matters, Limitation, eCourts)
        title: 'The matter, on one timeline',
        desc: 'CNR-linked matters carry their hearing diary, parties and documents together, with case status synced from eCourts and a limitation tracker that warns at 90, 30, 7 and 1 days.',
        icon: 'calendar',
      },
      {
        // (spec — Matter Intelligence, Legal Research; and the deterministic
        // fallback, which is the line worth keeping)
        title: 'Answers cited to their source',
        desc: 'Ask across the case file and get the document and page behind each answer; ask across statutes and get the section. A deterministic fallback keeps the product usable with no AI key configured at all.',
        icon: 'bot',
      },
    ],

    // (spec — the six feature modules, reduced to what a practice would name
    // as the reason to switch)
    outcomes: {
      title: 'What you get',
      subtitle: 'The parts of a practice that usually live in four tools.',
      items: [
        {
          title: 'A client portal, not an email thread',
          desc: 'Matters, hearings, shared documents and invoices with checkout, plus two-way messaging that lands in a firm-side inbox sorted by matter.',
        },
        {
          title: 'Billing the way chambers bill',
          desc: 'Retainer reconciliation, NEFT and UPI receipts, disbursement tracking, and a GST or Tally-style export at the end of it.',
        },
        {
          title: 'Contract and title work, reviewed',
          desc: 'Clause-level risk scoring with redlines against a preferred-positions library — and title reports that trace a 30-year chain, flag encumbrances and write a marketability opinion.',
        },
        {
          title: 'The chamber, measured',
          desc: 'Revenue and practice mix, workload fairness, hearing-clash swaps, conflict scans across the chamber, and flags when open matters build up on one person.',
        },
      ],
    },

    /*
     * (spec — the Compliance & security section)
     *
     * No `quotes`: the spec carries no customer references. The `limits` are
     * the two things a buyer would otherwise discover during procurement —
     * the spec is explicit that one tier is sales-led, and its own footer
     * separates shipped modules from roadmap ones.
     */
    trust: {
      title: 'Built for the Indian regulatory context',
      subtitle: 'Data residency, the DPDP Act, and a trail a firm can stand behind.',
      // Neither caveat below is a thing the product refuses to do — one is how
      // it is sold, the other is what has not shipped — so the default heading
      // would misdescribe both.
      limitsHeading: 'How it is sold, and what is still coming',
      items: [
        {
          title: 'Firm-scoped by construction',
          desc: 'Every query is scoped to the firm, and a client-portal token cannot reach a firm-side route. Roles decide what each person can do inside the surface their plan gives them.',
          icon: 'lock',
        },
        {
          title: 'DPDP, handled as features',
          desc: 'One-click data export, right to erasure with a retention window, and an append-only consent ledger — rather than a policy page describing them.',
          icon: 'shield',
        },
        {
          title: 'An audit trail with a retention clock',
          desc: 'Every state-changing action logged and kept seven years by default, tamper-evident on the admin plane, with two-factor at firm-admin activation.',
          icon: 'eye',
        },
      ],
      limits: [
        'Pricing is per seat with volume discounts — never per matter, per filing or per AI generation — and annual billing takes twenty percent off. Solo and Practice are self-serve; the Firm tier is sales-led, with an MSA, a DPA and a DPIA rather than a signup button.',
        'A handful of capabilities are roadmap rather than shipped: voice-to-draft, the citation verifier, the precedent finder and trust-account reconciliation. Everything described above has a live screen today.',
      ],
    },

    offer: {
      title: 'See it against your own matters',
      subtitle:
        'Bring a real pleading and a real case file. We will show you the draft it produces and where every citation in it came from.',
    },
  },
};

/*
 * ── on the CMS ─────────────────────────────────────────────────────────────
 * `assurances`, `landingUrl`, `outcomes`, `quotes`, `trust` and `offer` have no
 * field behind them in sirah-cms/src/collections/Products.ts, whose "Product
 * page" tab is heroImage + features[] + blocks. All three products carry most
 * of them now, so this is no longer a one-product exception to wave through:
 * whoever wires this file to Payload has two options and should pick
 * deliberately rather than discover the gap — add matching field groups to
 * that tab, or express these as `pageSections` blocks. Until then these
 * strings live here and nowhere else.
 */

/*
 * A detail entry keyed to a product that does not exist is a typo that would
 * otherwise render as a page with a hero and nothing under it. Fail the build
 * instead — the same guard data/industryIntelligence.js uses.
 */
const SLUGS = new Set(HOME_PRODUCTS.map((p) => p.slug));
const orphans = Object.keys(PRODUCT_DETAILS).filter((slug) => !SLUGS.has(slug));
if (orphans.length) {
  throw new Error(
    `[productDetails] no product in HOME_PRODUCTS matches: ${orphans.join(', ')}`
  );
}
