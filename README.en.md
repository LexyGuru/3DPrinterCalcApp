# 🖨️ 3D Printer Calculator App

> **🌍 Language Selection**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

A modern desktop application for calculating 3D printing costs. Built with Tauri v2, React frontend, and Rust backend.

## ✨ Features

- 📊 **Cost Calculation** - Automatic calculation of filament, electricity, drying, and wear costs
- 🧵 **Filament Management** - Add, edit, delete filaments (brand, type, color, price)
- 🖨️ **Printer Management** - Manage printers and AMS systems
- 💰 **Profit Calculation** - Selectable profit percentage (10%, 20%, 30%, 40%, 50%)
- 📄 **Quotes** - Save, manage, and export PDF quotes (customer name, contact, description)
- 📅 **Calendar Integration** - Set print due dates for offers, calendar view with accepted/completed/rejected offers, status indicators (accepted ✅, rejected ❌, completed ✔️), upcoming prints list (today and tomorrow), overdue prints notification
- 🧠 **Filter Presets** - Save quote filters, apply quick presets, date/time-based automatic filters
- 🗂️ **Status Dashboard** - Status cards, quick filters, and timeline of recent status changes
- 📝 **Status Notes** - Every status change with optional notes and history logging
- 👁️ **PDF Preview & Templates** - Built-in PDF preview, selectable templates, and company branding blocks
- 🎨 **Filament Color Library** - Over 12,000 factory colors with brand and type-based selectable panels
- 💾 **Filament Library Editor** - Modal-based add/edit, duplicate warnings, and persistent save to `filamentLibrary.json`
- 🖼️ **Filament Images in PDF** - Display filament logos and color swatches in generated PDFs
- 🧾 **G-code Import & Draft Creation** - Load G-code/JSON exports (Prusa, Cura, Orca, Qidi) from modal in calculator, with detailed summary and automatic quote draft generation
- 📈 **Statistics** - Summary dashboard for filament consumption, revenue, profit
- 👥 **Customer Database** - Manage customers with contact information, company details, and offer statistics
- 🔒 **Customer Data Encryption** - AES-256-GCM encryption for customer data, GDPR/EU compliant data protection, optional password protection
- 📊 **Price History & Trends** - Track filament price changes over time with charts and statistics
- 🌍 **Multilingual** - Full translation in Hungarian, English, German, French, Simplified Chinese, Czech, Spanish, Italian, Polish, Portuguese, Slovak, Ukrainian, and Russian (13 languages, 850+ translation keys per language)
- 💱 **Multiple Currencies** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 currencies)
- 🔄 **Auto Updates** - Checks GitHub Releases for new versions
- 🧪 **Beta Versions** - Beta branch and beta build support
- ⚙️ **Beta Check** - Configurable beta version checking
- 🎨 **Responsive Layout** - All application elements dynamically adapt to window size
- ✅ **Confirmation Dialogs** - Confirmation request before deletion
- 🔔 **Toast Notifications** - Notifications after successful operations
- 🔍 **Search & Filter** - Search filaments, printers, and quotes
- 🔎 **Online Price Comparison** - One-click Google/Bing search for selected filament, price instantly updatable
- 📋 **Duplication** - Easy quote duplication
- 🖱️ **Drag & Drop** - Reorder quotes, filaments, and printers by dragging
- 📱 **Context Menus** - Right-click menus for quick actions (edit, delete, duplicate, export)
- 🍎 **Platform-Specific Features** - macOS Dock badge, native notifications, system tray integration

## 📸 Screenshots

The application includes:
- Home dashboard with statistics
- Filament management
- Printer management
- Cost calculation calculator
- Quotes list and detailed view
- Status dashboard and timeline
- PDF export and built-in preview

## 🚀 Installation

### Prerequisites

