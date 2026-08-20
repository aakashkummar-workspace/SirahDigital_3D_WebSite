import { PageHeader } from '@/components/sections/SectionHeader';
import { COMPANY } from '@/data/company';

export const metadata = {
  title: 'Terms of Service',
  description: 'The terms under which Sirah Digital provides this website and its services.',
  alternates: { canonical: '/terms' },
};

// Placeholder wording. TODO: have this reviewed before launch.
const SECTIONS = [
  {
    heading: 'Using this site',
    body: 'This website and its contents are provided for general information about our services. We may update or withdraw any part of it without notice.',
  },
  {
    heading: 'Enquiries and consultations',
    body: 'Submitting the consultation form does not create a contract between us. Any engagement begins only once a separate written agreement setting out scope, timeline and fees has been signed by both parties.',
  },
  {
    heading: 'Intellectual property',
    body: 'The Sirah Digital name, logo, site design and written content are our property. Deliverables produced under a signed engagement are governed by that agreement, not by this page.',
  },
  {
    heading: 'No warranty',
    body: 'Information on this site is provided as-is. Descriptions of past projects are illustrative; results depend on the specifics of each operation and are not a guarantee of comparable outcomes.',
  },
  {
    heading: 'Limitation of liability',
    body: 'To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of this website.',
  },
  {
    heading: 'Governing law',
    body: 'These terms are governed by the laws of India, and the courts of Chennai, Tamil Nadu have exclusive jurisdiction over any dispute.',
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Service" />

      <section className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-sm text-gray-500">
          Last updated {new Date().getFullYear()}. Questions?{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-brand-blue transition-colors hover:text-ink">{COMPANY.email}</a>
        </p>

        <div className="mt-12 space-y-10">
          {SECTIONS.map((s) => (
            <div key={s.heading}>
              <h2 className="text-xl font-bold text-ink">{s.heading}</h2>
              <p className="mt-3 leading-relaxed text-brand-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
