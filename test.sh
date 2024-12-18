#!/bin/bash

# Function to split and push files in chunks
push_in_chunks() {
  local chunk_size=25 # Set the chunk size limit in MB
  local total_size=0
  local files_to_commit=()

  # Iterate over all files in the current directory
  for file in $(git ls-files --others --modified --exclude-standard); do
    # Get the file size in MB
    file_size=$(du -m "$file" | cut -f1)

    # Check if adding this file would exceed the chunk size
    if (( total_size + file_size > chunk_size )); then
      # Commit and push the current chunk
      if [ ${#files_to_commit[@]} -ne 0 ]; then
        git add "${files_to_commit[@]}"
        git commit -m "Committing a chunk of files"
        git push
        files_to_commit=()
        total_size=0
      fi
    fi

    # Add the file to the current chunk
    files_to_commit+=("$file")
    total_size=$((total_size + file_size))
  done

  # Commit and push any remaining files
  if [ ${#files_to_commit[@]} -ne 0 ]; then
    git add "${files_to_commit[@]}"
    git commit -m "Committing the final chunk of files"
    git push
  fi
}

# Run the function
push_in_chunks