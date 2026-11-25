// The AI receptionist reel, v3: the same voice, music, timing and approved text as v2 (Film.tsx), filmed by
// a moving camera in one 3D space, like the reference reel. The phone lies on a dark floor in rings of light;
// her core floats high above it; each job's panels stand on a circle around the core. The camera looks down at
// the phone, tilts up with the call into the core, swings around the core from job to job, dives back to the
// phone for the call log and the weekly summary, and rises for the wide payoff. Titles and captions stay flat
// on the screen so they are always readable.
//
// Planes (floor, phone, boards) are real CSS 3D; the core, beams and the payoff's nodes are drawn flat at
// positions projected with the same camera, so everything lines up.
import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { ASSIST, Beam, C, CallLog, Core, HudTitle, Incoming, KARANTINA, MONO, Node, Phone, SCREEN, SolidGlass, SoonPill, rng } from './parts';
import type { IconName, Tone } from './parts';
import {
  Answer, BoardMode, Book, Callback, Close, NODES, REC_TOTAL, Review, Rules, START, STEP, Scene, SmoothBed, Spoken, WeeklyScreen, Whatsapp,
  W as at, blip, bounds, dur, lineEnd, out, seg,
} from './Film';
import type { Id } from './Film';

// ---------------------------------------------------------------------------------------------
// The camera: an orbit camera (target, distance, yaw, pitch) with the same maths as the CSS transform.
type V3 = [number, number, number];
type Cam = { t: V3; d: number; yaw: number; pitch: number };
const P = 1400; // perspective: a plane at the target, at distance P, is drawn at its own size
const rad = (x: number) => (x * Math.PI) / 180;

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
function project(v: V3, c: Cam) {
  const [x, y, z] = toCam(v, c);
  const w = P - z;
  const s = P / Math.max(w, 1);
  return { x: 540 + x * s, y: 960 + y * s, s, depth: w, ok: w > 60 };
}
/** Where the camera itself is in the world. */
const eye = (c: Cam): V3 => {
  const p = rad(c.pitch);
  const y = rad(c.yaw);
  return [c.t[0] - c.d * Math.cos(p) * Math.sin(y), c.t[1] + c.d * Math.sin(p), c.t[2] + c.d * Math.cos(p) * Math.cos(y)];
};
const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const worldCss = (c: Cam) => `translateZ(${P - c.d}px) rotateX(${c.pitch}deg) rotateY(${c.yaw}deg) translate3d(${-c.t[0]}px, ${-c.t[1]}px, ${-c.t[2]}px)`;

// ---------------------------------------------------------------------------------------------
// The space.
const CORE: V3 = [0, -1400, 0];
const YF = 800; // the floor
const PHONE: V3 = [0, YF, 0];
const RB = 2000; // the jobs' boards stand on this circle around the core
const YB = -404; // boards' centre height: from a job's camera the core shows top left, like v2's small core
const RN = 780; // the payoff's ring of jobs
type Job = 'callback' | 'book' | 'whatsapp' | 'review' | 'rules';
const RING: Record<'answer' | Job, number> = { answer: 0, callback: 60, book: 120, whatsapp: 180, review: 240, rules: 300 };
const NODE_ON_BOARD: Record<Job, [number, number]> = { callback: [952, 648], book: [968, 624], whatsapp: [968, 624], review: [968, 624], rules: [980, 652] };
const boardCenter = (th: number): V3 => [RB * Math.sin(rad(th)), YB, RB * Math.cos(rad(th))];
/** A point on a board (page coordinates 1080×1920) in the world. */
const onBoard = (th: number, lx: number, ly: number): V3 => {
  const b = boardCenter(th);
  const dx = lx - 540;
  return [b[0] + dx * Math.cos(rad(th)), b[1] + (ly - 960), b[2] - dx * Math.sin(rad(th))];
};
const ANSWER_T: V3 = [CORE[0], CORE[1] + 55, CORE[2]]; // the answer board's centre: its (540, 905) is the core

