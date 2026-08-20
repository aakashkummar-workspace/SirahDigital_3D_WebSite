"use client";
import React, { useState } from 'react';
import SlotPicker from '@/components/booking/SlotPicker';
import { CONSENT_TEXT } from '@/data/consent';

import { PrimaryButton } from '@/components/ui/Button';

/**
 * Details and a time, on one screen.
 *
 * ── What changed, and why the two-step flow is gone ──────────────────────
 * This used to be a form that had to be completed before the calendar would even
 * appear. That was not a design choice — it was a workaround. TidyCal's free
 * plan could not ask custom booking questions, so it collected a name and an
 * email and nothing else, and the WhatsApp confirmation and reminders need a
 * phone number. There was nowhere else to ask, so the form went in front, and
 * the file said plainly what that cost: "a form in front of a calendar loses
 * some people who would otherwise have booked."
 *
 * The old comment ended by saying that if TidyCal were ever upgraded, the number
 * should be asked for inside the booking form and this component deleted. What
 * happened instead is that TidyCal was dropped entirely and the booking form
 * became ours — so the number is asked for in it, which is the same outcome by
 * the other route. One screen, one submit, and the gate is gone.
 *
 * ── One request, not two ─────────────────────────────────────────────────
 * Details and slot go to /api/book together. The two-step version stored the
 * lead on submit and then handed the visitor to a third party, so the two halves
 * could not fail together — someone could be a lead with no booking, or book
 * with an address that did not match their lead and get no reminders at all.
 * Sending both at once makes that class of mismatch unrepresentable.
 */

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '', company: '',
  consent: false, website: '',
};

