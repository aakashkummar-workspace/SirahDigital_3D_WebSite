"use client";
import React from 'react';
import ChaosIllustration from './svg/ChaosIllustration';
import AIOrbit from './svg/AIOrbit';
import AutopilotIllustration from './svg/AutopilotIllustration';

/*
 * The artwork stage.
 *
 * All three scenes stay mounted and cross-fade, the pattern already proven in
 * services/VisualizationContainer.jsx. Conditional mounting would be wrong: a
 * cross-fade needs both layers on screen at once, and a remount restarts every
 * CSS transition from its "from" state, which flashes.
 *
 * The performance objection — SMIL running for hidden scenes — is handled by
 * the house idiom `{run && <animate/>}` inside each illustration. That removes
 * the SMIL node from the DOM. Opacity and visibility:hidden do NOT pause SMIL;
 * only unmounting does.
 *
 * The fade is deliberately asymmetric. When `run` flips false the outgoing
 * scene's artwork freezes mid-motion, so it leaves quickly (240ms) underneath
 * a slower, delayed entrance (520ms after 120ms) which hides the freeze.
 *
 * All three share viewBox 0 0 640 480, and scenes 1 and 3 place the desk,
 * chair, monitor and figure at identical coordinates — so the dissolve reads
 * as the man un-hunching at the same desk rather than as two pictures swapping.
 */

const SCENE_COMPONENTS = [ChaosIllustration, AIOrbit, AutopilotIllustration];

export default function SceneStage({ index, run, idBase }) {
  return (
    <div className="relative w-full aspect-[5/4] sm:aspect-[4/3]">
      {SCENE_COMPONENTS.map((Scene, i) => {
        const on = i === index;
        return (
          <div
            key={i}
            aria-hidden={!on}
            className="absolute inset-0"
            style={{
              opacity: on ? 1 : 0,
              transform: on ? 'scale(1)' : 'scale(0.97)',
              visibility: on ? 'visible' : 'hidden',
              pointerEvents: 'none',
              transition: on
                ? 'opacity 520ms cubic-bezier(.22,.61,.36,1) 120ms, transform 620ms cubic-bezier(.22,.61,.36,1) 120ms, visibility 0s linear 0s'
                : 'opacity 240ms cubic-bezier(.22,.61,.36,1), transform 240ms cubic-bezier(.22,.61,.36,1), visibility 0s linear 240ms',
            }}
          >
            <Scene run={on && run} idBase={`${idBase}-s${i}`} />
          </div>
        );
      })}
    </div>
  );
}