// ---------------------------------------------------------------------------------------------
// The camera path: keys per scene, joined by a monotone cubic (smooth, never overshoots).
type Key = { f: number; c: Cam };
const phoneCam = (yaw: number, pitch: number, d: number, dz = -120): Cam => ({ t: [0, YF, dz], d, yaw, pitch });
const jobCam = (th: number, off: number, d: number, pitch = -3): Cam => ({ t: boardCenter(th), d, yaw: -th + off, pitch });
const wide = (yaw: number, pitch: number, d: number): Cam => ({ t: [CORE[0], CORE[1] + 40, CORE[2]], d, yaw, pitch });

function buildKeys(): Key[] {
  const k: Key[] = [];
  const add = (f: number, c: Cam) => k.push({ f: Math.round(f), c });
  const [, hb] = bounds('hook');
  add(0, phoneCam(28, -40, 1580, -160));
  add(hb - 2, phoneCam(17, -47, 1440, -150));
  const [ra] = bounds('ring');
  const go = at('ring', 'עוברת');
  const arrive = at('ring', 'אליה') + 6;
  add(ra + 8, phoneCam(10, -56, 1700, 260));
  add(go - 4, phoneCam(6, -59, 1620, 240));
  add(arrive + 8, { t: [CORE[0], CORE[1] + 30, CORE[2]], d: 1750, yaw: 2, pitch: -7 });
  const [aa, ab] = bounds('answer');
  add(aa + 12, { t: ANSWER_T, d: 1400, yaw: 0, pitch: -2 });
  add(ab - 8, { t: ANSWER_T, d: 1330, yaw: -6, pitch: -3 });
  for (const id of ['callback', 'book', 'whatsapp', 'review', 'rules'] as Job[]) {
    const [a, b] = bounds(id);
    add(a + 10, jobCam(RING[id], 13, 1430));
    add(b - 8, jobCam(RING[id], 5, 1350));
  }
  const [la, lb] = bounds('log');
  add(la + 18, phoneCam(-352, -56, 1260, -90));
  add(lb - 6, phoneCam(-357, -58, 1190, -90));
  const [wa, wb] = bounds('weekly');
  add(wa + 14, phoneCam(-378, -50, 1130, -150));
  add(wb - 6, phoneCam(-391, -46, 1050, -150));
  const [fa, fb] = bounds('first');
  add(fa + 34, wide(-422, -36, 2600));
  add(fb - 6, wide(-436, -37, 2480));
  add(REC_TOTAL, wide(-442, -32, 1900));
  return k.sort((x, y) => x.f - y.f);
}
const KEYS = buildKeys();

