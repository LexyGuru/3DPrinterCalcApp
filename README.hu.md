# 🖨️ 3D Printer Calculator App

> **🌍 Nyelv választás**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

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
- 🌍 **Többnyelvű** - Teljes fordítás magyar, angol, német, francia, egyszerűsített kínai, cseh, spanyol, olasz, lengyel, portugál, szlovák, ukrán és orosz nyelveken (14 nyelv, összesen 813 fordítási kulcs minden nyelven)
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
- 🍎 **Platform-specifikus funkciók** - macOS Dock badge, natív értesítések, system tray integráció

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

### v0.5.58 (2025)
- 🌍 **Ukrán és Orosz nyelv támogatás** – Teljes fordítási támogatás hozzáadva az ukrán (uk) és orosz (ru) nyelvekhez:
  - Teljes fordítási fájlok mindkét nyelvhez, összesen 813 fordítási kulccsal
  - Ukrán locale támogatás (uk-UA) dátum/idő formázáshoz
  - Orosz locale támogatás (ru-RU) dátum/idő formázáshoz
  - Minden README fájl frissítve az új nyelvekkel a nyelvmenüben
  - Nyelvszámláló frissítve 12-ről 14 nyelvre
  - README.uk.md és README.ru.md dokumentációs fájlok létrehozva

### v0.5.57 (2025)
- 🍎 **Platform-specifikus funkciók** – Natív platform integráció macOS, Windows és Linux rendszerekhez:
  - **macOS**: Dock badge támogatás (számos/szöveges badge az alkalmazás ikonján), natív Notification Center integráció engedélykezeléssel
  - **Windows**: Natív Windows értesítések
  - **Linux**: System tray integráció, desktop értesítések támogatás
  - **Minden platform**: Natív értesítési API integráció engedélykérési rendszerrel, platform detektálás és automatikus funkció engedélyezés
- 🔔 **Értesítési rendszer** – Natív értesítési támogatás engedélykezeléssel:
  - Engedélykérési rendszer macOS értesítésekhez
  - Értesítési teszt gombok a Beállításokban
  - Automatikus engedély ellenőrzés és státusz megjelenítés
  - Platform-specifikus értesítés kezelés (macOS Notification Center, Windows Action Center, Linux desktop értesítések)

### v0.5.56 (2025)
- 🌍 **Teljes nyelvi fordítások** – Elkészült a maradék 6 nyelvi fájl teljes fordítása: cseh (cs), spanyol (es), olasz (it), lengyel (pl), portugál (pt) és szlovák (sk). Minden fájl tartalmazza az összes 813 fordítási kulcsot, így az alkalmazás mostantól teljes mértékben támogatott ezeken a nyelveken.
- 🔒 **Tauri engedélyek javítása** – Az `update_filamentLibrary.json` fájl mostantól explicit módon engedélyezve van az olvasás, írás és létrehozás műveletekhez a Tauri capabilities fájlban, így a filament könyvtár frissítések megbízhatóan működnek.

### v0.5.55 (2025)
- 🧵 **Árajánlat szerkesztés fejlesztés** – A mentett ajánlatoknál mostantól közvetlenül választható vagy módosítható a nyomtató, a filament változtatásokkal együtt automatikusan újraszámolódnak a költségek.
- 🧮 **Pontosság és naplózás** – Részletes logolás segít követni a költségszámítás lépéseit (filament, áram, szárítás, használat), így könnyebb hibát keresni importált G-code-ok esetén.
- 🌍 **Fordítási kiegészítések** – Új i18n kulcsok és feliratok kerültek a printer-választóhoz, így minden támogatott nyelven egységes a szerkesztő UI.
- 📄 **Dokumentáció frissítése** – A README bővült az új funkciók leírásával, a verziótörténetbe bekerült a v0.5.55 kiadás.

