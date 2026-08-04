import React from 'react';
import Reveal from '@/components/ui/Reveal';
import { PRODUCTION_PROJECTS, DEVELOPMENT_PROJECTS } from '@/data/projects';

function StatusHeading({ label, tone }) {
  const dot = tone === 'emerald' ? 'bg-emerald-400' : 'bg-amber-400';
  const text = tone === 'emerald' ? 'text-emerald-400' : 'text-amber-400';
  return (
    <Reveal>
      <div className="flex items-center gap-2.5 mb-8">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <h3 className={`text-xs font-mono tracking-widest ${text} uppercase`}>{label}</h3>
      </div>
    </Reveal>
  );
}

export default function ProjectGrid({ limit }) {
  const production = limit ? PRODUCTION_PROJECTS.slice(0, limit) : PRODUCTION_PROJECTS;

  return (
    <>
      <div className={limit ? '' : 'mb-16'}>
        <StatusHeading label="Active Production Systems" tone="emerald" />
        <div className="space-y-6">
          {production.map((proj, idx) => (
            <Reveal key={proj.slug} delay={idx * 80}>
              <div className="py-6 border-b border-white/10 transition-colors duration-300 hover:border-white/20">
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">{proj.client}</span>
                  <span className="text-sm font-semibold text-emerald-400">{proj.impact}</span>
                </div>
                <h4 className="mt-2 text-xl font-bold text-white">{proj.title}</h4>
                <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-400 max-w-3xl">{proj.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {!limit && (
        <div>
          <StatusHeading label="In Active Development" tone="amber" />
          <div className="space-y-6">
            {DEVELOPMENT_PROJECTS.map((proj, idx) => (
              <Reveal key={proj.slug} delay={idx * 80}>
                <div className="py-6 border-b border-white/10 transition-colors duration-300 hover:border-white/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">{proj.phase}</span>
                    <span className="text-xs font-mono text-slate-500">• {proj.stack}</span>
                  </div>
                  <h4 className="mt-2 text-xl font-bold text-white">{proj.title}</h4>
                  <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-400 max-w-3xl">{proj.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
