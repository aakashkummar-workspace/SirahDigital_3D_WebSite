"use client";
// EXPERIMENTAL: Living Automation Core
// Safe to remove without affecting the rest of the website.

import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

/**
 * The scene itself. Rendered only by LivingAutomationCore, which handles the
 * dynamic import, the breakpoint and the reduced-motion check.
 *
 * ── The form ─────────────────────────────────────────────────────────────
 * One machined puck — bevelled rims, a recessed accent seam, a raised top
 * face — sitting inside a thin halo that carries three nodes.
 *
 * The systems a business already runs, the automation threaded through them,
 * the outcome on top. Said as a form rather than a sequence: nothing is
 * labelled and nothing points at anything, which is the difference between an
 * object and a diagram.
 *
 * Three forms were rejected getting here, recorded so they are not retried:
 * a faceted icosahedron read as an asteroid; a smooth sphere read as a planet
 * the moment a ring went round it; three stacked discs of decreasing radius
 * read as a tiered cake stand. A single body with one seam says the same thing
 * and reads as a device.
 *
 * Nothing moves but the three nodes drifting round the halo. Everything else
 * is still until the cursor asks it to tilt — that is what keeps this an
 * object rather than an animation.
 *
 * ── Why plain three geometry ─────────────────────────────────────────────
 * Cylinders, toruses and spheres from three itself: no drei helpers, no loaded
 * assets. An Environment map would be the easy way to get convincing
 * reflections, but it fetches an HDR at runtime — a network dependency and a
 * few hundred KB for a decorative object in the hero. Three explicit lights
 * cost nothing and are easier to keep restrained.
 */

const ACCENT = '#22D3EE';

/**
 * Outer ring radius. Sized so the object sits well inside its column with
 * generous margin — it must never approach an edge. The first pass had this at
 * 1.62 and the ring nearly touched the frame, which turned a sculptural object
 * into a big thin circle.
 */
const OUTER_R = 1.34;

/**
 * The object's resting pose: a three-quarter view from slightly above.
 *
 * This MUST live on its own group, inside the one the cursor drives. Setting
 * it as a rotation prop on the driven group itself means the tilt lerp treats
 * the base pose as a starting error and drags it to zero — the object flattens
 * to edge-on within a second of load, and what should be a 7 degree tilt
 * becomes a 29 degree swing between the pose and nothing. That was the first
 * version of this file and it is an easy mistake to repeat.
 */
const BASE_POSE = [0.42, -0.32, 0.04];

/** Max tilt in radians: ~7.5 deg of yaw, ~5 deg of pitch. */
const MAX_YAW = 0.13;
const MAX_PITCH = 0.09;

