// Console Logger - rögzíti a console üzeneteket és fájlba is ír

import { writeFrontendLog, initFrontendLog, isDirectFileWriteInProgress, isLoggingDisabled } from './fileLogger';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "log" | "info" | "warn" | "error" | "debug";
  message: string;
  data?: any[];
}

class ConsoleLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Maximum logok száma
  private listeners: Set<(logs: LogEntry[]) => void> = new Set();
  private fileLogInitialized = false;

  constructor() {
    this.interceptConsole();
    this.interceptErrors();
    // Inicializáljuk a file logger-t
    this.initFileLogger();
  }

  private async initFileLogger() {
    try {
      // Ellenőrizzük, hogy a logolás engedélyezve van-e
      if (isLoggingDisabled()) {
        // Ha a logolás letiltva van, ne inicializáljuk a logger-t
        return;
      }
      await initFrontendLog();
      this.fileLogInitialized = true;
    } catch (error) {
      console.error('File logger inicializálási hiba:', error);
    }
  }

  // Console metódusok interceptálása
  private interceptConsole() {
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalDebug = console.debug;

    console.log = (...args: any[]) => {
      this.addLog("log", args);
      originalLog.apply(console, args);
    };

    console.info = (...args: any[]) => {
      this.addLog("info", args);
      originalInfo.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      this.addLog("warn", args);
      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.addLog("error", args);
      originalError.apply(console, args);
    };

    console.debug = (...args: any[]) => {
      this.addLog("debug", args);
      originalDebug.apply(console, args);
    };
  }

  // Globális hibák interceptálása
  private interceptErrors() {
    window.addEventListener("error", (event) => {
      this.addLog("error", [
        `Error: ${event.message}`,
        `File: ${event.filename}:${event.lineno}:${event.colno}`,
        event.error,
      ]);
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.addLog("error", [
        `Unhandled Promise Rejection: ${event.reason}`,
        event.reason,
      ]);
    });
  }

  private addLog(level: LogEntry["level"], args: any[]) {
    const message = args
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");

    const logEntry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      data: args.length > 1 ? args : undefined,
    };

    this.logs.push(logEntry);

    // Korlátozzuk a logok számát
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Fájlba is írunk (kivéve ha már közvetlenül írtuk, vagy FilamentLibrary log)
    if (this.fileLogInitialized) {
      // Ne írjuk fájlba, ha a logolás letiltva van (pl. Factory Reset alatt)
      if (isLoggingDisabled()) {
        return; // Ne írjuk fájlba, ha a logolás letiltva van
      }
      
      // Ne írjuk fájlba, ha már közvetlenül írtuk (duplikáció elkerülése)
      if (isDirectFileWriteInProgress()) {
        return; // Ne rögzítsük újra
      }
      
      // FilamentLibrary logokat csak console-ra, ne fájlba (hogy ne legyenek túl korán a logban)
      const isFilamentLibraryLog = message.includes('[FilamentLibrary]');
      
      // Dashboard logokat csak development módban írjuk fájlba
      const isDashboardLog = message.includes('[Dashboard]');
      const isDev = import.meta.env.DEV;
      
      if (!isFilamentLibraryLog && (!isDashboardLog || isDev)) {
        const fileLevel = level === "log" ? "INFO" : level.toUpperCase();
        // Jelöljük, hogy közvetlen fájlba írás történik
        writeFrontendLog(fileLevel as "INFO" | "WARN" | "ERROR" | "DEBUG", message).catch(() => {
          // Ha a file logger nem elérhető, csak console-ra írunk
        });
      }
    }

    // Értesítjük a listener-eket
    this.notifyListeners();
  }

  private notifyListeners() {
    // Aszinkron módon értesítjük a listener-eket, hogy ne akadályozza a renderelést
    // queueMicrotask használata, hogy a következő event loop ciklusban fusson le
    queueMicrotask(() => {
      const logsCopy = [...this.logs];
      this.listeners.forEach((listener) => {
        try {
          listener(logsCopy);
        } catch (error) {
          // Ha a listener hibát dob (pl. unmounted komponens), eltávolítjuk
          console.error("Error in console logger listener:", error);
        }
      });
    });
  }

  // Listener hozzáadása
  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Logok lekérése
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Logok törlése
  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  // Logok exportálása
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const consoleLogger = new ConsoleLogger();

