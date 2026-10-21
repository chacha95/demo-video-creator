<!-- Filled example of BRIEF_TEMPLATE.md for the ai-output-battle case (Evals, 2026-10). Paths are the maintainer's
     machine; on a fresh install, capture new clips instead of videos/evals-launch/…. -->

START NOW. Do not ask me any questions and do not wait for input — every input is below. Make every unspecified decision yourself, log it in DECISIONS.md, and keep going until ONE finished video file exists. The only deliverable is that one .mp4.

# Task
Make ONE ~60s landscape demo video for **Evals** (evals.ag): battle AI setups on your own task and vote blind.
- Output: `videos/evals-demo3/renders/evals-demo3.mp4`, 1920×1080, 30fps, H.264 + AAC 192k, −14 LUFS. Nothing else to deliver (no vertical version, no variants).
- Work dir: the repo root (Claude Code; all paths below are relative to it). Build in HyperFrames (HTML + one paused GSAP timeline) under `videos/evals-demo3/`. Render: `npx --yes hyperframes@0.8.101 render -o <out> --quiet` from the project dir. Use curl for HTTP/API calls (python has no SSL certs). ElevenLabs key: `ELEVENLABS_API_KEY` in the repo-root `.env` (if it is missing, follow Onboarding in SKILL.md).

# Story (English voiceover + on-screen type)
1. **Hook, first 3s must be instantly clear:** real AI-made GAME/VIDEO outputs of the SAME prompt slam in side by side, moving, full-bleed → big type "Which one is better?" → rapid A/B/C/D flips on the beats → "Same prompt. Different setups." → "You can't tell by guessing."
2. Type a real game/video task into the Evals composer → Battle → up to 4 setups (Model · Skill · Environment, each landing with real values and moving UI).
3. Send → velocity-matched zoom-through into the big hit → the 4 results play side by side.
4. Blind compare: two moving outputs, "Which would you choose?" → vote ("I prefer A").
5. Run record of that same output (real LLM, skill, environment, turn time, tokens).
6. Setup leaderboard ("Setups, not just models.").
7. Community wall of real game/video/shorts outputs.
8. End card: Evals mark + wordmark, "Stop guessing. Battle it.", **evals.ag**.

# Content rules
- Show ONLY videos, games, 3D scenes, motion videos, shorts made in Evals. **No websites / landing pages.**
- Main thread = the real 4-setup Sonic battle: prompt "Build a polished playable Sonic-style 3D platform game for the browser.", clips `videos/evals-launch/assets/clips/run_a.mp4` … `run_d.mp4`, run `https://evals-app.vercel.app/runs/run_597Q2CRE4FXNJ2R7HZXMVF4Z03`.
- Capture fresh real UI from https://evals-app.vercel.app with Playwright at 2× DPR: composer, Run-mode menu, setups stepper, compare page, output run record, Leaderboards, Explore → Outputs. If a page needs sign-in, use the public pages.
- Record extra community game/video outputs from their public "Open preview" links. Screencast 1600×900, 30fps, 6–7s, with keys pressed or orbit so they move. Reuse the pattern in `videos/evals-launch/scripts/rec.mjs`.
- No real-person likeness, no invented features/numbers/names. Only show model names you see in captures (e.g. Claude Opus 5.5, GPT-6 Astra).

# Voiceover (must flow continuously)
- ElevenLabs voice **Will** `bIHbv24MWmeRgasZH58o`, model `eleven_v4`, stability 0.5, similarity 0.8, style 0.3, speed 1.12, plain text with NO emotion tags (per-sentence tags made the take sound stitched). Use the `/with-timestamps` endpoint.
- Write ~165–180 words so the voice fills the whole film. Generate it as **ONE take and lay it unspliced** — never cut it into phrases or time-stretch pieces. Longest silence inside the VO ≤ 0.35s. No clipped words.
- The edit follows the voice: each shot change lands on the beat nearest the start of the phrase it illustrates.
- Verify with Whisper that every word is there and no tags are spoken. If "Evals" sounds like "evils", respell it "E-vals".

# Music & sound
- New modern premium BGM, not cheesy. Generate 2–3 candidates with ElevenLabs Music: "modern minimal tech launch, punchy kick, deep 808, crisp hats, glassy synth plucks, Apple/Linear keynote feel, no cheesy EDM risers, no corporate/stock vibe, 120 BPM". Pick the cleanest; detect BPM and the first downbeat.
- VO leads at about −16 LUFS. Music ducks about 6dB only while he speaks (smooth envelope). SFX bus ~3dB under the music, above it only on hits.
- At 4–6 big hits, layer reverse swell + boom (HP 60Hz) + transient + glitch. Light ticks and whooshes elsewhere — never on every cut.

# Look
Fresh premium design system, written once in DESIGN.md:
- one sans font, one accent colour
- real UI captures as rounded cards (16–22px) with soft shadows
- ONE background tone for the whole film: the evals.ag canvas `#F7F4ED` (see `references/looks/evals.md`), no dark sections
- **Never:** outlines/hairline boxes, rules, underlines, highlight boxes behind words, cheap gradients, emoji, fake UI mockups.

# Motion (non-negotiable — this is the feel)
Reference for feel: `videos/evals-hype/renders/evals-ref2-short-fast2-impact.mp4`; rules in `videos/evals-hype/MOTION_FIX.md`.
- One camera = a pure function of time with velocity-continuous easing. Deterministic: no timers or randomness.
- Two easing families only: snappy ≈25% of remaining distance per frame, floaty ≈12%.
- Exits accelerate into the cut; the next shot carries the velocity through it.
- Real whip-pans: both shots travel together over 0.3–0.45s with velocity blur.
- Overlays are screen-locked.
- Overlapping action, no start-stop chains.
- Every hold drifts 1–3%. No dead stops, no frozen frames, no double cuts.
- Word-by-word reveals 2–4 frames apart; the newest word flashes the accent.
- Cuts on the beat ±1 frame.
- **Speed by re-rendering:** render at `--fps 30/speedup` (e.g. `--fps 95/4` = 1.263×), play back at 30fps.
- **Impact FX in post (ffmpeg) on 4–6 big hits only:**
  - +8.5% zoom punch (τ 0.09s)
  - 16px shake at ~22Hz (τ 0.1s)
  - rgbashift 16px for 2 frames, then 7px for 2 frames
  - 1–2 frames of white flash
  - A lighter version on secondary cuts.

# QA (do it, then deliver)
- `python3 .claude/skills/demo-video-creator/scripts/motion.py <render> <bpm> <first_beat>`: no dead stops, no frozen holds, cuts on the beat.
- `sh .claude/skills/demo-video-creator/scripts/strip.sh <render> <t> <out.png>` at every transition — look at each strip.
- VO RMS gap check (≤ 0.35s) plus a Whisper pass on the final mix.
- Text readable and inside the margins; every name and number on screen is real.
- Fix anything that fails, re-render, and finish with the single file `videos/evals-demo3/renders/evals-demo3.mp4`.
