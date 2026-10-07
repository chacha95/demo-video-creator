---
name: demo-video-creator
description: Make a landscape 16:9 (1920×1080) ~60s product demo / launch film for a web app, AI tool or SaaS with the user's approved motion feel ("감도") — real product UI captures + real output footage, one continuous emotive English voiceover (ElevenLabs Will, eleven_v4), beat-locked HyperFrames build, fps re-render speed-up, impact FX + layered SFX, one finished mp4 at −14 LUFS. Use this whenever the user asks for a 데모 영상 / 데모 비디오 / 런치 영상 / 런치 필름 / 제품 소개 영상 / 프로모 영상 / "이 감도로 영상" / "가로 데모" / "1분짜리 제품 영상" / keynote- or Linear/Apple-style launch video / demo video / launch film / product promo — for Evals (evals.ag), Skillshop (skills.ag) or any other product, in English or Korean — even if they only paste a product URL and say "영상 하나 뽑아줘". Also use it when they hand a reference video and say "이 느낌으로 우리 제품 영상". Not for vertical 9:16 Shorts/Reels (use the reels/shorts skills).
---

# Demo Video Creator

Builds a ~60s landscape product demo/launch film with the motion feel the user approved. The deliverable is one mp4.

Why this skill exists: the user iterated a long way to reach this feel, and almost every rule below is a correction they made. Agents left alone drift back to the same mistakes: hook-less intros, website screenshots, chopped voiceover, late subtitles, sloppy crops and trailer SFX on every word. Read the "Why" notes so you can apply the intent to new products, not just copy Evals.

Approved references on this machine (watch them before building):
- `videos/evals-hype/renders/evals-ref2-short-fast2-impact.mp4` is the motion feel ("모션이 좋단다").
- `videos/evals-demo2/` holds the hook, continuous VO, VO-led edit and finish pass. Its `SCRIPT.md`, `DESIGN.md` and `qa/finish.md` show what "done" looks like.
- If those paths don't exist (a fresh install), use the published sample films instead: https://github.com/chacha95/demo-video-creator/tree/main/media (`demo_en.mp4`, `demo_ko.mp4`). `references/examples/` has the matching SCRIPT and DESIGN docs.

Work autonomously. The user wants to paste one request and get one video back. They got frustrated when a session stopped to ask for inputs ("인풋 요구해서 안되는데"). Make reasonable decisions, log them in `DECISIONS.md`, and keep going until the mp4 exists.

## 0. Onboarding: keys and tools (check once, before step 1)
This is the one moment you may stop and ask. Check everything in a single pass at the start, report every gap in one message, then run autonomously once it is fixed. Never ask mid-pipeline.

Check:
```bash
grep -q '^ELEVENLABS_API_KEY=.' .env 2>/dev/null || [ -n "$ELEVENLABS_API_KEY" ] && echo "key ok" || echo "ELEVENLABS_API_KEY missing"
H=$(mktemp); chmod 600 "$H"   # key goes through a header file, never on the command line
printf 'xi-api-key: %s\n' "${ELEVENLABS_API_KEY:-$(grep '^ELEVENLABS_API_KEY=' .env | cut -d= -f2-)}" > "$H"
curl -s -o /dev/null -w "%{http_code}\n" -H @"$H" https://api.elevenlabs.io/v1/user; rm -f "$H"   # 200 = valid
which ffmpeg node npx whisper-cli; node -e "require.resolve('playwright')" && echo "playwright ok"
```
Never print the key value in chat or logs, and never put it in a command-line argument (use `-H @file` as above).

If the key is missing or not 200, tell the user (in Korean if they write Korean) how to get it:

> **ElevenLabs API 키가 필요해요** (나레이션 + 배경음악 생성용)
> 1. https://elevenlabs.io 에 로그인하세요. 음악 생성(Music)은 유료 플랜이 필요할 수 있어요.
> 2. 왼쪽 아래 프로필 → **Developers / API Keys** → **Create API Key**.
> 3. 권한에서 **Text to Speech**, **Music**, **Voices (read)**를 켜고 만드세요. 키는 한 번만 보여요.
> 4. 프로젝트 루트의 `.env` 파일에 한 줄 추가하세요 (파일이 없으면 새로 만드세요):
>    `ELEVENLABS_API_KEY=여기에_키`
> 5. 채팅에 키를 붙여넣지 마세요. 저장했다고만 알려주시면 이어서 진행할게요.

