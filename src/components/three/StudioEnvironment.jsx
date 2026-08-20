"use client";
import React from 'react';
import { Environment, Lightformer } from '@react-three/drei';

/*
 * A studio environment map, built in-scene.
 *
 * ── why this exists ──────────────────────────────────────────────────────
 * This replaces `<Environment preset="studio" />`. That prop is not a local
 * asset: drei resolves it to a ~1MB HDR on GitHub's raw CDN
 * (raw.githubusercontent.com/pmndrs/drei-assets/.../studio_small_03_1k.hdr)
 * and fetches it at runtime, on the visitor's connection, every cold load.
 *
 * GitHub rate-limits that host. When it answers 429 the fetch throws inside
 * the R3F render loop, which is not a recoverable error — it takes the whole
 * page down with "Unhandled Runtime Error", not just the canvas. A marketing
 * site losing every route to a third-party CDN's rate limiter is not a
 * tradeoff worth keeping for a reflection map.
 *
 * `<Environment>` with children renders its own cube target from the
 * lightformers below instead of loading a file, so there is no network call,
 * nothing to rate-limit, no load delay, and it works offline.
 *
 * ── the rig ──────────────────────────────────────────────────────────────
 * Four panels approximating a softbox setup: a large key above and in front,
 * a softer fill from camera-left, a tighter rim from behind-right to catch
 * the mark's edges as it turns, and a dim floor bounce so the underside is
 * not black. Intensities are set for materials at roughness ~0.16 and
 * metalness ~0.38 — the mark reads as polished metal, and it is the key panel
 * that produces the long highlight sliding across it during the rotation.
 *
 * `resolution={256}` because nothing here needs a sharp reflection: the
 * panels are soft shapes and the material's clearcoat blurs them further. 256
 * is a quarter of the memory of the default 512 with no visible difference at
 * this roughness.
 */
export default function StudioEnvironment() {
  return (
    <Environment resolution={256}>
      {/* Key — broad, above and forward. The main highlight. */}
      <Lightformer
        intensity={2.2}
        color="#ffffff"
        position={[0, 4, 4]}
        rotation={[-Math.PI / 3, 0, 0]}
        scale={[10, 10, 1]}
      />

      {/* Fill — camera-left, softer, keeps the shadow side readable. */}
      <Lightformer
        intensity={0.9}
        color="#ffffff"
        position={[-5, 1, 1]}
        rotation={[0, -Math.PI / 2, 0]}
        scale={[10, 6, 1]}
      />

      {/* Rim — behind and right, tighter and slightly cool, so the silhouette
          separates from the dark page behind the canvas. */}
      <Lightformer
        intensity={1.3}
        color="#dbeafe"
        position={[5, 1, -2]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[10, 6, 1]}
      />

      {/* Floor bounce — dim, or the underside of the mark goes to black. */}
      <Lightformer
        intensity={0.45}
        color="#ffffff"
        position={[0, -4, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[10, 10, 1]}
      />
    </Environment>
  );
}
