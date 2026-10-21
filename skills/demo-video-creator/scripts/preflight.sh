#!/bin/sh
# Onboarding check (SKILL.md §0). Run once from the repo root before step 1; it reports every gap in one go.
# The key is read from $ELEVENLABS_API_KEY or ./.env and sent through a 0600 header file — never printed, never in argv.
ok=1
KEY="${ELEVENLABS_API_KEY:-$(grep '^ELEVENLABS_API_KEY=' .env 2>/dev/null | cut -d= -f2- | tr -d '"'"'")}"
if [ -z "$KEY" ]; then echo "MISSING  ELEVENLABS_API_KEY (env or ./.env)"; ok=0; else
  H=$(mktemp); chmod 600 "$H"; printf 'xi-api-key: %s\n' "$KEY" > "$H"
  code=$(curl -s -o /dev/null -w "%{http_code}" -H @"$H" https://api.elevenlabs.io/v1/user); rm -f "$H"
  [ "$code" = "200" ] && echo "ok       ElevenLabs key (HTTP 200)" || { echo "BAD      ElevenLabs key (HTTP $code)"; ok=0; }
fi
for t in ffmpeg ffprobe node npx python3 curl; do command -v $t >/dev/null && echo "ok       $t" || { echo "MISSING  $t"; ok=0; }; done
node -e 'process.exit(+process.versions.node.split(".")[0] >= 20 ? 0 : 1)' 2>/dev/null && echo "ok       node >= 20" || { echo "OLD      node < 20"; ok=0; }
python3 -c "import numpy" 2>/dev/null && echo "ok       numpy" || { echo "MISSING  numpy (pip3 install numpy)"; ok=0; }
node -e "require.resolve('playwright')" 2>/dev/null && echo "ok       playwright" || { echo "MISSING  playwright (npm i -D playwright && npx playwright install chromium)"; ok=0; }
command -v whisper-cli >/dev/null && echo "ok       whisper-cli (optional)" || echo "optional whisper-cli not found (brew install whisper-cpp) — final Whisper check needs it"
command -v yt-dlp >/dev/null && echo "ok       yt-dlp (optional)" || echo "optional yt-dlp not found — only needed for a reference video URL"
command -v xcrun >/dev/null && echo "ok       xcrun (mobile-app case)" || echo "optional xcrun not found — mobile-app case needs Xcode's simulator"
[ $ok = 1 ] && echo "READY" || { echo "NOT READY — fix the lines above, then run again"; exit 1; }
