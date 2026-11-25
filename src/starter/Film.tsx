// The starter film: a vertical reel for any subject, made entirely from film.json.
//
// One CSS 3D space: a glowing core floats above a floor of light; one glass board per "board" scene stands on a
// circle around it, facing out. An orbit camera starts wide on the hook, flies from board to board as each line
// is spoken, and pulls back for the payoff, where every board becomes a lit node around the core. Headlines and
// captions stay flat on the screen; each board's own heading is on the board, which faces the camera straight.
//
// To make your own film: edit film.json (the words, boards, colours), preview with `npm run studio`, then record
// the voice and build the music (see README.md, "Make your own film").
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import type { CalculateMetadataFunction } from 'remotion';
import { Plane, Stage, cameraAt, dist, eye, project, rad } from './camera';
import type { Cam } from './camera';
import { CORE, FLOOR, YF, buildKeys, layoutOf } from './stage';
import type { Layout } from './stage';
import { BOARD_H, BOARD_W, Backdrop, Beam, Board, Caption, Core, EndCard, Floor, Headline, NodeDot, TagPill } from './parts';
import { ThemeCtx, makeTheme } from './theme';
import { FPS, buildTimeline, out, seg } from './timeline';
import type { FilmSettings, Scene, Timeline, VoiceFile } from './timeline';

export type StarterProps = {
  /** The folder under public/ that holds this film's voice lines (vo-<id>.mp3). */
  folder: string;
  film: FilmSettings;
  voice: VoiceFile;
};

/** The film's length follows its settings and voice. */
export const calcStarter: CalculateMetadataFunction<StarterProps> = ({ props }) => {
  const tl = buildTimeline(props.film, props.voice);
  if (tl.late !== 0) {
    const when = tl.late > 0 ? 'after' : 'before';
    console.warn(`The payoff starts ${(Math.abs(tl.late) / FPS).toFixed(2)} s ${when} the music's hit (music.hitSec). Rebuild the bed (tools/build_bed.py) so its strong bar lands on the payoff, then set music.hitSec.`);
  }
  return { durationInFrames: tl.total };
};

// ---------------------------------------------------------------------------------------------
const STEP = 5; // frames between the payoff's nodes lighting up

/** The core, and a beam from it to the board on screen. Drawn flat, behind the boards. */
const Behind: React.FC<{ f: number; c: Cam; tl: Timeline; L: Layout; payA: number }> = ({ f, c, tl, L, payA }) => {
  const T = React.useContext(ThemeCtx);
  if (f >= payA) return null;
  const core = project(CORE, c);
  const R = 190 * core.s;
  const items: React.ReactNode[] = [];
  tl.boards.forEach((s, i) => {
    const [a, b] = tl.bounds[s.id];
    const on = seg(f, a + 6, a + 26) * (1 - seg(f, b - 6, b + 10));
    if (on <= 0) return;
    const ctr = L.center(i);
    const n = project([ctr[0], ctr[1] - BOARD_H / 2, ctr[2]], c);
    if (!n.ok || !core.ok) return;
    const dx = n.x - core.x;
    const dy = n.y - core.y;
    const len = Math.hypot(dx, dy) || 1;
    items.push(<Beam key={s.id} from={[core.x + (dx / len) * R * 1.05, core.y + (dy / len) * R * 1.05]} to={[n.x, n.y]} bend={-40} width={3.5} color={T.accent} draw={on} dot={0.15 + 0.7 * (((f - a) / 50) % 1)} />);
  });
  return (
    <AbsoluteFill>
      {items}
      {core.ok ? <Core cx={core.x} cy={core.y} R={R} t={f} /> : null}
    </AbsoluteFill>
  );
};

