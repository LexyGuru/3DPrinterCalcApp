// Performance metrikák logolása - betöltési idők, műveleti idők, memória használat

import { writeFrontendLog } from "./fileLogger";
import { getSystemInfo, getPerformanceMetrics } from "./systemInfo";

export type PerformanceMetricType = 
  | "loading" // Betöltési műveletek
  | "operation" // Általános műveletek (mentés, export, import, stb.)
  | "memory" // Memória használat
  | "module" // Modul betöltési idők;

export interface PerformanceMetric {
  type: PerformanceMetricType;
  name: string; // Művelet/modul neve
  duration?: number; // Időtartam milliszekundumban (loading, operation, module esetén)
  memoryBefore?: number; // Memória használat MB-ban művelet előtt (memory, operation esetén)
  memoryAfter?: number; // Memória használat MB-ban művelet után (memory, operation esetén)
  memoryDelta?: number; // Memória változás MB-ban (operation esetén)
  timestamp: string; // ISO 8601 formátum
  context?: Record<string, any>; // További context információk
}

// Aktuális memória használat (window.performance.memory - csak Chrome-ban elérhető)
interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

declare global {
  interface Window {
    performance: {
      memory?: MemoryInfo;
      now(): number;
    };
    chrome?: any;
  }
}

/**
 * Lekéri a jelenlegi memória használatot (ha elérhető)
 */
export function getCurrentMemoryUsage(): number | null {
  if (
    typeof window !== "undefined" &&
    window.performance &&
    window.performance.memory
  ) {
    // usedJSHeapSize bájtban van, MB-ra konvertáljuk
    return window.performance.memory.usedJSHeapSize / (1024 * 1024);
  }
  return null;
}

/**
 * Méri egy aszinkron művelet végrehajtási idejét
 */
export async function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>,
  type: PerformanceMetricType = "operation",
  logMemory: boolean = false
): Promise<T> {
  const startTime = performance.now();
  const memoryBefore = logMemory ? getCurrentMemoryUsage() : null;

  try {
    const result = await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;
    const memoryAfter = logMemory ? getCurrentMemoryUsage() : null;

    // Performance metrika létrehozása
    const metric: PerformanceMetric = {
      type,
      name,
      duration,
      timestamp: new Date().toISOString(),
      ...(memoryBefore !== null && memoryAfter !== null
        ? {
            memoryBefore,
            memoryAfter,
            memoryDelta: memoryAfter - memoryBefore,
          }
        : {}),
    };

    // Logoljuk a metrikát
    await logPerformanceMetric(metric);

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Hiba esetén is logoljuk
    const metric: PerformanceMetric = {
      type,
      name: `${name} (ERROR)`,
      duration,
      timestamp: new Date().toISOString(),
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
    };

    await logPerformanceMetric(metric);
    throw error;
  }
}

/**
 * Méri egy szinkron művelet végrehajtási idejét
 */
export function measureSyncOperation<T>(
  name: string,
  operation: () => T,
  type: PerformanceMetricType = "operation",
  logMemory: boolean = false
): T {
  const startTime = performance.now();
  const memoryBefore = logMemory ? getCurrentMemoryUsage() : null;

  try {
    const result = operation();
    const endTime = performance.now();
    const duration = endTime - startTime;
    const memoryAfter = logMemory ? getCurrentMemoryUsage() : null;

    // Performance metrika létrehozása (aszinkron logolás, hogy ne lassítsa a műveletet)
    const metric: PerformanceMetric = {
      type,
      name,
      duration,
      timestamp: new Date().toISOString(),
      ...(memoryBefore !== null && memoryAfter !== null
        ? {
            memoryBefore,
            memoryAfter,
            memoryDelta: memoryAfter - memoryBefore,
          }
        : {}),
    };

    // Aszinkron logolás (nem várjuk meg)
    logPerformanceMetric(metric).catch(() => {
      // Hiba esetén csendben maradunk
    });

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Hiba esetén is logoljuk
    const metric: PerformanceMetric = {
      type,
      name: `${name} (ERROR)`,
      duration,
      timestamp: new Date().toISOString(),
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
    };

    logPerformanceMetric(metric).catch(() => {
      // Hiba esetén csendben maradunk
    });
    throw error;
  }
}

