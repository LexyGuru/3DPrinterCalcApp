# 📊 Fejlesztési Összefoglaló - 3DPrinterCalcApp

**Dátum**: 2025. január  
**Verzió**: v1.4.33

---

## ✅ Implementált Modulok és Widgetek

### 📊 Dashboard Widgetek (13 típus)

#### Statisztikai Widgetek
1. ✅ **StatisticsWidget** - Fő statisztikai összefoglaló
2. ✅ **StatCardWidget** - Kártya widget (6 variáns):
   - `stat-card-filament` - Filament fogyasztás
   - `stat-card-revenue` - Bevétel
   - `stat-card-electricity` - Villamosenergia
   - `stat-card-cost` - Költségek
   - `stat-card-profit` - Profit
   - `stat-card-print-time` - Nyomtatási idő

#### Grafikon Widgetek
3. ✅ **TrendChartWidget** - Időbeli trend grafikon (revenue, costs, profit)
4. ✅ **PeriodComparisonWidget** - Időszak összehasonlítás (heti/havi/éves)
5. ✅ **FilamentBreakdownWidget** - Filament típusok bontása (pie chart)
6. ✅ **PrinterBreakdownWidget** - Nyomtató szerinti bontás (bar chart)
7. ✅ **PrintTimeChartWidget** - Nyomtatási idő grafikon
8. ✅ **CustomerStatsChartWidget** - Ügyfél statisztikák grafikon
9. ✅ **OfferStatusChartWidget** - Árajánlat státusz eloszlás (pie chart)

#### Egyéb Widgetek
10. ✅ **SummaryWidget** - Összefoglaló widget
11. ✅ **WidgetGroup** - Widget csoportosítás
12. ✅ **WidgetContainer** - Widget konténer (drag & drop, resize, hide)

### 🔧 Integrált Modulok

#### Adatkezelés
- ✅ **store.ts** - Tauri Store integráció (data.json)
- ✅ **backup.ts** - Backup/restore funkciók
- ✅ **tutorialDemoData.ts** - Tutorial demo adatok generálása/törlése

#### Számítások
- ✅ **offerCalc.ts** - Árajánlat költségszámítás
- ✅ **filamentCalc.ts** - Filament számítások
- ✅ **currency.ts** - Valuta konverzió

#### UI Komponensek
- ✅ **EmptyState.tsx** - Üres állapot komponens
- ✅ **Card.tsx** - Kártya komponens (hover effektekkel)
- ✅ **Skeleton.tsx** - Skeleton loading komponens
- ✅ **ProgressBar.tsx** - Progress bar komponens
- ✅ **Toast.tsx** - Toast értesítések
- ✅ **Tooltip.tsx** - Tooltip komponens
- ✅ **Breadcrumb.tsx** - Breadcrumb navigáció
- ✅ **GlobalSearch.tsx** - Globális keresés (Ctrl/Cmd+K)
- ✅ **ConfirmDialog.tsx** - Megerősítő dialógus

#### Funkcionalitás
- ✅ **undoRedo.ts** - Undo/Redo rendszer
- ✅ **useUndoRedo.ts** - Undo/Redo hook
- ✅ **useOptimisticUpdate.ts** - Optimistic UI updates
- ✅ **keyboardShortcuts.ts** - Billentyűparancsok kezelése
- ✅ **slicerImport.ts** - G-code/JSON import
- ✅ **icsExport.ts** - iCal export (naptár)

#### Témák és Stílusok
- ✅ **themes.ts** - Téma rendszer (11 téma)
- ✅ **themeContrastChecker.ts** - Kontraszt ellenőrzés (WCAG)
- ✅ **colorContrast.ts** - Színkontraszt számítások
- ✅ **styles.ts** - Stílus utility funkciók

#### Lokalizáció
- ✅ **translations.ts** - Fordítási rendszer
- ✅ **translator.ts** - Automatikus fordító
- ✅ **13 nyelvi fájl** (hu, en, de, es, it, pl, cs, sk, pt, fr, zh, uk, ru)

#### Platform Specifikus
- ✅ **platformFeatures.ts** - Platform specifikus funkciók:
  - macOS: Dock Badge, Notification Center
  - Linux: AppIndicator, Desktop Notifications
  - Windows: Notifications, Taskbar Progress (inaktív - Tauri bug)

