# Fejlesztési javaslatok - 3DPrinterCalcApp

## 🎯 Prioritás szerint rendezett javaslatok

### 🔴 Magas prioritás (UX/Funkcionalitás javítások)

#### 1. **PDF export fejlesztése**
- **Mit**: 
  - Nyomtató kép és további sablon testreszabás (szín/fejléc szerkesztés)
- **Előny**: Professzionálisabb árajánlatok, jobb brand megjelenés
- **Becsült idő**: 8-12 óra
- **Komplexitás**: Közepes
#### 2. **Árajánlatok email küldés** ❌ **NEM IMPLEMENTÁLJUK**
- **Mit**: 
  - Email küldés közvetlenül az alkalmazásból
  - Email template testreszabás
  - Több címzett támogatás (CC, BCC)
  - Email küldés előzmények (mikor küldtük, kinek)
  - Email státusz követés (kiküldve, olvasva)
- **Előny**: Könnyebb kommunikáció ügyfelekkel
- **Becsült idő**: 12-16 óra
- **Komplexitás**: Magas
- **❌ Kizárva**: Komplex implementáció, biztonsági kockázatok, alternatíva: PDF export
- **Részletek**: Lásd [EXCLUDED_FEATURES.md](EXCLUDED_FEATURES.md)

### 🟡 Közepes prioritás (funkcionalitás bővítések)

#### 1. **Árajánlat státusz követés**
- **Mit**: 
  - Automatikus emlékeztető elutasított árajánlatokra
- **Előny**: Jobb árajánlat kezelés, könnyebb követés
- **Becsült idő**: 8-10 óra
- **Komplexitás**: Közepes

#### 2. **Felhasználói profil és beállítások**
- **Mit**: 
  - Alapértelmezett beállítások (profit százalék, pénznem, nyelv)
  - Profil kép feltöltés
  - Beállítások export/import
  - Több profil támogatás (váltás különböző projektekhez)
- **Előny**: Személyre szabható alkalmazás, több projekt kezelés
- **Becsült idő**: 6-8 óra
- **Komplexitás**: Közepes

#### 3. **Költség kategóriák és címkék**
- **Mit**: 
  - Kategóriák létrehozása (pl. Prototípus, Sorozatgyártás, Egyedi)
  - Címkék hozzáadása árajánlatokhoz
  - Kategória szerinti szűrés és statisztikák
  - Címke szerinti szűrés
  - Kategória szerinti jelentések
- **Előny**: Jobb szervezés, könnyebb elemzés
- **Becsült idő**: 6-8 óra
- **Komplexitás**: Közepes

#### 4. **Számla generálás**
- **Mit**: 
  - Számla generálás árajánlatból
  - Számla számozás (automatikus vagy manuális)
  - Számla sablonok (magyar, angol, német formátum)
  - Számla PDF export
  - Számla státusz követés (kiállítva, kifizetve, lejárt)
- **Előny**: Komplett számlázási rendszer integráció
- **Becsült idő**: 12-16 óra
- **Komplexitás**: Magas

#### 5. **Automatikus árfrissítés**
- **Mit**: 
  - Filament árak automatikus frissítése API-ból
  - Valuta árfolyamok automatikus frissítése
  - Ár figyelmeztetések (ha az ár jelentősen változott)
  - Ár előzmények (mikor változott, mennyire)
  - Ár trend grafikonok
- **Előny**: Naprakész árazás, pontos számítások
- **Becsült idő**: 10-12 óra
- **Komplexitás**: Magas

#### 6. **Többnyelvűség bővítése**
- **Mit**: 
  - További nyelvek hozzáadása (francia, olasz, spanyol, lengyel)
  - Nyelv pack import/export
  - Közösségi fordítás támogatás
  - Automatikus nyelvfelismerés
  - Részleges fordítások kezelése
- **Előny**: Szélesebb felhasználói bázis, nemzetközi használat
- **Becsült idő**: 8-10 óra
- **Komplexitás**: Közepes
### 🟢 Alacsony prioritás (nice-to-have)

