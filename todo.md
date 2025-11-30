Magas prioritás – rövid, fejlesztői TODO lista  
(Ami **[x]**, az már kész; ami **[ ]**, az még kódolandó. A teljes, részletes állapot a `FEJLESZTESI_OSSZEFOGLALO.md` elején van.)

1. Widget interaktivitás fejlesztése
[x] Grafikon-kattintás + részletes nézet (pl. TrendChartWidget, PrintTimeChartWidget, CustomerStatsChartWidget) – **KÉSZ v1.6.0 (InteractiveChart modal + kattintás minden fő grafikonon)**
[x] Részletes tooltip-ek (több adat egy pontnál, formázott értékek) – **KÉSZ v1.6.0 (lokalizált címkék, egységes valueFormatter/labelFormatter)**
[x] Időszak szűrés közvetlenül a grafikonról (heti/havi/éves váltó) – **KÉSZ v1.6.0 (TrendChartWidget → InteractiveChart Brush, Home-ban trendRange szeletelés a Dashboard felé)**
[x] Export gomb grafikonokra (legalább PNG/SVG) – **KÉSZ (grafikon export SVG-ként v1.3.x)**

[x] Virtuális scroll nagy listákhoz – **KÉSZ v1.6.0 (Offers lista + Filaments táblázat + Beállítások → Filament könyvtár virtualizálása nagy listákhoz)**
[x] Oszlop szűrés + többszörös rendezés – **KÉSZ v1.6.0 (Filaments + Offers: többoszlopos rendezés, rendezési beállítások mentése, egyszerű oszlop-szűrők a fő mezőkre)** 
[ ] Inline szerkesztés néhány kulcsmezőre – **NEM PRIORITÁS / JELENLEGI DESIGNBAN NEM KELL (modal alapú szerkesztés marad)** 
[x] Többszörös kijelölés + tömeges műveletek – **KÉSZ (Filaments/Printers/Customers)**  

