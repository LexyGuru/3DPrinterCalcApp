# 📋 Verziótörténet - 3DPrinterCalcApp

Ez a dokumentum tartalmazza a 3D Printer Calculator App verzióinak részletes változásait.

---

## v3.0.0 (2025) - 🔒 Customer Data Encryption & GDPR Compliance + ⚡ Performance Optimalizálás

### ⚡ Performance Optimalizálás és Code Splitting

#### React.lazy() Dokumentálása és Optimalizálása
- **React.lazy() implementáció dokumentálása** - Teljes dokumentáció létrehozva (`docs/PERFORMANCE.md`)
- **Loading fázis optimalizálása** - Loading fázisban csak adatok töltődnek be, komponensek nem
- **Suspense fallback optimalizálása** - AppRouter.tsx-ben optimalizált fallback komponensek
- **Error boundary hozzáadása** - LazyErrorBoundary.tsx komponens lazy loaded komponensekhez

#### Route-based Code Splitting
- **React Router integráció** - React Router v7.10.0 telepítése és konfigurálása
- **URL alapú navigáció** - Route struktúra implementálva (`/settings`, `/offers`, `/customers`, stb.)
- **Lazy loading route-okhoz** - Minden route külön fájlba kerül automatikus code splitting-gel
- **State-based → Routing átalakítás** - `activePage` state átalakítva URL alapú routing-ra
- **Bookmark-olható oldalak** - Minden oldal elérhető közvetlen URL-lel
- **Browser navigáció támogatás** - Vissza/előre gomb működik, jobb UX

#### Code Splitting Finomhangolás
- **Vite build konfiguráció optimalizálása** - `rollupOptions.output.manualChunks` beállítva
- **Vendor chunk optimalizálás**:
  - React/React-DOM/React-Router külön chunk (`vendor-react`)
  - Tauri API-k külön chunk (`vendor-tauri`)
  - UI library-k külön chunk-ok (`vendor-ui-framer`, `vendor-ui-charts`)
  - Egyéb node_modules (`vendor`)
- **Route-based chunking** - Automatikus lazy loading miatt minden route külön chunk
- **Router fájlok csoportosítása** - `router`, `routes` chunk-okba szervezve
- **Közös komponensek csoportosítása** - `components-shared` chunk
- **Chunk size warning limit** - 1000 KB beállítva

#### Moduláris Architektúra
- **Moduláris architektúra dokumentáció** - Teljes dokumentáció (`docs/MODULAR_ARCHITECTURE.md`)
- **Path alias-ok** - `@features`, `@shared`, `@core` alias-ok beállítva
- **Vite és TypeScript konfiguráció** - Frissítve path alias támogatással
- **Shared modulok implementálása**:
  - Shared komponensek (ConfirmDialog, FormField, InputField, SelectField, NumberField)
  - Shared hook-ok (useModal, useForm)
  - Shared utility-k (debounce, format, validation)
- **Feature modulok refaktorálása** - 6 modul teljes refaktorálása:
  - Calculator: 582 sor → 309 sor (-46.9%)
  - Settings: 5947 sor → 897 sor (-85%!)
  - Offers: 3985 sor → 3729 sor (-6.4%)
  - Home: 3454 sor → 3308 sor (-4.2%)
  - Filaments és Printers modulok is refaktorálva

### 🔒 Ügyféladat Titkosítás
- **AES-256-GCM titkosítás** - Ügyféladatok titkosított tárolása industry-standard AES-256-GCM algoritmussal
- **PBKDF2 jelszó hashing** - Jelszavak biztonságos tárolása PBKDF2 algoritmussal (100,000 iteráció, SHA-256)
- **Külön fájl tárolás** - Titkosított ügyféladatok külön `customers.json` fájlban tárolva
- **In-memory jelszó kezelés** - Jelszavak csak memóriában tárolva, alkalmazás bezárásakor törlődnek
- **App password integráció** - Opcionális: az app jelszavas védelem jelszavát használhatja a titkosításhoz is
- **Jelszó prompt rendszer** - Intelligens jelszó kérés (nem jelenik meg loading screen-en, welcome message után)
- **Data integrity védés** - Titkosított adatok védve az esetleges törlés ellen

### ✅ GDPR/EU-szabályoknak megfelelő adatvédelem
- **Megfelelőség**: Az alkalmazás GDPR (General Data Protection Regulation) és EU adatvédelmi szabályoknak megfelelően kezeli az ügyféladatokat
- **Industry-standard titkosítás**: AES-256-GCM algoritmus használata (megfelel az EU ajánlásoknak)
- **Biztonságos jelszó kezelés**: PBKDF2 hashing algoritmus (NIST ajánlott)
- **Minimális adatgyűjtés**: Csak a szükséges ügyféladatokat tárolja az alkalmazás
- **Adatmegőrzés**: A felhasználó teljes kontrollt gyakorol az adatok tárolására és törlésére
- **Jogosultság-alapú hozzáférés**: Jelszóval védett hozzáférés az ügyféladatokhoz

### 🎨 UI/UX Fejlesztések
- **Titkosítás bekapcsolás modal** - Új modal ablak titkosítás bekapcsolásához app password opcióval
- **ConfirmDialog bővítés** - customContent támogatás modal komponensekhez
- **Jelszó prompt időzítés** - Intelligens megjelenítés (nem a loading screen-en)
- **Settings integráció** - Titkosítás beállítások a Security tab-ban

### 🔧 Technikai Fejlesztések
- **Backend encryption module** - Rust-ban implementált titkosítás (`src-tauri/src/encryption.rs`)
- **Frontend encryption utilities** - TypeScript utility függvények titkosítás kezeléséhez
- **Password manager** - In-memory jelszó kezelés rendszer
- **Store integration** - saveCustomers/loadCustomers funkciók titkosítás integrációval

### 📚 Nyelvi támogatás
- **13 nyelv frissítve** - Minden nyelvi fájlban új encryption fordítási kulcsok
- **Új kulcsok**: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Performance Monitoring & Audit Log System

### 🌐 Console Üzenetek Lokalizálása
- **Teljes console lokalizáció** - Minden console üzenet a beállított nyelven jelenik meg
- **Store műveletek fordítása** - Betöltési és mentési üzenetek (nyomtatók, filamentek, beállítások, árajánlatok, ügyfelek, projektek, feladatok)
- **Backup üzenetek fordítása** - Napi backup ellenőrzés, backup létrehozás, rotációs üzenetek
- **Log rotációs üzenetek fordítása** - Log és audit log rotációs üzenetek dinamikus részekkel
- **Performance metrikák fordítása** - CPU és memória metrikák, rendszeres logolási üzenetek
- **Rendszerüzenetek fordítása** - Alkalmazás inicializálás, frontend log inicializálás, üdvözlő üzenet
- **Többrészes üzenetek fordítása** - Console üzenetek adat részeinek fordítása (dátum, timestamp, fájl, státusz információk)
- **13 nyelv támogatás** - Minden console üzenet fordítva angol, magyar, német, spanyol, olasz, lengyel, portugál, orosz, ukrán, cseh, szlovák és kínai nyelven

### ⚡ Performance Metrikák Logolása
- **Performance Timer osztály** - Manuális időmérés műveletekhez
- **Betöltési idők mérése** - Minden modul betöltési ideje rögzítve (Settings, Printers, Filaments, Offers, Customers)
- **Műveleti idők mérése** - Aszinkron és szinkron műveletek automatikus időmérése
- **Memória használat monitorozása** - JavaScript heap memória követése és logolása
- **CPU használat monitorozása** - Rendszeres CPU felhasználás mérése 5 percenként
- **Performance összefoglaló** - Betöltési és műveleti idők összesített statisztikái
- **Strukturált log üzenetek** - CPU százalék, memória értékek részletes megjelenítése
- **Backend performance commands** - `get_performance_metrics` backend parancs CPU és memória adatokhoz

### 🔐 Audit Log Implementálása
- **Audit log infrastruktúra** - Külön audit log fájl (`audit-YYYY-MM-DD.json`)
- **Kritikus műveletek naplózása**:
  - CRUD műveletek (Filamentek, Nyomtatók, Árajánlatok, Ügyfelek létrehozása/módosítása/törlése)
  - Beállítások módosítása (téma, nyelv, log beállítások, autosave, stb.)
  - Backup műveletek (létrehozás, visszaállítás)
  - Factory Reset műveletek
  - Hibák rögzítése
- **Audit Log Viewer** - Virtuális scroll-lal nagy fájlokhoz, szűréssel, kereséssel, exportálással
- **Automatikus cleanup** - Régi audit log fájlok automatikus törlése konfigurálható megőrzési napok alapján
- **Backend commands** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Teljes lokalizáció** - Mind a 13 támogatott nyelven

### 🎯 UI/UX Fejlesztések
- **Audit Log History** - Settings → Log Management szekcióban kétoszlopos elrendezés
- **Performance metrikák megjelenítése** - System Diagnostics modalban
- **Log Viewer real-time frissítés** - Auto-refresh toggle, hash-alapú változás észlelés
- **Auto-scroll finomhangolás** - Felhasználó scroll pozíciójának figyelembe vétele

