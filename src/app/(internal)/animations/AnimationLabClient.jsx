"use client";
import dynamic from 'next/dynamic';

// Split out so the route itself can stay a server component and do the
// production gate before any of this is sent to the browser.
const AnimationLab = dynamic(() => import('@/components/three/AnimationLab'), { ssr: false });

export default function AnimationLabClient() {
  return <AnimationLab />;
}
