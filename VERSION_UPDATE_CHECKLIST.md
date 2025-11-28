## 📋 Verzióváltás – fejlesztői ellenőrzőlista

Ez a fájl segít, hogy egy új verzió kiadásakor **minden kapcsolódó helyen konzisztensen** frissüljön a verziószám és a dokumentáció.

### 1. Alap verziószám frissítés

- **`frontend/src/utils/version.ts`**
  - Állítsd át a `CURRENT_VERSION` értékét az új verzióra (pl. `"1.7.0"`).
- **`src-tauri/Cargo.toml`**
  - A `[package]` blokkban frissítsd a `version = "x.y.z"` mezőt.
- **`src-tauri/tauri.conf.json`**
  - A gyökér `"version": "x.y.z"` mezőt állítsd az új verzióra.

### 2. Fejlesztési összefoglaló frissítése

- **`FEJLESZTESI_OSSZEFOGLALO.md`**
  - A *„Rövid verziótörténet (high‑level)”* szakaszban:
    - Adj hozzá egy új blokkot az új verzióhoz (pl. `v1.7.0`), rövid, bulletpontos leírással.
  - Ha a verzióhoz kapcsolódó backlog elemek elkészültek, mozgasd őket a **„Kész”** részbe vagy jelöld, hogy melyik verzióban készültek el.

### 3. Rövid fejlesztői TODO frissítése

- **`todo.md`**
  - A lezárt verzióhoz tartozó pontokat jelöld **KÉSZ vX.Y.Z** megjegyzéssel.
  - Az új verzióhoz tervezett feladatokat:
    - Jelöld egyértelműen, pl. `TERVEZETT v1.7.0`.
    - Ha egy feladat kikerül a fókuszból (nem prioritás), azt is írd oda (pl. „NEM PRIORITÁS / JELENLEGI DESIGNBAN NEM KELL…”).

### 4. README fájlok frissítése

- **`README.md` (fő, angol nyelvű összefoglaló)**
  - A *„📋 Version History”* szakasz tetején:
    - Adj hozzá egy új `### vX.Y.Z (YYYY)` blokkot az új verzió fő újdonságaival (maximum 4–6 bullet).
  - Ha a feature listában (felső „✨ Features” blokk) új nagy funkció jelent meg, frissítsd ott is.

- **`README.en.md`**
  - Ugyanúgy frissítsd a *„📋 Version History”* blokkot, mint a fő `README.md`‑ben (nyelvileg konzisztensen).

- **`README.hu.md`**
  - A *„📋 Verziótörténet”* részben vedd fel az új verziót magyar leírással.
  - Ha a feature lista elején új nagy funkció jelent meg, írd át magyarul is.

- **`README.hu.md`**
  - A *„📋 Verziótörténet”* részben vedd fel az új verziót magyar leírással.
  - Ha a feature lista elején új nagy funkció jelent meg, írd át magyarul is.
  

- **Egyéb nyelvi README.\*** fájlok (de, es, it, pl, cs, sk, pt, fr, zh, uk, ru)**
  - Minden új stabil verziónál frissítsd az adott nyelvű README-t is, legalább rövid felsorolással az új fő funkciókról.
  - Figyelj rá, hogy a nyelvmenüben felsorolt nyelvek listája és száma minden README-ben egyezzen.

### 5. Nyelvi rendszer (i18n) ellenőrzése

Ha az új verzióban **új fordítási kulcsok (TranslationKey)** kerültek be:

- **`frontend/src/utils/languages/types.ts`**
  - Add hozzá az új kulcsokat a `TranslationKey` unióhoz.
- **`frontend/src/utils/languages/language_*.ts`**
  - Minden érintett nyelvi fájlban:
    - Vedd fel az új kulcsot.
    - Adj hozzá legalább angol vagy forrásnyelvi fallback szöveget, ha nincs kész fordítás (később finomítható).

### 6. Platform / feature-specifikus dokumentumok

Szükség esetén frissítsd az alábbi fájlokat is:

- **`PLATFORM_FEATURES_AND_ISSUES.md`**
  - Ha új platform‑specifikus funkció kerül be (pl. új értesítési csatorna, OS‑specifikus integráció), írd hozzá.
- **`GITHUB_WIKI_HOME*.md`**
  - Ha a GitHub wiki tartalmát verzióhoz kötött információval bővíted, tartsd szinkronban a fő README‑vel.

### 7. Verziószám konzisztencia ellenőrzése

Keresés a projektben az előző verzióra (pl. `1.6.0`) – ellenőrizd, hogy:

- Nem maradt‑e bent régi verziószám olyan helyen, ahol az újra kell cserélni.
- Csak a **verziótörténeti / changelog** blokkokban maradjon meg a régi verzió stringje (ott történelmi adat).

### 8. Build / Release előtti gyors ellenőrzés

- Frontend build + Tauri build:
  - `cd frontend && pnpm build`
  - `cd src-tauri && cargo tauri build`
- Ha van rá idő:
  - Gyors smoke‑teszt 2–3 fő flow‑ra (Filaments, Offers, Settings).
  - Ellenőrizd, hogy a *Settings / Verzióelőzmények* és az *Update check* UI is a **helyes verziót** mutatja.


