#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

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
            #[cfg(target_os = "macos")]
            set_dock_badge,
            #[cfg(target_os = "windows")]
            set_taskbar_progress,
        ])
        .setup(|_app| {
            
            // Platform specifikus inicializálás
            #[cfg(target_os = "macos")]
            {
                // macOS Dock badge inicializálása (üres kezdetben)
                log::info!("macOS platform specifikus funkciók inicializálva");
                log::info!("- Dock badge támogatás");
                log::info!("- Notification Center integráció");
            }
            
            #[cfg(target_os = "windows")]
            {
                // Windows Taskbar progress inicializálása
                log::info!("Windows platform specifikus funkciók inicializálva");
                log::info!("- Taskbar progress támogatás");
                log::info!("- Windows Notifications integráció");
            }
            
            #[cfg(target_os = "linux")]
            {
                // Linux AppIndicator/system tray már inicializálva van a plugin-nel
                log::info!("Linux platform specifikus funkciók inicializálva");
                log::info!("- AppIndicator/system tray támogatás");
                log::info!("- Desktop notifications támogatás");
            }
            
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
