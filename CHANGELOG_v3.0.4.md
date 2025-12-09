# Changelog v3.0.4

## 🐛 Bugfixes & Improvements

### Fordítási és nyelvváltozási javítások

- **Titkosított adatok szövegének internacionalizálása**: A hardcoded "TITKOSITOTT ADATOK" szöveg most már minden nyelven helyesen jelenik meg a `encryption.encryptedData` fordítási kulcs alapján
- **Nyelvváltozás után automatikus adatfrissítés**: Amikor a felhasználó megváltoztatja a nyelvet, az összes adat (offers, customers, settings, printers, filaments) automatikusan újramentésre kerül az új nyelven a data.json fájlba
- **Offers lista valós idejű frissítése**: Az Offers lista most azonnal frissül a nyelvváltozás után, a titkosított adatok szövege (pl. "TITKOSITOTT ADATOK") mindig a jelenlegi nyelven jelenik meg

### Technikai változtatások

- **`store.ts` módosítások**:
  - A `saveOffers` függvény most egy opcionális `encryptedDataLabel` paramétert fogad, amely lehetővé teszi a fordított szöveg átadását
  - A hardcoded "TITKOSITOTT ADATOK" szöveg helyett most a fordított szöveg kerül tárolásra

- **`App.tsx` módosítások**:
  - Hozzáadva `translations as translationRegistry` import
  - A `debouncedSaveOffers` függvény most `useMemo`-val van létrehozva, hogy a `settings.language` változásakor újra létrejöjjön
  - Hozzáadva egy új `useEffect`, amely a nyelvváltozásra azonnal újramenti az összes adatot (offers, customers, settings, printers, filaments) az új nyelven
  - A `saveOffers` hívások most a `t("encryption.encryptedData")` fordítást adják át
  - Hozzáadva filament színek fordítása nyelvváltozás után
  - Hozzáadva offer description fordítása (ha "Importált fájl:" prefix van)
  - Hozzáadva dashboard widget title-ek fordítása nyelvváltozás után

- **`Filaments.tsx` módosítások**:
  - Hozzáadva `useEffect` a színcímkék automatikus frissítéséhez nyelvváltozáskor az input mezőben
  - Frissítve a filament lista/táblázat megjelenítése, hogy a színek mindig a jelenlegi nyelven jelenjenek meg
  - A `displayName` kiszámítása most lokalizált színcímkéket használ a library és preset színekből

- **`Offers.tsx` módosítások**:
  - Hozzáadva `translations as translationRegistry` import
  - Hozzáadva `getDisplayCustomerName` helper függvény, amely ellenőrzi, hogy a `customerName` egy ismert titkosított adatok szöveg-e, és ha igen, a jelenlegi nyelvű fordítást adja vissza
  - Hozzáadva `getDisplayCustomerNameForPDF` helper függvény a PDF generáláshoz
  - Frissítve az offer lista megjelenítése, hogy a `getDisplayCustomerName` függvényt használja
  - Frissítve a PDF generálás, hogy a `getDisplayCustomerNameForPDF` függvényt használja

- **`OfferSortControls.tsx` módosítások**:
  - Hozzáadva `useTranslation` hook használata
  - Hozzáadva `settings` prop, hogy a nyelv változásakor frissüljön
  - A hardcoded magyar szövegek ("Rendezés:", "Dátum", "Összeg", stb.) most már fordított kulcsokat használnak

- **`BudgetManagement.tsx` módosítások**:
  - Hozzáadva `translations as translationRegistry` import
  - A `saveOffers` hívás most a `translationRegistry[settings.language]?.["encryption.encryptedData"]` fordítást használja

- **Fordítási kulcsok hozzáadva minden nyelvi fájlhoz**:
  - `offers.sort.label`: "Rendezés:" / "Sort:" / stb.
  - `offers.sort.date`: "Dátum" / "Date" / stb.
  - `offers.sort.amount`: "Összeg" / "Amount" / stb.
  - `offers.sort.status`: "Státusz" / "Status" / stb.
  - `offers.sort.customer`: "Ügyfél" / "Customer" / stb.
  - `offers.sort.id`: "ID" (minden nyelven)
  - `offers.sort.multiLevelHint`: "(Shift + kattintás: több szintű)" / "(Shift + click: multi-level)" / stb.
  - `settings.showHelpInMenu`: Minden nyelvre lefordítva (korábban csak angolul, németül, magyarul volt)
  - `settings.showHelpInMenuDescription`: Minden nyelvre lefordítva (korábban csak angolul, németül, magyarul volt)

- **`index.html` és `main.tsx` módosítások**:
  - A diagnosztikai "⏳ HTML betöltve, React betöltése..." üzenet most már csak development módban jelenik meg
  - Production build-ben nem jelenik meg ez az üzenet, csak a konzolban maradnak a diagnosztikai logok

### Visszafelé kompatibilitás

- A régi formátumú (hardcoded "TITKOSITOTT ADATOK" vagy "ENCRYPTED DATA" szöveggel) offers automatikusan frissülnek az új formátumra, amikor újramentésre kerülnek
- Az új formátumú offers helyesen működnek minden nyelven

## 📝 Megjegyzések

Ez egy hotfix verzió, amely javítja a fordítási és nyelvváltozási problémákat. A titkosított adatok szövege most már mindig a jelenlegi nyelven jelenik meg, és a nyelvváltozás után az összes adat automatikusan frissül.

