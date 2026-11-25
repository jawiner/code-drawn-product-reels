# Code-drawn product reels

Two vertical Hebrew reels (9:16, about 55 s each) made for two software products: an AI phone receptionist
("מזכירה קולית") and LeadFlow, a CRM for small sellers. Every frame is drawn in code with
[Remotion](https://www.remotion.dev) (React): no camera, no screen recording, no stock footage, no AI video
generator. Google's Gemini text-to-speech reads the narration, and a music bed is cut on the beat so the strongest
bar lands on the payoff.

Everything that went into them is here: the finished films, the code that renders them, the voice and music, the
tools, the scripts from first brief to the approved version, and the skills Claude Code used. You can render both
films again exactly as they are, then make your own the same way.

**Watch first:** [`films/receptionist-reel.mp4`](films/receptionist-reel.mp4) (56 s) and
[`films/leadflow-reel.mp4`](films/leadflow-reel.mp4) (55 s). Then read
[`HOW-THEY-WERE-MADE.md`](HOW-THEY-WERE-MADE.md), the story of both films from idea to the approved cut, including
what was rejected and why.

## What's here

| | |
|---|---|
| `films/` | The two finished films and the receptionist storyboard the animation was approved from. |
| `HOW-THEY-WERE-MADE.md` | Step by step, for both films: brief, hooks, approvals, voice, music, 3D camera, the rejected cut. |
| `skills/code-drawn-product-reel/` | A Claude Code skill: the whole method, written so an agent can follow it for a new product. |
| `skills/video-playbook/` | The owner's video-marketing playbook (hooks, story, pacing, endings), the skill both films followed. |
| `docs/` | The real planning files: the receptionist plan with four hook options, the LeadFlow briefs sent to ChatGPT, its answers, and scripts v1 to v3. See [`docs/README.md`](docs/README.md). |
| `src/` | The Remotion code. `src/receptionist/` (film, 3D film, storyboard stills, shared parts) and `src/leadflow/`. |
| `public/` | What the films play: each narration line (`vo-<scene>.mp3`), the music bed (`bed.mp3`) and the track it was cut from. |
| `voice/` | The two narration projects: script (`plan.json`), voice and delivery notes (`gemini-voice.json`), word timings. |
| `tools/` | Voice, music, review and finishing scripts (table below). |

## What you need

- **Node 22 or newer** and **ffmpeg + ffprobe** on your PATH.
- **Python 3.10 or newer.**
- To record new narration: a **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey). Every
  recording is billed to it. On the free tier the voice model allows 3 requests a minute and has a low daily limit,
  so the voiceover tool records a whole script in one request.
- Optional: an **OpenAI API key**, only to get a second script draft from ChatGPT (`tools/ask_chatgpt.py`).
- **Claude Code**, to make a new film with the skill.

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

## Render the two films

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
| `tools/sync_voice.py` | Puts a recorded narration into the film: copies the lines to `public/<film>/` and writes `src/<film>/voice.json`. |
| `tools/blind_check.py` | Transcribes each line with no script given to the model, to hear what the voice really said. |
| `tools/film_transcript.py` | Blind transcript of a rendered film with times: every line there, in order, nothing cut off. |
| `tools/beat_grid.py` | A track's bar times and which bars hit hardest. |
| `tools/build_bed.py` | Cuts the track into a bed as long as the film, on the bars, so a strong bar lands on the payoff. |
| `tools/contact_sheet.py` | One picture of many moments of a render, to review it at a glance. |
| `tools/layout_check_example.py` | Projects a 3D film's boards through each camera position with numbers, before any animation is written. |
| `tools/finish_audio.py` | Final loudness and peaks for delivery. |
| `tools/ask_chatgpt.py` | Sends a script brief to ChatGPT and saves the answer, for a second writer. |

## Change the narration of a film

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
  library ("Minimal Tech Pulse" for the receptionist, "Product Film Glide" for LeadFlow); for your own published
  films, get your own track there or from another licensed source.
- Fonts: Karantina, Assistant and JetBrains Mono from Google Fonts (SIL Open Font License), loaded by
  `@remotion/google-fonts` at render time.
- Remotion has its own license: free for individuals and small companies, a paid license for larger ones. See
  [remotion.dev/license](https://www.remotion.dev/license).
