# 🖨️ 3D Printer Calculator App

> **🌍 Nyelv választás**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

Egy modern, desktop alkalmazás 3D nyomtatási költségszámításra. Tauri v2-vel készült, React frontend-del és Rust backend-del.

## ✨ Funkciók

- 📊 **Költségszámítás** - Automatikus számítás filament, áram, szárítás és kopás költségekből
- 🧵 **Filament kezelés** - Hozzáadás, szerkesztés, törlés filamentekhez (márka, típus, szín, ár)
- 🖨️ **Nyomtató kezelés** - Nyomtatók és AMS rendszerek kezelése
- 💰 **Profit számítás** - Választható profit százalék (10%, 20%, 30%, 40%, 50%)
- 📄 **Árajánlatok** - Mentés, kezelés és PDF export árajánlatokhoz (ügyfél név, elérhetőség, leírás)
- 🧠 **Szűrő presetek** - Árajánlat szűrők mentése, gyors presetek alkalmazása, dátum/idő alapú automatikus filterek
- 🗂️ **Státusz dashboard** - Státusz kártyák, gyors szűrők és idővonal a legutóbbi státuszváltozásokról
- 📝 **Státusz megjegyzések** - Minden státuszváltás opcionális jegyzettel és előzmény naplózással
- 👁️ **PDF előnézet és sablonok** - Beépített PDF előnézet, választható sablonok és céges branding blokkok
- 🎨 **Filament színkönyvtár** - Több mint 2000 gyári szín, márka és típus szerinti rögzíthető választópanellel
- 💾 **Filament könyvtár szerkesztő** - Modal alapú hozzáadás/szerkesztés, duplikátum-figyelmeztetés és tartós mentés `filamentLibrary.json` fájlba
- 🖼️ **Filament képek PDF-ben** - Filament logók és színminták megjelenítése a generált PDF-ben
- 🧾 **G-code import és piszkozat készítés** - A kalkulátorban modális ablakból tölthető be G-code/JSON export (Prusa, Cura, Orca, Qidi), részletes összefoglalóval és automatikus árajánlat piszkozat generálással
- 📈 **Statisztikák** - Összefoglaló dashboard filament fogyasztásról, bevételről, profitról
- 🌍 **Többnyelvű** - Teljes fordítás magyar, angol, német, francia, egyszerűsített kínai, cseh, spanyol, olasz, lengyel, portugál és szlovák nyelveken (12 nyelv, összesen 813 fordítási kulcs minden nyelven)
- 💱 **Több pénznem** - EUR, HUF, USD
- 🔄 **Automatikus frissítések** - Ellenőrzi a GitHub Releases-t új verziókért
- 🧪 **Beta verziók** - Beta branch és beta buildelés támogatás
- ⚙️ **Beta ellenőrzés** - Beállítható, hogy ellenőrizze-e a beta verziókat
- 🎨 **Responsive layout** - Az alkalmazás minden eleme dinamikusan alkalmazkodik az ablakmérethez
- ✅ **Megerősítő dialógusok** - Törlés előtt megerősítés kérése
- 🔔 **Toast értesítések** - Sikeres műveletek után értesítések
- 🔍 **Keresés és szűrés** - Filamentek, nyomtatók és árajánlatok keresése
- 🔎 **Online ár-összehasonlítás** - Egy kattintással Google/Bing találatokat nyitsz a kiválasztott filamenthez, az ár azonnal frissíthető
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
- Státusz dashboard és idővonal
- PDF export és beépített előnézet

## 🚀 Telepítés

### Előfeltételek

- **Rust**: [Rust telepítése](https://rustup.rs/)
- **Node.js**: [Node.js telepítése](https://nodejs.org/) (20+ verzió)
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

### v0.5.56 (2025)
- 🌍 **Teljes nyelvi fordítások** – Elkészült a maradék 6 nyelvi fájl teljes fordítása: cseh (cs), spanyol (es), olasz (it), lengyel (pl), portugál (pt) és szlovák (sk). Minden fájl tartalmazza az összes 813 fordítási kulcsot, így az alkalmazás mostantól teljes mértékben támogatott ezeken a nyelveken.
- 🔒 **Tauri engedélyek javítása** – Az `update_filamentLibrary.json` fájl mostantól explicit módon engedélyezve van az olvasás, írás és létrehozás műveletekhez a Tauri capabilities fájlban, így a filament könyvtár frissítések megbízhatóan működnek.

### v0.5.55 (2025)
- 🧵 **Árajánlat szerkesztés fejlesztés** – A mentett ajánlatoknál mostantól közvetlenül választható vagy módosítható a nyomtató, a filament változtatásokkal együtt automatikusan újraszámolódnak a költségek.
- 🧮 **Pontosság és naplózás** – Részletes logolás segít követni a költségszámítás lépéseit (filament, áram, szárítás, használat), így könnyebb hibát keresni importált G-code-ok esetén.
- 🌍 **Fordítási kiegészítések** – Új i18n kulcsok és feliratok kerültek a printer-választóhoz, így minden támogatott nyelven egységes a szerkesztő UI.
- 📄 **Dokumentáció frissítése** – A README bővült az új funkciók leírásával, a verziótörténetbe bekerült a v0.5.55 kiadás.

---

**Verzió**: 0.5.56

Ha bármilyen kérdésed van vagy hibát találsz, nyiss egy issue-t a GitHub repository-ban!

