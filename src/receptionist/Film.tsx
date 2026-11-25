// The AI receptionist reel (9:16, ~56 s): a remake of the format of IG reel DffhT_iRb6z for the
// receptionist, drawn in code. Beats, hook C and every line approved by the owner (plan:
// wat-framework/.tmp/remake-receptionist/plan.md); the storyboard (RecSheet) approved before animating.
// v2 (owner approved 2026-11-24): three more jobs: WhatsApp answers, the review request, the weekly summary.
// Timing follows the Gemini narration (voice/receptionist → voice.json): every move lands on its word.
import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import VO from './voice.json';
import {
  ASSIST, Beam, C, CallLog, Core, Glass, Ground, HudTitle, Icon, Incoming, KARANTINA, MONO, Node, Num, Phone, Sample, SoonPill, StatusBar,
} from './parts';
import type { IconName, Tone } from './parts';

type Word = { word: string; startSec: number; endSec: number };
type Line = { key: string; durationSec: number; words: Word[]; text: string };
export const LINES = VO as unknown as Record<string, Line>;

const FPS = 30;
export const ORDER = ['hook', 'ring', 'answer', 'callback', 'book', 'whatsapp', 'review', 'rules', 'log', 'weekly', 'first', 'close'] as const;
export type Id = (typeof ORDER)[number];
/** Frames of silence before each line. The 40 before "first" lets the payoff headline land on music. */
export const GAP: Record<Id, number> = { hook: 6, ring: 6, answer: 10, callback: 8, book: 8, whatsapp: 8, review: 8, rules: 8, log: 10, weekly: 10, first: 40, close: 8 };
export const dur = (id: Id) => Math.round(LINES[id].durationSec * FPS);
export const START = {} as Record<Id, number>;
{
  let t = 0;
  for (const id of ORDER) {
    t += GAP[id];
    START[id] = t;
    t += dur(id);
  }
}
export const HOLD = 54;
export const REC_TOTAL = START.close + dur('close') + HOLD;
/** A scene takes over LEAD frames before its line starts, and dissolves over X frames each side. */
export const LEAD = 8;
/** The payoff scene starts early so its headline and the four lit jobs land on music, before the line. */
export const LEADS: Partial<Record<Id, number>> = { first: 26 };
export const lead = (id: Id) => LEADS[id] ?? LEAD;
export const X = 7;
export const bounds = (id: Id): [number, number] => {
  const i = ORDER.indexOf(id);
  const a = i === 0 ? 0 : START[id] - lead(id);
  const b = i === ORDER.length - 1 ? REC_TOTAL : START[ORDER[i + 1]] - lead(ORDER[i + 1]);
  return [a, b];
};
/** Absolute frame at which the n-th word containing `has` starts in line `id`. */
export const W = (id: Id, has: string, n = 0) => {
  const hits = LINES[id].words.filter((w) => w.word.includes(has));
  const w = hits[n] ?? hits[hits.length - 1];
  return START[id] + Math.round(w.startSec * FPS);
};
export const lineEnd = (id: Id) => START[id] + dur(id);

export const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const soft = Easing.bezier(0.33, 0, 0.15, 1);
export const out = Easing.out(Easing.cubic);
export const seg = (f: number, a: number, b: number, e: (t: number) => number = soft) => interpolate(f, [a, b], [0, 1], { ...cl, easing: e });
/** In-and-out pulse: rises over a..a+up, falls to 0 by b. */
export const blip = (f: number, a: number, up: number, b: number) => seg(f, a, a + up, out) * (1 - seg(f, a + up, b));

// ---------------------------------------------------------------------------------------------
/** True inside a board of the 3D film (Film3D.tsx): a job's panels only, placed in space; the background,
 *  title, caption and small core are drawn by the 3D film itself. */
export const BoardMode = React.createContext(false);
/** Ground, or nothing but the content on a board. */
const G: React.FC<React.ComponentProps<typeof Ground>> = (props) => (React.useContext(BoardMode) ? <>{props.children}</> : <Ground {...props} />);

