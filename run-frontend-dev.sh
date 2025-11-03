#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# A script a projekt gyökerében van, így a frontend mappa mindig SCRIPT_DIR/frontend
cd "$SCRIPT_DIR/frontend"
pnpm dev
