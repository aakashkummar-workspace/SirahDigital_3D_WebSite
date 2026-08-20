# Fonts

Three self-hosted variable webfonts. Satoshi and Zodiak come from
[Fontshare](https://www.fontshare.com); Cormorant Garamond comes from
[Google Fonts](https://fonts.google.com/specimen/Cormorant+Garamond).

| File | Axis | Role |
|---|---|---|
| `cormorant-garamond.woff2` | wght 300–700 | every heading (`h1`, `h2`, `h3`) |
| `satoshi.woff2` | wght 300–900 | every paragraph, label, button, description |
| `zodiak.woff2` | wght 100–900 | every digit, inside both of the above |

118 KB for all three — lighter than the single Inter Tight pairing the site
shipped with before.

Cormorant's axis tops out at **700**, not 900 — a heading asking for
`font-weight: 800` gets a synthesised bold rather than a real cut, so keep
headings at 700 or below.

## The heading face has changed twice

Boska (Fontshare serif) → Clash Display (geometric sans) → Cormorant Garamond.
Both earlier files have been deleted. Only the last hop matters for anything
you might be reading this to do, and it carries one thing the others did not:

### `size-adjust: 110%`

Cormorant is drawn with a small x-height by design — 0.386em, against 0.500em
for Satoshi. Dropped in at the same `font-size` it looks about a quarter
smaller than the face it replaced, and every heading clamp on the site was
tuned against the taller ones.

110% is **cap-height parity**, not x-height parity:

| | Cormorant @110% | Clash Display |
|---|---|---|
| cap-height | 0.688em | 0.670em |
| x-height | 0.425em | 0.504em |

x-height parity would need 130%, which blows the caps to 0.81em. Matching caps
keeps a heading's silhouette where it was and leaves the small x-height alone —
that is the face's character, not a defect.

**It is a layout constant as much as a type one.** `size-adjust` scales advance
widths too. 110% was picked partly because it lands every measured string
within a few percent of where Clash Display had it, so nothing fitted to a
container had to move. If you change it, re-check:

- the uppercase category on the products cylinder (`portfolio-cylinder.module.css`)
- the hub row's product names (`home-products.module.css`)
- the `ABOUT` wordmark (`about-statement.module.css` — it carries the arithmetic)

## Licence

**Free for personal and commercial use.** No purchase, no separate webfont
tier, no attribution. Self-hosting them exactly like this is what the licence
covers.

## How the numerals work

Zodiak is declared with `unicode-range: U+0030-0039` and sits *first* in
both font stacks:

```css
--font-sans:    'Zodiak Numerals', 'Satoshi', system-ui, sans-serif;
--font-display: 'Zodiak Numerals', 'Cormorant Garamond', Georgia, serif;
```

Because the range covers only the digits, the browser pulls `0`–`9` from
Zodiak and falls through to Satoshi or Cormorant Garamond for every letter. One
declaration changes every number on the site — the `01/02/03` on `/products`,
the client-systems numbering, the ROI figures, the metrics, the footer phone
number — with no per-element classes and nothing for a future numeral to miss.

The range is digits only on purpose. Adding `,` or `.` would pull those out of
Zodiak in running prose too, where they would not match the text around them.

**Melodrama was the first pick and was rejected.** It is curvier, but its zero
is slashed by design and it ships no unslashed alternate — `ss01` and `salt`
make no digit substitution, and `aalt` offers only oldstyle/superior/inferior
cuts of the same slashed glyph. `40%` came out as `4Ø%` and `10,000+` as
`1Ø,ØØØ+`.

**To swap the numeral face:** replace `zodiak.woff2`, update the
`font-weight` range on that one `@font-face` to the new file's real axis, and
change nothing else. `gambetta`, `sentient`, `erode` and `quilon` were the
other candidates — all have conventional zeros.

## If you re-download any of these

**Take the LAST `@font-face` in Fontshare's CSS, not the first.**

### From Fontshare (Satoshi, Zodiak)

```
https://api.fontshare.com/v2/css?f[]=satoshi@variable
```

That returns many blocks: several static weights, then a variable **roman**,
and — for the faces that have one — a variable **italic** after it. Both wrong
picks fail silently:

- take the **first** → a static Light cut, and everything renders thin
- take the **last** → the italic cut, and the whole site renders slanted

Both of those shipped here before being caught. Some faces have no italic at
all, which makes their roman the last block — do not generalise from that.
Pick the block with **both** a `font-weight` range **and** `font-style:
normal`.

### From Google Fonts (Cormorant Garamond)

```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300..700&display=swap
```

Send a modern browser User-Agent or you get `.ttf` instead of `.woff2`. The
trap here is a different one: Google returns one block **per subset** —
cyrillic, cyrillic-ext, vietnamese, latin-ext, latin — each a different file
behind the same family name. Take the one whose `unicode-range` starts
`U+0000-00FF`. Any other and the file has no Latin letters in it and every
heading silently renders in the fallback.

Only the `latin` subset is vendored. It covers ASCII, the Western European
accents, the typographic quotes and dashes, and the currency symbols the site
uses. Eastern European text would fall through to Georgia.

### Verify, either way

```
pip install fonttools brotli
python -c "
from fontTools.ttLib import TTFont
f=TTFont('public/fonts/cormorant-garamond.woff2')
print('variable:', 'fvar' in f)
print('style:', [r.toUnicode() for r in f['name'].names if r.nameID==2])
"
```

`variable: True` and a style that does not say Italic. The weight ranges in
the table above are the real `fvar` axes read off these files.

## Preloading

`src/app/layout.js` emits a `<link rel="preload">` for each of the three.
These are not loaded through `next/font`, so nothing else discovers them until
the CSS has been parsed and matched — three round-trips into the load. The
`crossOrigin="anonymous"` on those tags is required even though the files are
same-origin: font fetches are CORS-mode by spec, and a preload whose mode does
not match the real fetch is thrown away and fetched again.