`.env` is gitignored. Do not commit it or copy the key anywhere else.

Tools, if missing: `brew install ffmpeg whisper-cpp` (`whisper-cli` covers the Whisper QA pass locally, no key needed), Node 20+, then `npm i -D playwright && npx playwright install chromium`.

## Pipeline

```
brief → reference SPEC → SCRIPT.md (+VO lines) → DESIGN.md → assets (real UI + real outputs)
→ VO (one take) → music → build (HyperFrames, VO-led, beat-locked) → render at fps 30/speedup
→ post (retime, impact FX, mix) → QA (motion, strips, sync table, finish audit) → renders/<name>.mp4
```

Project: `videos/<name>/` with `SCRIPT.md DESIGN.md DECISIONS.md index.html build/ capture/ assets/ audio/ scripts/ qa/ renders/`.

Tooling notes:
- Render: `npx --yes hyperframes@0.8.101 render -o <out> --quiet --fps 95/4` from the project dir. Read the `hyperframes-core` skill if the composition contract is unfamiliar.
- HTTP: use curl. Python here has no SSL certs.
- Keys: `.env` at the repo root (`ELEVENLABS_API_KEY`). All paths in this skill are relative to the repo root. See Onboarding below.
- Bundled helpers live in `scripts/` (listed at the end).

## 1. Reference → SPEC.md
If the user gives a reference video, download it (the `watch` skill or yt-dlp) and measure it frame by frame. If not, measure the approved film above. Record:
- cut frames, shot lengths, cuts per 10s
- camera curves and easing as the fraction of remaining distance covered per frame
- type-on speed, word-reveal spacing, accent-flash length
- card choreography and light↔dark switches
- where each sound sits relative to its cut

Then rebuild at that rhythm and change only brand, copy, design and assets.

Why: the feel lives in numbers (easing per frame, beats per shot). When agents worked from adjectives, the user said "감도가 낮아" or "모션이 어색해". When they matched measured numbers, it was approved.

## 2. Script
- **Hook that explains itself in 3 seconds.** Open on real outputs of the same prompt playing side by side and ask the question the product answers (for Evals: "Which one is better?"). Flip A/B/C/D on the beats, then deliver the twist ("Same prompt. Different setups.").
  - Why: an abstract opener (a rally of model names and a skills counter) got "뭐 어쩌라는건지 모르겠어". A viewer has to see the problem, not read about it.
- **One real task, followed end to end.** Input → configure → run → results side by side → choose → proof (record/details) → aggregate (leaderboard/stats) → community → end card with the URL.
- **Show moving outputs, not websites.** Games, videos, 3D scenes and shorts read as spectacle in a demo; landing-page screenshots read as boring ("웹사이트 보여주지 말고 영상이나 게임"). If the product only makes web pages, show them in motion (scrolling, interacting), not as static captures.
- **Copy.** On-screen lines are 2–5 words. The VO script runs about 165–180 words for 60s (≈2.7 words/sec) so the voice never goes quiet.
- **Truth.** Only show features, names and numbers that appear in your own captures. No real-person likeness. A demo that shows something the product can't do is worse than no demo.

## 3. Design
Write `DESIGN.md` once and make every shot follow it. It sets:
- one sans family plus a mono for small tags
- one accent per frame
- headlines left-aligned on one fixed margin (e.g. 120px) with the same tag→headline spacing everywhere
- real UI shown as rounded cards (16–22px) with a soft layered shadow
- dark/light section switches

`references/examples/` has two complete systems: "Signal" (graphite/paper, blue) and "editorial" (cream/ink, coral). When the user asks for a new film, design a new system rather than reusing one, because the user explicitly asked for "시나리오랑 디자인만 다르게".

