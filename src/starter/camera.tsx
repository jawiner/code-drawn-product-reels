// The 3D space: an orbit camera (target, distance, yaw, pitch) with the same maths as the CSS transform, so a
// point projected here lands exactly where CSS 3D draws it. Planes are real CSS 3D; anything that must stay crisp
// (the core, beams, nodes) is drawn flat at its projected position.
import React from 'react';
import { AbsoluteFill } from 'remotion';

export type V3 = [number, number, number];
export type Cam = { t: V3; d: number; yaw: number; pitch: number };
export const P = 1400; // perspective: a plane at the target, at distance P, is drawn at its own size
export const rad = (x: number) => (x * Math.PI) / 180;

function toCam(v: V3, c: Cam): V3 {
  const x = v[0] - c.t[0];
  const y = v[1] - c.t[1];
  const z = v[2] - c.t[2];
  const ay = rad(c.yaw);
  const ap = rad(c.pitch);
  const x1 = x * Math.cos(ay) + z * Math.sin(ay);
  const z1 = -x * Math.sin(ay) + z * Math.cos(ay);
  const y2 = y * Math.cos(ap) - z1 * Math.sin(ap);
  const z2 = y * Math.sin(ap) + z1 * Math.cos(ap);
  return [x1, y2, z2 + P - c.d];
}
/** Where a world point lands on the 1080×1920 frame, and how much it is scaled there. */
export function project(v: V3, c: Cam) {
  const [x, y, z] = toCam(v, c);
  const w = P - z;
  const s = P / Math.max(w, 1);
  return { x: 540 + x * s, y: 960 + y * s, s, depth: w, ok: w > 60 };
}
/** Where the camera itself is in the world. */
export const eye = (c: Cam): V3 => {
  const p = rad(c.pitch);
  const y = rad(c.yaw);
  return [c.t[0] - c.d * Math.cos(p) * Math.sin(y), c.t[1] + c.d * Math.sin(p), c.t[2] + c.d * Math.cos(p) * Math.cos(y)];
};
export const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const worldCss = (c: Cam) => `translateZ(${P - c.d}px) rotateX(${c.pitch}deg) rotateY(${c.yaw}deg) translate3d(${-c.t[0]}px, ${-c.t[1]}px, ${-c.t[2]}px)`;

/** Fritsch–Carlson monotone cubic through (xs, ys) at x: smooth, and it never overshoots a key. */
function monotone(xs: number[], ys: number[], x: number): number {
  const n = xs.length;
  if (n === 1 || x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  const h = xs.slice(1).map((v, i) => v - xs[i]);
  const dlt = h.map((hi, i) => (ys[i + 1] - ys[i]) / hi);
  const m = ys.map((_, i) => (i === 0 ? dlt[0] : i === n - 1 ? dlt[n - 2] : dlt[i - 1] * dlt[i] <= 0 ? 0 : (dlt[i - 1] + dlt[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (dlt[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / dlt[i];
    const b = m[i + 1] / dlt[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * dlt[i];
      m[i + 1] = t * b * dlt[i];
    }
  }
  let i = 0;
  while (x > xs[i + 1]) i++;
  const t = (x - xs[i]) / h[i];
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h[i] * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h[i] * m[i + 1];
}

export type Key = { f: number; c: Cam };
/** The camera at frame f, moving smoothly through the keys (sorted by frame). */
export const cameraAt = (keys: Key[], f: number): Cam => {
  const xs = keys.map((k) => k.f);
  const v = (g: (c: Cam) => number) => monotone(xs, keys.map((k) => g(k.c)), f);
  return { t: [v((c) => c.t[0]), v((c) => c.t[1]), v((c) => c.t[2])], d: v((c) => c.d), yaw: v((c) => c.yaw), pitch: v((c) => c.pitch) };
};

/** A flat plane in the world, centred on `p`, turned by `rot`. Its back is invisible. */
export const Plane: React.FC<{ p: V3; w: number; h: number; rot?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ p, w, h, rot = '', style, children }) => (
  <div
    style={{
      position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, transformOrigin: '50% 50%',
      transform: `translate3d(${p[0]}px, ${p[1]}px, ${p[2]}px) ${rot}`, backfaceVisibility: 'hidden', ...style,
    }}
  >
    {children}
  </div>
);

/** One CSS 3D stage that follows the camera. */
export const Stage: React.FC<{ c: Cam; children: React.ReactNode }> = ({ c, children }) => (
  <AbsoluteFill style={{ perspective: `${P}px`, perspectiveOrigin: '540px 960px', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 540, top: 960, width: 0, height: 0, transformStyle: 'preserve-3d', transformOrigin: '0 0', transform: worldCss(c) }}>{children}</div>
  </AbsoluteFill>
);
