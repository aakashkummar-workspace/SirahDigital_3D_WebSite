/*
 * Social profiles. Read by the footer and by the founder panel on /about, so
 * the icon paths and the URLs live in one place.
 *
 * ── where these came from ────────────────────────────────────────────────
 * Facebook, Instagram, WhatsApp and YouTube were supplied directly by Sirah
 * Digital and are reproduced character for character, query strings and all.
 * Do not "tidy" them:
 *
 *   - Facebook's `?rdid=…&share_url=…` and Instagram's `?igsh=…` are share
 *     tokens. Both profiles resolve without them, but these are the URLs the
 *     company gave and stripping a parameter is not this file's decision.
 *   - WhatsApp is a click-to-chat link, not a profile. The `text=` parameter
 *     is a pre-filled opening message; the number in `phone=` is the same
 *     one COMPANY.phone carries, without the + or the spaces, which is the
 *     format api.whatsapp.com requires.
 *
 * LinkedIn was not in that set. It is kept from the earlier pass, where it
 * was taken from the Organization JSON-LD on the live site and confirmed by
 * fetching it — the page returns 200 and titles itself "Sirah Digital |
 * LinkedIn". It is the one URL here not confirmed by the company directly.
 *
 * ── two things deliberately NOT here ─────────────────────────────────────
 * The live site's JSON-LD also lists https://twitter.com/SirahDigital. It is
 * linked nowhere on that site and was never asked for, so it is left out
 * rather than guessed at.
 *
 * The live site also carries https://www.youtube.com/@riyazlive in a founder
 * card. That is a personal channel; the brand channel is @sirahdigital.
 */
export const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1C8e4h74gr/',
    path: 'M13.5 9H15V6.5h-1.9C11 6.5 10.2 7.7 10.2 9.3V11H8.5v2.5h1.7V21h2.8v-7.5h1.9l.3-2.5h-2.2V9.6c0-.4.2-.6.5-.6z',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.link/zebr1n',
    path: 'M12 3a9 9 0 00-7.8 13.5L3 21l4.7-1.2A9 9 0 1012 3zm0 2a7 7 0 016 10.6l-.3.5.6 2.2-2.3-.6-.5.3A7 7 0 1112 5zm-2.7 3.4c-.2 0-.5.1-.7.4-.2.3-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.6 4 3.5 1.9.8 2.3.6 2.7.6.4 0 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.6-.3-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4z',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@sirahdigital',
    path: 'M21.6 8.2s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.8C16.1 5.2 12 5.2 12 5.2s-4.1 0-6.9.2c-.4 0-1.2 0-1.9.8-.6.6-.8 2-.8 2S2.2 9.8 2.2 11.4v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.7.8 1.7.7 2.1.8 1.6.2 6.7.2 6.7.2s4.1 0 6.9-.2c.4 0 1.2 0 1.9-.8.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2zM10.1 14.7V9.4l5.2 2.7-5.2 2.6z',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/sirah_digital?igsh=MWdqMHNscWNsdTFucg==',
    path: 'M12 8.1A3.9 3.9 0 1015.9 12 3.9 3.9 0 0012 8.1zm0 6.4A2.5 2.5 0 1114.5 12 2.5 2.5 0 0112 14.5zm5-6.6a.9.9 0 11-.9-.9.9.9 0 01.9.9zM20 8a4.5 4.5 0 00-1.2-3.2A4.6 4.6 0 0015.6 3.6C14.3 3.5 10 3.5 8.7 3.6A4.6 4.6 0 005.5 4.8 4.5 4.5 0 004.3 8c-.1 1.3-.1 5.3 0 6.6a4.5 4.5 0 001.2 3.2 4.6 4.6 0 003.2 1.2c1.3.1 5.6.1 6.9 0a4.6 4.6 0 003.2-1.2A4.5 4.5 0 0020 14.6c.1-1.3.1-5.3 0-6.6zm-1.7 8a2.6 2.6 0 01-1.4 1.4c-1 .4-3.3.3-4.4.3s-3.4.1-4.4-.3a2.6 2.6 0 01-1.4-1.4c-.4-1-.3-3.3-.3-4.4s-.1-3.4.3-4.4a2.6 2.6 0 011.4-1.4c1-.4 3.3-.3 4.4-.3s3.4-.1 4.4.3a2.6 2.6 0 011.4 1.4c.4 1 .3 3.3.3 4.4s.1 3.4-.3 4.4z',
  },
  {
    // Drawn to match the others: one filled path on the same 24x24 box, same
    // optical weight, so the row still reads as one set.
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/sirahdigital',
    path: 'M6.94 8.94H4.16V20h2.78V8.94zM5.55 4a1.61 1.61 0 100 3.22A1.61 1.61 0 005.55 4zM20 13.86c0-2.98-1.59-4.37-3.72-4.37-1.71 0-2.48.94-2.9 1.6V8.94h-2.78c.04.79 0 11.06 0 11.06h2.78v-6.18c0-.25.02-.5.09-.68.2-.5.65-1.01 1.42-1.01 1 0 1.4.76 1.4 1.88V20H20v-6.14z',
  },
];