// ---------------------------------------------------------------------------------------------
// Scene shell: absolute frame inside, a dissolve with a slight push at each end, a slow camera push.
export const SceneCtx = React.createContext(0);
export const useF = () => useCurrentFrame() + React.useContext(SceneCtx);
export const Scene: React.FC<{ id: Id; children: React.ReactNode }> = ({ id, children }) => {
  const [a, b] = bounds(id);
  const from = Math.max(0, a - X);
  const len = b + X - from;
  return (
    <Sequence from={from} durationInFrames={len}>
      <SceneCtx.Provider value={from}>
        <Shell first={a === 0} last={b === REC_TOTAL} a={a} b={b}>
          {children}
        </Shell>
      </SceneCtx.Provider>
    </Sequence>
  );
};
const Shell: React.FC<{ first: boolean; last: boolean; a: number; b: number; children: React.ReactNode }> = ({ first, last, a, b, children }) => {
  const f = useF();
  const fin = first ? 1 : seg(f, a - X, a + X);
  const fout = last ? 1 : 1 - seg(f, b - X, b + X);
  const push = 1 + 0.028 * seg(f, a, b, (t) => t) + (1 - fin) * 0.04 - (1 - fout) * 0.03;
  return (
    <AbsoluteFill style={{ opacity: Math.min(fin, fout) }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: '50% 45%' }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// The spoken line, word by word as it is said. Same band as the storyboard, above Instagram's UI.
export const Spoken: React.FC<{ id: Id; top?: number; size?: number; scrim?: boolean }> = ({ id, top = 1448, size = 52, scrim = true }) => {
  const board = React.useContext(BoardMode);
  const f = useF();
  const [a] = bounds(id);
  if (board) return null;
  return (
    <>
      {scrim && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: top - 90, height: 330, opacity: seg(f, a, a + 10), background: 'linear-gradient(to bottom, transparent, rgba(4,10,8,.62) 38%, rgba(4,10,8,.62) 62%, transparent)' }} />
      )}
      <div dir="rtl" style={{ position: 'absolute', left: 86, right: 86, top, textAlign: 'center', fontFamily: ASSIST, fontWeight: 700, fontSize: size, lineHeight: 1.24, color: C.fg(), textShadow: '0 2px 16px rgba(0,0,0,.9)', textWrap: 'balance' } as React.CSSProperties}>
        {LINES[id].words.map((w, i) => {
          const at = START[id] + Math.round(w.startSec * FPS);
          const p = seg(f, at - 3, at + 6, out);
          const text = w.word === 'כן' ? '״כן״' : w.word;
          return (
            <React.Fragment key={i}>
              <span style={{ display: 'inline-block', opacity: 0.12 + 0.88 * p, transform: `translateY(${(1 - p) * 10}px)` }}>{text}</span>{' '}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

/** Slides in and un-blurs as p goes 0 → 1. */
export const In: React.FC<{ p: number; dx?: number; dy?: number; scale?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ p, dx = 0, dy = 30, scale = 1, style, children }) => (
  <div style={{ position: 'absolute', inset: 0, opacity: p, transform: `translate(${(1 - p) * dx}px, ${(1 - p) * dy}px) scale(${scale + (1 - scale) * p})`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined, ...style }}>
    {children}
  </div>
);

// ---------------------------------------------------------------------------------------------
// 1 · hook: the call log, four coral missed calls, the question. Whole on frame 0.
const Hook: React.FC = () => {
  const f = useF();
  const [, b] = bounds('hook');
  const p = seg(f, 0, b, (t) => t);
  const buzz = seg(f, b - 26, b - 20) * (1 - seg(f, b - 4, b + 4));
  const shake = Math.sin(f * 2.7) * 4 * buzz;
  return (
    <Ground tint={C.coral} focusY={1050} seed={11} t={f}>
      <div dir="rtl" style={{ position: 'absolute', left: 50, right: 50, top: 250, textAlign: 'center', fontFamily: KARANTINA, fontWeight: 700, fontSize: 196, lineHeight: 0.92, color: C.fg(), textShadow: `0 0 ${50 + 20 * Math.sin(f / 9)}px ${C.coral(0.38)}, 0 4px 24px rgba(0,0,0,.6)` }}>
        <div>מי התקשר?</div>
        <div>מה הוא רצה?</div>
      </div>
      <div style={{ position: 'absolute', left: 56, top: 930, textAlign: 'center' }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 104, lineHeight: 1, color: C.coral(), textShadow: `0 0 ${26 + 14 * Math.sin(f / 7)}px ${C.coral(0.65)}` }}>04</div>
        <div dir="rtl" style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 28, color: C.fg2(), marginTop: 8 }}>לא נענו</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${shake}px, ${-12 * p}px)` }}>
        <Phone cx={612} top={660} w={560} glow={C.coral} tilt={`perspective(2600px) rotateY(${-11 + 4 * p}deg) rotateX(4deg)`}>
          <CallLog pulse={f / 30} />
        </Phone>
      </div>
    </Ground>
  );
};

// 2 · a new call: the ring timer reaches 20, the ring turns green, the call goes up into her wave.
const Ring: React.FC = () => {
  const f = useF();
  const [a] = bounds('ring');
  const at20 = W('ring', 'שניות');
  const secs = 14 + 6 * seg(f, a, at20, (t) => t);
  const turn = seg(f, at20 + 2, at20 + 14);
  const ringing = 1 - seg(f, at20, at20 + 6);
  const shake = Math.sin(f * 2.6) * 3.5 * ringing * (Math.sin(f / 4) > -0.2 ? 1 : 0);
  const go = W('ring', 'עוברת');
  const arrive = W('ring', 'אליה') + 6;
  const draw = seg(f, go - 16, go + 4);
  const dot = seg(f, go, arrive, Easing.inOut(Easing.cubic));
  const boost = blip(f, arrive, 6, arrive + 30);
  return (
    <Ground tint={C.green} focusY={700} seed={12} t={f}>
      <Core cx={540} cy={360} R={104} t={f} boost={boost} opacity={seg(f, a, a + 26)} />
      <Beam from={[540, 668]} to={[540, 448]} width={5} draw={draw} dot={draw > 0.99 && dot > 0 && dot < 1 ? dot : undefined} />
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${shake}px)` }}>
        <Phone cx={540} top={650} w={330} tilt="perspective(2600px) rotateX(6deg)" glow={turn > 0.5 ? C.green : C.coral}>
          <Incoming secs={secs} turn={turn} />
        </Phone>
      </div>
      <Spoken id="ring" />
    </Ground>
  );
};

