---
name: code-drawn-product-reel
description: "Make a vertical product reel (Instagram Reels / TikTok / Shorts, 9:16, 40-60 s) for a software product, drawn entirely in code with Remotion: a CSS 3D scene with a moving camera, an AI voice (Gemini TTS) timed word by word, and a music bed cut on the beat so a strong bar lands on the payoff. Covers the whole path with the owner's approval gates: reference study, facts from the product, hook options, approved lines, storyboard stills, voice, music, animation, review checks and delivery copies. Use when someone asks for a promo / explainer / launch reel or 'a video like this one' for an app, SaaS or software product and wants it built in code rather than filmed or AI-generated."
---

# Code-drawn product reel

This is the method behind the two reels in this repo: an AI receptionist (`src/receptionist/Film3D.tsx`) and the
LeadFlow CRM (`src/leadflow/Film.tsx`). Read [`HOW-THEY-WERE-MADE.md`](../../HOW-THEY-WERE-MADE.md) once to see
it in practice. Read [`skills/video-playbook/SKILL.md`](../video-playbook/SKILL.md) before writing the script, and
name the lessons you applied when you send a cut ("Playbook #3, #6").

## The gates: get a written yes before each step

Each step below ends with something you show the owner. Don't start the next step until the owner writes an approval
in their own words. A click on an option marked "(Recommended)" doesn't count. Offer real choices and don't mark one
as the default.

1. **Route.** Ask once: drawn in code (this skill), an AI video generator, or footage. Also ask the format (full
   screen 9:16, or a device in the frame) and the voice (AI voice in which language, or music only).
2. **Facts.** Collect what the product really does from its landing page and its code (UI strings, message
   templates). Write them down. The film may say nothing else. If the owner asks for a feature that isn't built,
   say so: it gets built first, or it stays out of the film.
3. **Hook options and beats.** Give 3 or 4 different hooks as plain text (open on the result and rewind; a question
   that the last line answers; the pain on a real object; a timer about to run out). Then give a beat table: seconds,
   what's on screen, the voice line. The owner picks a hook and approves **every voice line word for word**. They
   often rewrite some lines. Keep their words exactly.
4. **Storyboard.** Render one still per beat from the real code (a `Frames` composition plus a `Sheet` that tiles
   them, like `src/receptionist/Frames.tsx`) and send the sheet. Animate only after the owner approves it.
5. **One cut.** Render, review (below), send a single chat-size file, and wait. Don't make other versions until the
   owner says yes.
6. **After the yes:** commit, then the delivery copies (master, chat copy, web copy and poster).

If a cut is rejected, ask what matters most and what should get the screen time, as a multi-select. Rewrite the
script around those answers, and get it approved again before rebuilding.

## Story rules

- Frame 1 is the whole hook: big text, or the product's own screen. Never a half-built card or an AI-generated person.
- One protagonist or one object carries the whole film: a single customer moving through the product, or a single
  call log that comes back at the end. Every few seconds the story adds something new (a new fact, a new stake, a
  new screen). Cut any beat that only repeats.
- Say the brand name only on the end card. End on the benefit, in one settled line, then show an end card with the
  name and one action.
- Mark every sample name, number or time on screen as "example" (in Hebrew, "לדוגמה").
- Give people time to read. Hold 0.6 to 1 s on a landing before the next close-up opens. Show figures as two or
  three big numbers, not a table.

## Build

**Project.** Remotion 4, 1080x1920 at 30 fps, one composition per film (`src/Root.tsx`). Use at most two font
families plus a monospace face for digits, loaded with `@remotion/google-fonts` with the right subsets (these films
use Karantina for display, Assistant for text, JetBrains Mono for digits, all with Hebrew). Take the colours from the
product's own UI and write them as `oklch()`.

**The voice drives the timeline.** `src/<film>/voice.json` has every line's text, its length and the time of each
word.
- The scenes follow from it: either `START[id] = previous end + GAP[id]`, as in the receptionist's `Film.tsx`, or
  fixed start frames tuned by hand, as in LeadFlow's `START`.
- `dur(id) = durationSec * FPS`.
- `W(id, word)` / `at(id, word)` gives the frame at which a given word is spoken. Use it to land a visual exactly on
  its word.
- Each line is an `<Audio>` inside `<Sequence from={START[id]}>`.
- The bed is one `<Audio>` with a volume function (`bedVolume`): quiet from 6 frames before a line to 4 frames after
  it (0.14), louder between lines (0.28 to 0.3), faded out over the last 40 frames. The function is averaged over
  ±6 frames, so the volume moves smoothly instead of stepping.

**One 3D space with an orbit camera** (see `Film3D.tsx` lines 22-200, `leadflow/Film.tsx` lines 124-150):
- A world `div` gets `transform: worldCss(cam)`, inside a parent with `perspective: P` (P = 1400). Every object is a
  `Plane` positioned with `translate3d` and `rotateY`.
