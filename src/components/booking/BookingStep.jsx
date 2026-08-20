"use client";
import React, { useState } from 'react';
import SlotPicker from '@/components/booking/SlotPicker';

import { PrimaryButton } from '@/components/ui/Button';

/**
 * "Now pick a time" — for a visitor whose details we already have.
 *
 * Used by the contact form, which asks for everything and *then* offers the
 * calendar. /book does not use this: there the details and the time are one
 * form and one submit, so it posts directly.
 *
 * ── Why leadAlreadyStored exists ─────────────────────────────────────────
 * /api/contact has already written this person to `leads`, with their message
 * and their product interests on it. If this step let /api/book write a second
 * row, that row would be the newer one — and the CMS matches a booking to its
 * lead by email, most recent first. The booking would attach to the emptier of
 * the two, and the team email, which is written from the lead's message and
 * interests, would arrive with the interesting part missing.
 *
 * So the flag is not an optimisation. It stops the good lead being shadowed by
 * a worse one written seconds later.
 */
export default function BookingStep({ firstName, lastName, email, phone, company }) {
  const [slotId, setSlotId] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // null while loading, so the button holds disabled rather than flickering.
  const [available, setAvailable] = useState(null);

  const confirm = async () => {
    if (!slotId) {
      setError('Please choose a time.');
      return;
    }

    setError('');
    setState('sending');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, email, phone, company,
          slotId,
          // Already given on the form that got them here. The CMS still records
          // it against the lead that was stored then, so nothing is lost by not
          // asking twice — and asking twice for the same permission reads as
          // though the first answer was not kept.
          consent: true,
          leadAlreadyStored: true,
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok && body.ok) {
        setConfirmed(body);
        setState('done');
        return;
      }

      if (res.status === 409 || body.taken) {
        setSlotId('');
        setRefreshKey((n) => n + 1);
        setError('Sorry — that time was taken a moment ago. Please pick another.');
        setState('idle');
        return;
      }

      setError(body.error || 'We could not confirm that booking. Please try again.');
      setState('idle');
    } catch {
      setError('We could not reach the booking system. Please try again, or email support@sirahdigital.in.');
      setState('idle');
    }
  };

  if (state === 'done') {
    return (
      <div className="rounded-xl border border-white/10 p-6">
        <p className="text-fluid-base font-medium text-white">
          You are booked{firstName ? `, ${firstName}` : ''}.
        </p>
        <p className="mt-3 max-w-[52ch] text-fluid-sm leading-relaxed text-brand-muted">
          We have sent a confirmation to your WhatsApp. You will get a reminder the day before, and
          the joining link an hour before we start.
        </p>
        {confirmed?.startAt && (
          <p className="mt-4 text-fluid-sm text-white/55">
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

  return (
    <div className="space-y-5">
      <SlotPicker
        value={slotId}
        onChange={setSlotId}
        refreshKey={refreshKey}
        onAvailability={setAvailable}
      />

      {error && (
        <p role="alert" className="text-[0.85rem] text-red-300">
          {error}
        </p>
      )}

      {/* Not offered against an empty calendar — see the note in
          BookingIntake. The panel above has already said there is nothing to
          book and given them an email address; a live button here would only
          produce a contradictory "Please choose a time". */}
      {available !== 0 && (
        <PrimaryButton type="button" onClick={confirm} disabled={state === 'sending'}>
          {state === 'sending' ? 'Confirming…' : 'Confirm booking'}
        </PrimaryButton>
      )}
    </div>
  );
}
