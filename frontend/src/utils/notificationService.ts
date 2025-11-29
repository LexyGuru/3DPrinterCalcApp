/**
 * Egységes értesítési service - Toast és platform notification központi kezelése
 * v1.8.0
 */

import type { Settings } from "../types";
import { sendNativeNotification } from "./platformFeatures";

/**
 * Értesítés típusa
 */
export type NotificationType = "success" | "error" | "info" | "warning";

/**
 * Értesítés prioritása - meghatározza, hogy platform notification is küldjön-e
 */
export type NotificationPriority = "low" | "normal" | "high";

/**
 * Értesítési beállítások
 */
export interface NotificationOptions {
  /** Értesítés típusa */
  type: NotificationType;
  /** Értesítés prioritása (meghatározza, hogy platform notification is küldjön-e) */
  priority?: NotificationPriority;
  /** Toast megjelenítése (alapértelmezett: true) */
  showToast?: boolean;
  /** Platform notification küldése (alapértelmezett: priority === "high") */
  sendPlatformNotification?: boolean;
  /** Toast időtartama (ms), ha undefined, akkor a settings értéket használja */
  duration?: number;
}

/**
 * Toast callback típusa (dinamikus import miatt)
 */
type ToastCallback = (message: string, type: NotificationType) => void;

/**
 * Globális toast callback (dinamikus import miatt)
 */
let toastCallback: ToastCallback | null = null;

/**
 * Globális settings referencia (dinamikus import miatt)
 */
let currentSettings: Settings | null = null;

/**
 * Inicializálja a notification service-t
 * @param settings - Aktuális beállítások
 * @param toastShowFn - Toast megjelenítés callback (useToast hook-ból)
 */
export function initNotificationService(
  settings: Settings,
  toastShowFn: ToastCallback
): void {
  currentSettings = settings;
  toastCallback = toastShowFn;
}

/**
 * Frissíti a beállításokat
 * @param settings - Új beállítások
 */
export function updateNotificationSettings(settings: Settings): void {
  currentSettings = settings;
}

/**
 * Platform notification küldés helper
 */
async function sendPlatformNotificationDynamic(
  title: string,
  body: string
): Promise<void> {
  try {
    await sendNativeNotification(title, body);
  } catch (error) {
    console.error("NotificationService: Platform notification hiba:", error);
    // Ne dobjunk hibát, csak logoljuk
  }
}

/**
 * Egységes értesítés küldése
 * 
 * @param message - Értesítés üzenete
 * @param options - Értesítési beállítások
 * 
 * @example
 * ```typescript
 * // Egyszerű toast
 * notify("Sikeres mentés", { type: "success" });
 * 
 * // Toast + platform notification (magas prioritás)
 * notify("Fontos figyelmeztetés", { 
 *   type: "warning", 
 *   priority: "high" 
 * });
 * 
 * // Csak platform notification
 * notify("Háttérben történt esemény", {
 *   type: "info",
 *   showToast: false,
 *   sendPlatformNotification: true
 * });
 * ```
 */
export async function notify(
  message: string,
  options: NotificationOptions
): Promise<void> {
  // Ha az értesítések teljesen ki vannak kapcsolva
  if (currentSettings?.notificationEnabled === false) {
    return;
  }

  const {
    type,
    priority = "normal",
    showToast = true,
    sendPlatformNotification = priority === "high",
  } = options;

  // Toast megjelenítése (ha engedélyezve)
  if (showToast && toastCallback) {
    toastCallback(message, type);
  }

  // Platform notification küldése (ha engedélyezve és szükséges)
  if (sendPlatformNotification) {
    // Csak akkor küldünk platform notification-t, ha az értesítések engedélyezve vannak
    // és van engedély (vagy automatikusan kérjük)
    try {
      const title = getNotificationTitle(type);
      await sendPlatformNotificationDynamic(title, message);
    } catch (error) {
      // Ne dobjunk hibát, csak logoljuk
      console.warn("NotificationService: Platform notification nem küldhető:", error);
    }
  }
}

/**
 * Egyszerű értesítés küldése (rövidített API)
 * 
 * @param message - Értesítés üzenete
 * @param type - Értesítés típusa
 * @param priority - Értesítés prioritása (opcionális)
 */
export async function notifySimple(
  message: string,
  type: NotificationType,
  priority: NotificationPriority = "normal"
): Promise<void> {
  await notify(message, { type, priority });
}

/**
 * Platform notification címe az értesítés típusa alapján
 */
