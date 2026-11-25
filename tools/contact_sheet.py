"""One picture of many moments of a film, to review a render at a glance (empty frames, text collisions, a board
flashing past the camera, a caption under a title).

    python tools/contact_sheet.py out/leadflow-reel.mp4 out/review            # a frame every 2 s
    python tools/contact_sheet.py out/leadflow-reel.mp4 out/review 0 1.5 3.6 4.2 12 27.5

Writes out/review/sheet.png (6 per row, 270x480 each). Needs ffmpeg and ffprobe.
"""
import subprocess
import sys
from pathlib import Path

if len(sys.argv) < 3:
    sys.exit(__doc__)
film, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
times = [float(t) for t in sys.argv[3:]]
if not times:
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(film)],
                               capture_output=True, text=True, check=True).stdout)
    times = [t * 2.0 for t in range(int(dur // 2) + 1)]
for f in out.glob("f*.png"):
    f.unlink()
for i, t in enumerate(times):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t}", "-i", str(film), "-frames:v", "1",
                    "-vf", "scale=270:480", "-pix_fmt", "rgb24", str(out / f"f{i:02d}.png")], check=True)
cols = 6
rows = (len(times) + cols - 1) // cols
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "1", "-i", str(out / "f%02d.png"), "-vf",
                f"tile={cols}x{rows}:padding=6:color=0x111111", "-frames:v", "1", str(out / "sheet.png")], check=True)
print("sheet:", out / "sheet.png", f"({len(times)} frames)")
