# Fonts

Two self-hosted variable webfonts, both from
[Fontshare](https://www.fontshare.com).

| File | Axis | Role |
|---|---|---|
| `satoshi.woff2` | wght 300–900 | everything — headings, paragraphs, labels, buttons |
| `zodiak.woff2` | wght 100–900 | every digit, inside Satoshi |

~80 KB for the pair, and lighter than the single Inter Tight pairing the site
shipped with before.

## One face, two variables

`--font-sans` and `--font-display` both resolve to Satoshi. Headings are
separated from body text by weight, size and tracking rather than by a second
typeface.

The two variables are kept apart on purpose. Nine stylesheets ask for
`var(--font-display)` by name and several others opt *out* of it deliberately
(see `.work-group__label` in `globals.css`); those are statements about a
role, not about a filename. Pointing both at one face is a design decision
reversible in a single line — deleting the distinction would not be.

Satoshi's axis runs to **900**, so headings can take a real 800 or 900 cut.
The previous heading face stopped at 700 and synthesised anything above it.

## The heading face has changed three times

Boska (Fontshare serif) → Clash Display (geometric sans) → Cormorant Garamond
(Google serif) → Satoshi. Every earlier file has been deleted; all of them are
recoverable from git history if a hop needs revisiting.

### Why Satoshi needs no `size-adjust`

Cormorant carried `size-adjust: 110%`, and it was a layout constant as much as
a type one. Cormorant is drawn with a small x-height — 0.386em — so at a given
`font-size` it looked about a quarter smaller than the Clash Display every
heading clamp on this site had been tuned against. 110% was cap-height parity
with Clash (0.688em against 0.670em), chosen so advance widths landed within a
few percent of where Clash had them and nothing fitted to a container moved.

Satoshi needs no equivalent: its x-height is 0.500em against Clash's 0.504em,
so it lands where those clamps already expect. If a future face does need a
correction, the three places to re-check are the ones that measure strings
against containers:

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
