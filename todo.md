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
- [x] **Backend titkosítás modul** - **KÉSZ!**
  - ✅ AES-256-GCM titkosítás implementálva Rust-ban (`src-tauri/src/encryption.rs`)
  - ✅ Kulcs generálás és kezelés (PBKDF2) implementálva
  - ✅ Titkosított adatok tárolása külön fájlban (`customers.json`) - **KÉSZ!**
  - ✅ **Függőségek**: `aes-gcm`, `pbkdf2`, `rand` crates hozzáadva `Cargo.toml`-hez
  - ✅ **Tárhely**: `src-tauri/src/encryption.rs` (létrehozva)
  - ✅ **Tárhely**: `src-tauri/src/commands.rs` (titkosítás/visszafejtés commands)

- [x] **Frontend titkosítás kezelés** - **KÉSZ!**
  - ✅ Jelszó dialógus komponens (`EncryptionPasswordPrompt.tsx`) - **KÉSZ!**
  - ✅ Jelszó beállítás/módosítás UI (SecurityTab.tsx-ben) - **KÉSZ!**
  - ✅ Automatikus titkosítás/visszafejtés ügyfél adatoknál - **KÉSZ!**
  - ✅ In-memory jelszó kezelés (`encryptionPasswordManager.ts`) - **KÉSZ!**
  - ✅ Customer data encryption utilities (`customerEncryption.ts`) - **KÉSZ!**
  - ✅ App password integráció (használható titkosításhoz is) - **KÉSZ!**
  - ✅ **Tárhely**: `frontend/src/components/EncryptionPasswordPrompt.tsx` (új fájl)
  - ✅ **Tárhely**: `frontend/src/utils/customerEncryption.ts` (új fájl)
  - ✅ **Tárhely**: `frontend/src/utils/encryptionPasswordManager.ts` (új fájl)
  - ✅ **Tárhely**: `frontend/src/utils/store.ts` (saveCustomers/loadCustomers titkosítás integráció)

- [x] **Settings interface bővítése** - **KÉSZ!**
  - ✅ `encryptionEnabled: boolean` - Titkosítás be/kikapcsolása
  - ✅ `encryptionPassword: string | null` - Jelszó hash (PBKDF2)
  - ✅ `encryptedCustomerData: boolean` - Jelzi, hogy a customer adatok titkosítottak-e
  - ✅ `useAppPasswordForEncryption: boolean` - App jelszó használata titkosításhoz
  - ✅ **Tárhely**: `frontend/src/types.ts` (Settings interface)

- [x] **Backend commands hozzáadása** - **KÉSZ!**
  - ✅ `encrypt_data(data: String, password: String) -> String` - Adatok titkosítása
  - ✅ `decrypt_data(encrypted: String, password: String) -> String` - Adatok visszafejtése
  - ✅ `verify_password(password: String, hash: String) -> bool` - Jelszó ellenőrzés
  - ✅ `hash_password(password: String) -> String` - Jelszó hash generálás (PBKDF2)
  - ✅ **Tárhely**: `src-tauri/src/commands.rs`

- [x] **Fordítások minden nyelvre** - **KÉSZ!**
  - ✅ Jelszó dialógus szövegek (13 nyelv) - **KÉSZ!**
  - ✅ Settings titkosítás beállítások (13 nyelv) - **KÉSZ!**
  - ✅ Encryption modal szövegek (enableEncryption, useSamePasswordAsApp, encryptionPassword, passwordMinLength) - **KÉSZ!**
  - ✅ Hibaüzenetek titkosítás/visszafejtés esetén (13 nyelv) - **KÉSZ!**
  - ✅ **Tárhely**: `frontend/src/utils/languages/*.ts` (minden nyelvi fájl frissítve)

- [x] **UI/UX fejlesztések** - **KÉSZ!**
  - ✅ Encryption enable modal komponens (SecurityTab.tsx) - checkbox az app password használatához
  - ✅ ConfirmDialog customContent támogatás - **KÉSZ!**
  - ✅ Modal megjelenés javítva (styling, gombok, scrollozható tartalom) - **KÉSZ!**
  - ✅ Jelszó prompt időzítése (nem jelenik meg loading screen-en, welcome message után) - **KÉSZ!**
  - ✅ App password integráció (ha be van kapcsolva, nem kér külön encryption password) - **KÉSZ!**

#### 2.2. App Jelszavas Védelem
- [x] **Jelszavas védelem rendszer** - **KÉSZ! (már korábban implementálva, most javítva)**
  - ✅ Opcionális jelszavas védelem az app indításakor (`AuthGuard.tsx`) - **KÉSZ!**
  - ✅ Jelszó beállítása első indításkor vagy Settings-ben (SecurityTab.tsx) - **KÉSZ!**
  - ✅ Auto-lock funkció (inaktivitás után X perc) - **KÉSZ!**
  - ✅ Loading screen-en nem jelenik meg a jelszó prompt - **KÉSZ!**
  - ✅ App password integráció customer data encryption-nel - **KÉSZ!**
  - ✅ **Tárhely**: `frontend/src/components/AuthGuard.tsx` (már létezett, javítva)
  - ✅ **Tárhely**: `frontend/src/utils/encryptionPasswordManager.ts` (app password kezelés)

