# Code-drawn product reels

A Remotion project with two finished vertical reels (`Receptionist3D`, `LeadFlow3D`) and the method to make more.

- To make or change a film, read `skills/code-drawn-product-reel/SKILL.md` and `skills/video-playbook/SKILL.md`
  first, and follow the approval gates in the first one: written approval of the hook and every voice line, then a
  storyboard, then one cut until it's approved.
- `HOW-THEY-WERE-MADE.md` shows the whole process on the two films. `README.md` has setup, commands and traps.
- Facts in a film come only from the product itself (landing page, code). Sample data is marked "לדוגמה".
- Keys live in `.env` (git ignores it): `GEMINI_API_KEY` for the voice, `OPENAI_API_KEY` only for
  `tools/ask_chatgpt.py`. Never print them. Voice recordings and ChatGPT calls cost money; ask before running them.
- Render one film at a time. After every render, run `tools/film_transcript.py` and `tools/contact_sheet.py` and look
  at the result before you send it.
