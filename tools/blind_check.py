"""Hear what the voice really said: transcribe each narration line with NO script given to the speech model.

The voiceover tool gives the model the script as a hint, so its own transcript tends to report what was expected.
Without the hint, this caught "דנה רוצה" said as "דן רוצה" and "גם לו" heard as "גם לא" (fixed with niqqud and a
re-recorded line, see gemini-voice.json "spoken").

    <speech Python> -X utf8 tools/blind_check.py voice/leadflow
    <speech Python> -X utf8 tools/blind_check.py voice/leadflow --ids quote,prep --models ivrit-ai/whisper-large-v3-turbo-ct2,medium

For English: --language en --models small.en (or large-v3-turbo). For Hebrew, trust the ivrit-ai model: the generic
"medium" model slips on Hebrew words that are said correctly, so use
it only as a second opinion. Needs ffmpeg and the speech venv (requirements-speech.txt).
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project", help="the voice project folder, e.g. voice/leadflow")
    ap.add_argument("--ids", help="comma-separated scene ids (default: every scene in plan.json)")
    ap.add_argument("--models", default="ivrit-ai/whisper-large-v3-turbo-ct2")
    ap.add_argument("--language", default="he")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    project = Path(a.project)
    takes = json.loads((project / "assets" / "voiceovers.json").read_text(encoding="utf-8"))
    plan = json.loads((project / "plan.json").read_text(encoding="utf-8"))
    ids = a.ids.split(",") if a.ids else [s["id"] for s in plan["scenes"]]
    for name in a.models.split(","):
        model = WhisperModel(name, device="cpu", compute_type="int8")
        print(f"== {name}")
        for sid in ids:
            e = takes[sid]
            pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(project / e["key"]), "-f", "s16le", "-ac", "1",
                                  "-ar", "16000", "-"], capture_output=True, check=True).stdout
            audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
            segs, _ = model.transcribe(audio, language=a.language, beam_size=5)
            print(f"{sid:9s} script: {e['text']}\n{'':9s} heard : {' '.join(s.text.strip() for s in segs)}\n")


if __name__ == "__main__":
    main()
