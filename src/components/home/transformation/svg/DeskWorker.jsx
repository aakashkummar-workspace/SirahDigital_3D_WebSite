"use client";
import React from 'react';

/*
 * The person at the desk — shared by scene 1 (stressed) and scene 3 (calm).
 *
 * ── Camera ───────────────────────────────────────────────────────────────
 * Near profile, roughly 15° off, person on the left facing right, monitor on
 * the right, desk running between them. Profile is the right choice because
 * the spine curve is the story: hunched versus upright reads instantly from
 * the side and is nearly invisible head-on. It also means one visible eye
 * (one lid to animate) and no arm foreshortening, which is the hardest thing
 * to draw convincingly in vector.
 *
 * ── One figure, two poses ────────────────────────────────────────────────
 * The element set and the joint topology never change between moods. Only the
 * POSE table below changes. Posture is expressed as nested-group transforms
 * and never as a morphing `d` — CSS interpolation of path data is Chrome-only,
 * so Safari and Firefox would simply snap.
 *
 *   pelvis → torso (breathing) → shoulders → neckHead (scan) → face
 *                                          → upperArm → forearm (typing) → hand
 *
 * Every group carries an explicit user-unit transformOrigin, the idiom already
 * used in ServiceVisuals and MissionControl.
 *
 * ── Legibility on a dark site ────────────────────────────────────────────
 * The figure is a lit silhouette, not a flat-colour illustration: fills come
 * from the gradients in SceneDefs, which run from near-black on the left to
 * the scene accent on the right. The monitor is the light source. Strokes are
 * never below 1.6 user units — at the smallest mobile panel the stage scales
 * to about 0.47, so a 1-unit stroke would render at half a CSS pixel and
 * disappear.
 */

const POSE = {
  stressed: {
    spineTilt: 7,        // degrees — hunched over the keyboard
    shoulderRaise: 6,    // shoulders up around the ears
    headRot: 6,
    headDrop: 7,
    upperArmRot: 6,
    forearmRot: -5,
    brow: 'M283 160 L305 166',                    // angled down and in: furrowed
    mouth: 'M296 200 C300 198, 303 198, 306 199', // flat, tense
    breathe: '2.4px',
    breatheDur: 2400,     // shallow and quick
    tap: '3.2deg',
    typeDur: 170,         // frantic
    blinkDur: 2600,
    scan: '3.6deg',
    scanDur: 3200,        // darting between windows
    farHandTyping: true,
  },
  calm: {
    spineTilt: 0,
    shoulderRaise: 0,
    headRot: -1,
    headDrop: 0,
    upperArmRot: -2,
    forearmRot: 2,
    brow: 'M283 163 L305 161',                    // level, relaxed
    mouth: 'M295 199 C299 204, 304 204, 307 199', // soft smile
    breathe: '1.5px',
    breatheDur: 4600,     // deep and slow
    tap: '1.6deg',
    typeDur: 430,         // unhurried
    blinkDur: 5400,
    scan: '1.2deg',
    scanDur: 7000,
    farHandTyping: false, // other hand rests on the mouse
  },
};

