#!/bin/sh
# usage: sh fetch_fonts.sh <theme.json> <project>/assets/fonts
# Downloads the open fonts a theme lists (Fontsource + Pretendard via jsDelivr) as local woff2 files and writes
# fonts.css with @font-face rules (font-display:block) so renders never fall back to system fonts.
# Proprietary site fonts (e.g. Evals' diatype/martina) are skipped: capture them from the live site's CSS instead.
set -e
THEME="$1"; OUT="${2:-assets/fonts}"; mkdir -p "$OUT"
python3 - "$THEME" "$OUT" <<'PY'
import json, subprocess, sys, os
t = json.load(open(sys.argv[1])); out = sys.argv[2]; css = []
for f in t.get("font_files", []):
    fam = f["family"]
    if "fontsource" in f:
        for w in f["weights"]:
            name = f'{f["fontsource"]}-{w}.woff2'; dst = os.path.join(out, name)
            if not os.path.exists(dst):
                subprocess.run(["curl", "-sfL", "-o", dst, f'https://cdn.jsdelivr.net/fontsource/fonts/{f["fontsource"]}@latest/latin-{w}-normal.woff2'], check=True)
            css.append(f'@font-face {{ font-family: "{fam}"; src: url("{name}") format("woff2"); font-weight: {w}; font-display: block; }}')
    elif fam == "Pretendard":
        dst = os.path.join(out, f["file"])
        if not os.path.exists(dst):
            subprocess.run(["curl", "-sfL", "-o", dst, "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2"], check=True)
        css.append(f'@font-face {{ font-family: "Pretendard"; src: url("{f["file"]}") format("woff2-variations"); font-weight: {f.get("weight","100 900")}; font-display: block; }}')
open(os.path.join(out, "fonts.css"), "w").write("\n".join(css) + "\n")
print("wrote", os.path.join(out, "fonts.css"), len(css), "faces")
PY
