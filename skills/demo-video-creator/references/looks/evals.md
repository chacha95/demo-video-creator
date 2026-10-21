# Evals look, tone and hook (approved 2026-10-09)

This is the house style for every Evals (evals.ag) film. It comes from the 02 NanoBanana teaser remake. The user rejected four rounds of it and then said "이 영상 만든 방식들이 굉장히 좋거든".
- Approved renders: `videos/evals-higgs-refs/deliverables/v4_모션리메이크/02_NanoBanana티저_KO_5차.mp4` (KO) and `…/02_NanoBanana티저_EN_2차.mp4` (EN).
- Build: `videos/evals-hf-DeKT6v0CAiY/`. Use `build/assemble_v5.py` (`FILM_LANG=en|ko`), `build/shots_v5.js`, `build/hook_v5.js` and `scripts/post_v5.py`.
- Motion helpers: `scripts/motion-kit.js` (bundled here, devices D1–D8; `EM.theme('evals')` loads these tokens).
- Measured motion numbers: `MOTION_SPEC.md`.

Where this file disagrees with older notes (dark/light switches, tagged max-emotion VO), this file wins.

## 1. Colour: one tone, the site's own canvas
- **Background is `#F7F4ED` everywhere.** That is the live `body` colour of https://evals.ag/outputs. Use it in the hook bands, behind the result grid, in the type scenes and on the end card.
  - The user asked for this twice. First "중간에 검정색 배경 화면 없애주고 일정한 톤으로 전개해", then "백그라운드 컬러를 evals.ag/outputs 여기 컬러로 맞춰야지" when the type scenes were a lighter `#FCFBF7`.
  - Before building, read the colour from the live page (`getComputedStyle(document.body).backgroundColor`). After rendering, sample corner pixels in every section. They should all read ≈ (246–247, 243–244, 236–237).
- **No dark `#181515` sections, no light↔dark switches, no gradients.** The energy comes from the footage and the cuts, not from flipping the canvas.
- **Ink:**
  - Display type ≥ 80 px: `#2B231D`.
  - UI-scale text: `#40352C` (site ink).
  - Second lines and meta: `#85796D`.
- **Accent:** coral `#A13A2B`, one per frame. It goes on the punch word only (e.g. "wins" / "최강", "different." / "달라요."), never on a model's side.
- **Model pills use each company's REAL brand colour (user rule, 2026-10-09).** The user said: "클로드나 그록 등등 쓸 때 각자의 회사 색 써야한다고… 컬러감이 없잖아 내 말은 grok 이면 그록 색 쓰고 해야지".
  - The old invented colours (purple/amber/green/blue) are wrong. So is an all-ink pill: it has no colour.
  - The brand colours:
    - **Claude (Anthropic)**: `#D97757` (the Claude spark colour, also shown on evals.ag), white text
    - **GPT / OpenAI** (GPT-6 Astra, GPT-6.1 Sol): `#10A37F` (ChatGPT green), white text
    - **Grok (xAI)**: `#000000` black, white text
    - **DeepSeek**: `#4D6BFE` (DeepSeek blue), white text
  - Each pill carries the model's real mark as a small white monochrome glyph, the same size for all models.
  - Use diatype 700 caps (Pretendard 700 in KO lines), radius 6.
  - The colour applies to the pill (and an optional thin matching bar) only. Never tint the footage, tiles or canvas.
  - Coral `#A13A2B` stays the single accent for the punch word only.
- **Shadows** on a cream canvas stay soft: `0 1px 2px rgba(43,35,29,.08), 0 14px 40px rgba(43,35,29,.16)`. The heavy black drop shadows meant for dark frames look dirty on cream.

## 2. Type
- **EN:**
  - Hook lines: martina 400 (serif), 118–200 px, tracking −0.022em.
  - Body kinetic lines: diatype 500, tracking −0.02em.
  - The prompt kicker: IBM Plex Mono 500, 40 px, muted.
- **KO:** every Korean line uses Pretendard Variable as the primary font (800 for the hook, 700 for the body), including English words inside a Korean line.
- **The brand name is always written "Evals" on screen, in Latin letters, in KO films too** ("Evals에서 찾으세요"; the user asked "이밸스 -> evals 로 바꿔주고"). The KO voiceover still says 이밸스, because a Korean voice reading "Evals" risks "evils".

## 3. Hook: the results are the hook
- **Frame 0 is already the comparison.** Open on the two most different real outputs of the same prompt in a 50/50 split:
  - flat bands top (140 px) and bottom (220 px) in `#F7F4ED`
  - model pill top-inside each half
  - martina "vs" badge on the seam
  - the prompt in a mono kicker in the top band
  - the question (line 1) in the bottom band
- **Then hard-cut to a 2×2 wall of all four outputs** of that prompt as line 2 starts (02 film: F90 KO, F76 EN):
  - tiles stream in on a 2 f stagger: opacity (age+1)/3, blur 14→0 over 6 f, rise 14 px
  - a pill sits on each tile
  - the camera settles at 25 %/frame from 1.22
  - a 7-frame punch-in drives into the body cut
- **Why:**
  - A single output opening a teaser, followed later by a split, got "비교 영상이 후킹이 안됨 결과 후킹이".
  - The viewer must see "same prompt, wildly different results" in the first second.
  - Pick pairs by contrast (colour field + camera scale), using the extreme-pair tables in `videos/evals-higgs-refs/v4kit/V4_PLAN.md` §A.5.
