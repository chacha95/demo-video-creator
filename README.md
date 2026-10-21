# demo-video-creator

**English** · [한국어](README.ko.md)

An agent skill that turns a product URL into a finished **16:9 demo or launch film**: real UI captures, real output footage, one continuous voiceover, beat-locked motion, impact FX and a mastered mix. You get one mp4 back.

It covers **nine kinds of demo video**, from a 15-second teaser to a 90-second SaaS walkthrough, for AI tools, web apps, CLIs, mobile apps, browser extensions and marketplaces. It makes each one in **English or Korean**. Both demos below came out of it:

### English (40s)

https://github.com/user-attachments/assets/2bb0fb3f-6a43-4286-9b37-9b6d64b53fde

### 한국어 (45s)

https://github.com/user-attachments/assets/3db6c46b-8cc2-4b96-a896-14263fa45057

Full 1080p files: [`media/demo_en.mp4`](media/demo_en.mp4) · [`media/demo_ko.mp4`](media/demo_ko.mp4)

Both are for [Evals](https://evals.ag) (the `ai-output-battle` case). Same story and the same motion grammar. Only the voice, the copy and the Korean typeface change.

## Install

```bash
npx skills add chacha95/demo-video-creator
```

Then ask your agent:

```text
Make a 1-minute landscape demo video for https://your-product.com
```

```text
https://your-product.com 한국어 버전으로 1분짜리 가로 데모 영상 뽑아줘
```

```text
Make a 30s feature launch video for our new Auto-summary feature
```

It also accepts a reference film: "make it feel like this video" plus a URL or a file. For a fully hands-off run, fill in [`BRIEF_TEMPLATE.md`](skills/demo-video-creator/references/BRIEF_TEMPLATE.md) and paste it.

## Cases

The skill picks one case from the product and the request, then follows that playbook for the hook, the story, the captures and the length. Everything else (motion, voice, mix, QA) is shared.

| Case | For | Length | First 3 seconds |
|---|---|---|---|
| [`ai-output-battle`](skills/demo-video-creator/references/cases/ai-output-battle.md) | AI generators, model comparison | 45–65s | the two most different real outputs of the same prompt, side by side |
| [`saas-workflow`](skills/demo-video-creator/references/cases/saas-workflow.md) | dashboards, CRM, docs, project tools | 45–75s (walkthrough 60–100s) | the finished result of one real job, already moving |
| [`devtool-cli`](skills/demo-video-creator/references/cases/devtool-cli.md) | CLIs, SDKs, APIs, coding agents | 40–60s | the deployed result, then the one command |
| [`mobile-app`](skills/demo-video-creator/references/cases/mobile-app.md) | iOS / Android apps | 30–60s | the app's money screen, mid-interaction |
| [`browser-extension`](skills/demo-video-creator/references/cases/browser-extension.md) | Chrome extensions, in-page assistants | 30–45s | a familiar page, transformed by the extension |
| [`marketplace-catalog`](skills/demo-video-creator/references/cases/marketplace-catalog.md) | skill/template/asset stores | 45–60s | a moving wall of real items plus the live count |
| [`feature-launch`](skills/demo-video-creator/references/cases/feature-launch.md) | one new feature or changelog entry | 20–40s | the feature already doing its job |
| [`teaser`](skills/demo-video-creator/references/cases/teaser.md) | pre-launch or social cutdown | 12–20s | the single strongest moving shot, music-led |
| [`before-after`](skills/demo-video-creator/references/cases/before-after.md) | automation, dictation, assistants | 30–50s | manual vs product, split screen, real timers |

The router with music prompts and VO word budgets is [`CASES.md`](skills/demo-video-creator/references/CASES.md).

## What you get

| | |
|---|---|
| Format | 1920×1080, 30fps, H.264 + AAC 192k |
| Length | per case, 12–100s |
| Loudness | −14 LUFS master, VO in front of the music |
| Language | English (ElevenLabs *Will*) or Korean (ElevenLabs *Choi*, Pretendard type). Product UI terms stay in English in both. |
| Project folder | `videos/<name>/` with `SCRIPT.md`, `DESIGN.md`, `DECISIONS.md`, the HyperFrames build, QA strips and `renders/<name>.mp4` |

## Requirements

### API key (required)

| Key | Used for | How to get it |
|---|---|---|
| `ELEVENLABS_API_KEY` | Voiceover (`eleven_v4`, `/with-timestamps`), background music (ElevenLabs Music) and the SFX kit (Sound Effects) | 1. Sign in at [elevenlabs.io](https://elevenlabs.io).<br>2. Open profile (bottom-left) → **Developers / API Keys** → **Create API Key**.<br>3. Enable **Text to Speech**, **Music**, **Sound Effects** and **Voices (read)**.<br>4. Copy the key. It is shown only once. |

Music generation may need a paid ElevenLabs plan. Each film uses 1–4 VO takes, 2–3 music candidates and one SFX kit (reused across films).

Put the key in a `.env` file at the root of the project you run the agent in:

```bash
ELEVENLABS_API_KEY=your_key_here
```

Don't paste the key into the chat. Keep `.env` out of git (`echo .env >> .gitignore`). On first run the skill runs `scripts/preflight.sh`, which checks the key against the API without printing it. If anything is missing, it tells you in one message before it starts building.

### Tools

| Tool | Why | Install (macOS) |
|---|---|---|
| Node.js 20+ | HyperFrames render, Playwright capture scripts | `brew install node` |
| ffmpeg / ffprobe | Retiming, impact FX, mix, QA strips | `brew install ffmpeg` |
| Python 3 + numpy | Beat detection, motion QA, mix checks | `pip3 install numpy` |
| Playwright + Chromium | 4× DPR UI captures, flow recordings, output screencasts | `npm i -D playwright && npx playwright install chromium` (repo root) |
| HyperFrames | Composition and render (fetched automatically) | `npx --yes hyperframes@0.8.101` |
| whisper.cpp *(optional)* | Local Whisper check of the final mix, no key needed | `brew install whisper-cpp` |
| yt-dlp *(optional)* | Downloading a reference video | `brew install yt-dlp` |
| Xcode Simulator *(mobile-app)* | Real app recordings with a clean status bar | Xcode |
| vhs *(optional, devtool-cli)* | Real terminal recordings | `brew install vhs` |

The skill is written for Claude Code. It also reads the `hyperframes-core` skill if it is installed (`npx skills add heygen-com/hyperframes`).

### What the product needs

- **A live URL (or a simulator build) that can be captured.** Every frame of UI comes from real captures, and nothing is mocked. If a page needs sign-in, the agent uses your logged-in session or falls back to public pages.
- **Something that moves.** Outputs, a real flow, commands running, data changing. The skill avoids static website screenshots on purpose.
- **Real numbers only.** Names, stats and features on screen must appear in your own captures. SaaS films use a seeded demo workspace, never real customer data.

## What's inside

```
skills/demo-video-creator/
├── SKILL.md                    pipeline + every rule the user approved or rejected
├── references/
│   ├── CASES.md, cases/*.md    the nine playbooks
│   ├── MOTION_RULES.md         motion grammar
│   ├── MOTION_SPEC.md          per-frame numbers measured from the approved film
│   ├── DEVICES.md              motion-kit.js API
│   ├── BRIEF_TEMPLATE.md       paste-in one-shot brief
│   ├── looks/evals.md          Evals house style
│   └── examples/               DESIGN, SCRIPT and brief samples
├── assets/
│   ├── themes/*.json           evals · paper-signal · clean-violet · terminal-night · soft-mobile · editorial-cream
│   ├── starter/                HyperFrames project (one paused timeline, 5 sample shots)
│   └── templates/              SCRIPT / DESIGN / DECISIONS / post.json / flow.json / ui.json / demo.tape
└── scripts/
    ├── preflight.sh, new_project.sh, fetch_fonts.sh
    ├── capture_ui.mjs, rec_flow.mjs, rec_output.mjs, rec_scroll.mjs, rec_ios.sh, dedupe.sh
    ├── vo3_gen.py, music_gen.py, sfx_gen.py, beats.py, bars.py, music_fit.py
    ├── motion-kit.js           13 deterministic motion devices + theming
    ├── post.py                 retime, impact FX, duck, SFX, −14 LUFS (config: post.json)
    └── qa_check.py, motion.py, strip.sh, sync_audit.mjs, mixcheck.py
```

## How it works

```
case → brief → reference SPEC → SCRIPT.md → DESIGN.md → real UI + output captures
→ one-take VO → music + SFX → HyperFrames build (VO-led, beat-locked)
→ fps re-render speed-up → post (impact FX, mix) → QA → renders/<name>.mp4
```

Highlights:
- **The first frame is the payoff.** Each case defines what the viewer sees in the first 3 seconds, and it is always a real result, never a logo or a slogan.
- **Motion grammar from measured numbers, not adjectives.** It uses one camera, two easing families (snappy and floaty), exits that carry velocity into the next shot, and cuts on the beat ±1 frame. Details are in [`MOTION_RULES.md`](skills/demo-video-creator/references/MOTION_RULES.md).
- **One continuous VO take.** It is never chopped or time-stretched. On-screen words lead the voice by 0.05–0.20s.
- **QA before delivery.** A delivery gate (`qa_check.py`: format, length, loudness, cuts, frozen holds), motion analysis, 16-frame strips at every transition, a sync table for every word, and a finish audit of every shot's edges and corners.

The full pipeline is in [`SKILL.md`](skills/demo-video-creator/SKILL.md). Changes are in [`CHANGELOG.md`](CHANGELOG.md).

## Limits

- Output is landscape only. For 9:16 Shorts/Reels, use a vertical skill.
- One film takes a long agent session: captures, a render, post and QA.
- Brand logos and output footage belong to their owners. Only use material you have the right to show.

## License

MIT
