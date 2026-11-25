// Pieces for the AI receptionist reel (9:16, 1080x1920).
// Look = the receptionist app's own colours (portal.css): night green ground, green = she answered,
// coral = missed / waiting for a call back, amber = her rules. Karantina headlines (the app's display face),
// Assistant for Hebrew text (the owner turned down IBM Plex Sans Hebrew), JetBrains Mono for digits only.
// Depth: a lit core, glass cards with HUD corners, a floor grid, dust. Sample names and numbers are made up
// and marked "לדוגמה".
import React, { useId } from 'react';
import { AbsoluteFill } from 'remotion';
import { loadFont as loadKarantina } from '@remotion/google-fonts/Karantina';
import { loadFont as loadAssistant } from '@remotion/google-fonts/Assistant';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

export const KARANTINA = loadKarantina('normal', { weights: ['700'], subsets: ['hebrew', 'latin'] }).fontFamily;
export const ASSIST = loadAssistant('normal', { weights: ['400', '600', '700', '800'], subsets: ['hebrew', 'latin'] }).fontFamily;
export const MONO = loadMono('normal', { weights: ['400', '500', '700'], subsets: ['latin'] }).fontFamily;

export const W = 1080;
export const H = 1920;

export type Tone = (a?: number) => string;
const ok = (l: number, c: number, h: number): Tone => (a = 1) => `oklch(${l}% ${c} ${h} / ${a})`;
export const C = {
  bg: ok(13.5, 0.026, 172),
  bg2: ok(19, 0.034, 172),
  fg: ok(96.5, 0.012, 160),
  fg2: ok(82, 0.024, 165),
  fg3: ok(64, 0.03, 167),
  green: ok(85, 0.19, 148),
  greenDeep: ok(52, 0.15, 151),
  coral: ok(69, 0.19, 30),
  amber: ok(83, 0.13, 82),
};

/** Seeded random, so every render draws the same dust. */
export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const useSvgId = () => useId().replace(/[^a-zA-Z0-9]/g, '');

