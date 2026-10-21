"""Preview a bar-level arrangement of a music bed onto the film grid (post.py does the same inside the final mix).
usage: python3 music_fit.py <src.mp3> <film_seconds> '<segments json>' [out.wav]
  segments = [[out_start, out_end, src_offset], ...]; src_offset = src time - out time for that span.
  e.g. '[[0,28.2,2.225],[28.2,44.2,4.225],[44.2,63.7,-11.775]]' (jumps on bar lines only, 6ms crossfades)"""
import subprocess, sys, json, numpy as np
SR = 48000
src, T, SEG = sys.argv[1], float(sys.argv[2]), json.loads(sys.argv[3])
OUT = sys.argv[4] if len(sys.argv) > 4 else "audio/music_fit.wav"
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32).reshape(-1, 2)
out = np.zeros((int(T * SR), 2), np.float32); F = int(0.006 * SR)
for a, b, off in SEG:
    i0, i1 = int(a * SR), min(len(out), int(b * SR)); s0 = max(0, int((a + off) * SR))
    seg = x[s0:s0 + (i1 - i0)].copy()
    if len(seg) < i1 - i0: seg = np.vstack([seg, np.zeros((i1 - i0 - len(seg), 2), np.float32)])
    r = np.linspace(0, 1, F)[:, None]
    if a > 0: seg[:F] *= r
    if b < T: seg[-F:] *= r[::-1]
    out[i0:i1] += seg
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", OUT], input=out.tobytes(), check=True)
print("wrote", OUT)
