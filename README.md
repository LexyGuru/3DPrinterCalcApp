# 🖨️ 3D Printer Calculator App

Egy modern, desktop alkalmazás 3D nyomtatási költségszámításra. Tauri v2-vel készült, React frontend-del és Rust backend-del.

## ✨ Funkciók

- 📊 **Költségszámítás** - Automatikus számítás filament, áram, szárítás és kopás költségekből
- 🧵 **Filament kezelés** - Hozzáadás, szerkesztés, törlés filamentekhez (márka, típus, szín, ár)
- 🖨️ **Nyomtató kezelés** - Nyomtatók és AMS rendszerek kezelése
- 💰 **Profit számítás** - Választható profit százalék (10%, 20%, 30%, 40%, 50%)
- 📄 **Árajánlatok** - Mentés, kezelés és PDF export árajánlatokhoz (ügyfél név, elérhetőség, leírás)
- 📈 **Statisztikák** - Összefoglaló dashboard filament fogyasztásról, bevételről, profitról
- 🌍 **Többnyelvű** - Magyar, Angol, Német nyelven
- 💱 **Több pénznem** - EUR, HUF, USD
- 🔄 **Automatikus frissítések** - Ellenőrzi a GitHub Releases-t új verziókért
- 🧪 **Beta verziók** - Beta branch és beta buildelés támogatás
- ⚙️ **Beta ellenőrzés** - Beállítható, hogy ellenőrizze-e a beta verziókat
- 🎨 **Responsive layout** - Az alkalmazás minden eleme dinamikusan alkalmazkodik az ablakmérethez
- ✅ **Megerősítő dialógusok** - Törlés előtt megerősítés kérése
- 🔔 **Toast értesítések** - Sikeres műveletek után értesítések
- 🔍 **Keresés és szűrés** - Filamentek, nyomtatók és árajánlatok keresése
- 📋 **Duplikálás** - Árajánlatok könnyű duplikálása
- 🖱️ **Drag & Drop** - Árajánlatok, filamentek és nyomtatók átrendezése húzással
- 📱 **Kontextus menük** - Jobb klikk menük gyors műveletekhez (szerkesztés, törlés, duplikálás, export)

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

### Beta buildelés

A projekt tartalmaz egy `beta` branch-et, ami külön buildelésre van konfigurálva:

```bash
# Beta branch-re váltás
git checkout beta

# Lokális beta build
./build-frontend.sh
cd src-tauri
cargo tauri build
```

A beta build automatikusan beállítja a `VITE_IS_BETA=true` változót, így a menüben "BETA" jelzés jelenik meg.

**GitHub Actions**: A `beta` branch pusholásakor automatikusan lefut a `.github/workflows/build-beta.yml` workflow, ami buildeli a beta verziót mindhárom platformra.

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
6. **Beta verziók ellenőrzése**: Beállítások menü → "Beta verziók ellenőrzése" opció bekapcsolása

## 🔄 Verziókezelés és Frissítések

Az alkalmazás automatikusan ellenőrzi a GitHub Releases-t új verziókért:

- **Indításkor**: Automatikusan ellenőrzi a frissítéseket
- **5 percenként**: Automatikusan újra ellenőrzi
- **Értesítés**: Ha van új verzió, egy értesítés jelenik meg a jobb felső sarokban

### Beta verziók ellenőrzése

Ha beta verziókat szeretnél ellenőrizni:

1. Menj a **Beállítások** menübe
2. Kapcsold be a **"Beta verziók ellenőrzése"** opciót
3. Az alkalmazás azonnal ellenőrzi a beta verziókat
4. Ha van újabb beta verzió, megjelenik egy értesítés
5. A "Letöltés" gombra kattintva a GitHub Release oldalra kerülsz

**Példa**: Ha RELEASE verziót használsz (pl. 0.1.0) és bekapcsolod a beta ellenőrzést, az alkalmazás megkeresi a legújabb beta verziót (pl. 0.2.0-beta) és értesít, ha van újabb.

Részletes útmutató: [VERSIONING.md](VERSIONING.md)

## 🛠️ Technológiai stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Adattárolás**: Tauri Store Plugin (JSON fájlok)
- **Styling**: Inline styles (commonStyles)
- **i18n**: Saját translation rendszer
- **CI/CD**: GitHub Actions (automatikus buildelés macOS, Linux, Windows)
- **Verziókezelés**: GitHub Releases API integráció

## 📝 License