## 4. Assets (real, fresh, sharp)
- **UI:** Playwright captures at 4× DPR, so no element is ever shown larger than its source pixels (2× captures looked soft). Cut crops that contain only whole elements. If a crop needs context, rebuild the card background from the UI's own fill colour instead of leaving neighbouring rows in.
- **Outputs:**
  - `scripts/rec_output.mjs <url> <out.mp4> 7 game|orbit` (screencast; press keys or orbit so the output moves).
  - `scripts/rec_scroll.mjs` (one screenshot per frame) when the screencast repeats frames.
  - Remove duplicate frames before use, because repeated frames show up as micro-stutters and fail motion QA.
- **Same-prompt results:** if the story says "N setups", show N results from the same prompt/run. If a real run is needed, run it in the product with the user's logged-in Chrome. Showing unrelated outputs as one prompt's results got "결과가 다 다르잖아".
- **Logos:** if a brand-logo moment is needed, use real brand SVGs rendered as actual 3D (three.js `SVGLoader` → `ExtrudeGeometry`, PBR material, env light, alpha WebM). Flat CSS logo fights looked cheap ("짜친다").

## 5. Voiceover: one continuous take
- **Voice:** Will `bIHbv24MWmeRgasZH58o`, `eleven_v4`, stability 0.15, similarity 0.8, style 0.8, speed ~1.1.
- **Emotion tags inline:** [excited] [confident] [curious] [emphatic] [quick].
- **Why this voice:** the user rejected the default narrator as "너무 아재 목소리". They wanted hip and energetic (Sam Altman / Elon feel), heard alternatives, and picked this max-emotion setting.
- **Generate:** `scripts/vo3_gen.py` (one `/with-timestamps` call). It writes the take, per-line segments and word timestamps.
- **Lay it in whole.** Put the take down as one continuous piece from about 0.25s. Don't cut it into phrases, scatter phrases onto beats or time-stretch pieces.
  - Why: phrase cutting leaked syllables ("소리 짤려").
  - Scattering left dead air ("목소리가 중간에 죽잖아 … 쭉 이어지게").
  - Per-line re-synthesis drifted in loudness.
  - If a line must change, regenerate the whole take.
- **Check:**
  - Gaps inside the VO are ≤0.35s.
  - A Whisper pass on the final mix shows no clipped words and no spoken tags.
  - If "Evals" sounds like "evils", respell it "E-vals".
- **Korean version:** Choi `ZNSVYmudV9pOqphY0x8C`, same tags and settings. Keep the product's English UI terms in both VO and type (Task, Setup, Battle, Model, Skill, Environment), because the user wants the site's own words ("사이트에서 쓰이는 영어 용어는 그대로"). Use Pretendard for every Korean glyph.

## 6. Music
- **What to make:** a modern, premium bed. Stock EDM risers and corporate vibes read as "촌스러".
- **How:** generate 2–3 candidates with ElevenLabs Music using a prompt like: "modern minimal tech launch, punchy kick, deep 808, crisp hats, glassy plucks, Apple/Linear keynote, no cheesy risers, no stock vibe, 120 BPM". Pick the cleanest one (low mid-range clutter).
- **Fit:**
  - `scripts/beats.py` / `bars.py` give BPM and the first downbeat.
  - `scripts/music_fit.py` rearranges the track at bar level so its breaks and drops land on story beats.

## 7. Build (VO-led, beat-locked)
- Use one paused GSAP timeline, fully deterministic. Each shot runs in its own local time.
- **The edit follows the voice.** Each shot change sits on the beat at or just before the first word of its phrase. Round earlier, never later, so the picture is ready when the word arrives.
- **Sync:** each on-screen word appears 0.05–0.20s before it is spoken, driven by the take's word timestamps.
  - Why: text that trails the voice felt "싱크가 안맞아". A full 1s lead felt "너무 느린데", because the text and voice came apart.
  - A small lead reads as perfectly in sync.
  - Audit every line with `scripts/sync_audit.mjs` and keep a table (text_on, voice_on, lead).