### 🔧 Technikai Fejlesztések
- **GitHub update check optimalizálás** - Indításkor és 5 óránként (localStorage-alapú)
- **Beta tag formátum** - Külön `beta-v2.0.0` tag a beta release-ekhez (nem írja felül a main release-t)
- **Verzióellenőrző logika** - Beta verziók keresése `beta-v` prefix alapján

---

## v1.9.0 (2025) - 🔍 Rendszer Diagnosztika & Teljesítmény Fejlesztések

### 🔍 Rendszer Diagnosztika
- **Átfogó rendszerállapot-ellenőrző eszköz**:
  - Rendszerinformációk megjelenítése (CPU, memória, OS, GPU, lemez)
  - Fájlrendszer validálás (data.json, filamentLibrary.json, update_filament.json)
  - Modul elérhetőség ellenőrzés (Settings, Offers, Printers, Customers, Calculator, Home)
  - Adattárolás elérhetőség ellenőrzése
  - Progress bar részletes státusz üzenetekkel
  - Összefoglaló hibák/figyelmeztetések/sikeres állapotokkal
  - Újrafuttatás gomb
- **Áthelyezve a Log Management szekcióba** (logikusabb elhelyezés)
- **Teljes lokalizáció** mind a 13 támogatott nyelven

### ⚡ Log Viewer Teljesítmény
- **Virtuális scroll nagy log fájlokhoz**:
  - Egyedi virtuális scroll implementáció a LogViewer komponenshez
  - Csak a látható log bejegyzések renderelődnek, jelentősen javítva a teljesítményt
  - Zökkenőmentes görgetés és keresés akár hatalmas log fájlokkal is (100k+ sor)
  - Pontos scrollbar pozíciót és magasságot tart
  - Jelentősen gyorsabb keresés és szűrés műveletek

### 🔔 Egységes Értesítési Rendszer
- **Központi értesítési szolgáltatás**:
  - Egyetlen `notificationService` mind a Toast, mind a platform értesítésekhez
  - Prioritás alapú értesítési irányítás (magas prioritás → platform értesítés)
  - Automatikus döntéshozatal az app állapota alapján (előtér/háttér)
  - Visszafelé kompatibilis a meglévő értesítési függvényekkel
  - Konfigurálható értesítési beállítások (Toast be/kikapcsolva, platform értesítés be/kikapcsolva, prioritás szintek)

### 🎯 UI/UX Fejlesztések
- Rendszer Diagnosztika áthelyezve a Backup szekcióból a Log Management szekcióba (logikusabb elhelyezés)
- TypeScript linter hibák javítva (nem használt változók, típus eltérések)
- Javított kódminőség és karbantarthatóság

---

## v1.8.0 (2025) - 📊 Fejlett Logolási Rendszer & Factory Reset Fejlesztések

### 🔄 Factory Reset Progress Modal
- **Vizuális progress indikátor a factory reset-hez**:
  - 4 lépéses animált progress (backup törlés, log törlés, config törlés, befejezés)
  - Valós idejű státusz frissítések sikeres/hiba üzenetekkel
  - 10 másodperces visszaszámláló a nyelvválasztó megjelenítése előtt
  - Nem zárható modal a reset folyamat alatt
  - Teljes lokalizáció mind a 13 támogatott nyelven

### 📋 Teljes Logolási Rendszer Átértékelés
- **Professzionális logolási infrastruktúra**:
  - Cross-platform log fájl útvonalak (platform-specifikus adat könyvtárak)
  - Rendszerinformációk logolása (CPU, memória, OS, GPU, lemez, app verzió)
  - Mappa információk logolása (log és backup mappák, fájlok száma, mérete)
  - Részletes betöltési státusz logolás (sikeres/figyelmeztetés/hiba/kritikus)
  - Log szintek (DEBUG, INFO, WARN, ERROR) szűréssel
  - Strukturált log formátum támogatás (szöveges és JSON)
  - Log rotáció automatikus cleanup-pal (konfigurálható megőrzési napok)
  - Log Viewer modal szűréssel, kereséssel, kiemeléssel és exportálással
  - Log konfiguráció a Settings-ben (formátum, szint, megőrzési napok)
  - Log fájl tartalom megőrzése az app újraindításakor (append mód)

### 🔍 Rendszer Diagnosztika
- **Rendszerállapot-ellenőrző modal**:
  - Rendszerinformációk megjelenítése és validálás
  - Memória használat monitorozás figyelmeztetésekkel
  - Fájl létezés ellenőrzések
  - Modul elérhetőség ellenőrzése
  - Adattárolás elérhetőség tesztek
  - Progress bar és összefoglaló megjelenítés
  - Teljes lokalizáció mind a 13 támogatott nyelven

### 🛠️ Technikai Fejlesztések
- Logolás letiltva a Factory Reset alatt a log szennyezés elkerülésére
- data.json létrehozás késleltetve a nyelvválasztásig (tisztább Factory Reset folyamat)
- Log fájl inicializálás késleltetve a nyelvválasztásig
- Automatikus app újraindítás a nyelvválasztás után
- Backend parancsok a backup és log fájl kezeléshez
- Cross-platform path kezelés a backupokhoz és logokhoz
- Javított memória számítás (sysinfo 0.31 kompatibilitás)
- React stílus figyelmeztetések javítva (CSS shorthand konfliktusok)

---

## v1.7.0 (2025) - 💾 Backup rendszer, betöltési képernyő és filament könyvtár fejlesztések

### 💾 Backup rendszer teljes implementációja
- **Automatikus backup rendszer** - Naponta egy backup fájllal (csak új napon jön létre)
- **Backup reminder hook és UI komponens** - Értesítés, ha nincs backup
- **Backup History UI a Settings-ben** - Színes lista (zöld/sárga/piros/szürke) a backup fájlok korához és törlési számlálóval
- **Autosave modal ablak** - Magyarázat az autosave bekapcsolásakor
- **Autosave és automatikus backup szinkronizálása** - Autosave mentéskor automatikus backup
- **Factory Reset automatikus backup fájlok törlésével**
- **Backup history automatikus frissítése** amikor az autosave bekapcsolódik

