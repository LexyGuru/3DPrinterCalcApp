#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod logger;

use tauri::{generate_context, Builder};
use commands::*;

fn main() {
    Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            send_notification,
            toggle_system_tray,
            open_file,
            init_frontend_log,
            write_frontend_log,
            get_frontend_log_path,
            get_backend_log_path,
            #[cfg(target_os = "macos")]
            set_dock_badge,
            #[cfg(target_os = "windows")]
            set_taskbar_progress,
        ])
        .setup(|_app| {
            // Log fájl inicializálása
            match logger::init_log_file() {
                Ok(path) => {
                    eprintln!("✅ Backend log fájl inicializálva: {}", path.display());
                    logger::log_info(&format!("Alkalmazás indítása - Backend log fájl: {}", path.display()));
                }
                Err(e) => {
                    eprintln!("⚠️ Backend log fájl inicializálási hiba: {}", e);
                }
            }
            
            // Platform specifikus inicializálás
            #[cfg(target_os = "macos")]
            {
                // macOS Dock badge inicializálása (üres kezdetben)
                logger::log_info("macOS platform specifikus funkciók inicializálva");
                logger::log_info("- Dock badge támogatás");
                logger::log_info("- Notification Center integráció");
            }
            
            #[cfg(target_os = "windows")]
            {
                // Windows Taskbar progress inicializálása
                logger::log_info("Windows platform specifikus funkciók inicializálva");
                logger::log_info("- Taskbar progress támogatás");
                logger::log_info("- Windows Notifications integráció");
            }
            
            #[cfg(target_os = "linux")]
            {
                // Linux AppIndicator/system tray már inicializálva van a plugin-nel
                logger::log_info("Linux platform specifikus funkciók inicializálva");
                logger::log_info("- AppIndicator/system tray támogatás");
                logger::log_info("- Desktop notifications támogatás");
            }
            
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
