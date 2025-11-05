# 3D Printer Calculator App - GitHub Wiki

## 🖨️ Áttekintés

A **3D Printer Calculator App** egy modern, cross-platform desktop alkalmazás 3D nyomtatási költségszámításokhoz. Tauri v2 framework-öt használ React frontend-del és Rust backend-del, így natívan fut macOS, Linux és Windows rendszereken.

## ✨ Főbb funkciók

### 📊 Költségszámítás
- **Filament költség**: Automatikus számítás a felhasznált filament mennyiségéből (gramm)
- **Áram költség**: Számítás a nyomtató teljesítménye és működési ideje alapján
- **Szárítási költség**: Szárítási idő és teljesítmény alapján (ha szükséges)
- **Használati költség**: Kopás és karbantartás költsége (€/óra)
- **Összesített költség**: Minden költség összesítése

### 🧵 Filament kezelés
- Filamentek hozzáadása, szerkesztése, törlése
- Márka, típus, szín, súly és ár megadása
- Szűrő és keresési funkció
- Filamentek listázása és szűrése

### 🖨️ Nyomtató kezelés
- Nyomtatók hozzáadása, szerkesztése, törlése
- Nyomtató típus, teljesítmény, használati költség beállítása
- **AMS (Automatic Material System) támogatás**: AMS rendszerek konfigurálása (0-4 AMS)
- AMS rendszerek kezelése (márka, név, teljesítmény)

### 💰 Profit számítás
- Választható profit százalék: 10%, 20%, 30%, 40%, 50%
- Automatikus profit számítás
- Revenue (bevétel) számítás
- Végső árazás kalkulációja

### 📄 Árajánlatok
- Árajánlatok mentése és kezelése
- Ügyfél információk: név, elérhetőség (email/telefon), leírás
- **PDF export**: Natív save dialog használatával
- Árajánlatok keresése és szűrése
- Árajánlat duplikálása
- Árajánlat részletes nézet

### 📈 Statisztikák
- Összefoglaló dashboard
- Filament fogyasztás
- Bevétel és profit statisztikák
- Árajánlatok összesítése

### 🌍 Többnyelvűség
- **Magyar** (alapértelmezett)
- **Angol** (English)
- **Német** (Deutsch)

### 💱 Több pénznem
- **EUR** (€)
- **HUF** (Ft)
- **USD** ($)

### ⚙️ Beállítások
- Nyelv választás
- Pénznem választás
- Áram ár beállítása (Ft/kWh)
- Beta verziók ellenőrzése (beállítható)
- **Adat export/import**: JSON formátumban
  - Filamentek exportálása/importálása
  - Nyomtatók exportálása/importálása
  - Árajánlatok exportálása/importálása

## 🚀 Telepítés

### Előfeltételek

