// EXPERIMENTAL: AI Console Hero — the artwork on the floating panels.
// Safe to remove with the rest of the experiment; see HeroAIConsole.jsx.

/**
 * Every panel in the hero is a 2D canvas painted here and used as a texture on
 * a plane in the scene. That is the whole reason the panels can carry *real*
 * dashboard content — product names, figures, charts, progress bars — at a size
 * where it is legible.
 *
 * The alternatives were both worse. Geometry-and-Text3D means a font loader, a
 * draw call per label and no charts. HTML through drei's <Html> means DOM
 * elements that only fake their depth: they cannot be occluded by the robot,
 * they do not take the scene's perspective, and they defeat the point of the
 * composition being one 3D object rather than cards floating over a canvas.
 *
 * Everything here is drawn in *logical* units. The scene multiplies by SCALE
 * for the actual bitmap, so panel geometry and layout numbers stay readable and
 * the crispness is one constant.
 *
 * Nothing in this file touches three or React. It takes a 2D context and paints.
 */

// Bitmap pixels per logical unit. 2 puts a 320-unit-wide panel on a 640px
// texture, which at the size these render on screen is comfortably past the
// point where more resolution stops being visible.
export const SCALE = 2;

/* -------------------------------------------------------------------------
   Type
   ---------------------------------------------------------------------- */

const FALLBACK_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
let resolvedFont = null;

/**
 * The site's face is loaded by next/font, which mints a generated family name
 * and puts it on <html> through Tailwind's preflight. Canvas cannot read a CSS
 * variable, so the family is read back off the document instead — that way the
 * panels are set in Inter Tight like everything around them rather than in
 * whatever the browser calls sans-serif.
 *
 * The probe is not paranoia. Assigning an unparseable font string to a context
 * is a silent no-op, and the failure mode is every label rendering at 10px in
 * the default face — which looks like a layout bug rather than a font bug.
 */
function font() {
  if (resolvedFont) return resolvedFont;
  resolvedFont = FALLBACK_FONT;

  if (typeof document !== 'undefined') {
    const declared = getComputedStyle(document.documentElement).fontFamily;
    if (declared) {
      const probe = document.createElement('canvas').getContext('2d');
      probe.font = `600 20px ${declared}`;
      if (probe.font.indexOf('20px') !== -1) resolvedFont = declared;
    }
  }

  return resolvedFont;
}

// next/font swaps the real face in asynchronously, so the first paint can land
// on the fallback. The scene repaints once document.fonts settles and calls
// this first, so the cached stack is re-probed against the loaded face.
export function forgetFont() {
  resolvedFont = null;
}

function setFont(ctx, weight, size) {
  ctx.font = `${weight} ${size}px ${font()}`;
}

