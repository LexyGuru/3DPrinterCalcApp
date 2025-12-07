# 3D Printer Calculator App – GitHub Wiki

> **🌍 Language / Nyelv / Sprache / Idioma / Lingua / Język / Jazyk / Língua / Langue / 语言**  
> [🇭🇺 Magyar](../wiki/Home) | [🇬🇧 English](#english-version) | [🇩🇪 Deutsch](#deutsch-version) | [🇪🇸 Español](#español-version) | [🇮🇹 Italiano](#italiano-version) | [🇵🇱 Polski](#polski-version) | [🇨🇿 Čeština](#čeština-version) | [🇸🇰 Slovenčina](#slovenčina-version) | [🇵🇹 Português](#português-version) | [🇫🇷 Français](#français-version) | [🇨🇳 中文](#中文版本)

---

<a name="english-version"></a>
## 🇬🇧 English Version

### 📌 Quick Summary

|                     |                                                                 |
|---------------------|-----------------------------------------------------------------|
| **Current Version** | `v0.5.56`                                                       |
| **Platforms**       | macOS · Linux · Windows (Tauri native build)                    |
| **Technologies**    | Frontend: React 19 · TypeScript · Vite · Framer Motion          |
|                     | Backend: Rust · Tauri v2 · Tauri Plugins                        |
| **Main Goal**       | 3D printing cost calculation, quote management and reporting    |

> **Latest Updates (v0.5.56)**  
> - Complete translations created in 6 languages: Czech, Spanish, Italian, Polish, Portuguese, Slovak  
> - All language files contain all 813 translation keys  
> - Tauri permissions fix: explicit enablement of update_filamentLibrary.json  
> - Documentation updated with v0.5.56 release entries  

---

## 📚 Table of Contents

1. [Project Goals and Vision](#-project-goals-and-vision)  
2. [Architecture Overview](#-architecture-overview)  
3. [Modules and Features](#-modules-and-features)  
4. [Data Model & Persistence](#-data-model--persistence)  
5. [Themes, Animations, UX](#-themes-animations-ux)  
6. [Installation & Prerequisites](#-installation--prerequisites)  
7. [Developer Workflow](#-developer-workflow)  
8. [User Guide](#-user-guide)  
9. [Build and Release Management](#-build-and-release-management)  
10. [Troubleshooting & FAQ](#-troubleshooting--faq)  
11. [Security, Permissions, Data Management](#-security-permissions-data-management)  
12. [Roadmap, Ideas, Excluded Features](#-roadmap-ideas-excluded-features)  
13. [Contributing and Code Quality](#-contributing-and-code-quality)  
14. [License, Related Documents](#-license-related-documents)

---

## 🎯 Project Goals and Vision
- Accurate and fast 3D printing cost calculation  
- User-friendly quote pipeline (versioning, PDF export, status management)  
- Complete filament and printer database management (factory + custom data)  
- Multiplatform desktop application with low memory requirements (Tauri)  
- Customizable visual experience (themes, animations, localization)  

---

## 🏗 Architecture Overview

### Main Components
- **Frontend (React 19 · TypeScript)**  
  SPA structure, modular components (`frontend/src/components`)  
  Custom design system (`utils/styles.ts`, `themes.ts`)  

- **Backend (Rust · Tauri v2)**  
  `src-tauri/src/main.rs` – command handling, plugin initialization  
  `tauri.conf.json` – build/config, AppConfig path, plugin permissions  

- **Plugin Layer**
  - `@tauri-apps/plugin-dialog` – native file/confirm dialogs  
  - `@tauri-apps/plugin-fs` – AppConfig file operations (`filamentLibrary.json`, etc.)  
  - `tauri-plugin-store` – structured data storage (`settings`, `printers`, `offers`)  
  - `tauri-plugin-log` – internal logging, Console module  

### Data Flow (High Level)
1. **UI Event** → Redux-like local state (`useState`, `useReducer`, custom store)  
2. **Persist** → auto-save Tauri store / fs (debounced)  
3. **Sync** → filament library updates, deduplication, watchers  

---

## 🧩 Modules and Features

| Module | Main Features | Notes |
|--------|---------------|-------|
| **Home / Dashboard** | Statistics, timelines, export | SVG/PNG/JSON export, timeframe switcher, derive stats |
| **Filaments** | Library + custom filaments | Multicolor, duplicate detection, CSV import |
| **Printers / AMS** | Printer management | AMS slot 0-4, watt, usage cost, drag & drop |
| **Calculator** | Cost breakdown, template management | Filament/Time/Profit parameterization, template saving |
| **Offers** | Quote pipeline | Versioning, status log, PDF export (brand header) |
| **Settings** | Themes, animations, backup, import/export | Custom theme editor, micro-interaction styles |
| **Console** | Log viewer | Tauri log + window error + unhandled promise rejection |

### Highlighted UI Solutions
- **Popup forms** (add/edit), modal-based confirmations  
- **Skeleton screens** – `frontend/src/components/LoadingSkeleton.tsx`  
- **Framer Motion** – animated transformations, hover-lift helper (`utils/animations.tsx`)  
- **Responsive layout** – sidebar + responsive grid (inline style system)

---

## 💾 Data Model & Persistence

### Main Files
- `filamentLibrary.json` – persistent filament library (AppConfig)  
- `update_filamentLibrary.json` – update package read at app startup (duplicate filtering)  
- Tauri store (JSON) – `settings`, `printers`, `filaments`, `offers`  
- Backup/restore module – full dump / restore (Settings > Data Management)

### Auto-save and Merge Logic
- Debounced save (30 seconds), `defaultSettings.autosave`  
- CSV import pipeline: HU/DE labels, "No code" → multicolor  
- Duplicate deletion UI: extra labeling and bulk cleanup  

### Data Structures
- `types.ts` – `Filament`, `Printer`, `Offer`, `Settings`, `AnimationSettings`, `RawLibraryEntry`, etc.  
- `filamentLibrary.ts` – normalization, ID generation, dedupe, index management  

---

## 🎨 Themes, Animations, UX

- **Theme Presets** – Light, Dark, Blue, Green, Purple, Orange, Gradient, Neon, Cyberpunk, Sunset, Ocean, Forest, Pastel, Charcoal, Midnight  
- **Custom Theme Builder** – palette, gradient, description, export/import, sharing, duplication  
- **Animation Panel** – page transitions (flip/parallax), micro-interactions (subtle/expressive/playful), feedback (pulse/emphasis), skeleton  
- **Multicolor Support** – gradient swatch, `ColorMode` (solid/multicolor)  
- **Localization** – HU/EN/DE full translation, plus prepared FR/IT/ES/PL/CS/SK/PT-BR/zh-CN files (English fallback), automatic translation via MyMemory API (`convert-filament-csv.mjs`)

---

## 🧱 Installation & Prerequisites

### General
```bash
rustup default stable
npm install -g pnpm
cargo install tauri-cli
```

### Platform-Specific
- **macOS** – `xcode-select --install`  
- **Linux** – `sudo apt install libwebkit2gtk-4.1-dev ...` (see README)  
- **Windows** – Visual Studio Build Tools + Windows SDK, `winget install tauri-cli?` (optional)

---

## 👩‍💻 Developer Workflow

```bash
# first installation
pnpm install --prefix frontend

# frontend dev mode
cd frontend
pnpm dev

# tauri dev build
cd ../src-tauri
cargo tauri dev
```

### Scripts
- `build-frontend.sh` – quick frontend build  
- `dev-frontend.sh` – start frontend dev server  
- `run-frontend-dev.sh` – combined workflow (if needed)

### Lint & Format
- `pnpm lint` – ESLint (React, TS, hooks)  
- `cargo fmt` / `cargo clippy` – Rust side (currently manual)  
- `read_lints` IDE integration – quick module-specific check

---

## 🧭 User Guide

1. **Printer Configuration**  
   New printer → name, type, power, AMS slot → save  
2. **Filament Import/Edit**  
   Browse library, multicolor marking, CSV update import (`update_filamentLibrary.json`)  
3. **Calculation**  
   Filament amount (grams), time, drying, price/kg → cost breakdown  
4. **Quote Pipeline**  
   Save → version tracking → status changes (dashboard log)  
5. **PDF Export**  
   Download → native dialog → PDF contains logo, brand block, filament images  
6. **Statistics / Report**  
   Timeframe switch, export JSON/CSV, chart export SVG/PNG  
7. **Settings & Backup**  
   Themes, animations, import/export, save/restore data

---

## 📦 Build and Release Management

- **Branch Strategy**  
  - `main`: stable release  
  - `beta`: active development, automatic GitHub Actions build  

- **Release Process**  
  1. Version bump (`frontend/src/utils/version.ts`, `src-tauri/Cargo.toml`, `tauri.conf.json`)  
  2. README / Wiki update (release notes)  
  3. `pnpm lint` + manual smoke test  
  4. Commit (`release: bump version to X.Y.Z`)  
  5. Push `beta` → GitHub Actions build  
  6. Merge `main` + GitHub Release (if stable release)  

- **Output**  
  - macOS `.app` + `.dmg`  
  - Windows `.msi`  
  - Linux `.deb` and `AppImage`

---

## 🛠 Troubleshooting & FAQ

| Problem | Solution |
|---------|----------|
| **Cannot write `filamentLibrary.json`** | Check Tauri capabilities (`src-tauri/capabilities/default.json`) and AppConfig path |
| **`fs.exists not allowed` error** | Add `@tauri-apps/plugin-fs` permissions (read/write text file) |
| **SSL error during git push** | Configure local cert chain or `required_permissions: ['all']` for the operation |
| **Too much user data** | Export + backup then purge store (`settings > Reset / Restore defaults`) |
| **Linter errors** | Project-level `any` warnings in known backlog, run `read_lints` before module commit |

---

## 🔐 Security, Permissions, Data Management

- **Tauri Capabilities** – minimized fs permissions: AppConfig path-specific read/write (filament library), store plugin  
- **Saved Data Location**  
  - macOS: `~/Library/Application Support/com.lekszikov.3dprintercalcapp/`  
  - Linux: `~/.local/share/com.lekszikov.3dprintercalcapp/`  
  - Windows: `%APPDATA%\com.lekszikov.3dprintercalcapp\`  
- **Commercial License** – MIT, but commercial use only with written permission  
- **Privacy Focus** – no network data transmission built-in, CSV import manual

---

## 🗺 Roadmap, Ideas, Excluded Features

- **Suggestions** – see [`FEATURE_SUGGESTIONS.md`](../FEATURE_SUGGESTIONS.md)  
- **Excluded Features** – see [`EXCLUDED_FEATURES.md`](../EXCLUDED_FEATURES.md)  
- Priorities: animation expansion, theme customization, data import pipeline development (completed in v0.4.98)  
- Next focus could be: additional statistics, mobile-friendly layout (currently desktop-focused)

---

## 🤝 Contributing and Code Quality

- **Workflow** – fork → feature branch → lint/test → PR  
- **Code Style** – TypeScript strict, preferred type definitions, inline style theme usage  
- **Hook Conventions** – `useMemo`, `useCallback`, `useEffect` dependency list compliance  
- **Logging** – `Console` module monitors, don't leave `console.log` in production modules  
- **Review Checklist**  
  - UI regression checks (especially Settings/Filaments)  
  - Theme and animation compatibility (gradient vs. solid)  
  - Persistence (backups / JSON parse)  
- **Issue Template** – bug report: OS, version, reproduction, log, screenshot (if available)

---

## 📝 License, Related Documents

- **License**: MIT (commercial use with permission)  
  Owner: **Lekszikov Miklós (LexyGuru)**
- **Contact**: GitHub Issues, Discussions

### Additional Documents
- [README.md](../README.md) – detailed feature list, installation, version history  
- [BUILD.md](../BUILD.md) – platform-specific build guide  
- [HOW_TO_BUILD_APP.md](../HOW_TO_BUILD_APP.md) – standalone release creation  
- [VERSIONING.md](../VERSIONING.md) – versioning, release process  
- [CREATE_FIRST_RELEASE.md](../CREATE_FIRST_RELEASE.md) – GitHub release steps  

---

**Version**: `0.5.56`
If you have questions or find a bug, open an issue in the GitHub repository! 🎯

---

<a name="deutsch-version"></a>
## 🇩🇪 Deutsch Version

*Deutsche Übersetzung folgt in Kürze...*

<a name="español-version"></a>
## 🇪🇸 Español Version

*Traducción al español próximamente...*

<a name="italiano-version"></a>
## 🇮🇹 Italiano Version

*Traduzione italiana in arrivo...*

<a name="polski-version"></a>
## 🇵🇱 Polski Version

*Polskie tłumaczenie wkrótce...*

<a name="čeština-version"></a>
## 🇨🇿 Čeština Version

*Český překlad brzy...*

<a name="slovenčina-version"></a>
## 🇸🇰 Slovenčina Version

*Slovenský preklad čoskoro...*

<a name="português-version"></a>
## 🇵🇹 Português Version

*Tradução em português em breve...*

<a name="français-version"></a>
## 🇫🇷 Français Version

*Traduction française à venir...*

<a name="中文版本"></a>
## 🇨🇳 中文版本

*中文翻译即将推出...*

