// Mappa elérések és fájlok információinak logolása

import { invoke } from "@tauri-apps/api/core";
import { writeFrontendLog } from "./fileLogger";

// Flag, hogy csak egyszer logoljuk a mappa információkat
let directoryInfoLogged = false;

export interface FileInfo {
  name: string;
  size: number; // bytes
  extension: string;
  path: string;
}

export interface DirectoryInfo {
  path: string;
  fileCount: number;
  files: FileInfo[];
  totalSize: number; // bytes
}

/**
 * Formázza a fájl méretet olvasható formátumban
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

/**
 * Lekéri a log mappa információit
 */
export async function getLogDirectoryInfo(): Promise<DirectoryInfo | null> {
  try {
    const logDirPath = await invoke<string>("get_log_directory_path");
    const logFiles = await invoke<[string, string, number][]>("list_log_files");
    
    const files: FileInfo[] = [];
    let totalSize = 0;
    
    for (const [fileName, filePath, fileSize] of logFiles) {
      try {
        const extension = fileName.split('.').pop() || '';
        files.push({
          name: fileName,
          size: fileSize, // Backend-től jön a méret bytes-ban
          extension: extension,
          path: filePath,
        });
        totalSize += fileSize;
      } catch (error) {
        console.warn(`Nem sikerült információt lekérni a fájlról: ${fileName}`, error);
      }
    }
    
    return {
      path: logDirPath,
      fileCount: files.length,
      files: files,
      totalSize: totalSize,
    };
  } catch (error) {
    console.error("❌ Hiba a log mappa információinak lekérésekor:", error);
    return null;
  }
}

/**
 * Lekéri a backup mappa információit
 */
export async function getBackupDirectoryInfo(): Promise<DirectoryInfo | null> {
  try {
    const backupDirPath = await invoke<string>("get_backup_directory_path");
    const backupFiles = await invoke<[string, string, string, number][]>("list_backup_files");
    
    const files: FileInfo[] = [];
    let totalSize = 0;
    
    for (const [fileName, filePath, _timestamp, fileSize] of backupFiles) {
      try {
        const extension = fileName.split('.').pop() || '';
        files.push({
          name: fileName,
          size: fileSize, // Backend-től jön a méret bytes-ban
          extension: extension,
          path: filePath,
        });
        totalSize += fileSize;
      } catch (error) {
        console.warn(`Nem sikerült információt lekérni a backup fájlról: ${fileName}`, error);
      }
    }
    
    return {
      path: backupDirPath,
      fileCount: files.length,
      files: files,
      totalSize: totalSize,
    };
  } catch (error) {
    console.error("❌ Hiba a backup mappa információinak lekérésekor:", error);
    return null;
  }
}

/**
 * Formázott mappa információk kiírása log formátumban
 */
export function formatDirectoryInfoForLog(dirInfo: DirectoryInfo, dirName: string): string {
  const lines: string[] = [];
  
  lines.push("**************************************");
  lines.push(`${dirName.toUpperCase()} MAPPA INFORMÁCIÓK`);
  lines.push("**************************************");
  lines.push("");
  lines.push(`Mappa elérés: ${dirInfo.path}`);
  lines.push(`Fájlok száma: ${dirInfo.fileCount}`);
  lines.push(`Összes méret: ${formatFileSize(dirInfo.totalSize)}`);
  lines.push("");
  
  if (dirInfo.files.length > 0) {
    lines.push("Fájlok:");
    dirInfo.files.forEach((file) => {
      const sizeStr = file.size > 0 ? formatFileSize(file.size) : "méret ismeretlen";
      lines.push(`  - ${file.name} (${file.extension || "nincs kiterjesztés"}) - ${sizeStr}`);
    });
  } else {
    lines.push("Nincsenek fájlok ebben a mappában.");
  }
  
  lines.push("**************************************");
  
  return lines.join("\n");
}

/**
 * Mappa információk logolása
 * Csak egyszer logol, hogy elkerüljük a duplikációt (React StrictMode miatt)
 */
export async function logDirectoryInfo(): Promise<void> {
  // Ha már logoltuk, ne logoljuk újra
  if (directoryInfoLogged) {
    return;
  }
  
  try {
    // Log mappa információk
    const logDirInfo = await getLogDirectoryInfo();
    if (logDirInfo) {
      const formattedInfo = formatDirectoryInfoForLog(logDirInfo, "Log");
      // Egyetlen log bejegyzésként logoljuk
      await writeFrontendLog('INFO', formattedInfo);
      console.log(formattedInfo);
    }
    
    // Backup mappa információk
    const backupDirInfo = await getBackupDirectoryInfo();
    if (backupDirInfo) {
      const formattedInfo = formatDirectoryInfoForLog(backupDirInfo, "Backup");
      // Egyetlen log bejegyzésként logoljuk
      await writeFrontendLog('INFO', formattedInfo);
      console.log(formattedInfo);
    }
    
    // Flag beállítása, hogy ne logoljuk újra
    directoryInfoLogged = true;
  } catch (error) {
    console.error("❌ Hiba a mappa információk logolásakor:", error);
    await writeFrontendLog('ERROR', `Mappa információk logolási hiba: ${error}`);
  }
}

