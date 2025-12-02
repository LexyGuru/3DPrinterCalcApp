// Audit log implementálása kritikus műveletekhez

import { invoke } from "@tauri-apps/api/core";

export type AuditLogAction =
  | "login" // Bejelentkezés (ha app jelszavas védelem lesz)
  | "logout" // Kijelentkezés
  | "create" // Adat létrehozása
  | "update" // Adat módosítása
  | "delete" // Adat törlése
  | "export" // Adat exportálása
  | "import" // Adat importálása
  | "settings_change" // Beállítások módosítása
  | "backup_create" // Backup létrehozása
  | "backup_restore" // Backup visszaállítása
  | "factory_reset" // Factory Reset
  | "password_change" // Jelszó változtatás (ha jelszavas védelem lesz)
  | "encryption_enable" // Titkosítás bekapcsolása
  | "encryption_disable"; // Titkosítás kikapcsolása

export type AuditLogEntity =
  | "printer" // Nyomtató
  | "filament" // Filament
  | "offer" // Árajánlat
  | "customer" // Ügyfél
  | "settings" // Beállítások
  | "backup" // Backup
  | "project" // Projekt (ha projekt modul lesz)
  | "task" // Feladat (ha feladat modul lesz)
  | "app"; // Alkalmazás szintű műveletek

export interface AuditLogEntry {
  timestamp: string; // ISO 8601 formátum
  action: AuditLogAction;
  entity: AuditLogEntity;
  entityId?: string | number; // Entitás ID (ha van)
  entityName?: string; // Entitás név (olvashatóság miatt)
  userId?: string; // Felhasználó ID (ha multi-user lesz később)
  details?: Record<string, any>; // További részletek
  ipAddress?: string; // IP cím (ha elérhető)
  userAgent?: string; // User agent (ha elérhető)
  success: boolean; // Sikeres volt-e a művelet
  errorMessage?: string; // Hibaüzenet (ha volt hiba)
}

/**
 * Audit log entry írása
 */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    // Backend command hívása az audit log írásához
    await invoke<void>("write_audit_log", {
      entry: {
        timestamp: entry.timestamp,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        entityName: entry.entityName,
        userId: entry.userId,
        details: entry.details || {},
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        success: entry.success,
        errorMessage: entry.errorMessage,
      },
    });
  } catch (error) {
    // Ha az audit log írás sikertelen, logoljuk console-ra, de ne dobjunk hibát
    console.error("Audit log írási hiba:", error);
    console.warn("Audit log entry:", entry);
  }
}

/**
 * Helper függvény: Create művelet logolása
 */
export async function auditCreate(
  entity: AuditLogEntity,
  entityId: string | number,
  entityName?: string,
  details?: Record<string, any>
): Promise<void> {
  await writeAuditLog({
    timestamp: new Date().toISOString(),
    action: "create",
    entity,
    entityId,
    entityName,
    details,
    success: true,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });
}

/**
 * Helper függvény: Update művelet logolása
 */
export async function auditUpdate(
  entity: AuditLogEntity,
  entityId: string | number,
  entityName?: string,
  details?: Record<string, any>
): Promise<void> {
  await writeAuditLog({
    timestamp: new Date().toISOString(),
    action: "update",
    entity,
    entityId,
    entityName,
    details,
    success: true,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });
}

/**
 * Helper függvény: Delete művelet logolása
 */
export async function auditDelete(
  entity: AuditLogEntity,
  entityId: string | number,
  entityName?: string,
  details?: Record<string, any>
): Promise<void> {
  await writeAuditLog({
    timestamp: new Date().toISOString(),
    action: "delete",
    entity,
    entityId,
    entityName,
    details,
    success: true,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });
}

/**
 * Helper függvény: Settings változtatás logolása
 */
export async function auditSettingsChange(
  settingKey: string,
  oldValue: any,
  newValue: any,
  details?: Record<string, any>
): Promise<void> {
  await writeAuditLog({
    timestamp: new Date().toISOString(),
    action: "settings_change",
    entity: "settings",
    entityName: settingKey,
    details: {
      settingKey,
      oldValue,
      newValue,
      ...details,
    },
    success: true,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });
}

/**
 * Helper függvény: Backup művelet logolása
 */
export async function auditBackup(
  action: "backup_create" | "backup_restore",
  backupFileName?: string,
  details?: Record<string, any>
): Promise<void> {
  await writeAuditLog({
    timestamp: new Date().toISOString(),
    action: action === "backup_create" ? "backup_create" : "backup_restore",
    entity: "backup",
    entityName: backupFileName,
    details,
    success: true,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });
}

/**
 * Helper függvény: Factory Reset logolása
 */
export async function auditFactoryReset(details?: Record<string, any>): Promise<void> {
  await writeAuditLog({
    timestamp: new Date().toISOString(),
    action: "factory_reset",
    entity: "app",
    details,
    success: true,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });
}

/**
 * Helper függvény: Hiba logolása
 */
export async function auditError(
  action: AuditLogAction,
  entity: AuditLogEntity,
  error: Error | unknown,
  entityId?: string | number,
  entityName?: string,
  details?: Record<string, any>
): Promise<void> {
  await writeAuditLog({
    timestamp: new Date().toISOString(),
    action,
    entity,
    entityId,
    entityName,
    details,
    success: false,
    errorMessage: error instanceof Error ? error.message : String(error),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  });
}

/**
 * Audit log fájlok listázása
 */
export interface AuditLogHistoryItem {
  fileName: string;
  filePath: string;
  size: string; // Formatted size (e.g., "1.2 MB")
  date: Date;
}

/**
 * Fájlméret formázása human-readable formátumra
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

export async function listAuditLogs(): Promise<AuditLogHistoryItem[]> {
  try {
    const logs = await invoke<Array<[string, string, number]>>("list_audit_logs");
    
    return logs.map(([fileName, filePath, fileSize]) => {
      // Parse date from filename: audit-YYYY-MM-DD.json
      const dateMatch = fileName.match(/audit-(\d{4}-\d{2}-\d{2})\.json/);
      const date = dateMatch 
        ? new Date(dateMatch[1] + "T00:00:00")
        : new Date();
      
      return {
        fileName,
        filePath,
        size: formatFileSize(fileSize),
        date,
      };
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date, newest first
  } catch (error) {
    console.error("❌ Hiba az audit log fájlok listázásakor:", error);
    return [];
  }
}

/**
 * Audit log fájl olvasása
 */
export async function readAuditLogFile(filePath: string): Promise<AuditLogEntry[]> {
  try {
    const content = await invoke<string>("read_audit_log_file", { filePath });
    
    // Parse JSON array from file content
    const entries: AuditLogEntry[] = JSON.parse(content);
    return entries;
  } catch (error) {
    console.error("❌ Hiba az audit log fájl olvasásakor:", error);
    throw error;
  }
}

/**
 * Audit log könyvtár útvonalának lekérdezése
 */
export async function getAuditLogDirectoryPath(): Promise<string> {
  try {
    return await invoke<string>("get_audit_log_directory_path");
  } catch (error) {
    console.error("❌ Hiba az audit log könyvtár útvonalának lekérdezésénél:", error);
    throw error;
  }
}

