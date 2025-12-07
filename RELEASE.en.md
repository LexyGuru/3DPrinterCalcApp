# 📋 Release Notes - 3DPrinterCalcApp

This document contains detailed changelog for all versions of the 3D Printer Calculator App.

---

## v3.0.2 (2025) - 🔧 Hotfix: Tutorial Fixes, Permissions, Factory Reset Logging

### 🐛 Bug Fixes

#### Tutorial Fixes
- **Tutorial data preservation** - If the tutorial has already run once, existing data is not deleted again
- **Tutorial expanded to 18 steps** - Added: Projects, Tasks, Calendar, Backup/Restore steps
- **Tutorial translation keys** - Missing translation keys added to all language files:
  - `tutorial.projects.title` and `tutorial.projects.description`
  - `tutorial.tasks.title` and `tutorial.tasks.description`
  - `tutorial.calendar.title` and `tutorial.calendar.description`

#### Permission Fixes
- **customers.json permissions** - Added permissions required for `customers.json` file deletion:
  - `fs:allow-remove` - File deletion enabled
  - `fs:allow-read-text-file` - File reading enabled
  - `fs:allow-write-text-file` - File writing enabled
  - `fs:allow-create` - File creation enabled

#### Factory Reset Logging
- **Backend log file writing** - Factory reset steps are now logged to the backend log file
- **Detailed logging** - Every factory reset step (including `customers.json` deletion) is logged in detail
- **Backend log deletion restored** - Backend log file is now deleted during factory reset

### 📝 Technical Details

- **Version updated**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.2`
- **Tutorial logic modified**: Decides whether to delete existing data based on `tutorialCompleted` flag
- **Backend log command added**: `write_backend_log` command created for factory reset logging
- **Capability file updated**: `customers.json` permissions added to all relevant scopes

---

## v3.0.1 (2025) - 🔧 Hotfix: Factory Reset, Translations, Beta Build Workflow

### 🐛 Bug Fixes

#### Factory Reset Fix
- **Factory reset fixed** - The `customers.json` file is now explicitly deleted during factory reset
- **Complete customer data deletion** - The encrypted customer data file (`customers.json`) is also deleted, ensuring complete data wipe

#### Missing Translation Keys
- **`encryption.noAppPassword` key added** - Missing translation key added to all 14 languages
- **Backup message translations** - Translations for "No automatic backup files yet" message added
- **Log management translations** - Translations for Log and Audit Log management texts added:
  - `settings.logs.auditLogManagement`
  - `settings.logs.deleteOlderAuditLogs`
  - `settings.logs.folderLocation`
  - `settings.logs.openFolder`
  - `settings.logs.auditLogHistory`
  - `settings.logs.logHistory`
- **Calendar translations** - Translations for month and day names added:
  - `calendar.monthNames`
  - `calendar.dayNames`
  - `calendar.dayNamesShort`
  - `settings.calendar.provider`
- **Help menu description** - Translations for "Show Help menu item in Sidebar" description added

#### Beta Build Workflow Fix
- **Beta branch explicit checkout** - The workflow now explicitly uses the latest commit from the `beta` branch
- **Tag commit fix** - The `beta-v3.0.1` tag now points to the correct commit (not the old commit)
- **Source code date fix** - The "Source code" date now shows the build time, not the old commit date
- **Verification steps added** - Git pull and commit SHA verification added to the workflow

### 📝 Technical Details

- **Version updated**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.1`
- **Duplicate keys removed**: `settings.logs.openFolder` duplications removed from all language files
- **TypeScript types updated**: `encryption.noAppPassword` added to `TranslationKey` type

---

## v3.0.0 (2025) - 🔒 Customer Data Encryption & GDPR Compliance + ⚡ Performance Optimization

### ⚡ Performance Optimization and Code Splitting

#### React.lazy() Documentation and Optimization
- **React.lazy() implementation documentation** - Complete documentation created (`docs/PERFORMANCE.md`)
- **Loading phase optimization** - Only data loads during loading phase, components load on demand
- **Suspense fallback optimization** - Optimized fallback components in AppRouter.tsx
- **Error boundary added** - LazyErrorBoundary.tsx component for lazy loaded components

#### Route-based Code Splitting
- **React Router integration** - React Router v7.10.0 installed and configured
- **URL-based navigation** - Route structure implemented (`/settings`, `/offers`, `/customers`, etc.)
- **Lazy loading for routes** - Each route automatically split into separate files
- **State-based → Routing conversion** - `activePage` state converted to URL-based routing
- **Bookmarkable pages** - All pages accessible via direct URL
- **Browser navigation support** - Back/forward buttons work, better UX

