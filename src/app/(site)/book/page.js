import TidyCalEmbed from '@/components/booking/TidyCalEmbed';
import { COMPANY } from '@/data/company';

/*
 * Book a consultation.
 *
 * The booking step of the flow:
 *
 *   Book Free Consultation -> TidyCal -> date/time -> confirmed
 *   -> TidyCal's existing Google Calendar sync -> Google Meet + confirmation
 *
 * Everything after "confirmed" is TidyCal's own pipeline, unchanged from the
 * current live site. This page does not receive, store or forward a booking —
 * there is no webhook, no polling and no API call. If lead capture into the
 * CMS is wanted later, that is a separate piece of work and it does not
 * require replacing any of this.
 *
 * Availability (Mon–Sat, 10:00–20:00 IST, Sunday closed) is configured in the
 * TidyCal dashboard, not here. It is deliberately not restated in code: two
 * copies of an opening-hours rule drift, and the calendar is the one a visitor
 * actually books against.
 *
 * This lives at /book rather than on /contact because /contact is being
 * reworked concurrently. Both routes are legitimate — /contact is for "I have
 * a question", /book is for "I want a time" — so this does not need to move
 * once that lands, though the embed can be dropped in there too with a single
 * <TidyCalEmbed /> if you want it in both places.
 */

export const metadata = {
  title: 'Book a Consultation',
  description:
    'Pick a time for a free 45-minute AI strategy consultation with the Sirah Digital team.',
  alternates: { canonical: '/book' },
};

export default function BookPage() {
  return (
    <section className="mx-auto max-w-[880px] px-6 py-20 md:py-28">
      <header className="max-w-[34ch]">
        <h1
          className="font-semibold leading-[1.05] tracking-tight text-white"
          style={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3rem)' }}
        >
          Book a free consultation.
        </h1>
        <p className="mt-5 max-w-[52ch] text-fluid-base leading-relaxed text-brand-muted">
          Pick a time that suits you. You will get a calendar invite with a Google Meet link straight
          after booking.
        </p>
      </header>

      <div className="mt-12">
        <TidyCalEmbed />
      </div>

      {/* A calendar is the wrong tool for some people — a direct line costs
          nothing to offer and stops that visitor bouncing. */}
      <p className="mt-10 text-fluid-sm text-brand-muted">
        Prefer to talk first? Email{' '}
        <a href={`mailto:${COMPANY.email}`} className="text-brand-cyan hover:underline">
          {COMPANY.email}
        </a>{' '}
        or call{' '}
        <a href={COMPANY.phoneHref} className="text-brand-cyan hover:underline">
          {COMPANY.phone}
        </a>
        .
      </p>
    </section>
  );
}