// 3 · node 01: she answers in Hebrew, from what you wrote. A card for each thing she names.
export const Answer: React.FC = () => {
  const f = useF();
  const board = React.useContext(BoardMode);
  const [a] = bounds('answer');
  const grow = seg(f, a - 4, a + 20, out);
  const cards: { at: number; from: [number, number]; to: [number, number]; bend: number; x: number; y: number; w: number; body: React.ReactNode }[] = [
    {
      at: W('answer', 'שעות'), from: [640, 830], to: [780, 742], bend: -20, x: 620, y: 600, w: 400,
      body: (
        <>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 26, color: C.green() }}>שעות פעילות</div>
          <div style={{ fontSize: 40, color: C.fg(), marginTop: 4 }}><Num style={{ fontWeight: 700 }}>08:00–17:00</Num></div>
          <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 23, color: C.fg2() }}>ראשון עד חמישי</div>
        </>
      ),
    },
    {
      at: W('answer', 'שירותים'), from: [430, 920], to: [372, 960], bend: 0, x: 54, y: 890, w: 330,
      body: (
        <>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 26, color: C.green() }}>שירותים</div>
          {['טיפול שנתי', 'בדיקה לפני טסט', 'דיאגנוסטיקה'].map((s) => (
            <div key={s} style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 25, color: C.fg(), marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: C.green(), boxShadow: `0 0 10px ${C.green()}` }} />
              {s}
            </div>
          ))}
        </>
      ),
    },
    {
      at: W('answer', 'שאלות'), from: [600, 1020], to: [720, 1118], bend: 18, x: 500, y: 1100, w: 526,
      body: (
        <>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 26, color: C.green() }}>שאלות נפוצות</div>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 29, color: C.fg(), marginTop: 6 }}>עובדים בתיאום מראש?</div>
          <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 24, color: C.fg2(), marginTop: 2 }}>כן. משאירים פרטים, ונחזור לקבוע.</div>
        </>
      ),
    },
  ];
  return (
    <G tint={C.green} focusY={900} seed={13} t={f}>
      {!board && <HudTitle idx="01" title="עונה בעברית" sub="רק ממה שכתבתם לה" color={C.green} p={seg(f, a + 2, a + 24, out)} />}
      {!board && (
        <div style={{ position: 'absolute', inset: 0, opacity: grow, transformOrigin: '540px 905px', transform: `scale(${0.8 + 0.2 * grow})` }}>
          <Core cx={540} cy={905} R={148} t={f} boost={cards.reduce((s, c) => s + 0.6 * blip(f, c.at - 4, 4, c.at + 20), 0)} />
        </div>
      )}
      {cards.map((c, i) => {
        const p = seg(f, c.at - 2, c.at + 12, out);
        const cx = 540;
        const cy = 905;
        return (
          <React.Fragment key={i}>
            <Beam from={c.from} to={c.to} bend={c.bend} width={3} draw={seg(f, c.at - 8, c.at + 2)} />
            <div style={{ position: 'absolute', inset: 0, opacity: p, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined, transformOrigin: `${c.x + c.w / 2}px ${c.y + 80}px`, transform: `translate(${(cx - (c.x + c.w / 2)) * (1 - p) * 0.35}px, ${(cy - (c.y + 80)) * (1 - p) * 0.35}px) scale(${0.82 + 0.18 * p})` }}>
              <Glass x={c.x} y={c.y} w={c.w} pad={24}>{c.body}</Glass>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ opacity: seg(f, cards[0].at, cards[0].at + 10) }}>
        <Sample style={{ position: 'absolute', left: 60, top: 1300 }} />
      </div>
      <Spoken id="answer" top={1430} />
    </G>
  );
};

/** Jobs 02-06 share this: the small core at the left, a beam to the job's node, the title top right. */
export const NodeHead: React.FC<{ id: Id; idx: string; title: string; sub: string; color: Tone; to: [number, number]; node: [number, number]; icon: IconName; children?: React.ReactNode }> = ({
  id, idx, title, sub, color, to, node, icon, children,
}) => {
  const f = useF();
  const [a] = bounds(id);
  const board = React.useContext(BoardMode);
  if (board) {
    return (
      <>
        {children}
        <Node cx={node[0]} cy={node[1]} r={icon === 'shield' ? 46 : 50} color={color} icon={icon} on={seg(f, a + 18, a + 32, Easing.out(Easing.back(2)))} />
      </>
    );
  }
  return (
    <>
      <Core cx={150} cy={548} R={52} calm t={f} opacity={seg(f, a - 4, a + 12)} />
      <HudTitle idx={idx} title={title} sub={sub} color={color} p={seg(f, a + 2, a + 24, out)} />
      <Beam from={[196, 560]} to={to} bend={-40} width={3} color={color} draw={seg(f, a + 4, a + 24)} dot={0.15 + 0.7 * ((f - a) / 60 % 1)} />
      {children}
      <Node cx={node[0]} cy={node[1]} r={icon === 'shield' ? 46 : 50} color={color} icon={icon} on={seg(f, a + 18, a + 32, Easing.out(Easing.back(2)))} />
    </>
  );
};

// 4 · node 02: who to call back; the number lights up digit by digit as she reads it back.
export const DIGITS = '0501234567'.split('');
export const Callback: React.FC = () => {
  const f = useF();
  const [a] = bounds('callback');
  const panel = seg(f, a + 10, a + 30, out);
  const rows: [string, string, number][] = [
    ['שם', 'דנה שפירא', a + 14],
    ['מה צריך', 'נורת מנוע דולקת, רוצה לבוא לבדיקה', W('callback', 'צריך') - 2],
    ['מתי נוח', 'יום חמישי', W('callback', 'נוח') - 2],
  ];
  const d0 = W('callback', 'המספר');
  const d1 = lineEnd('callback') - 10;
  const lit = (i: number) => d0 + (i * (d1 - d0)) / (DIGITS.length - 1);
  return (
    <G tint={C.green} focusY={900} seed={14} t={f}>
      <NodeHead id="callback" idx="02" title="רושמת למי לחזור" sub="שם, מה צריך, מתי נוח" color={C.green} to={[902, 640]} node={[952, 648]} icon="note">
      <In p={panel} dy={40}>
        <Glass x={90} y={640} w={900} pad={36} style={{ paddingRight: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 70 }}>
            <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 30, color: C.green() }}>בקשה לחזור</span>
            <Sample />
          </div>
          {rows.map(([k, v, at]) => {
            const p = seg(f, at, at + 12, out);
            return (
              <div key={k} style={{ display: 'flex', gap: 24, alignItems: 'baseline', marginTop: 20, paddingTop: 16, borderTop: `1.5px solid ${C.fg(0.1)}` }}>
                <span style={{ width: 150, flex: 'none', fontFamily: ASSIST, fontWeight: 700, fontSize: 27, color: C.fg3() }}>{k}</span>
                <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 36, color: C.fg(), opacity: p, transform: `translateX(${(1 - p) * -24}px)`, filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined, display: 'inline-block' }}>{v}</span>
              </div>
            );
          })}
        </Glass>
      </In>
      </NodeHead>
      <div style={{ opacity: seg(f, W('callback', 'ומקריאה') - 4, W('callback', 'ומקריאה') + 10) }}>
        <div dir="rtl" style={{ position: 'absolute', left: 90, right: 90, top: 1132, fontFamily: ASSIST, fontWeight: 700, fontSize: 26, color: C.fg3(), textAlign: 'center' }}>מקריאה בחזרה</div>
        <div dir="ltr" style={{ position: 'absolute', left: 0, right: 0, top: 1180, display: 'flex', justifyContent: 'center', gap: 10 }}>
          {DIGITS.map((d, i) => {
            const on = seg(f, lit(i) - 2, lit(i) + 4, out);
            const hot = blip(f, lit(i) - 2, 4, lit(i) + 14);
            return (
              <React.Fragment key={i}>
                {(i === 3 || i === 6) && <span style={{ width: 8 }} />}
                <span
                  style={{
                    position: 'relative', width: 74, height: 102, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: MONO, fontWeight: 700, fontSize: 56, overflow: 'hidden',
                    color: on > 0.5 ? 'oklch(16% 0.04 150)' : C.fg(0.35),
                    background: `linear-gradient(${C.green(on)}, ${C.green(on)}), ${C.fg(0.06)}`,
                    border: `1.5px solid ${on > 0.5 ? C.green() : C.fg(0.16)}`,
                    boxShadow: `0 0 ${18 + 30 * hot}px ${C.green(0.45 * on + 0.45 * hot)}`,
                    transform: `scale(${1 + 0.1 * hot})`,
                  }}
                >
                  {d}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <Spoken id="callback" top={1430} />
    </G>
  );
};

// 5 · node 03: she books, only in a free slot, only after a clear "yes".
export const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳'];
export const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00'];
export const BUSY: [number, number, number][] = [
  [0, 0, 1.5], [0, 2.5, 1], [1, 1, 1.5], [2, 0.5, 2], [2, 3, 1.5], [3, 0, 1], [3, 1.5, 1], [3, 3, 2], [4, 0, 2.5], [4, 3.5, 1],
];
export const Book: React.FC = () => {
  const f = useF();
  const [a] = bounds('book');
  const panel = seg(f, a + 8, a + 28, out);
  const free = seg(f, W('book', 'פנויה') - 4, W('book', 'פנויה') + 8, out);
  const yes = W('book', 'כן');
  const fill = seg(f, yes, yes + 8, out);
  const pop = blip(f, yes + 2, 5, yes + 18);
  const gx = 110;
  const gw = 690;
  const gy = 120;
  const rowH = 118;
  const colW = gw / 5;
  const box = (d: number, h: number, len: number): React.CSSProperties => ({ position: 'absolute', left: gx + gw - (d + 1) * colW + 6, top: gy + h * rowH + 4, width: colW - 12, height: len * rowH - 8, borderRadius: 12, boxSizing: 'border-box', padding: 10 });
  return (
    <G tint={C.green} focusY={950} seed={15} t={f}>
      <NodeHead id="book" idx="03" title="קובעת תור" sub="רק בשעה פנויה, רק אחרי ״כן״" color={C.green} to={[918, 618]} node={[968, 624]} icon="cal">
      <In p={panel} dy={40}>
        <Glass x={60} y={620} w={960} h={760} pad={0}>
          <div style={{ position: 'absolute', right: 96, top: 26, fontFamily: ASSIST, fontWeight: 800, fontSize: 30, color: C.fg() }}>היומן של השבוע</div>
          <Sample style={{ position: 'absolute', left: 30, top: 28 }} />
          {DAYS.map((d, i) => (
            <div key={d} style={{ position: 'absolute', left: gx + gw - (i + 1) * colW, width: colW, top: 78, textAlign: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: 28, color: i === 1 ? C.green() : C.fg2() }}>
              {d}
              {i === 1 && <span style={{ fontSize: 20, fontWeight: 700 }}> · מחר</span>}
            </div>
          ))}
          {HOURS.map((h, i) => (
            <React.Fragment key={h}>
              <div style={{ position: 'absolute', left: gx + gw + 18, top: gy + i * rowH - 12, fontSize: 22, color: C.fg3() }}><Num style={{ fontWeight: 500 }}>{h}</Num></div>
              <div style={{ position: 'absolute', left: gx, width: gw, top: gy + i * rowH, height: 1.5, background: C.fg(0.09) }} />
            </React.Fragment>
          ))}
          {BUSY.map(([d, h, len], i) => (
            <div key={i} style={{ ...box(d, h, len), opacity: seg(f, a + 14 + i * 2, a + 24 + i * 2), background: `repeating-linear-gradient(135deg, ${C.fg(0.07)} 0 10px, ${C.fg(0.035)} 10px 20px)`, border: `1px solid ${C.fg(0.1)}` }} />
          ))}
          {/* 10:30 tomorrow: free */}
          <div dir="rtl" style={{ ...box(1, 2.5, 1), opacity: free, border: `2.5px dashed ${C.green(0.9)}`, background: C.green(0.08), boxShadow: `0 0 ${24 + 16 * Math.sin(f / 5)}px ${C.green(0.25)}` }}>
            <div style={{ fontSize: 22, color: C.green() }}><Num style={{ fontWeight: 700 }}>10:30</Num></div>
            <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 19, color: C.fg2() }}>פנוי</div>
          </div>
          {/* 08:00 tomorrow: free, then booked on "כן" */}
          <div dir="rtl" style={{ ...box(1, 0, 1), opacity: free, transform: `scale(${1 + 0.12 * pop})`, border: `2.5px dashed ${C.green(0.9 * (1 - fill))}`, background: fill > 0 ? C.green(0.08 + 0.92 * fill) : C.green(0.08), boxShadow: `0 0 ${24 + 30 * fill + 20 * pop}px ${C.green(0.25 + 0.45 * fill)}`, color: fill > 0.5 ? 'oklch(16% 0.04 150)' : C.green() }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {fill > 0.3 && <Icon name="check" size={24} color="oklch(16% 0.04 150)" width={3} style={{ opacity: fill }} />}
              <Num style={{ fontWeight: 700, fontSize: 22 }}>08:00</Num>
            </div>
            <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 19, marginTop: 2, color: fill > 0.5 ? 'oklch(16% 0.04 150)' : C.fg2() }}>{fill > 0.5 ? 'המענה קבע' : 'פנוי'}</div>
          </div>
          <div dir="rtl" style={{ position: 'absolute', left: gx + gw - 2 * colW - 150, top: gy + 20, width: 170, padding: '8px 12px', borderRadius: 10, background: C.bg(0.92), border: `1.5px solid ${C.green(0.7)}`, fontFamily: ASSIST, fontWeight: 700, fontSize: 19, color: C.fg(), lineHeight: 1.25, opacity: seg(f, yes + 6, yes + 16), transform: `translateX(${(1 - seg(f, yes + 6, yes + 16)) * -16}px)` }}>
            רוני כהן · בדיקה לפני טסט
          </div>
        </Glass>
      </In>
      </NodeHead>
      <Spoken id="book" top={1430} />
    </G>
  );
};

