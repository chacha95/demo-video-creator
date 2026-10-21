# Changelog

## 2.0.0 — 2026-10-21

From one Evals-shaped film to nine kinds of demo video.

### Added
- **Nine case playbooks** (`references/CASES.md`, `references/cases/*.md`): ai-output-battle, saas-workflow,
  devtool-cli, mobile-app, browser-extension, marketplace-catalog, feature-launch, teaser, before-after. Each sets the
  frame-0 hook, beat table, capture plan, devices, VO budget, music prompt, default theme and pitfalls.
- **Themes** (`assets/themes/*.json`): evals, paper-signal, clean-violet, terminal-night, soft-mobile, editorial-cream,
  with open fonts fetched locally by `fetch_fonts.sh` (Fontsource + Pretendard).
- **Starter project** (`assets/starter/`) and `new_project.sh` scaffold: HyperFrames index.html on one paused timeline,
  theme, fonts, templates (SCRIPT, DESIGN, DECISIONS, post.json, flow.json, ui.json, lines.json, demo.tape).
- **motion-kit.js** (was `evals-motion.js`): `EM.theme()` for palette/fonts/logo, and five generic devices —
  `headline`, `uiCard` (3D settle, one-way focus punch, arrow or touch cursor), `terminal`, `split`, `counter`.
- Capture: `capture_ui.mjs` (4× DPR element crops from a JSON spec, logged-in storage), `rec_flow.mjs` (scripted UI
  flows with an eased visible cursor and cut marks), `rec_ios.sh` (simulator with a clean status bar), `dedupe.sh`.
- Audio: `music_gen.py` (ElevenLabs Music candidates), `sfx_gen.py` (the SFX kit post.py expects); `vo3_gen.py` now
  writes `words.json` and supports `TAKE=n` for rolling takes and `MODEL`.
- QA: `qa_check.py` delivery gate (format, length per case, −14 LUFS, true peak, cuts/10s, frozen holds, double cuts),
  `preflight.sh` onboarding check.
- `references/DEVICES.md` (motion-kit API), `references/BRIEF_TEMPLATE.md` (generic one-shot brief),
  `references/looks/evals.md` (approved Evals house style), `references/MOTION_SPEC.md` (measured numbers).
- Evals: one per case (9).

### Changed
- `SKILL.md` routes through a case first; Evals-only rules moved to `looks/evals.md`. VO default is the steady one-take
  read (stability 0.5, style 0.3, no tags) the user approved on 2026-10-09.
- `post_template.py` → `post.py`, driven by `post.json` (no film-specific constants in code; SFX can anchor to VO words).
- `bars.py`, `music_fit.py`, `mixcheck3.py` → `mixcheck.py`, `sync_audit.mjs` take arguments instead of hard-coded
  file names, hits or a project-specific `window.__render`.

### Removed
- Machine-specific paths from the shipped references.

## 1.0.0 — 2026-10-06
- First release: the Evals launch-film pipeline (real captures, one-take VO, beat-locked HyperFrames build, fps re-render,
  impact FX, −14 LUFS), EN/KO demos in `media/`.
