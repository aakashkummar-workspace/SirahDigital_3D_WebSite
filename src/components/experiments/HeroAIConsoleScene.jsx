"use client";
// EXPERIMENTAL: AI Console Hero
// Safe to remove without affecting the rest of the website.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  PANEL_ART,
  CHIP_ART,
  SCALE,
  drawChestBadge,
  drawEye,
  drawGlow,
  drawPlate,
  forgetFont,
} from './heroConsoleArt';
// The stage and the scene read the same timeline. The DOM fades its cards from
// these curves and the ring flies its cards from them, so the two physically
// cannot disagree about where in the sequence we are.
import {
  cardFlight,
  easeInOut,
  handoff,
  mix,
  ringTurn,
} from '@/components/sections/heroStageTimeline';

/**
 * One 3D product scene: a robot on a lit platform, five dashboard panels
 * tethered to that platform, and a handful of smaller objects around it. The
 * whole thing turns as one body under the cursor.
 *
 * ── Why it is built rather than loaded ───────────────────────────────────
 * The obvious route is a GLB. It is the wrong one here. A rigged robot of this
 * fidelity is 2-6MB above the fold, needs DRACO or Meshopt wired up, and — the
 * part that actually decides it — the panels have to be *part* of the object.
 * They carry live product copy, they are lit by the same rig, they occlude and
 * are occluded by the robot, and they are tethered to the base by geometry that
 * has to know where both ends are. A downloaded mesh cannot participate in any
 * of that. Built from primitives, the scene ships as code, weighs nothing extra
 * over the three.js already on the page, and every part of it is a value that
 * can be tuned.
 *
 * ── Why the panels are canvas textures ───────────────────────────────────
 * See heroConsoleArt.js. Short version: real charts and real product names, at
 * a legible size, that live inside the perspective instead of floating over it.
 *
 * ── One composition, not a pile of objects ───────────────────────────────
 * Everything hangs off a single root group. The cursor turns that root, so the
 * robot, the panels, the tethers and the platform share one parallax and one
 * vanishing point — which is the difference between a 3D scene and a parallax
 * collage. The only per-layer motion on top of it is small and deliberate: the
 * panels counter-rotate about a tenth of the root's turn so the depth between
 * them opens up as it moves, and the head tracks the cursor a little further
 * than its body does, because that is what makes the robot read as looking at
 * you rather than as being turned toward you.
 *
 * ── Fit ──────────────────────────────────────────────────────────────────
 * The hero's visual column is nearly square on a large screen and a wide band
 * on a phone. Rather than tune a scale per breakpoint, FitGroup measures the
 * frame in world units and scales the composition to fill it, so it is as large
 * as it can be without touching the edges at any size.
 *
 * ── Materials are LOW metalness, deliberately ────────────────────────────
 * There is no environment map — an HDR fetch is a network dependency and a few
 * hundred KB for a decorative object above the fold. A three.js metal with
 * nothing to reflect renders near-black, so the white shell would come out
 * charcoal. The four-light rig plus low metalness is what carries the form.
 */

/* -------------------------------------------------------------------------
   Layout
   ---------------------------------------------------------------------- */

/**
 * The box the composition is fitted into: half-width, half-height and the y of
 * its centre. Derived from the values below, not guessed — if a panel moves
 * outward, this moves with it or the fit will crop.
 *
 * These are *projected* extents, which is the part worth stating. Under a
 * perspective camera an object's screen extent is its world extent scaled by
 * cameraZ / (cameraZ - z), so anything sitting toward the viewer reaches
 * further across the frame than its x says.
 *
 * The trap, and the reason the first pass clipped both side panels: a panel
 * turned about y does not keep its stated z. Turning the left panel 0.52rad
 * swings its outer corner 0.56 units *toward* the camera on top of the 0.4 it
 * was placed at, and a corner at z≈0.96 projects 6% wider than the same corner
 * at z=0. Six percent is two characters off the front of a product name.
 *
 * So these are measured at the corners, after rotation, with the projection
 * applied — and then given a few percent of slack, because the idle drift and
 * the cursor turn both move the composition a little further than its neutral
 * pose. Anything that reaches outside this box gets cropped by the canvas.
 *
 * Keeping this box tight is also the only lever on how large everything reads.
 * The frame is fixed and the composition always fills the same share of it, so
 * a narrower box means the same screen width holds less world — and the robot,
 * the cards and their type all come out bigger. Widening the orbit another half
 * unit costs about ten percent off everything in the scene.
 *
 * With the cards on a ring the widest moment is a card at the side of the
 * orbit, where x is at its maximum and z is zero: 2.75 + 1.125 = 3.88, with no
 * projection to add. The highest is the card at the back of the ring, whose top
 * edge is at 2.95 but which sits at z=-1.55 and so projects down to 2.74. The
 * lowest is still the console's bottom edge, at z=2.15, projecting to 3.42.
 */
const BOUNDS = { halfW: 4.05, halfH: 3.08, centerY: -0.34 };

const PODIUM_TOP = -2.84; // where the robot stands
const PODIUM_R = 2.42;

// The robot is built at its natural proportions and then scaled about its own
// feet, so the platform, the panels and the tethers keep their positions while
// the one thing the brief calls dominant gets to be dominant. At 1.24 its head
// is about as wide as a panel and it stands a head taller than the platform's
// diameter, which is the relationship the reference has.
const ROBOT_SCALE = 1.24;

/**
 * The product cards, which circle the robot on a tipped, flattened ring.
 *
 * One card per product, in the order the page numbers them, and nothing else
 * orbits — a card in this scene means a product, so a fourth card would have to
 * be a fourth product.
 *
 * The ring is much shallower in z than in x (1.55 against 2.75) for two
 * reasons. A circular orbit under a long lens barely changes a card's size as
 * it comes round, so the revolve reads as sliding rather than turning; and a
 * card at the back of a deep ring is far enough away to be unreadable. Flat and
 * wide, each card passes visibly behind the robot and comes back to the front
 * at a legible size the whole way.
 *
 * `tilt` swings the ring's height over one revolution, so it is a tipped hoop
 * rather than a turntable — without it the three cards sit on one horizontal
 * line and the composition reads as a row that happens to be moving.
 */
const ORBIT = {
  rx: 2.75,
  rz: 1.55,
  // These two are set against the robot, not chosen. The ring has to clear the
  // face: at the sides a card spans y 0.15 to 1.55, which is head height, and
  // it only works because x=2.75 puts its inner edge at 1.63 against an ear
  // that ends at 1.53. Coming round the front a card would cross the visor, so
  // the tilt drops the front of the ring to y=-0.55 — a card's top edge then
  // lands at 0.15, which is the bottom of the visor to within a hair. The back
  // of the ring rises to 2.25 and passes behind the head.
  //
  // Raising `y` or flattening `tilt` puts a card across the robot's face,
  // which is the one thing in this composition that must never be covered.
  y: 0.85,
  tilt: 1.4,
  // Radians a second, and this is only the *idle* drift — scrolling turns the
  // ring far faster than this on top of it. About a minute a revolution: fast
  // enough that the ring is visibly revolving within a second of landing on the
  // page, slow enough that it never pulls the eye off the heading beside it.
  speed: 0.105,
  w: 2.25,
  h: 1.406,
};

