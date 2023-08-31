// use tauri::utils::resources::ResourcePaths;

mod business_logic;
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#[cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn read_directory(basepath: String) -> Result<Vec<String>, String> {
    business_logic::analyze_source_folder(basepath)
}

#[tauri::command]
fn evaluate_directory(path: String, mode: String, compound_id: String) -> Result<String, String> {
    business_logic::evaluate_data(path, mode, compound_id)
}

#[tauri::command]
fn copy_files_command(
    source_path: String,
    dest_path: String,
    compound_id: String,
) -> Result<String, String> {
    business_logic::copy_files(source_path, dest_path, compound_id)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_directory,
            evaluate_directory,
            copy_files_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