export default function BookingIntake() {
  const [form, setForm] = useState(EMPTY);
  const [slotId, setSlotId] = useState('');
  const [state, setState] = useState('form'); // form | sending | done
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  /*
   * Bumped to make SlotPicker re-fetch. The only thing that needs it is losing
   * a race for a slot: the list on screen is then one time out of date, and
   * re-offering the time that just went is how someone gets rejected twice.
   */
  const [refreshKey, setRefreshKey] = useState(0);

  /*
   * How many times are on offer. `null` while the first fetch is in flight, so
   * the button can be held disabled during load rather than flickering from
   * enabled to disabled once the answer arrives.
   */
  const [available, setAvailable] = useState(null);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: k === 'consent' ? e.target.checked : e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!slotId) {
      setError('Please choose a time.');
      return;
    }

    setState('sending');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slotId }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok && body.ok) {
        setConfirmed(body);
        setState('done');
        return;
      }

      /*
       * Someone else took it in the seconds between this list loading and
       * Confirm being pressed. Recoverable, and handled as such: the selection
       * is cleared, the list re-fetches without that time on it, and everything
       * they typed stays exactly where it was. Making them fill the form in
       * again over a two-second race would be the real insult.
       */
      if (res.status === 409 || body.taken) {
        setSlotId('');
        setRefreshKey((n) => n + 1);
        setError('Sorry — that time was taken while you were filling this in. Please pick another.');
        setState('form');
        return;
      }

      setError(body.error || 'We could not confirm that booking. Please try again.');
      setState('form');
    } catch {
      /*
       * Unlike the old two-step flow, a network failure here cannot be waved
       * through. Back then letting them past to the calendar cost only our own
       * bookkeeping; now this request *is* the booking, and pretending it
       * succeeded would send someone away believing they have a call.
       */
      setError('We could not reach the booking system. Please try again, or email support@sirahdigital.in.');
      setState('form');
    }
  };

  if (state === 'done') {
    return (
      <div className="rounded-xl border border-ink/10 p-6">
        <p className="text-fluid-base font-medium text-ink">
          You are booked{form.firstName ? `, ${form.firstName}` : ''}.
        </p>
        <p className="mt-3 max-w-[52ch] text-fluid-sm leading-relaxed text-brand-muted">
          We have sent a confirmation to your WhatsApp. You will get a reminder the day before, and
          the joining link an hour before we start.
        </p>
        {/* The time is echoed back from the server's response, not from the
            button that was clicked — so what is shown is what was actually
            written to the calendar. */}
        {confirmed?.startAt && (
          <p className="mt-4 text-fluid-sm text-ink/55">
            {new Intl.DateTimeFormat('en-GB', {
              weekday: 'long', day: 'numeric', month: 'long',
              hour: 'numeric', minute: '2-digit', hour12: true,
              timeZone: confirmed.timeZone || 'Asia/Kolkata',
            }).format(new Date(confirmed.startAt))}
            {' · '}
            {confirmed.timeZone === 'Asia/Kolkata' ? 'IST' : confirmed.timeZone}
          </p>
        )}
      </div>
    );
  }

  const field =
    'w-full rounded-xl border border-ink/10 bg-ink/5 px-4 py-3 text-[15px] text-ink ' +
    'placeholder:text-ink/35 outline-none transition-colors focus:border-brand-blue';

  return (
    <form onSubmit={onSubmit} className="max-w-[560px] space-y-8">
      <fieldset className="space-y-4 border-0 p-0">
        <legend className="mb-4 text-[0.78rem] uppercase tracking-[0.14em] text-ink/40">
          1 · Your details
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className={field}
            name="firstName"
            required
            placeholder="First name *"
            value={form.firstName}
            onChange={set('firstName')}
            autoComplete="given-name"
          />
          <input
            className={field}
            name="lastName"
            placeholder="Last name"
            value={form.lastName}
            onChange={set('lastName')}
            autoComplete="family-name"
          />
        </div>

        <input
          className={field}
          name="email"
          type="email"
          required
          placeholder="Email *"
          value={form.email}
          onChange={set('email')}
          autoComplete="email"
        />

        <div>
          <input
            className={field}
            name="phone"
            type="tel"
            required
            placeholder="WhatsApp number *"
            value={form.phone}
            onChange={set('phone')}
            autoComplete="tel"
          />
          {/* Says what the number is for. A required phone field with no stated
              purpose reads as data harvesting and is the field people abandon. */}
          <p className="mt-2 text-[0.78rem] leading-relaxed text-ink/45">
            We send your booking confirmation here, a reminder the day before, and the joining link
            an hour before the call.
          </p>
        </div>

        <input
          className={field}
          name="company"
          placeholder="Company (optional)"
          value={form.company}
          onChange={set('company')}
          autoComplete="organization"
        />

        {/*
          * Honeypot. Not `type="hidden"` — a bot reads the DOM, and a hidden
          * input is the one field it knows to leave alone. This is a real text
          * field taken off-screen, which is what they actually fall for.
          */}
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={set('website')}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute h-0 w-0 overflow-hidden opacity-0"
        />
      </fieldset>

      <fieldset className="border-0 p-0">
        <legend className="mb-4 text-[0.78rem] uppercase tracking-[0.14em] text-ink/40">
          2 · Pick a time
        </legend>
        <SlotPicker
          value={slotId}
          onChange={setSlotId}
          refreshKey={refreshKey}
          onAvailability={setAvailable}
        />
      </fieldset>

      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3 text-[0.8rem] leading-relaxed text-ink/55">
          <input
            type="checkbox"
            name="consent"
            required
            checked={form.consent}
            onChange={set('consent')}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-blue"
          />
          <span>{CONSENT_TEXT}</span>
        </label>

        {error && (
          <p role="alert" className="text-[0.85rem] text-red-300">
            {error}
          </p>
        )}

        {/*
          * Disabled while there is nothing to book.
          *
          * The empty state above already explains that the calendar is full and
          * offers an email address. A live Confirm button next to it invites a
          * click whose only possible outcome is "Please choose a time" —
          * printed directly beneath a panel saying there are no times to
          * choose. Two contradictory messages read as a broken form, so the
          * button is simply not offered until there is something to press it
          * for.
          */}
        <PrimaryButton type="submit" disabled={state === 'sending' || available === 0}>
          {state === 'sending' ? 'Confirming…' : 'Confirm booking'}
        </PrimaryButton>
      </div>
    </form>
  );
}