### 🔧 Backup rendszer backend optimalizációja
- **Backend commands hozzáadása** régi backupok törléséhez (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Frontend cleanup függvények backend command használatára frissítve**, így nincs többé "forbidden path" hiba
- **Minden fájl művelet (létrehozás, törlés, listázás) most backend-ről történik**, elkerülve a Tauri permissions problémákat

### ⚡ Backup rendszer performance optimalizációja
- `hasTodayBackup()` optimalizálva: `list_backup_files` backend command használata, nem kell minden fájlt beolvasni
- **Lock mechanizmus hozzáadva** párhuzamos backupok megelőzésére
- **Gyorsabb működés** nagy számú backup fájl esetén is

### 📁 Backup directory megnyitása és log history
- **Gomb hozzáadva** a Settings → Backup History szekcióban a backup mappa megnyitásához
- **Új log history szekció** a Settings-ben - log fájlok listázása és megnyitása
- **Automatikus log fájl törlés** beállítható napok alapján
- **Cross-platform támogatás** (macOS, Windows, Linux)

### 🎨 Betöltési képernyő teljes átalakítása
- **App logo integrálva** háttérként glassmorphism effekttel
- **Fix layout pipákhoz** - Automatikus görgetés, csak 3 modul látható egyszerre
- **Shimmer effekt, pulsing dots animációk**
- **Scroll container** rejtett scrollbárral

### ⚙️ Betöltési folyamat javítások
- **Lassított betöltés** (800ms késleltetések) - olvashatóak a betöltési üzenetek
- **Hibakezelés minden modulnál** (try-catch blokkok)
- **Fizikai log fájl** minden státuszhoz és hibához
- **Betöltési összefoglaló** a végén

### 🎨 Filament könyvtár többnyelvű támogatása
- **Filament színek megjelenítése** minden támogatott nyelven (nem csak magyar/német/angol)
- **Fallback logika**: angol → magyar → német → raw color/name
- Settings, GlobalSearch és Filaments komponensek frissítve

### 🔄 Factory Reset javítások
- **Fizikai fájlok törlése** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Store instance reset** reload nélkül
- **Nyelvválasztó megjelenítése** a Factory Reset után

### 🎓 Tutorial frissítés v1.7.0 újdonságokkal
- Új lépések: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Demo adatok bővítve: 6 filament → 11 filament, 3 árajánlat → 5 árajánlat
- Fordítási kulcsok hozzáadva minden nyelvhez

---

## v1.6.0 (2025) - 📊 Interaktív widgetek & nagy táblázatok teljesítmény-tuning

### 🧠 Interaktív grafikonok és részletes modál nézetek
- **A fő dashboard grafikonok egységes `InteractiveChart` komponenst használnak** kattintható adatpontokkal és animált részletes modál nézettel
- **A tooltip és a részletes nézet lokalizált**, emberi olvasható címkéket mutat (bevétel, költség, nettó profit, ajánlatszám)
- **A trend grafikonról közvetlenül állítható az időszak** (heti / havi / éves) a brush segítségével, a Home → Dashboard felé szeletelt adatsor megy tovább

### 🧵 Virtuális scroll nagy listákhoz
- **Egyedi virtuális scroll** az Offers listához és a Filaments táblázathoz – egyszerre csak a látható sorok renderelődnek, így 10k+ rekord mellett is sima a görgetés
- **A Beállítások → Filament könyvtár** ugyanazt a mintát használja, így a teljes 12 000+ színkészlet is reszponzív marad
- **A scrollbar pozíciója/magassága helyes marad** a látható tartomány feletti és alatti spacer elemeknek köszönhetően

### 📋 Fejlett táblázat rendezés és szűrés
- **Többoszlopos rendezés** Filaments és Offers oldalon (kattintás: növekvő/csökkenő, Shift+katt: rendezési lánc építése – pl. „Márka ↑, majd Ár/kg ↓")
- **A rendezési beállítások a `settings`-ben mentésre kerülnek**, így újraindítás után is megmarad a preferált sorrend
- **Filaments**: oszlop szintű szűrők márkára, anyag/típusra és szín/HEX értékre
- **Offers**: összeg szűrés minimum/maximum értékkel, valamint dátum intervallum szűrők (‑tól / ‑ig)

---

### v1.5.0 (2025) - 🧠 Okos Dashboard és határidő emlékeztetők

- ⏱️ **Nyomtatási határidő emlékeztetők** – Új rendszer az elfogadott árajánlatok követésére:
  - A Scheduled Tasks widget automatikusan feladatokat kap a határidős árajánlatokból
  - A fejlécben váltakozó „Ma / Holnap / Holnapután” stílusú emlékeztetők jelennek meg a közelgő nyomtatásokhoz
  - Tartós (nem eltűnő) info toast figyelmeztet a közeli határidőkre, amíg manuálisan be nem zárod
- 🧵 **Filament készletkezelés** – Új, dedikált filament készletnyilvántartó nézet:
  - Keresés márka / típus / szín alapján, státusz szűrők (kritikus / alacsony / rendben)
  - Állítható kritikus és alacsony küszöbértékek, inline készletszerkesztés és gyors +100g / −100g gombok
  - A Filament Stock Alert widget közvetlenül ezekre a küszöbökre és a valós készletszintekre épül
- 📊 **Dashboard fejlesztések** – Minden widget alapból bekapcsolva a dashboard nézetben:
  - Quick Actions, Recent Offers, Filament Stock Alerts, Financial Trends, Active Projects, Scheduled Tasks
  - A klasszikus Home nézet és a Widget Dashboard sokkal egységesebb statisztikákat és grafikonokat használ
- 🧱 **Árajánlat UX javítások** – Kényelmesebb szerkesztés és kijelölés:
  - Javítottuk azokat az eseteket, amikor szerkesztés után nem frissült azonnal a fő árajánlat lista
  - A többszörös kijelölés jelölőnégyzete kikerült a cím szövegéből, így a vevő neve nem takarásos
- 🧭 **Fejléc és layout finomhangolás**:
  - A fejléc közepéről eltávolítottuk a breadcrumb sávot, hogy letisztultabb legyen a felület
  - Minimum ablakméret (1280x720) most már Tauri szinten van kikényszerítve, görgetősávok erőltetése nélkül

---

### v1.4.33 (2025) - 🔧 Widget elrendezés és húzás fejlesztések + Tutorial Demo Adatok

- 📊 **Widget elrendezés javítások** - Javított widget pozicionálás és húzás funkcionalitás:
  - Javított automatikus pozicionálás 6 kis "S" méretű widget esetén, hogy egymás mellé kerüljenek
  - A widgetek mostantól megtartják pozíciójukat manuális húzás után
  - Javított elrendezés megőrzés - a widgetek nem ugranak vissza eredeti pozíciójukra
  - Továbbfejlesztett húzás funkció - a widgetek húzhatók a fejlécről vagy a húzás sávról
  - Javított üres terület problémák a widgetek alatt újra pozicionálás után
  - Továbbfejlesztett elrendezés változás kezelés, hogy ne írja felül a manuális változásokat
- 🎓 **Tutorial Demo Adatok Rendszer** - Automatikus demo adatok generálás és törlés:
  - Demo adatok automatikusan generálódnak amikor a tutorial elindul (ha nincs meglévő adat)
  - Demo adatok tartalmazzák: minta nyomtatókat, filamenteket, árajánlatokat és ügyfeleket
  - Demo adatok automatikusan törlődnek amikor a tutorial befejeződik vagy kihagyásra kerül
  - Az alkalmazás automatikusan újraindul a demo adatok törlése után, hogy a memóriából is eltűnjenek
  - A beállítások megmaradnak a demo adatok törlése során (nyelv, tutorial státusz)
  - Javított végtelen ciklus probléma - a tutorial nem indul újra befejezés után
- 🔧 **Main Build Release Javítás** - Továbbfejlesztett GitHub release létrehozás:
  - Hozzáadott release fájl ellenőrzés a GitHub release létrehozása előtt
  - Továbbfejlesztett release létrehozás, hogy biztosan megjelenjen a latest verzió
  - Javított release név formátum a konzisztencia érdekében

---

### v1.3.12 (2025) - 🎨 Widget rendszer és pénznem fejlesztések

- 📊 **Widget rendszer fejlesztések** - Továbbfejlesztett widget funkcionalitás és lokalizálás:
  - Új widgetek hozzáadva: Nyomtatási idő grafikon, Ügyfél statisztikák grafikon, Árajánlat státusz grafikon
  - Widget export funkció javítva - minden grafikon widget most exportálható SVG-ként
  - Dinamikus widget címek fordítása a kiválasztott nyelv alapján
  - Lokalizált export fájlnevek megfelelő OS-kompatibilis elnevezéssel (aláhúzások, nincs speciális karakter)
  - Widget nyelvek azonnal frissülnek nyelvválasztás után
  - Toast értesítések sikeres grafikon exportokhoz
  - Minden widget elem és betöltési állapot teljes mértékben lefordítva mind a 13 nyelven
- 💱 **Pénznem támogatás bővítése** - Kibővített pénznem támogatás:
  - Hozzáadott pénznemek: GBP (Brit font), PLN (Lengyel zloty), CZK (Cseh korona), CNY (Kínai jüan), UAH (Ukrán hrivnya), RUB (Orosz rubel)
  - Pénznem szimbólumok és címkék minden új pénznemhez
  - Megfelelő pénznem konverzió és megjelenítés minden komponensben
  - Pénznem választó lenyíló ablak frissítve minden támogatott pénznemmel
- 💰 **Költségszámítás precíziós javítás** - Lebegőpontos precíziós hibák javítva:
  - Minden költségszámítás (filament, áram, szárítás, használat, összes) most 2 tizedesjegyre kerekítve
  - Eltávolított hosszú tizedesjegyek megjelenítése (pl. `0.17500000000000002` → `0.18`)
  - Konzisztens számformázás az alkalmazásban
- 🏢 **Céginformációk dialógus** - Továbbfejlesztett cégadat kezelés:
  - Céginformációk űrlap dialógusba helyezve (hasonlóan a Goods/Filamentekhez)
  - "Cégadatok" gomb a céginformációk megnyitásához/szerkesztéséhez
  - Dialógus bezárható X gombbal, backdrop kattintással vagy Escape billentyűvel
  - Jobb UX animált modal átmenetekkel
  - Minden céginformáció mező elérhető rendezett dialógus felületen

### v1.3.11 (2025) - 🎨 Widget Dashboard fejlesztések

- 📊 **Widget Dashboard fejlesztések** - Továbbfejlesztett widget dashboard funkcionalitás:
  - Javított widget container padding és margin a jobb szélről-szélig elrendezéshez
  - Javított görgetési viselkedés - a widgetek most megfelelően görgetnek, ha a tartalom meghaladja a nézetet
  - Javított widget zsugorodási probléma ablak méretezéskor - a widgetek mérete minden breakpoint-on konzisztens marad
  - Konzisztens 12 oszlopos elrendezés minden képernyőmérethez
  - Jobb widget pozicionálás és térköz
- 🔧 **Elrendezés javítások**:
  - Eltávolított fix container padding, ami megakadályozta, hogy a widgetek elérjék az app szélét
  - Javított ResponsiveGridLayout magasság számítás a megfelelő görgetéshez
  - Jobb container overflow kezelés
  - Jobb widget csoport elrendezés konzisztencia

### v1.2.1 (2025) - 🎨 UI konzisztencia és oszlopkezelés

- 📊 **Filamentek oszlopkezelés** - Oszlop láthatóság és rendezés hozzáadása a Filamentek komponenshez:
  - Oszlop láthatóság váltó menü (ugyanúgy, mint a Nyomtatók komponensben)
  - Rendezési oszlopok: Márka, Típus, Súly, Ár/kg
  - Oszlop láthatóság preferenciák mentése a beállításokban
  - Konzisztens UI a Nyomtatók komponenssel (kezelő gomb, lenyíló menü, rendezési jelzők)
- 🎨 **Téma szín konzisztencia** - Továbbfejlesztett téma szín használat az összes komponensben:
  - Minden gomb és lenyíló ablak konzisztensen használja a téma színeit (Filamentek, Nyomtatók, Kalkulátor, Ár trendek)
  - Eltávolított hardcoded színek (szürke gombok lecserélve elsődleges téma színre)
  - Header komponens teljes alkalmazkodás minden témához és színhez
  - Status info kártya téma színeket használ hardcoded rgba értékek helyett
  - Konzisztens hover effektek themeStyles.buttonHover használatával
- 🔧 **UI fejlesztések**:
  - "Oszlopok kezelése" gomb most elsődleges téma színt használ másodlagos helyett
  - Ár trendek select lenyíló ablak megfelelő focus stílusok használata
  - Minden lenyíló ablak konzisztensen stílusozva téma színekkel
  - Jobb vizuális konzisztencia minden oldalon

### v1.1.6 (2025) - 🌍 Teljes fordítási lefedettség

- 🌍 **Tutorial fordítások** - Hiányzó tutorial fordítási kulcsok hozzáadva minden nyelvi fájlhoz:
  - 8 új tutorial lépés teljes fordítása (Státusz dashboard, PDF előnézet, Húzd és ejtsd, Jobb klikk menü, Ár előzmények, Online ár összehasonlítás, Export/Import, Biztonsági mentés)
  - Minden tutorial tartalom most elérhető mind a 14 támogatott nyelven
  - Teljes tutorial élmény cseh, spanyol, francia, olasz, lengyel, portugál, orosz, szlovák, ukrán és kínai nyelven
- 🎨 **Témák neveinek fordítása** - A témák nevei most teljes mértékben le vannak fordítva minden nyelvre:
  - 15 téma név hozzáadva minden nyelvi fájlhoz (Világos, Sötét, Kék, Zöld, Őserdő, Lila, Narancs, Pasztell, Szénfekete, Éjfél, Gradiens, Neon, Cyberpunk, Naplemente, Óceán)
  - A témák nevei dinamikusan töltődnek a fordítási rendszerből, nem hardcode-olt értékekből
  - Fallback mechanizmus: fordítási kulcs → displayName → téma név
  - Minden téma most a felhasználó által választott nyelven jelenik meg a Beállításokban

### v1.1.5 (2025) - 🎨 UI fejlesztések és log kezelés

- 🎨 **Filament hozzáadása dialógus átdolgozása** - Jobb kétoszlopos elrendezés:
  - Bal oszlop: Alapadatok (Márka, Típus, Súly, Ár, Kép feltöltés)
  - Jobb oszlop: Szín választás az összes szín opcióval
  - Minden beviteli mező egyenlő szélességű
  - Jobb vizuális hierarchia és térköz
  - Kép feltöltés a bal oszlopba, az Ár mező alá helyezve
- 📋 **Log fájlok kezelése** - Új log kezelési szekció az Adatkezelés beállításokban:
  - Beállítható automatikus régi log fájlok törlése (5, 10, 15, 30, 60, 90 nap vagy soha)
  - Gomb a log mappa megnyitásához a fájlkezelőben
  - Automatikus takarítás beállítás változásakor
  - Platform-specifikus mappa megnyitás (macOS, Windows, Linux)
- 📦 **Exportálás/Importálás elrendezés** - Exportálás és Importálás szekciók most egymás mellett:
  - Kétoszlopos responsive elrendezés
  - Jobb térhasználat
  - Javított vizuális egyensúly
- 🍎 **macOS értesítési figyelmeztetés** - Elrejthető figyelmeztetés dialógus:
  - Csak macOS platformon jelenik meg
  - Két bezárási lehetőség: ideiglenes (X gomb) vagy végleges (Bezárás gomb)
  - Ideiglenes bezárás: csak az aktuális session-re rejtve el, újraindítás után újra megjelenik
  - Végleges bezárás: beállításokba mentve, soha nem jelenik meg újra
  - Világos vizuális megkülönböztetés a bezárási típusok között

### v1.1.4 (2025) - 🐛 Filament könyvtár update fájl automatikus létrehozás

- 🐛 **Update fájl automatikus létrehozás** - Javított hiba, ahol az `update_filamentLibrary.json` fájl nem jött létre automatikusan:
  - A fájl most automatikusan létrejön a `filamentLibrarySample.json` fájlból első indításkor
  - Biztosítja, hogy az update fájl mindig elérhető legyen az összevonáshoz
  - Csak akkor hozza létre, ha nem létezik (nem írja felül a meglévőt)
  - Továbbfejlesztett hibakezelés és logolás az update fájl műveletekhez

### v1.1.3 (2025) - 🪟 Windows kompatibilitás javítások

- 🪟 **Windows kompatibilitás javítás** - Filament könyvtár betöltés javítása:
  - Dinamikus import használata a nagy JSON fájlokhoz (statikus import helyett)
  - Cache mechanizmus a többszöri betöltés elkerülésére
  - Javított hibakezelés Windows-on fájl nem található esetekhez
  - Platformfüggetlen működés (Windows, macOS, Linux)
- 🔧 **Hibakezelés fejlesztések** - Továbbfejlesztett hibaüzenetek:
  - Windows-specifikus hibaüzenetek helyes kezelése
  - Fájl nem található esetek csendes kezelése (nem warning-ként)

### v1.1.2 (2025) - 🌍 Nyelvválasztó és fejlesztések

- 🌍 **Nyelvválasztó az első indításkor** - Modern, animált nyelvválasztó dialógus az első indításkor:
  - 13 nyelv támogatása zászló ikonokkal
  - Téma-érzékeny design
  - Smooth animációk
  - A tutorial a kiválasztott nyelven fut
- 🔄 **Visszaállítás alaphelyzetbe (Factory Reset)** - Teljes adattörlés funkció:
  - Törli az összes tárolt adatot (nyomtatók, filamentek, árajánlatok, ügyfelek, beállítások)
  - Megerősítő dialógus veszélyes műveletekhez
  - Az alkalmazás újraindul, mintha először indítanád
- 🎨 **UI fejlesztések**:
  - Footer szöveg kontraszt javítás (dinamikus színválasztás)
  - Nyelv változtatás azonnali mentés
  - Továbbfejlesztett tooltip pozicionálás
- 📚 **Tutorial fordítások** - Teljes tutorial fordítás minden támogatott nyelven (orosz, ukrán, kínai hozzáadva)

### v1.1.1 (2025) - 🎨 Header Layout fejlesztések

- 📐 **Header újrarendezés** - Három részes header struktúra:
  - Bal: Menü + Logo + Cím
  - Közép: Breadcrumb (dinamikusan csökken)
  - Jobb: Gyors műveletek + Státusz info kártya
- 📊 **Státusz info kártya** - Kompakt, modern stílus:
  - "Következő mentés" (címke és érték)
  - Dátum és idő (egymás alatt)
  - Mindig jobb oldalt pozicionálva
- 📱 **Reszponzív design** - Továbbfejlesztett breakpoint-ok:
  - Breadcrumb elrejtése <1000px-nél
  - Dátum elrejtése <900px-nél
  - "Következő mentés" elrejtése <800px-nél
  - Kompakt gyors műveletek <700px-nél
- 🔢 **Számformázás javítás** - Betöltési progress százalékok kerekítése

### v1.1.0 (2025) - 🚀 Funkció frissítés

- 🔍 **Globális keresés kiterjesztése** - Továbbfejlesztett keresési funkciók:
  - Ajánlatok keresése ügyfél név, ID, státusz és dátum alapján
  - Filamentek keresése az adatbázisból (filamentLibrary) márka, típus és szín alapján
  - Filament hozzáadása a mentett listához egy kattintással a keresési eredményekből
  - Továbbfejlesztett keresési eredmények típus jelzőkkel
- 💀 **Skeleton Loading System** - Látványos betöltési élmény:
  - Animált skeleton komponensek shimmer effekttel
  - Progress tracking vizuális indikátorokkal
  - Betöltési lépések pipa jelöléssel a befejezett lépésekhez
  - Smooth fade-in átmenetek
  - Téma-aware skeleton színek
  - Oldal-specifikus skeleton loaderek
- 🎨 **UI/UX fejlesztések**:
  - Jobb betöltési állapotok
  - Továbbfejlesztett felhasználói visszajelzés adatbetöltés közben
  - Fokozott vizuális élmény

### v1.0.0 (2025) - 🎉 Első stabil kiadás

- 🎨 **Modern UI komponensek** - Teljes UI felújítás modern komponensekkel:
  - Empty State komponens jobb felhasználói élményért
  - Card komponens hover effektekkel
  - Progress Bar komponens PDF export/import műveletekhez
  - Tooltip komponens téma integrációval
  - Breadcrumb navigáció az oldal hierarchia egyértelműsítéséhez
- ⚡ **Gyors műveletek** - Header gyors művelet gombok gyorsabb munkafolyamathoz:
  - Gyors hozzáadás gombok Filamentekhez, Nyomtatókhoz és Ügyfelekhez
  - Dinamikus gombok az aktív oldal alapján
  - Billentyűparancs integráció
- 🔍 **Globális keresés (Command Palette)** - Hatékony keresési funkció:
  - `Ctrl/Cmd+K` a globális keresés megnyitásához
  - Oldalak és gyors műveletek keresése
  - Billentyűzet navigáció (↑↓, Enter, Esc)
  - Téma-integrált stílus
- ⏪ **Undo/Redo funkció** - Előzmény kezelés Filamentekhez:
  - `Ctrl/Cmd+Z` a visszavonáshoz
  - `Ctrl/Cmd+Shift+Z` az újra végrehajtáshoz
  - Vizuális undo/redo gombok az UI-ban
  - 50 lépés előzmény támogatás
- ⭐ **Kedvenc Filamentek** - Kedvenc filamentek jelölése és szűrése:
  - Csillag ikon a kedvenc állapot váltásához
  - Szűrő csak kedvencek megjelenítéséhez
  - Tartós kedvenc állapot
- 📦 **Bulk műveletek** - Hatékony tömeges kezelés:
  - Checkbox kijelölés több filamenthez
  - Összes kijelölése / Kijelölés megszüntetése funkció
  - Tömeges törlés megerősítő dialógussal
  - Vizuális kijelölési jelzők
- 🎨 **Modal dialógusok** - Modern modal élmény:
  - Elmosódott háttér modálok hozzáadás/szerkesztés formokhoz
  - Fix méretű beviteli mezők
  - Escape billentyű a bezáráshoz
  - Sima animációk framer-motion-mal
- ⌨️ **Billentyűparancsok** - Továbbfejlesztett parancsrendszer:
  - Testreszabható billentyűparancsok
  - Parancs súgó dialógus (`Ctrl/Cmd+?`)
  - Parancsok szerkesztése billentyű rögzítéssel
  - Tartós parancs tárolás
- 📝 **Logolási rendszer** - Átfogó logolás:
  - Külön log fájlok frontend és backend számára
  - Platform-független log könyvtár feloldás
  - Automatikus log rotáció
  - Konzol integráció
- 🔔 **Értesítési javítások** - Jobb értesítési rendszer:
  - Ügyfél név az árajánlat törlési értesítésekben
  - Platformok közötti értesítési támogatás
  - Továbbfejlesztett hibakezelés
- 🎯 **UI/UX javítások**:
  - Fix beviteli mező méretek
  - Jobb form elrendezések
  - Továbbfejlesztett téma integráció
  - Fokozott akadálymentesség

### v0.6.0 (2025)

#### 🐛 Hibajavítások
- **Logolás optimalizálása**: Csökkentettük a felesleges és duplikált logolást
  - Információs logok csak fejlesztői módban jelennek meg (DEV)
  - Hibák továbbra is logolódnak production buildben is
  - FilamentLibrary inicializálás csendes módban történik
- **Hamis figyelmeztetések javítása**: A filament színfeloldás csak akkor ír WARN-t, ha a library már betöltve van és még mindig nem található a szín
  - Megakadályozza a hamis figyelmeztetéseket az aszinkron library betöltés során
  - Csak valódi problémák esetén jelennek meg figyelmeztetések
- **Update Checker duplikáció javítása**: Eltávolítottuk a duplikált update check hívásokat
- **Gyorsbillentyű logolás javítása**: Csak akkor logol, ha van regisztrált shortcut, kihagyja az érvénytelen kombinációkat

---

## v1.5.0 (2025) - 🧠 Okos Dashboard és határidő emlékeztetők

- ⏱️ **Nyomtatási határidő emlékeztetők** – Új emlékeztető rendszer elfogadott árajánlatokhoz:
  - Az Ütemezett feladatok widget most automatikusan feladatokkal töltődik fel az árajánlatokból, amelyeknek közelgő nyomtatási határideje van
  - A fejléc rotáló "Ma / Holnap / Holnapután" stílusú emlékeztetőket mutat közelgő nyomtatási munkákhoz
  - Tartós info toast figyelmeztet sürgős határidőkre, amíg a felhasználó manuálisan be nem zárja
- 🧵 **Filament készlet kezelés** – Új, dedikált filament készlet nézet:
  - Keresés márka / típus / szín alapján, státusz szűrőkkel (kritikus / alacsony / OK)
  - Beállítható kritikus és alacsony küszöbértékek, inline készlet szerkesztés és gyors +100g / −100g gombok
  - A Filament készlet figyelmeztető widget most közvetlenül ezekből a küszöbértékekből és élő készletszintekből olvas
- 📊 **Dashboard fejlesztések** – Minden widget alapértelmezetten engedélyezve a dashboard nézetben:
  - Gyors műveletek, Legutóbbi árajánlatok, Filament készlet figyelmeztetések, Pénzügyi trendek, Aktív projektek, Ütemezett feladatok
  - A klasszikus Home nézet és a Widget Dashboard most konzisztensebb statisztikákat és grafikonokat oszt meg
- 🧱 **Árajánlatok UX fejlesztések** – Simább szerkesztés és kijelölés:
  - Javított esetek, ahol egy szerkesztett árajánlat mentése nem frissítette azonnal a fő árajánlatok listáját
  - Többszörös kijelölés checkbox kiemelve a cím szövegből, így az ügyfélnevek teljesen olvashatók maradnak
- 🧭 **Fejléc és elrendezés finomhangolás**:
  - Breadcrumb sáv eltávolítva a fejlécből, hogy az elrendezés tiszta maradjon
  - Minimális ablakméret (1280x720) most a Tauri ablak szintjén van kikényszerítve, vízszintes görgetősávok bevezetése nélkül

## v1.4.33 (2025) - 🔧 Widget elrendezés és húzás fejlesztések + Tutorial Demo Adatok

- 📊 **Widget elrendezés javítások** - Javított widget pozicionálás és húzás funkcionalitás:
  - Javított automatikus pozicionálás 6 kis "S" méretű widget esetén, hogy egymás mellé kerüljenek
  - A widgetek mostantól megtartják pozíciójukat manuális húzás után
  - Javított elrendezés megőrzés - a widgetek nem ugranak vissza eredeti pozíciójukra
  - Továbbfejlesztett húzás funkció - a widgetek húzhatók a fejlécről vagy a húzás sávról
  - Javított üres terület problémák a widgetek alatt újra pozicionálás után
  - Továbbfejlesztett elrendezés változás kezelés, hogy ne írja felül a manuális változásokat
- 🎓 **Tutorial Demo Adatok Rendszer** - Automatikus demo adatok generálás és törlés:
  - Demo adatok automatikusan generálódnak amikor a tutorial elindul (ha nincs meglévő adat)
  - Demo adatok tartalmazzák: minta nyomtatókat, filamenteket, árajánlatokat és ügyfeleket
  - Demo adatok automatikusan törlődnek amikor a tutorial befejeződik vagy kihagyásra kerül
  - Az alkalmazás automatikusan újraindul a demo adatok törlése után, hogy a memóriából is eltűnjenek
  - A beállítások megmaradnak a demo adatok törlése során (nyelv, tutorial státusz)
  - Javított végtelen ciklus probléma - a tutorial nem indul újra befejezés után
- 🔧 **Main Build Release Javítás** - Továbbfejlesztett GitHub release létrehozás:
  - Hozzáadott release fájl ellenőrzés a GitHub release létrehozása előtt
  - Továbbfejlesztett release létrehozás, hogy biztosan megjelenjen a latest verzió
  - Javított release név formátum a konzisztencia érdekében

## v1.3.12 (2025) - 🎨 Widget rendszer és pénznem fejlesztések

- 📊 **Widget rendszer fejlesztések** - Továbbfejlesztett widget funkcionalitás és lokalizálás:
  - Új widgetek hozzáadva: Nyomtatási idő grafikon, Ügyfél statisztikák grafikon, Árajánlat státusz grafikon
  - Widget export funkció javítva - minden grafikon widget most exportálható SVG-ként
  - Dinamikus widget címek fordítása a kiválasztott nyelv alapján
  - Lokalizált export fájlnevek megfelelő OS-kompatibilis elnevezéssel (aláhúzások, nincs speciális karakter)
  - Widget nyelvek azonnal frissülnek nyelvválasztás után
  - Toast értesítések sikeres grafikon exportokhoz
  - Minden widget elem és betöltési állapot teljes mértékben lefordítva mind a 13 nyelven
- 💱 **Pénznem támogatás bővítése** - Kibővített pénznem támogatás:
  - Hozzáadott pénznemek: GBP (Brit font), PLN (Lengyel zloty), CZK (Cseh korona), CNY (Kínai jüan), UAH (Ukrán hrivnya), RUB (Orosz rubel)
  - Pénznem szimbólumok és címkék minden új pénznemhez
  - Megfelelő pénznem konverzió és megjelenítés minden komponensben
  - Pénznem választó lenyíló ablak frissítve minden támogatott pénznemmel
- 💰 **Költségszámítás precíziós javítás** - Lebegőpontos precíziós hibák javítva:
  - Minden költségszámítás (filament, áram, szárítás, használat, összes) most 2 tizedesjegyre kerekítve
  - Eltávolított hosszú tizedesjegyek megjelenítése (pl. `0.17500000000000002` → `0.18`)
  - Konzisztens számformázás az alkalmazásban
- 🏢 **Céginformációk dialógus** - Továbbfejlesztett cégadat kezelés:
  - Céginformációk űrlap dialógusba helyezve (hasonlóan a Goods/Filamentekhez)
  - "Cégadatok" gomb a céginformációk megnyitásához/szerkesztéséhez
  - Dialógus bezárható X gombbal, backdrop kattintással vagy Escape billentyűvel
  - Jobb UX animált modal átmenetekkel
  - Minden céginformáció mező elérhető rendezett dialógus felületen

## v1.3.11 (2025) - 🎨 Widget Dashboard fejlesztések

- 📊 **Widget Dashboard fejlesztések** - Továbbfejlesztett widget dashboard funkcionalitás:
  - Javított widget container padding és margin a jobb szélről-szélig elrendezéshez
  - Javított görgetési viselkedés - a widgetek most megfelelően görgetnek, ha a tartalom meghaladja a nézetet
  - Javított widget zsugorodási probléma ablak méretezéskor - a widgetek mérete minden breakpoint-on konzisztens marad
  - Konzisztens 12 oszlopos elrendezés minden képernyőmérethez
  - Jobb widget pozicionálás és térköz
- 🔧 **Elrendezés javítások**:
  - Eltávolított fix container padding, ami megakadályozta, hogy a widgetek elérjék az app szélét
  - Javított ResponsiveGridLayout magasság számítás a megfelelő görgetéshez
  - Jobb container overflow kezelés
  - Jobb widget csoport elrendezés konzisztencia

## v1.2.1 (2025) - 🎨 UI konzisztencia és oszlopkezelés

- 📊 **Filamentek oszlopkezelés** - Oszlop láthatóság és rendezés hozzáadása a Filamentek komponenshez:
  - Oszlop láthatóság váltó menü (ugyanúgy, mint a Nyomtatók komponensben)
  - Rendezési oszlopok: Márka, Típus, Súly, Ár/kg
  - Oszlop láthatóság preferenciák mentése a beállításokban
  - Konzisztens UI a Nyomtatók komponenssel (kezelő gomb, lenyíló menü, rendezési jelzők)
- 🎨 **Téma szín konzisztencia** - Továbbfejlesztett téma szín használat az összes komponensben:
  - Minden gomb és lenyíló ablak konzisztensen használja a téma színeit (Filamentek, Nyomtatók, Kalkulátor, Ár trendek)
  - Eltávolított hardcoded színek (szürke gombok lecserélve elsődleges téma színre)
  - Header komponens teljes alkalmazkodás minden témához és színhez
  - Status info kártya téma színeket használ hardcoded rgba értékek helyett
  - Konzisztens hover effektek themeStyles.buttonHover használatával
- 🔧 **UI fejlesztések**:
  - "Oszlopok kezelése" gomb most elsődleges téma színt használ másodlagos helyett
  - Ár trendek select lenyíló ablak megfelelő focus stílusok használata
  - Minden lenyíló ablak konzisztensen stílusozva téma színekkel
  - Jobb vizuális konzisztencia minden oldalon

## v1.1.6 (2025) - 🌍 Teljes fordítási lefedettség

- 🌍 **Tutorial fordítások** - Hiányzó tutorial fordítási kulcsok hozzáadva minden nyelvi fájlhoz:
  - 8 új tutorial lépés teljes fordítása (Státusz dashboard, PDF előnézet, Húzd és ejtsd, Jobb klikk menü, Ár előzmények, Online ár összehasonlítás, Export/Import, Biztonsági mentés)
  - Minden tutorial tartalom most elérhető mind a 14 támogatott nyelven
  - Teljes tutorial élmény cseh, spanyol, francia, olasz, lengyel, portugál, orosz, szlovák, ukrán és kínai nyelven
- 🎨 **Témák neveinek fordítása** - A témák nevei most teljes mértékben le vannak fordítva minden nyelvre:
  - 15 téma név hozzáadva minden nyelvi fájlhoz (Világos, Sötét, Kék, Zöld, Őserdő, Lila, Narancs, Pasztell, Szénfekete, Éjfél, Gradiens, Neon, Cyberpunk, Naplemente, Óceán)
  - A témák nevei dinamikusan töltődnek a fordítási rendszerből, nem hardcode-olt értékekből
  - Fallback mechanizmus: fordítási kulcs → displayName → téma név
  - Minden téma most a felhasználó által választott nyelven jelenik meg a Beállításokban

## v1.1.5 (2025) - 🎨 UI fejlesztések és log kezelés

- 🎨 **Filament hozzáadása dialógus átdolgozása** - Jobb kétoszlopos elrendezés:
  - Bal oszlop: Alapadatok (Márka, Típus, Súly, Ár, Kép feltöltés)
  - Jobb oszlop: Szín választás az összes szín opcióval
  - Minden beviteli mező egyenlő szélességű
  - Jobb vizuális hierarchia és térköz
  - Kép feltöltés a bal oszlopba, az Ár mező alá helyezve
- 📋 **Log fájlok kezelése** - Új log kezelési szekció az Adatkezelés beállításokban:
  - Beállítható automatikus régi log fájlok törlése (5, 10, 15, 30, 60, 90 nap vagy soha)
  - Gomb a log mappa megnyitásához a fájlkezelőben
  - Automatikus takarítás beállítás változásakor
  - Platform-specifikus mappa megnyitás (macOS, Windows, Linux)
- 📦 **Exportálás/Importálás elrendezés** - Exportálás és Importálás szekciók most egymás mellett:
  - Kétoszlopos responsive elrendezés
  - Jobb térhasználat
  - Javított vizuális egyensúly
- 🍎 **macOS értesítési figyelmeztetés** - Elrejthető figyelmeztetés dialógus:
  - Csak macOS platformon jelenik meg
  - Két bezárási lehetőség: ideiglenes (X gomb) vagy végleges (Bezárás gomb)
  - Ideiglenes bezárás: csak az aktuális session-re rejtve el, újraindítás után újra megjelenik
  - Végleges bezárás: beállításokba mentve, soha nem jelenik meg újra
  - Világos vizuális megkülönböztetés a bezárási típusok között

## v1.1.4 (2025) - 🐛 Filament könyvtár update fájl automatikus létrehozás

- 🐛 **Update fájl automatikus létrehozás** - Javított hiba, ahol az `update_filamentLibrary.json` fájl nem jött létre automatikusan:
  - A fájl most automatikusan létrejön a `filamentLibrarySample.json` fájlból első indításkor
  - Biztosítja, hogy az update fájl mindig elérhető legyen az összevonáshoz
  - Csak akkor hozza létre, ha nem létezik (nem írja felül a meglévőt)
  - Továbbfejlesztett hibakezelés és logolás az update fájl műveletekhez

## v1.1.3 (2025) - 🪟 Windows kompatibilitás javítások

- 🪟 **Windows kompatibilitás javítás** - Filament könyvtár betöltés javítása:
  - Dinamikus import használata a nagy JSON fájlokhoz (statikus import helyett)
  - Cache mechanizmus a többszöri betöltés elkerülésére
  - Javított hibakezelés Windows-on fájl nem található esetekhez
  - Platformfüggetlen működés (Windows, macOS, Linux)
- 🔧 **Hibakezelés fejlesztések** - Továbbfejlesztett hibaüzenetek:
  - Windows-specifikus hibaüzenetek helyes kezelése
  - Fájl nem található esetek csendes kezelése (nem warning-ként)

## v1.1.2 (2025) - 🌍 Nyelvválasztó és fejlesztések

- 🌍 **Nyelvválasztó az első indításkor** - Modern, animált nyelvválasztó dialógus az első indításkor:
  - 13 nyelv támogatása zászló ikonokkal
  - Téma-érzékeny design
  - Smooth animációk
  - A tutorial a kiválasztott nyelven fut
- 🔄 **Visszaállítás alaphelyzetbe (Factory Reset)** - Teljes adattörlés funkció:
  - Törli az összes tárolt adatot (nyomtatók, filamentek, árajánlatok, ügyfelek, beállítások)
  - Megerősítő dialógus veszélyes műveletekhez
  - Az alkalmazás újraindul, mintha először indítanád
- 🎨 **UI fejlesztések**:
  - Footer szöveg kontraszt javítás (dinamikus színválasztás)
  - Nyelv változtatás azonnali mentés
  - Továbbfejlesztett tooltip pozicionálás
- 📚 **Tutorial fordítások** - Teljes tutorial fordítás minden támogatott nyelven (orosz, ukrán, kínai hozzáadva)

## v1.1.1 (2025) - 🎨 Header Layout fejlesztések

- 📐 **Header újrarendezés** - Három részes header struktúra:
  - Bal: Menü + Logo + Cím
  - Közép: Breadcrumb (dinamikusan csökken)
  - Jobb: Gyors műveletek + Státusz info kártya
- 📊 **Státusz info kártya** - Kompakt, modern stílus:
  - "Következő mentés" (címke és érték)
  - Dátum és idő (egymás alatt)
  - Mindig jobb oldalt pozicionálva
- 📱 **Reszponzív design** - Továbbfejlesztett breakpoint-ok:
  - Breadcrumb elrejtése <1000px-nél
  - Dátum elrejtése <900px-nél
  - "Következő mentés" elrejtése <800px-nél
  - Kompakt gyors műveletek <700px-nél
- 🔢 **Számformázás javítás** - Betöltési progress százalékok kerekítése

## v1.1.0 (2025) - 🚀 Funkció frissítés

- 🔍 **Globális keresés kiterjesztése** - Továbbfejlesztett keresési funkciók:
  - Ajánlatok keresése ügyfél név, ID, státusz és dátum alapján
  - Filamentek keresése az adatbázisból (filamentLibrary) márka, típus és szín alapján
  - Filament hozzáadása a mentett listához egy kattintással a keresési eredményekből
  - Továbbfejlesztett keresési eredmények típus jelzőkkel
- 💀 **Skeleton Loading System** - Látványos betöltési élmény:
  - Animált skeleton komponensek shimmer effekttel
  - Progress tracking vizuális indikátorokkal
  - Betöltési lépések pipa jelöléssel a befejezett lépésekhez
  - Smooth fade-in átmenetek
  - Téma-aware skeleton színek
  - Oldal-specifikus skeleton loaderek
- 🎨 **UI/UX fejlesztések**:
  - Jobb betöltési állapotok
  - Továbbfejlesztett felhasználói visszajelzés adatbetöltés közben
  - Fokozott vizuális élmény

## v1.0.0 (2025) - 🎉 Első stabil kiadás

- 🎨 **Modern UI komponensek** - Teljes UI felújítás modern komponensekkel:
  - Empty State komponens jobb felhasználói élményért
  - Card komponens hover effektekkel
  - Progress Bar komponens PDF export/import műveletekhez
  - Tooltip komponens téma integrációval
  - Breadcrumb navigáció az oldal hierarchia egyértelműsítéséhez
- ⚡ **Gyors műveletek** - Header gyors művelet gombok gyorsabb munkafolyamathoz:
  - Gyors hozzáadás gombok Filamentekhez, Nyomtatókhoz és Ügyfelekhez
  - Dinamikus gombok az aktív oldal alapján
  - Billentyűparancs integráció
- 🔍 **Globális keresés (Command Palette)** - Hatékony keresési funkció:
  - `Ctrl/Cmd+K` a globális keresés megnyitásához
  - Oldalak és gyors műveletek keresése
  - Billentyűzet navigáció (↑↓, Enter, Esc)
  - Téma-integrált stílus
- ⏪ **Undo/Redo funkció** - Előzmény kezelés Filamentekhez:
  - `Ctrl/Cmd+Z` a visszavonáshoz
  - `Ctrl/Cmd+Shift+Z` az újra végrehajtáshoz
  - Vizuális undo/redo gombok az UI-ban
  - 50 lépés előzmény támogatás
- ⭐ **Kedvenc Filamentek** - Kedvenc filamentek jelölése és szűrése:
  - Csillag ikon a kedvenc állapot váltásához
  - Szűrő csak kedvencek megjelenítéséhez
  - Tartós kedvenc állapot
- 📦 **Bulk műveletek** - Hatékony tömeges kezelés:
  - Checkbox kijelölés több filamenthez
  - Összes kijelölése / Kijelölés megszüntetése funkció
  - Tömeges törlés megerősítő dialógussal
  - Vizuális kijelölési jelzők
- 🎨 **Modal dialógusok** - Modern modal élmény:
  - Elmosódott háttér modálok hozzáadás/szerkesztés formokhoz
  - Fix méretű beviteli mezők
  - Escape billentyű a bezáráshoz
  - Sima animációk framer-motion-mal
- ⌨️ **Billentyűparancsok** - Továbbfejlesztett parancsrendszer:
  - Testreszabható billentyűparancsok
  - Parancs súgó dialógus (`Ctrl/Cmd+?`)
  - Parancsok szerkesztése billentyű rögzítéssel
  - Tartós parancs tárolás
- 📝 **Logolási rendszer** - Átfogó logolás:
  - Külön log fájlok frontend és backend számára
  - Platform-független log könyvtár feloldás
  - Automatikus log rotáció
  - Konzol integráció
- 🔔 **Értesítési javítások** - Jobb értesítési rendszer:
  - Ügyfél név az árajánlat törlési értesítésekben
  - Platformok közötti értesítési támogatás
  - Továbbfejlesztett hibakezelés
- 🎯 **UI/UX javítások**:
  - Fix beviteli mező méretek
  - Jobb form elrendezések
  - Továbbfejlesztett téma integráció
  - Fokozott akadálymentesség

## v0.6.0 (2025)

### 🐛 Hibajavítások
- **Logolás optimalizálása**: Csökkentettük a felesleges és duplikált logolást
  - Információs logok csak fejlesztői módban jelennek meg (DEV)
  - Hibák továbbra is logolódnak production buildben is
  - FilamentLibrary inicializálás csendes módban történik
- **Hamis figyelmeztetések javítása**: A filament színfeloldás csak akkor ír WARN-t, ha a library már betöltve van és még mindig nem található a szín
  - Megakadályozza a hamis figyelmeztetéseket az aszinkron library betöltés során
  - Csak valódi problémák esetén jelennek meg figyelmeztetések
- **Update Checker duplikáció javítása**: Eltávolítottuk a duplikált update check hívásokat
- **Gyorsbillentyű logolás javítása**: Csak akkor logol, ha van regisztrált shortcut, kihagyja az érvénytelen kombinációkat

### ⚡ Teljesítmény javítások
- Store műveletek logolása optimalizálva (csak DEV módban)
- Kevesebb console művelet production buildben
- Tisztább console output fejlesztés során

### 👥 Ügyfél adatbázis
- Ügyfelek hozzáadása, szerkesztése, törlése
- Kapcsolattartási információk (email, telefon)
- Cégadatok (opcionális)
- Cím és megjegyzések
- Ügyfél statisztikák (összes árajánlat, utolsó árajánlat dátuma)
- Keresési funkció
- Kalkulátor integráció gyors ügyfél kiválasztáshoz

### 📊 Ár előzmények és trendek
- Automatikus ár előzmény követés filament ár módosításnál
- Ár trendek vizualizáció SVG grafikonokkal
- Ár statisztikák (jelenlegi, átlagos, min, max ár)
- Trend elemzés (növekvő, csökkenő, stabil)
- Ár előzmények táblázat részletes változási információkkal
- Jelentős ár változás figyelmeztetések (10%+ változások)
- Ár előzmények megjelenítése a Filaments komponensben szerkesztéskor

## v0.5.58 (2025)
- 🌍 **Ukrán és Orosz nyelv támogatás** – Teljes fordítási támogatás hozzáadva az ukrán (uk) és orosz (ru) nyelvekhez:
  - Teljes fordítási fájlok mindkét nyelvhez, összesen 813 fordítási kulccsal
  - Ukrán locale támogatás (uk-UA) dátum/idő formázáshoz
  - Orosz locale támogatás (ru-RU) dátum/idő formázáshoz
  - Minden README fájl frissítve az új nyelvekkel a nyelvmenüben
  - Nyelvszámláló frissítve 11-ről 13 nyelvre
  - README.uk.md és README.ru.md dokumentációs fájlok létrehozva

## v0.5.57 (2025)
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

## v0.5.56 (2025)
- 🌍 **Teljes nyelvi fordítások** – Elkészült a maradék 6 nyelvi fájl teljes fordítása: cseh (cs), spanyol (es), olasz (it), lengyel (pl), portugál (pt) és szlovák (sk). Minden fájl tartalmazza az összes 813 fordítási kulcsot, így az alkalmazás mostantól teljes mértékben támogatott ezeken a nyelveken.
- 🔒 **Tauri engedélyek javítása** – Az `update_filamentLibrary.json` fájl mostantól explicit módon engedélyezve van az olvasás, írás és létrehozás műveletekhez a Tauri capabilities fájlban, így a filament könyvtár frissítések megbízhatóan működnek.

## v0.5.55 (2025)
- 🧵 **Árajánlat szerkesztés fejlesztés** – A mentett ajánlatoknál mostantól közvetlenül választható vagy módosítható a nyomtató, a filament változtatásokkal együtt automatikusan újraszámolódnak a költségek.
- 🧮 **Pontosság és naplózás** – Részletes logolás segít követni a költségszámítás lépéseit (filament, áram, szárítás, használat), így könnyebb hibát keresni importált G-code-ok esetén.
- 🌍 **Fordítási kiegészítések** – Új i18n kulcsok és feliratok kerültek a printer-választóhoz, így minden támogatott nyelven egységes a szerkesztő UI.
- 📄 **Dokumentáció frissítése** – A README bővült az új funkciók leírásával, a verziótörténetbe bekerült a v0.5.55 kiadás.

## v0.5.11 (2025)
- 🗂️ **Nyelvi modulárisítás** – Új `languages/` könyvtárba szervezett fordítási fájlokkal bővítettük az appot, így könnyebb új nyelveket felvenni és a meglévő szövegeket kezelni.
- 🌍 **Egységesített UI fordítások** – A slicer import teljes felülete mostantól a központi fordítási rendszerből dolgozik, minden gomb, hibaüzenet és összefoglaló lokalizálva van.
- 🔁 **Nyelvválasztó frissítés** – A Beállításokban a nyelvválasztó a feltárt nyelvi fájlok alapján töltődik fel, így a jövőben elég egy új nyelvi fájlt hozzáadni.
- 🌐 **Új nyelvi alapok** – Francia, olasz, spanyol, lengyel, cseh, szlovák, brazil portugál és egyszerűsített kínai fordítási fájlok előkészítve (angol fallback-pal), a tényleges fordítások könnyen kitölthetők.

## v0.5.0 (2025)
- 🔎 **Filament ár-összehasonlító gomb** – Minden saját filamenthez nagyító ikon társul, amely megnyitja a Google/Bing keresést a márka/típus/szín alapján, gyors linket adva az aktuális árakhoz.
- 💶 **Tizedesár támogatás** – A filamentek ármezője mostantól elfogadja a tizedeseket (14.11 € stb.), a bevitel automatikusan validálva és formázva mentődik.
- 🌐 **Fordított keresés fallback** – Ha a Tauri shell nem tudja megnyitni a böngészőt, az alkalmazás automatikusan új lapot nyit, így a keresés minden platformon működik.

## v0.4.99 (2025)
- 🧾 **Kalkulátorba épített G-code import** – Új modális `SlicerImportModal` a kalkulátor tetején, amely G-code/JSON exportokból egy kattintással átemeli a nyomtatási időt, filament mennyiséget és árajánlat piszkozatot hoz létre.
- 📊 **Fejlécből származó slicer adatok** – A G-code fejléc `total filament weight/length/volume` értékei automatikusan átveszik az összesítéseket, pontosan kezelve a színcserék veszteségeit is.

## v0.4.98 (2025)
- 🧵 **Multicolor filament támogatás** – A filament könyvtár és a kezelő UI most már külön jelöli a többszínű (rainbow/dual/tricolor) szálakat, megjegyzéssel és szivárvány előnézettel.
- 🌐 **Automatikus fordítás a CSV importnál** – A külső adatbázisból importált színnevek magyar és német címkéket kapnak, így a színválasztó többnyelvű marad kézi szerkesztés nélkül.
- 🔄 **Update könyvtár összevonás** – A `update_filamentLibrary.json` fájl tartalma induláskor automatikusan deduplikálva egyesül a meglévő könyvtárral, a felhasználói módosítások felülírása nélkül.
- 📁 **CSV konverter frissítése** – A `convert-filament-csv.mjs` script már nem írja felül a tartós `filamentLibrary.json`-t, helyette update fájlt készít és többnyelvű címkéket generál.
- ✨ **Animációs élmény tuning** – Új oldalváltási opciók (flip, parallax), mikrointerakció-stílus választó, pulzáló visszajelzések, filament könyvtár skeleton lista és finomhangolt kártya hover effektek.
- 🎨 **Téma műhely bővítések** – Négy új beépített téma (Forest, Pastel, Charcoal, Midnight), aktív téma azonnali duplikálása egyedi szerkesztéshez, továbbfejlesztett gradient/kontraszt kezelés és egyszerűsített megosztási folyamat.

## v0.4.0 (2025)
- 🧵 **Filament adatbázis integráció** – 12,000+ gyári szín beépített JSON könyvtárból (filamentcolors.xyz snapshot), márkánként és anyagonként rendezve
- 🪟 **Fix méretű választó panelek** – Gombbal nyíló, kereshető, görgethető márka- és típuslisták, amelyek kizárják egymást, így átláthatóbb az űrlap
- 🎯 **Színválasztó fejlesztések** – Könyvtári elemek felismerésekor automatikusan beáll a finish és a hex kód, egyedi módra váltáskor külön mezők állnak rendelkezésre
- 💾 **Filament könyvtár szerkesztő** – Új beállítási fül popup űrlappal, duplikációkezeléssel és Tauri FS alapú tartós `filamentLibrary.json` mentéssel
- 📄 **Dokumentáció frissítése** – Új bullet a fő feature listában a filament színkönyvtárhoz, README/FEATURE_SUGGESTIONS takarítás

## v0.3.9 (2025)
- 🔍 **Árajánlat szűrő presetek** – Menthető, elnevezhető szűrő beállítások, alapértelmezett gyors presetek (Ma, Tegnap, Heti, Havi stb.) és egy kattintásos alkalmazás/törlés
- 📝 **Státuszváltási megjegyzések** – Új modal az árajánlat státusz módosításához opcionális jegyzettel, amely eltárolódik a státusz előzményekben
- 🖼️ **PDF export bővítés** – A filamentekhez tárolt képek megjelennek a PDF táblázatban, nyomtatásra optimalizált stílussal
- 🧾 **Céges branding adatlap** – Cégnév, cím, adószám, bankszámlaszám, elérhetőség és logó feltöltése; automatikusan bekerül a PDF fejlécebe
- 🎨 **PDF sablon választó** – Három stílus (Modern, Minimalista, Professzionális) közül választható az árajánlat kinézete
- 👁️ **Beépített PDF előnézet** – Külön gomb az árajánlat részleteinél az azonnali vizuális ellenőrzéshez export előtt
- 📊 **Státusz dashboard** – Státusz kártyák összesítéssel, gyors státusz-szűrők és legutóbbi státuszváltások idővonala az árajánlatoknál
- 📈 **Statisztikai grafikonok** – Bevétel/költség/profit trendchart, filament megoszlás torta diagram, nyomtatónkénti bevétel oszlopdiagram, mindez SVG/PNG formátumban exportálható, valamint egy PDF-be is menthető

## v0.3.8 (2025)
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

## v0.3.7 (2025)
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

## v0.3.6 (2025)
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

## v0.3.5 (2025)
- ✅ **MyMemory API integráció** - Ingyenes fordító API LibreTranslate helyett
- ✅ **GitHub releases oldal megnyitása** - Gomb a GitHub releases oldal megnyitásához rate limit esetén
- ✅ **Rate limit hibakezelés javítása** - Egyértelmű hibaüzenetek és retry gomb
- 🐛 **Build hibák javítása** - Unused import-ok eltávolítása (offerCalc.ts)

## v0.3.4 (2025)
- ✅ **Input validáció fejlesztése** - Központi validációs utility létrehozása és integrálása Calculator, Filaments, Printers komponensekbe
- ✅ **Validációs hibaüzenetek** - Többnyelvű (HU/EN/DE) hibaüzenetek toast értesítésekkel
- ✅ **Performance optimalizálás** - Lazy loading komponensek (code splitting), useMemo és useCallback optimalizálás
- ✅ **Platform specifikus inicializálás** - macOS, Windows, Linux platform specifikus inicializálás alapok
- 🐛 **Build hiba javítás** - Printers.tsx kontextus menü funkciók hozzáadása

## v0.3.3 (2025)
- 🖱️ **Drag & Drop funkciók** - Árajánlatok, filamentek és nyomtatók átrendezése húzással
- 📱 **Kontextus menük** - Jobb klikk menük gyors műveletekhez (szerkesztés, törlés, duplikálás, PDF export)
- 🎨 **Visual feedback** - Drag & drop során opacity és cursor változás
- 🔔 **Toast értesítések** - Átrendezés után értesítések
- 🐛 **Build hiba javítás** - Calculator.tsx theme.colors.error -> theme.colors.danger javítás

## v0.3.2 (2025)
- 📋 **Template funkciók** - Kalkulációk mentése és betöltése template-ként a Calculator komponensben
- 📜 **Előzmények/Verziózás árajánlatokhoz** - Árajánlatok verziózása, előzmények megtekintése, változtatások nyomon követése
- 🧹 **Duplikáció javítás** - Duplikált CSV/JSON export/import funkciók eltávolítása Filaments és Printers komponensekből (Settings-ben maradtak)

## v0.3.1 (2025)
- ✅ **Input validáció fejlesztése** - Negatív számok eltiltása, maximum értékek beállítása (filament súly, nyomtatási idő, teljesítmény, stb.)
- 📊 **CSV/JSON export/import** - Filamentek és nyomtatók tömeges exportálása/importálása CSV és JSON formátumban
- 📥 **Import/Export gombok** - Könnyű hozzáférés az export/import funkciókhoz a Filaments és Printers oldalakon
- 🎨 **Empty states javítása** - Informatív üres állapotok megjelenítése, amikor nincsenek adatok

## v0.3.0 (2025)
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

## v0.2.55 (2025)
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

## v0.2.0 (2025)
- 🎨 **Téma rendszer** - 6 modern téma (Light, Dark, Blue, Green, Purple, Orange)
- 🎨 **Téma választó** - Beállításokban választható téma, azonnal érvénybe lép
- 🎨 **Teljes téma integráció** - Minden komponens (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) használja a témákat
- 🎨 **Dinamikus színek** - Minden hard-coded szín lecserélve a téma színeire
- 🎨 **Responsive téma** - Az árajánlatok és a Sidebar footer is használja a témákat
- 💱 **Dinamikus pénznem konverzió** - Az árajánlatok most a jelenlegi beállítások pénznemében jelennek meg (automatikus konverzió)
- 💱 **Pénznem váltás** - A beállításokban megváltoztatott pénznem azonnal érvénybe lép az árajánlatok megjelenítésénél
- 💱 **PDF pénznem konverzió** - A PDF export is a jelenlegi beállítások pénznemében készül
- 💱 **Filament ár konverzió** - A filament árak is automatikusan konvertálva jelennek meg

## v0.1.85 (2025)
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

## v0.1.56 (2025)
- ✨ **Calculator layout javítások**: Filament kártyák túlcsordulás javítva, responsive flexbox layout
- ✨ **Költség bontás responsive**: Most dinamikusan reagál az ablakméret változására
- 🐛 **Bugfix**: Filament hozzáadásakor nem csúszik ki a tartalom az ablakból
- 🐛 **Bugfix**: Minden Calculator elem megfelelően reagál az ablakméret változására

## v0.1.55 (2025)
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

**Utolsó frissítés**: 2025. december 1.

