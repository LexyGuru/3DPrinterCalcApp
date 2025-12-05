# Moduláris Architektúra Terv

## 📋 Áttekintés

Ez a dokumentum leírja a kód moduláris refaktorálásának tervét, hogy kisebb, újrafelhasználható modulokra bontsuk a nagy komponenseket.

---

## 🎯 Célok

1. **Kisebb, karbantartható modulok** - minden modul max 300-500 sor
2. **Újrafelhasználhatóság** - közös logika és komponensek kiemelése
3. **Jobb tesztelhetőség** - izolált modulok könnyebben tesztelhetők
4. **Könnyebb fejlesztés** - kisebb fájlok könnyebben navigálhatók és módosíthatók
5. **Jobb code splitting** - kisebb modulok jobban optimalizálhatók

---

## 📁 Javasolt Mappa Struktúra

```
frontend/src/
├── features/                    # Feature-specifikus modulok
│   ├── calculator/
│   │   ├── components/          # Calculator specifikus komponensek
│   │   ├── hooks/              # Calculator specifikus hook-ok
│   │   ├── utils/              # Calculator specifikus utility-k
│   │   ├── types.ts            # Calculator specifikus típusok
│   │   └── index.ts            # Public API export
│   ├── offers/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── filaments/
│   ├── printers/
│   ├── customers/
│   ├── settings/
│   ├── home/
│   └── ...
├── shared/                      # Megosztott komponensek és logika
│   ├── components/             # Újrafelhasználható UI komponensek
│   │   ├── forms/              # Form komponensek
│   │   ├── tables/             # Táblázat komponensek
│   │   ├── dialogs/            # Dialog komponensek
│   │   └── ...
│   ├── hooks/                  # Újrafelhasználható hook-ok
│   ├── utils/                  # Újrafelhasználható utility-k
│   └── types/                  # Megosztott típusok
├── core/                       # Core funkcionalitás
│   ├── store/                  # Store/logika
│   ├── router/                 # Router konfiguráció
│   ├── theme/                  # Téma kezelés
│   └── i18n/                   # Fordítások
└── components/                 # Legacy komponensek (fokozatos migrálás)
```

---

## 🔄 Refaktorálási Terv

### 1. Fázis: Shared Modulok Létrehozása

#### 1.1. Shared Components
- [ ] **Form komponensek** (`shared/components/forms/`)
  - `FormField.tsx` - Input mező wrapper
  - `SelectField.tsx` - Select dropdown wrapper
  - `NumberField.tsx` - Number input wrapper
  - `CheckboxField.tsx` - Checkbox wrapper
  - `DateField.tsx` - Date picker wrapper

- [ ] **Table komponensek** (`shared/components/tables/`)
  - `DataTable.tsx` - Általános táblázat komponens
  - `TableHeader.tsx` - Táblázat fejléc
  - `TableRow.tsx` - Táblázat sor
  - `TablePagination.tsx` - Oldalszámozás
  - `TableFilters.tsx` - Szűrők

- [ ] **Dialog komponensek** (`shared/components/dialogs/`)
  - `BaseDialog.tsx` - Alap dialog komponens
  - `FormDialog.tsx` - Form dialog wrapper
  - `ConfirmDialog.tsx` - Megerősítő dialog (már van, átmozgatni)

#### 1.2. Shared Hooks
- [ ] **Data management hook-ok** (`shared/hooks/`)
  - `useDataTable.ts` - Táblázat adatkezelés hook
  - `useForm.ts` - Form kezelés hook
  - `usePagination.ts` - Oldalszámozás hook
  - `useFilters.ts` - Szűrő hook
  - `useSorting.ts` - Rendezés hook

- [ ] **UI hook-ok**
  - `useModal.ts` - Modal kezelés hook
  - `useToast.ts` - Toast hook (már van, átmozgatni)
  - `useTooltip.ts` - Tooltip hook

#### 1.3. Shared Utils
- [ ] **Validation utils** (`shared/utils/validation.ts`)
  - Form validáció függvények
  - Jelenlegi `utils/validation.ts` átmozgatása

- [ ] **Format utils** (`shared/utils/format.ts`)
  - Dátum formázás
  - Pénz formázás
  - Szám formázás

---

### 2. Fázis: Feature Modulok Létrehozása

#### 2.1. Calculator Feature (`features/calculator/`)

**Jelenlegi fájl**: `components/Calculator.tsx` (~1372 sor)

