import { invoke } from "@tauri-apps/api/core";
import { sendNotification, requestPermission, isPermissionGranted } from "@tauri-apps/plugin-notification";

/**
 * Platform specifikus funkciók használata a frontend-ből
 */

/**
 * Értesítési engedély kérése (macOS-on szükséges)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const permissionGranted = await isPermissionGranted();
    if (permissionGranted) {
      return true;
    }
    
    const permission = await requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Értesítési engedély kérése sikertelen:", error);
    return false;
  }
}

/**
 * Ellenőrzi, hogy van-e értesítési engedély
 */
export async function checkNotificationPermission(): Promise<boolean> {
  try {
    return await isPermissionGranted();
  } catch (error) {
    console.error("Értesítési engedély ellenőrzése sikertelen:", error);
    return false;
  }
}

/**
 * Natív értesítés küldése (minden platformon)
 */
export async function sendNativeNotification(title: string, body: string): Promise<void> {
  try {
    const platform = getPlatform();
    
    // Először ellenőrizzük az engedélyt (minden platformon)
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.warn("Nincs értesítési engedély. Kérj engedélyt először!");
      // Próbáljuk meg automatikusan kérni az engedélyt
      console.log(`${platform}: Automatikus engedélykérés próbálása...`);
      const granted = await requestNotificationPermission();
      if (!granted) {
        // Windows és Linux esetén is próbáljuk meg küldeni, lehet hogy működik engedély nélkül is
        if (platform === "windows" || platform === "linux") {
          console.log(`${platform}: Próbáljuk meg küldeni az értesítést engedély nélkül...`);
        } else {
          throw new Error("Értesítési engedély megtagadva");
        }
      }
    }
    
    // A sendNotification API natív értesítést küld minden platformon
    console.log("Értesítés küldése...", { title, body, platform, hasPermission });
    
    await sendNotification({
      title,
      body,
    });
    
    console.log("Értesítés sikeresen elküldve:", { title, body, platform });
    
    // Várunk egy kicsit, hogy az értesítés megjelenjen (főleg macOS-on)
    if (platform === "macos") {
      await new Promise(resolve => setTimeout(resolve, 500));
    } else if (platform === "windows" || platform === "linux") {
      // Windows és Linux esetén is várunk egy kicsit
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } catch (error) {
    console.error("Értesítés küldése sikertelen:", error);
    // Fallback: ha a plugin nem működik, próbáljuk meg az invoke-t
    try {
      await invoke("send_notification", { title, body });
      console.log("Értesítés elküldve invoke fallback-kel");
    } catch (invokeError) {
      console.error("Invoke fallback is sikertelen:", invokeError);
      // Ne dobjunk hibát, csak logoljuk - a toast üzenet már megjelenik
      console.warn("Natív értesítés nem küldhető, de a toast üzenet megjelenik");
    }
  }
}

/**
 * macOS Dock badge beállítása
 * @param badge - A badge szövege (pl. "5" új árajánlatok számára), vagy null a törléshez
 */
export async function setDockBadge(badge: string | null): Promise<void> {
  try {
    // Csak macOS-on működik
    if (typeof window !== "undefined" && navigator.platform.includes("Mac")) {
      await invoke("set_dock_badge", { badge });
    }
  } catch (error) {
    console.error("Dock badge beállítása sikertelen:", error);
  }
}

/**
 * Windows Taskbar progress beállítása
 * @param progress - Progress érték 0.0 és 1.0 között, vagy null a törléshez
 */
export async function setTaskbarProgress(progress: number | null): Promise<void> {
  try {
    // Csak Windows-on működik
    if (typeof window !== "undefined" && navigator.platform.includes("Win")) {
      await invoke("set_taskbar_progress", { progress });
    }
  } catch (error) {
    console.error("Taskbar progress beállítása sikertelen:", error);
  }
}

/**
 * System tray ikon megjelenítése/elrejtése
 */
export async function toggleSystemTray(show: boolean): Promise<void> {
  try {
    await invoke("toggle_system_tray", { show });
  } catch (error) {
    console.error("System tray állapot változtatása sikertelen:", error);
  }
}

/**
 * Platform detektálás helper
 */
export function getPlatform(): "macos" | "windows" | "linux" | "unknown" {
  if (typeof window === "undefined") return "unknown";
  
  const platform = navigator.platform.toLowerCase();
  if (platform.includes("mac")) return "macos";
  if (platform.includes("win")) return "windows";
  if (platform.includes("linux")) return "linux";
  return "unknown";
}

/**
 * Platform specifikus értesítés küldése export műveletekhez
 * @deprecated Használd a notificationService.notifyExportComplete() helyette
 */
export async function notifyExportComplete(fileName: string): Promise<void> {
  // Visszafelé kompatibilitás: próbáljuk meg használni az új service-t
  try {
    const { notifyExportComplete: notifyExport } = await import("./notificationService");
    await notifyExport(fileName);
    return;
  } catch (error) {
    // Ha nincs inicializálva, használjuk a régi módszert
    console.warn("notificationService nincs inicializálva, régi módszer használata");
  }
  
  const platform = getPlatform();
  const title = platform === "macos" 
    ? "Exportálás kész" 
    : platform === "windows"
    ? "Exportálás befejezve"
    : "Exportálás kész";
  
  await sendNativeNotification(title, `${fileName} sikeresen exportálva`);
}

/**
 * Platform specifikus értesítés küldése mentéshez
 * @deprecated Használd a notificationService.notifySaveComplete() helyette
 */
export async function notifySaveComplete(): Promise<void> {
  // Visszafelé kompatibilitás: próbáljuk meg használni az új service-t
  try {
    const { notifySaveComplete: notifySave } = await import("./notificationService");
    await notifySave();
    return;
  } catch (error) {
    // Ha nincs inicializálva, használjuk a régi módszert
    console.warn("notificationService nincs inicializálva, régi módszer használata");
  }
  
  await sendNativeNotification("Mentés", "Adatok sikeresen mentve");
}

/**
 * Platform specifikus értesítés küldése árajánlat státusz változáshoz
 * @deprecated Használd a notificationService.notifyOfferStatusChange() helyette
 */
export async function notifyOfferStatusChange(offerName: string, status: string): Promise<void> {
  // Visszafelé kompatibilitás: próbáljuk meg használni az új service-t
  try {
    const { notifyOfferStatusChange: notifyOffer } = await import("./notificationService");
    await notifyOffer(offerName, status);
    return;
  } catch (error) {
    // Ha nincs inicializálva, használjuk a régi módszert
    console.warn("notificationService nincs inicializálva, régi módszer használata");
  }
  
  await sendNativeNotification(
    "Árajánlat státusz változás",
    `${offerName} státusza: ${status}`
  );
}

