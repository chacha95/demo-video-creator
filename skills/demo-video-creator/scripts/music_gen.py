"""Generate N background-music candidates with ElevenLabs Music (one request each).
usage (from videos/<name>/): python3 <skill>/scripts/music_gen.py [n=3] [seconds=70] ["prompt"]
out: assets/music/m1.mp3 … mN.mp3  →  then: python3 <skill>/scripts/beats.py assets/music/m*.mp3
Make the bed a little longer than the film; post.json "music.segments" arranges it onto the cut grid.
The case file (references/cases/*.md) gives a prompt per case; the default is the approved launch bed."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__)); from _key import xi_post
n = int(sys.argv[1]) if len(sys.argv) > 1 else 3
secs = float(sys.argv[2]) if len(sys.argv) > 2 else 70
prompt = sys.argv[3] if len(sys.argv) > 3 else ("modern minimal tech launch, punchy kick, deep 808, crisp hats, glassy synth plucks, "
         "Apple/Linear keynote feel, no cheesy EDM risers, no corporate/stock vibe, instrumental, 120 BPM")
os.makedirs("assets/music", exist_ok=True)
body = "assets/music/req.json"
json.dump({"prompt": prompt, "music_length_ms": int(secs * 1000), "model_id": os.environ.get("MUSIC_MODEL", "music_v1")}, open(body, "w"))
for i in range(1, n + 1):
    out = f"assets/music/m{i}.mp3"
    code = xi_post("https://api.elevenlabs.io/v1/music", body, out)
    if code != 200:
        err = open(out, "rb").read()[:400].decode("utf8", "replace"); os.remove(out)
        sys.exit(f"music request {i} failed ({code}): {err}  — Music may need a paid plan; the key needs the Music permission")
    print("wrote", out, os.path.getsize(out) // 1024, "KB")
json.dump({"prompt": prompt, "seconds": secs, "n": n}, open("assets/music/prompt.json", "w"), indent=1)
