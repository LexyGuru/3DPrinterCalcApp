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
- 🎨 **Filament Color Library** - Over 2000 factory colors with brand and type-based selectable panels
- 💾 **Filament Library Editor** - Modal-based add/edit, duplicate warnings, and persistent save to `filamentLibrary.json`
- 🖼️ **Filament Images in PDF** - Display filament logos and color swatches in generated PDFs
- 🧾 **G-code Import & Draft Creation** - Load G-code/JSON exports (Prusa, Cura, Orca, Qidi) from modal in calculator, with detailed summary and automatic quote draft generation
- 📈 **Statistics** - Summary dashboard for filament consumption, revenue, profit
- 👥 **Customer Database** - Manage customers with contact information, company details, and offer statistics
- 📊 **Price History & Trends** - Track filament price changes over time with charts and statistics
- 🌍 **Multilingual** - Full translation in Hungarian, English, German, French, Simplified Chinese, Czech, Spanish, Italian, Polish, Portuguese, Slovak, Ukrainian, and Russian (14 languages, 850+ translation keys per language)
- 💱 **Multiple Currencies** - EUR, HUF, USD
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

## 📋 Changelog

### v1.1.0 (2025) - 🚀 Feature Update

- 🔍 **Global Search Extended** - Enhanced search functionality:
  - Search offers by customer name, ID, status, and date
  - Search filaments from database (filamentLibrary) by brand, type, and color
  - Add filaments to saved list with one click from search results
  - Improved search results with type indicators
- 💀 **Skeleton Loading System** - Spectacular loading experience:
  - Animated skeleton components with shimmer effects
  - Progress tracking with visual indicators
  - Loading steps with checkmarks for completed steps
  - Smooth fade-in transitions
  - Theme-aware skeleton colors
  - Page-specific skeleton loaders
- 🎨 **UI/UX Improvements**:
  - Better loading states
  - Improved user feedback during data loading
  - Enhanced visual experience

### v1.0.0 (2025) - 🎉 First Stable Release

- 🎨 **Modern UI Components** - Complete UI overhaul with modern components:
  - Empty State component for better user experience
  - Card component with hover effects
  - Progress Bar component for PDF export/import operations
  - Tooltip component with theme integration
  - Breadcrumb navigation for clear page hierarchy
- ⚡ **Quick Actions** - Header quick action buttons for faster workflow:
  - Quick add buttons for Filaments, Printers, and Customers
  - Dynamic buttons based on active page
  - Keyboard shortcuts integration
- 🔍 **Global Search (Command Palette)** - Powerful search functionality:
  - `Ctrl/Cmd+K` to open global search
  - Search pages and quick actions
  - Keyboard navigation (↑↓, Enter, Esc)
  - Theme-aware styling
- ⏪ **Undo/Redo Functionality** - History management for Filaments:
  - `Ctrl/Cmd+Z` for undo
  - `Ctrl/Cmd+Shift+Z` for redo
  - Visual undo/redo buttons in UI
  - 50-step history support
- ⭐ **Favorite Filaments** - Mark and filter favorite filaments:
  - Star icon to toggle favorite status
  - Filter to show only favorites
  - Persistent favorite state
- 📦 **Bulk Operations** - Efficient bulk management:
  - Checkbox selection for multiple filaments
  - Select all / Deselect all functionality
  - Bulk delete with confirmation dialog
  - Visual selection indicators
- 🎨 **Modal Dialogs** - Modern modal experience:
  - Blurred background modals for add/edit forms
  - Fixed-size input fields
  - Escape key to close
  - Smooth animations with framer-motion
- ⌨️ **Keyboard Shortcuts** - Enhanced shortcut system:
  - Customizable keyboard shortcuts
  - Shortcut help dialog (`Ctrl/Cmd+?`)
  - Edit shortcuts with key capture
  - Persistent shortcut storage
- 📝 **Logging System** - Comprehensive logging:
  - Separate log files for frontend and backend
  - Platform-independent log directory resolution
  - Automatic log rotation
  - Console integration
- 🔔 **Notification Improvements** - Better notification system:
  - Customer name in offer deletion notifications
  - Cross-platform notification support
  - Improved error handling
- 🎯 **UI/UX Improvements**:
  - Fixed input field sizes
  - Better form layouts
  - Improved theme integration
  - Enhanced accessibility

### v0.6.0 (2025)

