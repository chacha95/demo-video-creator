"""Mix balance check on post.py stems. usage (from videos/<name>/): python3 mixcheck.py [renders/post_map.json]
Targets: VO over music during speech >= +8 dB; music over SFX overall >= +2 dB; at big hits SFX may rise above music."""
import subprocess, numpy as np, json, sys
def load(p, sr=16000, w=True):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(sr)] + (["-af", "highpass=f=150,highpass=f=150,equalizer=f=3000:t=q:w=1:g=3"] if w else []) + ["-f", "f32le", "-"], capture_output=True).stdout, np.float32)
M = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "renders/post_map.json"))
m, v, s = load("renders/stem_mus.wav"), load("renders/vo.wav"), load("renders/stem_sfx.wav")
n = min(len(m), len(v), len(s)); m, v, s = m[:n], v[:n], s[:n]
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
w = 160; E = np.sqrt(np.convolve(v ** 2, np.ones(w) / w, "same"))[::w]; sp = np.repeat(E > E.max() * 10 ** (-30 / 20), w)[:n]
print("VO over music (speech) %.1f dB   music over SFX overall %.1f dB" % (db(v[sp]) - db(m[sp]), db(m) - db(s)))
for t in M["big"]:
    a, b = int((t - 0.05) * 16000), int((t + 0.3) * 16000)
    print(" hit %6.2f  sfx-music %+5.1f dB  vo-sfx %+5.1f dB" % (t, db(s[a:b]) - db(m[a:b]), db(v[a:b]) - db(s[a:b])))