**Bontás terv**:
```
features/calculator/
├── components/
│   ├── CalculatorForm.tsx          # Fő form komponens
│   ├── PrinterSelector.tsx          # Nyomtató választó
│   ├── FilamentSelector.tsx         # Filament választó
│   ├── FilamentList.tsx             # Filament lista
│   ├── CalculationResults.tsx       # Eredmények megjelenítése
│   ├── OfferDialog.tsx              # Árajánlat mentés dialog
│   └── CalculationSummary.tsx       # Összefoglaló
├── hooks/
│   ├── useCalculator.ts             # Fő számítás logika
│   ├── useFilamentSelection.ts      # Filament kiválasztás logika
│   └── useCalculationTemplates.ts   # Template kezelés
├── utils/
│   ├── calculations.ts              # Számítási függvények
│   └── validation.ts                # Calculator specifikus validáció
├── types.ts                         # Calculator típusok
└── index.ts                         # Public API
```

**Migrációs lépések**:
1. Létrehozni a `features/calculator/` mappát
2. Kiemelni a számítási logikát `utils/calculations.ts`-be
3. Kiemelni a form komponenseket külön fájlokba
4. Létrehozni a hook-okat
5. Frissíteni az import-okat

---

#### 2.2. Offers Feature (`features/offers/`)

**Jelenlegi fájl**: `components/Offers.tsx` (~3985 sor)

**Bontás terv**:
```
features/offers/
├── components/
│   ├── OffersList.tsx               # Fő lista komponens
│   ├── OfferCard.tsx                # Árajánlat kártya
│   ├── OfferTable.tsx               # Táblázat nézet
│   ├── OfferFilters.tsx             # Szűrők
│   ├── OfferDialog.tsx              # Új/szerkesztés dialog
│   ├── OfferDetails.tsx             # Részletek nézet
│   └── OfferStatusBadge.tsx         # Státusz badge
├── hooks/
│   ├── useOffers.ts                 # Offers adatkezelés
│   ├── useOfferFilters.ts           # Szűrő logika
│   └── useOfferDialog.ts            # Dialog kezelés
├── utils/
│   ├── offerCalculations.ts         # Árajánlat számítások
│   └── offerExport.ts               # Export funkciók
├── types.ts
└── index.ts
```

---

#### 2.3. Filaments Feature (`features/filaments/`)

**Jelenlegi fájl**: `components/Filaments.tsx` (~3620 sor)

**Bontás terv**:
```
features/filaments/
├── components/
│   ├── FilamentsList.tsx            # Fő lista
│   ├── FilamentCard.tsx             # Filament kártya
│   ├── FilamentTable.tsx            # Táblázat nézet
│   ├── FilamentDialog.tsx           # Új/szerkesztés dialog
│   ├── FilamentFilters.tsx          # Szűrők
│   └── FilamentColorPicker.tsx      # Szín választó
├── hooks/
│   ├── useFilaments.ts              # Filaments adatkezelés
│   └── useFilamentDialog.ts         # Dialog kezelés
├── utils/
│   └── filamentUtils.ts             # Filament utility-k
├── types.ts
└── index.ts
```

---

#### 2.4. Settings Feature (`features/settings/`)

**Jelenlegi fájl**: `components/Settings.tsx` (~5947 sor) - **LEGNAGYOBB!**

**Bontás terv**:
```
features/settings/
├── components/
│   ├── SettingsLayout.tsx           # Fő layout
│   ├── GeneralSettings.tsx          # Általános beállítások
│   ├── ThemeSettings.tsx            # Téma beállítások
│   ├── BackupSettings.tsx           # Backup beállítások
│   ├── LogSettings.tsx              # Log beállítások
│   ├── PrinterSettings.tsx          # Nyomtató beállítások
│   ├── FilamentSettings.tsx         # Filament beállítások
│   ├── LanguageSettings.tsx         # Nyelv beállítások
│   └── AdvancedSettings.tsx         # Haladó beállítások
├── hooks/
│   ├── useSettings.ts               # Settings adatkezelés
│   └── useSettingsSections.ts        # Beállítás szekciók
├── utils/
│   └── settingsUtils.ts             # Settings utility-k
├── types.ts
└── index.ts
```

---

#### 2.5. Home Feature (`features/home/`)

**Jelenlegi fájl**: `components/Home.tsx` (~3547 sor)

