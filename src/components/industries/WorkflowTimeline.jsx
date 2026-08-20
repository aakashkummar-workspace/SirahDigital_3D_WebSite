"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { iconFor } from './workflowIcons';
import { useReducedMotion } from '@/hooks/useMediaQuery';

/*
 * The animated workflow that replaces the hero image on every industry page.
 *
 * One component for all twelve — the steps are the only prop. Icons are
 * derived from each step's title by workflowIcons.js, so a new workflow needs
 * no icon decision and no import.
 *
 * Layout is CSS's job and lives in globals.css under `.wf-*`: vertical on
 * mobile, a two-column stagger on tablet, a horizontal zig-zag on desktop,
 * all off this same markup. What is here is the entrance choreography.
 *
 * Three nested levels per step, and the nesting is load-bearing:
 *   <li>          grid placement, and the tablet stagger offset
 *   <motion.div>  the entrance — opacity, y, scale
 *   <div.wf-card> the surface, and the hover lift
 * Each owns a different transform. Collapsing any two would put the entrance
 * animation and a CSS transform on one element, where the last writer wins
 * and the node either never arrives or never lifts.
 */

const EASE = [0.22, 0.61, 0.36, 1];

// Long enough to read as one continuous sweep rather than seven separate
// arrivals, short enough that the last node is not still landing after the
// eye has moved on.
const STEP_DURATION = 0.42;
const STEP_STAGGER = 0.12;
const RAIL_DURATION = 1.15;

// Passive: it only forwards `show` to the rails and the list. The stagger
// deliberately does not live here — the rails are children too, and staggering
// them would delay every node behind two rail beats.
const panelV = { hidden: {}, show: {} };

const railGrowV = (axis) => ({
  hidden: axis === 'x' ? { scaleX: 0 } : { scaleY: 0 },
  show: {
    ...(axis === 'x' ? { scaleX: 1 } : { scaleY: 1 }),
    transition: { duration: RAIL_DURATION, ease: EASE },
  },
});

const listV = {
  hidden: {},
  show: { transition: { staggerChildren: STEP_STAGGER, delayChildren: 0.08 } },
};

const nodeV = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: STEP_DURATION, ease: EASE } },
};

export default function WorkflowTimeline({ steps, label = 'Automation workflow' }) {
  const reduced = useReducedMotion();
  if (!steps?.length) return null;

  // Reduced motion starts in the finished state. The whole sequence is
  // decorative — the workflow reads exactly the same standing still.
  const initial = reduced ? 'show' : 'hidden';

  return (
    <motion.div
      variants={panelV}
      initial={initial}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="rounded-3xl border border-ink/[0.07] bg-ink/[0.025] p-5 backdrop-blur-sm sm:p-7 lg:p-9"
    >
      <p className="mb-6 text-fluid-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">
        {label}
      </p>

      <div className="relative" style={{ '--wf-steps': steps.length }}>
        {/* Both rails are rendered and only one is ever displayed, so each can
            own the growth axis its layout needs without a transform that has
            to know the breakpoint. */}
        <motion.span className="wf-rail wf-rail--v" variants={railGrowV('y')} aria-hidden="true">
          <i className="wf-pulse" />
        </motion.span>
        <motion.span className="wf-rail wf-rail--h" variants={railGrowV('x')} aria-hidden="true">
          <i className="wf-pulse" />
        </motion.span>

        <motion.ol className="wf-list" variants={listV} aria-label={label}>
          {steps.map((step, i) => {
            const Icon = iconFor(step.title);
            const side = i % 2 ? 'bottom' : 'top';
            return (
              <li
                key={step.title}
                className="wf-item"
                data-side={side}
                // Desktop places each node explicitly: its own column, and
                // row 1 or 3 with the rail's band between them.
                style={{ '--wf-col': i + 1, '--wf-row': side === 'top' ? 1 : 3 }}
              >
                <span className="wf-stub" aria-hidden="true" />
                <span className="wf-dot" aria-hidden="true" />

                <motion.div variants={nodeV} className="h-full">
                  <div className="wf-card flex flex-col gap-2 p-3.5 sm:p-4">
                    <span className="wf-icon inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-ink/[0.08] bg-ink/[0.04] text-brand-cyan">
                      <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-[0.8125rem] font-semibold leading-snug tracking-tight text-ink">
                      {step.title}
                    </span>
                    <span className="text-[0.6875rem] leading-snug text-brand-muted">
                      {step.desc}
                    </span>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </motion.ol>
      </div>
    </motion.div>
  );
}
