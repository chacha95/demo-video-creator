"""v3 post: retime 23.75fps render -> 30fps, impact FX, music arrangement + VO-following duck, ONE continuous VO take, SFX, -14 LUFS.
usage: python3 scripts/post3.py renders/raw-v3.mp4 renders/evals-demo2-v3.mp4
"""
import subprocess, sys, json, os
import numpy as np
os.chdir(os.path.join(os.path.dirname(__file__), ".."))
RAW, OUT = sys.argv[1], sys.argv[2]
NF = 2016; T = NF / 30; fr = 1 / 30; SR = 48000
VO_OFF = 0.25

BIG = [0.2, 3.7, 24.2, 36.2, 53.2, 65.2]
MED = [1.2, 1.7, 2.2, 2.7, 7.7, 10.7, 12.2, 16.2, 19.7, 28.7, 32.7, 35.2, 41.2, 46.2, 51.2, 55.7, 61.2, 63.2, 64.2]
FLASH = {3.7: 0.5, 24.2: 0.6, 36.2: 0.9, 53.2: 0.85, 65.2: 0.5}

def tsum(items, fmt): return "+".join(fmt(t, a) for t, a in items)
zi = [(t, .085) for t in BIG] + [(t, .035) for t in MED]
si = [(t, 16) for t in BIG] + [(t, 6) for t in MED]
Z = "1+" + tsum(zi, lambda t, a: f"{a}*exp(-max(t-{t:.4f},0)/0.09)*gte(t,{t-0.001:.4f})")
SX = tsum(si, lambda t, a: f"{a}*exp(-max(t-{t:.4f},0)/0.1)*gte(t,{t-0.001:.4f})*sin(138.2*(t-{t:.4f}))")
SY = tsum(si, lambda t, a: f"{a*0.7:.1f}*exp(-max(t-{t:.4f},0)/0.1)*gte(t,{t-0.001:.4f})*cos(106.8*(t-{t:.4f}))")
vf = ["setpts=N/(30*TB)", "fps=30", f"scale=w='trunc(1920*({Z})/2)*2':h=-2:eval=frame:flags=bicubic",
      f"crop=1920:1080:x='(iw-1920)/2+({SX})':y='(ih-1080)/2+({SY})'"]
for t in BIG:
    vf.append(f"rgbashift=rh=16:bh=-16:rv=4:bv=-4:enable='between(t,{t-0.001:.4f},{t+2*fr-0.002:.4f})'")
    vf.append(f"rgbashift=rh=7:bh=-7:enable='between(t,{t+2*fr-0.001:.4f},{t+4*fr-0.002:.4f})'")
for t in MED:
    vf.append(f"rgbashift=rh=7:bh=-7:enable='between(t,{t-0.001:.4f},{t+fr-0.002:.4f})'")
for t, a in FLASH.items():
    vf.append(f"drawbox=x=0:y=0:w=iw:h=ih:color=white@{a}:t=fill:enable='between(t,{t-0.001:.4f},{t+fr-0.002:.4f})'")
    vf.append(f"drawbox=x=0:y=0:w=iw:h=ih:color=white@{a/2:.2f}:t=fill:enable='between(t,{t+fr-0.001:.4f},{t+2*fr-0.002:.4f})'")
open("renders/fx3.vf", "w").write(",".join(vf))
if "--audio-only" not in sys.argv:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", RAW, "-filter_script:v", "renders/fx3.vf", "-an", "-frames:v", str(NF),
                    "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-pix_fmt", "yuv420p", "renders/fx3.mov"], check=True)

def load(p, ch=2):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32).reshape(-1, ch).copy()
def save(a, p): subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", p], input=a.astype(np.float32).tobytes(), check=True)
N = int(T * SR)

# ---------- music: bar-level arrangement of audio/mD.mp3 onto the cut grid ----------
src = load("audio/mD.mp3")
SEG = [(0, 34.2, 4.225), (34.2, 51.2, 0.225), (51.2, 63.2, -16.775), (63.2, T, -6.775)]
mus = np.zeros((N, 2), np.float32); F6 = int(0.006 * SR)
for a, b, off in SEG:
    i0, i1 = int(a * SR), min(N, int(b * SR)); s0 = int((a + off) * SR)
    seg = src[s0:s0 + (i1 - i0)].copy()
    if len(seg) < i1 - i0: seg = np.vstack([seg, np.zeros((i1 - i0 - len(seg), 2), np.float32)])
    r = np.linspace(0, 1, F6)[:, None]
    if a > 0: seg[:F6] *= r
    if b < T: seg[-F6:] *= r[::-1]
    mus[i0:i1] += seg
fo = int(0.5 * SR); mus[-fo:] *= np.linspace(1, 0, fo)[:, None]

# ---------- VO: ONE continuous take, unspliced, starting at VO_OFF ----------
take = load("audio/vo3/take.mp3")
vo = np.zeros((N, 2), np.float32); st = int(VO_OFF * SR); n = min(len(take), N - st); vo[st:st + n] = take[:n]
save(vo, "renders/vo_raw3.wav")
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "renders/vo_raw3.wav", "-af", "loudnorm=I=-16:TP=-2:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(m[m.rfind("{"):m.rfind("}") + 1])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "renders/vo_raw3.wav", "-af",
                f"highpass=f=80,loudnorm=I=-16:TP=-2:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true",
                "-ar", str(SR), "renders/vo3.wav"], check=True)
