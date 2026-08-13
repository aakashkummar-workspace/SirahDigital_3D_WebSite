import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

/**
 * The ribbon the logo particles form at the bottom of the page.
 *
 * There is no ribbon *object* here. Nothing in this file is ever rendered — it
 * exists only to answer one question for each of the eighteen thousand
 * particles in SirahCanvas: "where do I go?" The band is a shape to be sampled,
 * and the cloud is what you actually see.
 *
 * That is the second design. The first built a real extruded band with a
 * mirrored, iridescent material and had the particles dissolve into it as they
 * arrived. It worked, and it was wrong: what you got at the end of the scroll
 * was a foreign glassy object with no relationship to the mark it came from,
 * and every hard problem in it — prefiltered environments, metalness, the
 * renderer lifecycle — was in service of a thing that should not have been
 * there. The particles were always the point.
 *
 * ── why the sampling source is still a solid ─────────────────────────────
 * The band is extruded with real width and thickness even though it is
 * invisible, because MeshSurfaceSampler scatters points over a *surface*. Given
 * a flat strip the cloud would form a sheet one particle deep, which from the
 * side is a line. Given a band with a cross-section, it wraps a form that has
 * edges and turns and can be seen from any angle — which is what makes the
 * result read as a ribbon rather than as a smear.
 */

/**
 * The path, as a hand-placed meander — and it runs down the page, not across.
 *
 * Sized against the camera SirahCanvas uses: 45° at z=9 puts the visible half
 * height at 3.7, so a band reaching y=±5.7 runs off the top and the bottom of
 * the screen at every scroll position. That overflow is the point. The canvas
 * is fixed to the viewport, so a ribbon taller than the viewport never shows an
 * end — it reads as something flowing past the page rather than an ornament
 * sitting on it.
 *
 * It stays well inside the horizontal extent for the same reason it exceeds the
 * vertical one: a band that also ran off both sides would read as a wall.
 * Narrow and tall, it leaves the copy its column.
 *
 * The z values are what stop it reading as a flat squiggle. Each fold sits at a
 * different depth, so the band crosses in front of and behind itself as it
 * turns, and the perspective does the rest.
 */
const PATH = [
  [1.6, 5.8, -1.1],
  [0.2, 4.3, 0.9],
  [-1.5, 3.1, 1.5],
  [-2.3, 1.5, 0.3],
  [-1.1, 0.1, -1.1],
  [0.8, -0.8, -0.7],
  [1.9, -2.0, 0.8],
  [0.9, -3.2, 1.4],
  [-0.9, -4.1, 0.5],
  [-2.1, -5.6, -1.0],
];

const WIDTH = 0.62;
const THICK = 0.16;
const STEPS = 280;

/** Rounded rectangle as a Shape — the band's cross-section. */
function crossSection(w, t) {
  const hw = w / 2;
  const ht = t / 2;
  const r = ht * 0.92; // very nearly a stadium, so the edges read as rounded

  const s = new THREE.Shape();
  s.moveTo(-hw + r, -ht);
  s.lineTo(hw - r, -ht);
  s.quadraticCurveTo(hw, -ht, hw, -ht + r);
  s.lineTo(hw, ht - r);
  s.quadraticCurveTo(hw, ht, hw - r, ht);
  s.lineTo(-hw + r, ht);
  s.quadraticCurveTo(-hw, ht, -hw, ht - r);
  s.lineTo(-hw, -ht + r);
  s.quadraticCurveTo(-hw, -ht, -hw + r, -ht);
  return s;
}

export function buildRibbonGeometry() {
  const curve = new THREE.CatmullRomCurve3(
    PATH.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    false,
    'centripetal',
    0.5,
  );

  const geometry = new THREE.ExtrudeGeometry(crossSection(WIDTH, THICK), {
    extrudePath: curve,
    steps: STEPS,
    bevelEnabled: false,
  });

  // Extrude builds the band around the path's own origin; centring it means the
  // ribbon turns about itself rather than swinging around a point off to one
  // side when the field sways.
  geometry.computeBoundingBox();
  const mid = geometry.boundingBox.getCenter(new THREE.Vector3());
  geometry.translate(-mid.x, -mid.y, -mid.z);
  geometry.computeVertexNormals();

  return geometry;
}

/* -------------------------------------------------------------------------
   When the ribbon exists
   ---------------------------------------------------------------------- */

const smoothstep = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Forming is not the reverse of releasing, and that asymmetry is the idea
 * rather than a side effect of it.
 *
 * Going down, the band is formed within the first third of a screen and then
 * simply exists for the rest of the site — it is the background, not a reward
 * for reaching the footer. An earlier version finished forming at 96% of the
 * page and so was only ever seen by someone who scrolled to the very end.
 *
 * Coming back up it does not simply rewind: it holds its shape well past where
 * it formed, drifting, and only lets go in the top tenth of the page, where it
 * dissolves back into the mark.
 *
 * That is a Schmitt trigger. Which curve is in force depends on which side of
 * the middle the ribbon is *currently* on, so the two thresholds cannot
 * chatter against each other — once it has formed, only the release curve can
 * take it apart, and once it has released, only the forming curve can build it.
 *
 * The rates are asymmetric on top of that: forming is twice the speed of
 * releasing, so the trip back is the slow, floating one.
 */
const FORM_FROM = 0.02;
const FORM_TO = 0.3;
const RELEASE_FROM = 0.0;
const RELEASE_TO = 0.12;
// Both slow, deliberately. The band is a cloud of eighteen thousand specks
// finding a new arrangement, and it should look like it is being drawn into
// shape rather than snapping to it — and like it is letting go on the way back,
// not being switched off. Releasing is slower still, which is what leaves the
// ribbon hanging there, drifting, long after the scroll that formed it.
const FORM_EASE = 0.55;
const RELEASE_EASE = 0.3;

export function solveRibbon(current, scrolled, dt) {
  const goal =
    current > 0.5
      ? smoothstep(RELEASE_FROM, RELEASE_TO, scrolled)
      : smoothstep(FORM_FROM, FORM_TO, scrolled);

  const rate = goal > current ? FORM_EASE : RELEASE_EASE;
  return current + (goal - current) * Math.min(1, dt * rate);
}

/**
 * Points on the ribbon's surface, one per particle, so the cloud has somewhere
 * to fly to.
 *
 * Sampled by area rather than taken from the vertices: the extrusion's vertices
 * run in rings along the path, so using them would land every particle on a
 * seam and the cloud would arrive as a set of hoops instead of a skin.
 *
 * Deliberately not shuffled against the logo's ordering. Each particle keeps
 * whichever ribbon point it drew, so a given speck travels from its own place
 * on the mark to its own place on the band — the paths cross, which is what
 * makes the move read as a swarm reorganising rather than a shape sliding.
 */
export function sampleRibbonSurface(geometry, count) {
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry))
    .setWeightAttribute(null)
    .build();

  const out = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    sampler.sample(p, n);
    // Lifted just off the surface so the cloud sits *on* the band rather than
    // half-buried in it while the two are crossfading.
    out[i * 3] = p.x + n.x * 0.05;
    out[i * 3 + 1] = p.y + n.y * 0.05;
    out[i * 3 + 2] = p.z + n.z * 0.05;
  }

  return out;
}