### v0.5.11 (2025)
- 🗂️ **Nyelvi modulárisítás** – Új `languages/` könyvtárba szervezett fordítási fájlokkal bővítettük az appot, így könnyebb új nyelveket felvenni és a meglévő szövegeket kezelni.
- 🌍 **Egységesített UI fordítások** – A slicer import teljes felülete mostantól a központi fordítási rendszerből dolgozik, minden gomb, hibaüzenet és összefoglaló lokalizálva van.
- 🔁 **Nyelvválasztó frissítés** – A Beállításokban a nyelvválasztó a feltárt nyelvi fájlok alapján töltődik fel, így a jövőben elég egy új nyelvi fájlt hozzáadni.
- 🌐 **Új nyelvi alapok** – Francia, olasz, spanyol, lengyel, cseh, szlovák, brazil portugál és egyszerűsített kínai fordítási fájlok előkészítve (angol fallback-pal), a tényleges fordítások könnyen kitölthetők.

### v0.5.0 (2025)
- 🔎 **Filament ár-összehasonlító gomb** – Minden saját filamenthez nagyító ikon társul, amely megnyitja a Google/Bing keresést a márka/típus/szín alapján, gyors linket adva az aktuális árakhoz.
- 💶 **Tizedesár támogatás** – A filamentek ármezője mostantól elfogadja a tizedeseket (14.11 € stb.), a bevitel automatikusan validálva és formázva mentődik.
- 🌐 **Fordított keresés fallback** – Ha a Tauri shell nem tudja megnyitni a böngészőt, az alkalmazás automatikusan új lapot nyit, így a keresés minden platformon működik.

### v0.4.99 (2025)
- 🧾 **Kalkulátorba épített G-code import** – Új modális `SlicerImportModal` a kalkulátor tetején, amely G-code/JSON exportokból egy kattintással átemeli a nyomtatási időt, filament mennyiséget és árajánlat piszkozatot hoz létre.
- 📊 **Fejlécből származó slicer adatok** – A G-code fejléc `total filament weight/length/volume` értékei automatikusan átveszik az összesítéseket, pontosan kezelve a színcserék veszteségeit is.

### v0.4.98 (2025)
- 🧵 **Multicolor filament támogatás** – A filament könyvtár és a kezelő UI most már külön jelöli a többszínű (rainbow/dual/tricolor) szálakat, megjegyzéssel és szivárvány előnézettel.
- 🌐 **Automatikus fordítás a CSV importnál** – A külső adatbázisból importált színnevek magyar és német címkéket kapnak, így a színválasztó többnyelvű marad kézi szerkesztés nélkül.
- 🔄 **Update könyvtár összevonás** – A `update_filamentLibrary.json` fájl tartalma induláskor automatikusan deduplikálva egyesül a meglévő könyvtárral, a felhasználói módosítások felülírása nélkül.
- 📁 **CSV konverter frissítése** – A `convert-filament-csv.mjs` script már nem írja felül a tartós `filamentLibrary.json`-t, helyette update fájlt készít és többnyelvű címkéket generál.
- ✨ **Animációs élmény tuning** – Új oldalváltási opciók (flip, parallax), mikrointerakció-stílus választó, pulzáló visszajelzések, filament könyvtár skeleton lista és finomhangolt kártya hover effektek.
- 🎨 **Téma műhely bővítések** – Négy új beépített téma (Forest, Pastel, Charcoal, Midnight), aktív téma azonnali duplikálása egyedi szerkesztéshez, továbbfejlesztett gradient/kontraszt kezelés és egyszerűsített megosztási folyamat.

### v0.4.0 (2025)
- 🧵 **Filament adatbázis integráció** – 2 000+ gyári szín beépített JSON könyvtárból (filamentcolors.xyz snapshot), márkánként és anyagonként rendezve
- 🪟 **Fix méretű választó panelek** – Gombbal nyíló, kereshető, görgethető márka- és típuslisták, amelyek kizárják egymást, így átláthatóbb az űrlap
- 🎯 **Színválasztó fejlesztések** – Könyvtári elemek felismerésekor automatikusan beáll a finish és a hex kód, egyedi módra váltáskor külön mezők állnak rendelkezésre
- 💾 **Filament könyvtár szerkesztő** – Új beállítási fül popup űrlappal, duplikációkezeléssel és Tauri FS alapú tartós `filamentLibrary.json` mentéssel
- 📄 **Dokumentáció frissítése** – Új bullet a fő feature listában a filament színkönyvtárhoz, README/FEATURE_SUGGESTIONS takarítás

