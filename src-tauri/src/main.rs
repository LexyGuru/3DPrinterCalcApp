#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod logger;
mod encryption;

use tauri::{generate_context, Builder, Manager};
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
            write_backend_log,
            get_frontend_log_path,
            get_backend_log_path,
            delete_old_logs,
            delete_all_logs,
            get_log_directory_path,
            get_backup_directory_path,
            open_directory,
            list_log_files,
            read_log_file,
            list_backup_files,
            create_automatic_backup_file,
            cleanup_old_backups_by_days,
            cleanup_old_backups_by_count,
            delete_all_backups,
            get_system_info,
            get_performance_metrics,
            check_file_exists,
            write_audit_log,
            list_audit_logs,
            read_audit_log_file,
            get_audit_log_directory_path,
            delete_old_audit_logs,
            delete_all_audit_logs,
            hash_password,
            verify_password,
            encrypt_data,
            decrypt_data,
            #[cfg(target_os = "macos")]
            set_dock_badge,
            #[cfg(target_os = "windows")]
            set_taskbar_progress,
        ])
        .setup(|app| {
            // RÉSZLETES LOGOLÁS - Alkalmazás indítás
            eprintln!("🚀 [BACKEND] Tauri alkalmazás inicializálás kezdete");
            logger::log_info("═══════════════════════════════════════════════════════════");
            logger::log_info("🚀 TAURI ALKALMAZÁS INICIALIZÁLÁS");
            logger::log_info("═══════════════════════════════════════════════════════════");
            
            // Log fájl inicializálása
            eprintln!("📝 [BACKEND] Log fájl inicializálása...");
            match logger::init_log_file() {
                Ok(path) => {
                    eprintln!("✅ [BACKEND] Backend log fájl inicializálva: {}", path.display());
                    logger::log_info(&format!("✅ Backend log fájl inicializálva: {}", path.display()));
                }
                Err(e) => {
                    eprintln!("⚠️ [BACKEND] Backend log fájl inicializálási hiba: {}", e);
                    logger::log_error(&format!("⚠️ Backend log fájl inicializálási hiba: {}", e));
                }
            }
            
            // App handle ellenőrzése
            eprintln!("🔍 [BACKEND] App handle ellenőrzése...");
            logger::log_info("🔍 App handle ellenőrzése");
            
            // Webview window ellenőrzése
            if let Some(_window) = app.get_webview_window("main") {
                eprintln!("✅ [BACKEND] Main window található");
                logger::log_info("✅ Main window található");
            } else {
                eprintln!("⚠️ [BACKEND] Main window NEM található!");
                logger::log_warn("⚠️ Main window NEM található!");
            }
            
            // Platform specifikus inicializálás
            #[cfg(target_os = "macos")]
            {
                eprintln!("🍎 [BACKEND] macOS platform inicializálás...");
                logger::log_info("🍎 macOS platform specifikus funkciók inicializálva");
                logger::log_info("- Dock badge támogatás");
                logger::log_info("- Notification Center integráció");
            }
            
            #[cfg(target_os = "windows")]
            {
                eprintln!("🪟 [BACKEND] Windows platform inicializálás...");
                logger::log_info("🪟 Windows platform specifikus funkciók inicializálva");
                logger::log_info("- Taskbar progress támogatás");
                logger::log_info("- Windows Notifications integráció");
            }
            
            #[cfg(target_os = "linux")]
            {
                eprintln!("🐧 [BACKEND] Linux platform inicializálás...");
                logger::log_info("🐧 Linux platform specifikus funkciók inicializálva");
                logger::log_info("- AppIndicator/system tray támogatás");
                logger::log_info("- Desktop notifications támogatás");
            }
            
            eprintln!("✅ [BACKEND] Setup befejezve, alkalmazás indítása...");
            logger::log_info("✅ Setup befejezve, alkalmazás indítása");
            logger::log_info("═══════════════════════════════════════════════════════════");
            
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}
