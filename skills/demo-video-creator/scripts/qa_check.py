"""Delivery gate for the finished mp4 (the same checks evals/evals.json asserts).
usage: python3 qa_check.py renders/<name>.mp4 [min_s=50] [max_s=75] [min_cuts_per_10s=3]
Per-case lengths: see references/CASES.md (teaser 12-20s, feature launch 20-40s, launch film 45-75s, walkthrough 60-100s).
Exit code 1 if anything fails. It does not replace looking at strips and the finish audit (SKILL.md §10)."""
import subprocess, sys, json, re, numpy as np
p = sys.argv[1]; lo = float(sys.argv[2]) if len(sys.argv) > 2 else 50; hi = float(sys.argv[3]) if len(sys.argv) > 3 else 75
mc = float(sys.argv[4]) if len(sys.argv) > 4 else 3
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", p], capture_output=True, text=True).stdout)
v = next(s for s in pr["streams"] if s["codec_type"] == "video"); a = [s for s in pr["streams"] if s["codec_type"] == "audio"]
dur = float(pr["format"]["duration"]); num, den = map(int, v["r_frame_rate"].split("/")); fps = num / den
R = []
def chk(name, ok, val): R.append((name, ok, val))
chk("1920x1080", (v["width"], v["height"]) == (1920, 1080), f'{v["width"]}x{v["height"]}')
chk("30fps", abs(fps - 30) < 0.01, f"{fps:.3f}")
chk("H.264 yuv420p", v["codec_name"] == "h264" and v.get("pix_fmt") == "yuv420p", f'{v["codec_name"]} {v.get("pix_fmt")}')
chk(f"duration {lo:g}-{hi:g}s", lo <= dur <= hi, f"{dur:.2f}s")
chk("AAC audio", bool(a) and a[0]["codec_name"] == "aac", a[0]["codec_name"] if a else "none")
if a:
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", e)[-1]); TP = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)[-1])
    chk("-14 LUFS ±1", abs(I + 14) <= 1, f"{I:.1f} LUFS"); chk("true peak <= -1 dBTP", TP <= -0.9, f"{TP:.1f} dBTP")
W, H = 192, 108
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32); d = np.abs(np.diff(F, axis=0)).mean((1, 2))
cuts = [i + 1 for i in range(len(d)) if d[i] > 18 and d[i] > 3 * np.median(d[max(0, i - 5):i + 6])]
chk(f"cuts >= {mc:g}/10s", len(cuts) / dur * 10 >= mc, f"{len(cuts)/dur*10:.1f}/10s ({len(cuts)} cuts)")
fz, s = [], None
for i, x in enumerate(d[: max(0, len(d) - 15)]):  # ignore the last 0.5s (end card may settle)
    if x < 0.08: s = i if s is None else s
    else:
        if s is not None and i - s >= 21: fz.append(f"{s/30:.2f}-{i/30:.2f}")
        s = None
chk("no frozen hold >= 0.7s", not fz, ", ".join(fz) or "none")
adj = [c for c in cuts if c - 1 in cuts]
chk("no double cuts", not adj, ", ".join(f"{c/30:.2f}" for c in adj) or "none")
w = max(len(n) for n, _, _ in R)
for n, ok, val in R: print(("PASS " if ok else "FAIL ") + n.ljust(w) + "  " + val)
sys.exit(0 if all(ok for _, ok, _ in R) else 1)
