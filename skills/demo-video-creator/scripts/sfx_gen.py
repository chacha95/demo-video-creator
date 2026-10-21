"""Generate the SFX kit post.py expects (audio/sfx/<kind>.mp3) with ElevenLabs Sound Effects.
usage (from videos/<name>/): python3 <skill>/scripts/sfx_gen.py [kind ...]      (default: the whole kit, skips files that exist)
Kinds and their roles in the mix (SKILL.md §8-9): big hits get rev → boom → hit → glitch; elsewhere SFX only on real UI
actions (tick, click, keys) and real whips. Re-roll a kind by deleting its file and running again."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__)); from _key import xi_post
KIT = {
    "boom":     ("deep cinematic sub boom impact, clean, short tail, no music", 1.6),
    "hit":      ("tight punchy transient hit, modern trailer click-thump, dry, very short", 0.5),
    "glitch":   ("short digital glitch stutter, crisp, subtle, tech UI", 0.5),
    "revswell": ("reverse cymbal swell rising into an impact, smooth, 1.5 seconds", 1.6),
    "whip":     ("fast air whoosh whip pan, clean, no tonal content", 0.5),
    "zoom":     ("short rising zoom-in whoosh, airy, modern", 0.6),
    "tick":     ("soft crisp UI tick, single, minimal, high quality", 0.3),
    "click":    ("single mouse click on a trackpad, clean, close mic", 0.3),
    "keys":     ("fast typing on a quiet mechanical laptop keyboard, steady, close mic", 3.0),
}
os.makedirs("audio/sfx", exist_ok=True)
for kind in (sys.argv[1:] or KIT):
    out = f"audio/sfx/{kind}.mp3"
    if os.path.exists(out): print("keep", out); continue
    text, dur = KIT[kind]
    json.dump({"text": text, "duration_seconds": dur, "prompt_influence": 0.6}, open("audio/sfx/req.json", "w"))
    code = xi_post("https://api.elevenlabs.io/v1/sound-generation", "audio/sfx/req.json", out)
    if code != 200:
        err = open(out, "rb").read()[:300].decode("utf8", "replace"); os.remove(out); sys.exit(f"{kind}: HTTP {code} {err}")
    print("wrote", out)
