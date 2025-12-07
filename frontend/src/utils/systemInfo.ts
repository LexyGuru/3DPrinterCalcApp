// Rendszerinformációk lekérése és logolása

import { invoke } from "@tauri-apps/api/core";
import { writeFrontendLog } from "./fileLogger";

// Flag, hogy csak egyszer logoljuk a rendszerinformációkat
let systemInfoLogged = false;

export interface SystemInfo {
  system: {
    platform: string;
    os_name: string;
    os_version: string;
    kernel_version: string;
    host_name: string;
  };
  cpu: {
    type: string;
    architecture: string;
    name: string;
    cores: number;
  };
  memory: {
    total_gb: string;
    used_gb: string;
    available_gb: string;
    total_kb: number;
    used_kb: number;
    available_kb: number;
    total_bytes: number;
    used_bytes: number;
    available_bytes: number;
  };
  disk: {
    total_gb: string;
    available_gb: string;
    total_bytes: number;
    available_bytes: number;
  };
  gpu: {
    info: string;
  };
  app: {
    version: string;
  };
}

export interface PerformanceMetrics {
  cpu: {
    usage_percent: string;
    cores: number;
  };
  memory: {
    total_mb: string;
    used_mb: string;
    available_mb: string;
    used_percent: number;
  };
  timestamp: string;
}

/**
 * Lekéri a performance metrikákat a backend-től
 */
export async function getPerformanceMetrics(): Promise<PerformanceMetrics | null> {
  try {
    const metrics = await invoke<PerformanceMetrics>("get_performance_metrics");
    return metrics;
  } catch (error) {
    console.error("❌ Hiba a performance metrikák lekérésekor:", error);
    writeFrontendLog('ERROR', `Performance metrikák lekérési hiba: ${error}`).catch(() => {});
    return null;
  }
}

/**
 * Lekéri a rendszerinformációkat a backend-től
 */
export async function getSystemInfo(): Promise<SystemInfo | null> {
  try {
    const systemInfo = await invoke<SystemInfo>("get_system_info");
    return systemInfo;
  } catch (error) {
    console.error("❌ Hiba a rendszerinformációk lekérésekor:", error);
    writeFrontendLog('ERROR', `Rendszerinformációk lekérési hiba: ${error}`).catch(() => {});
    return null;
  }
}

/**
 * Formázott rendszerinformációk kiírása log formátumban
 */
export function formatSystemInfoForLog(systemInfo: SystemInfo): string {
  const lines: string[] = [];
  
  lines.push("**************************************");
  lines.push("RENDSZERINFORMÁCIÓK");
  lines.push("**************************************");
  lines.push("");
  lines.push(`System: ${systemInfo.cpu.type}`);
  lines.push(`OP: ${systemInfo.system.platform} ${systemInfo.system.os_version}`);
  lines.push(`VER: ${systemInfo.system.os_version} (${systemInfo.system.kernel_version})`);
  lines.push(`Host Name: ${systemInfo.system.host_name}`);
  lines.push("");
  lines.push(`Memory: ${systemInfo.memory.used_gb} GB / ${systemInfo.memory.total_gb} GB használva (${systemInfo.memory.available_gb} GB szabad)`);
  lines.push(`CPU: ${systemInfo.cpu.name} (${systemInfo.cpu.cores} mag)`);
  lines.push(`GPU: ${systemInfo.gpu.info}`);
  lines.push(`Disk: ${systemInfo.disk.available_gb} GB / ${systemInfo.disk.total_gb} GB szabad`);
  lines.push("");
  lines.push(`App Verzió: ${systemInfo.app.version}`);
  lines.push("**************************************");
  
  return lines.join("\n");
}

/**
 * Rendszerinformációk logolása az alkalmazás indításakor
 * Csak egyszer logol, hogy elkerüljük a duplikációt (React StrictMode miatt)
 */
export async function logSystemInfo(): Promise<void> {
  // Ha már logoltuk, ne logoljuk újra
  if (systemInfoLogged) {
    return;
  }
  
  try {
    const systemInfo = await getSystemInfo();
    if (systemInfo) {
      const formattedInfo = formatSystemInfoForLog(systemInfo);
      
      // Egyetlen log bejegyzésként logoljuk, hogy elkerüljük a duplikációt
      // A backend egy sorban fogja kezelni, de a formázás megmarad
      await writeFrontendLog('INFO', formattedInfo);
      console.log(formattedInfo);
      
      // Flag beállítása, hogy ne logoljuk újra
      systemInfoLogged = true;
    }
  } catch (error) {
    console.error("❌ Hiba a rendszerinformációk logolásakor:", error);
    await writeFrontendLog('ERROR', `Rendszerinformációk logolási hiba: ${error}`);
  }
}

/**
 * Rendszerinformációk részletes JSON formátumban logolása
 */
export async function logSystemInfoDetailed(): Promise<SystemInfo | null> {
  try {
    const systemInfo = await getSystemInfo();
    if (systemInfo) {
      await writeFrontendLog('INFO', `RENDSZERINFORMÁCIÓK (JSON): ${JSON.stringify(systemInfo, null, 2)}`);
      return systemInfo;
    }
    return null;
  } catch (error) {
    console.error("❌ Hiba a rendszerinformációk részletes logolásakor:", error);
    await writeFrontendLog('ERROR', `Rendszerinformációk részletes logolási hiba: ${error}`);
    return null;
  }
}

