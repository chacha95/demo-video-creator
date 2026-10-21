# Case: saas-workflow

Web apps people work in: dashboards, CRM, docs, project/issue trackers, analytics, design and no-code tools, AI
assistants inside a workspace. The spectacle is **a real job moving through the UI**, not the UI sitting there.

- Length: 45–75s launch film (`qa_check.py … 45 75`); 60–100s walkthrough when the user says "사용법" / "튜토리얼" / "walkthrough".
- Theme: `clean-violet` (white) or `paper-signal`; switch the accent to the product's brand colour.
- Music: calm productivity (launch for an AI-heavy product).

## Hook (0–3s): the finished result, already alive
- Frame 0 is the **end state of the job** the film will follow, in motion: the dashboard updating, the report filling in,
  the board re-sorting, the doc being written by the assistant. Full-bleed `uiCard` (enter:"none"), slow push.
- Bottom-band line = the job in the user's words: "Your Monday report. Done before standup."
- Then hard-cut back to the empty starting state for the story ("Here's how.").
- Why: the abstract-opener rejection ("뭐 어쩌라는건지 모르겠어") applies doubly to SaaS. A feature list or a logo wall
  tells nothing; the viewer must see the job finished first.

## Story beats (60s)
| # | s | beat | picture | devices |
|---|---|---|---|---|
| 1 | 0–3 | hook | finished result, alive | `uiCard` full-bleed |
| 2 | 3–7 | the pain | the old way in one shot: the real messy source (spreadsheet, inbox, 12 tabs) | `uiCard` / `split` |
| 3 | 7–15 | start | create/connect: real clicks, real names typed (`rec_flow` clip) | `uiCard {node}` + cursor |
| 4 | 15–24 | configure | the 2–3 settings that matter, each landing on its spoken word | `uiCard focus`, `typeChips` |
| 5 | 24–32 | run (**big hit**) | the automation/AI/sync runs; data moves | `uiCard` punch, counter |
| 6 | 32–40 | result | the same end state as the hook, now earned | `uiCard` |
| 7 | 40–47 | proof | one real number from the product (time saved, rows synced) | `counter` |
| 8 | 47–54 | fits in | real integrations as real brand marks, inline in one sentence | `kineticChips {logos, bare}` |
| 9 | 54–60 | end (**big hit**) | mark + wordmark, URL, CTA ("Start free" only if the site says it) | `endCard` |

Walkthrough variant (60–100s): beats 3–6 repeat for 2–3 jobs, each with its own tag ("01 IMPORT", "02 AUTOMATE", …),
and the proof/fit-in beats move to the end.

## Captures
- **Seed a demo workspace first.** Realistic but invented company/people data you create (or the product's own demo
  account). Never film real customer data, real emails or real user names. Log the seed in DECISIONS.md.
- Stills: `capture_ui.mjs capture/ui.json` with `storage` (log in once in Playwright, save `saveStorage`).
- Flows: `rec_flow.mjs capture/flow.json capture/clips/<step>.mp4`, one clip per beat, `mark` at the moment the UI
  changes so the cut can land on it; `dedupe.sh` every clip.
- Hide chat widgets, cookie banners, trial nags with `hide` selectors.

## VO
- 165–180 words / 60s. Second person, concrete nouns from the product ("Pipelines", "Views"), one verb per beat.
- Skeleton: "Your Monday report. Done before standup. [pain line] … Connect <source>. Pick <setting>. <Product> does the rest. …"
- No superlatives you can't show ("the best", "10× faster") unless the number is on screen and real.

## Pitfalls
- Static full-page screenshots → boring. Every UI shot has a cursor, typing, scrolling or data changing.
- Showing the whole app at once → unreadable. Crop to the element (`focus` rect); one idea per shot.
- Zooming in and back out to show context → "줌 인 했다가 왜 다시 풀어". Push forward, then cut.
- Dense tables at 1920 wide → text too small. `capture_ui` at 4× and punch into 3–5 rows.
