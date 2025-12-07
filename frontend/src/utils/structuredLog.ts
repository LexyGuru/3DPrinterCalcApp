// Strukturált log entry interfészek és formázó függvények

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface StructuredLogEntry {
  timestamp: string; // ISO 8601 formátum
  level: LogLevel;
  component?: string; // Komponens/forrás (pl. "Settings", "Backup", "App")
  message: string;
  stackTrace?: string; // Stack trace, ha hiba esetén
  context?: Record<string, any>; // További context információk (JSON objektum)
  sessionId?: string; // Session ID a logok csoportosításához
}

/**
 * Formázza a strukturált log entry-t JSON formátumba
 */
export function formatStructuredLogAsJson(entry: StructuredLogEntry): string {
  return JSON.stringify(entry, null, 0); // Kompakt JSON (nincs indentálás, hogy ne legyen túl nagy)
}

/**
 * Formázza a strukturált log entry-t szöveges formátumba (kompatibilitás)
 */
export function formatStructuredLogAsText(entry: StructuredLogEntry): string {
  const parts: string[] = [];
  
  parts.push(`[${entry.timestamp}]`);
  parts.push(`[${entry.level}]`);
  
  if (entry.component) {
    parts.push(`[${entry.component}]`);
  }
  
  parts.push(entry.message);
  
  if (entry.context && Object.keys(entry.context).length > 0) {
    try {
      parts.push(JSON.stringify(entry.context));
    } catch {
      // Ha nem sikerül JSON formázni, kihagyjuk
    }
  }
  
  if (entry.stackTrace) {
    parts.push(`\nStack trace:\n${entry.stackTrace}`);
  }
  
  return parts.join(" ");
}

/**
 * Létrehoz egy strukturált log entry-t egy egyszerű üzenetből
 */
export function createStructuredLogEntry(
  level: LogLevel,
  message: string,
  component?: string,
  context?: Record<string, any>,
  stackTrace?: string
): StructuredLogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    component,
    message,
    context,
    stackTrace,
  };
}

/**
 * Kinyeri a komponens nevét egy üzenetből (ha tartalmaz [Component] formátumot)
 */
export function extractComponentFromMessage(message: string): string | undefined {
  const match = message.match(/\[([^\]]+)\]/);
  return match ? match[1] : undefined;
}

/**
 * Kinyeri a stack trace-et egy error objektumból
 */
export function extractStackTrace(error: Error | unknown): string | undefined {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }
  return undefined;
}

