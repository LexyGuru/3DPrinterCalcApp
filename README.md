# 🖨️ 3D Printer Calculator App

Egy modern, desktop alkalmazás 3D nyomtatási költségszámításra. Tauri v2-vel készült, React frontend-del és Rust backend-del.

## ✨ Funkciók

- 📊 **Költségszámítás** - Automatikus számítás filament, áram, szárítás és kopás költségekből
- 🧵 **Filament kezelés** - Hozzáadás, szerkesztés, törlés filamentekhez (márka, típus, szín, ár)
- 🖨️ **Nyomtató kezelés** - Nyomtatók és AMS rendszerek kezelése
- 💰 **Profit számítás** - Választható profit százalék (10%, 20%, 30%, 40%, 50%)
- 📄 **Árajánlatok** - Mentés, kezelés és PDF export árajánlatokhoz
- 📈 **Statisztikák** - Összefoglaló dashboard filament fogyasztásról, bevételről, profitról
- 🌍 **Többnyelvű** - Magyar, Angol, Német nyelven
- 💱 **Több pénznem** - EUR, HUF, USD

## 📸 Képernyőképek

Az alkalmazás tartalmazza:
- Kezdőlap dashboard statisztikákkal
- Filamentek kezelése
- Nyomtatók kezelése
- Kalkulátor költségszámításhoz
- Árajánlatok lista és részletes nézet
- PDF export funkció

## 🚀 Telepítés

### Előfeltételek

- **Rust**: [Install Rust](https://rustup.rs/)
- **Node.js**: [Install Node.js](https://nodejs.org/) (20+ verzió)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

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

## 📦 Buildelés

### Fejlesztői módban futtatás

```bash
cd src-tauri
cargo tauri dev
```

### Production build (Önálló alkalmazás készítése)

```bash
cd src-tauri
cargo tauri build
```

Az önálló alkalmazás a következő helyen lesz:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` vagy `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

Részletes útmutató: [BUILD.md](BUILD.md) és [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Fejlesztés

### Projekt struktúra

```
3DPrinterCalcApp/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React komponensek
│   │   ├── utils/        # Segédfüggvények
│   │   └── types.ts      # TypeScript típusok
│   └── package.json
├── src-tauri/         # Rust backend
│   ├── src/           # Rust forráskód
│   ├── Cargo.toml     # Rust függőségek
│   └── tauri.conf.json # Tauri konfiguráció
└── README.md
```

### Frontend fejlesztés

```bash
cd frontend
pnpm install
pnpm dev
```

### Függőségek

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Tauri v2
- tauri-plugin-store (adatok tárolása)
- tauri-plugin-log (logolás)

## 📖 Használat

1. **Nyomtató hozzáadása**: Nyomtatók menü → Új nyomtató hozzáadása
2. **Filament hozzáadása**: Filamentek menü → Új filament hozzáadása
3. **Költség számítás**: Kalkulátor menü → Válaszd ki a nyomtatót és a filamenteket
4. **Árajánlat mentése**: A kalkulátorban kattints a "Mentés árajánlatként" gombra
5. **PDF export**: Árajánlatok menü → Válassz egy árajánlatot → PDF export

## 🛠️ Technológiai stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Adattárolás**: Tauri Store Plugin (JSON fájlok)
- **Styling**: Inline styles (commonStyles)
- **i18n**: Saját translation rendszer

## 📝 License

Ez a projekt privát használatra készült.

## 👤 Szerző

Lekszikov

## 🙏 Köszönetnyilvánítás

- [Tauri](https://tauri.app/) - A cross-platform desktop app framework
- [React](https://react.dev/) - A frontend framework
- [Vite](https://vitejs.dev/) - A build tool

---

**Verzió**: 0.1.0

Ha bármilyen kérdésed van vagy hibát találsz, nyiss egy issue-t a GitHub repository-ban!

