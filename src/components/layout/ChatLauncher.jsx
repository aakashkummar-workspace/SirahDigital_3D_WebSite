'use client';

import Image from 'next/image';

/**
 * The robot launcher: an "Ask Sirah AI" pill beside a robot sitting on a radar
 * pulse, in the bottom-right corner.
 *
 * This used to be a stand-in. LeadConnector's widget could swap its bubble's
 * icon from the GHL dashboard but not the composition around it, so the vendor
 * button was hidden inside its shadow root and this forwarded clicks into it —
 * about a hundred lines of polling for `#lc_text-widget--btn`, adopting a
 * suppressing stylesheet, and mirroring `data-active` back out.
 *
 * None of that is needed now that the panel is ours. The launcher is a button.
 */
export default function ChatLauncher({ open, onOpen }) {
  return (
    <div
      className={`sirah-launcher ${open ? 'sirah-launcher--hidden' : ''}`}
      // Clears the navbar (z-50) and the WebGL field (z-0), and stays under the
      // open panel — which is why it hides rather than raises when open.
      style={{ zIndex: 2147483000 }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="sirah-launcher__btn group"
        aria-label="Ask Sirah AI - open the chat"
        aria-expanded={open}
      >
        {/* The CTA pair, and the same two colours the primary button's
            gradient runs between — this is the launcher for the site's one
            floating action, so it should look like it belongs to the same
            family as every other thing a visitor can press.

            Bound to the :root custom properties rather than the Tailwind
            brand-* utilities because the rest of this widget's chrome is
            plain CSS in globals.css and reads the same variables; a Tailwind
            class here would be a second place to change the colour. */}
        <span className="sirah-launcher__pill">
          <span style={{ color: 'var(--brand-blue)' }}>Ask Sirah</span>{' '}
          <span style={{ color: 'var(--brand-violet)' }}>AI</span>
        </span>

        <span className="sirah-launcher__robot">
          {/* Radar pulse. Decorative — the button already has a label. */}
          <span aria-hidden="true" className="sirah-launcher__rings">
            <i style={{ animationDelay: '0s' }} />
            <i style={{ animationDelay: '1.1s' }} />
            <i style={{ animationDelay: '2.2s' }} />
          </span>

          <Image
            src="/chat-avatar.png"
            alt=""
            width={72}
            height={72}
            className="sirah-launcher__img"
          />
        </span>
      </button>
    </div>
  );
}
