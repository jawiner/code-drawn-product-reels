# How the two reels were made

Both films were made in Claude Code over two days (24 and 25 November 2026), with the product owner approving each
step in writing. This is what happened, in order, including the cut that was rejected. The method behind it is in
[`skills/code-drawn-product-reel/SKILL.md`](skills/code-drawn-product-reel/SKILL.md).

## The rules both films followed

These come from the owner, and from what earlier reels taught (see [`skills/video-playbook`](skills/video-playbook/SKILL.md)):

1. **Nothing is produced until the owner approves the words in writing.** First the idea and the hook options, then
   every voice line word for word, then a storyboard of stills, and only then the animation. Clicking a
   "Recommended" option in a question box doesn't count as approval.
2. **One video until it's approved.** Send a single chat-size file and wait for a yes. Other versions (formats,
   share copies, web copies) come after that yes.
3. **Frame 1 is the whole hook.** Open on the result or the pain, never on a half-built card or an AI-generated person.
4. **The brand name appears only at the end** (playbook #3). Until then the product is just part of the story.
5. **End on the benefit**, not on "it's free".
6. **Only real facts.** Every feature shown exists in the product, checked against its landing page and code. Sample
   names and numbers are marked "לדוגמה" (example) on screen. Anything not built yet stays out of the film.
7. **No hard cuts or long silences.** Dissolve between beats and keep pauses in the voice short.

## Film 1: the AI receptionist ("מזכירה קולית")

**The brief.** The owner sent an Instagram reel: a phone filming a laptop that plays a code-drawn sci-fi film
(missed calls, then a glowing hub, then nine agent nodes, then "Nine agents. One team."). The request: "make a
similar video for my AI receptionist."

**Three choices first.** Asked as three questions: drawn in code or AI video (code), filmed on a laptop or full
screen (full screen 9:16), and the voice (a Hebrew AI voice, Gemini).

**Study the reference, take only the technique.** Claude broke the reference down into a timed outline: 74 s, the
narrator talks 96% of the time, pain on a real object → fly into a glowing core → one lit node per job, each adding
something new → back to the owner's phone → a wide payoff title. The words, the globe, the colours, the nine agents
and the music were not copied. The look came from the receptionist's own product: night green, green for answered
calls, coral for calls waiting to be returned.

**Plan and hooks** ([`docs/receptionist/plan.md`](docs/receptionist/plan.md)). Eight beats, about 37 s, every fact
taken from the product's landing page, and four hook options:

- A. a ring timer counting to 20 seconds
- B. a question
- C. the missed-call log
- D. "0% filmed, 100% code", which only works for an audience of builders

The owner chose **C**, rewrote three of the beats in their own words, and wrote "approved".

**Storyboard before animation.** Nine stills, rendered from the real code (compositions `RecFrames` and `RecSheet`),
put on one sheet: [`films/receptionist-storyboard.jpg`](films/receptionist-storyboard.jpg). The owner approved it, and
only then was the film animated.

**v1 (40 s).**
- **Voice:** one Gemini take in the voice Sulafat. One line was re-recorded with niqqud so the voice said
  "הִתְקַשֵּׁר" and not "יתקשר".
- **Music:** "Minimal Tech Pulse" from Reelkit's music library, cut longer and joined with a 1 s crossfade.
- **Delivery:** sent as a single file.

**v2 (56 s): three more agents.** The owner asked for three more agents: answering on WhatsApp, a request for a
Google review two hours after the appointment, and a weekly summary on the owner's phone. Two of them did not exist
in the product yet, so they were **built in the product first**; the film shows only what's real. The new lines were
approved word for word.
- **Voice:** "גם לו" and "גם לא" sound the same in Hebrew, so that line got niqqud and a pause. The on-screen caption
  still shows "לו".
- **Music:** the track is 110 BPM. The bed was rebuilt on its 2-bar accents so one lands just after the payoff
  headline appears.

**v3: a moving 3D camera.** The owner asked, "can't you do it like in the video, with a cool changing angle?" The
voice, music, timing and text stayed the same; the picture became one CSS 3D space:
- the phone lies on a floor grid inside coral rings that turn green
- the core floats above it, and the job boards stand in a circle around it
- an orbit camera (target, distance, yaw, pitch) is keyed per scene and moves smoothly between keys
- titles and captions stay flat on the screen, so they are always sharp and readable

Approved.

**v4: "opening soon".** The product wasn't open yet, so a pill "נפתח בקרוב · הרשמה מוקדמת" was added from 4 s,
centred at the top (Instagram covers the top corners). The end card's button became "early sign-up on WhatsApp".
Approved, and it's the film in `films/`. It now plays from the product's card on the company website.

**Caption** ([`docs/receptionist/instagram-caption.txt`](docs/receptionist/instagram-caption.txt)): written with the
ig-caption and ig-human skills from
[Jakeschincariol/instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill). Their scoring
scripts count only English words, so the Hebrew was checked by hand. The caption has one ask: send the word
"מזכירה" in a DM.

## Film 2: LeadFlow

**The brief.** After the receptionist film went live, the owner asked for a similar film for LeadFlow, and asked
Claude to get ChatGPT's view on the script.

**A second writer.** Claude wrote a brief ([`docs/leadflow/brief-for-chatgpt.md`](docs/leadflow/brief-for-chatgpt.md))
with:
- the product facts, taken from the landing page and the reminder messages in the code
- the owner's video rules
- the receptionist's approved script, as the model to follow
- three hook options

It went to ChatGPT through `tools/ask_chatgpt.py` (about 2 minutes, about $0.19). ChatGPT's idea
([`chatgpt-script.md`](docs/leadflow/chatgpt-script.md)): follow **one business**, Dana's hair studio, from a pin on
the map to a sent quote. Claude reviewed it against the rules ([`script-v1.md`](docs/leadflow/script-v1.md)) and made
three changes:
- open on the result, then rewind
- cut a beat about "only businesses without a website", because LeadFlow is a CRM for anything you sell
- end on the benefit

**v1, approved script, built in code.** The owner merged two hooks, approved the lines and said "draw it in code".
The 3D layout (four boards on a path rising from a dark map of Haifa) was **checked with numbers before any code**
(`tools/layout_check_example.py`): every board's corners projected through every camera position. The bed came from
"Product Film Glide" (112 BPM), cut so its strongest bar lands at 44.53 s, on the payoff. Sent as one file.

**v1 rejected.** The owner said: "it could be much better; you didn't give time to the most important things in the
system." Asked what matters, the owner picked six things that needed screen time: the board, Today and the
reminders, the AI helpers, the daily report, meeting prep, and sending a message. They also asked for the same
length with fewer steps, and to keep Dana's story.

**Script v2 and v3.** Claude asked ChatGPT for a second version and reviewed it
([`docs/leadflow/script-v2.md`](docs/leadflow/script-v2.md)). The owner then pasted their own review:
- one continuous phone scene: Today → the Telegram reminder → the call outcome → the WhatsApp message sent
- reading time on meeting prep: one question the AI asks you, and one it suggests asking Dana
- the report as two or three big figures
- the board as the wide shot the film keeps coming back to, with close-ups for anything people need to read
- full camera moves only for the opening rewind and the final win

The owner also gave three lines word for word. The result was
[`script-v3.md`](docs/leadflow/script-v3.md), which the owner approved.

**v3, rebuilt around the board.**
- **The board:** one board with six columns stands over the map. Dana's card is its own 3D plane that glides from
  column to column while the other cards make room. A big stage label pops up on each landing (playbook #6).
- **Close-ups:** each one opens out of Dana's card, starting from where the card is on screen, while the board dims.
  The phone rises from below.
- **Timing:** after every landing, the film holds the board for 0.6 to 1 s before the next close-up opens. The
  first try opened them almost at once and nothing could be read.
- **Facts:** every on-screen string (the work report's labels, "שליחת הודעה אל ...", the meeting prep headings) was
  copied from the product's code.
- **Voice:** "AI" is spoken the Israeli way (אֵיי־אַיי), spelled that way in `gemini-voice.json`. Heard blind, the
  Hebrew speech model got all nine lines exactly.
- **Music:** the same bed as v1. Its bar 8 lands at 44.53 s, the moment Dana's card lands in "Won".

Approved, and it's the film in `films/`. It also plays from LeadFlow's card on the company website.

## Checks before any cut was sent

Every render went through these checks before the owner saw it:

- a **contact sheet** of many moments (`tools/contact_sheet.py`), to find empty frames, text on top of text, or a
  board flashing past the camera
- a **blind transcript of the film's sound** (`tools/film_transcript.py`): every line there, in order, at its
  planned time, nothing cut off
- **loudness** through `tools/finish_audio.py`: -14 LUFS, peaks under -1.5 dBTP

Some problems these checks found and fixed before sending:

- the map sat empty from 4 to 6 s
- the camera tilted away while the pins were being picked
- the phone was empty for a second
- a stage label sat under the hook's big question
