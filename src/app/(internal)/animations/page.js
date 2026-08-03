import { notFound } from 'next/navigation';
import AnimationLabClient from './AnimationLabClient';

// Internal design-review page, not part of the public site — it sits in the
// (internal) route group so it renders without the navbar and footer.
//
// It was previously reachable by anyone in production and pulled drei's
// transmission material into the shipped bundle. Now it is available in
// development, or when ENABLE_ANIMATION_LAB=1 is set for a staging deploy.
export const metadata = {
  title: '3D Logo Animation Options',
  robots: { index: false, follow: false },
};

export default function AnimationsPage() {
  const enabled = process.env.NODE_ENV !== 'production' || process.env.ENABLE_ANIMATION_LAB === '1';
  if (!enabled) notFound();

  return <AnimationLabClient />;
}
