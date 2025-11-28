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
[ ] Automatikus backup/emlékeztető keret – **TERVEZETT v1.7.0 (időzített mentések + „régen mentettél” emlékeztetők, backup modulra építve)**
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
[ ] Tutorial lépések frissítése az 1.6.0 újdonságokkal (widget interaktivitás, táblázat szűrés/rendezés, virtual scroll) – **TERVEZETT v1.7.0**
[ ] Tutorial demo adatok bővítése (nagyobb Offers/Filaments lista, több minta projekt/ügyfél az új funkciók bemutatásához) – **TERVEZETT v1.7.0**

Megjegyzés: a részletesebb motivációk, becsült idők, prioritások a `FEJLESZTESI_OSSZEFOGLALO.md` backlog részében vannak dokumentálva.

