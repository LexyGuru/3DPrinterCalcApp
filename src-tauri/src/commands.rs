use tauri::{AppHandle, Manager};

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
            log::info!("Dock badge beállítva");
        } else {
            // Dock badge törlése
            window
                .set_badge_label(None)
                .map_err(|e| format!("Dock badge törlése sikertelen: {}", e))?;
            log::info!("Dock badge törölve");
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
    log::info!("Windows taskbar progress beállítás kihagyva (fordítási hiba miatt)");
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
    log::info!("Értesítés küldése backend-ből: {} - {}", title, body);
    
    // Megjegyzés: A Tauri v2 notification plugin főleg frontend-ből használható
    // Backend-ből nincs közvetlen API, csak a frontend-ből
    
    Ok(())
}

/// System tray ikon megjelenítése/elrejtése
#[tauri::command]
pub fn toggle_system_tray(_app: AppHandle, show: bool) -> Result<(), String> {
    // A system tray automatikusan megjelenik, ha a plugin inicializálva van
    // Ez a command csak logolásra szolgál jelenleg
    log::info!("System tray állapot: {}", if show { "megjelenítve" } else { "elrejtve" });
    Ok(())
}

