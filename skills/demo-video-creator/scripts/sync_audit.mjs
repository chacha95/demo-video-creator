// Text-vs-voice sync audit. usage (from videos/<name>/, with the project served, e.g. `npx http-server -p 8765`):
//   node sync_audit.mjs [http://localhost:8765/index.html] [speedup=1.263] [vo_offset=0.25]
// Seeks the paused timeline frame by frame (composition time), records when each on-screen word first becomes
// visible, maps it to OUTPUT time (composition time / speedup — the fps re-render), and pairs it with the same word in
// audio/vo3/words.json (+ vo_offset). Target lead (voice_on - text_on) = 0.05–0.20 s. Writes qa/sync_audit.{json,md}.
// Words are matched by text; a word element is any element whose own text is one word (motion-kit renders words that way).
import { chromium } from "playwright";
import fs from "node:fs";
const url = process.argv[2] || "http://localhost:8765/index.html", SP = Number(process.argv[3] || 120 / 95), OFF = Number(process.argv[4] || 0.25);
const norm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
const words = JSON.parse(fs.readFileSync("audio/vo3/words.json", "utf8")).map(([w, a]) => ({ w: norm(w), t: a + OFF })).filter((x) => x.w);
const br = await chromium.launch(); const pg = await (await br.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
await pg.goto(url, { waitUntil: "domcontentloaded" });
await pg.waitForFunction(() => !!(window.__timelines && window.__timelines.main), null, { timeout: 30000, polling: 250 });
const first = await pg.evaluate(async () => {
  const tl = window.__timelines.main, D = tl.duration(), seen = {};
  for (let f = 0; f <= Math.ceil(D * 30); f++) {
    tl.seek(f / 30, false); // false: keep onUpdate firing, or nothing renders
    for (const e of document.querySelectorAll("#root *")) {
      if (e.children.length) continue;
      const t = (e.textContent || "").trim(); if (!t || /\s/.test(t)) continue;
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.right < 0 || r.left > 1920 || r.bottom < 0 || r.top > 1080) continue;
      let vis = true; for (let n = e; n && n.id !== "root"; n = n.parentElement) { const s = getComputedStyle(n); if (s.display === "none" || s.visibility === "hidden" || +s.opacity < 0.3) { vis = false; break; } }
      if (!vis) continue;
      (seen[t] = seen[t] || []); if (!seen[t].length || f - seen[t][seen[t].length - 1].last > 3) seen[t].push({ on: f, last: f }); else seen[t][seen[t].length - 1].last = f;
    }
  }
  return seen;
});
await br.close();
const onscreen = []; for (const [t, runs] of Object.entries(first)) for (const r of runs) onscreen.push({ w: norm(t), raw: t, on: r.on / 30 / SP });
// pair each on-screen word with the closest same-text VO word it could be illustrating (voice within -0.5..+1.5 s)
const rows = []; const used = new Set();
onscreen.sort((a, b) => a.on - b.on).forEach((o) => {
  let best = null; words.forEach((v, i) => { if (used.has(i) || v.w !== o.w) return; const d = v.t - o.on; if (d > -0.5 && d < 1.5 && (!best || Math.abs(d - 0.12) < Math.abs(best.d - 0.12))) best = { i, d, v }; });
  if (best) { used.add(best.i); rows.push({ word: o.raw, text_on: +o.on.toFixed(3), voice_on: +best.v.t.toFixed(3), lead: +best.d.toFixed(3), ok: best.d >= 0.05 && best.d <= 0.2 }); }
});
fs.mkdirSync("qa", { recursive: true });
fs.writeFileSync("qa/sync_audit.json", JSON.stringify(rows, null, 1));
fs.writeFileSync("qa/sync_audit.md", "| word | text_on | voice_on | lead | ok |\n|---|---|---|---|---|\n" + rows.map((r) => `| ${r.word} | ${r.text_on} | ${r.voice_on} | ${r.lead} | ${r.ok ? "✓" : "✗"} |`).join("\n") + "\n");
const bad = rows.filter((r) => !r.ok);
console.log(`${rows.length} on-screen words matched to VO; ${bad.length} outside 0.05–0.20s lead`); bad.forEach((r) => console.log("  ", r.word, "lead", r.lead));