#### 🐛 Bug Fixes
- **Logging optimization**: Reduced excessive and duplicate logging
  - Informational logs only appear in development mode (DEV)
  - Errors still log in production builds
  - FilamentLibrary initialization happens silently
- **False warning fixes**: Filament color resolution only warns when library is already loaded and color still not found
  - Prevents false warnings during async library loading
  - Warnings only appear for real issues
- **Update Checker duplication fix**: Removed duplicate update check calls
- **Keyboard shortcut logging fix**: Only logs when shortcut exists, skips invalid combinations

#### ⚡ Performance Improvements
- Store operations logging optimized (DEV mode only)
- Fewer console operations in production builds
- Cleaner console output during development

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

### v1.1.0 (2025) - 🚀 Feature Update

- 🔍 **Global Search Extended** - Enhanced search functionality
- 💀 **Skeleton Loading System** - Spectacular loading experience
- 🎨 **UI/UX Improvements** - Better loading states and visual experience

### v1.0.0 (2025) - 🎉 First Stable Release

- 🎨 **Modern UI Components** - Complete UI overhaul with modern components
- ⚡ **Quick Actions** - Header quick action buttons
- 🔍 **Global Search** - Powerful search functionality
- ⏪ **Undo/Redo Functionality** - History management
- ⭐ **Favorite Filaments** - Mark and filter favorite filaments
- 📦 **Bulk Operations** - Efficient bulk management
- 🎨 **Modal Dialogs** - Modern modal experience
- ⌨️ **Keyboard Shortcuts** - Enhanced shortcut system
- 📝 **Logging System** - Comprehensive logging
- 🔔 **Notification Improvements** - Better notification system

### v0.6.0 (2025)

- 👥 **Customer Database** - Complete customer management system with:
  - Add, edit, delete customers
  - Contact information (email, phone)
  - Company details (optional)
  - Address and notes
  - Customer statistics (total offers, last offer date)
  - Search functionality
  - Integration with Calculator for quick customer selection
- 📊 **Price History & Trends** - Track filament price changes:
  - Automatic price history tracking when filament prices are updated
  - Price trends visualization with SVG charts
  - Price statistics (current, average, min, max prices)
  - Trend analysis (increasing, decreasing, stable)
  - Price history table with detailed change information
  - Significant price change warnings (10%+ changes)
  - Price history display in Filaments component during editing
- 🔧 **Improvements**:
  - Enhanced Calculator with customer selection dropdown
  - Price history integration in Filament editing form
  - Improved data persistence for customers and price history

### v0.5.58 (2025)
- 🌍 **Ukrainian and Russian Language Support** – Added full translation support for Ukrainian (uk) and Russian (ru) languages:
  - Complete translation files with all 813 translation keys for both languages
  - Ukrainian locale support (uk-UA) for date/time formatting
  - Russian locale support (ru-RU) for date/time formatting
  - Updated all README files with new languages in language menu
  - Language count updated from 12 to 14 languages
  - Created README.uk.md and README.ru.md documentation files

### v0.5.57 (2025)
- 🍎 **Platform-Specific Features** – Native platform integration for macOS, Windows, and Linux:
  - **macOS**: Dock badge support (numeric/textual badge on app icon), native Notification Center integration with permission management
  - **Windows**: Native Windows notifications
  - **Linux**: System tray integration, desktop notifications support
  - **All Platforms**: Native notification API integration with permission request system, platform detection and automatic feature enabling
- 🔔 **Notification System** – Native notification support with permission management:
  - Permission request system for macOS notifications
  - Notification test buttons in Settings
  - Automatic permission checking and status display
  - Platform-specific notification handling (macOS Notification Center, Windows Action Center, Linux desktop notifications)

### v0.5.56 (2025)
- 🌍 **Complete Language Translations** – Completed full translations for 6 remaining language files: Czech (cs), Spanish (es), Italian (it), Polish (pl), Portuguese (pt), and Slovak (sk). Each file contains all 813 translation keys, so the application is now fully supported in these languages.
- 🔒 **Tauri Permissions Fix** – The `update_filamentLibrary.json` file is now explicitly enabled for read, write, and create operations in the Tauri capabilities file, ensuring filament library updates work reliably.

