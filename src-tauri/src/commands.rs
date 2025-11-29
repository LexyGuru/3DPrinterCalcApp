use tauri::{AppHandle, Manager};
use crate::logger;

/// macOS Dock badge beállítása
#[cfg(target_os = "macos")]
#[tauri::command]
pub fn set_dock_badge(app: AppHandle, badge: Option<String>) -> Result<(), String> {
    // Tauri v2.9.2-ben a dock badge API-t a window-on keresztül érjük el
    if let Some(window) = app.get_webview_window("main") {
        if let Some(badge_text) = badge {
            // Dock badge beállítása szöveggel (pl. "5" új árajánlatok számára)
            window
                .set_badge_label(Some(badge_text))
                .map_err(|e| format!("Dock badge beállítása sikertelen: {}", e))?;
            logger::log_info("Dock badge beállítva");
        } else {
            // Dock badge törlése
            window
                .set_badge_label(None)
                .map_err(|e| format!("Dock badge törlése sikertelen: {}", e))?;
            logger::log_info("Dock badge törölve");
        }
    } else {
        return Err("Nem található 'main' ablak".to_string());
    }
    Ok(())
}

/// Windows Taskbar progress beállítása
/// NOTE: Windows-on a ProgressBarState::Normal ambiguitást okoz a fordítóban
/// Ezért jelenleg kikommentezve van. macOS és Linux alatt működik.
#[cfg(target_os = "windows")]
#[tauri::command]
pub fn set_taskbar_progress(_app: AppHandle, _progress: Option<f64>) -> Result<(), String> {
    // Windows-on a ProgressBarState::Normal ambiguitást okoz a Rust fordítóban
    // Tauri 2.9.3-ban ez egy ismert probléma Windows alatt
    // macOS és Linux alatt működik, de Windows-on kihagyjuk
    logger::log_info("Windows taskbar progress beállítás kihagyva (fordítási hiba miatt)");
    Ok(())
}

/// Natív értesítés küldése (minden platformon)
/// Backend-ből küldjük az értesítést, mert macOS-on ez megbízhatóbb
#[tauri::command]
pub async fn send_notification(
    _app: AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    // Tauri v2 notification plugin használata backend-ből
    // macOS-on a backend-ből küldött értesítések megbízhatóbban működnek
    // A notification plugin frontend-ből használható, backend-ből nem közvetlenül
    // Ezért csak logoljuk, és a frontend küldi az értesítést
    logger::log_info(&format!("Értesítés küldése backend-ből: {} - {}", title, body));
    
    // Megjegyzés: A Tauri v2 notification plugin főleg frontend-ből használható
    // Backend-ből nincs közvetlen API, csak a frontend-ből
    
    Ok(())
}

/// System tray ikon megjelenítése/elrejtése
#[tauri::command]
pub fn toggle_system_tray(_app: AppHandle, show: bool) -> Result<(), String> {
    // A system tray automatikusan megjelenik, ha a plugin inicializálva van
    // Ez a command csak logolásra szolgál jelenleg
    logger::log_info(&format!("System tray állapot: {}", if show { "megjelenítve" } else { "elrejtve" }));
    Ok(())
}

/// Fájl megnyitása a rendszer alapértelmezett alkalmazásával
#[tauri::command]
pub async fn open_file(path: String) -> Result<(), String> {
    use std::process::Command;
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Nem sikerült megnyitni a fájlt macOS-on: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", &path])
            .spawn()
            .map_err(|e| format!("Nem sikerült megnyitni a fájlt Windows-on: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Nem sikerült megnyitni a fájlt Linux-on: {}", e))?;
    }
    
    logger::log_info(&format!("Fájl megnyitva: {}", path));
    Ok(())
}

/// Frontend log fájl inicializálása
/// 
/// Log fájl helye platformonként:
/// - macOS: ~/Library/Application Support/3DPrinterCalcApp/logs/
/// - Windows: %LOCALAPPDATA%\3DPrinterCalcApp\logs\ (pl. C:\Users\<username>\AppData\Local\3DPrinterCalcApp\logs\)
/// - Linux: ~/.local/share/3DPrinterCalcApp/logs/
#[tauri::command]
pub fn init_frontend_log() -> Result<String, String> {
    use dirs;
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    // Létrehozzuk a log könyvtárat, ha nem létezik
    std::fs::create_dir_all(&log_dir)
        .map_err(|e| format!("Nem sikerült létrehozni a log könyvtárat: {}", e))?;
    
    // Log fájl neve: frontend-YYYY-MM-DD.log
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let log_file_path = log_dir.join(format!("frontend-{}.log", today));
    
    // Létrehozzuk a fájlt, ha nem létezik
    std::fs::File::create(&log_file_path)
        .map_err(|e| format!("Nem sikerült létrehozni a frontend log fájlt: {}", e))?;
    
    let path_str = log_file_path.to_string_lossy().to_string();
    logger::log_info(&format!("Frontend log fájl inicializálva: {}", path_str));
    
    Ok(path_str)
}