// ---------------------------------------------------------------------------------------------
// Ground: night, a coloured haze behind the subject, a floor grid running to a horizon, dust, vignette.
export const Ground: React.FC<{ tint?: Tone; focusY?: number; horizon?: number; seed?: number; t?: number; children?: React.ReactNode }> = ({
  tint = C.green, focusY = 900, horizon = 1240, seed = 7, t = 0, children,
}) => {
  const r = rng(seed);
  const dust = Array.from({ length: 110 }, () => ({ x: r() * W, y: r() * H, s: 1.2 + r() * 3.4, o: 0.1 + r() * 0.45, b: r() < 0.3 }));
  const mask = `linear-gradient(to bottom, transparent 0%, black 18%, black 55%, transparent 100%)`;
  return (
    <AbsoluteFill style={{ background: C.bg(), overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(1000px 1150px at 50% ${focusY}px, ${tint(0.17)}, transparent 70%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, transparent ${horizon - 260}px, ${C.bg2(0.9)} ${horizon}px, ${C.bg()} 100%)` }} />
      <div
        style={{
          position: 'absolute', left: -1460, width: 4000, top: horizon, height: 1700,
          transformOrigin: '50% 0%', transform: 'perspective(620px) rotateX(72deg)',
          backgroundImage: `linear-gradient(${C.fg(0.1)} 2px, transparent 2px), linear-gradient(90deg, ${C.fg(0.1)} 2px, transparent 2px)`,
          backgroundSize: '110px 110px', WebkitMaskImage: mask, maskImage: mask,
        }}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, top: horizon - 1, height: 2, background: `linear-gradient(90deg, transparent, ${tint(0.5)}, transparent)`, filter: 'blur(1px)' }} />
      {dust.map((d, i) => (
        <div key={i} style={{ position: 'absolute', left: d.x + Math.sin(t / 50 + i) * 6, top: (((d.y - t * (0.35 + d.s * 0.12)) % H) + H) % H, width: d.s, height: d.s, borderRadius: '50%', background: C.fg(d.o), filter: d.b ? 'blur(2.5px)' : undefined }} />
      ))}
      {children}
      <AbsoluteFill style={{ background: 'radial-gradient(140% 95% at 50% 46%, transparent 56%, rgba(0,0,0,.6))', pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Icons (24x24 strokes, drawn here; no brand logos).
const ICONS = {
  chat: 'M4 5.5h16v10.5H10l-6 4.5z M8 9.5h8 M8 12.5h5',
  note: 'M6 3h9l3 3v15H6z M14.5 3v3.5H18 M9 11h6 M9 14.5h6 M9 18h3.5',
  cal: 'M4 6h16v14H4z M4 10.5h16 M8.5 3.5v4.5 M15.5 3.5v4.5 M8 14h3 M13 14h3 M8 17h3',
  shield: 'M12 3l8 3v6c0 5-3.6 8.2-8 9-4.4-.8-8-4-8-9V6z M8.8 12.2l2.2 2.2 4.4-4.6',
  missed: 'M18 6L8 16 M8 9.5V16h6.5',
  phone: 'M6.6 3.5h3l1.6 4.4-2 1.4a11.5 11.5 0 005.5 5.5l1.4-2 4.4 1.6v3a2 2 0 01-2.2 2A16.5 16.5 0 014.6 5.7a2 2 0 012-2.2z',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chip: 'M7.5 7.5h9v9h-9z M10 3.5v4 M14 3.5v4 M10 16.5v4 M14 16.5v4 M3.5 10h4 M3.5 14h4 M16.5 10h4 M16.5 14h4',
  siren: 'M7 18v-5.5a5 5 0 0110 0V18 M5 18h14v3H5z M12 2.5v2.5 M4.2 6l1.8 1.6 M19.8 6L18 7.6',
  shekel: 'M6 19V7h6a3 3 0 013 3v4 M18 5v12h-6a3 3 0 01-3-3v-4 M4 21L20 3',
  hangup: 'M3 14.5c5-5 13-5 18 0l-2.4 2.6-3.6-1.4v-2.6c-2-.8-4-.8-6 0v2.6l-3.6 1.4z',
  star: 'M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6L12 16.9l-5.4 2.9 1.1-6-4.5-4.2 6.1-.8z',
} as const;
export type IconName = keyof typeof ICONS;
export const Icon: React.FC<{ name: IconName; size: number; color: string; width?: number; style?: React.CSSProperties }> = ({ name, size, color, width = 1.8, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={ICONS[name]} />
  </svg>
);

// ---------------------------------------------------------------------------------------------
// The core: her voice as a lit sphere inside a ring of waveform bars, with HUD rings around it.
export const Core: React.FC<{ cx: number; cy: number; R: number; color?: Tone; seed?: number; calm?: boolean; t?: number; boost?: number; opacity?: number }> = ({
  cx, cy, R, color = C.green, seed = 3, calm, t = 0, boost = 0, opacity = 1,
}) => {
  const id = useSvgId();
  const S = R * 4.4;
  const c = S / 2;
  const r = rng(seed);
  const ph = [r() * 6.28 + t * 0.045, r() * 6.28 - t * 0.07, r() * 6.28 + t * 0.11];
  const bars = 132;
  const amp = (calm ? 0.45 : 1) * (0.82 + 0.18 * Math.sin(t * 0.19) * Math.sin(t * 0.07)) + boost * 0.5;
  const len = (i: number) => {
    const t = (i / bars) * Math.PI * 2;
    const v = 0.5 + 0.5 * (0.55 * Math.sin(3 * t + ph[0]) + 0.3 * Math.sin(7 * t + ph[1]) + 0.15 * Math.sin(13 * t + ph[2]));
    return R * (0.04 + 0.34 * amp * Math.pow(v, 1.7));
  };
  const at = (rad: number, a: number) => [c + rad * Math.cos(a), c + rad * Math.sin(a)];
  const wave = Array.from({ length: 81 }, (_, k) => {
    const u = k / 80;
    const x = c - R * 0.52 + u * R * 1.04;
    const env = Math.sin(Math.PI * u) * (0.55 + 0.45 * Math.sin(u * 11 + ph[1]));
    const y = c + R * 0.2 * amp * env * Math.sin(u * Math.PI * 2 * 4.5);
    return `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: 'absolute', left: cx - c, top: cy - c, overflow: 'visible', opacity, filter: boost > 0 ? `brightness(${1 + boost * 0.6})` : undefined }}>
      <defs>
        <radialGradient id={`${id}halo`}>
          <stop offset="0" stopColor={color(0.45)} />
          <stop offset="0.42" stopColor={color(0.1)} />
          <stop offset="1" stopColor={color(0)} />
        </radialGradient>
        <radialGradient id={`${id}orb`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="oklch(97% 0.06 150)" />
          <stop offset="0.2" stopColor={color(1)} />
          <stop offset="0.6" stopColor="oklch(46% 0.13 152)" />
          <stop offset="1" stopColor="oklch(20% 0.05 165)" />
        </radialGradient>
        <filter id={`${id}bloom`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={R * 0.04} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}soft`}>
          <feGaussianBlur stdDeviation={R * 0.05} />
        </filter>
      </defs>
      <circle cx={c} cy={c} r={c} fill={`url(#${id}halo)`} />
      <circle cx={c} cy={c} r={R * 1.78} fill="none" stroke={C.fg(0.16)} strokeWidth={2} strokeDasharray="3 13" transform={`rotate(${-t * 0.25} ${c} ${c})`} />
      <circle
        cx={c} cy={c} r={R * 1.5} fill="none" stroke={color(0.6)} strokeWidth={3.5}
        strokeDasharray={`${R * 1.5 * Math.PI * 1.25} ${R * 1.5 * Math.PI * 0.75}`} transform={`rotate(${-118 + t * 0.5} ${c} ${c})`} filter={`url(#${id}bloom)`}
      />
      {Array.from({ length: 96 }, (_, i) => {
        const a = (i / 96) * Math.PI * 2;
        const long = i % 8 === 0;
        const [x1, y1] = at(R * 1.3, a);
        const [x2, y2] = at(R * (long ? 1.41 : 1.36), a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={long ? color(0.8) : C.fg(0.3)} strokeWidth={long ? 3 : 2} />;
      })}
      <g filter={`url(#${id}bloom)`}>
        {Array.from({ length: bars }, (_, i) => {
          const a = (i / bars) * Math.PI * 2;
          const [x1, y1] = at(R * 0.86, a);
          const [x2, y2] = at(R * 0.86 + len(i), a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color(0.95)} strokeWidth={R * 0.024} strokeLinecap="round" />;
        })}
      </g>
      <circle cx={c} cy={c} r={R * 0.75} fill={`url(#${id}orb)`} />
      <circle cx={c} cy={c} r={R * 0.75} fill="none" stroke={color(0.75)} strokeWidth={2.5} />
      <ellipse cx={c - R * 0.24} cy={c - R * 0.36} rx={R * 0.3} ry={R * 0.13} fill="rgba(255,255,255,.32)" transform={`rotate(-28 ${c - R * 0.24} ${c - R * 0.36})`} filter={`url(#${id}soft)`} />
      <path d={wave} fill="none" stroke="oklch(99% 0.02 150 / .95)" strokeWidth={R * 0.03} strokeLinecap="round" filter={`url(#${id}bloom)`} />
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// A light beam between two points (a slight curve, a glow and a bright packet on it).
export const Beam: React.FC<{ from: [number, number]; to: [number, number]; color?: Tone; bend?: number; width?: number; dot?: number; draw?: number }> = ({
  from, to, color = C.green, bend = 0, width = 4, dot, draw = 1,
}) => {
  if (draw <= 0) return null;
  const id = useSvgId();
  const [x1, y1] = from;
  const [x2, y2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const qx = mx - (dy / L) * bend;
  const qy = my + (dx / L) * bend;
  const d = `M${x1} ${y1} Q${qx} ${qy} ${x2} ${y2}`;
  const pt = (t: number) => [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * qx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * qy + t * t * y2];
  const [px, py] = dot !== undefined ? pt(dot) : [0, 0];
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${id}g`} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
          <stop offset="0" stopColor={color(0.95)} />
          <stop offset="1" stopColor={color(0.35)} />
        </linearGradient>
        <filter id={`${id}f`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={width * 2.2} />
        </filter>
      </defs>
      <path d={d} fill="none" stroke={color(0.45)} strokeWidth={width * 4} filter={`url(#${id}f)`} pathLength={1} strokeDasharray={`${draw} 1`} />
      <path d={d} fill="none" stroke={`url(#${id}g)`} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
      {dot !== undefined && dot <= draw && (
        <>
          <circle cx={px} cy={py} r={width * 5} fill={color(0.5)} filter={`url(#${id}f)`} />
          <circle cx={px} cy={py} r={width * 1.6} fill="oklch(99% 0.02 150)" />
        </>
      )}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------
// A job node: a lit disc with an icon, a dashed orbit ring and a label.
export const Node: React.FC<{ cx: number; cy: number; r: number; color: Tone; icon: IconName; label?: string; labelSize?: number; above?: boolean; on?: number }> = ({
  cx, cy, r, color, icon, label, labelSize = 30, above, on = 1,
}) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: Math.min(1, on * 1.6), transformOrigin: `${cx}px ${cy}px`, transform: `scale(${0.55 + 0.45 * on})` }}>
    <div style={{ position: 'absolute', left: cx - r * 1.45, top: cy - r * 1.45, width: r * 2.9, height: r * 2.9, borderRadius: '50%', border: `2px dashed ${color(0.45)}` }} />
    <div
      style={{
        position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%',
        background: `radial-gradient(circle at 36% 30%, ${color(1)} 0%, ${color(0.55)} 38%, ${C.bg2(0.95)} 92%)`,
        border: `3px solid ${color(0.9)}`, boxShadow: `0 0 ${r * 0.9}px ${color(0.55)}, 0 0 ${r * 0.25}px ${color(0.8)}, inset 0 ${r * 0.08}px ${r * 0.12}px rgba(255,255,255,.35)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={r * 1.05} color="oklch(99% 0.01 150)" width={2} />
    </div>
    {label && (
      <div dir="rtl" style={{ position: 'absolute', left: cx - 200, width: 400, top: above ? cy - r * 1.6 - labelSize * 1.3 : cy + r * 1.6, textAlign: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: labelSize, color: C.fg(), textShadow: '0 2px 12px rgba(0,0,0,.8)' }}>
        {label}
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------------------------
// Glass card with HUD corner brackets.
/** On a board in 3D space, glass gets a dark base instead of blurring what is behind it. */
export const SolidGlass = React.createContext(false);
export const Glass: React.FC<{ x: number; y: number; w: number; h?: number; color?: Tone; pad?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({
  x, y, w, h, color = C.green, pad = 30, style, children,
}) => {
  const solid = React.useContext(SolidGlass);
  const k = 24;
  const corner = (pos: React.CSSProperties, b: React.CSSProperties) => (
    <span style={{ position: 'absolute', width: k, height: k, borderWidth: 0, borderStyle: 'solid', borderColor: color(0.95), ...pos, ...b }} />
  );
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', padding: pad, borderRadius: 18,
        background: solid
          ? `linear-gradient(160deg, ${C.fg(0.11)}, ${C.fg(0.035)} 55%, ${color(0.07)}), linear-gradient(${C.bg(0.88)}, ${C.bg(0.88)})`
          : `linear-gradient(160deg, ${C.fg(0.11)}, ${C.fg(0.035)} 55%, ${color(0.07)})`,
        border: `1.5px solid ${C.fg(0.14)}`,
        boxShadow: `0 34px 90px rgba(0,0,0,.55), 0 0 70px ${color(0.13)}, inset 0 1.5px 0 ${C.fg(0.2)}`,
        backdropFilter: solid ? undefined : 'blur(16px)',
        ...style,
      }}
    >
      {corner({ top: -2, right: -2 }, { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 16 })}
      {corner({ top: -2, left: -2 }, { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 16 })}
      {corner({ bottom: -2, right: -2 }, { borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 16 })}
      {corner({ bottom: -2, left: -2 }, { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 16 })}
      {children}
    </div>
  );
};

/** "לדוגמה": every made-up name, number and business detail carries it. */
export const Sample: React.FC<{ style?: React.CSSProperties; size?: number }> = ({ style, size = 22 }) => (
  <span dir="rtl" style={{ display: 'inline-block', fontFamily: ASSIST, fontWeight: 700, fontSize: size, color: C.fg2(), padding: `${size * 0.14}px ${size * 0.6}px`, borderRadius: 99, border: `1.5px solid ${C.fg(0.28)}`, background: C.bg(0.5), ...style }}>
    לדוגמה
  </span>
);

/** Digits that stay left-to-right inside Hebrew text. */
export const Num: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span dir="ltr" style={{ unicodeBidi: 'isolate', fontFamily: MONO, ...style }}>{children}</span>
);

// ---------------------------------------------------------------------------------------------
// Text on the frame.
export const HudTitle: React.FC<{ idx: string; title: string; sub: string; color: Tone; top?: number; p?: number }> = ({ idx, title, sub, color, top = 236, p = 1 }) => (
  <div dir="rtl" style={{ position: 'absolute', right: 80, top, display: 'flex', gap: 26 }}>
    <div style={{ width: 7, borderRadius: 4, background: color(), boxShadow: `0 0 26px ${color(0.85)}`, transformOrigin: '50% 0%', transform: `scaleY(${Math.min(1, p * 1.8)})` }} />
    <div style={{ opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * 40}px)`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', fontFamily: ASSIST, fontWeight: 700, fontSize: 28, color: color() }}>
        <span dir="ltr" style={{ fontFamily: MONO, fontWeight: 500 }}>{idx}</span>
        <span style={{ color: C.fg3() }}>//</span>
        <span>פעיל</span>
      </div>
      <div style={{ fontFamily: KARANTINA, fontWeight: 700, fontSize: 158, lineHeight: 0.88, marginTop: 6, color: C.fg(), textShadow: `0 0 44px ${color(0.4)}` }}>{title}</div>
      <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 36, marginTop: 10, color: C.fg2() }}>{sub}</div>
    </div>
  </div>
);

/** "Not open yet" tag: an amber dot (pending, not live) + "נפתח בקרוב", optionally "· הרשמה מוקדמת". */
export const SoonPill: React.FC<{ t: number; size?: number; early?: boolean }> = ({ t, size = 30, early = false }) => {
  const pulse = 0.5 + 0.5 * Math.sin(t / 9);
  const dot = Math.round(size * 0.42);
  return (
    <div dir="rtl" style={{
      display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.45), padding: `${Math.round(size * 0.36)}px ${Math.round(size * 0.8)}px`,
      borderRadius: 99, background: C.bg(0.74), border: `1.5px solid ${C.amber(0.6)}`,
      boxShadow: `0 10px 30px rgba(0,0,0,.45), 0 0 26px ${C.amber(0.14)}`,
      fontFamily: ASSIST, fontWeight: 700, fontSize: size, lineHeight: 1.1, color: C.fg(), whiteSpace: 'nowrap',
    }}>
      <span style={{ width: dot, height: dot, borderRadius: '50%', flex: 'none', background: C.amber(), boxShadow: `0 0 ${8 + 10 * pulse}px ${C.amber(0.55 + 0.35 * pulse)}` }} />
      <span>נפתח בקרוב</span>
      {early && <span style={{ color: C.fg3() }}>·</span>}
      {early && <span style={{ color: C.fg2(), fontWeight: 600 }}>הרשמה מוקדמת</span>}
    </div>
  );
};

export const Headline: React.FC<{ lines: string[]; top: number; size?: number; glow?: Tone }> = ({ lines, top, size = 200, glow = C.green }) => (
  <div dir="rtl" style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: KARANTINA, fontWeight: 700, fontSize: size, lineHeight: 0.92, color: C.fg(), textShadow: `0 0 60px ${glow(0.35)}, 0 4px 24px rgba(0,0,0,.6)` }}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);

/** The spoken line, burned in for people watching without sound. Always in the same band, above
 *  Instagram's caption and buttons. */
export const Caption: React.FC<{ text: string; top?: number }> = ({ text, top = 1448 }) => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: top - 90, height: 330, background: 'linear-gradient(to bottom, transparent, rgba(4,10,8,.62) 38%, rgba(4,10,8,.62) 62%, transparent)' }} />
    <div dir="rtl" style={{ position: 'absolute', left: 86, right: 86, top, textAlign: 'center', fontFamily: ASSIST, fontWeight: 700, fontSize: 52, lineHeight: 1.24, color: C.fg(), textShadow: '0 2px 16px rgba(0,0,0,.9)', textWrap: 'balance' } as React.CSSProperties}>
      {text}
    </div>
  </>
);

