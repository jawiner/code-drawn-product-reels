// The LeadFlow reel v3 (9:16, ~54 s), sister of the AI receptionist reel (src/receptionist/Film3D.tsx), drawn in code.
// Script v3 approved by the owner 2026-11-25 ("approved, record and animate it"): wat-framework/.tmp/leadflow-film/script-v3.md.
// v1 (rejected: "you didnt give time to the most important things") is kept at git history / the scratchpad.
// One business, סטודיו שיער דנה, from a pin on the map to a customer. The board (six columns) is the shot the film keeps
// coming back to: Dana's card moves column to column, and everything people need to read opens out of her card as a
// close-up (Sales Lab, the opening email, meeting prep, the work report) or on the phone (Today → Telegram → the call's
// outcome → the WhatsApp message, one continuous scene). Full camera moves only for the opening rewind and the final win.
// Facts from the app (leadStages, i18n, i18nMeetingPrep, reminderCopy, workReport, sales-roleplay); samples are marked
// לדוגמה; "LeadFlow" appears only on the end card (playbook #3). The win lands on the bed's bar-8 hit (44.53 s).
import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import VO from './voice.json';
import { ASSIST, Beam, KARANTINA, MONO, Phone, rng } from '../receptionist/parts';
import type { Tone } from '../receptionist/parts';

// ---------------------------------------------------------------------------------------------
// Timeline: every line from the Gemini narration (voice/leadflow → voice.json), every move on its word.
type Word = { word: string; startSec: number; endSec: number };
type Line = { key: string; durationSec: number; words: Word[]; text: string };
const LINES = VO as unknown as Record<string, Line>;
const FPS = 30;
export const ORDER = ['hook', 'lab', 'email', 'today', 'message', 'prep', 'report', 'won', 'close'] as const;
export type Id = (typeof ORDER)[number];
/** Where each line starts (frames). The gaps are reading time; "won" puts "סוגרת" on the bed's bar-8 hit (frame 1336). */
const START: Record<Id, number> = { hook: 4, lab: 144, email: 352, today: 494, message: 700, prep: 880, report: 1116, won: 1318, close: 1450 };
const dur = (id: Id) => Math.round(LINES[id].durationSec * FPS);
const lineEnd = (id: Id) => START[id] + dur(id);
ORDER.forEach((id, i) => {
  const next = ORDER[i + 1];
  if (next && lineEnd(id) + 6 > START[next]) throw new Error(`LeadFlow: the line "${id}" runs into "${next}" (re-time START)`);
});
export const LF_TOTAL = lineEnd('close') + 45;
/** Absolute frame at which the n-th word containing `has` starts in line `id`. */
const at = (id: Id, has: string, n = 0) => {
  const hits = LINES[id].words.filter((w) => w.word.includes(has));
  const w = hits[n] ?? hits[hits.length - 1];
  if (!w) throw new Error(`LeadFlow: no word "${has}" in "${id}"`);
  return START[id] + Math.round(w.startSec * FPS);
};

const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const soft = Easing.bezier(0.33, 0, 0.15, 1);
const out = Easing.out(Easing.cubic);
const glideE = Easing.inOut(Easing.cubic);
const seg = (f: number, a: number, b: number, e: (t: number) => number = soft) => interpolate(f, [a, b], [0, 1], { ...cl, easing: e });
const blip = (f: number, a: number, up: number, b: number) => seg(f, a, a + up, out) * (1 - seg(f, a + up, b));
const win = (f: number, a: number, b: number, fade = 10) => seg(f, a - fade, a) * (1 - seg(f, b, b + fade));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------------------------------------------------------------------------------------
// Look: LeadFlow's dark theme (src/index.css .dark): graphite, mint signal, blue, amber.
const ok = (l: number, c: number, h: number): Tone => (a = 1) => `oklch(${l}% ${c} ${h} / ${a})`;
const L = {
  bg: ok(12.5, 0.006, 150),
  bg2: ok(17, 0.008, 150),
  card: ok(20, 0.009, 150),
  card2: ok(24.5, 0.01, 150),
  line: ok(34, 0.012, 150),
  fg: ok(96.5, 0.006, 140),
  fg2: ok(81, 0.012, 146),
  fg3: ok(63, 0.012, 148),
  mint: ok(88, 0.14, 152),
  mintInk: ok(17, 0.03, 152),
  blue: ok(70, 0.13, 250),
  amber: ok(80, 0.13, 66),
  grey: ok(52, 0.01, 150),
  sea: ok(19, 0.03, 235),
};
const TG = { bg: ok(16, 0.02, 250), head: ok(22, 0.025, 250), bubble: ok(27, 0.03, 252), btn: ok(31, 0.03, 252) };
const WA = { bg: ok(15, 0.012, 175), head: ok(23, 0.03, 172), out: ok(40, 0.075, 172), green: ok(72, 0.17, 150), tick: ok(76, 0.11, 230) };
const DOTTED: React.CSSProperties = { unicodeBidi: 'isolate' };

/** Small stroke icons (24x24), drawn here. */
const PATHS = {
  pin: 'M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0113 0c0 4.8-6.5 11-6.5 11z M12 12.3a2.3 2.3 0 100-4.6 2.3 2.3 0 000 4.6z',
  phone: 'M6.6 3.5h3l1.6 4.4-2 1.4a11.5 11.5 0 005.5 5.5l1.4-2 4.4 1.6v3a2 2 0 01-2.2 2A16.5 16.5 0 014.6 5.7a2 2 0 012-2.2z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  bell: 'M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z M10 20.5a2 2 0 004 0',
  mail: 'M3.5 6h17v12h-17z M3.5 7l8.5 6.5L20.5 7',
  chat: 'M4 5.5h16v10.5H10l-6 4.5z M8 9.5h8 M8 12.5h5',
  back: 'M15 5l-7 7 7 7',
  list: 'M8 6.5h12 M8 12h12 M8 17.5h12 M4 6.5h.01 M4 12h.01 M4 17.5h.01',
  board: 'M4 4.5h4.5v15H4z M10 4.5h4.5v9H10z M16 4.5h4v12h-4z',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  flask: 'M9 3.5h6 M10 3.5v6L4.8 18a1.8 1.8 0 001.6 2.5h11.2a1.8 1.8 0 001.6-2.5L14 9.5v-6 M7.5 14.5h9',
  spark: 'M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z',
  folder: 'M3.5 6.5h6l2 2h9v10.5h-17z',
  trophy: 'M8 4h8v5a4 4 0 01-8 0z M8 6H4.5a3 3 0 003.5 4 M16 6h3.5a3 3 0 01-3.5 4 M12 13v4 M8.5 20h7 M9.5 17h5',
  chart: 'M4 20h16 M7 16v-5 M12 16V7 M17 16v-8',
  calendar: 'M4.5 6h15v14h-15z M4.5 10h15 M8.5 3.5v4 M15.5 3.5v4',
  star: 'M12 3.8l2.5 5.3 5.7.7-4.2 3.9 1.1 5.7L12 16.6l-5.1 2.8 1.1-5.7-4.2-3.9 5.7-.7z',
} as const;
type PathName = keyof typeof PATHS;
const I: React.FC<{ n: PathName; size: number; color: string; w?: number; fill?: string; style?: React.CSSProperties }> = ({ n, size, color, w = 2, fill = 'none', style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', ...style }}>
    <path d={PATHS[n]} />
  </svg>
);
const Num: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span dir="ltr" style={{ ...DOTTED, fontFamily: MONO, ...style }}>{children}</span>
);
const Sample: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 22, style }) => (
  <span dir="rtl" style={{ display: 'inline-block', fontFamily: ASSIST, fontWeight: 700, fontSize: size, lineHeight: 1.2, color: L.fg2(), padding: `${size * 0.16}px ${size * 0.62}px`, borderRadius: 99, border: `1.5px solid ${L.fg(0.26)}`, background: L.bg(0.6), whiteSpace: 'nowrap', ...style }}>
    לדוגמה
  </span>
);
/** A solid card (the boards stand in 3D, so nothing behind them is blurred). */
const Card: React.FC<{ x: number; y: number; w: number; h: number; glow?: number; tone?: Tone; r?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, glow = 0, tone = L.mint, r = 26, style, children }) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', borderRadius: r,
      background: `linear-gradient(165deg, ${L.card2()}, ${L.card()} 60%, ${L.bg2()})`,
      border: `2px solid ${glow > 0 ? tone(0.25 + 0.6 * glow) : L.line(0.9)}`,
      boxShadow: `0 30px 80px rgba(0,0,0,.55), 0 0 ${70 * glow}px ${tone(0.35 * glow)}, inset 0 1.5px 0 ${L.fg(0.08)}`,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------------------------
// The camera: an orbit camera (target, distance, yaw, pitch), the same maths as the CSS transform.
type V3 = [number, number, number];
type Cam = { t: V3; d: number; yaw: number; pitch: number };
const P = 1400;
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
function project(v: V3, c: Cam) {
  const [x, y, z] = toCam(v, c);
  const w = P - z;
  const s = P / Math.max(w, 1);
  return { x: 540 + x * s, y: 960 + y * s, s, depth: w, ok: w > 60 };
}
const worldCss = (c: Cam) => `translateZ(${P - c.d}px) rotateX(${c.pitch}deg) rotateY(${c.yaw}deg) translate3d(${-c.t[0]}px, ${-c.t[1]}px, ${-c.t[2]}px)`;

// ---------------------------------------------------------------------------------------------
// The space: the board (six columns, as in the app's leadStages) stands over the map of Haifa.
const COLS = ['ליצירת קשר', 'בפנייה', 'ממתין', 'מעוניין', 'לקראת סגירה', 'זכייה'];
const COLW = 310;
const CGAP = 16;
const BPAD = 30;
const BW = 6 * COLW + 5 * CGAP + 2 * BPAD; // 2000
const BH = 1040;
const COL_TOP = 100; // the columns start under the board's title row (board coordinates)
const HEAD_H = 84;
const CARD_TOP = COL_TOP + HEAD_H + 8;
const CARDW = COLW - 26;
const CARDH = 138;
const SLOT = CARDH + 14;
/** A column's centre: world x (the board's centre is the world origin; RTL, so the first column is on the right). */
const colX = (i: number) => BW / 2 - BPAD - COLW / 2 - i * (COLW + CGAP);
/** A card slot's centre: world y. */
const slotY = (slot: number) => CARD_TOP + CARDH / 2 + slot * SLOT - BH / 2;
const YF = 700; // the map's floor
const MAP = 3200;
const MAP_Z = 700;
const DANA_PIN: V3 = [560, YF, 1000];
const PIN_UP: V3 = [560, YF - 92, 1000];

// The other leads on the board (samples, as on the landing page's demo data).
const OTHERS: { n: string; s: string }[][] = [
  [{ n: 'הדר שיער', s: 'מספרה · חיפה' }, { n: 'כרמל תספורות', s: 'מספרה · חיפה' }, { n: 'שירי שיער וצבע', s: 'מספרה · חיפה' }],
  [{ n: 'מוסך הגליל', s: 'מוסך · קריות' }, { n: 'פרחי הכרמל', s: 'חנות פרחים' }],
  [{ n: 'קפה הנמל', s: 'בית קפה · חיפה' }, { n: 'ברבר 21', s: 'מספרה · חיפה' }],
  [{ n: 'מאפיית השוק', s: 'מאפייה · חיפה' }],
  [{ n: 'מור עיצוב שיער', s: 'מספרה · נשר' }],
  [{ n: 'סטודיו ליאת', s: 'מספרה · חיפה' }, { n: 'סלון נוגה', s: 'מספרה · טירת כרמל' }],
];
/** What Dana's card says in each column. */
const BADGES: { icon: PathName; text: string; tone: Tone }[] = [
  { icon: 'star', text: '4.6 · נוסף מהמפה', tone: L.amber },
  { icon: 'mail', text: 'מייל פתיחה', tone: L.blue },
  { icon: 'bell', text: 'שלישי · 10:00', tone: L.amber },
  { icon: 'calendar', text: 'פגישה · חמישי 11:00', tone: L.mint },
  { icon: 'check', text: 'הצעה נשלחה', tone: L.mint },
  { icon: 'trophy', text: 'לקוחה · פרויקט פתוח', tone: L.mint },
];

