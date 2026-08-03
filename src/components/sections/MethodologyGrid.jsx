import React from 'react';
import Reveal from '@/components/ui/Reveal';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { METHODOLOGY } from '@/data/services';

export default function MethodologyGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {METHODOLOGY.map((m, i) => (
        <Reveal key={m.title} delay={i * 120} className="h-full">
          <SpotlightCard
            className={`h-full p-8 backdrop-blur-xl rounded-3xl border pointer-events-auto transition-all duration-300 hover:-translate-y-1.5 ${m.hover} bg-[#0a0a0d]/70 border-white/5 hover:shadow-2xl hover:shadow-indigo-500/10`}
          >
            <h3 className={`text-2xl font-semibold ${m.accent}`}>{m.title}</h3>
            <p className="mt-4 text-sm text-brand-muted">{m.desc}</p>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}
