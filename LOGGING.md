# Logolási Rendszer Dokumentáció

## Áttekintés

Az alkalmazás külön log fájlokat használ a frontend és backend logokhoz. Minden log fájl naponta rotálódik (egy fájl naponta).

## Log Fájlok Helye

A log fájlok helye platformonként eltérő:

### macOS
```
~/Library/Application Support/3DPrinterCalcApp/logs/
├── backend-2025-11-20.log
└── frontend-2025-11-20.log
```

### Windows
```
%LOCALAPPDATA%\3DPrinterCalcApp\logs\
C:\Users\<username>\AppData\Local\3DPrinterCalcApp\logs\
├── backend-2025-11-20.log
└── frontend-2025-11-20.log
```

### Linux
```
~/.local/share/3DPrinterCalcApp/logs/
├── backend-2025-11-20.log
└── frontend-2025-11-20.log
```

## Log Fájlok Típusai

### Backend Log (`backend-YYYY-MM-DD.log`)
- Rust backend logok
- Tauri command-ok logjai
- Platform specifikus inicializálások
- Formátum: `[YYYY-MM-DD HH:MM:SS.mmm] [LEVEL] message`

### Frontend Log (`frontend-YYYY-MM-DD.log`)
- React frontend logok
- Console.log, console.info, console.warn, console.error
- JavaScript hibák és unhandled promise rejections
- Formátum: `[YYYY-MM-DD HH:MM:SS.mmm] [LEVEL] message`

## Log Szintek

- **INFO**: Általános információ
- **WARN**: Figyelmeztetések
- **ERROR**: Hibák
- **DEBUG**: Debug információk (csak development módban)

## Automatikus Logolás

### Backend
- Minden `logger::log_info()`, `logger::log_warn()`, `logger::log_error()` hívás automatikusan fájlba íródik
- A log fájl automatikusan létrejön az alkalmazás indításakor

### Frontend
- Minden `console.log()`, `console.info()`, `console.warn()`, `console.error()` automatikusan fájlba íródik
- A log fájl automatikusan létrejön az App komponens betöltésekor

## Platform Kompatibilitás

✅ **macOS**: Teljesen támogatott  
✅ **Windows**: Teljesen támogatott  
✅ **Linux**: Teljesen támogatott  

A `dirs` crate platform-független útvonalak kezelését biztosítja.

## Hibakeresés

Ha a log fájlok nem jönnek létre:

1. Ellenőrizd, hogy a log könyvtár létezik-e
2. Ellenőrizd a fájl írási jogosultságokat
3. Nézd meg a konzol kimenetét (stdout/stderr) a hibaüzenetekért

## Log Fájlok Törlése

A log fájlok nem törlődnek automatikusan. Manuálisan törölheted őket, ha szükséges.

## Tauri Commands

- `init_frontend_log()` - Frontend log fájl inicializálása
- `write_frontend_log(level, message)` - Frontend log üzenet írása
- `get_frontend_log_path()` - Frontend log fájl útvonala
- `get_backend_log_path()` - Backend log fájl útvonala

