# Case: before-after

Products whose value is **time or effort saved on a task people already do**: dictation, automation, AI writing or
coding assistants, data entry, scheduling. The film shows the same task done two ways, side by side, with real timers.

- Length: 30–50s (`qa_check.py … 30 50`).
- Theme: `clean-violet`; "before" side is never styled worse on purpose (same canvas, same card), only slower.
- Music: calm productivity, with the drop on the moment the product finishes.

## Hook (0–3s): split, both clocks running
- Frame 0: `EM.split` — left "By hand", right "<Product>" (pills), both moving, a real elapsed timer on each
  (`counter` with suffix "s", or the OS clock in the capture). The product side finishes first, inside the hook.
- Line: the literal difference, from your measured runs ("4 minutes vs 12 seconds.").

## Story beats (40s)
| # | s | beat | picture | devices |
|---|---|---|---|---|
| 1 | 0–4 | hook | split, product side finishes first | `split`, `counter` ×2 |
| 2 | 4–10 | the old way | full-frame the manual side for 2 beats: the real tedium | `uiCard {node}` |
| 3 | 10–20 | the product way | full-frame the product run with cursor/keys (**big hit** at finish) | `uiCard {node}` + cursor |
| 4 | 20–26 | the result | both results side by side, equal quality (or better) | `split` |
| 5 | 26–32 | the number | the measured saving, rolling | `counter` |
| 6 | 32–36 | where it works | 3 more real apps/tasks, one per beat | hard cuts, `kineticChips {logos}` |
| 7 | 36–40 | end (**big hit**) | mark + wordmark + URL | `endCard` |

## Captures
- Run both ways **for real** and time them. The manual run is a real person-speed take (or the user's), not slowed down.
  Log both times in DECISIONS.md; the numbers on screen come from there.
- Use `rec_flow.mjs` with a realistic `cps` (manual typing ≈ 5–7 cps) for the manual side; the product side as it really runs.
- Desktop apps (not a browser): screen-record with macOS (`screencapture -v`) or the app's own demo; dictation needs a
  real voice take and can't be automated (HID keys) — ask the user for that one recording at onboarding.

## VO
- 110–125 words / 40s. "This takes four minutes. … Or twelve seconds. …"
- No exaggeration: if the saving varies, say "about" and show the measured run.

## Pitfalls
- Making the "before" side look broken, blurry or dark → reads as unfair and cheap.
- Timers that don't match the footage → truth violation; drive the counter from the real clip timing.
