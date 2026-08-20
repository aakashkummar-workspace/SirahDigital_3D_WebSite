import React from 'react';
import Reveal from '@/components/ui/Reveal';
import ScreenshotFrame from './ScreenshotFrame';

/*
 * The screenshot tour — a sequence of shots, each with its own explanation.
 *
 * Alternating sides. The text column swaps left/right on each row from 1024px
 * up, which keeps a run of wide frames from reading as a stack of identical
 * bands. Below that width everything is one column and the alternation
 * collapses, as it should — side-by-side at 400px is two cramped columns.
 *
 * The frame prints no caption of its own here: this section already states
 * what each screen is, in the heading beside it, and printing it twice under
 * the image was the first thing that looked wrong.
 *
 * Server component; Reveal is the only client leaf.
 */
export default function ScreenshotTour({ screenshots }) {
  if (!screenshots?.length) return null;

  return (
    <section aria-label="Product tour" className="mx-auto w-full max-w-[1100px] px-6">
      <ul role="list" className="space-y-20 md:space-y-28">
        {screenshots.map((shot, i) => (
          <li
            key={shot.caption}
            className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14"
          >
            {/* order-last on odd rows puts the text on the right, so the
                frames zig-zag down the page instead of marching. */}
            <div className={i % 2 === 1 ? 'lg:order-last' : undefined}>
              <Reveal y={16} duration={640}>
                <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.42em] text-white/30">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-5 text-[clamp(1.25rem,1rem+0.9vw,1.625rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-white">
                  {shot.caption}
                </h3>
                {shot.desc && (
                  <p className="mt-4 max-w-[44ch] text-[0.9375rem] leading-[1.7] text-brand-muted/70">
                    {shot.desc}
                  </p>
                )}
              </Reveal>
            </div>

            <Reveal y={20} duration={700} delay={90}>
              <ScreenshotFrame
                shot={shot}
                showCaption={false}
                sizes="(max-width: 1024px) 100vw, 620px"
              />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
