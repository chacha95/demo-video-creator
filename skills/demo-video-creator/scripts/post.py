"""Post pass: retime the fps re-render to 30fps, impact FX, music arrangement + VO-following duck,
ONE continuous VO take, SFX bus, -14 LUFS master. Everything film-specific lives in post.json.

usage (from the project dir videos/<name>/):
  python3 <skill>/scripts/post.py post.json            # video FX + audio + mux
  python3 <skill>/scripts/post.py post.json --audio-only  # re-mix only, reuse renders/fx.mov

post.json (see assets/templates/post.example.json):
  raw, out             input render (any fps; frames are re-stamped at 30fps = the speed-up) and the final mp4
  frames               output length in 30fps frames
  vo                   {take, offset s, lufs}
  music                {src, segments [[out_start, out_end, src_offset]], duck_db, gain_db, fade_out}
                       src_offset = (src time - out time) for that span; cut points should sit on bar lines
  fx                   {big [s], med [s], flash {"s": alpha}, zoom_big .085, zoom_med .035, shake_big 16, shake_med 6}
  sfx                  {dir, bus_db, auto_big true, kinds {name: [file, offset_s, gain_db]},
                        events [{t | word+k, kind, vol, trim, lead}]}   word = VO word (case-insensitive), k = nth hit
  words                audio/vo3/words.json from vo3_gen.py ([[word, start_s, end_s]] in take time)
  master               {lufs -14, tp -1.5}
"""
import subprocess, sys, json, os
import numpy as np

CFG_PATH = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "post.json"
AUDIO_ONLY = "--audio-only" in sys.argv
C = json.load(open(CFG_PATH))
RAW, OUT = C["raw"], C["out"]
NF = int(C["frames"]); T = NF / 30; fr = 1 / 30; SR = 48000
os.makedirs("renders", exist_ok=True)

# ---------------- video: retime + impact FX ----------------
FX = C.get("fx", {})
BIG, MED = FX.get("big", []), FX.get("med", [])
FLASH = {float(k): v for k, v in FX.get("flash", {}).items()}
ZB, ZM, SB, SM = FX.get("zoom_big", .085), FX.get("zoom_med", .035), FX.get("shake_big", 16), FX.get("shake_med", 6)

def tsum(items, fmt): return "+".join(fmt(t, a) for t, a in items) or "0"
zi = [(t, ZB) for t in BIG] + [(t, ZM) for t in MED]
si = [(t, SB) for t in BIG] + [(t, SM) for t in MED]
Z = "1+" + tsum(zi, lambda t, a: f"{a}*exp(-max(t-{t:.4f},0)/0.09)*gte(t,{t-0.001:.4f})")
SX = tsum(si, lambda t, a: f"{a}*exp(-max(t-{t:.4f},0)/0.1)*gte(t,{t-0.001:.4f})*sin(138.2*(t-{t:.4f}))")
SY = tsum(si, lambda t, a: f"{a*0.7:.1f}*exp(-max(t-{t:.4f},0)/0.1)*gte(t,{t-0.001:.4f})*cos(106.8*(t-{t:.4f}))")
# NB: after scale with eval=frame, crop's iw/ih are the scaled size, so (iw-1920)/2 keeps the punch centred.
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
open("renders/fx.vf", "w").write(",".join(vf))
if not AUDIO_ONLY:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", RAW, "-filter_script:v", "renders/fx.vf", "-an", "-frames:v", str(NF),
                    "-c:v", "libx264", "-crf", "15", "-preset", "slow", "-pix_fmt", "yuv420p", "renders/fx.mov"], check=True)

# ---------------- audio helpers ----------------
def load(p, ch=2):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"],
                                        capture_output=True, check=True).stdout, np.float32).reshape(-1, ch).copy()
def save(a, p): subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", p], input=a.astype(np.float32).tobytes(), check=True)
def fit(a, n): return a[:n] if len(a) >= n else np.vstack([a, np.zeros((n - len(a), a.shape[1]), np.float32)])
def loudnorm(src, dst, I, TP, extra="", limit=False):
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", f"loudnorm=I={I}:TP={TP}:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    js = json.loads(m[m.rfind("{"):m.rfind("}") + 1])
    af = (f"loudnorm=I={I}:TP={TP}:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
          f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", (extra + "," if extra else "") + af + (",alimiter=limit=0.85:level=false" if limit else ""),
                    "-ar", str(SR), dst], check=True)
N = int(T * SR)

# ---------------- music: bar-level arrangement onto the cut grid ----------------
MU = C["music"]
src = load(MU["src"])
SEG = MU.get("segments") or [[0, T, 0]]
mus = np.zeros((N, 2), np.float32); F6 = int(0.006 * SR)
for a, b, off in SEG:
    i0, i1 = int(a * SR), min(N, int(b * SR)); s0 = max(0, int((a + off) * SR))
    seg = fit(src[s0:s0 + (i1 - i0)].copy(), i1 - i0)
    r = np.linspace(0, 1, F6)[:, None]
    if a > 0: seg[:F6] *= r
    if b < T: seg[-F6:] *= r[::-1]
    mus[i0:i1] += seg
fo = int(MU.get("fade_out", 0.5) * SR)
if fo: mus[-fo:] *= np.linspace(1, 0, fo)[:, None]