### v0.3.9 (2025)
- 🔍 **Árajánlat szűrő presetek** – Menthető, elnevezhető szűrő beállítások, alapértelmezett gyors presetek (Ma, Tegnap, Heti, Havi stb.) és egy kattintásos alkalmazás/törlés
- 📝 **Státuszváltási megjegyzések** – Új modal az árajánlat státusz módosításához opcionális jegyzettel, amely eltárolódik a státusz előzményekben
- 🖼️ **PDF export bővítés** – A filamentekhez tárolt képek megjelennek a PDF táblázatban, nyomtatásra optimalizált stílussal
- 🧾 **Céges branding adatlap** – Cégnév, cím, adószám, bankszámlaszám, elérhetőség és logó feltöltése; automatikusan bekerül a PDF fejlécebe
- 🎨 **PDF sablon választó** – Három stílus (Modern, Minimalista, Professzionális) közül választható az árajánlat kinézete
- 👁️ **Beépített PDF előnézet** – Külön gomb az árajánlat részleteinél az azonnali vizuális ellenőrzéshez export előtt
- 📊 **Státusz dashboard** – Státusz kártyák összesítéssel, gyors státusz-szűrők és legutóbbi státuszváltások idővonala az árajánlatoknál
- 📈 **Statisztikai grafikonok** – Bevétel/költség/profit trendchart, filament megoszlás torta diagram, nyomtatónkénti bevétel oszlopdiagram, mindez SVG/PNG formátumban exportálható, valamint egy PDF-be is menthető

### v0.3.8 (2025)
- 🐛 **Riport számok formázás javítása** - 2 tizedesjegyig formázás a riportban:
  - Fő statisztikák kártyák (Bevétel, Kiadás, Profit, Árajánlatok): `formatNumber(formatCurrency(...), 2)`
  - Grafikon feletti értékek: `formatNumber(formatCurrency(...), 2)`
  - Részletes statisztikák (Átlagos profit/árajánlat): `formatNumber(formatCurrency(...), 2)`
  - Most már konzisztens a kezdőlappal (pl. `6.45` helyett `6.45037688333333`)
- 🎨 **Beállítások tab navigáció javítása** - Háttér és betűszín javítása:
  - Tab navigációs rész háttér: `rgba(255, 255, 255, 0.85)` gradient témáknál + `blur(10px)`
  - Tab gombok háttér: Aktív `rgba(255, 255, 255, 0.9)`, nem aktív `rgba(255, 255, 255, 0.7)` gradient témáknál
  - Tab gombok szövegszín: `#1a202c` (sötét) gradient témáknál az olvashatóságért
  - Hover effektek: `rgba(255, 255, 255, 0.85)` gradient témáknál
  - Backdrop filter: `blur(8px)` tab gomboknál, `blur(10px)` navigációs résznél

### v0.3.7 (2025)
- 🎨 **Dizájn modernizálás** - Teljes vizuális átalakítás animációkkal és új témákkal:
  - Új témák: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 új modern téma)
  - Framer Motion animációk integrálva (fadeIn, slideIn, stagger, hover effects)
  - Glassmorphism effekt gradient témáknál (blur + átlátszó háttér)
  - Neon glow effekt neon/cyberpunk témáknál
  - Modernizált kártyák és felületek (nagyobb padding, kerekített sarkok, jobb árnyékok)
