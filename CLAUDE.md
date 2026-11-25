# Code-drawn reels

A Remotion project for vertical reels drawn in code. It has a starter film for any subject (`Starter`, made from
`src/starter/film.json`) and two finished product films (`Receptionist3D`, `LeadFlow3D`).

- To make or change a film, read `skills/code-drawn-reel/SKILL.md` and `skills/video-playbook/SKILL.md` first, and
  follow the approval gates in the first one: written approval of the hook and every voice line, then a storyboard,
  then one cut until it's approved.
- A new film starts as a copy of `src/starter/`. Write the story in its `film.json`; write new code only for scenes
  the four board types can't show. `README.md` ("Make your own film") lists every field and command.
- `HOW-THEY-WERE-MADE.md` shows the whole process on the two finished films.
- Facts in a film come only from the subject's own sources. Made-up names and numbers are marked as examples.
- Keys live in `.env` (git ignores it): `GEMINI_API_KEY` for the voice, `OPENAI_API_KEY` only for
  `tools/ask_chatgpt.py`. Never print them. Voice recordings and ChatGPT calls cost money; ask before running them.
- Render one film at a time. After every render, run `tools/film_transcript.py` and `tools/contact_sheet.py` and look
  at the result before you send it.
