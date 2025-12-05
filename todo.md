# TODO - v3.0.0 Fejlesztések

> **Megjegyzés**: A kész funkciók a `COMPLETED.md` fájlban találhatók.

---

## 🚀 v3.0.0 Tervezett Nagyverzió - Performance Optimalizálás és Biztonság

### 📋 Áttekintés
A v3.0.0 egy major verzió, amely jelentős performance optimalizálásokat, code splitting fejlesztéseket és biztonsági funkciókat tartalmaz. Ez a verzió infrastrukturális változtatásokat és esetleges breaking change-eket is jelenthet.

### ✅ Kivitelezhetőség Elemzése

**Jelenlegi helyzet:**
- ✅ React.lazy() már implementálva van a nagyobb komponensekhez (App.tsx)
- ✅ Lazy loading működik a loading fázis után
- ✅ Backend infrastruktúra készen áll (Tauri commands, Store plugin)
- ✅ Logolási rendszer és diagnosztika már implementálva
- ✅ Fordítási rendszer minden nyelvre kiterjedve

**Hiányzó részek:**
- ✅ Route-based code splitting implementálása (React Router integráció) - **KÉSZ!**
- ❌ Titkosítási infrastruktúra (Rust crypto crates)
- ❌ Jelszavas védelem rendszer
- ✅ React.lazy() dokumentálása és optimalizálása - **KÉSZ!** (PERFORMANCE.md)

---

### ⚡ 1. Performance Optimalizálás és Code Splitting

#### 1.1. React.lazy() Dokumentálása és Optimalizálása
- [x] **React.lazy() implementáció ellenőrzése és dokumentálása** - **KÉSZ!**
  - ✅ Jelenlegi lazy loading komponensek áttekintése (már implementálva)
  - ✅ Loading fázisban csak adatok töltődnek be, komponensek nem (már működik)
  - ✅ Suspense fallback optimalizálása (AppRouter.tsx-ben)
  - ✅ Error boundary hozzáadása lazy komponensekhez (LazyErrorBoundary.tsx)
  - ✅ **Tárhely**: `frontend/src/App.tsx` (módosítás)
  - ✅ **Tárhely**: Dokumentáció (`docs/PERFORMANCE.md` - létrehozva)

#### 1.2. Route-based Code Splitting
- [x] **React Router integráció implementálása** - **KÉSZ!**
  - ✅ React Router telepítése és konfigurálása (`react-router-dom` v7.10.0)
  - ✅ Route struktúra tervezése és implementálása (URL alapú: `/settings`, `/offers`, stb.)
  - ✅ Lazy loading route-okhoz (minden route külön fájlba kerül)
  - ✅ State-based navigáció átalakítása routing-ra (`activePage` → URL)
  - ✅ URL alapú navigáció, bookmark-olható oldalak, vissza gomb működik, jobb code splitting
  - ✅ **Tárhely**: `frontend/src/router/` (AppContext.tsx, AppRouter.tsx, routes.tsx, routeWrappers.tsx)
  - ✅ **Tárhely**: `frontend/src/App.tsx` (átalakítva routing-ra)
  - ✅ **Tárhely**: `frontend/src/main.tsx` (BrowserRouter wrapper)
  - ✅ **Tárhely**: `frontend/src/components/Header.tsx` (useLocation, useNavigate hook-ok)
  - ✅ **Tárhely**: `frontend/src/components/Sidebar.tsx` (routing integráció)

#### 1.3. Code Splitting Finomhangolás
- [x] **Vite build konfiguráció optimalizálása** - **KÉSZ!**
  - ✅ `rollupOptions.output.manualChunks` beállítása
  - ✅ Vendor chunk optimalizálás (node_modules külön chunk-okba)
    - ✅ React/React-DOM/React-Router külön chunk (`vendor-react`)
    - ✅ Tauri API-k külön chunk (`vendor-tauri`)
    - ✅ UI library-k külön chunk-ok (`vendor-ui-framer`, `vendor-ui-charts`)
    - ✅ Egyéb node_modules (`vendor`)
  - ✅ Route-based chunking (automatikus lazy loading miatt)
  - ✅ Router fájlok csoportosítása (`router`, `routes`)
  - ✅ Közös komponensek csoportosítása (`components-shared`)
  - ✅ Chunk size warning limit beállítása (1000 KB)
  - ✅ **Tárhely**: `frontend/vite.config.ts` (módosítva)

