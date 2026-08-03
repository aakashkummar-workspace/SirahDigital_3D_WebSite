"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const SirahCanvas = dynamic(() => import('./SirahCanvas'), { ssr: false });

/**
 * Mounted once by the site layout rather than by each page.
 *
 * That matters: building the cloud decodes logo.png, extrudes the traced
 * outline, runs MeshSurfaceSampler over it and fills three particle buffers.
 * Mounting per page would repeat all of that on every navigation. Held in the
 * layout, React keeps it alive across route changes and the cost is paid once
 * per session.
 *
 * By default the mark only assembles on the homepage, where the hero leaves
 * the right column empty for it. Everywhere else it stays dispersed as
 * background texture.
 *
 * A section anywhere on the site can borrow it by dispatching
 * BACKGROUND_FOCUS_EVENT — the services page's closing CTA uses this to pull
 * the particles back together, centred behind its copy, and releases it again
 * on the way out. An event keeps the two sides decoupled: the background does
 * not import any section, and no context provider has to be threaded through
 * the server layout.
 */
export const BACKGROUND_FOCUS_EVENT = 'sirah:background-focus';

/**
 * A section can also tint the field toward its own accent without claiming
 * the mark. The services page uses this so the particles behind the page
 * belong to whichever capability is being read.
 *
 *   window.dispatchEvent(new CustomEvent(BACKGROUND_TINT_EVENT, {
 *     detail: { accent: '#22D3EE', energy: 1 },
 *   }))
 *
 * detail: null releases it back to the brand default.
 */
export const BACKGROUND_TINT_EVENT = 'sirah:background-tint';

export default function SiteBackground() {
  const pathname = usePathname();
  // null = nobody has claimed the background; otherwise { assembled, align }
  const [focus, setFocus] = useState(null);

  const [tint, setTint] = useState(null);

  useEffect(() => {
    const onFocus = (e) => setFocus(e.detail || null);
    const onTint = (e) => setTint(e.detail || null);
    window.addEventListener(BACKGROUND_FOCUS_EVENT, onFocus);
    window.addEventListener(BACKGROUND_TINT_EVENT, onTint);
    return () => {
      window.removeEventListener(BACKGROUND_FOCUS_EVENT, onFocus);
      window.removeEventListener(BACKGROUND_TINT_EVENT, onTint);
    };
  }, []);

  // Neither claim survives a navigation.
  useEffect(() => { setFocus(null); setTint(null); }, [pathname]);

  const mode = focus?.assembled
    ? 'assembled'
    : pathname === '/'
      ? 'scroll'      // homepage: assembled at the hero, dispersing on scroll
      : 'dispersed';  // inner pages: background texture
  const align = focus?.align || 'hero';

  return <SirahCanvas mode={mode} align={align} tint={tint?.accent || null} energy={tint?.energy || 0} />;
}
