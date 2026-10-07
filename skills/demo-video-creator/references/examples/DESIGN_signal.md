# evals-demo2 design system: "Signal"

A graphite-and-paper instrument look. Swiss, left-aligned, data-labelled. It replaces the cream/ink/coral editorial of the first film.

## Color
| role | hex |
|---|---|
| dark canvas (graphite) | `#0C0D0F` |
| dark raised (behind panes) | `#16181B` |
| light canvas (paper) | `#EEEDE8` |
| text on dark | `#F3F2EE` |
| secondary on dark | `#7D8088` |
| text on light | `#111214` |
| secondary on light | `#6E7076` |
| ONE accent: electric blue | `#2F5BFF` on light, `#6F8CFF` on dark |
| new-word flash (light variant) | `#9FB2FF` |

One accent per frame. The accent is used only for the caret, the new-word flash, and one key word per line.

## Type
- Display: **Geist SemiBold 600**, tracking −0.045em, line-height 0.95, left-aligned at x = 120. Sizes: hero 220px, headline 150–180px, line 120px.
- Labels: **Geist Mono Medium 500**, UPPERCASE, tracking +0.08em, 26px, secondary colour, sitting 40px above the headline cap line. They are data tags (NEW MODEL, SKILLS, SETUP A), never sentences.
- Real UI text stays inside the real captures (their own font). We never re-typeset UI.

## Grid
12 columns, 120px outer margins, 8px baseline. Headlines hang from the left margin. UI panes sit on the right 7 columns or full-bleed when punched in.

## UI treatment (real captures only)
- Captures are 2× screenshots of the product UI (capture/ui) and screencast recordings of real community outputs (capture/clips).
- A pane = a crop of a capture with radius 22px and a soft shadow (dark: `0 40px 120px rgba(0,0,0,.55)`, light: `0 30px 80px rgba(17,18,20,.18)`). No border, no outline, no device frame.
- Panes enter in 3D (rotateX 10–14°, rotateY −8 to −12°, perspective 2400px) and settle flat with the floaty curve.
- Depth of field: non-focus parts of a capture get a gaussian blur (6–9px) and the focus region stays sharp.
- Typing in the composer is the real captured text revealed character by character (clip mask), with our accent caret.

## Motion (identical grammar to the approved film; only the look changes)
- Two easing families, defined per SOURCE frame (95 BPM grid): snappy k = 0.25/frame (90% in 8–9 frames), floaty k = 0.12/frame (18–20 frames). Output runs 1.263× faster via the fps re-render.
- Exits accelerate into the cut; the next shot continues the same direction, decelerating (velocity-matched).
- Word reveals 2–4 source frames apart; the newest word flashes accent and settles to its base colour 3–12 frames later.
- Hero type-on 1 char per 2 source frames; in-product reveal 0.75 char per source frame. Caret is solid (never blinks), 1.14 × cap height, 0.08em wide, gone 16–20 frames after the last keystroke.
- Whips are real: both shots travel together on one strip (expo in-out over ~0.35s), velocity blur peaks mid-move, always right→left.
- Overlays (tags, headlines on footage) are screen-locked.
- Light↔dark switches land on strong beats. Big hits get the post impact FX.

## Never
Outlines, hairline boxes, rules, underlines, highlight boxes behind words, gradient backgrounds, emoji, invented numbers or names.