#### 1.4. Moduláris Architektúra Terv
- [x] **Moduláris architektúra dokumentáció** - **KÉSZ!**
  - ✅ Dokumentáció létrehozva (`docs/MODULAR_ARCHITECTURE.md`)
  - ✅ Path alias-ok beállítva (`@features`, `@shared`, `@core`)
  - ✅ Vite és TypeScript konfiguráció frissítve
  - ✅ Refaktorálási terv kész (7 fázis)
- [x] **Shared modulok implementálása** - **KÉSZ!**
  - [x] Mappastruktúra létrehozva (`shared/components/`, `shared/hooks/`, `shared/utils/`)
  - [x] Shared komponensek létrehozása
    - [x] `ConfirmDialog` - Dialog komponens (átmozgatva)
    - [x] `FormField` - Form mező wrapper
    - [x] `InputField` - Text input mező
    - [x] `SelectField` - Select dropdown mező
    - [x] `NumberField` - Number input mező
  - [x] Shared hook-ok létrehozása
    - [x] `useModal` - Modal kezelés hook
    - [x] `useForm` - Form kezelés hook (state, validáció, submit)
  - [x] Shared utility-k létrehozása (`shared/utils/`)
    - [x] `debounce` - Debounce utility függvény
    - [x] `format` - Formázási utility-k (dátum, szám, pénznem, fájlméret, stb.)
    - [x] `validation` - Validációs utility-k (pozitív szám, email, kötelező mező, stb.)
  - [x] Import-ok frissítése (ConfirmDialog shared verzióra) - **KÉSZ!** (8 fájl frissítve)
  - [x] Export struktúra befejezve (16 fájl, minden komponens/hook/utility exportálva)
