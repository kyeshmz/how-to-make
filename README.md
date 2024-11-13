https://fab.cba.mit.edu/classes/MAS.863/

```
for img in *.jpg; do [ -f "$img" ] && magick "$img" -resize 1200x "$img"; done
```

https://ui.aceternity.com/components


https://fab.cba.mit.edu/classes/MAS.863/

for hardware
https://fabacademy.org/2022/labs/kamplintfort/students/leen-nijim/assignments/seven.html

#!/bin/bash

# Find all .jpg files in the current directory and subdirectories
find . -type f -name "*.jpg" | while read img; do
    # Resize each image to a width of 1200px, maintaining aspect ratio
    magick "$img" -resize 1200x "$img"
done





ffmpeg -i input_video -vcodec libx264 -b:v 1000k -vf scale=-2:1080 -an output_video.mp4
