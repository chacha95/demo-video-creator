# Case: feature-launch

One new feature, release or changelog entry, for X / LinkedIn / the changelog page. Short and specific: **the
feature doing its job three ways**. Captures and theme come from the product's own case (SaaS, devtool, mobile…).

- Length: 20–40s (`qa_check.py … 20 40`). Default 30s.
- Theme: the product's established film theme (reuse its `build/theme.js`), so launches look like one family.
- Music: launch, or the product's previous bed re-arranged (`music.segments`).

## Hook (0–2s): the feature already working
- Frame 0: the feature mid-action, punched in on the element that's new. A mono tag "NEW" (or the version, "v2.4")
  sits above the headline on the left margin; the headline names the feature in the product's own words.
- No "We're excited to announce". No logo intro.

## Story beats (30s)
| # | s | beat | picture | devices |
|---|---|---|---|---|
| 1 | 0–3 | hook | feature mid-action + NEW tag + name | `uiCard focus`, `headline {tag}` |
| 2 | 3–10 | use 1 | the main way people will use it, start to finish | `uiCard {node}` + cursor |
| 3 | 10–16 | use 2 (**big hit**) | a second, more impressive use | `uiCard`, impact FX |
| 4 | 16–22 | use 3 / detail | the detail power users care about (shortcut, API, setting) | `terminal` / `uiCard focus` |
| 5 | 22–26 | why | one line on what it replaces, literal | `headline` |
| 6 | 26–30 | end (**big hit**) | mark + "Available today" / plan names only if true + URL | `endCard {sub}` |

## VO
- 75–85 words / 30s. One sentence per use. Present tense, the feature's real name.
- Skeleton: "<Feature> is here. <Use 1 in one line>. <Use 2>. And <detail>. No more <old way>. Live today on <url>."

## Notes
- Cutting from an existing film: re-edit from the same captures and a NEW one-take VO; don't trim the master's VO.
- Pair with a launch post: product in one line → the feature → the example in the clip → URL.
