# One-shot brief template (any product, any case)

Fill every `{{VARIABLE}}`, delete optional lines that don't apply, and paste everything from "BRIEF" down as one
message. A filled Evals example is in `examples/BRIEF_evals-demo3.md`.

| Variable | Meaning | Example |
|---|---|---|
| `{{PRODUCT}}` / `{{DOMAIN}}` | name / domain on the end card | Acme / acme.app |
| `{{PITCH}}` | what it does, one line | turn your inbox into a weekly report |
| `{{CASE}}` | one of `references/CASES.md` | saas-workflow |
| `{{LENGTH}}` | target seconds (inside the case's range) | 60 |
| `{{LANG}}` | en / ko | en |
| `{{APP_URL}}` | live app to capture | https://app.acme.app |
| `{{MAIN_THREAD}}` | the ONE real task followed end to end | "Build the Q4 board report from the Sales inbox" |
| `{{SCREENS}}` | screens to capture, in story order | inbox connect, report builder, schedule, finished report |
| `{{THEME}}` | preset in `assets/themes/` | clean-violet |
| `{{TAGLINE}}` | end-card line | Reports, done. |
| `{{SLUG}}` | project folder | acme-demo |
| `{{REF_VIDEO}}` *(optional)* | reference film for feel | https://youtu.be/… |

---

## BRIEF

START NOW. Do not ask me questions and do not wait for input; every input is below. Make every unspecified decision
yourself, log it in DECISIONS.md, and keep going until ONE finished mp4 exists.

Use the demo-video-creator skill. Case: **{{CASE}}** (read `references/cases/{{CASE}}.md`).

- Make ONE {{LENGTH}}s landscape demo film for **{{PRODUCT}}** ({{DOMAIN}}): {{PITCH}}. Language: {{LANG}}.
- Output: `videos/{{SLUG}}/renders/{{SLUG}}.mp4`, 1920×1080, 30fps, H.264 + AAC 192k, −14 LUFS. Nothing else.
- Scaffold: `sh .claude/skills/demo-video-creator/scripts/new_project.sh {{SLUG}} {{THEME}}`.
- Main thread: {{MAIN_THREAD}}. Capture it for real from {{APP_URL}}: {{SCREENS}}. Seed demo data you create; no real
  customer data. If a page needs sign-in, use my logged-in session or the public pages.
- Hook, story beats, captures, VO budget and music prompt: from the case file. Frame 0 is already the payoff.
- VO: one take, `eleven_v4`, EN Will / KO Choi, steady settings, no emotion tags, laid in whole; words on screen
  0.05–0.20s before they're spoken.
- Look: theme {{THEME}} matched to the live site's canvas and accent, one background tone, real UI as rounded cards,
  the real logo in `build/theme.js`. Never: outlines, underlines, highlight boxes, gradients, emoji, fake UI.
- Motion: `references/MOTION_RULES.md` (one camera, snappy/floaty only, exits carry velocity, holds drift, cuts on the beat).
  *(optional)* Match the feel of {{REF_VIDEO}} by measuring it first.
- Render at `--fps 95/4`; post with `post.json` (4–6 big hits); end card "{{TAGLINE}}" + {{DOMAIN}}.
- QA: `qa_check.py` with the case's length range, `motion.py`, strips at every transition, `sync_audit.mjs`, finish audit,
  one Whisper pass. Fix and re-render until everything passes, then report the file path.
