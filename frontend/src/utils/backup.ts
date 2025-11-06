import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile } from "@tauri-apps/plugin-fs";
import type { Printer, Filament, Offer, Settings } from "../types";

export interface BackupData {
  version: string;
  timestamp: string;
  printers?: Printer[];
  filaments?: Filament[];
  offers?: Offer[];
  settings?: Settings;
}

export async function createBackup(
  printers: Printer[],
  filaments: Filament[],
  offers: Offer[],
  settings: Settings
): Promise<string | null> {
  try {
    console.log("💾 Backup létrehozása...", {
      printers: printers.length,
      filaments: filaments.length,
      offers: offers.length,
    });

    const backupData: BackupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      printers,
      filaments,
      offers,
      settings,
    };

    const fileName = `backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const filePath = await save({
      defaultPath: fileName,
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    if (!filePath) {
      console.log("ℹ️ Backup létrehozás megszakítva");
      return null;
    }

    await writeTextFile(filePath, JSON.stringify(backupData, null, 2));
    console.log("✅ Backup sikeresen létrehozva", { filePath });

    return filePath;
  } catch (error) {
    console.error("❌ Hiba a backup létrehozásakor:", error);
    throw error;
  }
}

export async function restoreBackup(): Promise<BackupData | null> {
  try {
    console.log("📥 Backup visszaállítása...");

    const filePath = await open({
      filters: [
        {
          name: "JSON",
          extensions: ["json"],
        },
      ],
    });

    if (!filePath || typeof filePath !== "string") {
      console.log("ℹ️ Backup visszaállítás megszakítva");
      return null;
    }

    const content = await readTextFile(filePath);
    const backupData: BackupData = JSON.parse(content);

    // Validáció
    if (!backupData.version || !backupData.timestamp) {
      throw new Error("Érvénytelen backup fájl formátum");
    }

    console.log("✅ Backup sikeresen betöltve", {
      version: backupData.version,
      timestamp: backupData.timestamp,
      printers: backupData.printers?.length || 0,
      filaments: backupData.filaments?.length || 0,
      offers: backupData.offers?.length || 0,
    });

    return backupData;
  } catch (error) {
    console.error("❌ Hiba a backup visszaállításakor:", error);
    throw error;
  }
}

export async function createAutomaticBackup(
  printers: Printer[],
  filaments: Filament[],
  offers: Offer[],
  settings: Settings
): Promise<string | null> {
  try {
    const backupData: BackupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      printers,
      filaments,
      offers,
      settings,
    };

    // Automatikus backup - csak a memóriában tároljuk, nem mentjük fájlba automatikusan
    // (ez megelőzi a túl sok fájl létrehozását)
    console.log("✅ Automatikus backup adatok előkészítve", {
      timestamp: backupData.timestamp,
      printers: printers.length,
      filaments: filaments.length,
      offers: offers.length,
    });

    // Ha szükséges, itt lehetne fájlba menteni, de most csak logoljuk
    return null;
  } catch (error) {
    console.error("❌ Hiba az automatikus backup létrehozásakor:", error);
    return null;
  }
}