**Bontás terv**:
```
features/home/
├── components/
│   ├── HomeLayout.tsx               # Fő layout
│   ├── Dashboard.tsx                # Dashboard (már van widgets/Dashboard.tsx)
│   └── QuickStats.tsx               # Gyors statisztikák
├── hooks/
│   └── useHomeData.ts               # Home adatkezelés
├── utils/
│   └── homeUtils.ts                 # Home utility-k
├── types.ts
└── index.ts
```

---

## 🚀 Implementációs Stratégia

### Fázisok

1. **Fázis 1: Shared modulok** (1-2 hét)
   - Shared komponensek létrehozása
   - Shared hook-ok létrehozása
   - Shared utility-k létrehozása

2. **Fázis 2: Calculator refaktorálás** (3-5 nap)
   - Calculator feature modul létrehozása
   - Komponensek bontása
   - Hook-ok létrehozása
   - Tesztelés

3. **Fázis 3: Offers refaktorálás** (1 hét)
   - Offers feature modul létrehozása
   - Komponensek bontása
   - Hook-ok létrehozása

4. **Fázis 4: Filaments refaktorálás** (1 hét)
   - Filaments feature modul létrehozása
   - Komponensek bontása

5. **Fázis 5: Settings refaktorálás** (1.5-2 hét) - **LEGNEHEZEBB**
   - Settings feature modul létrehozása
   - Komponensek bontása szekciókra
   - Hook-ok létrehozása

6. **Fázis 6: Home refaktorálás** (3-5 nap)
   - Home feature modul létrehozása
   - Komponensek bontása

7. **Fázis 7: Cleanup** (2-3 nap)
   - Legacy komponensek eltávolítása
   - Import-ok frissítése
   - Dokumentáció frissítése

---

## 📝 Best Practices

### 1. Modul Struktúra

Minden feature modul következő struktúrát követ:
- `components/` - Feature specifikus komponensek
- `hooks/` - Feature specifikus hook-ok
- `utils/` - Feature specifikus utility-k
- `types.ts` - Feature specifikus típusok
- `index.ts` - Public API (csak export-ok)

### 2. Import Szabályok

```typescript
// ✅ JÓ - relatív import feature modulon belül
import { useCalculator } from '../hooks/useCalculator';

// ✅ JÓ - shared modulokból
import { FormField } from '@/shared/components/forms/FormField';

// ✅ JÓ - core modulokból
import { useTranslation } from '@/core/i18n';

// ❌ ROSSZ - más feature modulból közvetlenül
import { useOffers } from '../features/offers/hooks/useOffers';
```

### 3. Public API

Minden feature modul `index.ts` fájlban exportálja a public API-t:

```typescript
// features/calculator/index.ts
export { Calculator } from './components/Calculator';
export { useCalculator } from './hooks/useCalculator';
export type { CalculatorProps } from './types';
```

### 4. Típusok

- Feature specifikus típusok a feature modulban
- Megosztott típusok `shared/types/`-ban
- Core típusok `core/types/`-ban vagy `types.ts`-ben

---

## 🔧 Tooling és Automatizálás

### Path Alias Beállítás

`vite.config.ts`-ben:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@features': path.resolve(__dirname, './src/features'),
    '@shared': path.resolve(__dirname, './src/shared'),
    '@core': path.resolve(__dirname, './src/core'),
  }
}
```

`tsconfig.json`-ben:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@core/*": ["./src/core/*"]
    }
  }
}
```

---

## ✅ Előnyök

1. **Karbantarthatóság** - kisebb, fókuszált fájlok
2. **Újrafelhasználhatóság** - közös komponensek és hook-ok
3. **Tesztelhetőség** - izolált modulok
4. **Jobb code splitting** - feature-önként lazy loading
5. **Könnyebb navigáció** - logikus mappa struktúra
6. **Csapatmunka** - különböző fejlesztők dolgozhatnak külön feature-ökön

---

## 📊 Becsült Időtartam

- **Fázis 1 (Shared)**: 1-2 hét
- **Fázis 2-6 (Features)**: 4-6 hét
- **Fázis 7 (Cleanup)**: 2-3 nap

**Összesen: ~6-8 hét** fokozatos refaktorálással

---

## 🎯 Következő Lépések

1. ✅ Dokumentáció létrehozása (ez a fájl)
2. ⏳ Shared modulok implementálása
3. ⏳ Calculator feature refaktorálás (pilot projekt)
4. ⏳ További feature-ök refaktorálása
5. ⏳ Cleanup és dokumentáció frissítése

