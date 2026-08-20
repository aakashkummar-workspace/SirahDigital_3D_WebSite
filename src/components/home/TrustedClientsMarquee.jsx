import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { CLIENTS } from '@/data/clients';

/**
 * Trusted Across Industries.
 *
 * One row of client names travelling left, each set in a different typeface,
 * all sitting on a shared baseline — the "as seen in" press strip, where the
 * variety of the mastheads is the whole effect.
 *
 * ── what this replaced ───────────────────────────────────────────────────
 * Two tilted bands criss-crossing over each other, each name on a bordered
 * plate. It was a lot of composition in service of nine words, and the
 * plates in particular meant every client looked like a button. One row, no
 * tiles, no borders, no fills.
 *
 * Which typeface each name gets is data, not layout: see `voice` in
 * data/clients.js, where the six treatments are described and assigned. The
 * component only reads the field through to a class name, so restyling the
 * row never means touching this file.
 *
 * ── no JavaScript ────────────────────────────────────────────────────────
 * Entirely CSS — the loop, the edge fade, the hover pause, the dim-the-rest
 * hover and the reduced-motion fallback are all declarative, so this ships as
 * a server component with nothing to hydrate. That matters more here than
 * usual: this is the one thing on the page running continuously, and the
 * WebGL particle field behind it already wants the main thread.
 *
 * ── the copies ───────────────────────────────────────────────────────────
 * The track holds the list three times and the stylesheet animates it to
 * -33.3333%, which lands exactly on the start of the second copy. Only the
 * first copy is exposed to assistive technology; the other two exist to make
 * the loop seamless, and announcing the client list three times would be
 * nonsense. `data-clone` is also what the reduced-motion fallback keys off to
 * drop them from the static wrapped row.
 */

// See the note above. Three, not two — one copy has to be wider than the
// stage even on a very wide display.
const COPIES = [0, 1, 2];

/** One name. A link when the client has a url, plain text when it does not. */
function ClientMark({ client }) {
  // A client with real artwork gets the artwork; `voice` is only for names.
  const inner = client.logo ? (
    <img
      className="cmark-logo"
      src={client.logo}
      alt={`${client.name} logo`}
      loading="lazy"
      decoding="async"
    />
  ) : (
    client.name
  );

  const className = client.logo
    ? 'cmark'
    : `cmark cmark--${client.voice || 'grotesk'}`;

  if (!client.url) {
    return <span className={className}>{inner}</span>;
  }
  return (
    <a className={className} href={client.url} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  );
}

export default function TrustedClientsMarquee() {
  return (
    <section
      aria-labelledby="clients-title"
      className="relative py-16 md:py-[100px]"
    >
      <div className="mx-auto max-w-[1400px] px-6">
        <Reveal duration={700} y={20}>
          <div className="mx-auto max-w-[720px] text-center">
            <h2
              id="clients-title"
              className="text-balance text-fluid-2xl font-bold leading-[1.1] tracking-[-0.02em] text-white"
            >
              Trusted Across Industries
            </h2>
            {/* /85 rather than /60: this sits over the densest part of the
                particle field, and the muted tone the other sections use
                disappeared into it. */}
            <p className="mt-5 text-fluid-sm leading-[1.7] text-brand-muted/85">
              Helping organizations automate operations across healthcare, education,
              manufacturing, retail and enterprise software.
            </p>
          </div>
        </Reveal>
      </div>

      {/*
       * Outside the 1400px column on purpose. The row is meant to run the full
       * width of the viewport and dissolve at both edges; boxing it into the
       * text measure would put its fade in the middle of the page and make it
       * read as a component sitting on the page rather than as a band of it.
       */}
      <Reveal delay={120} duration={700} y={20}>
        <div className="cmarquee mt-12 md:mt-16">
          <ul className="cmarquee__track">
            {COPIES.map((copy) =>
              CLIENTS.map((client) => (
                <li
                  key={`${copy}-${client.name}`}
                  className="cmarquee__item"
                  data-clone={copy > 0 ? 'true' : undefined}
                  aria-hidden={copy > 0 || undefined}
                >
                  <ClientMark client={client} />
                </li>
              ))
            )}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
