const defaultTheme = require('tailwindcss/defaultTheme');

/*
 * Every colour token below resolves to a CSS custom property holding three
 * space-separated RGB channels, wrapped so Tailwind's `<alpha-value>`
 * placeholder still works. That is what lets `bg-space`, `bg-space/80` and
 * `border-ink/10` all keep meaning what they meant while the *values* swap
 * under `[data-theme]` — see the two palette blocks in app/globals.css.
 *
 * Channels rather than hex is not a style choice: `rgb(#16142C / 0.8)` is not
 * valid CSS, so a hex-valued variable silently kills every `/opacity`
 * modifier on the site. There are ~120 of them.
 */
const c = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Data files carry accent class names for the methodology milestones.
    // Without this glob those utilities are purged from the stylesheet.
    "./src/data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  /*
   * The site drives its palette from `data-theme`, so `dark:` is wired to the
   * same attribute rather than to Tailwind's default `.dark` class. Almost
   * nothing needs it — a token that already swaps by itself is the better
   * tool — but a handful of cases genuinely differ in *kind* between themes
   * rather than in value (a glow that becomes a tint, a filter that inverts),
   * and those are what this is for.
   */
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        // --font-sans is Satoshi (digits from Melodrama), declared as
        // @font-face in globals.css.
        // Preflight puts theme('fontFamily.sans') on <html>, so overriding it
        // here is what carries the face to the whole site rather than only to
        // the elements that happen to spell out `font-sans`. The system stack
        // stays behind it as the fallback during swap.
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        // Boska, via --font-display. globals.css already applies it to
        // h1/h2/h3 directly, so this utility is only for the exceptions.
        // The `voga` entry that sat here is gone with the face it named.
        display: ['var(--font-display)', ...defaultTheme.fontFamily.serif],
      },
      colors: {
        /*
         * Ground and the two surfaces that sit either side of it.
         *
         * The names are historical — this was a single dark theme and `space`
         * meant Deep Space. They now read as roles: `space` is the page,
         * `deep` is one step away from the reader, `raised` is one step
         * toward them. In light that ordering inverts in luminance but not in
         * meaning, which is why the tokens did not have to be renamed.
         *
         *            dark        light
         *   space    #16142C     #FFFFFF
         *   deep     #100E20     #F1F5F9
         *   raised   #1D1A38     #F8FAFC
         */
        space: {
          DEFAULT: c('--c-space'),
          deep: c('--c-space-deep'),
          raised: c('--c-space-raised'),
        },
        brand: {
          indigo: c('--c-indigo'),
          purple: c('--c-purple'),
          /*
           * Highlight. In dark this is the brand's cyan (#22D3EE); in light
           * it resolves to the primary blue instead, because cyan on white is
           * 1.7:1 — not a colour, a rumour. Decoration that wants a literal
           * cyan in both themes should reach for a hex, not this token.
           */
          cyan: c('--c-cyan'),
          text: c('--c-text'),     // primary       #FFFFFF / #0F172A
          muted: c('--c-muted'),   // secondary     #CBD5E1 / #475569
          subtle: c('--c-subtle'), // tertiary      #94A3B8 / #64748B
          // The CTA pair, and its hover/pressed step. Every primary button
          // and every accent sitting next to one is drawn from these four.
          blue: c('--c-blue'),
          violet: c('--c-violet'),
          'blue-deep': c('--c-blue-deep'),
          'violet-deep': c('--c-violet-deep'),
        },
        /*
         * The contrast channel — white on dark, near-black on light.
         *
         * This is the token that made a toggle tractable. The site's dominant
         * idiom was `text-white/70`, `bg-white/[0.04]`, `border-white/10`:
         * several hundred sites where "white" never meant white, it meant
         * "the colour that contrasts with the ground, held back to N%".
         * `ink` says that literally, so one variable flips all of them.
         *
         * `white` is still available and still means white — the logo
         * wordmark on the dark footer, a knockout label on a gradient
         * button. If a value must stay white in both themes, that is the
         * token to use.
         */
        ink: c('--c-ink'),
      },
      fontSize: {
        // Fluid type — clamp() so nothing needs a breakpoint to stay readable.
        'fluid-xs': 'clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)',
        'fluid-sm': 'clamp(0.875rem, 0.84rem + 0.2vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem)',
        'fluid-xl': 'clamp(1.375rem, 1.15rem + 1vw, 2rem)',
        'fluid-2xl': 'clamp(1.875rem, 1.35rem + 2.4vw, 3.25rem)',
        'fluid-3xl': 'clamp(2.25rem, 1.5rem + 3.6vw, 4.5rem)',
      },
      /*
       * Elevation is theme-dependent in kind, not just in value. On dark a
       * card lifts by getting lighter and casting almost nothing; on white it
       * lifts by casting a soft, wide, low-opacity shadow and casts no glow.
       * Both live behind these two names so components never encode either.
       */
      boxShadow: {
        card: 'var(--shadow-card)',
        lift: 'var(--shadow-lift)',
      },
      backgroundImage: {
        // The premium gradient: blue into purple at 135deg. One definition,
        // used by the primary button, the gradient rules and the headline
        // clip-text.
        'brand-gradient': 'linear-gradient(135deg, rgb(var(--c-blue)) 0%, rgb(var(--c-violet)) 100%)',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(.22,.61,.36,1)',
      },
    },
  },
  plugins: [],
};
