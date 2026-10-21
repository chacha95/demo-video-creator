---
name: demo-video-creator
description: Make a landscape 16:9 (1920×1080) product demo / launch film for any web app, AI tool, SaaS, dev tool/CLI, mobile app, browser extension or marketplace, with the user's approved motion feel ("감도") — real product UI captures + real output footage, one continuous voiceover (ElevenLabs eleven_v4, EN Will / KO Choi), beat-locked HyperFrames build, fps re-render speed-up, impact FX + layered SFX, one finished mp4 at −14 LUFS. Nine case playbooks (AI output battle, SaaS workflow, dev tool/CLI, mobile app, browser extension, marketplace/catalog, feature launch, teaser, before/after) set the hook, story, captures and length (12s–100s). Use this whenever the user asks for a 데모 영상 / 데모 비디오 / 런치 영상 / 런치 필름 / 제품 소개 영상 / 프로모 영상 / 기능 소개 영상 / 신기능 영상 / 업데이트 영상 / 티저 / 앱 소개 영상 / CLI 데모 / 익스텐션 데모 / "이 감도로 영상" / "가로 데모" / "1분짜리 제품 영상" / keynote-, Linear- or Apple-style launch video / demo video / launch film / product promo / feature announcement / changelog video / teaser — for Evals (evals.ag), Skillshop (skills.ag) or any other product, in English or Korean — even if they only paste a product URL and say "영상 하나 뽑아줘". Also use it when they hand a reference video and say "이 느낌으로 우리 제품 영상". Not for vertical 9:16 Shorts/Reels (use the reels/shorts skills).
---

# Demo Video Creator

Builds a landscape product demo/launch film with the motion feel the user approved. The deliverable is one mp4.

Why this skill exists: the user iterated a long way to reach this feel, and almost every rule below is a correction they made. Agents left alone drift back to the same mistakes: hook-less intros, website screenshots, chopped voiceover, late subtitles, sloppy crops and trailer SFX on every word. Read the "Why" notes so you can apply the intent to new products and new cases, not just copy Evals.

Work autonomously. The user wants to paste one request and get one video back. They got frustrated when a session stopped to ask for inputs ("인풋 요구해서 안되는데"). Make reasonable decisions, log them in `DECISIONS.md`, and keep going until the mp4 exists.

