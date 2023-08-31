use std::{
    fs::{self, read_dir, read_to_string},
    iter::zip,
    path::{Path, PathBuf},
};

use regex::Regex;
// use std::path::Path;

pub fn analyze_source_folder(pathstring: String) -> Result<Vec<String>, String> {
    // let mut rv = Vec::<String>::new();
    let res = read_dir(pathstring);
    match res {
        Err(_err) => return Err("The folder does not exist".to_string()),
        Ok(values) => {
            let mut rv = Vec::<String>::new(); // return value
            for item in values {
                let path = item.unwrap().path().to_owned();
                if path.is_dir() {
                    rv.push(path.to_str().unwrap().to_string());
                }
            }
            return Ok(rv);
        }
    };
}

fn list_data_files(path: &str) -> Result<Vec<PathBuf>, String> {
    let res = read_dir(path);
    match res {
        Err(_e) => Err("error reading directory".to_string()),
        Ok(vals) => {
            let mut rv = Vec::<PathBuf>::new();
            for item in vals {
                let file_name = item.as_ref().unwrap().file_type().unwrap();
                if file_name.is_file() {
                    let file = item.unwrap().path().to_owned();
                    rv.push(file)
                }
            }
            return Ok(rv);
        }
    }
}

fn read_log_file(log_file: String) -> Result<String, String> {
    let patt1: Regex = Regex::new(r"Normal: Node").unwrap();
    let patt2: Regex = Regex::new(r"MS[\d]").unwrap();
    let mut msn_level = "".to_string();
    match read_to_string(log_file) {
        Err(_x) => return Err("Failed to read file".to_string()),
        Ok(file_content) => {
            for line in file_content.lines() {
                if patt1.is_match(line) {
                    let ms_n = patt2.captures(line).unwrap()[0].to_string();
                    if ms_n > msn_level {
                        msn_level = ms_n.clone();
                    }
                }
            }
        }
    }
    return Ok(msn_level);
}

pub fn evaluate_data(path: String, mode: String, compound_id: String) -> Result<String, String> {
    let files = list_data_files(&path);
    match files {
        Err(_e) => Err(format!("data folder for {} unreadable", compound_id)),
        Ok(values) => {
            if values.len() < 8 {
                Err(format!(
                    "Acquisition for compound {} incomplete",
                    compound_id
                ))
            } else {
                match read_log_file(format!(
                    "{}/{}-{}_normal_log.txt",
                    &path, &compound_id, &mode
                )) {
                    Err(_x) => Err("Unable to read log file".to_string()),
                    Ok(val) => {
                        if val < "MS2".to_string() {
                            return Err("Invalid tree dept. Need reacquisition".to_string());
                        } else {
                            return Ok(format!("Acquired {} tree", val));
                        }
                    }
                }
            }
        }
    }
}

pub fn copy_files(
    source_path: String,
    dest_path: String,
    compound_id: String,
) -> Result<String, String> {
    let files = list_data_files(&source_path).unwrap();
    let filenames: Vec<String> = files
        .clone()
        .into_iter()
        .map(|file| file.file_name().unwrap().to_str().unwrap().to_string())
        .collect::<Vec<String>>();
    let new_path = Path::new(&dest_path).join(&compound_id);
    if !new_path.exists() {
        fs::create_dir(&new_path).unwrap();
    }
    let mut success_log: Vec<String> = Vec::new();
    let mut error_log: Vec<String> = Vec::new();
    for (filepath, filename) in zip(files, filenames) {
        let target = new_path.join(&filename);
        let copy_proc = fs::copy(filepath, target);

        match copy_proc {
            Err(_x) => error_log.push(format!(
                "Comp {} Could not copy file {}",
                compound_id, &filename
            )),
            Ok(_y) => success_log.push(filename.to_string()),
        }
    }
    if success_log.len() == 8 {
        Ok("All files copied".to_string())
    } else {
        Err(error_log.join(", "))
    }
}
