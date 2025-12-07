# 🖥️ Platform Funkciók és Lehetséges Hibák - 3DPrinterCalcApp

## 📋 Tartalomjegyzék

1. [Általános Funkciók](#általános-funkciók)
2. [macOS Specifikus Funkciók](#macos-specifikus-funkciók)
3. [Linux Specifikus Funkciók](#linux-specifikus-funkciók)
4. [Windows Specifikus Funkciók](#windows-specifikus-funkciók)
5. [Platform-Független Funkciók](#platform-független-funkciók)
6. [Lehetséges Hibák és Megoldások](#lehetséges-hibák-és-megoldások)

---

## 🎯 Általános Funkciók

### Minden platformon elérhető funkciók:

#### 📊 **Dashboard és Statisztikák**
- ✅ Widget rendszer (12+ widget típus)
- ✅ Időszak összehasonlítás (hét/hónap/év)
- ✅ Statisztikai kártyák (filament, bevétel, áram, költség, profit, nyomtatási idő)
- ✅ Trend grafikonok (pénzügyi trendek, filament megoszlás, nyomtató szerinti bevétel)
- ✅ Widget exportálás (SVG, PNG, PDF)
- ✅ Widget drag & drop átrendezés
- ✅ Widget méretezés (S/M/L)
- ✅ Widget csoportosítás

#### 🧵 **Filament Kezelés**
- ✅ Filament könyvtár (12,000+ gyári szín)
- ✅ Egyedi filamentek hozzáadása/szerkesztése
- ✅ CSV import/export
- ✅ Filament színkönyvtár böngészése
- ✅ Multicolor filament támogatás
- ✅ Duplikátum detektálás

#### 🖨️ **Nyomtató Kezelés**
- ✅ Nyomtatók hozzáadása/szerkesztése
- ✅ AMS rendszer támogatás (0-4 slot)
- ✅ Áramfogyasztás beállítás
- ✅ Használati költség számítás

#### 💰 **Kalkulátor**
- ✅ Költségszámítás (filament, áram, szárítás, kopás)
- ✅ Profit százalék beállítás (10-50%)
- ✅ Template mentés/betöltés
- ✅ G-code import (Prusa, Cura, Orca, Qidi)
- ✅ Piszkozat generálás

#### 📄 **Árajánlatok**
- ✅ Árajánlat létrehozása/szerkesztése
- ✅ Verziózás és előzmények
- ✅ Státusz kezelés (piszkozat, elküldve, elfogadva, elutasítva, kész)
- ✅ PDF export (3 sablon: modern, minimal, professional)
- ✅ Ügyfél adatok kezelése

#### 📅 **Naptár**
- ✅ Esedékességi dátumok
- ✅ Naptár nézet
- ✅ Státusz jelzések
- ✅ Esedékes nyomtatások listája
- ✅ iOS Calendar export (macOS)

#### 👥 **Ügyfél Adatbázis**
- ✅ Ügyfelek kezelése
- ✅ Kapcsolattartási adatok
- ✅ Cégadatok
- ✅ Árajánlat statisztikák

#### 📈 **Ár Előzmények**
- ✅ Filament ár változások követése
- ✅ Grafikonok és statisztikák
- ✅ Trend elemzés

#### ⚙️ **Beállítások**
- ✅ 15+ téma (Light, Dark, Blue, Green, Purple, stb.)
- ✅ Custom téma szerkesztő
- ✅ Animáció beállítások
- ✅ 13 nyelv támogatás (HU, EN, DE, FR, ES, IT, PL, CS, SK, PT, RU, UK, ZH)
- ✅ 9 pénznem támogatás (EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB)
- ✅ Backup/Restore
- ✅ Adat import/export
- ✅ Auto-save (30 másodperc)

#### 🔔 **Értesítések**
- ✅ Natív értesítések (minden platformon)
- ✅ Exportálás értesítések
- ✅ Mentés értesítések
- ✅ Árajánlat státusz változás értesítések

#### 📝 **Logolás**
- ✅ Frontend log fájlok
- ✅ Backend log fájlok
- ✅ Console modul
- ✅ Log fájlok törlése (régi logok)

#### 🔄 **Frissítések**
- ✅ Automatikus verzió ellenőrzés
- ✅ Beta verzió támogatás
- ✅ GitHub Releases integráció

---

## 🍎 macOS Specifikus Funkciók

### Elérhető funkciók:

#### ✅ **Dock Badge**
- **Funkció**: Dock ikon badge beállítása (pl. "5" új árajánlatok számára)
- **Helye**: `src-tauri/src/commands.rs` - `set_dock_badge()`
- **Frontend**: `frontend/src/utils/platformFeatures.ts` - `setDockBadge()`
- **Használat**: Automatikusan beállítódik új árajánlatok esetén

#### ✅ **Notification Center Integráció**
- **Funkció**: Natív macOS értesítések Notification Center-ben
- **Engedély**: macOS 10.13+ szükséges, felhasználói engedély szükséges
- **Helye**: `frontend/src/utils/platformFeatures.ts` - `sendNativeNotification()`
- **Megjegyzés**: macOS-on az értesítések csak akkor jelennek meg, ha az alkalmazás az Értesítések beállításokban engedélyezve van

#### ✅ **iOS Calendar Export**
- **Funkció**: Árajánlatok exportálása iOS Calendar formátumban (.ics)
- **Helye**: `frontend/src/components/Calendar.tsx`
- **Használat**: Naptár modulban "Export to iOS Calendar" gomb

#### ✅ **macOS Private API**
- **Funkció**: macOS privát API-k használata (Dock badge, stb.)
- **Konfiguráció**: `src-tauri/tauri.conf.json` - `macOSPrivateApi: true`

#### ✅ **Fájl Megnyitás**
- **Funkció**: Fájlok megnyitása macOS `open` paranccsal
- **Helye**: `src-tauri/src/commands.rs` - `open_file()`
- **Használat**: Log fájlok, exportált fájlok megnyitása

#### ✅ **Mappa Megnyitás**
- **Funkció**: Mappák megnyitása Finder-ben
- **Helye**: `src-tauri/src/commands.rs` - `open_directory()`
- **Használat**: Log mappa megnyitása Settings-ben

### Lehetséges hibák macOS-on:

#### ⚠️ **Gatekeeper Figyelmeztetés**
- **Probléma**: "3DPrinterCalcApp sérült és nem nyitható meg"
- **Ok**: Az alkalmazás nincs code signing-al aláírva
- **Megoldás**:
  1. Jobb klikk → "Megnyitás" (Open)
  2. Terminal: `xattr -cr /path/to/3DPrinterCalcApp.app`
  3. System Preferences → Security & Privacy → "Megnyitás engedélyezése"

#### ⚠️ **Értesítési Engedély**
- **Probléma**: Értesítések nem jelennek meg
- **Ok**: Az alkalmazás nincs engedélyezve az Értesítések beállításokban
- **Megoldás**:
  1. System Preferences → Notifications
  2. Keress rá "3DPrinterCalcApp"-ra
  3. Engedélyezd az értesítéseket
  4. Vagy az alkalmazásban: Settings → Értesítések → "Engedély kérése" gomb

#### ⚠️ **Dock Badge Nem Működik**
- **Probléma**: Dock badge nem jelenik meg
- **Ok**: macOS verzió < 10.13 vagy API hiba
- **Megoldás**: Ellenőrizd a Console logokat, minimum macOS 10.13 szükséges

#### ⚠️ **Fájl Megnyitás Hiba**
- **Probléma**: Fájlok nem nyílnak meg
- **Ok**: `open` parancs nem elérhető vagy jogosultság hiba
- **Megoldás**: Ellenőrizd a log fájlokat, próbáld meg manuálisan megnyitni

---

## 🐧 Linux Specifikus Funkciók

### Elérhető funkciók:

#### ✅ **AppIndicator/System Tray**
- **Funkció**: System tray ikon megjelenítése
- **Helye**: `src-tauri/src/main.rs` - Tauri plugin inicializálás
- **Függőség**: `libayatana-appindicator3-dev` (Ubuntu/Debian)
- **Megjegyzés**: Automatikusan megjelenik, ha a plugin inicializálva van

#### ✅ **Desktop Notifications**
- **Funkció**: Natív Linux értesítések (DBus)
- **Helye**: `frontend/src/utils/platformFeatures.ts` - `sendNativeNotification()`
- **Megjegyzés**: Linux-on általában működik engedély nélkül is

#### ✅ **Fájl Megnyitás**
- **Funkció**: Fájlok megnyitása `xdg-open` paranccsal
- **Helye**: `src-tauri/src/commands.rs` - `open_file()`
- **Használat**: Log fájlok, exportált fájlok megnyitása

#### ✅ **Mappa Megnyitás**
- **Funkció**: Mappák megnyitása fájlkezelőben
- **Helye**: `src-tauri/src/commands.rs` - `open_directory()`
- **Használat**: Log mappa megnyitása Settings-ben

### Lehetséges hibák Linux-on:

#### ⚠️ **System Tray Nem Működik**
- **Probléma**: System tray ikon nem jelenik meg
- **Ok**: Hiányzó függőségek vagy desktop environment nem támogatja
- **Megoldás**:
  ```bash
  sudo apt-get install libayatana-appindicator3-dev
  # vagy
  sudo apt-get install libappindicator3-dev
  ```

#### ⚠️ **Értesítések Nem Működnek**
- **Probléma**: Értesítések nem jelennek meg
- **Ok**: DBus nem elérhető vagy notification daemon nincs futva
- **Megoldás**: Ellenőrizd, hogy fut-e a notification daemon (pl. `notify-send test`)

#### ⚠️ **Fájl Megnyitás Hiba**
- **Probléma**: Fájlok nem nyílnak meg
- **Ok**: `xdg-open` nincs telepítve vagy nem elérhető
- **Megoldás**: 
  ```bash
  sudo apt-get install xdg-utils
  ```

#### ⚠️ **WebKit2GTK Hiányzik**
- **Probléma**: Alkalmazás nem indul el
- **Ok**: Hiányzó WebKit2GTK függőségek
- **Megoldás**:
  ```bash
  sudo apt-get install libwebkit2gtk-4.1-dev
  ```

#### ⚠️ **GTK3 Hiányzik**
- **Probléma**: Alkalmazás nem indul el
- **Ok**: Hiányzó GTK3 függőségek
- **Megoldás**:
  ```bash
  sudo apt-get install libgtk-3-dev
  ```

#### ⚠️ **Desktop Environment Specifikus Problémák**
- **Probléma**: Bizonyos funkciók nem működnek bizonyos DE-kben
- **Ok**: Különböző desktop environment-ek különböző API-kat használnak
- **Megoldás**: 
  - GNOME: Általában jól működik
  - KDE: Lehet, hogy szükséges további csomagok
  - XFCE: Lehet, hogy korlátozott funkciók

---

## 🪟 Windows Specifikus Funkciók

### Elérhető funkciók:

#### ✅ **Windows Notifications**
- **Funkció**: Natív Windows értesítések (Action Center)
- **Helye**: `frontend/src/utils/platformFeatures.ts` - `sendNativeNotification()`
- **Megjegyzés**: Windows 10+ támogatja, általában működik engedély nélkül is

#### ⚠️ **Taskbar Progress (Jelenleg Nem Aktív)**
- **Funkció**: Taskbar progress bar beállítása
- **Helye**: `src-tauri/src/commands.rs` - `set_taskbar_progress()`
- **Státusz**: **KIKOMMENTEZVE** - Rust fordítási hiba miatt (Tauri 2.9.3 ismert probléma)
- **Megjegyzés**: macOS és Linux alatt működik, Windows-on jelenleg nem

#### ✅ **Fájl Megnyitás**
- **Funkció**: Fájlok megnyitása Windows `cmd /C start` paranccsal
- **Helye**: `src-tauri/src/commands.rs` - `open_file()`
- **Használat**: Log fájlok, exportált fájlok megnyitása

#### ✅ **Mappa Megnyitás**
- **Funkció**: Mappák megnyitása Explorer-ben
- **Helye**: `src-tauri/src/commands.rs` - `open_directory()`
- **Használat**: Log mappa megnyitása Settings-ben

### Lehetséges hibák Windows-on:

#### ⚠️ **Értesítések Nem Működnek**
- **Probléma**: Értesítések nem jelennek meg
- **Ok**: Windows verzió < 10 vagy Action Center le van tiltva
- **Megoldás**: 
  1. Windows 10+ szükséges
  2. Action Center engedélyezése: Settings → System → Notifications

#### ⚠️ **Taskbar Progress Nem Működik**
- **Probléma**: Taskbar progress bar nem jelenik meg
- **Ok**: Jelenleg kikommentezve fordítási hiba miatt
- **Megoldás**: Várható javítás Tauri következő verziójában

#### ⚠️ **Fájl Megnyitás Hiba**
- **Probléma**: Fájlok nem nyílnak meg
- **Ok**: `cmd` parancs nem elérhető vagy jogosultság hiba
- **Megoldás**: Ellenőrizd a log fájlokat, próbáld meg manuálisan megnyitni

#### ⚠️ **Visual Studio Build Tools Hiányzik**
- **Probléma**: Alkalmazás nem buildelhető
- **Ok**: Hiányzó C++ build tools
- **Megoldás**: 
  1. Visual Studio Build Tools telepítése
  2. C++ build tools komponens kiválasztása
  3. Windows SDK telepítése

#### ⚠️ **Windows Defender Blokkolja**
- **Probléma**: Alkalmazás nem indul el vagy törlődik
- **Ok**: Windows Defender false positive
- **Megoldás**: 
  1. Windows Defender → Virus & threat protection
  2. Exclusion hozzáadása az alkalmazás mappájához
  3. Vagy "Allow on device" gomb

#### ⚠️ **Windows Subsystem Hiba**
- **Probléma**: Console ablak megjelenik release build-ben
- **Ok**: `windows_subsystem = "windows"` nincs beállítva
- **Megoldás**: Ellenőrizd `src-tauri/src/main.rs` első sorát

---

## 🌐 Platform-Független Funkciók

### Minden platformon működő funkciók:

#### ✅ **Tauri Plugins**
- `tauri-plugin-store` - Adat tárolás
- `tauri-plugin-dialog` - File/confirm dialógusok
- `tauri-plugin-fs` - Fájl műveletek
- `tauri-plugin-shell` - Shell parancsok
- `tauri-plugin-notification` - Értesítések

#### ✅ **Keyboard Shortcuts**
- **macOS**: `Cmd` (meta) billentyű
- **Windows/Linux**: `Ctrl` billentyű
- **Cross-platform**: Automatikus detektálás és konverzió

#### ✅ **File Operations**
- Fájl olvasás/írás
- Mappa műveletek
- Log fájlok kezelése
- Backup/Restore

#### ✅ **Data Storage**
- Tauri store (JSON)
- Filament library (JSON)
- Settings (JSON)
- Log fájlok (szöveges)

---

## 🐛 Lehetséges Hibák és Megoldások

### Általános Hibák:

#### ⚠️ **Alkalmazás Nem Indul El**
- **Ok**: Hiányzó függőségek vagy build hiba
- **Megoldás**:
  - macOS: `xcode-select --install`
  - Linux: Telepítsd a szükséges csomagokat (lásd BUILD.md)
  - Windows: Visual Studio Build Tools telepítése

#### ⚠️ **Adatok Nem Mentődnek**
- **Ok**: Írási jogosultság hiánya vagy fájl zárolás
- **Megoldás**: 
  - Ellenőrizd a log fájlokat
  - Ellenőrizd az AppConfig mappa jogosultságait
  - Próbáld meg újraindítani az alkalmazást

#### ⚠️ **Widgetek Nem Működnek**
- **Ok**: Layout inicializálási hiba vagy state probléma
- **Megoldás**: 
  - Console logok ellenőrzése
  - Widget managerben rejtett widgetek ellenőrzése
  - Layout reset (Settings → Adatkezelés → Reset)

#### ⚠️ **Értesítések Nem Működnek**
- **Ok**: Platform-specifikus engedély hiánya
- **Megoldás**: 
  - macOS: System Preferences → Notifications
  - Windows: Settings → System → Notifications
  - Linux: Ellenőrizd a notification daemon-t

#### ⚠️ **Export Nem Működik**
- **Ok**: Fájl írási jogosultság hiánya vagy plugin hiba
- **Megoldás**: 
  - Ellenőrizd a célmappa jogosultságait
  - Próbáld meg másik mappába exportálni
  - Console logok ellenőrzése

#### ⚠️ **Nyelv Változtatás Nem Működik**
- **Ok**: Translation fájl hiány vagy cache probléma
- **Megoldás**: 
  - Alkalmazás újraindítása
  - Browser cache törlése (dev mode)
  - Translation fájlok ellenőrzése

#### ⚠️ **Téma Változtatás Nem Működik**
- **Ok**: CSS betöltési hiba vagy state probléma
- **Megoldás**: 
  - Alkalmazás újraindítása
  - Custom téma ellenőrzése
  - Settings → Témák → Reset

#### ⚠️ **PDF Export Hiba**
- **Ok**: html2canvas vagy PDF generálási hiba
- **Megoldás**: 
  - Próbáld meg SVG exportot
  - Console logok ellenőrzése
  - Másik PDF sablon próbálása

#### ⚠️ **G-code Import Hiba**
- **Ok**: Fájl formátum hiba vagy parser hiba
- **Megoldás**: 
  - Fájl formátum ellenőrzése
  - Támogatott formátumok: Prusa, Cura, Orca, Qidi
  - Console logok ellenőrzése

#### ⚠️ **Filament Library Betöltési Hiba**
- **Ok**: Fájl hiány vagy JSON parse hiba
- **Megoldás**: 
  - `filamentLibrary.json` fájl ellenőrzése
  - Backup fájl visszaállítása
  - Új library generálása

#### ⚠️ **Auto-save Nem Működik**
- **Ok**: Debounce timeout vagy state probléma
- **Megoldás**: 
  - Settings → Auto-save beállítások ellenőrzése
  - Manuális mentés próbálása
  - Console logok ellenőrzése

### Platform-Specifikus Hibák:

#### 🍎 **macOS**
- Gatekeeper figyelmeztetés → Jobb klikk → Megnyitás
- Értesítési engedély → System Preferences → Notifications
- Dock badge nem működik → macOS 10.13+ szükséges

#### 🐧 **Linux**
- System tray nem működik → `libayatana-appindicator3-dev` telepítése
- Értesítések nem működnek → Notification daemon ellenőrzése
- Fájl megnyitás hiba → `xdg-utils` telepítése

#### 🪟 **Windows**
- Értesítések nem működnek → Windows 10+ és Action Center engedélyezése
- Taskbar progress nem működik → Jelenleg nem támogatott (Tauri hiba)
- Windows Defender blokkolja → Exclusion hozzáadása

---

## 📝 Log Fájlok Helye

### Platform-specifikus log mappák:

- **macOS**: `~/Library/Application Support/3DPrinterCalcApp/logs/`
- **Windows**: `%LOCALAPPDATA%\3DPrinterCalcApp\logs\` (pl. `C:\Users\<username>\AppData\Local\3DPrinterCalcApp\logs\`)
- **Linux**: `~/.local/share/3DPrinterCalcApp/logs/`

### Log fájlok:

- `frontend-YYYY-MM-DD.log` - Frontend logok
- `backend-YYYY-MM-DD.log` - Backend logok

### Log megnyitása:

- Settings → Console → "Log mappa megnyitása" gomb
- Vagy manuálisan a fenti mappákban

---

## 🔧 Debugging Tippek

1. **Console logok ellenőrzése**: Settings → Console modul
2. **Log fájlok ellenőrzése**: Log mappa megnyitása
3. **Browser DevTools**: Dev mode-ban F12 vagy Cmd/Ctrl+Shift+I
4. **Tauri DevTools**: Dev mode-ban automatikusan elérhető
5. **Network requests**: Browser DevTools → Network tab
6. **State debugging**: React DevTools (ha telepítve van)

---

## 📚 További Dokumentáció

- [BUILD.md](BUILD.md) - Build útmutató
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Részletes build útmutató
- [VERSIONING.md](VERSIONING.md) - Verziókezelés
- [README.md](README.md) - Fő README fájl

---

**Utolsó frissítés**: 2025. január (v1.4.33)

