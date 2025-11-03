#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{generate_context, Builder};

fn main() {
    Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .run(generate_context!())
        .expect("error while running tauri application");
}