/**
 * Időmérő osztály a manuális méréshez
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;
  private type: PerformanceMetricType;
  private memoryBefore: number | null;

  constructor(name: string, type: PerformanceMetricType = "operation", logMemory: boolean = false) {
    this.name = name;
    this.type = type;
    this.startTime = performance.now();
    this.memoryBefore = logMemory ? getCurrentMemoryUsage() : null;
  }

  /**
   * Leállítja az időmérést és logolja a metrikát
   */
  async stop(): Promise<PerformanceMetric> {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    const memoryAfter = this.memoryBefore !== null ? getCurrentMemoryUsage() : null;

    const metric: PerformanceMetric = {
      type: this.type,
      name: this.name,
      duration,
      timestamp: new Date().toISOString(),
      context: {}, // Alapértelmezett üres context, hogy ne legyen figyelmeztetés
      ...(this.memoryBefore !== null && memoryAfter !== null
        ? {
            memoryBefore: this.memoryBefore,
            memoryAfter,
            memoryDelta: memoryAfter - this.memoryBefore,
          }
        : {}),
    };

    await logPerformanceMetric(metric);
    return metric;
  }

  /**
   * Leállítja az időmérést hiba esetén
   */
  async stopWithError(error: Error | unknown): Promise<void> {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const metric: PerformanceMetric = {
      type: this.type,
      name: `${this.name} (ERROR)`,
      duration,
      timestamp: new Date().toISOString(),
      context: {
        error: error instanceof Error ? error.message : String(error),
      },
    };

    await logPerformanceMetric(metric);
  }
}

/**
 * Logolja a performance metrikát
 */
async function logPerformanceMetric(metric: PerformanceMetric): Promise<void> {
  try {
    // Strukturált log entry létrehozása
    const context: Record<string, any> = {
      metricType: metric.type,
      ...metric.context,
    };

    if (metric.duration !== undefined) {
      context.durationMs = Math.round(metric.duration * 100) / 100; // 2 tizedesjegyre kerekítve
      context.durationS = Math.round((metric.duration / 1000) * 100) / 100; // Másodpercekben
    }

    if (metric.memoryBefore !== null && metric.memoryBefore !== undefined) {
      context.memoryBeforeMB = Math.round(metric.memoryBefore * 100) / 100;
    }
    if (metric.memoryAfter !== null && metric.memoryAfter !== undefined) {
      context.memoryAfterMB = Math.round(metric.memoryAfter * 100) / 100;
    }
    if (metric.memoryDelta !== null && metric.memoryDelta !== undefined) {
      context.memoryDeltaMB = Math.round(metric.memoryDelta * 100) / 100;
    }

    // Üzenet formázása
    let message = `⚡ [PERFORMANCE] ${metric.name}`;
    if (metric.duration !== undefined) {
      if (metric.duration < 1000) {
        message += ` - ${Math.round(metric.duration)}ms`;
      } else {
        message += ` - ${(metric.duration / 1000).toFixed(2)}s`;
      }
    }
    if (metric.memoryDelta !== null && metric.memoryDelta !== undefined) {
      const deltaSign = metric.memoryDelta >= 0 ? "+" : "";
      message += ` - Memória változás: ${deltaSign}${metric.memoryDelta.toFixed(2)} MB`;
    }
    
    // Context információkat is hozzáadjuk az üzenethez
    if (metric.context) {
      const parts: string[] = [];
      
      // Debug: nézzük meg, mit tartalmaz a context
      if (import.meta.env.DEV) {
        console.log("🔍 logPerformanceMetric context:", metric.context);
      }
      
      // CPU információ
      if (metric.context && metric.context.cpuUsagePercent !== undefined && metric.context.cpuUsagePercent !== null) {
        const cpuPercent = typeof metric.context.cpuUsagePercent === 'string' 
          ? parseFloat(metric.context.cpuUsagePercent) 
          : metric.context.cpuUsagePercent;
        if (!isNaN(cpuPercent) && isFinite(cpuPercent) && cpuPercent >= 0) {
          parts.push(`CPU: ${cpuPercent.toFixed(1)}%`);
        } else if (import.meta.env.DEV) {
          console.warn("⚠️ Invalid CPU percent:", cpuPercent, "from:", metric.context.cpuUsagePercent);
        }
      }
      if (metric.context.cpuCores !== undefined && metric.context.cpuCores !== null) {
        parts.push(`Magok: ${metric.context.cpuCores}`);
      }
      
      // Memória információ (ha van memoryAfterMB)
      if (metric.memoryAfter !== null && metric.memoryAfter !== undefined && !isNaN(metric.memoryAfter)) {
        parts.push(`Memória: ${metric.memoryAfter.toFixed(2)} MB`);
      }
      // Vagy context-ből
      if (metric.context.memoryAfterMB !== undefined && metric.context.memoryAfterMB !== null && metric.memoryAfter === undefined) {
        const memAfter = typeof metric.context.memoryAfterMB === 'string' 
          ? parseFloat(metric.context.memoryAfterMB) 
          : metric.context.memoryAfterMB;
        if (!isNaN(memAfter)) {
          parts.push(`Memória: ${memAfter.toFixed(2)} MB`);
        }
      }
      if (metric.context.usedMB !== undefined && metric.context.usedMB !== null) {
        const usedMB = typeof metric.context.usedMB === 'string' 
          ? parseFloat(metric.context.usedMB) 
          : metric.context.usedMB;
        if (!isNaN(usedMB) && isFinite(usedMB)) {
          parts.push(`Használt: ${usedMB.toFixed(2)} MB`);
        }
      }
      if (metric.context.usedPercent !== undefined && metric.context.usedPercent !== null) {
        const usedPercent = typeof metric.context.usedPercent === 'string' 
          ? parseFloat(metric.context.usedPercent) 
          : metric.context.usedPercent;
        if (!isNaN(usedPercent) && isFinite(usedPercent)) {
          parts.push(`Használat: ${usedPercent.toFixed(1)}%`);
        }
      }
      if (metric.context.totalMB !== undefined && metric.context.totalMB !== null) {
        const totalMB = typeof metric.context.totalMB === 'string' 
          ? parseFloat(metric.context.totalMB) 
          : metric.context.totalMB;
        if (!isNaN(totalMB) && isFinite(totalMB)) {
          parts.push(`Összes: ${totalMB.toFixed(2)} MB`);
        }
      }
      
      if (parts.length > 0) {
        message += ` - ${parts.join(", ")}`;
      } else if (import.meta.env.DEV && metric.context && Object.keys(metric.context).length > 0) {
        // Debug: ha nincsenek parts, nézzük meg miért
        console.warn("⚠️ No parts added to performance message. Context keys:", Object.keys(metric.context), "values:", metric.context);
      }
    } else if (import.meta.env.DEV && metric.type !== "loading") {
      // Csak akkor figyelmeztetünk, ha nem loading típusú metrika (loading metrikáknak nem feltétlenül kell context)
      console.warn("⚠️ No context in performance metric. Metric:", { name: metric.name, type: metric.type, memoryAfter: metric.memoryAfter });
    }

    // Log fájlba írás (JSON formátum, ha JSON formátum van beállítva)
    await writeFrontendLog("INFO", message, "Performance", context);
  } catch (error) {
    // Csendben maradunk, hogy ne akadályozza a műveletet
    console.warn("Performance metrika logolási hiba:", error);
  }
}