function text(ctx, str, x, y, { size = 11, weight = 500, fill = '#FFFFFF', align = 'left' } = {}) {
  setFont(ctx, weight, size);
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

/**
 * Uppercase eyebrows are set with letter-spacing, which canvas only gained
 * recently and only in some engines. Drawn a glyph at a time instead, which
 * works everywhere and costs nothing at these string lengths.
 */
function tracked(ctx, str, x, y, { size = 8, weight = 700, fill = '#8E9BC4', track = 1.4 } = {}) {
  setFont(ctx, weight, size);
  ctx.fillStyle = fill;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  let cx = x;
  for (let i = 0; i < str.length; i++) {
    ctx.fillText(str[i], cx, y);
    cx += ctx.measureText(str[i]).width + track;
  }
  return cx - track - x;
}

/* -------------------------------------------------------------------------
   Palette
   ---------------------------------------------------------------------- */

// The brand tokens, plus the two greens a dashboard needs to say "up" and
// "healthy". Kept as strings because everything here is a canvas fill.
const INK = '#FFFFFF';
const MUTED = '#94A0C6';
const FAINT = 'rgba(148,163,214,0.16)';
const INDIGO = '#6366F1';
const PURPLE = '#A855F7';
const CYAN = '#22D3EE';
const MINT = '#34D399';

/* -------------------------------------------------------------------------
   Primitives
   ---------------------------------------------------------------------- */

function rr(ctx, x, y, w, h, r) {
  const k = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
}

function fillRR(ctx, x, y, w, h, r, fill) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function vGradient(ctx, y0, y1, from, to) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

/**
 * The glass plate every panel is drawn on: a cool dark body, a sheen down the
 * top half, and a hairline border.
 *
 * Dark rather than the white of the reference, and deliberately. Five white
 * cards on a #16142C hero is five holes punched in the page — they would read
 * louder than the headline beside them, which is the one thing the hero cannot
 * afford. Frosted navy keeps the same glass-panel construction and lets the
 * charts inside be the bright things.
 */
// Radius 20 rather than 14, and not for looks. A card that flies out of the
// ring hands over to an HTML card at the end of its flight, and that card is a
// rounded-[28px] plate — at this panel's on-screen size, 20 logical units is
// the same 28 physical pixels. Corners that change radius mid-handover are the
// one part of the swap the eye reliably catches.
const PLATE_R = 20;

function plate(ctx, w, h) {
  const body = ctx.createLinearGradient(0, 0, w * 0.55, h);
  body.addColorStop(0, 'rgba(38,41,84,0.93)');
  body.addColorStop(1, 'rgba(19,20,46,0.95)');
  fillRR(ctx, 1, 1, w - 2, h - 2, PLATE_R, body);

  rr(ctx, 1, 1, w - 2, h * 0.55, PLATE_R);
  ctx.fillStyle = vGradient(ctx, 0, h * 0.55, 'rgba(255,255,255,0.09)', 'rgba(255,255,255,0)');
  ctx.fill();

  rr(ctx, 1.25, 1.25, w - 2.5, h - 2.5, PLATE_R);
  ctx.strokeStyle = 'rgba(168,182,235,0.30)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/**
 * The plate on its own, with nothing on it.
 *
 * This is the piece that makes the handover to the DOM invisible. A card flying
 * out of the ring carries a dashboard; the HTML card that replaces it carries a
 * name and a paragraph. Crossfading one into the other is a chart
 * double-exposed over a headline, however briefly — and a complementary fade
 * does not help, because the problem is not brightness, it is that they are two
 * different pictures.
 *
 * So the dashboard dissolves off the plate on the way in, and the plate — which
 * both representations have in common — is what the DOM card actually lands on.
 * The only thing that changes at the swap is that text appears.
 */
export function drawPlate(ctx, w, h) {
  plate(ctx, w, h);
}

// Product name on the left, a small state pill on the right. Every panel opens
// the same way, which is what makes five different charts read as one system.
function header(ctx, w, title, pill, pillColor = CYAN) {
  tracked(ctx, title.toUpperCase(), 16, 25, { size: 9.5, weight: 700, fill: '#B3BEE2', track: 1.6 });

  if (!pill) return;
  setFont(ctx, 600, 8);
  const pw = ctx.measureText(pill).width + 14;
  fillRR(ctx, w - 16 - pw, 14, pw, 14, 7, 'rgba(255,255,255,0.07)');
  rr(ctx, w - 16 - pw, 14, pw, 14, 7);
  ctx.strokeStyle = 'rgba(168,182,235,0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();
  text(ctx, pill, w - 16 - pw / 2, 24.5, { size: 8, weight: 600, fill: pillColor, align: 'center' });
}

/* -------------------------------------------------------------------------
   Glyphs
   ---------------------------------------------------------------------- */

// Small line drawings, all on a 1-unit box centred at (cx, cy) and scaled by s,
// so they can be dropped into a flow node or an icon chip at any size.



function glyphMail(ctx, cx, cy, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.1;
  ctx.lineJoin = 'round';
  rr(ctx, cx - 0.45 * s, cy - 0.32 * s, 0.9 * s, 0.64 * s, 0.1 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 0.45 * s, cy - 0.26 * s);
  ctx.lineTo(cx, cy + 0.08 * s);
  ctx.lineTo(cx + 0.45 * s, cy - 0.26 * s);
  ctx.stroke();
}

function glyphNodes(ctx, cx, cy, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.09;
  ctx.beginPath();
  ctx.moveTo(cx - 0.3 * s, cy - 0.3 * s);
  ctx.lineTo(cx + 0.28 * s, cy);
  ctx.lineTo(cx - 0.3 * s, cy + 0.3 * s);
  ctx.stroke();
  [
    [-0.3, -0.3],
    [-0.3, 0.3],
    [0.3, 0],
  ].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(cx + dx * s, cy + dy * s, 0.13 * s, 0, Math.PI * 2);
    ctx.fill();
  });
}


function glyphTarget(ctx, cx, cy, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.09;
  [0.44, 0.26].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.arc(cx, cy, 0.1 * s, 0, Math.PI * 2);
  ctx.fill();
}

