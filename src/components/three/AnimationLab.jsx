"use client";
import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Float, MeshTransmissionMaterial } from '@react-three/drei';
import StudioEnvironment from './StudioEnvironment';
import * as THREE from 'three';
import { Sirah3DLogoShape, buildLogoGeometry } from './SirahCanvas';

/* ================= shared helpers ================= */

function usePointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return p;
}

function useSectionProgress(ref) {
  const p = useRef(0);
  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      p.current = THREE.MathUtils.clamp((window.innerHeight - r.top) / (r.height + window.innerHeight), 0, 1);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref]);
  return p;
}

/* ================= SET B — the new ideas ================= */

/* B1. Energy pulse: a band of light sweeps across the mark, like current
   moving through the workflow the logo depicts. Patched into the standard
   PBR shader so the material still lights normally. */
function RigEnergyPulse() {
  const matRef = useRef();
  const uniforms = useRef({ uTime: { value: 0 }, uMinX: { value: -3 }, uSpanX: { value: 6 } });
  const geometry = useMemo(() => buildLogoGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    geometry.computeBoundingBox();
    uniforms.current.uMinX.value = geometry.boundingBox.min.x;
    uniforms.current.uSpanX.value = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
  }, [geometry]);

  const onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.current.uTime;
    shader.uniforms.uMinX = uniforms.current.uMinX;
    shader.uniforms.uSpanX = uniforms.current.uSpanX;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uMinX;\nuniform float uSpanX;\nvarying vec3 vLocal;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         float p = (vLocal.x - uMinX) / uSpanX;
         float head = fract(uTime * 0.28);
         float d = p - head;
         d = d - floor(d + 0.5);
         float band = exp(-pow(d * 11.0, 2.0));
         float trail = smoothstep(0.0, 0.35, head - p) * smoothstep(0.45, 0.0, head - p) * 0.35;
         totalEmissiveRadiance += vec3(0.45, 0.85, 1.6) * (band * 2.2 + trail);`
      );
  };

  useFrame((_, delta) => { uniforms.current.uTime.value += delta; });

  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.25}>
      <mesh geometry={geometry} scale={0.62}>
        <meshPhysicalMaterial
          ref={matRef}
          vertexColors
          roughness={0.22}
          metalness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.06}
          onBeforeCompile={onBeforeCompile}
        />
      </mesh>
    </Float>
  );
}

/* B2. Particle assembly: the mark condenses out of a cloud, holds, scatters,
   and reforms on a loop. Points are sampled off the real geometry. */
function RigParticles() {
  const pointsRef = useRef();
  const clock = useRef(0);

  const { positions, targets, starts, colors, count } = useMemo(() => {
    const geo = buildLogoGeometry();
    geo.computeBoundingBox();
    const c = geo.boundingBox.getCenter(new THREE.Vector3());
    const src = geo.attributes.position;
    const srcCol = geo.attributes.color;
    const stride = Math.max(1, Math.floor(src.count / 7000));
    const n = Math.floor(src.count / stride);
    const targets = new Float32Array(n * 3);
    const starts = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const j = i * stride;
      targets[i * 3] = (src.getX(j) - c.x) * 0.62;
      targets[i * 3 + 1] = (src.getY(j) - c.y) * 0.62;
      targets[i * 3 + 2] = (src.getZ(j) - c.z) * 0.62;
      const dir = new THREE.Vector3().randomDirection().multiplyScalar(4 + Math.random() * 5);
      starts[i * 3] = dir.x; starts[i * 3 + 1] = dir.y; starts[i * 3 + 2] = dir.z;
      colors[i * 3] = srcCol.getX(j); colors[i * 3 + 1] = srcCol.getY(j); colors[i * 3 + 2] = srcCol.getZ(j);
    }
    geo.dispose();
    return { positions: new Float32Array(targets), targets, starts, colors, count: n };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    clock.current = (clock.current + delta) % 7;
    const t = clock.current;
    // 0-2s assemble, 2-5s hold, 5-7s scatter
    let m;
    if (t < 2) m = 1 - Math.pow(1 - t / 2, 3);
    else if (t < 5) m = 1;
    else m = 1 - Math.pow((t - 5) / 2, 2);
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      const w = THREE.MathUtils.clamp(m * (0.75 + ((i % 97) / 97) * 0.5), 0, 1);
      arr[k] = starts[k] + (targets[k] - starts[k]) * w;
      arr[k + 1] = starts[k + 1] + (targets[k + 1] - starts[k + 1]) * w;
      arr[k + 2] = starts[k + 2] + (targets[k + 2] - starts[k + 2]) * w;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.12;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.045} vertexColors sizeAttenuation transparent opacity={0.95} depthWrite={false} />
    </points>
  );
}

/* B3. Liquid chrome: mirror metal with an iridescent film, so the colour
   comes from reflection and viewing angle rather than a baked gradient. */
function RigChrome() {
  const g = useRef();
  const mouse = usePointer();
  const geometry = useMemo(() => buildLogoGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!g.current) return;
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, mouse.current.x * 0.5, 0.04) + delta * 0.06;
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, mouse.current.y * -0.3, 0.04);
  });
  return (
    <group ref={g}>
      <mesh geometry={geometry} scale={0.62}>
        <meshPhysicalMaterial
          color="#cfd6ff"
          metalness={1}
          roughness={0.08}
          iridescence={1}
          iridescenceIOR={1.35}
          iridescenceThicknessRange={[120, 520]}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={2.2}
        />
      </mesh>
    </group>
  );
}

/* B4. Glass: transmissive, refracting the coloured shapes sitting behind it. */
function RigGlass() {
  const g = useRef();
  const geometry = useMemo(() => buildLogoGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => { if (g.current) g.current.rotation.y += delta * 0.25; });
  return (
    <group>
      {/* backdrop for the refraction to pick up */}
      <mesh position={[-1.6, 0.6, -3]}>
        <circleGeometry args={[1.5, 48]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[1.7, -0.8, -3]}>
        <circleGeometry args={[1.2, 48]} />
        <meshBasicMaterial color="#d946ef" />
      </mesh>
      <group ref={g}>
        <mesh geometry={geometry} scale={0.62}>
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={1}
            thickness={1.6}
            roughness={0.05}
            ior={1.55}
            metalness={0}
            clearcoat={1}
            iridescence={0.6}
            transparent
          />
        </mesh>
      </group>
    </group>
  );
}

/* B5. Materialise: glowing wireframe skeleton that fills in to solid, with
   the extrusion depth growing from flat. Loops. */
function RigMaterialise() {
  const solid = useRef();
  const wire = useRef();
  const clock = useRef(0);
  const geometry = useMemo(() => buildLogoGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    clock.current = (clock.current + delta) % 6;
    const t = clock.current;
    const e = t < 2.2 ? 1 - Math.pow(1 - t / 2.2, 3) : t < 5 ? 1 : 1 - (t - 5) / 1;
    const k = THREE.MathUtils.clamp(e, 0, 1);
    if (solid.current) {
      solid.current.scale.set(0.62, 0.62, 0.62 * (0.04 + k * 0.96));
      solid.current.material.opacity = k;
      solid.current.rotation.y = (1 - k) * 0.6;
    }
    if (wire.current) {
      wire.current.scale.copy(solid.current.scale);
      wire.current.material.opacity = (1 - k) * 0.9;
      wire.current.rotation.y = solid.current.rotation.y;
    }
  });

  return (
    <group>
      <mesh ref={solid} geometry={geometry}>
        <meshPhysicalMaterial vertexColors transparent roughness={0.18} metalness={0.35} clearcoat={1} />
      </mesh>
      <mesh ref={wire} geometry={geometry}>
        <meshBasicMaterial color="#67e8f9" wireframe transparent />
      </mesh>
    </group>
  );
}

/* ================= SET C — deeper on glass + particles ================= */

// Brand-coloured shapes for the glass to bend. Sits behind the mark.
function GlassBackdrop() {
  return (
    <group position={[0, 0, -3.2]}>
      <mesh position={[-1.9, 0.8, 0]}>
        <circleGeometry args={[1.5, 48]} />
        <meshBasicMaterial color="#2563eb" />
      </mesh>
      <mesh position={[1.9, -0.9, 0]}>
        <circleGeometry args={[1.25, 48]} />
        <meshBasicMaterial color="#d946ef" />
      </mesh>
      <mesh position={[0.3, 1.6, -0.4]}>
        <circleGeometry args={[0.7, 48]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
    </group>
  );
}

/* C1. Dispersive crystal — real chromatic aberration splits the colour at
   the edges the way a prism does. */
function RigCrystal() {
  const g = useRef();
  const mouse = usePointer();
  const geometry = useMemo(() => buildLogoGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!g.current) return;
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, mouse.current.x * 0.6, 0.04) + delta * 0.12;
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, mouse.current.y * -0.35, 0.04);
  });
  return (
    <group>
      <GlassBackdrop />
      <group ref={g}>
        <mesh geometry={geometry} scale={0.62}>
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            thickness={1.4}
            roughness={0.02}
            ior={1.6}
            chromaticAberration={0.9}
            anisotropicBlur={0.1}
            distortion={0}
            backside
            backsideThickness={0.6}
          />
        </mesh>
      </group>
    </group>
  );
}

/* C2. Molten glass — the same transmission with live distortion, so the
   surface churns like it is still cooling. */
function RigMolten() {
  const g = useRef();
  const geometry = useMemo(() => buildLogoGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => { if (g.current) g.current.rotation.y += delta * 0.2; });
  return (
    <group>
      <GlassBackdrop />
      <group ref={g}>
        <mesh geometry={geometry} scale={0.62}>
          <MeshTransmissionMaterial
            samples={5}
            resolution={384}
            thickness={2.0}
            roughness={0.12}
            ior={1.45}
            chromaticAberration={0.35}
            anisotropicBlur={0.4}
            distortion={0.55}
            distortionScale={0.4}
            temporalDistortion={0.35}
          />
        </mesh>
      </group>
    </group>
  );
}

/* C3. Glass over real copy — the mark drifts across headline text so you can
   judge how the refraction reads against actual page content. */
function RigGlassOverText() {
  const g = useRef();
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = '#08080b'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#ffffff';
    x.font = 'bold 78px system-ui, sans-serif';
    x.fillText('Building intelligent', 60, 170);
    x.fillText('systems that', 60, 262);
    x.fillStyle = '#8b93a7';
    x.font = '40px system-ui, sans-serif';
    x.fillText('automate, simplify, and scale.', 60, 344);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  const geometry = useMemo(() => buildLogoGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.position.x = Math.sin(t * 0.35) * 2.4;
    g.current.position.y = Math.sin(t * 0.5) * 0.35;
    g.current.rotation.y = Math.sin(t * 0.35) * 0.35;
  });

  return (
    <group>
      <mesh position={[0, 0, -3]}>
        <planeGeometry args={[11, 5.5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <group ref={g}>
        <mesh geometry={geometry} scale={0.5}>
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            thickness={1.1}
            roughness={0.03}
            ior={1.55}
            chromaticAberration={0.55}
            distortion={0.1}
            backside
          />
        </mesh>
      </group>
    </group>
  );
}

/* C4. Particle stream — the mark stays formed while a wave of light travels
   through the points, so it reads as flow rather than assembly. */
function RigParticleStream() {
  const matRef = useRef();
  const { positions, colors, count, minX, spanX } = useMemo(() => {
    const geo = buildLogoGeometry();
    geo.computeBoundingBox();
    const c = geo.boundingBox.getCenter(new THREE.Vector3());
    const src = geo.attributes.position, srcCol = geo.attributes.color;
    const stride = Math.max(1, Math.floor(src.count / 9000));
    const n = Math.floor(src.count / stride);
    const positions = new Float32Array(n * 3), colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const j = i * stride;
      positions[i * 3] = (src.getX(j) - c.x) * 0.62;
      positions[i * 3 + 1] = (src.getY(j) - c.y) * 0.62;
      positions[i * 3 + 2] = (src.getZ(j) - c.z) * 0.62;
      colors[i * 3] = srcCol.getX(j); colors[i * 3 + 1] = srcCol.getY(j); colors[i * 3 + 2] = srcCol.getZ(j);
    }
    const minX = (geo.boundingBox.min.x - c.x) * 0.62;
    const spanX = (geo.boundingBox.max.x - geo.boundingBox.min.x) * 0.62;
    geo.dispose();
    return { positions, colors, count: n, minX, spanX };
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uMinX: { value: minX }, uSpanX: { value: spanX } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aColor;
      uniform float uTime; uniform float uMinX; uniform float uSpanX;
      varying vec3 vColor; varying float vGlow;
      void main() {
        float p = (position.x - uMinX) / uSpanX;
        float head = fract(uTime * 0.2);
        float d = p - head; d = d - floor(d + 0.5);
        float band = exp(-pow(d * 8.0, 2.0));
        vGlow = band; vColor = aColor;
        vec3 pos = position;
        pos.z += sin(uTime * 1.6 + p * 22.0) * 0.03;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (9.0 + band * 22.0) * (2.4 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vGlow;
      void main() {
        float a = smoothstep(0.5, 0.08, length(gl_PointCoord - 0.5));
        vec3 col = mix(vColor, vec3(0.55, 0.95, 1.7), vGlow * 0.85);
        gl_FragColor = vec4(col * (0.55 + vGlow * 2.0), a);
      }`,
  }), [minX, spanX]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => { material.uniforms.uTime.value += delta; });

  return (
    <points material={material}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
    </points>
  );
}