- [x] **Feature modulok refaktorálása** - **BEFEJEZVE! (6/6 modul alap refaktorálása kész)**
  - [x] Calculator feature modul (`features/calculator/`) - **KOMPONENSEK ÉS INTEGRÁCIÓ KÉSZ!**
    - [x] Mappastruktúra létrehozva
    - [x] Típusok létrehozva (`types.ts`)
    - [x] Számítási utility-k (`utils/calculations.ts`)
    - [x] Validációs utility-k (`utils/validation.ts`)
    - [x] Hook-ok létrehozva:
      - [x] `useCalculator` - Fő számítás logika
      - [x] `useFilamentSelection` - Filament kiválasztás
      - [x] `useCalculationTemplates` - Template kezelés
    - [x] Komponensek bontása - **KÉSZ!**
      - [x] `PrinterSelector.tsx` - Nyomtató választó (létrehozva és integrálva)
      - [x] `PrintTimeInput.tsx` - Nyomtatási idő input (létrehozva és integrálva)
      - [x] `FilamentSelector.tsx` - Filament választó (létrehozva és integrálva)
      - [x] `CalculatorForm.tsx` - Fő form komponens (létrehozva és integrálva - 443 sor)
      - [x] `CalculationResults.tsx` - Eredmények megjelenítése (létrehozva és integrálva)
      - [x] `OfferDialog.tsx` - Árajánlat mentés dialog (létrehozva és integrálva)
    - [x] CalculatorForm integrálása Calculator.tsx-be
    - [x] Calculator.tsx: 582 sor → 309 sor (-273 sor, -46.9%!)
  - [x] Filaments feature modul (`features/filaments/`) - **ALAPOK KÉSZ, KOMPONENSEK INTEGRÁLVA**
    - [x] Mappastruktúra létrehozva
    - [x] Típusok létrehozva (`types.ts`)
    - [x] Szűrési utility-k (`utils/filtering.ts`)
    - [x] Rendezési utility-k (`utils/sorting.ts`)
    - [x] Hook-ok létrehozva:
      - [x] `useFilamentFilter` - Szűrés kezelés
      - [x] `useFilamentSort` - Rendezés kezelés
      - [x] `useFilamentForm` - Form kezelés
    - [x] Komponensek létrehozva:
      - [x] `FilamentSearchBar` - Kereső mező, undo/redo, kedvencek
      - [x] `FilamentFilters` - Brand, type, color szűrők
      - [x] `AddFilamentButton` - Új filament hozzáadása gomb
      - [x] `ColumnVisibilityManager` - Oszlop láthatóság kezelő
    - [x] Komponensek integrálva Filaments.tsx-be (~324 sor megtakarítás, 8.9%)
    - [x] Hook-ok utility függvényei integrálva (filterFilaments, sortFilaments, getUniqueBrands, getUniqueTypes)
  - [x] Printers feature modul (`features/printers/`) - **ALAPOK KÉSZ**
    - [x] Mappastruktúra létrehozva
    - [x] Típusok létrehozva (`types.ts`)
    - [x] Szűrési utility-k (`utils/filtering.ts`)
    - [x] Rendezési utility-k (`utils/sorting.ts`)
    - [x] Komponensek elkezdve:
      - [x] `PrinterSearchBar` - Kereső mező, undo/redo
    - [x] Komponensek integrálása Printers.tsx-be - **RÉSZBEN KÉSZ** (PrinterSearchBar + utility függvények)
    - [x] Hook-ok létrehozva:
      - [x] `usePrinterFilter` - Szűrés kezelés hook
      - [x] `usePrinterSort` - Rendezés kezelés hook
    - [x] Hook-ok integrálva Printers.tsx-be
    - [x] Printers.tsx: 1810 sor → 1803 sor (-7 sor, -0.4%)
  - [x] Offers feature modul (`features/offers/`) - **HOOK-OK ÉS KOMPONENSEK INTEGRÁLVA**
    - [x] Mappastruktúra létrehozva
    - [x] Típusok létrehozva (`types.ts`)
    - [x] Szűrési utility-k (`utils/filtering.ts`)
    - [x] Rendezési utility-k (`utils/sorting.ts`)
    - [x] Utility függvények integrálva Offers.tsx-be
    - [x] Hook-ok létrehozva:
      - [x] `useOfferFilter` - Szűrés kezelés hook
    - [x] Hook-ok integrálva Offers.tsx-be
    - [x] Komponensek létrehozva:
      - [x] `OfferSearchBar` - Kereső mező, undo/redo, rendezés
      - [x] `OfferFilters` - Összeg és dátum szűrők
      - [x] `OfferStatusFilters` - Státusz szűrő gombok
      - [x] `OfferSortControls` - Rendezés chip-ek
    - [x] Komponensek integrálva Offers.tsx-be
    - [x] Offers.tsx: 3985 sor → 3729 sor (-256 sor, -6.4%)
  - [x] Settings feature modul (`features/settings/`) - **TELJESEN BEFEJEZVE!** ✅
    - [x] Mappastruktúra létrehozva
    - [x] Típusok létrehozva (`types.ts`)
    - [x] Validation utility (`utils/validation.ts`) - clampNumber, normalizeColorInput, sanitizeHexInput, normalizeForCompare
    - [x] Theme utility (`utils/theme.ts`) - sanitizeCustomThemeDefinition
    - [x] Library utility (`utils/library.ts`) - sortLibraryEntries
    - [x] Helpers utility (`utils/helpers.ts`) - resolveBaseLanguage
    - [x] Hook-ok létrehozva:
      - [x] `useSettingsAnimation` - Animációs beállítások hook
      - [x] `useSettingsTheme` - Téma kezelés hook (625 sor, teljes funkcionalitás)
      - [x] `useSettingsLibrary` - Library kezelés hook (~700 sor)
    - [x] Komponensek létrehozva:
      - [x] `SettingsTabs` - Tab navigáció komponens
      - [x] `GeneralTab` - Általános beállítások tab
      - [x] `DisplayTab` - Megjelenítési beállítások tab
      - [x] `AdvancedTab` - Speciális beállítások tab (autosave, backup, notifications, shortcuts)
      - [x] `DataTab` - Adatkezelés tab (backup/restore, factory reset, log management, export/import)
      - [x] `LibraryTab` - Filament library kezelés tab
    - [x] Hook-ok integrálva Settings.tsx-be
    - [x] Komponensek integrálva Settings.tsx-be
    - [x] Régi logika eltávolítva (theme, library, export/import, modals)
    - [x] Nem használt importok törölve
    - [x] **Settings.tsx: 5947 sor → 897 sor (-5050 sor, -85%!)** ✅
    - [x] **TELJES REFAKTORÁLÁS BEFEJEZVE!** ✅
  - [x] Home feature modul (`features/home/`) - **REFAKTORÁLÁS BEFEJEZVE!**
    - [x] Mappastruktúra létrehozva (9 fájl)
    - [x] Típusok létrehozva (`types.ts`)
    - [x] Tasks utility (`utils/tasks.ts`)
    - [x] Filtering utility (`utils/filtering.ts`) - Időszak szűrés
    - [x] Financials utility (`utils/financials.ts`) - Pénzügyi számítások
    - [x] Statistics utility (`utils/statistics.ts`) - Statisztikák számítása
    - [x] useHomeStatistics hook (`hooks/useHomeStatistics.ts`) - Statisztikák hook
    - [x] Types, constants és utility függvények integrálva Home.tsx-be
    - [x] Import-ok frissítve (utility-k és hook-ok)
    - [x] Inline függvények eltávolítva, hook-ok integrálva
    - [x] Home.tsx: 3454 sor → 3308 sor (-146 sor, -4.2%!)