export default function DeskWorker({ mood = 'calm', run, idBase, accent }) {
  const p = POSE[mood] || POSE.calm;
  const body = `url(#${idBase}-body)`;
  const skin = `url(#${idBase}-skin)`;

  // Negative delays so the figure is already mid-motion on the first frame.
  // Without them every scene switch visibly starts the person from rest,
  // which reads as mechanical.
  const anim = (name, dur, delay = 0) =>
    run ? `${name} ${dur}ms ease-in-out ${delay}ms infinite` : undefined;

  return (
    <g>
      {/* contact shadow under chair and desk */}
      <ellipse cx="250" cy="452" rx="180" ry="20" fill={`url(#${idBase}-shadow)`} />

      {/* ── chair ─────────────────────────────────────────────────────── */}
      <g>
        {/* backrest, with a lumbar seam and a headrest gap so it reads as an
            office chair rather than an anonymous dark slab */}
        <g transform="rotate(-6 136 266)">
          <rect x="96" y="196" width="78" height="132" rx="22" fill="#1D1839" stroke="#3A3468" strokeWidth="2" />
          <path d="M104 262 H166" stroke="#3A3468" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M104 232 H166" stroke="#3A3468" strokeWidth="1.6" strokeOpacity="0.6" strokeLinecap="round" />
        </g>
        {/* armrest — reads immediately as seating and gives the near arm
            something to emerge from */}
        <path
          d="M156 300 H206 C214 300, 216 308, 208 308 H162"
          fill="none" stroke="#3A3468" strokeWidth="6.5" strokeLinecap="round"
        />
        <rect x="146" y="328" width="11" height="68" rx="5.5" fill="#1D1839" />
        <path
          d="M112 400 H190 M126 396 L116 416 M176 396 L186 416 M151 396 V418"
          stroke="#1D1839" strokeWidth="7.5" strokeLinecap="round" fill="none"
        />
      </g>

      {/* ── figure ────────────────────────────────────────────────────── */}
      {/* pelvis is the root joint; everything hangs off it */}
      <g transform="translate(0,0)">
        {/* thighs — read as seated, mostly hidden by the desk later */}
        <path
          d="M186 330 C208 322, 246 324, 268 336 L268 360 L186 360 Z"
          fill="#221D3E"
        />

        {/* far arm, darkest, painted first so it reads as depth */}
        <path
          d="M232 244 C252 258, 274 286, 300 316"
          stroke="#221D3E" strokeWidth="17" strokeLinecap="round" fill="none"
        />

        {/* torso — breathing lives here */}
        <g
          style={{
            transformOrigin: '205px 330px',
            transform: `rotate(${p.spineTilt}deg)`,
            '--breathe': p.breathe,
            animation: anim('torso-breathe', p.breatheDur, -600),
          }}
        >
          <path
            d="M186 330 C180 296, 190 258, 214 238 C232 224, 258 228, 266 246
               C276 268, 274 302, 272 332 C244 342, 212 342, 186 330 Z"
            fill={body} stroke="#3B3468" strokeWidth="2.2"
          />

          {/* shoulders */}
          <g style={{ transform: `translateY(${-p.shoulderRaise}px)` }}>

            {/* neck + head — the scan lives here */}
            <g
              style={{
                transformOrigin: '250px 232px',
                transform: `rotate(${p.headRot}deg) translateY(${p.headDrop}px)`,
                '--scan': p.scan,
                animation: anim('head-scan', p.scanDur, -900),
              }}
            >
              <path d="M244 216 L268 216 L268 240 L244 238 Z" fill={skin} opacity="0.85" />

              {/* Head as a profile path with a real nose. A circle here is the
                  single biggest tell of clip art. */}
              <path
                d="M250 176
                   C250 150, 276 140, 292 151
                   C306 160, 310 172, 309 182
                   L314 193
                   L306 195
                   L306 203
                   C306 211, 298 216, 289 215
                   L276 214
                   C259 211, 248 198, 250 176 Z"
                fill={skin} stroke="#4E4680" strokeWidth="1.8"
              />

              {/* ear */}
              <path
                d="M262 186 C257 184, 257 194, 263 194"
                stroke="#4E4680" strokeWidth="1.8" fill="none" strokeLinecap="round"
              />

              {/* eye: almond, iris clipped inside it, lid as its own group */}
              <path
                d="M286 172 C291 167, 299 167, 303 173 C299 180, 291 180, 286 172 Z"
                fill="#0E0B1E"
              />
              <g clipPath={`url(#${idBase}-eye)`}>
                <circle cx="296" cy="174" r="3" fill="#DDE3FF" />
                <circle cx="297" cy="174" r="1.5" fill="#0E0B1E" />
              </g>
              <g
                style={{
                  transformOrigin: '294px 168px',
                  animation: anim('blink', p.blinkDur, -400),
                }}
              >
                <path
                  d="M285 171 C290 165, 300 165, 304 172 L304 166 L285 166 Z"
                  fill={skin}
                />
              </g>

              {/* eyebrow — after the spine, this carries the most mood */}
              <path
                d={p.brow}
                stroke="#171334" strokeWidth="2.6" strokeLinecap="round" fill="none"
              />

              <path
                d={p.mouth}
                stroke="#171334" strokeWidth="1.9" strokeLinecap="round" fill="none"
              />

              {/* hair, over the cranium and down to the nape */}
              <path
                d="M248 178 C244 148, 274 134, 294 148 C300 152, 303 158, 304 164
                   C298 152, 282 146, 268 152 C258 156, 252 166, 251 180 Z"
                fill={`url(#${idBase}-hair)`}
              />
            </g>

            {/* The near arm is deliberately NOT here. It has to be painted
                after the desk and the keyboard so the hand rests on the keys
                rather than being buried under them — see below. */}
          </g>
        </g>
      </g>

      {/* ── desk ──────────────────────────────────────────────────────────
          Painted after the lower body so it occludes the legs, but before the
          hands so they rest on top of the keyboard. */}
      <path d="M70 342 H600 L612 360 H58 Z" fill="#221C42" stroke="#332B5C" strokeWidth="1.8" />
      <path d="M70 342 H600" stroke="#FFFFFF" strokeOpacity="0.09" strokeWidth="1.6" />
      <rect x="58" y="360" width="554" height="15" fill="#191434" />
      {/* light spilling from the monitor across the desk surface */}
      <path d="M300 342 H600 L612 360 H288 Z" fill={`url(#${idBase}-spill)`} opacity="0.7" />

      {/* keyboard */}
      <path d="M262 330 H432 L444 344 H250 Z" fill="#2A2450" stroke="#3B3468" strokeWidth="1.6" />
      {[0, 1, 2].map((row) => (
        <path
          key={row}
          d={`M${272 + row * 4} ${334 + row * 4} H${424 - row * 3}`}
          stroke="#4B4382" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="7 6"
        />
      ))}

      {/* far hand — also after the keyboard, for the same reason as the near
          one. Typing alongside when stressed; parked on the mouse when calm. */}
      {p.farHandTyping ? (
        <g style={{ transformOrigin: '300px 322px', animation: anim('finger-tap', 230, -120) }}>
          <path
            d="M290 316 C302 313, 314 317, 318 323 C320 328, 314 331, 307 331
               L296 330 C291 329, 288 322, 289 319 Z"
            fill="#38316A" stroke="#4A4280" strokeWidth="1.5"
          />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={296 + i * 6} y={329} width="4.5" height="8" rx="2.2" fill="#38316A" stroke="#4A4280" strokeWidth="1.1" />
          ))}
        </g>
      ) : (
        <g>
          {/* mouse, with the hand resting over it */}
          <ellipse cx="466" cy="334" rx="15" ry="10" fill="#231E44" stroke="#3B3468" strokeWidth="1.5" />
          <path
            d="M452 330 C462 324, 476 326, 480 332 C482 337, 474 340, 466 340
               L457 339 C452 338, 449 333, 451 331 Z"
            fill="#38316A" stroke="#4A4280" strokeWidth="1.5"
          />
        </g>
      )}

      {/* ── near arm, on top of everything ──────────────────────────────
          Lifted out of the torso hierarchy so it paints after the desk and
          keyboard — otherwise the hand is buried under the very keys it is
          supposed to be resting on.

          The shoulder transforms are replicated statically here rather than
          inherited. That is also the more truthful behaviour: a planted hand
          does not rise and fall with the chest, so the arm deliberately does
          not inherit the breathing animation.

          Outlined a shade lighter than the torso — without that separation the
          whole limb sinks into the body and the figure stops reading as
          someone reaching for a keyboard. */}
      <g style={{ transformOrigin: '205px 330px', transform: `rotate(${p.spineTilt}deg)` }}>
        <g style={{ transform: `translateY(${-p.shoulderRaise}px)` }}>
          <g style={{ transformOrigin: '242px 246px', transform: `rotate(${p.upperArmRot}deg)` }}>
            <path d="M242 246 C254 264, 262 280, 272 298" stroke="#4A4280" strokeWidth="22" strokeLinecap="round" fill="none" />
            <path d="M242 246 C254 264, 262 280, 272 298" stroke={body} strokeWidth="18" strokeLinecap="round" fill="none" />

            {/* forearm — typing lives here */}
            <g
              style={{
                transformOrigin: '272px 298px',
                transform: `rotate(${p.forearmRot}deg)`,
                '--tap': p.tap,
                animation: anim('type-tap', p.typeDur, -70),
              }}
            >
              <path d="M272 298 C294 306, 312 314, 328 320" stroke="#4A4280" strokeWidth="20" strokeLinecap="round" fill="none" />
              <path d="M272 298 C294 306, 312 314, 328 320" stroke={body} strokeWidth="16" strokeLinecap="round" fill="none" />
              {/* cuff */}
              <ellipse cx="329" cy="320" rx="5.5" ry="9" fill="#5A5296" transform="rotate(30 329 320)" />

              {/* hand on the keys — knuckles, thumb and four fingers */}
              <g style={{ animation: anim('finger-tap', p.typeDur, -40) }}>
                <path
                  d="M330 314 C344 311, 358 315, 363 322 C365 327, 359 331, 351 331
                     L337 330 C331 329, 327 322, 328 318 Z"
                  fill={skin} stroke="#5A5296" strokeWidth="1.7"
                />
                <path d="M332 324 C338 326, 342 329, 343 333" stroke="#5A5296" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                {[0, 1, 2, 3].map((i) => (
                  <rect
                    key={i}
                    x={338 + i * 6.5} y={329} width="5" height="9" rx="2.5"
                    fill={skin} stroke="#5A5296" strokeWidth="1.2"
                    style={{ animation: anim('finger-tap', p.typeDur, -i * 48) }}
                  />
                ))}
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

/**
 * The monitor. Kept separate from the figure because scenes 1 and 3 fill the
 * screen with completely different content, and scene 2 borrows the empty
 * shell as its faint background silhouette.
 */
export function Monitor({ idBase, accent, children, glow = true }) {
  return (
    <g>
      {glow && <ellipse cx="492" cy="238" rx="150" ry="130" fill={`url(#${idBase}-glow)`} opacity="0.5" />}
      <g transform="rotate(-4 492 330)">
        <rect x="382" y="136" width="220" height="196" rx="12" fill="#171334" stroke="#37305F" strokeWidth="2.2" />
        <rect x="394" y="148" width="196" height="164" rx="6" fill="#0D0A20" />
        <rect x="394" y="148" width="196" height="164" rx="6" fill={`url(#${idBase}-screen)`} />
        {/* screen contents live in this coordinate space */}
        {children}
      </g>
      <rect x="478" y="330" width="26" height="22" rx="4" fill="#221C42" />
      <ellipse cx="491" cy="354" rx="52" ry="8" fill="#221C42" stroke="#332B5C" strokeWidth="1.6" />
    </g>
  );
}