### v0.5.55 (2025)
- 🧵 **Quote Editing Enhancement** – Saved quotes now allow direct printer selection or modification, with costs automatically recalculated along with filament changes.
- 🧮 **Accuracy and Logging** – Detailed logging helps track cost calculation steps (filament, electricity, drying, usage), making it easier to find errors in imported G-code files.
- 🌍 **Translation Additions** – New i18n keys and labels added for printer selector, ensuring consistent editor UI in all supported languages.
- 📄 **Documentation Update** – README expanded with new features description, v0.5.55 release added to version history.

### v0.5.11 (2025)
- 🗂️ **Language Modularization** – Expanded the app with translation files organized into a new `languages/` directory, making it easier to add new languages and manage existing texts.
- 🌍 **Unified UI Translations** – The slicer import interface now works from the central translation system, with all buttons, error messages, and summaries localized.
- 🔁 **Language Selector Update** – In Settings, the language selector loads based on discovered language files, so in the future it's enough to add a new language file.
- 🌐 **New Language Foundations** – Translation files prepared for French, Italian, Spanish, Polish, Czech, Slovak, Brazilian Portuguese, and Simplified Chinese (with English fallback), actual translations can be easily filled in.

### v0.5.0 (2025)
- 🔎 **Filament Price Comparison Button** – Every custom filament now has a magnifying glass icon that opens Google/Bing search based on brand/type/color, providing quick links to current prices.
- 💶 **Decimal Price Support** – Filament price fields now accept decimals (14.11 € etc.), input is automatically validated and formatted when saved.
- 🌐 **Reversed Search Fallback** – If Tauri shell cannot open the browser, the application automatically opens a new tab, so search works on all platforms.

### v0.4.99 (2025)
- 🧾 **Built-in G-code Import in Calculator** – New modal `SlicerImportModal` at the top of the calculator that loads G-code/JSON exports with one click, transferring print time, filament quantity, and creates a quote draft.
- 📊 **Slicer Data from Header** – G-code header `total filament weight/length/volume` values automatically take over summaries, accurately handling color change losses.

### v0.4.98 (2025)
- 🧵 **Multicolor Filament Support** – Filament library and management UI now separately mark multicolor (rainbow/dual/tricolor) filaments with notes and rainbow preview.
- 🌐 **Automatic Translation on CSV Import** – Color names imported from external database receive Hungarian and German labels, keeping the color selector multilingual without manual editing.
- 🔄 **Update Library Merge** – The `update_filamentLibrary.json` file content is automatically deduplicated and merged with the existing library on startup, without overwriting user modifications.
- 📁 **CSV Converter Update** – The `convert-filament-csv.mjs` script no longer overwrites the persistent `filamentLibrary.json`, instead creates an update file and generates multilingual labels.
- ✨ **Animation Experience Tuning** – New page transition options (flip, parallax), microinteraction style selector, pulsing feedback, filament library skeleton list and fine-tuned card hover effects.
- 🎨 **Theme Workshop Extensions** – Four new built-in themes (Forest, Pastel, Charcoal, Midnight), instant duplication of active theme for custom editing, improved gradient/contrast handling and simplified sharing process.

### v0.4.0 (2025)
- 🧵 **Filament Database Integration** – 2,000+ factory colors from built-in JSON library (filamentcolors.xyz snapshot), organized by brand and material
- 🪟 **Fixed Size Selector Panels** – Button-opened, searchable, scrollable brand and type lists that exclude each other, making the form more transparent
- 🎯 **Color Selector Improvements** – When library items are recognized, finish and hex code are automatically set, separate fields available when switching to custom mode
- 💾 **Filament Library Editor** – New settings tab with popup form, duplicate handling and Tauri FS-based persistent `filamentLibrary.json` saving
- 📄 **Documentation Update** – New bullet in main feature list for filament color library, README/FEATURE_SUGGESTIONS cleanup

### v0.3.9 (2025)
- 🔍 **Quote Filter Presets** – Saveable, nameable filter settings, default quick presets (Today, Yesterday, Weekly, Monthly etc.) and one-click apply/delete
- 📝 **Status Change Notes** – New modal for quote status modification with optional note that is stored in status history
- 🖼️ **PDF Export Extension** – Images stored with filaments appear in PDF table, print-optimized styling
- 🧾 **Company Branding Data Sheet** – Company name, address, tax ID, bank account, contact and logo upload; automatically included in PDF header
- 🎨 **PDF Template Selector** – Three styles (Modern, Minimalist, Professional) to choose from for quote appearance
- 👁️ **Built-in PDF Preview** – Separate button at quote details for instant visual check before export
- 📊 **Status Dashboard** – Status cards with summary, quick status filters and timeline of recent status changes at quotes
- 📈 **Statistical Charts** – Revenue/cost/profit trend chart, filament distribution pie chart, revenue per printer bar chart, all exportable in SVG/PNG format, and can also be saved to PDF

