#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{generate_context, Builder};

fn main() {
    Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|_app| {
            // Platform specifikus inicializálás
            // macOS Dock, Windows Taskbar, Linux AppIndicator funkciók
            // a jövőben implementálhatók Tauri v2 API-k használatával
            
            #[cfg(target_os = "macos")]
            {
                // macOS Dock badge és menü a jövőben implementálható
                // Használható: app.handle().dock_badge() vagy hasonló API-k
            }
            
            #[cfg(target_os = "windows")]
            {
                // Windows Taskbar progress bar és jump list
                // Használható: app.handle().set_progress() vagy hasonló API-k
            }
            
            #[cfg(target_os = "linux")]
            {
                // Linux AppIndicator/system tray
                // Használható: tauri-plugin-system-tray vagy hasonló
            }
            
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