/* C5. Magnetic particles — the cloud holds the logo until your cursor pushes
   through it, then springs back. */
function RigMagneticParticles() {
  const ref = useRef();
  const { positions, targets, colors, count } = useMemo(() => {
    const geo = buildLogoGeometry();
    geo.computeBoundingBox();
    const c = geo.boundingBox.getCenter(new THREE.Vector3());
    const src = geo.attributes.position, srcCol = geo.attributes.color;
    const stride = Math.max(1, Math.floor(src.count / 6000));
    const n = Math.floor(src.count / stride);
    const targets = new Float32Array(n * 3), colors = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const j = i * stride;
      targets[i * 3] = (src.getX(j) - c.x) * 0.62;
      targets[i * 3 + 1] = (src.getY(j) - c.y) * 0.62;
      targets[i * 3 + 2] = (src.getZ(j) - c.z) * 0.62;
      colors[i * 3] = srcCol.getX(j); colors[i * 3 + 1] = srcCol.getY(j); colors[i * 3 + 2] = srcCol.getZ(j);
    }
    geo.dispose();
    return { positions: new Float32Array(targets), targets, colors, count: n };
  }, []);
  const vel = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const d = Math.min(delta, 0.05);
    const cam = state.camera;
    const halfH = Math.tan((cam.fov * Math.PI) / 360) * cam.position.z;
    const halfW = halfH * (state.size.width / state.size.height);
    const mx = state.pointer.x * halfW, my = state.pointer.y * halfH;
    const R = 2.0, PUSH = 26, SPRING = 30, DAMP = 6;
    const arr = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const k = i * 3;
      const dx = arr[k] - mx, dy = arr[k + 1] - my;
      const dist = Math.hypot(dx, dy) || 0.0001;
      let ax = (targets[k] - arr[k]) * SPRING;
      let ay = (targets[k + 1] - arr[k + 1]) * SPRING;
      if (dist < R) {
        const f = ((R - dist) / R) * PUSH;
        ax += (dx / dist) * f; ay += (dy / dist) * f;
      }
      vel[k] += (ax - vel[k] * DAMP) * d;
      vel[k + 1] += (ay - vel[k + 1] * DAMP) * d;
      arr[k] += vel[k] * d;
      arr[k + 1] += vel[k + 1] * d;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors sizeAttenuation transparent opacity={0.95} depthWrite={false} />
    </points>
  );
}

