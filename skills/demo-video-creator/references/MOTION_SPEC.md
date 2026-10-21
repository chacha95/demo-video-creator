# MOTION_SPEC: demo_en2.mp4 motion devices (intro excluded)

Measured 2026-10-08 from `demo_en2.mp4` (the approved Evals hype film) (28.77s, 1920x1080, 30fps).
**demo_en2 is byte-identical to `videos/evals-hype/renders/evals-ref2-refined-en.mp4`.** It was built like this:

| stage | file | what it does |
|---|---|---|
| sections | `videos/evals-hype/ref2/build-A/index.html` (27.47s), `build-B/index.html` (17.07s), `build-C/index.html` (21.8s) | HyperFrames compositions. Every device is a **pure per-frame `render(f)` function** driven by one paused GSAP proxy tween. The motion comes from per-frame tables measured from the Motionfly "Notion 3.7" reference (`ref2/SPEC.md`). |
| 60fps re-render | `build-*/renders/*_60.mp4` | same timeline at 60fps, so the warp below can sample sub-frames |
| time warp | `videos/evals-hype/vo/build_warp.py` + `vo/warp.json` + `vo/remap.py` | picks source spans and re-times them piecewise-linearly to the VO (speed 0.85x to 1.73x, see the table) |
| intro | `vo/hook3d_v2.mov`, frames 0-131 (0-4.40s) | model-logo shuffle, **excluded** |
| post | `vo/final_refined.py` | concat → post zoom punches + end push (ffmpeg `scale` expr) → SFX + VO mix → mp4 |

Source time → output time: `remap.src2new(sec)` where sec is the A|B|C concat time (B starts at 824f = 27.467s, C at 1336f = 44.533s).

## 0. Timeline map (output seconds)

| out t | device | source span | speed |
|---|---|---|---|
| 0.00-4.40 | intro logo shuffle (EXCLUDED) | hook3d_v2.mov | 1 |
| 4.40-6.13 (+frozen to 6.17) | 1 Logo reveal | A L33-77 | **0.85** |
| 6.14-8.48 | 2 Kinetic sentence + inline chips | A L193-264 | 1.01 |
| 8.48-9.80 | 3 Dot-field word reveal | A L264-304 | 1.01 |
| 9.80-14.77 | 4 Composer → dark "Running…" → 2x2 grid | A L417-615 | 1.53 → 1.25 → 1.13 |
| 14.77-18.15 | 5 Kicker → caps title split → scattered card stack → dark fly-through ("with" / "Skills") | B L0-170 | 1.60 → 1.73 → 1.53 |
| 18.15-21.03 | 6 Type-on with floating chips ("Vote blind. / The best … rises.") | B L250-326 | **0.88** |
| 21.03-25.24 | 7 Inline-image line → radial thumbnail rings → lattice zoom-out → dark → final words → iris | C L327-522 | 1.56 → 1.53 |
| 25.24-28.05 | 8 End card | C L523-620 | 1.53 → 1.00 |
| 28.05-28.77 | frozen last frame (warp speed 0) | | 0 |

Every transition between devices is a **hard cut** (scene detect: 6.17, 8.33-8.48 blank, 9.83, 11.10, 14.80, 15.23, 18.17, 21.03, 25.17). Nothing crossfades. The energy comes from entering motion (blur-in, scale settle, chip growth) right after each cut.
The only "transitions" are inside devices: the backspace/squeeze exits (2, 3), the grey flash (5), the iris (7), and the bg luminance ramps to dark (5, 7).

**Speed rule.** All curves below are in *source* frames. At warp speed `s`, a per-frame approach fraction `k` becomes `1-(1-k)^s` per output frame (`EM.kAt`). The helpers take `speed` per segment.

## 1. Logo reveal (out 4.40-6.13) · `build-A` shot 2, `render()` `si === 1`
- Mark (197px, ink `#2B231D`) starts **scale 1.48, blur 26px, opacity 0.55** (+0.06/frame), centred.
- Settle (source frames from L33): scale `[1.38,1.285,1.218,1.167,1.132,1.104,1.07,1.045,1.025,1.01,1.0]` and blur `[20,16,12,9,7,5,3.5,2.2,1.2,0.5,0]`. That's about **0.25-0.30 of the remaining scale per frame**, done in 11f.
  Measured on the output (bbox height, px): 284, 272, 264, 256, 248, 244, 240, 236, 232, 228, 196 (the last step is the blur clearing). At 0.85x that's 13 output frames.
