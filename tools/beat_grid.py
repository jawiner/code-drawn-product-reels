"""Where a music track's bars start, and which bars hit hardest, so you can cut the bed on the beat
(tools/build_bed.py) and land a strong bar on the film's payoff.

    python tools/beat_grid.py public/leadflow/track-source.mp3 112
    python tools/beat_grid.py public/receptionist/track-source.mp3 110

Give it the track's BPM (Reelkit's music library lists it; otherwise count it). Prints the beat phase, which beat in
the bar is the downbeat, then every bar's start time, loudness and onset "hit". Needs ffmpeg and numpy.
"""
import subprocess
import sys

import numpy as np

if len(sys.argv) != 3:
    sys.exit(__doc__)
path, bpm = sys.argv[1], float(sys.argv[2])
sr = 22050
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(sr), "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = 128
env = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, "same")[::hop])  # RMS envelope
fps = sr / hop
beat = 60 / bpm
d = np.maximum(0, np.diff(env))  # onset strength: rises in energy

# beat phase: the offset whose beat ticks collect the most onset energy
best = (0, -1)
for t0 in np.arange(0, beat, 0.003):
    idx = ((t0 + np.arange(0, 200) * beat) * fps).astype(int)
    idx = idx[idx < len(d) - 2]
    sc = sum(d[i - 1:i + 2].max() for i in idx if i > 1)
    if sc > best[1]:
        best = (t0, sc)
t0 = best[0]
print(f"duration {len(x) / sr:.3f}s  beat {beat:.4f}s  bar {4 * beat:.4f}s  phase {t0:.3f}s")

# which beat in the bar is the downbeat
pos = np.zeros(4)
for k in range(200):
    i = int((t0 + k * beat) * fps)
    if i + 2 >= len(d):
        break
    pos[k % 4] += d[max(1, i - 1):i + 2].max()
down = int(np.argmax(pos))
print("beat-position strength", np.round(pos / pos.max(), 2), "downbeat offset", down)

b0 = t0 + down * beat
bar = 4 * beat
k = 0
while b0 + k * bar < len(x) / sr:
    a = b0 + k * bar
    seg = env[int(a * fps):int((a + bar) * fps)]
    hit = d[max(1, int(a * fps) - 2):int(a * fps) + 3].max() if int(a * fps) + 3 < len(d) else 0
    print(f"bar {k:2d} @ {a:6.3f}s  rms {20 * np.log10(seg.mean() + 1e-9):6.1f} dB  hit {hit * 1000:6.2f}")
    k += 1
