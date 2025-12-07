# Changelog v3.0.3

## 🐛 Bugfixes & Improvements

### Ügyfélkezelés fejlesztések

- **Automatikus ügyfél létrehozás**: Mentett árajánlat tételnél automatikusan létrejön az ügyfél, ha még nem létezik (név és contact alapján ellenőrzi)
- **Ügyfél ID megjelenítés titkosított adatoknál**: Ha az ügyfél adatai titkosítva vannak, az árajánlatnál az ügyfél ID-ja jelenik meg a név helyett
- **ID-k külön tárolása**: Az ügyfél ID-k most külön vannak tárolva (nem titkosítva) a `customer_ids` objektumban, így megjeleníthetők, még ha az ügyfél adatai titkosítva vannak is
- **Offer interface bővítve**: Hozzáadva a `customerId?: number` mező az Offer interface-hez

### Technikai változtatások

- Módosítva a `customerEncryption.ts` - az ID-k külön tárolása
- Módosítva a `store.ts` - ID-k külön mentése és betöltése
- Módosítva az `Offers.tsx` - automatikus ügyfél létrehozás és ID megjelenítés
- Hozzáadva új fordítási kulcsok minden nyelvi fájlhoz:
  - `offers.details.customerId`
  - `offers.details.customerEncrypted`
  - `offers.toast.customerCreated`

### Visszafelé kompatibilitás

- A régi formátumú (ID-k benne vannak a titkosított adatokban) ügyfelek automatikusan migrálódnak az új formátumra
- Az új formátumú (ID-k külön tárolva) ügyfelek helyesen működnek

## 📝 Megjegyzések

Ez egy hotfix verzió, amely javítja az ügyfélkezelés működését titkosított adatok esetén.

