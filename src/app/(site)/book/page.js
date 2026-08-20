import BookingIntake from '@/components/booking/BookingIntake';
import { COMPANY } from '@/data/company';

/*
 * Book a consultation.
 *
 * The flow, end to end:
 *
 *   Book Free Consultation -> one form: name, email, WhatsApp, and a time
 *   -> POST /api/book -> lead stored, then the slot claimed in the CMS
 *   -> the CMS creates the Google Calendar event and its Meet link, and writes
 *      a bookings row
 *   -> WhatsApp on booking, 24h before, and 1h before with the joining link
 *      + an email to support@sirahdigital.in
 *
 * Only the form is on this page. Everything from "claimed" onwards runs in the
 * CMS (sirah-cms/src/endpoints/slots.ts, then lib/bookingSync.ts and
 * bookingNotify.ts), because that is where the database, the job schedule and
 * the editable message templates all are.
 *
 * ── This used to go through TidyCal ──────────────────────────────────────
 * It no longer does, and three things went with it. The intake form is no longer
 * a *gate* — it asked for a phone number ahead of the calendar only because
 * TidyCal's free plan could not ask for one itself, and that whole two-step flow
 * existed to work around a plan limit. Availability is no longer configured in
 * somebody else's dashboard. And a booking is no longer discovered by polling a
 * calendar and guessing which events were bookings.
 *
 * Availability (Mon–Sat, 10:00–20:00 IST, Sunday closed) is now generated in the
 * CMS at /admin/availability. It is still deliberately not restated in this
 * file: two copies of an opening-hours rule drift, and the slots a visitor sees
 * are the rows, not a comment.
 *
 * /contact remains the right place for "I have a question"; this is for "I want
 * a time".
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
          className="font-semibold leading-[1.05] tracking-tight text-ink"
          style={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3rem)' }}
        >
          Book a free consultation.
        </h1>
        {/* Was, once: "a calendar invite with a Google Meet link straight after
            booking". The link now exists from the moment of booking — we create
            it ourselves on the calendar event — but it is still deliberately
            held back until an hour before the call, so it cannot get buried in a
            week-old chat. The copy describes what actually happens, in the order
            it happens; the constraint is now a choice rather than a plan limit,
            and the sentence is true either way. */}
        <p className="mt-5 max-w-[52ch] text-fluid-base leading-relaxed text-brand-muted">
          A 45-minute strategy call, free. Tell us where to reach you, pick a time, and we will send
          the joining link on WhatsApp an hour before we start.
        </p>
      </header>

      <div className="mt-12">
        <BookingIntake />
      </div>

      {/* A calendar is the wrong tool for some people — a direct line costs
          nothing to offer and stops that visitor bouncing. */}
      <p className="mt-10 text-fluid-sm text-brand-muted">
        Prefer to talk first? Email{' '}
        <a href={`mailto:${COMPANY.email}`} className="text-brand-blue hover:underline">
          {COMPANY.email}
        </a>{' '}
        or call{' '}
        <a href={COMPANY.phoneHref} className="text-brand-blue hover:underline">
          {COMPANY.phone}
        </a>
        .
      </p>
    </section>
  );
}