- Slide left (L46-61, 15f): progress `[0,.019,.047,.094,.182,.394,.664,.788,.860,.906,.937,.961,.978,.989,.994,1]`. It's an ease-in-out with its peak at frames 5-6 (27%/frame), and the lockup lands left-of-centre so the word fits.
  Measured: mark left edge 860 → 808 over 4.93-5.07, then the word appears.
- Wordmark "Evals" diatype 500 **229px** types **1 char / 2 source frames** from L51 (out 5.10, ~2.35 output frames/char at 0.85x), gap 81px.
- Wash: a blurred radial cream/blush gradient fades out over 8f (L32-40). The cream layer fades over L40-48.
- **Weak spot**: 5.50-6.13 is a fully frozen hold (motion.py), and 6.17 is a dead-stop hard cut. The backspace exit (L96-105: height `[197,195,190,182,170,156,142,126,108,81]`, blur ≤3px) was cut out by the warp. The helper keeps it as `exitAt`.
- SFX: `air` at 4.67.

## 2. Kinetic sentence with inline chips (out 6.14-8.30) · shot 4, `si === 3`
- Diatype 500. The font size is solved so the OPEN sentence is ≤1830px wide (134px max; ~119px here). The words sit on a cap-centred baseline at y=540.
- Words pop at 0 / +10 / +13 / +16 source frames, **in their compact positions** (single spaces). Each new word is **coral for 4f, then mixes to its base colour over 3f** ("and" = grey `#8A8076`).
  Measured: bbox right edge 620 → 840 → 1016 → 1596 on a 3-frame cadence (6.17 → 6.47 → 6.57 → 6.67).
- **Open** at +19 (out 6.76): the slots grow out of the spaces. A logo chip (white card 1.9cap x 2.5cap, radius 0.16cap, soft shadow) and a colour pill (0.62cap tall, label 0.42cap) scale 0 → 1 from the space centre, and every word slides to its open x.
  Ease: **k = 0.25 of the remaining distance per frame** (`1-0.75^n`). Measured: left edge 320 → 284 → 224 → 184 → 148 → 124 → 108 → 92 → 84 → 76 → 68 (≈0.25/frame). It's 90% done in 8f.
- Chip content swaps on frames +29, 32, 35, 38, 41, 44, 47, 50 (every 3f), then +56, +62. The logo cycles claude → openai → gemini → grok. The pill label and colour cycle through the 4 hues `#8E64AD #337CA8 #438261 #C9902F`, with a small pointer cursor in the pill hue riding the pill's corner.
- **Exit** at +62 (out 8.20): horizontal squeeze to the centre, cumulative `[0,8,33,74,132,207]` px (accelerating), plus **blur 3.2px/frame (max 18)** and opacity → 0 over 4f starting 2f in. Then **5 blank frames** (8.33-8.47) before the next device. The blank is a breath, not a dead frame.
- SFX: none inside. The next device's `swish` sits at 8.53.

## 3. Dot-field word reveal (out 8.48-9.80) · shot 5, `si === 4`
- Canvas dot field: a seeded LCG (seed 7) places 22 soft blobs. Dots sit on a 15px grid as 7px squares or 3.6px-radius circles, colour `#E6DFD2` at alpha 0.5-1. 2.5% of them take the 4 hues + coral at alpha 0.55.
  A quiet band ±140px around y=540 has alpha × 0.25. The field is static (it gets its life from the words).
- Words "in" / "one" / "battle." at 206px, appearing at +0 / +2 / +9. Each one: **blur 22·(1-age/15)²** (a 15f quadratic blur-in), **opacity (age+1)/3**, colour **coral-light `#E9A79A` for 3f → ink over 3f**.
  Measured bbox: words fully sharp ~0.43s after the cut (8.48 → 9.17).
- Highlight sweep: a gradient band (coral core ±170px, ±420px falloff) moves **120px/frame** left → right at +26 (out 9.35), and again at +64. It's clipped to the text via `background-clip:text`.
- Exit (+68): squeeze `[0,3,8,15,26,39,57,82]` px. In demo_en2 this is cut at +40 by the hard cut to the composer (9.83, dead stop flagged).
- SFX: `swish` 8.53.