#### Egyéb Utility
- ✅ **validation.ts** - Validációs funkciók
- ✅ **debounce.ts** - Debounce utility
- ✅ **fileLogger.ts** - Fájl logolás
- ✅ **consoleLogger.ts** - Console logolás
- ✅ **filamentLibrary.ts** - Filament könyvtár (12,000+ szín)
- ✅ **filamentColors.ts** - Filament színek kezelése
- ✅ **filamentPlaceholder.ts** - Filament placeholder képek
- ✅ **priceHistory.ts** - Ár előzmények kezelése
- ✅ **version.ts** - Verzió kezelés

---

## ✅ / ❌ Widgetek Állapota (eredetileg hiányzóként tervezve)

A következő widget típusok korábban csak a `types/widgets.ts`-ben voltak definiálva, de időközben **implementálva lettek** és be vannak kötve a `Dashboard.tsx`-be is. Az alábbi leírások már a **kész állapotot** dokumentálják.

### 1. ✅ **financial-trends** - Pénzügyi trendek widget

**Leírás**: Részletes pénzügyi trendek grafikon widget, amely több pénzügyi metrikát mutat egyszerre.

**Funkciók**:
- Bevétel, költség, profit trendek egy grafikonon
- Időszak választó (heti/havi/éves)
- Kattintható adatpontok (részletes nézet)
- Export lehetőség (PNG, SVG, PDF)
- Tooltip-ek részletes információkkal

**Szükséges adatok**:
```typescript
interface FinancialTrendsData {
  period: "week" | "month" | "year";
  data: Array<{
    date: string;
    revenue: number;
    costs: number;
    profit: number;
    margin: number; // profit margin %
  }>;
}
```

**Megvalósítás / Fájlok**:
- `frontend/src/components/widgets/FinancialTrendsWidget.tsx` - **Létezik**
- `frontend/src/components/widgets/Dashboard.tsx` - `financial-trends` case **bekötve**
- `frontend/src/utils/languages/*.ts` - `widget.title.financialTrends` fordítási kulcsok **hozzáadva**

**Komplexitás**: ⭐⭐⭐ Magas  
**Becsült idő**: 6-8 óra

---

### 2. ✅ **quick-actions** - Gyors műveletek panel

**Leírás**: Gyors hozzáférés a leggyakrabban használt műveletekhez.

**Funkciók**:
- Új árajánlat létrehozása
- Új filament hozzáadása
- Új nyomtató hozzáadása
- Új ügyfél hozzáadása
- Gyors kalkuláció megnyitása
- Testreszabható műveletek sorrendje
- Gyorsbillentyű támogatás minden művelethez

**Szükséges adatok**:
```typescript
interface QuickActionsData {
  actions: Array<{
    id: string;
    label: string;
    icon: string;
    action: () => void;
    shortcut?: string;
  }>;
}
```

**Megvalósítás / Fájlok**:
- `frontend/src/components/widgets/QuickActionsWidget.tsx` - **Létezik**
- `frontend/src/components/widgets/Dashboard.tsx` - `quick-actions` case **bekötve**
- `frontend/src/utils/languages/*.ts` - `widget.title.quickActions` fordítási kulcsok **hozzáadva**

**Komplexitás**: ⭐⭐ Közepes  
**Becsült idő**: 4-6 óra

---

### 3. ✅ **recent-offers** - Legutóbbi árajánlatok lista

**Leírás**: Az utolsó 5-10 árajánlat listája gyors hozzáféréssel.

**Funkciók**:
- Legutóbbi árajánlatok listázása (5-10 db)
- Kattintás → árajánlat részletes nézet
- Státusz megjelenítés (színkódolt)
- Gyors műveletek (szerkesztés, PDF export, törlés)
- Scrollozható lista
- Üres állapot kezelés

**Szükséges adatok**:
```typescript
interface RecentOffersData {
  offers: Array<{
    id: number;
    customerName: string;
    date: string;
    status: string;
    totalCost: number;
    currency: string;
    description?: string;
  }>;
  maxItems?: number; // Default: 5
}
```

**Megvalósítás / Fájlok**:
- `frontend/src/components/widgets/RecentOffersWidget.tsx` - **Létezik**
- `frontend/src/components/widgets/Dashboard.tsx` - `recent-offers` case **bekötve**
- `frontend/src/utils/languages/*.ts` - `widget.title.recentOffers` fordítási kulcsok **hozzáadva**

