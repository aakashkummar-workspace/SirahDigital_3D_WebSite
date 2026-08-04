import React from 'react';
import Reveal from '@/components/ui/Reveal';
import AnimatedHeading from '@/components/ui/AnimatedHeading';

// The title + optional standfirst that opened every section of the old
// single page, repeated four times inline. One component now.
export default function SectionHeader({ title, highlight, subtitle, align = 'left', className = '' }) {
  return (
    <Reveal>
      <div className={`mb-16 ${align === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'} ${className}`}>
        <AnimatedHeading text={title} highlight={highlight} className="text-4xl font-bold" />
        {subtitle && <p className="mt-4 text-brand-muted">{subtitle}</p>}
      </div>
    </Reveal>
  );
}

/**
 * Larger opening block for a route's own page, as opposed to a section
 * inside one. Carries the eyebrow that used to sit above the hero headline.
 */
export function PageHeader({ eyebrow, title, highlight, subtitle }) {
  return (
    <header className="max-w-6xl mx-auto px-6 pt-16 pb-4">
      {eyebrow && (
        <Reveal>
          <span className="inline-block text-xs uppercase tracking-[0.3em] font-semibold border px-3 py-1 rounded-full mb-6 text-blue-400 border-blue-500/20 bg-blue-500/5">
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={90}>
        <AnimatedHeading
          as="h1"
          text={title}
          highlight={highlight}
          stagger={45}
          className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white"
        />
      </Reveal>
      {subtitle && (
        <Reveal delay={180}>
          <p className="mt-6 text-lg leading-relaxed text-brand-muted max-w-2xl">{subtitle}</p>
        </Reveal>
      )}
    </header>
  );
}
