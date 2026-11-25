"""Build a film's music bed from one track: cut pieces of it, join them with short crossfades, then set the loudness.

The films' music is a 30 s track. The bed is longer and is cut so that a strong bar of the music lands exactly on
the film's payoff headline. Find the bar times first with tools/beat_grid.py, then cut on them.

    python tools/build_bed.py <track.mp3> <bed.mp3> --cut START:END [--cut START:END ...]
                              [--delay SECONDS] [--xfade 0.04] [--lufs -15]

The two beds in this repo:

    # LeadFlow (112 BPM): bar 8 of the bed lands at 44.53 s, the payoff headline
    python tools/build_bed.py public/leadflow/track-source.mp3 out/leadflow-bed.mp3 \
        --cut 2.643:25.784 --cut 4.316:25.784 --cut 17.173:30

    # Receptionist (110 BPM): the 22.728 s accent lands 43 frames after the payoff headline starts
    python tools/build_bed.py public/receptionist/track-source.mp3 out/receptionist-bed.mp3 \
        --delay 1.45 --cut 0:22.728 --cut 9.637:22.728 --cut 9.637:30

An END past the end of the track just means "to the end". Needs ffmpeg on PATH.
"""
import argparse
import subprocess
import sys


def parse_cut(text):
    a, b = text.split(":")
    return float(a), float(b)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("track")
    ap.add_argument("out")
    ap.add_argument("--cut", action="append", type=parse_cut, required=True, help="START:END in seconds of the track")
    ap.add_argument("--delay", type=float, default=0.0, help="silence before the music starts, in seconds")
    ap.add_argument("--xfade", type=float, default=0.04, help="crossfade at each join, in seconds (qsin curve)")
    ap.add_argument("--lufs", type=float, default=-15.0, help="integrated loudness of the bed")
    ap.add_argument("--on-grid", action="store_true", help="joins don't shorten the bed (see above)")
    a = ap.parse_args()

    n = len(a.cut)
    parts = [f"[0:a]asplit={n}" + "".join(f"[a{i}]" for i in range(n)) if n > 1 else "[0:a]anull[a0]"]
    for i, (s, e) in enumerate(a.cut):
        if a.on_grid and i < n - 1:
            e += a.xfade
        parts.append(f"[a{i}]atrim=start={s}:end={e},asetpts=PTS-STARTPTS[s{i}]")
    last = "s0"
    for i in range(1, n):
        parts.append(f"[{last}][s{i}]acrossfade=d={a.xfade}:c1=qsin:c2=qsin[x{i}]")
        last = f"x{i}"
    ms = round(a.delay * 1000)
    parts.append(f"[{last}]adelay={ms}:all=1,aresample=48000[joined]" if ms else f"[{last}]aresample=48000[joined]")
    graph = ";".join(parts)

    # One-pass ffmpeg loudnorm with its default true-peak and range settings: what both films' beds were made with.
    subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", a.track, "-filter_complex",
                    graph + f";[joined]loudnorm=I={a.lufs},aresample=48000[o]", "-map", "[o]",
                    "-c:a", "libmp3lame", "-b:a", "192k", a.out], check=True)
    dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.out],
                         capture_output=True, text=True, check=True).stdout.strip()
    print(f"wrote {a.out}: {float(dur):.3f} s, {n} pieces, loudness target {a.lufs} LUFS")


if __name__ == "__main__":
    main()
