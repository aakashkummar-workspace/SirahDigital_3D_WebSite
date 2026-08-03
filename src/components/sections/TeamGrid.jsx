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
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 lg:gap-16 items-stretch">

      {/* Founder */}
      <Reveal className="h-full">
        {/* Sizes step up at lg, where the panel is stretched tall — keeps the
            content filling the box instead of floating in the middle */}
        <div className="group h-full flex flex-col justify-center rounded-3xl border p-8 lg:p-10 text-center relative overflow-hidden pointer-events-auto bg-gradient-to-b from-[#0b1c2b] via-[#0a1220] to-[#0b0714] border-white/10">
          <div className="absolute -top-20 -left-16 w-56 h-56 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />
          <Avatar
            src={FOUNDER.photo}
            name={FOUNDER.name}
            textClass="text-6xl"
            className="w-48 h-48 lg:w-64 lg:h-64 rounded-full mx-auto relative ring-4 ring-cyan-400/30 shadow-xl"
          />
          <h3 className="mt-8 lg:mt-10 text-2xl lg:text-[2rem] font-bold uppercase tracking-wide leading-tight">{FOUNDER.name}</h3>
          <p className="mt-3 lg:mt-4 text-base lg:text-xl font-semibold text-cyan-400">{FOUNDER.role}</p>
          <p className="mt-5 lg:mt-7 text-sm lg:text-base leading-relaxed text-brand-muted">{FOUNDER.bio}</p>

          <div className="mt-8 lg:mt-10 flex justify-center gap-3 lg:gap-4">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={s.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-full grid place-items-center border transition-colors border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400/60"
              >
                <SocialIcon path={s.path} className="w-5 h-5 lg:w-6 lg:h-6" />
              </a>
            ))}
          </div>
        </div>
      </Reveal>

      {/* The rest of the team */}
      <div>
        <Reveal>
          <AnimatedHeading text="Meet Our Brains" highlight="Brains" className="text-4xl md:text-5xl font-bold" />
          <div className="mt-4 h-1 w-56 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-transparent" />
        </Reveal>

        {/* Wrapping flex, not a grid — it centres the final short row */}
        <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-14">
          {TEAM.map((member, i) => (
            <Reveal key={member.name} delay={i * 100} className="w-full sm:w-[46%] lg:w-[30%]">
              <div className="text-center group">
                <Avatar
                  src={member.photo}
                  name={member.name}
                  textClass="text-3xl"
                  className="w-36 h-36 rounded-full mx-auto ring-2 ring-cyan-400/40 shadow-lg transition-transform duration-500 group-hover:scale-105"
                />
                <h4 className="mt-6 text-lg font-bold uppercase tracking-wide">{member.name}</h4>
                <p className="mt-2 text-cyan-400">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-brand-muted">{member.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