vo = load("renders/vo3.wav")[:N]
# duck envelope that follows the VO (slow release so it does not pump between words)
env = np.sqrt(np.convolve((vo[:, 0] ** 2), np.ones(int(0.03 * SR)) / int(0.03 * SR), "same"))
act = (env > 10 ** (-42 / 20)).astype(np.float32)
hop = 480; a = act[::hop]; g = np.zeros_like(a); att, rel = np.exp(-1 / (0.05 * SR / hop)), np.exp(-1 / (0.6 * SR / hop))
for i in range(len(a)):
    prev = g[i - 1] if i else 0
    g[i] = a[i] + (prev - a[i]) * (att if a[i] > prev else rel)
gain = np.interp(np.arange(N), np.arange(len(g)) * hop, g)
DUCK = float(os.environ.get("DUCK", "-7"))
mus = mus * (10 ** (DUCK * gain / 20))[:, None] * 10 ** (-1.5 / 20)
save(mus, "renders/stem_mus3.wav")

# ---------- SFX ----------
S = {"boom": ("boom", 0.0, -1), "hit": ("hit", 0.0, 8), "glitch": ("glitch", 0.0, 5), "rev": ("revswell", 1.40, 2),
     "whip": ("whip", 0.094, -3), "zoom": ("zoom", 0.32, 0), "tick": ("tick", 0.0, 6), "click": ("click", 0.30, 12), "keys": ("keys", 0.06, 3)}
E = []
for t in BIG:
    if t > 1: E.append((t, "rev", .6, None))
    drop = t in (36.2, 53.2)
    E += [(t, "boom", 1.25 if drop else (.85 if t == 65.2 else .75), None), (t, "hit", 1.0 if drop else .6, None), (t + fr, "glitch", .6 if drop else .45, None)]
E += [(0.2, "hit", .6, None), (0.2, "whip", .5, None)]
for t in (3.45, 23.95, 35.95, 52.95, 64.95): E.append((t, "zoom", .5, None))
E.append((30.7, "whip", .55, None))
for t in (1.2, 1.7, 2.2, 2.7): E += [(t, "hit", .45, None), (t + fr, "glitch", .3, None)]
for t in (7.7, 10.7, 12.2, 16.2, 19.7, 28.7, 41.2, 46.2, 55.7, 61.2, 63.2, 64.2): E.append((t, "hit", .32, None))
W = json.load(open("audio/vo3/words.json"))
def wt(w, k=1):
    for x in W:
        if x[0].strip(".,?:").lower() == w.lower():
            k -= 1
            if k == 0: return x[1] / 30
for nm in ("model", "skill", "environment"): E.append((wt(nm) - 0.03, "tick", .5, None))
E += [(11.1, "keys", .45, 0.5), (12.33, "keys", .4, 2.4), (35.15, "keys", .45, 0.4), (51.65, "keys", .45, 0.45)]
E += [(wt("up") - 2 / 30, "click", .7, None), (wt("four", 3) - 2 / 30, "click", .7, None), (wt("send") - 1 / 30, "click", .8, None), (wt("better", 2) - 2 / 30, "click", .8, None)]
ins, fc = [], []
for k, (t, kind, v, trim) in enumerate(E):
    f, off, g_ = S[kind]; s_ = max(0.0, t - off)
    ins += ["-i", f"audio/sfx/{f}.mp3"]
    fc.append(f"[{k}:a]aresample={SR},aformat=channel_layouts=stereo{(',atrim=0:%s' % trim) if trim else ''}{',highpass=f=60' if kind == 'boom' else ''},volume={g_}dB,volume={v},adelay={int(round(s_*1000))}:all=1[s{k}]")
fc.append("".join(f"[s{i}]" for i in range(len(E))) + f"amix=inputs={len(E)}:duration=longest:normalize=0,apad,atrim=0:{T},volume={os.environ.get('SFXDB', '-5')}dB[sfx]")
subprocess.run(["ffmpeg", "-v", "error", "-y"] + ins + ["-filter_complex", ";".join(fc), "-map", "[sfx]", "-ar", str(SR), "-ac", "2", "renders/stem_sfx3.wav"], check=True)
sfx = load("renders/stem_sfx3.wav")[:N]
if len(sfx) < N: sfx = np.vstack([sfx, np.zeros((N - len(sfx), 2), np.float32)])
save(mus + sfx + vo, "renders/mix3_pre.wav")
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", "renders/mix3_pre.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(m[m.rfind("{"):m.rfind("}") + 1])
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "renders/mix3_pre.wav", "-af",
                f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,alimiter=limit=0.85:level=false",
                "-ar", str(SR), "renders/mix3.wav"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "renders/fx3.mov", "-i", "renders/mix3.wav", "-map", "0:v", "-map", "1:a", "-t", f"{T}",
                "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT], check=True)
json.dump({"big": BIG, "med": MED, "flash": FLASH, "sfx": E, "music_segments": SEG, "vo_offset": VO_OFF}, open("renders/post3_map.json", "w"), indent=1)
print("sfx", len(E), "->", OUT)