// ---------------------------------------------------------------------------------------------
// The phone. Its screen is drawn at 390 x 846 and scaled to the phone's width.
export const SCREEN = { w: 390, h: 846 };
export const Phone: React.FC<{ cx: number; top: number; w: number; tilt?: string; glow?: Tone; children: React.ReactNode }> = ({
  cx, top, w, tilt = 'perspective(2600px) rotateY(-9deg) rotateX(4deg)', glow = C.green, children,
}) => {
  const h = w * (SCREEN.h / SCREEN.w);
  const bz = w * 0.04;
  const R = w * 0.14;
  return (
    <div style={{ position: 'absolute', left: cx - w / 2 - bz, top, width: w + 2 * bz, height: h + 2 * bz, transform: tilt, transformOrigin: '50% 35%' }}>
      <div style={{ position: 'absolute', inset: -110, borderRadius: R + 110, background: `radial-gradient(closest-side, ${glow(0.3)}, transparent)`, filter: 'blur(34px)' }} />
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: R + bz,
          background: 'linear-gradient(135deg, #6b7672 0%, #232b28 16%, #0b0e0d 50%, #1d2422 74%, #56605c 100%)',
          boxShadow: '0 70px 140px rgba(0,0,0,.7), inset 0 0 0 2px rgba(255,255,255,.1), inset 0 0 0 5px rgba(0,0,0,.6)',
        }}
      />
      <div style={{ position: 'absolute', left: bz, top: bz, width: w, height: h, borderRadius: R, overflow: 'hidden', background: 'oklch(11% 0.018 172)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: SCREEN.w, height: SCREEN.h, transform: `scale(${w / SCREEN.w})`, transformOrigin: '0 0' }}>
          {children}
          <div style={{ position: 'absolute', left: SCREEN.w / 2 - 62, top: 11, width: 124, height: 36, borderRadius: 99, background: '#000' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(118deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.03) 28%, transparent 42%)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
};

export const StatusBar: React.FC<{ time?: string }> = ({ time = '11:41' }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px', color: C.fg(0.95) }}>
    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16 }}>{time}</span>
    <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[6, 9, 12, 15].map((hgt, i) => <span key={i} style={{ width: 4, height: hgt, borderRadius: 1, background: C.fg(0.9) }} />)}
      <span style={{ width: 26, height: 12, marginLeft: 6, borderRadius: 4, border: `1.5px solid ${C.fg(0.8)}`, padding: 1.5, boxSizing: 'border-box' }}>
        <span style={{ display: 'block', width: '62%', height: '100%', borderRadius: 2, background: C.fg(0.9) }} />
      </span>
    </span>
  </div>
);