// Keys into PANEL_ART, one per product, matched to HOME_PRODUCTS by order.
const ORBIT_ART = ['auraTranscriber', 'analyticsAgents', 'nusi'];

/**
 * The console. Not a card and not a product — it is the robot's own desk, it
 * sits on the platform rather than floating, and it is what keeps the lower
 * half of the composition from being empty once the cards have risen onto the
 * ring. It is placed by its top edge: it has to cut the torso below the chest
 * badge, because covering the badge made the robot read as hiding behind a
 * screen rather than working at one.
 *
 * `anchors` are where its tethers meet it, as a signed fraction of its
 * half-width — two of them, one per bottom corner, because a single tether on
 * something this wide reads as a stand rather than as a connection.
 */
const CONSOLE_PANEL = {
  art: 'console',
  w: 3.0,
  h: 1.5,
  position: [0, -2.35, 1.9],
  rotation: [-0.34, 0, 0],
  anchors: [-0.72, 0.72],
  float: [0.03, 0.33, 3.1],
};

const TAU = Math.PI * 2;
const UNIT_Y = new THREE.Vector3(0, 1, 0);
// Scratch for aiming the beams. Allocated once; the loop must not allocate.
const BEAM_TO = new THREE.Vector3();

/**
 * Where card `i` sits at ring angle `spin`, and where its beam has to point to
 * reach it.
 *
 * This exists as a function, rather than inline in the frame loop where it is
 * used, because the loop is not the only caller: the neutral pose has to be
 * rendered as JSX too. A visitor who has asked for reduced motion gets
 * frameloop="demand" and no frame loop at all, and the first version left every
 * card at the origin for them — three product cards stacked inside the robot,
 * where the only evidence they existed was a faint glow through its chest.
 */
function orbitAt(i, count, spin) {
  const phi = spin + (i * TAU) / count;
  const sx = Math.sin(phi);
  const cz = Math.cos(phi);
  return {
    x: ORBIT.rx * sx,
    y: ORBIT.y - ORBIT.tilt * cz,
    z: ORBIT.rz * cz,
    ry: -sx * 0.3,
  };
}

// The beam runs from a point on the platform rim directly under the card, up to
// the card's lower edge. Returned as position/quaternion/scale for a unit
// cylinder standing on its own base.
function beamAt(card, out) {
  const radial = Math.hypot(card.x, card.z) || 1;
  const ax = (card.x / radial) * (PODIUM_R - 0.45);
  const az = (card.z / radial) * (PODIUM_R - 0.45);
  const ay = PODIUM_TOP + 0.02;

  out.set(card.x - ax, card.y - ORBIT.h * 0.46 - ay, card.z - az);
  const length = out.length() || 1;
  out.divideScalar(length);

  return { ax, ay, az, length };
}

/* -------------------------------------------------------------------------
   Framing
   ---------------------------------------------------------------------- */

/**
 * Where in the canvas the composition sits.
 *
 * One framing per breakpoint and no second one to animate toward: the robot is
 * anchored for the entire sequence and only the cards move. This used to lerp
 * between a hero framing and a focused one, which slid the whole composition —
 * robot, platform and all — into the middle of the screen as the products came
 * in. It read as the page rearranging itself rather than as the robot handing
 * you something.
 *
 * The canvas still spans the whole stage rather than a column, because a card
 * flying out of the ring has to be able to reach the centre of the screen, and
 * it can only do that inside the canvas it is drawn in.
 *
 *   spanW/spanH  the share of the canvas the composition is fitted into
 *   cx/cy        where its centre sits, as a share of canvas width/height from
 *                the middle; +cy is up
 */
const LAYOUT = {
  // cx is what decides how close the composition gets to the right edge, and it
  // is set from the *chips* rather than the cards. A chip sits forward at
  // z=1.2, so it projects about 5% wider than its x suggests and reaches past
  // the outermost card — at 0.255 the target chip was half off the screen while
  // every card was comfortably inside.
  desktop: { spanW: 0.46, spanH: 0.9, cx: 0.232, cy: 0.02 },
  // On a phone the copy is above the composition rather than beside it, so the
  // robot goes low and wide instead of to one side. The stage is one viewport
  // and the copy takes about 510px of it, leaving the bottom third.
  compact: { spanW: 0.86, spanH: 0.32, cx: 0, cy: -0.34 },
};

function solveFit(viewport, compact) {
  const k = LAYOUT[compact ? 'compact' : 'desktop'];

  const scale = Math.min(
    (viewport.width * k.spanW) / (2 * BOUNDS.halfW),
    (viewport.height * k.spanH) / (2 * BOUNDS.halfH),
  );

  return {
    scale,
    x: viewport.width * k.cx,
    y: viewport.height * k.cy - BOUNDS.centerY * scale,
  };
}

/* -------------------------------------------------------------------------
   The presentation
   ---------------------------------------------------------------------- */

/**
 * Where a card ends up when it has fully left the ring.
 *
 * PRES_Z is a *world* depth, four units nearer the camera than the composition
 * it came from. That is the whole reason the enlargement reads as three
 * dimensional: at z=4 the card is 24% closer to a camera at z=17, so a third of
 * its growth is perspective rather than scale, and it visibly passes in front
 * of the robot on the way.
 *
 * PRES_NDC_Y puts its centre at 54% of the viewport height — the same place the
 * DOM card sits, because the DOM card is what it becomes.
 */
const PRES_Z = 4.0;
// Dead centre of the screen. It was 54% when the robot stayed lit behind the
// card and the card had to sit clear of its head; with the composition standing
// down for the presentation there is nothing left to sit clear of.
const PRES_NDC_Y = 0;

// Scratch for the flight. Allocated once; the loop must not allocate.
const DESIRED = new THREE.Vector3();
const Q_PARENT = new THREE.Quaternion();
const Q_FACE = new THREE.Quaternion();
const Q_RING = new THREE.Quaternion();
const EULER = new THREE.Euler();

// The small objects around the platform. Same construction as each other, four
// different glyphs, all sitting forward of the panels so they read as the
// nearest layer in the scene.
const CHIPS = [
  { icon: 'mail', position: [-2.9, -1.6, 1.35], size: 0.62, spin: 0.16, float: [0.09, 0.62, 0.4] },
  { icon: 'target', position: [2.85, -1.3, 1.2], size: 0.58, spin: -0.13, float: [0.1, 0.55, 2.7] },
  { icon: 'bars', position: [2.25, -2.55, 1.8], size: 0.52, spin: 0.19, float: [0.08, 0.71, 5.0] },
  { icon: 'pulse', position: [-2.35, -2.6, 1.65], size: 0.48, spin: -0.17, float: [0.075, 0.66, 1.7] },
];

/* -------------------------------------------------------------------------
   Palette
   ---------------------------------------------------------------------- */

const SHELL = '#F3F6FC'; // the robot's white plastic
const SHELL_SHADE = '#CFD8E8'; // recessed shell parts, so panel lines read
const DARK = '#252B49'; // limbs, neck, the platform body
const JOINT = '#454D74'; // ball joints, a step lighter than the limbs
const VISOR = '#141833'; // the face screen — dark, but not the hole pure black reads as
const ACCENT = '#22D3EE'; // brand cyan, the only accent in the scene

