import React from 'react';
import Reveal from '@/components/ui/Reveal';

/*
 * Customer quotes, side by side.
 *
 * <blockquote> with the attribution in a <figcaption>, so the quote and whose
 * it is stay one unit for a screen reader instead of two loose paragraphs.
 *
 * The opening mark is drawn as decoration and hidden from assistive tech — the
 * <blockquote> already announces that this is a quotation, and a spoken
 * "left double quotation mark" before every one adds nothing.
 *
 * Not sections/TeamGrid or the insights carousel: this is two quotes on a
 * product page, and the site's testimonial machinery is built around a
 * collection with avatars and roles that these two do not have. The company
 * name is the whole attribution here.
 *
 * Server component; Reveal is the only client leaf.
 */
export default function QuoteRow({ quotes }) {
  if (!quotes?.length) return null;

  return (
    <section aria-label="From people using it" className="mx-auto w-full max-w-[1100px] px-6">
      <ul role="list" className="grid gap-x-12 gap-y-14 md:grid-cols-2">
        {quotes.map((item, i) => (
          <li key={item.source}>
            <Reveal y={16} duration={660} delay={i * 110}>
              <figure>
                <span
                  aria-hidden="true"
                  className="block font-serif text-[2.5rem] leading-none text-brand-cyan/40"
                >
                  &ldquo;
                </span>
                <blockquote className="mt-4 text-[1.0625rem] leading-[1.65] tracking-[-0.01em] text-ink/85">
                  {item.quote}
                </blockquote>
                <figcaption className="mt-6 text-[0.8125rem] font-medium uppercase tracking-[0.22em] text-brand-muted/60">
                  {item.source}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
