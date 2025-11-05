#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{generate_context, Builder};

fn main() {
    Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(generate_context!())
        .expect("error while running tauri application");
}
