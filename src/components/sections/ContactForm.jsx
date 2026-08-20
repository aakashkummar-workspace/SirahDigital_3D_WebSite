"use client";
import React, { useState } from 'react';
import BookingStep from '@/components/booking/BookingStep';
import { CONSENT_TEXT } from '@/data/consent';
import { HOME_PRODUCTS } from '@/data/products';

import { PrimaryButton } from '@/components/ui/Button';
/**
 * The consultation form.
 *
 * Floating labels rather than placeholders. A placeholder disappears the
 * moment someone starts typing, which on a six-field form means the only way
 * to check what you have written is to clear the box — the label has to
 * survive the typing. It is done in CSS off `:placeholder-shown` rather than
 * in React so the label position is never a render behind the input, and it
 * still holds if the browser autofills every field at once.
 *
 * That is also why every input carries `placeholder=" "`. The single space is
 * load-bearing: `:placeholder-shown` only matches while a placeholder exists,
 * so removing it would pin every label to the floated position.
 *
 * The fields are the ones /api/contact validates. firstName, email, phone and
 * message are rejected server-side when empty, so they are required here too
 * and the other two are marked optional rather than left ambiguous.
 *
 * ── the product row ──────────────────────────────────────────────────────
 * Toggles, not a <select>. Someone who wants two of the three should be able
 * to say so, and a multiple-select box is the worst control on the web. They
 * are real <button type="button"> elements carrying aria-pressed rather than
 * styled checkboxes: nothing here needs to post as a form control, the whole
 * body is serialised to JSON by hand, and a button is what a screen reader
 * should be told this is.
 *
 * Optional on purpose. Most enquiries are not about a named product, and
 * making this required would turn a helpful question into a toll gate.
 */

const FIELD =
  'peer w-full rounded-xl border border-white/[0.18] bg-white/[0.02] px-4 pt-6 pb-2 ' +
  'text-[0.95rem] text-white outline-none transition-all duration-300 ease-brand ' +
  'hover:border-white/20 focus:border-brand-blue/60 focus:bg-white/[0.04] ' +
  'focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]';
// No autofill styling here on purpose — globals.css already pins the autofilled
// background and text colour for every input on the site, with !important, so
// anything set at this level would be dead code.

// The floated (small, top) state is the default; the un-floated state is the
// exception, so it is the one written as a variant. That way a field with a
// value — including one the browser filled in before hydration — is correct
// with no JS at all.
const LABEL =
  'pointer-events-none absolute left-4 top-2 origin-left text-[0.7rem] font-medium uppercase ' +
  'tracking-[0.12em] text-white/40 transition-all duration-300 ease-brand ' +
  'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 ' +
  'peer-placeholder-shown:text-[0.95rem] peer-placeholder-shown:tracking-normal ' +
  'peer-placeholder-shown:normal-case peer-placeholder-shown:text-white/35 ' +
  'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[0.7rem] ' +
  'peer-focus:uppercase peer-focus:tracking-[0.12em] peer-focus:text-brand-blue';

// The textarea's label cannot centre itself — a four-row box would put it in
// the middle of the writing area — so it sits at the top in both states and
// only changes weight.
const AREA_LABEL =
  'pointer-events-none absolute left-4 top-2 text-[0.7rem] font-medium uppercase ' +
  'tracking-[0.12em] text-white/40 transition-all duration-300 ease-brand ' +
  'peer-placeholder-shown:top-5 peer-placeholder-shown:text-[0.95rem] ' +
  'peer-placeholder-shown:tracking-normal peer-placeholder-shown:normal-case ' +
  'peer-placeholder-shown:text-white/35 ' +
  'peer-focus:top-2 peer-focus:text-[0.7rem] peer-focus:uppercase ' +
  'peer-focus:tracking-[0.12em] peer-focus:text-brand-blue';

// `consent` starts false and is never defaulted true anywhere: DPDP requires the
// opt-in to be an act, so a pre-ticked box would make every row unusable as
// evidence of consent.
const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '', company: '', message: '',
  // Which products the enquiry is about, as slugs. Empty is a valid answer.
  interest: [],
  consent: false, website: '',
};

/*
 * The togglable options: the products, then "custom software" for work that is
 * not one of them, then a way to say "none of these" that is not simply
 * leaving the row blank — a blank row means the question was skipped, and "not
 * sure yet" means it was answered. Those route differently on the follow-up,
 * so they are worth telling apart.
 *
 * The products are derived from HOME_PRODUCTS rather than retyped, so a fourth
 * appears here on its own. The two that follow are not products and are not in
 * that list: "custom software" is a kind of engagement, and putting it in
 * HOME_PRODUCTS to get it onto this row would also put it on the homepage
 * grid, /products, and its own product page. Both ids are namespaced out of
 * the slug space they sit beside, and both are allowlisted server-side in
 * app/api/contact/route.js — adding one here alone would have the API drop it.
 */
const CUSTOM = 'custom-software';
const NOT_SURE = 'not-sure';
const INTEREST_OPTIONS = [
  ...HOME_PRODUCTS.map((p) => ({ id: p.slug, label: p.title })),
  { id: CUSTOM, label: 'Custom Software' },
  { id: NOT_SURE, label: 'Not sure yet' },
];

const CHIP =
  'inline-flex min-h-[44px] items-center rounded-full border px-4 text-[0.875rem] ' +
  'font-medium transition-all duration-300 ease-brand';
const CHIP_OFF =
  'border-white/[0.22] bg-white/[0.02] text-white/60 hover:border-white/35 hover:text-white';
