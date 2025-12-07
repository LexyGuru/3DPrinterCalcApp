#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# A script a projekt gyökerében van, így a frontend mappa mindig SCRIPT_DIR/frontend
cd "$SCRIPT_DIR/frontend"

echo "🚀 [FRONTEND-DEV] Vite dev server indítása..."
echo "🚀 [FRONTEND-DEV] Working directory: $(pwd)"

# Ellenőrizzük, hogy a pnpm elérhető-e
if ! command -v pnpm &> /dev/null; then
    echo "❌ [FRONTEND-DEV] pnpm nem található! Telepítsd: npm install -g pnpm"
    exit 1
fi

# Ellenőrizzük, hogy a node_modules létezik-e
if [ ! -d "node_modules" ]; then
    echo "📦 [FRONTEND-DEV] node_modules hiányzik, telepítés..."
    pnpm install
fi

echo "✅ [FRONTEND-DEV] Vite dev server indítva a http://localhost:5173 címen"
pnpm dev
