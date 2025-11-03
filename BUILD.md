# Build útmutató - 3DPrinterCalcApp

Ez az alkalmazás Tauri v2-vel készült, ami cross-platform alkalmazásokat lehetővé tesz.

## Előfeltételek minden platformra

1. **Rust**: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. **Node.js**: https://nodejs.org/
3. **pnpm**: `npm install -g pnpm`
4. **Tauri CLI**: `cargo install tauri-cli`

### macOS specifikus
```bash
# Xcode Command Line Tools
xcode-select --install
```

### Linux specifikus (Ubuntu/Debian)
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

### Windows specifikus
- Visual Studio Build Tools (C++ build tools)
- Windows SDK

## Build parancsok

### Fejlesztői mód (dev)
```bash
cd src-tauri
cargo tauri dev
```

### Production build (jelenlegi platformra)
```bash
cd src-tauri
cargo tauri build
```

**Build eredmények helye**: `src-tauri/target/release/bundle/`

- **macOS**: `.app` fájl és `.dmg` installer
- **Linux**: `.deb`, `.AppImage`, `.rpm` 
- **Windows**: `.msi` installer és `.exe`

## Buildelés különböző platformokra

### macOS-ról buildelés

```bash
cd src-tauri

# Jelenlegi gépen (Intel vagy Apple Silicon)
cargo tauri build

# Vagy specifikus architektúrára:
cargo tauri build --target x86_64-apple-darwin   # Intel Mac
cargo tauri build --target aarch64-apple-darwin  # Apple Silicon Mac
```

**Eredmény**: `src-tauri/target/release/bundle/macos/` - `.app` és `.dmg`

### Linux-ról buildelés

```bash
cd src-tauri
cargo tauri build
```

**Eredmény**: `src-tauri/target/release/bundle/`
- `deb/` - Debian/Ubuntu installer
- `appimage/` - AppImage fájl
- `rpm/` - Red Hat/Fedora installer

### Windows-ról buildelés

```bash
cd src-tauri
cargo tauri build
```

**Eredmény**: `src-tauri/target/release/bundle/msi/` - `.msi` installer

## Cross-compilation

**Megjegyzés**: Cross-compilation (pl. macOS-ról Windows-ra) bonyolult és általában nem ajánlott.

**Ajánlott megoldás**: Minden platformon buildelj külön, vagy használj CI/CD-t (GitHub Actions).

## GitHub Actions CI/CD (Automatikus buildelés)

Hozz létre egy `.github/workflows/build.yml` fájlt a projekt gyökerében:

```yaml
name: Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        
      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install frontend dependencies
        run: |
          cd frontend
          pnpm install
          
      - name: Build frontend
        run: |
          cd frontend
          pnpm build
          
      - name: Install Tauri CLI
        run: cargo install tauri-cli --locked
        
      - name: Build Tauri app
        run: |
          cd src-tauri
          cargo tauri build
          
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.platform }}
          path: src-tauri/target/release/bundle/
```

Ez minden push után automatikusan buildeli az alkalmazást mindhárom platformra!

## Gyors referencia

```bash
# Fejlesztés
cd src-tauri && cargo tauri dev

# Build (production)
cd src-tauri && cargo tauri build

# Eredmények
# macOS: src-tauri/target/release/bundle/macos/
# Linux: src-tauri/target/release/bundle/
# Windows: src-tauri/target/release/bundle/msi/
```