// ---------------------------------------------------------------------------------------------
// Dana's card: where it is at each frame. It glides column to column; in the hook it rewinds to the pin and back.
type Move = { a: number; b: number; from: number; to: number };
const MOVES: Move[] = [
  { a: -4, b: 16, from: 4, to: 5 }, // the hook opens on the result: Dana lands in זכייה
  { a: 306, b: 324, from: 0, to: 1 }, // after the practice call → בפנייה
  { a: 450, b: 470, from: 1, to: 2 }, // the email is out → ממתין
  { a: 834, b: 854, from: 2, to: 3 }, // she answered and is interested → מעוניין
  { a: 1112, b: 1132, from: 3, to: 4 }, // "שולחים הצעה" → לקראת סגירה
  { a: 1316, b: 1336, from: 4, to: 5 }, // "סוגרת" → זכייה, on the bar-8 hit
];
const REW = { back: [at('hook', 'שמצאתם') - 2, at('hook', 'שמצאתם') + 12], down: [at('hook', 'שמצאתם') + 12, at('hook', 'המפה') + 4], up: [at('hook', 'ללקוחה') - 2, at('hook', 'ללקוחה') + 12] } as const;
type DanaAt = { p: V3; scale: number; o: number; col: number; lift: number; onBoard: boolean };
const slotPos = (col: number, z = 6): V3 => [colX(col), slotY(0), z];
function dana(f: number): DanaAt {
  const [b0, b1] = REW.back;
  const [d0, d1] = REW.down;
  const [u0, u1] = REW.up;
  if (f < b0) {
    const m = MOVES[0];
    const t = seg(f, m.a, m.b, glideE);
    const lift = Math.sin(Math.PI * seg(f, m.a, m.b, (x) => x));
    const col = lerp(m.from, m.to, t);
    return { p: slotPos(col, 6 + 90 * lift), scale: 1 + 0.05 * lift, o: 1, col, lift, onBoard: true };
  }
  if (f < d0) {
    const t = seg(f, b0, b1, Easing.in(Easing.quad));
    const lift = seg(f, b0, b0 + 5);
    const col = lerp(5, 0, t);
    return { p: slotPos(col, 6 + 90 * lift), scale: 1 + 0.05 * lift, o: 1, col, lift, onBoard: true };
  }
  if (f < d1) {
    const t = seg(f, d0, d1, glideE);
    const a = slotPos(0, 96);
    return { p: [lerp(a[0], PIN_UP[0], t), lerp(a[1], PIN_UP[1], t), lerp(a[2], PIN_UP[2], t)], scale: lerp(1.05, 0.16, t), o: 1 - seg(f, d1 - 5, d1), col: 0, lift: 1, onBoard: false };
  }
  if (f < u0) return { p: PIN_UP, scale: 0.16, o: 0, col: 0, lift: 0, onBoard: false };
  if (f < u1) {
    const t = seg(f, u0, u1, out);
    const a = slotPos(0, 6);
    return { p: [lerp(PIN_UP[0], a[0], t), lerp(PIN_UP[1], a[1], t), lerp(PIN_UP[2], a[2], t)], scale: lerp(0.16, 1, t), o: seg(f, u0, u0 + 5), col: 0, lift: 1 - t, onBoard: t > 0.85 };
  }
  let m = MOVES[1];
  for (const mv of MOVES.slice(1)) if (f >= mv.a) m = mv;
  const t = seg(f, m.a, m.b, glideE);
  const lift = Math.sin(Math.PI * seg(f, m.a, m.b, (x) => x));
  const col = f < MOVES[1].a ? 0 : lerp(m.from, m.to, t);
  return { p: slotPos(col, 6 + 90 * lift), scale: 1 + 0.05 * lift, o: 1, col, lift, onBoard: true };
}
/** How much of Dana is in column i (the other cards there make room for her). */
const presence = (d: DanaAt, i: number) => (d.onBoard ? Math.max(0, 1 - Math.abs(d.col - i)) : 0);
/** The project opens below her card when she is won. */
const PROJECT: [number, number] = [at('won', 'והפרויקט') - 2, at('won', 'והפרויקט') + 14];
const projectOn = (f: number) => seg(f, PROJECT[0], PROJECT[1], Easing.out(Easing.back(1.5)));

// ---------------------------------------------------------------------------------------------
// Close-ups and the phone: when each one opens and shuts (open = fully open; shut = starts to fold back).
type Span = { open: [number, number]; shut: [number, number] };
// Each landing on the board gets ~0.6-1 s before the next close-up opens, so the move can be read.
const P_LAB: Span = { open: [128, 142], shut: [294, 306] };
const P_EMAIL: Span = { open: [344, 358], shut: [438, 450] };
const P_PHONE: Span = { open: [488, 504], shut: [820, 834] };
const P_PREP: Span = { open: [872, 886], shut: [1096, 1108] };
const P_REPORT: Span = { open: [at('report', 'היום') - 4, at('report', 'היום') + 10], shut: [1298, 1310] };
const spanK = (f: number, s: Span) => seg(f, s.open[0], s.open[1], out) * (1 - seg(f, s.shut[0], s.shut[1], soft));
const dimK = (f: number) => Math.max(spanK(f, P_LAB), spanK(f, P_EMAIL), spanK(f, P_PHONE), spanK(f, P_PREP), spanK(f, P_REPORT));
/** Where she lands, for the big stage label. */
const LANDS = [
  { f: REW.up[1], col: 0 },
  { f: MOVES[1].b, col: 1 },
  { f: MOVES[2].b, col: 2 },
  { f: MOVES[3].b, col: 3 },
  { f: MOVES[4].b, col: 4 },
  { f: MOVES[5].b, col: 5 },
];

// ---------------------------------------------------------------------------------------------
// The camera path: keys joined by a monotone cubic (smooth, never overshoots).
type Key = { f: number; c: Cam };
const BOARD_Y = -60; // the board sits a little low, under the titles
const BD = 1950; // the board shot: about five columns, Dana's card readable
const halfView = (d: number) => (540 * d) / P;
const boardCam = (x: number, d: number, yaw = 0, pitch = -5): Cam => {
  const lim = Math.max(0, BW / 2 + 40 - halfView(d));
  return { t: [Math.max(-lim, Math.min(lim, x)), BOARD_Y, 0], d, yaw, pitch };
};
const FINAL: Cam = { t: [-30, 330, 430], d: 3050, yaw: 3, pitch: -20 };
function buildKeys(): Key[] {
  const k: Key[] = [];
  const add = (f: number, c: Cam) => k.push({ f: Math.round(f), c });
  // hook: the whole board, Dana lands in זכייה; the rewind dives to her pin on the map, then rises to the board
  add(0, boardCam(40, 2760, 4, -6));
  add(REW.back[0], boardCam(-10, 2640, 2, -6));
  add(REW.down[1], { t: [530, YF - 30, 930], d: 1900, yaw: -6, pitch: -54 });
  add(REW.up[0], { t: [550, YF - 30, 960], d: 1820, yaw: -7, pitch: -55 });
  add(REW.up[1] + 12, boardCam(colX(0), BD, -3, -5));
  // the board between close-ups; a slow push while a close-up is open
  add(P_LAB.open[1], boardCam(colX(0), BD - 70, -4, -5));
  add(P_LAB.shut[0], boardCam(colX(0), BD - 150, -5, -5));
  add(MOVES[1].b, boardCam(colX(1), BD, -2, -5));
  add(P_EMAIL.open[1], boardCam(colX(1), BD - 40, -2, -5));
  add(P_EMAIL.shut[0], boardCam(colX(1), BD - 100, -3, -5));
  add(MOVES[2].b, boardCam(colX(2), BD, 0, -5));
  add(P_PHONE.open[1], boardCam(colX(2), BD - 40, 1, -5));
  add(P_PHONE.shut[0], boardCam(colX(2), BD - 160, 3, -5));
  add(MOVES[3].b, boardCam(colX(3), BD, 1, -5));
  add(P_PREP.open[1], boardCam(colX(3), BD - 40, 1, -5));
  add(P_PREP.shut[0], boardCam(colX(3), BD - 140, 3, -5));
  add(MOVES[4].b, boardCam(colX(4), BD, 2, -5));
  add(P_REPORT.open[1], boardCam(colX(4), BD - 40, 3, -5));
  add(P_REPORT.shut[0], boardCam(colX(4), BD - 130, 4, -5));
  add(MOVES[5].a, boardCam(colX(4.5), BD, 3, -5));
  add(MOVES[5].b + 2, { t: [-540, BOARD_Y, 0], d: BD - 90, yaw: 2, pitch: -5 });
  add(PROJECT[1] + 6, { t: [-560, BOARD_Y, 0], d: BD - 150, yaw: 1, pitch: -5 });
  // the win: pull back over the map, the whole path in view
  add(PROJECT[1] + 70, FINAL);
  add(LF_TOTAL, { ...FINAL, d: FINAL.d + 160, yaw: FINAL.yaw + 2 });
  return k.sort((x, y) => x.f - y.f);
}
const KEYS = buildKeys();
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
/** Dana's card on screen: centre and width. */
const danaScreen = (f: number) => {
  const d = dana(f);
  const q = project(d.p, cam(f));
  return { x: q.x, y: q.y, w: CARDW * q.s * d.scale };
};

// ---------------------------------------------------------------------------------------------
// Stage pieces.
const Plane: React.FC<{ p: V3; w: number; h: number; rot?: string; style?: React.CSSProperties; children?: React.ReactNode }> = ({ p, w, h, rot = '', style, children }) => (
  <div style={{ position: 'absolute', left: -w / 2, top: -h / 2, width: w, height: h, transformOrigin: '50% 50%', transform: `translate3d(${p[0]}px, ${p[1]}px, ${p[2]}px) ${rot}`, backfaceVisibility: 'hidden', ...style }}>
    {children}
  </div>
);
const Stage: React.FC<{ c: Cam; children: React.ReactNode }> = ({ c, children }) => (
  <AbsoluteFill style={{ perspective: `${P}px`, perspectiveOrigin: '540px 960px', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 540, top: 960, width: 0, height: 0, transformStyle: 'preserve-3d', transformOrigin: '0 0', transform: worldCss(c) }}>{children}</div>
  </AbsoluteFill>
);

