import { PageHeader } from '@/components/sections/SectionHeader';
import ContactDetails from '@/components/sections/ContactDetails';
import ContactForm from '@/components/sections/ContactForm';
import { COMPANY } from '@/data/company';

export const metadata = {
  title: 'Contact & Free Consultation',
  description:
    'Book a free 45-minute AI strategy consultation with Sirah Digital. Chennai-based AI automation engineers. Reach us by email, phone or WhatsApp.',
  alternates: { canonical: '/contact' },
};

// Everything on this page renders on the server except <ContactForm />, which
// is the one client leaf.
export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Tell us where the time goes."
        subtitle="Forty-five minutes with our AI experts, no charge — we map the highest-leverage automation in your operation and tell you honestly whether it is worth building."
      />

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
          <ContactDetails />
          <ContactForm />
        </div>
      </section>

      {/* Machine-readable company details for search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: COMPANY.name,
            url: COMPANY.url,
            email: COMPANY.email,
            telephone: COMPANY.phone,
            address: { '@type': 'PostalAddress', streetAddress: COMPANY.addressOneLine, addressCountry: 'IN' },
          }),
        }}
      />
    </>
  );
}
