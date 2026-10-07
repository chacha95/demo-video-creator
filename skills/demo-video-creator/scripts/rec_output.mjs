// node scripts/rec.mjs <url> <out.mp4> [seconds] [mode: game|orbit|idle]
import { chromium } from "playwright";
import fs from "node:fs"; import { execFileSync } from "node:child_process";
const [url, out, secs = "7", mode = "orbit"] = process.argv.slice(2);
const W = 1600, H = 900;
const br = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
const pg = await (await br.newContext({ viewport: { width: W, height: H } })).newPage();
await pg.goto(url, { waitUntil: "load", timeout: 60000 }); await pg.waitForTimeout(6000);
const fps = await pg.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else r(n); }; requestAnimationFrame(f); }));
console.log("raf fps", fps);
const dir = out + ".frames"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const cdp = await pg.context().newCDPSession(pg); const frames = [];
cdp.on("Page.screencastFrame", async (f) => { frames.push({ t: f.metadata.timestamp, d: f.data }); await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
await pg.mouse.click(W / 2, H / 2).catch(() => {});
if (mode === "game") { await pg.keyboard.press("Enter"); await pg.waitForTimeout(400); await pg.keyboard.press("Space"); }
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, everyNthFrame: 1 });
const T = Number(secs) * 1000, t0 = Date.now();
if (mode === "game") await pg.keyboard.down("ArrowUp"), await pg.keyboard.down("KeyW");
if (mode === "orbit") { await pg.mouse.move(W * 0.35, H * 0.5); await pg.mouse.down(); }
let i = 0;
while (Date.now() - t0 < T) {
  i++;
  if (mode === "orbit") await pg.mouse.move(W * 0.35 + (Date.now() - t0) / T * W * 0.3, H * 0.5 - Math.sin(i / 20) * 10, { steps: 2 });
  if (mode === "game" && i % 15 === 0) await pg.keyboard.press("Space");
  await pg.waitForTimeout(40);
}
await cdp.send("Page.stopScreencast"); await br.close();
console.log("frames", frames.length, "over", (frames.at(-1).t - frames[0].t).toFixed(2), "s");
let list = ""; frames.forEach((f, k) => { const p = `${dir}/${String(k).padStart(5, "0")}.jpg`; fs.writeFileSync(p, Buffer.from(f.d, "base64")); const d = k + 1 < frames.length ? frames[k + 1].t - f.t : 1 / 30; list += `file '${p.split("/").pop()}'\nduration ${d.toFixed(4)}\n`; });
fs.writeFileSync(`${dir}/list.txt`, list);
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", `${dir}/list.txt`, "-vf", "fps=30,scale=1600:900", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
fs.rmSync(dir, { recursive: true, force: true }); console.log("wrote", out);