**Komplexitás**: ⭐⭐ Közepes  
**Becsült idő**: 4-6 óra

---

### 4. ✅ **active-projects** - Aktív projektek widget

**Leírás**: Aktív projektek követése és kezelése.

**Funkciók**:
- Aktív projektek listázása
- Projekt státusz követés
- Projekt haladás megjelenítés (progress bar)
- Határidők megjelenítése
- Projekt részletek megnyitása
- Projekt státusz változtatás

**Megjegyzés**: A widget **UI szinten implementálva van** (`ActiveProjectsWidget.tsx`, `Dashboard.tsx`), de a teljes értelmű használathoz továbbra is szükség lesz egy külön projektkezelő modulra. Jelenleg mock / egyszerűsített adatokkal használható.

**Szükséges adatok**:
```typescript
interface ActiveProjectsData {
  projects: Array<{
    id: number;
    name: string;
    status: "active" | "on-hold" | "completed";
    progress: number; // 0-100
    deadline?: string;
    offerCount: number;
    totalRevenue: number;
  }>;
}
```

**Megvalósítás / Fájlok**:
- `frontend/src/components/widgets/ActiveProjectsWidget.tsx` - **Létezik**
- `frontend/src/components/widgets/Dashboard.tsx` - `active-projects` case **bekötve**
- `frontend/src/utils/languages/*.ts` - `widget.title.activeProjects` fordítási kulcsok **hozzáadva**

**Komplexitás**: ⭐⭐⭐ Magas (projekt kezelés függőség)  
**Becsült idő**: 6-8 óra (projekt kezelés nélkül: 2-3 óra placeholder)

**Prioritás**: 🟢 Alacsony (projekt kezelés implementálása után)

---

### 5. ✅ **filament-stock-alert** - Filament készlet figyelmeztetés

**Leírás**: Alacsony filament készlet figyelmeztetések megjelenítése.

**Funkciók**:
- Alacsony készletű filamentek listázása
- Készlet szint megjelenítés (színkódolt: kritikus/alacsony/normál)
- Gyors hozzáadás gomb (új filament vásárlás)
- Figyelmeztető színek (piros/sárga/zöld)
- Kattintás → filament részletes nézet
- Készlet küszöbértékek beállítása

**Szükséges adatok**:
```typescript
interface FilamentStockAlertData {
  alerts: Array<{
    filamentId: string;
    brand: string;
    type: string;
    color: string;
    currentStock: number; // gramm vagy kg
    minStock: number;
    alertLevel: "critical" | "low" | "normal";
  }>;
  settings: {
    criticalThreshold: number; // gramm vagy kg
    lowThreshold: number;
  };
}
```

**Megvalósítás / Fájlok**:
- `frontend/src/components/widgets/FilamentStockAlertWidget.tsx` - **Létezik**
- `frontend/src/components/widgets/Dashboard.tsx` - `filament-stock-alert` case **bekötve**
- `frontend/src/utils/languages/*.ts` - `widget.title.filamentStockAlert` fordítási kulcsok **hozzáadva**
- `frontend/src/types.ts` - Filament típus `weight`/stock mezővel **kibővítve**

**Komplexitás**: ⭐⭐ Közepes  
**Becsült idő**: 4-6 óra

---

### 6. ✅ **scheduled-tasks** - Ütemezett feladatok widget

**Leírás**: Ütemezett feladatok és emlékeztetők megjelenítése.

**Funkciók**:
- Közelgő feladatok listázása
- Határidők megjelenítése
- Feladat státusz követés
- Emlékeztetők megjelenítése
- Feladat részletek megnyitása
- Feladat státusz változtatás

**Megjegyzés**: A widget **UI szinten implementálva van** (`ScheduledTasksWidget.tsx`, `Dashboard.tsx`), de a teljes értelmű használathoz továbbra is szükség lesz egy dedikált feladatkezelő modulra. Jelenleg mock / egyszerűsített adatokkal használható.

**Szükséges adatok**:
```typescript
interface ScheduledTasksData {
  tasks: Array<{
    id: number;
    title: string;
    description?: string;
    dueDate: string;
    priority: "high" | "medium" | "low";
    status: "pending" | "in-progress" | "completed";
    relatedOfferId?: number;
  }>;
}
```

