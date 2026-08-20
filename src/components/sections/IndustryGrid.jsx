import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { INDUSTRIES } from '@/data/industries';

export default function IndustryGrid({ limit }) {
  const items = limit ? INDUSTRIES.slice(0, limit) : INDUSTRIES;

  return (
    <div className="space-y-6">
      {items.map((niche, index) => (
        <Reveal key={niche.slug} delay={(index % 3) * 60}>
          <div
            id={niche.slug}
            className="py-6 border-b border-ink/10 scroll-mt-28 transition-colors duration-300 hover:border-ink/20"
          >
            <h3 className="text-xl font-bold text-ink">{niche.title}</h3>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-brand-subtle max-w-3xl">{niche.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
