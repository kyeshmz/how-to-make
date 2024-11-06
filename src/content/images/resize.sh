#!/bin/bash

# Find all .jpg files in the current directory and subdirectories
find . -type f -name "*.jpg" | while read img; do
    # Resize each image to a width of 1200px, maintaining aspect ratio
    magick "$img" -resize 1200x "$img"
done