/* -------------------------------------------------------------------------
   Assets
   ---------------------------------------------------------------------- */

/**
 * Paints a canvas and hands back a texture that repaints itself once webfonts
 * have settled.
 *
 * The repaint is not a nicety. next/font swaps Inter Tight in asynchronously,
 * and a texture painted before that lands is frozen in the fallback face
 * forever — a canvas has no reflow. One extra paint per panel on fonts.ready
 * costs a fraction of a millisecond and is the difference between the panels
 * being set in the site's face or in Arial.
 */
function paintedTexture(draw, w, h, gl, invalidate) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * SCALE);
  canvas.height = Math.round(h * SCALE);
  const ctx = canvas.getContext('2d');

  const paint = () => {
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h);
  };

  paint();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = gl.capabilities.getMaxAnisotropy();
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  let live = true;
  const stop = () => {
    live = false;
  };

  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    document.fonts.ready
      .then(() => {
        if (!live) return;
        forgetFont();
        paint();
        texture.needsUpdate = true;
        invalidate();
      })
      .catch(() => {});
  }

  return { texture, stop };
}

/**
 * Every geometry, material and texture in the scene, built once.
 *
 * Kept in one place for one reason: it is also the dispose list. three does not
 * garbage-collect GPU resources, and a hero component that leaks a robot's
 * worth of buffers on every client-side navigation is a slow leak that only
 * shows up on the fourth or fifth page.
 */