// 6 · node 04: WhatsApp. A customer writes in the evening; she answers from the same details as on the phone.
export const SAME = ['שעות פעילות', 'שירותים', 'שאלות נפוצות'];
export const Whatsapp: React.FC = () => {
  const f = useF();
  const [a] = bounds('whatsapp');
  const panel = seg(f, a + 8, a + 28, out);
  const ask = W('whatsapp', 'שכותב');
  const reply = W('whatsapp', 'עונה') - 2;
  const same = W('whatsapp', 'מאותם');
  const q = seg(f, ask, ask + 12, out);
  const typing = seg(f, ask + 16, ask + 22) * (1 - seg(f, reply - 2, reply + 2));
  const r = seg(f, reply, reply + 12, out);
  const ticks = seg(f, reply + 14, reply + 20);
  return (
    <G tint={C.green} focusY={950} seed={20} t={f}>
      <NodeHead id="whatsapp" idx="04" title="עונה בוואטסאפ" sub="מאותם פרטים כמו בטלפון" color={C.green} to={[918, 618]} node={[968, 624]} icon="chat">
      <In p={panel} dy={40}>
        <Glass x={70} y={640} w={940} h={720} pad={0}>
          <div style={{ position: 'absolute', right: 36, top: 30, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', background: C.green(0.2), border: `2px solid ${C.green(0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: 32, color: C.green() }}>מ</div>
            <div>
              <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 34, color: C.fg() }}>מוסך אייל</div>
              <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 22, color: C.fg3() }}>וואטסאפ של העסק</div>
            </div>
          </div>
          <Sample style={{ position: 'absolute', left: 30, top: 34 }} />
          <div style={{ position: 'absolute', left: 30, right: 30, top: 126, height: 1.5, background: C.fg(0.1) }} />
          {/* the customer, at 21:47 */}
          <div style={{ position: 'absolute', right: 36, top: 170, maxWidth: 600, padding: '18px 26px 14px', borderRadius: '26px 8px 26px 26px', background: C.fg(0.11), border: `1.5px solid ${C.fg(0.14)}`, opacity: q, transform: `translateY(${(1 - q) * 26}px) scale(${0.94 + 0.06 * q})`, transformOrigin: '100% 0%' }}>
            <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 40, color: C.fg() }}>אתם פתוחים מחר?</div>
            <div style={{ textAlign: 'left', fontSize: 19, color: C.fg3(), marginTop: 4 }}><Num>21:47</Num></div>
          </div>
          {/* typing */}
          <div style={{ position: 'absolute', left: 36, top: 330, padding: '20px 26px', borderRadius: '8px 26px 26px 26px', background: C.green(0.12), border: `1.5px solid ${C.green(0.35)}`, display: 'flex', gap: 10, opacity: typing }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: C.green(), opacity: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f / 3 - i * 1.1)) }} />
            ))}
          </div>
          {/* her answer */}
          <div style={{ position: 'absolute', left: 36, top: 330, width: 640, boxSizing: 'border-box', padding: '16px 26px 14px', borderRadius: '8px 26px 26px 26px', background: C.green(0.17), border: `1.5px solid ${C.green(0.6)}`, boxShadow: `0 0 ${40 * r}px ${C.green(0.25)}`, opacity: r, transform: `translateY(${(1 - r) * 26}px) scale(${0.94 + 0.06 * r})`, transformOrigin: '0% 0%' }}>
            <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 22, color: C.green() }}>המענה</div>
            <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 38, lineHeight: 1.25, color: C.fg(), marginTop: 4 }}>כן, מחר פתוח מ-08:00 עד 17:00. לקבוע לכם תור?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, direction: 'ltr', fontSize: 19, color: C.fg3(), marginTop: 6 }}>
              <Num>21:47</Num>
              <span style={{ position: 'relative', width: 30, height: 20, opacity: 0.4 + 0.6 * ticks }}>
                <Icon name="check" size={20} color={ticks > 0.5 ? C.green() : C.fg3()} width={2.6} style={{ position: 'absolute', left: 0 }} />
                <Icon name="check" size={20} color={ticks > 0.5 ? C.green() : C.fg3()} width={2.6} style={{ position: 'absolute', left: 9 }} />
              </span>
            </div>
          </div>
          {/* the same details as on the phone */}
          <div style={{ position: 'absolute', right: 36, left: 36, top: 590, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 25, color: C.fg3(), opacity: seg(f, same - 6, same + 4) }}>מאותם פרטים:</span>
            {SAME.map((t, i) => {
              const on = seg(f, same + i * 4, same + 8 + i * 4, out);
              const hot = blip(f, same + i * 4, 4, same + 22 + i * 4);
              return (
                <span key={t} style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 26, padding: '8px 18px', borderRadius: 99, color: on > 0.5 ? 'oklch(16% 0.04 150)' : C.fg2(), background: on > 0.5 ? C.green(0.9) : C.fg(0.06), border: `1.5px solid ${C.green(0.3 + 0.6 * on)}`, boxShadow: `0 0 ${10 + 26 * hot}px ${C.green(0.2 + 0.4 * hot)}`, opacity: 0.25 + 0.75 * seg(f, same - 6, same + 2), transform: `scale(${1 + 0.08 * hot})` }}>
                  {t}
                </span>
              );
            })}
          </div>
        </Glass>
      </In>
      </NodeHead>
      <Spoken id="whatsapp" top={1430} />
    </G>
  );
};

