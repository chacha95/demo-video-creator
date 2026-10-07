import { chromium } from "playwright";
import fs from "node:fs";
const br = await chromium.launch(); const pg = await (await br.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await pg.goto("http://localhost:8765/index.html", { waitUntil: "networkidle" }); await pg.waitForTimeout(1500);
const res = await pg.evaluate(() => {
  const html = document.documentElement.innerHTML;
  const SH = JSON.parse(html.match(/const SH = (\[\[.*?\]\]);/)[1]);
  const out = {};
  for (const [id, a, b] of SH) {
    let first = null; const words = {};
    for (let f = a; f < b; f++) {
      window.__render(f);
      document.querySelectorAll("#" + id + " .w").forEach((e, i) => {
        const st = getComputedStyle(e);
        if (st.display !== "none" && parseFloat(st.opacity) > 0.3 && e.textContent.trim()) {
          const key = i + ":" + e.textContent.trim().split(" ")[0];
          if (!(key in words)) words[key] = f;
          if (first === null) first = f;
        }
      });
    }
    out[id] = { cut: a, first, words };
  }
  return out;
});
fs.writeFileSync("qa/sync_audit.json", JSON.stringify(res, null, 1));
await br.close();