**Megvalósítás / Fájlok**:
- `frontend/src/components/widgets/ScheduledTasksWidget.tsx` - **Létezik**
- `frontend/src/components/widgets/Dashboard.tsx` - `scheduled-tasks` case **bekötve**
- `frontend/src/utils/languages/*.ts` - `widget.title.scheduledTasks` fordítási kulcsok **hozzáadva**

**Komplexitás**: ⭐⭐⭐ Magas (feladatkezelés függőség)  
**Becsült idő**: 6-8 óra (feladatkezelés nélkül: 2-3 óra placeholder)

**Prioritás**: 🟢 Alacsony (feladatkezelés implementálása után)

---

## 📋 Implementációs Útmutató

### Általános Lépések Minden Widgethez

1. **Widget komponens létrehozása**
   - Fájl: `frontend/src/components/widgets/[WidgetName]Widget.tsx`
   - Alap struktúra másolása egy meglévő widgetből (pl. `SummaryWidget.tsx`)
   - Props interface definiálása
   - Téma integráció
   - Responsive design (small/medium/large méretek)

2. **Dashboard integráció**
   - `frontend/src/components/widgets/Dashboard.tsx` fájlban:
     - Case hozzáadása a `renderWidget` függvényben
     - Widget title fordítása a `getWidgetTitle` függvényben
     - Szükséges adatok átadása a `Home.tsx`-ből

3. **Fordítási kulcsok hozzáadása**
   - Minden nyelvi fájlban (`frontend/src/utils/languages/language_*.ts`):
     - `widget.title.[widgetType]` kulcs hozzáadása
     - Opcionális: widget-specifikus fordítások

4. **Adat előkészítés**
   - `frontend/src/components/Home.tsx` fájlban:
     - Adatok számítása/preparálása a widget számára
     - Props átadása a Dashboard komponensnek

5. **Tesztelés**
   - Widget megjelenítés ellenőrzése
   - Téma váltás tesztelése
   - Méret változtatás tesztelése
   - Adatok helyességének ellenőrzése

---

## 🎯 Javasolt Fejlesztések

### 🔴 Magas Prioritás

#### 1. Hiányzó Widgetek Implementálása
**Prioritás**: 🔴 Magas  
**Becsült idő**: 20-30 óra  
**Komplexitás**: Közepes-Magas

**Widgetek**:
- `financial-trends` - Pénzügyi trendek részletes grafikon
- `quick-actions` - Gyors műveletek panel (új árajánlat, filament, nyomtató)
- `recent-offers` - Legutóbbi árajánlatok lista (utolsó 5-10)
- `filament-stock-alert` - Alacsony készlet figyelmeztetés

**Előnyök**:
- Teljes dashboard funkcionalitás
- Jobb UX - gyors hozzáférés gyakori műveletekhez
- Proaktív figyelmeztetések

---

#### 2. Widget Interaktivitás Fejlesztése
**Prioritás**: 🔴 Magas  
**Becsült idő**: 12-16 óra  
**Komplexitás**: Közepes

**Funkciók**:
- Grafikonok kattinthatóvá tétele (részletes nézet)
- Tooltip-ek részletes információkkal
- Időszak szűrés közvetlenül a grafikonon
- Export gomb minden grafikonon (PNG, SVG, PDF)
- Zoom funkció grafikonokhoz

**Előnyök**:
- Interaktívabb dashboard
- Könnyebb adatelemzés
- Jobb export lehetőségek

---

#### 3. Táblázatok Fejlesztése
**Prioritás**: 🔴 Magas  
**Becsült idő**: 18-22 óra  
**Komplexitás**: Magas

**Funkciók**:
- Virtuális scroll (nagy adathalmazokhoz)
- Oszlop szűrés (szöveges, szám, dátum)
- Többszörös rendezés
- Oszlop csoportosítás
- Inline szerkesztés
- Többszörös kijelölés (checkbox soroknál)
- Tömeges műveletek (törlés, export)

**Előnyök**:
- Jobb teljesítmény nagy adathalmazoknál
- Hatékonyabb adatkezelés
- Könnyebb tömeges műveletek

---

### 🟡 Közepes Prioritás

#### 4. Kártya Nézet Alternatíva
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 14-18 óra  
**Komplexitás**: Közepes-Magas