// 7 · node 05: two hours after the visit, a message with the link to a Google review (the real template's words).
export const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;
export const Review: React.FC = () => {
  const f = useF();
  const [a] = bounds('review');
  const card = seg(f, a + 8, a + 26, out);
  const done = seg(f, a + 20, a + 30, out);
  const t0 = W('review', 'שעתיים') - 2;
  const t1 = W('review', 'התור') + 10;
  const clock = seg(f, t0, t1, Easing.inOut(Easing.cubic));
  const send = W('review', 'שולחת') - 2;
  const msg = seg(f, send, send + 16, out);
  const s0 = W('review', 'לביקורת');
  return (
    <G tint={C.green} focusY={950} seed={21} t={f}>
      <NodeHead id="review" idx="05" title="מבקשת ביקורת" sub="שעתיים אחרי התור" color={C.green} to={[918, 618]} node={[968, 624]} icon="star">
      <In p={card} dy={40}>
        <Glass x={90} y={640} w={900} h={168} pad={0}>
          <div style={{ position: 'absolute', right: 36, top: 30 }}>
            <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 40, color: C.fg() }}>דנה שפירא</div>
            <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 28, color: C.fg2(), marginTop: 4 }}>טיפול שנתי · <Num style={{ fontWeight: 500 }}>11:00</Num></div>
          </div>
          <Sample style={{ position: 'absolute', left: 30, top: 24 }} />
          <span style={{ position: 'absolute', left: 30, bottom: 26, display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: ASSIST, fontWeight: 800, fontSize: 25, padding: '6px 16px', borderRadius: 99, color: 'oklch(16% 0.04 150)', background: C.green(0.9), opacity: done, transform: `scale(${0.8 + 0.2 * done})` }}>
            <Icon name="check" size={22} color="oklch(16% 0.04 150)" width={3} />
            התור הסתיים
          </span>
        </Glass>
      </In>
      {/* two hours later */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 838, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: seg(f, t0 - 6, t0 + 4) }}>
        <span style={{ fontSize: 64, color: C.fg(), textShadow: `0 0 30px ${C.green(0.35)}` }}><Num style={{ fontWeight: 700 }}>{hhmm(11 * 60 + 30 + 120 * clock)}</Num></span>
        <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 30, padding: '6px 18px', borderRadius: 99, border: `2px solid ${C.green(0.8)}`, color: C.green(), opacity: seg(f, t0 + 4, t0 + 12) }}>
          <span dir="rtl">+2 שעות</span>
        </span>
      </div>
      {/* the message she sends */}
      <In p={msg} dx={-60} dy={-30}>
        <div dir="rtl" style={{ position: 'absolute', left: 90, width: 860, top: 950, boxSizing: 'border-box', padding: '20px 30px 18px', borderRadius: '8px 28px 28px 28px', background: C.green(0.15), border: `1.5px solid ${C.green(0.6)}`, boxShadow: `0 30px 80px rgba(0,0,0,.5), 0 0 50px ${C.green(0.18)}` }}>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 22, color: C.green() }}>וואטסאפ · נשלח לדנה</div>
          <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 33, lineHeight: 1.3, color: C.fg(), marginTop: 8 }}>שלום דנה, תודה שביקרתם אצלנו.</div>
          <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 31, lineHeight: 1.3, color: C.fg(), marginTop: 4 }}>נשמח לשמוע איך היה. אפשר לכתוב ביקורת קצרה בגוגל כאן:</div>
          <div dir="ltr" style={{ fontFamily: MONO, fontWeight: 500, fontSize: 27, color: C.green(), textDecoration: 'underline', textUnderlineOffset: 6, marginTop: 8, textAlign: 'right' }}>g.page/r/…/review</div>
        </div>
      </In>
      {/* five stars fill as she says "review on Google" */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1262, display: 'flex', justifyContent: 'center', gap: 22, direction: 'ltr' }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const on = seg(f, s0 + i * 4, s0 + 8 + i * 4, out);
          const hot = blip(f, s0 + i * 4, 4, s0 + 20 + i * 4);
          return (
            <span key={i} style={{ position: 'relative', width: 70, height: 70, opacity: seg(f, s0 - 10, s0), transform: `scale(${1 + 0.16 * hot})`, filter: `drop-shadow(0 0 ${8 + 20 * hot}px ${C.amber(0.3 + 0.5 * on)})` }}>
              <svg viewBox="0 0 24 24" width={70} height={70} style={{ position: 'absolute', inset: 0 }}>
                <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.9l-5.4 2.9 1.1-6-4.5-4.2 6.1-.8z" fill={C.amber(on)} stroke={C.amber(0.9)} strokeWidth={1.4} strokeLinejoin="round" />
              </svg>
            </span>
          );
        })}
      </div>
      </NodeHead>
      <Spoken id="review" top={1430} />
    </G>
  );
};

