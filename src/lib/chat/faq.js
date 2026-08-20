/**
 * The questions the site is asked but does not have a page for.
 *
 * ── why this file exists at all ──────────────────────────────────────────
 * knowledge.js is built on the rule that nothing about the business is
 * authored twice: the index is derived from the same data the pages render, so
 * a copy change reaches the bot without anyone remembering it. That rule is
 * right, and it is also why the bot used to refuse "how long does a project
 * take?", "do you sign an NDA?" and "are you hiring?" — those answers are not
 * on any page, so there was nothing to derive them from, and a retrieval bot
 * with nothing to retrieve says "that is outside what I can help with". Which
 * is honest, and useless, and it happened to visitors with money.
 *
 * So this is the deliberate exception, and it is kept honest three ways.
 *
 *   1. **Every factual claim carries its source in a comment.** If the comment
 *      cannot name a file or a page, the answer does not state the fact.
 *   2. **What is not published is not invented.** Several entries below do not
 *      answer the question at all — they say plainly that the site does not
 *      publish it and offer the free consultation, which is a true sentence
 *      and a useful one. Writing "we always sign an NDA" here would be putting
 *      a commercial promise on the company's behalf, from a chat widget, with
 *      nobody's sign-off. That is not a gap worth filling with a guess.
 *   3. **Facts that live in data are read, not copied.** The address, phone,
 *      counts and stats interpolate from src/data, so they cannot go stale
 *      here while staying correct in the footer.
 *
 * ── adding an entry ──────────────────────────────────────────────────────
 * Tests are matched against the lowercased question and the first match wins,
 * so specific goes above general. Keep them tight: an entry here outranks the
 * content intents, so a loose pattern silently takes questions that the site's
 * own copy would have answered better. Every entry needs a fixture in
 * scripts/chat-check.mjs.
 */

import { COMPANY, COMPANY_STATS } from '@/data/company';
import { SERVICES } from '@/data/services';
import { INDUSTRIES } from '@/data/industries';

/* ------------------------------------------------------------------ */
/* Facts, read from data rather than restated                          */
/* ------------------------------------------------------------------ */

/**
 * The consultation, as the booking flow actually implements it.
 *
 * Source: src/app/(site)/book/page.js and components/booking/BookingIntake.jsx
 * — 45 minutes, free, a Google Meet link an hour before, a reminder the day
 * before. Confirmed against the live /api/slots, whose every row carries
 * `duration_minutes: 45`.
 */
export const CONSULT = {
  minutes: 45,
  // Verified from https://www.sirahdigital.in/api/slots: rows exist Monday to
  // Saturday, never Sunday, with local start times from 10:00 to 19:00 IST.
  // Restated rather than fetched, because a chat answer cannot wait on a
  // network call — and these are opening hours, not live availability. The
  // calendar on /book is what shows which of them are actually free.
  days: 'Monday to Saturday',
  hours: '10am to 8pm IST',
  lastSlot: '7pm',
};

/** A published figure, found by the label it carries in src/data/company.js. */
function stat(match) {
  const found = COMPANY_STATS.find((s) => match.test(s.label));
  return found ? found.value : null;
}

/**
 * The line every "we do not publish that" answer ends on.
 *
 * One sentence, and it does two things a flat refusal does not: it says why
 * there is no answer rather than implying the question was silly, and it names
 * a route to a person. The phone number comes first because somebody asking
 * about terms wants to talk, not to fill in a form.
 */
function askUs(lang) {
  return lang === 'ta'
    ? `இது இணையதளத்தில் வெளியிடப்படவில்லை - ஏனெனில் இது ஒவ்வொரு பணிக்கும் மாறுபடும். ${COMPANY.phone} என்ற எண்ணில் அழைக்கலாம், அல்லது ${CONSULT.minutes} நிமிட இலவச ஆலோசனையில் இதற்கு நேரடி பதில் கிடைக்கும்.`
    : `That is not something the site publishes, because the answer changes with the job. Call ${COMPANY.phone} and ask, or take the free ${CONSULT.minutes}-minute consultation — you will get a straight answer on it there.`;
}

/** Every FAQ answer offers the same two ways out. Booking first: it is the goal. */
function routes() {
  return [
    { label: 'Book a free consultation', href: '/book', primary: true },
    { label: 'Contact page', href: '/contact' },
  ];
}

