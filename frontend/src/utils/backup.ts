import { save, open } from "@tauri-apps/plugin-dialog";
import { writeTextFile, readTextFile, readDir, exists } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import type { Printer, Filament, Offer, Settings } from "../types";

// Lock mechanizmus a párhuzamos backupok megelőzésére
let isCreatingBackup = false;

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
): Promise<{ filePath: string; timestamp: string } | null> {
  try {
    console.log("💾 Backup létrehozása...", {
      printers: printers.length,
      filaments: filaments.length,
      offers: offers.length,
    });

    const timestamp = new Date().toISOString();
    const backupData: BackupData = {
      version: "1.0",
      timestamp,
      printers,
      filaments,
      offers,
      settings,
    };

    const fileName = `backup_${timestamp.replace(/[:.]/g, "-")}.json`;
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
    console.log("✅ Backup sikeresen létrehozva", { filePath, timestamp });

    return { filePath, timestamp };
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

/**
 * Segédfüggvény: formázza a dátumot YYYY-MM-DD formátumban helyi időzóna szerint
 */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Ellenőrzi, hogy van-e már mai napra automatikus backup
 * Helyi időzóna szerint ellenőrzi, nem UTC szerint
 * Optimalizált: használja a backend list_backup_files command-ot, hogy ne kelljen minden fájlt beolvasni
 */
async function hasTodayBackup(): Promise<boolean> {
  try {
    // Helyi időzóna szerint formázzuk a mai dátumot (nem UTC)
    const today = new Date();
    const todayStr = formatDateLocal(today); // YYYY-MM-DD formátum helyi időzóna szerint
    
    if (import.meta.env.DEV) {
      console.log("🔍 Mai backup ellenőrzés:", {
        todayLocal: todayStr,
        todayISO: today.toISOString().split("T")[0],
        now: today.toLocaleString()
      });
    }
    
    // Használjuk a backend command-ot, ami már visszaadja a timestamp-eket is
    // Ez gyorsabb, mint minden fájlt beolvasni
    const backupFiles = await invoke<[string, string, string, number][]>("list_backup_files");
    
    if (import.meta.env.DEV) {
      console.log("🔍 Backup fájlok száma:", backupFiles.length);
    }
    
    // Ellenőrizzük a legújabb backupokat (már dátum szerint rendezve a backend-ben)
    // Csak a mai napon készült backupot keressük
    for (const [fileName, , timestamp, _fileSize] of backupFiles) {
      if (!timestamp) {
        continue;
      }
      
      try {
        // A timestamp alapján számoljuk a helyi dátumot
        const backupDate = new Date(timestamp);
        const backupDateStr = formatDateLocal(backupDate);
        
        if (import.meta.env.DEV) {
          console.log("🔍 Backup ellenőrzés:", {
            fileName,
            timestamp,
            backupDateISO: backupDate.toISOString(),
            backupDateLocal: backupDateStr,
            todayLocal: todayStr,
            matches: backupDateStr === todayStr
          });
        }
        
        // Ha a backup mai napon készült (helyi időzóna szerint), akkor van mai backup
        if (backupDateStr === todayStr) {
          if (import.meta.env.DEV) {
            console.log("✅ Mai backup találva:", fileName, "dátum:", backupDateStr, "timestamp:", timestamp);
          }
          return true;
        }
        
        // Ha már régebbi, mint ma, akkor nem fogunk találni máit (mivel dátum szerint rendezve vannak)
        // Kilépünk a ciklusból, hogy ne foglalkozzunk a régebbi backupokkal
        if (backupDateStr < todayStr) {
          if (import.meta.env.DEV) {
            console.log("ℹ️ Régebbi backupok vannak, de nincs mai");
          }
          break;
        }
      } catch (error) {
        // Ha nem tudjuk parse-olni a timestamp-et, kihagyjuk
        if (import.meta.env.DEV) {
          console.warn("⚠️ Nem sikerült parse-olni a timestamp-et:", fileName, error);
        }
        continue;
      }
    }
    
    if (import.meta.env.DEV) {
      console.log("❌ Nem találtunk mai backupot. Mai dátum:", todayStr, "Backup fájlok száma:", backupFiles.length);
    }
    
    // Ha nem találtunk mai napon készült backupot, nincs mai backup
    return false;
  } catch (error) {
    console.error("❌ Hiba a mai backup ellenőrzésekor:", error);
    return false;
  }
}

export async function createAutomaticBackup(
  printers: Printer[],
  filaments: Filament[],
  offers: Offer[],
  settings: Settings
): Promise<{ filePath: string; timestamp: string; isNew: boolean } | null> {
  // Lock mechanizmus: ha már fut egy backup létrehozás, várunk
  if (isCreatingBackup) {
    if (import.meta.env.DEV) {
      console.log("⏳ Backup létrehozás már folyamatban van, kihagyva");
    }
    return null;
  }

  // Lock beállítása
  isCreatingBackup = true;

  try {
    // Ellenőrizzük, hogy van-e már mai napra backup
    const hasToday = await hasTodayBackup();
    if (hasToday) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Már van mai napra automatikus backup, új fájl nem jön létre");
      }
      // Ha már van mai backup, NEM frissítjük - csak a dátumot visszaadjuk
      // Az auto_backup csak naponta egyszer kell, hogy létrejöjjön
      // Használjuk a list_backup_files backend command-ot, hogy ne kelljen minden fájlt beolvasni
      const backupFiles = await invoke<[string, string, string, number][]>("list_backup_files");
      
      // Helyi időzóna szerint formázzuk a mai dátumot
      const today = new Date();
      const todayStr = formatDateLocal(today);
      
      // Keresünk mai napon készült backupot timestamp alapján
      for (const [fileName, filePath, timestamp, _fileSize] of backupFiles) {
        if (!timestamp) {
          continue;
        }
        
        try {
          // A timestamp alapján számoljuk a helyi dátumot
          const backupDate = new Date(timestamp);
          const backupDateStr = formatDateLocal(backupDate);
          
          // Ha a backup mai napon készült (helyi időzóna szerint), ezt adjuk vissza
          if (backupDateStr === todayStr) {
            if (import.meta.env.DEV) {
              console.log("ℹ️ Mai automatikus backup már létezik, nem frissítjük - csak a timestamp-et adjuk vissza", { 
                filePath, 
                timestamp,
                backupDate: backupDateStr,
                today: todayStr
              });
            }
            isCreatingBackup = false; // Lock feloldása
            return { filePath, timestamp, isNew: false };
          }
          
          // Ha már régebbi, mint ma, akkor nem fogunk találni máit (mivel dátum szerint rendezve vannak)
          if (backupDateStr < todayStr) {
            break;
          }
        } catch (error) {
          // Ha nem tudjuk parse-olni a timestamp-et, kihagyjuk
          if (import.meta.env.DEV) {
            console.warn("⚠️ Nem sikerült parse-olni a timestamp-et:", fileName, error);
          }
          continue;
        }
      }
      
      // Ha nem találtuk meg a mai backupot (ami elvileg nem lehet, mert hasTodayBackup() már ellenőrizte), null-t adunk vissza
      if (import.meta.env.DEV) {
        console.warn("⚠️ hasTodayBackup() szerint van mai backup, de nem találtuk meg!");
      }
      isCreatingBackup = false; // Lock feloldása
      return null;
    }

    // Ha nincs mai backup, létrehozzuk
    const timestamp = new Date().toISOString();
    const backupData: BackupData = {
      version: "1.0",
      timestamp,
      printers,
      filaments,
      offers,
      settings,
    };

    // Backend command használata a backup fájl létrehozásához
    // Ez elkerüli a Tauri permissions problémákat
    const [filePath, backupTimestamp] = await invoke<[string, string]>(
      "create_automatic_backup_file",
      { backupData }
    );
    
    console.log("✅ Automatikus backup sikeresen létrehozva", {
      filePath,
      timestamp: backupTimestamp,
      printers: printers.length,
      filaments: filaments.length,
      offers: offers.length,
    });

    // Töröljük a 5 napnál régebbi backup fájlokat
    await cleanupOldBackupsByDays(5);

    isCreatingBackup = false; // Lock feloldása sikeres backup után
    return { filePath, timestamp: backupTimestamp, isNew: true };
  } catch (error) {
    console.error("❌ Hiba az automatikus backup létrehozásakor:", error);
    isCreatingBackup = false; // Lock feloldása hiba esetén is
    return null;
  }
}

