# Cases: pick one before you write a word

Every case uses the same pipeline, motion grammar, VO rules, mix and QA from `SKILL.md`. A case only changes **what the
first 3 seconds show, which real things you capture, the order of the story, the length and the defaults**.

## Router

| case | pick it when the product… | what moves on screen | length (qa_check) | default theme | hook in frame 0 |
|---|---|---|---|---|---|
| [`ai-output-battle`](cases/ai-output-battle.md) | generates outputs you can compare (models, prompts, setups) | the outputs themselves | 45–65s | `evals` / `editorial-cream` | two most different real outputs of the same input, split 50/50 |
| [`saas-workflow`](cases/saas-workflow.md) | is a web app people work in (dashboards, CRM, docs, project tools) | a real job moving through the UI | 45–75s (walkthrough 60–100s) | `clean-violet` / `paper-signal` | the finished result of the job, already alive |
| [`devtool-cli`](cases/devtool-cli.md) | is used from a terminal, editor or API | commands, real output, the thing it deployed | 40–60s | `terminal-night` | the deployed/generated result, then the one command |
| [`mobile-app`](cases/mobile-app.md) | is an iOS / Android app | real simulator screens, taps, transitions | 30–60s | `soft-mobile` | the app's money screen, mid-interaction |
| [`browser-extension`](cases/browser-extension.md) | adds itself to other web pages | the page changing when the extension acts | 30–45s | `clean-violet` | a familiar page, then the extension transforming it |
| [`marketplace-catalog`](cases/marketplace-catalog.md) | is a catalog/store of many items (skills, templates, assets) | a wall of real items, search, install, result | 45–60s | `editorial-cream` / `paper-signal` | the wall of real items in motion + the count |
| [`feature-launch`](cases/feature-launch.md) | shipped ONE new thing (changelog, release) | that one feature, three ways | 20–40s | product's theme | the feature already doing its job |
| [`teaser`](cases/teaser.md) | isn't out yet, or needs a social cutdown | 3–5 strongest real shots | 12–20s | product's theme | the single strongest moving shot |
| [`before-after`](cases/before-after.md) | saves time/effort on a task people already do | the same task done two ways, side by side | 30–50s | `clean-violet` | split: manual vs product, real timers |

Deciding between two: pick by what moves. Outputs → `ai-output-battle`. A UI flow → `saas-workflow`. Commands → `devtool-cli`.
A one-feature request for any product type → `feature-launch` (reuse that product's case for captures). Pass the qa_check
range for the case: `python3 qa_check.py renders/<name>.mp4 <min> <max>`.

## What stays the same in every case
- Frame 0 is already the payoff. No logo intro, no title card, no "Introducing…" ("뭐 어쩌라는건지 모르겠어").
- One real task/input followed end to end. Real captures, real numbers, real names only.
- One continuous VO take, words on screen 0.05–0.20s before they are spoken.
- One background tone for the whole film. Real UI as rounded cards. One accent, on the punch word.
- 4–6 big hits with impact FX and layered SFX; SFX elsewhere only on real UI actions.
- End card: real mark + wordmark + URL, slow push to the last frame.

## VO word budget by length (EN ≈2.7 words/s · KO ≈6.5–7 syllables/s at speed 1.12)
| length | EN words | KO 글자(공백 제외) |
|---|---|---|
| 15s | 30–40 (or music-led) | 90–100 |
| 30s | 75–85 | 190–210 |
| 45s | 115–125 | 290–310 |
| 60s | 165–180 | 390–420 |
| 90s | 235–250 | 580–620 |

## Default music prompts (pass to music_gen.py; always add "instrumental")
| mood | prompt |
|---|---|
| launch (default) | modern minimal tech launch, punchy kick, deep 808, crisp hats, glassy synth plucks, Apple/Linear keynote feel, no cheesy EDM risers, no corporate/stock vibe, 120 BPM |
| calm productivity | warm minimal electronic, soft kick, rounded bass, light percussion, felt piano plucks, focused and optimistic, no corporate ukulele, no risers, 110 BPM |
| developer | dark minimal techno, tight kick, sub bass, clicky percussion, analog arp, precise and cool, no dubstep, no risers, 124 BPM |
| playful mobile | bright modern pop-electronic, bouncy kick, plucky synths, finger snaps, friendly and fresh, no kids' ukulele, 118 BPM |
| teaser | cinematic minimal pulse, low drones, heartbeat kick, sparse glassy hits, building tension, big final hit then silence, 100 BPM |
