"use client";
import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { buildLogoGeometry } from './SirahCanvas';

/*
 * The 3D mark for the closing CTA.
 *
 * Kept in its own lazily-imported module and mounted only once the CTA is
 * near the viewport, so a visitor who never scrolls that far never pays for a
 * second WebGL context. dpr is capped at 1.5 and the frameloop is demand-free
 * but light: one mesh, no post-processing.
 */
function Mark() {
  const group = useRef();
  const geometry = useMemo(() => buildLogoGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (!group.current) return;
    // Slow turn plus a gentle sway — the mark presents itself rather than
    // spinning for attention.
    group.current.rotation.y += delta * 0.28;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
      <group ref={group}>
        <mesh geometry={geometry} scale={0.62}>
          <meshPhysicalMaterial
            vertexColors
            roughness={0.16}
            metalness={0.38}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.15}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function CTALogo3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 10, 5]} intensity={1.7} />
      {/* Brand accents as practical lights: indigo key, cyan rim. */}
      <pointLight position={[-6, 4, -5]} intensity={0.8} color="#A855F7" />
      <pointLight position={[6, -4, 5]} intensity={1.1} color="#22D3EE" />
      <pointLight position={[0, 6, 4]} intensity={0.6} color="#6366F1" />
      <Environment preset="studio" />
      <Mark />
    </Canvas>
  );
}
