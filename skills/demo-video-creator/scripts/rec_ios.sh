#!/bin/sh
# usage: rec_ios.sh <out.mp4> [seconds=8] [device=booted]
# Records the iOS Simulator screen (real app, real data) with a clean status bar (9:41, full battery/signal), then
# converts to constant 30fps H.264. Drive the app while it records (by hand, XCUITest, or the simulator tools).
# Android: adb shell screenrecord --bit-rate 12000000 /sdcard/rec.mp4 ; adb pull /sdcard/rec.mp4 — then the same ffmpeg step.
set -e
OUT="$1"; SECS="${2:-8}"; DEV="${3:-booted}"; TMP="${OUT%.*}.raw.mov"
xcrun simctl status_bar "$DEV" override --time "9:41" --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3 --dataNetwork wifi || true
xcrun simctl io "$DEV" recordVideo --codec=h264 --force "$TMP" &
PID=$!; sleep "$SECS"; kill -INT $PID; wait $PID 2>/dev/null || true
ffmpeg -v error -y -i "$TMP" -vf "fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2" -an -c:v libx264 -crf 16 -pix_fmt yuv420p -movflags +faststart "$OUT"
rm -f "$TMP"; xcrun simctl status_bar "$DEV" clear || true
echo "wrote $OUT"