/* ================= SET A — the first batch, kept for comparison ========= */

function RigCursorTilt() {
  const g = useRef();
  const mouse = usePointer();
  useFrame(() => {
    if (!g.current) return;
    g.current.rotation.y = THREE.MathUtils.lerp(g.current.rotation.y, mouse.current.x * 0.45, 0.05);
    g.current.rotation.x = THREE.MathUtils.lerp(g.current.rotation.x, mouse.current.y * -0.45, 0.05);
  });
  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={g}><Sirah3DLogoShape darkMode scale={0.62} /></group>
    </Float>
  );
}

function RigTurntable() {
  const g = useRef();
  useFrame((_, delta) => {
    if (!g.current) return;
    g.current.rotation.y += delta * 0.55;
    g.current.rotation.x = -0.12;
  });
  return <group ref={g}><Sirah3DLogoShape darkMode scale={0.62} /></group>;
}

function RigScrollSpin({ progress }) {
  const g = useRef();
  useFrame(() => {
    if (!g.current) return;
    const t = progress.current;
    g.current.rotation.y = (t - 0.5) * Math.PI * 2.2;
    g.current.rotation.x = Math.sin(t * Math.PI) * -0.25;
    g.current.position.x = (t - 0.5) * 2.4;
    g.current.scale.setScalar((0.55 + Math.sin(t * Math.PI) * 0.12) / 0.62);
  });
  return <group ref={g}><Sirah3DLogoShape darkMode scale={0.62} /></group>;
}