#### 1. **Dark mode automatikus váltás** ❌ **NEM IMPLEMENTÁLJUK**
- **Mit**: 
  - Rendszer alapú dark/light mode váltás
  - Időzített téma váltás (pl. este automatikusan dark mode)
  - Smooth transition animációk téma váltáskor
  - Téma előnézet előtti mentés
- **Előny**: Jobb felhasználói élmény, automatikus adaptáció
- **Becsült idő**: 4-6 óra
- **Komplexitás**: Alacsony
- **❌ Kizárva**: Már van 11 manuális téma választás, felhasználók jobban szeretik a manuális választást
- **Részletek**: Lásd [EXCLUDED_FEATURES.md](EXCLUDED_FEATURES.md)

#### 2. **Alkalmazás hangok és hangeffektek**
- **Mit**: 
  - Hangok műveletekhez (mentés, törlés, export)
  - Hangeffektek be/ki kapcsolása
  - Hang hangerő szabályozás
  - Egyedi hangok feltöltése
- **Előny**: Interaktívabb felhasználói élmény
- **Becsült idő**: 4-6 óra
- **Komplexitás**: Alacsony

#### 3. **Rövidítések és makrók**
- **Mit**: 
  - Gyors műveletek billentyűkombinációkkal
  - Makrók létrehozása (pl. új árajánlat gyors létrehozása)
  - Egyedi billentyűkombinációk beállítása
  - Makrók megosztása más felhasználókkal
- **Előny**: Gyorsabb munkafolyamat, hatékonyság növelés
- **Becsült idő**: 6-8 óra
- **Komplexitás**: Közepes

#### 4. **Naptár integráció**
- **Mit**: 
  - Árajánlatok dátumokkal naptárban
  - Határidők emlékeztetők
  - Naptár export (iCal, Google Calendar)
  - Naptár szinkronizálás
- **Előny**: Jobb határidő kezelés, időbeosztás
- **Becsült idő**: 8-10 óra
- **Komplexitás**: Közepes

#### 5. **Közösségi funkciók**
- **Mit**: 
  - Árajánlat megosztás linkkel
  - Filament adatbázis megosztás
  - Template megosztás
  - Közösségi filament ár adatbázis
- **Előny**: Közösségi élmény, adatmegosztás
- **Becsült idő**: 12-16 óra
- **Komplexitás**: Magas

#### 6. **AI segítség** ❌ **NEM IMPLEMENTÁLJUK**
- **Mit**: 
  - AI árazás ajánlások (hasonló projektek alapján)
  - AI leírás generálás
  - AI optimalizálás javaslatok
  - AI hiba javítás javaslatok
- **Előny**: Okosabb alkalmazás, automatizálás
- **Becsült idő**: 16-20 óra
- **Komplexitás**: Magas
- **❌ Kizárva**: Nagy komplexitás, API költségek, privacy kérdések, alternatíva: template-ek
- **Részletek**: Lásd [EXCLUDED_FEATURES.md](EXCLUDED_FEATURES.md)
## 🛠️ Technikai javítások és optimalizálás

### 1. **TypeScript strict mode**
- **Mit**: Ellenőrizd, hogy minden típus helyesen van definiálva, strict mode bekapcsolása
- **Hol**: Minden `.tsx` fájl, `tsconfig.json`
- **Előny**: Kevesebb runtime hiba, jobb kódminőség
- **Becsült idő**: 4-6 óra
- **Komplexitás**: Közepes

### 2. **Unit tesztek**
- **Mit**: Tesztek a kritikus számításokhoz (pl. `Calculator.tsx`), utility funkciókhoz
- **Előny**: Biztonságos refactoring, kevesebb bug, jobb kódminőség
- **Becsült idő**: 8-12 óra
- **Komplexitás**: Magas
- **Tesztelési framework**: Vitest vagy Jest
- **Coverage cél**: Minimum 70% code coverage

