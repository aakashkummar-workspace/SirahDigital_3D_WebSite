import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Reveal from '@/components/ui/Reveal';
import ClientReview from '@/components/team/ClientReview';
import MemberJourney from '@/components/team/MemberJourney';
import CTABand from '@/components/sections/CTABand';
import { TEAM, memberBySlug } from '@/data/team';
import { projectsFor } from '@/data/teamProjects';
import styles from './member.module.css';

/*
 * One page per member, at the root: /monisha, /jesheeba, /aakash, /salman,
 * /samad.
 *
 * ── why this is safe as a root dynamic segment ───────────────────────────
 * `app/(site)/[member]` sits alongside /about, /contact, /products and the
 * rest, so on the face of it it could swallow every unmatched top-level path.
 * Two things stop it. Next resolves static segments before dynamic ones, so
 * the named routes always win; and `dynamicParams = false` means anything
 * outside generateStaticParams is a 404 rather than a request that reaches
 * this component. The notFound() below is a third belt for the dev server,
 * where the same guarantee is looser.
 *
 * ── the portrait lives in the testimonial now ────────────────────────────
 * The page used to open with a portrait beside the name and a one-line bio
 * under it. Both are gone: the picture moved into the client-review card,
 * where it sits in the frame on the card's left edge, and the bio was replaced
 * by what a client says about the work. What is left above the card is the
 * role and the name, so the page still has one h1 and still says whose page it
 * is before it starts quoting anyone.
 *
 * The `review` strings in data/team.js are placeholder copy — see the note
 * over the roster there.
 *
 * ── no numbers on this page ──────────────────────────────────────────────
 * Asked for, and honoured throughout: the entries are not numbered, there is
 * no count of them anywhere, and there is no stat band. The one figure that
 * would have crept in by habit is a "5 projects" line under the name; it is
 * deliberately absent.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return TEAM.map(({ slug }) => ({ member: slug }));
}

export function generateMetadata({ params }) {
  const member = memberBySlug(params.member);
  if (!member) return {};
  return {
    title: member.name,
    description: `${member.name} - ${member.role} at Sirah Digital. ${member.bio}`,
    alternates: { canonical: `/${member.slug}` },
  };
}

export default function MemberPage({ params }) {
  const member = memberBySlug(params.member);
  if (!member) notFound();

  const projects = projectsFor(member.slug);

  return (
    <>
      <header className={styles.head}>
        <Reveal y={14} duration={600}>
          <Link href="/about#team" className={styles.back}>
            <span aria-hidden="true" className={styles.backArrow}>←</span>
            Meet our brains
          </Link>
        </Reveal>

        <div className={styles.identity}>
          <Reveal y={16} duration={700} delay={80}>
            {/*
              * Both designations where someone holds two, the second one
              * first: the roster shows the primary role on its own, and this
              * page is where the fuller picture belongs. Only Jesheeba has an
              * alsoRole today, so for everyone else this renders exactly the
              * single line it did before.
              */}
            <span className={styles.role}>
              {[member.alsoRole, member.role].filter(Boolean).map((r, i) => (
                <React.Fragment key={r}>
                  {i > 0 && <span className={styles.roleSep} aria-hidden="true">/</span>}
                  {r}
                </React.Fragment>
              ))}
            </span>
            <h1 className={styles.name}>{member.name}</h1>
          </Reveal>
        </div>

        <Reveal y={18} duration={720} delay={160}>
          <ClientReview member={member} />
        </Reveal>
      </header>

      <section className={styles.work} aria-labelledby="member-work">
        <Reveal y={16} duration={650}>
          <h2 id="member-work" className={styles.workLabel}>
            [ Built ]
          </h2>
        </Reveal>

        <MemberJourney projects={projects} />
      </section>

      <div className="mt-24 md:mt-32">
        <CTABand
          title="Want a system like these?"
          subtitle="Tell us where the time goes in your operation and we will map the build."
        />
      </div>
    </>
  );
}