function RigAssemble({ trigger }) {
  const g = useRef();
  const t = useRef(0);
  useEffect(() => { t.current = 0; }, [trigger]);
  useFrame((_, delta) => {
    if (!g.current) return;
    t.current = Math.min(1, t.current + delta / 1.25);
    const e = 1 - Math.pow(1 - t.current, 3);
    g.current.rotation.y = (1 - e) * -Math.PI * 1.6;
    g.current.rotation.z = (1 - e) * 0.5;
    g.current.position.y = (1 - e) * -2.6;
    g.current.scale.setScalar(e + Math.sin(t.current * Math.PI) * 0.12);
  });
  return <group ref={g}><Sirah3DLogoShape darkMode scale={0.62} /></group>;
}

function RigElastic() {
  const g = useRef();
  const mouse = usePointer();
  const vel = useRef({ x: 0, y: 0 });
  useFrame((_, delta) => {
    if (!g.current) return;
    const d = Math.min(delta, 0.05);
    const STIFF = 90, DAMP = 9;
    const tx = mouse.current.x * 0.7, ty = mouse.current.y * -0.7;
    vel.current.x += (tx - g.current.rotation.y) * STIFF * d - vel.current.x * DAMP * d;
    vel.current.y += (ty - g.current.rotation.x) * STIFF * d - vel.current.y * DAMP * d;
    g.current.rotation.y += vel.current.x * d;
    g.current.rotation.x += vel.current.y * d;
    g.current.scale.setScalar(1 + Math.min(Math.hypot(vel.current.x, vel.current.y) * 0.03, 0.14));
  });
  return <group ref={g}><Sirah3DLogoShape darkMode scale={0.62} /></group>;
}