### 3. **E2E (End-to-End) tesztek**
- **Mit**: Teljes felhasználói folyamatok tesztelése (pl. árajánlat létrehozása, PDF export)
- **Előny**: Regresszió tesztelés, UI változások ellenőrzése
- **Becsült idő**: 10-14 óra
- **Komplexitás**: Magas
- **Tesztelési framework**: Playwright vagy Cypress

### 4. **Performance optimalizálás továbbfejlesztése**
- **Mit**: 
  - Bundle size optimalizálás (code splitting továbbfejlesztése)
  - Lazy loading komponenseknél
  - Memoization javítása (useMemo, useCallback)
  - Virtual scrolling nagy listáknál (árajánlatok, filamentek)
  - Image lazy loading
- **Előny**: Gyorsabb alkalmazás, kevesebb memória használat
- **Becsült idő**: 8-10 óra
- **Komplexitás**: Közepes

### 5. **Error tracking és monitoring**
- **Mit**: 
  - Error tracking integráció (Sentry, LogRocket)
  - Performance monitoring
  - User session recording (opcionális, GDPR compliant)
  - Crash reporting
  - Error analytics dashboard
- **Előny**: Proaktív hiba javítás, jobb felhasználói élmény
- **Becsült idő**: 6-8 óra
- **Komplexitás**: Közepes


## 📊 Adatkezelés és elemzés

### 1. **Analytics (opcionális)** ❌ **NEM IMPLEMENTÁLJUK**
- **Mit**: Használati statisztikák (anonym módon)
- **Mit mérj**: Mely funkciókat használják a legtöbbet, hol vannak problémák
- **Előny**: Adat-alapú fejlesztési döntések
- **Figyelem**: GDPR szabályozás, privacy policy szükséges
- **Becsült idő**: 8-12 óra
- **Komplexitás**: Magas
- **❌ Kizárva**: GDPR/privacy kérdések, felhasználói megbízhatóság, alternatíva: GitHub Issues visszajelzések
- **Részletek**: Lásd [EXCLUDED_FEATURES.md](EXCLUDED_FEATURES.md)

### 2. **Adatbázis migráció**
- **Mit**: Verziózott adatstruktúra, automatikus migráció
- **Előny**: Könnyebb frissítések, kompatibilitás
- **Becsült idő**: 6-8 óra
- **Komplexitás**: Magas

## 🎨 UI/UX finomítások

### 1. **Accessibility (a11y) javítások továbbfejlesztése** ❌ **NEM IMPLEMENTÁLJUK (JELENLEG)**
- **Mit**: 
  - ARIA labels hozzáadása minden interaktív elemhez
  - Keyboard navigation javítása (Tab, Enter, Escape, Arrow keys)
  - Screen reader támogatás (NVDA, JAWS, VoiceOver)
  - Színkontraszt javítása (WCAG AA/AAA szabvány)
  - Fokusus indikátorok javítása
  - Skip to content linkek
- **Előny**: Akadálymentes használat, szélesebb felhasználói bázis, jogi megfelelőség
- **Becsült idő**: 6-8 óra
- **Komplexitás**: Közepes
- **WCAG szabvány**: Minimum AA szint (4.5:1 kontraszt arány)
- **❌ Kizárva (jelenleg)**: Desktop app, kisebb felhasználói bázis, alapvető accessibility már megvan
- **Megjegyzés**: Alapvető accessibility funkciók (keyboard navigation, kontrasztok) megmaradnak
- **Részletek**: Lásd [EXCLUDED_FEATURES.md](EXCLUDED_FEATURES.md)

### 2. **Responsive design továbbfejlesztése** ❌ **NEM IMPLEMENTÁLJUK**
- **Mit**: 
  - Tablet és mobil nézet optimalizálás
  - Touch gesture támogatás (swipe, pinch, zoom)
  - Adaptív layout (kisebb ablakméretekhez)
  - Mobile-first design megközelítés
  - Breakpoint optimalizálás
