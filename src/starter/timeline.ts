// When everything happens. The voice drives the timeline: each scene's line comes from voice.json once it is
// recorded (tools/sync_voice.py writes it); until then its length and word times are estimated from the words,
// so the film can be previewed and rendered before any voice exists.
import { Easing, interpolate } from 'remotion';

export const FPS = 30;

// ---------------------------------------------------------------------------------------------
// film.json, as types.
export type Word = { word: string; startSec: number; endSec: number };
export type Show =
  | { type: 'rows'; items: { label: string; value: string; at?: string }[] }
  | { type: 'checklist'; items: { text: string; at?: string }[] }
  | { type: 'stats'; items: { value: string; label: string; at?: string }[] }
  | { type: 'message'; items: { from: 'them' | 'you'; text: string; at?: string }[] };
export type Scene =
  | { id: string; kind: 'hook'; title: string[]; line: string; hold?: number }
  | { id: string; kind: 'board'; label: string; title: string; sub?: string; line: string; show: Show; sample?: boolean; hold?: number }
  | { id: string; kind: 'payoff'; title: string[]; line: string; hold?: number }
  | { id: string; kind: 'end'; name: string; tagline?: string; button?: string; line: string; hold?: number };
export type FilmSettings = {
  direction: 'ltr' | 'rtl';
  wordsPerSecond: number;
  palette: { ground: string; ink: string; muted: string; accent: string; second: string };
  tag?: { text: string; fromSec: number } | null;
  sampleLabel?: string;
  music?: { file: string; hitSec?: number; quiet?: number; loud?: number } | null;
  voice?: { name?: string; pace?: string; style?: string };
  scenes: Scene[];
};
export type VoiceFile = Record<string, { durationSec: number; words: Word[]; text: string }>;
export type Line = { durationSec: number; words: Word[]; text: string; recorded: boolean };

// ---------------------------------------------------------------------------------------------
// Spacing. Frames of silence before each kind of line, and seconds held after it (reading time).
const GAP = { hook: 4, board: 10, payoff: 16, end: 12 } as const;
const HOLD = { hook: 0.15, board: 0.7, payoff: 0.5, end: 0 } as const;
/** A scene takes over this many frames before its line starts. */
export const LEAD = 8;
/** The payoff's headline arrives this many frames before its line, on the music's hit. */
export const PAYOFF_LEAD = 26;
/** The longest the payoff waits for the music's hit (frames). */
const MAX_WAIT = 90;
/** Frames the end card stays after the last word. */
const END_HOLD = 66;

/** Word times guessed from the text: longer words take longer, a comma or full stop adds a pause. */
function estimate(text: string, wps: number): Line {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lens = words.map((w) => Math.max(2, w.replace(/[^\p{L}\p{N}]/gu, '').length));
  const avg = lens.reduce((a, b) => a + b, 0) / Math.max(1, lens.length);
  const out: Word[] = [];
  let t = 0.05;
  words.forEach((w, i) => {
    const d = (1 / wps) * (0.55 + 0.45 * (lens[i] / avg));
    out.push({ word: w, startSec: +t.toFixed(3), endSec: +(t + d * 0.9).toFixed(3) });
    t += d;
    if (i < words.length - 1) {
      if (/[,;:]$/.test(w)) t += 0.22;
      else if (/[.?!…]$/.test(w)) t += 0.35;
    }
  });
  return { durationSec: +(t + 0.1).toFixed(3), words: out, text, recorded: false };
}

export type Timeline = {
  scenes: Scene[];
  lines: Record<string, Line>;
  start: Record<string, number>;
  dur: Record<string, number>;
  /** [a, b): the frames a scene owns on screen, from LEAD before its line until the next scene takes over. */
  bounds: Record<string, [number, number]>;
  total: number;
  boards: Extract<Scene, { kind: 'board' }>[];
  /** Frames by which the payoff misses the music's hit: after it (+) or more than 3 s before it (−). 0 = on it. */
  late: number;
};

