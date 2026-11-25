// Fonts and colours of the starter film.
//
// Fonts: change the three imports below to any Google Font (https://fonts.google.com); every one of them is
// available as @remotion/google-fonts/<Name>. Keep the subsets your language needs ('hebrew', 'latin', ...).
// The defaults cover both English and Hebrew: Karantina (display), Assistant (text), JetBrains Mono (digits).
//
// Colours come from film.json ("palette"): any CSS colour (oklch(...), #hex, rgb(...)).
import React from 'react';
import { loadFont as loadDisplay } from '@remotion/google-fonts/Karantina';
import { loadFont as loadText } from '@remotion/google-fonts/Assistant';
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono';

export const DISPLAY = loadDisplay('normal', { weights: ['700'], subsets: ['hebrew', 'latin'] }).fontFamily;
export const TEXT = loadText('normal', { weights: ['400', '600', '700', '800'], subsets: ['hebrew', 'latin'] }).fontFamily;
export const MONO = loadMono('normal', { weights: ['400', '500', '700'], subsets: ['latin'] }).fontFamily;

/** A colour at an opacity: tone() is the colour itself, tone(0.3) the same colour at 30%. */
export type Tone = (a?: number) => string;
const tone = (css: string): Tone => (a = 1) => (a >= 1 ? css : `color-mix(in oklch, ${css} ${Math.max(0, Math.round(a * 1000) / 10)}%, transparent)`);

export type Palette = { ground: string; ink: string; muted: string; accent: string; second: string };
export type Theme = {
  ground: Tone; ink: Tone; muted: Tone; accent: Tone; second: Tone;
  dir: 'ltr' | 'rtl';
};
export const makeTheme = (p: Palette, dir: 'ltr' | 'rtl'): Theme => ({
  ground: tone(p.ground), ink: tone(p.ink), muted: tone(p.muted), accent: tone(p.accent), second: tone(p.second), dir,
});

export const ThemeCtx = React.createContext<Theme>(makeTheme({ ground: '#0b0f14', ink: '#eef1f4', muted: '#9aa5b1', accent: '#5bd0e8', second: '#f0c060' }, 'ltr'));
export const useTheme = () => React.useContext(ThemeCtx);

/** Seeded random, so every render draws the same dust. */
export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
