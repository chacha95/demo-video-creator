// deterministic scroll recording: one screenshot per output frame. node scripts/rec_scroll.mjs <url> <out.mp4> [seconds] [maxScroll]
import { chromium } from "playwright";
import fs from "node:fs"; import { execFileSync } from "node:child_process";
const [url, out, secs = "7", maxS = "2600"] = process.argv.slice(2);
const W = 1600, H = 900, N = Math.round(Number(secs) * 30);
const br = await chromium.launch(); const pg = await (await br.newContext({ viewport: { width: W, height: H } })).newPage();
await pg.goto(url, { waitUntil: "load", timeout: 90000 }); await pg.waitForTimeout(6000);
const max = Math.min(Number(maxS), await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight));
await pg.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
const dir = out + ".frames"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
for (let i = 0; i < N; i++) {
  const p = i / (N - 1); const y = max * (0.5 - 0.5 * Math.cos(Math.PI * p));
  await pg.evaluate((y) => window.scrollTo(0, y), y); await pg.waitForTimeout(35);
  await pg.screenshot({ path: `${dir}/${String(i).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
}
await br.close();
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-framerate", "30", "-i", `${dir}/%05d.jpg`, "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]);
fs.rmSync(dir, { recursive: true, force: true }); console.log("wrote", out, N, "frames, max scroll", max);
