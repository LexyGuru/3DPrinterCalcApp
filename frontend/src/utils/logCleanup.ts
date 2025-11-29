// Log fájlok automatikus törlése (rotáció)

import { invoke } from "@tauri-apps/api/core";

/**
 * Automatikus log fájlok törlése a megadott napok száma után
 * @param retentionDays Hány napnál régebbi fájlokat töröljön (0 = soha ne törölje)
 * @returns Törölt fájlok száma
 */
export async function cleanupOldLogs(retentionDays: number): Promise<number> {
  try {
    // Ha 0 vagy kevesebb, ne töröljünk semmit
    if (retentionDays <= 0) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Log rotáció kikapcsolva (retentionDays = 0)");
      }
      return 0;
    }

    if (import.meta.env.DEV) {
      console.log(`🧹 Log rotáció indítása: ${retentionDays} napnál régebbi fájlok törlése...`);
    }

    const deletedCount = await invoke<number>("delete_old_logs", { days: retentionDays });

    if (import.meta.env.DEV) {
      console.log(`✅ Log rotáció befejezve: ${deletedCount} fájl törölve`);
    }

    return deletedCount;
  } catch (error) {
    console.error("❌ Hiba a log fájlok törlésekor:", error);
    return 0;
  }
}