/**
 * Memória használat logolása
 */
export async function logMemoryUsage(label: string = "Memory Usage"): Promise<void> {
  try {
    const memoryMB = getCurrentMemoryUsage();
    
    if (memoryMB !== null) {
      const metric: PerformanceMetric = {
        type: "memory",
        name: label,
        timestamp: new Date().toISOString(),
        memoryAfter: memoryMB,
      };

      await logPerformanceMetric(metric);
    } else {
      // Ha nem elérhető a memória információ, próbáljuk meg a backend-től lekérni
      try {
        const systemInfo = await getSystemInfo();
        if (systemInfo) {
          const usedGB = parseFloat(systemInfo.memory.used_gb);
          const usedMB = usedGB * 1024;

          const metric: PerformanceMetric = {
            type: "memory",
            name: label,
            timestamp: new Date().toISOString(),
            memoryAfter: usedMB,
            context: {
              totalGB: systemInfo.memory.total_gb,
              usedGB: systemInfo.memory.used_gb,
              availableGB: systemInfo.memory.available_gb,
              source: "backend",
            },
          };

          await logPerformanceMetric(metric);
        }
      } catch (error) {
        // Csendben maradunk
        console.warn("Backend memória lekérési hiba:", error);
      }
    }
  } catch (error) {
    console.warn("Memória használat logolási hiba:", error);
  }
}

/**
 * Performance metrikák rendszeres logolása (CPU, memória)
 */
