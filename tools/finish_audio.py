"""Bring an exported film's sound to -14 LUFS with true peaks at or below -1.5 dBTP; the picture is copied untouched.

    python finish_audio.py <in.mp4> <out.mp4> [--i -14] [--tp -1.5]

WhatsApp and mail clients re-encode the sound, and peaks above about -1 dBTP can clip on hard consonants and
sound-effect hits. This runs ffmpeg's loudnorm twice (measure, then apply with the measured values, linear when
the target allows it), holds sample peaks 1 dB under the target so the encoded file stays under it, keeps the
export's audio bitrate, AAC at 48 kHz, puts the index at the front, and prints the result's integrated loudness
and true peak. Run `reelkit export --verify-only --preset <id> <out.mp4>` after.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("src", type=Path)
ap.add_argument("dst", type=Path)
ap.add_argument("--i", type=float, default=-14.0)
ap.add_argument("--tp", type=float, default=-1.5)
a = ap.parse_args()


def run(args):
    return subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace")


probe = json.loads(run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=bit_rate", "-of", "json", str(a.src)]).stdout)
bitrate = int(probe["streams"][0].get("bit_rate") or 192000)
bitrate = max(96000, round(bitrate / 1000) * 1000)

target = f"loudnorm=I={a.i}:TP={a.tp}:LRA=11"
measured = run(["ffmpeg", "-hide_banner", "-i", str(a.src), "-af", f"{target}:print_format=json", "-vn", "-f", "null", "-"])
m = json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", measured.stderr, re.S)[-1])
# The AAC encoder adds its own inter-sample peaks, so after loudnorm a sample-peak limiter holds the signal 1 dB
# under the true-peak target (at 48 kHz, the rate that is encoded).
limit = 10 ** ((a.tp - 1.0) / 20)
af = (f"{target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
      f"aresample=48000,alimiter=limit={limit:.4f}:attack=5:release=50:level=false")
a.dst.parent.mkdir(parents=True, exist_ok=True)
done = run(["ffmpeg", "-hide_banner", "-y", "-i", str(a.src), "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", "-af", af,
            "-c:a", "aac", "-b:a", str(bitrate), "-ar", "48000", "-movflags", "+faststart", str(a.dst)])
if done.returncode != 0:
    raise SystemExit(done.stderr[-2000:])

check = run(["ffmpeg", "-hide_banner", "-i", str(a.dst), "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"])
i_val = re.findall(r"I:\s+(-?[\d.]+) LUFS", check.stderr)[-1]
tp_val = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", check.stderr)[-1]
print(f"{a.dst.name}: before {m['input_i']} LUFS / {m['input_tp']} dBTP, after {i_val} LUFS / {tp_val} dBTP, audio {bitrate // 1000} kb/s")
if float(tp_val) > a.tp + 0.3:
    raise SystemExit(f"true peak {tp_val} dBTP is above the {a.tp} dBTP limit")
