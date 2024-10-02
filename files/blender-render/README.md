ffmpeg -r 30 -i ./output/frame_%04d.png -vcodec libx264 -crf 25 -preset medium -vf scale=-2:1080 -acodec libmp3lame -b:v 1000k -an -q:a 4 -ar 48000 -ac 2 output_video.mp4
