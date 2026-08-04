import React from 'react';
import Reveal from '@/components/ui/Reveal';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import Avatar from '@/components/ui/Avatar';
import { SocialIcon } from '@/components/ui/icons';
import { FOUNDER, TEAM } from '@/data/team';
import { SOCIALS } from '@/data/socials';

export default function TeamGrid() {
  return (
    // Stretch, not start-align, so the founder panel runs the full height of
    // the team column beside it.
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 lg:gap-16 items-start">

      {/* Founder */}
      <Reveal className="h-full">
        <div className="h-full flex flex-col justify-start text-center py-6 border-b lg:border-b-0 lg:border-r border-white/10 pr-0 lg:pr-10">
          <Avatar
            src={FOUNDER.photo}
            name={FOUNDER.name}
            textClass="text-6xl"
            className="w-44 h-44 rounded-full mx-auto relative border border-white/10"
          />
          <h3 className="mt-6 text-2xl font-bold uppercase tracking-wide leading-tight text-white">{FOUNDER.name}</h3>
          <p className="mt-2 text-base font-semibold text-cyan-400">{FOUNDER.role}</p>
          <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-300">{FOUNDER.bio}</p>

          <div className="mt-6 flex justify-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                className="w-10 h-10 rounded-full grid place-items-center border border-white/10 text-slate-300 hover:text-white hover:border-white/30"
              >
                <SocialIcon path={s.path} className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </Reveal>

      {/* The rest of the team */}
      <div>
        <Reveal>
          <AnimatedHeading text="Meet Our Brains" highlight="Brains" className="text-4xl md:text-5xl font-bold text-white" />
        </Reveal>

        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-12">
          {TEAM.map((member, i) => (
            <Reveal key={member.name} delay={i * 80} className="w-full sm:w-[46%] lg:w-[30%]">
              <div className="text-center">
                <Avatar
                  src={member.photo}
                  name={member.name}
                  textClass="text-3xl"
                  className="w-32 h-32 rounded-full mx-auto border border-white/10"
                />
                <h4 className="mt-5 text-base font-bold uppercase tracking-wide text-white">{member.name}</h4>
                <p className="mt-1 text-sm text-cyan-400">{member.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{member.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