- **Rust**: [Install Rust](https://rustup.rs/)
- **Node.js**: [Install Node.js](https://nodejs.org/) (20+ verzió)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### Platform specifikus követelmények

#### macOS
```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian)
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

#### Windows
- Visual Studio Build Tools (C++ build tools)
- Windows SDK

## 📦 Buildelés

### Fejlesztői módban futtatás

```bash
cd src-tauri
cargo tauri dev
```

### Production build

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

## 💻 Fejlesztés

### Projekt struktúra

```
3DPrinterCalcApp/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React komponensek
│   │   │   ├── Calculator.tsx
│   │   │   ├── Filaments.tsx
│   │   │   ├── Printers.tsx
│   │   │   ├── Offers.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── utils/        # Segédfüggvények
│   │   │   ├── store.ts
│   │   │   ├── translations.ts
│   │   │   ├── currency.ts
│   │   │   ├── version.ts
│   │   │   └── styles.ts
│   │   └── types.ts      # TypeScript típusok
│   └── package.json
├── src-tauri/         # Rust backend
│   ├── src/
│   │   └── main.rs    # Tauri entry point
│   ├── Cargo.toml     # Rust függőségek
│   ├── tauri.conf.json # Tauri konfiguráció
│   └── capabilities/
│       └── default.json # Tauri permissions
└── README.md
```

### Frontend fejlesztés

```bash
cd frontend
pnpm install
pnpm dev
```

### Függőségek

#### Frontend
- React 19
- TypeScript
- Vite
- @tauri-apps/plugin-store
- @tauri-apps/plugin-dialog
- @tauri-apps/plugin-fs

#### Backend
- Tauri v2
- tauri-plugin-store (adatok tárolása)
- tauri-plugin-dialog (natív dialógusok)
- tauri-plugin-fs (fájlrendszer műveletek)
- tauri-plugin-log (logolás)

## 📖 Használat

### 1. Nyomtató hozzáadása
1. Menj a **Nyomtatók** menübe
2. Kattints az **"Új nyomtató hozzáadása"** gombra
3. Töltsd ki a mezőket: Név, Típus, Teljesítmény (W), Kopás (€/óra)
4. Ha van AMS rendszered, add meg az AMS számát (0-4)
5. Kattints a **"Hozzáadás"** gombra

### 2. Filament hozzáadása
1. Menj a **Filamentek** menübe
2. Kattints az **"Új filament hozzáadása"** gombra
3. Töltsd ki a mezőket: Márka, Típus, Súly (gramm), Ár (€/kg), Szín
4. Kattints a **"Hozzáadás"** gombra

### 3. Költség számítás
1. Menj a **Kalkulátor** menübe
2. Válaszd ki a nyomtatót a legördülő menüből
3. Add hozzá a filamenteket (kattints a **"+ Filament hozzáadása"** gombra)
4. Minden filamenthez add meg:
   - Felhasznált mennyiség (gramm)
   - Nyomtatási idő (óra, perc, másodperc)
   - Szárítás szükséges (ha igen, add meg az időt és teljesítményt)
5. A **Költség bontás** részben látod az összesített költségeket

### 4. Árajánlat mentése
1. A Kalkulátorban, miután kiszámoltad a költségeket
2. Kattints a **"Mentés árajánlatként"** gombra
3. Töltsd ki az ügyfél adatokat:
   - Ügyfél neve (kötelező)
   - Kapcsolat (email/telefon, opcionális)
   - Leírás (opcionális)
   - Profit százalék (alapértelmezett: 30%)
4. Kattints a **"Mentés"** gombra

### 5. PDF export
1. Menj az **Árajánlatok** menübe
2. Válassz egy árajánlatot
3. Kattints a **"PDF Letöltés"** gombra
4. A natív save dialog-ban válaszd ki a mentési helyet
5. A PDF tartalmazza:
   - Ügyfél információk
   - Nyomtató adatok
   - Filamentek listája
   - Teljes költség bontás
   - Profit számítás
   - Revenue (bevétel)

### 6. Adat export/import
1. Menj a **Beállítások** menübe
2. Az **Export/Import** szekcióban:
   - Jelöld be, hogy mit szeretnél exportálni (Filamentek, Nyomtatók, Árajánlatok)
   - Kattints az **"Export"** gombra
   - Válaszd ki a mentési helyet
3. Importáláshoz:
   - Jelöld be, hogy mit szeretnél importálni
   - Kattints az **"Import"** gombra
   - Válaszd ki az importálandó JSON fájlt
   - ⚠️ **Figyelem**: Az importálás felülírja a jelenlegi adatokat!

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

## 🛠️ Technológiai részletek

### Frontend
- **React 19**: Modern JavaScript framework
- **TypeScript**: Típusbiztos JavaScript
- **Vite**: Gyors build eszköz
- **Tauri Plugins**:
  - `@tauri-apps/plugin-store`: Adatok perzisztálása
  - `@tauri-apps/plugin-dialog`: Natív dialógusok
  - `@tauri-apps/plugin-fs`: Fájlrendszer műveletek

### Backend
- **Rust**: Rendszerprogramozási nyelv
- **Tauri v2**: Cross-platform desktop framework
- **Tauri Plugins**:
  - `tauri-plugin-store`: Adatok tárolása
  - `tauri-plugin-dialog`: Dialógusok
  - `tauri-plugin-fs`: Fájlrendszer műveletek
  - `tauri-plugin-log`: Logolás

### Adattárolás
- **Tauri Store Plugin**: JSON fájlokban tárolja az adatokat
- Adatok helye:
  - **macOS**: `~/Library/Application Support/com.lekszikov.3dprintercalcapp/`
  - **Linux**: `~/.local/share/com.lekszikov.3dprintercalcapp/`
  - **Windows**: `%APPDATA%\com.lekszikov.3dprintercalcapp\`

### Styling
- **Inline styles**: `commonStyles` utility objektum
- **Responsive design**: Minden elem dinamikusan alkalmazkodik az ablakmérethez
- **Color coding**: 
  - Filamentek: sárga háttér szerkesztéskor
  - Gombok: Primary (kék), Success (zöld), Danger (piros), Secondary (szürke)

## 📋 Verziótörténet

### v0.1.85 (2025)
- ✏️ Duplikált ikonok eltávolítva
- 📐 Export/Import szekciók 2 oszlopos layoutban
- 💾 PDF mentésnél natív save dialog
- 📊 Toast értesítések PDF mentésnél
- 🖼️ Alkalmazás ablakméret: 1280x720
- 📄 PDF generálásban hiányzó információk hozzáadva

### v0.1.56 (2025)
- ✨ Calculator layout javítások
- ✨ Költség bontás responsive
- 🐛 Filament hozzáadásakor nem csúszik ki a tartalom

### v0.1.55 (2025)
- ✨ Megerősítő dialógusok
- ✨ Toast értesítések
- ✨ Input validáció
- ✨ Loading states
- ✨ Error Boundary
- ✨ Keresés és szűrés
- ✨ Duplikálás
- ✨ Collapsible formok
- ✨ Árajánlat bővítések

## 🌿 Branch struktúra

- **`main`**: Stabil release verziók (RELEASE build)
- **`beta`**: Beta verziók és fejlesztések (BETA build)

A `beta` branch pusholásakor automatikusan lefut a GitHub Actions workflow, ami buildeli a beta verziót.

## 🐛 Hibajelentés

Ha hibát találsz vagy kérdésed van:
1. Nyiss egy **Issue**-t a GitHub repository-ban
2. Add meg a következő információkat:
   - Operációs rendszer (macOS/Linux/Windows)
   - Alkalmazás verziója
   - A hiba leírása
   - Lépések a hiba reprodukálásához

## 🤝 Közreműködés

A projekt nyílt forráskódú. Közreműködésedet szívesen fogadjuk!

1. **Fork**old a repository-t
2. Hozz létre egy **feature branch**-et (`git checkout -b feature/AmazingFeature`)
3. **Commit**old a változtatásaidat (`git commit -m 'Add some AmazingFeature'`)
4. **Push**old a branch-edet (`git push origin feature/AmazingFeature`)
5. Nyiss egy **Pull Request**-et

## 📝 Licenc

Ez a projekt **MIT licenc** alatt áll, azonban **kereskedelmi használat csak engedély alapján**.

A teljes alkalmazás tulajdonjoga: **Lekszikov Miklós (LexyGuru)**

- ✅ **Személyes és oktatási használat**: Engedélyezett
- ❌ **Kereskedelmi használat**: Csak explicit írásos engedély alapján

Részletek: [LICENSE](../LICENSE) fájl

## 👤 Szerző

Lekszikov Miklós (LexyGuru)

## 🙏 Köszönetnyilvánítás

- [Tauri](https://tauri.app/) - Cross-platform desktop framework
- [React](https://react.dev/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Rust](https://www.rust-lang.org/) - Backend nyelv

## 📚 További dokumentáció

- [BUILD.md](../BUILD.md) - Részletes build útmutató
- [HOW_TO_BUILD_APP.md](../HOW_TO_BUILD_APP.md) - Standalone alkalmazás készítése
- [VERSIONING.md](../VERSIONING.md) - Verziókezelés és frissítések
- [CREATE_FIRST_RELEASE.md](../CREATE_FIRST_RELEASE.md) - Első GitHub Release létrehozása

---

**Verzió**: 0.1.85

Ha bármilyen kérdésed van vagy hibát találsz, nyiss egy issue-t a GitHub repository-ban!

