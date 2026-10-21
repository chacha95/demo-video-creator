# Case: browser-extension

Chrome/Edge extensions, in-page AI assistants, bookmarklets, overlays. The spectacle is **a page the viewer
recognises changing when the extension acts**.

- Length: 30–45s (`qa_check.py … 30 45`).
- Theme: `clean-violet`; accent = the extension's brand colour.
- Music: calm productivity.

## Hook (0–3s): before → after on the same page
- Frame 0: the target page in its normal state; on the first beat the extension acts (summary panel slides in,
  translation flips the text, the form fills itself). Use `EM.split` with the seam travelling (`from 1 → to 0.5`) if
  the change is visual, or a single `uiCard` clip if it animates in place.
- Bottom-band line: the job, literal ("Any article. Summarised in a click.").

## Story beats (40s)
| # | s | beat | picture | devices |
|---|---|---|---|---|
| 1 | 0–3 | hook | page → extension acts | `split` / `uiCard {node}` |
| 2 | 3–8 | where it lives | the toolbar icon / shortcut, real, punched in | `uiCard focus` + cursor |
| 3 | 8–18 | the job | the full action on a second real page (`rec_flow`) | `uiCard {node}` + cursor |
| 4 | 18–24 | (**big hit**) | the result panel, punch-in on its key line | `uiCard focus` |
| 5 | 24–32 | works everywhere | 3–4 different real sites, one per beat, same action | hard cuts on beats |
| 6 | 32–36 | trust | the real permissions/privacy line from the store page | `headline` |
| 7 | 36–40 | end (**big hit**) | icon + name + "Add to Chrome" (only if it's listed) | `endCard` |

## Captures
- Load the unpacked/installed extension in Playwright: `chromium.launchPersistentContext(dir, { headless: false, args:
  ["--disable-extensions-except=<path>", "--load-extension=<path>"] })`. Copy `rec_flow.mjs` into the project and swap its
  launch for that (extensions need a persistent, headed context). Popups: open `chrome-extension://<id>/popup.html`
  in a tab of the same context and capture it there.
- Target pages: prefer the user's own site, public docs, Wikipedia, or pages the extension's own marketing shows.

## Rights
- Third-party sites in frame are fine for showing compatibility, but no third-party logos as hero, no private pages,
  no logged-in personal data. Blur nothing: just choose clean public pages.

## Pitfalls
- Browser chrome drawn by hand → fake mockup. Show the real toolbar capture or none.
- Too many sites in a row with nothing changing → montage strobe ("영상 막 쏟아져 나오는거"). Each site shows the action.