/* ------------------------------------------------------------------ */
/* Entries                                                             */
/* ------------------------------------------------------------------ */

export const FAQ = [
  {
    id: 'hours',
    test: /\b(working hours|office hours|business hours|opening hours|office timing|timings?|when are you (open|available)|open on (sunday|saturday|weekend)|weekend)\b|\bwhat time\b[\s\S]*\b(open|close|start)\b/,
    respond: () => ({
      text: {
        en:
          `Consultations run ${CONSULT.days}, ${CONSULT.hours} — the last slot starts at ` +
          `${CONSULT.lastSlot}, and Sunday is closed. The calendar only lists times that are ` +
          `genuinely free, so anything you can pick is bookable.`,
        ta:
          'ஆலோசனைகள் திங்கள் முதல் சனி வரை, காலை 10 முதல் இரவு 8 மணி வரை (IST) — கடைசி நேரம் ' +
          'மாலை 7 மணிக்கு தொடங்கும். ஞாயிறு விடுமுறை. நாட்காட்டியில் காலியாக உள்ள நேரங்கள் மட்டுமே காட்டப்படும்.',
      },
      links: [{ label: 'See open times', href: '/book', primary: true }],
      followUps: ['How do I contact you?', 'What services do you provide?'],
    }),
  },

  {
    id: 'not-offered',
    /*
     * The services people assume a "digital" agency sells and this one does
     * not. Sourced by absence: src/data/services.js lists ten, and none of
     * them is SEO, paid ads, social media management, branding, content
     * writing or video production.
     *
     * Saying no costs one enquiry and saves a wasted call. Saying nothing —
     * which is what the out-of-scope refusal did — costs the visitor's belief
     * in everything else the bot said.
     */
    test: /\b(seo|search engine optim\w*|google ads|paid ads|ppc|adwords|social media (marketing|management|posting)|smm|content writing|copywriting|graphic design|logo design|branding|video editing|photograph\w*)\b/,
    respond: () => ({
      text: {
        en:
          'Not that one — it is not on our list. We build systems rather than run campaigns. ' +
          `The ${SERVICES.length} we do: AI agents and virtual employees, chatbots and voice ` +
          'assistants, workflow automation, custom web and mobile apps, CRM and ERP, SaaS ' +
          'builds, WhatsApp automation, document OCR, API integration and BI dashboards.',
        ta:
          'அது எங்கள் பட்டியலில் இல்லை. நாங்கள் பிரச்சாரங்களை நடத்துவதில்லை — அமைப்புகளை உருவாக்குகிறோம்: ' +
          `AI முகவர்கள், சாட்பாட், பணிப்பாய்வு தானியக்கம், வலை/மொபைல் செயலிகள், CRM/ERP, SaaS, ` +
          `WhatsApp தானியக்கம், ஆவண OCR, API ஒருங்கிணைப்பு, BI டாஷ்போர்டுகள் — மொத்தம் ${SERVICES.length}.`,
      },
      links: [{ label: 'See all services', href: '/services', primary: true }],
      followUps: ['What services do you provide?', 'Book a free call'],
    }),
  },

  {
    id: 'timeline',
    test: /\b(how long|how many (weeks|months|days)|time ?frame|timeline|turnaround|delivery time|lead time|how soon)\b|\bwhen (can|will) (you|it|we) (start|be (ready|done|delivered))\b/,
    respond: () => ({
      text: {
        en:
          'It depends entirely on what is being built — a single automated workflow and a full ' +
          'platform are not the same job, and we would rather scope yours than quote you ' +
          `somebody else's schedule. ${askUs('en')}`,
        ta: askUs('ta'),
      },
      links: routes(),
      followUps: ['What is your process?', 'How much does it cost?'],
    }),
  },

  {
    id: 'support',
    /*
     * "24/7 Support available" is a published claim — one of the four figures
     * in COMPANY_STATS, rendered in the stat band on the homepage. So it can
     * be quoted, and it is quoted rather than retyped. What a handover covers
     * contractually is not published anywhere, and is not stated here.
     */
    test: /\b(support|maintenance|maintain|amc|warranty|after (launch|delivery|handover)|post[- ]?launch|bug ?fix\w*|ongoing)\b/,
    respond: () => {
      const support = stat(/support/i);
      return {
        text: {
          en:
            (support
              ? `Support is ${support} — that is the commitment on our homepage. `
              : 'Support continues after handover. ') +
            'What it covers for a given build, and for how long, is agreed as part of the scope ' +
            'rather than sold off a shelf. Ask on the call and you get it in writing.',
          ta:
            (support ? `ஆதரவு ${support} — இதுவே எங்கள் முகப்புப் பக்கத்தில் உள்ள உறுதி. ` : '') +
            'ஒவ்வொரு பணிக்கும் அது என்ன உள்ளடக்கும் என்பது பணியின் அளவோடு சேர்ந்து முடிவு செய்யப்படும்.',
        },
        links: routes(),
        followUps: ['What is your process?', 'How do I contact you?'],
      };
    },
  },

  {
    id: 'legal-terms',
    test: /\b(nda|non[- ]?disclosure|confidential\w*|contract|agreement|sla|msa|ip rights|intellectual property|own the code|source code)\b/,
    respond: () => ({
      text: {
        en:
          'Contract terms — NDA, ownership, SLA — are settled directly with the team rather than ' +
          `stated by a chat widget, because they are commitments and they belong in writing. ${askUs('en')}`,
        ta: askUs('ta'),
      },
      links: routes(),
      followUps: ['How do I contact you?', 'What is your process?'],
    }),
  },

  {
    id: 'refund-payment',
    test: /\b(refund|money back|cancellation|payment terms|advance|instal?lment|invoice terms|milestone)\b|\bhow (do|can) i pay\b/,
    respond: () => ({
      text: {
        en: `Payment and cancellation terms are part of the proposal, not a published price list. ${askUs('en')}`,
        ta: askUs('ta'),
      },
      links: routes(),
      followUps: ['How much does it cost?', 'How do I contact you?'],
    }),
  },

  {
    id: 'trial',
    /*
     * The three assurances under the Aura hero — "Nothing to install", "No
     * obligation", "We'll tell you honestly if it isn't a fit" — are product
     * copy in src/data/productDetails.js. They say the conversation is free.
     * They do not say there is a free trial of anything, so neither does this.
     */
    // "can I try Aura" is a trial question that never says "trial", and it was
    // being answered with a description of Aura — which does not tell the
    // person whether they can have one.
    test: /\b(free trial|trial|demo account|pilot|proof of concept|poc|sandbox)\b|\b(can|could|may) (i|we) try\b|\btry (it|this|out|before)\b/,
    respond: () => ({
      text: {
        en:
          'There is no self-serve trial to sign up for. What is free is the conversation: a ' +
          `${CONSULT.minutes}-minute call where we look at your actual process, say what could be ` +
          'automated, and tell you honestly if it is not worth building. Product walkthroughs ' +
          'happen on that call.',
        ta:
          `தானாகப் பதிவு செய்யும் இலவச சோதனை இல்லை. இலவசம் என்பது உரையாடல்: ${CONSULT.minutes} நிமிட ` +
          'அழைப்பில் உங்கள் நடைமுறையைப் பார்த்து, எதைத் தானியக்கமாக்கலாம் என்று சொல்வோம் — ' +
          'கட்டமைக்கத் தேவையில்லை என்றால் அதையும் நேர்மையாகச் சொல்வோம்.',
      },
      links: [{ label: 'Book a free consultation', href: '/book', primary: true }],
      followUps: ['What are Sirah’s products?', 'How much does it cost?'],
    }),
  },

  {
    id: 'careers',
    test: /\b(hiring|job|jobs|vacanc\w*|career\w*|intern(s|ship|ships)?|recruit\w*|resume|my cv|work (for|with) you|join (you|the team))\b/,
    respond: () => ({
      text: {
        en:
          'There is no careers page on the site, so I cannot tell you what is open. Send your CV ' +
          `to ${COMPANY.email} and it reaches the team directly — that is the right route whether ` +
          'or not something is posted.',
        ta:
          'இணையதளத்தில் வேலைவாய்ப்பு பக்கம் இல்லை, எனவே என்ன காலியிடங்கள் உள்ளன என்று என்னால் சொல்ல முடியாது. ' +
          `உங்கள் CV-ஐ ${COMPANY.email} க்கு அனுப்புங்கள் — அது நேரடியாகக் குழுவைச் சென்றடையும்.`,
      },
      links: [{ label: 'Contact page', href: '/contact', primary: true }],
    }),
  },

  {
    id: 'data-privacy',
    /*
     * Sourced line by line from src/app/(site)/privacy/page.js and the consent
     * notice in src/data/consent.js — no advertising cookies or third-party
     * trackers, never sold or shared with advertisers, deletion on request by
     * email. The retention figure is the consent notice's own: 24 months.
     */
    test: /\b(privacy|gdpr|dpdp|my data|data (safe|secure|security|protection|stored)|cookies|tracking me|delete my|opt out|unsubscribe)\b/,
    respond: () => ({
      text: {
        en:
          'What you send through the form is used to answer your enquiry and arrange the call, ' +
          'nothing else. It is never sold or shared with advertisers, the site runs no advertising ' +
          'cookies or third-party trackers, and details are kept for 24 months. Email ' +
          `${COMPANY.email} to have your record deleted at any time.`,
        ta:
          'படிவத்தில் நீங்கள் அனுப்புவது உங்கள் விசாரணைக்குப் பதிலளிக்கவும், அழைப்பை ஏற்பாடு செய்யவும் மட்டுமே ' +
          'பயன்படுத்தப்படுகிறது. அது ஒருபோதும் விற்கப்படுவதில்லை. விவரங்கள் 24 மாதங்கள் வைக்கப்படும். ' +
          `நீக்க வேண்டுமெனில் ${COMPANY.email} க்கு எழுதுங்கள்.`,
      },
      links: [{ label: 'Privacy policy', href: '/privacy', primary: true }],
    }),
  },

  {
    id: 'reach',
    /*
     * Where the company is, is published — the address is in COMPANY and on the
     * contact page's map, and consultations run on Google Meet (book/page.js).
     * Whether it takes clients outside Chennai or outside India is published
     * nowhere, and is not claimed here.
     */
    test: /\b(remote\w*|onsite|on[- ]site|outside chennai|another (city|state|country)|international\w*|overseas|abroad|outside india|only in chennai)\b/,
    respond: () => ({
      text: {
        en:
          `The team is in Chennai — ${COMPANY.addressOneLine}. The work itself is built and handed ` +
          'over remotely and consultations run on Google Meet, so where you are is rarely the ' +
          'deciding factor. Ask on the call and we will tell you straight whether we are the right ' +
          'fit for your job.',
        ta:
          `குழு சென்னையில் உள்ளது — ${COMPANY.addressOneLine}. பணி தொலைவிலிருந்தே உருவாக்கப்பட்டு ` +
          'ஒப்படைக்கப்படுகிறது, ஆலோசனைகள் Google Meet-இல் நடக்கும். உங்கள் பணிக்கு நாங்கள் பொருத்தமா ' +
          'என்பதை அழைப்பில் நேரடியாகச் சொல்வோம்.',
      },
      links: routes(),
      followUps: ['Where are you located?', 'Book a free call'],
    }),
  },

  {
    id: 'experience',
    /*
     * All four figures come from COMPANY_STATS in src/data/company.js, which is
     * what the homepage stat band renders. Interpolated rather than typed out,
     * so the bot cannot contradict the band a visitor just scrolled past.
     */
    test: /\b(years? (of )?(experience|in business)|how old|since when|established|how many (clients|customers|projects|employees|people|staff|years))\b|\bhow long have you\b/,
    respond: () => {
      const figures = COMPANY_STATS.map((s) => `${s.value} ${s.label.toLowerCase()}`);
      return {
        text: {
          en: `The figures we publish: ${figures.join(', ')}. We deliver ${SERVICES.length} services across ${INDUSTRIES.length} sectors.`,
          ta: `நாங்கள் வெளியிடும் புள்ளிவிவரங்கள்: ${figures.join(', ')}. ${INDUSTRIES.length} துறைகளில் ${SERVICES.length} சேவைகள்.`,
        },
        links: [
          { label: 'See the work', href: '/products#client-systems', primary: true },
          { label: 'About us', href: '/about' },
        ],
        followUps: ['Who is the founder?', 'Which industries do you work with?'],
      };
    },
  },

  {
    id: 'why-us',
    /*
     * "why should I choose you" and "what makes you different" were both
     * refused as off-topic — a buying signal, turned away, by the widget whose
     * job is to catch buying signals.
     *
     * The answer is assembled entirely from figures and counts already on the
     * site: the stat band, the services list, the industries list, and the
     * number of systems actually in production. Nothing here is a claim about
     * being better than anyone; it is what we have done, and the reader can
     * decide. A superlative would be the easy sentence to write and the one
     * nobody could stand behind.
     */
    test: /\b(why (should|would) (i|we)|why you|why sirah|what makes you|how are you different|different from|better than|compare|competitors?|choose you|pick you|instead of)\b/,
    respond: () => {
      const years = stat(/experience/i);
      const clients = stat(/client/i);
      return {
        text: {
          en:
            'I would rather give you the facts than a pitch. ' +
            (years ? `${years} years in, ` : '') +
            (clients ? `${clients} clients, ` : '') +
            `${SERVICES.length} services across ${INDUSTRIES.length} sectors, and products we ` +
            'run ourselves rather than only build for others. The consultation is free and ends ' +
            'with an honest answer on whether the thing you want is worth building — including ' +
            'when it is not.',
          ta:
            'விளம்பரத்தை விட உண்மைகளைச் சொல்கிறேன். ' +
            (years ? `${years} ஆண்டுகள் அனுபவம், ` : '') +
            (clients ? `${clients} வாடிக்கையாளர்கள், ` : '') +
            `${INDUSTRIES.length} துறைகளில் ${SERVICES.length} சேவைகள். ஆலோசனை இலவசம் - நீங்கள் ` +
            'விரும்புவதை உருவாக்குவது சரியா என்பதை நேர்மையாகச் சொல்வோம்.',
        },
        links: [
          { label: 'See the work', href: '/products#client-systems', primary: true },
          { label: 'Book a free consultation', href: '/book' },
        ],
        followUps: ['What services do you provide?', 'Who are your clients?'],
      };
    },
  },

  {
    id: 'awards',
    /*
     * There is no awards data anywhere in src/data. The only trace is a photo
     * caption on the about-page carousel — "The team collecting an award" —
     * and a caption is not a citation: it names no award and no year. So this
     * says what is true, which is that the site does not list them.
     */
    test: /\b(award|awards|recognition|certified|certification|iso|accredit\w*|rating|rated)\b/,
    respond: () => ({
      text: {
        en:
          'The site does not list awards or certifications, so I would only be guessing — and ' +
          `I would rather not. What it does list is the work: ${SERVICES.length} services, ` +
          `${INDUSTRIES.length} sectors and the client systems we have shipped. Ask the team ` +
          'directly if credentials matter for your decision.',
        ta:
          'இணையதளத்தில் விருதுகள் அல்லது சான்றிதழ்கள் பட்டியலிடப்படவில்லை, எனவே ஊகிக்க விரும்பவில்லை. ' +
          `பட்டியலிடப்பட்டிருப்பது எங்கள் பணிதான்: ${INDUSTRIES.length} துறைகளில் ${SERVICES.length} சேவைகள்.`,
      },
      links: [
        { label: 'See the work', href: '/products#client-systems', primary: true },
        { label: 'Contact page', href: '/contact' },
      ],
    }),
  },

  {
    id: 'languages',
    /*
     * Tamil and English are the two languages this panel answers in, the two
     * Aura transcribes and the two TNPSC Mentors teaches in —
     * src/data/products.js. Nothing is claimed about any other language.
     */
    test: /\b(tamil|multi[- ]?lingual|regional language|what languages|which language|hindi|malayalam|telugu)\b/,
    respond: () => ({
      text: {
        en:
          'Tamil and English, both. This chat answers in either — the த button at the top switches ' +
          'it. The systems we build work the same way: Aura transcribes calls in Tamil and English, ' +
          'and the chatbots we ship handle whichever language your customers actually use.',
        ta:
          'தமிழ் மற்றும் ஆங்கிலம், இரண்டும். இந்த அரட்டை இரண்டிலும் பதிலளிக்கும் — மேலே உள்ள பொத்தானால் ' +
          'மாற்றலாம். நாங்கள் உருவாக்கும் அமைப்புகளும் அப்படியே: Aura அழைப்புகளைத் தமிழிலும் ஆங்கிலத்திலும் ' +
          'எழுதுகிறது.',
      },
      links: [{ label: 'See all services', href: '/services', primary: true }],
    }),
  },
];
