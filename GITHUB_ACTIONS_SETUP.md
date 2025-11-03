# GitHub Actions beállítás útmutató

## Automatikus buildelés mindhárom platformra

A GitHub Actions workflow automatikusan buildeli az alkalmazást minden push után macOS, Linux és Windows platformokra.

## Hogyan működik?

1. **Automatikus trigger**: Minden push vagy pull request a `main` vagy `master` branch-re indítja a buildet
2. **Manuális trigger**: A GitHub repository Actions tabjában a "Run workflow" gombbal is indíthatod manuálisan
3. **Platformok**: Mindhárom platformon (macOS, Linux, Windows) párhuzamosan buildel
4. **Eredmények**: Az összes build eredménye letölthető artifact-ként

## Build eredmények letöltése

1. Menj a GitHub repository-dhoz: https://github.com/LexyGuru/3DPrinterCalcApp
2. Kattints az **Actions** tabra
3. Válassz egy befejezett workflow futtatást
4. Görgess le az **Artifacts** részhez
5. Letöltheted:
   - `macos-latest` - macOS .app és .dmg fájlok
   - `ubuntu-latest` - Linux .deb, .AppImage fájlok
   - `windows-latest` - Windows .msi installer

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

