// The starter film's pieces. Everything takes its colours from the theme (film.json "palette") and its
// direction from film.json "direction", so the same pieces work for English (ltr) and Hebrew (rtl).
import React, { useId } from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import type { Cam } from './camera';
import { DISPLAY, MONO, TEXT, rng, useTheme } from './theme';
import type { Tone } from './theme';
import { FPS, cues, out, seg } from './timeline';
import type { Line, Scene, Timeline } from './timeline';

const W = 1080;
const H = 1920;
const svgId = () => useId().replace(/[^a-zA-Z0-9]/g, '');

// ---------------------------------------------------------------------------------------------
/** The sky: ground colour, a haze of the accent behind the subject, dust that drifts with the camera. */
export const Backdrop: React.FC<{ f: number; c: Cam }> = ({ f, c }) => {
  const T = useTheme();
  const dust = React.useMemo(() => {
    const r = rng(31);
    return Array.from({ length: 140 }, () => ({ x: r() * W, y: r() * H, s: 1.2 + r() * 3.4, o: 0.1 + r() * 0.45, b: r() < 0.3, k: 0.4 + r() * 1.2 }));
  }, []);
  return (
    <AbsoluteFill style={{ background: T.ground(), overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(1100px 1250px at 50% 860px, ${T.accent(0.16)}, transparent 70%)` }} />
      {dust.map((d, i) => {
        const x = (((d.x - c.yaw * 9 * d.k + Math.sin(f / 50 + i) * 6) % W) + W) % W;
        const y = (((d.y + c.pitch * 14 * d.k - f * (0.35 + d.s * 0.12)) % H) + H) % H;
        return <div key={i} style={{ position: 'absolute', left: x, top: y, width: d.s, height: d.s, borderRadius: '50%', background: T.ink(d.o), filter: d.b ? 'blur(2.5px)' : undefined }} />;
      })}
    </AbsoluteFill>
  );
};

/** The floor: a grid that fades out, a glow under the core, rings of light around the boards. Drawn on a
 *  square plane of side `size`, laid flat by the caller. */
export const Floor: React.FC<{ f: number; size: number; rings: number[] }> = ({ f, size, rings }) => {
  const T = useTheme();
  const c = size / 2;
  const mask = 'radial-gradient(closest-side, black 0%, black 40%, transparent 100%)';
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${T.ink(0.08)} 3px, transparent 3px), linear-gradient(90deg, ${T.ink(0.08)} 3px, transparent 3px)`, backgroundSize: '160px 160px', backgroundPosition: `${c}px ${c}px`, WebkitMaskImage: mask, maskImage: mask }} />
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(closest-side, ${T.accent(0.14)}, transparent 40%)` }} />
      {rings.map((r, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(f / 10 - i * 0.9);
        return (
          <div key={r} style={{ position: 'absolute', left: c - r, top: c - r, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `${4 - i}px solid ${T.accent(0.42 - i * 0.1)}`, boxShadow: `0 0 ${30 + 30 * pulse}px ${T.accent(0.28 - i * 0.07)}, inset 0 0 ${30 + 30 * pulse}px ${T.accent(0.2 - i * 0.05)}` }} />
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
/** The core: a lit sphere in a ring of moving bars, with turning rings around it. Stands for "the thing the
 *  story is about"; it floats above the middle of the stage. */
export const Core: React.FC<{ cx: number; cy: number; R: number; t: number; boost?: number; opacity?: number }> = ({ cx, cy, R, t, boost = 0, opacity = 1 }) => {
  const T = useTheme();
  const id = svgId();
  const S = R * 4.4;
  const c = S / 2;
  const ph = [1.3 + t * 0.045, 4.1 - t * 0.07, 2.2 + t * 0.11];
  const bars = 120;
  const amp = 0.82 + 0.18 * Math.sin(t * 0.19) * Math.sin(t * 0.07) + boost * 0.5;
  const at = (r: number, a: number) => [c + r * Math.cos(a), c + r * Math.sin(a)];
  const len = (i: number) => {
    const a = (i / bars) * Math.PI * 2;
    const v = 0.5 + 0.5 * (0.55 * Math.sin(3 * a + ph[0]) + 0.3 * Math.sin(7 * a + ph[1]) + 0.15 * Math.sin(13 * a + ph[2]));
    return R * (0.04 + 0.3 * amp * Math.pow(v, 1.7));
  };
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ position: 'absolute', left: cx - c, top: cy - c, overflow: 'visible', opacity }}>
      <defs>
        <radialGradient id={`${id}halo`}>
          <stop offset="0" style={{ stopColor: T.accent(0.42) }} />
          <stop offset="0.42" style={{ stopColor: T.accent(0.09) }} />
          <stop offset="1" style={{ stopColor: T.accent(0) }} />
        </radialGradient>
        <radialGradient id={`${id}orb`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" style={{ stopColor: T.ink() }} />
          <stop offset="0.22" style={{ stopColor: T.accent() }} />
          <stop offset="0.65" style={{ stopColor: `color-mix(in oklch, ${T.accent()} 45%, ${T.ground()})` }} />
          <stop offset="1" style={{ stopColor: T.ground() }} />
        </radialGradient>
        <filter id={`${id}bloom`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={R * 0.04} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx={c} cy={c} r={c} fill={`url(#${id}halo)`} />
      <circle cx={c} cy={c} r={R * 1.78} fill="none" style={{ stroke: T.ink(0.16) }} strokeWidth={2} strokeDasharray="3 13" transform={`rotate(${-t * 0.25} ${c} ${c})`} />
      <circle cx={c} cy={c} r={R * 1.5} fill="none" style={{ stroke: T.accent(0.6) }} strokeWidth={3.5} strokeDasharray={`${R * 1.5 * Math.PI * 1.25} ${R * 1.5 * Math.PI * 0.75}`} transform={`rotate(${-118 + t * 0.5} ${c} ${c})`} filter={`url(#${id}bloom)`} />
      {Array.from({ length: 96 }, (_, i) => {
        const a = (i / 96) * Math.PI * 2;
        const long = i % 8 === 0;
        const [x1, y1] = at(R * 1.3, a);
        const [x2, y2] = at(R * (long ? 1.41 : 1.36), a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: long ? T.accent(0.8) : T.ink(0.3) }} strokeWidth={long ? 3 : 2} />;
      })}
      <g filter={`url(#${id}bloom)`}>
        {Array.from({ length: bars }, (_, i) => {
          const a = (i / bars) * Math.PI * 2;
          const [x1, y1] = at(R * 0.86, a);
          const [x2, y2] = at(R * 0.86 + len(i), a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: T.accent(0.95) }} strokeWidth={R * 0.024} strokeLinecap="round" />;
        })}
      </g>
      <circle cx={c} cy={c} r={R * 0.75} fill={`url(#${id}orb)`} />
      <circle cx={c} cy={c} r={R * 0.75} fill="none" style={{ stroke: T.accent(0.75) }} strokeWidth={2.5} />
    </svg>
  );
};

