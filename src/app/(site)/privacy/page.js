import { PageHeader } from '@/components/sections/SectionHeader';
import { COMPANY } from '@/data/company';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Sirah Digital collects, uses and protects the information you share with us.',
  alternates: { canonical: '/privacy' },
};

// Placeholder wording covering what the site actually does today: one lead
// form, submissions relayed over WhatsApp and an optional webhook, plus
// Microsoft Clarity for usage analytics and session replay.
// TODO: have this reviewed before launch.
//
// The analytics section is not decoration. This page used to state that the
// site carried no third-party analytics trackers, which stopped being true the
// moment the Clarity tag went into the root layout — a privacy policy that
// contradicts the page serving it is worse than one that says nothing, so the
// two have to move together. If Clarity is ever removed, this section goes
// with it.
const SECTIONS = [
  {
    heading: 'What we collect',
    body: 'When you submit the consultation form we collect the name, email address, phone number, company name and message you provide. Separately, and whether or not you ever fill in the form, we collect anonymous information about how this site is used — described under "Analytics and cookies" below.',
  },
  {
    heading: 'Analytics and cookies',
    body: 'We use Microsoft Clarity to understand how this site is actually used. It records which pages are viewed and how they are interacted with — clicks, scrolling and mouse movement — and lets us replay those sessions so we can see what is slow, confusing or broken. Text typed into form fields is masked, so a replay does not carry your name, email address, phone number or message. Clarity sets its own cookies to recognise a session, and the information it gathers is processed by Microsoft on our behalf. We use no advertising cookies and carry no ad-network trackers.',
  },
  {
    heading: 'How we use it',
    body: 'Your submission is used solely to respond to your enquiry and to arrange the consultation you requested. We send a confirmation to the WhatsApp number you provide and notify our team so someone can follow up.',
  },
  {
    heading: 'Who we share it with',
    body: 'Submissions are relayed through our WhatsApp messaging gateway and, where configured, our internal CRM. Information about how the site is used is processed by Microsoft, as described above. We do not sell your information or share it with advertisers.',
  },
  {
    heading: 'How long we keep it',
    body: 'Enquiry records are retained for as long as needed to serve you as a client, and for our own legal and accounting obligations afterwards. You can ask us to delete your record at any time. Analytics recordings are held by Microsoft under their own retention schedule and expire without any action from us.',
  },
  {
    heading: 'Your rights',
    body: 'You may request a copy of the information we hold about you, ask us to correct it, or ask us to delete it. Write to us and we will act on the request.',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-gray-500">
          Last updated {new Date().getFullYear()}. Questions about this policy?{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-brand-blue transition-colors hover:text-white">{COMPANY.email}</a>
        </p>

        <div className="mt-12 space-y-10">
          {SECTIONS.map((s) => (
            <div key={s.heading}>
              <h2 className="text-xl font-bold text-white">{s.heading}</h2>
              <p className="mt-3 leading-relaxed text-brand-muted">{s.body}</p>
            </div>
          ))}

          <div>
            <h2 className="text-xl font-bold text-white">Contact</h2>
            <address className="mt-3 not-italic leading-relaxed text-brand-muted">
              {COMPANY.name}
              <br />
              {COMPANY.addressOneLine}
              <br />
              <a href={`mailto:${COMPANY.email}`} className="text-brand-blue transition-colors hover:text-white">{COMPANY.email}</a>
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
