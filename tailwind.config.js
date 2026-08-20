const defaultTheme = require('tailwindcss/defaultTheme');

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
        // Brand identity — exact values, do not drift.
        // Three of these already match Tailwind defaults at the same hex
        // (indigo-500, purple-500, cyan-400, slate-300), so either the token
        // or the default utility is correct.
        space: {
          DEFAULT: '#16142C',   // Primary Background — Deep Space
          deep: '#100E20',      // one step down, for the footer plate
          raised: '#1D1A38',    // one step up, for lifted surfaces
        },
        brand: {
          indigo: '#6366F1',    // Primary Accent
          purple: '#A855F7',    // Secondary Accent
          cyan: '#22D3EE',      // Highlight — decorative only, see below
          text: '#FFFFFF',      // Text
          muted: '#CBD5E1',     // Secondary Text

          // The CTA pair. Every primary button and every accent sitting next
          // to one is drawn from these two, and from nothing else.
          //
          // They are not `indigo` and `purple` renamed: those are #6366F1 and
          // #A855F7, and the identity the hero particle field and the logo
          // are actually built on is #3B82F6 into #8B5CF6. Pointing the
          // buttons at the older tokens would have restated the same
          // mismatch the cyan had.
          //
          // brand-cyan stays declared because a good deal of the site's
          // *decoration* is still legitimately cyan — the WebGL field, the
          // SVG scenes, the timeline rails, the industry accents. It is no
          // longer used on anything a visitor can press.
          blue: '#3B82F6',      // CTA gradient, start
          violet: '#8B5CF6',    // CTA gradient, end
          'blue-deep': '#2563EB',   // CTA gradient, start — hover/pressed
          'violet-deep': '#7C3AED', // CTA gradient, end   — hover/pressed
        },
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
      transitionTimingFunction: {
        brand: 'cubic-bezier(.22,.61,.36,1)',
      },
    },
  },
  plugins: [],
};