# ---------------- VO: ONE continuous take, unspliced ----------------
VO = C["vo"]; VO_OFF = VO.get("offset", 0.25)
take = load(VO["take"])
vo = np.zeros((N, 2), np.float32); st = int(VO_OFF * SR); n = max(0, min(len(take), N - st)); vo[st:st + n] = take[:n]
if len(take) > N - st: print(f"WARNING: VO take is {len(take)/SR:.2f}s but only {(N-st)/SR:.2f}s fit — grow the film, never trim the take")
save(vo, "renders/vo_raw.wav"); loudnorm("renders/vo_raw.wav", "renders/vo.wav", VO.get("lufs", -16), -2, "highpass=f=80")
vo = fit(load("renders/vo.wav"), N)
# duck envelope that follows the VO (≈50ms attack, 0.6s release so it never pumps between words)
env = np.sqrt(np.convolve(vo[:, 0] ** 2, np.ones(int(0.03 * SR)) / int(0.03 * SR), "same"))
act = (env > 10 ** (-42 / 20)).astype(np.float32)
hop = 480; a_ = act[::hop]; g = np.zeros_like(a_); att, rel = np.exp(-1 / (0.05 * SR / hop)), np.exp(-1 / (0.6 * SR / hop))
for i in range(len(a_)):
    prev = g[i - 1] if i else 0
    g[i] = a_[i] + (prev - a_[i]) * (att if a_[i] > prev else rel)
gain = np.interp(np.arange(N), np.arange(len(g)) * hop, g)
mus = mus * (10 ** (MU.get("duck_db", -6) * gain / 20))[:, None] * 10 ** (MU.get("gain_db", -1.5) / 20)
save(mus, "renders/stem_mus.wav")

# ---------------- SFX ----------------
SX_ = C.get("sfx", {})
KINDS = {"boom": ["boom", 0.0, -1], "hit": ["hit", 0.0, 8], "glitch": ["glitch", 0.0, 5], "rev": ["revswell", 1.40, 2],
         "whip": ["whip", 0.094, -3], "zoom": ["zoom", 0.32, 0], "tick": ["tick", 0.0, 6], "click": ["click", 0.30, 12], "keys": ["keys", 0.06, 3]}
KINDS.update(SX_.get("kinds", {}))
WORDS = json.load(open(C["words"])) if C.get("words") and os.path.exists(C["words"]) else []
def wt(w, k=1):
    for x in WORDS:
        if x[0].strip(".,?!:;\"'").lower() == w.lower():
            k -= 1
            if k == 0: return x[1] + VO_OFF
    sys.exit(f"sfx event word '{w}' (#{k}) not in {C.get('words')}")
E = []
if SX_.get("auto_big", True):  # layered impact on every big hit: reverse swell into it, boom (HP 60Hz), transient, glitch
    for t in BIG:
        if t > 1: E.append((t, "rev", .6, None))
        E += [(t, "boom", .8, None), (t, "hit", .7, None), (t + fr, "glitch", .5, None)]
for ev in SX_.get("events", []):
    t = ev["t"] if "t" in ev else wt(ev["word"], ev.get("k", 1)) - ev.get("lead", 0)
    E.append((t, ev["kind"], ev.get("vol", .5), ev.get("trim")))
D = SX_.get("dir", "audio/sfx")
if E:
    ins, fc = [], []
    for k, (t, kind, v, trim) in enumerate(E):
        f, off, g_ = KINDS[kind]; s_ = max(0.0, t - off)
        p = os.path.join(D, f + ".mp3")
        if not os.path.exists(p): sys.exit(f"missing SFX {p} — run sfx_gen.py first")
        ins += ["-i", p]
        fc.append(f"[{k}:a]aresample={SR},aformat=channel_layouts=stereo{(',atrim=0:%s' % trim) if trim else ''}{',highpass=f=60' if kind == 'boom' else ''},volume={g_}dB,volume={v},adelay={int(round(s_*1000))}:all=1[s{k}]")
    fc.append("".join(f"[s{i}]" for i in range(len(E))) + f"amix=inputs={len(E)}:duration=longest:normalize=0,apad,atrim=0:{T},volume={SX_.get('bus_db', -5)}dB[sfx]")
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + ins + ["-filter_complex", ";".join(fc), "-map", "[sfx]", "-ar", str(SR), "-ac", "2", "renders/stem_sfx.wav"], check=True)
    sfx = fit(load("renders/stem_sfx.wav"), N)
else:
    sfx = np.zeros((N, 2), np.float32); save(sfx, "renders/stem_sfx.wav")

# ---------------- master ----------------
M = C.get("master", {})
save(mus + sfx + vo, "renders/mix_pre.wav")
loudnorm("renders/mix_pre.wav", "renders/mix.wav", M.get("lufs", -14), M.get("tp", -1.5), limit=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "renders/fx.mov", "-i", "renders/mix.wav", "-map", "0:v", "-map", "1:a", "-t", f"{T}",
                "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", OUT], check=True)
json.dump({"big": BIG, "med": MED, "flash": FLASH, "sfx": E, "music_segments": SEG, "vo_offset": VO_OFF}, open("renders/post_map.json", "w"), indent=1)
print("sfx", len(E), "->", OUT)