// ---------------------------------------------------------------------------------------------
// Screens.
export type Call = { time: string; num: string; name: string; why: string; when: string; state: 'wait' | 'booked' };
export const CALLS: Call[] = [
  { time: '11:33', num: '050-123-4567', name: 'דנה שפירא', why: 'נורת מנוע דולקת', when: 'יום חמישי', state: 'wait' },
  { time: '11:07', num: '052-765-4321', name: 'יוסי מזרחי', why: 'שואל מתי הרכב מוכן', when: 'היום אחרי 16:00', state: 'wait' },
  { time: '10:42', num: '054-111-2233', name: 'רוני כהן', why: 'בדיקה לפני טסט', when: 'מחר 08:00', state: 'booked' },
  { time: 'אתמול', num: '053-987-6543', name: 'עומר חדד', why: 'צריך טסט שנתי', when: 'ראשון בבוקר', state: 'wait' },
];

/** The phone's recent calls. morph[i] = 0: row i is a coral missed call (number only); 1: the same call with
 *  who, why and when (coral = waiting for your call back, green = she booked it). `rich` = all 1. */
export const CallLog: React.FC<{ rich?: boolean; morph?: number[]; pulse?: number }> = ({ rich, morph, pulse = 0 }) => {
  const m = CALLS.map((_, i) => (morph ? morph[i] ?? 0 : rich ? 1 : 0));
  const waiting = CALLS.filter((c) => c.state === 'wait').length;
  const head = m[0];
  return (
    <div dir="rtl" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, oklch(15% 0.022 172), oklch(10% 0.016 172))' }}>
      <StatusBar />
      <div style={{ position: 'absolute', right: 22, left: 22, top: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 31, color: C.fg() }}>שיחות אחרונות</span>
        <Sample size={14} />
      </div>
      <div style={{ position: 'absolute', right: 22, top: 110, fontFamily: ASSIST, fontWeight: 700, fontSize: 16, color: C.coral(), opacity: head }}>
        {waiting} מחכים שתחזרו אליהם
      </div>
      <div style={{ position: 'absolute', right: 14, left: 14, top: 124 + 18 * head, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CALLS.map((c, i) => {
          const k = m[i];
          const green = c.state === 'booked' ? k : 0;
          const glow = 0.12 + 0.2 * pulse * (0.5 + 0.5 * Math.sin(i * 1.3 + pulse * 9));
          const tone = (a = 1) => (green > 0.5 ? C.green(a) : C.coral(a));
          return (
            <div key={i} style={{ position: 'relative', height: 96 + 32 * k, borderRadius: 18, boxShadow: `0 0 26px ${tone(glow)}`, transform: k > 0 && k < 1 ? `scale(${1 + 0.035 * Math.sin(Math.PI * k)})` : undefined }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: `linear-gradient(90deg, ${C.coral(0.06)}, ${C.coral(0.16)})`, border: `1.5px solid ${C.coral(0.5)}`, opacity: 1 - green }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: `linear-gradient(90deg, ${C.green(0.06)}, ${C.green(0.16)})`, border: `1.5px solid ${C.green(0.5)}`, opacity: green }} />
              <div style={{ position: 'absolute', inset: 0, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ position: 'relative', width: 44, height: 44, flex: 'none', borderRadius: '50%', background: tone(0.18), border: `1.5px solid ${tone(0.7)}` }}>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - k }}>
                    <Icon name="missed" size={22} color={C.coral()} width={2.2} />
                  </span>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: k }}>
                    {c.state === 'booked' ? (
                      <Icon name="check" size={22} color={C.green()} width={2.4} />
                    ) : (
                      <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 22, color: C.coral() }}>{c.name[0]}</span>
                    )}
                  </span>
                </div>
                <div style={{ position: 'relative', flex: 1, minWidth: 0, alignSelf: 'stretch' }}>
                  <div style={{ position: 'absolute', right: 0, left: 0, top: '50%', transform: `translateY(-50%) translateY(${-k * 14}px)`, opacity: 1 - k, filter: k > 0 ? `blur(${k * 6}px)` : undefined }}>
                    <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 22, color: C.coral() }}>שיחה שלא נענתה</div>
                    <div style={{ marginTop: 2, fontSize: 16, color: C.fg2(), textAlign: 'right' }}>
                      <Num style={{ fontWeight: 500 }}>{c.num}</Num>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', right: 0, left: 0, top: '50%', transform: `translateY(-50%) translateY(${(1 - k) * 14}px)`, opacity: k, filter: k < 1 ? `blur(${(1 - k) * 6}px)` : undefined }}>
                    <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 21, color: C.fg() }}>{c.name}</div>
                    <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 16, color: C.fg2(), marginTop: 1 }}>{c.why}</div>
                    <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 15, color: c.state === 'booked' ? C.green() : C.coral(), marginTop: 5 }}>
                      {c.state === 'booked' ? 'נקבע תור: ' : 'נוח לחזור: '}
                      {c.when}
                    </div>
                  </div>
                </div>
                <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', padding: '14px 0' }}>
                  <span style={{ fontFamily: c.time === 'אתמול' ? ASSIST : MONO, fontWeight: 600, fontSize: 14, color: C.fg3() }}>{c.time}</span>
                  {c.state === 'wait' && k > 0 && (
                    <span style={{ width: 38, height: 38, borderRadius: '50%', background: C.coral(), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px ${C.coral(0.6)}`, opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
                      <Icon name="phone" size={19} color="oklch(15% 0.02 30)" width={2.2} />
                    </span>
                  )}
                  {c.state === 'booked' && k > 0 && (
                    <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 13, color: 'oklch(16% 0.04 150)', background: C.green(), borderRadius: 99, padding: '3px 10px', opacity: k }}>המענה קבע</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** A new call ringing. secs = the ring timer (it reaches 20); turn 0..1 turns the ring green as the call leaves. */
export const Incoming: React.FC<{ secs?: number; turn?: number }> = ({ secs = 20, turn = 1 }) => {
  const r = 112;
  const cx = SCREEN.w / 2;
  const cy = 400;
  const circ = 2 * Math.PI * r;
  const prog = Math.min(1, secs / 20);
  const shown = Math.min(20, Math.floor(secs));
  return (
    <div dir="rtl" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 70% at 50% 45%, oklch(19% 0.04 150), oklch(10% 0.016 172))' }}>
      <StatusBar />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 86, textAlign: 'center', fontFamily: ASSIST, fontWeight: 600, fontSize: 19, color: C.fg3() }}>שיחה נכנסת</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 116, textAlign: 'center', fontSize: 31, color: C.fg() }}>
        <Num style={{ fontWeight: 500 }}>052-765-4321</Num>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center' }}>
        <Sample size={13} />
      </div>
      <svg width={SCREEN.w} height={SCREEN.h} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <filter id="incGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.fg(0.1)} strokeWidth={12} />
        {Array.from({ length: 20 }, (_, i) => {
          const a = (i / 20) * Math.PI * 2 - Math.PI / 2;
          const passed = i < shown;
          return (
            <line key={i} x1={cx + (r + 18) * Math.cos(a)} y1={cy + (r + 18) * Math.sin(a)} x2={cx + (r + 28) * Math.cos(a)} y2={cy + (r + 28) * Math.sin(a)}
              stroke={passed ? C.fg(0.75) : C.fg(0.25)} strokeWidth={2.5} strokeLinecap="round" />
          );
        })}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.coral()} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${circ * prog} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`} filter="url(#incGlow)" opacity={1 - turn} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.green()} strokeWidth={12 + 6 * turn} strokeLinecap="round" strokeDasharray={`${circ * prog} ${circ}`}
          transform={`rotate(-90 ${cx} ${cy})`} filter="url(#incGlow)" opacity={turn} />
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy - 40, textAlign: 'center', fontSize: 52, color: turn > 0.5 ? C.green() : C.fg() }}>
        <Num style={{ fontWeight: 700 }}>00:{String(shown).padStart(2, '0')}</Num>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: cy + 22, textAlign: 'center', fontFamily: ASSIST, fontWeight: 600, fontSize: 17, color: C.fg3() }}>שניות בלי מענה</div>
      <div style={{ position: 'absolute', left: 58, right: 58, top: 690, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ width: 74, height: 74, borderRadius: '50%', background: C.green(), display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${30 + 20 * Math.abs(Math.sin(secs * Math.PI))}px ${C.green(0.55)}` }}>
          <Icon name="phone" size={34} color="oklch(16% 0.04 150)" width={2.2} />
        </span>
        <span style={{ width: 74, height: 74, borderRadius: '50%', background: C.coral(0.9), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="hangup" size={36} color="oklch(97% 0.01 30)" width={2} />
        </span>
      </div>
    </div>
  );
};
