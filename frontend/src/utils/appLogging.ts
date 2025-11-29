// Központi alkalmazás logolási rendszer - logikus sorrend, nincs duplikáció

import { writeFrontendLog } from "./fileLogger";
import { getSystemInfo, formatSystemInfoForLog } from "./systemInfo";
import { getLogDirectoryInfo, getBackupDirectoryInfo, formatDirectoryInfoForLog } from "./directoryInfo";

// Session flag - egy alkalmazás munkamenet során csak egyszer logolunk
// Window objektumra kötjük, hogy ne veszítsük el StrictMode-ban
const getSessionFlags = () => {
  const key = '__app_logging_flags__';
  if (!(window as any)[key]) {
    (window as any)[key] = {
      systemInfoLogged: false,
      directoryInfoLogged: false,
    };
  }
  return (window as any)[key];
};

/**
 * Session flag-ek resetelése (Factory Reset után vagy új indításnál)
 */
export function resetLoggingFlags(): void {
  const key = '__app_logging_flags__';
  (window as any)[key] = {
    systemInfoLogged: false,
    directoryInfoLogged: false,
  };
}

/**
 * Alkalmazás indítás logolása - logikus sorrendben, egyszeri futtatással
 * @param logSystemInfo - Logolja-e a rendszerinformációkat
 * @param logDirectories - Logolja-e a mappa információkat
 */
export async function logApplicationStartup(
  logSystemInfo: boolean = true,
  logDirectories: boolean = true
): Promise<void> {
  try {
    const flags = getSessionFlags();
    
    // Elválasztó sor - logikus struktúra
    await writeFrontendLog('INFO', '═══════════════════════════════════════════════════════════');
    await writeFrontendLog('INFO', '📋 ALKALMAZÁS INDÍTÁSI INFORMÁCIÓK');
    await writeFrontendLog('INFO', '═══════════════════════════════════════════════════════════');
    
    // 1. Először logoljuk a rendszerinformációkat (ha még nem logoltuk)
    if (logSystemInfo && !flags.systemInfoLogged) {
      const systemInfo = await getSystemInfo();
      if (systemInfo) {
        const formattedInfo = formatSystemInfoForLog(systemInfo);
        // Csak fájlba írunk, ne console-ra (hogy ne legyen duplikáció a consoleLogger miatt)
        await writeFrontendLog('INFO', formattedInfo);
        flags.systemInfoLogged = true;
      }
    }

    // 2. Mappa információk logolása (ha még nem logoltuk)
    if (logDirectories && !flags.directoryInfoLogged) {
      // Log mappa információk
      const logDirInfo = await getLogDirectoryInfo();
      if (logDirInfo) {
        const formattedInfo = formatDirectoryInfoForLog(logDirInfo, "Log");
        // Csak fájlba írunk, ne console-ra (hogy ne legyen duplikáció a consoleLogger miatt)
        await writeFrontendLog('INFO', formattedInfo);
      }

      // Backup mappa információk
      const backupDirInfo = await getBackupDirectoryInfo();
      if (backupDirInfo) {
        const formattedInfo = formatDirectoryInfoForLog(backupDirInfo, "Backup");
        // Csak fájlba írunk, ne console-ra (hogy ne legyen duplikáció a consoleLogger miatt)
        await writeFrontendLog('INFO', formattedInfo);
      }

      flags.directoryInfoLogged = true;
    }
    
    // Elválasztó sor - logikus struktúra
    await writeFrontendLog('INFO', '═══════════════════════════════════════════════════════════');
  } catch (error) {
    console.error("❌ Hiba az alkalmazás indítás logolásakor:", error);
    await writeFrontendLog('ERROR', `Alkalmazás indítás logolási hiba: ${error}`).catch(() => {});
  }
}

