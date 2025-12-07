# 3D Printer Calculator App – GitHub Wiki

> **🌍 Language / Nyelv / Sprache / Idioma / Lingua / Język / Jazyk / Língua / Langue / 语言**  
> [🇭🇺 Magyar](#magyar-verzió) | [🇬🇧 English](#english-version) | [🇩🇪 Deutsch](#deutsch-version) | [🇪🇸 Español](#español-version) | [🇮🇹 Italiano](#italiano-version) | [🇵🇱 Polski](#polski-version) | [🇨🇿 Čeština](#čeština-version) | [🇸🇰 Slovenčina](#slovenčina-version) | [🇵🇹 Português](#português-version) | [🇫🇷 Français](#français-version) | [🇨🇳 中文](#中文版本)

---

<a name="magyar-verzió"></a>
## 🇭🇺 Magyar verzió

### 📌 Gyors összefoglaló

|                     |                                                                 |
|---------------------|-----------------------------------------------------------------|
| **Aktuális verzió** | `v0.5.56`                                                       |
| **Platformok**      | macOS · Linux · Windows (Tauri natív build)                     |
| **Technológiák**    | Frontend: React 19 · TypeScript · Vite · Framer Motion          |
|                     | Backend: Rust · Tauri v2 · Tauri Plugins                        |
| **Fő cél**          | 3D nyomtatási költségszámítás, árajánlat-kezelés és riportálás  |

> **Legutóbbi újdonságok (v0.5.56)**  
> - Teljes nyelvi fordítások elkészítve 6 nyelven: cseh, spanyol, olasz, lengyel, portugál, szlovák  
> - Minden nyelvi fájl tartalmazza az összes 813 fordítási kulcsot  
> - Tauri engedélyek javítása: update_filamentLibrary.json explicit engedélyezése  
> - Dokumentáció frissítve a 0.5.56-os kiadás bejegyzéseivel  

---

## 📚 Tartalomjegyzék

1. [Projekt célja és víziója](#-projekt-célja-és-víziója)  
2. [Architektúra áttekintés](#-architektúra-áttekintés)  
3. [Modulok és funkciók](#-modulok-és-funkciók)  
4. [Adatmodell & perzisztencia](#-adatmodell--perzisztencia)  
5. [Témák, animációk, UX](#-témák-animációk-ux)  
6. [Telepítés & előfeltételek](#-telepítés--előfeltételek)  
7. [Fejlesztői munkafolyamat](#-fejlesztői-munkafolyamat)  
8. [Használati útmutató](#-használati-útmutató)  
9. [Build és release menedzsment](#-build-és-release-menedzsment)  
10. [Troubleshooting & FAQ](#-troubleshooting--faq)  
11. [Biztonság, jogosultságok, adatkezelés](#-biztonság-jogosultságok-adatkezelés)  
12. [Roadmap, ötletek, kizárt fejlesztések](#-roadmap-ötletek-kizárt-fejlesztések)  
13. [Hozzájárulás és kódminőség](#-hozzájárulás-és-kódminőség)  
14. [Licenc, kapcsolódó dokumentumok](#-licenc-kapcsolódó-dokumentumok)

---

## 🎯 Projekt célja és víziója
- Pontos és gyors 3D nyomtatási költségkalkuláció  
- Ügyfélbarát árajánlat pipeline (verziózás, PDF export, státusz management)  
- Teljes körű filament és nyomtató adatbázis kezelés (gyári + egyedi adatok)  
- Multiplatform desktop alkalmazás alacsony memóriaigénnyel (Tauri)  
- Testreszabható vizuális élmény (témák, animációk, lokalizáció)  

---

## 🏗 Architektúra áttekintés

### Fő komponensek
- **Frontend (React 19 · TypeScript)**  
  SPA felépítés, moduláris komponensek (`frontend/src/components`)  
  Egyedi design rendszer (`utils/styles.ts`, `themes.ts`)  

- **Backend (Rust · Tauri v2)**  
  `src-tauri/src/main.rs` – parancskezelés, plugin inicializálás  
  `tauri.conf.json` – build/config, AppConfig path, plugin jogosultságok  

- **Plugin réteg**
  - `@tauri-apps/plugin-dialog` – natív file/confirm párbeszédek  
  - `@tauri-apps/plugin-fs` – AppConfig fájlműveletek (`filamentLibrary.json`, stb.)  
  - `tauri-plugin-store` – strukturált adat tárolás (`settings`, `printers`, `offers`)  
  - `tauri-plugin-log` – belső logolás, Console modul  

### Adatáramlás (magas szint)
1. **UI esemény** → Redux-szerű helyi state (`useState`, `useReducer`, custom store)  
2. **Persist** → auto-save Tauri store / fs (debounced)  
3. **Sync** → filament library frissítése, deduplikáció, watchers  

---

## 🧩 Modulok és funkciók

| Modul | Fő funkciók | Megjegyzések |
|-------|-------------|--------------|
| **Home / Dashboard** | Statisztikák, idősorok, export | SVG/PNG/JSON export, timeframe switcher, derive stats |
| **Filaments** | Könyvtár + egyedi filamentek | Multicolor, duplikátum jelzés, CSV import |
| **Printers / AMS** | Nyomtató kezelés | AMS slot 0-4, watt, használati költség, drag & drop |
| **Calculator** | Költség bontás, template kezelés | Filament/Idő/Profit paraméterezés, template mentés |
| **Offers** | Árajánlat pipeline | Verziózás, státusz log, PDF export (brand header) |
| **Settings** | Témák, animációk, backup, import/export | Custom theme editor, micro-interaction stílusok |
| **Console** | Log viewer | Tauri log + window error + unhandled promise rejection |

### Kiemelt UI megoldások
- **Popup formok** (add/edit), modal alapú megerősítések  
- **Skeleton képernyők** – `frontend/src/components/LoadingSkeleton.tsx`  
- **Framer Motion** – animált transzformációk, hover-lift helper (`utils/animations.tsx`)  
- **Responsive layout** – sidebar + reszponzív grid (inline style rendszer)

---

## 💾 Adatmodell & perzisztencia

### Főbb fájlok
- `filamentLibrary.json` – tartós filament könyvtár (AppConfig)  
- `update_filamentLibrary.json` – app induláskor beolvasott update csomag (duplikátum-szűrés)  
- Tauri store (JSON) – `settings`, `printers`, `filaments`, `offers`  
- Backup/restore modul – teljes dump / visszatöltés (Settings > Adatkezelés)

### Auto-save és merge logika
- Debounced mentés (30 másodperc), `defaultSettings.autosave`  
- CSV import pipeline: HU/DE címkék, "Nincs kód" → multicolor  
- Duplikátum törlés UI: extra labelezés és tömeges takarítás  

### Adatstruktúrák
- `types.ts` – `Filament`, `Printer`, `Offer`, `Settings`, `AnimationSettings`, `RawLibraryEntry`, stb.  
- `filamentLibrary.ts` – normalizálás, ID generálás, dedupe, index kezelés  

---

## 🎨 Témák, animációk, UX

- **Téma presetek** – Light, Dark, Blue, Green, Purple, Orange, Gradient, Neon, Cyberpunk, Sunset, Ocean, Forest, Pastel, Charcoal, Midnight  
- **Custom theme builder** – paletta, gradient, leírás, export/import, megosztás, duplikálás  
- **Animációs panel** – oldalváltás (flip/parallax), mikrointerakció (subtle/expressive/playful), feedback (pulse/emphasis), skeleton  
- **Multicolor támogatás** – gradient swatch, `ColorMode` (solid/multicolor)  
- **Lokalizáció** – HU/EN/DE teljes fordítás, plusz előkészített FR/IT/ES/PL/CS/SK/PT-BR/zh-CN fájlok (angol fallback), automatikus fordítás MyMemory API-on keresztül (`convert-filament-csv.mjs`)

---

## 🧱 Telepítés & előfeltételek

### Általános
```bash
rustup default stable
npm install -g pnpm
cargo install tauri-cli
```

### Platform-specifikus
- **macOS** – `xcode-select --install`  
- **Linux** – `sudo apt install libwebkit2gtk-4.1-dev ...` (lásd README)  
- **Windows** – Visual Studio Build Tools + Windows SDK, `winget install tauri-cli?` (opcionális)

---

## 👩‍💻 Fejlesztői munkafolyamat

```bash
# első telepítés
pnpm install --prefix frontend

# frontend fejlesztői mód
cd frontend
pnpm dev

# tauri dev build
cd ../src-tauri
cargo tauri dev
```

### Script-ek
- `build-frontend.sh` – gyors frontend build  
- `dev-frontend.sh` – frontend dev server indítása  
- `run-frontend-dev.sh` – combined workflow (ha szükséges)

### Lint & format
- `pnpm lint` – ESLint (React, TS, hooks)  
- `cargo fmt` / `cargo clippy` – Rust oldalon (jelenleg manuális)  
- `read_lints` IDE integráció – gyors modul specifikus ellenőrzés

---

## 🧭 Használati útmutató

1. **Nyomtató konfigurálás**  
   Új nyomtató → név, típus, teljesítmény, AMS slot → mentés  
2. **Filament import/szerkesztés**  
   Könyvtár böngészése, multicolor jelölés, CSV update import (`update_filamentLibrary.json`)  
3. **Kalkuláció**  
   Filament mennyiség (gramm), idő, szárítás, ár/ kg → költség bontás  
4. **Árajánlat pipeline**  
   Mentés → verzió követés → státusz váltások (dashboard log)  
5. **PDF export**  
   Letöltés → natív dialog → PDF tartalmaz logót, brand blokkot, filament képeket  
6. **Statisztika / Riport**  
   Időszak váltás, export JSON/CSV, diagram export SVG/PNG  
7. **Beállítások & backup**  
   Témák, animációk, import/export, adatok mentése/visszaállítása

---

## 📦 Build és release menedzsment

- **Branch stratégia**  
  - `main`: stabil release  
  - `beta`: aktív fejlesztés, automatikus GitHub Actions build  

- **Release folyamat**  
  1. Verzió bump (`frontend/src/utils/version.ts`, `src-tauri/Cargo.toml`, `tauri.conf.json`)  
  2. README / Wiki frissítés (release notes)  
  3. `pnpm lint` + manuális smoke teszt  
  4. Commit (`release: bump version to X.Y.Z`)  
  5. Push `beta` → GitHub Actions build  
  6. Merge `main` + GitHub Release (ha stabil kiadás)  

- **Output**  
  - macOS `.app` + `.dmg`  
  - Windows `.msi`  
  - Linux `.deb` és `AppImage`

---

## 🛠 Troubleshooting & FAQ

| Probléma | Megoldás |
|----------|----------|
| **Nem írható `filamentLibrary.json`** | Ellenőrizd a Tauri capabilities (`src-tauri/capabilities/default.json`) és AppConfig path-et |
| **`fs.exists not allowed` hiba** | `@tauri-apps/plugin-fs` jogosultságok kiegészítése (read/write text file) |
| **SSL hiba git push közben** | Lokális cert lánc konfigurálása vagy `required_permissions: ['all']` a művelethez |
| **Túl sok felhasználói adat** | Export + backup után purge-elhető a store (`settings > Reset / Restore defaults`) |
| **Linter hibák** | Projekt szintű `any` figyelmeztetések ismert backlogban, modul commit előtt `read_lints`-et futtass |

---

## 🔐 Biztonság, jogosultságok, adatkezelés

- **Tauri capabilities** – minimalizált fs jogosultság: AppConfig path-specifikus read/write (filament könyvtár), store plugin  
- **Mentett adatok helye**  
  - macOS: `~/Library/Application Support/com.lekszikov.3dprintercalcapp/`  
  - Linux: `~/.local/share/com.lekszikov.3dprintercalcapp/`  
  - Windows: `%APPDATA%\com.lekszikov.3dprintercalcapp\`  
- **Kereskedelmi licenc** – MIT, de kereskedelmi felhasználás csak írásos engedéllyel  
- **Adatvédelmi fókusz** – nincs hálózati adatküldés beépítve, CSV import manuális

---

## 🗺 Roadmap, ötletek, kizárt fejlesztések

- **Javaslatok** – lásd [`FEATURE_SUGGESTIONS.md`](../FEATURE_SUGGESTIONS.md)  
- **Kizárt funkciók** – lásd [`EXCLUDED_FEATURES.md`](../EXCLUDED_FEATURES.md)  
- Prioritások: animáció bővítés, téma testreszabás, adat import pipeline fejlesztés (v0.4.98-ban teljesítve)  
- Következő fókusz lehet: további statisztikák, mobil friendly layout (jelenleg desktop fókuszú)

---

## 🤝 Hozzájárulás és kódminőség

- **Workflow** – fork → feature branch → lint/test → PR  
- **Kód stílus** – TypeScript strict, preferált típus-definiálás, inline style theme használata  
- **Hook konvenciók** – `useMemo`, `useCallback`, `useEffect` dependency lista betartása  
- **Logolás** – `Console` modul figyeli, ne hagyj `console.log`-ot production modulban  
- **Review checklist**  
  - UI regressziók ellenőrzése (különösen Settings/Filaments)  
  - Téma és animáció kompatibilitás (gradient vs. solid)  
  - Perzisztencia (backups / JSON parse)  
- **Issue template** – bug report: OS, verzió, reprodukció, log, screenshot (ha van)

---

## 📝 Licenc, kapcsolódó dokumentumok

- **Licenc**: MIT (kereskedelmi használat engedéllyel)  
  Tulajdonos: **Lekszikov Miklós (LexyGuru)**
- **Kapcsolat**: GitHub Issues, Discussions

### Kiegészítő dokumentumok
- [README.md](../README.md) – részletes funkciólista, telepítés, verziótörténet  
- [BUILD.md](../BUILD.md) – platformonkénti build útmutató  
+- [HOW_TO_BUILD_APP.md](../HOW_TO_BUILD_APP.md) – standalone release készítés  
+- [VERSIONING.md](../VERSIONING.md) – verziózás, release folyamat  
+- [CREATE_FIRST_RELEASE.md](../CREATE_FIRST_RELEASE.md) – GitHub release lépései  

---

**Verzió**: `0.5.56`
Ha kérdésed van vagy hibát találsz, nyiss issue-t a GitHub repóban! 🎯

---

<a name="english-version"></a>
## 🇬🇧 English Version

*For English version, see [GITHUB_WIKI_HOME.en.md](../GITHUB_WIKI_HOME.en.md)*

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

---

## 📖 GitHub Wiki-n való használat útmutatója

### Hogyan lehet többnyelvű Wiki-t létrehozni GitHub-on?

A GitHub Wiki-nál több módszer is létezik többnyelvű dokumentáció létrehozására:

#### **Módszer 1: Külön Wiki oldalak nyelvenként (Ajánlott)**

1. **Wiki oldalak létrehozása:**
   - Lépj be a GitHub repóba → **Wiki** fül
   - Kattints az **"New Page"** gombra
   - Hozz létre külön oldalakat:
     - `Home` (vagy `Home-hu`) – magyar verzió
     - `Home-en` – angol verzió
     - `Home-de` – német verzió
     - stb.

2. **Főoldal (Home) beállítása nyelvi switcherrel:**
   ```markdown
   # 3D Printer Calculator App – Wiki
   
   > **🌍 Válassz nyelvet / Choose Language / Sprache wählen**
   > 
   > - [🇭🇺 Magyar](Home-hu)
   > - [🇬🇧 English](Home-en)
   > - [🇩🇪 Deutsch](Home-de)
   > - [🇪🇸 Español](Home-es)
   > - stb.
   ```

3. **Minden nyelvi oldal másolása:**
   - Másold be a `GITHUB_WIKI_HOME.md` tartalmát a `Home-hu` oldalba
   - Másold be a `GITHUB_WIKI_HOME.en.md` tartalmát a `Home-en` oldalba
   - Stb.

#### **Módszer 2: Egy oldal több nyelvi verzióval (jelenlegi megoldás)**

Ez a módszer akkor jó, ha egyetlen oldalon szeretnéd megjeleníteni az összes nyelvet:

1. **Wiki oldal létrehozása:**
   - Hozz létre egy `Home` oldalt a Wiki-ben
   - Másold be a jelenlegi `GITHUB_WIKI_HOME.md` tartalmát

2. **Előnyök:**
   - Minden nyelv egy helyen
   - Könnyű karbantartás
   - Anchor linkekkel navigálható

3. **Hátrányok:**
   - Hosszabb oldal (görgetés szükséges)
   - Nehezebb külön nyelvi oldalakat linkelni

#### **Módszer 3: Git-alapú Wiki kezelés (Fejlett)**

A GitHub Wiki egy külön Git repository-ként működik:

```bash
# Wiki repository klónozása
git clone https://github.com/FELHASZNÁLÓNÉV/REPÓNÉV.wiki.git

# Fájlok szerkesztése lokálisan
cd REPÓNÉV.wiki
# Szerkeszd a fájlokat

# Változások commitolása és pusholása
git add .
git commit -m "Add multilingual support"
git push origin master
```

**Előnyök:**
- Verziókezelés
- Batch szerkesztés
- Automatizálható (CI/CD)

### Ajánlott struktúra GitHub Wiki-n

```
Wiki Root
├── Home (nyelvi switcher)
├── Home-hu (Magyar)
├── Home-en (English)
├── Home-de (Deutsch)
├── Installation-hu
├── Installation-en
├── Installation-de
├── Contributing-hu
├── Contributing-en
└── ...
```

### Tippek

1. **Konzisztens elnevezés:** Használj `-hu`, `-en`, `-de` szuffixeket
2. **Főoldal nyelvi switcher:** Mindig legyen egy főoldal, ahonnan könnyen navigálható
3. **Anchor linkek:** Használj anchor linkeket (`#section`) a hosszabb oldalakon belüli navigációhoz
4. **Frissítés:** Amikor új funkciót adsz hozzá, frissítsd az összes nyelvi verziót

### Példa: Wiki oldal létrehozása GitHub-on

1. Menj a repó **Wiki** fülre
2. Kattints **"New Page"**-re
3. Add meg az oldal nevét (pl. `Home-en`)
4. Másold be a megfelelő markdown tartalmat
5. Kattints **"Save Page"**-re

**Megjegyzés:** A jelenlegi `GITHUB_WIKI_HOME.md` és `GITHUB_WIKI_HOME.en.md` fájlok közvetlenül másolhatók a GitHub Wiki-be!

