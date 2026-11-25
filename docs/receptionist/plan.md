# AI receptionist reel: remake plan (2026-11-24)

Reference: https://www.instagram.com/reel/DffhT_iRb6z/ (downloaded to reference/media/video.mp4,
frames in reference/frames, transcript in study2/transcript.txt).

## Owner's picks
- Drawn in code (like the reference, no credits). No Open Higgsfield / Higgsfield MCP / Reelkit.
- No laptop: the film itself, full screen 9:16.
- Hebrew AI voice (Gemini TTS).
- STATUS (2026-11-24): Hook C chosen; owner rewrote beats 0-4, 4-8 and 28-33. **BEATS APPROVED** ("approved, use
  אליה and make the storyboard"). Next: storyboard of stills, wait for the owner's OK before animating.

## Their format (blueprint)
74 s, one handheld phone shot of a laptop in a dark room, no cuts. Narrator talks 96% of the time (171 wpm).
Overlay "0% Higgsfield / 100% Claude" + logo at the top for the first ~10 s, then gone.
The laptop plays a code-drawn sci-fi HUD film:
- 0:00-0:10 problem: phone on a desk in glowing red rings, missed-call cards stack up, "07:00 -> 21:04" hours card, "4 quotes to write".
- 0:10-0:20 turn: camera flies into a wireframe globe hub ("the manager").
- 0:21-0:31 receptionist node: voice orb, "AI receptionist / answers, qualifies, books".
- 0:31-1:00 one node every ~4-5 s (quotes, follow-up, SEO, analytics, ads, reviews), each a coloured icon ring
  with a HUD label "AGENT 0X // ACTIVE" + a 2-3 word duty line, linked to the hub by a light beam.
- 1:00-1:06 Monday briefing: back down to the phone on the desk.
- 1:06-1:14 payoff: wide shot of the whole constellation, big title "NINE AGENTS. ONE TEAM." + tagline.
Formula: pain on a real object -> fly into a glowing core -> one lit node per job, each adds something new -> back to
the owner's phone -> wide payoff title.

## Our version (~37 s, 9:16, Hebrew voice)
Look: the receptionist's own brand, not theirs: night green, green = answered, coral = waiting for a call back,
Karantina headlines + IBM Plex Sans Hebrew + IBM Plex Mono, the portal's live waveform as the core (no globe).
Facts only from the landing page (public/landing.html). Sample names/numbers marked "לדוגמה".
Brand name only on the end card (playbook #3).

| s | mirrors | on screen | voice |
|---|---|---|---|
| 0-4 | their 0:00-0:10 missed calls (Hook C) | opens straight on the phone screen: four coral rows marked "שיחה שלא נענתה"; title above them "מי התקשר? מה הוא רצה?" | כשאתם באמצע עבודה, מי יודע מה פספסתם? |
| 4-8 | their 0:10-0:20 fly into the hub | a new call comes in; the ring timer reaches 20 seconds, then the call passes into the green waveform | אחרי עשרים שניות בלי מענה, השיחה עוברת אליה. |
| 8-13 | their 0:21-0:31 receptionist | node 1 "עונה בעברית": cards fly out of the core: שעות פעילות, שירותים, שאלות נפוצות | היא עונה בעברית, ורק ממה שכתבתם לה: שעות, שירותים, שאלות נפוצות. |
| 13-18 | their 0:31-0:36 quotes | node 2 "רושמת למי לחזור": card builds שם · מה צריך · מתי נוח; the number lights up digit by digit | שואלת מה צריך ומתי נוח לחזור, ומקריאה את המספר ספרה אחר ספרה. |
| 18-23 | their 0:36-0:45 follow-up | node 3 "קובעת תור": week grid, two free slots glow, one locks "נקבע · המענה קבע" | ובחבילת היומן היא גם קובעת תור, רק בשעה פנויה ורק אחרי כן ברור. |
| 23-28 | their 0:56-1:00 reviews | node 4 "יודעת מה לא להגיד": chips "לא מבטיחה מחיר" · "אומרת שהיא ממוחשבת" · "חירום: 101" | מחיר בשמכם היא לא מבטיחה, ואם שואלים, היא אומרת שהיא ממוחשבת. |
| 28-33 | their 1:00-1:06 Monday briefing | back to the same call-log screen: the calls the receptionist handled now show a name, the reason for calling and a good time to call back; calls still waiting for a call back stay coral; sample details marked "לדוגמה" | עכשיו אתם רואים מי התקשר, מה הוא צריך ומתי לחזור אליו. |
| 33-37 | their 1:06-1:14 payoff | wide: the core with its 4 lit nodes, "אף שיחה לא נשארת רק מספר." then end card "מזכירה קולית" + "לכתוב לנו בוואטסאפ" | הטלפון מצלצל אצלכם קודם. כשאתם לא יכולים, היא עונה. |

## v2: three more agents (owner asked 2026-11-24: "add a message agent and monday briefing and review agent")
STATUS: **APPROVED by the owner 2026-11-24 ("yes, approved, record and animate it"). Recorded + animated (v2).**
v3 (same film, moving 3D camera, comp Receptionist3D) **APPROVED by the owner 2026-11-25 ("approved, commit it")**, committed b8d868f in internal/showcase-films.
v4 = v3 + "נפתח בקרוב · הרשמה מוקדמת" tag (top centre from 4 s) and end card "נפתח בקרוב" + button "להרשמה מוקדמת בוואטסאפ"; **APPROVED 2026-11-25**, committed 20e3f30. Caption: instagram-caption.txt.
On-screen sample hours in the WhatsApp reply are 08:00-17:00 (same as node 01), not 07:30. Approved beats and lines stay word for word;
only the rows marked NEW are new. Facts: WhatsApp answering exists; weekly summary + review request were built
for this on 2026-11-24 (saas/ai-receptionist, docs/outreach.md). The summary goes Sunday or Monday morning (owner
picks), so the voice says "בתחילת כל שבוע". The review request goes 2 hours after the visit, only on "מענה + יומן".
Runtime ~40 s -> ~55 s. Sample details marked "לדוגמה".

| s | on screen | voice |
|---|---|---|
| 0-4 | (approved) missed-call log | כשאתם באמצע עבודה, מי יודע מה פספסתם? |
| 4-8 | (approved) ring timer -> green wave | אחרי עשרים שניות בלי מענה, השיחה עוברת אליה. |
| 8-13 | (approved) node 1 "עונה בעברית" | היא עונה בעברית, ורק ממה שכתבתם לה: שעות, שירותים, שאלות נפוצות. |
| 13-18 | (approved) node 2 "רושמת למי לחזור" | שואלת מה צריך ומתי נוח לחזור, ומקריאה את המספר ספרה אחר ספרה. |
| 18-23 | (approved) node 3 "קובעת תור" | ובחבילת היומן היא גם קובעת תור, רק בשעה פנויה ורק אחרי כן ברור. |
| 23-28 | NEW node 4 "עונה בוואטסאפ": a WhatsApp thread builds: customer "אתם פתוחים מחר?" -> her reply "כן, מ-07:30 עד 17:00. לקבוע לכם תור?" (לדוגמה) | **ומי שכותב לעסק בוואטסאפ? גם לו היא עונה, מאותם פרטים.** |
| 28-33 | NEW node 5 "מבקשת ביקורת": a calendar card "התור הסתיים", a clock jumps +2 שעות, a WhatsApp bubble flies out: "שלום דנה, תודה שהגעתם... ביקורת קצרה בגוגל", five outline stars fill (no Google logo) | **שעתיים אחרי התור, היא שולחת ללקוח קישור לביקורת בגוגל.** |
| 33-38 | (approved) node 6 "יודעת מה לא להגיד" | מחיר בשמכם היא לא מבטיחה, ואם שואלים, היא אומרת שהיא ממוחשבת. |
| 38-43 | (approved) back to the call log, handled calls with name/reason/time | עכשיו אתם רואים מי התקשר, מה הוא צריך ומתי לחזור אליו. |
| 43-48 | NEW the phone lights up with a WhatsApp message "הסיכום השבועי של המזכירה הקולית": שיחות שהיא ענתה 31 · ביקשו שתחזרו 5 · תורים שהיא קבעה 7 (לדוגמה) | **ובתחילת כל שבוע מחכה לכם בוואטסאפ סיכום של השבוע שעבר.** |
| 48-55 | (approved) wide: the core with its 6 lit nodes, "אף שיחה לא נשארת רק מספר." then end card | הטלפון מצלצל אצלכם קודם. כשאתם לא יכולים, היא עונה. |

Not in the film on purpose: "replies to every Google review" (not built: needs Google Business Profile API access),
"asks only happy customers" (Google forbids asking only them; she asks everyone who came).

## Hook options (only 0-4 s changes) — owner chose C (2026-11-24), beats 0-4 / 4-8 / 28-33 as rewritten above
A. Ring timer (playbook #10, #11): no text for ~2 s, the phone rings while a big timer runs 00:01 -> 00:20; at ~2.5 s it
   hits 20 and the call jumps into the core; freeze, dim 40%, words build "20 שניות. ואז היא עונה."
B. Question (playbook #4): frame 1 "מי עונה כשאתם באמצע עבודה?" over the ringing phone; answered by the last line.
C. Missed-call log (the landing's own idea): frame 1 four coral "שיחה שלא נענתה" rows, text "מי זה היה? מה הוא רצה?";
   the same rows come back at 28 s with names and reasons.
D. Their flex, translated: "0% צילום. 100% קוד." Only for an audience of builders (e.g. Mashtech's account),
   means nothing to a garage owner.

## Not copied
Their words, the globe, their colours, the nine agents, the Claude/Higgsfield overlay, their music.