- **Előny**: Jobb felhasználói élmény különböző eszközökön
- **Becsült idő**: 8-10 óra
- **Komplexitás**: Közepes
- **❌ Kizárva**: Desktop alkalmazás (Tauri), nem mobil/web app, jelenlegi responsive design elegendő
- **Megjegyzés**: Az alkalmazás továbbra is resizable és adaptív, de mobil/tablet optimalizálás nem szükséges
- **Részletek**: Lásd [EXCLUDED_FEATURES.md](EXCLUDED_FEATURES.md)

### 3. **Animációk és transitions bővítése** ✅ *Megvalósítva v0.4.98*
- **Mit**: 
  - Több micro-interaction animáció
  - Page transition animációk
  - Loading skeleton screens
  - Success/error animációk
  - Smooth scroll animációk
- **Előny**: Modern, professzionális megjelenés
- **Becsült idő**: 6-8 óra
- **Komplexitás**: Alacsony
- **Eredmény**: Új animációs beállítások (stílus választó, flip/parallax átmenetek, pulzáló visszajelzések), Home/Settings micro-interaction frissítések és filament könyvtár skeleton lista.

### 4. **Téma testreszabás** ✅ *Megvalósítva v0.4.98*
- **Mit**: 
  - Egyedi színpaletta létrehozása
  - Téma export/import
  - Több előre definiált téma
  - Gradient editor
  - Téma megosztás
- **Előny**: Személyre szabható megjelenés
- **Becsült idő**: 8-10 óra
- **Komplexitás**: Közepes
- **Eredmény**: Új beépített témák (Forest, Pastel, Charcoal, Midnight), aktív téma duplikálása, megosztási opció, továbbfejlesztett gradient szerkesztés és automatikus kontrasztkezelés.


## 🔐 Biztonság és adatvédelem

### 1. **Adattitkosítás**
- **Mit**: Bizalmas adatok (árajánlatok, ügyfél adatok) titkosítása
- **Előny**: Jobb adatvédelem, GDPR megfelelőség
- **Becsült idő**: 8-12 óra
- **Komplexitás**: Magas

### 2. **Jelszavas védelem**
- **Mit**: Opcionális jelszóvédelem az alkalmazáshoz
- **Előny**: Adatok védelme
- **Becsült idő**: 4-6 óra
- **Komplexitás**: Közepes

## 🌐 Integrációk

### 1. **Cloud sync (opcionális)** ❌ **NEM IMPLEMENTÁLJUK**
- **Mit**: Felhő alapú szinkronizálás (Google Drive, Dropbox, OneDrive)
- **Előny**: Több eszközön használható, automatikus backup
- **Figyelem**: Privacy policy, GDPR szabályozás
- **Becsült idő**: 12-16 óra
- **Komplexitás**: Magas
- **❌ Kizárva**: Privacy/GDPR kérdések, biztonsági kockázatok, alternatíva: manuális backup/restore
- **Megjegyzés**: Manuális backup/restore és export/import funkciók már implementálva
- **Részletek**: Lásd [EXCLUDED_FEATURES.md](EXCLUDED_FEATURES.md)

### 2. **Valuta API integráció**
- **Mit**: API végpontok a filament árak lekéréséhez, valuta árfolyamokhoz
- **Előny**: Automatikus frissítések, pontos adatok
- **Becsült idő**: 8-12 óra
- **Komplexitás**: Magas
- **API javaslatok**: 
  - ExchangeRate-API (ingyenes, 1500 req/month)
  - Fixer.io (ingyenes tier, 100 req/month)
  - CurrencyLayer (ingyenes tier, 1000 req/month)

### 3. **3D fájl előnézet**
- **Mit**: 
  - STL, OBJ fájlok betöltése és előnézete
  - 3D modell megjelenítés (Three.js vagy React Three Fiber)
  - Modell információk (méret, térfogat, felület)
  - Automatikus print time becslés modell alapján