- 🎨 **Színezés javítások** - Jobb kontraszt és olvashatóság minden témához:
  - Gradient témáknál sötét szöveg (#1a202c) fehér/könnyű háttéren
  - Input mezők, label-ek, h3-ak színezése javítva minden komponensben
  - Konzisztens színkezelés minden oldalon (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Text shadow hozzáadva gradient témáknál a jobb olvashatóságért
- 📊 **Táblázat stílusok javítása** - Homályosabb háttér és jobb szöveg kontraszt:
  - Háttérszín: rgba(255, 255, 255, 0.85) gradient témáknál (előtte 0.95)
  - Backdrop filter: blur(8px) homályosabb hatásért
  - Szöveg szín: #333 (sötétszürke) gradient témáknál a jobb olvashatóságért
  - Cellák háttér: rgba(255, 255, 255, 0.7) homályosabb hatásért
- 🎨 **Kártyák háttérszínek javítása** - Homályosabb háttér, jobb olvashatóság:
  - Háttérszín: rgba(255, 255, 255, 0.75) gradient témáknál (előtte 0.95)
  - Backdrop filter: blur(12px) erősebb homályosításért
  - Opacity: 0.85 mattabb hatásért
  - Szöveg szín: #1a202c (sötét) gradient témáknál
- 📈 **Home oldal modernizálás** - Heti/havi/éves statisztikák és időszak összehasonlítás:
  - Időszak összehasonlító kártyák (Heti, Havi, Éves) színes accent sávokkal
  - StatCard komponensek modernizálva (ikonok színes háttérrel, accent sávok)
  - Összefoglaló szekció kártyákba rendezve ikonokkal
  - Period Comparison szekció hozzáadva
- 🐛 **Dátum szűrés javítás** - Pontosabb időszak szűrés:
  - Idő nullázása (00:00:00) pontos összehasonlításhoz
  - Felső határ beállítása (ma is beleszámít)
  - Heti: utolsó 7 nap (ma is beleszámít)
  - Havi: utolsó 30 nap (ma is beleszámít)
  - Éves: utolsó 365 nap (ma is beleszámít)
- 🎨 **Sidebar modernizálás** - Ikonok, glassmorphism, neon glow effektek
- 🎨 **ConfirmDialog modernizálás** - Téma prop hozzáadva, harmonizált színezés

### v0.3.6 (2025)
- 🎨 **Settings UI átrendezése** - Tab rendszer (Általános, Megjelenés, Speciális, Adatkezelés) jobb UX-ért és tisztább navigáció
- 🌐 **Fordítások javítása** - Minden hardcoded magyar szöveg lefordítva minden komponensben (HU/EN/DE):
  - Calculator: "3D nyomtatási költség számítás"
  - Filaments: "Filamentek kezelése és szerkesztése"
  - Printers: "Nyomtatók és AMS rendszerek kezelése"
  - Offers: "Mentett árajánlatok kezelése és exportálása"
  - Home: Statisztikák címei, összefoglaló, CSV export címkék (óra/Std/hrs, db/Stk/pcs)
  - VersionHistory: "Nincsenek elérhető verzió előzmények"
- 💾 **Verzió történet cache rendszer** - Fizikai mentés localStorage-ba, 1 óránkénti GitHub ellenőrzés:
  - Checksum alapú változás észlelés (csak új release-eknél tölti le)
  - Nyelvenként külön cache (magyar/angol/német)
  - Gyors nyelvváltás cache-ből (nincs újrafordítás)
  - Automatikus cache invalidálás új release esetén
- 🌐 **Okos fordítás** - Csak új release-eket fordítja le, régi fordításokat használja cache-ből:
  - Cache validálás (ne cache-elje, ha ugyanaz a szöveg)
  - MyMemory API fallback, ha nem sikerül fordítás
  - Hibaszámláló auto-reset (5 perc után resetelődik)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate eltávolítva** - Csak MyMemory API használata (400-as hibák megszűntek, GET request, nincs CORS)
- 🔄 **Retry gomb refaktorálás** - Egyszerűbb trigger mechanizmus useEffect-tel
- 🐛 **Build hibák javítása** - JSX indentációs problémák javítva (Settings.tsx Export/Import szekció)

### v0.3.5 (2025)
- ✅ **MyMemory API integráció** - Ingyenes fordító API LibreTranslate helyett
- ✅ **GitHub releases oldal megnyitása** - Gomb a GitHub releases oldal megnyitásához rate limit esetén
- ✅ **Rate limit hibakezelés javítása** - Egyértelmű hibaüzenetek és retry gomb
- 🐛 **Build hibák javítása** - Unused import-ok eltávolítása (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Input validáció fejlesztése** - Központi validációs utility létrehozása és integrálása Calculator, Filaments, Printers komponensekbe
- ✅ **Validációs hibaüzenetek** - Többnyelvű (HU/EN/DE) hibaüzenetek toast értesítésekkel
- ✅ **Performance optimalizálás** - Lazy loading komponensek (code splitting), useMemo és useCallback optimalizálás
- ✅ **Platform specifikus inicializálás** - macOS, Windows, Linux platform specifikus inicializálás alapok
- 🐛 **Build hiba javítás** - Printers.tsx kontextus menü funkciók hozzáadása

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
- ✏️ **Árajánlat szerkesztés** - Mentett árajánlatok szerkesztése (ügyfél név, elérhetőség, leírás, profit százalék, filamentek)
- ✏️ **Filamentek szerkesztése árajánlatban** - Filamentek módosítása, hozzáadása, törlése az árajánlaton belül
- ✏️ **Szerkesztés gomb** - Új szerkesztés gomb a törlés gomb mellett az árajánlatok listában
- 📊 **Statisztikák export funkció** - Statisztikák exportálása JSON vagy CSV formátumban a Home oldalról
- 📈 **Riport generálás** - Heti/havi/éves/összes riport generálása JSON formátumban időszak szerinti szűréssel
- 📋 **Verzió előzmények megjelenítése** - Verzió előzmények megtekintése a beállításokban, GitHub Releases API integrációval
- 🌐 **GitHub releases fordítása** - Automatikus fordítás magyar -> angol/német (MyMemory API)
- 💾 **Fordítás cache** - localStorage cache fordított release notes-hoz
- 🔄 **Dinamikus verzió történet** - Beta és release verziók külön megjelenítése
- 🐛 **Bugfixek** - Használaton kívüli változók eltávolítása, kód tisztítás, linter hibák javítása

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
- ⌨️ **Gyorsbillentyűk** - `Ctrl/Cmd+N` (új), `Ctrl/Cmd+S` (mentés), `Escape` (mégse), `Ctrl/Cmd+?` (súgó)
- ⌨️ **Gyorsbillentyűk macOS javítás** - Cmd vs Ctrl kezelés, capture phase event handling
- ⏳ **Loading states** - LoadingSpinner komponens betöltési állapotokhoz
- 💾 **Backup és restore** - Teljes adatmentés és visszaállítás Tauri dialog és fs pluginokkal
- 🛡️ **Error boundaries** - React ErrorBoundary alkalmazás szintű hibakezeléshez
- 💾 **Automatikus mentés** - Debounced auto-save beállítható intervallummal (alapértelmezett 30 másodperc)
- 🔔 **Értesítési beállítások** - Toast értesítések be/ki kapcsolása és időtartam beállítása
- ⌨️ **Shortcut help menü** - Gyorsbillentyűk listája modal ablakban (`Ctrl/Cmd+?`)
- 🎬 **Animációk és transitions** - Smooth transitions és keyframe animációk (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltip-ek** - Kontextuális segítség minden fontos elemhez hover-re
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
- 🐛 **Leírás mező javítás**: Hosszú szövegek helyesen tördelődnek.

---

**Verzió**: 0.5.58

Ha bármilyen kérdésed van vagy hibát találsz, nyiss egy issue-t a GitHub repository-ban!

