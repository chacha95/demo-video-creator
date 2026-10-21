# Case: devtool-cli

Developer tools: CLIs, SDKs, APIs, infra/deploy platforms, coding agents, editor extensions. The spectacle is
**a command producing something real**: a deployed app, a passing test run, a generated diff, a live endpoint.

- Length: 40–60s (`qa_check.py … 40 60`).
- Theme: `terminal-night` (the whole film dark, one tone; never light↔dark switching). Use the product's accent.
- Music: developer.
- Extra tools: optional `brew install vhs` for real terminal recordings (`assets/templates/demo.tape`).

## Hook (0–3s): result first, then the one command
- Frame 0: the thing the command produced, live (`uiCard` of the deployed page, the green test run, the diff applied),
  under the line "One command." Then cut to the terminal typing that command (`EM.terminal`), output landing on the beats.
- Why: developers decide in 3s whether it's real. A real result plus a real command reads as real; a feature slogan doesn't.

## Story beats (50s)
| # | s | beat | picture | devices |
|---|---|---|---|---|
| 1 | 0–3 | hook | live result → "One command." | `uiCard`, `headline` |
| 2 | 3–9 | install/init | real command + real output lines | `terminal` |
| 3 | 9–17 | the code | the 3–8 lines that matter, real file in a real editor theme, typed or revealed | `uiCard` (editor capture) / `terminal` |
| 4 | 17–25 | run (**big hit**) | the real run: logs streaming, the URL/test summary landing | `terminal`, impact FX |
| 5 | 25–32 | result | what it made, in motion (page, dashboard, PR) | `uiCard` + cursor |
| 6 | 32–40 | depth | 2–3 real capabilities, one per beat (flags, providers, languages) as real marks | `kineticChips {logos}` / `headline` |
| 7 | 40–45 | proof | one real number (build time, stars, downloads) from a capture | `counter` |
| 8 | 45–50 | end (**big hit**) | mark + wordmark + the install command as the sub line | `endCard {sub:"npm i acme"}` |

## Captures
- **Run every command for real** in a throwaway project and paste the exact output into `EM.terminal` lines (trim noise,
  never invent lines or timings). Or record it with `vhs demo.tape`.
- Code: screenshot the real file in a real editor at 4× (`capture_ui.mjs` on a code page, or the editor window), font ≥ 40px on screen.
- Result: `capture_ui.mjs` / `rec_flow.mjs` on what got deployed; `rec_scroll.mjs` for long pages.

## VO
- 130–150 words / 50s: developers want room to read. Plain, precise, no hype adjectives.
- Skeleton: "One command. [result]. Install it. Write this. Run it. That's a live <thing>. …"
- Read commands as people say them ("npx acme deploy"), respell for TTS only if needed.

## Pitfalls
- Tiny terminal text: one terminal card per shot, ≤ 8 lines visible, fs ≥ 40.
- Fake output, fake latency, or a "✓" the tool never prints → instant credibility loss.
- Blinking caret: the caret is solid and disappears 16–20 frames after the last keystroke (`MOTION_RULES`).
- Syntax-coloured walls of code: crop to the lines the VO talks about.
