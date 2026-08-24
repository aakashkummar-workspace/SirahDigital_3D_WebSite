import BookingIntake from '@/components/booking/BookingIntake';
import { lookupReschedule } from '@/lib/slots';
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

/*
 * ?r=<token> turns this page into a reschedule.
 *
 * A separate /reschedule route was the obvious alternative and it would have
 * meant two pages rendering the same calendar and racing for the same slots.
 * The only real differences are the heading and which fields are asked for, so
 * this is one page with one extra branch.
 *
 * The lookup is server-side and deliberately forgiving: `lookupReschedule`
 * returns null for an unknown token, a stale link or an unreachable CMS alike,
 * and all three land on the ordinary booking page. Somebody who followed a dead
 * link should get a working way to book, not an error telling them their link
 * is dead — they still want a call.
 *
 * A booking that exists but may no longer be moved is different, and gets said
 * out loud: that person has a call in their diary and needs to know it is still
 * there and why the link stopped working.
 */
export default async function BookPage({ searchParams }) {
  const token = typeof searchParams?.r === 'string' ? searchParams.r : '';
  const reschedule = token ? await lookupReschedule(token) : null;

  const when = reschedule
    ? new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: reschedule.timeZone || 'Asia/Kolkata',
      }).format(new Date(reschedule.startAt))
    : '';

  return (
    <section className="mx-auto max-w-[880px] px-6 py-20 md:py-28">
      <header className="max-w-[34ch]">
        <h1
          className="font-semibold leading-[1.05] tracking-tight text-white"
          style={{ fontSize: 'clamp(2rem, 1.4rem + 2.6vw, 3rem)' }}
        >
          {reschedule ? 'Move your consultation.' : 'Book a free consultation.'}
        </h1>
        {/* Was, once: "a calendar invite with a Google Meet link straight after
            booking". The link now exists from the moment of booking — we create
            it ourselves on the calendar event — but it is still deliberately
            held back until an hour before the call, so it cannot get buried in a
            week-old chat. The copy describes what actually happens, in the order
            it happens; the constraint is now a choice rather than a plan limit,
            and the sentence is true either way. */}
        {reschedule ? (
          <p className="mt-5 max-w-[52ch] text-fluid-base leading-relaxed text-brand-muted">
            {reschedule.firstName ? `${reschedule.firstName}, your` : 'Your'} call is currently{' '}
            <strong className="text-white">{when}</strong>.
            {reschedule.canReschedule
              ? ' Pick a new time below and the old one goes back on the calendar straight away.'
              : ` ${reschedule.reason} Reply on WhatsApp and someone will sort it out.`}
          </p>
        ) : (
          <p className="mt-5 max-w-[52ch] text-fluid-base leading-relaxed text-brand-muted">
            A 45-minute strategy call, free. Tell us where to reach you, pick a time, and we will send
            the joining link on WhatsApp an hour before we start.
          </p>
        )}
      </header>

      {/* A booking that cannot be moved gets no calendar at all. Showing one
          that will be refused on submit is worse than showing none: it reads as
          a working offer right up until the moment it is not. */}
      {!reschedule || reschedule.canReschedule ? (
        <div className="mt-12">
          <BookingIntake reschedule={reschedule} />
        </div>
      ) : null}

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