function check(film: FilmSettings) {
  const say = (m: string) => {
    throw new Error(`film.json: ${m}`);
  };
  if (!Array.isArray(film.scenes) || film.scenes.length === 0) say('"scenes" is empty.');
  const seen = new Set<string>();
  for (const s of film.scenes) {
    if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) say(`every scene needs an "id" of lower-case letters, digits or dashes (got "${s.id}").`);
    if (seen.has(s.id)) say(`two scenes have the id "${s.id}".`);
    seen.add(s.id);
    if (!['hook', 'board', 'payoff', 'end'].includes(s.kind)) say(`scene "${s.id}": "kind" must be hook, board, payoff or end.`);
    if (!s.line || !s.line.trim()) say(`scene "${s.id}" has no "line" (the words the voice says).`);
    if (s.kind === 'board' && !['rows', 'checklist', 'stats', 'message'].includes(s.show?.type)) say(`board "${s.id}": "show.type" must be rows, checklist, stats or message.`);
  }
  if (!film.scenes.some((s) => s.kind === 'board')) say('add at least one scene with "kind": "board".');
}

export function buildTimeline(film: FilmSettings, voice: VoiceFile): Timeline {
  check(film);
  const scenes = film.scenes;
  const lines: Record<string, Line> = {};
  for (const s of scenes) {
    const v = voice[s.id];
    // A recording counts only while its words still match the script; an edited line falls back to the estimate.
    lines[s.id] = v && v.text.trim() === s.line.trim() ? { ...v, recorded: true } : estimate(s.line, film.wordsPerSecond || 2.6);
  }
  const start: Record<string, number> = {};
  const dur: Record<string, number> = {};
  let t = 0;
  let late = 0;
  for (const s of scenes) {
    t += GAP[s.kind];
    if (s.kind === 'payoff' && film.music?.hitSec) {
      // Wait for the music's hit, but never longer than MAX_WAIT: a longer wait would be dead air.
      const want = Math.round(film.music.hitSec * FPS) + PAYOFF_LEAD;
      if (want >= t && want - t <= MAX_WAIT) t = want;
      else late = t - want;
    }
    start[s.id] = t;
    dur[s.id] = Math.round(lines[s.id].durationSec * FPS);
    t += dur[s.id] + Math.round((s.hold ?? HOLD[s.kind]) * FPS);
  }
  const last = scenes[scenes.length - 1];
  const total = start[last.id] + dur[last.id] + END_HOLD;
  const lead = (s: Scene) => (s.kind === 'payoff' ? PAYOFF_LEAD : LEAD);
  const bounds: Record<string, [number, number]> = {};
  scenes.forEach((s, i) => {
    const a = i === 0 ? 0 : start[s.id] - lead(s);
    const b = i === scenes.length - 1 ? total : start[scenes[i + 1].id] - lead(scenes[i + 1]);
    bounds[s.id] = [a, b];
  });
  const boards = scenes.filter((s): s is Extract<Scene, { kind: 'board' }> => s.kind === 'board');
  return { scenes, lines, start, dur, bounds, total, boards, late };
}

/** Absolute frame at which the first word containing `has` is spoken in scene `id`, or null. */
export const wordAt = (tl: Timeline, id: string, has: string): number | null => {
  const needle = has.toLowerCase();
  const w = tl.lines[id].words.find((x) => x.word.toLowerCase().includes(needle));
  return w ? tl.start[id] + Math.round(w.startSec * FPS) : null;
};

/** When each item of a board appears: on its "at" word if it has one, otherwise spread over the line. */
export const cues = (tl: Timeline, id: string, items: { at?: string }[]): number[] =>
  items.map((it, i) => {
    const onWord = it.at ? wordAt(tl, id, it.at) : null;
    if (onWord !== null) return onWord - 4;
    const frac = items.length === 1 ? 0.3 : 0.12 + (0.7 * i) / (items.length - 1);
    return tl.start[id] + Math.round(frac * tl.dur[id]);
  });

// ---------------------------------------------------------------------------------------------
// Easing helpers.
export const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const soft = Easing.bezier(0.33, 0, 0.15, 1);
export const out = Easing.out(Easing.cubic);
/** 0 before frame a, 1 after frame b, eased between. */
export const seg = (f: number, a: number, b: number, e: (t: number) => number = soft) => interpolate(f, [a, b], [0, 1], { ...cl, easing: e });
