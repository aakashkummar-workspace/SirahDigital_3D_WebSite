/**
 * ── cover ────────────────────────────────────────────────────────────────
 * Every card is designed around a landscape cover photograph; `cover` is the
 * path to it under /public. The covers are 16:10 or wider and the card's frame
 * is 16:10, so `object-cover` trims the sides of anything wider rather than
 * letterboxing it. When `cover` is null the card falls back to a neutral
 * placeholder plate of the same shape — still the case for the success
 * stories, whose stills have not been cut yet.
 *
 * `coverAlt` describes the still for screen readers. The card's own text is
 * the title, so the alt text says what is *in the frame* rather than repeating
 * it.
 *
 * The row is exactly as long as there are films. There is no padding entry:
 * the carousel closes with an "Explore More" tile that opens the channel, so
 * the real covers read as a complete row rather than a truncated one.
 *
 * `youtubeUrl` is per-entry. It used to be the channel on every row, which is
 * why it reads like a constant; the first entry now points at one video on a
 * channel that is not ours, so it is genuinely per-entry and should not be
 * collapsed back into CHANNEL_URL.
 *
 * `category`, `description`, `duration` and `date` are no longer rendered —
 * the section shows the cover plus a title. The titles are now full sentences
 * rather than headlines, and MediaCard clamps them at two lines, so anything
 * much longer than these will be cut mid-sentence. They are kept here rather than
 * deleted so the copy is not lost if a future layout wants it back.
 *
 * A SUCCESS_STORIES array used to sit below this one, feeding a second
 * carousel of two placeholder testimonials. It was removed along with that
 * row; the About page now closes on this section and the CTA band.
 */
export const LATEST_INSIGHTS = [
  {
    /*
     * An interview on the TNPSC Mentors channel, not a film from our own.
     * Every other entry points at youtube.com/@SirahDigital; this one points
     * at a single video on someone else's channel, which is why the title
     * carries the subject rather than the branding — the card shows nothing
     * but the cover and one line.
     *
     * The cover is NOT that video's own thumbnail. That thumbnail is a
     * political montage — party leaders, "821 VACANCIES", TNPSC in red — and
     * dropping it into this row put an election graphic at the top of the
     * page. This is a frame from inside the interview instead, which is what
     * the row is actually about.
     *
     * It comes from YouTube's auto-generated stills, so it is 640x360 after
     * the letterbox bars were cropped off — well under the ~1240px this card
     * can render at on a 2x display, and it will look soft. Replacing it with
     * a full-resolution still is a drop-in: same filename, no code change.
     */
    id: 'insight-tnpsc-mentors',
    cover: '/insights/sirah-interview-tnpsc-mentors.jpg',
    coverAlt: 'Two men seated in conversation on an interview set',
    category: 'Interview',
    title: 'From Group 1 to Group 2A, explore how TNPSC recruitment patterns are evolving and what candidates should watch closely.',
    description: null,
    // Not rendered, and not known — oEmbed does not return a runtime and
    // guessing one would put a false number on the page the moment a future
    // layout starts showing this field again.
    duration: null,
    date: 'Aug 2026',
    // The one entry with a per-video URL. The card already renders this as an
    // external link with target="_blank" and rel="noopener noreferrer", so
    // nothing in MediaCard needed changing.
    youtubeUrl: 'https://youtu.be/8MPlo2dvJwM?si=xHi6X06EqQEoQnHM',
    theme: 'interview',
  },
  {
    id: 'insight-1',
    cover: '/insights/ai-agents-enterprise-workflows.png',
    coverAlt: 'Two Sirah Digital engineers talking to camera in the studio',
    category: 'AI Architecture',
    title: 'An honest discussion on AI, automation, business growth, and the opportunities emerging in an AI-first world.',
    description: 'A deep dive into how multi-agent frameworks process unstructured documents, execute API calls, and self-correct errors in real time.',
    duration: '14:20',
    date: 'Oct 2024',
    youtubeUrl: 'https://www.youtube.com/@SirahDigital',
    theme: 'network',
  },
  {
    id: 'insight-2',
    cover: '/insights/ocr-document-processing.png',
    coverAlt: 'Three members of the Sirah Digital team mid-conversation on the studio set',
    category: 'Document Intelligence',
    title: 'From AI Tools to AI Businesses: Agents, Automation, Startups, Software & Real-World Impact.',
    description: 'How LLM-assisted vision models parse invoices, contracts, and hand-written receipts with 99.4% accuracy across varied formats.',
    duration: '18:45',
    date: 'Nov 2024',
    youtubeUrl: 'https://www.youtube.com/@SirahDigital',
    theme: 'ocr',
  },
  {
    id: 'insight-3',
    cover: '/insights/voice-chatbots-crm.png',
    coverAlt: 'The Sirah Digital team together at the office',
    category: 'Conversational AI',
    title: 'Meet the Brains of Sirah Digital',
    description: 'Transforming customer support latency from 4 hours to instantaneous answers using retrieval-augmented generation (RAG).',
    duration: '11:10',
    date: 'Dec 2024',
    youtubeUrl: 'https://www.youtube.com/@SirahDigital',
    theme: 'crm',
  },
];

// The row ends on this. One channel, one destination — the tile is not a
// film, so it carries no cover and no title of its own.
export const CHANNEL_URL = 'https://www.youtube.com/@SirahDigital';
