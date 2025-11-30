// Audit log fájlok automatikus törlése (rotáció)

import { invoke } from "@tauri-apps/api/core";

/**
 * Automatikus audit log fájlok törlése a megadott napok száma után
 * @param retentionDays Hány napnál régebbi fájlokat töröljön (0 = soha ne törölje)
 * @returns Törölt fájlok száma
 */
export async function cleanupOldAuditLogs(retentionDays: number): Promise<number> {
  try {
    // Ha 0 vagy kevesebb, ne töröljünk semmit
    if (retentionDays <= 0) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Audit log rotáció kikapcsolva (retentionDays = 0)");
      }
      return 0;
    }

    if (import.meta.env.DEV) {
      console.log(`🧹 Audit log rotáció indítása: ${retentionDays} napnál régebbi fájlok törlése...`);
    }

    const deletedCount = await invoke<number>("delete_old_audit_logs", { days: retentionDays });

    if (import.meta.env.DEV) {
      console.log(`✅ Audit log rotáció befejezve: ${deletedCount} fájl törölve`);
    }

    return deletedCount;
  } catch (error) {
    console.error("❌ Hiba az audit log fájlok törlésekor:", error);
    return 0;
  }
}


