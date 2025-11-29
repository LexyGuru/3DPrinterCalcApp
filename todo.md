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
[x] Backup rendszer backend optimalizációja (permissions hibák javítása) – **KÉSZ v1.7.0 (backend commands: cleanup_old_backups_by_days, cleanup_old_backups_by_count, frontend cleanup függvények backend command használata, "forbidden path" hibák elkerülése)**
[x] Backup rendszer performance optimalizációja – **KÉSZ v1.7.0 (hasTodayBackup() optimalizálva: list_backup_files backend command használata, nem olvassa be az összes fájlt, lock mechanizmus párhuzamos backupok megelőzésére)**
[x] Backup directory megnyitása gomb a Settings-ben – **KÉSZ v1.7.0 (Settings.tsx: backup history mellett gomb, get_backup_directory_path + open_directory backend commands használata, fordítva minden nyelvhez)**
[ ] Értesítési csatornák egységesítése (Toast / platform notification) – **TERVEZETT v1.7.0 (közös értesítési logika, későbbi bővíthetőség)**

4. Középtávú technikai/biztonsági fejlesztések (összefoglalva a fejlesztési összefoglalóból)
[ ] Ügyféladat titkosítás (AES-256-GCM, `encryption.rs`, jelszó dialógus)
[ ] Opcionális app jelszavas védelem
[ ] TypeScript strict mode bekapcsolása + típusok takarítása
[ ] Unit tesztek (Vitest/Jest) kritikus számításokra és utilokra
[ ] E2E tesztek (Playwright/Cypress) fő felhasználói folyamatokra
[ ] API / integrációs réteg (REST API, későbbi mobil/egyéb integrációkhoz)

5. Projekt / feladat modulok (a meglévő widgetek mögé)
[ ] Projektkezelő modul (ActiveProjectsWidget mögötti domain logika)
[ ] Feladatkezelő modul (ScheduledTasksWidget mögötti domain logika)
[ ] További performance optimalizálás (mélyebb code splitting, virtual scroll több helyen)

6. Tutorial / Demo frissítés
[x] Tutorial lépések frissítése az 1.6.0 és 1.7.0 újdonságokkal (widget interaktivitás, táblázat szűrés/rendezés, virtual scroll, backup rendszer, filament többnyelvű színek) – **KÉSZ v1.7.0 (Tutorial.tsx: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang lépések hozzáadva)**
[x] Tutorial demo adatok bővítése (nagyobb Offers/Filaments lista, több minta projekt/ügyfél az új funkciók bemutatásához) – **KÉSZ v1.7.0 (tutorialDemoData.ts: 6 filament → 11 filament, 3 árajánlat → 5 árajánlat)**
[x] Tutorial fordítási kulcsok hozzáadása minden nyelvhez – **KÉSZ v1.7.0 (13 nyelv: widgetInteractivity, filamentLibraryMultilang, tableSorting, autosaveBackup kulcsok hozzáadva)**

Megjegyzés: a részletesebb motivációk, becsült idők, prioritások a `FEJLESZTESI_OSSZEFOGLALO.md` backlog részében vannak dokumentálva.

