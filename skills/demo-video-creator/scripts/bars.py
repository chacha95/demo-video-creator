"""Bar grid + per-bar energy for each music candidate, from beats.py output.
usage: python3 bars.py [assets/music/beats.json]   (run beats.py first)
Prints bar starts with energy 0-9 so you can see breaks/drops, and writes bar_starts_s / bar_energy_0to9 back into
beats.json. Use it to choose post.json music.segments (cut only on bar lines) and where the big hits land."""
import subprocess, json, sys, numpy as np
SR = 22050
P = sys.argv[1] if len(sys.argv) > 1 else "assets/music/beats.json"
B = json.load(open(P))
for k, v in B.items():
    bpm, ph = v["bpm"], v["beat_phase_s"]
    x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", k, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, dtype=np.float32)
    per = 60 / bpm; first = ph % per
    beats = np.arange(first, len(x) / SR, per); bar = per * 4
    e = [float(np.sqrt(np.mean(x[int(t * SR):int((t + bar) * SR)] ** 2))) for t in beats[::4]]
    m = max(e) or 1
    print(k, bpm, "beat0=%.3f" % first, "per=%.4f" % per, " bars:", " ".join("%.1f@%.2f" % (q / m * 9, t) for q, t in zip(e, beats[::4])))
    v.update({"beat_period_s": round(per, 5), "first_beat_s": round(first, 3), "bar_starts_s": [round(float(t), 3) for t in beats[::4]],
              "bar_energy_0to9": [round(q / m * 9, 1) for q in e]})
json.dump(B, open(P, "w"), indent=1)
