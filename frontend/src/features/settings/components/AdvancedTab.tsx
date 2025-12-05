import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Settings } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";
import { getAutomaticBackupHistory, getDeletionCountdown, type BackupHistoryItem } from "../../../utils/backup";
import { auditSettingsChange } from "../../../utils/auditLog";
import { saveSettings } from "../../../utils/store";
import { sendNativeNotification, setDockBadge, getPlatform, requestNotificationPermission, checkNotificationPermission } from "../../../utils/platformFeatures";
import { invoke } from "@tauri-apps/api/core";

interface AdvancedTabProps {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  onShowShortcutHelp: () => void;
  onShowVersionHistory: () => void;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({
  settings,
  onChange,
  theme,
  themeStyles,
  showToast,
  onShowShortcutHelp,
  onShowVersionHistory,
}) => {
  const t = useTranslation(settings.language);
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([]);
  const [showAutosaveModal, setShowAutosaveModal] = useState(false);
  const [previousAutosaveState, setPreviousAutosaveState] = useState<boolean | undefined>(settings.autosave);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState<boolean | null>(null);
  const [hideMacOSWarningTemporarily, setHideMacOSWarningTemporarily] = useState(false);

  // Helper függvény a backup history betöltéséhez
  const loadBackupHistory = useCallback(async () => {
    try {
      const history = await getAutomaticBackupHistory();
      setBackupHistory(history);
    } catch (error) {
      console.error("❌ Hiba a backup history betöltésekor:", error);
      setBackupHistory([]);
    }
  }, []);

  // Backup history betöltése - mindig látható
  useEffect(() => {
    loadBackupHistory();
    const interval = setInterval(loadBackupHistory, 10000);
    return () => clearInterval(interval);
  }, [loadBackupHistory]);

  // Értesítési engedély ellenőrzése
  useEffect(() => {
    if (settings.notificationEnabled !== false && getPlatform() === "macos") {
      checkNotificationPermission().then(setNotificationPermissionGranted);
    }
  }, [settings.notificationEnabled]);

  return (
    <>
      {/* Automatikus mentés */}
      <div data-tutorial="autosave-section" style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.autosaveDescription")}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            fontWeight: "600", 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
            cursor: "pointer" 
          }}>
            <input
              type="checkbox"
              checked={settings.autosave === true}
              onChange={async (e) => {
                const newValue = e.target.checked;
                if (newValue && !previousAutosaveState) {
                  setShowAutosaveModal(true);
                } else {
                  const newSettings = { ...settings, autosave: newValue };
                  onChange(newSettings);
                  try {
                    await auditSettingsChange("autosave", settings.autosave, newValue, {
                      previousAutosave: settings.autosave,
                      newAutosave: newValue,
                    });
                  } catch (error) {
                    console.warn("Audit log hiba:", error);
                  }
                  setTimeout(() => {
                    loadBackupHistory();
                  }, 500);
                }
                setPreviousAutosaveState(newValue);
              }}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>💾 {t("settings.autosave")}</span>
          </label>
        </Tooltip>
        <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
          {t("settings.autosaveDescription")}
        </p>
        {settings.autosave === true && (
          <div style={{ marginTop: "12px", marginLeft: "32px" }}>
            <Tooltip content={t("settings.autosaveIntervalDescription")}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
              }}>
                {t("settings.autosaveInterval")}
              </label>
            </Tooltip>
            <input
              type="number"
              min="5"
              value={settings.autosaveInterval || 30}
              onChange={e => onChange({ ...settings, autosaveInterval: Math.max(5, Number(e.target.value)) })}
              style={{
                width: "100px",
                padding: "8px",
                borderRadius: "6px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                fontSize: "14px",
              }}
            />
            <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
              {t("settings.autosaveIntervalDescription")}
            </p>
          </div>
        )}

        {/* Backup History */}
        <div data-tutorial="backup-history-section" style={{ marginTop: "24px", marginLeft: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <h3 style={{ 
              fontSize: "16px", 
              fontWeight: 600, 
              color: theme.colors.text,
              margin: 0
            }}>
              📋 {t("settings.backup.history.title")}
            </h3>
            <Tooltip content={t("settings.backup.history.openFolderTooltip")}>
              <button
                onClick={async () => {
                  try {
                    const backupDirPath = await invoke<string>("get_backup_directory_path");
                    await invoke("open_directory", { path: backupDirPath });
                  } catch (error) {
                    console.error("Backup mappa megnyitási hiba:", error);
                    showToast(t("settings.backup.history.openFolderError"), "error");
                  }
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSecondary,
                  padding: "6px 14px",
                  fontSize: "12px",
                }}
              >
                📁 {t("settings.backup.history.openFolder")}
              </button>
            </Tooltip>
          </div>
          
          <Tooltip content={t("settings.backup.history.clickToOpen")}>
            <p style={{ 
              marginBottom: "12px", 
              fontSize: "12px", 
              color: theme.colors.textMuted,
              lineHeight: "1.5"
            }}>
              {t("settings.backup.history.description")}
            </p>
          </Tooltip>
          
          <div style={{
            marginBottom: "12px",
            padding: "10px",
            backgroundColor: `${theme.colors.primary}10`,
            borderRadius: "8px",
            border: `1px solid ${theme.colors.primary}30`,
            fontSize: "11px",
          }}>
            <div style={{ 
              fontWeight: 600, 
              color: theme.colors.text,
              marginBottom: "6px"
            }}>
              {t("settings.backup.history.colorExplanation")}
            </div>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "4px",
              color: theme.colors.textMuted 
            }}>
              <div>{t("settings.backup.history.colorGreen")}</div>
              <div>{t("settings.backup.history.colorYellow")}</div>
              <div>{t("settings.backup.history.colorRed")}</div>
              <div>{t("settings.backup.history.colorGray")}</div>
            </div>
            <div style={{ 
              marginTop: "8px", 
              paddingTop: "8px",
              borderTop: `1px solid ${theme.colors.border}40`,
              fontSize: "10px",
              fontStyle: "italic",
              color: theme.colors.textMuted 
            }}>
              {t("settings.backup.history.deletionInfo")}
            </div>
          </div>
          
          {backupHistory.length > 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              maxHeight: "300px",
              overflowY: "auto",
              padding: "8px",
              backgroundColor: theme.colors.surface,
              borderRadius: "8px",
              border: `1px solid ${theme.colors.border}`,
            }}>
              {backupHistory.map((item, index) => {
                const getStatusColor = () => {
                  if (item.daysOld === 0) return "#22c55e";
                  if (item.daysOld === 1) return "#eab308";
                  if (item.daysOld >= 2 && item.daysOld < 5) return "#ef4444";
                  return "#6b7280";
                };

                const getStatusText = () => {
                  if (item.daysOld === 0) return t("settings.backup.history.today");
                  if (item.daysOld === 1) return t("settings.backup.history.yesterday");
                  if (item.daysOld >= 2 && item.daysOld < 5) {
                    return t("settings.backup.history.daysAgo", { days: item.daysOld });
                  }
                  return t("settings.backup.history.daysAgoWillDelete", { days: item.daysOld });
                };

                const statusColor = getStatusColor();
                const dateStr = item.date.toLocaleString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={index}
                    onClick={async () => {
                      try {
                        await invoke("open_file", { path: item.filePath });
                      } catch (error) {
                        console.error("❌ Hiba a backup fájl megnyitásakor:", error);
                        showToast(
                          settings.language === "hu"
                            ? "Hiba a backup fájl megnyitásakor"
                            : settings.language === "de"
                            ? "Fehler beim Öffnen der Backup-Datei"
                            : "Error opening backup file",
                          "error"
                        );
                      }
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: "6px",
                      backgroundColor: theme.colors.background,
                      border: `2px solid ${statusColor}40`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.background;
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: "13px", 
                        fontWeight: 600, 
                        color: statusColor,
                        marginBottom: "4px"
                      }}>
                        {getStatusText()}
                      </div>
                      <div style={{ 
                        fontSize: "11px", 
                        color: theme.colors.textMuted 
                      }}>
                        {dateStr}
                      </div>
                      {item.willBeDeletedIn > 0 && item.willBeDeletedIn < 5 && (
                        <div style={{ 
                          fontSize: "10px", 
                          color: "#ef4444",
                          marginTop: "4px",
                          fontStyle: "italic"
                        }}>
                          {t("settings.backup.history.willBeDeletedIn", { countdown: getDeletionCountdown(item.willBeDeletedIn) })}
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: "16px", 
                      color: theme.colors.textMuted,
                      marginLeft: "8px"
                    }}>
                      📂
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              padding: "16px",
              backgroundColor: theme.colors.surface,
              borderRadius: "8px",
              border: `1px solid ${theme.colors.border}`,
              textAlign: "center",
              color: theme.colors.textMuted,
              fontSize: "14px",
            }}>
              {settings.language === "hu" 
                ? "Még nincsenek automatikus backup fájlok. Az automatikus backup fájlok akkor jönnek létre, amikor az autosave be van kapcsolva és az alkalmazás mentést végez." 
                : settings.language === "de"
                ? "Noch keine automatischen Backup-Dateien vorhanden. Automatische Backup-Dateien werden erstellt, wenn Autosave aktiviert ist und die Anwendung speichert."
                : "No automatic backup files yet. Automatic backup files will be created when autosave is enabled and the application saves."}
            </div>
          )}
        </div>
      </div>

      {/* Tutorial beállítások */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.showTutorialOnStartupDescription") || "Ha be van pipálva, az első indításkor megjelenik a kezdő tutorial, amely végigvezeti az alkalmazáson."}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            fontWeight: "600", 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
            cursor: "pointer" 
          }}>
            <input
              type="checkbox"
              checked={settings.showTutorialOnStartup !== false}
              onChange={async (e) => {
                const checked = e.target.checked;
                const newSettings = { 
                  ...settings, 
                  showTutorialOnStartup: checked,
                  ...(checked && settings.tutorialCompleted ? { tutorialCompleted: false } : {})
                };
                onChange(newSettings);
                try {
                  await saveSettings(newSettings);
                } catch (error) {
                  console.error("❌ Hiba a tutorial beállítás mentésekor:", error);
                }
              }}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>📚 {t("settings.showTutorialOnStartup") || "Kezdő tutorial megjelenítése indításkor:"}</span>
          </label>
        </Tooltip>
        <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
          {t("settings.showTutorialOnStartupDescription") || "Ha be van pipálva, az első indításkor megjelenik a kezdő tutorial, amely végigvezeti az alkalmazáson."}
        </p>
        
        <div style={{ marginTop: "16px", marginLeft: "32px" }}>
          <button
            onClick={async () => {
              const newSettings = { ...settings, tutorialCompleted: false };
              onChange(newSettings);
              try {
                await saveSettings(newSettings);
              } catch (error) {
                console.error("❌ Hiba a tutorial reset mentésekor:", error);
              }
              setTimeout(() => {
                if (window.dispatchEvent) {
                  window.dispatchEvent(new CustomEvent('start-tutorial'));
                }
              }, 100);
            }}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonPrimary,
              padding: "10px 20px",
              fontSize: "14px",
            }}
          >
            🔄 {t("settings.tutorial.restart") || "Tutorial újranézése"}
          </button>
          <p style={{ marginTop: "8px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.tutorial.restartDescription") || "Kattints ide, hogy újra lefusson a kezdő tutorial."}
          </p>
          {settings.tutorialCompleted && (
            <p style={{ marginTop: "8px", fontSize: "12px", color: theme.colors.success }}>
              ✓ {t("settings.tutorial.completed") || "Tutorial megtekintve"}
            </p>
          )}
        </div>
      </div>

      {/* Welcome Message beállítások */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.showWelcomeMessageOnStartupDescription") || "Ha be van pipálva, az első indításkor megjelenik az üdvözlő üzenet, amely információkat tartalmaz az alkalmazásról."}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            fontWeight: "600", 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
            cursor: "pointer" 
          }}>
            <input
              type="checkbox"
              checked={settings.showWelcomeMessageOnStartup !== false}
              onChange={async (e) => {
                const checked = e.target.checked;
                const newSettings = { ...settings, showWelcomeMessageOnStartup: checked };
                onChange(newSettings);
                try {
                  await saveSettings(newSettings);
                } catch (error) {
                  console.error("❌ Hiba a welcome message beállítás mentésekor:", error);
                }
              }}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>👋 {t("settings.showWelcomeMessageOnStartup") || "Üdvözlő üzenet megjelenítése indításkor:"}</span>
          </label>
        </Tooltip>
        <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
          {t("settings.showWelcomeMessageOnStartupDescription") || "Ha be van pipálva, az első indításkor megjelenik az üdvözlő üzenet, amely információkat tartalmaz az alkalmazásról, verzióról és GitHub linkekről."}
        </p>
      </div>

      {/* Help Menu beállítások */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.showHelpInMenuDescription") || "Ha be van pipálva, a Help menüpont megjelenik a Sidebar SYSTEM szekciójában."}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            fontWeight: "600", 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
            cursor: "pointer" 
          }}>
            <input
              type="checkbox"
              checked={settings.showHelpInMenu !== false}
              onChange={async (e) => {
                const checked = e.target.checked;
                const newSettings = { ...settings, showHelpInMenu: checked };
                onChange(newSettings);
                try {
                  await saveSettings(newSettings);
                } catch (error) {
                  console.error("❌ Hiba a help menu beállítás mentésekor:", error);
                }
              }}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>❓ {t("settings.showHelpInMenu") || "Help menüpont megjelenítése a Sidebar-ban:"}</span>
          </label>
        </Tooltip>
        <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
          {t("settings.showHelpInMenuDescription") || "Ha be van pipálva, a Help menüpont megjelenik a Sidebar SYSTEM szekciójában. Az F1 billentyű mindig elérhető marad a Help menü megnyitásához."}
        </p>
      </div>

      {/* Értesítések */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={settings.notificationEnabled !== false}
            onChange={e => onChange({ ...settings, notificationEnabled: e.target.checked })}
            style={{ width: "20px", height: "20px", cursor: "pointer" }}
          />
          <span>🔔 {t("settings.notificationEnabled")}</span>
        </label>
        <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
          {t("settings.notificationEnabledDescription")}
        </p>
        {settings.notificationEnabled !== false && (
          <div style={{ marginTop: "12px", marginLeft: "32px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: theme.colors.text }}>
              {t("settings.notificationDuration")}
            </label>
            <input
              type="number"
              min="1000"
              step="500"
              value={settings.notificationDuration || 3000}
              onChange={e => onChange({ ...settings, notificationDuration: Math.max(1000, Number(e.target.value)) })}
              style={{
                width: "100px",
                padding: "8px",
                borderRadius: "6px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                fontSize: "14px",
              }}
            />
            <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
              {t("settings.notificationDurationDescription")}
            </p>
            
            {getPlatform() === "macos" && notificationPermissionGranted === false && (
              <div style={{ marginTop: "12px", padding: "12px", borderRadius: "6px", backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                <p style={{ marginBottom: "8px", fontSize: "14px", color: theme.colors.text, fontWeight: "500" }}>
                  ⚠️ {t("settings.notifications.permissionRequired")}
                </p>
                <p style={{ marginBottom: "12px", fontSize: "12px", color: theme.colors.textMuted }}>
                  {settings.language === "hu" 
                    ? "Az értesítések küldéséhez engedélyt kell adnod az alkalmazásnak."
                    : "You need to grant permission to send notifications."}
                </p>
                <button
                  onClick={async () => {
                    try {
                      const granted = await requestNotificationPermission();
                      setNotificationPermissionGranted(granted);
                      if (granted) {
                        try {
                          await new Promise(resolve => setTimeout(resolve, 500));
                          await sendNativeNotification(
                            t("settings.notifications.permissionGrantedTitle"),
                            t("settings.notifications.permissionGrantedBody")
                          );
                          showToast(t("settings.notifications.permissionGrantedToast"), "success");
                        } catch (notifError) {
                          console.error("Teszt értesítés küldése sikertelen:", notifError);
                          showToast(t("settings.notifications.permissionGrantedButFailed"), "info");
                        }
                      } else {
                        showToast(t("settings.notifications.permissionDenied"), "error");
                      }
                    } catch (error) {
                      console.error("Engedély kérése sikertelen:", error);
                      showToast(t("settings.notifications.requestFailed"), "error");
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.colors.primary}`,
                    backgroundColor: theme.colors.primary,
                    color: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  🔐 {t("settings.notifications.requestPermission")}
                </button>
              </div>
            )}
            
            {getPlatform() === "macos" && notificationPermissionGranted === true && (
              <div style={{ marginTop: "12px", padding: "8px 12px", borderRadius: "6px", backgroundColor: theme.colors.success + "20", border: `1px solid ${theme.colors.success}` }}>
                <p style={{ fontSize: "12px", color: theme.colors.success, fontWeight: "500", marginBottom: "4px" }}>
                  ✅ {t("settings.notifications.permissionGrantedMessage")}
                </p>
                <p style={{ fontSize: "11px", color: theme.colors.textMuted, fontStyle: "italic" }}>
                  💡 {settings.language === "hu" 
                    ? "Az alkalmazás megjelenik a Rendszerbeállítások > Értesítések és fókusz menüben, ha már küldtél értesítést."
                    : "The app will appear in System Settings > Notifications & Focus after sending a notification."}
                </p>
              </div>
            )}
            
            <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={async () => {
                  try {
                    const platform = getPlatform();
                    const title = platform === "macos" ? "Teszt értesítés" : "Test Notification";
                    const body = platform === "macos" ? "Ez egy teszt értesítés macOS-on" : "This is a test notification";
                    await sendNativeNotification(title, body);
                    if (platform === "macos") {
                      await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    showToast(
                      platform === "macos" 
                        ? "Értesítés elküldve! Ha nem látod a Notification Center-ben, próbáld meg az alkalmazást háttérbe küldeni (Cmd+H) és újra küldeni az értesítést."
                        : "Notification sent! Check your notification center.",
                      "success"
                    );
                  } catch (error) {
                    console.error("Értesítés tesztelése sikertelen:", error);
                    showToast(
                      settings.language === "hu"
                        ? "Értesítés küldése sikertelen. Ellenőrizd az engedélyeket a Rendszerbeállításokban."
                        : "Failed to send notification. Check permissions in System Settings.",
                      "error"
                    );
                  }
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.primary,
                  color: "#fff",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                🔔 {t("settings.notifications.testNotification")}
              </button>
              
              {getPlatform() === "macos" && (
                <button
                  onClick={async () => {
                    try {
                      await setDockBadge("5");
                      showToast(t("settings.notifications.dockBadge.set", { value: "5" }), "success");
                      setTimeout(async () => {
                        await setDockBadge(null);
                        showToast(t("settings.notifications.dockBadge.cleared"), "info");
                      }, 3000);
                    } catch (error) {
                      console.error("Dock badge tesztelése sikertelen:", error);
                      showToast(t("settings.notifications.dockBadge.setError"), "error");
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.secondary,
                    color: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  🏷️ {t("settings.notifications.testDockBadge")}
                </button>
              )}
            </div>
            
            {getPlatform() === "macos" && !settings.hideMacOSNotificationWarning && !hideMacOSWarningTemporarily && (
              <div style={{ marginTop: "12px", padding: "12px", borderRadius: "6px", backgroundColor: theme.colors.surface + "80", border: `1px solid ${theme.colors.border}`, position: "relative" }}>
                <button
                  onClick={() => setHideMacOSWarningTemporarily(true)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "none",
                    border: "none",
                    color: theme.colors.textMuted,
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    transition: "all 0.2s",
                    fontWeight: "bold",
                    lineHeight: "1",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.danger || "#e74c3c";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.colors.textMuted;
                  }}
                  title={t("settings.notifications.closeWillReappear")}
                >
                  ✕
                </button>
                <p style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "8px", fontWeight: "500", paddingRight: "35px" }}>
                  ⚠️ {t("settings.notifications.macOSLimitations")}
                </p>
                <ul style={{ fontSize: "11px", color: theme.colors.textMuted, marginLeft: "16px", lineHeight: "1.6", marginBottom: "12px" }}>
                  <li>{t("settings.notifications.devModeWarning")}</li>
                  <li>{t("settings.notifications.productionBuildInfo")}</li>
                  <li>{t("settings.notifications.backgroundOnly")}</li>
                  <li>{t("settings.notifications.systemSettingsInfo")}</li>
                </ul>
                <button
                  onClick={async () => {
                    const newSettings = getPlatform() === "macos" 
                      ? { ...settings, hideMacOSNotificationWarning: true }
                      : settings;
                    onChange(newSettings);
                    if (getPlatform() === "macos") {
                      await saveSettings(newSettings);
                    }
                    showToast(
                      settings.language === "hu" 
                        ? "Figyelmeztetés elrejtve"
                        : settings.language === "de"
                        ? "Warnung ausgeblendet"
                        : "Warning hidden",
                      "success"
                    );
                  }}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    padding: "6px 12px",
                    fontSize: "12px",
                    width: "100%",
                    marginTop: "8px",
                  }}
                >
                  {t("settings.notifications.closeAndDontShow")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gyorsbillentyűk és Információk */}
      <div style={{ marginBottom: "0" }}>
        <label style={{ 
          display: "block", 
          marginBottom: "12px", 
          fontWeight: "600", 
          fontSize: "16px", 
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
        }}>
          ⚙️ {t("settings.otherSettings")}
        </label>
        <p style={{ marginBottom: "16px", fontSize: "12px", color: theme.colors.textMuted }}>
          {t("settings.otherSettingsDescription")}
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Tooltip content={t("settings.shortcutsDescription")}>
            <button
              onClick={onShowShortcutHelp}
              style={{
                ...themeStyles.button,
                flex: 1,
                minWidth: "180px",
              }}
            >
              ⌨️ {t("shortcuts.title")}
            </button>
          </Tooltip>
          <Tooltip content={t("settings.versionHistoryTooltip")}>
            <button
              onClick={onShowVersionHistory}
              style={{
                ...themeStyles.button,
                flex: 1,
                minWidth: "180px",
              }}
            >
              📋 {t("settings.versionHistory")}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Autosave Info Modal */}
      <AnimatePresence>
        {showAutosaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
            }}
            onClick={() => {
              setShowAutosaveModal(false);
              setPreviousAutosaveState(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: "16px",
                padding: "28px",
                maxWidth: "500px",
                width: "90%",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                border: `1px solid ${theme.colors.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ 
                margin: "0 0 16px 0", 
                color: theme.colors.text, 
                fontSize: "20px", 
                fontWeight: "700" 
              }}>
                {settings.language === "hu" 
                  ? "ℹ️ Automatikus mentés információ"
                  : settings.language === "de"
                  ? "ℹ️ Automatische Speicherung Information"
                  : "ℹ️ Autosave Information"}
              </h3>
              <div style={{ marginBottom: "20px" }}>
                <p style={{ 
                  margin: "0 0 12px 0", 
                  color: theme.colors.text, 
                  fontSize: "14px", 
                  lineHeight: "1.6" 
                }}>
                  {settings.language === "hu"
                    ? "Az automatikus mentés menti a beállításokat és készít egy auto_backup fájlt mindig az aktuális állapotról."
                    : settings.language === "de"
                    ? "Die automatische Speicherung speichert die Einstellungen und erstellt eine auto_backup-Datei immer vom aktuellen Zustand."
                    : "Autosave saves your settings and creates an auto_backup file of the current state."}
                </p>
                <div style={{
                  padding: "12px",
                  backgroundColor: "#ffc10720",
                  borderRadius: "8px",
                  border: "1px solid #ffc107",
                  marginTop: "12px",
                }}>
                  <p style={{ 
                    margin: 0, 
                    color: "#ffc107", 
                    fontSize: "13px", 
                    fontWeight: 600,
                    lineHeight: "1.5"
                  }}>
                    ⚠️ {settings.language === "hu"
                      ? "Ez nem helyettesíti a rendszeres mentést!"
                      : settings.language === "de"
                      ? "Dies ersetzt nicht die regelmäßige Sicherung!"
                      : "This does not replace regular backups!"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => {
                    setShowAutosaveModal(false);
                    setPreviousAutosaveState(false);
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {t("settings.autosave.modal.cancel")}
                </button>
                <button
                  onClick={async () => {
                    const newSettings = { ...settings, autosave: true };
                    onChange(newSettings);
                    await saveSettings(newSettings);
                    try {
                      await auditSettingsChange("autosave", settings.autosave, true, {
                        previousAutosave: settings.autosave,
                        newAutosave: true,
                        enabled: true,
                      });
                    } catch (error) {
                      console.warn("Audit log hiba:", error);
                    }
                    setShowAutosaveModal(false);
                    setTimeout(() => {
                      loadBackupHistory();
                    }, 500);
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: theme.colors.primary,
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {t("settings.autosave.modal.ok")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};