**Approved references.** If these exist on this machine, watch them before building; on a fresh install use the published samples (https://github.com/chacha95/demo-video-creator/tree/main/media, `demo_en.mp4` / `demo_ko.mp4`) and `references/examples/`.
- `videos/evals-hype/renders/evals-ref2-short-fast2-impact.mp4`: the motion feel ("모션이 좋단다").
- `videos/evals-demo2/`: hook, continuous VO, VO-led edit and finish pass (`SCRIPT.md`, `DESIGN.md`, `qa/finish.md` show "done").
- `videos/evals-higgs-refs/deliverables/v4_모션리메이크/02_NanoBanana티저_KO_5차.mp4` / `…_EN_2차.mp4`: the approved Evals house look (2026-10-09).

## 0. Onboarding: keys and tools (check once, before step 1)
This is the one moment you may stop and ask. Run the check once, report every gap in one message, then run autonomously. Never ask mid-pipeline.

```bash
sh .claude/skills/demo-video-creator/scripts/preflight.sh   # key (HTTP 200), ffmpeg, node>=20, numpy, playwright, whisper-cli…
```
It reads `ELEVENLABS_API_KEY` from the env or the repo-root `.env` and sends it through a 0600 header file. Never print the key in chat or logs, and never put it in a command-line argument.

If the key is missing or not 200, tell the user (in Korean if they write Korean):

> **ElevenLabs API 키가 필요해요** (나레이션 + 배경음악 + 효과음 생성용)
> 1. https://elevenlabs.io 에 로그인하세요. 음악 생성(Music)은 유료 플랜이 필요할 수 있어요.
> 2. 왼쪽 아래 프로필 → **Developers / API Keys** → **Create API Key**.
> 3. 권한에서 **Text to Speech**, **Music**, **Sound Effects**, **Voices (read)**를 켜고 만드세요. 키는 한 번만 보여요.
> 4. 프로젝트 루트의 `.env` 파일에 한 줄 추가하세요 (파일이 없으면 새로 만드세요): `ELEVENLABS_API_KEY=여기에_키`
> 5. 채팅에 키를 붙여넣지 마세요. 저장했다고만 알려주시면 이어서 진행할게요.

`.env` is gitignored. Do not commit it or copy the key anywhere else. Missing tools: `brew install ffmpeg whisper-cpp`, Node 20+, `pip3 install numpy`, `npm i -D playwright && npx playwright install chromium` at the repo root (the capture scripts resolve Playwright from there). Case-specific tools (Xcode simulator, `vhs`) are listed in the case file.

## 1. Pick the case (before anything else)
Read `references/CASES.md`, pick ONE case from the product and the request, then read that case file in `references/cases/`. Log the pick in `DECISIONS.md`. The case sets the length, the hook recipe, the story beats, the capture plan, the devices, the VO word budget, the music prompt and the default theme. Everything else in this file applies to every case.

| case | for | length |
|---|---|---|
| `ai-output-battle` | AI generators / model comparison (Evals) | 45–65s |
| `saas-workflow` | B2B SaaS, dashboards, productivity web apps | 45–75s (walkthrough 60–100s) |
| `devtool-cli` | CLIs, SDKs, APIs, coding agents | 40–60s |
| `mobile-app` | iOS / Android apps | 30–60s |
| `browser-extension` | Chrome extensions, in-page assistants | 30–45s |
| `marketplace-catalog` | catalogs, template/skill/asset stores (Skillshop) | 45–60s |
| `feature-launch` | one new feature / changelog entry | 20–40s |
| `teaser` | pre-launch / social teaser, music-led | 12–20s |
| `before-after` | automation, dictation, "manual vs product" | 30–50s |

If the request fits two, pick by **what moves on screen**: outputs → `ai-output-battle`; a UI flow → `saas-workflow`; commands → `devtool-cli`. If the user only pastes a URL, open it, decide, and say which case you picked in one line before building.

## Pipeline

```
case → brief → reference SPEC → SCRIPT.md (+VO lines) → DESIGN.md → assets (real UI + real outputs)
→ VO (one take) → music → build (HyperFrames, VO-led, beat-locked) → render at fps 30/speedup
→ post (retime, impact FX, mix) → QA (gate, motion, strips, sync table, finish audit) → renders/<name>.mp4
```

Scaffold the project (paths below are relative to the repo root; `SK=.claude/skills/demo-video-creator`):
```bash
sh $SK/scripts/new_project.sh <name> <theme>    # → videos/<name>/ with index.html, build/motion-kit.js, theme, fonts, templates
```
Project: `videos/<name>/` with `SCRIPT.md DESIGN.md DECISIONS.md index.html post.json build/ capture/ assets/ audio/ qa/ renders/`.

Tooling notes:
- Render: `npx --yes hyperframes@0.8.101 render -o renders/raw.mp4 --quiet --fps 95/4` from the project dir. Read the `hyperframes-core` skill if the composition contract is unfamiliar. Every `<video>` src must exist on disk or the render fails.
- HTTP: use curl. Python here has no SSL certs; the bundled Python helpers shell out to curl.
- Motion devices: `scripts/motion-kit.js` (API in `references/DEVICES.md`). Themes: `assets/themes/*.json`.

## 2. Reference → SPEC.md
If the user gives a reference video, download it (the `watch` skill or yt-dlp) and measure it frame by frame. If not, measure the approved film above. Record:
- cut frames, shot lengths, cuts per 10s
- camera curves and easing as the fraction of remaining distance covered per frame
- type-on speed, word-reveal spacing, accent-flash length
- card choreography
- where each sound sits relative to its cut

Then rebuild at that rhythm and change only brand, copy, design and assets.

Why: the feel lives in numbers (easing per frame, beats per shot). When agents worked from adjectives, the user said "감도가 낮아" or "모션이 어색해". When they matched measured numbers, it was approved. `references/MOTION_SPEC.md` has the measured numbers of the approved film.

## 3. Script
- **Hook that explains itself in 3 seconds. Show the result, don't describe it.** Frame 0 is already the most telling real thing the product produces (each case file has the exact recipe). For Evals that is the most contrasting pair of real outputs of the same prompt in a 50/50 split with model pills and a "vs", under the question the product answers ("Which model wins this week?"), then all N outputs at once under a literal line ("Same prompt. Completely different.").
  - Why: one output opening alone, with the comparison arriving later, got "비교 영상이 후킹이 안됨 결과 후킹이". A metaphorical or look-here line ("Check the sky.") was rejected; say the fact.
  - Why: an abstract opener (a rally of model names and a skills counter) got "뭐 어쩌라는건지 모르겠어". A viewer has to see the problem, not read about it.
- **One real task, followed end to end.** The case file gives the beat order (e.g. input → configure → run → result → proof → scale → end card with the URL).
- **Show things that move, not websites.** Outputs, real interactions, typing, scrolling, data updating. Static landing-page screenshots read as boring ("웹사이트 보여주지 말고 영상이나 게임"). If the product only makes web pages, show them in motion.
- **Copy.** On-screen lines are 2–5 words. The VO runs ≈2.7 words/sec (EN) or ≈6.5–7 syllables/sec (KO) for the whole film so the voice never goes quiet (`teaser` is the exception: it may be music-led).
- **Truth.** Only show features, names and numbers that appear in your own captures. No real-person likeness. No real customer data (use the product's demo workspace or seed data you made). A demo that shows something the product can't do is worse than no demo.

## 4. Design
Write `DESIGN.md` once (template is scaffolded) and make every shot follow it:
- start from a theme preset in `assets/themes/` (the case file names a default), then match the product: read its canvas colour live (`getComputedStyle(document.body).backgroundColor`) and its brand accent
- one sans family plus a mono for small tags; Pretendard for every Korean glyph
- one accent per frame, on the punch word only
- headlines left-aligned on one fixed margin (e.g. 120px) with the same tag→headline spacing everywhere
- real UI shown as rounded cards (16–22px) with a soft layered shadow tinted with the ink colour
- **one background tone for the whole film.** No dark sections in the middle ("중간에 검정색 배경 화면 없애주고 일정한 톤으로 전개해"). A film may be dark throughout (`devtool-cli`), never light↔dark switching.
- the product's real logo SVG in `build/theme.js` → `mark` (the scaffold leaves a placeholder ring)

`references/examples/` has complete systems ("Signal", "editorial"). For a new film, design a new system rather than reusing one, because the user explicitly asked for "시나리오랑 디자인만 다르게". **Evals films: read `references/looks/evals.md` first**; it is the approved house style and wins over older notes.

## 5. Assets (real, fresh, sharp)
- **UI stills:** `node $SK/scripts/capture_ui.mjs capture/ui.json` (4× DPR, element crops, scrollbars/banners hidden, logged-in via `storage`). No element is ever shown larger than its source pixels (2× captures looked soft). Crops contain only whole elements; if a crop needs context, rebuild the card background from the UI's own fill colour instead of leaving neighbouring rows in.
- **UI flows:** `node $SK/scripts/rec_flow.mjs capture/flow.json capture/clips/flow.mp4` (eased cursor, real clicks/typing/scroll, `mark` steps → cut points).
- **Outputs:** `rec_output.mjs <url> <out.mp4> 7 game|orbit` (screencast that presses keys or orbits) or `rec_scroll.mjs` (one screenshot per frame) when the screencast repeats frames.
- **Mobile / terminal:** `rec_ios.sh` (simulator, clean status bar); terminal = `EM.terminal` with real output or a real `vhs` recording (`assets/templates/demo.tape`).
- **Dedupe:** `sh $SK/scripts/dedupe.sh in.mp4 out.mp4` on every screencast. Repeated frames show up as micro-stutters and fail motion QA.
- **Same-input results:** if the story says "N setups", show N results from the same prompt/run. If a real run is needed, run it in the product with the user's logged-in Chrome. Showing unrelated outputs as one prompt's results got "결과가 다 다르잖아".
- **Logos:** real brand SVGs. For a logo moment, render them as actual 3D (three.js `SVGLoader` → `ExtrudeGeometry`, PBR material, env light, alpha WebM). Flat CSS logo fights looked cheap ("짜친다").

## 6. Voiceover: one continuous take
- **Voice:** EN Will `bIHbv24MWmeRgasZH58o`; KO Choi `ZNSVYmudV9pOqphY0x8C`. `eleven_v4`, stability 0.5, similarity 0.8, style 0.3, speed ~1.12 (the `vo3_gen.py` defaults).
- **No per-sentence emotion tags.** Send the whole script as plain text in one request.
  - Why: a take with a different tag on every sentence ([curious] → [excited] → [tired] → [confident]) was one take but the tone jumped each sentence, so it sounded stitched: "목소리가 너무 어색해 한 번에 생성해야". The steady setting fixed it.
  - The earlier max-emotion setting is still there with `STAB=0.15 STYLE=0.8` if the user asks for a hyped read.
- **Why this voice:** the user rejected the default narrator as "너무 아재 목소리" and picked Will.
- **Generate:** write `audio/vo3/lines.json` (`[[shot_id, "line"], …]`), then `python3 $SK/scripts/vo3_gen.py` → `take.mp3`, `segs.json` (per line), `words.json` (per word). Roll 3–4 takes with `TAKE=1…4` and pick the one with even sentence gaps that fits the cut windows. Retime the film to the take (move cuts, let the film grow), never the take to the film.
- **Lay it in whole.** One continuous piece from about 0.25s. Don't cut it into phrases, scatter phrases onto beats or time-stretch pieces.
  - Why: phrase cutting leaked syllables ("소리 짤려"). Scattering left dead air ("목소리가 중간에 죽잖아 … 쭉 이어지게"). Per-line re-synthesis drifted in loudness. If a line must change, regenerate the whole take.
- **Check:** gaps inside the VO ≤0.35s (vo3_gen prints the longest); a Whisper pass on the final mix shows no clipped words and no spoken tags. Respell risky names for TTS only ("Evals" → "E-vals" if it sounds like "evils").
- **Korean:** `VOICE=ZNSVYmudV9pOqphY0x8C`, same settings, no tags. The VO may say a brand in Hangul (이밸스), but on-screen type always writes the brand in Latin ("이밸스 -> evals 로 바꿔주고"). Keep the product's English UI terms in both VO and type, because the user wants the site's own words ("사이트에서 쓰이는 영어 용어는 그대로").

## 7. Music and SFX
- **Music:** a modern, premium bed. Stock EDM risers and corporate vibes read as "촌스러". `python3 $SK/scripts/music_gen.py 3 <seconds> "<case prompt>"` → `assets/music/m1..3.mp3`; pick the cleanest (low mid-range clutter).
- **Fit:** `beats.py assets/music/m*.mp3` (BPM, first beat) → `bars.py` (bar starts + energy) → choose `music.segments` in `post.json` so breaks and drops land on story beats (jump only on bar lines; preview with `music_fit.py`).
- **SFX kit:** `python3 $SK/scripts/sfx_gen.py` → `audio/sfx/{boom,hit,glitch,revswell,whip,zoom,tick,click,keys}.mp3`.

## 8. Build (VO-led, beat-locked)
- One paused GSAP timeline, fully deterministic; each shot runs in its own local time (`EM.film` in the starter).
- **The edit follows the voice.** Each shot change sits on the beat at or just before the first word of its phrase. Round earlier, never later, so the picture is ready when the word arrives.
- **Sync:** each on-screen word appears 0.05–0.20s before it is spoken, driven by `words.json`.
  - Why: text that trailed the voice felt "싱크가 안맞아". A full 1s lead felt "너무 느린데". A small lead reads as perfectly in sync.
- **Motion grammar:** `references/MOTION_RULES.md`. Read it fully. The heart of it:
  - one camera that is a pure function of time
  - only snappy (≈25% of remaining distance per frame) or floaty (≈12%) easing
  - exits accelerate into the cut and the next shot inherits the velocity
  - real whips where both shots travel together with velocity blur
  - overlays locked to the screen; overlapping action
  - every hold drifts 1–3%; no dead stops, no frozen frames, no double cuts
  - cuts on the beat ±1 frame
- **Zoom one way.** Don't zoom into an element and then release back out ("줌 인 했다가 왜 다시 풀어"). A push resolves forward into the next shot.
- **Configure moments must move.** When the VO names settings (e.g. "Model. Skill. Environment."), show the real UI values flipping in on each spoken word and carry the velocity into the next hit. A static card there read as "감도가 낮아".

## 9. Render and post
- **Speed by re-rendering, not frame-dropping.** Render at `--fps 95/4` (1.263×), or at `30/speedup` chosen so one beat equals a whole number of frames. Play back at 30fps.
- **Post:** fill `post.json` (frames, VO offset, music segments, `fx.big` / `fx.med` / `fx.flash`, SFX events by time or by VO word) and run `python3 $SK/scripts/post.py post.json`. It does:
  - retime to 30fps
  - impact FX on 4–6 big hits: +8.5% zoom punch (τ 0.09), 16px shake at ~22Hz (τ 0.1), RGB split 16px→7px over 4 frames, 1–2 frames of white flash; a lighter version on secondary cuts
  - layered SFX on every big hit (reverse swell → boom HP 60Hz → transient → glitch)
  - Why so few hits: impact on every cut stops reading as impact.
- **Mix:** VO about −16 LUFS in front; music ducks 4–6dB only under speech (≈50ms attack, 0.6s release); SFX bus about 3dB under the music; elsewhere SFX only on real UI actions (typing, clicks, ticks). Trailer slams on every word were removed as "안어울리는거". Master −14 LUFS, AAC 192k. Check with `mixcheck.py`.

## 10. QA before delivering
1. `python3 $SK/scripts/qa_check.py renders/<name>.mp4 <min_s> <max_s>`: format, length, −14 LUFS, true peak, cuts/10s, no frozen holds, no double cuts. Lengths per case are in `CASES.md`.
2. `python3 $SK/scripts/motion.py <mp4> <bpm> <first_beat>`: cuts on the beat, no dead stops, no frozen holds. Explain any exception that comes from the footage itself.
3. `sh $SK/scripts/strip.sh <mp4> <t> <out.png>` (16 consecutive frames) at every transition, and look at each one. Contact sheets (one frame every ~2s) look clean even when the motion is broken, which is how bad motion got shipped before.
4. Sync table: serve the project (`npx http-server -p 8765`) and run `node $SK/scripts/sync_audit.mjs http://localhost:8765/index.html 1.263 0.25` → `qa/sync_audit.md`; every lead 0.05–0.20s.
5. **Finish audit ("미감 높게 디테일한 마감"):** full-resolution stills at the start, middle and end of every shot; inspect the edges and corners; log each issue and its fix in `qa/finish.md`. Look for sliced icons or text, partial UI rows or dividers at card edges, scrollbars, grey bands from an over-zoomed stage, labels sitting on footage HUDs, blurry upscales, uneven padding, text touching card edges, the headline margin drifting between shots. The user spotted a half-cut paperclip icon and a divider line at a card corner in a single frame, so assume they will see everything.
6. Whisper once on the final mix (`whisper-cli -m ~/.cache/hyperframes/whisper/models/ggml-large-v3.bin -l en|ko -nt -f <16k.wav>`).

## Things the user has rejected (don't reintroduce)

| Rejected | User's words |
|---|---|
| Underlines / underline strokes | "밑줄 긋는거 하지마" |
| Colour highlight boxes behind words | "백그라운드 컬러 넣어서 효과 주는거 빼줘" |
| Row tick bars | "갈색 띠 없애줘" |
| Outlines, hairline boxes, rules, cheap gradients, emoji, fake UI mockups | — |
| 0.1s footage strobes, sudden full-screen footage between sections | "영상 막 쏟아져 나오는거", "갑자기 다른 화면" |
| Dark stand-alone intros detached from the film | "짜친다" |
| Text labels under logos | "글씨는 없애줘" |
| White rounded logo cards with a model icon inside, inline in a sentence | circled as "디자인 바꿔줘"; use real result thumbnails + model pill instead |
| Dark sections mid-film / a canvas lighter or darker than the site's | "중간에 검정색 배경 화면 없애주고 일정한 톤으로", "evals.ag/outputs 여기 컬러로 맞춰야지" |
| Per-sentence emotion tags in the VO | "목소리가 너무 어색해" |
| Metaphor / look-here hook lines ("Check the sky.") | "하늘좀 보세요 -> 문구 교체" |
| A launch post that only describes the clip | "evals 에 대해서 간단히 소개를 해주고 그거에 대해서 알려줘야지" |

## After delivery
- If the user asks for a playback speed (1.05× / 1.1×), apply it to the final with `setpts` + `atempo` and keep the 1× master.
- When they give notes, fix them in the same project and bump the version (`-v2`, `-v3`…).
- A launch post: introduce the product first, then the example in the film, then the CTA (format in `references/looks/evals.md` §7).
- Cutdowns (a `teaser` or `feature-launch` from a finished film) are new edits on the same captures and VO rules, not trims of the master.

## Bundled files
- **scripts/** — setup: `preflight.sh`, `new_project.sh`, `fetch_fonts.sh` · capture: `capture_ui.mjs`, `rec_flow.mjs`, `rec_output.mjs`, `rec_scroll.mjs`, `rec_ios.sh`, `dedupe.sh` · audio: `vo3_gen.py`, `music_gen.py`, `sfx_gen.py`, `beats.py`, `bars.py`, `music_fit.py` · build: `motion-kit.js` · post: `post.py` · QA: `qa_check.py`, `motion.py`, `strip.sh`, `sync_audit.mjs`, `mixcheck.py`
- **assets/** — `themes/` (evals, paper-signal, clean-violet, terminal-night, soft-mobile, editorial-cream) · `starter/` (HyperFrames project) · `templates/` (SCRIPT, DESIGN, DECISIONS, post.json, flow.json, ui.json, lines.json, demo.tape)
- **references/** — `CASES.md` + `cases/*.md` (the nine playbooks) · `MOTION_RULES.md` (grammar) · `MOTION_SPEC.md` (measured numbers) · `DEVICES.md` (motion-kit API) · `looks/evals.md` (Evals house style) · `BRIEF_TEMPLATE.md` (paste-in one-shot brief) · `examples/` (DESIGN, SCRIPT and brief samples)
