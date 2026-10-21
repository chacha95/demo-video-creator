# Case: mobile-app

iOS and Android apps, filmed landscape. The spectacle is **real screens reacting to real touches**: the scroll, the
transition, the moment the app does its job.

- Length: 30–60s (`qa_check.py … 30 60`).
- Theme: `soft-mobile` (cool light canvas so white screens read as cards); accent = the app's brand colour.
- Music: playful mobile (launch for a pro/productivity app).
- Extra tools: Xcode + Simulator (`xcrun simctl`), or `adb` for Android.

## Layout on a 16:9 canvas
- 1 phone: the screen as a tall rounded card (`uiCard` with `node` = the recording, `fit≈0.3`, `radius≈56`), placed on
  the right third; the headline sits on the 120px left margin.
- 2–3 phones: side by side for a flow (step 1 → 2 → 3), or a tilted stack with the floaty settle.
- **No fake device frames or drawn bezels.** The rounded screen + soft shadow is the device. (A drawn phone is a fake mockup.)
- Touches: `cursorStyle:"touch"` (a soft finger disc), because simulators draw no touches.

## Hook (0–3s): the money screen, mid-interaction
- Frame 0: the screen where the app pays off (the photo transformed, the workout logged, the transfer sent), already
  moving, punched in to fill ~80% of the height, with the one-line promise.
- Then pull to the 3-phone layout as line 2 starts.

## Story beats (45s)
| # | s | beat | picture | devices |
|---|---|---|---|---|
| 1 | 0–3 | hook | money screen, mid-motion | `uiCard {node}` large |
| 2 | 3–9 | the moment of need | the screen where the user starts (real, populated) | `uiCard` + touch |
| 3 | 9–20 | the flow | 3 taps/steps, one per beat, each on its spoken word | 2–3 `uiCard`s, touch, whip between |
| 4 | 20–26 | the payoff (**big hit**) | result screen, punch-in on the key element | `uiCard focus` |
| 5 | 26–34 | delight | 2 real details (widget, haptic-looking animation, dark mode) | `uiCard`s |
| 6 | 34–40 | proof | real rating / downloads only if shown on the store page you captured | `counter` |
| 7 | 40–45 | end (**big hit**) | app icon (real) + name + "App Store · Google Play" only if live there | `endCard` |

## Captures
- Simulator: build the app (or install the store build), seed demo data, then `rec_ios.sh capture/clips/<step>.mp4 8`
  per step while you drive it (by hand, XCUITest, or the simulator tools). Status bar is forced to 9:41 / full battery.
- Stills: `xcrun simctl io booted screenshot capture/ui/<name>.png` (native resolution, already sharp).
- Android: `adb shell screenrecord`, `adb exec-out screencap -p`. Hide the status bar notifications first.
- Real phone not available in this skill; the simulator is the capture device.

## VO
- 115–125 words / 45s. Short, warm, verbs on the taps ("Snap. Tap. Done.").
- KO: app UI terms as in the app's own language setting; if the app is English, keep them English.

## Pitfalls
- Recording at 60fps and dropping frames → stutter. Convert to 30fps CFR (rec_ios.sh does) and dedupe.
- Notification banners, debug overlays, "Simulator" text in frame → finish-audit failure.
- Tiny phones lost in a big canvas: the phone screen is ≥ 80% of frame height in the money shots.
