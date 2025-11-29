// Frontend file logger - Tauri command-on keresztül ír fájlba

import type { Settings } from "../types";
import { 
  createStructuredLogEntry, 
  formatStructuredLogAsJson, 
  extractComponentFromMessage,
  type LogLevel 
} from "./structuredLog";

let logInitialized = false;
let logPath: string | null = null;

// Flag, hogy az alkalmazás már betöltődött - ezt követően írunk fájlba minden logot
let appLoaded = false;

// Globális settings referenciát tárolunk a log formátum és szint beállításához
let currentSettings: Settings | null = null;

// Flag a logolás ideiglenes letiltásához (pl. Factory Reset alatt)
let loggingDisabled = false;

// Deduplikációs mechanizmus: utolsó N log üzenet tárolása, hogy ne írjuk kétszer ugyanazt
const recentLogMessages: Array<{ message: string; timestamp: number }> = [];
const MAX_RECENT_LOGS = 50;
const DEDUP_TIME_WINDOW_MS = 5000; // 5 másodpercen belül duplikációk tiltva

/**
 * Beállítja, hogy az alkalmazás már betöltődött (ezt követően írunk fájlba minden logot)
 */
export function setAppLoaded(loaded: boolean): void {
  appLoaded = loaded;
}

/**
 * Beállítja a jelenlegi settings-et a log formátum és szint beállításához
 */
export function setLogSettings(settings: Settings | null): void {
  currentSettings = settings;
}

/**
 * Ideiglenesen letiltja vagy engedélyezi a logolást (pl. Factory Reset alatt)
 */
export function setLoggingEnabled(enabled: boolean): void {
  loggingDisabled = !enabled;
}

/**
 * Visszaadja, hogy a logolás letiltva van-e
 */
export function isLoggingDisabled(): boolean {
  return loggingDisabled;
}

/**
 * Ellenőrzi, hogy az üzenet duplikált-e (rövid időn belül már logolva volt)
 */
function isDuplicateMessage(message: string): boolean {
  const now = Date.now();
  // Töröljük a régi bejegyzéseket
  while (recentLogMessages.length > 0 && now - recentLogMessages[0].timestamp > DEDUP_TIME_WINDOW_MS) {
    recentLogMessages.shift();
  }
  
  // Ellenőrizzük, hogy van-e ugyanilyen üzenet a time window-on belül
  const isDuplicate = recentLogMessages.some(
    entry => entry.message === message && (now - entry.timestamp) < DEDUP_TIME_WINDOW_MS
  );
  
  if (!isDuplicate) {
    // Hozzáadjuk az új üzenetet
    recentLogMessages.push({ message, timestamp: now });
    // Korlátozzuk a tömb méretét
    if (recentLogMessages.length > MAX_RECENT_LOGS) {
      recentLogMessages.shift();
    }
  }
  
  return isDuplicate;
}

/**
 * Inicializálja a frontend log fájlt
 */
export async function initFrontendLog(): Promise<string | null> {
  // Ha a logolás letiltva van (pl. Factory Reset alatt), ne inicializáljuk a logger-t
  if (loggingDisabled) {
    return null;
  }
  
  if (logInitialized) {
    return logPath;
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const path = await invoke<string>('init_frontend_log');
    logPath = path;
    logInitialized = true;
    await writeFrontendLog('INFO', `Frontend log inicializálva: ${path}`);
    return path;
  } catch (error) {
    console.error('Frontend log inicializálási hiba:', error);
    return null;
  }
}

// Flag, hogy jelezzük a consoleLogger-nek, hogy ez egy közvetlen fájlba írás (ne rögzítse újra)
// Window objektumra kötjük, hogy StrictMode-ban is működjön
let isDirectFileWrite = false;
let directFileWriteTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Ellenőrzi, hogy a log szint megfelel-e a minimum szintnek
 */
function shouldLogLevel(level: LogLevel, minLevel?: LogLevel): boolean {
  if (!minLevel) return true; // Ha nincs minimum szint, mindent logolunk
  
  const levels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR"];
  const levelIndex = levels.indexOf(level);
  const minLevelIndex = levels.indexOf(minLevel);
  
  return levelIndex >= minLevelIndex;
}

/**
 * Ír a frontend log fájlba
 * Szűri a FilamentLibrary logokat, hogy ne jelenjenek meg túl korán
 * Támogatja a strukturált (JSON) és szöveges formátumot is
 */
