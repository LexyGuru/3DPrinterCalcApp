#!/bin/bash
# Get the current git branch (if available)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

# Set VITE_IS_BETA based on branch name
if [ "$CURRENT_BRANCH" = "beta" ]; then
  export VITE_IS_BETA='true'
  echo "Building as BETA (branch: beta)"
else
  export VITE_IS_BETA='false'
  echo "Building as RELEASE (branch: $CURRENT_BRANCH)"
fi

cd "$(dirname "$0")/frontend"
pnpm build