#### Code Splitting Fine-tuning
- **Vite build configuration optimization** - `rollupOptions.output.manualChunks` configured
- **Vendor chunk optimization**:
  - React/React-DOM/React-Router separate chunk (`vendor-react`)
  - Tauri APIs separate chunk (`vendor-tauri`)
  - UI libraries separate chunks (`vendor-ui-framer`, `vendor-ui-charts`)
  - Other node_modules (`vendor`)
- **Route-based chunking** - Automatic lazy loading creates separate chunks per route
- **Router files grouping** - Organized into `router`, `routes` chunks
- **Shared components grouping** - `components-shared` chunk
- **Chunk size warning limit** - Set to 1000 KB

#### Modular Architecture
- **Modular architecture documentation** - Complete documentation (`docs/MODULAR_ARCHITECTURE.md`)
- **Path aliases** - `@features`, `@shared`, `@core` aliases configured
- **Vite and TypeScript configuration** - Updated with path alias support
- **Shared modules implementation**:
  - Shared components (ConfirmDialog, FormField, InputField, SelectField, NumberField)
  - Shared hooks (useModal, useForm)
  - Shared utilities (debounce, format, validation)
- **Feature modules refactoring** - Complete refactoring of 6 modules:
  - Calculator: 582 lines → 309 lines (-46.9%)
  - Settings: 5947 lines → 897 lines (-85%!)
  - Offers: 3985 lines → 3729 lines (-6.4%)
  - Home: 3454 lines → 3308 lines (-4.2%)
  - Filaments and Printers modules also refactored

