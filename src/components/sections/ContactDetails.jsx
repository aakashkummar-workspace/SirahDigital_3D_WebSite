import React from 'react';
import { COMPANY } from '@/data/company';

/**
 * Office information — the right column of the contact page.
 *
 * This replaces the "Book Free Consultation" card that used to open the left
 * column. That card competed with the form for the same click: the page asked
 * twice for the same commitment and neither ask was the obvious one. The
 * consultation is now the form's own submit button, and this column is
 * reference material — where we are, and the two other ways to reach us.
 *
 * No icons. A pin, an envelope and a handset next to three rows that already
 * say "Office", "Email" and "Phone" is the same information twice, and at this
 * size the icons were the loudest thing in the column. Dividers and a label
 * scale do the separating instead.
 */

function Row({ label, children }) {
  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <dt className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/35">
        {label}
      </dt>
      <dd className="mt-3">{children}</dd>
    </div>
  );
}

export default function ContactDetails() {
  return (
    <aside
      /* The outline was 8% white over a 2% fill, which against the particle
         field behind this page did not resolve as an edge — the column read
         as loose text rather than as a panel. Every border on this page is
         now one step up from where it was. */
      className="rounded-2xl border border-white/[0.18] bg-white/[0.03] p-8
        transition-all duration-500 ease-brand
        hover:-translate-y-1 hover:border-white/[0.28]
        hover:shadow-[0_28px_60px_-30px_rgba(0,0,0,0.85)]
        motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <h2 className="text-fluid-lg font-semibold tracking-tight text-white">Our office</h2>

      <dl className="mt-7 divide-y divide-white/[0.12]">
        <Row label="Address">
          <address className="not-italic text-[0.95rem] leading-relaxed text-brand-muted/85">
            {COMPANY.address.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </address>
        </Row>

        <Row label="Email">
          <a
            href={`mailto:${COMPANY.email}`}
            className="text-[0.95rem] text-white transition-colors duration-300 ease-brand hover:text-brand-blue"
          >
            {COMPANY.email}
          </a>
        </Row>

        <Row label="Phone">
          <a
            href={COMPANY.phoneHref}
            className="text-[0.95rem] text-white transition-colors duration-300 ease-brand hover:text-brand-blue"
          >
            {COMPANY.phone}
          </a>
        </Row>
      </dl>
    </aside>
  );
}
