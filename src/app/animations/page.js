"use client";
import dynamic from 'next/dynamic';

const AnimationLab = dynamic(() => import('@/components/AnimationLab'), { ssr: false });

export default function AnimationsPage() {
  return <AnimationLab />;
}