// 8 · node 06 (amber): what she won't say.
export const RULES: { icon: 'shekel' | 'chip' | 'siren'; text: string; sub: string; at: (a: number) => number }[] = [
  { icon: 'shekel', text: 'לא מבטיחה מחיר בשמכם', sub: 'את המחיר אתם נותנים', at: (a) => a + 10 },
  { icon: 'chip', text: 'אומרת שהיא ממוחשבת', sub: 'כשמישהו שואל', at: () => W('rules', 'שואלים') - 2 },
  { icon: 'siren', text: 'במקרה חירום: 101 או 100', sub: 'מפנה מיד', at: () => W('rules', 'ממוחשבת') + 6 },
];
export const Rules: React.FC = () => {
  const f = useF();
  const [a] = bounds('rules');
  return (
    <G tint={C.amber} focusY={950} seed={16} t={f}>
      <NodeHead id="rules" idx="06" title="יודעת מה לא להגיד" sub="כללים קבועים בכל שיחה" color={C.amber} to={[934, 646]} node={[980, 652]} icon="shield">
      {RULES.map((r, i) => {
        const at = r.at(a);
        const p = seg(f, at, at + 14, out);
        return (
          <In key={r.text} p={p} dx={70} dy={0}>
            <Glass x={84} y={650 + i * 232} w={912} h={196} color={C.amber} pad={0}>
              <div style={{ position: 'absolute', right: 36, top: 38, width: 118, height: 118, borderRadius: '50%', background: C.amber(0.14), border: `2px solid ${C.amber(0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${30 + 30 * blip(f, at + 6, 6, at + 30)}px ${C.amber(0.3 + 0.3 * blip(f, at + 6, 6, at + 30))}` }}>
                {r.icon === 'shekel' ? (
                  <span style={{ position: 'relative', fontFamily: ASSIST, fontWeight: 800, fontSize: 66, lineHeight: 1, color: C.amber() }}>
                    ₪
                    <span style={{ position: 'absolute', left: -12, right: -12, top: '50%', height: 5, borderRadius: 3, background: C.amber(), transformOrigin: '100% 50%', transform: `rotate(-38deg) scaleX(${seg(f, at + 8, at + 18, out)})`, boxShadow: `0 0 0 3px ${C.bg(0.9)}` }} />
                  </span>
                ) : (
                  <Icon name={r.icon} size={62} color={C.amber()} width={1.9} />
                )}
              </div>
              <div style={{ position: 'absolute', right: 186, left: 36, top: 44 }}>
                <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 44, color: C.fg(), lineHeight: 1.1 }}>{r.text}</div>
                <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 28, color: C.fg2(), marginTop: 8 }}>{r.sub}</div>
              </div>
            </Glass>
          </In>
        );
      })}
      </NodeHead>
      <Spoken id="rules" top={1430} />
    </G>
  );
};