### v0.3.8 (2025)
- 🐛 **Report Number Formatting Fix** - Formatting to 2 decimal places in reports:
  - Main statistics cards (Revenue, Expenses, Profit, Quotes): `formatNumber(formatCurrency(...), 2)`
  - Values above charts: `formatNumber(formatCurrency(...), 2)`
  - Detailed statistics (Average profit/quote): `formatNumber(formatCurrency(...), 2)`
  - Now consistent with home page (e.g. `6.45` instead of `6.45037688333333`)
- 🎨 **Settings Tab Navigation Fix** - Background and text color improvements:
  - Tab navigation section background: `rgba(255, 255, 255, 0.85)` for gradient themes + `blur(10px)`
  - Tab button backgrounds: Active `rgba(255, 255, 255, 0.9)`, inactive `rgba(255, 255, 255, 0.7)` for gradient themes
  - Tab button text color: `#1a202c` (dark) for gradient themes for readability
  - Hover effects: `rgba(255, 255, 255, 0.85)` for gradient themes
  - Backdrop filter: `blur(8px)` for tab buttons, `blur(10px)` for navigation section

### v0.3.7 (2025)
- 🎨 **Design Modernization** - Complete visual transformation with animations and new themes:
  - New themes: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 new modern themes)
  - Framer Motion animations integrated (fadeIn, slideIn, stagger, hover effects)
  - Glassmorphism effect for gradient themes (blur + transparent background)
  - Neon glow effect for neon/cyberpunk themes
  - Modernized cards and surfaces (larger padding, rounded corners, better shadows)