### 🔒 Customer Data Encryption
- **AES-256-GCM encryption** - Customer data encrypted storage using industry-standard AES-256-GCM algorithm
- **PBKDF2 password hashing** - Secure password storage using PBKDF2 algorithm (100,000 iterations, SHA-256)
- **Separate file storage** - Encrypted customer data stored in separate `customers.json` file
- **In-memory password management** - Passwords only stored in memory, cleared on application close
- **App password integration** - Optional: can use app password protection password for encryption as well
- **Password prompt system** - Intelligent password request (doesn't appear on loading screen, after welcome message)
- **Data integrity protection** - Encrypted data protected against accidental deletion

### ✅ GDPR/EU Compliant Data Protection
- **Compliance**: The application handles customer data in compliance with GDPR (General Data Protection Regulation) and EU data protection regulations
- **Industry-standard encryption**: Use of AES-256-GCM algorithm (meets EU recommendations)
- **Secure password handling**: PBKDF2 hashing algorithm (NIST recommended)
- **Minimal data collection**: Only stores necessary customer data required by the application
- **Data retention**: User has full control over data storage and deletion
- **Access control**: Password-protected access to customer data

### 🎨 UI/UX Improvements
- **Encryption enable modal** - New modal dialog for enabling encryption with app password option
- **ConfirmDialog enhancement** - customContent support for modal components
- **Password prompt timing** - Intelligent display (not on loading screen)
- **Settings integration** - Encryption settings in Security tab

### 🔧 Technical Improvements
- **Backend encryption module** - Encryption implemented in Rust (`src-tauri/src/encryption.rs`)
- **Frontend encryption utilities** - TypeScript utility functions for encryption handling
- **Password manager** - In-memory password management system
- **Store integration** - saveCustomers/loadCustomers functions with encryption integration

### 📚 Language Support
- **13 languages updated** - New encryption translation keys in all language files
- **New keys**: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Performance Monitoring & Audit Log System

### 🌐 Console Messages Localization
- **Full console localization** - All console messages are displayed in the selected language
- **Store operations translation** - Loading and saving messages (printers, filaments, settings, offers, customers, projects, tasks)
- **Backup messages translation** - Daily backup check, backup creation, rotation messages
- **Log rotation messages translation** - Log and audit log rotation messages with dynamic parts
- **Performance metrics translation** - CPU and memory metrics, regular logging messages
- **System messages translation** - Application initialization, frontend log initialization, welcome message
- **Multi-part messages translation** - Translation of console message data parts (date, timestamp, file, status information)
- **13 language support** - All console messages translated to English, Hungarian, German, Spanish, Italian, Polish, Portuguese, Russian, Ukrainian, Czech, Slovak, and Chinese

### ⚡ Performance Metrics Logging
- **Performance Timer class** - Manual timing for operations
- **Loading time measurement** - All module loading times recorded (Settings, Printers, Filaments, Offers, Customers)
- **Operation time measurement** - Automatic timing for async and sync operations
- **Memory usage monitoring** - JavaScript heap memory tracking and logging
- **CPU usage monitoring** - Regular CPU usage measurement every 5 minutes
- **Performance summary** - Aggregated statistics for loading and operation times
- **Structured log messages** - Detailed display of CPU percentage and memory values
- **Backend performance commands** - `get_performance_metrics` backend command for CPU and memory data

### 🔐 Audit Log Implementation
- **Audit log infrastructure** - Separate audit log file (`audit-YYYY-MM-DD.json`)
- **Critical operations logging**:
  - CRUD operations (Create/Update/Delete for Filaments, Printers, Offers, Customers)
  - Settings changes (theme, language, log settings, autosave, etc.)
  - Backup operations (create, restore)
  - Factory Reset operations
  - Error recording
- **Audit Log Viewer** - Virtual scroll for large files, with filtering, searching, and export capabilities
- **Automatic cleanup** - Old audit log files automatically deleted based on configurable retention days
- **Backend commands** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Full localization** - All 13 supported languages

### 🎯 UI/UX Improvements
- **Audit Log History** - Two-column layout in Settings → Log Management section
- **Performance metrics display** - In System Diagnostics modal
- **Log Viewer real-time updates** - Auto-refresh toggle, hash-based change detection
- **Auto-scroll refinement** - User scroll position awareness

### 🔧 Technical Improvements
- **GitHub update check optimization** - On startup and every 5 hours (localStorage-based)
- **Beta tag format** - Separate `beta-v2.0.0` tag for beta releases (doesn't overwrite main release)
- **Version checker logic** - Beta version search based on `beta-v` prefix

---

## v1.9.0 (2025) - 🔍 System Diagnostics & Performance Improvements

### 🔍 System Diagnostics
- **Comprehensive system health check tool**:
  - System information display (CPU, memory, OS, GPU, disk)
  - File system validation (data.json, filamentLibrary.json, update_filament.json)
  - Module availability checks (Settings, Offers, Printers, Customers, Calculator, Home)
  - Data storage availability checks
  - Progress bar with detailed status messages
  - Summary with errors/warnings/successful states
  - Rerun button
- **Moved to Log Management section** (more logical placement)
- **Full localization** in all 13 supported languages

### ⚡ Log Viewer Performance
- **Virtual scroll for large log files**:
  - Custom virtual scroll implementation for LogViewer component
  - Only visible log entries are rendered, significantly improving performance
  - Smooth scrolling and searching even with huge log files (100k+ lines)
  - Maintains accurate scrollbar position and height
  - Significantly faster search and filter operations

### 🔔 Unified Notification System
- **Central notification service**:
  - Single `notificationService` for both Toast and platform notifications
  - Priority-based notification routing (high priority → platform notification)
  - Automatic decision-making based on app state (foreground/background)
  - Backward compatible with existing notification functions
  - Configurable notification settings (Toast on/off, platform notification on/off, priority levels)

### 🎯 UI/UX Improvements
- System Diagnostics moved from Backup section to Log Management section (more logical placement)
- TypeScript linter errors fixed (unused variables, type discrepancies)
- Improved code quality and maintainability

---

## v1.8.0 (2025) - 📊 Advanced Logging System & Factory Reset Improvements

### 🔄 Factory Reset Progress Modal
- **Visual progress indicator for factory reset**:
  - 4-step animated progress (backup deletion, log deletion, config deletion, completion)
  - Real-time status updates with success/error messages
  - 10-second countdown before language selector display
  - Modal cannot be closed during reset process
  - Full localization in all 13 supported languages

### 📋 Complete Logging System Overhaul
- **Professional logging infrastructure**:
  - Cross-platform log file paths (platform-specific data directories)
  - System information logging (CPU, memory, OS, GPU, disk, app version)
  - Directory information logging (log and backup folders, file count, sizes)
  - Detailed loading status logging (success/warning/error/critical)
  - Log levels (DEBUG, INFO, WARN, ERROR) with filtering
  - Structured log format support (text and JSON)
  - Log rotation with automatic cleanup (configurable retention days)
  - Log Viewer modal with filtering, searching, highlighting, and export
  - Log configuration in Settings (format, level, retention days)
  - Log file content preserved on app restart (append mode)

### 🔍 System Diagnostics
- **System health check modal**:
  - System information display and validation
  - Memory usage monitoring with warnings
  - File existence checks
  - Module availability checks
  - Data storage availability tests
  - Progress bar and summary display
  - Full localization in all 13 supported languages

### 🛠️ Technical Improvements
- Logging disabled during Factory Reset to prevent log pollution
- data.json creation delayed until language selection (cleaner Factory Reset process)
- Log file initialization delayed until language selection
- Automatic app restart after language selection
- Backend commands for backup and log file management
- Cross-platform path handling for backups and logs
- Fixed memory calculation (sysinfo 0.31 compatibility)
- React style warnings fixed (CSS shorthand conflicts)

---

## v1.7.0 (2025) - 💾 Backup system, loading screen, and filament library improvements

### 💾 Complete Backup System Implementation
- **Automatic backup system** - One backup file per day (only created on new day)
- **Backup reminder hook and UI component** - Notification if no backup exists
- **Backup History UI in Settings** - Color-coded list (green/yellow/red/gray) for backup file age and deletion countdown
- **Autosave modal window** - Explanation when autosave is enabled
- **Autosave and automatic backup synchronization** - Automatic backup on autosave save
- **Factory Reset with automatic backup file deletion**
- **Backup history automatically refreshes** when autosave is enabled

### 🔧 Backup System Backend Optimization
- **Backend commands added** for deleting old backups (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Frontend cleanup functions updated to use backend commands**, eliminating "forbidden path" errors
- **All file operations (create, delete, list) now happen from backend**, avoiding Tauri permission issues

### ⚡ Backup System Performance Optimization
- `hasTodayBackup()` optimized: uses `list_backup_files` backend command, no need to read all files
- **Lock mechanism added** to prevent parallel backups
- **Faster operation** even with large number of backup files

### 📁 Backup Directory Opening and Log History
- **Button added** in Settings → Backup History section to open backup folder
- **New log history section** in Settings - list and open log files
- **Automatic log file deletion** configurable by days
- **Cross-platform support** (macOS, Windows, Linux)

### 🎨 Complete Loading Screen Overhaul
- **App logo integrated** as background with glassmorphism effect
- **Fixed layout for checkmarks** - Automatic scrolling, only 3 modules visible at once
- **Shimmer effect, pulsing dots animations**
- **Scroll container** with hidden scrollbar

### ⚙️ Loading Process Improvements
- **Slowed loading** (800ms delays) - loading messages are readable
- **Error handling for all modules** (try-catch blocks)
- **Physical log file** for all statuses and errors
- **Loading summary** at the end

### 🎨 Filament Library Multilingual Support
- **Filament colors displayed** in all supported languages (not just Hungarian/German/English)
- **Fallback logic**: English → Hungarian → German → raw color/name
- Settings, GlobalSearch, and Filaments components updated

### 🔄 Factory Reset Improvements
- **Physical file deletion** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Store instance reset** without reload
- **Language selector display** after Factory Reset

### 🎓 Tutorial Update with v1.7.0 New Features
- New steps: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Demo data expanded: 6 filaments → 11 filaments, 3 offers → 5 offers
- Translation keys added for all languages

---

## v1.6.0 (2025) - 📊 Interactive widgets & large table performance tuning

### 🧠 Interactive Charts and Detailed Modal Views
- **Main dashboard charts use unified `InteractiveChart` component** with clickable data points and animated detailed modal view
- **Tooltip and detailed view are localized**, showing human-readable labels (revenue, cost, net profit, offer count)
- **Time period can be set directly from trend chart** (weekly / monthly / yearly) using brush, sliced data flows to Home → Dashboard

### 🧵 Virtual Scroll for Large Lists
- **Custom virtual scroll** for Offers list and Filaments table – only visible rows are rendered, ensuring smooth scrolling even with 10k+ records
- **Settings → Filament Library** uses the same pattern, keeping the full 12,000+ color palette responsive
- **Scrollbar position/height remains correct** thanks to spacer elements above and below the visible range

### 📋 Advanced Table Sorting and Filtering
- **Multi-column sorting** on Filaments and Offers pages (click: ascending/descending, Shift+click: build sort chain – e.g., "Brand ↑, then Price/kg ↓")
- **Sort settings saved in `settings`**, so preferred order persists after restart
- **Filaments**: column-level filters for brand, material/type, and color/HEX value
- **Offers**: amount filter with min/max values, and date range filters (from / to)

---

**Last updated**: December 1, 2025