3. Riasztások / emlékeztetők (widgetek mögötti logika)
[x] Filament készlet riasztások backend/logika (filament-stock-alert widget mögé) – **KÉSZ (külön készlet nézet + küszöbök + widget v1.5.0)**  
[x] Árajánlat-határidő emlékeztetők alap logikája – **KÉSZ (Scheduled Tasks + header emlékeztetők v1.5.0)**  
[x] Backup utility funkciók implementálása (automatikus backup, cleanup, reminder logika) – **KÉSZ v1.7.0 (backup.ts: createAutomaticBackup, cleanupOldBackups, shouldShowBackupReminder, getLastBackupDate)**
[x] Backup reminder hook létrehozása – **KÉSZ v1.7.0 (backupReminder.ts: useBackupReminder hook)**
[x] Settings interface bővítése backup beállításokkal – **KÉSZ v1.7.0 (backupReminderEnabled, backupReminderIntervalDays, automaticBackupEnabled, stb.)**
[x] Verziószámok frissítése v1.7.0-ra – **KÉSZ v1.7.0 (Cargo.toml, version.ts, tauri.conf.json)**
[x] Backup reminder UI komponens/értesítés megjelenítése – **KÉSZ v1.7.0 (BackupReminder komponens + Toast integráció + App.tsx integráció, tutorial alatt nem jelenik meg)**
[x] Autosave alapértelmezett érték kikapcsolva – **KÉSZ v1.7.0 (types.ts: defaultSettings.autosave = false)**
[x] Automatikus backup napi logika implementálása (naponta csak egy fájl, frissítés ha már van) – **KÉSZ v1.7.0 (backup.ts: hasTodayBackup, createAutomaticBackup módosítva)**
[x] Automatikus backup 5 napos törlési logika – **KÉSZ v1.7.0 (backup.ts: cleanupOldBackupsByDays, 5 nap után automatikus törlés)**
[x] Backup history funkció implementálása – **KÉSZ v1.7.0 (backup.ts: getAutomaticBackupHistory, getDeletionCountdown)**
[x] Autosave modal ablak az autosave bekapcsolásakor – **KÉSZ v1.7.0 (Settings.tsx: modal magyarázattal és figyelmeztetéssel)**
[x] Backup History UI a Settings-ben – **KÉSZ v1.7.0 (Settings.tsx: színes lista zöld/sárga/piros, törlési számláló)**
[x] Header javítás - "Utolsó mentés" logika javítása – **KÉSZ v1.7.0 (Header.tsx: mindig látható, "Még nem volt mentés" ha nincs lastBackupDate)**
[x] Betöltési képernyő átalakítása (fix layout, logo, animációk) – **KÉSZ v1.7.0 (AppSkeleton.tsx: fix layout pipákhoz, logo animáció, shimmer effekt, pulsing dots, scroll container)**
[x] Betöltési folyamat javítása (lassítva, hibakezelés, fizikai log) – **KÉSZ v1.7.0 (App.tsx: 800ms késleltetések, try-catch minden modulnál, frontendLogger minden státuszhoz és hibához, betöltési összefoglaló)**
[x] Autosave és automatikus backup szinkronizálása – **KÉSZ v1.7.0 (App.tsx: autosave mentéskor automatikus backup létrehozása, debouncedAutomaticBackup)**
[x] Factory Reset automatikus backup fájlok törlésével – **KÉSZ v1.7.0 (store.ts: deleteAllAutomaticBackups hívása)**
[x] Backup history automatikus frissítése amikor az autosave bekapcsolódik – **KÉSZ v1.7.0 (Settings.tsx: loadBackupHistory függvény, modal OK gomb, checkbox onChange, useEffect 10 másodpercenkénti frissítés)**
[x] Loading info fordítás hozzáadása minden nyelvhez – **KÉSZ v1.7.0 (13 nyelv: loading.info kulcs minden nyelv fájlhoz)**
[x] Tauri capabilities frissítése backup műveletekhez – **KÉSZ v1.7.0 (capabilities/default.json: fs:allow-exists, fs:allow-read-dir, fs:allow-remove, fs:allow-mkdir, $APPDATA/backups/** permissions)**
[x] Tutorial alatt backup emlékeztető elrejtése – **KÉSZ v1.7.0 (App.tsx: tutorialWillOpen state, BackupReminder feltételes renderelés, lastBackupDate beállítás tutorial indításakor)**
[x] Filament könyvtár színeinek többnyelvű támogatása – **KÉSZ v1.7.0 (getLocalizedLibraryColorLabel függvény, minden támogatott nyelven megjelenítés, fallback logika angol→magyar→német, Settings/GlobalSearch/Filaments komponensek frissítve)**
[x] Factory Reset fájlok törlésének javítása – **KÉSZ v1.7.0 (data.json, filamentLibrary.json, update_filamentLibrary.json törlése, Store instance reset, reload nélküli állapot visszaállítás, nyelvválasztó megjelenítés, resetStoreInstance függvény, onFactoryReset callback)**
[x] Factory Reset Progress Modal implementálása – **KÉSZ v1.8.0 (FactoryResetProgress komponens: 4 lépés animációval, backup/log/config törlése visszajelzéssel, 10 másodperces visszaszámláló, nyelvválasztó indítás, modalból nem lehet kilépni)**
[x] Factory Reset Progress fordítások minden nyelvre – **KÉSZ v1.8.0 (13 nyelv: useTranslation hook integráció, factoryResetProgress kulcsok minden nyelvi fájlhoz, types.ts frissítve)**
[x] Logolás letiltása Factory Reset alatt – **KÉSZ v1.8.0 (fileLogger.ts: setLoggingEnabled/isLoggingDisabled flag, FactoryResetProgress modal megnyitásakor letiltás, consoleLogger ellenőrzés, initFrontendLog blokkolás, nyelvválasztó után újra bekapcsolás)**
[x] data.json létrehozás késleltetése nyelvválasztásig – **KÉSZ v1.8.0 (App.tsx: exists() ellenőrzés Store betöltés nélkül, data.json csak nyelvválasztás után jön létre)**
[x] Log fájl inicializálás késleltetése nyelvválasztásig – **KÉSZ v1.8.0 (App.tsx: initFrontendLog() csak nyelvválasztás után, Factory Reset után nem generálódik azonnal újra)**
[x] Nyelvválasztás után automatikus újraindítás – **KÉSZ v1.8.0 (handleLanguageSelect: initFrontendLog() hívás + 500ms késleltetés után window.location.reload())**
[x] Factory Reset automatikus backup fájlok törlése backend parancsban – **KÉSZ v1.8.0 (commands.rs: delete_all_backups parancs, cross-platform könyvtárak kezelése, Settings.tsx: Factory Reset Progress modal integráció)**
[x] Backup rendszer backend optimalizációja (permissions hibák javítása) – **KÉSZ v1.7.0 (backend commands: cleanup_old_backups_by_days, cleanup_old_backups_by_count, frontend cleanup függvények backend command használata, "forbidden path" hibák elkerülése)**
[x] Backup rendszer performance optimalizációja – **KÉSZ v1.7.0 (hasTodayBackup() optimalizálva: list_backup_files backend command használata, nem olvassa be az összes fájlt, lock mechanizmus párhuzamos backupok megelőzésére)**
[x] Backup directory megnyitása gomb a Settings-ben – **KÉSZ v1.7.0 (Settings.tsx: backup history mellett gomb, get_backup_directory_path + open_directory backend commands használata, fordítva minden nyelvhez)**
[x] Értesítési csatornák egységesítése (Toast / platform notification) – **KÉSZ v1.8.0 (notificationService.ts: központi értesítési service, Toast + platform notification automatikus kezelése, prioritás alapú döntés, visszafelé kompatibilitás a régi platformFeatures.ts függvényekkel)**


4. Logolási rendszer teljes átalakítása és rendszerspecifikus implementáció – **FOLYAMATBAN v1.8.0**
[x] Rendszerspecifikus log útvonalak és fájlnév formátumok (backend/frontend elkülönítése, platform-specifikus könyvtárak) – **KÉSZ v1.8.0 (cross-platform path handling, dirs::data_local_dir(), macOS/Linux/Windows log mappák: frontend-YYYY-MM-DD.log, backend-YYYY-MM-DD.log)**
[x] Rendszerinformációk logolása (System, CPU, Memory, GPU, Disk, App Version) formázott formátumban – **KÉSZ v1.8.0 (systemInfo.ts: getSystemInfo, formatSystemInfoForLog, logSystemInfo, sysinfo crate használata)**
[x] Mappa információk logolása (Log és Backup mappák, fájlok száma, neve, mérete, kiterjesztése) – **KÉSZ v1.8.0 (directoryInfo.ts: getLogDirectoryInfo, getBackupDirectoryInfo, formatDirectoryInfoForLog, logDirectoryInfo)**
[x] Részletes loading státuszok logolása (hiba/figyelmeztetés/kritikus hiba/stb vagy "Minden rendben") – **KÉSZ v1.8.0 (App.tsx: minden modul részletes státusza, writeFrontendLog közvetlen fájlba írás)**
[x] Log szintek implementálása (INFO, WARN, ERROR, DEBUG) – **KÉSZ v1.8.0 (writeFrontendLog támogatja a szinteket, consoleLogger szint alapú logolás)**
[x] Backend (Rust) logolási rendszer fejlesztése (strukturált logok, file output, konzisztens formátum) – **KÉSZ v1.8.0 (commands.rs: init_frontend_log, write_frontend_log, get_system_info, list_log_files, többsoros üzenetek kezelése)**
[x] Frontend (TypeScript) logolási rendszer fejlesztése (strukturált logok, kategóriák szerint, deduplikáció) – **KÉSZ v1.8.0 (fileLogger.ts: writeFrontendLog deduplikáció, consoleLogger.ts: console interception, Dashboard logok szűrése)**
[x] Hibakezelés javítása és részletes logolás (try-catch blokkok, hiba stack trace rögzítése, context információk) – **KÉSZ v1.8.0 (App.tsx: minden modul try-catch, részletes hibaüzenetek, státusz logolás)**
[x] Logolási sorrend javítása (logikus sorrend, duplikációk megszüntetése, FilamentLibrary logok kiszűrése) – **KÉSZ v1.8.0 (appLogging.ts: logApplicationStartup, window-based flags, session management)**
[x] Memória számítás hibájának javítása (sysinfo 0.31 memória értékek helyes konvertálása) – **KÉSZ v1.8.0 (commands.rs: bytes → KB → GB konverzió helyes, sysinfo 0.31 bytes-ban adja vissza, nem KB-ban)**
[x] Fájlméretek lekérése és megjelenítése (log és backup fájlok mérete a directory info-ban) – **KÉSZ v1.8.0 (backend commands: list_log_files és list_backup_files most visszaadják a fájlméreteket is, frontend használja és formázza)**
[x] React stílus figyelmeztetések javítása (border shorthand vs borderTopColor konfliktus) – **KÉSZ v1.8.0 (AppSkeleton.tsx és Tooltip.tsx: border shorthand helyett külön property-k használata)**
[x] Strukturált log fájlok implementálása (JSON/CSV formátum, időbélyeg, szint, komponens, üzenet, stack trace) – **KÉSZ v1.8.0 (JSON formátum támogatás, strukturált log entry interfészek, backend/frontend integráció, Settings UI, 13 nyelv fordítás)**
[x] Log rotáció implementálása (régi logok automatikus törlése) – **KÉSZ v1.8.0 (cleanupOldLogs függvény, delete_old_logs backend command, App.tsx automatikus cleanup 24 óránként, logRetentionDays beállítás)**
[x] Log viewer/parser utility fejlesztése (log fájlok kezelése, szűrése, keresése, exportálása) – **KÉSZ v1.8.0 (LogViewer.tsx komponens: modal megnyitása Settings → Log History → kattintás, szűrés szint szerint (INFO/WARN/ERROR/DEBUG), keresés szöveg alapján highlight-tal, exportálás kiválasztott logok vagy az egész fájl TXT formátumban, strukturált JSON és szöveges logok kezelése, statisztikák megjelenítése, read_log_file backend command)**
[x] Log konfiguráció beállítások a Settings-ben (log szint, log formátum, automatikus törlés napok száma) – **KÉSZ v1.8.0 (logFormátum, logLevel, logRetentionDays beállítások a Settings-ben, 13 nyelv fordítás)**
[x] Log fájl tartalom megőrzése újraindításkor – **KÉSZ v1.8.0 (init_frontend_log módosítva: OpenOptions create+append használata, nem törli a meglévő tartalmat)**
[x] Rendszer diagnosztika funkció implementálása (System Diagnostics modal, Settings → Factory Reset alatt) – **KÉSZ v1.8.0 (SystemDiagnostics.tsx komponens: rendszer info, memória, fájlok, modulok, adattárolás ellenőrzése, progress bar, összefoglaló, újrafuttatás gomb, 13 nyelv fordítás)**
[x] SystemDiagnostics modal végtelen renderelési ciklus javítása (Maximum update depth exceeded hiba) – **KÉSZ v1.8.0 (useCallback ref-ekkel, hasRunRef és isRunningRef megakadályozza a többszöri futtatást, useEffect csak isOpen-től függ)**
[x] SystemDiagnostics modal középre pozicionálása és zárás megakadályozása véletlen kattintás esetén – **KÉSZ v1.8.0 (flexbox konténer alignItems/justifyContent középre, onClick eltávolítva backdrop-ról, stopPropagation a modal tartalmán)**
[x] Performance metrikák logolása (betöltési idők, műveleti idők, memória használat) – **KÉSZ v2.0.0 (performance.ts: PerformanceTimer, logPerformanceMetric, logMemoryUsage, logPerformanceSummary, logPeriodicPerformanceMetrics, betöltési idők logolása App.tsx-ben, rendszeres CPU/memória logolás 5 percenként, részletes üzenetek CPU százalékkal és memória értékekkel)**
[x] Audit log implementálása kritikus műveletekhez (bejelentkezés, adatváltozások, beállítások módosítása) – **KÉSZ v2.0.0 (auditLog.ts: auditCreate, auditUpdate, auditDelete, auditSettingsChange, auditBackup, auditFactoryReset, auditError, backend commands, AuditLogViewer komponens virtuális scroll-lal, Settings-ben audit log history, automatikus cleanup, 13 nyelv fordítás)**

5. Középtávú technikai/biztonsági fejlesztések (összefoglalva a fejlesztési összefoglalóból)
[ ] Ügyféladat titkosítás (AES-256-GCM, `encryption.rs`, jelszó dialógus)
[ ] Opcionális app jelszavas védelem
[ ] TypeScript strict mode bekapcsolása + típusok takarítása
[ ] Unit tesztek (Vitest/Jest) kritikus számításokra és utilokra
[ ] E2E tesztek (Playwright/Cypress) fő felhasználói folyamatokra
[ ] API / integrációs réteg (REST API, későbbi mobil/egyéb integrációkhoz)

6. Projekt / feladat modulok (a meglévő widgetek mögé)
[ ] Projektkezelő modul (ActiveProjectsWidget mögötti domain logika)
[ ] Feladatkezelő modul (ScheduledTasksWidget mögötti domain logika)
[ ] További performance optimalizálás (mélyebb code splitting, virtual scroll több helyen)

7. Tutorial / Demo frissítés
[x] Tutorial lépések frissítése az 1.6.0 és 1.7.0 újdonságokkal (widget interaktivitás, táblázat szűrés/rendezés, virtual scroll, backup rendszer, filament többnyelvű színek) – **KÉSZ v1.7.0 (Tutorial.tsx: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang lépések hozzáadva)**
[x] Tutorial demo adatok bővítése (nagyobb Offers/Filaments lista, több minta projekt/ügyfél az új funkciók bemutatásához) – **KÉSZ v1.7.0 (tutorialDemoData.ts: 6 filament → 11 filament, 3 árajánlat → 5 árajánlat)**
[x] Tutorial fordítási kulcsok hozzáadása minden nyelvhez – **KÉSZ v1.7.0 (13 nyelv: widgetInteractivity, filamentLibraryMultilang, tableSorting, autosaveBackup kulcsok hozzáadva)**

8. Dokumentáció kezelés és verziótörténet szervezés
[x] RELEASE.md fájlok létrehozása minden támogatott nyelvhez – **KÉSZ (RELEASE.hu.md, RELEASE.en.md, RELEASE.de.md, RELEASE.es.md, RELEASE.it.md, RELEASE.pl.md, RELEASE.cs.md, RELEASE.sk.md, RELEASE.pt.md, RELEASE.fr.md, RELEASE.zh.md, RELEASE.uk.md, RELEASE.ru.md - összesen 13 nyelv)**
[x] Verziótörténetek kiemelése a README fájlokból a RELEASE fájlokba (v0.1.55-től v2.0.0-ig minden verzió) – **KÉSZ (minden nyelvi RELEASE fájl tartalmazza a részletes verziótörténetet)**
[x] README fájlok frissítése - részletes verziótörténet eltávolítása, csak hivatkozás a RELEASE fájlokra – **KÉSZ (README.hu.md, README.en.md és minden nyelvi README fájlban csak hivatkozás maradt: "For detailed version history and changelog, please see [RELEASE.xx.md](RELEASE.xx.md)")**
[x] Changelog szakaszok eltávolítása a README fájlokból – **KÉSZ (mind a 13 nyelvi README fájlból eltávolítva a részletes Changelog/Verziótörténet szakaszok)**
[x] GitHub Actions workflow fájlok módosítása - RELEASE fájlokból olvassa a changelog-ot – **KÉSZ (build.yml és build-beta.yml: extract_changelog függvény frissítve RELEASE.hu.md és RELEASE.en.md olvasására stabil és beta release-ekhez)**

Megjegyzés: a részletesebb motivációk, becsült idők, prioritások a `FEJLESZTESI_OSSZEFOGLALO.md` backlog részében vannak dokumentálva.

---

## 🚀 v2.0.0 Tervezett Nagyverzió - Főbb Funkciók és Fejlesztések

### 📋 Áttekintés
A v2.0.0 egy major verzió, amely jelentős új funkciókat, biztonsági fejlesztéseket, teszt infrastruktúrát és projekt/feladat modulokat tartalmaz. Ez a verzió nagyobb változtatásokat és esetleges breaking change-eket is jelenthet.

### ✅ Kivitelezhetőség Elemzése

**Jelenlegi helyzet:**
- ✅ Widget UI komponensek már léteznek (ActiveProjectsWidget, ScheduledTasksWidget)
- ✅ Alapvető adatstruktúrák definiálva vannak (interfészek)
- ✅ Backend infrastruktúra készen áll (Tauri commands, Store plugin)
- ✅ Logolási rendszer és diagnosztika már implementálva
- ✅ Fordítási rendszer minden nyelvre kiterjedve

**Hiányzó részek:**
- ❌ Projekt/feladat domain logika és backend adatkezelés
- ❌ Titkosítási infrastruktúra (Rust crypto crates)
- ❌ Jelszavas védelem rendszer
- ❌ Teszt infrastruktúra (Vitest/Jest, Playwright)
- ❌ Performance monitoring és audit log
- ❌ API réteg tervezése

---

### 🔒 1. Biztonság és Adatvédelem

#### 1.1. Ügyféladat Titkosítás
- [ ] **Backend titkosítás modul (`src-tauri/src/encryption.rs`)**
  - AES-256-GCM titkosítás implementálása Rust-ban
  - Kulcs generálás és kezelés (PBKDF2/Argon2)
  - Titkosított adatok tárolása külön fájlban vagy jelszóval védett Store-ban
  - **Függőségek**: `aes-gcm`, `pbkdf2`, `rand` crates hozzáadása `Cargo.toml`-hez
  - **Tárhely**: `src-tauri/src/encryption.rs` (új fájl)

- [ ] **Frontend titkosítás kezelés (`frontend/src/utils/encryption.ts`)**
  - Jelszó dialógus komponens (`PasswordDialog.tsx`)
  - Jelszó beállítás/módosítás UI (Settings-ben)
  - Automatikus titkosítás/visszafejtés ügyfél adatoknál
  - Jelszó recovery/megjegyzés opció
  - **Tárhely**: `frontend/src/components/PasswordDialog.tsx` (új fájl)
  - **Tárhely**: `frontend/src/utils/encryption.ts` (új fájl)

- [ ] **Settings interface bővítése**
  - `encryptionEnabled: boolean` - Titkosítás be/kikapcsolása
  - `encryptionPassword: string | null` - Jelszó hash (nem plain text!)
  - `encryptedCustomerData: boolean` - Jelzi, hogy a customer adatok titkosítottak-e
  - **Tárhely**: `frontend/src/types.ts` (Settings interface)

- [ ] **Backend commands hozzáadása**
  - `encrypt_data(data: String, password: String) -> String` - Adatok titkosítása
  - `decrypt_data(encrypted: String, password: String) -> String` - Adatok visszafejtése
  - `verify_password(password: String, hash: String) -> bool` - Jelszó ellenőrzés
  - `hash_password(password: String) -> String` - Jelszó hash generálás
  - **Tárhely**: `src-tauri/src/commands.rs`

- [ ] **Fordítások minden nyelvre**
  - Jelszó dialógus szövegek (13 nyelv)
  - Settings titkosítás beállítások (13 nyelv)
  - Hibaüzenetek titkosítás/visszafejtés esetén (13 nyelv)
  - **Tárhely**: `frontend/src/utils/languages/*.ts`

#### 1.2. App Jelszavas Védelem
- [ ] **Jelszavas védelem rendszer**
  - Opcionális jelszavas védelem az app indításakor
  - Jelszó beállítása első indításkor vagy Settings-ben
  - Auto-lock funkció (inaktivitás után X perc)
  - Biometrikus hitelesítés támogatás (ha lehetséges platformon)
  - Jelszó recovery mechanizmus (biztonsági kérdések vagy backup kulcs)
  - **Tárhely**: `frontend/src/components/AuthGuard.tsx` (új fájl)
  - **Tárhely**: `frontend/src/utils/auth.ts` (új fájl)

- [ ] **Backend commands hozzáadása**
  - `verify_app_password(password: String) -> bool`
  - `set_app_password(password: String) -> Result<()>`
  - `clear_app_password() -> Result<()>`
  - **Tárhely**: `src-tauri/src/commands.rs`

- [ ] **Settings interface bővítése**
  - `appPasswordEnabled: boolean` - App jelszavas védelem be/kikapcsolása
  - `autoLockMinutes: number` - Auto-lock időtartama (0 = nincs auto-lock)
  - `appPasswordHash: string | null` - Jelszó hash tárolása
  - **Tárhely**: `frontend/src/types.ts`

---

### 🧪 2. Minőségbiztosítás és Tesztelés

#### 2.1. TypeScript Strict Mode
- [ ] **TypeScript konfiguráció frissítése**
  - `tsconfig.json`: `"strict": true` bekapcsolása
  - `"noImplicitAny": true`, `"strictNullChecks": true`, `"strictFunctionTypes": true`, stb.
  - **Tárhely**: `frontend/tsconfig.json`

- [ ] **Típusok takarítása és javítása**
  - Implicit `any` típusok megszüntetése
  - Null/undefined kezelés javítása
  - Típus definíciók bővítése hiányzó interface-ekkel
  - Generic típusok finomhangolása
  - **Tárhely**: Minden TypeScript fájl átnézése és javítása

#### 2.2. Unit Tesztek (Vitest/Jest)
- [ ] **Teszt infrastruktúra beállítása**
  - Vitest telepítése és konfigurálása (`pnpm add -D vitest @vitest/ui`)
  - `vitest.config.ts` létrehozása
  - Test utilities létrehozása (mock helpers, test data generators)
  - **Tárhely**: `frontend/vitest.config.ts` (új fájl)
  - **Tárhely**: `frontend/src/__tests__/utils/` (új mappa)

- [ ] **Kritikus számítások tesztelése**
  - Kalkulátor logika tesztek (`calculator.test.ts`)
    - Filament költség számítás (EUR, HUF, stb.)
    - Áramköltség számítás
    - Szárítás költségek
    - Profit számítás (különböző százalékokkal)
  - Pénznem konverzió tesztek (`currency.test.ts`)
  - Ártrend számítások tesztek (`priceTrends.test.ts`)
  - **Tárhely**: `frontend/src/__tests__/utils/calculator.test.ts` (új fájl)
  - **Tárhely**: `frontend/src/__tests__/utils/currency.test.ts` (új fájl)
  - **Tárhely**: `frontend/src/__tests__/utils/priceTrends.test.ts` (új fájl)

- [ ] **Utility függvények tesztelése**
  - Backup logika tesztek (`backup.test.ts`)
  - Date/time utility tesztek
  - Filament library tesztek
  - Translation helper tesztek
  - **Tárhely**: `frontend/src/__tests__/utils/*.test.ts`

- [ ] **CI/CD integráció**
  - GitHub Actions workflow hozzáadása unit tesztek futtatásához
  - Coverage jelentés generálása
  - **Tárhely**: `.github/workflows/tests.yml` (új fájl)

#### 2.3. E2E Tesztek (Playwright)
- [ ] **Playwright telepítése és konfigurálása**
  - `pnpm add -D @playwright/test`
  - `playwright.config.ts` létrehozása
  - Tauri app indítási script teszt környezethez
  - **Tárhely**: `frontend/playwright.config.ts` (új fájl)
  - **Tárhely**: `tests/e2e/` (új mappa)

- [ ] **Fő felhasználói folyamatok tesztelése**
  - Árajánlat létrehozás folyamat (`offer-creation.spec.ts`)
    - Nyomtató kiválasztása
    - Filamentek hozzáadása
    - Kalkuláció ellenőrzése
    - Árajánlat mentése
  - PDF export folyamat (`pdf-export.spec.ts`)
  - G-code import folyamat (`gcode-import.spec.ts`)
  - Backup/restore folyamat (`backup-restore.spec.ts`)
  - Factory Reset folyamat (`factory-reset.spec.ts`)
  - **Tárhely**: `tests/e2e/*.spec.ts`

- [ ] **CI/CD integráció**
  - GitHub Actions workflow E2E tesztekhez
  - Cross-platform tesztelés (macOS, Windows, Linux)
  - **Tárhely**: `.github/workflows/e2e-tests.yml` (új fájl)

---

### 📊 3. Logolás Bővítése

#### 3.1. Performance Metrikák Logolása
- [x] **Performance monitoring rendszer** – **KÉSZ v2.0.0**
  - Betöltési idők mérése minden modulnál ✅
  - Műveleti idők mérése (mentés, export, import, stb.) ✅
  - Memória használat monitorozása (real-time) ✅
  - CPU használat monitorozása (opcionális) ✅
  - **Tárhely**: `frontend/src/utils/performance.ts` ✅

- [x] **Performance log formátum** – **KÉSZ v2.0.0**
  - Strukturált JSON logok performance adatokkal ✅
  - Metrikák kategóriázása (loading, operations, memory, stb.) ✅
  - Performance trend analízis lehetőség ✅ (log fájlokban kereshető)
  - **Tárhely**: `frontend/src/utils/performance.ts` ✅

- [x] **Backend performance commands** – **KÉSZ v2.0.0**
  - `get_performance_metrics() -> PerformanceMetrics` - Aktuális metrikák lekérése ✅
  - Performance adatok rendszeres logolása (5 percenként) ✅
  - **Tárhely**: `src-tauri/src/commands.rs` ✅

- [x] **UI megjelenítés** – **KÉSZ v2.0.0**
  - Performance dashboard widget (opcionális) – **KIHAGYVA (nem prioritás)**
  - Performance metrikák megjelenítése System Diagnostics-ban ✅
  - **Tárhely**: `frontend/src/components/SystemDiagnostics.tsx` ✅

#### 3.2. Audit Log Implementálása
- [x] **Audit log infrastruktúra** – **KÉSZ v2.0.0**
  - Külön audit log fájl (`audit-YYYY-MM-DD.json`) ✅
  - Strukturált audit log entry formátum ✅
  - Immutable audit log (append-only, nem módosítható) ✅
  - **Tárhely**: `frontend/src/utils/auditLog.ts` ✅
  - **Tárhely**: `src-tauri/src/commands.rs` ✅

- [x] **Kritikus műveletek audit logolása** – **KÉSZ v2.0.0**
  - Bejelentkezés/kijelentkezés (ha app jelszavas védelem be van kapcsolva) – **VÁRHAT (v2.0.0 jelszavas védelem)**
  - Adatváltozások (CRUD műveletek: create, update, delete) ✅
    - Filamentek hozzáadása/módosítása/törlése ✅
    - Nyomtatók hozzáadása/módosítása/törlése ✅
    - Árajánlatok létrehozása/módosítása/törlése ✅
    - Ügyfelek hozzáadása/módosítása/törlése ✅
  - Beállítások módosítása ✅
    - Téma változtatás ✅
    - Nyelv változtatás ✅
    - Titkosítás be/kikapcsolása – **VÁRHAT (v2.0.0 titkosítás)**
    - Factory Reset ✅
  - Backup műveletek (létrehozás, visszaállítás) ✅
  - **Tárhely**: Minden releváns komponensben audit log hívások hozzáadva ✅

- [x] **Audit log viewer** – **KÉSZ v2.0.0**
  - Audit log fájlok listázása (Settings-ben) ✅
  - Audit log tartalom megjelenítése (filterezhető, kereshető) ✅
  - Export funkció audit logokhoz ✅
  - Virtuális scroll nagy fájlokhoz ✅
  - **Tárhely**: `frontend/src/components/AuditLogViewer.tsx` ✅

- [x] **Backend commands** – **KÉSZ v2.0.0**
  - `write_audit_log(entry: AuditLogEntry) -> Result<()>` - Audit log írása ✅
  - `list_audit_logs() -> Vec<(String, String, u64)>` - Audit log fájlok listázása ✅
  - `read_audit_log_file(file_path: String) -> String` - Audit log fájl olvasása ✅
  - `delete_old_audit_logs(retention_days: u32) -> Result<u32>` - Régi audit logok törlése ✅
  - **Tárhely**: `src-tauri/src/commands.rs` ✅

---

### 📁 4. Projekt / Feladat Modulok

#### 4.1. Projektkezelő Modul
- [ ] **Domain logika implementálása**
  - Projekt adatstruktúra bővítése (`types.ts`)
    - Projekt ID, név, leírás
    - Státusz (active, on-hold, completed, cancelled)
    - Progress tracking (0-100%)
    - Deadline
    - Kapcsolt árajánlatok (offer IDs)
    - Költségvetés és tényleges költség
    - Projekt tags/assignees (ha multi-user lesz később)
  - **Tárhely**: `frontend/src/types.ts` (Project interface hozzáadása)

- [ ] **Projekt CRUD műveletek**
  - Projekt létrehozása, szerkesztése, törlése
  - Projekt-árajánlat kapcsolatok kezelése
  - Progress automatikus számítása kapcsolt árajánlatok alapján
  - **Tárhely**: `frontend/src/utils/projects.ts` (új fájl)

- [ ] **Projekt tárolás**
  - Projektek mentése Store-ban (`projects.json` vagy Store kulcs)
  - Projekt verziózás (ha szükséges)
  - **Tárhely**: `frontend/src/utils/store.ts` (módosítás)

- [ ] **Projekt UI komponens**
  - Projektek listázása (új oldal vagy Dashboard bővítés)
  - Projekt részletes nézet modal
  - Projekt létrehozás/szerkesztés form
  - Gantt chart megjelenítés (opcionális, későbbi verzióhoz)
  - **Tárhely**: `frontend/src/components/Projects.tsx` (új fájl)

- [ ] **ActiveProjectsWidget integráció**
  - Widget valódi projekt adatokkal való feltöltése
  - Projekt kattintás → projekt részletes nézet megnyitása
  - **Tárhely**: `frontend/src/components/widgets/ActiveProjectsWidget.tsx` (módosítás)
  - **Tárhely**: `frontend/src/components/Dashboard.tsx` (módosítás)

- [ ] **Fordítások**
  - Projektkezelés szövegek (13 nyelv)
  - Projekt státuszok, címkék (13 nyelv)
  - **Tárhely**: `frontend/src/utils/languages/*.ts`

#### 4.2. Feladatkezelő Modul
- [ ] **Domain logika implementálása**
  - Feladat adatstruktúra bővítése (`types.ts`)
    - Feladat ID, cím, leírás
    - Prioritás (high, medium, low)
    - Státusz (pending, in-progress, completed, cancelled)
    - Határidő (due date)
    - Kapcsolt árajánlat ID (opcionális)
    - Feladat kategóriák/tags
    - Feladat assignee (ha multi-user lesz később)
    - Recurring tasks támogatás (opcionális)
  - **Tárhely**: `frontend/src/types.ts` (Task interface hozzáadása)

- [ ] **Feladat CRUD műveletek**
  - Feladat létrehozása, szerkesztése, törlése
  - Feladat státusz változtatás
  - Határidő kezelés és emlékeztetők
  - **Tárhely**: `frontend/src/utils/tasks.ts` (új fájl)

- [ ] **Feladat tárolás**
  - Feladatok mentése Store-ban (`tasks.json` vagy Store kulcs)
  - Feladat szűrés és rendezés
  - **Tárhely**: `frontend/src/utils/store.ts` (módosítás)

- [ ] **Feladat UI komponens**
  - Feladatok listázása (új oldal vagy Dashboard bővítés)
  - Feladat részletes nézet modal
  - Feladat létrehozás/szerkesztés form
  - Naptár nézet feladatokkal (opcionális)
  - **Tárhely**: `frontend/src/components/Tasks.tsx` (új fájl)

- [ ] **ScheduledTasksWidget integráció**
  - Widget valódi feladat adatokkal való feltöltése
  - Feladat kattintás → feladat részletes nézet megnyitása
  - Automatikus feladat generálás árajánlatok határidejéből
  - **Tárhely**: `frontend/src/components/widgets/ScheduledTasksWidget.tsx` (módosítás)
  - **Tárhely**: `frontend/src/components/Dashboard.tsx` (módosítás)

- [ ] **Fordítások**
  - Feladatkezelés szövegek (13 nyelv)
  - Feladat prioritások, státuszok (13 nyelv)
  - **Tárhely**: `frontend/src/utils/languages/*.ts`

---

### ⚡ 5. Performance Optimalizálás

#### 5.1. Code Splitting Finomhangolás
- [ ] **Lazy loading bővítése**
  - További komponensek lazy loading-ja
  - Route-based code splitting (ha routing lesz később)
  - Dinamikus import optimalizálás
  - **Tárhely**: Minden nagyobb komponens átnézése

#### 5.2. Virtual Scroll További Implementációk
- [ ] **Virtual scroll hozzáadása további listákhoz**
  - Customers lista (ha nagy mennyiségű ügyfél van)
  - Printers lista (ha sok nyomtató van)
  - Projects lista (ha projekt modul kész lesz)
  - Tasks lista (ha feladat modul kész lesz)
  - **Tárhely**: `frontend/src/hooks/useVirtualScroll.ts` (módosítás, ha szükséges)
  - **Tárhely**: Minden releváns lista komponens

#### 5.3. Memoization Finomhangolás
- [ ] **useMemo és useCallback optimalizálás**
  - Nagy számítások memoizálása
  - Callback függvények stabilizálása
  - Dependency array-ek ellenőrzése
  - **Tárhely**: Minden komponens átnézése és optimalizálása

---

### 🔌 6. API / Integrációs Réteg (Opcionális)

#### 6.1. REST API Tervezés
- [ ] **API architektúra tervezése**
  - Endpoint struktúra tervezése
  - Request/Response formátumok definiálása
  - Authentication/Authorization mechanizmus
  - **Tárhely**: Dokumentáció (`docs/API_DESIGN.md` - új fájl)

- [ ] **Backend API server implementálása (későbbi verzióhoz)**
  - Tauri backend-en REST API endpoint-ok
  - Vagy külön HTTP server (ha szükséges)
  - **Tárhely**: `src-tauri/src/api/` (új mappa, későbbi verzióhoz)

- [ ] **API dokumentáció**
  - OpenAPI/Swagger spec generálása
  - API endpoint dokumentáció
  - **Tárhely**: `docs/API.md` (új fájl)

---

### 📚 7. Dokumentáció és Fordítások

- [ ] **v2.0.0 changelog összeállítása**
  - Minden új funkció dokumentálása
  - Breaking changes dokumentálása (ha vannak)
  - Migration guide (ha szükséges)
  - **Tárhely**: README fájlok frissítése

- [ ] **Új fordítási kulcsok**
  - Titkosítás kapcsolatos szövegek (13 nyelv)
  - Jelszavas védelem szövegek (13 nyelv)
  - Projektkezelés szövegek (13 nyelv)
  - Feladatkezelés szövegek (13 nyelv)
  - Audit log szövegek (13 nyelv)
  - Performance metrikák szövegek (13 nyelv)
  - **Tárhely**: `frontend/src/utils/languages/*.ts`

- [ ] **API dokumentáció (ha API réteg lesz)**
  - Endpoint dokumentáció
  - Request/Response példák
  - Authentication guide

---

### 🛠️ 8. Technikai Előfeltételek és Függőségek

#### 8.1. Új Rust Crates (`Cargo.toml`)
- [ ] **Titkosításhoz**
  - `aes-gcm = "0.10"` - AES-256-GCM titkosítás
  - `pbkdf2 = "0.12"` vagy `argon2 = "0.5"` - Jelszó hash
  - `rand = "0.8"` - Random generálás kulcsokhoz
  - `base64 = "0.21"` - Base64 encoding/decoding

#### 8.2. Új Frontend Dependencies (`package.json`)
- [ ] **Teszteléshez**
  - `vitest = "^1.0.0"` - Unit teszt framework
  - `@vitest/ui = "^1.0.0"` - Vitest UI
  - `@playwright/test = "^1.40.0"` - E2E tesztelés
  - `@testing-library/react = "^14.0.0"` - React komponens tesztekhez
  - `@testing-library/user-event = "^14.5.0"` - User interaction szimuláció

#### 8.3. Build Konfiguráció Módosítások
- [ ] **Vitest konfiguráció**
  - `vitest.config.ts` létrehozása
  - Coverage konfiguráció
  - Test environment beállítás

- [ ] **Playwright konfiguráció**
  - `playwright.config.ts` létrehozása
  - Tauri app indítási script
  - Cross-platform tesztelés beállítása

---

### 📊 9. Becsült Erőforrásigény és Időtartam

**Összesített becslés (nagy áttekintés):**
- 🔒 **Biztonság és titkosítás**: ~2-3 hét
  - Backend titkosítás: 1 hét
  - Frontend integráció: 1 hét
  - Jelszavas védelem: 3-5 nap
- 🧪 **Teszt infrastruktúra**: ~2-3 hét
  - TypeScript strict mode: 1 hét
  - Unit tesztek: 1 hét
  - E2E tesztek: 1 hét
- 📊 **Logolás bővítése**: ~1 hét
  - Performance metrikák: 3-4 nap
  - Audit log: 3-4 nap
- 📁 **Projekt/Feladat modulok**: ~3-4 hét
  - Projekt modul: 2 hét
  - Feladat modul: 2 hét
- ⚡ **Performance optimalizálás**: ~1 hét
- 📚 **Dokumentáció és fordítások**: ~1 hét

**Összesen: ~10-13 hét (2.5-3 hónap)** koncentrált fejlesztési munkával

---

### ✅ Következő Lépések v2.0.0-hoz

1. **Előzetes tervezés és validálás**
   - Projekt/Feladat modul adatstruktúrák finomhangolása
   - Titkosítási algoritmusok és kulcskezelés tervezése
   - API réteg tervezése (ha szükséges)

2. **Prioritás meghatározása**
   - Mely funkciók kritikusak a v2.0.0-hoz?
   - Melyek opcionálisak és későbbi minor verziókba kerülhetnek?

3. **Prototípusok készítése**
   - Projekt modul UI prototípus
   - Titkosítási flow tesztelése
   - Teszt infrastruktúra beállítása

4. **Fázisos implementáció**
   - Fase 1: Biztonsági fejlesztések
   - Fase 2: Teszt infrastruktúra
   - Fase 3: Projekt/Feladat modulok
   - Fase 4: Performance és optimalizálás

---

**Megjegyzés**: A v2.0.0 egy ambiciózus verzió, amely jelentős új funkciókat és infrastrukturális fejlesztéseket tartalmaz. Javasolt, hogy fázisokban implementáljuk, és fontos, hogy az egyes fázisok után teszteljük és validáljuk az eredményeket.

