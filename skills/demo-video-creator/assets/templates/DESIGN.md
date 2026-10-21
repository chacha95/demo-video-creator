# __NAME__ design system: "<name>"

Theme preset: `assets/themes/<theme>.json` (build/theme.js). Changes from the preset are listed here and nowhere else.
Canvas read live from the product: `getComputedStyle(document.body).backgroundColor` = <value> (date).

## Color — one background tone for the whole film
| role | hex |
|---|---|
| canvas | |
| display ink | |
| UI-scale ink | |
| secondary | |
| ONE accent (punch word / caret / newest-word flash only) | |
| brand colours that must stay true (model pills, partner logos) | |

## Type
- Display: <family weight>, tracking, line-height, left margin <x>px (fixed in every shot).
- Labels: <mono family>, uppercase tags 26–28px, 70px above the headline cap line.
- Korean lines: Pretendard for every glyph (800 hook / 700 body). UI terms stay in English.

## UI treatment
- Real captures only (capture/ui at 4× DPR, capture/clips). Rounded 16–22px, soft layered shadow tinted with the ink colour.
- Crops contain only whole elements; rebuild card background from the UI's own fill if context is needed.

## Motion
Grammar from references/MOTION_RULES.md: one camera, snappy 0.25 / floaty 0.12, exits carry velocity, holds drift 1–3%,
words 2–4f apart with accent flash, cuts on the beat ±1f. Busy footage → camera only pushes ≤3%.

## Never
Outlines, hairline boxes, rules, underlines, highlight boxes behind words, gradients, emoji, fake UI mockups, dark sections
mid-film (unless the whole film is dark), invented numbers or names.
