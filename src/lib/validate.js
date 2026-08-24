/*
 * Field rules shared by the forms and the API routes behind them.
 *
 * One definition, imported by both halves, because the two drifting apart is
 * the failure that actually happens: the form accepts what the route rejects
 * and the visitor gets "something went wrong" with no idea which field, or the
 * route accepts what the form blocked and the rule was never real.
 *
 * The number matters more here than on most sites. Every booking confirmation
 * and the joining link itself go out over WhatsApp, so a mistyped digit does
 * not degrade the experience — it removes it. The visitor keeps their slot,
 * hears nothing, and concludes the booking failed.
 */

/** Everything that is not a digit, gone. `null` and `undefined` become ''. */
export const digitsOf = (value) => String(value ?? '').replace(/\D+/g, '');

/**
 * The 10-digit national number, with the ways people write a country code
 * stripped off first.
 *
 * Tolerated on input rather than rejected, because both forms are pasted into
 * as often as typed: a contact card gives +91 97899 61631, an older address
 * book gives 0 97899 61631, and refusing those teaches the visitor their own
 * number is wrong. Only the leading 91/0 is removed — a 91 anywhere else is
 * somebody's digits.
 */
export function nationalPhone(value) {
  const digits = digitsOf(value);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/**
 * Exactly ten digits.
 *
 * Deliberately not also checking that it starts 6-9, which is what makes an
 * Indian mobile an Indian mobile. That check would catch a landline typed in by
 * mistake, and it would also reject the first legitimate number that does not
 * fit the pattern — and the cost of the two errors is not symmetrical. A wrong
 * number loses one WhatsApp thread; a rejected right number loses the booking
 * outright, and the visitor cannot tell it is our rule rather than their typo.
 */
export const isPhone = (value) => nationalPhone(value).length === 10;

/*
 * Good enough on purpose.
 *
 * There is no regex that decides whether an address can receive mail — the only
 * test that answers that is sending to it. So this catches the mistakes people
 * actually make (no @, nothing after it, a bare hostname with no dot, a stray
 * space from a paste) and lets everything else through to be confirmed by the
 * mail that follows. Anything stricter starts rejecting valid addresses, and a
 * form that will not accept your real email is the last screen you see.
 *
 * Kept as one expression rather than the shorter `[^\s@]+\.[^\s@]+` version the
 * contact route used: that accepted "a@b." — a trailing dot with no TLD.
 */
export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(value ?? '').trim());

/** What each form shows under the field. Same words in both, so they read as one rule. */
export const PHONE_HINT = 'Enter the 10-digit number, digits only.';
export const EMAIL_HINT = 'Enter an email address we can reply to.';
