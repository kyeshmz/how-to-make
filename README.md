https://fab.cba.mit.edu/classes/MAS.863/
for img in \*.jpg; do [ -f "$img" ] && convert "$img" -resize 1200x "$img"; done