**Funkciók**:
- Kártya nézet minden listázó oldalon
- Kártya méret testreszabása (kicsi, közepes, nagy)
- Kártyák grid elrendezése
- Kártya szűrés és rendezés
- Kártya drag & drop (sorrend változtatás)

**Előnyök**:
- Alternatív nézet táblázatokhoz
- Jobb vizuális megjelenés
- Testreszabható elrendezés

---

#### 5. Fejlett Keresés
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 16-20 óra  
**Komplexitás**: Magas

**Funkciók**:
- Fuzzy search (közelítő találatok)
- Keresés mentése (gyors keresések)
- Keresés előzmények
- Keresés szűrők (típus, dátum, stb.)
- Keresés operátorok (AND, OR, NOT)
- Regex keresés (opcionális)
- Keresés javaslatok (autocomplete)
- Keresés kiemelés (highlight találatok)

**Előnyök**:
- Hatékonyabb keresés
- Könnyebb adatkeresés
- Jobb felhasználói élmény

---

#### 6. Szűrő Rendszer Fejlesztése
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 14-18 óra  
**Komplexitás**: Közepes-Magas

**Funkciók**:
- Szűrő panel (collapsible)
- Többszörös szűrők kombinálása
- Szűrő mentése (preset-ek) - ✅ Már van alapvető támogatás
- Szűrő megosztása (export/import)
- Szűrő automatikus alkalmazása (mentett szűrők)
- Szűrő számláló (hány elem található)

**Előnyök**:
- Hatékonyabb szűrés
- Könnyebb szűrő kezelés
- Mentett szűrők újrafelhasználása

---

#### 7. Grafikon Típusok Bővítése
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 20-24 óra  
**Komplexitás**: Magas

**Új Grafikon Típusok**:
- Area chart (időbeli változások)
- Scatter plot (korrelációk)
- Heatmap (naptár nézet)
- Gantt chart (projektek ütemezése)

**Előnyök**:
- Többfajta adatvizualizáció
- Jobb adatelemzés
- Részletesebb statisztikák

---

#### 8. Riasztások és Emlékeztetők
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 14-18 óra  
**Komplexitás**: Közepes-Magas

**Funkciók**:
- Árajánlat határidő emlékeztetők
- Filament készlet alacsony figyelmeztetés
- Automatikus backup emlékeztető
- Ügyfél követés emlékeztetők
- Ár változás értesítések
- Testreszabható emlékeztetők

**Előnyök**:
- Proaktív értesítések
- Jobb határidő kezelés
- Automatikus figyelmeztetések

---

#### 9. Export/Import Fejlesztése
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 16-20 óra  
**Komplexitás**: Közepes-Magas

**Új Formátumok**:
- Excel export (XLSX)
- XML export
- Batch import
- Import előnézet
- Import validáció fejlesztése

**Előnyök**:
- Több formátum támogatás
- Könnyebb adatcsere
- Jobb import validáció

---

### 🟢 Alacsony Prioritás

#### 10. Tab Navigáció
**Prioritás**: 🟢 Alacsony  
**Becsült idő**: 20-24 óra  
**Komplexitás**: Magas

**Funkciók**:
- Tab rendszer a fő tartalom területen
- Új tab nyitása (Ctrl+T vagy jobb klikk)
- Tab bezárása, újra megnyitása
- Tab váltás (Ctrl+Tab)
- Tab drag & drop (sorrend változtatás)
- Tab mentés (session restore)

**Előnyök**:
- Több oldal egyidejű megnyitása
- Jobb navigáció
- Könnyebb munkafolyamat

---

#### 11. Context Menu Fejlesztése
**Prioritás**: 🟢 Alacsony  
**Becsült idő**: 10-12 óra  
**Komplexitás**: Közepes

**Funkciók**:
- Kontextuális menük minden elemnél
- Menü animációk
- Menü gyorsbillentyűk
- Menü ikonok
- Menü csoportosítás
- Menü testreszabás (felhasználó által)

**Előnyök**:
- Jobb jobb klikk menük
- Gyorsabb műveletek
- Intuitívabb felület

---

#### 12. Projekt Kezelés
**Prioritás**: 🟢 Alacsony  
**Becsült idő**: 24-30 óra  
**Komplexitás**: Magas

**Funkciók**:
- Projekt létrehozása
- Projekthez árajánlatok csatolása
- Projekt státusz követése
- Projekt ütemezés (Gantt chart)
- Projekt költségvetés
- Projekt riportok
- Projekt megosztás

