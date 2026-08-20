/*
 * Slides for the image flow on the homepage.
 *
 * The section is an editorial stage: one photograph held on a raised plate
 * with a label above it, and the rest of the set shrunk to thumbnails
 * flanking it on both sides.
 *
 *   src      /public path, e.g. '/carousel/01.jpg'. Portrait, exactly 5:7.
 *            The files are cut to that ratio rather than left to object-cover,
 *            so the frame and the photograph agree to the pixel and nothing is
 *            ever trimmed at render time. Every frame in the section — hero
 *            and thumbnail alike — is the same 5:7 box at a different scale,
 *            which is what keeps a photograph from being cropped as it travels
 *            in to the centre. A replacement that is not 5:7 will still
 *            display, cropped from the centre, so cut new ones to 5:7 first.
 *   alt      describes the picture for screen readers. Required once src is set.
 *   eyebrow  the small letterspaced label above the picture — the only copy
 *            the plate shows. Two or three words; it is set in caps, so
 *            write it in sentence case.
 *   caption  one line describing the slide. NOT drawn: the plate under the
 *            picture is deliberately empty, and this is what the slide
 *            announces to a screen reader instead of its bare position in
 *            the set. Keep it written as a sentence for that reason.
 *   href     where a click goes. Without one, a click on a thumbnail simply
 *            brings it round to the centre, which is what all nine do today.
 *
 * These nine are photographs of the team and its events. Order runs left to
 * right around the loop. Keep the count odd so one slide sits dead centre;
 * nine is the practical minimum — five are visible on a wide screen and the
 * loop needs the spare pair off-stage to carry a slide from one end round to
 * the other unseen.
 */
export const CAROUSEL_CARDS = [
  {
    id: 'card-1',
    src: '/carousel/01.jpg',
    alt: 'A Sirah Digital engineer reviewing work at a colleague’s desk',
    eyebrow: 'In the studio',
    caption: 'Reviewing a build at a colleague’s desk.',
    href: '',
  },
  {
    id: 'card-2',
    src: '/carousel/02.jpg',
    alt: 'Members of the Sirah Digital team receiving an award',
    eyebrow: 'Recognition',
    caption: 'The team collecting an award.',
    href: '',
  },
  {
    id: 'card-3',
    src: '/carousel/03.jpg',
    alt: 'The team in a boardroom session around a shared screen',
    eyebrow: 'In session',
    caption: 'A boardroom review around one shared screen.',
    href: '',
  },
  {
    id: 'card-4',
    src: '/carousel/04.jpg',
    alt: 'Three of the Sirah Digital team together at the office',
    eyebrow: 'The team',
    caption: 'Three of the team at the office.',
    href: '',
  },
  {
    id: 'card-5',
    src: '/carousel/05.jpg',
    alt: 'The Sirah Digital team gathered in front of a company mission wall',
    eyebrow: 'Our mission',
    caption: 'The team in front of the company mission wall.',
    href: '',
  },
  {
    id: 'card-6',
    src: '/carousel/06.jpg',
    alt: 'Four of the team at an industry event',
    eyebrow: 'Out and about',
    caption: 'Four of the team at an industry event.',
    href: '',
  },
  {
    id: 'card-7',
    src: '/carousel/07.jpg',
    alt: 'Two of the team on stage at the TN Startup Summit',
    eyebrow: 'On stage',
    caption: 'Two of the team at the TN Startup Summit.',
    href: '',
  },
  {
    id: 'card-8',
    src: '/carousel/08.jpg',
    alt: 'A Sirah Digital speaker addressing an audience with a microphone',
    eyebrow: 'Speaking',
    caption: 'A speaker from the team taking the room.',
    href: '',
  },
  {
    id: 'card-9',
    src: '/carousel/09.jpg',
    alt: 'Presenting an automation project to a seated audience',
    eyebrow: 'Show and tell',
    caption: 'Presenting an automation project to a seated audience.',
    href: '',
  },
];