/**
 * Törli az ÖSSZES automatikus backup fájlt (factory reset esetén)
 * Backend parancsot használ, hogy elkerüljük a permissions problémákat
 */
export async function deleteAllAutomaticBackups(): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      console.log("🗑️ Összes automatikus backup törlése...");
    }

    // Backend parancsot használunk, hogy elkerüljük a permissions problémákat
    const deletedCount = await invoke<number>("delete_all_backups");

    if (import.meta.env.DEV) {
      if (deletedCount > 0) {
        console.log(`✅ ${deletedCount} automatikus backup fájl törölve`);
      } else {
        console.log("ℹ️ Nincs automatikus backup fájl törlésre");
      }
    }
  } catch (error) {
    console.error("❌ Hiba az automatikus backupok törlésekor:", error);
    // Ne dobjunk hibát, csak logoljuk, mert a factory reset nem akadályozható meg emiatt
  }
}

/**
 * Törli a régi automatikus backup fájlokat, ha túllépi a maximum számot
 * Backend command-ot használ, hogy elkerüljük a Tauri permissions problémákat
 */
export async function cleanupOldBackups(maxBackups: number = 10): Promise<void> {
  try {
    // Használjuk a backend command-ot a régi backupok törlésére
    // Ez elkerüli a Tauri permissions problémákat
    const deletedCount = await invoke<number>("cleanup_old_backups_by_count", { maxBackups });
    
    if (import.meta.env.DEV) {
      console.log(`✅ Régi backupok törölve: ${deletedCount} fájl (maximum ${maxBackups} fennmaradt)`);
    }
  } catch (error) {
    console.error("❌ Hiba a régi backupok törlésekor:", error);
  }
}

