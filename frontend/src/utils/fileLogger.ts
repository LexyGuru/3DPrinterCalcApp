// Frontend file logger - Tauri command-on keresztül ír fájlba

let logInitialized = false;
let logPath: string | null = null;

/**
 * Inicializálja a frontend log fájlt
 */
export async function initFrontendLog(): Promise<string | null> {
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

/**
 * Ír a frontend log fájlba
 */
export async function writeFrontendLog(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string): Promise<void> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('write_frontend_log', { level, message });
  } catch (error) {
    // Ha a Tauri API nem elérhető, csak console-ra írunk
    console.error('Frontend log írási hiba:', error);
    console.log(`[FRONTEND] [${level}] ${message}`);
  }
}

/**
 * Logolás különböző szinteken
 */
export const frontendLogger = {
  info: (message: string) => {
    console.info(message);
    writeFrontendLog('INFO', message).catch(() => {});
  },
  warn: (message: string) => {
    console.warn(message);
    writeFrontendLog('WARN', message).catch(() => {});
  },
  error: (message: string) => {
    console.error(message);
    writeFrontendLog('ERROR', message).catch(() => {});
  },
  debug: (message: string) => {
    console.debug(message);
    writeFrontendLog('DEBUG', message).catch(() => {});
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

