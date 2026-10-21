#!/bin/sh
# usage: dedupe.sh in.mp4 out.mp4 — drop repeated frames from a screencast (they read as micro-stutters and fail
# motion QA), then re-time to constant 30fps. Check the frame count it prints against the source length.
ffmpeg -v error -y -i "$1" -vf "mpdecimate=hi=64*6:lo=64*3:frac=0.33,setpts=N/(30*TB),fps=30" -an -c:v libx264 -crf 17 -pix_fmt yuv420p -movflags +faststart "$2" && \
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$2" | xargs -I{} echo "$2: {} frames"