- **Előny**: Könnyebb árajánlat készítés, pontosabb számítások
- **Becsült idő**: 12-16 óra
- **Komplexitás**: Magas

### 4. **Slicer integráció**
- **Mit**: 
  - PrusaSlicer, Cura integráció
  - Automatikus G-code generálás
  - Print time importálás
  - Filament fogyasztás importálás
- **Előny**: Automatizált munkafolyamat, pontosabb számítások
- **Becsült idő**: 16-20 óra
- **Komplexitás**: Magas

### 5. **API végpontok létrehozása**
- **Mit**: 
  - RESTful API backend létrehozása
  - API dokumentáció (OpenAPI/Swagger)
  - API autentikáció (JWT, API keys)
  - API rate limiting
- **Előny**: Integráció más alkalmazásokkal, mobil app lehetőség
- **Becsült idő**: 20-24 óra
- **Komplexitás**: Magas

## 📱 Platform specifikus fejlesztések

### 1. **macOS specifikus funkciók**
- **Mit**: 
  - Touch Bar támogatás (gyors műveletek)
  - Spotlight integráció (keresés macOS-ből)
  - Dock badge (például új árajánlatok száma)
  - Notification Center integráció
  - Shortcuts app integráció
- **Előny**: Natív macOS élmény, jobb integráció
- **Becsült idő**: 8-10 óra
- **Komplexitás**: Közepes

### 2. **Windows specifikus funkciók**
- **Mit**: 
  - Windows 11 design language (Fluent Design)
  - Taskbar progress indicator
  - Windows Notifications integráció
  - Jump Lists (gyors műveletek)
  - Windows Search integráció
- **Előny**: Natív Windows élmény, jobb integráció
- **Becsült idő**: 8-10 óra
- **Komplexitás**: Közepes

### 3. **Linux specifikus funkciók**
- **Mit**: 
  - AppIndicator támogatás (systray ikon)
  - Desktop notifications (freedesktop)
  - MIME type regisztráció (PDF, JSON)
  - Desktop entry fájlok
  - System tray integráció
- **Előny**: Natív Linux élmény, jobb integráció
- **Becsült idő**: 6-8 óra
- **Komplexitás**: Közepes
---

## 🚀 Gyors implementáció (1-2 óra)

Ha csak gyorsan szeretnél valamit hozzáadni, ajánlom ezeket:

1. **TypeScript strict mode** - 4-6 óra
2. **Accessibility javítások továbbfejlesztése** - 6-8 óra
3. **Adatbázis migráció** - 6-8 óra
4. **Adattitkosítás** - 8-12 óra
5. **Unit tesztek** - 8-12 óra

Ezek tovább javítanák a kódminőséget és biztonságot.

---

## 📝 Megjegyzések

- **Becsült idő**: Durva becslés, a tényleges idő függ a részletektől és a komplexitástól
- **Komplexitás**: 
  - **Alacsony**: Könnyen implementálható, kevés rizikó
  - **Közepes**: Tervezés szükséges, közepes rizikó
  - **Magas**: Bonyolult implementáció, nagy rizikó, tesztelés szükséges

- **Prioritás**: A prioritás a felhasználói érték és a implementációs nehézség alapján van meghatározva

---

## ❌ Kizárt funkciók

A következő funkciók **NEM** lesznek implementálva a jelenlegi verzióban:
- ❌ **Árajánlatok email küldés**
- ❌ **Dark mode automatikus váltás**
- ❌ **AI segítség**
- ❌ **Analytics (opcionális)**
- ❌ **Accessibility (a11y) javítások továbbfejlesztése** (jelenleg)
- ❌ **Responsive design továbbfejlesztése**
- ❌ **Cloud sync (opcionális)**

**Részletes indoklás**: Lásd [EXCLUDED_FEATURES.md](EXCLUDED_FEATURES.md)

---

**Utolsó frissítés**: 2025. január (v0.3.9 után)
