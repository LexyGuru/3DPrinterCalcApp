# Önálló alkalmazás készítése - 3DPrinterCalcApp

## Rövid útmutató

### 1. Előkészítés

Győződj meg róla, hogy minden függőség telepítve van:

```bash
# Rust és Tauri CLI (ha nincs még)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install tauri-cli

# Frontend függőségek
cd frontend
pnpm install
cd ..
```

### 2. Buildelés (Önálló app készítése)

```bash
cd src-tauri
cargo tauri build
```

Ez a parancs:
1. Automatikusan buildeli a frontend-et (React alkalmazás)
2. Buildeli a Rust backend-et
3. Összecsomagolja egy platform-specifikus installer-be

### 3. Az eredmény helye

A kész alkalmazás itt lesz:

```bash
src-tauri/target/release/bundle/
```

**macOS esetén:**
- `bundle/macos/3DPrinterCalcApp.app` - A futtatható alkalmazás
- `bundle/macos/3DPrinterCalcApp_0.1.0_aarch64.dmg` - DMG installer (vagy x86_64 Intel Mac esetén)

**Linux esetén:**
- `bundle/deb/3DPrinterCalcApp_0.1.0_amd64.deb` - Debian/Ubuntu installer
- `bundle/appimage/3DPrinterCalcApp_0.1.0_amd64.AppImage` - AppImage fájl (portable)

**Windows esetén:**
- `bundle/msi/3DPrinterCalcApp_0.1.0_x64_en-US.msi` - MSI installer

### 4. Telepítés és használat

**macOS:**
1. Nyisd meg a `.dmg` fájlt
2. Húzd az alkalmazást az Applications mappába
3. Futtathatod dupla kattintással

**Linux:**
```bash
# .deb fájl telepítése
sudo dpkg -i bundle/deb/3DPrinterCalcApp_0.1.0_amd64.deb

# Vagy AppImage futtatása (telepítés nélkül)
chmod +x bundle/appimage/3DPrinterCalcApp_0.1.0_amd64.AppImage
./bundle/appimage/3DPrinterCalcApp_0.1.0_amd64.AppImage
```

**Windows:**
1. Kattints duplán a `.msi` fájlra
2. Kövesd a telepítővarázslót
3. Az alkalmazás elérhető lesz a Start menüből

## Mit tartalmaz az önálló alkalmazás?

Az alkalmazás tartalmazza:
- ✅ A teljes React frontend-et (buildelt, optimalizált)
- ✅ A Rust backend-et
- ✅ Az összes szükséges függőséget
- ✅ Az ikonokat és metaadatokat
- ✅ Platform-specifikus wrapper-t

**Nincs szükség külső függőségekre:** Az alkalmazás önállóan fut, nem kell hozzá Node.js, nem kell böngésző - minden be van építve!

## Tökéletesítések

### App név és verzió változtatása

Szerkeszd a `src-tauri/tauri.conf.json` fájlt:

```json
{
  "productName": "3D Printer Kalkulátor",  // Az app neve
  "version": "1.0.0",                      // Verzió
  "identifier": "com.yourapp.3dprintercalc" // Egyedi azonosító
}
```

### Ikon módosítása

Cseréld ki az `src-tauri/icons/` mappában lévő ikon fájlokat:
- `icon.icns` - macOS
- `icon.ico` - Windows
- `icon.png` - Linux

Minden platformhoz több méretben is szükség van az ikonokra.

### Fejlesztői vs Production build

**Dev build (gyors, hibakereséshez):**
```bash
cargo tauri dev
```

**Production build (optimalizált, önálló app):**
```bash
cargo tauri build
```

## Kérdések?

- Build hiba? Nézd meg a `BUILD.md` fájlt részletesebb útmutatáshoz
- Cross-platform buildelés? Használj GitHub Actions-t (lásd `.github/workflows/build.yml`)