function getNotificationTitle(type: NotificationType): string {
  const language = currentSettings?.language || "hu";
  
  // Alapértelmezett címek (magyarul)
  const titles: Record<NotificationType, Record<string, string>> = {
    success: {
      hu: "Sikeres művelet",
      en: "Success",
      de: "Erfolg",
      fr: "Succès",
      it: "Successo",
      es: "Éxito",
      pl: "Sukces",
      cs: "Úspěch",
      sk: "Úspech",
      pt: "Sucesso",
      ru: "Успех",
      uk: "Успіх",
      zh: "成功",
    },
    error: {
      hu: "Hiba",
      en: "Error",
      de: "Fehler",
      fr: "Erreur",
      it: "Errore",
      es: "Error",
      pl: "Błąd",
      cs: "Chyba",
      sk: "Chyba",
      pt: "Erro",
      ru: "Ошибка",
      uk: "Помилка",
      zh: "错误",
    },
    warning: {
      hu: "Figyelmeztetés",
      en: "Warning",
      de: "Warnung",
      fr: "Avertissement",
      it: "Avviso",
      es: "Advertencia",
      pl: "Ostrzeżenie",
      cs: "Varování",
      sk: "Varovanie",
      pt: "Aviso",
      ru: "Предупреждение",
      uk: "Попередження",
      zh: "警告",
    },
    info: {
      hu: "Információ",
      en: "Information",
      de: "Information",
      fr: "Information",
      it: "Informazione",
      es: "Información",
      pl: "Informacja",
      cs: "Informace",
      sk: "Informácia",
      pt: "Informação",
      ru: "Информация",
      uk: "Інформація",
      zh: "信息",
    },
  };

  // Fallback: ha nincs fordítás, akkor magyar vagy angol
  return titles[type][language] || titles[type]["hu"] || titles[type]["en"];
}

/**
 * Export műveletek értesítése (magas prioritás, platform notification)
 */
export async function notifyExportComplete(fileName: string): Promise<void> {
  const language = currentSettings?.language || "hu";
  const messages: Record<string, string> = {
    hu: `${fileName} sikeresen exportálva`,
    en: `${fileName} successfully exported`,
    de: `${fileName} erfolgreich exportiert`,
    fr: `${fileName} exporté avec succès`,
    it: `${fileName} esportato con successo`,
    es: `${fileName} exportado exitosamente`,
    pl: `${fileName} pomyślnie wyeksportowane`,
    cs: `${fileName} úspěšně exportováno`,
    sk: `${fileName} úspešne exportované`,
    pt: `${fileName} exportado com sucesso`,
    ru: `${fileName} успешно экспортирован`,
    uk: `${fileName} успішно експортовано`,
    zh: `${fileName} 导出成功`,
  };

  await notify(messages[language] || messages["en"], {
    type: "success",
    priority: "high",
  });
}

/**
 * Mentés értesítése
 */
export async function notifySaveComplete(): Promise<void> {
  const language = currentSettings?.language || "hu";
  const messages: Record<string, string> = {
    hu: "Adatok sikeresen mentve",
    en: "Data successfully saved",
    de: "Daten erfolgreich gespeichert",
    fr: "Données enregistrées avec succès",
    it: "Dati salvati con successo",
    es: "Datos guardados exitosamente",
    pl: "Dane pomyślnie zapisane",
    cs: "Data úspěšně uložena",
    sk: "Dáta úspešne uložené",
    pt: "Dados salvos com sucesso",
    ru: "Данные успешно сохранены",
    uk: "Дані успішно збережено",
    zh: "数据已成功保存",
  };

  await notify(messages[language] || messages["en"], {
    type: "success",
    priority: "normal",
  });
}

/**
 * Árajánlat státusz változás értesítése
 */
export async function notifyOfferStatusChange(
  offerName: string,
  status: string
): Promise<void> {
  const language = currentSettings?.language || "hu";
  const messages: Record<string, (name: string, status: string) => string> = {
    hu: (n, s) => `${n} státusza: ${s}`,
    en: (n, s) => `${n} status: ${s}`,
    de: (n, s) => `${n} Status: ${s}`,
    fr: (n, s) => `Statut de ${n}: ${s}`,
    it: (n, s) => `Stato di ${n}: ${s}`,
    es: (n, s) => `Estado de ${n}: ${s}`,
    pl: (n, s) => `Status ${n}: ${s}`,
    cs: (n, s) => `Status ${n}: ${s}`,
    sk: (n, s) => `Status ${n}: ${s}`,
    pt: (n, s) => `Status de ${n}: ${s}`,
    ru: (n, s) => `Статус ${n}: ${s}`,
    uk: (n, s) => `Статус ${n}: ${s}`,
    zh: (n, s) => `${n} 状态: ${s}`,
  };

  const messageFn = messages[language] || messages["en"];
  await notify(messageFn(offerName, status), {
    type: "info",
    priority: "high",
  });
}