- The camera is `{t: target, d: distance, yaw, pitch}`, with one key per scene. Join the keys with a monotone cubic
  (`monotone()`) so the camera never overshoots.
- Things that must stay crisp (a glowing core, beams, small nodes, pins) are drawn **flat**, at the position
  `project(v, cam)` returns. It uses the same maths as the CSS transform, so they sit exactly on the 3D object.
- Titles, captions and badges are flat on the screen and never in 3D.
- Fade a plane out when the eye comes within about 1000 px of it. Flying through a plane renders a huge blurry slab.
- No `backdrop-filter` inside 3D. Use a solid dark glass (`SolidGlass` in `parts.tsx`).
- Planes that are not in use dim to about 0.14 opacity, so the scene stays legible.
- Full camera moves only for the opening and the payoff. In between, keep a wide shot the film returns to, and use
  close-ups for anything people must read.

**Lay it out with numbers first.** Before writing any animation, list each board's centre, rotation and size and
each camera key. Then project every corner through every key (`tools/layout_check_example.py`) and fix anything
off screen, any overlaps, and any key that looks at nothing.

**Close-ups.** A close-up opens out of the object it explains: a flat panel that starts from the card's projected
rectangle and grows (FLIP), while the scene behind it dims. It closes back the same way.

**Safe zones for Reels.**
- Instagram covers the top corners down to about y 250 (the "Reels" label and the camera button), so badges go top
  centre, around y 146.
- The caption sits around y 1450.
- Keep the bottom 300 px free of anything important.
- In right-to-left text, render counters like "01 / 07" as one `dir="ltr"` unit.

## Voice (Gemini TTS)

- The voice project is `voice/<film>/`:
  - `plan.json`: the scenes, with `id` and `narration`.
  - `gemini-voice.json`:
    - `voice`: the films use Sulafat.
    - `style`: one paragraph on who is speaking to whom, the pace, the tone, how the first and last lines land, and
      how to say tricky words.
    - `spoken`: per line, the text to actually say. Use niqqud or respellings for names, homophones and English
      letters (for example "AI" as "אֵיי־אַיי").
- Record: `<speech Python> -X utf8 tools/reelkit_gemini_voiceover.py --project voice/<film>`. To redo one line in the
  same voice and style, add `--scene <id>`. The free tier allows only 3 requests a minute, which is why the whole
  script is recorded in one take.
- **Listen blind:** `tools/blind_check.py voice/<film>` transcribes each line without the script. Fix every line
  where the voice said a different word. Trust the Hebrew model (ivrit-ai); generic models misspell correct Hebrew.
- Put it in the film: `python tools/sync_voice.py <film>`. Captions on screen use the plain script text, not the
  `spoken` spelling.

## Music

- Use one licensed track of about 30 s (these came from Reelkit's library). Find its BPM and bars:
  `python tools/beat_grid.py <track> <bpm>`. The script prints which bars hit hardest.
- Decide which strong bar lands on the payoff headline (or on the win moment). Then cut the track into pieces on
  bar starts, longer than the film, so that bar falls at that second:
  `python tools/build_bed.py <track> public/<film>/bed.mp3 --cut a:b --cut c:d ... [--delay s] [--on-grid]`.
  The bed goes to -15 LUFS.
- Rebuild the bed whenever the voice timing changes.

## Review before sending (every cut)

1. Stills: bundle once (`npx remotion bundle src/index.ts --out-dir out/bundle`), then
   `npx remotion still out/bundle <Comp> out/f.png --frame=N` for the moments you changed.
2. Full render: `npx remotion render src/index.ts <Comp> out/raw.mp4 --codec=h264 --crf=16`, then
   `python tools/finish_audio.py out/raw.mp4 out/film.mp4` (-14 LUFS, peaks under -1.5 dBTP).
3. `python tools/contact_sheet.py out/film.mp4 out/review` and look at it. Check for:
   - empty frames, and seconds where nothing new happens
   - text on top of text, or a caption under a title
   - a plane flashing past the camera
   - a panel that opens before the viewer can see where it came from
4. `<speech Python> -X utf8 tools/film_transcript.py out/film.mp4`: every line is there, in order, at its planned
   time, and the end of each line isn't cut off.
5. Then send one file. Chats have upload limits (about 30 MB), so send a copy at crf 19 to 24.

## Delivery (after the yes)

- **Master:** the finished render.
- **Chat copy:** crf 24.
- **Web copy:** 720x1280, crf 23, `+faststart`, plus a poster frame of the payoff with no caption on it.
- On a website, a 9:16 film needs a tall player. The commands are in the repo's README.
