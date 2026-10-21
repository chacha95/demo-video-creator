# Case: ai-output-battle

AI products whose value is **the outputs**: model comparison and eval platforms (Evals), image/video/3D/game generators,
prompt or agent playgrounds. This is the case the skill was built on; every rule here was approved on an Evals film.
For Evals itself, `references/looks/evals.md` overrides anything below.

- Length: 45–65s (`qa_check.py … 45 65`). Teaser cut: see `teaser.md`.
- Theme: `evals` for Evals, `editorial-cream` or a fresh system for others.
- Music: launch (default prompt).

## Hook (0–3s): the results are the hook
1. Frame 0: the two **most different** real outputs of the SAME input, split 50/50 (`EM.split` with `vs:true`), moving.
   Model/setup pills in each half, the input as a mono kicker in the top band, the question in the bottom band
   ("Which model wins this week?"). Pick the pair by contrast: colour field + camera scale.
2. As line 2 starts, hard-cut to all N outputs at once (2×2 wall, tiles stream in on a 2f stagger) under a literal line:
   "Same prompt. Completely different."
- Why: one output opening alone, with the comparison later, got "비교 영상이 후킹이 안됨 결과 후킹이".

## Story beats (60s)
| # | s | beat | picture | devices |
|---|---|---|---|---|
| 1 | 0–3 | hook | split → 2×2 wall of same-input outputs | `split`, `composerGrid` tiles |
| 2 | 3–8 | the fatigue | "Another day, [thumb] another [pill] model." with REAL result thumbs swapping every 3f | `kineticChips {thumbs}` |
| 3 | 8–14 | input | the real composer, the real task typed char by char | `composerGrid` / `uiCard` + cursor |
| 4 | 14–20 | configure | Model · Skill · Environment, each real value landing on its spoken word | `typeChips`, `uiCard focus` |
| 5 | 20–26 | run → reveal | send click → zoom-through → N results side by side (**big hit**) | `composerGrid` punch, impact FX |
| 6 | 26–34 | choose | blind compare of two moving outputs, "Which would you choose?" → vote | `split`, cursor click |
| 7 | 34–40 | proof | the run record of that same output: real model, skill, env, time, tokens | `uiCard focus` |
| 8 | 40–48 | scale | leaderboard rows cascade ("Setups, not just models.") | `uiCard`, `headline` |
| 9 | 48–55 | community | wall/rings of real community outputs | `orbitFinale` / `cardCluster` |
| 10 | 55–60 | end | mark + wordmark, URL, push to last frame (**big hit**) | `endCard` |

## Captures
- Outputs: `rec_output.mjs <preview url> capture/clips/<id>.mp4 7 game|orbit` from each output's public preview, then `dedupe.sh`.
- UI: `capture_ui.mjs` for composer, run-mode menu, setup stepper, compare page, run record, leaderboard, explore.
- If the "same prompt" set doesn't exist yet, make it: run the real battle in the product with the user's logged-in Chrome.

## VO
- 165–180 words (EN). Arc: model fatigue → "will it make better X?" → the product's answer → compare real outputs → pick → explore.
- Tone: dry, honest, a little tired of the hype, then confident. **No verdicts** ("crushes", "best model is X").
- Skeleton: "Every week there's a new model. … Same prompt. Completely different. … So which one should you use? … On <product>, …"

## Truth & rights
- Model names only as they appear in your captures; brand pills in each company's real colour (`looks/evals.md` §1).
- Outputs belong to their makers; community outputs only from public previews.

## Pitfalls
- Unrelated outputs presented as one prompt's results → "결과가 다 다르잖아".
- Website/landing-page outputs as spectacle → "웹사이트 보여주지 말고 영상이나 게임".
- Camera moves on top of footage that already moves fast → double motion; on busy footage only push ≤3%.
