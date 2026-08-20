import React from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import Avatar from '@/components/ui/Avatar';
import { TEAM } from '@/data/team';

/*
 * The team.
 *
 * This used to be a two-column layout: the founder in a 340px rail on the
 * left, the other five beside him. The hero at the top of /about is his
 * introduction now, and his statement runs under it in AboutStatement, so
 * this is the roster and nothing else — the five run full width in one row
 * instead of wrapping at 30% inside a leftover column.
 *
 * The social links moved with him. They were his, not the team's, and the
 * footer carries the same set for anyone who reaches the bottom of the page.
 */
export default function TeamGrid() {
  return (
    <div>
      <Reveal>
        <AnimatedHeading
          text="Meet Our Brains"
          highlight="Brains"
          className="text-4xl md:text-5xl font-bold text-ink"
        />
      </Reveal>

      {/* Five members, so five columns on a wide screen puts them on one
          line with no orphan. Two up on a phone, three on a tablet. */}
      <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-5">
        {TEAM.map((member, i) => (
          <Reveal key={member.name} delay={i * 80} y={14} duration={600}>
            {/* The whole card is the link to that member's page, not just the
                portrait: a 112px circle is the obvious thing to aim at, but the
                name under it is what a reader is actually pointing to, and one
                target avoids two tab stops for one destination.

                `group` does double duty — it restores the portrait to full
                brightness on hover, which Avatar's dim keys off the parent, and
                it drives the name and the arrow below. */}
            <Link
              href={`/${member.slug}`}
              className="group block text-center focus-visible:outline-offset-4"
            >
              <Avatar
                src={member.photo}
                name={member.name}
                textClass="text-3xl"
                className="w-28 h-28 md:w-32 md:h-32 rounded-full mx-auto border border-ink/10 transition-colors duration-300 group-hover:border-ink/30"
              />
              <h4 className="mt-5 text-sm md:text-base font-bold uppercase tracking-wide text-ink">
                {member.name}
              </h4>
              <p className="mt-1 text-sm text-cyan-400">{member.role}</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-subtle">{member.bio}</p>
              {/* The affordance. Without it a card that happens to be a link
                  looks exactly like one that is not. */}
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink/45 transition-colors duration-300 group-hover:text-ink">
                See the work
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