- **Motion grammar:** in `references/MOTION_RULES.md`. Read it fully. The heart of it:
  - one camera that is a pure function of time
  - only snappy (≈25% of remaining distance per frame) or floaty (≈12%) easing
  - exits accelerate into the cut and the next shot inherits the velocity
  - real whips where both shots travel together with velocity blur
  - overlays locked to the screen
  - overlapping action
  - every hold drifts 1–3%
  - no dead stops, no frozen frames, no double cuts
  - cuts on the beat ±1 frame
- **Zoom one way.** Don't zoom into an element and then release back out ("줌 인 했다가 왜 다시 풀어"). A push should resolve forward into the next shot.
- **Configure moments must move.** When the VO names settings (e.g. "Model. Skill. Environment."), show the real UI values flipping in on each spoken word and carry the velocity into the next hit. A static card there read as "감도가 낮아".

## 8–9. Render and post
- **Speed by re-rendering, not frame-dropping.** Render at `--fps 95/4` (1.263×), or at `30/speedup` chosen so one beat equals a whole number of frames. Play back at 30fps.
- **Post:** copy `scripts/post_template.py` and set `NF`, `BIG`, `MED`, `FLASH`, `VO_OFF`. It handles:
  - retiming to 30fps
  - impact FX on 4–6 big hits: +8.5% zoom punch (τ 0.09), 16px shake at ~22Hz (τ 0.1), RGB split 16px→7px over 4 frames, 1–2 frames of white flash
  - a lighter version on secondary cuts
  - the mix and loudness
  - Why so few hits: impact on every cut stops reading as impact.
- **Mix:**
  - VO about −16 LUFS, in front.
  - Music ducks about 4–6dB only under speech, with a smooth envelope (≈50ms attack, 0.6s release).
  - SFX bus about 3dB under the music.
  - At big hits, layer reverse swell + boom (HP 60Hz) + transient + glitch.
  - Elsewhere, put SFX only on real UI actions (typing, clicks, ticks). Trailer slams on every word were removed as "안어울리는거".
  - Master −14 LUFS, AAC 192k. Check with `scripts/mixcheck3.py`.

## 10. QA before delivering
1. `python3 scripts/motion.py <mp4> <bpm> <first_beat>`: cuts on the beat, no dead stops, no frozen holds. Explain any exception that comes from the footage itself.
2. `sh scripts/strip.sh <mp4> <t> <out.png>` (16 consecutive frames) at every transition, and look at each one. Contact sheets (one frame every ~2s) look clean even when the motion is broken, which is how bad motion got shipped before.
3. Sync table for every VO line: the lead must be 0.05–0.20s.
4. **Finish audit ("미감 높게 디테일한 마감"):** pull full-resolution stills at the start, middle and end of every shot and inspect the edges and corners. Log each issue and its fix in `qa/finish.md`. Look for:
   - sliced icons or text
   - partial UI rows or dividers at card edges
   - scrollbars
   - grey bands from an over-zoomed stage
   - labels sitting on footage HUDs
   - blurry upscales
   - uneven padding
   - text touching card edges
   - the headline margin drifting between shots
   - The user spotted a half-cut paperclip icon and a divider line at a card corner in a single frame, so assume they will see everything.
5. Run Whisper on the final mix once and confirm loudness is −14 LUFS ±0.5.

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

## After delivery
- If the user asks for a playback speed (1.05× / 1.1×), apply it to the final with `setpts` + `atempo` and keep the 1× master.
- When they give notes, fix them in the same project and bump the version (`-v2`, `-v3`…).

## Bundled files
- **scripts/**
  - `motion.py`, `strip.sh`: motion QA
  - `beats.py`, `bars.py`: BPM and downbeat
  - `rec_output.mjs`, `rec_scroll.mjs`: output footage
  - `vo3_gen.py`: one-take VO. Reads `audio/vo3/lines.json` = `[[shot_id, "line"], …]`
  - `music_fit.py`
  - `post_template.py`: FX + mix
  - `sync_audit.mjs`
  - `mixcheck3.py`
- **references/**
  - `MOTION_RULES.md`: the full motion grammar
  - `examples/`: DESIGN and SCRIPT samples
