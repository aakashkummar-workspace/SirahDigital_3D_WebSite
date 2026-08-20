# Product screenshots

One folder per product, named after its slug in `src/data/products.js`.

```
public/products/
  aura-transcriber/
    01-dashboard.png
    02-live-call.png
    03-transcript-search.png
  analytics-agents/
    01-agent-overview.png
    02-insight-feed.png
    03-data-sources.png
  nusi/
    01-practice-dashboard.png
    02-client-record.png
    03-appointments.png
```

## How this works

`src/data/productDetails.js` names every file above. **None of them exist
yet** — that is the expected state, not a bug.

At build time `src/lib/productImages.js` checks each path against this folder.
A path with a file behind it renders through `next/image`; a path with no file
becomes `src: null` and the frame renders a captioned placeholder at exactly
the same size. Dropping a real file at the named path makes it appear with no
code change and no layout shift.

`npm run dev` prints how many are still missing:

```
[products] 9/9 screenshots not found under public/ — those frames render as captioned placeholders:
  /products/aura-transcriber/01-dashboard.png
  ...
```

That count going down is how you track this. If a file you just added is still
listed, the filename does not match — check it against `productDetails.js`.

## Taking the shots

- **Aspect ratio 16:10.** The frame crops to it, anchored to the top of the
  image, so a taller screenshot loses its footer rather than its header.
- **Roughly 2000px wide.** They render up to 1100px logical and want to hold
  up on a 2× display. Wider than ~2400px is wasted bytes.
- **PNG.** There is no image optimisation config in `next.config.js`, so these
  are served as-is — keep an eye on file size.
- **The caption in `productDetails.js` is the brief.** Each slot's caption says
  which screen it wants ("A call being transcribed live", "The appointment
  calendar"). Match the screen to the caption, or change the caption.
- **Scrub real customer data** before shipping any of these. Names, phone
  numbers, email addresses and clinical notes in a marketing screenshot are a
  privacy problem, not a realism win.

## Adding a fourth slot

Add an entry to that product's `screenshots` array in
`src/data/productDetails.js`. Nothing else needs to change — the tour renders
however many are there, alternating sides as it goes.