/**
 * Törli az 5 napnál régebbi automatikus backup fájlokat
 * Backend command-ot használ, hogy elkerüljük a Tauri permissions problémákat
 */
export async function cleanupOldBackupsByDays(days: number = 5): Promise<void> {
  try {
    // Használjuk a backend command-ot a régi backupok törlésére
    // Ez elkerüli a Tauri permissions problémákat
    const deletedCount = await invoke<number>("cleanup_old_backups_by_days", { days });
    
    if (import.meta.env.DEV) {
      console.log(`✅ Régi backupok törölve: ${deletedCount} fájl (${days} napnál régebbiek)`);
    }
  } catch (error) {
    console.error("❌ Hiba a régi backupok törlésekor:", error);
  }
}

/**
 * Segédfüggvény: kiszámolja két dátum közötti napok számát, nap határok figyelembevételével
 * A nap 0:00:00-tól 23:59:59-ig tart
 */
function getDaysDifference(date1: Date, date2: Date): number {
  // Normalizáljuk mindkét dátumot 0:00:00-ra (nap elejére)
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
  // Különbség milliszekundumban
  const diffMs = d2.getTime() - d1.getTime();
  
  // Átváltás napokra
  const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return daysDiff;
}

/**
 * Visszaadja az automatikus backup fájlok listáját dátum szerint
 */
export interface BackupHistoryItem {
  fileName: string;
  filePath: string; // Teljes útvonal a fájl megnyitásához
  timestamp: string;
  date: Date;
  daysOld: number;
  willBeDeletedIn: number; // napok száma a törlésig
}

export async function getAutomaticBackupHistory(): Promise<BackupHistoryItem[]> {
  try {
    // Használjuk a backend command-ot, ami közvetlenül a fájlrendszerből listázza a backup fájlokat
    // Ez elkerüli a Tauri permissions problémát
    const backupFiles = await invoke<[string, string, string, number][]>("list_backup_files");
    
    if (import.meta.env.DEV) {
      console.log("📝 Talált backup fájlok:", backupFiles.length);
    }

    const now = new Date();
    const history: BackupHistoryItem[] = [];

    for (const [fileName, filePath, timestamp, _fileSize] of backupFiles) {
      try {
        if (timestamp) {
          const backupDate = new Date(timestamp);
          
          // Nap számítás nap határok figyelembevételével
          // Pozitív szám: hány napja készült (ma=0, tegnap=1, stb.)
          const daysOld = getDaysDifference(backupDate, now);
          
          const willBeDeletedIn = Math.max(0, 5 - daysOld); // 5 nap után törlődik
          
          if (import.meta.env.DEV && daysOld === 0) {
            console.log(`📅 Backup dátum számítás:`, {
              fileName,
              backupDate: backupDate.toISOString(),
              now: now.toISOString(),
              daysOld,
              willBeDeletedIn
            });
          }
          
          history.push({
            fileName,
            filePath, // Teljes útvonal már a backend-ből jön
            timestamp,
            date: backupDate,
            daysOld,
            willBeDeletedIn,
          });
        }
      } catch (error) {
        console.error(`❌ Hiba a backup fájl feldolgozásakor (${fileName}):`, error);
      }
    }

    // Rendezés dátum szerint (legújabb először) - a backend már rendezi, de biztosra megyünk
    history.sort((a, b) => b.date.getTime() - a.date.getTime());

    if (import.meta.env.DEV) {
      console.log("✅ Backup history betöltve:", history.length, "fájl");
    }

    return history;
  } catch (error) {
    console.error("❌ Hiba a backup history lekérdezésénél:", error);
    return [];
  }
}

