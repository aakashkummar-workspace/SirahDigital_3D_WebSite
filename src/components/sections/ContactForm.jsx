"use client";
import React, { useState } from 'react';
import AnimatedHeading from '@/components/ui/AnimatedHeading';

// Shared styling for every field in the consultation form
const inputClass =
  'w-full px-4 py-3.5 rounded-lg border text-sm transition-colors focus:outline-none focus:border-cyan-400 bg-black/40 border-white/10 text-white placeholder:text-slate-500';

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', company: '', message: '', website: '' };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);

  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

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
      setStatus('sent');
      setStatusMessage('Thanks — we will be in touch shortly.');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Something went wrong. Please email us instead.');
    }
  };

  return (
    <div
      id="send-message"
      className="scroll-mt-28 pointer-events-auto py-6"
    >
      <AnimatedHeading text="Send us a message" className="text-3xl font-bold text-white" />

      <form onSubmit={submitLead} className="mt-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <input
            type="text" required placeholder="First Name" aria-label="First Name"
            className={inputClass} value={form.firstName} onChange={set('firstName')}
          />
          <input
            type="text" placeholder="Last Name" aria-label="Last Name"
            className={inputClass} value={form.lastName} onChange={set('lastName')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <input
            type="email" required placeholder="Email" aria-label="Email"
            className={inputClass} value={form.email} onChange={set('email')}
          />
          <input
            type="tel" required placeholder="Phone (WhatsApp)" aria-label="Phone"
            className={inputClass} value={form.phone} onChange={set('phone')}
          />
        </div>

        <input
          type="text" placeholder="Company" aria-label="Company"
          className={inputClass} value={form.company} onChange={set('company')}
        />

        <textarea
          rows={4} required placeholder="Your automation needs" aria-label="Your automation needs"
          className={`${inputClass} resize-y min-h-[120px]`} value={form.message} onChange={set('message')}
        />

        {/* Honeypot */}
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

        <div>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="group inline-flex items-center gap-2 text-base font-bold text-white hover:text-cyan-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{status === 'sending' ? 'Sending…' : 'Submit Form'}</span>
            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
          </button>
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
    </div>
  );
}
