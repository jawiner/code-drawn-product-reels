---
name: code-drawn-reel
description: "Make a vertical reel (Instagram Reels / TikTok / Shorts, 9:16, 30-60 s) about anything (a product, an app, a business, a service, a process, a course, an idea), drawn entirely in code with Remotion: a 3D space with a moving camera, an AI voice (Gemini TTS) timed word by word, and a music bed cut on the beat so a strong bar lands on the payoff. Starts from a ready starter film driven by one settings file (film.json), in English or Hebrew. Covers the whole path with the owner's approval gates: facts, hook options, approved lines, storyboard stills, voice, music, animation, review checks and delivery copies. Use when someone asks for a promo, explainer, launch or story reel, or 'a video like this one', and wants it built in code rather than filmed or AI-generated."
---

# Code-drawn reel

This is the method behind the films in this repo:
- **The starter** (`src/starter/`): a film about any subject, made from `film.json`. Start every new film here.
- **Two finished product films:** an AI receptionist (`src/receptionist/Film3D.tsx`) and the LeadFlow CRM
  (`src/leadflow/Film.tsx`). Read [`HOW-THEY-WERE-MADE.md`](../../HOW-THEY-WERE-MADE.md) once to see the whole
  process in practice.

Read [`skills/video-playbook/SKILL.md`](../video-playbook/SKILL.md) before writing the script, and name the lessons
you applied when you send a cut ("Playbook #3, #6").

## The gates: get a written yes before each step

Each step below ends with something you show the owner. Don't start the next step until the owner writes an approval
in their own words. A click on an option marked "(Recommended)" doesn't count. Offer real choices and don't mark one
as the default.

1. **Route.** Ask once: drawn in code (this skill), an AI video generator, or footage. Also ask the language, and
   the voice (an AI voice, or music only).
2. **Facts.** Collect what is true about the subject from its own sources: the product's site and code, the
   business's menu or price list, the course outline. Write the facts down; the film may say nothing else. If the
   owner wants something in the film that isn't real yet, say so: it becomes real first, or it stays out.
3. **Hook options and beats.** Give 3 or 4 different hooks as plain text (open on the result and rewind; a question
   that the last line answers; the pain on a real object; a timer about to run out). Then give a beat table: seconds,
   what's on screen, the voice line. The owner picks a hook and approves **every voice line word for word**. They
   often rewrite some lines. Keep their words exactly.
4. **Storyboard.** Render one still per beat from the real code and send them as one sheet. For the starter: bundle
   once, render `npx remotion still` at each board's frame, and tile the stills with `tools/contact_sheet.py` (or
   ffmpeg's `tile`). Animate or polish only after the owner approves it.
5. **One cut.** Render, review (below), send a single chat-size file, and wait. Don't make other versions until the
   owner says yes.
6. **After the yes:** commit, then the delivery copies (master, chat copy, web copy and poster).

If a cut is rejected, ask what matters most and what should get the screen time, as a multi-select. Rewrite the
script around those answers, and get it approved again before rebuilding.

## Story rules

- Frame 1 is the whole hook: big text, or the subject's own screen or object. Never a half-built card or an
  AI-generated person.
- One protagonist or one object carries the whole film: one customer, one order, one bag of coffee, one call log
  that comes back at the end. Every few seconds the story adds something new (a new fact, a new stake, a new
  board). Cut any beat that only repeats.
- Say the brand name only on the end card. End on the benefit, in one settled line, then show an end card with the
  name and one action.
- Mark every sample name, number or time on screen as an example (`"sample": true` on a starter board).
- Give people time to read. Hold 0.6 to 1 s on a board before the camera moves on. Show figures as two or three big
  numbers, not a table.

## Build from the starter

