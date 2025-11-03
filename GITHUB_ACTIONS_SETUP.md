# GitHub Actions beállítás útmutató

## Automatikus buildelés mindhárom platformra

A GitHub Actions workflow automatikusan buildeli az alkalmazást minden push után macOS, Linux és Windows platformokra.

## Hogyan működik?

1. **Automatikus trigger**: Minden push vagy pull request a `main` vagy `master` branch-re indítja a buildet
2. **Manuális trigger**: A GitHub repository Actions tabjában a "Run workflow" gombbal is indíthatod manuálisan
3. **Platformok**: Mindhárom platformon (macOS, Linux, Windows) párhuzamosan buildel
4. **Eredmények**: Az összes build eredménye letölthető artifact-ként

## Build eredmények letöltése

### Hol találod meg a kész fájlokat?

1. **GitHub Repository → Actions tab**
   - URL: https://github.com/LexyGuru/3DPrinterCalcApp/actions

2. **Válassz egy befejezett workflow futtatást**
   - Kattints egy futtatásra (zöld pipa jelölés = sikeres)
   - Vagy a sárga kör jelölés = fut
   - Vagy piros X = hibázott

3. **Görgess le az Artifacts részhez**
   - Az oldal alján találod az **Artifacts** szekciót
   - Itt látszik mindhárom platform eredménye

4. **Letöltheted a fájlokat**
   - **`macos-latest`** - macOS .app és .dmg fájlok
     - `3DPrinterCalcApp.app` - Futtatható alkalmazás
     - `3DPrinterCalcApp_0.1.0_aarch64.dmg` - DMG installer
   - **`ubuntu-latest`** - Linux fájlok
     - `deb/` mappa - Debian/Ubuntu installer (.deb)
     - `appimage/` mappa - AppImage fájl (portable)
   - **`windows-latest`** - Windows fájlok
     - `msi/` mappa - MSI installer (.msi)

### Letöltés lépései

1. Kattints a platform nevére (pl. `macos-latest`)
2. A zip fájl letöltődik
3. Csomagold ki
4. A buildelt alkalmazás a `bundle/` mappában van

### Artifact tárolás

- Az artifactok **30 napig** elérhetők (retention-days: 30)
- Ezután automatikusan törlődnek
- Ha megtartod, letöltsd őket időben!

### Példa mappa struktúra letöltés után

```
macos-latest.zip
└── bundle/
    └── macos/
        ├── 3DPrinterCalcApp.app
        └── 3DPrinterCalcApp_0.1.0_aarch64.dmg

ubuntu-latest.zip
└── bundle/
    ├── deb/
    │   └── 3DPrinterCalcApp_0.1.0_amd64.deb
    └── appimage/
        └── 3DPrinterCalcApp_0.1.0_amd64.AppImage

windows-latest.zip
└── bundle/
    └── msi/
        └── 3DPrinterCalcApp_0.1.0_x64_en-US.msi
```

## Workflow fájl helye

A workflow fájl itt található: `.github/workflows/build.yml`

## Automatikus futtatás

A workflow automatikusan fut:
- ✅ Minden push után a `main` vagy `master` branch-re
- ✅ Minden pull request után
- ✅ Manuálisan (workflow_dispatch) - Actions tab → Build → Run workflow

## Képernyőképek a használatról

1. **Repository → Actions tab**: Itt látszik az összes workflow futtatás
2. **Workflow kiválasztása**: Kattints egy futtatásra
3. **Artifacts letöltése**: Görgess le az Artifacts részhez és kattints a letöltés gombra

## Hibaelhárítás

Ha a build hibázik:
1. Nézd meg a workflow log-okat az Actions tab-ban
2. Ellenőrizd, hogy minden fájl feltöltve lett-e a repository-ba
3. Ha macOS-on van probléma: lehet, hogy az Apple codesigning hiányzik (opcionális)

## Opcionális: Apple codesigning (macOS)

Ha aláírt macOS alkalmazást szeretnél (app store-hoz, vagy Gatekeeper átlépéshez):
1. Menj a GitHub repository **Settings** → **Secrets and variables** → **Actions**
2. Add hozzá ezeket a secrets-eket:
   - `APPLE_CERTIFICATE` - Base64 encoded .p12 fájl
   - `APPLE_CERTIFICATE_PASSWORD` - A certificate jelszava
   - `APPLE_SIGNING_IDENTITY` - Developer ID Application
   - `APPLE_ID` - Apple ID email
   - `APPLE_TEAM_ID` - Apple Developer Team ID
   - `APPLE_APP_SPECIFIC_PASSWORD` - App-specific password

**Megjegyzés**: Az Apple codesigning opcionális, a build nélküle is működik, csak a végfelhasználók figyelmeztetést kaphatnak macOS-en.

## További információk

- Részletes build útmutató: [BUILD.md](BUILD.md)
- App buildelés útmutató: [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

