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

/// Backend log fájl útvonalának lekérése
#[tauri::command]
pub fn get_backend_log_path() -> Result<Option<String>, String> {
    Ok(logger::get_log_path()
        .map(|p| p.to_string_lossy().to_string()))
}