## 4. Composer → dark "Running…" → 2x2 grid (out 9.80-14.77) · shots 7-8, `si === 6/7`
- Composer: a real Evals composer capture (1496x317, radius 30, soft shadow) with a diatype 400 text layer at 30.8px. It types **0.7 chars/frame** starting at char 47 (the prompt is already partly typed), with a 3px coral caret.
- Cursor: in from bottom-right. Segment 1 (9f) ease-out quad, then 15f ease-out cubic to the send button. The click is 4f long: cursor scale 0.88, send button 0.9 (out 10.93, `click` SFX).
- **Hard cut to dark `#181515`** at L476 (out 11.10, `thump` + post punch).
- The mark sits centred with a coral arc spinner: −4.5°/frame, dash length `40+30·sin(f/6)`.
  "Running 4 setups…" (diatype 400, 36px, `#CFC7BD`) fades in over 3f at L517 (out 11.99) with the group re-centred. It swaps to "Battle · 4 setups" at L537 (out 12.52), and the spinner disappears.
- Camera zoom-out L544-556 (out 12.71-13.03). The per-frame scale rate is `[-0.25,-0.27,-0.76,-1.51,-2.12,-3.74,-6.31,-6.40,-4.58,-2.46,-2.11,-1.34]`% (compounding). That's a smooth bell with its peak at frames 6-7, total ≈ −29%.
  The status group translates to the top-left anchor in log-scale sync.
- Tiles (700x394, radius 14, shadow `0 20px 60px rgba(0,0,0,.45)`) stream in at L556/559/563/567. Each one: **opacity (age+1)/3, blur 14 → 0 linear over 6f, rise 14px with (1-age/6)²**. Measured in the strip at 12.70: tile 1 blurred for 2 frames, tile 2 starts 3f later.
- Scroll: a cosine S-curve of −430px over L568-603 (35f, out 13.38-14.44, `swish` at 13.07).
- Punch-in L604-615 toward tile D: per-frame `+[0.19,0.60,0.82,1.13,1.50,2.06,2.57,3.47,4.64,6.50,7.20]`%. It accelerates into the cut (≈ +35%), so the cut lands mid-move. The cursor glides in (16f ease-out cubic) and scales with the punch.

## 5. Kicker → caps split → scattered card stack → dark fly-through (out 14.77-18.15) · build-B shots 11-13
- (L0-22) Dark kicker "New in Evals **Battle**" (190px, coral-dark on the accent word). Scale table 1.348 → 1.0 in 5f, held 7f, then 1 → 0.81 by L22. The accent word drops in −22px with opacity 0 → 1 over 3f. At 1.6x this is only ~0.4s.
- (L23-26) **Grey flash** `#CFCCC6` → type bg in 4f `[0,.5,.78,1]`. That's the cut accent (out 15.23).
- Two-line caps title (diatype 700, BATTLE small over EVERY SETUP large). The cap heights trade places, then the **gap splits open** L52-78: `[0,20,66,102,150,217,306,415,566,759,1000,1300]` px, accelerating, with a camera scale 1 → 1.42 and the top line growing ×2.6. The lines fly off screen.
- The card cluster (9 real output cards, padding 8, radius 16) grows out of the gap from L60. Scale `0.05 → 1.05` by L82 (overshoot) → 1.0 at L91 → a slow drift to 1.1 at L156.
  Each card eases to its pos@91 with **k = 0.2/frame** (settle 0.82 → 1). It then spreads to its pos@136 and target width on a **sine over L100-142**, while the whole cluster rotates −4°. (It's 2D with rotations; there's no CSS 3D.)
- Background ramps type → dark **linearly over L107-126** (out 16.83-17.20), *while the cards are spreading* (overlap).
- "with" pops at L118 (97px, **k=0.35/frame**, scale 0.9 → 1, opacity over 2f). "Skills" replaces it at L140 (131px, out 17.49, `thump`).
- Push-through L146-175: cluster scale ×1.0 → 1.4 `[1,1.08,1.1,1.17,1.27,1.4]` plus an outward spread ×1.35 and an extra −1.2° rotation. Cards fly past the frame edge, and then comes a hard cut.
- SFX: `thump` 14.77 (post punch), `thump` 17.27, `swish` 18.17 at the cut.

## 6. Type-on with floating chips (out 18.15-21.03) · build-B shot 15
- Line 1 "Vote blind." (143px, ink) is static. Line 2 (143px, grey) types **1 char / 2 source frames** (2.27 output frames at 0.88x) with a coral caret (0.075em wide). The caret is hidden at +61.
  Lines sit at baselines 527 / 657.