export async function logPeriodicPerformanceMetrics(): Promise<void> {
  try {
    const metrics = await getPerformanceMetrics();
    
    if (!metrics) {
      return;
    }
    
    // CPU metrika logolása
    if (metrics.cpu) {
      const cpuUsagePercent = parseFloat(metrics.cpu.usage_percent || "0");
      
      // Debug: ellenőrizzük, hogy valid értékeket kaptunk-e
      if (import.meta.env.DEV) {
        console.log("🔍 Performance CPU metrika:", {
          usage_percent: metrics.cpu.usage_percent,
          parsed: cpuUsagePercent,
          cores: metrics.cpu.cores,
          isNaN: isNaN(cpuUsagePercent),
          isFinite: isFinite(cpuUsagePercent),
        });
      }
      
      // Csak akkor logoljuk, ha valid értékeket kaptunk
      if (!isNaN(cpuUsagePercent) && isFinite(cpuUsagePercent)) {
        const cpuMetric: PerformanceMetric = {
          type: "operation",
          name: "Periodic CPU Usage",
          timestamp: metrics.timestamp,
          context: {
            cpuUsagePercent: cpuUsagePercent,
            cpuCores: metrics.cpu.cores,
          },
        };
        await logPerformanceMetric(cpuMetric);
      } else if (import.meta.env.DEV) {
        console.error("❌ Invalid CPU usage percent:", metrics.cpu.usage_percent, "parsed:", cpuUsagePercent);
      }
    }
    
    // Memória metrika logolása
    if (metrics.memory) {
      const usedMB = parseFloat(metrics.memory.used_mb || "0");
      const totalMB = parseFloat(metrics.memory.total_mb || "0");
      const availableMB = parseFloat(metrics.memory.available_mb || "0");
      const usedPercent = typeof metrics.memory.used_percent === 'number' ? metrics.memory.used_percent : parseFloat(String(metrics.memory.used_percent || "0"));
      
      // Debug: ellenőrizzük, hogy valid értékeket kaptunk-e
      if (import.meta.env.DEV) {
        console.log("🔍 Performance Memory metrika:", {
          used_mb: metrics.memory.used_mb,
          total_mb: metrics.memory.total_mb,
          available_mb: metrics.memory.available_mb,
          used_percent: metrics.memory.used_percent,
          parsed_used: usedMB,
          parsed_total: totalMB,
          parsed_available: availableMB,
          parsed_percent: usedPercent,
        });
      }
      
      // Csak akkor logoljuk, ha valid értékeket kaptunk
      if (!isNaN(usedMB) && isFinite(usedMB) && usedMB > 0) {
        const memoryMetric: PerformanceMetric = {
          type: "memory",
          name: "Periodic Memory Usage",
          timestamp: metrics.timestamp,
          memoryAfter: usedMB,
          context: {
            totalMB: !isNaN(totalMB) && isFinite(totalMB) ? totalMB : 0,
            usedMB: usedMB,
            availableMB: !isNaN(availableMB) && isFinite(availableMB) ? availableMB : 0,
            usedPercent: !isNaN(usedPercent) && isFinite(usedPercent) ? usedPercent : 0,
          },
        };
        await logPerformanceMetric(memoryMetric);
      } else if (import.meta.env.DEV) {
        console.error("❌ Invalid memory metrics:", {
          used_mb: metrics.memory.used_mb,
          parsed: usedMB,
        });
      }
    }
  } catch (error) {
    // Csendben maradunk, hogy ne zavarjuk a műveletet
    console.warn("Performance metrikák rendszeres logolási hiba:", error);
  }
}

/**
 * Performance metrikák összefoglaló logolása
 */
export async function logPerformanceSummary(
  metrics: PerformanceMetric[]
): Promise<void> {
  try {
    const loadingMetrics = metrics.filter((m) => m.type === "loading");
    const operationMetrics = metrics.filter((m) => m.type === "operation");
    const moduleMetrics = metrics.filter((m) => m.type === "module");

    const totalLoadingTime = loadingMetrics.reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );
    const totalOperationTime = operationMetrics.reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );
    const totalModuleTime = moduleMetrics.reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );

    const summary = {
      loading: {
        count: loadingMetrics.length,
        totalTimeMs: Math.round(totalLoadingTime * 100) / 100,
        totalTimeS: Math.round((totalLoadingTime / 1000) * 100) / 100,
        averageTimeMs:
          loadingMetrics.length > 0
            ? Math.round((totalLoadingTime / loadingMetrics.length) * 100) / 100
            : 0,
      },
      operations: {
        count: operationMetrics.length,
        totalTimeMs: Math.round(totalOperationTime * 100) / 100,
        totalTimeS: Math.round((totalOperationTime / 1000) * 100) / 100,
        averageTimeMs:
          operationMetrics.length > 0
            ? Math.round(
                (totalOperationTime / operationMetrics.length) * 100
              ) / 100
            : 0,
      },
      modules: {
        count: moduleMetrics.length,
        totalTimeMs: Math.round(totalModuleTime * 100) / 100,
        totalTimeS: Math.round((totalModuleTime / 1000) * 100) / 100,
        averageTimeMs:
          moduleMetrics.length > 0
            ? Math.round((totalModuleTime / moduleMetrics.length) * 100) / 100
            : 0,
      },
    };

    await writeFrontendLog(
      "INFO",
      `⚡ [PERFORMANCE SUMMARY] Betöltés: ${summary.loading.count} művelet, ${summary.loading.totalTimeS}s összesen (átlag: ${summary.loading.averageTimeMs}ms) | Műveletek: ${summary.operations.count} művelet, ${summary.operations.totalTimeS}s összesen (átlag: ${summary.operations.averageTimeMs}ms) | Modulok: ${summary.modules.count} modul, ${summary.modules.totalTimeS}s összesen (átlag: ${summary.modules.averageTimeMs}ms)`,
      "Performance",
      summary
    );
  } catch (error) {
    console.warn("Performance összefoglaló logolási hiba:", error);
  }
}

