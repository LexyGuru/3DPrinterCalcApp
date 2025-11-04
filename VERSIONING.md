# Verziókezelés és Update Checker - 3DPrinterCalcApp

Ez a dokumentáció leírja, hogyan működik a verzióellenőrző rendszer és a beta kiadások.

## Verzióellenőrző rendszer

Az alkalmazás automatikusan ellenőrzi a GitHub Releases-t, hogy van-e új verzió.

### Hogyan működik?

1. **Indításkor ellenőrzés**: Az alkalmazás indításakor automatikusan ellenőrzi a GitHub Releases-t
2. **5 percenkénti ellenőrzés**: Az alkalmazás 5 percenként automatikusan ellenőrzi új verziókat
3. **Értesítés**: Ha van új verzió, egy értesítés jelenik meg a jobb felső sarokban

### Verzió frissítése

Amikor új verziót adsz ki:

1. **Frissítsd a verziót** a következő fájlokban:
   - `src-tauri/tauri.conf.json` - `"version": "X.Y.Z"`
   - `src-tauri/Cargo.toml` - `version = "X.Y.Z"`
   - `frontend/src/utils/version.ts` - `CURRENT_VERSION = "X.Y.Z"`

2. **Hozz létre GitHub Release-t**:
   - Menj a GitHub repository-hoz: https://github.com/LexyGuru/3DPrinterCalcApp/releases
   - Kattints "Create a new release"
   - Tag: `vX.Y.Z` (pl. `v0.2.0`)
   - Title: `Version X.Y.Z` vagy `Release X.Y.Z`
   - Description: Írj egy leírást a változtatásokról
   - Upload a buildelt fájlokat az artifactokból

3. **Beta release esetén**:
   - Jelöld be a "Set as a pre-release" opciót
   - Az UpdateChecker automatikusan felismeri a beta verziókat

## Beta Branch

A beta branch a következő fejlesztésekhez használható, hogy ne kelljen folyamatosan a main/master branch-et frissíteni.

### Beta branch létrehozása

```bash
# Hozz létre egy új beta branch-et
git checkout -b beta

# Pushold a GitHub-ra
git push -u origin beta
```

### Beta buildelés

A beta branch pusholásakor automatikusan lefut a `.github/workflows/build-beta.yml` workflow, ami buildeli a beta verziót.

### Beta verzió használata

Az alkalmazásban lehetőség van beta verziókat ellenőrizni. A `UpdateChecker` komponens `beta={true}` prop-pal beta verziókat is ellenőrizhet.

## Verzió számozás

Javasolt formátum: **Semantic Versioning** (X.Y.Z)

- **X** (major): Nagy változtatások, nem kompatibilis verziók
- **Y** (minor): Új funkciók, kompatibilis verziók
- **Z** (patch): Bugfixek, kompatibilis verziók

Példák:
- `0.1.0` - Első verzió
- `0.1.1` - Bugfix
- `0.2.0` - Új funkciók
- `1.0.0` - Első stabil verzió

## GitHub Releases

### Stable Release

1. Hozz létre egy release-t a GitHub-on
2. Tag: `v0.1.0`
3. Upload a buildelt fájlokat (artifactokból)
4. **Ne** jelöld be "Set as a pre-release"

### Beta Release

1. Hozz létre egy release-t a GitHub-on
2. Tag: `v0.2.0-beta.1` vagy `v0.2.0-beta`
3. Upload a buildelt fájlokat
4. **Jelöld be** "Set as a pre-release"

## Update Checker konfiguráció

A `frontend/src/utils/version.ts` fájlban:

```typescript
const CURRENT_VERSION = "0.1.0"; // Frissítsd ezt minden verzióváltáskor
const GITHUB_REPO = "LexyGuru/3DPrinterCalcApp"; // Frissítsd a saját repository nevedre
```

## Használat

### Stable verzió ellenőrzése (alapértelmezett)

```tsx
<UpdateChecker settings={settings} beta={false} />
```

### Beta verzió ellenőrzése

```tsx
<UpdateChecker settings={settings} beta={true} />
```

## Automatikus ellenőrzés

Az alkalmazás:
- Indításkor ellenőrzi a verziót
- 5 percenként automatikusan újra ellenőrzi
- Ha van új verzió, értesítést mutat
- A felhasználó eltávolíthatja az értesítést (✕ gombbal)

## Tippek

1. **Verziószámok**: Mindig frissítsd a verziót mindhárom helyen, amikor új verziót adsz ki
2. **Release notes**: Írj részletes leírást a változtatásokról a GitHub Release-ben
3. **Beta tesztelés**: Használd a beta branch-et a következő fejlesztésekhez
4. **Stable release**: Amikor a beta készen van, merge-old a main-be és hozz létre stable release-t