Copy `src/starter/` to `src/<film>/`, and copy its `<Composition>` in `src/Root.tsx` (a new `id`, `folder: '<film>'`,
your folder's imports). Then write the approved script into `film.json`. The README's "Make your own film" lists
every field. In short:

- `scenes` in order: one `hook`, one `board` per beat, one `payoff`, one `end`. Each has an `id` and a `line`.
- A board shows `rows`, `checklist`, `stats` or `message` items. Give an item `"at": "<word>"` so it appears on that
  spoken word.
- `direction` (`ltr` or `rtl`), `palette` (take the colours from the subject's own brand), `tag`, `music`, `voice`.

Before any voice exists, the film estimates the timing from the words, so you can show stills and a silent cut
early. Preview with `npm run studio`.

Write new code only when a beat needs something the four board types can't show (a phone screen, a map, the
product's own screen). Then add a component in `parts.tsx` and a new `show.type`, or build a custom scene as the two
product films do. Keep the same rules:

- **The voice drives the timeline.** `timeline.ts` turns each line into start frames and word times
  (`wordAt(tl, id, word)`). Land visuals on words, not on guessed frames.
- **One 3D space, an orbit camera.** The camera is `{t: target, d: distance, yaw, pitch}` with two keys per scene,
  joined by a monotone cubic so it never overshoots (`stage.ts`, `camera.tsx`). Planes are CSS 3D. Things that must
  stay crisp (the core, beams, nodes) are drawn flat at `project(v, cam)`, which uses the same maths as the CSS
  transform.
- **Headlines and captions stay flat on the screen.** A board's own heading may live on the board, because the camera
  faces it straight.
- **Fade a plane** when the eye comes within about 1000 px of it, or the camera flies through a huge blurry slab.
- **No `backdrop-filter` in 3D.** Use a solid dark glass.
- **Lay it out with numbers first.** Project every board's corners and the core through every camera key and fix
  anything off screen or overlapping before you look at pixels (`stage.ts` is pure numbers for this reason;
  `tools/layout_check_example.py` shows the idea).

**Safe zones for Reels.**
- Instagram covers the top corners down to about y 250 (the "Reels" label and the camera button), so the tag goes top
  centre, around y 146.
- The caption sits around y 1450.
- Keep the bottom 300 px free of anything important.
- In right-to-left text, render counters like "01 / 07" as one `dir="ltr"` unit.

## Voice (Gemini TTS)

1. `python tools/voice_plan.py <film>` writes `voice/<film>/plan.json` and `gemini-voice.json` from `film.json`.
   In `gemini-voice.json`:
   - `voice`: the films use Sulafat.
   - `style`: one paragraph on who is speaking to whom, the pace, the tone, how the first and last lines land, and
     how to say tricky words.
   - `spoken`: per line, the text to actually say. Use respellings or niqqud for names, homophones and letters
     (for example "AI" as "אֵיי־אַיי" in Hebrew).
2. Record: `<speech Python> -X utf8 tools/reelkit_gemini_voiceover.py --project voice/<film>`. For English, add
   `--language en --asr-model small.en`. To redo one line in the same voice, add `--scene <id>`. The free tier
   allows 3 requests a minute, which is why the whole script is recorded in one take. Recording costs money on a
   paid key, so ask before you run it.
3. **Listen blind:** `tools/blind_check.py voice/<film>` (for English, add `--language en --models small.en`)
   transcribes each line without the script. Fix every line where the voice said a different word. For Hebrew,
   trust the ivrit-ai model; generic models misspell correct Hebrew.
4. `python tools/sync_voice.py <film>`: the film now plays the voice and follows its real timing. Captions show the
   script text, not the `spoken` spelling.

## Music

- Use one licensed track of about 30 s. Find its bars: `python tools/beat_grid.py <track> <bpm>`. The script prints
  which bars hit hardest.
- Choose the strong bar that should land on the payoff headline (`npm run timeline -- <film>` prints when the payoff
  headline starts). Cut the track into pieces on bar starts, longer than the film, so that bar falls at that second:
  `python tools/build_bed.py <track> public/<film>/bed.mp3 --cut a:b --cut c:d ... --on-grid [--delay s]`.
- Set `music.hitSec` in `film.json`. The payoff waits up to 3 s for it, and the Studio console says when it misses.
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
   - the core or a board cut off by the frame's edge
4. `<speech Python> -X utf8 tools/film_transcript.py out/film.mp4 [model] [language]`: every line is there, in
   order, at its planned time, and the end of each line isn't cut off.
5. Then send one file. Chats have upload limits (about 30 MB), so send a copy at crf 19 to 24.

## Delivery (after the yes)

- **Master:** the finished render.
- **Chat copy:** crf 24.
- **Web copy:** 720x1280, crf 23, `+faststart`, plus a poster frame of the payoff with no caption on it.
- On a website, a 9:16 film needs a tall player. The commands are in the repo's README.
