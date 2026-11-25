// Where things stand in the 3D space, and the camera's path through it. Pure numbers (no drawing), so a
// script can project every position for every camera key before anything is animated.
import { rad } from './camera';
import type { Cam, Key, V3 } from './camera';
import type { Timeline } from './timeline';

export const YB = 0; // boards' centre height
export const CORE: V3 = [0, -1640, 0]; // the core floats high above the middle
export const YF = 1000; // the floor
export const FLOOR = 6200;
/** Each board is turned this much away from facing the core straight on, so from a board's camera the core shows
 *  beside the board instead of hiding right behind it. */
export const BOARD_TURN = 22;

export type Layout = {
  R: number;
  RN: number;
  theta: (i: number) => number;
  /** The board's own rotation (rotateY, degrees). */
  turn: (i: number) => number;
  center: (i: number) => V3;
};
export const layoutOf = (tl: Timeline): Layout => {
  const n = tl.boards.length;
  const R = Math.max(1900, n * 430);
  const step = 360 / Math.max(n, 3);
  const theta = (i: number) => i * step;
  return {
    R,
    RN: Math.min(1000, 0.45 * R),
    theta,
    turn: (i) => theta(i) + BOARD_TURN,
    center: (i) => [R * Math.sin(rad(theta(i))), YB, R * Math.cos(rad(theta(i)))],
  };
};

/** The camera path: two keys per scene, joined by a monotone cubic. Boards: arrive in front of the board, then a
 *  slow push and a small swing while the line is spoken. Hook, payoff, end: wide shots of the whole space. */
export function buildKeys(tl: Timeline, L: Layout): Key[] {
  const keys: Key[] = [];
  const add = (f: number, c: Cam) => keys.push({ f: Math.round(f), c });
  const boardCam = (i: number, off: number, d: number): Cam => {
    const [x, , z] = L.center(i);
    return { t: [x, YB + 40, z], d, yaw: -L.turn(i) + off, pitch: -4 };
  };
  /** Looking at the core from above and outside; `lift` moves the core up (+) or down (−) on the frame. */
  const wide = (yaw: number, pitch: number, d: number, lift = 0): Cam => ({ t: [0, CORE[1] + 520 + lift, 0], d, yaw, pitch });
  let yaw = -BOARD_TURN + 40; // the wide shots keep turning the same way as the boards
  let b = 0;
  for (const s of tl.scenes) {
    const [a, e] = tl.bounds[s.id];
    if (s.kind === 'board') {
      const i = b++;
      add(a + 14, boardCam(i, 6, 1600));
      add(Math.max(a + 24, e - 12), boardCam(i, 1, 1520));
      yaw = -L.turn(i) + 1;
    } else if (s.kind === 'hook') {
      add(a === 0 ? 0 : a + 14, wide(yaw + 12, -32, 3300, -150));
      add(Math.max(a + 24, e - 16), wide(yaw + 3, -28, 2900, -160));
    } else if (s.kind === 'payoff') {
      add(a + 22, wide(yaw - 30, -24, 3300, -380));
      add(Math.max(a + 32, e - 4), wide(yaw - 42, -26, 3050, -380));
      yaw -= 42;
    } else {
      add(e, wide(yaw - 10, -24, 2900, -380));
      yaw -= 10;
    }
  }
  keys.sort((x, y) => x.f - y.f);
  for (let i = 1; i < keys.length; i++) if (keys[i].f <= keys[i - 1].f) keys[i].f = keys[i - 1].f + 1;
  return keys;
}