function createAssets(gl, invalidate) {
  const bin = [];
  const keep = (x) => {
    bin.push(x);
    return x;
  };

  const painted = [];
  const paint = (draw, w, h) => {
    const p = paintedTexture(draw, w, h, gl, invalidate);
    painted.push(p);
    keep(p.texture);
    return p.texture;
  };

  /* Materials ---------------------------------------------------------- */

  const shell = keep(
    new THREE.MeshStandardMaterial({ color: SHELL, metalness: 0.16, roughness: 0.28 }),
  );
  const shellShade = keep(
    new THREE.MeshStandardMaterial({ color: SHELL_SHADE, metalness: 0.2, roughness: 0.34 }),
  );
  const dark = keep(new THREE.MeshStandardMaterial({ color: DARK, metalness: 0.42, roughness: 0.36 }));
  const joint = keep(new THREE.MeshStandardMaterial({ color: JOINT, metalness: 0.55, roughness: 0.3 }));
  const visor = keep(
    new THREE.MeshStandardMaterial({ color: VISOR, metalness: 0.35, roughness: 0.22 }),
  );
  // Unlit, so the painted cyan reaches the screen as painted. See drawEye.
  const eye = keep(
    new THREE.MeshBasicMaterial({
      map: paint(drawEye, 64, 74),
      transparent: true,
      toneMapped: false,
    }),
  );
  const lamp = keep(
    new THREE.MeshStandardMaterial({
      color: ACCENT,
      emissive: ACCENT,
      emissiveIntensity: 2.2,
      roughness: 0.3,
      metalness: 0,
    }),
  );
  const platform = keep(
    new THREE.MeshStandardMaterial({ color: '#1C2143', metalness: 0.5, roughness: 0.42 }),
  );
  // A step down from the shell's white. At the same value as the robot the
  // platform competed with it for the eye, and the thing standing on the
  // platform is what the composition is about.
  const platformTop = keep(
    new THREE.MeshStandardMaterial({ color: '#BAC5DC', metalness: 0.35, roughness: 0.34 }),
  );

  // Additive, unlit, and never writing depth: these are light in the air, and
  // light does not occlude what is behind it.
  const additive = (color, opacity, map) =>
    keep(
      new THREE.MeshBasicMaterial({
        color,
        map: map || null,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    );

  const glowTex = paint(drawGlow, 128, 128);

  const glowSprite = additive(ACCENT, 0.9, glowTex);
  const ringGlow = additive(ACCENT, 0.55);
  const spill = additive('#4C6BE8', 0.34, glowTex);
  // Dim enough to read as a connection rather than as a diagram. Six of these
  // cross the frame; at full strength they become the loudest thing in the
  // composition and the panels start looking like they are held up by cabling.
  const tether = keep(
    new THREE.MeshBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.38,
      toneMapped: false,
    }),
  );
  const tetherHalo = additive(ACCENT, 0.1);
  const mote = additive('#9FB4FF', 0.5, glowTex);

  /* Robot geometry ------------------------------------------------------ */

  const rbox = (w, h, d, r, seg = 4) => keep(new RoundedBoxGeometry(w, h, d, seg, r));
  const cyl = (rt, rb, h, seg = 32) => keep(new THREE.CylinderGeometry(rt, rb, h, seg));
  const ball = (r, seg = 24) => keep(new THREE.SphereGeometry(r, seg, seg / 2));

  const robot = {
    // The head is the largest single part in the scene by some margin, which is
    // what makes the robot read as cute rather than as a mannequin. Corner
    // radius 0.42 leaves a flat face ~1.08 wide — enough for the visor to sit
    // on without its corners breaking through the curve at the sides.
    head: rbox(1.92, 1.58, 1.5, 0.42, 5),
    visor: rbox(1.3, 0.96, 0.12, 0.3, 4),
    // A plane carrying the painted eye, not a solid. It sits just proud of the
    // visor's front face, so it never intersects it as the head turns.
    eye: keep(new THREE.PlaneGeometry(0.34, 0.393)),
    // Rounded rather than a bare cylinder: flat-ended tubes read as bolts
    // through the head, and these are meant to read as ear pods.
    ear: rbox(0.36, 0.34, 0.34, 0.15, 4),
    earInner: cyl(0.2, 0.2, 0.07),
    antenna: cyl(0.032, 0.045, 0.5, 12),
    antennaTip: ball(0.11),
    neck: cyl(0.26, 0.3, 0.24, 20),
    // Generously rounded — at a smaller radius the body reads as a crate the
    // head is sitting on rather than as part of the same toy.
    torso: rbox(1.58, 1.4, 1.2, 0.46, 5),
    // A plane, not a box. The badge artwork is a rounded plate on a
    // transparent field, so the geometry behind it would only ever show as
    // four dark corners poking out from under its own picture.
    badge: keep(new THREE.PlaneGeometry(0.72, 0.58)),
    pedestal: cyl(0.52, 0.68, 0.34, 32),
    shoulder: rbox(0.42, 0.4, 0.42, 0.16, 4),
    upperArm: cyl(0.11, 0.12, 0.56, 18),
    elbow: ball(0.165),
    foreArm: cyl(0.1, 0.105, 0.5, 18),
    hand: rbox(0.28, 0.3, 0.22, 0.1, 3),
    thumb: rbox(0.1, 0.18, 0.12, 0.05, 2),
  };

  // The one lit surface in the scene carrying a texture. Unlit like the panels
  // would be wrong: the badge is a plate bolted to the robot's chest and has to
  // shade with the body it is on, or it detaches and floats. The emissive map
  // is the same texture, so the blue plate glows and its transparent
  // surroundings emit nothing.
  const badgeMaterial = keep(
    new THREE.MeshStandardMaterial({
      map: paint(drawChestBadge, 128, 104),
      transparent: true,
      metalness: 0.1,
      roughness: 0.34,
      emissiveIntensity: 0.5,
      emissive: '#FFFFFF',
    }),
  );
  badgeMaterial.emissiveMap = badgeMaterial.map;

  /* Platform ------------------------------------------------------------ */

  const podium = {
    base: cyl(PODIUM_R, PODIUM_R + 0.1, 0.28, 64),
    band: cyl(PODIUM_R - 0.2, PODIUM_R - 0.2, 0.12, 64),
    top: cyl(PODIUM_R - 0.42, PODIUM_R - 0.32, 0.18, 64),
    inlay: cyl(PODIUM_R - 0.72, PODIUM_R - 0.72, 0.02, 64),
    ring: keep(new THREE.RingGeometry(PODIUM_R - 0.24, PODIUM_R + 0.24, 96)),
    // Upright, not laid flat. The camera sits about eleven degrees above the
    // platform, so a horizontal glow plane projects to a hairline and the light
    // the base is obviously casting never reaches the air around it. A
    // billboard behind the base is what actually reads as that spill.
    halo: keep(new THREE.PlaneGeometry(7.8, 4.6)),
  };

  /* Panels -------------------------------------------------------------- */

  // Unlit and untone-mapped. These are screens: what the painter drew is
  // exactly what should reach the eye, unmodified by the rig shaping the robot
  // beside them.
  const screen = (art) =>
    keep(
      new THREE.MeshBasicMaterial({
        map: paint(art.draw, art.w, art.h),
        transparent: true,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );

  const consolePanel = {
    ...CONSOLE_PANEL,
    geometry: keep(new THREE.PlaneGeometry(CONSOLE_PANEL.w, CONSOLE_PANEL.h)),
    material: screen(PANEL_ART[CONSOLE_PANEL.art]),
  };

  // One shared plane for all three cards — they are the same size, and the
  // orbit is entirely transform work, so there is nothing to gain from three
  // identical buffers. The materials have to stay separate: each carries its
  // own product's texture, and each fades independently as its card is the one
  // being handed to the DOM.
  const cardGeometry = keep(new THREE.PlaneGeometry(ORBIT.w, ORBIT.h));

  // One bare plate, painted at the cards' own proportions. Every card gets its
  // own material over it so each can fade independently, but they all share the
  // one texture — it is the same picture three times.
  const plateArt = PANEL_ART[ORBIT_ART[0]];
  const plateTexture = paint(drawPlate, plateArt.w, plateArt.h);

  const cards = ORBIT_ART.map((key, i) => ({
    index: i,
    art: key,
    material: screen(PANEL_ART[key]),
    plate: keep(
      new THREE.MeshBasicMaterial({
        map: plateTexture,
        transparent: true,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    ),
    // Its tether gets its own pair of materials rather than sharing the
    // console's. A card that leaves the ring has to take its tether with it,
    // and fading is the only way to do that without a pop — which needs an
    // opacity this card alone owns.
    beamCore: null,
    beamHalo: null,
  }));

  /* Chips --------------------------------------------------------------- */

  const chipGlass = keep(
    new THREE.MeshStandardMaterial({
      color: '#8FA0D8',
      metalness: 0.3,
      roughness: 0.18,
      transparent: true,
      opacity: 0.62,
    }),
  );

  const chips = CHIPS.map((c) => ({
    ...c,
    body: rbox(c.size, c.size, c.size, c.size * 0.26, 4),
    face: keep(new THREE.PlaneGeometry(c.size * 0.72, c.size * 0.72)),
    material: keep(
      new THREE.MeshBasicMaterial({
        map: paint(CHIP_ART.icons[c.icon], CHIP_ART.w, CHIP_ART.h),
        transparent: true,
        toneMapped: false,
        depthWrite: false,
      }),
    ),
  }));

  /* Tethers ------------------------------------------------------------- */

  // Built from the console's own transform rather than from hand-placed
  // endpoints, so it can be moved above and its tethers follow. The bow is
  // radial: pushed away from the centre column and lifted, which keeps every
  // tether clear of the robot instead of cutting through it.
  const dummy = new THREE.Object3D();
  const tethers = [];
  const anchorPoints = [];

  [CONSOLE_PANEL].forEach((p) => {
    dummy.position.fromArray(p.position);
    dummy.rotation.fromArray(p.rotation);
    dummy.updateMatrix();

    p.anchors.forEach((a) => {
      const end = new THREE.Vector3(a * p.w * 0.5, -p.h * 0.46, 0).applyMatrix4(dummy.matrix);

      const radial = new THREE.Vector2(end.x, end.z);
      if (radial.lengthSq() < 1e-6) radial.set(0, 1);
      radial.normalize();

      const start = new THREE.Vector3(
        radial.x * (PODIUM_R - 0.5),
        PODIUM_TOP + 0.02,
        radial.y * (PODIUM_R - 0.5),
      );

      const mid = start.clone().lerp(end, 0.52);
      mid.x += radial.x * 0.42;
      mid.z += radial.y * 0.42;
      mid.y += 0.18;

      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      tethers.push({
        core: keep(new THREE.TubeGeometry(curve, 28, 0.022, 8, false)),
        halo: keep(new THREE.TubeGeometry(curve, 20, 0.075, 6, false)),
      });
      // Where the tether meets the platform gets a small lit bead, so the run
      // terminates in something rather than sinking into the rim.
      anchorPoints.push(start);
    });
  });

  const anchorNode = ball(0.055, 12);

  /* Scenery ------------------------------------------------------------- */

  /**
   * Everything that is *not* the card currently being presented.
   *
   * A card flying to the centre of the screen has to arrive alone — with the
   * robot still lit behind it the card reads as a label pasted over a scene
   * rather than as the thing the scene handed you. So the whole composition
   * dims out as a card comes forward and lifts back in as it returns, which
   * also gives the ring's turn between products something to be seen against.
   *
   * `transparent` is set here, once, rather than toggled when the fade starts:
   * changing it at runtime forces three to rebuild the shader program for that
   * material, and doing that to twenty materials mid-scroll is a visible hitch.
   * depthWrite stays on, so the robot still occludes itself while translucent
   * instead of showing its own inside.
   */
  const scenery = [];
  [
    shell,
    shellShade,
    dark,
    joint,
    visor,
    eye,
    lamp,
    badgeMaterial,
    platform,
    platformTop,
    glowSprite,
    ringGlow,
    spill,
    mote,
    chipGlass,
    tether,
    tetherHalo,
    consolePanel.material,
    ...chips.map((c) => c.material),
  ].forEach((mat) => {
    mat.transparent = true;
    scenery.push({ mat, base: mat.opacity });
  });

  /* Beams --------------------------------------------------------------- */

  /**
   * The cards' tethers. A card moves, so its tether cannot be a baked curve
   * the way the console's are — the geometry would have to be rebuilt every
   * frame, which for a swept tube is a few hundred vertices re-solved per card
   * per frame to draw what is, visually, a straight line of light.
   *
   * So it is a straight line of light: a unit cylinder shifted to stand on its
   * own base, then positioned at the platform, aimed at the card and stretched
   * to reach it. Three transforms a frame and no geometry work at all.
   */
  const beam = (radius) => {
    const g = keep(new THREE.CylinderGeometry(radius, radius, 1, 8, 1, true));
    g.translate(0, 0.5, 0);
    return g;
  };

  const beams = { core: beam(0.02), halo: beam(0.07) };

  cards.forEach((card) => {
    card.beamCore = keep(tether.clone());
    card.beamHalo = keep(tetherHalo.clone());
  });

  /* Motes --------------------------------------------------------------- */

  // Deterministic scatter. Math.random here would reshuffle the dust on every
  // hot reload and on every remount, which makes a difference in placement
  // impossible to judge against the last one.
  const moteGeo = keep(new THREE.PlaneGeometry(0.16, 0.16));
  const motes = [];
  for (let i = 0; i < 22; i++) {
    const a = i * 2.399963; // golden angle, so no two land on a spoke
    // Capped inside the panels' reach. A mote drifting to x=4 at z=1.6
    // projects wider than the widest panel and is the one thing that would
    // decide the fit — dust setting the scale of the composition.
    const r = 2.2 + ((i * 7) % 11) * 0.1;
    motes.push({
      position: [Math.cos(a) * r, -3.0 + ((i * 13) % 17) * 0.36, Math.sin(a) * 0.9 + 0.7],
      scale: 0.5 + ((i * 5) % 7) * 0.11,
      rate: 0.18 + ((i * 3) % 5) * 0.05,
      phase: i * 1.7,
    });
  }

  return {
    shell,
    shellShade,
    dark,
    joint,
    visor,
    eye,
    lamp,
    badgeMaterial,
    platform,
    platformTop,
    glowSprite,
    ringGlow,
    spill,
    tether,
    tetherHalo,
    mote,
    chipGlass,
    robot,
    podium,
    consolePanel,
    cardGeometry,
    cards,
    chips,
    scenery,
    tethers,
    beams,
    anchorNode,
    anchorPoints,
    moteGeo,
    motes,
    glowPlane: keep(new THREE.PlaneGeometry(1, 1)),
    dispose() {
      painted.forEach((p) => p.stop());
      bin.forEach((x) => x.dispose());
    },
  };
}

/* -------------------------------------------------------------------------
   Robot
   ---------------------------------------------------------------------- */

/**
 * Local origin is the soles. Every number below is a height above the platform,
 * which is the only way a figure this segmented stays adjustable by hand — with
 * one exception worth flagging, because it is the trap: everything inside the
 * head group is measured from the *head*, not from the soles. Numbers in the
 * two frames look identical and are four units apart.
 *
 * The arms are held out at about 54 degrees with the elbows bent forward,
 * rather than hanging. Hanging arms end up behind the console panel, and an
 * arm you cannot see is a limb the composition paid for and did not get: at
 * this pose the hands clear the panel's top corners and the robot reads as
 * presenting the dashboard rather than standing behind it.
 */
const ARM_POSE = { out: 0.95, back: 0.1, elbow: -1.15 };

const Robot = React.forwardRef(function Robot({ a, headRef, eyesRef, haloRef, armRefs }, ref) {
  const { robot, shell, shellShade, dark, joint, visor, eye, lamp, glowSprite, glowPlane } = a;

  const arm = (side, key) => (
    <group
      key={key}
      ref={(el) => {
        armRefs.current[side > 0 ? 1 : 0] = el;
      }}
      position={[side * 0.9, 1.6, 0.02]}
      rotation={[-ARM_POSE.back, 0, side * ARM_POSE.out]}
    >
      <mesh geometry={robot.shoulder} material={shell} />
      <mesh geometry={robot.upperArm} material={dark} position={[0, -0.36, 0]} />
      <group position={[0, -0.66, 0]} rotation={[ARM_POSE.elbow, 0, 0]}>
        <mesh geometry={robot.elbow} material={joint} />
        <mesh geometry={robot.foreArm} material={dark} position={[0, -0.3, 0]} />
        <group position={[0, -0.62, 0]} rotation={[0.22, 0, 0]}>
          <mesh geometry={robot.hand} material={shell} />
          <mesh geometry={robot.thumb} material={shell} position={[side * -0.17, 0.03, 0.02]} />
        </group>
      </group>
    </group>
  );

  // Head-relative, like everything else in the head group. The ear pods sit a
  // touch below the head's centre line, which is where they read as ears
  // rather than as handles.
  const ear = (side, key) => (
    <group key={key} position={[side * 1.06, -0.04, 0]}>
      <mesh geometry={robot.ear} material={shell} />
      {/* The recessed disc on the outer face. A cylinder's axis is +y, so it
          is turned onto x to face outward. */}
      <mesh
        geometry={robot.earInner}
        material={shellShade}
        position={[side * 0.16, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
    </group>
  );

  return (
    <group ref={ref} position={[0, PODIUM_TOP, 0]} scale={ROBOT_SCALE}>
      {/* Torso stack */}
      <mesh geometry={robot.pedestal} material={dark} position={[0, 0.17, 0]} />
      <mesh geometry={robot.torso} material={shell} position={[0, 1.15, 0]} />
      {/* High on the chest rather than centred, so it clears the console's top
          edge. The torso's front face is at z=0.6 and the badge sits a hair
          proud of it, so it never z-fights with the shell as the scene turns. */}
      <mesh geometry={robot.badge} material={a.badgeMaterial} position={[0, 1.42, 0.607]} />
      <mesh geometry={robot.neck} material={dark} position={[0, 1.94, 0]} />

      {[-1, 1].map((s) => arm(s, `arm${s}`))}

      {/* Head. Its own group because it tracks the cursor further than the
          body does — a head that turns with the torso reads as a statue being
          rotated, and one that turns a little more reads as looking. */}
      <group ref={headRef} position={[0, 2.86, 0]}>
        <mesh geometry={robot.head} material={shell} />
        <mesh geometry={robot.visor} material={visor} position={[0, 0.02, 0.71]} />

        <group ref={eyesRef} position={[0, 0.06, 0]}>
          {[-1, 1].map((s) => (
            <mesh key={`eye${s}`} geometry={robot.eye} material={eye} position={[s * 0.32, 0, 0.78]} />
          ))}
        </group>

        {/* The halos are a separate group from the eyes rather than children of
            them. A blink squashes the eye to a slit, and a glow squashed by the
            same factor becomes a slit too — which looks like the light was
            switched off, not like an eyelid. This group takes a gentler squash
            in the frame loop, so the glow dims and flattens without vanishing. */}
        <group ref={haloRef} position={[0, 0.06, 0]}>
          {[-1, 1].map((s) => (
            <mesh
              key={`halo${s}`}
              geometry={glowPlane}
              material={glowSprite}
              position={[s * 0.32, 0, 0.8]}
              scale={0.66}
            />
          ))}
        </group>

        {[-1, 1].map((s) => ear(s, `ear${s}`))}

        <mesh geometry={robot.antenna} material={shellShade} position={[0, 1.04, 0]} />
        <mesh geometry={robot.antennaTip} material={lamp} position={[0, 1.36, 0]} />
        <mesh geometry={glowPlane} material={glowSprite} position={[0, 1.36, 0.02]} scale={0.58} />
      </group>
    </group>
  );
});

/* -------------------------------------------------------------------------
   Platform
   ---------------------------------------------------------------------- */

function Podium({ a, ringRef }) {
  const { podium, platform, platformTop, lamp, ringGlow, spill, anchorNode, anchorPoints } = a;

  return (
    <group>
      <mesh geometry={podium.halo} material={spill} position={[0, PODIUM_TOP - 0.3, -0.9]} />
      <mesh geometry={podium.base} material={platform} position={[0, PODIUM_TOP - 0.32, 0]} />
      <mesh geometry={podium.band} material={lamp} position={[0, PODIUM_TOP - 0.14, 0]} />
      <mesh geometry={podium.top} material={platformTop} position={[0, PODIUM_TOP - 0.05, 0]} />
      <mesh geometry={podium.inlay} material={lamp} position={[0, PODIUM_TOP + 0.04, 0]} />

      {/* The light on the floor. Flat, additive, and turning slowly — the one
          part of the platform that is visibly in motion when nothing else is. */}
      <mesh
        ref={ringRef}
        geometry={podium.ring}
        material={ringGlow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, PODIUM_TOP - 0.19, 0]}
      />

      {anchorPoints.map((p, i) => (
        <mesh key={i} geometry={anchorNode} material={lamp} position={p} />
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------
   Cursor
   ---------------------------------------------------------------------- */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const smoothstep = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/**
 * Tracked on `window`, not on the canvas: the canvas is pointer-events-none so
 * that it never intercepts anything, and the scene should keep answering while
 * the cursor is over the hero copy beside it.
 *
 * Normalised against the canvas's own centre rather than the viewport's, so
 * "toward the middle" means toward the robot, and the far side of the page is
 * genuinely neutral rather than merely fully deflected.
 */
function useCursorTarget(enabled) {
  const target = useRef({ x: 0, y: 0 });
  const { gl } = useThree();

  useEffect(() => {
    if (!enabled) return undefined;

    const el = gl.domElement;
    let rect = el.getBoundingClientRect();
    // Cached: reading it on every pointermove forces layout.
    const measure = () => {
      rect = el.getBoundingClientRect();
    };

    const onMove = (e) => {
      if (!rect.width || !rect.height) return;
      const radius = Math.max(rect.width, rect.height) * 0.85;
      const dx = (e.clientX - (rect.left + rect.width / 2)) / radius;
      const dy = -(e.clientY - (rect.top + rect.height / 2)) / radius;
      // Past ~2.4 radii the cursor is somewhere else on the page entirely, and
      // the scene should be at rest rather than pinned at full deflection.
      const falloff = 1 - smoothstep(1.2, 2.4, Math.hypot(dx, dy));
      target.current.x = clamp(dx, -1.5, 1.5) * falloff;
      target.current.y = clamp(dy, -1.5, 1.5) * falloff;
    };

    const rest = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('blur', rest);
    document.addEventListener('pointerleave', rest);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('blur', rest);
      document.removeEventListener('pointerleave', rest);
    };
  }, [enabled, gl]);

  return target;
}

/* -------------------------------------------------------------------------
   Composition
   ---------------------------------------------------------------------- */

// Spring, not lerp. A lerp reaches its target and stops; the brief's "subtle
// twirl" needs inertia, which needs a velocity to overshoot with. Underdamped
// slightly at zeta 0.8, so it settles in about three quarters of a second with
// one small overshoot and no ring.
const SPRING_K = 38;
const SPRING_C = 2 * 0.8 * Math.sqrt(SPRING_K);

// How far the root turns at full deflection. 0.34rad is about 19 degrees — far
// enough that the panels visibly change their relationship to each other, short
// of the point where the composition starts presenting its own back.
const TURN_Y = 0.34;
const TURN_X = 0.2;

const BLINK_EVERY = 5.4;
const BLINK_FOR = 0.16;
// Without this the period starts inside a blink, so the scene opens on a robot
// caught mid-wink and holds it there for as long as the first frames take to
// come through. The eyes are the first thing anyone looks at; they should be
// open when they are first seen.
const BLINK_AFTER = 2.2;

function blink(t) {
  const p = (t + BLINK_EVERY - BLINK_AFTER) % BLINK_EVERY;
  if (p > BLINK_FOR) return 1;
  return 1 - Math.sin((p / BLINK_FOR) * Math.PI) * 0.94;
}

function Composition({ interactive, idle, compact, bridge }) {
  const { gl, invalidate, camera, viewport, size } = useThree();

  const assets = useMemo(() => createAssets(gl, invalidate), [gl, invalidate]);
  useEffect(() => () => assets.dispose(), [assets]);

  // The framing no longer changes with scroll, so it is solved in render and
  // applied as props. That is also what holds the composition together for a
  // reduced-motion visitor, whose canvas never runs a frame loop at all.
  const fit = solveFit(viewport, compact);

  const rootRef = useRef();
  const panelLayerRef = useRef();
  const chipLayerRef = useRef();
  const robotRef = useRef();
  const headRef = useRef();
  const eyesRef = useRef();
  const haloRef = useRef();
  const ringRef = useRef();
  const armRefs = useRef([]);
  const consoleRef = useRef();
  const cardRefs = useRef([]);
  const plateRefs = useRef([]);
  const contentRefs = useRef([]);
  const beamRefs = useRef([]);
  const chipRefs = useRef([]);
  const moteRefs = useRef([]);

  const target = useCursorTarget(interactive);
  const motion = useRef({ x: 0, y: 0, vx: 0, vy: 0, time: 0 });

  // Under frameloop="demand" nothing draws until something asks. Required for
  // the static reduced-motion render to appear at all; harmless under "always".
  useEffect(() => {
    invalidate();
  }, [invalidate, assets]);

  useFrame((_, rawDelta) => {
    if (!interactive && !idle) return;

    // Clamped: a backgrounded tab hands back a delta measured in seconds, and
    // the spring would fling the composition off screen.
    const dt = Math.min(rawDelta, 1 / 30);
    const m = motion.current;
    m.time += dt;
    const t = m.time;

    if (interactive) {
      const tg = target.current;
      m.vx += (tg.x - m.x) * SPRING_K * dt;
      m.vy += (tg.y - m.y) * SPRING_K * dt;
      m.vx -= m.vx * SPRING_C * dt;
      m.vy -= m.vy * SPRING_C * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
    }

    // The whole composition, as one body. The idle term is a very slow figure
    // that never repeats on a round number, so a visitor who leaves the page
    // open does not start seeing a loop.
    if (rootRef.current) {
      const sway = idle ? Math.sin(t * 0.17) * 0.028 + Math.sin(t * 0.073) * 0.016 : 0;
      rootRef.current.rotation.y = m.x * TURN_Y + sway;
      rootRef.current.rotation.x = -m.y * TURN_X + (idle ? Math.sin(t * 0.13) * 0.012 : 0);
      rootRef.current.position.x = m.x * 0.14;
      rootRef.current.position.y = -m.y * 0.08;
    }

    // Layer parallax, deliberately small. The depth is already carried by the
    // root's perspective; this only opens the gaps between the layers as it
    // turns, so the panels separate from the robot instead of sliding with it.
    if (panelLayerRef.current) panelLayerRef.current.rotation.y = -m.x * 0.09;
    if (chipLayerRef.current) {
      chipLayerRef.current.rotation.y = -m.x * 0.16;
      chipLayerRef.current.position.x = m.x * 0.1;
    }

    if (robotRef.current && idle) {
      robotRef.current.position.y = PODIUM_TOP + Math.sin(t * 0.85) * 0.045;
    }

    if (headRef.current) {
      headRef.current.rotation.y = m.x * 0.3 + (idle ? Math.sin(t * 0.41) * 0.035 : 0);
      headRef.current.rotation.x = -m.y * 0.18 + (idle ? Math.sin(t * 0.53) * 0.02 : 0);
      headRef.current.rotation.z = m.x * 0.05;
    }

    if (eyesRef.current) {
      const k = idle ? blink(t) : 1;
      eyesRef.current.scale.y = k;
      // Two thirds of the blink, not all of it: the glow flattens with the eye
      // but never goes out, which is what an eyelid crossing a lit surface
      // actually looks like.
      if (haloRef.current) haloRef.current.scale.y = 0.34 + 0.66 * k;
    }

    if (idle) {
      for (let i = 0; i < armRefs.current.length; i++) {
        const el = armRefs.current[i];
        if (!el) continue;
        const side = i === 0 ? -1 : 1;
        el.rotation.z = side * (ARM_POSE.out + Math.sin(t * 0.7 + i * 1.9) * 0.035);
        el.rotation.x = -ARM_POSE.back + Math.sin(t * 0.55 + i) * 0.03;
      }

      if (consoleRef.current) {
        const [amp, rate, phase] = CONSOLE_PANEL.float;
        consoleRef.current.position.y =
          CONSOLE_PANEL.position[1] + Math.sin(t * rate * Math.PI + phase) * amp;
      }

      for (let i = 0; i < chipRefs.current.length; i++) {
        const el = chipRefs.current[i];
        if (!el) continue;
        const c = CHIPS[i];
        const [amp, rate, phase] = c.float;
        el.position.y = c.position[1] + Math.sin(t * rate * Math.PI + phase) * amp;
        el.rotation.y = t * c.spin;
        el.rotation.x = Math.sin(t * rate + phase) * 0.14;
      }

      for (let i = 0; i < moteRefs.current.length; i++) {
        const el = moteRefs.current[i];
        if (!el) continue;
        const s = assets.motes[i];
        el.position.y = s.position[1] + Math.sin(t * s.rate + s.phase) * 0.42;
      }

      if (ringRef.current) ringRef.current.rotation.z = t * 0.06;
    }

    /* ── The ring, and the card that leaves it ──────────────────────────── */

    const count = ORBIT_ART.length;
    const run = bridge.run;

    // Idle drift plus the scroll-driven turn. The scroll term is what makes the
    // ring *present* products rather than merely revolve: it holds still while
    // one is out at the centre and turns exactly one slot to bring on the next.
    const spin = (idle ? t * ORBIT.speed : 0) - (ringTurn(run, count) * TAU) / count;

    // Where a card lands when it has fully arrived, solved rather than written
    // down. The target is the DOM card's own measured size, so the plate grows
    // to exactly the shape of the thing it becomes — the handover cannot drift
    // when the copy, the breakpoint or the card's CSS changes.
    const depth = camera.position.z - PRES_Z;
    const visibleH = 2 * Math.tan(((camera.fov * Math.PI) / 180) / 2) * depth;
    const visibleW = visibleH * (size.width / size.height || 1);
    const presWorldY = PRES_NDC_Y * visibleH * 0.5;

    // How far the composition has stood down for whichever card is furthest
    // out. Taken as the maximum rather than the active card's own flight so it
    // is continuous across a handover, where one card is still returning while
    // the next has started to leave.
    let sceneFade = 0;
    for (let i = 0; i < count; i++) sceneFade = Math.max(sceneFade, cardFlight(i, run));
    const sceneOn = 1 - sceneFade;

    for (let s = 0; s < assets.scenery.length; s++) {
      const item = assets.scenery[s];
      item.mat.opacity = item.base * sceneOn;
      item.mat.visible = sceneOn > 0.004;
    }

    for (let i = 0; i < count; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      const at = orbitAt(i, count, spin);
      const f = cardFlight(i, run);
      const e = easeInOut(f);

      // This card's own landing size. A ring card is 1.6 wide for 1 tall and
      // the HTML card it becomes is not, so the plate has to change shape on
      // the way in as well as grow — otherwise it arrives the right width and
      // the wrong height, and the swap is a visible jump.
      //
      // The stretch goes on the plate alone. The dashboard riding on it keeps
      // its own proportions and simply fades, because a chart squashed by a
      // third on its way to the centre is worse than no chart at all.
      const domW = bridge.cardW[i] || 0;
      const domH = bridge.cardH[i] || 0;
      const presWorldW = domW > 0 ? (domW / size.width) * visibleW : ORBIT.w;
      const presScale = presWorldW / ORBIT.w / (fit.scale || 1);
      const presStretch =
        domW > 0 && domH > 0 ? (domH / domW) * (ORBIT.w / ORBIT.h) : 1;

      const plateMesh = plateRefs.current[i];
      if (plateMesh) plateMesh.scale.set(1, mix(1, presStretch, e), 1);

      if (e > 0.0005) {
        // The landing point is a *world* position — it has to be, because it
        // is defined by where the camera puts it on screen. Bringing it back
        // through the card's own parent is what lets the ring keep its cursor
        // turn without dragging the presented card off centre with it.
        el.parent.updateWorldMatrix(true, false);
        DESIRED.set(0, presWorldY, PRES_Z);
        el.parent.worldToLocal(DESIRED);

        el.position.set(
          mix(at.x, DESIRED.x, e),
          mix(at.y, DESIRED.y, e),
          mix(at.z, DESIRED.z, e),
        );

        // Square-on to the camera at the end, whatever its parents are doing —
        // the inverse of the parent's world rotation is the local orientation
        // that cancels out to none.
        el.parent.getWorldQuaternion(Q_PARENT);
        Q_FACE.copy(Q_PARENT).invert();
        Q_RING.setFromEuler(EULER.set(0, at.ry, 0));
        el.quaternion.slerpQuaternions(Q_RING, Q_FACE, e);

        el.scale.setScalar(mix(1, presScale, e));
      } else {
        el.position.set(at.x, at.y, at.z);
        el.quaternion.setFromEuler(EULER.set(0, at.ry, 0));
        el.scale.setScalar(1);
      }

      // Two layers, fading at different times, and that separation is the whole
      // trick of the handover.
      //
      // The dashboard leaves first, well before the card has landed — by the
      // time the DOM takes over there is nothing on the plate to double-expose
      // against the heading that replaces it. The plate itself stays until the
      // last moment and then crossfades into the HTML card, which is also a
      // plate: the only thing that visibly changes at the swap is that text
      // appears on a surface that was already there.
      //
      // Both run backwards on the way out, so a receding card puts its
      // dashboard back on as it rejoins the ring.
      //
      // `own` is what exempts the card being presented from the fade the rest
      // of the composition is under: for that card it works out to 1, and for
      // the two still on the ring it is the same dimming everything else gets.
      const own = clamp01(sceneOn + f);
      const plateShown = (1 - handoff(f)) * own;
      const contentShown = plateShown * (1 - smoothstep(0.6, 0.85, f));
      assets.cards[i].plate.opacity = plateShown;
      assets.cards[i].material.opacity = contentShown;
      el.visible = plateShown > 0.004;
      if (contentRefs.current[i]) contentRefs.current[i].visible = contentShown > 0.004;

      // The tether belongs to the ring, so it stays on the ring slot and fades
      // out as the card leaves rather than stretching after it.
      const beam = beamRefs.current[i];
      if (beam) {
        // Doubly dimmed: by its own card leaving the ring, and by the ring
        // standing down while any card is being presented.
        const lit = (1 - smoothstep(0, 0.32, f)) * sceneOn;
        assets.cards[i].beamCore.opacity = 0.38 * lit;
        assets.cards[i].beamHalo.opacity = 0.1 * lit;
        beam.visible = lit > 0.008;
        if (beam.visible) {
          const b = beamAt(at, BEAM_TO);
          beam.position.set(b.ax, b.ay, b.az);
          beam.quaternion.setFromUnitVectors(UNIT_Y, BEAM_TO);
          beam.scale.set(1, b.length, 1);
        }
      }
    }
  });

  // The ring's resting pose, as props. Under reduced motion this is the only
  // pose there will ever be, so it has to be a real one.
  const neutral = useMemo(() => {
    const scratch = new THREE.Vector3();
    return ORBIT_ART.map((_, i) => {
      const at = orbitAt(i, ORBIT_ART.length, 0);
      const b = beamAt(at, scratch);
      return {
        card: { position: [at.x, at.y, at.z], rotation: [0, at.ry, 0] },
        beam: {
          position: [b.ax, b.ay, b.az],
          quaternion: new THREE.Quaternion().setFromUnitVectors(UNIT_Y, scratch),
          scale: [1, b.length, 1],
        },
      };
    });
  }, []);

  return (
    <group scale={fit.scale} position={[fit.x, fit.y, 0]}>
    <group ref={rootRef}>
      <Podium a={assets} ringRef={ringRef} />

      <Robot
        ref={robotRef}
        a={assets}
        headRef={headRef}
        eyesRef={eyesRef}
        haloRef={haloRef}
        armRefs={armRefs}
      />

      {/* Tethers. Two meshes per run: a thin bright core and a wide dim halo,
          which is how a glow is faked without a bloom pass — and a bloom pass
          is a full-screen effect on a transparent canvas for one decorative
          object, which is not a trade worth making above the fold. */}
      <group>
        {assets.tethers.map((tt, i) => (
          <group key={i}>
            <mesh geometry={tt.core} material={assets.tether} />
            <mesh geometry={tt.halo} material={assets.tetherHalo} />
          </group>
        ))}
      </group>

      <group ref={panelLayerRef}>
        <mesh
          ref={consoleRef}
          geometry={assets.consolePanel.geometry}
          material={assets.consolePanel.material}
          position={assets.consolePanel.position}
          rotation={assets.consolePanel.rotation}
        />

        {/* The ring at rest. The frame loop overwrites all of this on its
            first tick — but when there is no frame loop, which is exactly what
            a reduced-motion visitor gets, this is the composition. */}
        {assets.cards.map((card, i) => (
          <group key={card.art}>
            {/* The plate carries the transform; the dashboard rides on it a
                hair in front, close enough to share its lighting-free flatness
                and far enough not to z-fight as the card turns. */}
            <group
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              position={neutral[i].card.position}
              rotation={neutral[i].card.rotation}
            >
              <mesh
                ref={(el) => {
                  plateRefs.current[i] = el;
                }}
                geometry={assets.cardGeometry}
                material={card.plate}
              />
              <mesh
                ref={(el) => {
                  contentRefs.current[i] = el;
                }}
                geometry={assets.cardGeometry}
                material={card.material}
                position={[0, 0, 0.004]}
              />
            </group>
            <group
              ref={(el) => {
                beamRefs.current[i] = el;
              }}
              position={neutral[i].beam.position}
              quaternion={neutral[i].beam.quaternion}
              scale={neutral[i].beam.scale}
            >
              <mesh geometry={assets.beams.core} material={card.beamCore} />
              <mesh geometry={assets.beams.halo} material={card.beamHalo} />
            </group>
          </group>
        ))}
      </group>

      <group ref={chipLayerRef}>
        {assets.chips.map((c, i) => (
          <group
            key={c.icon}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            position={c.position}
          >
            <mesh geometry={c.body} material={assets.chipGlass} />
            <mesh geometry={c.face} material={c.material} position={[0, 0, c.size * 0.52]} />
          </group>
        ))}

        {assets.motes.map((s, i) => (
          <mesh
            key={i}
            ref={(el) => {
              moteRefs.current[i] = el;
            }}
            geometry={assets.moteGeo}
            material={assets.mote}
            position={s.position}
            scale={s.scale}
          />
        ))}
      </group>
    </group>
    </group>
  );
}

/* -------------------------------------------------------------------------
   Lights
   ---------------------------------------------------------------------- */

/**
 * Four lights and no more. Key from the upper front left, a cool fill from the
 * right so the shadowed side of the white shell does not go flat, a cyan rim
 * from behind to separate the robot from the background, and a small point
 * light inside the platform so the shell is lit from below the way it would be
 * standing on something that glows.
 *
 * No shadow maps: the caster is a light object on a light platform against a
 * dark page, the contact is already read from the platform's own geometry, and
 * a shadow pass here would cost more than it shows.
 */
function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.62} color="#B9C6DE" />
      <directionalLight position={[-5, 7, 9]} intensity={2.0} />
      <directionalLight position={[7, -1, 5]} intensity={0.65} color="#9FB6D8" />
      <directionalLight position={[1, 4, -9]} intensity={0.9} color="#7FC4DA" />
      <pointLight position={[0, PODIUM_TOP + 0.4, 1.1]} intensity={9} distance={7} decay={2} color="#4FD8F0" />
    </>
  );
}

/* -------------------------------------------------------------------------
   Scene
   ---------------------------------------------------------------------- */

export default function HeroAIConsoleScene({
  interactive = true,
  idle = true,
  compact = false,
  bridge,
}) {
  const [ready, setReady] = useState(false);

  return (
    <div
      className={`h-full w-full transition-opacity duration-[1200ms] ease-brand ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Canvas
        // demand when nothing moves: a reduced-motion visitor gets one render
        // and then an idle GPU, rather than sixty static frames a second. It is
        // also what holds the composition in its hero framing for them — the
        // stage's phase is only ever applied from inside the frame loop, so a
        // canvas that never runs one never moves.
        frameloop={!interactive && !idle ? 'demand' : 'always'}
        // A long lens. Wide angles bend the cards' straight edges and put the
        // robot's nearest surfaces through a fisheye; at 26 degrees the
        // composition keeps the flat, product-shot perspective of the brief.
        camera={{ position: [0, 0, 17], fov: 26, near: 1, far: 60 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={() => setReady(true)}
      >
        <StudioLights />
        <Composition interactive={interactive} idle={idle} compact={compact} bridge={bridge} />
      </Canvas>
    </div>
  );
}
