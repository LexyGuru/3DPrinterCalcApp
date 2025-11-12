# 3D Printer Calculator App – GitHub Wiki

## 📌 Gyors összefoglaló

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

