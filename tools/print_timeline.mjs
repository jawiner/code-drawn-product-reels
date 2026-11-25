// When everything happens in a starter-based film: each scene's time on screen, when its line starts, how long it
// is, and whether that timing comes from a recording or is estimated from the words. Use it to cut the music so
// its strongest bar lands on the payoff headline (then set music.hitSec in film.json).
//
//     npm run timeline -- starter
//     npm run timeline -- my-film
import { buildSync } from 'esbuild';
import { createRequire } from 'module';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const name = process.argv[2] || 'starter';
const dir = resolve('src', name);
if (!existsSync(resolve(dir, 'film.json'))) {
  console.error(`No src/${name}/film.json`);
  process.exit(1);
}
const code = buildSync({ entryPoints: [resolve(dir, 'timeline.ts')], bundle: true, platform: 'node', format: 'cjs', write: false, logLevel: 'error' }).outputFiles[0].text;
const mod = { exports: {} };
new Function('module', 'exports', 'require', code)(mod, mod.exports, createRequire(import.meta.url));
const { buildTimeline, FPS } = mod.exports;

const film = JSON.parse(readFileSync(resolve(dir, 'film.json'), 'utf8'));
const voice = existsSync(resolve(dir, 'voice.json')) ? JSON.parse(readFileSync(resolve(dir, 'voice.json'), 'utf8')) : {};
const t = buildTimeline(film, voice);
const sec = (f) => (f / FPS).toFixed(2).padStart(6);

console.log('scene        kind     on screen          line starts  length   timing');
for (const s of t.scenes) {
  const [a, b] = t.bounds[s.id];
  console.log(`${s.id.padEnd(12)} ${s.kind.padEnd(8)} ${sec(a)} - ${sec(b)} s   ${sec(t.start[s.id])} s   ${sec(t.dur[s.id])} s   ${t.lines[s.id].recorded ? 'recorded' : 'estimated'}`);
}
const pay = t.scenes.find((s) => s.kind === 'payoff');
if (pay) console.log(`\nThe payoff headline starts at ${sec(t.bounds[pay.id][0]).trim()} s.`);
if (film.music?.hitSec) {
  console.log(t.late === 0 ? `It lands on the music's hit (music.hitSec ${film.music.hitSec}).`
    : `It misses the music's hit (music.hitSec ${film.music.hitSec}) by ${(Math.abs(t.late) / FPS).toFixed(2)} s: rebuild the bed or change hitSec.`);
}
console.log(`Length: ${sec(t.total).trim()} s (${t.total} frames).`);