/** Fritsch–Carlson monotone cubic through (xs, ys) at x. */
function monotone(xs: number[], ys: number[], x: number): number {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
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
const KX = KEYS.map((k) => k.f);
const cam = (f: number): Cam => {
  const v = (g: (c: Cam) => number) => monotone(KX, KEYS.map((k) => g(k.c)), f);
  return { t: [v((c) => c.t[0]), v((c) => c.t[1]), v((c) => c.t[2])], d: v((c) => c.d), yaw: v((c) => c.yaw), pitch: v((c) => c.pitch) };
};

// ---------------------------------------------------------------------------------------------
// Pieces.
const win = (f: number, a: number, b: number, fade = 10) => seg(f, a - fade, a) * (1 - seg(f, b, b + fade));

/** Night sky: hazes for each part (coral, green, amber), dust that drifts with the camera. */
const Backdrop: React.FC<{ f: number; c: Cam }> = ({ f, c }) => {
  const r = rng(31);
  const dust = React.useMemo(() => Array.from({ length: 140 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.2 + r() * 3.4, o: 0.1 + r() * 0.45, b: r() < 0.3, k: 0.4 + r() * 1.2 })), []);
  const [ra] = bounds('ring');
  const coral = 1 - seg(f, at('ring', 'עוברת'), at('ring', 'אליה') + 10);
  const [rua, rub] = bounds('rules');
  const amber = win(f, rua, rub, 14);
  return (
    <AbsoluteFill style={{ background: C.bg(), overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(1100px 1250px at 50% 880px, ${C.coral(0.2)}, transparent 70%)`, opacity: f < ra + 40 ? coral : 0 }} />
      <AbsoluteFill style={{ background: `radial-gradient(1100px 1250px at 50% 880px, ${C.green(0.16)}, transparent 70%)`, opacity: (1 - coral) * (1 - amber) }} />
      <AbsoluteFill style={{ background: `radial-gradient(1100px 1250px at 50% 880px, ${C.amber(0.15)}, transparent 70%)`, opacity: amber }} />
      {dust.map((d, i) => {
        const x = (((d.x - c.yaw * 9 * d.k + Math.sin(f / 50 + i) * 6) % 1080) + 1080) % 1080;
        const y = (((d.y + c.pitch * 14 * d.k - f * (0.35 + d.s * 0.12)) % 1920) + 1920) % 1920;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: d.s, height: d.s, borderRadius: '50%', background: C.fg(d.o), filter: d.b ? 'blur(2.5px)' : undefined }} />;
      })}
    </AbsoluteFill>
  );
};

/** A flat plane in the world, centred on `p`, turned by `rot`. */
const Plane: React.FC<{ p: V3; w: number; h: number; rot?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ p, w, h, rot = '', style, children }) => (
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
const Stage: React.FC<{ c: Cam; children: React.ReactNode }> = ({ c, children }) => (
  <AbsoluteFill style={{ perspective: `${P}px`, perspectiveOrigin: '540px 960px', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 540, top: 960, width: 0, height: 0, transformStyle: 'preserve-3d', transformOrigin: '0 0', transform: worldCss(c) }}>{children}</div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------
// The desk: floor grid, rings of light around the phone, the phone with whatever it shows now.
const PW = 600;
const PH = PW * (SCREEN.h / SCREEN.w);
const Desk: React.FC<{ f: number }> = ({ f }) => {
  const [ra] = bounds('ring');
  const [la] = bounds('log');
  const [wa] = bounds('weekly');
  const turn = seg(f, at('ring', 'שניות') + 2, at('ring', 'שניות') + 14);
  const green = Math.max(turn, seg(f, la - 10, la + 10));
  // the hook's buzz just before the call comes in
  const [, hb] = bounds('hook');
  const buzz = seg(f, hb - 26, hb - 20) * (1 - seg(f, hb - 4, hb + 4));
  const shake = Math.sin(f * 2.7) * 7 * buzz;
  // what the phone shows
  const at20 = at('ring', 'שניות');
  const secs = 14 + 6 * seg(f, ra, at20, (t) => t);
  const morphAt = [at('log', 'מי') - 4, at('log', 'צריך') - 8, at('log', 'ומתי') - 4, at('log', 'לחזור') + 2];
  const morph = morphAt.map((s) => seg(f, s, s + 14, out));
  const ping = blip(f, at('weekly', 'שבוע') - 2, 5, at('weekly', 'שבוע') + 26);
  const pingGrow = seg(f, at('weekly', 'שבוע') - 2, at('weekly', 'שבוע') + 30, out);
  const msg = seg(f, at('weekly', 'מחכה') - 4, at('weekly', 'מחכה') + 10, out);
  const count = seg(f, at('weekly', 'סיכום') - 2, at('weekly', 'שעבר') + 8, (t) => t);
  const show = [
    { on: 1 - seg(f, ra - 4, ra + 4), el: <CallLog pulse={f / 30} /> },
    { on: seg(f, ra - 4, ra + 4) * (1 - seg(f, la - 10, la)), el: <Incoming secs={secs} turn={turn} /> },
    { on: seg(f, la - 10, la) * (1 - seg(f, wa - 6, wa + 4)), el: <CallLog morph={morph} /> },
    { on: seg(f, wa - 6, wa + 4), el: <WeeklyScreen ping={ping} msg={msg} count={count} t={f} /> },
  ];
  const ring = (r: number, i: number) => {
    const pulse = 0.5 + 0.5 * Math.sin(f / 9 - i * 0.9);
    const tone = (a: number) => (green > 0.5 ? C.green(a) : C.coral(a));
    return (
      <div key={r} style={{ position: 'absolute', left: 3000 - r, top: 3000 - r, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `${4 - i}px solid ${tone(0.55 - i * 0.12)}`, boxShadow: `0 0 ${30 + 30 * pulse}px ${tone(0.35 - i * 0.08)}, inset 0 0 ${30 + 30 * pulse}px ${tone(0.25 - i * 0.06)}`, transform: `scale(${1 + 0.03 * pulse})` }} />
    );
  };
  const mask = 'radial-gradient(closest-side, black 0%, black 35%, transparent 100%)';
  return (
    <>
      <Plane p={[0, YF, 0]} w={6000} h={6000} rot="rotateX(90deg)">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${C.fg(0.09)} 3px, transparent 3px), linear-gradient(90deg, ${C.fg(0.09)} 3px, transparent 3px)`, backgroundSize: '150px 150px', WebkitMaskImage: mask, maskImage: mask }} />
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(closest-side, ${(green > 0.5 ? C.green : C.coral)(0.16)}, transparent 45%)` }} />
        {[560, 820, 1100].map(ring)}
        {ping > 0.01 && <div style={{ position: 'absolute', left: 3000 - 900, top: 3000 - 900, width: 1800, height: 1800, borderRadius: '50%', border: `5px solid ${C.green(0.7 * ping)}`, boxShadow: `0 0 40px ${C.green(0.5 * ping)}`, transform: `scale(${0.5 + 0.7 * pingGrow})` }} />}
      </Plane>
      <Plane p={[shake, YF - 12, 0]} w={PW * 1.08} h={PH + PW * 0.08} rot="rotateX(90deg)">
        <Phone cx={(PW * 1.08) / 2} top={0} w={PW} tilt="none" glow={green > 0.5 ? C.green : C.coral}>
          {show.map((s, i) => (s.on > 0.001 ? <div key={i} style={{ position: 'absolute', inset: 0, opacity: s.on }}>{s.el}</div> : null))}
        </Phone>
      </Plane>
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// The boards: a job's panels standing on the circle, facing out.
const BOARD: { id: 'answer' | Job; el: React.ReactNode }[] = [
  { id: 'answer', el: <Answer /> },
  { id: 'callback', el: <Callback /> },
  { id: 'book', el: <Book /> },
  { id: 'whatsapp', el: <Whatsapp /> },
  { id: 'review', el: <Review /> },
  { id: 'rules', el: <Rules /> },
];
const Boards: React.FC<{ f: number; c: Cam }> = ({ f, c }) => (
  <BoardMode.Provider value>
    <SolidGlass.Provider value>
      {BOARD.map(({ id, el }) => {
        const [a, b] = bounds(id);
        if (f < a - 70 || f > b + 70) return null;
        const p: V3 = id === 'answer' ? ANSWER_T : boardCenter(RING[id]);
        const rot = id === 'answer' ? '' : `rotateY(${RING[id]}deg)`;
        // A board the camera flies close to (or through) on the way somewhere else fades away first.
        const near = seg(dist(eye(c), p), 820, 1180, (t) => t);
        if (near <= 0.001) return null;
        return (
          <Plane key={id} p={p} w={1080} h={1920} rot={rot} style={{ opacity: near }}>
            {el}
          </Plane>
        );
      })}
    </SolidGlass.Provider>
  </BoardMode.Provider>
);

// ---------------------------------------------------------------------------------------------
// Drawn flat at projected positions: the core, the beams, the payoff's ring of jobs.
const coreR = (f: number) => {
  const [fa] = bounds('first');
  return 150 + 80 * seg(f, fa - 10, fa + 30);
};
const Flat: React.FC<{ f: number; c: Cam }> = ({ f, c }) => {
  const core = project(CORE, c);
  const R = coreR(f) * core.s;
  const items: React.ReactNode[] = [];
  const [ra] = bounds('ring');
  // the call goes up from the phone into her
  const go = at('ring', 'עוברת');
  const arrive = at('ring', 'אליה') + 6;
  const [aa] = bounds('answer');
  const ph = project(PHONE, c);
  const upDraw = seg(f, go - 16, go + 4) * (1 - seg(f, aa + 10, aa + 24));
  if (upDraw > 0 && ph.ok && core.ok) {
    const dot = seg(f, go, arrive, Easing.inOut(Easing.cubic));
    items.push(<Beam key="up" from={[ph.x, ph.y]} to={[core.x, core.y + R * 0.9]} width={5 * Math.max(0.6, Math.min(1.4, ph.s))} draw={upDraw} dot={upDraw > 0.99 && dot > 0 && dot < 1 ? dot : undefined} />);
  }
  // the core
  const boost = blip(f, arrive, 6, arrive + 30);
  const coreOn = seg(f, ra + 10, ra + 30);
  // a beam from the core to the node of the job on screen
  for (const id of ['callback', 'book', 'whatsapp', 'review', 'rules'] as Job[]) {
    const [a, b] = bounds(id);
    const on = seg(f, a + 4, a + 24) * (1 - seg(f, b - 6, b + 10));
    if (on <= 0) continue;
    const [nx, ny] = NODE_ON_BOARD[id];
    const n = project(onBoard(RING[id], nx, ny), c);
    if (!n.ok || !core.ok) continue;
    const tone = id === 'rules' ? C.amber : C.green;
    const dx = n.x - core.x;
    const dy = n.y - core.y;
    const len = Math.hypot(dx, dy) || 1;
    items.push(<Beam key={id} from={[core.x + (dx / len) * R * 1.05, core.y + (dy / len) * R * 1.05]} to={[n.x, n.y]} bend={-40} width={3.5} color={tone} draw={on} dot={0.15 + 0.7 * (((f - a) / 50) % 1)} />);
  }
  // the payoff: the ring of all six jobs around her, lit one by one
  const [fa] = bounds('first');
  const pay = seg(f, fa - 6, fa + 14);
  const nodes: { z: number; el: React.ReactNode }[] = [];
  if (pay > 0) {
    const pts = Array.from({ length: 73 }, (_, i) => project([CORE[0] + RN * Math.sin(rad(i * 5)), CORE[1], CORE[2] + RN * Math.cos(rad(i * 5))], c));
    items.push(
      <svg key="orbit" width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 0.8 * pay }}>
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={C.green(0.35)} strokeWidth={2.5} strokeDasharray="10 12" />
      </svg>,
    );
    const order: ('answer' | Job)[] = ['answer', 'callback', 'book', 'whatsapp', 'review', 'rules'];
    order.forEach((id, i) => {
      const meta = NODES[i];
      const th = RING[id];
      const wp: V3 = [CORE[0] + RN * Math.sin(rad(th)), CORE[1], CORE[2] + RN * Math.cos(rad(th))];
      const p = project(wp, c);
      if (!p.ok) return;
      const lit = seg(f, fa + 12 + i * STEP, fa + 24 + i * STEP, Easing.out(Easing.back(2)));
      const dx = p.x - core.x;
      const dy = p.y - core.y;
      const len = Math.hypot(dx, dy) || 1;
      const r = 92 * p.s;
      items.push(<Beam key={`pb${id}`} from={[core.x + (dx / len) * R, core.y + (dy / len) * R]} to={[p.x - (dx / len) * r, p.y - (dy / len) * r]} color={meta.tone} width={3.5} draw={seg(f, fa + 6 + i * STEP, fa + 16 + i * STEP)} dot={((f - fa - 12 - i * STEP) / 26) % 1 > 0 ? ((f - fa - 12 - i * STEP) / 26) % 1 : undefined} />);
      nodes.push({ z: p.depth, el: <Node key={`pn${id}`} cx={p.x} cy={p.y} r={r} color={meta.tone as Tone} icon={meta.icon as IconName} label={meta.label} labelSize={Math.round(25 * Math.min(1.25, Math.max(0.85, p.s / 0.55)))} above={p.y < core.y} on={lit} /> });
    });
  }
  const coreEl = core.ok ? <Core key="core" cx={core.x} cy={core.y} R={R} t={f} boost={boost} opacity={coreOn} /> : null;
  // far nodes behind her, near ones in front
  const behind = nodes.filter((n) => n.z > core.depth).sort((x, y) => y.z - x.z);
  const front = nodes.filter((n) => n.z <= core.depth).sort((x, y) => y.z - x.z);
  return (
    <AbsoluteFill style={{ opacity: pay > 0 ? 1 : 1 }}>
      {items}
      {behind.map((n) => n.el)}
      {coreEl}
      {front.map((n) => n.el)}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// What stays flat on the screen: titles and captions.
const TITLES: Record<Job, { idx: string; title: string; sub: string; color: Tone }> = {
  callback: { idx: '02', title: 'רושמת למי לחזור', sub: 'שם, מה צריך, מתי נוח', color: C.green },
  book: { idx: '03', title: 'קובעת תור', sub: 'רק בשעה פנויה, רק אחרי ״כן״', color: C.green },
  whatsapp: { idx: '04', title: 'עונה בוואטסאפ', sub: 'מאותם פרטים כמו בטלפון', color: C.green },
  review: { idx: '05', title: 'מבקשת ביקורת', sub: 'שעתיים אחרי התור', color: C.green },
  rules: { idx: '06', title: 'יודעת מה לא להגיד', sub: 'כללים קבועים בכל שיחה', color: C.amber },
};
const JobText: React.FC<{ id: Job | 'answer' }> = ({ id }) => {
  const f = useCurrentFrame();
  const [a] = bounds(id);
  const t = id === 'answer' ? { idx: '01', title: 'עונה בעברית', sub: 'רק ממה שכתבתם לה', color: C.green } : TITLES[id];
  return (
    <>
      <HudTitle idx={t.idx} title={t.title} sub={t.sub} color={t.color} p={seg(f, a + 2, a + 24, out)} />
      <Spoken id={id} top={1430} />
    </>
  );
};
const HookText: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div dir="rtl" style={{ position: 'absolute', left: 50, right: 50, top: 230, textAlign: 'center', fontFamily: KARANTINA, fontWeight: 700, fontSize: 196, lineHeight: 0.92, color: C.fg(), textShadow: `0 0 ${50 + 20 * Math.sin(f / 9)}px ${C.coral(0.38)}, 0 4px 24px rgba(0,0,0,.6)` }}>
        <div>מי התקשר?</div>
        <div>מה הוא רצה?</div>
      </div>
      <div style={{ position: 'absolute', left: 56, top: 560, textAlign: 'center' }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 104, lineHeight: 1, color: C.coral(), textShadow: `0 0 ${26 + 14 * Math.sin(f / 7)}px ${C.coral(0.65)}` }}>04</div>
        <div dir="rtl" style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 28, color: C.fg2(), marginTop: 8 }}>לא נענו</div>
      </div>
    </>
  );
};
const PayoffText: React.FC = () => {
  const f = useCurrentFrame();
  const [a] = bounds('first');
  const head = ['אף', 'שיחה', 'לא', 'נשארת'];
  const head2 = ['רק', 'מספר.'];
  const word = (w: string, i: number) => {
    const p = seg(f, a + 4 + i * 4, a + 18 + i * 4, out);
    return <span key={w + i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 34}px)`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>{w}&nbsp;</span>;
  };
  return (
    <>
      <div dir="rtl" style={{ position: 'absolute', left: 50, right: 50, top: 226, textAlign: 'center', fontFamily: KARANTINA, fontWeight: 700, fontSize: 150, lineHeight: 0.92, color: C.fg(), textShadow: `0 0 60px ${C.green(0.35)}, 0 4px 24px rgba(0,0,0,.6)` }}>
        <div>{head.map(word)}</div>
        <div>{head2.map((w, i) => word(w, i + head.length))}</div>
      </div>
      <Spoken id="first" top={1460} />
    </>
  );
};