function glyphBars(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  [
    [-0.3, 0.34],
    [0, 0.58],
    [0.3, 0.82],
  ].forEach(([dx, hh]) => {
    fillRR(ctx, cx + dx * s - 0.09 * s, cy + 0.42 * s - hh * s, 0.18 * s, hh * s, 0.06 * s, color);
  });
}

function glyphPulse(ctx, cx, cy, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 0.44 * s, cy);
  ctx.lineTo(cx - 0.18 * s, cy);
  ctx.lineTo(cx - 0.06 * s, cy - 0.3 * s);
  ctx.lineTo(cx + 0.08 * s, cy + 0.24 * s);
  ctx.lineTo(cx + 0.2 * s, cy);
  ctx.lineTo(cx + 0.44 * s, cy);
  ctx.stroke();
}

/* -------------------------------------------------------------------------
   Chart parts
   ---------------------------------------------------------------------- */

/**
 * Area chart with a smoothed top edge. The smoothing is midpoint-quadratic
 * rather than a spline: with ten stations it is indistinguishable from one, and
 * it cannot overshoot below the baseline the way a Catmull-Rom through noisy
 * samples can.
 */
function areaChart(ctx, x, y, w, h, values, color) {
  const n = values.length;
  const px = (i) => x + (w * i) / (n - 1);
  const py = (v) => y + h - v * h;

  ctx.strokeStyle = FAINT;
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const gy = y + (h * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }

  const trace = () => {
    ctx.beginPath();
    ctx.moveTo(px(0), py(values[0]));
    for (let i = 1; i < n - 1; i++) {
      const mx = (px(i) + px(i + 1)) / 2;
      const my = (py(values[i]) + py(values[i + 1])) / 2;
      ctx.quadraticCurveTo(px(i), py(values[i]), mx, my);
    }
    ctx.lineTo(px(n - 1), py(values[n - 1]));
  };

  trace();
  ctx.lineTo(px(n - 1), y + h);
  ctx.lineTo(px(0), y + h);
  ctx.closePath();
  ctx.fillStyle = vGradient(ctx, y, y + h, 'rgba(99,102,241,0.42)', 'rgba(99,102,241,0)');
  ctx.fill();

  trace();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // The head of the trace, ringed so it reads as a live value rather than a
  // stray dot.
  const hx = px(n - 1);
  const hy = py(values[n - 1]);
  ctx.beginPath();
  ctx.arc(hx, hy, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(34,211,238,0.22)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hx, hy, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = INK;
  ctx.fill();
}

function meterRow(ctx, x, y, w, row) {
  const barY = y + 11;
  const barW = w - 46;

  fillRR(ctx, x, y - 6.5, 13, 13, 4, 'rgba(255,255,255,0.06)');
  row.glyph(ctx, x + 6.5, y, 11, row.color);

  text(ctx, row.label, x + 20, y - 0.5, { size: 10, weight: 600, fill: '#E2E8F8' });
  text(ctx, row.value, x + w, y - 0.5, { size: 10, weight: 700, fill: INK, align: 'right' });

  fillRR(ctx, x + 20, barY, barW, 4, 2, 'rgba(255,255,255,0.09)');
  const fill = ctx.createLinearGradient(x + 20, 0, x + 20 + barW * row.pct, 0);
  fill.addColorStop(0, row.color);
  fill.addColorStop(1, row.tail);
  fillRR(ctx, x + 20, barY, Math.max(4, barW * row.pct), 4, 2, fill);
}

function donut(ctx, cx, cy, r, slices) {
  ctx.lineWidth = r * 0.42;
  ctx.lineCap = 'butt';

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.stroke();

  // Start at twelve o'clock and leave a small gap between slices so they read
  // as separate segments without a stroke around each.
  let a = -Math.PI / 2;
  slices.forEach((s) => {
    const sweep = s.pct * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, a + 0.045, a + sweep - 0.045);
    ctx.strokeStyle = s.color;
    ctx.stroke();
    a += sweep;
  });
}

/* -------------------------------------------------------------------------
   The panels
   ---------------------------------------------------------------------- */

/**
 * One entry per panel: logical size and a painter. The scene reads `w`/`h` for
 * both the texture size and the plane's aspect, so a panel's proportions are
 * set here and nowhere else.
 *
 * The five are the three shipped products — Aura Transcriber, Analytics Agents,
 * NUSI — plus the two panels that say what the company does with them: the
 * automation pipeline and the console the whole thing runs on.
 */