/** The payoff: a ring around the core with one lit node per board, lit one by one. Drawn over the boards. */
const Front: React.FC<{ f: number; c: Cam; tl: Timeline; L: Layout; payA: number; hasPay: boolean }> = ({ f, c, tl, L, payA, hasPay }) => {
  const T = React.useContext(ThemeCtx);
  if (f < payA) return null;
  const core = project(CORE, c);
  const R = 190 * core.s * (1 + 0.3 * seg(f, payA, payA + 30));
  const pay = hasPay ? seg(f, payA - 6, payA + 14) : 0;
  const items: React.ReactNode[] = [];
  const nodes: { z: number; el: React.ReactNode }[] = [];
  if (pay > 0) {
    const pts = Array.from({ length: 73 }, (_, i) => project([CORE[0] + L.RN * Math.sin(rad(i * 5)), CORE[1], CORE[2] + L.RN * Math.cos(rad(i * 5))], c));
    items.push(
      <svg key="orbit" width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 0.8 * pay }}>
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" style={{ stroke: T.accent(0.35) }} strokeWidth={2.5} strokeDasharray="10 12" />
      </svg>,
    );
    tl.boards.forEach((s, i) => {
      const th = L.theta(i);
      const p = project([CORE[0] + L.RN * Math.sin(rad(th)), CORE[1], CORE[2] + L.RN * Math.cos(rad(th))], c);
      if (!p.ok || !core.ok) return;
      const lit = seg(f, payA + 12 + i * STEP, payA + 24 + i * STEP, out);
      const dx = p.x - core.x;
      const dy = p.y - core.y;
      const len = Math.hypot(dx, dy) || 1;
      const r = 70 * p.s;
      const travel = ((f - payA - 12 - i * STEP) / 26) % 1;
      items.push(<Beam key={`b${s.id}`} from={[core.x + (dx / len) * R, core.y + (dy / len) * R]} to={[p.x - (dx / len) * r, p.y - (dy / len) * r]} color={T.accent} width={3.5} draw={seg(f, payA + 6 + i * STEP, payA + 16 + i * STEP)} dot={travel > 0 ? travel : undefined} />);
      nodes.push({ z: p.depth, el: <NodeDot key={`n${s.id}`} cx={p.x} cy={p.y} r={r} n={String(i + 1)} label={s.label} labelSize={Math.round(30 * Math.min(1.25, Math.max(0.9, p.s / 0.45)))} above={p.y < core.y} on={lit} /> });
    });
  }
  const behind = nodes.filter((n) => n.z > core.depth).sort((x, y) => y.z - x.z);
  const front = nodes.filter((n) => n.z <= core.depth).sort((x, y) => y.z - x.z);
  return (
    <AbsoluteFill>
      {items}
      {behind.map((n) => n.el)}
      {core.ok ? <Core cx={core.x} cy={core.y} R={R} t={f} /> : null}
      {front.map((n) => n.el)}
    </AbsoluteFill>
  );
};

