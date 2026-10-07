# Motion fix pass (v4b, v5b) — user: "감도 높게" + "모션이나 그런 게 어색해"

The user's complaint is MOTION feel, not the look. Keep layout, palette, copy, music, clip choices mostly as they are.
Rework HOW things move. Frame-by-frame study of the current renders found these concrete problems.

## Measured problems

### v4 (THE WALL)
1. **Tile-to-tile "whip" is a fake** — a blur is switched on over a hard cut. There are no in-between frames where the outgoing and
   incoming tiles travel together across the frame, so it reads as a glitchy flash and not a camera move (e.g. 9.27, every jump 7.5–15.7).
2. **The coral band and its text move with the camera during whips** (it blurs and slides down with the footage at ~9.25), so the overlay
   and the world are on the same layer. Overlay text should be screen-locked unless it is deliberately part of the world.
3. **Band entry is two-stage and late.** The empty coral bar grows first, and the text rises into it ~6 frames later, clipped
   ("me prompt", "ame prompt"). The text is only readable after the band has already "landed", so the beat hit lands on an empty bar.
4. **Drop dive (7.25–7.6)**: a heavy uniform blur over the whole wall for ~4 frames, then a snap. The zoom has no felt acceleration
   curve (it reads as blur → cut), and the tile it lands in keeps an extra slow drift that is out of sync with the music.
5. **Camera moves on top of footage that already has its own fast camera motion** (racing, Sonic) → double motion, which reads as nausea.
   On busy footage the camera should only do a slow push.
6. Dead stops at 1.87 and 4.53 (fast pull-back → 0 motion in one frame). Frozen 21.47–21.97 on the end card.

### v5 (MANIFESTO)
1. **Double cuts in the montage**: 15.47+15.50, 16.83+16.87, 17.30+17.33 and 18.23+18.27. The mask changes aspect on one frame and the clip
   swaps on the next, which reads as a 1-frame stutter. Mask change and content change must land on the SAME frame (or ≥ 4 frames apart on purpose).
2. **Fully frozen holds**: 4.47–5.67 (1.2s), 7.10–7.50, 8.40–8.97. Nothing breathes, then the next move jerks the frame out of stillness.
3. **Sequential start-stop chains**: the whip-pan lands → it stops → THEN the plate starts its wipe → it stops → THEN the caption. Every element waits
   for the previous one to finish, so the motion feels robotic. Use overlapping action: the next element starts while the previous is still
   in its last ~40% of easing.
4. **Dead stop at 16.27** (fast montage move → 0 in one frame).
5. **Word entries** (Benchmarks / are someone / else's / test.) are a 3-frame blur-in then total stillness. The land is fine, but nothing
   lives after it. Add a continuous slow drift across each word's hold.

## How to fix (rules for this pass)

A. **One camera, one pure function of time.** Drive the world camera (x, y, scale, rotation) from a single function `cam(t)` built from
   keyframes with velocity-continuous easing (e.g. cubic Hermite / Catmull-Rom spline through keyframes, or GSAP `expo.inOut`
   segments whose ends meet at zero velocity ONLY where a hold is intended). Apply it in ONE `onUpdate` of the master timeline via `tl.time()`.
   Deterministic: no timers, no randomness, any frame can be rendered alone.
B. **Velocity-driven motion blur**: blur_x = k·|cam_x(t+1/60) − cam_x(t−1/60)| (same for y), clamped. Blur exists only while moving and
   follows the direction of travel. Never blur a frame that sits across a cut.
C. **Real whip-pans**: lay the outgoing and incoming shots side by side on one strip (or adjacent on the wall) and actually travel the
   camera between them over 0.30–0.45s (expo.inOut). The peak velocity sits mid-move with blur peaking there, and the whip SFX is aligned to that peak.
   Keep one direction for whips across the film (e.g. always right→left), except for a deliberate reversal at a section change.
D. **Overlays are screen-locked.** Text and bands sit on a layer above the camera. They enter and exit with their own mask reveals and
   never inherit the camera's whip.
E. **Text arrives WITH its container**: band and text reveal together (one clip-path mask that opens over both, or text leading by 1–2 frames).
   Each phrase: in ≤ 0.35s, readable hold ≥ 0.7s, out ≤ 0.25s.
F. **Overlapping action**: within a group, start the next element at ~60% of the previous one's tween. No chain where an element waits for the previous one to stop.
G. **Nothing freezes**: every hold carries a continuous slow drift or push (1–3% over the hold, sine.inOut spanning the WHOLE hold, so its
   velocity is nonzero mid-hold). The end card pushes until the last frame.
H. **No dead stops**: a fast move must decelerate over ≥ 6 frames (expo.out / power4.out). No `power3.in` that ends on a visible stop.
I. **No double cuts**: two discrete visual changes never land on consecutive frames.
J. **Busy footage gets calm camera**: on clips with strong internal motion, the camera only does a slow push (≤ 3%). The energy then comes
   from the CUTS on the beat, not from the camera moving on top.
K. **Cuts on the beat ±1 frame.** Visual hit and SFX on the same frame.

## Required motion QA before reporting
1. `python3 ../scripts/motion.py renders/<file>.mp4 <bpm> <first_beat>`. Targets: DEAD STOPS none; FROZEN HOLDS none (except silence after
   the music ends, if any); CUTS: every cut within ±1.5 frames of a beat; no two cuts on adjacent frames.
2. `sh ../scripts/strip.sh renders/<file>.mp4 <t> /tmp/x.png` at EVERY transition (whips, drop, band entries, montage cuts, end card land),
   and LOOK at each one. A good whip strip shows a smooth velocity ramp up and down, with both shots visible mid-move.
   A good text entry is readable within ≤ 10 frames.
3. Harsh self-review as a motion director who didn't build it: list the 5 worst moments with frame numbers, fix, and re-render the affected parts.