- 4 chips (64px tall, radius 10, colour fill, white 40px icon tile, pointer cursor in the chip hue, shadow `0 6px 18px`) fly in from offsets of 300-500px.
  Ease: **exponential, k = 0.12/frame (0.88^n)**, giving a long glide that's ~90% done in 18f. Measured bbox: 18.17 → 18.60 the group shrinks from 1208 to 876px wide.
- +26..+56: chips drift to a second layout on a **sine** (30f). The hold never freezes.
- +64..+76: chips converge toward the centre (quadratic ease-in), while the camera pulls back to 0.94 (`[1,0.985,0.94]`). This leaves on a move into the hard cut (out 20.58-21.03).
- SFX: `swish` 18.17 at the entry cut. The source had type ticks, which were dropped in the final mix.

## 7. Inline image line → radial rings → lattice → dark → words → iris (out 21.03-25.24) · build-C shots 23-25
- "You didn't just [344px card] pick a model." (90px). The **tilt settle** carries over the cut: rotation `[6.9,3.7,2.35,1.4,0.9,0.5,0.3,0.06,0]`°, x +62 → 0, scale 1.05 → 1, word-spacing −0.3em → 0, all at **k = 0.4/frame**.
  Measured: bbox width 1460 → 1472 settled in 5 output frames (21.03-21.17). The text fades out L364-368.
- Rings (L361, out 21.75): inner 8 thumbs (132x74, r 430, rotating +0.06°/f) and outer 28 (64x36, r 640, −0.04°/f).
  The radius grows 0.4 → 1 (k 0.22) and 0.55 → 1 (k 0.2). Each thumb pops with k 0.45 on a 0.4f (inner) or 0.15f (outer) stagger, so the ring "draws" around in ~6 frames.
- World zoom-out from L376 (out 22.07): per-frame scale `S24` (≈0.97-0.99 per frame, compounding), revealing a hex-ish lattice of 20 other ring systems (2050px pitch).
- Background **S-curve paper → near-black** over L406-444 (LUM `[242,239,232,218,193,147,94,58,39,28,24,23]`, out 22.71-23.5), *during* the zoom-out.
- DOF: world blur 0 → 6px and brightness −25% over L452-462 (out 23.69). Final words "You found your setup." (115px) pop **every 4 frames** (opacity over 2f), coral-dark for 10f → on-dark. Measured: 23.87, `air` SFX at 23.70.
- **Iris** L518-522 (out 25.13): a radial mask with diameter `[1863,1384,1043,885,843]` and a 75px feather. Words and world fade to 0.14/0.12. Then a hard cut to the end card.

## 8. End card (out 25.24-28.05, then held) · build-C shot 26
- The mark lands from **1040px → 131px over 29f** (S26 per-frame scale; first frame ×0.62, then ~0.8-0.95/frame).
  Measured bbox height: 660, 472, 424, 348, 320, 288, … 136 (out 25.27-25.80). That's **≈0.36 then ≈0.2 of the remaining size per frame**.
- It slides 58% of the way to the lockup position (L552-561, accelerating `[-3.1,-2,-2.9,-4,-4.7,-6,-7.6,-11.3,-16.9,-24]`). The wordmark (diatype 500 112px) appears at L561 (out 26.07), and the lockup re-centres decelerating (`RECENT26`, 20f).
- The sub line "evals.ag · Available today" (28px grey) fades in over 10f at L586 (26.89).
- Source end push (L648+) was not reached. The **post push** does this job instead: +5% linear zoom 26.31 → 28.75 (`final_refined.py`).
- SFX: `thump` + `air` at 25.27 (post punch).

## 9. Post camera + sound map (vo/final_refined.py)
- Post zoom on the whole frame: `scale = 1 + Σ 0.02·exp(−(t−P)/0.25)` for P in {11.10, 14.77, 25.27} (dark cut, section change, end card). That's a 2% kick with a 0.25s exponential decay, and the hits sit on the thumps. On top of it: `+0.05·clamp((t−26.31)/2.44)`.
- SFX (`sfx2/`, all subtle, 0.22-0.75 gain): swish 0.87/1.19/1.75 and ticks 2.79-2.99 (intro), air 3.71, thump 3.84, air 4.67, swish 8.53, typing 9.90, click 10.93, **thump 11.10**, swish 13.07, **thump 14.77**, thump 17.27, swish 18.17, swish 21.03, air 23.70, **thump+air 25.27**.
  Music: `vo/music4/ma.mp3` ×0.85, sidechain-ducked under the VO (ratio 6, release 300ms), loudnorm −14 LUFS.

