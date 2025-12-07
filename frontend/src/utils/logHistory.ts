// Log fájlok listázása és history kezelése

import { invoke } from "@tauri-apps/api/core";

export interface LogHistoryItem {
  fileName: string;
  filePath: string; // Teljes útvonal a fájl megnyitásához
  date: Date;
  type: "frontend" | "backend"; // frontend-YYYY-MM-DD.log, backend-YYYY-MM-DD.log, frontend-YYYY-MM-DD.json, backend-YYYY-MM-DD.json
}

/**
 * Visszaadja az összes log fájl listáját a log könyvtárból
 */
export async function getLogHistory(): Promise<LogHistoryItem[]> {
  try {
    // Használjuk a backend command-ot, ami közvetlenül a fájlrendszerből listázza a log fájlokat
    // Ez elkerüli a Tauri permissions problémát
    const logFiles = await invoke<[string, string, number][]>("list_log_files");
    
    if (import.meta.env.DEV) {
      console.log("📝 Talált log fájlok:", logFiles.length);
    }

    const history: LogHistoryItem[] = [];

    for (const [fileName, filePath, _fileSize] of logFiles) {
      try {
        // Kinyerjük a dátumot és a típust a fájlnévből
        let date: Date | null = null;
        let type: "frontend" | "backend" = fileName.startsWith("frontend") ? "frontend" : "backend";
        
        // Megpróbáljuk kinyerni a dátumot a fájlnévből (mindkét formátum: .log és .json)
        if (fileName.startsWith("frontend-")) {
          // Eltávolítjuk a prefix-et és mindkét kiterjesztést (.log és .json)
          const dateStr = fileName.replace("frontend-", "").replace(".log", "").replace(".json", "");
          const dateParts = dateStr.split("-");
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10);
            const day = parseInt(dateParts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day) && year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
              date = new Date(year, month - 1, day);
              if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                date = null;
              }
            }
          }
        } else if (fileName.startsWith("backend-")) {
          // Eltávolítjuk a prefix-et és mindkét kiterjesztést (.log és .json)
          const dateStr = fileName.replace("backend-", "").replace(".log", "").replace(".json", "");
          const dateParts = dateStr.split("-");
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10);
            const day = parseInt(dateParts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day) && year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
              date = new Date(year, month - 1, day);
              if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                date = null;
              }
            }
          }
        }
        
        // Ha nem sikerült kinyerni a dátumot, használjuk a mai dátumot
        if (!date) {
          date = new Date();
          if (import.meta.env.DEV) {
            console.warn(`⚠️ Nem sikerült a dátumot kinyerni a fájlnévből: ${fileName}, mai dátummal adjuk hozzá`);
          }
        }
        
        // Minden log fájlt hozzáadunk a history-hoz
        history.push({
          fileName,
          filePath,
          date,
          type,
        });
      } catch (error) {
        console.error(`❌ Hiba a log fájl feldolgozásakor (${fileName}):`, error);
      }
    }

    // Rendezés dátum szerint (legújabb először) - a backend már rendezi, de biztosra megyünk
    history.sort((a, b) => b.date.getTime() - a.date.getTime());

    if (import.meta.env.DEV) {
      console.log("✅ Log history betöltve:", history.length, "fájl");
    }

    return history;
  } catch (error) {
    console.error("❌ Hiba a log history lekérdezésénél:", error);
    return [];
  }
}