/** A light beam between two points: a slight curve, a glow and a bright packet travelling on it. */
export const Beam: React.FC<{ from: [number, number]; to: [number, number]; color: Tone; bend?: number; width?: number; dot?: number; draw?: number }> = ({
  from, to, color, bend = 0, width = 4, dot, draw = 1,
}) => {
  const id = svgId();
  if (draw <= 0) return null;
  const [x1, y1] = from;
  const [x2, y2] = to;
  const L = Math.hypot(x2 - x1, y2 - y1) || 1;
  const qx = (x1 + x2) / 2 - ((y2 - y1) / L) * bend;
  const qy = (y1 + y2) / 2 + ((x2 - x1) / L) * bend;
  const d = `M${x1} ${y1} Q${qx} ${qy} ${x2} ${y2}`;
  const pt = (t: number) => [(1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * qx + t * t * x2, (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * qy + t * t * y2];
  const [px, py] = dot !== undefined ? pt(dot) : [0, 0];
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <filter id={`${id}f`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={width * 2.2} />
        </filter>
      </defs>
      <path d={d} fill="none" style={{ stroke: color(0.45) }} strokeWidth={width * 4} filter={`url(#${id}f)`} pathLength={1} strokeDasharray={`${draw} 1`} />
      <path d={d} fill="none" style={{ stroke: color(0.9) }} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
      {dot !== undefined && dot <= draw && (
        <>
          <circle cx={px} cy={py} r={width * 5} style={{ fill: color(0.5) }} filter={`url(#${id}f)`} />
          <circle cx={px} cy={py} r={width * 1.6} style={{ fill: color() }} />
        </>
      )}
    </svg>
  );
};

/** A lit disc with a number and a label: one board, seen from far away in the payoff. */
export const NodeDot: React.FC<{ cx: number; cy: number; r: number; n: string; label: string; labelSize: number; above: boolean; on: number }> = ({ cx, cy, r, n, label, labelSize, above, on }) => {
  const T = useTheme();
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: Math.min(1, on * 1.6), transformOrigin: `${cx}px ${cy}px`, transform: `scale(${0.55 + 0.45 * on})` }}>
      <div style={{ position: 'absolute', left: cx - r * 1.45, top: cy - r * 1.45, width: r * 2.9, height: r * 2.9, borderRadius: '50%', border: `2px dashed ${T.accent(0.45)}` }} />
      <div style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle at 36% 30%, ${T.accent()} 0%, ${T.accent(0.55)} 40%, ${T.ground(0.95)} 92%)`, border: `3px solid ${T.accent(0.9)}`, boxShadow: `0 0 ${r * 0.9}px ${T.accent(0.55)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: r * 0.78, color: T.ground() }}>
        {n}
      </div>
      <div dir={T.dir} style={{ position: 'absolute', left: cx - 220, width: 440, top: above ? cy - r * 1.6 - labelSize * 1.3 : cy + r * 1.6, textAlign: 'center', fontFamily: TEXT, fontWeight: 800, fontSize: labelSize, color: T.ink(), textShadow: '0 2px 12px rgba(0,0,0,.8)' }}>
        {label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
/** "Example": on every board whose names or numbers are made up. */
export const SampleTag: React.FC<{ text: string; size?: number }> = ({ text, size = 24 }) => {
  const T = useTheme();
  return (
    <span style={{ display: 'inline-block', fontFamily: TEXT, fontWeight: 700, fontSize: size, color: T.muted(), padding: `${size * 0.14}px ${size * 0.6}px`, borderRadius: 99, border: `1.5px solid ${T.ink(0.28)}`, background: T.ground(0.5), whiteSpace: 'nowrap' }}>
      {text}
    </span>
  );
};

export const BOARD_W = 940;
export const BOARD_H = 1040;

/** "12" counts up to 12; "-14 LUFS" counts to -14 and keeps " LUFS"; anything else just fades in. */
const countUp = (value: string, p: number) => {
  const m = value.match(/^(\D*?)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!m) return value;
  const n = parseFloat(m[2]);
  const dec = (m[2].split('.')[1] || '').length;
  return `${m[1]}${(n * p).toFixed(dec)}${m[3]}`;
};

/** One board: a glass panel standing in the space, with a heading and one kind of content. Drawn in board
 *  coordinates (BOARD_W × BOARD_H); `f` is the absolute frame. */
export const Board: React.FC<{ scene: Extract<Scene, { kind: 'board' }>; idx: number; count: number; tl: Timeline; f: number; sampleLabel: string }> = ({ scene, idx, count, tl, f, sampleLabel }) => {
  const T = useTheme();
  const [a] = tl.bounds[scene.id];
  const head = seg(f, a + 2, a + 22, out);
  const items = scene.show.items as { at?: string }[];
  const at = cues(tl, scene.id, items);
  const ps = at.map((c) => seg(f, c, c + 12, out));
  const k = 26;
  const corner = (pos: React.CSSProperties, b: React.CSSProperties) => (
    <span style={{ position: 'absolute', width: k, height: k, borderWidth: 0, borderStyle: 'solid', borderColor: T.accent(0.95), ...pos, ...b }} />
  );
  const enter = (p: number, dy = 26): React.CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * dy}px)`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined });

  let content: React.ReactNode = null;
  const show = scene.show;
  if (show.type === 'rows') {
    content = show.items.map((it, i) => (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 24, padding: '30px 0', borderTop: `1.5px solid ${T.ink(0.1)}`, ...enter(ps[i]) }}>
        <span style={{ fontFamily: TEXT, fontWeight: 600, fontSize: 36, color: T.muted() }}>{it.label}</span>
        <span style={{ fontFamily: TEXT, fontWeight: 800, fontSize: 48, color: T.ink(), textAlign: 'end' }}>{it.value}</span>
      </div>
    ));
  } else if (show.type === 'checklist') {
    content = show.items.map((it, i) => {
      const done = seg(f, at[i] + 4, at[i] + 14, Easing.out(Easing.back(2)));
      return (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 30, padding: '26px 0', ...enter(Math.max(ps[i], 0.32), 0) }}>
          <span style={{ flex: 'none', width: 62, height: 62, borderRadius: '50%', border: `3px solid ${T.accent(0.4 + 0.6 * done)}`, background: T.accent(0.22 * done), boxShadow: done > 0.5 ? `0 0 26px ${T.accent(0.45)}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width={38} height={38} style={{ opacity: done, transform: `scale(${0.6 + 0.4 * done})` }}>
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" style={{ stroke: T.accent() }} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 50, lineHeight: 1.15, color: T.ink(0.45 + 0.55 * ps[i]) }}>{it.text}</span>
        </div>
      );
    });
  } else if (show.type === 'stats') {
    content = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
        {show.items.map((it, i) => (
          <div key={i} style={{ ...enter(ps[i]) }}>
            <div dir="ltr" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 150, lineHeight: 1, color: T.accent(), textShadow: `0 0 40px ${T.accent(0.4)}`, textAlign: T.dir === 'rtl' ? 'right' : 'left' }}>
              {countUp(it.value, seg(f, at[i], at[i] + 22, out))}
            </div>
            <div style={{ fontFamily: TEXT, fontWeight: 600, fontSize: 36, color: T.muted(), marginTop: 8 }}>{it.label}</div>
          </div>
        ))}
      </div>
    );
  } else if (show.type === 'message') {
    content = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        {show.items.map((it, i) => {
          const you = it.from === 'you';
          const p = seg(f, at[i], at[i] + 10, Easing.out(Easing.back(1.6)));
          return (
            <div key={i} style={{ display: 'flex', justifyContent: you ? 'flex-end' : 'flex-start', opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: you ? 'right bottom' : 'left bottom' }}>
              <div style={{ maxWidth: 640, padding: '24px 30px', borderRadius: 30, fontFamily: TEXT, fontWeight: 600, fontSize: 46, lineHeight: 1.25, color: T.ink(), background: you ? T.accent(0.24) : T.ink(0.09), border: `1.5px solid ${you ? T.accent(0.55) : T.ink(0.16)}` }}>
                {it.text}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div dir={T.dir} style={{
      position: 'absolute', inset: 0, boxSizing: 'border-box', padding: '58px 62px', borderRadius: 30,
      background: `linear-gradient(160deg, ${T.ink(0.1)}, ${T.ink(0.03)} 55%, ${T.accent(0.07)}), linear-gradient(${T.ground(0.9)}, ${T.ground(0.9)})`,
      border: `1.5px solid ${T.ink(0.16)}`, boxShadow: `0 40px 100px rgba(0,0,0,.55), 0 0 90px ${T.accent(0.14)}, inset 0 1.5px 0 ${T.ink(0.2)}`,
    }}>
      {corner({ top: -2, left: -2 }, { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 18 })}
      {corner({ top: -2, right: -2 }, { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 18 })}
      {corner({ bottom: -2, left: -2 }, { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 18 })}
      {corner({ bottom: -2, right: -2 }, { borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 18 })}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, ...enter(head, 0) }}>
        <span dir="ltr" style={{ unicodeBidi: 'isolate', fontFamily: MONO, fontWeight: 500, fontSize: 30, color: T.accent() }}>
          {String(idx + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent(), boxShadow: `0 0 14px ${T.accent()}` }} />
        <span style={{ fontFamily: TEXT, fontWeight: 700, fontSize: 30, color: T.muted() }}>{scene.label}</span>
        <span style={{ flex: 1 }} />
        {scene.sample ? <SampleTag text={sampleLabel} /> : null}
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 136, lineHeight: 0.9, marginTop: 30, color: T.ink(), textShadow: `0 0 44px ${T.accent(0.35)}`, textWrap: 'balance', ...enter(head, 34) } as React.CSSProperties}>
        {scene.title}
      </div>
      {scene.sub ? <div style={{ fontFamily: TEXT, fontWeight: 600, fontSize: 36, marginTop: 14, color: T.muted(), ...enter(seg(f, a + 8, a + 26, out)) }}>{scene.sub}</div> : null}
      <div style={{ marginTop: 52 }}>{content}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// Flat on the screen.
/** The spoken line, word by word as it is said, in one band above Instagram's caption and buttons. */
export const Caption: React.FC<{ line: Line; start: number; f: number; top?: number }> = ({ line, start, f, top = 1450 }) => {
  const T = useTheme();
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, top: top - 90, height: 330, opacity: seg(f, start - 8, start + 4), background: `linear-gradient(to bottom, transparent, ${T.ground(0.66)} 38%, ${T.ground(0.66)} 62%, transparent)` }} />
      <div dir={T.dir} style={{ position: 'absolute', left: 86, right: 86, top, textAlign: 'center', fontFamily: TEXT, fontWeight: 700, fontSize: 52, lineHeight: 1.24, color: T.ink(), textShadow: '0 2px 16px rgba(0,0,0,.9)', textWrap: 'balance' } as React.CSSProperties}>
        {line.words.map((w, i) => {
          const at = start + Math.round(w.startSec * FPS);
          const p = seg(f, at - 3, at + 6, out);
          return (
            <React.Fragment key={i}>
              <span style={{ display: 'inline-block', opacity: 0.14 + 0.86 * p, transform: `translateY(${(1 - p) * 10}px)` }}>{w.word}</span>{' '}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

/** A big headline. With `build`, its words arrive one by one from frame `from`; without it, it is whole at once
 *  (frame 1 of a reel must show the whole hook). */
export const Headline: React.FC<{ lines: string[]; f: number; from?: number; build?: boolean; top?: number; size?: number }> = ({ lines, f, from = 0, build = false, top = 220, size = 190 }) => {
  const T = useTheme();
  let n = 0;
  const word = (w: string, key: string) => {
    const p = build ? seg(f, from + n * 4, from + 14 + n * 4, out) : 1;
    n++;
    return <span key={key} style={{ display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 34}px)`, filter: p < 1 ? `blur(${(1 - p) * 10}px)` : undefined }}>{w}&nbsp;</span>;
  };
  return (
    <div dir={T.dir} style={{ position: 'absolute', left: 50, right: 50, top, textAlign: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 0.92, color: T.ink(), textShadow: `0 0 ${50 + 16 * Math.sin(f / 9)}px ${T.accent(0.38)}, 0 4px 24px rgba(0,0,0,.6)` }}>
      {lines.map((l, i) => <div key={i}>{l.split(/\s+/).map((w, j) => word(w, `${i}-${j}`))}</div>)}
    </div>
  );
};

/** A small status pill, top centre (Instagram covers the top corners down to about y 250). */
export const TagPill: React.FC<{ text: string; f: number }> = ({ text, f }) => {
  const T = useTheme();
  const pulse = 0.5 + 0.5 * Math.sin(f / 9);
  return (
    <div dir={T.dir} style={{ display: 'inline-flex', alignItems: 'center', gap: 15, padding: '12px 28px', borderRadius: 99, background: T.ground(0.74), border: `1.5px solid ${T.second(0.6)}`, boxShadow: `0 10px 30px rgba(0,0,0,.45), 0 0 26px ${T.second(0.14)}`, fontFamily: TEXT, fontWeight: 700, fontSize: 34, lineHeight: 1.1, color: T.ink(), whiteSpace: 'nowrap' }}>
      <span style={{ width: 14, height: 14, borderRadius: '50%', flex: 'none', background: T.second(), boxShadow: `0 0 ${8 + 10 * pulse}px ${T.second(0.55 + 0.35 * pulse)}` }} />
      <span>{text}</span>
    </div>
  );
};

/** The end card: the name, one line, one action. */
export const EndCard: React.FC<{ scene: Extract<Scene, { kind: 'end' }>; f: number; a: number }> = ({ scene, f, a }) => {
  const T = useTheme();
  const p = seg(f, a, a + 18, out);
  const name = seg(f, a + 6, a + 26, out);
  const rest = seg(f, a + 14, a + 34, out);
  return (
    <AbsoluteFill style={{ opacity: p }}>
      <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 42%, ${T.ground(0.84)}, ${T.ground(0.96)})` }} />
      <div dir={T.dir} style={{ position: 'absolute', left: 60, right: 60, top: 620, textAlign: 'center' }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 196, lineHeight: 0.9, color: T.ink(), textShadow: `0 0 60px ${T.accent(0.4)}`, opacity: name, transform: `translateY(${(1 - name) * 30}px)`, textWrap: 'balance' } as React.CSSProperties}>
          {scene.name}
        </div>
        {scene.tagline ? <div style={{ fontFamily: TEXT, fontWeight: 600, fontSize: 44, color: T.muted(), marginTop: 26, opacity: rest }}>{scene.tagline}</div> : null}
        {scene.button ? (
          <div style={{ display: 'inline-block', marginTop: 56, padding: '24px 52px', borderRadius: 99, background: T.accent(), color: T.ground(), fontFamily: TEXT, fontWeight: 800, fontSize: 44, boxShadow: `0 0 50px ${T.accent(0.45)}`, opacity: rest, transform: `scale(${0.92 + 0.08 * rest})` }}>
            {scene.button}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