- [x] **Backend commands** - **KÉSZ! (már korábban implementálva)**
  - ✅ `verify_app_password(password: String) -> bool` - **KÉSZ!**
  - ✅ `set_app_password(password: String) -> Result<()>` - **KÉSZ!**
  - ✅ `clear_app_password() -> Result<()>` - **KÉSZ!**
  - ✅ **Tárhely**: `src-tauri/src/commands.rs`

- [x] **Settings interface bővítése** - **KÉSZ! (már korábban implementálva)**
  - ✅ `appPasswordEnabled: boolean` - App jelszavas védelem be/kikapcsolása
  - ✅ `autoLockMinutes: number` - Auto-lock időtartama (0 = nincs auto-lock)
  - ✅ `appPasswordHash: string | null` - Jelszó hash tárolása (PBKDF2)
  - ✅ **Tárhely**: `frontend/src/types.ts`

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

---

## ✅ RECENTLY COMPLETED (2025)

### 🔒 Customer Data Encryption - TELJES IMPLEMENTÁCIÓ KÉSZ!

**Dátum**: 2025 december 6.

**Implementált funkciók:**

1. **Backend titkosítás (Rust)**
   - ✅ AES-256-GCM titkosítás (`src-tauri/src/encryption.rs`)
   - ✅ PBKDF2 jelszó hashing
   - ✅ Tauri commands: `encrypt_data`, `decrypt_data`, `hash_password`, `verify_password`

2. **Frontend integráció**
   - ✅ `EncryptionPasswordPrompt.tsx` - Jelszó dialógus komponens
   - ✅ `customerEncryption.ts` - Encryption utilities
   - ✅ `encryptionPasswordManager.ts` - In-memory password manager
   - ✅ `store.ts` - saveCustomers/loadCustomers titkosítás integráció
   - ✅ Külön fájl tárolás (`customers.json` vs `data.json`)

3. **Settings UI**
   - ✅ SecurityTab.tsx - Titkosítás be/kikapcsolás modal
   - ✅ App password integráció (checkbox: "Use app password for encryption")
   - ✅ Jelszó változtatás/letiltás dialógusok
   - ✅ ConfirmDialog customContent támogatás

4. **UX fejlesztések**
   - ✅ Jelszó prompt időzítése (nem jelenik meg loading screen-en)
   - ✅ Welcome message után jelenik meg a prompt (ha van)
   - ✅ Navigation esetén újra megjelenik a prompt (ha nincs jelszó memóriában)
   - ✅ App password használata esetén nem kér külön encryption password
   - ✅ Data integrity védés (nem törlődik az encrypted data, ha jelszó hiányzik)

5. **Nyelvi támogatás**
   - ✅ 13 nyelv támogatva (hu, en, de, es, fr, it, pl, pt, ru, sk, cs, uk, zh)
   - ✅ Új kulcsok: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

6. **Bugfixek**
   - ✅ Infinite render loop javítva (Customers.tsx)
   - ✅ "Last Saved" azonnali frissítés (új customer hozzáadása után)
   - ✅ Modal gombok kattinthatósága javítva
   - ✅ Settings mentés azonnali (encryption password beállításakor)
   - ✅ ENCRYPTION_PASSWORD_REQUIRED error kezelés javítva

**Fájlok módosítva/új:**
- ✅ `src-tauri/src/encryption.rs` (új)
- ✅ `src-tauri/src/commands.rs` (encryption commands hozzáadva)
- ✅ `src-tauri/Cargo.toml` (aes-gcm, pbkdf2 dependencies)
- ✅ `frontend/src/components/EncryptionPasswordPrompt.tsx` (új)
- ✅ `frontend/src/utils/customerEncryption.ts` (új)
- ✅ `frontend/src/utils/encryptionPasswordManager.ts` (új)
- ✅ `frontend/src/features/settings/components/SecurityTab.tsx` (módosítva)
- ✅ `frontend/src/shared/components/dialogs/ConfirmDialog.tsx` (customContent támogatás)
- ✅ `frontend/src/utils/store.ts` (encryption integráció)
- ✅ `frontend/src/App.tsx` (password prompt logika)
- ✅ `frontend/src/components/AuthGuard.tsx` (isInitialized prop, onAppPasswordSet callback)
- ✅ `frontend/src/components/Customers.tsx` (bugfixek)
- ✅ `frontend/src/types.ts` (Settings interface bővítve)
- ✅ `frontend/src/utils/languages/*.ts` (13 nyelv, új kulcsok)

**Technikai részletek:**
- **Encryption**: AES-256-GCM
- **Password Hashing**: PBKDF2 (100,000 iterations, SHA-256)
- **Storage**: Külön fájl (`customers.json`) a titkosított customer adatokhoz
- **Password Storage**: In-memory only (nem tárolódik plain text-ben)
- **App Password Integration**: Opcionális, checkbox-val be/kikapcsolható
