"""Shared ElevenLabs key + curl helper. The key goes through a 0600 temp header file, never argv (ps-visible) or logs."""
import os, sys, subprocess, tempfile
def find_key(name="ELEVENLABS_API_KEY"):
    if os.environ.get(name): return os.environ[name]
    d = os.path.abspath(os.getcwd())
    while True:
        f = os.path.join(d, ".env")
        if os.path.isfile(f):
            for l in open(f):
                if l.startswith(name + "="): return l.split("=", 1)[1].strip().strip("\"'")
        if os.path.dirname(d) == d: break
        d = os.path.dirname(d)
    sys.exit(f"{name} not found. See 'Onboarding' in SKILL.md, then add {name}=... to the repo-root .env")
def xi_post(url, body_path, out_path):
    """POST a JSON body file to an ElevenLabs endpoint with curl; returns the HTTP status."""
    fd, hdr = tempfile.mkstemp(prefix="xi-hdr-"); os.chmod(hdr, 0o600)
    try:
        with os.fdopen(fd, "w") as f: f.write("xi-api-key: " + find_key() + "\n")
        r = subprocess.run(["curl", "-s", "-X", "POST", url, "-H", "@" + hdr, "-H", "Content-Type: application/json",
                            "--data-binary", "@" + body_path, "-o", out_path, "-w", "%{http_code}"], capture_output=True, text=True, check=True)
        return int(r.stdout.strip() or 0)
    finally:
        os.remove(hdr)