// 9 · back to the same call log: each missed call turns into who, why and when.
const Log: React.FC = () => {
  const f = useF();
  const [a, b] = bounds('log');
  const p = seg(f, a, b, (t) => t);
  const starts = [W('log', 'מי') - 4, W('log', 'צריך') - 8, W('log', 'ומתי') - 4, W('log', 'לחזור') + 2];
  const morph = starts.map((s) => seg(f, s, s + 14, out));
  return (
    <Ground tint={C.green} focusY={850} seed={17} t={f}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-10 * p}px)` }}>
        <Phone cx={540} top={300} w={510} glow={C.green} tilt={`perspective(2600px) rotateY(${-8 + 3 * p}deg) rotateX(3deg)`}>
          <CallLog morph={morph} />
        </Phone>
      </div>
      <Spoken id="log" top={1448} />
    </Ground>
  );
};

// 10 · the weekly summary: at the start of the week the owner's phone gets one WhatsApp message with the week.
export const WEEK: [string, number][] = [
  ['שיחות שהיא ענתה', 31],
  ['שיחות בוואטסאפ', 9],
  ['ביקשו שתחזרו אליהם', 5],
  ['תורים שהיא קבעה', 7],
];
export const WeeklyScreen: React.FC<{ ping: number; msg: number; count: number; t: number }> = ({ ping, msg, count, t }) => (
  <div dir="rtl" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(15% 0.022 172), oklch(10% 0.016 172))' }}>
    <StatusBar time="08:00" />
    <div style={{ position: 'absolute', right: 20, left: 20, top: 60, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.green(0.2), border: `1.5px solid ${C.green(0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: 21, color: C.green() }}>מ</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 20, color: C.fg() }}>מוסך אייל</div>
        <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 13, color: C.fg3() }}>וואטסאפ של העסק</div>
      </div>
      <Sample size={13} />
    </div>
    <div style={{ position: 'absolute', left: 20, right: 20, top: 116, height: 1, background: C.fg(0.1) }} />
    <div style={{ position: 'absolute', left: 0, right: 0, top: 130, textAlign: 'center' }}>
      <span style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 14, color: C.fg2(), padding: '3px 12px', borderRadius: 99, background: C.fg(0.08) }}>יום ראשון</span>
    </div>
    <div
      style={{
        position: 'absolute', right: 16, left: 30, top: 168, padding: '16px 18px 12px', borderRadius: '6px 20px 20px 20px', boxSizing: 'border-box',
        background: C.fg(0.09), border: `1.5px solid ${C.green(0.25 + 0.4 * ping)}`, boxShadow: `0 0 ${30 * ping}px ${C.green(0.35 * ping)}`,
        opacity: msg, transform: `translateY(${(1 - msg) * 30}px) scale(${0.94 + 0.06 * msg})`, transformOrigin: '100% 0%',
      }}
    >
      <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 19, lineHeight: 1.25, color: C.fg() }}>הסיכום השבועי של המזכירה הקולית</div>
      {WEEK.map(([label, n], i) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: i ? 8 : 14, paddingTop: 8, borderTop: `1px solid ${C.fg(0.08)}` }}>
          <span style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 18, color: C.fg2() }}>{label}</span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.green(), textShadow: `0 0 ${12 + 6 * Math.sin(t / 8 + i)}px ${C.green(0.45)}` }}>{Math.round(n * Math.min(1, Math.max(0, count * 1.25 - i * 0.08)))}</span>
        </div>
      ))}
      <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 17, color: C.fg(), marginTop: 12 }}>שבוע טוב!</div>
      <div style={{ textAlign: 'left', fontSize: 12, color: C.fg3() }}><Num>08:00</Num></div>
    </div>
  </div>
);
const Weekly: React.FC = () => {
  const f = useF();
  const [a, b] = bounds('weekly');
  const p = seg(f, a, b, (t) => t);
  const ping = blip(f, W('weekly', 'שבוע') - 2, 5, W('weekly', 'שבוע') + 26);
  // The message is there as she says it is waiting for you ("מחכה לכם"), right after the ping.
  const msg = seg(f, W('weekly', 'מחכה') - 4, W('weekly', 'מחכה') + 10, out);
  const count = seg(f, W('weekly', 'סיכום') - 2, W('weekly', 'שעבר') + 8, (t) => t);
  return (
    <Ground tint={C.green} focusY={850} seed={22} t={f}>
      <div style={{ position: 'absolute', left: 540 - 420, top: 680 - 420, width: 840, height: 840, borderRadius: '50%', border: `3px solid ${C.green(0.5 * ping)}`, transform: `scale(${0.7 + 0.5 * seg(f, W('weekly', 'שבוע') - 2, W('weekly', 'שבוע') + 26, out)})`, opacity: ping }} />
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${-10 * p}px)` }}>
        <Phone cx={540} top={290} w={510} glow={C.green} tilt={`perspective(2600px) rotateY(${8 - 3 * p}deg) rotateX(3deg)`}>
          <WeeklyScreen ping={ping} msg={msg} count={count} t={f} />
        </Phone>
      </div>
      <Spoken id="weekly" top={1448} />
    </Ground>
  );
};

// 11 · payoff: the headline on music, the six jobs light up around her, then "the phone rings with you first".
export const NODES: { a: number; label: string; icon: IconName; tone: Tone }[] = [
  { a: -60, label: 'עונה בעברית', icon: 'chat', tone: C.green },
  { a: 0, label: 'רושמת למי לחזור', icon: 'note', tone: C.green },
  { a: 60, label: 'קובעת תור', icon: 'cal', tone: C.green },
  { a: 120, label: 'עונה בוואטסאפ', icon: 'chat', tone: C.green },
  { a: 180, label: 'מבקשת ביקורת', icon: 'star', tone: C.green },
  { a: -120, label: 'יודעת מה לא להגיד', icon: 'shield', tone: C.amber },
];
/** Frames between two jobs lighting up in the payoff. */
export const STEP = 5;
const First: React.FC = () => {
  const f = useF();
  const [a] = bounds('first');
  const cx = 540;
  const cy = 960;
  const rad = 300;
  const head = ['אף', 'שיחה', 'לא', 'נשארת'];
  const head2 = ['רק', 'מספר.'];
  const word = (w: string, i: number) => {
    const p = seg(f, a + 4 + i * 4, a + 18 + i * 4, out);
    return <span key={w + i} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 34}px)`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>{w}&nbsp;</span>;
  };
  return (
    <Ground tint={C.green} focusY={990} seed={18} t={f}>
      <div dir="rtl" style={{ position: 'absolute', left: 50, right: 50, top: 236, textAlign: 'center', fontFamily: KARANTINA, fontWeight: 700, fontSize: 150, lineHeight: 0.92, color: C.fg(), textShadow: `0 0 60px ${C.green(0.35)}, 0 4px 24px rgba(0,0,0,.6)` }}>
        <div>{head.map(word)}</div>
        <div>{head2.map((w, i) => word(w, i + head.length))}</div>
      </div>
      {NODES.map((n, i) => {
        const r = (n.a * Math.PI) / 180;
        const at = a + 12 + i * STEP;
        return <Beam key={n.label} from={[cx + 120 * Math.cos(r), cy + 120 * Math.sin(r)]} to={[cx + (rad - 52) * Math.cos(r), cy + (rad - 52) * Math.sin(r)]} color={n.tone} width={3.5} draw={seg(f, at - 6, at + 4)} dot={((f - at) / 26) % 1 > 0 ? ((f - at) / 26) % 1 : undefined} />;
      })}
      <Core cx={cx} cy={cy} R={124} t={f} boost={NODES.reduce((s, _, i) => s + 0.3 * blip(f, a + 12 + i * STEP, 3, a + 24 + i * STEP), 0)} />
      {NODES.map((n, i) => {
        const r = (n.a * Math.PI) / 180;
        return <Node key={n.label} cx={cx + rad * Math.cos(r)} cy={cy + rad * Math.sin(r)} r={46} color={n.tone} icon={n.icon} label={n.label} labelSize={27} above={n.a < 0} on={seg(f, a + 12 + i * STEP, a + 24 + i * STEP, Easing.out(Easing.back(2)))} />;
      })}
      <Spoken id="first" top={1460} />
    </Ground>
  );
};