- **Line 2 is literal, never a metaphor or an instruction to look somewhere.**
  - "하늘 좀 보세요" / "Check the sky." was rejected.
  - Use the plain fact instead: "같은 프롬프트인데, 완전 달라요." / "Same prompt. Completely different."
- Line 1 is the fight question, with no verdict: "이번 주 최강 모델은 뭘까요?" / "Which model wins this week?"

## 4. Body devices (motion from demo_en2, design by Evals)
1. **Kinetic sentence with RESULT thumbnails** (D2 `EM.kineticChips` with `{thumbs:[…]}`):
   - The sentence is "Another day, [result thumb] another [model pill] model." / "매일 [thumb] 새 [pill] 모델이죠."
   - The thumbnails are real output stills, 16:9, about 4.2 cap wide and rounded. They swap every 3 f, in step with the pill, so each thumb shows the output of the model named on the pill.
   - **Do not use the white rounded logo cards with a model icon inside.** The user circled them as the thing to change.
2. **Brand line with a bare mark** (`{logos:[MARK], bare:true}`): "Find your best setup on [mark] Evals." The Evals mark sits inline with no card behind it.
3. **Type-on with floating model chips** (D6 `EM.typeChips`): "Battle them. / Pick the one you'd use."
4. **End card** (D8 `EM.endCard`):
   - The mark shrinks from 1040 px to 131 px, then the "Evals" wordmark appears.
   - The sub line ("Live now, at evals.ag" / "지금, evals.ag") is keyed to the voiceover word by word.
   - The card keeps a slow push all the way to the last frame.
- Every cut is hard and lands on the beat or a VO onset. No crossfades.
- Each word appears 3 output frames before it is spoken, with an accent flash of coral for 4 f, then fading to ink over 3 f.

## 5. Copy tone (EN source of truth: `videos/evals-higgs-refs/v4kit/COPY_V4.md`)
- **Arc:**
  1. Model-fatigue hook
  2. "Should you even care? Will it make better X?"
  3. The Evals answer: same task, sandbox, change model/skill/tool
  4. Compare real outputs
  5. Use the subscriptions you already pay for
  6. Pick and keep working
  7. Explore what others made
- **Voice:** dry, honest, a little tired of the hype, then confident.
- **No verdicts.** Never write "crushes", "not even close" or "best model is X". Questions and "Pick the one you'd use" are fine.
- **No person framing:** no coworker, friend or team. The fight is model vs model.
- **"setup"** appears only in the user's own lines ("Find your best setup on Evals."). In KO it becomes "조합".
- **Keep UI terms in English in both languages:** Battle, Task, Model, Skill, Leaderboard.
- **Truth:** only claim features you can see on the live site. Verified so far:
  - blind compare
  - Battle
  - leaderboards ("Descriptive preference votes")
  - "Codex, Claude, and Higgsfield connected"
  - "Try this"

## 6. Voiceover: steady one-shot read
- **One request, the whole script, no emotion tags.** Use `scripts/vo3_gen.py`, whose defaults are now stability 0.5, similarity 0.8, style 0.3, speed 1.12.
  - EN: Will `bIHbv24MWmeRgasZH58o`.
  - KO: `VOICE=ZNSVYmudV9pOqphY0x8C` (Choi).
- **Why:** a take with a different tag on every sentence ([curious] → [excited] → [tired] → [confident]) was still one take. But the tone jumped at every sentence, so the user heard it as stitched: "목소리가 너무 어색해 한 번에 생성해야".
- **Roll 3–4 takes.** Pick the one with even sentence gaps that also fits the hook windows:
  - line 1 ends by about 2.9 s
  - the hook voiceover ends at least 0.15 s before the hook cut
  - the first body word lands within about 3 f after the cut
- **Retime the film to the take, never the take to the film.** Move the cuts and the grid frame; let the film grow (15 → 16.5 s was fine).

## 7. Launch post (X, @maker_evan, English)
When the user asks for a post about the film, introduce Evals first, then the example, then the CTA:

```
Meet Evals: a place to test AI models on real tasks.

Give the same prompt to different models, skills, and tools in a sandbox, then compare what they actually make, side by side.

Here: "Build a playable 3D flying game" → DeepSeek, Claude, GPT, Grok. Same prompt, four completely different games.

Battle them, vote blind, pick the one you'd use.

evals.ag
```
A post that only described the clip ("Same prompt. Four models…") got "evals 에 대해서 간단히 소개를 해주고 그거에 대해서 알려줘야지".

## 8. Build gotchas met on this film
- **Stills via Playwright:**
  - Call `page.evaluate((F) => { window.__timelines.main.seek(F / 23.75, false); }, f)`. Without `false`, GSAP suppresses `onUpdate`, so the frame never renders.
  - Without the braces, `evaluate` tries to serialise the returned timeline and hangs.
  - Use `waitUntil: "domcontentloaded"`, not `"load"`.
- **Whisper model:** `whisper-cli -m ~/.cache/hyperframes/whisper/models/ggml-large-v3.bin -l en|ko -nt -f <16k.wav>`.
- **Parallel sessions:** other sessions often edit the same film. Before editing, check `find . -newer <last render>` and `ps` for running renders. If something is in flight, fork new version files (`index-v5*.html`, `assemble_v5.py`, `post_v5.py`) instead of editing shared ones.
- **zsh:** `for x in "a b c"` does not word-split in zsh. Use a small function with positional arguments.