## 10. Rules distilled (what makes it feel good)
1. **Hard cuts only between devices**, and each device *enters* on a move: blur-in, scale settle, chip growth, tilt settle. No crossfades.
2. **Exponential settles**, not tweens. The workhorse fractions per source frame are 0.25 (chip open), 0.2 (card settle), 0.35 (word pop), 0.4 (tilt settle), 0.12 (floating chips), 0.45 (thumb pop). Convert with `kAt(k, speed)`.
3. **Exits accelerate into the cut**: squeeze tables, punch-in compounding to +7%/frame, the iris, the push-through. The cut always lands mid-motion.
4. **Overlap**: bg luminance ramps run *during* the spread or zoom. Chip drift runs while typing. Words keep their timing during the dot field.
5. Accent flash on entry: new words are coral for 3-4f, then mix to base over 3f. The final words are coral-dark for 10f.
6. Blur only on entry/exit (15f quadratic for headline words, 6f linear for tiles, 3.2px/f on exit). It's never on a hold.
7. Known weak spots in demo_en2 (don't copy): the 0.6s frozen logo hold (5.50-6.13), dead stops at 6.17/9.83, and the 0.76s frozen last frame.

## 11. Colour + type for the rebuild (evals.ag live probe, `v4kit/site/probe2.json`)
- Canvas `#F7F4ED` (body), cards/composer `#FCFAF5`, chips `#EEE7DC`, borders `#DDD5C9`.
- Ink `#40352C`, secondary `#85796D`. demo_en2 used `#2B231D` for display type. Dark `#181515`.
- Accent: coral `#A13A2B` (`#E0573F` on dark), one per frame. Pill hues come from the site variant chips: `#8E64AD #337CA8 #438261 #C9902F`.
  White on `#C9902F` is 2.8:1 (`check` warns). Use the label at ≥33px or darken for small text.
- Type: headline **martina 400** (site H1 "What would you like to make?", letter-spacing −0.022em). UI/body **diatype 400/500**, caps titles diatype 700. Fonts are in `v4kit/motion/demo/assets/fonts/`.

## 12. Helpers (`scripts/motion-kit.js`, was `v4kit/motion/evals-motion.js`; full API in DEVICES.md)
`EM.<device>(hostEl, opts) → { render(lf) }`, where `lf` = local source frame. `EM.film({id, duration, cam, segments:[{start,dur,speed,from,host,render}], post:{hits,amp,tau,push,pushFrom,pushTo}})` builds the one paused timeline and returns it. Assign it inline: `window.__timelines["main"] = EM.film(...)` (lint needs the literal).

| device | API | key opts |
|---|---|---|
| 1 | `EM.logoReveal(host, o)` | word, size 229, mark 197, gap 81, typeAt 19, slideAt 14, exitAt |
| 2 | `EM.kineticChips(host, o)` | tokens [words, {logos:[]}, {pills:[[label,hue]]}, {img,w,h}], appear, openAt 19, swaps, exitAt 62, settle:"tilt" |
| 3 | `EM.dotReveal(host, o)` | words, appear [0,2,9], fs 206, font martina, sweeps [26,64], exitAt 68, seed |
| 4 | `EM.composerGrid(host, o)` | prompt, typedFrom, chips, status1/2, tiles[4], tileLabels[4], punchAt |
| 5 | `EM.cardCluster(host, o)` | kicker [text, accentWord], title [small, big], words [w1, w2], cards[9] |
| 6 | `EM.typeChips(host, o)` | line1, line2, fs 143, chips [{label,hue,img|icon}] x4, caretOff 61 |
| 7 | `EM.orbitFinale(host, o)` | card, thumbs[], lead [a,b], words[], lattice |
| 8 | `EM.endCard(host, o)` | word, sub, endPushAt |
| math | `EM.appr/E/kAt/samp/tbl/prod/sum/sine/mix/rng`, `EM.C` tokens, `EM.FONT`, `EM.ready()`, `EM.measure`, `EM.baseline` | |

Proof: `v4kit/motion/demo/index.html` (5s: chips → dots → type+chips → end card) → `demo/renders/demo-5s.mp4`, and `demo/full.html` (all 8 devices at demo_en2 timings, 24.4s) → `demo/renders/demo-full.mp4`. `check` passes (1 contrast warning: white on `#C9902F`). Strips are in `demo/qa/`.