/** Graphite night with a mint haze (blue while Telegram is on screen); dust that drifts with the camera. */
const Backdrop: React.FC<{ f: number; c: Cam }> = ({ f, c }) => {
  const r = rng(41);
  const dust = React.useMemo(() => Array.from({ length: 130 }, () => ({ x: r() * 1080, y: r() * 1920, s: 1.2 + r() * 3.2, o: 0.08 + r() * 0.4, b: r() < 0.3, k: 0.4 + r() * 1.2 })), []);
  const blue = Math.max(win(f, at('today', 'מגיעה'), P_TG_OUT, 16), win(f, P_REPORT.open[0], P_REPORT.shut[1], 16));
  return (
    <AbsoluteFill style={{ background: L.bg(), overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(1150px 1300px at 50% 900px, ${L.mint(0.13)}, transparent 70%)`, opacity: 1 - 0.6 * blue }} />
      <AbsoluteFill style={{ background: `radial-gradient(1150px 1300px at 50% 900px, ${L.blue(0.16)}, transparent 70%)`, opacity: blue }} />
      {dust.map((d, i) => {
        const x = (((d.x - c.yaw * 9 * d.k - c.t[0] * 0.05 * d.k + Math.sin(f / 50 + i) * 6) % 1080) + 1080) % 1080;
        const y = (((d.y + c.pitch * 12 * d.k - f * (0.3 + d.s * 0.1)) % 1920) + 1920) % 1920;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: d.s, height: d.s, borderRadius: '50%', background: L.fg(d.o), filter: d.b ? 'blur(2.5px)' : undefined }} />;
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// The map on the floor: a dark city by the sea, streets, a soft light around Dana's pin.
const STREETS = (() => {
  const r = rng(77);
  const s: string[] = [];
  for (let i = 0; i < 16; i++) {
    const y0 = 300 + r() * 2600;
    let d = `M${500 + r() * 300} ${y0}`;
    let x = 700;
    let y = y0;
    while (x < 3100) {
      x += 160 + r() * 260;
      y += (r() - 0.5) * 220;
      d += ` L${x} ${y}`;
    }
    s.push(d);
  }
  for (let i = 0; i < 14; i++) {
    const x0 = 650 + r() * 2500;
    let d = `M${x0} 120`;
    let x = x0;
    let y = 120;
    while (y < 3100) {
      y += 170 + r() * 260;
      x += (r() - 0.5) * 200;
      d += ` L${x} ${y}`;
    }
    s.push(d);
  }
  return s;
})();
const mapShown = (f: number) => Math.max(0.42, win(f, REW.back[0], REW.up[1] + 10, 12), seg(f, PROJECT[1] + 6, PROJECT[1] + 40));
const MapFloor: React.FC<{ f: number }> = ({ f }) => {
  const glow = Math.max(win(f, REW.down[1] - 6, REW.up[1], 6), seg(f, PROJECT[1] + 20, PROJECT[1] + 50));
  const dx = DANA_PIN[0] + MAP / 2;
  const dz = DANA_PIN[2] - MAP_Z + MAP / 2;
  const mask = 'radial-gradient(closest-side, black 55%, transparent 100%)';
  return (
    <Plane p={[0, YF, MAP_Z]} w={MAP} h={MAP} rot="rotateX(90deg)" style={{ opacity: mapShown(f) }}>
      <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask }}>
        <div style={{ position: 'absolute', inset: 0, background: L.bg2(0.9) }} />
        <svg width={MAP} height={MAP} style={{ position: 'absolute', inset: 0 }}>
          <path d={`M0 0 L760 0 C640 600 820 1100 600 1700 C470 2100 560 2600 420 ${MAP} L0 ${MAP} Z`} fill={L.sea(0.9)} />
          <path d={`M760 0 C640 600 820 1100 600 1700 C470 2100 560 2600 420 ${MAP}`} fill="none" stroke={L.blue(0.35)} strokeWidth={5} />
          {STREETS.map((d, i) => <path key={i} d={d} fill="none" stroke={L.fg(i % 5 === 0 ? 0.16 : 0.08)} strokeWidth={i % 5 === 0 ? 9 : 4} strokeLinejoin="round" />)}
        </svg>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${L.fg(0.04)} 2px, transparent 2px), linear-gradient(90deg, ${L.fg(0.04)} 2px, transparent 2px)`, backgroundSize: '120px 120px' }} />
        {glow > 0 && <div style={{ position: 'absolute', left: dx - 300, top: dz - 300, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(closest-side, ${L.mint(0.4 * glow)}, transparent)` }} />}
      </div>
    </Plane>
  );
};
// Pins on the map (the scan's salons, as on the landing page); Dana's is mint.
const PINS: { id: string; p: V3 }[] = [
  { id: 'dana', p: DANA_PIN },
  { id: 'a', p: [-420, YF, 1180] },
  { id: 'b', p: [120, YF, 1420] },
  { id: 'c', p: [930, YF, 1500] },
  { id: 'd', p: [-860, YF, 760] },
  { id: 'e', p: [1180, YF, 820] },
  { id: 'f', p: [-150, YF, 640] },
];

// ---------------------------------------------------------------------------------------------
// The board.
const LeadCard: React.FC<{ x: number; y: number; name: string; sub: string; dim?: number }> = ({ x, y, name, sub, dim = 0.62 }) => (
  <div dir="rtl" style={{ position: 'absolute', left: x, top: y, width: CARDW, height: CARDH, boxSizing: 'border-box', borderRadius: 20, background: L.card(0.95), border: `1.5px solid ${L.line(0.8)}`, padding: '20px 22px', opacity: dim }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 40, height: 40, borderRadius: 99, background: L.card2(), border: `1.5px solid ${L.line()}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: 21, color: L.fg2(), flex: 'none' }}>{name[0]}</span>
      <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 28, color: L.fg(0.9), whiteSpace: 'nowrap', overflow: 'hidden' }}>{name}</span>
    </div>
    <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 22, color: L.fg3(), marginTop: 14, whiteSpace: 'nowrap' }}>{sub}</div>
  </div>
);
const Board: React.FC<{ f: number }> = ({ f }) => {
  const d = dana(f);
  const proj = projectOn(f);
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 40, background: `linear-gradient(170deg, ${L.bg2(0.97)}, ${L.bg(0.97)})`, border: `2px solid ${L.line(0.9)}`, boxShadow: `0 60px 160px rgba(0,0,0,.6), inset 0 2px 0 ${L.fg(0.06)}` }}>
      <div dir="rtl" style={{ position: 'absolute', right: BPAD + 10, left: BPAD + 10, top: 26, display: 'flex', alignItems: 'center', gap: 16 }}>
        <I n="board" size={38} color={L.mint()} />
        <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 38, color: L.fg() }}>הלוח</span>
        <span style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 28, color: L.fg3() }}>כל הפניות שלכם, לפי שלב</span>
        <span style={{ flex: 1 }} />
        <Sample size={24} />
      </div>
      {COLS.map((name, i) => {
        const here = presence(d, i);
        const left = BW / 2 + colX(i) - COLW / 2;
        const won = i === 5;
        const tone = won ? L.mint : L.mint;
        const others = OTHERS[i];
        const shift = here + (won ? proj : 0);
        const count = others.length + (here > 0.5 ? 1 : 0);
        return (
          <div key={name} style={{ position: 'absolute', left, top: COL_TOP, width: COLW, height: BH - COL_TOP - 26 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: here > 0 ? tone(0.05 * here) : L.fg(0.025), border: `1.5px solid ${here > 0 ? tone(0.12 + 0.3 * here) : L.fg(0.05)}` }} />
            <div dir="rtl" style={{ position: 'absolute', left: 18, right: 18, top: 0, height: HEAD_H, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: 99, flex: 'none', background: won ? L.mint() : i >= 3 ? L.blue() : L.fg3(), boxShadow: here > 0.5 ? `0 0 14px ${L.mint(0.9)}` : undefined }} />
              <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 34, color: here > 0.5 ? L.mint() : L.fg(0.92), whiteSpace: 'nowrap' }}>{name}</span>
              <span style={{ flex: 1 }} />
              <Num style={{ fontSize: 24, fontWeight: 700, color: here > 0.5 ? L.mint() : L.fg3(), padding: '2px 12px', borderRadius: 99, background: L.fg(0.06) }}>{count}</Num>
            </div>
            <div style={{ position: 'absolute', left: 18, right: 18, top: HEAD_H - 4, height: 3, borderRadius: 2, background: here > 0 ? L.mint(0.85 * here) : L.fg(0.06) }} />
            {others.map((o, j) => (
              <LeadCard key={o.n} x={13} y={CARD_TOP - COL_TOP + (j + shift) * SLOT} name={o.n} sub={o.s} />
            ))}
          </div>
        );
      })}
    </div>
  );
};
/** Dana's own card: brighter, mint, with what is happening with her now. */
const DanaFace: React.FC<{ f: number; d: DanaAt }> = ({ f, d }) => {
  const i = Math.max(0, Math.min(5, Math.round(d.col)));
  const b = BADGES[i];
  const land = LANDS.find((l) => l.col === i && f >= l.f - 4 && f < l.f + 24);
  const pop = land ? blip(f, land.f - 2, 5, land.f + 20) : 0;
  const glow = 0.55 + 0.35 * d.lift + 0.5 * pop;
  return (
    <div dir="rtl" style={{ position: 'absolute', inset: 0, boxSizing: 'border-box', borderRadius: 20, background: `linear-gradient(165deg, ${L.card2()}, ${L.card()})`, border: `2.5px solid ${L.mint(0.55 + 0.4 * glow)}`, boxShadow: `0 ${20 + 40 * d.lift}px ${50 + 50 * d.lift}px rgba(0,0,0,.6), 0 0 ${40 + 50 * glow}px ${L.mint(0.3 * glow)}`, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 42, height: 42, borderRadius: 99, background: L.mint(), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: 23, color: L.mintInk(), flex: 'none' }}>ד</span>
        <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 29, color: L.fg(), whiteSpace: 'nowrap' }}>סטודיו שיער דנה</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, transform: `scale(${1 + 0.1 * pop})`, transformOrigin: '100% 50%' }}>
        <I n={b.icon} size={26} color={b.tone()} w={2.4} fill={b.icon === 'star' ? b.tone() : 'none'} />
        <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 23, color: b.tone(), whiteSpace: 'nowrap' }}>{b.text}</span>
      </div>
    </div>
  );
};
const ProjectCard: React.FC<{ f: number }> = ({ f }) => {
  const p = projectOn(f);
  if (p <= 0.001) return null;
  return (
    <div dir="rtl" style={{ position: 'absolute', inset: 0, boxSizing: 'border-box', borderRadius: 20, background: L.mint(0.12), border: `2.5px dashed ${L.mint(0.85)}`, boxShadow: `0 0 50px ${L.mint(0.3)}`, padding: '18px 20px', opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * -60}px) scale(${0.85 + 0.15 * p})` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <I n="folder" size={36} color={L.mint()} w={2.4} />
        <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 29, color: L.fg(), whiteSpace: 'nowrap' }}>פרויקט חדש</span>
      </div>
      <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 23, color: L.mint(), marginTop: 14, whiteSpace: 'nowrap' }}>נפתח עכשיו · סטודיו שיער דנה</div>
    </div>
  );
};
const World: React.FC<{ f: number }> = ({ f }) => {
  const d = dana(f);
  return (
    <>
      <Plane p={[0, 0, 0]} w={BW} h={BH}>
        <Board f={f} />
      </Plane>
      {projectOn(f) > 0.001 && (
        <Plane p={[colX(5), slotY(1), 6]} w={CARDW} h={CARDH}>
          <ProjectCard f={f} />
        </Plane>
      )}
      {d.o > 0.01 && (
        <Plane p={d.p} w={CARDW} h={CARDH} rot={`scale(${d.scale}) rotateZ(${-2.5 * d.lift}deg)`} style={{ opacity: d.o }}>
          <DanaFace f={f} d={d} />
        </Plane>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Flat, at projected positions: the pins, the beam from Dana's pin to the board, the path of the win, the labels.
const PinMark: React.FC<{ x: number; y: number; s: number; tone: Tone; on: number; glow: number }> = ({ x, y, s, tone, on, glow }) => {
  const h = 92 * s;
  const w = h * 0.72;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: on }}>
      <div style={{ position: 'absolute', left: x - w * 0.9, top: y - w * 0.28, width: w * 1.8, height: w * 0.56, borderRadius: '50%', border: `${Math.max(1.5, 3 * s)}px solid ${tone(0.5)}`, boxShadow: `0 0 ${30 * glow * s}px ${tone(0.8 * glow)}` }} />
      <svg viewBox="0 0 24 32" width={w} height={h} style={{ position: 'absolute', left: x - w / 2, top: y - h, overflow: 'visible', filter: `drop-shadow(0 0 ${14 * glow * s}px ${tone(0.9)})` }}>
        <path d="M12 31C12 31 2 18.5 2 11.5a10 10 0 0120 0C22 18.5 12 31 12 31z" fill={tone(0.95)} stroke={L.bg(0.6)} strokeWidth={1.2} />
        <circle cx={12} cy={11.5} r={4} fill={L.bg(0.85)} />
      </svg>
    </div>
  );
};
const FlatUnder: React.FC<{ f: number; c: Cam }> = ({ f, c }) => {
  const shown = mapShown(f);
  const danaHot = Math.max(win(f, REW.down[1] - 8, REW.up[1] + 4, 6), seg(f, PROJECT[1] + 20, PROJECT[1] + 50));
  const pins = PINS.map((p) => ({ p, q: project(p.p, c) })).filter((o) => o.q.ok).sort((a, b) => b.q.depth - a.q.depth);
  return (
    <AbsoluteFill>
      {pins.map(({ p, q }) => {
        const isDana = p.id === 'dana';
        const pulse = isDana ? 1 + 0.12 * Math.sin(f / 3) * win(f, REW.down[1] - 4, REW.up[0] + 4, 4) : 1;
        return <PinMark key={p.id} x={q.x} y={q.y} s={Math.min(1.25, q.s * 1.15) * pulse} tone={isDana ? L.mint : L.fg3} on={shown * (isDana ? 0.7 + 0.3 * danaHot : 0.55)} glow={isDana ? danaHot : 0} />;
      })}
    </AbsoluteFill>
  );
};
/** A big stage label on the column she just landed in (playbook #6: point at the exact spot as it happens). */
const StageLabel: React.FC<{ f: number; c: Cam }> = ({ f, c }) => {
  const l = [...LANDS].reverse().find((x) => f >= x.f - 4);
  // the first landing (after the rewind) happens under the hook's big question: no label there
  if (!l || l.col === 0 || f > l.f + 46) return null;
  const p = seg(f, l.f - 4, l.f + 8, Easing.out(Easing.back(2)));
  const o = Math.min(1, p * 1.5) * (1 - seg(f, l.f + 34, l.f + 46)) * (1 - dimK(f));
  if (o <= 0.01) return null;
  const q = project([colX(l.col), COL_TOP + HEAD_H / 2 - BH / 2, 12], c);
  return (
    <div style={{ position: 'absolute', left: Math.max(250, Math.min(830, q.x)) - 300, width: 600, top: q.y - 88, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o, transform: `translateY(${(1 - p) * 20}px) scale(${0.8 + 0.2 * p})`, transformOrigin: '50% 100%' }}>
      <div dir="rtl" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 30px', borderRadius: 99, background: L.mint(), boxShadow: `0 12px 40px rgba(0,0,0,.55), 0 0 40px ${L.mint(0.45)}`, fontFamily: ASSIST, fontWeight: 800, fontSize: 44, color: L.mintInk(), whiteSpace: 'nowrap' }}>
        {l.col === 5 && <I n="trophy" size={40} color={L.mintInk()} w={2.4} />}
        {COLS[l.col]}
      </div>
      <svg width={30} height={18} viewBox="0 0 30 18" style={{ marginTop: -1 }}><path d="M0 0h30L15 18z" fill={L.mint()} /></svg>
    </div>
  );
};
const FlatTop: React.FC<{ f: number; c: Cam }> = ({ f, c }) => {
  const items: React.ReactNode[] = [];
  // the forward half of the rewind: a beam from her pin up to the first column
  const [u0, u1] = REW.up;
  const beam = seg(f, u0 - 4, u0 + 6, out) * (1 - seg(f, u1 + 2, u1 + 14));
  if (beam > 0) {
    const a = project(PIN_UP, c);
    const b = project(slotPos(0), c);
    if (a.ok && b.ok) items.push(<Beam key="beam" from={[a.x, a.y]} to={[b.x, b.y]} bend={-40} width={4} color={L.mint} draw={beam} />);
  }
  // the win: the path from the pin, through every column, to זכייה
  const pay = seg(f, PROJECT[1] + 14, PROJECT[1] + 54, (t) => t);
  if (pay > 0) {
    const stops: V3[] = [PIN_UP, ...[0, 1, 2, 3, 4, 5].map((i) => [colX(i), slotY(0) - CARDH / 2 - 14, 10] as V3)];
    const pts = stops.map((v) => project(v, c));
    if (pts.every((p) => p.ok)) {
      const seglen = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
      const total = seglen.reduce((s, v) => s + v, 0);
      const dd = `M${pts.map((p) => `${p.x} ${p.y}`).join(' L')}`;
      items.push(
        <svg key="path" width={1080} height={1920} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <filter id="lfglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={7} /></filter>
          </defs>
          <path d={dd} fill="none" stroke={L.mint(0.5)} strokeWidth={14} filter="url(#lfglow)" pathLength={1} strokeDasharray={`${pay} 1`} />
          <path d={dd} fill="none" stroke={L.mint()} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${pay} 1`} />
          {pts.map((p, i) => {
            const reach = seglen.slice(0, i).reduce((s, v) => s + v, 0) / total;
            const on = seg(pay, reach - 0.02, reach + 0.04);
            return <circle key={i} cx={p.x} cy={p.y} r={(i === 0 || i === pts.length - 1 ? 15 : 10) * on} fill={L.mint()} stroke={L.bg()} strokeWidth={3} />;
          })}
        </svg>,
      );
    }
  }
  return (
    <AbsoluteFill>
      {items}
      <StageLabel f={f} c={c} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// The close-ups open out of Dana's card and fold back into it; the board dims behind them.
const PANEL_X = 60;
const PANEL_W = 960;
const Panel: React.FC<{ f: number; s: Span; top: number; h: number; tone?: Tone; children: React.ReactNode }> = ({ f, s, top, h, tone = L.mint, children }) => {
  const k = spanK(f, s);
  if (k <= 0.001) return null;
  const d = danaScreen(f);
  const s0 = Math.max(0.12, d.w / PANEL_W);
  const cx = 540;
  const cy = top + h / 2;
  const x = lerp(d.x, cx, k);
  const y = lerp(d.y, cy, k);
  const sc = lerp(s0, 1, k);
  return (
    <div style={{ position: 'absolute', left: PANEL_X, top, width: PANEL_W, height: h, transform: `translate(${x - cx}px, ${y - cy}px) scale(${sc})`, transformOrigin: '50% 50%', opacity: Math.min(1, k * 2.4) }}>
      <Card x={0} y={0} w={PANEL_W} h={h} glow={0.32} tone={tone} r={34}>
        <div style={{ position: 'absolute', inset: 0, opacity: seg(k, 0.55, 1, (t) => t) }}>{children}</div>
      </Card>
    </div>
  );
};
const PanelHead: React.FC<{ icon: PathName; title: string; sub?: string; tone?: Tone }> = ({ icon, title, sub, tone = L.mint }) => (
  <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 34, display: 'flex', alignItems: 'center', gap: 18 }}>
    <span style={{ width: 66, height: 66, borderRadius: 20, background: tone(0.16), border: `1.5px solid ${tone(0.5)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
      <I n={icon} size={38} color={tone()} w={2.2} />
    </span>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 42, color: L.fg(), whiteSpace: 'nowrap', lineHeight: 1.1 }}>{title}</div>
      {sub && <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 28, color: L.fg3(), whiteSpace: 'nowrap', marginTop: 4 }}>{sub}</div>}
    </div>
    <span style={{ flex: 1 }} />
    <Sample size={24} />
  </div>
);
const Rule: React.FC<{ top: number }> = ({ top }) => <div style={{ position: 'absolute', left: 44, right: 44, top, height: 2, background: L.line(0.7) }} />;
const appear = (f: number, a: number, len = 10) => seg(f, a - 2, a + len, out);
const rise = (p: number, dy = 18): React.CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * dy}px)` });
/** A soft mint marker on the words the voice is naming. */
const mark = (on: number): React.CSSProperties => ({ background: L.mint(0.2 * on), boxShadow: `0 0 0 ${4 * on}px ${L.mint(0.28 * on)}`, borderRadius: 8 });