// 12 · end card: the name for the first time, one action, her line.
export const Close: React.FC = () => {
  const f = useF();
  const [a] = bounds('close');
  const core = seg(f, a - 4, a + 18, out);
  const t1 = seg(f, a + 4, a + 22, out);
  const t2 = seg(f, a + 14, a + 30, out);
  const t3 = seg(f, a + 22, a + 36, Easing.out(Easing.back(1.6)));
  const tSoon = seg(f, a + 10, a + 26, out);
  return (
    <Ground tint={C.green} focusY={700} seed={19} t={f}>
      <div style={{ position: 'absolute', inset: 0, opacity: core, transformOrigin: '540px 600px', transform: `scale(${0.85 + 0.15 * core})` }}>
        <Core cx={540} cy={600} R={112} calm t={f} />
      </div>
      {/* not open yet: early sign-up (the owner's wording, 2026-11-25) */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 762, display: 'flex', justifyContent: 'center', opacity: tSoon, transform: `translateY(${(1 - tSoon) * 18}px)` }}>
        <SoonPill t={f} size={38} />
      </div>
      <div dir="rtl" style={{ position: 'absolute', left: 40, right: 40, top: 860, textAlign: 'center' }}>
        <div style={{ fontFamily: KARANTINA, fontWeight: 700, fontSize: 236, lineHeight: 0.9, color: C.fg(), textShadow: `0 0 60px ${C.green(0.35)}`, opacity: t1, transform: `translateY(${(1 - t1) * 40}px)`, filter: t1 < 1 ? `blur(${(1 - t1) * 12}px)` : undefined }}>מזכירה קולית</div>
        <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 38, color: C.fg2(), marginTop: 18, opacity: t2, transform: `translateY(${(1 - t2) * 20}px)` }}>מענה טלפוני ב-AI, בעברית, לעסקים קטנים</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginTop: 64, padding: '24px 46px', borderRadius: 99, background: C.green(), boxShadow: `0 0 ${60 + 20 * Math.sin(f / 8)}px ${C.green(0.5)}, inset 0 2px 0 rgba(255,255,255,.45)`, fontFamily: ASSIST, fontWeight: 800, fontSize: 44, color: 'oklch(16% 0.04 150)', opacity: Math.min(1, t3 * 1.5), transform: `scale(${0.8 + 0.2 * t3})` }}>
          <Icon name="chat" size={44} color="oklch(16% 0.04 150)" width={2.4} />
          להרשמה מוקדמת בוואטסאפ
        </div>
      </div>
      <Spoken id="close" top={1330} size={40} scrim={false} />
    </Ground>
  );
};

// ---------------------------------------------------------------------------------------------
/** The music sits low under the voice and comes up a little between lines and at the end. */
export const LINE_SPANS = ORDER.map((id) => [START[id], lineEnd(id)] as const);
export const bedVolume = (f: number) => {
  const near = LINE_SPANS.some(([s, e]) => f >= s - 6 && f <= e + 4);
  const base = near ? 0.14 : 0.28; // bed is -15 LUFS, voice -16: about -17 dB under the voice, -11 dB between lines
  const end = 1 - seg(f, REC_TOTAL - 40, REC_TOTAL, (t) => t);
  return base * end;
};
export const SmoothBed: React.FC = () => {
  // smooth the ducking: average the target over ±6 frames
  return <Audio src={staticFile('receptionist/bed.mp3')} volume={(f) => {
    let s = 0;
    for (let k = -6; k <= 6; k++) s += bedVolume(Math.max(0, f + k));
    return s / 13;
  }} />;
};

export const ReceptionistFilm: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => (
  <AbsoluteFill style={{ background: C.bg() }}>
    <Scene id="hook"><Hook /></Scene>
    <Scene id="ring"><Ring /></Scene>
    <Scene id="answer"><Answer /></Scene>
    <Scene id="callback"><Callback /></Scene>
    <Scene id="book"><Book /></Scene>
    <Scene id="whatsapp"><Whatsapp /></Scene>
    <Scene id="review"><Review /></Scene>
    <Scene id="rules"><Rules /></Scene>
    <Scene id="log"><Log /></Scene>
    <Scene id="weekly"><Weekly /></Scene>
    <Scene id="first"><First /></Scene>
    <Scene id="close"><Close /></Scene>
    {ORDER.map((id) => (
      <Sequence key={id} from={START[id]} durationInFrames={dur(id) + 2}>
        <Audio src={staticFile(`receptionist/vo-${id}.mp3`)} />
      </Sequence>
    ))}
    {bgm ? <SmoothBed /> : null}
  </AbsoluteFill>
);
