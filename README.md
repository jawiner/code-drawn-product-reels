# Code-drawn reels

Vertical reels (9:16, for Instagram Reels, TikTok and Shorts) where every frame is drawn in code with
[Remotion](https://www.remotion.dev) (React): no camera, no screen recording, no stock footage, no AI video
generator. A camera flies through one 3D space from board to board, an AI voice (Google's Gemini text-to-speech)
reads the script with every word timed, and the music is cut on the beat so its strongest bar lands on the payoff.

There are two ways in:

- **Make your own film, about anything** (a product, a business, a service, a process, an idea): start from the
  **starter** in `src/starter/`. The whole film comes from one settings file, `film.json`, and it renders before
  you record any voice. See [Make your own film](#make-your-own-film).
- **Study two finished films**, made for two software products: an AI phone receptionist ("מזכירה קולית") and
  LeadFlow, a CRM for small sellers (Hebrew, about 55 s each). Watch
  [`films/receptionist-reel.mp4`](films/receptionist-reel.mp4) and [`films/leadflow-reel.mp4`](films/leadflow-reel.mp4),
  then read [`HOW-THEY-WERE-MADE.md`](HOW-THEY-WERE-MADE.md): the story of both from idea to the approved cut,
  including what was rejected and why. Their code, voice and music are here too, and they render exactly as
  approved.

## What's here

| | |
|---|---|
| `src/starter/` | **The starter**: a film for any subject, made from `film.json`. Start here for your own film. |
| `films/` | The two finished films, the starter's example render, and the receptionist storyboard. |
| `HOW-THEY-WERE-MADE.md` | Step by step, for both films: brief, hooks, approvals, voice, music, 3D camera, the rejected cut. |
| `skills/code-drawn-reel/` | A Claude Code skill: the whole method, written so an agent can follow it for any subject. |
| `skills/video-playbook/` | The owner's video-marketing playbook (hooks, story, pacing, endings), the skill both films followed. |
| `docs/` | The real planning files: the receptionist plan with four hook options, the LeadFlow briefs sent to ChatGPT, its answers, and scripts v1 to v3. See [`docs/README.md`](docs/README.md). |
| `src/receptionist/`, `src/leadflow/` | The two finished films' code (their scenes are built for each product). |
| `public/` | What the films play: each narration line (`vo-<scene>.mp3`), the music bed (`bed.mp3`) and the track it was cut from. |
| `voice/` | The narration projects: script (`plan.json`), voice and delivery notes (`gemini-voice.json`), word timings. |
| `tools/` | Voice, music, review and finishing scripts (table below). |

## What you need

- **Node 22 or newer** and **ffmpeg + ffprobe** on your PATH.
- **Python 3.10 or newer.**
- To record new narration: a **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey). Every
  recording is billed to it. On the free tier the voice model allows 3 requests a minute and has a low daily limit,
  so the voiceover tool records a whole script in one request.
- Optional: an **OpenAI API key**, only to get a second script draft from ChatGPT (`tools/ask_chatgpt.py`).
- **Claude Code** (optional), to make a new film with the skill: it can write `film.json` with you, or build scenes
  the starter doesn't have.

## Setup

```
npm ci                                       # the exact package versions that rendered the films
python -m pip install -r requirements.txt
```

To record or check narration, create a file named `.env` in this folder (git ignores it):

```
GEMINI_API_KEY=your-key-here
OPENAI_API_KEY=only-if-you-use-ask_chatgpt
```

Word timing and the listening checks run a local speech model, so they get their own Python environment. The first
run downloads the Hebrew model, about 1.6 GB.

```
python -m venv .venv-speech
.venv-speech/Scripts/python.exe -m pip install -r requirements-speech.txt     # Windows
.venv-speech/bin/python -m pip install -r requirements-speech.txt             # macOS / Linux
```

Below, "the speech Python" means `.venv-speech/Scripts/python.exe` (Windows) or `.venv-speech/bin/python`.

To use the skills, copy the two folders in `skills/` into `~/.claude/skills/` (or into a project's `.claude/skills/`).

## Make your own film

The starter is a 50-second example film about how these films are made: a hook, four boards, a payoff and an end
card. Every word, colour and board of it comes from [`src/starter/film.json`](src/starter/film.json). Its render is
[`films/starter-example.mp4`](films/starter-example.mp4).

**1. See it.** `npm run studio` and pick **Starter**, or `npm run render:starter`, which writes
`out/starter-raw.mp4`. Before a voice is recorded, the film times every line from its number of words
(`wordsPerSecond`) and plays only the music, with the captions running as the words would be said.

**2. Make it yours.** Either edit `src/starter/` directly, or copy the folder to `src/<your-film>/`. If you copy it,
also copy the Starter `<Composition>` in `src/Root.tsx`: give it a new `id`, set `folder` to your folder's name,
and import your folder's `film.json` and `voice.json`.

**3. Write the story in `film.json`.** Write it in this order: the hook, one board per step of the story, the
payoff, the end card. Get every line approved word for word before you record (see the skill).

| Field | What it does |
|---|---|
| `direction` | `"ltr"` for English and other left-to-right languages, `"rtl"` for Hebrew or Arabic. |
| `wordsPerSecond` | Speaking speed for the timing before a voice exists: about 2.7 in English, 2.4 in Hebrew. |
| `palette` | `ground` (background), `ink` (text), `muted` (secondary text), `accent` (light, beams, highlights), `second` (the tag's dot). Any CSS colour. |
| `tag` | A small pill at the top centre from `fromSec` until the end card, such as "Coming soon" or "Example film". `null` for none. |
| `sampleLabel` | The word shown on boards marked `"sample": true`, for made-up names and numbers ("Example", "לדוגמה"). |
| `music` | `file` (under `public/`), `hitSec` (the second where the bed's strongest bar lands; the payoff headline waits up to 3 s for it), `quiet` and `loud` volumes (under the voice, between lines). |
| `voice` | `name` (a Gemini voice), `pace`, `style` (how to speak, in plain words). Copied into the voice project by `tools/voice_plan.py`. |
| `scenes` | The film, in order. Each scene has an `id` (lower-case letters, digits or dashes), a `kind` and a `line` (what the voice says). |

The four kinds of scene:

| `kind` | Fields | On screen |
|---|---|---|
| `hook` | `title`: 1-3 short lines | A big headline, whole on the first frame, over a wide shot of the space. |
| `board` | `label`, `title`, optional `sub`, `show`, optional `"sample": true` | The camera flies to this scene's board while the line is spoken. |
| `payoff` | `title`: 1-3 short lines | The camera pulls back, every board becomes a lit node around the core, and the headline builds word by word. |
| `end` | `name`, optional `tagline` and `button` | The end card: the name, one line, one action. |

What a board shows (`show.type`). Each item can have `"at": "<a word of the line>"` and appears the moment that
word is spoken. Without one, the items are spread over the line.

| `show.type` | Items | Looks like |
|---|---|---|
| `rows` | `{ "label", "value" }` | A record card: a label on one side, a value on the other. |
| `checklist` | `{ "text" }` | Each item ticks when its word is said. |
| `stats` | `{ "value", "label" }` | Big figures (two or three at most). Numbers count up; "-14 LUFS" keeps its unit. |
| `message` | `{ "from": "them" or "you", "text" }` | Chat bubbles, one per item. |

Any scene can also have `hold`: extra seconds of reading time after its line (boards get 0.7 s by default).

**4. Record the voice.**

```
python tools/voice_plan.py starter                    # writes voice/starter/plan.json and gemini-voice.json from film.json
<speech Python> -X utf8 tools/reelkit_gemini_voiceover.py --project voice/starter --language en --asr-model small.en
<speech Python> -X utf8 tools/blind_check.py voice/starter --language en --models small.en
python tools/sync_voice.py starter                    # the film now plays the voice and follows its real timing
```

For Hebrew, leave out `--language` and the model options: Hebrew is the default. If the voice says a word wrong,
write how to say it in `gemini-voice.json` under `"spoken"` (with niqqud in Hebrew), then re-record that line with
`--scene <id>`. After you change a line in `film.json`, run `voice_plan.py` again and re-record that line. Until
you do, the film times that line from its words and doesn't play its old recording.

**5. Cut the music.** Put a licensed track (about 30 s) in `public/<your-film>/`. Then:

```
python tools/beat_grid.py public/starter/track.mp3 <bpm>          # bar times, and which bars hit hardest
python tools/build_bed.py public/starter/track.mp3 public/starter/bed.mp3 --cut ... --on-grid [--delay s]
```

Cut on bar starts so the strongest bar lands where your payoff headline starts (`npm run timeline -- starter`
prints when every scene and the payoff headline start), then set `music.hitSec` to that second. The starter's own bed was made this way from the LeadFlow track,
so that its strongest bar lands at 36.04 s:
`--delay 1.75 --cut 0.030:25.744 --cut 4.316:25.744 --cut 25.744:29.989 --on-grid`. If the payoff misses the hit,
`npm run timeline` and the Studio's browser console say by how much.

**6. Render, check, finish.** Same as the two films below: render, `tools/finish_audio.py`, then
`tools/contact_sheet.py` and `tools/film_transcript.py <film> small.en en`, and look before you send it.

**Going further.** Colours are in `film.json` and fonts in `src/starter/theme.tsx`. The positions of the boards and
the camera's path are in `src/starter/stage.ts`, and the boards' looks in `src/starter/parts.tsx`. For a scene the
four board types can't show (a phone screen, a map, your own product's screen), add a type to `parts.tsx`, or ask
Claude Code to build it with the skill. The two finished films show what such custom scenes look like.

## Render the two finished films

```
npm run render:leadflow                      # out/leadflow-raw.mp4, about 3 minutes
python tools/finish_audio.py out/leadflow-raw.mp4 out/leadflow-reel.mp4

npm run render:receptionist                  # out/receptionist-raw.mp4
python tools/finish_audio.py out/receptionist-raw.mp4 out/receptionist-reel.mp4
```

`finish_audio.py` brings the sound to -14 LUFS with peaks under -1.5 dBTP; the picture is copied untouched. Render
one film at a time. To look around inside a film, `npm run studio` opens Remotion's editor in the browser.

The storyboard stills: `npx remotion still src/index.ts RecSheet out/storyboard.png`.

## Tools

| | |
|---|---|
| `tools/reelkit_gemini_voiceover.py` | Records a whole script in one Gemini call, times every word with a local speech model and cuts one file per line. `--scene <id>` re-records one line in the same voice and style. `--align-only` re-cuts the newest take for free. |
| `tools/gemini_tts.py` | Text to a WAV in a Gemini voice (used by the tool above). `--check` says whether the key is found. |
| `tools/print_timeline.mjs` | `npm run timeline -- <film>`: when each scene of a starter-based film starts, and whether the payoff lands on the music's hit. |
| `tools/voice_plan.py` | Writes a film's voice project (`voice/<film>/plan.json`, `gemini-voice.json`) from its `film.json`. |
| `tools/sync_voice.py` | Puts a recorded narration into the film: copies the lines to `public/<film>/` and writes `src/<film>/voice.json`. |
| `tools/blind_check.py` | Transcribes each line with no script given to the model, to hear what the voice really said. |
| `tools/film_transcript.py` | Blind transcript of a rendered film with times: every line there, in order, nothing cut off. |
| `tools/beat_grid.py` | A track's bar times and which bars hit hardest. |
| `tools/build_bed.py` | Cuts the track into a bed as long as the film, on the bars, so a strong bar lands on the payoff. |
| `tools/contact_sheet.py` | One picture of many moments of a render, to review it at a glance. |
| `tools/layout_check_example.py` | Projects a 3D film's boards through each camera position with numbers, before any animation is written. |
| `tools/finish_audio.py` | Final loudness and peaks for delivery. |
| `tools/ask_chatgpt.py` | Sends a script brief to ChatGPT and saves the answer, for a second writer. |

## Change the narration of a finished film

```
# 1. edit voice/leadflow/plan.json (the words) and gemini-voice.json (voice, style, "spoken" niqqud spellings)
<speech Python> -X utf8 tools/reelkit_gemini_voiceover.py --project voice/leadflow               # every line
<speech Python> -X utf8 tools/reelkit_gemini_voiceover.py --project voice/leadflow --scene quote # one line
# 2. listen without the script
<speech Python> -X utf8 tools/blind_check.py voice/leadflow
# 3. put it in the film; the timeline follows the new lengths
python tools/sync_voice.py leadflow
# 4. if the timing moved, rebuild the music bed so the strong bar still lands on the payoff (see HOW-THEY-WERE-MADE.md)
```

The two beds rebuild exactly from their tracks (same timing, same loudness):

```
python tools/build_bed.py public/leadflow/track-source.mp3 public/leadflow/bed.mp3 --cut 2.643:25.784 --cut 4.316:25.784 --cut 17.173:30
python tools/build_bed.py public/receptionist/track-source.mp3 public/receptionist/bed.mp3 --delay 1.45 --cut 0:22.728 --cut 9.637:22.728 --cut 9.637:30 --on-grid
```

## Delivery copies

The master is the finished file above. For chats (WhatsApp, Telegram, a 30 MB upload limit) and for a website:

```
ffmpeg -i out/leadflow-reel.mp4 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart out/leadflow-share.mp4
ffmpeg -i out/leadflow-reel.mp4 -vf scale=720:1280 -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart out/leadflow-web.mp4
ffmpeg -ss 47.4 -i out/leadflow-reel.mp4 -frames:v 1 -vf scale=720:1280 out/leadflow-poster.jpg
```

## Traps we hit

- **Check what the voice said without the script.** The voiceover tool gives the speech model the script as a hint,
  so its own transcript reports what was expected. Blind, it caught "דנה" said as "דן" and "גם לו" heard as
  "גם לא". The fix is in `gemini-voice.json`: a `spoken` spelling with niqqud, a style note, and that one line
  re-recorded. Trust the Hebrew model (ivrit-ai); generic Whisper models slip on Hebrew that was said correctly.
- **A camera that flies through a 3D board shows a huge blurry plane.** The films fade a board out when the eye is
  within about 1000 px of it.
- **`backdrop-filter` blur does not work in a 3D scene.** The cards use a solid dark glass instead (`SolidGlass`).
- **Instagram covers the top corners down to about y 250** (the "Reels" label and the camera button) and the bottom
  with the caption and buttons. Badges go top centre; captions sit around y 1450.
- **Right-to-left flex reverses a counter like "01 / 07".** Render it as one `dir="ltr"` unit.
- **After a card lands, hold 0.6 to 1 s before the next close-up opens.** The first LeadFlow cut opened panels
  4-12 frames after landing and nothing could be read.
- **For many stills, bundle once:** `npx remotion bundle src/index.ts --out-dir out/bundle`, then
  `npx remotion still out/bundle LeadFlow3D out/f.png --frame=N`. Bundling for each still is much slower.
- **Render one film at a time.** A render next to another heavy job can fail.

## Credits and use

- Code, voice and films were made with Claude Code for Mashtech. The products, their names and the copy in the films
  are Mashtech's: use the films as a worked example, not as ads to republish.
- The narration is Gemini TTS (voice Sulafat). The music tracks come from the [Reelkit](https://reelkit.cc) music
  library ("Minimal Tech Pulse" for the receptionist, "Product Film Glide" for LeadFlow; the starter's bed is cut
  from the LeadFlow track). For your own published films, get your own track there or from another licensed source.
- Fonts: Karantina, Assistant and JetBrains Mono from Google Fonts (SIL Open Font License), loaded by
  `@remotion/google-fonts` at render time.
- Remotion has its own license: free for individuals and small companies, a paid license for larger ones. See
  [remotion.dev/license](https://www.remotion.dev/license).