export const PANEL_ART = {
  /* Headline figure, delta, trend. */
  auraTranscriber: {
    w: 320,
    h: 200,
    draw(ctx, w, h) {
      plate(ctx, w, h);
      header(ctx, w, 'Aura Transcriber', 'Live', MINT);

      text(ctx, '12,480', 16, 62, { size: 30, weight: 700, fill: INK });
      text(ctx, 'Minutes transcribed', 16, 79, { size: 10, weight: 500, fill: MUTED });

      setFont(ctx, 700, 9);
      const dw = ctx.measureText('+23.8%').width + 14;
      fillRR(ctx, w - 16 - dw, 46, dw, 17, 8.5, 'rgba(52,211,153,0.14)');
      text(ctx, '+23.8%', w - 16 - dw / 2, 58, { size: 9, weight: 700, fill: MINT, align: 'center' });

      areaChart(ctx, 16, 96, w - 32, 74, [0.28, 0.36, 0.3, 0.48, 0.42, 0.6, 0.55, 0.74, 0.68, 0.92], CYAN);

      text(ctx, 'Mon', 16, 190, { size: 7.5, weight: 500, fill: 'rgba(148,160,198,0.7)' });
      text(ctx, 'Sun', w - 16, 190, { size: 7.5, weight: 500, fill: 'rgba(148,160,198,0.7)', align: 'right' });
    },
  },

  /* Four agents, four meters. */
  analyticsAgents: {
    w: 320,
    h: 200,
    draw(ctx, w, h) {
      plate(ctx, w, h);
      header(ctx, w, 'Analytics Agents', '4 active', MINT);

      text(ctx, '68.3%', w - 16, 62, { size: 26, weight: 700, fill: INK, align: 'right' });
      text(ctx, 'Avg. coverage', w - 16, 77, { size: 9.5, weight: 500, fill: MUTED, align: 'right' });

      const rows = [
        { label: 'Revenue', value: '68.3%', pct: 0.683, color: INDIGO, tail: '#818CF8', glyph: glyphBars },
        { label: 'Operations', value: '42.1%', pct: 0.421, color: PURPLE, tail: '#C084FC', glyph: glyphNodes },
        { label: 'Support', value: '75.8%', pct: 0.758, color: CYAN, tail: '#67E8F9', glyph: glyphPulse },
        { label: 'Web', value: '32.6%', pct: 0.326, color: MINT, tail: '#6EE7B7', glyph: glyphTarget },
      ];

      rows.forEach((row, i) => meterRow(ctx, 16, 100 + i * 26, w - 32, row));
    },
  },

  /* Donut and legend. */
  nusi: {
    w: 320,
    h: 200,
    draw(ctx, w, h) {
      plate(ctx, w, h);
      header(ctx, w, 'NUSI', 'This month');

      const cx = 82;
      const cy = 120;
      const r = 42;

      const slices = [
        { label: 'Active plans', value: '62%', pct: 0.62, color: INDIGO },
        { label: 'In review', value: '24%', pct: 0.24, color: PURPLE },
        { label: 'New intake', value: '14%', pct: 0.14, color: CYAN },
      ];

      donut(ctx, cx, cy, r, slices);
      text(ctx, '62%', cx, cy + 4, { size: 20, weight: 700, fill: INK, align: 'center' });
      text(ctx, 'Adherence', cx, cy + 18, { size: 8.5, weight: 500, fill: MUTED, align: 'center' });

      slices.forEach((s, i) => {
        const y = 96 + i * 24;
        fillRR(ctx, 150, y - 7, 8, 8, 2.5, s.color);
        text(ctx, s.label, 164, y, { size: 10, weight: 600, fill: '#E2E8F8' });
        text(ctx, s.value, w - 16, y, { size: 10, weight: 700, fill: INK, align: 'right' });
      });

      text(ctx, '1,940 patients tracked', 150, 176, { size: 9, weight: 500, fill: MUTED });
    },
  },

  /* The wide one, tilted in front of the base. Bars plus the four counters. */
  console: {
    w: 420,
    h: 210,
    draw(ctx, w, h) {
      plate(ctx, w, h);
      header(ctx, w, 'Sirah Automation Cloud', 'Last 30 days');

      const bars = [0.34, 0.46, 0.4, 0.58, 0.52, 0.68, 0.61, 0.79, 0.7, 0.88, 0.8, 0.96];
      const x0 = 18;
      const chartW = w - 36;
      const chartH = 84;
      const chartY = 44;
      const slot = chartW / bars.length;
      const bw = slot * 0.52;

      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const gy = chartY + (chartH * i) / 4;
        ctx.beginPath();
        ctx.moveTo(x0, gy);
        ctx.lineTo(x0 + chartW, gy);
        ctx.stroke();
      }

      bars.forEach((v, i) => {
        const bh = Math.max(5, v * chartH);
        const bx = x0 + i * slot + (slot - bw) / 2;
        const by = chartY + chartH - bh;
        const g = vGradient(ctx, by, chartY + chartH, i === bars.length - 1 ? '#67E8F9' : '#818CF8', 'rgba(99,102,241,0.18)');
        fillRR(ctx, bx, by, bw, bh, bw * 0.34, g);
      });

      const stats = [
        { label: 'Runs', value: '124K' },
        { label: 'Processed', value: '68K' },
        { label: 'Actions', value: '32K' },
        { label: 'Resolved', value: '12K' },
      ];

      const pad = 8;
      const cw = (chartW - pad * (stats.length - 1)) / stats.length;
      stats.forEach((s, i) => {
        const x = x0 + i * (cw + pad);
        fillRR(ctx, x, 146, cw, 46, 10, 'rgba(255,255,255,0.055)');
        rr(ctx, x, 146, cw, 46, 10);
        ctx.strokeStyle = 'rgba(168,182,235,0.18)';
        ctx.lineWidth = 1;
        ctx.stroke();
        text(ctx, s.label, x + cw / 2, 163, { size: 9, weight: 600, fill: MUTED, align: 'center' });
        text(ctx, s.value, x + cw / 2, 183, { size: 17, weight: 700, fill: INK, align: 'center' });
      });
    },
  },
};