const CHIP_ON =
  'border-brand-blue/70 bg-brand-blue/[0.14] text-white';

function Field({ id, label, type = 'text', required = false, value, onChange, autoComplete }) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        value={value}
        onChange={onChange}
        className={FIELD}
      />
      <label htmlFor={id} className={LABEL}>{label}</label>
    </div>
  );
}

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  /*
   * There is nothing to warm up any more.
   *
   * This used to preload TidyCal's embed script while the visitor typed, because
   * the calendar was a third-party iframe that had to resolve DNS, negotiate
   * TLS, fetch a script and boot — all of it landing on the visitor at the exact
   * moment they were waiting to see times. The calendar is now a fetch to our
   * own /api/slots against a connection the browser already has open, so the
   * whole optimisation and the effect that ran it are gone.
   */

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleInterest = (id) =>
    setForm((f) => ({
      ...f,
      interest: f.interest.includes(id)
        ? f.interest.filter((v) => v !== id)
        : [...f.interest, id],
    }));

  const submitLead = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setStatusMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong.');
      // The name is kept for the greeting on the calendar step, so EMPTY is not
      // restored here the way it used to be — the form is replaced, not reset.
      setStatus('sent');
      setStatusMessage('');
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Something went wrong. Please email us instead.');
    }
  };

  /*
   * Submitted — now show the calendar, exactly as /book does.
   *
   * Every enquiry is meant to end in a booked call, so "thanks, we will be in
   * touch shortly" was the wrong ending: it puts the next move on us, days
   * later, when the person is already here and willing. The two forms differ
   * only in what they ask (this one also takes a message and product interest);
   * both finish on the calendar.
   *
   * The lead is already stored at this point, so someone who closes the tab
   * without picking a slot is still a lead the team can chase — and their
   * WhatsApp carries the booking link so they can finish it themselves.
   */
  if (status === 'sent') {
    return (
      <div id="contact-form" className="scroll-mt-28">
        <p className="mb-2 text-fluid-base font-semibold text-white">
          Thanks{form.firstName ? `, ${form.firstName}` : ''} - one last step.
        </p>
        <p className="mb-8 text-fluid-sm leading-relaxed text-brand-muted">
          Pick a time that suits you below. We have sent the booking link to your WhatsApp as well,
          in case you would rather choose later.
        </p>
        {/*
          * The details are handed down rather than asked for again — this form
          * has just collected all of them, and `leadAlreadyStored` inside
          * BookingStep is what stops the booking writing a second, emptier lead
          * over the one that carries their message.
          */}
        <BookingStep
          firstName={form.firstName}
          lastName={form.lastName}
          email={form.email}
          phone={form.phone}
          company={form.company}
        />
      </div>
    );
  }

  return (
    <form id="contact-form" onSubmit={submitLead} className="scroll-mt-28 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          id="firstName" label="First name" required autoComplete="given-name"
          value={form.firstName} onChange={set('firstName')}
        />
        <Field
          id="lastName" label="Last name (optional)" autoComplete="family-name"
          value={form.lastName} onChange={set('lastName')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          id="email" label="Email" type="email" required autoComplete="email"
          value={form.email} onChange={set('email')}
        />
        <Field
          id="phone" label="Phone (WhatsApp)" type="tel" required autoComplete="tel"
          value={form.phone} onChange={set('phone')}
        />
      </div>

      <Field
        id="company" label="Company (optional)" autoComplete="organization"
        value={form.company} onChange={set('company')}
      />

      <fieldset className="pt-1">
        <legend className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-white/40">
          Which product are you interested in? <span className="normal-case tracking-normal text-white/30">(optional)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {INTEREST_OPTIONS.map((option) => {
            const on = form.interest.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleInterest(option.id)}
                className={`${CHIP} ${on ? CHIP_ON : CHIP_OFF}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="relative">
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder=" "
          value={form.message}
          onChange={set('message')}
          className={`${FIELD} resize-y min-h-[150px] pt-7`}
        />
        <label htmlFor="message" className={AREA_LABEL}>Project details</label>
      </div>

      {/*
        * DPDP consent. Unticked, and `required` so the browser blocks submission
        * with its own message before the round trip — the route rejects it again
        * server-side, because this input is only what a person sees.
        *
        * The wording is imported rather than written here: /api/contact stores
        * that same constant as the proof of what was on screen, and two copies
        * of it would eventually disagree.
        */}
      <label className="flex cursor-pointer items-start gap-3 pt-1 text-[0.8rem] leading-relaxed text-white/55">
        <input
          type="checkbox"
          name="consent"
          required
          checked={form.consent}
          onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-blue"
        />
        <span>{CONSENT_TEXT}</span>
      </label>

      {/* Honeypot. No human ever fills this in; bots fill everything. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={form.website}
        onChange={set('website')}
      />

      {/*
        * The label names the next screen, not the end state.
        *
        * It said "Book Free Consultation" while submitting an enquiry and
        * answering "we will be in touch shortly" — a promise the next screen did
        * not keep. Now the calendar really is the next screen, so the button can
        * say so plainly. Same wording as /book, because it is now the same flow.
        */}
      <div className="pt-3">
        <PrimaryButton type="submit" disabled={status === 'sending'} arrow>
          <span>{status === 'sending' ? 'One moment…' : 'Continue to calendar'}</span>
        </PrimaryButton>
      </div>

      {statusMessage && (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
        >
          {statusMessage}
        </p>
      )}
    </form>
  );
}
