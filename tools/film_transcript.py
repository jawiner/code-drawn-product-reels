"""Blind transcript of a rendered film's soundtrack, with times: is every narration line in the mix, in order, at the
planned moment, and nothing cut off? Run it on every render before anyone sees it.

    <speech Python> -X utf8 tools/film_transcript.py out/leadflow-reel.mp4
    <speech Python> -X utf8 tools/film_transcript.py out/leadflow-reel.mp4 ivrit-ai/whisper-large-v3-turbo-ct2

Default model "small" is quick and good enough to see that all lines are there; use the ivrit-ai model to check words.
"""
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

if len(sys.argv) < 2:
    sys.exit(__doc__)
sys.stdout.reconfigure(encoding="utf-8")
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-vn", "-f", "s16le", "-ac", "1", "-ar", "16000", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
model = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else "small", device="cpu", compute_type="int8")
segs, _ = model.transcribe(audio, language="he", beam_size=5, vad_filter=False)
for s in segs:
    print(f"{s.start:6.2f}-{s.end:6.2f}  {s.text.strip()}")
