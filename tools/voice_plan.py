"""Make (or update) a film's voice project from its film.json, so the script lives in one place.

    python tools/voice_plan.py starter

Reads src/<film>/film.json and writes voice/<film>/plan.json: one scene per line, in order, which is what
tools/reelkit_gemini_voiceover.py records. It also writes voice/<film>/gemini-voice.json from film.json's
"voice" block (the voice's name and how to speak); "spoken" spellings you added there by hand are kept.

Then:
    <speech Python> -X utf8 tools/reelkit_gemini_voiceover.py --project voice/<film> [--language en --asr-model small.en]
    <speech Python> -X utf8 tools/blind_check.py voice/<film> [--language en --models small.en]
    python tools/sync_voice.py <film>

Run it again after every change to a line in film.json. A recorded line whose words no longer match film.json is
ignored by the film (it falls back to estimated timing) until you record it again.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GEMINI_MODEL = "gemini-3.8-flash-tts"
# The voice tool insists on a Reelkit voiceId, but only as a label: the sound is Gemini's.
LABEL_VOICE_ID = "HjnCa0x8VgfBjy158Gpj"


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    film_name = sys.argv[1]
    film_path = ROOT / "src" / film_name / "film.json"
    if not film_path.exists():
        sys.exit(f"no {film_path.relative_to(ROOT)}")
    film = json.loads(film_path.read_text(encoding="utf-8"))
    scenes = [{"id": s["id"], "narration": " ".join(s["line"].split())} for s in film["scenes"]]
    voice = film.get("voice") or {}
    project = ROOT / "voice" / film_name
    project.mkdir(parents=True, exist_ok=True)

    plan = {"title": film_name, "aspect": "9:16", "mode": "motion", "voiceId": LABEL_VOICE_ID,
            "pace": voice.get("pace", "normal"), "scenes": scenes}
    (project / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    cfg_path = project / "gemini-voice.json"
    cfg = json.loads(cfg_path.read_text(encoding="utf-8")) if cfg_path.exists() else {"spoken": {}}
    cfg["voice"] = voice.get("name", cfg.get("voice", "Sulafat"))
    cfg["model"] = cfg.get("model", GEMINI_MODEL)
    if voice.get("style"):
        cfg["style"] = voice["style"]
    ids = {s["id"] for s in scenes}
    stale = [k for k in cfg.get("spoken", {}) if k not in ids]
    cfg = {"voice": cfg["voice"], "model": cfg["model"], "style": cfg.get("style", ""), "spoken": cfg.get("spoken", {})}
    cfg_path.write_text(json.dumps(cfg, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    words = sum(len(s["narration"].split()) for s in scenes)
    print(f"voice/{film_name}/plan.json: {len(scenes)} lines, {words} words · voice {cfg['voice']}")
    if stale:
        print(f"note: gemini-voice.json has 'spoken' spellings for scenes that no longer exist: {', '.join(stale)}")


if __name__ == "__main__":
    main()
