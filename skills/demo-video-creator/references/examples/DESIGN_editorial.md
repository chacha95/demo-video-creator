# ref2 shared design system — ALL sections use exactly these (no per-section drift)

Canvas 1920×1080, 30fps. Frame numbers below and in SPEC.md are global reference frames; a section's local frame = global − section start.

## Color (reference → Evals)
| role | reference | Evals |
|---|---|---|
| type-scene bg (ref white #FEFEFE) | #FEFEFE | `#FCFBF7` |
| UI-scene bg (ref off-white #F6F5F1) | #F6F5F1 | `#F7F4ED` (matches the real screenshots) |
| dark bg | #1A1A1A | `#181515` |
| headline text on light | ~#191919 | `#2B231D` |
| secondary grey on light | #787672 | `#8A8076` |
| text on dark | white | `#F7F4ED` |
| secondary grey on dark | #7F7F7F | `#8C847C` |
| accent (caret, new-word flash, mention, send button highlight) | blue #2383E2 | coral `#A13A2B` on light, `#E0573F` on dark |
| new-word flash light variant | light blue | `#E9A79A` |
| "3.7" gradient | #3A7EDE→#8E6AD2 | no gradient: solid coral `#E0573F` |
| 4 pills | #8E64AD #C9902F #438261 #337CA8 | keep these 4 muted hues (they read as model/setup colors) |
| shot-1 pastel wash | blue/lavender blur | warm wash: blurred cream `#F7F4ED` with soft peach `#F3D9CF` and sand `#EADFC9` blobs (very soft, no hard gradient bands) |

## Type
- Only sans: `diatype` (assets/fonts/captured-diatype-400/500/700.woff2). Headlines = 500 (ref SemiBold), uppercase lines = 700, UI-ish small text = 400/500. Mono (`IBM Plex Mono` 500) only if the ref uses a mono-like label (it mostly doesn't).
- Letter-spacing headlines −0.02em; line-height 1.0. Use the ref's px sizes from SPEC (e.g. "in one workspace." ≈184px).
- Caret: solid (never blinks), coral, 1.1–1.17× cap height, 0.08em wide; disappears 16–20 frames after the last keystroke or on submit.
- Hero type-on 1 char / 2 frames; in-product typing 0.6–0.9 char/frame; backspace ~0.7 char/frame.

## Shapes
- NO outlines/hairline boxes/rules (user rejected them). Cards = real UI captures with radius 14–18px and soft shadow `0 1px 2px rgba(43,35,29,.06), 0 18px 50px rgba(43,35,29,.12)` (on dark: `0 20px 60px rgba(0,0,0,.45)`).
- Cursor: macOS-style arrow, ink fill with white edge (on dark: white with ink edge), 34px tall.

## Motion (from SPEC §c — follow it, it overrides earlier "nothing freezes" rules for this film)
- Two easing families only: snappy ≈25% of remaining distance per frame (90% in 8–9 frames) and floaty ≈12% (18–20 frames). Implement as exponential approach / custom ease; no overshoot except where SPEC says.
- Exits accelerate into the cut; the next shot carries the motion through the cut (velocity-matched).
- Locked-off holds are allowed where the reference holds (20–36 frames).
- Word reveals 2–4 frames apart, newest word flashes accent then settles to base colour 3–12 frames later.
- Everything must be a pure function of time (one paused GSAP timeline, no timers/random). Any frame renders alone.

## Evals content rules
Real UI only (`assets/ui/*`, `assets/screens/*`, `assets/clips/*`), real strings only. No invented numbers, rankings, setup/model names
beyond what's visible in the real captures ("Claude Opus 5.5", "GPT-6 Astra" appear in the real leaderboard capture). See BRIEF.md copy map.
