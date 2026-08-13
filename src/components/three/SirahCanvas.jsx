"use client";
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { LOGO_OUTER, LOGO_HOLES, LOGO_PX } from './sirahLogoOutline';
import { buildRibbonGeometry, sampleRibbonSurface, solveRibbon } from './ribbonForm';

// The mark's outline is traced directly from logo.png rather than
// reconstructed by hand, so the 3D geometry is the real logo. See
// sirahLogoOutline.js for the generated point data.
function buildLogoShape() {
  const s = new THREE.Shape();

  LOGO_OUTER.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
  s.closePath();

  // Enclosed counters, if the mark has any, become holes in the extrusion
  s.holes = LOGO_HOLES.map((ring) => {
    const path = new THREE.Path();
    ring.forEach(([x, y], i) => (i === 0 ? path.moveTo(x, y) : path.lineTo(x, y)));
    path.closePath();
    return path;
  });

  return s;
}

// Fallback only. The real colours are sampled off logo.png at runtime — the
// artwork is not a two-stop ramp: it runs bright azure through the arrow head,
// royal blue across the top, magenta through the bottom-right bowl, and near
// black-navy out at the foot. This pair is just what gets used if the image
// cannot be loaded.
const LOGO_COLOR_FROM = '#1e3a8a';
const LOGO_COLOR_TO = '#7e22ce';

// Lower this to darken the whole mark without touching its hues.
const COLOR_GAIN = 1.0;

/* ------------------------------------------------------------------ */
/* Reading the real gradient out of the logo artwork                    */
/* ------------------------------------------------------------------ */

// Decodes /logo.png once and hands back its pixels.
// null = still loading, undefined = failed (caller falls back to the ramp).
function useLogoPixels() {
  const [pixels, setPixels] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        setPixels(ctx.getImageData(0, 0, c.width, c.height));
      } catch {
        setPixels(undefined);
      }
    };
    img.onerror = () => { if (!cancelled) setPixels(undefined); };
    img.src = '/logo.png';
    return () => { cancelled = true; };
  }, []);
  return pixels;
}

// Maps a point in mark-space back to the artwork and returns its colour.
// Samples a small neighbourhood and prefers the most saturated pixel, so
// points sitting on an antialiased edge do not pick up the white background.
function makeLogoSampler(pixels) {
  if (!pixels) return null;
  const { width, height, data } = pixels;
  const INK = 40;   // below this the neighbourhood is basically background

  const scan = (fx, fy, radius, hit) => {
    let best = -1;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = Math.max(0, Math.min(width - 1, Math.round(fx + dx)));
        const y = Math.max(0, Math.min(height - 1, Math.round(fy + dy)));
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        // saturated wins, and anything close to white scores near zero
        const score = (mx - mn) + (255 - mx) * 0.35;
        if (score > best) { best = score; hit[0] = r; hit[1] = g; hit[2] = b; }
      }
    }
    return best;
  };

  const hit = [0, 0, 0];
  return (wx, wy, out) => {
    const fx = wx / LOGO_PX.scale + LOGO_PX.cx;
    const fy = LOGO_PX.cy - wy / LOGO_PX.scale;
    // Cheap pass first. The bevel pushes the outermost geometry a couple of
    // pixels past the ink, so widen the search only for those points rather
    // than letting them pick up the white background.
    let best = scan(fx, fy, 2, hit);
    if (best < INK) best = scan(fx, fy, 6, hit);
    if (best < INK) scan(fx, fy, 14, hit);
    out.setRGB((hit[0] / 255) * COLOR_GAIN, (hit[1] / 255) * COLOR_GAIN, (hit[2] / 255) * COLOR_GAIN, THREE.SRGBColorSpace);
    return out;
  };
}

export function buildLogoGeometry() {
  const geo = new THREE.ExtrudeGeometry(buildLogoShape(), {
    steps: 1,
    depth: 0.42,
    // The outline is a dense traced polygon with some tight concave corners,
    // so the bevel stays small to avoid self-intersecting at those notches.
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.022,
    bevelSegments: 3,
  });

  // Bake the brand gradient into the mesh, running diagonally from the
  // bottom-left foot up to the arrow the way the flat logo does.
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox;
  const spanX = max.x - min.x;
  const spanY = max.y - min.y;

  const from = new THREE.Color(LOGO_COLOR_FROM);
  const to = new THREE.Color(LOGO_COLOR_TO);
  const tmp = new THREE.Color();

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const tx = (pos.getX(i) - min.x) / spanX;
    const ty = (pos.getY(i) - min.y) / spanY;
    const t = THREE.MathUtils.clamp((tx + (1 - ty)) / 2, 0, 1);
    tmp.copy(from).lerp(to, t);
    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return geo;
}