- **Rust**: [Install Rust](https://rustup.rs/)
- **Node.js**: [Install Node.js](https://nodejs.org/) (version 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### macOS Specific

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Linux Specific (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Windows Specific

- Visual Studio Build Tools (C++ build tools)
- Windows SDK

## 📦 Building

### Running in Development Mode

```bash
cd src-tauri
cargo tauri dev
```

### Production Build (Creating Standalone Application)

```bash
cd src-tauri
cargo tauri build
```

The standalone application will be located at:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` or `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Beta Building

The project includes a `beta` branch configured for separate builds:

```bash
# Switch to beta branch
git checkout beta

# Local beta build
./build-frontend.sh
cd src-tauri
cargo tauri build
```

The beta build automatically sets the `VITE_IS_BETA=true` variable, so "BETA" appears in the menu.

**GitHub Actions**: When pushing to the `beta` branch, the `.github/workflows/build-beta.yml` workflow automatically runs, building the beta version for all three platforms.

Detailed guide: [BUILD.md](BUILD.md) and [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Development

### Project Structure

```
3DPrinterCalcApp/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/        # Helper functions
│   │   └── types.ts      # TypeScript types
│   └── package.json
├── src-tauri/         # Rust backend
│   ├── src/           # Rust source code
│   ├── Cargo.toml     # Rust dependencies
│   └── tauri.conf.json # Tauri configuration
└── README.md
```

### Frontend Development

```bash
cd frontend
pnpm install
pnpm dev
```

### Dependencies

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Tauri v2
- tauri-plugin-store (data storage)
- tauri-plugin-log (logging)

## 📖 Usage

1. **Add Printer**: Printers menu → Add new printer
2. **Add Filament**: Filaments menu → Add new filament
3. **Calculate Cost**: Calculator menu → Select printer and filaments
4. **Save Quote**: Click "Save as quote" button in calculator
5. **PDF Export**: Quotes menu → Select a quote → PDF export
6. **Check Beta Versions**: Settings menu → Enable "Check for beta updates" option

## 🔄 Version Management and Updates

The application automatically checks GitHub Releases for new versions:

- **On Startup**: Automatically checks for updates
- **Every 5 minutes**: Automatically rechecks
- **Notification**: If a new version is available, a notification appears in the top right corner

### Beta Version Checking

To check for beta versions:

1. Go to **Settings** menu
2. Enable the **"Check for beta updates"** option
3. The application immediately checks for beta versions
4. If a newer beta version is available, a notification appears
5. Click the "Download" button to go to the GitHub Release page

**Example**: If you're using a RELEASE version (e.g., 0.1.0) and enable beta checking, the application finds the latest beta version (e.g., 0.2.0-beta) and notifies you if there's a newer one.

Detailed guide: [VERSIONING.md](VERSIONING.md)

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Data Storage**: Tauri Store Plugin (JSON files)
- **Styling**: Inline styles (commonStyles)
- **i18n**: Custom translation system
- **CI/CD**: GitHub Actions (automatic builds for macOS, Linux, Windows)
- **Version Management**: GitHub Releases API integration

## 📝 License

This project is licensed under **MIT license**, however **commercial use requires permission**.

Full application copyright: **Lekszikov Miklós (LexyGuru)**

- ✅ **Personal and educational use**: Permitted
- ❌ **Commercial use**: Only with explicit written permission

Details: [LICENSE](LICENSE) file

## 👤 Author

Lekszikov Miklós (LexyGuru)

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - The cross-platform desktop app framework
- [React](https://react.dev/) - The frontend framework
- [Vite](https://vitejs.dev/) - The build tool

## 📚 Additional Documentation

- [BUILD.md](BUILD.md) - Detailed build guide for all platforms
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Creating standalone application
- [VERSIONING.md](VERSIONING.md) - Version management and updates
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Creating first GitHub Release

## 🌿 Branch Structure

- **`main`**: Stable release versions (RELEASE build)
- **`beta`**: Beta versions and development (BETA build)

When pushing to the `beta` branch, the GitHub Actions workflow automatically runs, building the beta version.

## 📋 Version History

For detailed version history and changelog, please see [RELEASE.en.md](RELEASE.en.md).

---

**Version**: 3.0.2

If you have any questions or find a bug, please open an issue in the GitHub repository!