/**
 * Visszaadja a törlésig hátralévő időt formázott stringként (óra:perc:másodperc)
 * @param willBeDeletedIn napok száma a törlésig
 */
export function getDeletionCountdown(willBeDeletedIn: number): string {
  if (willBeDeletedIn <= 0) {
    return "0:00:00";
  }

  // Számoljuk ki, hogy hány másodperc van hátra a törlésig
  // A willBeDeletedIn napokban van, de a törlés 5 nap után történik
  // Számoljuk ki, hogy hány másodperc van még a 5. nap végéig
  const now = new Date();
  const deletionDate = new Date(now);
  deletionDate.setDate(deletionDate.getDate() + Math.ceil(willBeDeletedIn));
  deletionDate.setHours(23, 59, 59, 999); // A nap végére
  
  const diffMs = deletionDate.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Ellenőrzi, hogy szükség van-e backup emlékeztetőre
 */
export function shouldShowBackupReminder(
  lastBackupDate: string | undefined,
  reminderIntervalDays: number = 7
): boolean {
  if (!lastBackupDate) {
    return true; // Még soha nem volt backup
  }

  const lastBackup = new Date(lastBackupDate);
  const now = new Date();
  const daysSinceBackup = Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));

  return daysSinceBackup >= reminderIntervalDays;
}

/**
 * Visszaadja az utolsó backup dátumát (automatikus vagy manuális)
 * Ellenőrzi az automatikus backup könyvtárat és visszaadja a legújabb backup timestamp-jét
 */
export async function getLastBackupDate(): Promise<string | null> {
  try {
    // Cross-platform backup könyvtár útvonal
    const backupDir = await invoke<string>("get_backup_directory_path");
    
    if (!(await exists(backupDir))) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Backup könyvtár nem létezik:", backupDir);
      }
      return null;
    }

    const entries = await readDir(backupDir);
    const backupFiles = entries
      .filter(entry => entry.name?.endsWith(".json") && entry.name?.startsWith("auto_backup_"))
      .map(entry => entry.name!)
      .sort()
      .reverse(); // Legújabb először

    if (backupFiles.length === 0) {
      if (import.meta.env.DEV) {
        console.log("ℹ️ Nincs automatikus backup fájl");
      }
      return null;
    }

    // Kiolvassuk a legújabb backup fájlt, hogy megkapjuk a dátumát
    const latestBackupPath = await join(backupDir, backupFiles[0]);
    const content = await readTextFile(latestBackupPath);
    const backupData: BackupData = JSON.parse(content);
    
    if (import.meta.env.DEV) {
      console.log("✅ Utolsó backup dátum:", backupData.timestamp, "fájl:", backupFiles[0]);
    }
    
    return backupData.timestamp || null;
  } catch (error) {
    console.error("❌ Hiba az utolsó backup dátumának lekérdezésénél:", error);
    return null;
  }
}

/**
 * Visszaadja az utolsó backup óta eltelt időt pontosabb formátumban
 * @returns Objektum a különböző időegységekkel (minutes, hours, days, weeks, months, years)
 */
export function getTimeSinceBackup(lastBackupDate: string | null): {
  minutes: number;
  hours: number;
  days: number;
  weeks: number;
  months: number;
  years: number;
  totalMinutes: number;
} | null {
  if (!lastBackupDate) {
    return null;
  }

  const lastBackup = new Date(lastBackupDate);
  const now = new Date();
  const diffMs = now.getTime() - lastBackup.getTime();
  
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const totalDays = Math.floor(totalHours / 24);
  const days = totalDays % 7;
  const totalWeeks = Math.floor(totalDays / 7);
  const weeks = totalWeeks % 4;
  const totalMonths = Math.floor(totalDays / 30);
  const months = totalMonths % 12;
  const years = Math.floor(totalDays / 365);

  return {
    minutes,
    hours,
    days,
    weeks,
    months,
    years,
    totalMinutes,
  };
}

