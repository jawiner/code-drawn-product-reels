"""Fetch the films' music from the Reelkit library and rebuild the three beds.

The music is not in this repository: the tracks belong to the Reelkit library (https://reelkit.cc), so each
person downloads them from there. This needs the Reelkit CLI on your PATH and ffmpeg (for build_bed.py).

    python tools/get_music.py

It makes a private throwaway Reelkit project in a temp folder, pulls the two tracks into it, copies them to
public/<film>/track-source.mp3 and cuts each bed with tools/build_bed.py (the same cuts the films were made with):

    public/leadflow/bed.mp3       from "Product Film Glide"  (music-product-film-glide)
    public/receptionist/bed.mp3   from "Minimal Tech Pulse"  (music-minimal-tech-pulse)
    public/starter/bed.mp3        from "Product Film Glide", cut so its strongest bar lands at 36.04 s

These files are in .gitignore: don't commit them. For your own published films, use a track you have the rights to.
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"

TRACKS = {
    "leadflow": "music-product-film-glide",
    "receptionist": "music-minimal-tech-pulse",
}

BEDS = [
    ("leadflow", "leadflow",
     ["--cut", "2.643:25.784", "--cut", "4.316:25.784", "--cut", "17.173:30"]),
    ("receptionist", "receptionist",
     ["--delay", "1.45", "--cut", "0:22.728", "--cut", "9.637:22.728", "--cut", "9.637:30", "--on-grid"]),
    ("leadflow", "starter",
     ["--delay", "1.75", "--cut", "0.030:25.744", "--cut", "4.316:25.744", "--cut", "25.744:29.989", "--on-grid"]),
]


def run(cmd, cwd=None):
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode != 0:
        sys.exit(f"Failed: {' '.join(map(str, cmd))}\n{result.stdout}{result.stderr}")
    return result.stdout


def main():
    reelkit = shutil.which("reelkit")
    if not reelkit:
        sys.exit("The Reelkit CLI isn't on your PATH. Install it from https://reelkit.cc, then run this again.")
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg isn't on your PATH (build_bed.py needs it).")

    with tempfile.TemporaryDirectory(prefix="reels-music-") as tmp:
        run([reelkit, "init", "music", "--aspect", "9:16", "--private"], cwd=tmp)
        project = Path(tmp) / "music"
        for film, asset_id in TRACKS.items():
            print(f"Pulling {asset_id} ...")
            run([reelkit, "assets", "pull", asset_id], cwd=project)
            source = project / "assets" / "lib" / asset_id / "track.mp3"
            if not source.exists():
                sys.exit(f"Reelkit didn't write {source}.")
            target = PUBLIC / film / "track-source.mp3"
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)

    for track_film, bed_film, args in BEDS:
        track = PUBLIC / track_film / "track-source.mp3"
        bed = PUBLIC / bed_film / "bed.mp3"
        bed.parent.mkdir(parents=True, exist_ok=True)  # public/starter/ holds only the bed, so a clone hasn't got it
        print(f"Cutting {bed.relative_to(ROOT).as_posix()} ...")
        run([sys.executable, str(ROOT / "tools" / "build_bed.py"), str(track), str(bed), *args])

    print("Done: the three films have their music.")


if __name__ == "__main__":
    main()
