# Case: marketplace-catalog

Catalogs and stores of many items: skill/agent marketplaces (Skillshop, skills.ag), template galleries, asset
libraries, plugin directories, course catalogs. The spectacle is **abundance that narrows to one item doing its job**.

- Length: 45–60s (`qa_check.py … 45 60`).
- Theme: `editorial-cream` or `paper-signal`; match the site's live canvas and accent.
- Music: launch.

## Hook (0–3s): the wall + the count
- Frame 0: a wall of real items (thumbnails/cards) already drifting (`orbitFinale` rings or `cardCluster`), with the
  real total from the site rolling in (`counter`, e.g. "10,486 skills" — only the number the site shows today).
- Line 2, literal: "Find the one that does your job." Then cut to search.
- Why: the old Evals opener with a bare skills counter got "뭐 어쩌라는건지 모르겠어" because the count floated alone.
  Here the count sits on top of the real items, and the next beat immediately narrows to one.

## Story beats (55s)
| # | s | beat | picture | devices |
|---|---|---|---|---|
| 1 | 0–3 | hook | wall of real items + real count | `orbitFinale` / `cardCluster`, `counter` |
| 2 | 3–10 | search | a real query typed, results filtering live | `uiCard {node}` (rec_flow) + cursor |
| 3 | 10–18 | the item | its real detail page, punch into what it does | `uiCard focus` |
| 4 | 18–26 | install/use (**big hit**) | the real install/copy/use action | `uiCard` + click, `terminal` if it's a CLI install |
| 5 | 26–36 | it works | the item's REAL output in motion (the skill running, the template filled) | `uiCard {node}` |
| 6 | 36–44 | variety | 3–4 more real items, one per beat, each with its real output thumbnail | `kineticChips {thumbs}` |
| 7 | 44–50 | makers | creators/publish flow, only if real on the site | `uiCard` |
| 8 | 50–55 | end (**big hit**) | mark + wordmark + URL | `endCard` |

## Captures
- Probe the live site for the canvas, accent and the real totals; save the probe JSON in `capture/`.
- Wall thumbnails: `capture_ui.mjs` with one shot per item card (selector crops), 12–30 items.
- Item output: run the item for real (e.g. a skill in Claude Code, a template in its editor) and record it.

## VO
- 150–165 words / 55s. "There are <N> <items>. You need one. …" then the job, then the variety.

## Pitfalls
- Counting things you can't see on the site today → truth violation. Read the number from the live page.
- Grid of cards with nothing moving → static. Rings rotate, wall drifts, items swap on 3f cadence.
- Showing the item page but never its result → the viewer never learns why it's worth installing.
