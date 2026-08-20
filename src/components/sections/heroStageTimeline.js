/**
 * The hero's scroll timeline, as arithmetic.
 *
 * The hero is a pinned stage: a tall track with a viewport-sized sticky child.
 * Scrolling the track does not move the stage, it advances a number — and this
 * file is the only place that decides what that number means. Keeping it out of
 * the components is what makes the sequence adjustable, and it is imported by
 * both sides of the stage: the DOM reads it to fade its cards, the 3D scene
 * reads it to turn the ring and fly a card out of it. One source, so the two
 * can never disagree about where in the sequence we are.
 *
 * The sequence, in track progress `p` (0 at the top of the track, 1 at the
 * bottom):
 *
 *   0 ────── INTRO_END ────── RUN_START ─────────────────────────────────── 1
 *   │ hero copy  │ copy fades  │ one full turn of the ring, one product per
 *   │ at rest    │ out         │ third of it: the ring brings a card to the
 *   │ ring       │             │ front, the card flies out to the centre of
 *   │ drifting   │             │ the screen, holds, then falls back into the
 *                                ring as it turns to present the next one
 *
 * The robot does not move at any point. Only the cards do.
 */

export const INTRO_END = 0.12;
export const RUN_START = 0.28;

/**
 * Where a product's card sits inside its own segment of the run, in segment
 * units. A card owns [k, k+1]:
 *
 *   k-0.02 → k+0.20   flies out of the ring to the centre
 *   k+0.20 → k+0.90   held at the centre
 *   k+0.90 → k+1.00   drops back into the ring
 *
 * These are tighter than they look like they should be, and the reason is the
 * handover. The DOM card only appears for the last stretch of a flight, so
 * every unit of flight either side of that is a unit with nothing at the centre
 * of the screen. The first pass spent a third of each segment travelling and
 * left the middle empty for 40% of it — long enough to read as the page having
 * stopped working. This holds a product at the centre for 77% of its segment.
 *
 * The exit is deliberately half the entrance. A card arriving should look
 * presented; a card leaving has already been read and only needs to get out of
 * the way.
 *
 * The entrance leads by 0.02 and the exit ends on the boundary, so the two
 * barely overlap. Any more and both cards are in flight to the same point at
 * once from opposite sides of the ring, which reads as a collision.
 */
const ENTER_LEAD = 0.02;
const ENTER_SPAN = 0.2;
const EXIT_START = 0.9;
const EXIT_END = 1.0;

/**
 * The ring turns on its own window, wider than the exit and straddling the
 * boundary. Tying it to the exit made it turn 120 degrees in the ten percent of
 * a segment the card took to drop — technically synchronised and visibly a
 * jerk. Spread over twice that, the turn is the slowest thing on screen during
 * the handover, which is what makes the handover feel like a mechanism.
 */
const RING_START = 0.88;
const RING_END = 1.1;

/**
 * How far into a flight the DOM card takes over.
 *
 * Both sides must read this and use it as an exact complement — the scene fades
 * its card out on `1 - handoff(f)` while the stage fades its own in on
 * `handoff(f)`, so the two always sum to one. That is not tidiness. The 3D card
 * carries the product's dashboard and the DOM card carries its name and copy:
 * they are different pictures, so any moment where both are at half strength is
 * a double exposure of a chart over a headline. Summing to one keeps a single
 * card's worth of ink on screen throughout.
 *
 * 0.87 is late and the window is short — about 5vh of scrolling. By then the
 * eased flight is 99% of the way, so the two are within a percent of the same
 * size, and the swap is over before it can be read as two things.
 */
export const HANDOFF = 0.87;

export const handoff = (flight) => smoothstep(HANDOFF, 1, flight);

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const smoothstep = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// Slower out of the gate and slower into the stop than smoothstep, which is
// what a card leaving the ring wants: it should look like it is being presented,
// not thrown. The flat tail also matters at the other end — the DOM card takes
// over in the last stretch of the flight, and it can only do that invisibly if
// the 3D card has almost stopped growing by then.
export const easeInOut = (t) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export const mix = (a, b, t) => a + (b - a) * t;

/**
 * Resolves track progress into the two numbers everything else is derived from.
 *
 *   copyOut  0-1, how far the hero copy has left
 *   run      0-count, position along the product run; each product owns one
 */
export function solveStage(p, count) {
  return {
    // The copy goes before the ring starts turning, not with it. Both moving
    // together reads as the whole page sliding; the copy leaving first reads as
    // the hero handing over to the products.
    copyOut: smoothstep(0.015, INTRO_END + 0.03, p),
    run: clamp01((p - RUN_START) / (1 - RUN_START)) * count,
  };
}

/**
 * How far product `k` has flown out of the ring: 0 on the ring, 1 held at the
 * centre of the screen.
 */
export function cardFlight(k, run) {
  const rise = smoothstep(k - ENTER_LEAD, k + ENTER_SPAN, run);
  const fall = 1 - smoothstep(k + EXIT_START, k + EXIT_END, run);
  return rise * fall;
}

/**
 * How far the ring has turned, in whole products.
 *
 * A sum of the same windows the cards exit on, which is what gives the ring its
 * stop-start character: it holds still while a product is out at the centre,
 * then turns exactly one slot while that card falls back and the next comes
 * round. Turning it continuously instead — a plain `run * TAU / count` — meant
 * a card was always drifting sideways underneath the one being presented, and
 * the ring read as machinery rather than as something showing you things.
 *
 * Summing windows rather than stepping on `floor(run)` is what keeps it
 * continuous: a step would jump the last 7% of a turn the instant the segment
 * index changed.
 */
export function ringTurn(run, count) {
  let turn = 0;
  for (let j = 0; j < count; j++) turn += smoothstep(j + RING_START, j + RING_END, run);
  return turn;
}

/**
 * Which product is currently the subject — the one furthest out of the ring.
 *
 * Taken from the flight curves rather than from `Math.floor(run)` so it can
 * never disagree with what is actually on screen during a handover, which is
 * the one moment anything reading this cares about.
 */
export function activeIndex(run, count) {
  let best = 0;
  let bestF = -1;
  for (let k = 0; k < count; k++) {
    const f = cardFlight(k, run);
    if (f > bestF) {
      bestF = f;
      best = k;
    }
  }
  return best;
}
