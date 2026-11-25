"""Put a recorded narration into the film: copy the takes the plan uses to public/<film>/ and write src/<film>/voice.json.

The voice is recorded in voice/<film>/ (a Reelkit-style project: plan.json + gemini-voice.json + assets/). The film
reads src/<film>/voice.json (every line's text, length and word times) and plays public/<film>/vo-<scene>.mp3.
voiceovers.json may still hold lines from older versions of the script, so only the scenes in plan.json are copied.

    python tools/sync_voice.py starter
    python tools/sync_voice.py receptionist
"""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    film = sys.argv[1]
    project = ROOT / "voice" / film
    plan = json.loads((project / "plan.json").read_text(encoding="utf-8"))
    takes = json.loads((project / "assets" / "voiceovers.json").read_text(encoding="utf-8"))
    ids = [s["id"] for s in plan["scenes"]]
    missing = [i for i in ids if i not in takes]
    if missing:
        sys.exit(f"not recorded yet: {', '.join(missing)} (run the voiceover tool first)")
    public = ROOT / "public" / film
    public.mkdir(parents=True, exist_ok=True)
    for i in ids:
        shutil.copy2(project / takes[i]["key"], public / f"vo-{i}.mp3")
    out = ROOT / "src" / film / "voice.json"
    out.write_text(json.dumps({i: takes[i] for i in ids}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(takes[i]["durationSec"] for i in ids)
    print(f"{film}: {len(ids)} lines, {total:.1f} s of voice -> {out.relative_to(ROOT)} + public/{film}/vo-*.mp3")


if __name__ == "__main__":
    main()
