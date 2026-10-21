// Sharp REAL UI stills at 4× DPR, cropped to whole elements. usage: node capture_ui.mjs capture/ui.json
// spec: { "viewport":[1440,900], "dpr":4, "storage":"capture/state.json"(optional, logged-in session), "hide":[".cookie-banner"],
//         "shots":[ { "name":"composer", "url":"https://app.example.com/new", "wait":1500,
//                     "selector":"form.composer" | "clip":[x,y,w,h] | (neither = viewport),
//                     "pad":24, "actions":[{"click":"text=Battle"},{"type":["textarea","Build a game"]},{"wait":500}] } ] }
// out: capture/ui/<name>.png + capture/ui/<name>.json ({w,h,dpr,rect}) so the film knows the source pixel size.
// Why 4×: no element may ever be shown larger than its source pixels (2× captures looked soft when punched in).
import { chromium } from "playwright";
import fs from "node:fs";
const spec = JSON.parse(fs.readFileSync(process.argv[2] || "capture/ui.json", "utf8"));
const [W, H] = spec.viewport || [1440, 900], dpr = spec.dpr || 4, dir = spec.out || "capture/ui";
fs.mkdirSync(dir, { recursive: true });
const br = await chromium.launch();
const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dpr, ...(spec.storage && fs.existsSync(spec.storage) ? { storageState: spec.storage } : {}) });
const pg = await ctx.newPage();
for (const s of spec.shots) {
  if (s.url) await pg.goto(s.url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await pg.waitForTimeout(s.wait ?? 1500);
  await pg.addStyleTag({ content: (spec.hide || []).concat(s.hide || []).map((h) => h + "{visibility:hidden!important}").join("\n") + "\n::-webkit-scrollbar{display:none}html{scrollbar-width:none}" });
  for (const a of s.actions || []) {
    if (a.click) await pg.click(a.click);
    if (a.type) await pg.fill(a.type[0], a.type[1]);
    if (a.press) await pg.keyboard.press(a.press);
    if (a.hover) await pg.hover(a.hover);
    if (a.scroll != null) await pg.evaluate((y) => window.scrollTo(0, y), a.scroll);
    await pg.waitForTimeout(a.wait ?? 300);
  }
  let rect = null;
  if (s.selector) { const b = await pg.locator(s.selector).first().boundingBox(); if (!b) throw new Error(s.name + ": selector not found " + s.selector);
    const p = s.pad ?? 0; rect = { x: Math.max(0, b.x - p), y: Math.max(0, b.y - p), width: b.width + 2 * p, height: b.height + 2 * p }; }
  else if (s.clip) rect = { x: s.clip[0], y: s.clip[1], width: s.clip[2], height: s.clip[3] };
  const path = `${dir}/${s.name}.png`;
  await pg.screenshot({ path, ...(rect ? { clip: rect } : {}), fullPage: !!s.fullPage, animations: "disabled" });
  const r = rect || { x: 0, y: 0, width: W, height: H };
  fs.writeFileSync(`${dir}/${s.name}.json`, JSON.stringify({ w: Math.round(r.width * dpr), h: Math.round(r.height * dpr), dpr, rect: r, url: pg.url() }));
  console.log("wrote", path, Math.round(r.width * dpr) + "x" + Math.round(r.height * dpr));
}
if (spec.saveStorage) await ctx.storageState({ path: spec.saveStorage });
await br.close();
