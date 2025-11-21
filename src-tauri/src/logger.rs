use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use lazy_static::lazy_static;

lazy_static! {
    static ref LOG_FILE: Mutex<Option<File>> = Mutex::new(None);
    static ref LOG_PATH: Mutex<Option<PathBuf>> = Mutex::new(None);
}

/// Inicializálja a log fájlt
/// 
/// Log fájl helye platformonként:
/// - macOS: ~/Library/Application Support/3DPrinterCalcApp/logs/
/// - Windows: %LOCALAPPDATA%\3DPrinterCalcApp\logs\ (pl. C:\Users\<username>\AppData\Local\3DPrinterCalcApp\logs\)
/// - Linux: ~/.local/share/3DPrinterCalcApp/logs/
pub fn init_log_file() -> Result<PathBuf, String> {
    use dirs;
    
    let log_dir = dirs::data_local_dir()
        .ok_or_else(|| "Nem található data directory".to_string())?
        .join("3DPrinterCalcApp")
        .join("logs");
    
    // Létrehozzuk a log könyvtárat, ha nem létezik
    std::fs::create_dir_all(&log_dir)
        .map_err(|e| format!("Nem sikerült létrehozni a log könyvtárat: {}", e))?;
    
    // Log fájl neve: backend-YYYY-MM-DD.log
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let log_file_path = log_dir.join(format!("backend-{}.log", today));
    
    // Megnyitjuk a log fájlt append módban
    let file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_file_path)
        .map_err(|e| format!("Nem sikerült megnyitni a log fájlt: {}", e))?;
    
    // Elmentjük a fájlt és az útvonalat
    *LOG_FILE.lock().unwrap() = Some(file);
    *LOG_PATH.lock().unwrap() = Some(log_file_path.clone());
    
    // Írunk egy kezdő üzenetet
    write_to_log_file("INFO", &format!("=== Backend log inicializálva: {} ===", log_file_path.display()));
    
    Ok(log_file_path)
}

/// Visszaadja a log fájl útvonalát
pub fn get_log_path() -> Option<PathBuf> {
    LOG_PATH.lock().unwrap().clone()
}

/// Ír a log fájlba
pub fn write_to_log_file(level: &str, message: &str) {
    let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S%.3f").to_string();
    let log_entry = format!("[{}] [{}] {}\n", timestamp, level, message);
    
    if let Ok(mut file_guard) = LOG_FILE.lock() {
        if let Some(ref mut file) = *file_guard {
            let _ = file.write_all(log_entry.as_bytes());
            let _ = file.flush();
        }
    }
    
    // Emellett stdout-ra is írunk
    eprintln!("[BACKEND] {}", log_entry.trim());
}

/// Logolás különböző szinteken
pub fn log_info(message: &str) {
    write_to_log_file("INFO", message);
}

#[allow(dead_code)]
pub fn log_warn(message: &str) {
    write_to_log_file("WARN", message);
}

#[allow(dead_code)]
pub fn log_error(message: &str) {
    write_to_log_file("ERROR", message);
}

#[allow(dead_code)]
pub fn log_debug(message: &str) {
    write_to_log_file("DEBUG", message);
}

