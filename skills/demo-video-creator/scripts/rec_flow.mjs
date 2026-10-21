// Record a REAL UI flow as a moving clip: eased cursor moves, real clicks, real typing, smooth scrolls.
// usage: node rec_flow.mjs capture/flow.json capture/clips/flow.mp4
// flow: { "viewport":[1600,900], "dpr":2, "storage":"capture/state.json", "start":"https://app.example.com",
//         "steps":[ {"move":"text=New project","frames":18}, {"click":"text=New project"}, {"type":["input[name=title]","Q4 launch"],"cps":14},
//                   {"press":"Enter"}, {"scroll":600,"frames":40}, {"wait":800}, {"hover":".row:nth-child(2)"}, {"mark":"results"} ] }
// A visible cursor (ink arrow + click pulse) is injected as a DOM overlay because headless Chromium draws none.
// Frames come from the CDP screencast with real timestamps → constant 30fps; then run dedupe.sh if the page idles.
// "mark" steps write capture/clips/<out>.marks.json (name → seconds) so the build can cut on real UI moments.
import { chromium } from "playwright";
import fs from "node:fs"; import { execFileSync } from "node:child_process";
const flow = JSON.parse(fs.readFileSync(process.argv[2], "utf8")), out = process.argv[3];
const [W, H] = flow.viewport || [1600, 900];
const br = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: flow.dpr || 2, ...(flow.storage && fs.existsSync(flow.storage) ? { storageState: flow.storage } : {}) });
const CURSOR = `(() => { if (window.__cur) return; const c = document.createElement('div'); window.__cur = c;
  c.style.cssText = 'position:fixed;left:0;top:0;width:26px;height:34px;z-index:2147483647;pointer-events:none;transform:translate(-100px,-100px)';
  c.innerHTML = '<svg width="26" height="34" viewBox="0 0 26 34"><path d="M2 2 L2 28 L8.5 22 L13 32 L17.5 30 L13 20.5 L22 20.5 Z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>';
  const r = document.createElement('div'); r.style.cssText = 'position:fixed;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(17,17,17,.18);z-index:2147483646;pointer-events:none;opacity:0;transition:opacity .35s,transform .35s';
  const add = () => { document.documentElement.appendChild(c); document.documentElement.appendChild(r); }; document.readyState === 'loading' ? addEventListener('DOMContentLoaded', add) : add();
  addEventListener('mousemove', (e) => { c.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; }, true);
  addEventListener('mousedown', () => { c.style.transform += ' scale(.86)'; r.style.transition = 'none'; r.style.opacity = 1; r.style.transform = 'scale(.4)'; requestAnimationFrame(() => { r.style.transition = 'opacity .35s,transform .35s'; r.style.opacity = 0; r.style.transform = 'scale(1.3)'; }); }, true);
  addEventListener('mouseup', () => { c.style.transform = c.style.transform.replace(' scale(.86)', ''); }, true); })()`;
await ctx.addInitScript(CURSOR);
const pg = await ctx.newPage();
await pg.goto(flow.start, { waitUntil: "domcontentloaded", timeout: 90000 }); await pg.waitForTimeout(flow.settle ?? 2500);
await pg.addStyleTag({ content: "::-webkit-scrollbar{display:none}html{scrollbar-width:none;scroll-behavior:auto!important}" });
let mx = W * 0.5, my = H * 0.62; await pg.mouse.move(mx, my);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // in-out: accelerates, then lands
async function moveTo(x, y, frames = 18) { const x0 = mx, y0 = my; for (let i = 1; i <= frames; i++) { const p = ease(i / frames); await pg.mouse.move(x0 + (x - x0) * p, y0 + (y - y0) * p); await pg.waitForTimeout(16); } mx = x; my = y; }
async function centre(sel) { const b = await pg.locator(sel).first().boundingBox(); if (!b) throw new Error("not found: " + sel); return [b.x + b.width / 2, b.y + b.height / 2]; }
const cdp = await ctx.newCDPSession(pg); const frames = [], marks = {};
cdp.on("Page.screencastFrame", async (f) => { frames.push({ t: f.metadata.timestamp, d: f.data }); await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: W * (flow.dpr || 2), maxHeight: H * (flow.dpr || 2), everyNthFrame: 1 });
const t0 = Date.now() / 1000;
for (const s of flow.steps) {
  if (s.move) await moveTo(...(await centre(s.move)), s.frames);
  if (s.click) { await moveTo(...(await centre(s.click)), s.frames ?? 16); await pg.waitForTimeout(90); await pg.mouse.down(); await pg.waitForTimeout(70); await pg.mouse.up(); }
  if (s.type) { await moveTo(...(await centre(s.type[0])), 14); await pg.mouse.down(); await pg.mouse.up(); await pg.keyboard.type(s.type[1], { delay: 1000 / (s.cps || 14) }); }
  if (s.press) await pg.keyboard.press(s.press);
  if (s.hover) await moveTo(...(await centre(s.hover)), s.frames);
  if (s.scroll != null) { const y0 = await pg.evaluate(() => scrollY), n = s.frames || 40; for (let i = 1; i <= n; i++) { await pg.evaluate((y) => scrollTo(0, y), y0 + (s.scroll - y0) * ease(i / n)); await pg.waitForTimeout(16); } }
  if (s.mark) marks[s.mark] = +(Date.now() / 1000 - t0).toFixed(3);
  await pg.waitForTimeout(s.wait ?? 250);
}
await cdp.send("Page.stopScreencast"); await br.close();
if (frames.length < 2) throw new Error("no frames captured");
const dir = out + ".frames"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
let list = ""; frames.forEach((f, k) => { const p = `${String(k).padStart(5, "0")}.jpg`; fs.writeFileSync(`${dir}/${p}`, Buffer.from(f.d, "base64")); const d = k + 1 < frames.length ? frames[k + 1].t - f.t : 1 / 30; list += `file '${p}'\nduration ${d.toFixed(4)}\n`; });
fs.writeFileSync(`${dir}/list.txt`, list);
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", `${dir}/list.txt`, "-vf", `fps=30,scale=${W * (flow.dpr || 2)}:-2`, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
fs.rmSync(dir, { recursive: true, force: true });
fs.writeFileSync(out.replace(/\.mp4$/, "") + ".marks.json", JSON.stringify(marks, null, 1));
console.log("wrote", out, frames.length, "frames over", (frames.at(-1).t - frames[0].t).toFixed(2) + "s", "marks", JSON.stringify(marks));