/* ================= registry ================= */

const RIGS = {
  crystal: RigCrystal, molten: RigMolten, overtext: RigGlassOverText,
  stream: RigParticleStream, magnetic: RigMagneticParticles,
  energy: RigEnergyPulse, particles: RigParticles, chrome: RigChrome,
  glass: RigGlass, materialise: RigMaterialise,
  cursor: RigCursorTilt, turntable: RigTurntable, scroll: RigScrollSpin,
  assemble: RigAssemble, elastic: RigElastic,
};

const SET_C = [
  { n: 1, key: 'crystal', name: 'Dispersive Crystal', tag: 'Glass', hint: 'Move your mouse to turn it.',
    blurb: 'Proper transmission with chromatic aberration - the edges split colour like a prism instead of just going see-through. This is what B4 was reaching for; B4 used the plain transmission material, this uses drei’s multi-sample one.' },
  { n: 2, key: 'molten', name: 'Molten Glass', tag: 'Glass', hint: 'Runs on its own.',
    blurb: 'Same transmission with live surface distortion, so the glass churns as though it has not finished cooling. Softer and more organic than the crystal.' },
  { n: 3, key: 'overtext', name: 'Glass Over Copy', tag: 'Glass', hint: 'Watch the text bend as it passes.',
    blurb: 'The mark drifts across real headline text so you can judge the refraction against actual page content rather than coloured discs. Closest preview to how it would look on the live hero.' },
  { n: 4, key: 'stream', name: 'Particle Stream', tag: 'Particles', hint: 'Runs on its own.',
    blurb: 'The logo stays formed while a wave of light travels through the points, so it reads as current flowing rather than assembly. Custom point shader drives both size and brightness.' },
  { n: 5, key: 'magnetic', name: 'Magnetic Particles', tag: 'Particles', hint: 'Push your cursor through the cloud.',
    blurb: 'The cloud holds the logo shape until your cursor shoves through it, then springs back. Same particle look as B2 but interactive instead of on a timer.' },
];

const SET_B = [
  { n: 1, key: 'energy', name: 'Energy Pulse', tag: 'Light sweep', hint: 'Runs on its own - no input needed.',
    blurb: 'A band of light travels across the mark on a loop, like current moving through the workflow the logo actually depicts. The material still lights normally underneath; the pulse is added emission.' },
  { n: 2, key: 'particles', name: 'Particle Assembly', tag: 'Dissolve / reform', hint: 'Loops every 7 seconds.',
    blurb: 'Seven thousand points sampled off the real geometry condense into the logo, hold, scatter, and reform. Each particle keeps its gradient colour, so the brand palette survives the dissolve.' },
  { n: 3, key: 'chrome', name: 'Liquid Chrome', tag: 'Material', hint: 'Move your mouse to shift the reflections.',
    blurb: 'Mirror metal with an iridescent film. The colour comes from reflection and viewing angle rather than a baked gradient, so it shifts as it turns. Reads expensive and heavy.' },
  { n: 4, key: 'glass', name: 'Refractive Glass', tag: 'Material', hint: 'Watch the coloured discs bend through it.',
    blurb: 'Fully transmissive glass that refracts whatever sits behind it. Here two brand-coloured discs; on the real site it would bend your headline text as it passes.' },
  { n: 5, key: 'materialise', name: 'Materialise', tag: 'Build-up', hint: 'Loops every 6 seconds.',
    blurb: 'Starts as a glowing wireframe skeleton, then the solid fills in while the extrusion depth grows from flat to full. Technical and engineering-flavoured.' },
];

