#!/bin/sh
# usage: sh new_project.sh <name> [theme] [videos-dir]
# Scaffolds videos/<name>/ from assets/starter: HyperFrames index.html, build/motion-kit.js, build/theme.js,
# local fonts (assets/fonts/fonts.css), SCRIPT/DESIGN/DECISIONS templates, post.json, capture/flow.json.
# theme = a file name in assets/themes/ (default clean-violet). Re-running never overwrites an existing project.
set -e
NAME="$1"; THEME="${2:-clean-violet}"; BASE="${3:-videos}"
[ -n "$NAME" ] || { echo "usage: new_project.sh <name> [theme] [videos-dir]"; exit 1; }
SK="$(cd "$(dirname "$0")/.." && pwd)"; DST="$BASE/$NAME"
[ -e "$DST" ] && { echo "$DST exists — not touching it"; exit 1; }
[ -f "$SK/assets/themes/$THEME.json" ] || { echo "no theme $THEME (have: $(ls "$SK/assets/themes" | sed 's/.json//' | tr '\n' ' '))"; exit 1; }
mkdir -p "$BASE"; cp -R "$SK/assets/starter" "$DST"; find "$DST" -name .gitkeep -delete
mkdir -p "$DST/build" "$DST/assets/fonts" "$DST/assets/music" "$DST/audio/sfx" "$DST/capture/ui" "$DST/capture/clips" "$DST/qa" "$DST/renders"
cp "$SK/scripts/motion-kit.js" "$DST/build/motion-kit.js"
printf 'window.THEME = %s;\n' "$(cat "$SK/assets/themes/$THEME.json")" > "$DST/build/theme.js"
# brand mark for logoReveal / endCard: replace with the product's REAL logo paths (from its favicon or logo SVG)
grep -q '"mark"' "$SK/assets/themes/$THEME.json" || cat >> "$DST/build/theme.js" <<'JS'
// TODO(mark): paste the product's real logo <path>s here (stroke:false for filled logos). Placeholder = a plain ring.
window.THEME.mark = { svg: '<circle cx="16" cy="16" r="11"/>', viewBox: "0 0 32 32", stroke: true };
JS
for f in SCRIPT.md DESIGN.md DECISIONS.md; do cp "$SK/assets/templates/$f" "$DST/$f"; done
cp "$SK/assets/templates/post.example.json" "$DST/post.json"
cp "$SK/assets/templates/flow.example.json" "$DST/capture/flow.json"
cp "$SK/assets/templates/ui.example.json" "$DST/capture/ui.json"
mkdir -p "$DST/audio/vo3"; cp "$SK/assets/templates/lines.example.json" "$DST/audio/vo3/lines.example.json"
grep -rl "__NAME__" "$DST" | while read -r f; do sed -i.bak "s/__NAME__/$NAME/g" "$f" && rm -f "$f.bak"; done
sh "$SK/scripts/fetch_fonts.sh" "$SK/assets/themes/$THEME.json" "$DST/assets/fonts" || echo "font fetch failed — add fonts to $DST/assets/fonts by hand"
echo "scaffolded $DST (theme $THEME). Next: capture real UI into capture/, write SCRIPT.md, then replace every __placeholder__ in index.html."
