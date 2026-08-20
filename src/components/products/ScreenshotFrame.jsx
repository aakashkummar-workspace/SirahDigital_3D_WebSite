import React from 'react';
import Image from 'next/image';
import styles from './product.module.css';

/*
 * One product screenshot, in a browser frame.
 *
 * Two states, one box. `shot.src` is a path when the file exists under public/
 * and null when it does not — lib/productImages.js decides that at build time,
 * so this component never has to guess and never renders a broken image.
 *
 * Both states resolve to the same aspect-ratio well, which is the whole point:
 * the page can be designed, reviewed and shipped against placeholders, and
 * dropping the real PNGs in later changes nothing about the layout. See
 * data/productDetails.js for the paths each slot is waiting for.
 *
 * Server component.
 *
 *   shot      { src, caption, width?, height? }   src may be null; the size
 *             is filled in by lib/productImages.js when the file is a PNG
 *   priority  true for the one above the fold; everything else lazy-loads
 *   sizes     passed through to next/image — the caller knows its container
 *   showCaption  the tour prints its own caption alongside, so it opts out.
 *                Ignored while the file is missing — see below.
 */
export default function ScreenshotFrame({
  shot,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 1100px',
  showCaption = true,
}) {
  if (!shot) return null;

  const { src, caption, width, height } = shot;

  /*
   * The well is a 16/10 box by default — right for the placeholder, and right
   * for a screenshot of roughly application shape. A real file whose ratio is
   * known overrides it, so the frame takes the shape of the image rather than
   * cropping the image to the shape of the frame. lib/productImages.js reads
   * the size off the PNG header at build time; see the note there.
   *
   * Still a ratio and not a height: the box stays fluid, so this is the same
   * responsive behaviour at 360px as at 1100px.
   */
  const wellStyle =
    src && width && height ? { aspectRatio: `${width} / ${height}` } : undefined;

  return (
    <figure className="m-0">
      <div className={styles.frame}>
        <div className={styles.chrome} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>

        <div className={styles.well} style={wellStyle}>
          {src ? (
            <Image
              src={src}
              /* The caption below states what this is, so repeating it in alt
                 would have a screen reader say it twice. Where there is no
                 caption the alt carries it instead. */
              alt={showCaption ? '' : caption || ''}
              aria-hidden={showCaption ? 'true' : undefined}
              fill
              sizes={sizes}
              priority={priority}
              loading={priority ? undefined : 'lazy'}
              className={styles.shot}
            />
          ) : (
            /*
             * No file yet. The caption is the label — it tells a visitor what
             * they would be looking at, and it tells whoever is taking the
             * screenshots which screen this slot wants.
             */
            <div className={styles.placeholder}>
              <span className={styles.placeholderLabel}>{caption}</span>
              <span className={styles.placeholderNote}>Screenshot coming soon</span>
            </div>
          )}
        </div>
      </div>

      {/* Only under a real image. The placeholder already prints the caption
          as its label, and printing it again directly underneath was the same
          three words twice in a row — unmissable once a page is down to a
          single frame. */}
      {src && showCaption && caption && (
        <figcaption className={styles.caption}>{caption}</figcaption>
      )}
    </figure>
  );
}
