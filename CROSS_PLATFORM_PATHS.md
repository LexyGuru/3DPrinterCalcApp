# Cross-Platform Paths - Log és Backup Könyvtárak

## Áttekintés

A log és backup könyvtárak mindkettő ugyanazt a cross-platform Rust `dirs::data_local_dir()` crate-et használja, ami automatikusan kezeli a platform-specifikus útvonalakat.

## Platform-specifikus útvonalak

### Log könyvtár
- **macOS**: `~/Library/Application Support/3DPrinterCalcApp/logs/`
- **Windows**: `%LOCALAPPDATA%\3DPrinterCalcApp\logs\` (pl. `C:\Users\<username>\AppData\Local\3DPrinterCalcApp\logs\`)
- **Linux**: `~/.local/share/3DPrinterCalcApp/logs/`

### Backup könyvtár
- **macOS**: `~/Library/Application Support/3DPrinterCalcApp/backups/automatic/`
- **Windows**: `%LOCALAPPDATA%\3DPrinterCalcApp\backups\automatic\` (pl. `C:\Users\<username>\AppData\Local\3DPrinterCalcApp\backups\automatic\`)
- **Linux**: `~/.local/share/3DPrinterCalcApp/backups/automatic/`

## Implementáció

### Backend (Rust)

#### Log könyvtár
```rust
// src-tauri/src/commands.rs
pub fn get_log_directory_path() -> Result<String, String> {
    use dirs;
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    Ok(log_dir.to_string_lossy().to_string())
}
```

#### Backup könyvtár
```rust
// src-tauri/src/commands.rs
pub fn get_backup_directory_path() -> Result<String, String> {
    use dirs;
    
    let backup_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("backups")
        .join("automatic");
    
    Ok(backup_dir.to_string_lossy().to_string())
}
```

### Frontend (TypeScript)

#### Log könyvtár
```typescript
// frontend/src/utils/logHistory.ts
const logFiles = await invoke<[string, string][]>("list_log_files");
```

#### Backup könyvtár
```typescript
// frontend/src/utils/backup.ts
const backupDir = await invoke<string>("get_backup_directory_path");
```

## Előnyök

1. **Cross-platform kompatibilitás**: A `dirs::data_local_dir()` crate automatikusan kezeli a platform-specifikus útvonalakat
2. **Konzisztencia**: Mindkét könyvtár ugyanazt az alapútvonalat használja (`3DPrinterCalcApp/`)
3. **Nincs permissions probléma**: A backend Rust kód közvetlenül a fájlrendszerből olvassa a fájlokat, nem szükségesek Tauri permissions-ek
4. **Egyszerű karbantartás**: Minden útvonal kezelés a backend-ben történik

## Backend Commands

- `get_log_directory_path()` - Visszaadja a log könyvtár teljes útvonalát
- `get_backup_directory_path()` - Visszaadja a backup könyvtár teljes útvonalát
- `list_log_files()` - Visszaadja a log fájlok listáját (fileName, filePath) tuple-ökben

## Használat

### Log fájlok listázása
```typescript
import { getLogHistory } from "./utils/logHistory";

const logFiles = await getLogHistory();
// logFiles: [{ fileName: "frontend-2025-11-28.log", filePath: "...", date: Date, type: "frontend" | "backend" }]
```

### Backup könyvtár elérése
```typescript
import { invoke } from "@tauri-apps/api/core";

const backupDir = await invoke<string>("get_backup_directory_path");
// backupDir: "~/Library/Application Support/3DPrinterCalcApp/backups/automatic/" (macOS példa)
```

## Megjegyzések

- Mindkét könyvtár automatikusan létrejön, ha nem létezik
- A könyvtárak az alkalmazás platform-specifikus data directory-jában találhatók
- A `dirs::data_local_dir()` a Rust standard library része, amely biztosítja a cross-platform kompatibilitást
- A `list_backup_files()` command kompatibilitás miatt ellenőrzi a régi bundle ID könyvtárat is (csak macOS/Linux-on), de az új backup fájlok mindig az új helyre kerülnek