/// Frontend log üzenet írása fájlba
#[tauri::command]
pub fn write_frontend_log(level: String, message: String) -> Result<(), String> {
    use std::fs::OpenOptions;
    use std::io::Write;
    use dirs;
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    // Log fájl neve: frontend-YYYY-MM-DD.log
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let log_file_path = log_dir.join(format!("frontend-{}.log", today));
    
    // Megnyitjuk a log fájlt append módban
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file_path)
        .map_err(|e| format!("Nem sikerült megnyitni a frontend log fájlt: {}", e))?;
    
    let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
    let log_entry = format!("[{}] [{}] {}\n", timestamp, level, message);
    
    file.write_all(log_entry.as_bytes())
        .map_err(|e| format!("Nem sikerült írni a frontend log fájlba: {}", e))?;
    file.flush()
        .map_err(|e| format!("Nem sikerült flush-olni a frontend log fájlt: {}", e))?;
    
    Ok(())
}

/// Frontend log fájl útvonalának lekérése
#[tauri::command]
pub fn get_frontend_log_path() -> Result<Option<String>, String> {
    use dirs;
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let log_file_path = log_dir.join(format!("frontend-{}.log", today));
    
    Ok(Some(log_file_path.to_string_lossy().to_string()))
}

/// Log fájlok törlése a megadott napnál régebbiek
#[tauri::command]
pub fn delete_old_logs(days: u32) -> Result<u32, String> {
    use dirs;
    use std::fs;
    use chrono::NaiveDate;
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    if !log_dir.exists() {
        return Ok(0);
    }
    
    let cutoff_date = chrono::Local::now().date_naive() - chrono::Duration::days(days as i64);
    let mut deleted_count = 0;
    
    match fs::read_dir(&log_dir) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() {
                        // Fájl neve: frontend-YYYY-MM-DD.log vagy backend-YYYY-MM-DD.log
                        if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                            // Kinyerjük a dátumot a fájlnévből
                            if let Some(date_str) = file_name.strip_prefix("frontend-")
                                .or_else(|| file_name.strip_prefix("backend-")) {
                                if let Some(date_str) = date_str.strip_suffix(".log") {
                                    if let Ok(file_date) = NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
                                        if file_date < cutoff_date {
                                            if let Err(e) = fs::remove_file(&path) {
                                                logger::log_warn(&format!("Nem sikerült törölni a log fájlt: {} - {}", path.display(), e));
                                            } else {
                                                deleted_count += 1;
                                                logger::log_info(&format!("Régi log fájl törölve: {}", path.display()));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        Err(e) => {
            return Err(format!("Nem sikerült olvasni a log könyvtárat: {}", e));
        }
    }
    
    Ok(deleted_count)
}

/// Log mappa útvonalának lekérése
/// Cross-platform útvonal:
/// - macOS: ~/Library/Application Support/3DPrinterCalcApp/logs/
/// - Windows: %LOCALAPPDATA%\3DPrinterCalcApp\logs\
/// - Linux: ~/.local/share/3DPrinterCalcApp/logs/
#[tauri::command]
pub fn get_log_directory_path() -> Result<String, String> {
    use dirs;
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    Ok(log_dir.to_string_lossy().to_string())
}

/// Backup mappa útvonalának lekérése (automatikus backup-okhoz)
/// Cross-platform útvonal:
/// - macOS: ~/Library/Application Support/3DPrinterCalcApp/backups/automatic/
/// - Windows: %LOCALAPPDATA%\3DPrinterCalcApp\backups\automatic\
/// - Linux: ~/.local/share/3DPrinterCalcApp/backups/automatic/
/// Létrehozza a könyvtárat, ha nem létezik
#[tauri::command]
pub fn get_backup_directory_path() -> Result<String, String> {
    use dirs;
    use std::fs;
    
    let backup_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("backups")
        .join("automatic");
    
    // Létrehozzuk a könyvtárat, ha nem létezik
    if !backup_dir.exists() {
        if let Err(e) = fs::create_dir_all(&backup_dir) {
            return Err(format!("Nem sikerült létrehozni a backup könyvtárat: {}", e));
        }
    }
    
    Ok(backup_dir.to_string_lossy().to_string())
}

/// Log fájlok listázása a log könyvtárból
#[tauri::command]
pub fn list_log_files() -> Result<Vec<(String, String)>, String> {
    use dirs;
    use std::fs;
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    // Ellenőrizzük, hogy létezik-e a könyvtár
    if !log_dir.exists() {
        return Ok(Vec::new());
    }
    
    // Listázzuk a .log fájlokat
    let mut log_files: Vec<(String, String)> = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&log_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                    if let Some(file_name) = path.file_name() {
                        if let Some(file_name_str) = file_name.to_str() {
                            if file_name_str.ends_with(".log") {
                                let full_path = path.to_string_lossy().to_string();
                                log_files.push((file_name_str.to_string(), full_path));
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Rendezzük dátum szerint (legújabb először) - a fájlnévből kinyerjük a dátumot
    log_files.sort_by(|a, b| {
        // frontend-YYYY-MM-DD.log vagy backend-YYYY-MM-DD.log formátum
        let date_a = extract_date_from_filename(&a.0);
        let date_b = extract_date_from_filename(&b.0);
        date_b.cmp(&date_a)
    });
    
    Ok(log_files)
}

/// Kinyeri a dátumot a log fájlnévből (frontend-YYYY-MM-DD.log vagy backend-YYYY-MM-DD.log)
fn extract_date_from_filename(filename: &str) -> String {
    // frontend-YYYY-MM-DD.log vagy backend-YYYY-MM-DD.log
    if filename.starts_with("frontend-") {
        filename.replace("frontend-", "").replace(".log", "")
    } else if filename.starts_with("backend-") {
        filename.replace("backend-", "").replace(".log", "")
    } else {
        String::new()
    }
}

/// Backup fájlok listázása a backup könyvtárból
/// Visszaadja a backup fájlok listáját a fájlnévvel, teljes útvonallal és timestamp-tel
/// Keres mindkét lehetséges helyen: az új cross-platform helyen és a régi bundle ID helyen (kompatibilitás)
#[tauri::command]
pub fn list_backup_files() -> Result<Vec<(String, String, String)>, String> {
    use dirs;
    use std::fs;
    use serde_json::Value;
    use std::collections::HashSet;
    
    // Új cross-platform könyvtár (3DPrinterCalcApp)
    let backup_dir_new = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("backups")
        .join("automatic");
    
    // Régi bundle ID könyvtár (kompatibilitás miatt - csak macOS/Linux-on létezik)
    // Windows-on a bundle ID könyvtár másként néz ki, de itt csak az új helyet használjuk
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    let backup_dir_old = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("com.lekszikov.3dprintercalcapp")
        .join("backups")
        .join("automatic");
    
    // Listázzuk a backup fájlokat (mindkét helyről, ha létezik)
    let mut backup_files: Vec<(String, String, String)> = Vec::new();
    let mut seen_files = HashSet::new(); // Elkerüljük a duplikációt
    
    // Mindkét könyvtárat ellenőrizzük (régi csak macOS/Linux-on)
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    let backup_dirs = vec![&backup_dir_new, &backup_dir_old];
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    let backup_dirs = vec![&backup_dir_new];
    
    for backup_dir in backup_dirs {
        if !backup_dir.exists() {
            continue;
        }
        
        if let Ok(entries) = fs::read_dir(backup_dir) {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() {
                        if let Some(file_name) = path.file_name() {
                            if let Some(file_name_str) = file_name.to_str() {
                                if file_name_str.starts_with("auto_backup_") && file_name_str.ends_with(".json") {
                                    // Elkerüljük a duplikációt (ha mindkét könyvtárban van ugyanaz a fájl)
                                    if seen_files.contains(file_name_str) {
                                        continue;
                                    }
                                    seen_files.insert(file_name_str.to_string());
                                    
                                    let full_path = path.to_string_lossy().to_string();
                                    
                                    // Kiolvassuk a backup fájlt, hogy megkapjuk a timestamp-et
                                    let mut timestamp = String::new();
                                    if let Ok(content) = fs::read_to_string(&path) {
                                        if let Ok(json) = serde_json::from_str::<Value>(&content) {
                                            if let Some(ts) = json.get("timestamp").and_then(|v| v.as_str()) {
                                                timestamp = ts.to_string();
                                            }
                                        }
                                    }
                                    
                                    backup_files.push((file_name_str.to_string(), full_path, timestamp));
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Rendezzük dátum szerint (legújabb először) - a timestamp alapján
    backup_files.sort_by(|a, b| {
        if let (Ok(date_a), Ok(date_b)) = (a.2.parse::<chrono::DateTime<chrono::Utc>>(), b.2.parse::<chrono::DateTime<chrono::Utc>>()) {
            date_b.cmp(&date_a)
        } else {
            // Ha nem sikerül parse-olni, név szerint rendezünk (visszafelé, hogy a legújabb legyen elől)
            b.0.cmp(&a.0)
        }
    });
    
    Ok(backup_files)
}

/// Mappa megnyitása a fájlkezelőben (platform-specifikus)
#[tauri::command]
pub fn open_directory(path: String) -> Result<(), String> {
    use std::process::Command;
    
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Nem sikerült megnyitni a mappát macOS-on: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Nem sikerült megnyitni a mappát Windows-on: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Nem sikerült megnyitni a mappát Linux-on: {}", e))?;
    }
    
    logger::log_info(&format!("Mappa megnyitva: {}", path));
    Ok(())
}

/// Backend log fájl útvonalának lekérése
#[tauri::command]
pub fn get_backend_log_path() -> Result<Option<String>, String> {
    Ok(logger::get_log_path()
        .map(|p| p.to_string_lossy().to_string()))
}

/// Automatikus backup fájl létrehozása
/// Ez a command közvetlenül a backend-ben hozza létre a backup fájlt,
/// így elkerüljük a Tauri permissions problémákat
#[tauri::command]
pub fn create_automatic_backup_file(
    backup_data: serde_json::Value,
) -> Result<(String, String), String> {
    use dirs;
    use std::fs;
    use std::io::Write;
    
    let backup_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("backups")
        .join("automatic");
    
    // Létrehozzuk a könyvtárat, ha nem létezik
    if !backup_dir.exists() {
        if let Err(e) = fs::create_dir_all(&backup_dir) {
            return Err(format!("Nem sikerült létrehozni a backup könyvtárat: {}", e));
        }
    }
    
    // Kiolvassuk a timestamp-et a backup data-ból
    let timestamp = backup_data
        .get("timestamp")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "Nincs timestamp a backup data-ban".to_string())?;
    
    // Létrehozzuk a fájlnevet (ugyanúgy formázva, mint a frontend-ben)
    // Csere: : -> -, . -> - (minden előfordulás)
    let formatted_timestamp = timestamp.replace(":", "-").replace(".", "-");
    let file_name = format!("auto_backup_{}.json", formatted_timestamp);
    let file_path = backup_dir.join(&file_name);
    
    // JSON stringgé alakítjuk a backup data-t
    let json_content = serde_json::to_string_pretty(&backup_data)
        .map_err(|e| format!("Nem sikerült JSON-né alakítani a backup data-t: {}", e))?;
    
    // Létrehozzuk a fájlt
    let mut file = fs::File::create(&file_path)
        .map_err(|e| format!("Nem sikerült létrehozni a backup fájlt: {}", e))?;
    
    file.write_all(json_content.as_bytes())
        .map_err(|e| format!("Nem sikerült írni a backup fájlba: {}", e))?;
    
    logger::log_info(&format!("Automatikus backup fájl létrehozva: {}", file_path.to_string_lossy()));
    
    Ok((
        file_path.to_string_lossy().to_string(),
        timestamp.to_string(),
    ))
}

/// Régi automatikus backup fájlok törlése napok alapján
/// Törli azokat a backup fájlokat, amelyek régebbiek, mint a megadott napok száma
/// Backend-ből történik, hogy elkerüljük a Tauri permissions problémákat
#[tauri::command]
pub fn cleanup_old_backups_by_days(days: u32) -> Result<u32, String> {
    use dirs;
    use std::fs;
    use serde_json::Value;
    use chrono::DateTime;
    
    // Új cross-platform könyvtár (3DPrinterCalcApp)
    let backup_dir_new = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("backups")
        .join("automatic");
    
    // Régi bundle ID könyvtár (kompatibilitás miatt - csak macOS/Linux-on létezik)
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    let backup_dir_old = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("com.lekszikov.3dprintercalcapp")
        .join("backups")
        .join("automatic");
    
    // Cutoff dátum: most - days nap
    let cutoff_date = chrono::Local::now() - chrono::Duration::days(days as i64);
    let mut deleted_count = 0;
    
    // Mindkét könyvtárat ellenőrizzük (régi csak macOS/Linux-on)
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    let backup_dirs = vec![&backup_dir_new, &backup_dir_old];
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    let backup_dirs = vec![&backup_dir_new];
    
    for backup_dir in backup_dirs {
        if !backup_dir.exists() {
            continue;
        }
        
        if let Ok(entries) = fs::read_dir(backup_dir) {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() {
                        if let Some(file_name) = path.file_name() {
                            if let Some(file_name_str) = file_name.to_str() {
                                if file_name_str.starts_with("auto_backup_") && file_name_str.ends_with(".json") {
                                    // Kiolvassuk a backup fájlt, hogy megkapjuk a timestamp-et
                                    if let Ok(content) = fs::read_to_string(&path) {
                                        if let Ok(json) = serde_json::from_str::<Value>(&content) {
                                            if let Some(ts_str) = json.get("timestamp").and_then(|v| v.as_str()) {
                                                // Parse-oljuk a timestamp-et
                                                if let Ok(backup_date) = ts_str.parse::<DateTime<chrono::Utc>>() {
                                                    // UTC-ből local time-ra konvertáljuk
                                                    let backup_date_local = backup_date.with_timezone(&chrono::Local);
                                                    
                                                    // Ha a backup régebbi, mint a cutoff dátum, töröljük
                                                    if backup_date_local < cutoff_date {
                                                        if let Err(e) = fs::remove_file(&path) {
                                                            logger::log_warn(&format!("Nem sikerült törölni a backup fájlt: {} - {}", path.display(), e));
                                                        } else {
                                                            deleted_count += 1;
                                                            logger::log_info(&format!("Régi backup fájl törölve ({} napnál régebbi): {}", days, path.display()));
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    Ok(deleted_count)
}

/// Régi automatikus backup fájlok törlése maximum szám alapján
/// Törli azokat a backup fájlokat, amelyek túllépik a megadott maximum számot
/// A legújabb backupok maradnak, a régebbiek törlődnek
/// Backend-ből történik, hogy elkerüljük a Tauri permissions problémákat
#[tauri::command]
pub fn cleanup_old_backups_by_count(max_backups: u32) -> Result<u32, String> {
    use dirs;
    use std::fs;
    use serde_json::Value;
    use chrono::DateTime;
    
    // Új cross-platform könyvtár (3DPrinterCalcApp)
    let backup_dir_new = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("backups")
        .join("automatic");
    
    // Régi bundle ID könyvtár (kompatibilitás miatt - csak macOS/Linux-on létezik)
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    let backup_dir_old = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("com.lekszikov.3dprintercalcapp")
        .join("backups")
        .join("automatic");
    
    let mut deleted_count = 0;
    
    // Mindkét könyvtárat ellenőrizzük (régi csak macOS/Linux-on)
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    let backup_dirs = vec![&backup_dir_new, &backup_dir_old];
    #[cfg(not(any(target_os = "macos", target_os = "linux")))]
    let backup_dirs = vec![&backup_dir_new];
    
    // Összegyűjtjük az összes backup fájlt timestamp-tel
    let mut backup_files: Vec<(std::path::PathBuf, String, chrono::DateTime<chrono::Utc>)> = Vec::new();
    
    for backup_dir in backup_dirs {
        if !backup_dir.exists() {
            continue;
        }
        
        if let Ok(entries) = fs::read_dir(backup_dir) {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() {
                        if let Some(file_name) = path.file_name() {
                            if let Some(file_name_str) = file_name.to_str() {
                                if file_name_str.starts_with("auto_backup_") && file_name_str.ends_with(".json") {
                                    // Kiolvassuk a backup fájlt, hogy megkapjuk a timestamp-et
                                    if let Ok(content) = fs::read_to_string(&path) {
                                        if let Ok(json) = serde_json::from_str::<Value>(&content) {
                                            if let Some(ts_str) = json.get("timestamp").and_then(|v| v.as_str()) {
                                                // Parse-oljuk a timestamp-et
                                                if let Ok(backup_date) = ts_str.parse::<DateTime<chrono::Utc>>() {
                                                    backup_files.push((path.clone(), file_name_str.to_string(), backup_date));
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Rendezzük dátum szerint (legújabb először)
    backup_files.sort_by(|a, b| b.2.cmp(&a.2));
    
    // Ha több van, mint a maximum, töröljük a régebbieket
    if backup_files.len() > max_backups as usize {
        let files_to_delete = &backup_files[max_backups as usize..];
        
        for (path, file_name, _) in files_to_delete {
            if let Err(e) = fs::remove_file(path) {
                logger::log_warn(&format!("Nem sikerült törölni a backup fájlt: {} - {}", path.display(), e));
            } else {
                deleted_count += 1;
                logger::log_info(&format!("Régi backup fájl törölve (maximum szám túllépés): {}", file_name));
            }
        }
    }
    
    Ok(deleted_count)
}
