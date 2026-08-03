import React from 'react';
import Reveal from '@/components/ui/Reveal';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { PRODUCTION_PROJECTS, DEVELOPMENT_PROJECTS } from '@/data/projects';

function StatusHeading({ label, tone }) {
  const dot = tone === 'emerald' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse';
  const text = tone === 'emerald' ? 'text-emerald-500' : 'text-amber-500';
  return (
    <Reveal>
      <div className="flex items-center gap-3 mb-8">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <h3 className={`text-sm font-semibold ${text} tracking-wide uppercase`}>{label}</h3>
      </div>
    </Reveal>
  );
}

/**
 * Passing `limit` trims the production list and drops the R&D block, which is
 * the shape the homepage teaser wants. /work renders both in full.
 */
export default function ProjectGrid({ limit }) {
  const production = limit ? PRODUCTION_PROJECTS.slice(0, limit) : PRODUCTION_PROJECTS;

  return (
    <>
      <div className={limit ? '' : 'mb-16'}>
        <StatusHeading label="Active Production Systems" tone="emerald" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {production.map((proj, idx) => (
            <Reveal key={proj.slug} delay={idx * 110} className="h-full">
              <SpotlightCard
                glow="rgba(16, 185, 129, 0.14)"
                className="h-full p-6 backdrop-blur-lg rounded-2xl border transition-all duration-300 pointer-events-auto hover:-translate-y-1.5 bg-[#0a0a0d]/50 border-white/5 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                <span className="text-xs uppercase tracking-wider text-emerald-500">{proj.client}</span>
                <h4 className="mt-3 text-xl font-semibold">{proj.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-brand-muted">{proj.desc}</p>
                <div className="mt-6 pt-4 border-t text-sm font-medium text-emerald-500 border-white/5">{proj.impact}</div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>

      {!limit && (
        <div>
          <StatusHeading label="In Active Development" tone="amber" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEVELOPMENT_PROJECTS.map((proj, idx) => (
              <Reveal key={proj.slug} delay={idx * 110} className="h-full">
                <SpotlightCard
                  glow="rgba(245, 158, 11, 0.14)"
                  className="h-full p-6 backdrop-blur-lg rounded-2xl border transition-all duration-300 pointer-events-auto hover:-translate-y-1.5 bg-[#0a0a0d]/50 border-white/5 hover:border-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full text-amber-500 bg-amber-500/10 border border-amber-500/20">{proj.phase}</span>
                    <span className="text-xs font-mono text-gray-500">{proj.stack}</span>
                  </div>
                  <h4 className="mt-4 text-xl font-semibold">{proj.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-brand-muted">{proj.desc}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
