# motion-kit.js: devices and API

`scripts/motion-kit.js` (formerly `evals-motion.js`) is copied into every project as `build/motion-kit.js` by
`new_project.sh`. It exposes `window.EM`.

## Contract
- Every device is `EM.<device>(hostEl, opts) → { render(lf) }`. `lf` is the LOCAL frame on the 30fps source grid
  (0 = first frame of the shot). `render` is a pure function of `lf`: no clocks, no randomness, any frame renders alone.
- `EM.film({ id, duration, cam, segments:[{start, dur, speed, from, host, render}], post:{hits, amp, tau, push, pushFrom, pushTo} })`
  builds the ONE paused GSAP timeline, shows one segment host at a time (hard cuts), and drives the post camera
  (2% exponential punch on `hits`, slow end push) on the `cam` wrapper. Assign it inline:
  `window.__timelines["main"] = EM.film(...)` (HyperFrames lint looks for that literal).
- Build devices **after** `EM.ready()` resolves (fonts loaded): they measure text when constructed.
- Theme first: `EM.theme(window.THEME)` before building anything. Devices read `EM.C` / `EM.FONT` at construction.
- Seeking in Playwright: `tl.seek(t, false)` (with `false`, or GSAP suppresses `onUpdate` and nothing renders).

## Theme
`EM.theme({ colors, fonts, mark })`, usually from `assets/themes/<name>.json` via `build/theme.js`.
- `colors`: `paper surface type chip line ink inkDeep muted dark onDark mutedDark accent accentDark accentLight hues[4]
  card dot onDarkSoft darkDeep shadowRGB` (partial themes are fine; unknown keys are ignored).
- `fonts`: `head ui mono` CSS stacks + `load: [[weight, family], …]` (what `EM.ready()` waits for).
- `mark`: `{ svg: '<path …/>', viewBox, stroke }` — the product's real logo paths (`stroke:false` for filled logos).

## Devices from the approved film (numbers in MOTION_SPEC.md)
| # | device | use for | key opts |
|---|---|---|---|
| 1 | `logoReveal` | mark settles from blur, slides left, wordmark types | `word size mark gap typeAt slideAt exitAt` |
| 2 | `kineticChips` | a sentence that opens slots for real thumbs / logos / pills | `tokens: [words, {thumbs:[]}, {logos:[], bare}, {pills:[[label,hue]]}, {img,w,h}]`, `openAt swaps exitAt settle:"tilt"` |
| 3 | `dotReveal` | big words over a quiet dot field | `words appear fs sweeps exitAt seed` |
| 4 | `composerGrid` | typing into a composer → running → 2×2 result grid | `prompt chips status1 status2 tiles[4] tileLabels punchAt` |
| 5 | `cardCluster` | kicker → split title → scattered card stack fly-through | `kicker title words cards[9]` |
| 6 | `typeChips` | type-on lines with floating chips | `line1 line2 chips[4] caretOff` |
| 7 | `orbitFinale` | inline image → thumbnail rings → lattice zoom-out | `card thumbs lead words lattice` |
| 8 | `endCard` | mark shrinks in, wordmark, sub line, push to last frame | `word sub endPushAt cy` |

## Generic devices (v2) for the other cases
| # | device | use for | key opts |
|---|---|---|---|
| 9 | `headline` | tag + left-aligned headline, word by word, accent flash, drift, optional rise-blur exit | `tag lines:[[…],[…]] accent:[words] x y fs at stagger lineGap drift holdTo exitAt` |
| 10 | `uiCard` | a REAL capture (img `src` or framework-owned video `node`) as a rounded card: floaty 3D settle or rise, slow push, one-way punch into a `focus` rect, cursor with click pulses | `src/node w h fit radius enter:"settle"/"rise"/"none" focus:{at, rect:[x,y,w,h], zoom} cursor:[{f,x,y,click}] cursorStyle:"arrow"/"touch" cursorScale push holdTo` |
| 11 | `terminal` | real command typed at `cps`, real output lines landing, solid caret | `lines:[{cmd}/{out,color}] title prompt cps outGap cmdPause fs w` (returns `duration`) |
| 12 | `split` | two real captures side by side; seam travels; label pills; "vs" disc | `a:{src/node,label,hue} b:{…} from to seamAt vs gap` |
| 13 | `counter` | a REAL number rolls up, flashes the accent, holds with drift | `value prefix suffix label fs x y locale k` |

Coordinates for `uiCard` (`focus.rect`, `cursor`) are in the capture's own pixels — read them from
`capture/ui/<name>.json` (`capture_ui.mjs` writes the pixel size) or measure on the PNG.

## Helpers
`EM.appr(f, f0, k)` exponential approach · `EM.E(k, n)` · `EM.kAt(k, speed)` (k per source frame → per output frame) ·
`EM.samp / tbl / prod / sum` tables · `EM.sine` · `EM.mix(hexA, hexB, t)` · `EM.rng(seed)` · `EM.measure` ·
`EM.baseline` · `EM.shadow(a, b)` · `EM.SNAP` (0.25) · `EM.FLOAT` (0.12) · `EM.markSVG(size, color, viewBox)`.

## Video inside devices
HyperFrames owns `<video>` playback: put each clip in `#pool` as `<div class="vw" id="vw_x"><video id="v_x" class="clip"
src="capture/clips/x.mp4" data-start data-duration data-media-start data-track-index muted playsinline></video></div>`
and hand the wrapper to the device (`node: $("vw_x")`). `data-start` is composition time; it must cover the shot.
Every `src` must exist on disk or the render fails.
