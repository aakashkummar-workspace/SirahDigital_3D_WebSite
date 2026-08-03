import React from 'react';
import Reveal from '@/components/ui/Reveal';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { INDUSTRIES } from '@/data/industries';

export default function IndustryGrid({ limit }) {
  const items = limit ? INDUSTRIES.slice(0, limit) : INDUSTRIES;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((niche, index) => (
        <Reveal key={niche.slug} delay={(index % 3) * 90} className="h-full">
          <SpotlightCard
            id={niche.slug}
            glow="rgba(129, 140, 248, 0.16)"
            className="h-full p-6 backdrop-blur-lg rounded-2xl border transition-all duration-300 shadow-lg pointer-events-auto group hover:-translate-y-1.5 bg-[#0a0a0d]/50 border-white/5 hover:border-indigo-500/30 hover:bg-[#0c0c12]/80 scroll-mt-28"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <h3 className="text-xl font-semibold">{niche.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted">{niche.desc}</p>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}
