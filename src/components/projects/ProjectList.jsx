import React from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import StepFlow from '@/components/ui/StepFlow';
import { PRODUCTION_PROJECTS, DEVELOPMENT_PROJECTS } from '@/data/projects';

/*
 * The client systems, as an editorial list.
 *
 * This replaces the status board the page used to be: a green dot over
 * "ACTIVE PRODUCTION SYSTEMS", an amber one over "IN ACTIVE DEVELOPMENT", a
 * monospace client label and an impact figure on every row. It read as server
 * monitoring rather than as work. The information is all still here — it is
 * the framing that changed.
 *
 * Each project is one row, split in two: what it is on the left, what it
 * produced on the right. The split is what carries the argument, and it is
 * the reason the outcome is not a floating statistic — a metric sitting on
 * the same row as the system that caused it reads as its result.
 *
 * ── live vs in development ───────────────────────────────────────────────
 * A live system's right column carries its one outcome and a link. A project
 * still in build has produced no outcome, so it carries its phase instead and
 * is not a link — there is nothing yet to open. That asymmetry is deliberate:
 * giving the development rows an invented metric would be the least honest
 * thing on the page.
 *
 * ── on the folder ────────────────────────────────────────────────────────
 * This lived under components/work/ when /work was a route. It is not any
 * more — /work redirects to /products, and this list is the lower half of
 * that page. The folder was renamed rather than left behind, because a
 * directory named after a route that no longer exists is a trap.
 *
 * Server component. The hover choreography is `.work-row` in globals.css and
 * the entrance is Reveal, so there is nothing here to hydrate. The class
 * names keep the `work-` prefix: they describe client work, which is still
 * what these rows are, and renaming them would touch 150 lines of CSS to no
 * benefit.
 */

// 8-16px and quick, per the brief. Rows are tall, so they arrive one at a
// time as you reach them rather than as a staggered block.
const REVEAL_Y = 12;
const REVEAL_MS = 500;

function ProjectRow({ project, number }) {
  const isLive = Boolean(project.metric);
  // The whole live row is the link. A single link around the row beats a
  // small target in the corner, and it means the title, the metric and the
  // arrow all respond to the same hover.
  //
  // It used to say "View case study" and it went to /contact — there is no
  // case study to view, and none of these projects has a page. The label now
  // names what actually happens at the far end.
  const Row = isLive ? Link : 'div';
  const rowProps = isLive
    ? {
        href: project.href,
        'aria-label': `${project.title} - enquire about this system`,
        className: 'work-row work-row--link',
      }
    : { className: 'work-row' };

  return (
    <li>
      <Reveal y={REVEAL_Y} duration={REVEAL_MS}>
        <Row {...rowProps}>
          <div className="work-row__main">
            <span className="work-row__num" aria-hidden="true">
              {String(number).padStart(2, '0')}
            </span>

            <h3 className="work-row__title">{project.title}</h3>
            <p className="work-row__industry">{project.industry}</p>

            <p className="work-row__desc">{project.blurb}</p>

            <StepFlow steps={project.flow} className="work-row__flow" />
          </div>

          <div className="work-row__outcome">
            {isLive ? (
              <>
                <span className="work-row__metric">{project.metric}</span>
                <span className="work-row__metric-label">{project.metricLabel}</span>
                <span className="work-row__go">
                  Enquire about this
                  <span aria-hidden="true" className="work-row__go-arrow">
                    →
                  </span>
                </span>
              </>
            ) : (
              /* No number, because there is no result yet — just where the
                 build has got to, at the size of a metric's label rather
                 than a metric. */
              <span className="work-row__phase">{project.phase}</span>
            )}
          </div>
        </Row>
      </Reveal>
    </li>
  );
}

function Group({ label, projects, startAt, id }) {
  return (
    <section aria-labelledby={id}>
      <Reveal y={REVEAL_Y} duration={REVEAL_MS}>
        {/* Semantically a heading, visually a quiet label. The page's
            structure should be readable by a screen reader even though the
            eye is meant to pass straight over these. */}
        <h2 id={id} className="work-group__label">
          {label}
        </h2>
      </Reveal>

      <ul role="list" className="mt-8 md:mt-10">
        {projects.map((project, i) => (
          <ProjectRow key={project.slug} project={project} number={startAt + i} />
        ))}
      </ul>
    </section>
  );
}

export default function ProjectList() {
  /*
   * 1100px, not the 1160 this carried on /work. The page it now sits in was
   * built at 1100 and the whole point of the merge is that the two halves
   * share a measure — a 60px step between the products above and the case
   * studies below is exactly the kind of seam that says "two pages stapled
   * together".
   */
  return (
    <div className="mx-auto w-full max-w-[1100px] px-6">
      <Group
        id="live-systems"
        label="Live systems"
        projects={PRODUCTION_PROJECTS}
        startAt={1}
      />

      <div className="mt-24 md:mt-32">
        <Group
          id="in-development"
          label="In development"
          projects={DEVELOPMENT_PROJECTS}
          // Numbering runs across both groups — it is the section's index,
          // not each group's.
          startAt={PRODUCTION_PROJECTS.length + 1}
        />
      </div>
    </div>
  );
}
