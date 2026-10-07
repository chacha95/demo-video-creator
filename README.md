# demo-video-creator

**English** · [한국어](README.ko.md)

An agent skill that turns a product URL into a finished **16:9 launch film**: real UI captures, real output footage, one continuous voiceover, beat-locked motion, impact FX and a mastered mix. You get one mp4 back.

The same skill makes the film in **English or Korean**. Both demos below came out of it:

### English (40s)

https://github.com/user-attachments/assets/2bb0fb3f-6a43-4286-9b37-9b6d64b53fde

### 한국어 (45s)

https://github.com/user-attachments/assets/3db6c46b-8cc2-4b96-a896-14263fa45057

Full 1080p files: [`media/demo_en.mp4`](media/demo_en.mp4) · [`media/demo_ko.mp4`](media/demo_ko.mp4)

Both are for [Evals](https://evals.ag). Same story and the same motion grammar. Only the voice, the copy and the Korean typeface change.

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

It also accepts a reference film: "make it feel like this video" plus a URL or a file.

## What you get

| | |
|---|---|
| Format | 1920×1080, 30fps, H.264 + AAC 192k |
| Length | about 40–60s |
| Loudness | −14 LUFS master, VO in front of the music |
| Language | English (ElevenLabs *Will*) or Korean (ElevenLabs *Choi*, Pretendard type). Product UI terms stay in English in both. |
| Project folder | `videos/<name>/` with `SCRIPT.md`, `DESIGN.md`, `DECISIONS.md`, the HyperFrames build, QA strips and `renders/<name>.mp4` |

The film follows one fixed structure:
1. A 3-second hook that shows real outputs side by side.
2. One real task followed end to end: input, configure, run, compare, proof, leaderboard.
3. An end card with the URL.

## Requirements

### API key (required)

| Key | Used for | How to get it |
|---|---|---|
| `ELEVENLABS_API_KEY` | Voiceover (`eleven_v4`, `/with-timestamps`) and background music (ElevenLabs Music) | 1. Sign in at [elevenlabs.io](https://elevenlabs.io).<br>2. Open profile (bottom-left) → **Developers / API Keys** → **Create API Key**.<br>3. Enable **Text to Speech**, **Music** and **Voices (read)**.<br>4. Copy the key. It is shown only once. |

Music generation may need a paid ElevenLabs plan. Each film uses one VO take plus 2–3 music candidates.

Put the key in a `.env` file at the root of the project you run the agent in:

```bash
ELEVENLABS_API_KEY=your_key_here
```

Don't paste the key into the chat. Keep `.env` out of git (`echo .env >> .gitignore`). On first run the skill checks the key against the API. If anything is missing, it tells you in one message before it starts building.

### Tools

| Tool | Why | Install (macOS) |
|---|---|---|
| Node.js 20+ | HyperFrames render, Playwright capture scripts | `brew install node` |
| ffmpeg / ffprobe | Retiming, impact FX, mix, QA strips | `brew install ffmpeg` |
| Python 3 + numpy | Beat detection, motion QA, mix checks | `pip3 install numpy` |
| Playwright + Chromium | 4× DPR UI captures and output screencasts | `npm i -D playwright && npx playwright install chromium` |
| HyperFrames | Composition and render (fetched automatically) | `npx --yes hyperframes@0.8.101` |
| whisper.cpp *(optional)* | Local Whisper check of the final mix, no key needed | `brew install whisper-cpp` |
| yt-dlp *(optional)* | Downloading a reference video | `brew install yt-dlp` |

The skill is written for Claude Code. It also reads the `hyperframes-core` skill if it is installed (`npx skills add heygen-com/hyperframes`).

### What the product needs

- **A live URL that Playwright can open.** Every frame of UI comes from real captures, and nothing is mocked. If a page needs sign-in, the agent uses your logged-in Chrome or falls back to public pages.
- **Something that moves.** This means outputs like games, videos, 3D scenes or interactive pages. The skill avoids static website screenshots on purpose.
- **Real numbers only.** Model names, stats and features on screen must appear in your own captures.

## English vs Korean

| | English | Korean |
|---|---|---|
| Voice | Will `bIHbv24MWmeRgasZH58o` | Choi `ZNSVYmudV9pOqphY0x8C` |
| Settings | `eleven_v4`, stability 0.15, similarity 0.8, style 0.8, speed ≈1.1, inline emotion tags | same |
| Script | 165–180 words for 60s | same pacing, Korean copy |
| Type | Your design system's sans | Pretendard for every Korean glyph |
| UI terms | as on the site | kept in English (Task, Setup, Battle, Model, Skill…) |

Ask for both and you get two separate renders of the same edit.

## How it works

```
brief → reference SPEC → SCRIPT.md → DESIGN.md → real UI + output captures
→ one-take VO → music → HyperFrames build (VO-led, beat-locked)
→ fps re-render speed-up → post (impact FX, mix) → QA → renders/<name>.mp4
```

Highlights:
- **Motion grammar from measured numbers, not adjectives.** It uses one camera, two easing families (snappy and floaty), exits that carry velocity into the next shot, and cuts on the beat ±1 frame. Details are in [`MOTION_RULES.md`](skills/demo-video-creator/references/MOTION_RULES.md).
- **One continuous VO take.** It is never chopped or time-stretched. On-screen words lead the voice by 0.05–0.20s.
- **QA before delivery.** This covers motion analysis, 16-frame strips at every transition, a sync table for every line, and a finish audit of every shot's edges and corners.

The full pipeline is in [`SKILL.md`](skills/demo-video-creator/SKILL.md).

## Limits

- Output is landscape only. For 9:16 Shorts/Reels, use a vertical skill.
- One film takes a long agent session: captures, a render, post and QA.
- Brand logos and output footage belong to their owners. Only use material you have the right to show.

## License

MIT