const SET_A = [
  { n: 1, key: 'cursor', name: 'Cursor Tilt + Float', tag: 'Current', hint: 'Move your mouse.', blurb: 'Leans toward your pointer with an eased lag over a constant gentle bob.' },
  { n: 2, key: 'turntable', name: 'Turntable', tag: 'Always moving', hint: '', blurb: 'Constant slow revolution showing the extruded depth from every angle.' },
  { n: 3, key: 'scroll', name: 'Scroll Spin + Drift', tag: 'Scroll-linked', hint: 'Scroll slowly through this section.', blurb: 'Rotation, scale and position driven by scroll, so the mark moves aside as you read.' },
  { n: 4, key: 'assemble', name: 'Assemble', tag: 'Entrance', hint: 'Replays on scroll into view.', blurb: 'Flies up, unwinds and settles with a slight overshoot.' },
  { n: 5, key: 'elastic', name: 'Elastic Magnet', tag: 'Springy', hint: 'Move your mouse fast.', blurb: 'Spring physics - overshoots the cursor, wobbles back, pops in scale.' },
];

/* ================= page ================= */

function Stage({ item, setLabel }) {
  const sectionRef = useRef();
  const progress = useSectionProgress(sectionRef);
  const [trigger, setTrigger] = useState(0);
  const Rig = RIGS[item.key];

  useEffect(() => {
    if (item.key !== 'assemble') return;
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTrigger((t) => t + 1); }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [item.key]);

  // The traced geometry is already centred on the origin, so only the older
  // rigs that relied on <Center> still get it.
  const NO_CENTER = ['particles', 'glass', 'crystal', 'molten', 'overtext', 'stream', 'magnetic'];
  const needsCenter = !NO_CENTER.includes(item.key);

  return (
    <section ref={sectionRef} className="min-h-screen flex flex-col justify-center max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 items-center">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl font-bold text-white/10">{setLabel}{item.n}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">{item.tag}</span>
          </div>
          <h2 className="text-3xl font-bold text-white">{item.name}</h2>
          <p className="mt-4 text-sm text-brand-muted leading-relaxed">{item.blurb}</p>
          {item.hint && <p className="mt-4 text-xs text-amber-400/80">{item.hint}</p>}
        </div>

        <div className="h-[420px] md:h-[520px] rounded-3xl border border-white/5 bg-[#0a0a0d]/60 overflow-hidden">
          <Canvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 1.5]}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1.8} />
            <pointLight position={[-6, 4, -5]} intensity={0.7} color="#a855f7" />
            <pointLight position={[6, -4, 5]} intensity={1.0} color="#06b6d4" />
            <Suspense fallback={null}>
              {/* Local rig — MeshTransmissionMaterial needs an envMap, but
                  not one fetched from a CDN. See StudioEnvironment. */}
              <StudioEnvironment />
              {needsCenter
                ? <Center><Rig progress={progress} trigger={trigger} /></Center>
                : <Rig progress={progress} trigger={trigger} />}
            </Suspense>
          </Canvas>
        </div>
      </div>
    </section>
  );
}

export default function AnimationLab() {
  const [set, setSet] = useState('C');
  const items = set === 'C' ? SET_C : set === 'B' ? SET_B : SET_A;

  return (
    <main className="min-h-screen bg-[#060608] text-white font-sans">
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-10">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-blue-400">Sirah Digital</span>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white">
          3D logo animation options
        </h1>
        <p className="mt-4 text-brand-muted max-w-2xl">
          Set C goes deeper on the two you liked - three glass treatments and two particle
          treatments. Scroll through, then tell me the number you want on the live site.
        </p>
        <div className="mt-8 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          {[['C', 'Set C - glass + particles'], ['B', 'Set B'], ['A', 'Set A']].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSet(k)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-colors ${set === k ? 'bg-white text-black' : 'text-brand-muted hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      {items.map((item) => <Stage key={item.key} item={item} setLabel={set} />)}
      <footer className="max-w-6xl mx-auto px-6 py-24 text-sm text-gray-500">
        Preview route only - the live homepage is untouched.
      </footer>
    </main>
  );
}
