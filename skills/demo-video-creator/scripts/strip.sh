#!/bin/sh
# usage: strip.sh video.mp4 start_s out.png  → 16 consecutive frames (0.53s @30fps) in a 4x4 sheet
ffmpeg -v error -y -ss "$2" -t 0.534 -i "$1" -vf "scale=384:-1,tile=4x4:padding=4:color=red" -frames:v 1 "$3"