// Close-up 1: Sales Lab. The AI plays the salon owner, you answer, the call gets a score (0-100, sales-roleplay).
const LabPanel: React.FC<{ f: number }> = ({ f }) => {
  const typing = win(f, P_LAB.open[1] - 2, at('lab', 'השיחה') - 2, 4);
  const owner = appear(f, at('lab', 'השיחה'));
  const you = appear(f, at('lab', 'העסק'));
  const sc = seg(f, at('lab', 'ומקבלים') - 2, at('lab', 'ציון') + 10, out);
  const score = Math.round(82 * sc);
  const R = 78;
  const C = 2 * Math.PI * R;
  return (
    <Panel f={f} s={P_LAB} top={540} h={840}>
      <PanelHead icon="flask" title="שיחת תרגול" sub="לפני שמתקשרים לסטודיו שיער דנה" />
      <Rule top={140} />
      <div dir="rtl" style={{ position: 'absolute', right: 44, top: 170, display: 'flex', alignItems: 'center', gap: 10, fontFamily: ASSIST, fontWeight: 700, fontSize: 26, color: L.fg3(), ...rise(Math.max(owner, typing)) }}>
        <I n="spark" size={28} color={L.mint()} /> בעלת העסק · AI
      </div>
      {typing > 0.01 && owner < 0.5 && (
        <div style={{ position: 'absolute', right: 44, top: 212, width: 120, height: 66, borderRadius: '28px 8px 28px 28px', background: L.card2(), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: typing }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ width: 12, height: 12, borderRadius: 99, background: L.fg2(0.4 + 0.6 * (0.5 + 0.5 * Math.sin(f / 3 - i))) }} />)}
        </div>
      )}
      <div dir="rtl" style={{ position: 'absolute', right: 44, top: 212, maxWidth: 760, padding: '22px 30px', borderRadius: '32px 8px 32px 32px', background: L.card2(), border: `1.5px solid ${L.line()}`, fontFamily: ASSIST, fontWeight: 700, fontSize: 40, lineHeight: 1.3, color: L.fg(), ...rise(owner) }}>
        יש לי כבר ספק לצבע. למה שאחליף?
      </div>
      <div dir="rtl" style={{ position: 'absolute', left: 44, top: 330, fontFamily: ASSIST, fontWeight: 700, fontSize: 26, color: L.fg3(), ...rise(you) }}>אתם</div>
      <div dir="rtl" style={{ position: 'absolute', left: 44, top: 372, width: 700, boxSizing: 'border-box', padding: '22px 30px', borderRadius: '8px 32px 32px 32px', background: L.mint(0.14), border: `1.5px solid ${L.mint(0.5)}`, fontFamily: ASSIST, fontWeight: 700, fontSize: 38, lineHeight: 1.3, color: L.fg(), ...rise(you) }}>
        לא צריך להחליף. אפשר לנסות ערכה אחת ולהשוות.
      </div>
      <Rule top={572} />
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 604, height: 196, display: 'flex', alignItems: 'center', gap: 36, ...rise(seg(f, at('lab', 'ומקבלים') - 6, at('lab', 'ומקבלים') + 6, out)) }}>
        <div style={{ position: 'relative', width: 2 * R + 24, height: 2 * R + 24, flex: 'none' }}>
          <svg width={2 * R + 24} height={2 * R + 24} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
            <circle cx={R + 12} cy={R + 12} r={R} fill="none" stroke={L.line()} strokeWidth={14} />
            <circle cx={R + 12} cy={R + 12} r={R} fill="none" stroke={L.mint()} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${C * 0.82 * sc} ${C}`} style={{ filter: `drop-shadow(0 0 10px ${L.mint(0.6)})` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Num style={{ fontSize: 64, fontWeight: 700, color: L.fg(), lineHeight: 1 }}>{score}</Num>
            <Num style={{ fontSize: 20, color: L.fg3(), marginTop: 4 }}>/ 100</Num>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 48, color: L.fg() }}>ציון השיחה</div>
          <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 30, color: L.fg2(), marginTop: 8, lineHeight: 1.3 }}>ומשפטים טובים יותר לשיחה האמיתית</div>
        </div>
      </div>
    </Panel>
  );
};

// Close-up 2: the opening email, already written from the salon's details (the details light up as she says so).
const EmailPanel: React.FC<{ f: number }> = ({ f }) => {
  const m = (i: number) => win(f, at('email', 'לפי') - 4 + i * 4, P_EMAIL.shut[0], 4);
  const press = blip(f, P_EMAIL.shut[0] - 12, 3, P_EMAIL.shut[0] - 4);
  const sent = seg(f, P_EMAIL.shut[0] - 9, P_EMAIL.shut[0] - 3, out);
  const field = (k: string, v: string) => (
    <div dir="rtl" style={{ display: 'flex', gap: 16, alignItems: 'baseline', fontFamily: ASSIST, fontSize: 32, lineHeight: 1.3 }}>
      <span style={{ fontWeight: 700, color: L.fg3(), minWidth: 74 }}>{k}</span>
      <span style={{ fontWeight: 800, color: L.fg() }}>{v}</span>
    </div>
  );
  return (
    <Panel f={f} s={P_EMAIL} top={560} h={800} tone={L.blue}>
      <PanelHead icon="mail" title="מייל פתיחה" sub="נכתב לפי פרטי העסק" tone={L.blue} />
      <Rule top={140} />
      <div style={{ position: 'absolute', right: 44, left: 44, top: 166, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {field('אל', 'סטודיו שיער דנה')}
        {field('נושא', 'ערכת צבע לסטודיו שלכם בחיפה')}
      </div>
      <Rule top={274} />
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 300, fontFamily: ASSIST, fontWeight: 600, fontSize: 35, lineHeight: 1.5, color: L.fg() }}>
        <div>שלום דנה,</div>
        <div style={{ marginTop: 6 }}>
          ראיתי ש<span style={mark(m(0))}>הסטודיו שלכם בחיפה</span> קיבל <span style={mark(m(1))}><span dir="ltr" style={DOTTED}>4.6</span> כוכבים מ־<span dir="ltr" style={DOTTED}>87</span> ביקורות</span>, ושהלקוחות מדברים על <span style={mark(m(2))}>הצבע</span>.
        </div>
        <div style={{ marginTop: 6, color: L.fg2() }}>יש לנו ערכת צבע מקצועית ויום הדרכה לצוות. אפשר לדבר עשר דקות השבוע?</div>
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, bottom: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, height: 76, padding: '0 34px', borderRadius: 99, background: sent > 0.5 ? L.card2() : L.blue(), border: `2px solid ${L.blue()}`, color: sent > 0.5 ? L.blue() : L.bg(), fontFamily: ASSIST, fontWeight: 800, fontSize: 32, transform: `scale(${1 - 0.07 * press})` }}>
          <I n={sent > 0.5 ? 'check' : 'mail'} size={32} color={sent > 0.5 ? L.blue() : L.bg()} w={2.6} />
          {sent > 0.5 ? 'נשלח' : 'שליחה'}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: ASSIST, fontWeight: 700, fontSize: 26, color: L.fg3() }}>
          <I n="spark" size={26} color={L.mint()} /> נכתב עם AI, אפשר לערוך
        </span>
      </div>
    </Panel>
  );
};

// Close-up 3: meeting prep. It asks you first, then uses what she said on the call: the questions to ask and a timed plan.
const PrepPanel: React.FC<{ f: number }> = ({ f }) => {
  const open = P_PREP.open[1];
  const chip = seg(f, at('prep', 'הפגישה') + 8, at('prep', 'הפגישה') + 14, out);
  const heard = appear(f, at('prep', 'משתמש'));
  const heardMark = win(f, at('prep', 'סיפרה') - 4, at('prep', 'כדי') + 8, 5);
  const ask = appear(f, at('prep', 'שאלות'));
  const askMark = win(f, at('prep', 'שאלות') + 4, P_PREP.shut[0], 6);
  const plan = appear(f, at('prep', 'ותוכנית'));
  const label = (t: string, top: number, p: number) => (
    <div dir="rtl" style={{ position: 'absolute', right: 44, top, fontFamily: ASSIST, fontWeight: 800, fontSize: 26, color: L.mint(), letterSpacing: 0.3, ...rise(p, 10) }}>{t}</div>
  );
  const PLAN = [
    { m: 5, t: 'היכרות' },
    { m: 15, t: 'הצבע והצוות' },
    { m: 10, t: 'הצעה וצעד הבא' },
  ];
  return (
    <Panel f={f} s={P_PREP} top={520} h={890}>
      <PanelHead icon="spark" title="הכנה לפגישה" sub="סטודיו שיער דנה · חמישי 11:00" />
      <Rule top={140} />
      {label('קודם כמה שאלות אליך', 164, appear(f, open - 6))}
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 206, fontFamily: ASSIST, fontWeight: 800, fontSize: 40, color: L.fg(), ...rise(appear(f, open - 4)) }}>מה הכי חשוב לכם להשיג בפגישה?</div>
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 270, display: 'flex', gap: 14, ...rise(appear(f, open)) }}>
        {['הזמנה ראשונה', 'רק היכרות', 'לבדוק תקציב'].map((t, i) => {
          const on = i === 0 ? chip : 0;
          return (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 99, fontFamily: ASSIST, fontWeight: 800, fontSize: 29, background: on > 0.5 ? L.mint() : 'transparent', color: on > 0.5 ? L.mintInk() : L.fg2(), border: `1.5px solid ${on > 0.5 ? L.mint() : L.line()}`, transform: `scale(${1 + 0.08 * blip(f, at('prep', 'הפגישה') + 8, 4, at('prep', 'הפגישה') + 20) * (i === 0 ? 1 : 0)})` }}>
              {on > 0.5 && <I n="check" size={26} color={L.mintInk()} w={3} />}
              {t}
            </span>
          );
        })}
      </div>
      <Rule top={356} />
      {label('מה דנה אמרה בשיחה', 378, heard)}
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 420, display: 'flex', gap: 14, alignItems: 'flex-start', ...rise(heard) }}>
        <I n="phone" size={32} color={L.fg3()} style={{ marginTop: 6 }} />
        <span style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 33, lineHeight: 1.35, color: L.fg(), ...mark(heardMark) }}>״מתעניינת בערכת הצבע וביום הדרכה לצוות.״</span>
      </div>
      <Rule top={512} />
      {label('שאלות לשאול', 534, ask)}
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 576, display: 'flex', gap: 14, alignItems: 'center', padding: '18px 24px', borderRadius: 20, background: L.mint(0.08 + 0.08 * askMark), border: `1.5px solid ${L.mint(0.3 + 0.5 * askMark)}`, ...rise(ask) }}>
        <I n="star" size={32} color={L.amber()} fill={L.amber()} />
        <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 38, color: L.fg() }}>כמה צבע הסטודיו מזמין בחודש?</span>
      </div>
      {label('התוכנית · 30 דקות', 700, plan)}
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 742, display: 'flex', gap: 12 }}>
        {PLAN.map((p, i) => {
          const pi = appear(f, at('prep', 'ותוכנית') + i * 5);
          return (
            <div key={p.t} style={{ flex: p.m, minWidth: 0, padding: '14px 16px', borderRadius: 18, background: L.card2(), border: `1.5px solid ${L.line()}`, ...rise(pi, 12) }}>
              <Num style={{ fontSize: 26, fontWeight: 700, color: L.mint() }}>{p.m}′</Num>
              <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 26, color: L.fg(), whiteSpace: 'nowrap', marginTop: 2 }}>{p.t}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// Close-up 4: the day's work report as it arrives on Telegram (copy from workReport.js: "היום שלך", שיחות, ענו, פגישות, טיפים).
const ReportPanel: React.FC<{ f: number }> = ({ f }) => {
  const tile = (i: number) => appear(f, [at('report', 'שיחות'), at('report', 'ענה'), at('report', 'ענה') + 7][i] - 2, 10);
  const hot = (i: number) => win(f, [at('report', 'שיחות'), at('report', 'ענה'), at('report', 'ענה') + 7][i] - 2, [at('report', 'מי') - 2, at('report', 'ומה') - 2, at('report', 'ומה') - 2][i], 5);
  const tip = appear(f, at('report', 'ומה'));
  const tipMark = win(f, at('report', 'מחר') - 4, P_REPORT.shut[0], 6);
  const TILES = [
    { n: '14', t: 'שיחות', icon: 'phone' as PathName },
    { n: '6', t: 'ענו', icon: 'check' as PathName },
    { n: '2', t: 'פגישות', icon: 'calendar' as PathName },
  ];
  return (
    <Panel f={f} s={P_REPORT} top={560} h={800} tone={L.blue}>
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 34, display: 'flex', alignItems: 'center', gap: 18 }}>
        <span style={{ width: 66, height: 66, borderRadius: 99, background: L.blue(), display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <svg viewBox="0 0 24 24" width={36} height={36}><path d="M21 3L3 10.5l7 2.6L21 3z M21 3l-7.6 18-3.4-7.9" fill="none" stroke="white" strokeWidth={2} strokeLinejoin="round" /></svg>
        </span>
        <div>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 42, color: L.fg(), lineHeight: 1.1 }}>📊 היום שלך</div>
          <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 28, color: L.fg3(), marginTop: 4 }}>דוח עבודה · בטלגרם · <Num style={{ fontSize: 26 }}>20:00</Num></div>
        </div>
        <span style={{ flex: 1 }} />
        <Sample size={24} />
      </div>
      <Rule top={140} />
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 170, display: 'flex', gap: 18 }}>
        {TILES.map((t, i) => (
          <div key={t.t} style={{ flex: 1, padding: '22px 24px 20px', borderRadius: 24, background: L.blue(0.08 + 0.1 * hot(i)), border: `2px solid ${L.blue(0.25 + 0.6 * hot(i))}`, boxShadow: `0 0 ${36 * hot(i)}px ${L.blue(0.4 * hot(i))}`, ...rise(tile(i), 24) }}>
            <I n={t.icon} size={34} color={L.blue()} w={2.4} />
            <Num style={{ display: 'block', fontSize: 104, fontWeight: 700, lineHeight: 1, color: L.fg(), marginTop: 10 }}>{t.n}</Num>
            <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 34, color: L.fg2(), marginTop: 6 }}>{t.t}</div>
          </div>
        ))}
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 462, fontFamily: ASSIST, fontWeight: 700, fontSize: 30, color: L.fg3(), ...rise(tile(2)) }}>
        <Num style={{ fontSize: 28 }}>3</Num> מעוניינים · <Num style={{ fontSize: 28 }}>8</Num> לא ענו · הצעת מחיר אחת נשלחה
      </div>
      <Rule top={526} />
      <div dir="rtl" style={{ position: 'absolute', right: 44, top: 548, fontFamily: ASSIST, fontWeight: 800, fontSize: 30, color: L.blue(), ...rise(tip, 10) }}>טיפים</div>
      <div dir="rtl" style={{ position: 'absolute', right: 44, left: 44, top: 592, fontFamily: ASSIST, fontWeight: 700, fontSize: 36, lineHeight: 1.35, color: L.fg(), ...rise(tip) }}>
        <span style={mark(tipMark)}>• מחר בבוקר: לחזור קודם ל־<Num style={{ fontWeight: 700 }}>8</Num> שלא ענו היום.</span>
      </div>
      <div style={{ position: 'absolute', right: 44, left: 44, bottom: 34, height: 64, borderRadius: 16, background: TG.btn(), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: 28, color: L.fg(), ...rise(tip, 8) }}>לדוח המלא</div>
    </Panel>
  );
};

// ---------------------------------------------------------------------------------------------
// The phone: one continuous scene. Today → the Telegram reminder → the call's outcome → the message → WhatsApp.
const PHONE_W = 600;
const PHONE_TOP = 492;
const PhoneStatus: React.FC<{ time: string; tint?: string }> = ({ time, tint }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', color: L.fg(0.95), background: tint }}>
    <Num style={{ fontWeight: 700, fontSize: 16 }}>{time}</Num>
    <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {[6, 9, 12, 15].map((hgt, i) => <span key={i} style={{ width: 4, height: hgt, borderRadius: 1, background: L.fg(0.9) }} />)}
      <span style={{ width: 26, height: 12, marginLeft: 6, borderRadius: 4, border: `1.5px solid ${L.fg(0.8)}`, padding: 1.5, boxSizing: 'border-box' }}>
        <span style={{ display: 'block', width: '70%', height: '100%', borderRadius: 2, background: L.fg(0.9) }} />
      </span>
    </span>
  </div>
);
const TodayRow: React.FC<{ name: string; what: string; tone: Tone; top: number; p: number; hot?: number }> = ({ name, what, tone, top, p, hot = 0 }) => (
  <div dir="rtl" style={{ position: 'absolute', left: 14, right: 14, top, height: 84, borderRadius: 16, background: tone(0.08 + 0.12 * hot), border: `1.5px solid ${tone(0.3 + 0.55 * hot)}`, boxShadow: `0 0 ${26 * hot}px ${tone(0.45 * hot)}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, opacity: p, transform: `translateY(${(1 - p) * 14}px) scale(${1 + 0.03 * hot})` }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 23, color: L.fg(), whiteSpace: 'nowrap' }}>{name}</div>
      <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 18.5, color: tone(), marginTop: 2 }}>{what}</div>
    </div>
    <span style={{ width: 44, height: 44, borderRadius: 99, background: tone(0.18), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <I n="phone" size={22} color={tone()} />
    </span>
  </div>
);
const TodayScreen: React.FC<{ f: number }> = ({ f }) => {
  const row = (i: number) => seg(f, START.today - 8 + i * 5, START.today + 4 + i * 5, out);
  const hot = win(f, at('today', 'דנה') - 3, at('today', 'ובעשר') + 10, 5);
  const ten = f >= at('today', 'ובעשר') + 2;
  return (
    <div style={{ position: 'absolute', inset: 0, background: L.bg() }}>
      <PhoneStatus time={ten ? '10:00' : '08:00'} />
      <div dir="rtl" style={{ position: 'absolute', right: 20, left: 20, top: 62, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 34, color: L.fg() }}>היום</span>
        <span style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 17, color: L.fg3() }}>יום שלישי</span>
        <span style={{ flex: 1 }} />
        <Sample size={13} />
      </div>
      <div dir="rtl" style={{ position: 'absolute', left: 14, right: 14, top: 118, height: 74, borderRadius: 16, background: L.card(), border: `1.5px solid ${L.line()}`, padding: '12px 16px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 16, color: L.fg3() }}>שיחות היום מול היעד</span>
          <span style={{ flex: 1 }} />
          <Num style={{ fontSize: 19, fontWeight: 700, color: L.fg() }}>0 / 20</Num>
        </div>
        <div style={{ marginTop: 10, height: 8, borderRadius: 99, background: L.line(0.7) }}>
          <div style={{ width: '4%', height: '100%', borderRadius: 99, background: L.mint() }} />
        </div>
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 20, top: 208, fontFamily: ASSIST, fontWeight: 800, fontSize: 16, color: L.amber(), opacity: row(0) }}>באיחור · 1</div>
      <TodayRow name="קפה הנמל" what="שיחה חוזרת · אתמול" tone={L.amber} top={234} p={row(0)} />
      <div dir="rtl" style={{ position: 'absolute', right: 20, top: 334, fontFamily: ASSIST, fontWeight: 800, fontSize: 16, color: L.mint(), opacity: row(1) }}>היום · 2</div>
      <TodayRow name="סטודיו שיער דנה" what="שיחה חוזרת · 10:00" tone={L.mint} top={360} p={row(1)} hot={hot} />
      <TodayRow name="מאפיית השוק" what="פגישה · 14:00" tone={L.fg3} top={454} p={row(2)} />
    </div>
  );
};
const TelegramScreen: React.FC<{ f: number }> = ({ f }) => {
  const msg = seg(f, at('today', 'בטלגרם') - 2, at('today', 'בטלגרם') + 10, out);
  const opener = win(f, at('today', 'להגיד') - 8, P_TG_OUT, 6);
  const press = blip(f, P_TG_OUT - 12, 3, P_TG_OUT - 2);
  const head = (t: string) => <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 15, color: L.blue(), marginTop: 10 }}>{t}</div>;
  return (
    <div style={{ position: 'absolute', inset: 0, background: TG.bg() }}>
      <PhoneStatus time="10:00" />
      <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: 50, height: 62, background: TG.head(), display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
        <I n="back" size={22} color={L.blue()} style={{ transform: 'scaleX(-1)' }} />
        <span style={{ width: 40, height: 40, borderRadius: 99, background: L.mint(0.22), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <I n="bell" size={22} color={L.mint()} />
        </span>
        <div>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 18, color: L.fg() }}>תזכורות</div>
          <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 12, color: L.fg3() }}>בוט</div>
        </div>
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 12, left: 22, top: 126, opacity: msg, transform: `translateY(${(1 - msg) * 26}px) scale(${0.96 + 0.04 * msg})`, transformOrigin: '100% 0%' }}>
        <div style={{ borderRadius: '18px 4px 18px 18px', background: TG.bubble(), padding: '14px 16px 10px', boxShadow: '0 8px 24px rgba(0,0,0,.35)' }}>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 22, color: L.fg(), lineHeight: 1.3 }}>הגיע הזמן להתקשר לסטודיו שיער דנה</div>
          {head('פעילות אחרונה')}
          <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 17, color: L.fg2(), lineHeight: 1.4 }}>מייל פתיחה נשלח · עוד אין תשובה</div>
          {head('משפט פתיחה')}
          <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 21, color: L.fg(), lineHeight: 1.4, marginTop: 2, padding: '2px 4px', ...mark(opener) }}>״שלום דנה, רציתי לחזור אליך בקשר לסטודיו שיער דנה. זה זמן טוב לדבר?״</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Sample size={11} />
            <Num style={{ fontSize: 11, color: L.fg3() }}>10:00</Num>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 6 }}>
          {['✅ בוצע', '⏰ עוד שעה', '⏰ מחר ב-10:00', 'פתיחה ב-CRM'].map((t, i) => (
            <div key={t} style={{ height: 40, borderRadius: 10, background: i === 3 ? TG.btn(0.95 + 0.05 * press) : TG.btn(0.95), border: i === 3 ? `1.5px solid ${L.blue(0.3 + 0.6 * press)}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ASSIST, fontWeight: 700, fontSize: 14.5, color: L.fg(), transform: i === 3 ? `scale(${1 - 0.06 * press})` : undefined }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
/** The phone's screens, in order (frame each one takes over). */
const P_TG_IN = at('today', 'בטלגרם') - 8;
const P_TG_OUT = START.message - 22; // after the reading pause the call happens: "פתיחה ב-CRM"
const P_SEND = at('message', 'שולחים') - 2;
const P_WA = at('message', 'ישר') + 4;
const OutcomeScreen: React.FC<{ f: number }> = ({ f }) => {
  const note = 'מתעניינת בערכת הצבע וביום הדרכה לצוות';
  const typed = seg(f, P_TG_OUT + 8, START.message - 2, (t) => t);
  const pick = (i: number) => (i === 0 ? seg(f, at('message', 'ענתה') - 2, at('message', 'ענתה') + 4, out) : i === 2 ? seg(f, at('message', 'ומעוניינת') - 2, at('message', 'ומעוניינת') + 4, out) : 0);
  const save = blip(f, P_SEND - 8, 3, P_SEND);
  return (
    <div style={{ position: 'absolute', inset: 0, background: L.bg() }}>
      <PhoneStatus time="10:06" />
      <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: 54, height: 72, display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', borderBottom: `1px solid ${L.line()}` }}>
        <I n="back" size={22} color={L.fg2()} style={{ transform: 'scaleX(-1)' }} />
        <div>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 21, color: L.fg() }}>סטודיו שיער דנה</div>
          <Num style={{ fontSize: 14, color: L.fg3() }}>052-1112222</Num>
        </div>
        <span style={{ flex: 1 }} />
        <Sample size={12} />
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 18, left: 18, top: 142, display: 'flex', alignItems: 'center', gap: 8, fontFamily: ASSIST, fontWeight: 700, fontSize: 16, color: L.fg3() }}>
        <I n="phone" size={18} color={L.fg3()} /> השיחה הסתיימה · <Num style={{ fontSize: 15 }}>03:12</Num>
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 18, left: 18, top: 176, fontFamily: ASSIST, fontWeight: 800, fontSize: 26, color: L.fg() }}>איך הייתה השיחה?</div>
      <div dir="rtl" style={{ position: 'absolute', right: 18, left: 18, top: 222, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {['ענה', 'לא ענה', 'מעוניין', 'לא מעוניין'].map((t, i) => {
          const on = pick(i);
          return (
            <div key={t} style={{ height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: ASSIST, fontWeight: 800, fontSize: 21, background: on > 0.5 ? L.mint() : L.card(), color: on > 0.5 ? L.mintInk() : L.fg2(), border: `1.5px solid ${on > 0.5 ? L.mint() : L.line()}`, transform: `scale(${1 + 0.06 * blip(f, i === 0 ? at('message', 'ענתה') : at('message', 'ומעוניינת'), 3, (i === 0 ? at('message', 'ענתה') : at('message', 'ומעוניינת')) + 10) * (i === 0 || i === 2 ? 1 : 0)})` }}>
              {on > 0.5 && <I n="check" size={20} color={L.mintInk()} w={3} />}
              {t}
            </div>
          );
        })}
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 18, left: 18, top: 362, fontFamily: ASSIST, fontWeight: 700, fontSize: 15, color: L.fg3() }}>הערות</div>
      <div dir="rtl" style={{ position: 'absolute', right: 18, left: 18, top: 388, minHeight: 74, boxSizing: 'border-box', borderRadius: 14, background: L.card(), border: `1.5px solid ${L.line()}`, padding: '12px 14px', fontFamily: ASSIST, fontWeight: 600, fontSize: 19, lineHeight: 1.4, color: L.fg() }}>
        {note.slice(0, Math.round(note.length * typed))}
        {typed > 0 && typed < 1 && <span style={{ display: 'inline-block', width: 2, height: 20, marginRight: 3, background: L.mint(), verticalAlign: 'middle' }} />}
      </div>
      <div dir="rtl" style={{ position: 'absolute', right: 18, left: 18, top: 482, height: 60, borderRadius: 99, background: L.mint(), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: 22, color: L.mintInk(), transform: `scale(${1 - 0.05 * save})` }}>שמירת השיחה</div>
    </div>
  );
};
const SendSheet: React.FC<{ f: number }> = ({ f }) => {
  const up = seg(f, P_SEND, P_SEND + 10, out);
  const wa = seg(f, at('message', 'בוואטסאפ') - 3, at('message', 'בוואטסאפ') + 3, out);
  const press = blip(f, P_WA - 7, 3, P_WA);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.5 * up})` }} />
      <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: 118 + (1 - up) * 700, bottom: 0, borderRadius: '26px 26px 0 0', background: L.card(), borderTop: `1.5px solid ${L.line()}`, padding: '22px 18px' }}>
        <div style={{ width: 44, height: 5, borderRadius: 9, background: L.line(), margin: '0 auto 16px' }} />
        <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 23, color: L.fg() }}>שליחת הודעה אל סטודיו שיער דנה</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, padding: 5, borderRadius: 14, background: L.bg() }}>
          {['וואטסאפ', 'מייל'].map((t, i) => {
            const on = i === 0 ? wa : 0;
            return (
              <div key={t} style={{ flex: 1, height: 48, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: ASSIST, fontWeight: 800, fontSize: 20, background: on > 0.5 ? WA.green() : 'transparent', color: on > 0.5 ? L.mintInk() : L.fg2() }}>
                <I n={i === 0 ? 'chat' : 'mail'} size={20} color={on > 0.5 ? L.mintInk() : L.fg2()} />
                {t}
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 15, color: L.fg3(), marginTop: 18 }}>מה לשלוח</div>
        <div style={{ marginTop: 8, borderRadius: 16, background: L.bg2(), border: `1.5px solid ${L.line()}`, padding: '14px 16px', fontFamily: ASSIST, fontWeight: 600, fontSize: 19.5, lineHeight: 1.45, color: L.fg() }}>
          היי דנה, תודה על השיחה! שולח לך את הפרטים על ערכת הצבע ויום ההדרכה לצוות. נקבע פגישה לחמישי?
        </div>
        <div style={{ marginTop: 18, height: 62, borderRadius: 99, background: WA.green(), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: ASSIST, fontWeight: 800, fontSize: 22, color: L.mintInk(), opacity: 0.4 + 0.6 * wa, transform: `scale(${1 - 0.05 * press})` }}>
          <I n="chat" size={22} color={L.mintInk()} w={2.4} /> שליחה בוואטסאפ
        </div>
      </div>
    </div>
  );
};
const WhatsAppScreen: React.FC<{ f: number }> = ({ f }) => {
  const bub = seg(f, P_WA + 6, P_WA + 16, Easing.out(Easing.back(1.4)));
  const ticks = seg(f, P_WA + 18, P_WA + 22, out);
  return (
    <div style={{ position: 'absolute', inset: 0, background: WA.bg() }}>
      <PhoneStatus time="10:07" tint={WA.head()} />
      <div dir="rtl" style={{ position: 'absolute', left: 0, right: 0, top: 54, height: 66, background: WA.head(), display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
        <I n="back" size={22} color={L.fg()} style={{ transform: 'scaleX(-1)' }} />
        <span style={{ width: 42, height: 42, borderRadius: 99, background: L.mint(), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: 20, color: L.mintInk() }}>ד</span>
        <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 20, color: L.fg() }}>סטודיו שיער דנה</div>
      </div>
      <div style={{ position: 'absolute', inset: '120px 0 0 0', backgroundImage: `radial-gradient(${L.fg(0.05)} 1.5px, transparent 1.5px)`, backgroundSize: '22px 22px' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 140, display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 14, color: L.fg2(), background: L.fg(0.08), padding: '4px 14px', borderRadius: 8 }}>היום</span>
      </div>
      <div dir="rtl" style={{ position: 'absolute', left: 14, width: 300, top: 186, boxSizing: 'border-box', borderRadius: '6px 18px 18px 18px', background: WA.out(), padding: '12px 14px 8px', boxShadow: '0 6px 18px rgba(0,0,0,.3)', opacity: bub, transform: `translateY(${(1 - bub) * 40}px) scale(${0.9 + 0.1 * bub})`, transformOrigin: '0% 0%' }}>
        <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 19.5, lineHeight: 1.45, color: L.fg() }}>היי דנה, תודה על השיחה! שולח לך את הפרטים על ערכת הצבע ויום ההדרכה לצוות. נקבע פגישה לחמישי?</div>
        <div dir="ltr" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Num style={{ fontSize: 12, color: L.fg2() }}>10:07</Num>
          <svg viewBox="0 0 24 14" width={20} height={12} style={{ opacity: ticks }}><path d="M1 7.5l4 4 8-9 M9 11.5l1 0 8-9" fill="none" stroke={WA.tick()} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div>
  );
};
const PhoneScene: React.FC<{ f: number }> = ({ f }) => {
  const k = spanK(f, P_PHONE);
  if (k <= 0.001) return null;
  const banner = win(f, at('today', 'מגיעה') - 2, P_TG_IN + 2, 5);
  const bannerIn = seg(f, at('today', 'מגיעה') - 2, at('today', 'מגיעה') + 8, out);
  const tg = seg(f, P_TG_IN, P_TG_IN + 8);
  const oc = seg(f, P_TG_OUT, P_TG_OUT + 8);
  const wa = seg(f, P_WA, P_WA + 8);
  const glow = f >= P_WA ? WA.green : f >= P_TG_OUT ? L.mint : f >= P_TG_IN ? L.blue : L.mint;
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - k) * 1100}px)`, opacity: Math.min(1, k * 2) }}>
      <Phone cx={540} top={PHONE_TOP} w={PHONE_W} tilt="none" glow={glow}>
        {tg < 1 && <TodayScreen f={f} />}
        {tg > 0 && oc < 1 && <div style={{ position: 'absolute', inset: 0, opacity: tg }}><TelegramScreen f={f} /></div>}
        {oc > 0 && wa < 1 && (
          <div style={{ position: 'absolute', inset: 0, opacity: oc, transform: `translateX(${(1 - oc) * -40}px)` }}>
            <OutcomeScreen f={f} />
            {f >= P_SEND && <SendSheet f={f} />}
          </div>
        )}
        {wa > 0 && <div style={{ position: 'absolute', inset: 0, opacity: wa }}><WhatsAppScreen f={f} /></div>}
        {banner > 0 && (
          <div dir="rtl" style={{ position: 'absolute', left: 10, right: 10, top: 10 + (1 - bannerIn) * -90, height: 78, borderRadius: 20, background: ok(26, 0.02, 250)(0.97), boxShadow: '0 12px 30px rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', opacity: banner }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: L.blue(), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width={24} height={24}><path d="M21 3L3 10.5l7 2.6L21 3z M21 3l-7.6 18-3.4-7.9" fill="none" stroke="white" strokeWidth={2} strokeLinejoin="round" /></svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 15, color: L.fg() }}>תזכורות · עכשיו</div>
              <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 15, color: L.fg2(), whiteSpace: 'nowrap' }}>הגיע הזמן להתקשר לסטודיו שיער דנה</div>
            </div>
          </div>
        )}
      </Phone>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Flat text: step titles, the hook question, the win headline, captions, the "opening soon" tag.
type Title = { a: number; b: number; n: number; title: string; sub: string; tone?: Tone };
const TITLES: Title[] = [
  { a: P_LAB.open[0], b: P_LAB.shut[0], n: 1, title: 'מעבדת מכירות', sub: 'תרגול לפני השיחה' },
  { a: P_EMAIL.open[0], b: P_EMAIL.shut[0], n: 2, title: 'מייל פתיחה', sub: 'נכתב לפי פרטי העסק', tone: L.blue },
  { a: P_PHONE.open[0], b: at('today', 'מגיעה') - 2, n: 3, title: 'היום', sub: 'למי חוזרים, ומתי' },
  { a: at('today', 'מגיעה') - 2, b: P_TG_OUT, n: 4, title: 'תזכורת בטלגרם', sub: 'עם משפט פתיחה', tone: L.blue },
  { a: P_TG_OUT, b: P_PHONE.shut[0], n: 5, title: 'שליחת הודעה', sub: 'אחרי השיחה, בוואטסאפ או במייל' },
  { a: P_PREP.open[0], b: P_PREP.shut[0], n: 6, title: 'הכנה לפגישה', sub: 'שאלות ותוכנית' },
  { a: P_REPORT.open[0], b: P_REPORT.shut[0], n: 7, title: 'דוח עבודה', sub: 'כל יום בטלגרם', tone: L.blue },
];
const StepTitle: React.FC<{ f: number }> = ({ f }) => {
  return (
    <>
      {TITLES.map((s, i) => {
        if (f < s.a - 2 || f > s.b + 12) return null;
        const prev = TITLES[i - 1];
        const next = TITLES[i + 1];
        const swapIn = prev && prev.b === s.a; // a title that replaces the last one inside the same scene
        const swapOut = next && next.a === s.b;
        const p = seg(f, s.a + (swapIn ? 0 : 2), s.a + (swapIn ? 12 : 22), out);
        const q = seg(f, s.b, s.b + (swapOut ? 6 : 12));
        const o = Math.min(1, p * 1.4) * (1 - q);
        if (o <= 0.01) return null;
        const tone = s.tone ?? L.mint;
        const bar = swapIn ? 1 : Math.min(1, p * 1.8);
        return (
          <div key={s.n} dir="rtl" style={{ position: 'absolute', right: 80, top: 236, display: 'flex', gap: 26, opacity: swapOut || swapIn ? 1 : 1 }}>
            <div style={{ width: 7, borderRadius: 4, background: tone(), boxShadow: `0 0 26px ${tone(0.85)}`, transformOrigin: '50% 0%', transform: `scaleY(${bar * (swapOut ? 1 : 1 - q)})`, opacity: swapIn || swapOut ? o : 1 }} />
            <div style={{ opacity: o, transform: `translateX(${(1 - p) * 40}px)`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>
              <div dir="ltr" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'baseline', fontFamily: MONO, fontWeight: 500, fontSize: 28, color: tone() }}>
                <span>0{s.n}</span>
                <span style={{ color: L.fg3() }}>/</span>
                <span style={{ color: L.fg3() }}>07</span>
              </div>
              <div style={{ fontFamily: KARANTINA, fontWeight: 700, fontSize: 140, lineHeight: 0.88, marginTop: 6, color: L.fg(), textShadow: `0 0 44px ${tone(0.4)}, 0 4px 20px rgba(0,0,0,.6)` }}>{s.title}</div>
              <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 34, marginTop: 10, color: L.fg2(), textShadow: '0 2px 12px rgba(0,0,0,.8)' }}>{s.sub}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};
const Spoken: React.FC<{ id: Id; top?: number; size?: number; scrim?: boolean }> = ({ id, top = 1452, size = 50, scrim = true }) => {
  const f = useCurrentFrame();
  const a = START[id] - 8;
  const b = lineEnd(id) + 14;
  if (f < a - 8 || f > b + 10) return null;
  const o = seg(f, a - 8, a) * (1 - seg(f, b, b + 10));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      {scrim && <div style={{ position: 'absolute', left: 0, right: 0, top: top - 90, height: 330, background: 'linear-gradient(to bottom, transparent, rgba(6,9,8,.7) 38%, rgba(6,9,8,.7) 62%, transparent)' }} />}
      <div dir="rtl" style={{ position: 'absolute', left: 80, right: 80, top, textAlign: 'center', fontFamily: ASSIST, fontWeight: 700, fontSize: size, lineHeight: 1.24, color: L.fg(), textShadow: '0 2px 16px rgba(0,0,0,.9)', textWrap: 'balance' } as React.CSSProperties}>
        {LINES[id].words.map((w, i) => {
          const t = START[id] + Math.round(w.startSec * FPS);
          const p = seg(f, t - 3, t + 6, out);
          return (
            <React.Fragment key={i}>
              <span style={{ display: 'inline-block', opacity: 0.14 + 0.86 * p, transform: `translateY(${(1 - p) * 10}px)` }}>{w.word}</span>{' '}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
/** The hook: the whole question big from frame 1 (playbook #2); each word lights up as it is said. */
const HookLines: React.FC<{ f: number }> = ({ f }) => {
  const LS = [['איך', 'דנה', 'הפכה'], ['מעסק', 'שמצאתם', 'על', 'המפה'], ['ללקוחה', 'שלכם?']];
  const words = LINES.hook.words;
  let k = 0;
  const o = 1 - seg(f, P_LAB.open[0] - 4, P_LAB.open[0] + 6);
  if (o <= 0) return null;
  return (
    <div dir="rtl" style={{ position: 'absolute', left: 40, right: 40, top: 232, textAlign: 'center', fontFamily: KARANTINA, fontWeight: 700, fontSize: 132, lineHeight: 0.94, color: L.fg(), opacity: o, textShadow: `0 0 60px ${L.mint(0.3)}, 0 4px 24px rgba(0,0,0,.75)` }}>
      {LS.map((ws, li) => (
        <div key={li}>
          {ws.map((w) => {
            const wd = words[k];
            k++;
            const t = START.hook + Math.round((wd?.startSec ?? 0) * FPS);
            const said = seg(f, t - 2, t + 4, out);
            const hot = blip(f, t - 2, 3, t + 14);
            return <span key={w + k} style={{ display: 'inline-block', color: hot > 0.05 ? L.mint() : undefined, opacity: 0.5 + 0.5 * said, transform: `translateY(${-6 * hot}px)` }}>{w}&nbsp;</span>;
          })}
        </div>
      ))}
    </div>
  );
};
const BigLines: React.FC<{ lines: string[][]; a: number; top?: number; size?: number; step?: number }> = ({ lines, a, top = 226, size = 140, step = 4 }) => {
  const f = useCurrentFrame();
  let k = 0;
  return (
    <div dir="rtl" style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: KARANTINA, fontWeight: 700, fontSize: size, lineHeight: 0.92, color: L.fg(), textShadow: `0 0 60px ${L.mint(0.3)}, 0 4px 24px rgba(0,0,0,.7)` }}>
      {lines.map((ws, li) => (
        <div key={li}>
          {ws.map((w) => {
            const p = seg(f, a + k * step, a + 14 + k * step, out);
            k++;
            return <span key={w + k} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 34}px)`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>{w}&nbsp;</span>;
          })}
        </div>
      ))}
    </div>
  );
};
/** The rewind: tape lines and a ⏪ sign while the card flies back to the map. */
const RewindFx: React.FC<{ f: number }> = ({ f }) => {
  const o = win(f, REW.back[0] + 1, REW.down[1] - 2, 4);
  if (o <= 0) return null;
  const jitter = Math.sin(f * 7.3) * 6;
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `repeating-linear-gradient(to bottom, ${L.fg(0.07)} 0 2px, transparent 2px 7px)`, transform: `translateY(${jitter}px)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1180 + jitter * 0.5, height: 26, background: L.fg(0.12), filter: 'blur(3px)' }} />
      <div style={{ position: 'absolute', left: 540 - 60, top: 1240, width: 120, height: 120, borderRadius: 99, background: L.bg(0.55), border: `2px solid ${L.fg(0.4)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" width={60} height={60}><path d="M11 6L3 12l8 6z M21 6l-8 6 8 6z" fill={L.fg(0.95)} /></svg>
      </div>
    </AbsoluteFill>
  );
};
const SoonPill: React.FC<{ t: number; size?: number; early?: boolean }> = ({ t, size = 30, early }) => {
  const pulse = 0.5 + 0.5 * Math.sin(t / 9);
  const dot = Math.round(size * 0.42);
  return (
    <div dir="rtl" style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.45), padding: `${Math.round(size * 0.36)}px ${Math.round(size * 0.8)}px`, borderRadius: 99, background: L.bg(0.78), border: `1.5px solid ${L.amber(0.6)}`, boxShadow: `0 10px 30px rgba(0,0,0,.45), 0 0 26px ${L.amber(0.14)}`, fontFamily: ASSIST, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: L.fg(), whiteSpace: 'nowrap' }}>
      <span style={{ width: dot, height: dot, borderRadius: '50%', flex: 'none', background: L.amber(), boxShadow: `0 0 ${8 + 10 * pulse}px ${L.amber(0.55 + 0.35 * pulse)}` }} />
      <span>נפתח בקרוב</span>
      {early && <span style={{ color: L.fg3() }}>·</span>}
      {early && <span style={{ color: L.fg2(), fontWeight: 600 }}>הרשמה מוקדמת</span>}
    </div>
  );
};
const SoonTag: React.FC<{ f: number }> = ({ f }) => {
  const p = seg(f, 120, 138, out);
  const o = p * (1 - seg(f, START.close - 16, START.close - 2));
  if (o <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 146, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - p) * -14}px)` }}>
      <SoonPill t={f} size={34} early />
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// End card: the name for the first time, what it is, "opening soon", one action, the last line.
const EndCard: React.FC<{ f: number }> = ({ f }) => {
  const a = START.close;
  const bg = seg(f, a - 14, a + 4);
  const t1 = seg(f, a - 2, a + 16, out);
  const t2 = seg(f, a + 8, a + 24, out);
  const t3 = seg(f, a + 16, a + 32, Easing.out(Easing.back(1.6)));
  const tSoon = seg(f, a + 4, a + 20, out);
  if (bg <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: L.bg() }} />
      <AbsoluteFill style={{ background: `radial-gradient(1000px 1100px at 50% 820px, ${L.mint(0.16)}, transparent 70%)` }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: t1 }}>
        <path d="M300 760 C 420 760, 430 640, 540 640 S 660 520, 780 520" fill="none" stroke={L.mint(0.9)} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${t1} 1`} />
        <circle cx={300} cy={760} r={16} fill={L.mint()} />
        <circle cx={780} cy={520} r={22 * t1} fill={L.mint()} stroke={L.bg()} strokeWidth={4} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 840, display: 'flex', justifyContent: 'center', opacity: tSoon, transform: `translateY(${(1 - tSoon) * 18}px)` }}>
        <SoonPill t={f} size={38} />
      </div>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 930, textAlign: 'center' }}>
        <div dir="ltr" style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 190, lineHeight: 1, letterSpacing: -4, color: L.fg(), textShadow: `0 0 60px ${L.mint(0.3)}`, opacity: t1, transform: `translateY(${(1 - t1) * 40}px)`, filter: t1 < 1 ? `blur(${(1 - t1) * 12}px)` : undefined }}>LeadFlow</div>
        <div dir="rtl" style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 40, color: L.fg2(), marginTop: 14, opacity: t2, transform: `translateY(${(1 - t2) * 20}px)` }}>ה־CRM שמוצא לכם לקוחות חדשים</div>
        <div dir="rtl" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginTop: 56, padding: '24px 46px', borderRadius: 99, background: L.mint(), boxShadow: `0 0 ${60 + 20 * Math.sin(f / 8)}px ${L.mint(0.45)}, inset 0 2px 0 rgba(255,255,255,.45)`, fontFamily: ASSIST, fontWeight: 800, fontSize: 42, color: L.mintInk(), opacity: Math.min(1, t3 * 1.5), transform: `scale(${0.8 + 0.2 * t3})` }}>
          <I n="chat" size={42} color={L.mintInk()} w={2.4} />
          לבקש גישה מוקדמת בוואטסאפ
        </div>
      </div>
      <Spoken id="close" top={1400} size={42} scrim={false} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Sound: the bed sits low under the voice and comes up between lines, in the rewind and on the win.
