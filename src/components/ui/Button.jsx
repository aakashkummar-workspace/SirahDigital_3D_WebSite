import React from 'react';
import Link from 'next/link';

/*
 * The button system.
 *
 * Three levels, and the whole point of the file is that there are only
 * three:
 *
 *   PrimaryButton    the brand gradient pill. One per view, for the action
 *                    the page exists to get.
 *   SecondaryButton  glass. The second action in a row, and the treatment
 *                    for a control standing on a photograph.
 *   GhostButton      a bare text link with an arrow. The quiet third.
 *
 * -- where the styling actually lives -------------------------------------
 * Not here. Each of these picks a class name — .btn-primary, .btn-secondary,
 * .btn-ghost — and every colour, size, shadow and transition is declared
 * once in globals.css beside the other component classes.
 *
 * That split is deliberate and it is the thing to preserve. The site had
 * drifted to six different primary treatments precisely because a button was
 * describable in two places at once; a component that carried its own
 * colours would be a seventh place to describe one. Keeping the classes as
 * the source of truth also means the call sites that still write
 * className="btn-primary" on a hand-rolled <a> are not wrong — they render
 * identically, and they can be migrated whenever they are next touched
 * rather than all at once.
 *
 * -- what this file is for, then ------------------------------------------
 * Picking the right element. A CTA is a <Link> when it goes somewhere
 * internal, an <a> when it leaves the site or jumps to an anchor, and a
 * <button> when it does something — and getting that wrong is the actual
 * recurring bug, not getting the colour wrong. Pass `href` and you get the
 * right kind of link; leave it off and you get a real button with an
 * explicit type, so a CTA inside a <form> can never submit it by accident.
 */

/**
 * Trailing arrow. Its class is what the hover rules in globals.css hang the
 * 4px slide off, so it has to stay on the element that moves.
 */
function Arrow() {
  return (
    <span aria-hidden="true" className="btn-arrow">
      →
    </span>
  );
}

/**
 * Chooses between Link, a and button, and nothing else.
 *
 * `external` is inferred rather than passed: an href that leaves the site or
 * points at an id is not something next/link should own. A mailto: or tel:
 * would break outright under it.
 */
function Action({ href, children, className, arrow = false, type, ...rest }) {
  const body = (
    <>
      {children}
      {arrow ? <Arrow /> : null}
    </>
  );

  if (!href) {
    return (
      // Explicit, always. A <button> with no type inside a form is a submit
      // button, which is how a "Learn more" ends up posting a contact form.
      <button type={type || 'button'} className={className} {...rest}>
        {body}
      </button>
    );
  }

  const external = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);
  if (external) {
    return (
      <a href={href} className={className} {...rest}>
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className} {...rest}>
      {body}
    </Link>
  );
}

/** Joins the variant class with whatever layout classes the call site adds. */
const cx = (base, extra) => (extra ? `${base} ${extra}` : base);

/**
 * The brand gradient pill — blue into violet, white type, lifts 2px.
 *
 * Every primary action on the site is this. If a design calls for a second
 * one in the same view, one of the two is a SecondaryButton.
 *
 *   <PrimaryButton href="/contact" arrow>Book Free Consultation</PrimaryButton>
 *   <PrimaryButton type="submit" disabled={sending}>Send</PrimaryButton>
 */
export function PrimaryButton({ className, ...props }) {
  return <Action className={cx('btn-primary', className)} {...props} />;
}

/**
 * Glass: a faint white fill behind a blurred edge.
 *
 * Not a second gradient, and that is the rule rather than a preference —
 * two filled buttons beside each other are two primaries, and the pair
 * stops telling the visitor which one the page wants.
 */
export function SecondaryButton({ className, ...props }) {
  return <Action className={cx('btn-secondary', className)} {...props} />;
}

/** A bare text link. The quiet option beside a filled primary. */
export function GhostButton({ className, ...props }) {
  return <Action className={cx('btn-ghost', className)} {...props} />;
}

/*
 * CTAButton is PrimaryButton under the name the brief used for it. Kept as
 * an alias rather than a second component so there is no chance of the two
 * ever rendering differently.
 */
export const CTAButton = PrimaryButton;

export default PrimaryButton;