export function Sirah3DLogoShape({ darkMode, scale = 0.6 }) {
  const geometry = useMemo(() => buildLogoGeometry(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow scale={scale}>
      <meshPhysicalMaterial
        vertexColors
        roughness={darkMode ? 0.18 : 0.12}
        metalness={darkMode ? 0.35 : 0.15}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        envMapIntensity={darkMode ? 1.0 : 1.4}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Hit testing: is the cursor actually on the mark?                     */
/* ------------------------------------------------------------------ */

// Standard even-odd test against the traced outline.
function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// The ribbon is thin, so an exact test feels fussy. Treat "near an edge" as a
// hit too, which gives the cursor a forgiving margin around the mark.
function nearPolygon(x, y, poly, margin) {
  const m2 = margin * margin;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    const dx = xj - xi, dy = yj - yi;
    const len2 = dx * dx + dy * dy || 1e-6;
    let t = ((x - xi) * dx + (y - yi) * dy) / len2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = x - (xi + t * dx), py = y - (yi + t * dy);
    if (px * px + py * py < m2) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* The mark as a particle cloud that scatters when the cursor touches   */
/* it and reassembles when the cursor moves away.                       */
/* ------------------------------------------------------------------ */
const LOGO_SCALE = 0.72;     // a touch larger than the mark's original sizing
const TOUCH_MARGIN = 0.35;   // forgiveness around the ribbon, in shape units

// How far the cloud throws itself when it disperses. Sized to overflow the
// viewport at the depth it settles to, so the dots reach every corner.
const BURST_X = 11.5;
const BURST_Y = 6.5;
const BURST_Z = 6.0;

/* ---- how quickly the scroll opens the cloud ------------------------------
 *
 * Two separate things control this, and they are worth keeping apart.
 *
 * BURST_SPAN is the distance, in scroll, over which the cloud goes from
 * assembled to fully open. It used to be a flat 0.9 viewport heights, which
 * meant the burst was over within the hero no matter how long the page below
 * it was — on the homepage the mark had finished dispersing before the
 * carousel came into view. Measuring it against the page's own scrollable
 * height instead ties the burst to the thing being scrolled: a long page
 * opens the cloud slowly across its whole length.
 *
 * BURST_SPAN_MIN is a floor in viewport heights, and it is the old value on
 * purpose. Taking the larger of the two means this can only ever be slower
 * than it was, never faster — a short page (or one measured before its images
 * have laid out) falls back to the original behaviour rather than snapping
 * the cloud open in a few hundred pixels.
 */
const BURST_SPAN = 0.75;
const BURST_SPAN_MIN = 0.9;

/* ---- how quickly the cloud chases that target ----------------------------
 *
 * Separate from the span: the span says where the cloud should be for a given
 * scroll position, this says how fast it gets there.
 *
 * Only the scroll-driven opening is slowed. Everything else keeps the
 * original rate — the cursor burst has to feel like a direct response to the
 * pointer, the reassembly on the way back up would read as sluggish if it
 * lagged, and the fixed goals of 'dispersed' and 'assembled' are entrances
 * rather than gestures.
 */
const BURST_EASE = 1.1;    // scrolling down, cloud opening
const SETTLE_EASE = 2.2;   // everything else — the original rate

/* ---- presentation of the assembled mark ----------------------------------
 *
 * Everything below only applies while the mark is together — each term is
 * multiplied by (1 - scatter), so an inner page's dispersed field is exactly
 * what it was before. The point is to make the hero's mark feel like a held
 * object rather than a still, without any of it being noticeable enough to
 * pull the eye off the headline.
 *
 * INTRO_MS is the one-shot entrance: the cloud arrives at 0.96 and settles to
 * 1. It runs from the first frame that has geometry, and because the canvas
 * is mounted by the site layout rather than by a page, it happens once per
 * session and not again on navigation.
 *
 * The sway was already here; it is slower and a little wider now, which is
 * what reads as a very slow rotation without ever turning the mark far enough
 * to show its back.
 *
 * SHIMMER_PERIOD with the exponent below gives roughly an 0.8s swell every
 * 6.5s — flat for most of the cycle, so it registers as an occasional catch
 * of light rather than a pulse.
 */
const INTRO_MS = 700;
const INTRO_FROM = 0.96;

const FLOAT_AMP = 0.13;    // world units of vertical drift
const FLOAT_RATE = 0.34;

const SWAY_Y = 0.22;       // radians
const SWAY_Y_RATE = 0.16;
const SWAY_X = 0.085;
const SWAY_X_RATE = 0.12;

const PARALLAX_ROT = 0.10; // radians of lean at the edge of the screen
const PARALLAX_POS = 0.20; // world units of travel at the edge of the screen
const PARALLAX_EASE = 1.6;

const SHIMMER_PERIOD = 6.5;
const SHIMMER_SHARPNESS = 12;
const SHIMMER_SIZE = 0.35;
const SHIMMER_OPACITY = 0.12;

/* The field sits a touch further back than it used to. The brief asked for
 * slightly less of it behind the headline and this is the whole of that
 * change — no scrim, no gradient, just less of the cloud. */
const FIELD_OPACITY = 0.88;

/* Below this the hero stacks and there is no column beside the copy for the
 * mark to sit in. Matches Tailwind's lg, which is where Hero.jsx switches
 * from a spacer column to a spacer band under the CTA. */
const BESIDE_MIN_WIDTH = 1024;
const DROP_FRACTION = 0.52;   // of the half-viewport, downward

/**
 * `mode` decides what the cloud is doing:
 *   'scroll'    — homepage: assembled at the top, dispersing as you scroll
 *   'dispersed' — inner pages: background texture, always open
 *   'assembled' — a section has claimed it; hold the mark together regardless
 *                 of scroll position
 */
function ParticleLogo({ mode = 'scroll', align = 'hero', tint = null, energy = 0 }) {
  const pointsRef = useRef();
  const materialRef = useRef();
  const scatter = useRef(0);          // 0 = assembled, 1 = fully scattered
  const scrollScatter = useRef(0);    // how far the page has been scrolled
  // Distinct from scrollScatter, which saturates at BURST_SPAN — three
  // quarters of the way down. The ribbon is not finished until the bottom of
  // the page, so it needs the whole scroll, not the part the burst uses.
  const scrollFull = useRef(0);
  const ribbon = useRef(0);           // 0 = no band, 1 = solid band
  const pointer = useRef({ x: 0, y: 0, seen: false });
  const local = useMemo(() => new THREE.Vector3(), []);
  const pixels = useLogoPixels();

  // Presentation state for the assembled mark. These are the eased *base*
  // positions; the float and the parallax are added on top each frame, so
  // they cannot be folded into the ease without damping themselves.
  const intro = useRef(0);
  const parallax = useRef({ x: 0, y: 0 });
  const baseX = useRef(0);
  const baseY = useRef(0);

  // WebGL is outside the reach of the reduced-motion block in globals.css,
  // which only neutralises CSS transitions. This switches off the float, the
  // parallax, the shimmer and the entrance — the sway and the scatter are the
  // component's existing behaviour and are left as they were.
  const calm = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    calm.current = mq.matches;
    const onChange = (e) => { calm.current = e.matches; };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Read through refs inside useFrame so a route change does not re-render
  // the whole R3F tree — only the per-frame target moves.
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const alignRef = useRef(align);
  useEffect(() => { alignRef.current = align; }, [align]);

  // A section can tint the whole field toward its own accent. pointsMaterial
  // multiplies its colour into the per-vertex colours, so easing material.color
  // toward the accent shifts the cloud without touching the colour buffer —
  // 18,000 vertices stay untouched and the change costs nothing per frame.
  const tintTarget = useMemo(() => new THREE.Color(), []);
  const tintCurrent = useMemo(() => new THREE.Color(1, 1, 1), []);
  const hasTint = useRef(false);
  const energyRef = useRef(0);
  useEffect(() => {
    hasTint.current = Boolean(tint);
    if (tint) tintTarget.set(tint);
    energyRef.current = energy;
  }, [tint, energy, tintTarget]);

  const { positions, targets, bursts, stagger, colors, count } = useMemo(() => {
    // Wait for the artwork before building, so the cloud is never shown in
    // fallback colours and then swapped.
    if (pixels === null) {
      return { positions: new Float32Array(0), targets: null, bursts: null, stagger: null, colors: new Float32Array(0), count: 0 };
    }
    const sampleArt = makeLogoSampler(pixels);
    const geo = buildLogoGeometry();
    geo.computeBoundingBox();
    const c = geo.boundingBox.getCenter(new THREE.Vector3());

    // Sampling the geometry's *vertices* would only ever give the outline —
    // the extruded caps are triangulated straight from the contour, so they
    // have no interior vertices. Sample the surface area instead so the front
    // and back faces fill in and the mark reads solid.
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).setWeightAttribute(null).build();

    // Particle density scales with the device. A phone GPU chews through
    // 18k points and the mark reads perfectly well at a third of that, so
    // the budget is spent where there is screen to spend it on.
    const width = typeof window === 'undefined' ? 1920 : window.innerWidth;
    const n = width < 768 ? 6000 : width < 1280 ? 11000 : 18000;
    const targets = new Float32Array(n * 3);
    const bursts = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const stagger = new Float32Array(n);

    const pos = new THREE.Vector3();
    const nrm = new THREE.Vector3();   // unused, but sample() writes into it
    const col = new THREE.Color();
    const dir = new THREE.Vector3();

    for (let i = 0; i < n; i++) {
      sampler.sample(pos, nrm, col);
      const tx = (pos.x - c.x) * LOGO_SCALE;
      const ty = (pos.y - c.y) * LOGO_SCALE;
      const tz = (pos.z - c.z) * LOGO_SCALE;
      targets[i * 3] = tx; targets[i * 3 + 1] = ty; targets[i * 3 + 2] = tz;

      // Burst outward far enough to fill the viewport, wider than it is tall
      // to match the screen. Jittering the direction keeps the middle of the
      // field populated instead of leaving a hole where the mark was.
      dir.set(tx + (Math.random() - 0.5) * 1.6, ty + (Math.random() - 0.5) * 1.6, 0).normalize();
      if (!isFinite(dir.x)) dir.set(1, 0, 0);
      const reach = 0.28 + Math.random() * 0.72;
      bursts[i * 3] = dir.x * BURST_X * reach;
      bursts[i * 3 + 1] = dir.y * BURST_Y * reach;
      bursts[i * 3 + 2] = tz + (Math.random() - 0.5) * BURST_Z;

      stagger[i] = Math.random();

      // Colour comes from the artwork itself at this point on the mark, so the
      // azure arrow, magenta bowl and navy foot all survive. sampleArt is null
      // only if the image failed, in which case col holds the fallback ramp.
      // pos is still in the shape's own coordinates here, which is exactly
      // what LOGO_PX maps back into the artwork.
      if (sampleArt) sampleArt(pos.x, pos.y, col);
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
    }
    geo.dispose();
    return { positions: new Float32Array(targets), targets, bursts, stagger, colors, count: n };
  }, [pixels]);

  /**
   * Where each particle goes when the cloud forms the band.
   *
   * The band itself is never kept: it is extruded, sampled once, and thrown
   * away in the same breath. All that survives is one landing point per
   * particle, which is the only thing the frame loop needs — there is no ribbon
   * object in this scene, only the cloud arranged into the shape of one.
   */
  const landings = useMemo(() => {
    if (!count) return null;
    const geometry = buildRibbonGeometry();
    const points = sampleRibbonSurface(geometry, count);
    geometry.dispose();
    return points;
  }, [count]);

  // The canvas is pointer-events:none so it never receives events itself.
  // Track the cursor on the window instead.
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.current.seen = true;
    };
    const onLeave = () => { pointer.current.seen = false; };
    // Scattering also tracks the page, and it comes back together as you
    // scroll up again.
    //
    // The span is recomputed per event rather than cached because scrollHeight
    // is not stable: images, fonts and the carousel's own stage height all land
    // after mount, and a span measured once at mount would be taken from a
    // shorter page than the one being scrolled.
    const onScroll = () => {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const span = Math.max(window.innerHeight * BURST_SPAN_MIN, scrollable * BURST_SPAN);
      scrollScatter.current = THREE.MathUtils.clamp(window.scrollY / span, 0, 1);
      scrollFull.current = THREE.MathUtils.clamp(window.scrollY / scrollable, 0, 1);
    };
    onScroll();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useFrame((state, delta) => {
    const pts = pointsRef.current;
    if (!pts || !count) return;
    const d = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    // Where is the cursor on the plane the mark sits in?
    let touching = false;
    if (pointer.current.seen) {
      const cam = state.camera;
      const halfH = Math.tan((cam.fov * Math.PI) / 360) * cam.position.z;
      const halfW = halfH * (state.size.width / state.size.height);
      local.set(pointer.current.x * halfW, pointer.current.y * halfH, 0);
      pts.worldToLocal(local);
      const sx = local.x / LOGO_SCALE, sy = local.y / LOGO_SCALE;
      touching = pointInPolygon(sx, sy, LOGO_OUTER) || nearPolygon(sx, sy, LOGO_OUTER, TOUCH_MARGIN);
    }

    // Eased gently in both directions so it drifts apart rather than snapping.
    //
    // In 'scroll' mode whichever wants it more open wins: the cursor sitting
    // on the mark, or how far down the page you have scrolled. 'assembled'
    // deliberately ignores both — a section that has claimed the background
    // is nowhere near the top of the page, so scroll scatter would otherwise
    // hold the cloud permanently open.
    const m = modeRef.current;
    const scrollGoal = scrollScatter.current;
    const touchGoal = touching ? 1 : 0;
    const goal =
      m === 'dispersed' ? 1
        : m === 'assembled' ? 0
          : Math.max(scrollGoal, touchGoal);

    // Slow the opening, but only the part of it the scroll is responsible for.
    //
    // The three conditions are each load-bearing. 'scroll' mode: the other two
    // modes are entrances, not gestures. Rising: coming back together on the
    // way up would read as lag, not weight. And scroll outranking touch is
    // what keeps the cursor burst sharp — when the pointer is on the mark it
    // is touchGoal driving the goal, so that case takes the original rate.
    const scrollOpening =
      m === 'scroll' && goal > scatter.current && scrollGoal >= touchGoal;
    const rate = scrollOpening ? BURST_EASE : SETTLE_EASE;

    scatter.current += (goal - scatter.current) * Math.min(1, d * rate);

    const s = scatter.current;

    // How far the cloud has resolved into the band. Its own eased value with
    // its own hysteresis — see solveRibbon; forming and releasing are
    // deliberately not the same journey.
    // What the band is doing depends on what the field is for.
    //
    // 'scroll' is the homepage, where there is a mark to form *out of*: the
    // scroll position drives it, and the hysteresis in solveRibbon makes the
    // trip back a different journey from the trip out.
    //
    // 'dispersed' is every inner page. There is no mark there and no story to
    // tell about one — the field is background, so the band simply exists,
    // flowing, from the moment the page loads. Navigating in from the top of
    // the homepage forms it on the way rather than cutting to it, because the
    // canvas is mounted by the layout and survives the route change.
    //
    // 'assembled' is a section that has claimed the mark and is holding it
    // together. A band would be pulling the same particles the other way.
    const ribbonGoal = !landings ? 0 : m === 'assembled' ? 0 : m === 'scroll' ? scrollFull.current : 1;
    ribbon.current = solveRibbon(ribbon.current, ribbonGoal, d);
    const r = ribbon.current;

    const arr = pts.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      // Per-particle stagger so the cloud pulls apart raggedly, not as one lump
      const w = THREE.MathUtils.clamp(s * (0.65 + stagger[i] * 0.7), 0, 1);
      let e = w * w * (3 - 2 * w);   // smoothstep

      // Staggered like the burst is, so the swarm gathers raggedly rather than
      // every speck arriving on the same frame.
      const rw = THREE.MathUtils.clamp(r * (0.7 + stagger[i] * 0.6), 0, 1);
      const re = rw * rw * (3 - 2 * rw);

      // The burst is withdrawn by exactly as much as the band has taken hold.
      // Without this a particle travels mark -> scattered -> band, and the trip
      // through "scattered" is the whole of the middle of the animation: the
      // logo blows apart and only later gathers, which reads as two separate
      // events. Damped, the two blend into one move and a speck goes from its
      // place on the mark to its place on the ribbon directly.
      e *= 1 - re;

      // A little idle drift so the assembled mark still breathes
      const idle = (1 - e) * (1 - re) * 0.02;
      let x = targets[k] + (bursts[k] - targets[k]) * e + Math.sin(time * 1.1 + stagger[i] * 12) * idle;
      let y = targets[k + 1] + (bursts[k + 1] - targets[k + 1]) * e + Math.cos(time * 1.3 + stagger[i] * 9) * idle;
      let z = targets[k + 2] + (bursts[k + 2] - targets[k + 2]) * e;

      if (re > 0.001) {
        x += (landings[k] - x) * re;
        y += (landings[k + 1] - y) * re;
        z += (landings[k + 2] - z) * re;

        // A wave travelling up the band, so it flows rather than hangs. Phased
        // on the particle's own height, which for a ribbon this vertical is a
        // good enough stand-in for distance along it — the crest then runs the
        // length of the ribbon instead of the whole thing breathing at once.
        const wave = Math.sin(time * 0.8 - landings[k + 1] * 0.85) * 0.11 * re;
        x += wave;
        z += wave * 0.75;
      }

      arr[k] = x;
      arr[k + 1] = y;
      arr[k + 2] = z;
    }
    pts.geometry.attributes.position.needsUpdate = true;


    // How much of the presentation applies. 1 while the mark is together,
    // 0 once it has opened out into background texture — every term below is
    // scaled by it, so an inner page's field behaves exactly as it always did.
    const hold = calm.current ? 0 : 1 - s;

    // One-shot entrance, ease-out cubic. Advancing it here rather than in an
    // effect means it starts on the first frame that actually has geometry,
    // not on mount — the cloud waits for logo.png before it exists at all.
    intro.current = calm.current ? 1 : Math.min(1, intro.current + (d * 1000) / INTRO_MS);
    const introScale = INTRO_FROM + (1 - INTRO_FROM) * (1 - Math.pow(1 - intro.current, 3));

    // Flat for most of its cycle, so this reads as an occasional catch of
    // light rather than a heartbeat.
    const shimmer =
      Math.pow(Math.max(0, Math.sin((time * Math.PI * 2) / SHIMMER_PERIOD)), SHIMMER_SHARPNESS) * hold;

    // The mark leans toward the cursor. Eased separately from the scatter so
    // a fast pointer sweep does not snap it.
    const wantX = pointer.current.seen ? pointer.current.x : 0;
    const wantY = pointer.current.seen ? pointer.current.y : 0;
    const kp = Math.min(1, d * PARALLAX_EASE);
    parallax.current.x += (wantX - parallax.current.x) * kp;
    parallax.current.y += (wantY - parallax.current.y) * kp;

    // Thin the cloud out as it disperses so it sits back behind the copy,
    // but keep enough of it to read while it turns.
    //
    // Centred, the mark sits directly under a headline rather than beside it,
    // so it is knocked back further — it should read as a backdrop the copy
    // sits on, not as something competing with it.
    const centred = alignRef.current === 'center';
    if (materialRef.current) {
      // The scatter's dimming is undone as the band forms — but only on the
      // homepage, where the band is the hero's backdrop and is meant to be
      // looked at. On an inner page it is behind somebody's paragraphs and
      // stays knocked back exactly as the open field always was; brightening it
      // there would be turning up the volume on the wallpaper.
      const lift = m === 'scroll' ? r : 0;
      materialRef.current.opacity =
        FIELD_OPACITY * (1 - s * 0.55 * (1 - lift)) * (centred ? 0.5 : 1)
        * (1 + shimmer * SHIMMER_OPACITY);

      // Ease toward the active section's accent, or back to neutral white
      // when nothing has claimed it. A slow lerp is deliberate — the field
      // should feel like it is being lit, not repainted.
      const goalR = hasTint.current ? tintTarget.r : 1;
      const goalG = hasTint.current ? tintTarget.g : 1;
      const goalB = hasTint.current ? tintTarget.b : 1;
      const kt = Math.min(1, d * 1.4);
      tintCurrent.r += (goalR - tintCurrent.r) * kt;
      tintCurrent.g += (goalG - tintCurrent.g) * kt;
      tintCurrent.b += (goalB - tintCurrent.b) * kt;
      materialRef.current.color.copy(tintCurrent);

      // A brief swell in point size when a section reports fresh energy,
      // so a capability change registers in the background too — and the
      // shimmer rides the same channel.
      const targetSize = 0.05 * (1 + energyRef.current * 0.55) * (1 + shimmer * SHIMMER_SIZE);
      materialRef.current.size += (targetSize - materialRef.current.size) * Math.min(1, d * 2.5);
      energyRef.current *= 1 - Math.min(1, d * 1.2);
    }

    // Assembled, the mark sits in the right-hand half on wide screens so it
    // clears the hero copy. As it disperses it slides back to centre, so the
    // scattered dots spread across the whole viewport rather than bunching
    // into one side.
    // 'center' keeps the mark on the page's axis wherever it is in the scroll
    // — used when a full-screen section asks the particles to converge on it.
    const aspect = state.size.width / state.size.height;
    const halfH = Math.tan((state.camera.fov * Math.PI) / 360) * 9;
    const wide = aspect > 1.15;

    // Two different questions. `wide` is about the shape of the viewport and
    // decides how big the cloud is drawn. `beside` is about whether the hero
    // actually laid out a column next to the copy, which needs the CSS
    // breakpoint — a phone held in landscape is wide but still stacks.
    const beside = wide && state.size.width >= BESIDE_MIN_WIDTH;

    // Specifically the homepage hero's slot, not just "align is hero" — every
    // inner page leaves align at its default too, and their cloud is opened
    // out as background texture rather than parked next to a headline.
    const heroSlot = m === 'scroll' && alignRef.current === 'hero';
    const heroStacked = heroSlot && !beside;

    // Off to one side on an inner page. Centred, a band this defined runs down
    // the middle of the reading column, and a shape behind text is far more
    // distracting than the even field it replaced — the scattered cloud covered
    // more of the screen but had no edge for the eye to catch on. Only where
    // there is margin to put it in; on a narrow screen it stays where it is.
    const aside = m !== 'scroll' && beside ? halfH * aspect * 0.44 * r : 0;

    const offset = (heroSlot && beside ? halfH * aspect * 0.40 * (1 - s) : 0) + aside;

    // Stacked, there is nothing to the side, so the mark goes under the copy
    // into the band the hero reserves for it rather than sitting behind the
    // heading. Both this and the offset fade out with the scatter, which is
    // what lets the opened cloud fill the viewport evenly.
    const drop = heroStacked ? -halfH * DROP_FRACTION * (1 - s) : 0;

    baseX.current += (offset - baseX.current) * Math.min(1, d * 2.2);
    baseY.current += (drop - baseY.current) * Math.min(1, d * 2.2);

    // Float and parallax ride on top of the eased base rather than being
    // eased toward — a moving target inside a lerp would damp itself away.
    pts.position.x = baseX.current + parallax.current.x * PARALLAX_POS * hold;
    pts.position.y =
      baseY.current
      + Math.sin(time * FLOAT_RATE) * FLOAT_AMP * hold
      + parallax.current.y * PARALLAX_POS * 0.7 * hold;

    // A landscape phone is `wide` but still stacks, and at full scale the
    // dropped mark would climb back up into the CTA. Only the homepage's own
    // stacked case is capped — inner pages keep the size they always had.
    pts.scale.setScalar((wide && !heroStacked ? 1 : 0.72) * introScale);

    // No spin — it only ever sways, slowly enough that the mark never turns
    // far enough to show its back, with a few degrees of lean toward the
    // cursor on top. Scattering is still the whole effect.
    // It does drift back from the camera as it opens, so the dispersing cloud
    // sits behind the page content rather than on top of it.
    pts.rotation.y = Math.sin(time * SWAY_Y_RATE) * SWAY_Y + parallax.current.x * PARALLAX_ROT * hold;
    pts.rotation.x = Math.sin(time * SWAY_X_RATE) * SWAY_X - parallax.current.y * PARALLAX_ROT * 0.7 * hold;
    // The dispersing cloud drifts back so it sits behind the page content. The
    // band should not: it is a formed object at a settled depth, so the retreat
    // is withdrawn as it takes hold.
    pts.position.z = -s * 3.4 * (1 - r) + (centred ? -1.6 : 0);
  });

  if (!count) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.05}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
      />

    </points>
  );
}

export default function SirahCanvas({ mode = 'scroll', align = 'hero', tint = null, energy = 0 }) {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
      {/* dpr capped at 1.5 — rendering a particle field at a phone's native
          3x costs three times the fill rate for no visible gain. */}
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.8} />

        {/* Dynamic theme accent colored spotlights */}
        <pointLight position={[-6, 4, -5]} intensity={0.7} color="#a855f7" />
        <pointLight position={[6, -4, 5]} intensity={1.0} color="#06b6d4" />

        <Environment preset="studio" />
        <ParticleLogo mode={mode} align={align} tint={tint} energy={energy} />
      </Canvas>
    </div>
  );
}