- 🎨 **Color Improvements** - Better contrast and readability for all themes:
  - Dark text (#1a202c) on white/light background for gradient themes
  - Input fields, labels, h3 colorization improved in all components
  - Consistent color handling on all pages (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Text shadow added for gradient themes for better readability
- 📊 **Table Style Improvements** - More blurred background and better text contrast:
  - Background color: rgba(255, 255, 255, 0.85) for gradient themes (previously 0.95)
  - Backdrop filter: blur(8px) for more blurred effect
  - Text color: #333 (dark gray) for gradient themes for better readability
  - Cell backgrounds: rgba(255, 255, 255, 0.7) for more blurred effect
- 🎨 **Card Background Color Improvements** - More blurred background, better readability:
  - Background color: rgba(255, 255, 255, 0.75) for gradient themes (previously 0.95)
  - Backdrop filter: blur(12px) for stronger blurring
  - Opacity: 0.85 for matte effect
  - Text color: #1a202c (dark) for gradient themes
- 📈 **Home Page Modernization** - Weekly/monthly/yearly statistics and period comparison:
  - Period comparison cards (Weekly, Monthly, Yearly) with colored accent bars
  - StatCard components modernized (icons with colored backgrounds, accent bars)
  - Summary section arranged in cards with icons
  - Period Comparison section added
- 🐛 **Date Filter Fix** - More accurate period filtering:
  - Time reset (00:00:00) for accurate comparison
  - Upper limit set (today is included)
  - Weekly: last 7 days (today included)
  - Monthly: last 30 days (today included)
  - Yearly: last 365 days (today included)
- 🎨 **Sidebar Modernization** - Icons, glassmorphism, neon glow effects
- 🎨 **ConfirmDialog Modernization** - Theme prop added, harmonized coloring

### v0.3.6 (2025)
- 🎨 **Settings UI Reorganization** - Tab system (General, Appearance, Advanced, Data Management) for better UX and cleaner navigation
- 🌐 **Translation Improvements** - All hardcoded Hungarian text translated in all components (HU/EN/DE):
  - Calculator: "3D printing cost calculation"
  - Filaments: "Manage and edit filaments"
  - Printers: "Manage printers and AMS systems"
  - Offers: "Manage and export saved quotes"
  - Home: Statistics titles, summary, CSV export labels (hour/Std/hrs, pcs/Stk/pcs)
  - VersionHistory: "No version history available"
- 💾 **Version History Cache System** - Physical save to localStorage, GitHub check every 1 hour:
  - Checksum-based change detection (only downloads on new releases)
  - Separate cache per language (Hungarian/English/German)
  - Fast language switching from cache (no re-translation)
  - Automatic cache invalidation on new release
- 🌐 **Smart Translation** - Only translates new releases, uses old translations from cache:
  - Cache validation (don't cache if same text)
  - MyMemory API fallback if translation fails
  - Error counter auto-reset (resets after 5 minutes)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate Removed** - Only MyMemory API usage (400 errors eliminated, GET request, no CORS)
- 🔄 **Retry Button Refactoring** - Simpler trigger mechanism with useEffect
- 🐛 **Build Error Fixes** - JSX indentation issues fixed (Settings.tsx Export/Import section)

### v0.3.5 (2025)
- ✅ **MyMemory API Integration** - Free translation API instead of LibreTranslate
- ✅ **GitHub Releases Page Opening** - Button to open GitHub releases page on rate limit
- ✅ **Rate Limit Error Handling Improvement** - Clear error messages and retry button
- 🐛 **Build Error Fixes** - Unused imports removed (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Input Validation Enhancement** - Central validation utility created and integrated into Calculator, Filaments, Printers components
- ✅ **Validation Error Messages** - Multilingual (HU/EN/DE) error messages with toast notifications
- ✅ **Performance Optimization** - Lazy loading components (code splitting), useMemo and useCallback optimization
- ✅ **Platform-Specific Initialization** - macOS, Windows, Linux platform-specific initialization basics
- 🐛 **Build Error Fix** - Printers.tsx context menu functions added

### v0.3.3 (2025)
- 🖱️ **Drag & Drop Features** - Reorder quotes, filaments and printers by dragging
- 📱 **Context Menus** - Right-click menus for quick actions (edit, delete, duplicate, PDF export)
- 🎨 **Visual Feedback** - Opacity and cursor change during drag & drop
- 🔔 **Toast Notifications** - Notifications after reordering
- 🐛 **Build Error Fix** - Calculator.tsx theme.colors.error -> theme.colors.danger fix

### v0.3.2 (2025)
- 📋 **Template Features** - Save and load calculations as templates in Calculator component
- 📜 **History/Versioning for Quotes** - Quote versioning, view history, track changes
- 🧹 **Duplication Fix** - Duplicate CSV/JSON export/import functions removed from Filaments and Printers components (remained in Settings)

### v0.3.1 (2025)
- ✅ **Input Validation Enhancement** - Negative numbers disabled, maximum values set (filament weight, print time, power, etc.)
- 📊 **CSV/JSON Export/Import** - Bulk export/import of filaments and printers in CSV and JSON format
- 📥 **Import/Export Buttons** - Easy access to export/import functions on Filaments and Printers pages
- 🎨 **Empty States Improvement** - Informative empty states displayed when there is no data

### v0.3.0 (2025)
- ✏️ **Quote Editing** - Edit saved quotes (customer name, contact, description, profit percentage, filaments)
- ✏️ **Edit Filaments in Quote** - Modify, add, delete filaments within the quote
- ✏️ **Edit Button** - New edit button next to delete button in quotes list
- 📊 **Statistics Export Function** - Export statistics in JSON or CSV format from Home page
- 📈 **Report Generation** - Generate weekly/monthly/yearly/all reports in JSON format with period filtering
- 📋 **Version History Display** - View version history in settings, GitHub Releases API integration
- 🌐 **GitHub Releases Translation** - Automatic translation Hungarian -> English/German (MyMemory API)
- 💾 **Translation Cache** - localStorage cache for translated release notes
- 🔄 **Dynamic Version History** - Beta and release versions displayed separately
- 🐛 **Bugfixes** - Unused variables removed, code cleanup, linter errors fixed

### v0.2.55 (2025)
- 🖥️ **Console/Log Function** - New Console menu item for debugging and viewing logs
- 🖥️ **Console Setting** - Can enable Console menu item display in settings
- 📊 **Log Collection** - Automatic recording of all console.log, console.error, console.warn messages
- 📊 **Global Error Recording** - Automatic recording of window error and unhandled promise rejection events
- 🔍 **Log Filtering** - Filter by level (all, error, warn, info, log, debug)
- 🔍 **Log Export** - Export logs in JSON format
- 🧹 **Log Deletion** - Delete logs with one button
- 📜 **Auto-scroll** - Automatic scrolling to new logs
- 💾 **Full Logging** - All critical operations logged (save, export, import, delete, PDF export, update download)
- 🔄 **Update Button Fix** - Download button now uses Tauri shell plugin, works reliably
- 🔄 **Update Logging** - Full logging of update check and download
- ⌨️ **Keyboard Shortcuts** - `Ctrl/Cmd+N` (new), `Ctrl/Cmd+S` (save), `Escape` (cancel), `Ctrl/Cmd+?` (help)
- ⌨️ **Keyboard Shortcuts macOS Fix** - Cmd vs Ctrl handling, capture phase event handling
- ⏳ **Loading States** - LoadingSpinner component for loading states
- 💾 **Backup and Restore** - Full data backup and restore with Tauri dialog and fs plugins
- 🛡️ **Error Boundaries** - React ErrorBoundary for application-level error handling
- 💾 **Auto Save** - Debounced auto-save with configurable interval (default 30 seconds)
- 🔔 **Notification Settings** - Toast notifications on/off and duration setting
- ⌨️ **Shortcut Help Menu** - List of keyboard shortcuts in modal window (`Ctrl/Cmd+?`)
- 🎬 **Animations and Transitions** - Smooth transitions and keyframe animations (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltips** - Contextual help for all important elements on hover
- 🐛 **React Render Error Fix** - Console logger async operation so it doesn't block rendering
- 🔧 **num-bigint-dig Update** - Updated to v0.9.1 (deprecation warning fix)

### v0.2.0 (2025)
- 🎨 **Theme System** - 6 modern themes (Light, Dark, Blue, Green, Purple, Orange)
- 🎨 **Theme Selector** - Selectable theme in settings, takes effect immediately
- 🎨 **Full Theme Integration** - All components (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) use themes
- 🎨 **Dynamic Colors** - All hard-coded colors replaced with theme colors
- 🎨 **Responsive Theme** - Quotes and Sidebar footer also use themes
- 💱 **Dynamic Currency Conversion** - Quotes now display in current settings currency (automatic conversion)
- 💱 **Currency Change** - Currency changed in settings immediately affects quote display
- 💱 **PDF Currency Conversion** - PDF export also created in current settings currency
- 💱 **Filament Price Conversion** - Filament prices also automatically converted

### v0.1.85 (2025)
- 🎨 **UI/UX Improvements**:
  - ✏️ Duplicate icons removed (Edit, Save, Cancel buttons)
  - 📐 Export/Import sections in 2-column layout (side by side)
  - 💾 Native save dialog used for PDF saving (Tauri dialog)
  - 📊 Toast notifications for PDF saving (success/error)
  - 🖼️ Application window size: 1280x720 (previously 1000x700)
- 🐛 **Bugfixes**:
  - Missing information added in PDF generation (customerContact, profit in separate line, revenue)
  - Translation keys added (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **PDF Export Improvements**:
  - Customer contact (email/phone) displayed in PDF
  - Profit calculation in separate line with profit percentage
  - Revenue (Total Price) in separate line, highlighted
  - Full cost breakdown in PDF

### v0.1.56 (2025)
- ✨ **Calculator Layout Improvements**: Filament cards overflow fixed, responsive flexbox layout
- ✨ **Cost Breakdown Responsive**: Now dynamically responds to window size changes
- 🐛 **Bugfix**: Content doesn't overflow window when adding filament
- 🐛 **Bugfix**: All Calculator elements properly respond to window size changes

### v0.1.55 (2025)
- ✨ **Confirmation Dialogs**: Confirmation requested before deletion (Filaments, Printers, Quotes)
- ✨ **Toast Notifications**: Notifications after successful operations (add, update, delete)
- ✨ **Input Validation**: Negative numbers disabled, maximum values set
- ✨ **Loading States**: Loading spinner on application startup
- ✨ **Error Boundary**: Application-level error handling
- ✨ **Search and Filter**: Search filaments, printers and quotes
- ✨ **Duplication**: Easy quote duplication
- ✨ **Collapsible Forms**: Filament and printer add forms are collapsible
- ✨ **Quote Extensions**: Customer name, contact and description fields added
- 🐛 **Console.log Cleanup**: No console.logs in production build
- 🐛 **Description Field Fix**: Long texts properly wrap.

---

**Version**: 1.0.0

If you have any questions or find a bug, please open an issue in the GitHub repository!

