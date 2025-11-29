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
    
    // Létrehozzuk a fájlt, ha nem létezik (nem töröljük a meglévő tartalmat)
    // Ha a fájl már létezik, csak megerősítjük, hogy elérhető, de nem töröljük
    use std::fs::OpenOptions;
    OpenOptions::new()
        .create(true)
        .append(true) // Hozzáfűzés módban nyitjuk meg
        .open(&log_file_path)
        .map_err(|e| format!("Nem sikerült megnyitni vagy létrehozni a frontend log fájlt: {}", e))?;
    
    let path_str = log_file_path.to_string_lossy().to_string();
    logger::log_info(&format!("Frontend log fájl inicializálva: {}", path_str));
    
    Ok(path_str)
}

/// Frontend log üzenet írása fájlba
/// Frontend log írása - támogatja a szöveges és JSON formátumot is
#[tauri::command]
pub fn write_frontend_log(level: String, message: String, format: Option<String>) -> Result<(), String> {
    use std::fs::OpenOptions;
    use std::io::Write;
    use dirs;
    use serde_json;
    
    let log_format = format.as_deref().unwrap_or("text"); // Alapértelmezett: text
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    // Log fájl neve: frontend-YYYY-MM-DD.log vagy frontend-YYYY-MM-DD.json
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let extension = if log_format == "json" { "json" } else { "log" };
    let log_file_path = log_dir.join(format!("frontend-{}.{}", today, extension));
    
    // Megnyitjuk a log fájlt append módban
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file_path)
        .map_err(|e| format!("Nem sikerült megnyitni a frontend log fájlt: {}", e))?;
    
    if log_format == "json" {
        // JSON formátum: várunk egy JSON objektumot az üzenetben
        // Ha az üzenet nem érvényes JSON, akkor strukturált formátumban írjuk
        match serde_json::from_str::<serde_json::Value>(&message) {
            Ok(json_value) => {
                // Hozzáadjuk a timestamp-et, ha nincs benne
                let mut log_entry = json_value.as_object().cloned().unwrap_or_default();
                
                // Timestamp hozzáadása/frissítése
                let timestamp = chrono::Local::now().to_rfc3339();
                log_entry.insert("timestamp".to_string(), serde_json::Value::String(timestamp));
                
                // Level hozzáadása/frissítése, ha nincs benne
                if !log_entry.contains_key("level") {
                    log_entry.insert("level".to_string(), serde_json::Value::String(level.clone()));
                }
                
                // Írjuk a JSON objektumot egy sorban (newline-delimited JSON)
                let json_line = serde_json::to_string(&log_entry)
                    .map_err(|e| format!("Nem sikerült JSON formátumra alakítani: {}", e))?;
                file.write_all(json_line.as_bytes())
                    .map_err(|e| format!("Nem sikerült írni a frontend log fájlba: {}", e))?;
                file.write_all(b"\n")
                    .map_err(|e| format!("Nem sikerült írni a newline-t: {}", e))?;
            }
            Err(_) => {
                // Ha nem érvényes JSON, strukturált formátumban írjuk
                let timestamp = chrono::Local::now().to_rfc3339();
                let structured_entry = serde_json::json!({
                    "timestamp": timestamp,
                    "level": level,
                    "message": message
                });
                let json_line = serde_json::to_string(&structured_entry)
                    .map_err(|e| format!("Nem sikerült JSON formátumra alakítani: {}", e))?;
                file.write_all(json_line.as_bytes())
                    .map_err(|e| format!("Nem sikerült írni a frontend log fájlba: {}", e))?;
                file.write_all(b"\n")
                    .map_err(|e| format!("Nem sikerült írni a newline-t: {}", e))?;
            }
        }
    } else {
        // Szöveges formátum (régi módszer, visszafelé kompatibilitás)
        let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
        
        // Ha a message több soros, akkor minden sort külön log bejegyzésként írunk
        let lines: Vec<&str> = message.lines().collect();
        
        if lines.len() > 1 {
            // Több soros üzenet: minden sor külön log bejegyzés, de ugyanazzal a timestamp-tel
            for line in lines {
                if !line.trim().is_empty() {
                    let log_entry = format!("[{}] [{}] {}\n", timestamp, level, line);
                    file.write_all(log_entry.as_bytes())
                        .map_err(|e| format!("Nem sikerült írni a frontend log fájlba: {}", e))?;
                }
            }
        } else {
            // Egy soros üzenet: normál log bejegyzés
            let log_entry = format!("[{}] [{}] {}\n", timestamp, level, message);
            file.write_all(log_entry.as_bytes())
                .map_err(|e| format!("Nem sikerült írni a frontend log fájlba: {}", e))?;
        }
    }
    
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
                        // Fájl neve: frontend-YYYY-MM-DD.log, backend-YYYY-MM-DD.log, frontend-YYYY-MM-DD.json, backend-YYYY-MM-DD.json
                        if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                            // Kinyerjük a dátumot a fájlnévből (mindkét formátumra: .log és .json)
                            if let Some(date_str) = file_name.strip_prefix("frontend-")
                                .or_else(|| file_name.strip_prefix("backend-")) {
                                // Kezeljük mindkét kiterjesztést
                                let date_str = date_str.strip_suffix(".log")
                                    .or_else(|| date_str.strip_suffix(".json"));
                                if let Some(date_str) = date_str {
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

/// Összes log fájl törlése (Factory Reset-hez)
#[tauri::command]
pub fn delete_all_logs() -> Result<u32, String> {
    use dirs;
    use std::fs;
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    if !log_dir.exists() {
        return Ok(0);
    }
    
    let mut deleted_count = 0;
    
    match fs::read_dir(&log_dir) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() {
                        // Töröljük minden .log és .json fájlt
                        if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                            if file_name.ends_with(".log") || file_name.ends_with(".json") {
                                if let Err(e) = fs::remove_file(&path) {
                                    logger::log_warn(&format!("Nem sikerült törölni a log fájlt: {} - {}", path.display(), e));
                                } else {
                                    deleted_count += 1;
                                    logger::log_info(&format!("Log fájl törölve: {}", path.display()));
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
/// Visszaadja: (fájlnév, teljes útvonal, méret bytes-ban)
#[tauri::command]
pub fn list_log_files() -> Result<Vec<(String, String, u64)>, String> {
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
    
    // Listázzuk a .log és .json fájlokat is
    let mut log_files: Vec<(String, String, u64)> = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&log_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                    if let Some(file_name) = path.file_name() {
                        if let Some(file_name_str) = file_name.to_str() {
                            // Mindkét formátumot kezeljük: .log és .json
                            if file_name_str.ends_with(".log") || file_name_str.ends_with(".json") {
                                let full_path = path.to_string_lossy().to_string();
                                
                                // Fájl méret lekérése
                                let file_size = fs::metadata(&path)
                                    .map(|m| m.len())
                                    .unwrap_or(0);
                                
                                log_files.push((file_name_str.to_string(), full_path, file_size));
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Rendezzük dátum szerint (legújabb először) - a fájlnévből kinyerjük a dátumot
    log_files.sort_by(|a, b| {
        // frontend-YYYY-MM-DD.log, backend-YYYY-MM-DD.log, frontend-YYYY-MM-DD.json, backend-YYYY-MM-DD.json formátum
        let date_a = extract_date_from_filename(&a.0);
        let date_b = extract_date_from_filename(&b.0);
        date_b.cmp(&date_a)
    });
    
    Ok(log_files)
}

/// Kinyeri a dátumot a log fájlnévből (frontend-YYYY-MM-DD.log, backend-YYYY-MM-DD.log, frontend-YYYY-MM-DD.json, backend-YYYY-MM-DD.json)
fn extract_date_from_filename(filename: &str) -> String {
    // frontend-YYYY-MM-DD.log, backend-YYYY-MM-DD.log, frontend-YYYY-MM-DD.json, backend-YYYY-MM-DD.json
    if filename.starts_with("frontend-") {
        filename.replace("frontend-", "").replace(".log", "").replace(".json", "")
    } else if filename.starts_with("backend-") {
        filename.replace("backend-", "").replace(".log", "").replace(".json", "")
    } else {
        String::new()
    }
}

/// Log fájl tartalmának olvasása
/// Visszaadja a teljes log fájl tartalmát string-ként
#[tauri::command]
pub fn read_log_file(file_path: String) -> Result<String, String> {
    use std::fs;
    use std::path::Path;
    
    // Biztonsági ellenőrzés: csak a log könyvtárban lévő fájlokat olvashatjuk
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    let requested_path = Path::new(&file_path);
    
    // Ellenőrizzük, hogy a fájl a log könyvtárban van-e
    if !requested_path.starts_with(&log_dir) {
        return Err("A fájl nem a log könyvtárban található".to_string());
    }
    
    // Olvassuk be a fájl tartalmát
    let content = fs::read_to_string(&requested_path)
        .map_err(|e| format!("Nem sikerült beolvasni a log fájlt: {}", e))?;
    
    logger::log_info(&format!("Log fájl beolvasva: {}", file_path));
    
    Ok(content)
}

/// Backup fájlok listázása a backup könyvtárból
/// Visszaadja a backup fájlok listáját a fájlnévvel, teljes útvonallal, timestamp-tel és mérettel (bytes)
/// Keres mindkét lehetséges helyen: az új cross-platform helyen és a régi bundle ID helyen (kompatibilitás)
#[tauri::command]
pub fn list_backup_files() -> Result<Vec<(String, String, String, u64)>, String> {
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
    let mut backup_files: Vec<(String, String, String, u64)> = Vec::new();
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
                                    
                                    // Fájl méret lekérése
                                    let file_size = fs::metadata(&path)
                                        .map(|m| m.len())
                                        .unwrap_or(0);
                                    
                                    // Kiolvassuk a backup fájlt, hogy megkapjuk a timestamp-et
                                    let mut timestamp = String::new();
                                    if let Ok(content) = fs::read_to_string(&path) {
                                        if let Ok(json) = serde_json::from_str::<Value>(&content) {
                                            if let Some(ts) = json.get("timestamp").and_then(|v| v.as_str()) {
                                                timestamp = ts.to_string();
                                            }
                                        }
                                    }
                                    
                                    backup_files.push((file_name_str.to_string(), full_path, timestamp, file_size));
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

/// Összes automatikus backup fájl törlése (Factory Reset-hez)
#[tauri::command]
pub fn delete_all_backups() -> Result<u32, String> {
    use dirs;
    use std::fs;
    use std::collections::HashSet;
    
    // Új cross-platform könyvtár (3DPrinterCalcApp)
    let backup_dir_new = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("backups")
        .join("automatic");
    
    // Régi bundle ID könyvtár (com.lekszikov.3dprintercalcapp) - csak macOS és Linux
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    let backup_dir_old = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("com.lekszikov.3dprintercalcapp")
        .join("backups")
        .join("automatic");
    
    let mut deleted_count = 0;
    let mut seen_files = HashSet::new();
    
    // Új könyvtár feldolgozása
    if backup_dir_new.exists() {
        if let Ok(entries) = fs::read_dir(&backup_dir_new) {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() {
                        if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                            if file_name.starts_with("auto_backup_") && file_name.ends_with(".json") {
                                if !seen_files.contains(file_name) {
                                    seen_files.insert(file_name.to_string());
                                    if let Err(e) = fs::remove_file(&path) {
                                        logger::log_warn(&format!("Nem sikerült törölni a backup fájlt: {} - {}", path.display(), e));
                                    } else {
                                        deleted_count += 1;
                                        logger::log_info(&format!("Backup fájl törölve: {}", path.display()));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Régi könyvtár feldolgozása (csak macOS és Linux)
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    {
        if backup_dir_old.exists() {
            if let Ok(entries) = fs::read_dir(&backup_dir_old) {
                for entry in entries {
                    if let Ok(entry) = entry {
                        let path = entry.path();
                        if path.is_file() {
                            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                                if file_name.starts_with("auto_backup_") && file_name.ends_with(".json") {
                                    // Elkerüljük a duplikációt
                                    if !seen_files.contains(file_name) {
                                        seen_files.insert(file_name.to_string());
                                        if let Err(e) = fs::remove_file(&path) {
                                            logger::log_warn(&format!("Nem sikerült törölni a backup fájlt: {} - {}", path.display(), e));
                                        } else {
                                            deleted_count += 1;
                                            logger::log_info(&format!("Backup fájl törölve: {}", path.display()));
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

/// Rendszerinformációk lekérése (CPU, memória, GPU, OS verzió, stb.)
#[tauri::command]
pub fn get_system_info() -> Result<serde_json::Value, String> {
    use sysinfo::{System, Disks};
    
    let mut system = System::new_all();
    system.refresh_all();
    
    // OS információk - sysinfo 0.31-ben associated functions
    let os_name = System::name().unwrap_or_else(|| "Unknown".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "Unknown".to_string());
    let kernel_version = System::kernel_version().unwrap_or_else(|| "Unknown".to_string());
    let host_name = System::host_name().unwrap_or_else(|| "Unknown".to_string());
    
    // CPU információk
    let cpu_count = system.cpus().len();
    let cpu_name = if cpu_count > 0 {
        system.cpus()[0].brand().to_string()
    } else {
        "Unknown".to_string()
    };
    let cpu_arch = std::env::consts::ARCH;
    
    // CPU architektúra típus meghatározása
    let cpu_type = if cpu_arch.contains("x86_64") {
        "AMD64/Intel64"
    } else if cpu_arch.contains("x86") {
        "Intel32/AMD32"
    } else if cpu_arch.contains("aarch64") || cpu_arch.contains("arm64") {
        "ARM64"
    } else if cpu_arch.contains("arm") {
        "ARM"
    } else {
        cpu_arch
    };
    
    // Memória információk
    // sysinfo 0.31-ben a memória BYTES-ban jön
    let total_memory_bytes = system.total_memory();
    let used_memory_bytes = system.used_memory();
    let available_memory_bytes = system.available_memory();
    
    // Konvertálás KB-ba (bytes → KB, osztás 1024-gyel)
    let total_memory_kb = total_memory_bytes / 1024;
    let used_memory_kb = used_memory_bytes / 1024;
    let available_memory_kb = available_memory_bytes / 1024;
    
    // Konvertálás GB-ba (bytes → GB, osztás 1024^3-mal)
    let total_memory_gb = total_memory_bytes as f64 / (1024.0 * 1024.0 * 1024.0);
    let used_memory_gb = used_memory_bytes as f64 / (1024.0 * 1024.0 * 1024.0);
    let available_memory_gb = available_memory_bytes as f64 / (1024.0 * 1024.0 * 1024.0);
    
    // GPU információk (sysinfo nem ad GPU-t közvetlenül, csak OS verziót használunk)
    #[cfg(target_os = "macos")]
    let gpu_info = "macOS GPU (via Metal)";
    #[cfg(target_os = "windows")]
    let gpu_info = "Windows GPU (DirectX/Vulkan)";
    #[cfg(target_os = "linux")]
    let gpu_info = "Linux GPU (OpenGL/Vulkan)";
    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    let gpu_info = "Unknown";
    
    // Platform típus
    #[cfg(target_os = "macos")]
    let platform = "macOS";
    #[cfg(target_os = "windows")]
    let platform = "Windows";
    #[cfg(target_os = "linux")]
    let platform = "Linux";
    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    let platform = "Unknown";
    
    // Disk információk - sysinfo 0.31-ben Disks struct-ot használunk
    let disks = Disks::new_with_refreshed_list();
    let total_disk_space = disks.iter()
        .map(|disk| disk.total_space())
        .sum::<u64>();
    let available_disk_space = disks.iter()
        .map(|disk| disk.available_space())
        .sum::<u64>();
    let total_disk_gb = total_disk_space as f64 / (1024.0 * 1024.0 * 1024.0);
    let available_disk_gb = available_disk_space as f64 / (1024.0 * 1024.0 * 1024.0);
    
    // Alkalmazás verzió
    let app_version = env!("CARGO_PKG_VERSION");
    
    let system_info = serde_json::json!({
        "system": {
            "platform": platform,
            "os_name": os_name,
            "os_version": os_version,
            "kernel_version": kernel_version,
            "host_name": host_name,
        },
        "cpu": {
            "type": cpu_type,
            "architecture": cpu_arch,
            "name": cpu_name,
            "cores": cpu_count,
        },
        "memory": {
            "total_gb": format!("{:.2}", total_memory_gb),
            "used_gb": format!("{:.2}", used_memory_gb),
            "available_gb": format!("{:.2}", available_memory_gb),
            "total_kb": total_memory_kb,
            "used_kb": used_memory_kb,
            "available_kb": available_memory_kb,
            "total_bytes": total_memory_bytes,
            "used_bytes": used_memory_bytes,
            "available_bytes": available_memory_bytes,
            "used_percent": if total_memory_bytes > 0 {
                (used_memory_bytes as f64 / total_memory_bytes as f64 * 100.0).round() as u32
            } else {
                0
            },
        },
        "disk": {
            "total_gb": format!("{:.2}", total_disk_gb),
            "available_gb": format!("{:.2}", available_disk_gb),
            "total_bytes": total_disk_space,
            "available_bytes": available_disk_space,
        },
        "gpu": {
            "info": gpu_info,
        },
        "app": {
            "version": app_version,
        },
    });
    
    Ok(system_info)
}

/// Ellenőrzi, hogy egy fájl létezik-e az alkalmazás adatkönyvtárában
#[tauri::command]
pub async fn check_file_exists(file_path: String) -> Result<bool, String> {
    use std::path::PathBuf;
    use dirs::data_local_dir;
    
    let app_name = "3DPrinterCalcApp";
    let data_dir = data_local_dir()
        .ok_or("Nem sikerült meghatározni az adatkönyvtárat")?
        .join(app_name);
    
    let file_path_buf = PathBuf::from(&file_path);
    let full_path = if file_path_buf.is_absolute() {
        file_path_buf
    } else {
        data_dir.join(&file_path)
    };
    
    // Ellenőrizzük mindkét lehetséges helyet (régi és új bundle ID)
    let old_bundle_dir = data_local_dir()
        .ok_or("Nem sikerült meghatározni az adatkönyvtárat")?
        .join("com.lekszikov.3dprintercalcapp");
    
    let new_path = full_path.clone();
    let old_path = old_bundle_dir.join(&file_path);
    
    // Ha az új helyen nem található, próbáljuk meg a régi helyen
    if new_path.exists() {
        Ok(true)
    } else if cfg!(target_os = "macos") && old_path.exists() {
        Ok(true)
    } else {
        Ok(false)
    }
}