export async function writeFrontendLog(
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', 
  message: string,
  component?: string,
  context?: Record<string, any>,
  error?: Error | unknown
): Promise<void> {
  try {
    // Ha a logolás letiltva van (pl. Factory Reset alatt), nem írunk fájlba
    if (loggingDisabled) {
      return;
    }
    
    // Log szint ellenőrzése
    const minLogLevel = currentSettings?.logLevel as LogLevel | undefined;
    if (minLogLevel && !shouldLogLevel(level, minLogLevel)) {
      return; // Nem logoljuk, ha a szint alacsonyabb, mint a minimum
    }
    
    // Ha az alkalmazás még nem töltődött be, és FilamentLibrary log, akkor ne írjuk fájlba
    if (!appLoaded && message.includes('[FilamentLibrary]')) {
      // Csak console-ra, ne fájlba
      return;
    }
    
    // Kinyerjük a komponenst az üzenetből, ha nincs megadva
    const extractedComponent = component || extractComponentFromMessage(message);
    
    // Stack trace kinyerése, ha error van
    let stackTrace: string | undefined;
    if (error) {
      if (error instanceof Error && error.stack) {
        stackTrace = error.stack;
      }
    }
    
    // Log formátum meghatározása (JSON vagy szöveges)
    const logFormat = currentSettings?.logFormat || "text";
    
    let formattedMessage: string;
    let format: string;
    
    if (logFormat === "json") {
      // Strukturált log entry létrehozása
      const structuredEntry = createStructuredLogEntry(
        level,
        message,
        extractedComponent,
        context,
        stackTrace
      );
      
      formattedMessage = formatStructuredLogAsJson(structuredEntry);
      format = "json";
    } else {
      // Szöveges formátum (visszafelé kompatibilitás)
      formattedMessage = message;
      format = "text";
    }
    
    // Duplikáció ellenőrzés: ha ugyanazt az üzenetet már logoltuk rövid időn belül, ne írjuk újra
    if (isDuplicateMessage(formattedMessage)) {
      return; // Ne írjuk fájlba újra
    }
    
    // Flag beállítása, hogy a consoleLogger ne rögzítse újra
    // Rövid timeout-tal, hogy ne maradjon örökre bekapcsolva
    isDirectFileWrite = true;
    
    // Eltávolítjuk a korábbi timeout-ot, ha van
    if (directFileWriteTimeout) {
      clearTimeout(directFileWriteTimeout);
    }
    
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('write_frontend_log', { 
      level, 
      message: formattedMessage,
      format: format 
    });
    
    // Flag visszaállítása rövid késleltetés után (hogy a consoleLogger ne rögzítse)
    directFileWriteTimeout = setTimeout(() => {
      isDirectFileWrite = false;
    }, 100);
  } catch (error) {
    isDirectFileWrite = false;
    // Ha a Tauri API nem elérhető, csak console-ra írunk
    console.error('Frontend log írási hiba:', error);
    console.log(`[FRONTEND] [${level}] ${message}`);
  }
}

/**
 * Visszaadja, hogy éppen közvetlen fájlba írás történik-e
 */
export function isDirectFileWriteInProgress(): boolean {
  return isDirectFileWrite;
}

/**
 * Logolás különböző szinteken
 * A consoleLogger automatikusan rögzíti és fájlba is írja ezeket a logokat,
 * ezért itt nem hívjuk meg közvetlenül a writeFrontendLog()-ot
 */
export const frontendLogger = {
  info: (message: string) => {
    console.info(message);
    // A consoleLogger automatikusan rögzíti és fájlba is írja
  },
  warn: (message: string) => {
    console.warn(message);
    // A consoleLogger automatikusan rögzíti és fájlba is írja
  },
  error: (message: string) => {
    console.error(message);
    // A consoleLogger automatikusan rögzíti és fájlba is írja
  },
  debug: (message: string) => {
    console.debug(message);
    // A consoleLogger automatikusan rögzíti és fájlba is írja
  },
};

/**
 * Visszaadja a frontend log fájl útvonalát
 */
export async function getFrontendLogPath(): Promise<string | null> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<string | null>('get_frontend_log_path');
  } catch (error) {
    console.error('Frontend log path lekérési hiba:', error);
    return null;
  }
}