---

### 🔒 2. Biztonság és Adatvédelem

#### 2.1. Ügyféladat Titkosítás
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

#### 2.2. App Jelszavas Védelem
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

### 📊 3. Becsült Erőforrásigény és Időtartam

**Összesített becslés:**
- ⚡ **Performance optimalizálás**: ~1.5-2 hét
  - React.lazy() dokumentálás: 1-2 nap
  - Route-based splitting (React Router implementálás): 3-5 nap
  - Vite build optimalizálás: 1-2 nap
- 🔒 **Biztonság és titkosítás**: ~2-3 hét
  - Backend titkosítás: 1 hét
  - Frontend integráció: 1 hét
  - Jelszavas védelem: 3-5 nap
- 📚 **Dokumentáció és fordítások**: ~1 hét
  - Performance dokumentáció: 2-3 nap
  - Biztonsági funkciók fordítások: 2-3 nap
  - Migration guide (ha breaking changes): 1-2 nap

**Összesen: ~4-5 hét (1-1.5 hónap)** koncentrált fejlesztési munkával

---

### ✅ Következő Lépések v3.0.0-hoz

1. **Előzetes tervezés és validálás**
   - React Router integráció tervezése (route struktúra, URL mapping)
   - Titkosítási algoritmusok és kulcskezelés tervezése
   - Jelszavas védelem flow tervezése

2. **Prioritás meghatározása**
   - Mely funkciók kritikusak a v3.0.0-hoz?
   - Route-based splitting bekerül a v3.0.0-ba (React Router implementálás)
   - Jelenlegi lazy loading működik, de routing-ra kell átállni

3. **Prototípusok készítése**
   - Titkosítási flow tesztelése
   - Jelszavas védelem UI prototípus
   - Performance mérések és optimalizálás

4. **Fázisos implementáció**
   - Fase 1: Performance optimalizálás és dokumentálás
   - Fase 2: Biztonsági fejlesztések (titkosítás)
   - Fase 3: Jelszavas védelem
   - Fase 4: Dokumentáció és fordítások

---

**Megjegyzés**: A v3.0.0 egy biztonsági és performance fókuszú verzió. A biztonsági funkciók (titkosítás, jelszavas védelem) breaking change-eket is jelenthetnek, ezért fontos a migration guide készítése és a felhasználók tájékoztatása.
