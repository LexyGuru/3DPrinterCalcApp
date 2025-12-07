# Első Release létrehozása - 3DPrinterCalcApp

## Lépések

### 1. GitHub Repository megnyitása
Menj a GitHub repository-hoz: https://github.com/LexyGuru/3DPrinterCalcApp

### 2. Releases oldal megnyitása
Kattints a **"Releases"** linkre (a jobb oldali menüben, vagy a főoldalról: https://github.com/LexyGuru/3DPrinterCalcApp/releases)

### 3. Új Release létrehozása
Kattints a **"Create a new release"** gombra

### 4. Release adatok kitöltése

#### Tag version
```
v0.1.0
```

#### Release title
```
Version 0.1.0 - Initial Release
```

#### Description
```
## 🎉 Első kiadás - 3DPrinterCalcApp v0.1.0

### Főbb funkciók:
- ✅ Filament kezelés (hozzáadás, szerkesztés, törlés)
- ✅ Nyomtató kezelés (hozzáadás, szerkesztés, törlés, AMS rendszerek)
- ✅ 3D nyomtatási költség kalkulátor
- ✅ Árajánlatok kezelése és PDF exportálás
- ✅ Statisztikák és dashboard
- ✅ Többnyelvű támogatás (Magyar, Angol, Német)
- ✅ Több pénznem támogatás (EUR, HUF, USD)
- ✅ Automatikus verzióellenőrzés
- ✅ Modern, felhasználóbarát felület

### Platformok:
- 🍎 macOS
- 🐧 Linux
- 🪟 Windows

### Build információ:
- Verzió: 0.1.0
- Build dátum: $(date +%Y-%m-%d)
- Tauri: 2.9.2
- React: 19.1.1

### Letöltés:
A buildelt fájlok az Actions artifactokból letölthetők:
- macOS: `.dmg` és `.app` fájl
- Linux: `.deb` és `.AppImage` fájl
- Windows: `.msi` installer
```

### 5. Fájlok feltöltése

A GitHub Actions build artifactokból töltsd le és töltsd fel a fájlokat:

#### macOS
- `3DPrinterCalcApp.app` (futtatható alkalmazás)
- `3DPrinterCalcApp_0.1.0_aarch64.dmg` (vagy x86_64 Intel Mac esetén)

#### Linux
- `3DPrinterCalcApp_0.1.0_amd64.deb` (Debian/Ubuntu)
- `3DPrinterCalcApp_0.1.0_amd64.AppImage` (Portable)

#### Windows
- `3DPrinterCalcApp_0.1.0_x64_en-US.msi` (MSI installer)

### 6. Pre-release beállítás
**Ne** jelöld be a "Set as a pre-release" opciót (ez egy stable release)

### 7. Release létrehozása
Kattints a **"Publish release"** gombra

## GitHub Actions artifactok letöltése

1. Menj a **Actions** tab-ra: https://github.com/LexyGuru/3DPrinterCalcApp/actions
2. Válassz egy sikeres build futtatást
3. Görgess le az **Artifacts** részhez
4. Letöltsd a következőket:
   - `macos-latest`
   - `ubuntu-latest`
   - `windows-latest`
5. Csomagold ki a zip fájlokat
6. A fájlok a `bundle/` mappában lesznek

## Release után

Az első release után:
- Az alkalmazás automatikusan észleli az új verziót
- A felhasználók értesítést kapnak
- A verzió információk megjelennek a sidebar alján

## Következő release-ek

A következő release-ekhez:
1. Frissítsd a verziót (`tauri.conf.json`, `Cargo.toml`, `version.ts`)
2. Commit és push
3. Várj a GitHub Actions buildre
4. Hozz létre új release-t az artifactokkal