const LINE_SPANS = ORDER.map((id) => [START[id], lineEnd(id)] as const);
const bedVolume = (f: number) => {
  const near = LINE_SPANS.some(([s, e]) => f >= s - 6 && f <= e + 4);
  const base = near ? 0.14 : 0.3;
  return base * (1 - seg(f, LF_TOTAL - 40, LF_TOTAL, (t) => t));
};
const Bed: React.FC = () => (
  <Audio src={staticFile('leadflow/bed.mp3')} volume={(f) => {
    let s = 0;
    for (let k = -6; k <= 6; k++) s += bedVolume(Math.max(0, f + k));
    return s / 13;
  }} />
);

// ---------------------------------------------------------------------------------------------
export const LeadFlowFilm: React.FC<{ bgm?: boolean }> = ({ bgm = true }) => {
  const f = useCurrentFrame();
  const c = cam(f);
  const dim = dimK(f);
  const winA = PROJECT[1] + 18;
  return (
    <AbsoluteFill style={{ background: L.bg() }}>
      <Backdrop f={f} c={c} />
      <Stage c={c}>
        <MapFloor f={f} />
      </Stage>
      <FlatUnder f={f} c={c} />
      <Stage c={c}>
        <World f={f} />
      </Stage>
      <FlatTop f={f} c={c} />
      <AbsoluteFill style={{ background: 'radial-gradient(140% 95% at 50% 46%, transparent 56%, rgba(0,0,0,.6))', pointerEvents: 'none' }} />
      {dim > 0.001 && <AbsoluteFill style={{ background: `rgba(5,8,7,${0.7 * dim})` }} />}
      <LabPanel f={f} />
      <EmailPanel f={f} />
      <PhoneScene f={f} />
      <PrepPanel f={f} />
      <ReportPanel f={f} />
      <RewindFx f={f} />
      <HookLines f={f} />
      <StepTitle f={f} />
      {(['lab', 'email', 'prep', 'report', 'won'] as Id[]).map((id) => <Spoken key={id} id={id} />)}
      {(['today', 'message'] as Id[]).map((id) => <Spoken key={id} id={id} top={1478} />)}
      <AbsoluteFill style={{ opacity: 1 - seg(f, START.close - 16, START.close - 4) }}>
        {f >= winA && <BigLines lines={[['מנקודה', 'על', 'המפה'], ['ללקוחה,', 'בלוח', 'אחד.']]} a={winA} />}
      </AbsoluteFill>
      <EndCard f={f} />
      <SoonTag f={f} />
      {ORDER.map((id) => (
        <Sequence key={id} from={START[id]} durationInFrames={dur(id) + 2}>
          <Audio src={staticFile(`leadflow/vo-${id}.mp3`)} />
        </Sequence>
      ))}
      {bgm ? <Bed /> : null}
    </AbsoluteFill>
  );
};
