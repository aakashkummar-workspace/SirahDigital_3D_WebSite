"use client";
import React, { useEffect, useId, useMemo, useRef } from 'react';
import { STATES, STATE_ACCENT, DetailLayer, NODE_COUNT, VIEW } from './VisualizationStates';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/**
 * The one persistent visualization.
 *
 * A single core, eight nodes, eight spokes, eight mesh links and three rings
 * are mounted once and never unmounted. Changing capability retargets their
 * geometry; a requestAnimationFrame loop eases every value toward the new
 * target and writes it straight to the DOM. Node 3 in the AI core is the same
 * element as node 3 in the analytics sphere, so the change reads as the object
 * reorganising rather than one picture being swapped for another.
 *
 * No React state is involved in the animation — a re-render per frame through
 * a tree this size would be the whole performance budget. The only thing that
 * cross-fades is the detail overlay, because a waveform genuinely cannot morph
 * into a document.
 *
 * `variant` controls placement only, never behaviour:
 *   pinned  — desktop, sticky beside the scrolling content
 *   banner  — tablet, sticky above the content
 *   inline  — mobile, between a service's heading and description
 */

const LERP = 0.085;          // per-frame approach rate at 60fps
const SNAP = 0.4;            // below this distance, land on the target

export default function VisualizationContainer({
  state,
  variant = 'pinned',
  className = '',
  run = true,
}) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const target = STATES[state] || STATES['ai-core'];
  const accent = STATE_ACCENT[state] || '#6366F1';

  const rootRef = useRef(null);
  const coreRef = useRef(null);
  const coreGlowRef = useRef(null);
  const ringRefs = useRef([]);
  const nodeRefs = useRef([]);
  const haloRefs = useRef([]);
  const spokeRefs = useRef([]);
  const packetRefs = useRef([]);
  const meshRefs = useRef([]);

  // Live geometry, mutated in place by the loop. Seeded from the first state
  // so the very first paint is already correct rather than animating in from
  // an arbitrary origin.
  const live = useRef(null);
  if (live.current === null) {
    live.current = {
      core: { ...target.core },
      rings: [...target.rings],
      ringAlpha: target.ringAlpha,
      spokes: target.spokes,
      mesh: target.mesh,
      nodes: target.nodes.map((n) => ({ ...n })),
    };
  }

  const targetRef = useRef(target);
  targetRef.current = target;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const setNode = useMemo(() => (i) => (el) => { nodeRefs.current[i] = el; }, []);
  const setHalo = useMemo(() => (i) => (el) => { haloRefs.current[i] = el; }, []);
  const setSpoke = useMemo(() => (i) => (el) => { spokeRefs.current[i] = el; }, []);
  const setPacket = useMemo(() => (i) => (el) => { packetRefs.current[i] = el; }, []);
  const setMesh = useMemo(() => (i) => (el) => { meshRefs.current[i] = el; }, []);
  const setRing = useMemo(() => (i) => (el) => { ringRefs.current[i] = el; }, []);

  useEffect(() => {
    let raf = 0;
    const C = VIEW / 2;

    const paint = () => {
      const L = live.current;

      if (coreRef.current) {
        coreRef.current.setAttribute('r', L.core.r.toFixed(2));
        coreRef.current.setAttribute('opacity', L.core.a.toFixed(3));
      }
      if (coreGlowRef.current) {
        coreGlowRef.current.setAttribute('r', (L.core.r * 2.3).toFixed(2));
        coreGlowRef.current.setAttribute('opacity', (L.core.a * 0.5).toFixed(3));
      }
      L.rings.forEach((r, i) => {
        const el = ringRefs.current[i];
        if (!el) return;
        el.setAttribute('r', r.toFixed(2));
        el.setAttribute('opacity', (L.ringAlpha * (0.5 - i * 0.12)).toFixed(3));
      });
      L.nodes.forEach((n, i) => {
        const dot = nodeRefs.current[i];
        const halo = haloRefs.current[i];
        const spoke = spokeRefs.current[i];
        const link = meshRefs.current[i];
        if (dot) {
          dot.setAttribute('cx', n.x.toFixed(2));
          dot.setAttribute('cy', n.y.toFixed(2));
          dot.setAttribute('r', n.r.toFixed(2));
          dot.setAttribute('opacity', n.a.toFixed(3));
        }
        if (halo) {
          halo.setAttribute('cx', n.x.toFixed(2));
          halo.setAttribute('cy', n.y.toFixed(2));
          halo.setAttribute('r', (n.r * 2.6).toFixed(2));
          halo.setAttribute('opacity', (n.a * 0.16).toFixed(3));
        }
        if (spoke) {
          spoke.setAttribute('x1', C);
          spoke.setAttribute('y1', C);
          spoke.setAttribute('x2', n.x.toFixed(2));
          spoke.setAttribute('y2', n.y.toFixed(2));
          spoke.setAttribute('opacity', (L.spokes * n.a).toFixed(3));
        }
        const packet = packetRefs.current[i];
        if (packet) {
          packet.setAttribute('x1', C);
          packet.setAttribute('y1', C);
          packet.setAttribute('x2', n.x.toFixed(2));
          packet.setAttribute('y2', n.y.toFixed(2));
          packet.setAttribute('opacity', (L.spokes * n.a).toFixed(3));
        }
        if (link) {
          const m = L.nodes[(i + 1) % NODE_COUNT];
          link.setAttribute('x1', n.x.toFixed(2));
          link.setAttribute('y1', n.y.toFixed(2));
          link.setAttribute('x2', m.x.toFixed(2));
          link.setAttribute('y2', m.y.toFixed(2));
          link.setAttribute('opacity', (L.mesh * n.a * m.a * 0.55).toFixed(3));
        }
      });
    };

    const step = () => {
      // Three copies of this component are mounted at once — the mobile
      // inline one for each service, the tablet banner and the desktop pinned
      // one — and all but one are display:none at any breakpoint. offsetParent
      // is null for those, so they idle instead of each burning a rAF loop
      // interpolating geometry nobody can see.
      if (rootRef.current && rootRef.current.offsetParent === null) {
        raf = requestAnimationFrame(step);
        return;
      }
      const L = live.current;
      const T = targetRef.current;
      // Reduced motion still reconfigures — it simply arrives immediately.
      const k = reducedRef.current ? 1 : LERP;
      const ease = (a, b) => (Math.abs(b - a) < SNAP * 0.02 ? b : a + (b - a) * k);

      L.core.r = ease(L.core.r, T.core.r);
      L.core.a = ease(L.core.a, T.core.a);
      L.ringAlpha = ease(L.ringAlpha, T.ringAlpha);
      L.spokes = ease(L.spokes, T.spokes);
      L.mesh = ease(L.mesh, T.mesh);
      T.rings.forEach((r, i) => { L.rings[i] = ease(L.rings[i], r); });
      T.nodes.forEach((t, i) => {
        const n = L.nodes[i];
        n.x = ease(n.x, t.x);
        n.y = ease(n.y, t.y);
        n.r = ease(n.r, t.r);
        n.a = ease(n.a, t.a);
      });

      paint();
      raf = requestAnimationFrame(step);
    };

    // One immediate paint so a mount or a reduced-motion visitor is correct
    // before the first frame ever runs.
    paint();
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const size =
    variant === 'pinned' ? 'aspect-square w-full'
      : variant === 'banner' ? 'aspect-[2/1] w-full max-w-[560px]'
        : 'aspect-square w-full max-w-[280px] sm:max-w-[340px]';

  const alive = run && !reduced;

  return (
    <div ref={rootRef} className={`relative mx-auto ${size} ${className}`}>
      {/* Ambient glow, retinted per capability. The transition on background
          is what makes the colour shift feel like lighting rather than a
          repaint.

          Insets stay at zero or positive on purpose. A negative inset enlarges
          the element's box, and in the wide desktop column this sits flush to
          the page edge — it would push the document wider and produce
          horizontal scroll. blur-3xl already blooms the light well past the
          box without affecting layout, which is the effect we actually want.
          Clipping it with overflow-hidden on an ancestor is not an option
          either: that would break the sticky columns. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 blur-3xl transition-[background] duration-[1200ms] ease-brand"
        style={{ background: `radial-gradient(closest-side, ${accent}52, transparent 72%)` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-[14%] -z-10 blur-2xl transition-[background] duration-[1200ms] ease-brand"
        style={{ background: `radial-gradient(closest-side, ${accent}45, transparent 70%)` }}
      />
      {/* Dark plate: the particle field behind is busy enough that thin
          strokes lose contrast without it. */}
      <div
        aria-hidden="true"
        className="absolute inset-[2%] -z-10 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(closest-side, rgba(16,14,32,.88), rgba(16,14,32,0) 78%)' }}
      />

      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className={`w-full h-full ${alive ? 'animate-float-y' : ''}`}
        role="img"
        aria-label="An evolving diagram of the active capability"
      >
        <defs>
          <radialGradient id={`${uid}-core`}>
            <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* orbit rails — radii morph between configurations */}
        {[0, 1, 2].map((i) => (
          <circle
            key={`ring-${i}`} ref={setRing(i)} cx={VIEW / 2} cy={VIEW / 2}
            r="100" fill="none" stroke="#FFFFFF" strokeWidth="1.6" opacity="0.1"
          />
        ))}

        {/* mesh links between neighbouring nodes */}
        {[...Array(NODE_COUNT)].map((_, i) => (
          <line
            key={`mesh-${i}`} ref={setMesh(i)}
            stroke="#FFFFFF" strokeWidth="1.4" opacity="0"
            style={{ transition: 'stroke 900ms ease' }}
          />
        ))}

        {/* spokes from the core, each carrying a travelling data packet */}
        {[...Array(NODE_COUNT)].map((_, i) => (
          <g key={`spoke-${i}`}>
            <line ref={setSpoke(i)} stroke={accent} strokeOpacity="0.28" strokeWidth="1.6" opacity="0" style={{ transition: 'stroke 900ms ease' }} />
            <line
              ref={setPacket(i)}
              stroke={accent} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="9 120" opacity="0"
              style={{
                transition: 'stroke 900ms ease',
                animation: alive ? `flow ${2200 + i * 240}ms linear ${i * 160}ms infinite` : undefined,
              }}
            />
          </g>
        ))}

        {/* core */}
        <circle ref={coreGlowRef} cx={VIEW / 2} cy={VIEW / 2} r="90" fill={`url(#${uid}-core)`} opacity="0.5" />
        <circle
          ref={coreRef} cx={VIEW / 2} cy={VIEW / 2} r="46"
          fill={accent} fillOpacity="0.3" stroke={accent} strokeOpacity="0.85" strokeWidth="2"
          style={{ transition: 'fill 900ms ease, stroke 900ms ease' }}
        />
        {alive && (
          <circle
            cx={VIEW / 2} cy={VIEW / 2} r="46" fill="none" stroke={accent} strokeOpacity="0.5" strokeWidth="1.6"
            style={{ transformOrigin: `${VIEW / 2}px ${VIEW / 2}px`, animation: 'pulse-ring 3s ease-out infinite' }}
          />
        )}

        {/* the detail that cannot morph, cross-faded over the skeleton */}
        {Object.entries(STATES).map(([key, cfg]) => {
          const on = key === state;
          if (cfg.detail === 'none') return null;
          return (
            <g
              key={`detail-${key}`}
              aria-hidden="true"
              style={{
                opacity: on ? 1 : 0,
                visibility: on ? 'visible' : 'hidden',
                transition: reduced
                  ? 'none'
                  : on
                    ? 'opacity 620ms cubic-bezier(.22,.61,.36,1) 180ms, visibility 0s linear 0s'
                    : 'opacity 260ms cubic-bezier(.22,.61,.36,1), visibility 0s linear 260ms',
              }}
            >
              <DetailLayer kind={cfg.detail} accent={cfg.accent} run={on && alive} idBase={`${uid}-${key}`} />
            </g>
          );
        })}

        {/* nodes, on top of everything they connect */}
        {[...Array(NODE_COUNT)].map((_, i) => (
          <circle key={`halo-${i}`} ref={setHalo(i)} fill={accent} opacity="0" style={{ transition: 'fill 900ms ease' }} />
        ))}
        {[...Array(NODE_COUNT)].map((_, i) => (
          <circle
            key={`node-${i}`} ref={setNode(i)} fill={target.nodes[i]?.color || accent} opacity="0"
            style={{ transition: 'fill 900ms ease' }}
          >
            {alive && (
              <animate
                attributeName="fill-opacity"
                values="0.75;1;0.75"
                dur={`${2 + (i % 4) * 0.35}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
      </svg>
    </div>
  );
}
