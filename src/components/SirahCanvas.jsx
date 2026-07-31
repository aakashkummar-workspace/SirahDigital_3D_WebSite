"use client";
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { LOGO_OUTER, LOGO_HOLES, LOGO_PX } from './sirahLogoOutline';

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

function ParticleLogo() {
  const pointsRef = useRef();
  const materialRef = useRef();
  const scatter = useRef(0);          // 0 = assembled, 1 = fully scattered
  const scrollScatter = useRef(0);    // how far the page has been scrolled
  const pointer = useRef({ x: 0, y: 0, seen: false });
  const local = useMemo(() => new THREE.Vector3(), []);
  const pixels = useLogoPixels();

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

    const n = 18000;
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

  // The canvas is pointer-events:none so it never receives events itself.
  // Track the cursor on the window instead.
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.current.seen = true;
    };
    const onLeave = () => { pointer.current.seen = false; };
    // Scattering also tracks the page: fully dispersed roughly one screen down,
    // and it comes back together as you scroll up again.
    const onScroll = () => {
      const span = window.innerHeight * 0.9;
      scrollScatter.current = THREE.MathUtils.clamp(window.scrollY / span, 0, 1);
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

    // Whichever wants it more open wins: the cursor sitting on the mark, or
    // how far down the page you have scrolled. Eased gently in both directions
    // so it drifts apart rather than snapping.
    const goal = Math.max(scrollScatter.current, touching ? 1 : 0);
    scatter.current += (goal - scatter.current) * Math.min(1, d * 2.2);

    const s = scatter.current;
    const arr = pts.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      // Per-particle stagger so the cloud pulls apart raggedly, not as one lump
      const w = THREE.MathUtils.clamp(s * (0.65 + stagger[i] * 0.7), 0, 1);
      const e = w * w * (3 - 2 * w);   // smoothstep
      // A little idle drift so the assembled mark still breathes
      const idle = (1 - e) * 0.02;
      arr[k] = targets[k] + (bursts[k] - targets[k]) * e + Math.sin(time * 1.1 + stagger[i] * 12) * idle;
      arr[k + 1] = targets[k + 1] + (bursts[k + 1] - targets[k + 1]) * e + Math.cos(time * 1.3 + stagger[i] * 9) * idle;
      arr[k + 2] = targets[k + 2] + (bursts[k + 2] - targets[k + 2]) * e;
    }
    pts.geometry.attributes.position.needsUpdate = true;

    // Thin the cloud out as it disperses so it sits back behind the copy,
    // but keep enough of it to read while it turns.
    if (materialRef.current) {
      materialRef.current.opacity = 0.95 * (1 - s * 0.55);
    }

    // Assembled, the mark sits in the right-hand half on wide screens so it
    // clears the hero copy. As it disperses it slides back to centre, so the
    // scattered dots spread across the whole viewport rather than bunching
    // into one side.
    const aspect = state.size.width / state.size.height;
    const halfH = Math.tan((state.camera.fov * Math.PI) / 360) * 9;
    const wide = aspect > 1.15;
    pts.position.x = wide ? halfH * aspect * 0.40 * (1 - s) : 0;
    pts.scale.setScalar(wide ? 1 : 0.72);

    // No spin — it only ever sways gently. Scattering is the whole effect.
    // It does drift back from the camera as it opens, so the dispersing cloud
    // sits behind the page content rather than on top of it.
    pts.rotation.y = Math.sin(time * 0.25) * 0.18;
    pts.rotation.x = Math.sin(time * 0.19) * 0.07;
    pts.position.z = -s * 3.4;
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

export default function SirahCanvas() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.8} />

        {/* Dynamic theme accent colored spotlights */}
        <pointLight position={[-6, 4, -5]} intensity={0.7} color="#a855f7" />
        <pointLight position={[6, -4, 5]} intensity={1.0} color="#06b6d4" />

        <Environment preset="studio" />
        <ParticleLogo />
      </Canvas>
    </div>
  );
}