function Core({ interactive, idle }) {
  const tilt = useRef(null);
  const halo = useRef(null);
  const core = useRef(null); // the body; kept for the cursor group hierarchy

  // Pointer is written by a window listener into a ref, never into state:
  // this updates every mousemove, and a re-render per event would be the
  // entire frame budget for nothing.
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!interactive) return undefined;
    const onMove = (e) => {
      // Normalised to -1..1 against the viewport, not the canvas, so the
      // object keeps reacting while the cursor is over the hero copy. Reacting
      // only within its own box is what makes these feel inert.
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [interactive]);

  useFrame((state, delta) => {
    // Clamp: a background tab or a slow frame produces a large delta, and an
    // unclamped one makes the object jump when attention returns.
    const d = Math.min(delta, 0.1);

    if (tilt.current) {
      const targetYaw = interactive ? pointer.current.x * MAX_YAW : 0;
      const targetPitch = interactive ? pointer.current.y * MAX_PITCH : 0;

      // Framerate-independent lerp. The 3.2 is the responsiveness: high enough
      // to feel connected, low enough that it trails the cursor rather than
      // being pinned to it.
      const k = 1 - Math.exp(-3.2 * d);
      tilt.current.rotation.y += (targetYaw - tilt.current.rotation.y) * k;
      tilt.current.rotation.x += (targetPitch - tilt.current.rotation.x) * k;
    }

    if (idle) {
      // The nodes drift round the halo — one lap takes ~90s. Slow enough that
      // you never catch them moving, fast enough that the object is somewhere
      // different when you look back. Spinning the accent rim instead would be
      // invisible: it is a perfect circle.
      if (halo.current) halo.current.rotation.y += d * 0.07;
      // The body itself does not turn: it is a solid of revolution, so
      // rotating it about Y changes not one pixel. Only the nodes move.
    }
  });

  // Three nodes seated on the outer ring. Fixed, not animated — they belong to
  // the object and move only when it tilts.
  const nodes = useMemo(
    () => [0.7, 2.75, 4.5].map((a) => [Math.cos(a) * OUTER_R, -0.3, Math.sin(a) * OUTER_R]),
    [],
  );

  return (
    // Outer group: cursor tilt only, resting at identity.
    // Inner group: the fixed three-quarter pose. Keeping these apart is what
    // makes the tilt a deviation FROM the pose rather than a move toward zero.
    <group ref={tilt}>
      <group rotation={BASE_POSE}>
      {/*
        Materials are deliberately LOW metalness. A metal in three.js is almost
        entirely reflective and barely diffuse, so with no environment map to
        reflect it renders near-black — which is exactly what metalness 0.98
        did here. The brief asks for "dark matte metal / ceramic", and ceramic
        is non-metallic, so low metalness with mid roughness is both the
        correct material and the one that survives having no env map.
      */}

      {/* ── The body ───────────────────────────────────────────────────────
          One machined puck with a recessed accent seam and a raised top face.

          This replaced a three-tier stack of decreasing radius. The stack said
          "layers" honestly enough, but three shrinking discs read as a tiered
          cake stand, which is not the register this is meant to be in. A
          single body with one seam says the same thing — a system with
          something running through it — and reads as a device.

          The chamfer rings at top and bottom are the "soft bevels" the brief
          asks for: a cylinder has hard 90-degree edges, and a thin torus of
          the same material at each rim rounds them off for two extra draw
          calls. */}
      <group ref={core}>
        <mesh>
          <cylinderGeometry args={[0.74, 0.74, 0.5, 96]} />
          <meshStandardMaterial color="#2f2b60" metalness={0.28} roughness={0.5} />
        </mesh>

        {/* Bevels. */}
        <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.74, 0.026, 14, 120]} />
          <meshStandardMaterial color="#3b3676" metalness={0.32} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.74, 0.026, 14, 120]} />
          <meshStandardMaterial color="#262252" metalness={0.28} roughness={0.55} />
        </mesh>

        {/* The seam — the automation running through the system. Inset, so it
            reads as a groove catching light rather than a band stuck on. */}
        <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.735, 0.009, 12, 160]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={0.6}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Raised top face — the outcome. Proud of the body by a few
            millimetres, lighter, so the eye finishes here. */}
        <mesh position={[0, 0.275, 0]}>
          <cylinderGeometry args={[0.56, 0.56, 0.055, 96]} />
          <meshStandardMaterial color="#4b4596" metalness={0.36} roughness={0.28} />
        </mesh>
      </group>

      {/* ── The halo ───────────────────────────────────────────────────────
          One thin wire ring around the body, in its own plane. It gives the
          object somewhere to sit and keeps the composition circular without
          adding another solid. */}
      <mesh position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[OUTER_R, 0.008, 12, 180]} />
        <meshStandardMaterial color="#5b5590" metalness={0.3} roughness={0.45} />
      </mesh>

      <group ref={halo}>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.026, 20, 20]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            // Low enough that a node reads as catching the light rather than
            // being one. The object has to hold up with the glow removed.
            emissiveIntensity={0.5}
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>
      ))}
      </group>
      </group>
    </group>
  );
}

export default function LivingAutomationCoreScene({ interactive = true, idle = true, scale = 1 }) {
  return (
    <Canvas
      // Retina is wasted on a matte object with no fine detail, and the cap is
      // the difference between this being free and being noticeable on a phone.
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.6], fov: 33 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      // The hero background shows through; the canvas paints nothing of its own.
      style={{ background: 'transparent' }}
    >
      {/* Dark ambient, one key, one cool rim. No environment map, no bloom. */}
      <ambientLight intensity={0.4} color="#6f79a8" />
      <directionalLight position={[3.2, 4.2, 3.4]} intensity={4.2} color="#ffffff" />
      <pointLight position={[-3.4, -1.2, -2.2]} intensity={9} color={ACCENT} distance={11} decay={2} />
      <pointLight position={[1.2, 2.2, 3.6]} intensity={7} color="#dfe5ff" distance={11} decay={2} />

      <group scale={scale}>
        <Core interactive={interactive} idle={idle} />
      </group>
    </Canvas>
  );
}
