import React from 'react';

/**
 * A workflow as a line of text: Enquiry → Appointment → Follow-up.
 *
 * The same element on /industries and /products, which is why it lives here
 * rather than twice. Both pages want the identical thing — an automation
 * company showing what it automated, as an editorial detail rather than a
 * diagram — and two copies would have drifted the first time one of them
 * changed a size or a colour.
 *
 * An <ol>, because the sequence is the information. The arrows are decoration
 * on top of that and are hidden from assistive tech, so a screen reader gets
 * the stages in order rather than "right arrow" between every one of them.
 *
 * The arrow sits inside its step rather than between steps: when a long flow
 * wraps to a second row, an arrow that is its own list item can end up
 * stranded at the start of a line, away from the step it belongs to.
 *
 * Styling is `.flow` in globals.css. Colour and size are inherited from the
 * surrounding card or row, so a caller adjusts it with a class rather than a
 * prop.
 */
export default function StepFlow({ steps, className = '' }) {
  if (!steps?.length) return null;

  return (
    <ol className={`flow ${className}`}>
      {steps.map((step, i) => (
        <li key={step} className="flow__step">
          {i > 0 && (
            <span aria-hidden="true" className="flow__arrow">
              →
            </span>
          )}
          {step}
        </li>
      ))}
    </ol>
  );
}