Ez a projekt **MIT licenc** alatt áll, azonban **kereskedelmi használat csak engedély alapján**.

A teljes alkalmazás tulajdonjoga: **Lekszikov Miklós (LexyGuru)**

- ✅ **Személyes és oktatási használat**: Engedélyezett
- ❌ **Kereskedelmi használat**: Csak explicit írásos engedély alapján

Részletek: [LICENSE](LICENSE) fájl

## 👤 Szerző

Lekszikov Miklós (LexyGuru)

## 🙏 Köszönetnyilvánítás

- [Tauri](https://tauri.app/) - A cross-platform desktop app framework
- [React](https://react.dev/) - A frontend framework
- [Vite](https://vitejs.dev/) - A build tool

## 📚 További dokumentáció

- [BUILD.md](BUILD.md) - Részletes build útmutató minden platformra
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Standalone alkalmazás készítése
- [VERSIONING.md](VERSIONING.md) - Verziókezelés és frissítések
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Első GitHub Release létrehozása

## 🌿 Branch struktúra

- **`main`**: Stabil release verziók (RELEASE build)
- **`beta`**: Beta verziók és fejlesztések (BETA build)

A `beta` branch pusholásakor automatikusan lefut a GitHub Actions workflow, ami buildeli a beta verziót.

## 📋 Verziótörténet

### v0.3.3 (2025)
- 🖱️ **Drag & Drop funkciók** - Árajánlatok, filamentek és nyomtatók átrendezése húzással
- 📱 **Kontextus menük** - Jobb klikk menük gyors műveletekhez (szerkesztés, törlés, duplikálás, PDF export)
- 🎨 **Visual feedback** - Drag & drop során opacity és cursor változás
- 🔔 **Toast értesítések** - Átrendezés után értesítések
- 🐛 **Build hiba javítás** - Calculator.tsx theme.colors.error -> theme.colors.danger javítás

### v0.3.2 (2025)
- 📋 **Template funkciók** - Kalkulációk mentése és betöltése template-ként a Calculator komponensben
- 📜 **Előzmények/Verziózás árajánlatokhoz** - Árajánlatok verziózása, előzmények megtekintése, változtatások nyomon követése
- 🧹 **Duplikáció javítás** - Duplikált CSV/JSON export/import funkciók eltávolítása Filaments és Printers komponensekből (Settings-ben maradtak)

### v0.3.1 (2025)
- ✅ **Input validáció fejlesztése** - Negatív számok eltiltása, maximum értékek beállítása (filament súly, nyomtatási idő, teljesítmény, stb.)
- 📊 **CSV/JSON export/import** - Filamentek és nyomtatók tömeges exportálása/importálása CSV és JSON formátumban
- 📥 **Import/Export gombok** - Könnyű hozzáférés az export/import funkciókhoz a Filaments és Printers oldalakon
- 🎨 **Empty states javítása** - Informatív üres állapotok megjelenítése, amikor nincsenek adatok

### v0.3.0 (2025)
- ✏️ **Árajánlat szerkesztés** - Mentett árajánlatok szerkesztése (ügyfél név, elérhetőség, leírás, profit százalék)
- 📊 **Statisztikák export funkció** - Statisztikák exportálása JSON vagy CSV formátumban a Home oldalról
- 📈 **Riport generálás** - Heti/havi/éves/összes riport generálása JSON formátumban időszak szerinti szűréssel
- 📋 **Verzió előzmények megjelenítése** - Verzió előzmények megtekintése a beállításokban, részletes changelog
- 🐛 **Bugfixek** - Használaton kívüli változók eltávolítása, kód tisztítás

### v0.2.55 (2025)
- 🖥️ **Console/Log funkció** - Új Console menüpont a hibakereséshez és logok megtekintéséhez
- 🖥️ **Console beállítás** - Beállításokban lehet bekapcsolni a Console menüpont megjelenítését
- 📊 **Log gyűjtés** - Automatikus rögzítés minden console.log, console.error, console.warn üzenetről
- 📊 **Globális hibák rögzítése** - Automatikus rögzítés window error és unhandled promise rejection eseményekről
- 🔍 **Log szűrés** - Szűrés szintenként (all, error, warn, info, log, debug)
- 🔍 **Log export** - Logok exportálása JSON formátumban
- 🧹 **Log törlés** - Logok törlése egy gombbal
- 📜 **Auto-scroll** - Automatikus görgetés az új logokhoz
- 💾 **Teljes logolás** - Minden kritikus művelet logolva (mentés, export, import, törlés, PDF export, frissítés letöltés)
- 🔄 **Frissítés gomb javítás** - A letöltés gomb most Tauri shell plugin-t használ, megbízhatóan működik
- 🔄 **Frissítés logolás** - Frissítés ellenőrzés és letöltés teljes logolása
- 🐛 **React render hiba javítás** - Console logger aszinkron működés, hogy ne akadályozza a renderelést
- 🔧 **num-bigint-dig frissítés** - v0.9.1-re frissítve (deprecation warning javítása)

### v0.2.0 (2025)
- 🎨 **Téma rendszer** - 6 modern téma (Light, Dark, Blue, Green, Purple, Orange)
- 🎨 **Téma választó** - Beállításokban választható téma, azonnal érvénybe lép
- 🎨 **Teljes téma integráció** - Minden komponens (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) használja a témákat
- 🎨 **Dinamikus színek** - Minden hard-coded szín lecserélve a téma színeire
- 🎨 **Responsive téma** - Az árajánlatok és a Sidebar footer is használja a témákat
- 💱 **Dinamikus pénznem konverzió** - Az árajánlatok most a jelenlegi beállítások pénznemében jelennek meg (automatikus konverzió)
- 💱 **Pénznem váltás** - A beállításokban megváltoztatott pénznem azonnal érvénybe lép az árajánlatok megjelenítésénél
- 💱 **PDF pénznem konverzió** - A PDF export is a jelenlegi beállítások pénznemében készül
- 💱 **Filament ár konverzió** - A filament árak is automatikusan konvertálva jelennek meg

### v0.1.85 (2025)
- 🎨 **UI/UX Javítások**:
  - ✏️ Duplikált ikonok eltávolítva (Szerkesztés, Mentés, Mégse gombok)
  - 📐 Export/Import szekciók 2 oszlopos layoutban (egymás mellett)
  - 💾 PDF mentésnél natív save dialog használata (Tauri dialog)
  - 📊 Toast értesítések PDF mentésnél (sikeres/hiba)
  - 🖼️ Alkalmazás ablakméret: 1280x720 (korábban 1000x700)
- 🐛 **Bugfixek**:
  - PDF generálásban hiányzó információk hozzáadva (customerContact, profit külön sorban, revenue)
  - Fordítási kulcsok hozzáadva (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **PDF Export javítások**:
  - Ügyfél kapcsolat (email/telefon) megjelenítése a PDF-ben
  - Profit számítás külön sorban a profit százalékkal
  - Revenue (Bevétel/Összes ár) külön sorban, kiemelve
  - Teljes költség bontás a PDF-ben

### v0.1.56 (2025)
- ✨ **Calculator layout javítások**: Filament kártyák túlcsordulás javítva, responsive flexbox layout
- ✨ **Költség bontás responsive**: Most dinamikusan reagál az ablakméret változására
- 🐛 **Bugfix**: Filament hozzáadásakor nem csúszik ki a tartalom az ablakból
- 🐛 **Bugfix**: Minden Calculator elem megfelelően reagál az ablakméret változására

### v0.1.55 (2025)
- ✨ **Megerősítő dialógusok**: Törlés előtt megerősítés kérése (Filamentek, Nyomtatók, Árajánlatok)
- ✨ **Toast értesítések**: Sikeres műveletek után értesítések (hozzáadás, frissítés, törlés)
- ✨ **Input validáció**: Negatív számok eltiltása, maximum értékek beállítása
- ✨ **Loading states**: Betöltési spinner az alkalmazás indításakor
- ✨ **Error Boundary**: Alkalmazás szintű hibakezelés
- ✨ **Keresés és szűrés**: Filamentek, nyomtatók és árajánlatok keresése
- ✨ **Duplikálás**: Árajánlatok könnyű duplikálása
- ✨ **Collapsible formok**: Filament és nyomtató hozzáadási formok összecsukhatóak
- ✨ **Árajánlat bővítések**: Ügyfél név, elérhetőség és leírás mezők hozzáadása
- 🐛 **Console.log cleanup**: Production buildben nincsenek console.log-ok
- 🐛 **Leírás mező javítás**: Hosszú szövegek helyesen tördelődnek

---

**Verzió**: 0.3.3

Ha bármilyen kérdésed van vagy hibát találsz, nyiss egy issue-t a GitHub repository-ban!