/* -------------------------------------------------------------------------
   Chip icons
   ---------------------------------------------------------------------- */

/**
 * The small objects orbiting the base. Each is a glyph on a transparent square,
 * drawn bright because it is used as both the colour and the emissive map — so
 * the glyph lights itself and the rest of the chip stays lit by the scene.
 */
export const CHIP_ART = {
  w: 64,
  h: 64,
  icons: {
    mail: (ctx) => glyphMail(ctx, 32, 32, 44, '#8BE8FF'),
    target: (ctx) => glyphTarget(ctx, 32, 32, 44, '#C4B5FD'),
    bars: (ctx) => glyphBars(ctx, 32, 30, 40, '#A5B4FC'),
    pulse: (ctx) => glyphPulse(ctx, 32, 32, 46, '#7DD3FC'),
  },
};

/**
 * The robot's chest badge. Its own painter rather than a chip, because it is
 * the one place in the scene the company's initials appear and it wants the
 * plate behind it.
 */
export function drawChestBadge(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#2E7BE8');
  g.addColorStop(1, '#1D4FD8');
  fillRR(ctx, 0, 0, w, h, h * 0.28, g);

  rr(ctx, h * 0.06, h * 0.06, w - h * 0.12, h * 0.5, h * 0.22);
  ctx.fillStyle = vGradient(ctx, 0, h * 0.56, 'rgba(255,255,255,0.30)', 'rgba(255,255,255,0)');
  ctx.fill();

  text(ctx, 'AI', w / 2, h * 0.72, { size: h * 0.56, weight: 700, fill: '#EAF7FF', align: 'center' });
}

/**
 * One eye: a cyan squircle with a glint in the upper left.
 *
 * Painted rather than lit, and that is the whole point. The first pass built
 * the eyes as geometry with an emissive material, and an emissive bright enough
 * to read as "lit from within" clips every channel on the way through ACES — so
 * both eyes came out flat white and the robot lost the one feature that gives
 * it an expression. A texture on an unlit plane puts the exact cyan on screen,
 * gradient and glint included, at whatever brightness was drawn.
 */
export function drawEye(ctx, w, h) {
  const r = (w - 4) * 0.36;

  const g = ctx.createLinearGradient(0, 0, w * 0.35, h);
  g.addColorStop(0, '#CFF8FF');
  g.addColorStop(0.42, '#4FDDF7');
  g.addColorStop(1, '#0FA3DA');
  fillRR(ctx, 2, 2, w - 4, h - 4, r, g);

  ctx.save();
  rr(ctx, 2, 2, w - 4, h - 4, r);
  ctx.clip();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(w * 0.33, h * 0.25, w * 0.17, h * 0.115, -0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * A soft radial falloff, white on transparent. One texture, used additively for
 * the eye halos, the antenna tip and the light spill on the floor — three
 * things that are all "a light source seen through air".
 */
export function drawGlow(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.22, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.14)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}