/** The overlays use the absolute frame (no scene offset): Scene's Sequence would shift useCurrentFrame. */
const Abs: React.FC<{ id: Id; children: React.ReactNode }> = ({ id, children }) => {
  const f = useCurrentFrame();
  const [a, b] = bounds(id);
  const first = a === 0;
  const last = b === REC_TOTAL;
  const X = 7;
  const fin = first ? 1 : seg(f, a - X, a + X);
  const fout = last ? 1 : 1 - seg(f, b - X, b + X);
  if (f < a - X || f > b + X) return null;
  return <AbsoluteFill style={{ opacity: Math.min(fin, fout) }}>{children}</AbsoluteFill>;
};

/** "נפתח בקרוב · הרשמה מוקדמת" in the top corner from 4 s (after the hook) until the end card, which says it
 *  itself (owner's choice 2026-11-25). Centred above the titles (top 226-236): Instagram's own buttons ("Reels",
 *  the camera) cover the top corners down to about y 250 in the Reels viewer. */
const SOON_FROM = 120;
const SoonTag: React.FC = () => {
  const f = useCurrentFrame();
  const [close] = bounds('close');
  const p = seg(f, SOON_FROM, SOON_FROM + 18, out);
  const o = p * (1 - seg(f, close - 6, close + 8));
  if (o <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 146, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - p) * -14}px)` }}>
      <SoonPill t={f} size={34} early />
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
export const ReceptionistFilm3D: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => {
  const f = useCurrentFrame();
  const c = cam(f);
  const ids: Id[] = ['hook', 'ring', 'answer', 'callback', 'book', 'whatsapp', 'review', 'rules', 'log', 'weekly', 'first', 'close'];
  return (
    <AbsoluteFill style={{ background: C.bg() }}>
      <Backdrop f={f} c={c} />
      <Stage c={c}>
        <Desk f={f} />
      </Stage>
      <Flat f={f} c={c} />
      <Stage c={c}>
        <Boards f={f} c={c} />
      </Stage>
      <AbsoluteFill style={{ background: 'radial-gradient(140% 95% at 50% 46%, transparent 56%, rgba(0,0,0,.6))', pointerEvents: 'none' }} />
      <Abs id="hook"><HookText /></Abs>
      <Abs id="ring"><Spoken id="ring" /></Abs>
      <Abs id="answer"><JobText id="answer" /></Abs>
      {(['callback', 'book', 'whatsapp', 'review', 'rules'] as Job[]).map((id) => (
        <Abs key={id} id={id}><JobText id={id} /></Abs>
      ))}
      <Abs id="log"><Spoken id="log" top={1448} /></Abs>
      <Abs id="weekly"><Spoken id="weekly" top={1448} /></Abs>
      <Abs id="first"><PayoffText /></Abs>
      <Scene id="close"><Close /></Scene>
      <SoonTag />
      {ids.map((id) => (
        <Sequence key={id} from={START[id]} durationInFrames={dur(id) + 2}>
          <Audio src={staticFile(`receptionist/vo-${id}.mp3`)} />
        </Sequence>
      ))}
      {bgm ? <SmoothBed /> : null}
    </AbsoluteFill>
  );
};
export { lineEnd };
