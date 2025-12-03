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
- ❌ Route-based code splitting implementálása (React Router integráció)
- ❌ Titkosítási infrastruktúra (Rust crypto crates)
- ❌ Jelszavas védelem rendszer
- ❌ React.lazy() dokumentálása és optimalizálása

---

### ⚡ 1. Performance Optimalizálás és Code Splitting

#### 1.1. React.lazy() Dokumentálása és Optimalizálása
- [ ] **React.lazy() implementáció ellenőrzése és dokumentálása**
  - Jelenlegi lazy loading komponensek áttekintése ✅ (már implementálva)
  - Loading fázisban csak adatok töltődnek be, komponensek nem ✅ (már működik)
  - Suspense fallback optimalizálása
  - Error boundary hozzáadása lazy komponensekhez
  - **Tárhely**: `frontend/src/App.tsx` (módosítás)
  - **Tárhely**: Dokumentáció (`docs/PERFORMANCE.md` - új fájl)

#### 1.2. Route-based Code Splitting
- [ ] **React Router integráció implementálása**
  - **Megjegyzés**: Jelenleg az alkalmazás state-based navigációt használ (`activePage` state), routing-ra kell átállni
  - React Router telepítése és konfigurálása
  - Route struktúra tervezése és implementálása (URL alapú: `/settings`, `/offers`, stb.)
  - Lazy loading route-okhoz (minden route külön fájlba kerül)
  - State-based navigáció átalakítása routing-ra (`activePage` → URL)
  - **Előnyök**: URL alapú navigáció, bookmark-olható oldalak, vissza gomb működik, jobb code splitting
  - **Tárhely**: `frontend/src/router/` (új mappa)
  - **Tárhely**: `frontend/src/App.tsx` (átalakítás routing-ra)
  - **Tárhely**: Dokumentáció (`docs/ROUTING.md` - új fájl)

#### 1.3. Code Splitting Finomhangolás
- [ ] **Vite build konfiguráció optimalizálása**
  - `rollupOptions.output.manualChunks` beállítása
  - Vendor chunk optimalizálás (node_modules külön chunk)
  - Route-based chunking (routing implementálása után)
  - **Tárhely**: `frontend/vite.config.ts` (módosítás)

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