**Előnyök**:
- Jobb projekt kezelés
- Részletesebb projekt követés
- Könnyebb projekt elemzés

---

#### 13. Feladatkezelés (Task Management)
**Prioritás**: 🟢 Alacsony  
**Becsült idő**: 20-26 óra  
**Komplexitás**: Magas

**Funkciók**:
- Feladat létrehozása
- Feladat prioritás
- Feladat határidő
- Feladat státusz
- Feladat hozzárendelés
- Feladat emlékeztetők
- Feladat naptár nézet

**Előnyök**:
- Jobb feladat kezelés
- Határidő követés
- Emlékeztetők

---

## 📋 Technikai Fejlesztések

### 1. TypeScript Strict Mode
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 4-6 óra  
**Komplexitás**: Közepes

**Funkciók**:
- Strict mode bekapcsolása
- Típusok ellenőrzése
- Null/undefined kezelés javítása

**Előnyök**:
- Kevesebb runtime hiba
- Jobb kódminőség
- Jobb IDE támogatás

---

### 2. Unit Tesztek
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 8-12 óra  
**Komplexitás**: Magas

**Funkciók**:
- Tesztek kritikus számításokhoz
- Utility funkciók tesztei
- Komponens tesztek

**Tesztelési framework**: Vitest vagy Jest  
**Coverage cél**: Minimum 70% code coverage

**Előnyök**:
- Biztonságos refactoring
- Kevesebb bug
- Jobb kódminőség

---

### 3. Performance Optimalizálás
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 8-10 óra  
**Komplexitás**: Közepes

**Funkciók**:
- Bundle size optimalizálás
- Lazy loading komponenseknél
- Memoization javítása (useMemo, useCallback)
- Virtual scrolling nagy listáknál
- Image lazy loading

**Előnyök**:
- Gyorsabb alkalmazás
- Kevesebb memória használat
- Jobb felhasználói élmény

---

## 🚀 Ajánlott Implementációs Sorrend

### Fázis 1: Hiányzó Widgetek (4-6 hét)
1. `financial-trends` widget implementálása
2. `quick-actions` widget implementálása
3. `recent-offers` widget implementálása
4. `filament-stock-alert` widget implementálása

### Fázis 2: Widget Interaktivitás (2-3 hét)
1. Grafikonok kattinthatóvá tétele
2. Tooltip-ek részletes információkkal
3. Időszak szűrés grafikonokon
4. Export gombok grafikonokhoz

### Fázis 3: Táblázatok Fejlesztése (3-4 hét)
1. Virtuális scroll implementálása
2. Oszlop szűrés és rendezés
3. Inline szerkesztés
4. Tömeges műveletek

### Fázis 4: Keresés és Szűrés (2-3 hét)
1. Fejlett keresés implementálása
2. Szűrő rendszer fejlesztése
3. Keresés mentése és előzmények

### Fázis 5: Finomhangolás (2-3 hét)
1. TypeScript strict mode
2. Performance optimalizálás
3. Unit tesztek

---

## 📊 Összefoglaló Statisztikák

### Implementált
- **Widgetek**: 19/19 (100%)
- **Modulok**: 30+ (teljes funkcionalitás)
- **Komponensek**: 30+ (teljes UI)

### Hiányzó Widgetek
- **Definiált, de nincs implementáció**: 0 widget (minden jelenleg definiált widget implementálva)
- **Javasolt új widgetek**: 0

### Fejlesztési Prioritások
- **🔴 Magas prioritás**: 3 fő fejlesztés
- **🟡 Közepes prioritás**: 6 fejlesztés
- **🟢 Alacsony prioritás**: 4 fejlesztés

---

## 📝 Megjegyzések

- **Becsült idő**: Durva becslés, a tényleges idő függ a részletektől és a komplexitástól
- **Komplexitás**: 
  - **Alacsony**: Könnyen implementálható, kevés rizikó
  - **Közepes**: Tervezés szükséges, közepes rizikó
  - **Magas**: Bonyolult implementáció, nagy rizikó, tesztelés szükséges

- **Prioritás**: A prioritás a felhasználói érték és a implementációs nehézség alapján van meghatározva

---

**Utolsó frissítés**: 2025. január (v1.4.33)