/** One scene's flat layer, dissolving in and out at its bounds. */
const Abs: React.FC<{ tl: Timeline; id: string; f: number; children: React.ReactNode }> = ({ tl, id, f, children }) => {
  const [a, b] = tl.bounds[id];
  const X = 7;
  const fin = a === 0 ? 1 : seg(f, a - X, a + X);
  const fout = b === tl.total ? 1 : 1 - seg(f, b - X, b + X);
  if (f < a - X || f > b + X) return null;
  return <AbsoluteFill style={{ opacity: Math.min(fin, fout) }}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------------------------------------
export const StarterFilm: React.FC<StarterProps> = ({ folder, film, voice }) => {
  const f = useCurrentFrame();
  const tl = React.useMemo(() => buildTimeline(film, voice), [film, voice]);
  const L = React.useMemo(() => layoutOf(tl), [tl]);
  const keys = React.useMemo(() => buildKeys(tl, L), [tl, L]);
  const theme = React.useMemo(() => makeTheme(film.palette, film.direction === 'rtl' ? 'rtl' : 'ltr'), [film]);
  const c = cameraAt(keys, f);
  const payoff = tl.scenes.find((s) => s.kind === 'payoff');
  const end = tl.scenes.find((s) => s.kind === 'end');
  const payA = payoff ? tl.bounds[payoff.id][0] : end ? tl.bounds[end.id][0] : tl.total + 1;

  // music: quieter while a recorded line is spoken, fades out at the end
  const spans = tl.scenes.filter((s) => tl.lines[s.id].recorded).map((s) => [tl.start[s.id], tl.start[s.id] + tl.dur[s.id]] as const);
  const quiet = film.music?.quiet ?? 0.14;
  const loud = film.music?.loud ?? 0.3;
  const bedVolume = (g: number) => {
    const near = spans.some(([s, e]) => g >= s - 6 && g <= e + 4);
    return (near ? quiet : loud) * (1 - seg(g, tl.total - 40, tl.total, (t) => t));
  };
  const tagFrom = film.tag ? Math.round(film.tag.fromSec * FPS) : 0;
  const tagTo = end ? tl.bounds[end.id][0] : tl.total;
  const tagP = film.tag ? seg(f, tagFrom, tagFrom + 18, out) * (1 - seg(f, tagTo - 6, tagTo + 8)) : 0;

  return (
    <ThemeCtx.Provider value={theme}>
      <AbsoluteFill style={{ background: theme.ground() }}>
        <Backdrop f={f} c={c} />
        <Stage c={c}>
          <Plane p={[0, YF, 0]} w={FLOOR} h={FLOOR} rot="rotateX(90deg)">
            <Floor f={f} size={FLOOR} rings={[0.55 * L.R, 0.8 * L.R, 1.08 * L.R]} />
          </Plane>
        </Stage>
        <Behind f={f} c={c} tl={tl} L={L} payA={payA} />
        <Stage c={c}>
          {tl.boards.map((s, i) => {
            const [a, b] = tl.bounds[s.id];
            const p = L.center(i);
            // a board the camera flies close to (or through) fades away first
            const near = seg(dist(eye(c), p), 820, 1180, (t) => t);
            const active = seg(f, a - 10, a + 6) * (1 - seg(f, b - 4, b + 12));
            // the payoff's lit nodes stand for the boards, so the boards are gone as the camera pulls back
            const o0 = near * (0.38 + 0.62 * active) * (1 - seg(f, payA - 24, payA - 6));
            if (o0 <= 0.002) return null;
            // A board with a corner behind (or right next to) the camera would be drawn as a huge blurry slab, and a
            // board entirely outside the frame needn't be drawn at all: skip both.
            const th = rad(L.turn(i));
            const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => project([p[0] + (sx * BOARD_W) / 2 * Math.cos(th), p[1] + (sy * BOARD_H) / 2, p[2] - (sx * BOARD_W) / 2 * Math.sin(th)], c));
            if (corners.some((q) => q.depth < 400)) return null;
            const xs = corners.map((q) => q.x);
            const ys = corners.map((q) => q.y);
            if (Math.max(...xs) < -40 || Math.min(...xs) > 1120 || Math.max(...ys) < -40 || Math.min(...ys) > 1960) return null;
            // a board swinging past close to the lens grows wider than the frame: fade it rather than show a slab
            const o = o0 * (1 - seg(Math.max(...xs) - Math.min(...xs), 1250, 1700, (t) => t));
            if (o <= 0.002) return null;
            return (
              <Plane key={s.id} p={p} w={BOARD_W} h={BOARD_H} rot={`rotateY(${L.turn(i)}deg)`} style={{ opacity: o }}>
                <Board scene={s} idx={i} count={tl.boards.length} tl={tl} f={f} sampleLabel={film.sampleLabel ?? 'Example'} />
              </Plane>
            );
          })}
        </Stage>
        <Front f={f} c={c} tl={tl} L={L} payA={payA} hasPay={!!payoff} />
        <AbsoluteFill style={{ background: 'radial-gradient(140% 95% at 50% 46%, transparent 56%, rgba(0,0,0,.6))', pointerEvents: 'none' }} />

        {tl.scenes.map((s: Scene) => {
          const line = tl.lines[s.id];
          const start = tl.start[s.id];
          const [a] = tl.bounds[s.id];
          return (
            <Abs key={s.id} tl={tl} id={s.id} f={f}>
              {s.kind === 'hook' ? <Headline lines={s.title} f={f} /> : null}
              {s.kind === 'payoff' ? <Headline lines={s.title} f={f} from={a + 4} build size={170} /> : null}
              {s.kind === 'end' ? <EndCard scene={s} f={f} a={a} /> : null}
              <Caption line={line} start={start} f={f} top={s.kind === 'end' ? 1480 : 1450} />
            </Abs>
          );
        })}
        {tagP > 0.001 && film.tag ? (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 146, display: 'flex', justifyContent: 'center', opacity: tagP, transform: `translateY(${(1 - tagP) * -14}px)` }}>
            <TagPill text={film.tag.text} f={f} />
          </div>
        ) : null}

        {tl.scenes.filter((s) => tl.lines[s.id].recorded).map((s) => (
          <Sequence key={s.id} from={tl.start[s.id]} durationInFrames={tl.dur[s.id] + 2}>
            <Audio src={staticFile(`${folder}/vo-${s.id}.mp3`)} />
          </Sequence>
        ))}
        {film.music?.file ? (
          <Audio src={staticFile(film.music.file)} volume={(g) => {
            let sum = 0;
            for (let k = -6; k <= 6; k++) sum += bedVolume(Math.max(0, g + k));
            return sum / 13;
          }} />
        ) : null}
      </AbsoluteFill>
    </ThemeCtx.Provider>
  );
};
