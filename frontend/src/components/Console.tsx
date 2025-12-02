import React, { useState, useEffect, useRef, useMemo } from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { consoleLogger, type LogEntry } from "../utils/consoleLogger";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
import { useToast } from "./Toast";
import { getConsoleMessage, type ConsoleMessageKey } from "../utils/languages/global_console";

interface Props {
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const Console: React.FC<Props> = ({ settings, theme, themeStyles }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogEntry["level"] | "all">("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Először betöltjük a meglévő logokat
    setLogs(consoleLogger.getLogs());

    // Feliratkozunk az új logokra
    // setTimeout használata, hogy ne akadályozza a renderelést
    const unsubscribe = consoleLogger.subscribe((newLogs) => {
      // requestIdleCallback vagy setTimeout használata React state frissítéshez
      setTimeout(() => {
        setLogs(newLogs);
      }, 0);
    });

    return unsubscribe;
  }, []);

  // Auto-scroll az új logokhoz
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter(log => log.level === filter);

  // Console üzenetek fordítása a beállított nyelvre
  const translateLogMessage = (message: string): string => {
    // Próbáljuk meg fordítani az üzenetet, ha van hozzá kulcs
    // Először ellenőrizzük, hogy az üzenet tartalmaz-e ismert kulcsot
    const knownMessages: Record<string, string> = {
      // Hibaüzenetek
      "Audit log hiba:": t("console.auditLogError") || "Audit log error:",
      "Értesítés küldése sikertelen:": t("console.notificationSendFailed") || "Failed to send notification:",
      "❌ Hiba a filament készlet mentésekor (ajánlat):": t("console.filamentStockSaveError") || "❌ Error saving filament stock (offer):",
      "Hiba a projekt mentésekor:": t("console.projectSaveError") || "Error saving project:",
      "Hiba a projekt törlésekor:": t("console.projectDeleteError") || "Error deleting project:",
      "Készlet mentési hiba:": t("console.stockSaveError") || "Stock save error:",
      "Hiba a link megnyitásakor:": t("console.linkOpenError") || "Error opening link:",
      "Hiba a GitHub issue megnyitásakor:": t("console.githubIssueOpenError") || "Error opening GitHub issue:",
      "❌ Hiba a backup history betöltésekor:": t("console.backupHistoryLoadError") || "❌ Error loading backup history:",
      "❌ Hiba a log history betöltésekor:": t("console.logHistoryLoadError") || "❌ Error loading log history:",
      "❌ Hiba az audit log history betöltésekor:": t("console.auditLogHistoryLoadError") || "❌ Error loading audit log history:",
      "Export error:": t("console.exportError") || "Export error:",
      // Betöltési üzenetek
      "📥 Nyomtatók betöltése...": t("store.printers.loading") || "📥 Loading printers...",
      "📥 Filamentek betöltése...": t("store.filaments.loading") || "📥 Loading filaments...",
      "📥 Beállítások betöltése...": t("store.settings.loading") || "📥 Loading settings...",
      "📥 Árajánlatok betöltése...": t("store.offers.loading") || "📥 Loading offers...",
      "📥 Ügyfelek betöltése...": t("store.customers.loading") || "📥 Loading customers...",
      "📥 Projektek betöltése...": t("store.projects.loading") || "📥 Loading projects...",
      "📥 Feladatok betöltése...": t("store.tasks.loading") || "📥 Loading tasks...",
      // Betöltve üzenetek
      "✅ Nyomtatók betöltve": t("store.printers.loaded") || "✅ Printers loaded",
      "✅ Filamentek betöltve": t("store.filaments.loaded") || "✅ Filaments loaded",
      "✅ Beállítások betöltve": t("store.settings.loaded") || "✅ Settings loaded",
      "✅ Árajánlatok betöltve": t("store.offers.loaded") || "✅ Offers loaded",
      "✅ Ügyfelek betöltve": t("store.customers.loaded") || "✅ Customers loaded",
      "✅ Projektek betöltve": t("store.projects.loaded") || "✅ Projects loaded",
      "✅ Feladatok betöltve": t("store.tasks.loaded") || "✅ Tasks loaded",
      // Mentési üzenetek
      "💾 Nyomtatók mentése...": t("store.printers.saving") || "💾 Saving printers...",
      "💾 Filamentek mentése...": t("store.filaments.saving") || "💾 Saving filaments...",
      "💾 Beállítások mentése...": t("store.settings.saving") || "💾 Saving settings...",
      "💾 Árajánlatok mentése...": t("store.offers.saving") || "💾 Saving offers...",
      "💾 Ügyfelek mentése...": t("store.customers.saving") || "💾 Saving customers...",
      "💾 Projektek mentése...": t("store.projects.saving") || "💾 Saving projects...",
      "💾 Feladatok mentése...": t("store.tasks.saving") || "💾 Saving tasks...",
      "✅ Nyomtatók sikeresen mentve": t("store.printers.saved") || "✅ Printers saved successfully",
      "✅ Filamentek sikeresen mentve": t("store.filaments.saved") || "✅ Filaments saved successfully",
      "✅ Beállítások sikeresen mentve": t("store.settings.saved") || "✅ Settings saved successfully",
      "✅ Árajánlatok sikeresen mentve": t("store.offers.saved") || "✅ Offers saved successfully",
      "✅ Ügyfelek sikeresen mentve": t("store.customers.saved") || "✅ Customers saved successfully",
      "✅ Projektek sikeresen mentve": t("store.projects.saved") || "✅ Projects saved successfully",
      "✅ Feladatok sikeresen mentve": t("store.tasks.saved") || "✅ Tasks saved successfully",
      // Egyéb üzenetek
      "ℹ️ Nincs mentett filament": t("store.filaments.noSaved") || "ℹ️ No saved filaments",
      "ℹ️ Nincs mentett beállítás": t("store.settings.noSaved") || "ℹ️ No saved settings",
      "ℹ️ data.json nem létezik, létrehozás...": t("store.dataJson.create") || "ℹ️ data.json does not exist, creating...",
      "ℹ️ data.json nem létezik, nincsenek mentett beállítások": t("store.dataJson.noSettings") || "ℹ️ data.json does not exist, no saved settings",
      // További üzenetek
      "✅ Frontend log fájl inicializálva:": t("console.frontendLogInitialized") || "✅ Frontend log file initialized:",
      "✅ Alkalmazás inicializálva és kész a használatra": t("console.appInitialized") || "✅ Application initialized and ready to use",
      "🔍 Backup emlékeztető ellenőrzés:": t("console.backupReminderCheck") || "🔍 Backup reminder check:",
      "ℹ️ Autosave be van kapcsolva, backup emlékeztető kikapcsolva": t("console.autosaveEnabledBackupDisabled") || "ℹ️ Autosave is enabled, backup reminder disabled",
      "ℹ️ Autosave be van kapcsolva, toast nem jelenik meg": t("console.autosaveEnabledToastHidden") || "ℹ️ Autosave is enabled, toast will not be shown",
      "✅ Üdvözlő üzenet megjelenítve (nincs tutorial)": t("console.welcomeMessageShown") || "✅ Welcome message displayed (no tutorial)",
      "📝 Talált log fájlok:": t("console.logFilesFound") || "📝 Found log files:",
      "✅ Log history betöltve:": t("console.logHistoryLoaded") || "✅ Log history loaded:",
      "🔍 Napi automatikus backup ellenőrzés...": t("console.dailyBackupCheck") || "🔍 Daily automatic backup check...",
      "🔍 Mai backup ellenőrzés:": t("console.todayBackupCheck") || "🔍 Today's backup check:",
      "🔍 Backup fájlok száma:": t("console.backupFilesCount") || "🔍 Backup files count:",
      "✅ Mai backup találva:": t("console.todayBackupFound") || "✅ Today's backup found:",
      "ℹ️ Már van mai napra automatikus backup, új fájl nem jön létre": t("console.todayBackupExists") || "ℹ️ There is already an automatic backup for today, no new file will be created",
      "ℹ️ Mai automatikus backup már létezik, nem frissítjük - csak a timestamp-et adjuk vissza": t("console.todayBackupAlreadyExists") || "ℹ️ Today's automatic backup already exists, we won't update it - just return the timestamp",
      "ℹ️ Mai backup már létezett, beállítások nem lettek frissítve (hogy ne veszítsük el a friss értékeket)": t("console.todayBackupExisted") || "ℹ️ Today's backup already existed, settings were not updated (to avoid losing fresh values)",
      "✅ Automatikus vészbackup létrehozva:": t("console.automaticBackupCreated") || "✅ Automatic emergency backup created:",
      "✅ Napi automatikus backup ellenőrzés elvégezve": t("console.dailyBackupCheckCompleted") || "✅ Daily automatic backup check completed",
      "🔍 Automatikus log rotáció ellenőrzés (": t("console.logRotationCheck") || "🔍 Automatic log rotation check (",
      "🧹 Log rotáció indítása:": t("console.logRotationStart") || "🧹 Starting log rotation:",
      "✅ Log rotáció befejezve:": t("console.logRotationCompleted") || "✅ Log rotation completed:",
      "🔍 Automatikus audit log rotáció ellenőrzés (": t("console.auditLogRotationCheck") || "🔍 Automatic audit log rotation check (",
      "🧹 Audit log rotáció indítása:": t("console.auditLogRotationStart") || "🧹 Starting audit log rotation:",
      "✅ Audit log rotáció befejezve:": t("console.auditLogRotationCompleted") || "✅ Audit log rotation completed:",
      "💾 Last saved timestamp frissítve:": t("console.lastSavedTimestampUpdated") || "💾 Last saved timestamp updated:",
      "✅ Settings azonnal mentve a data.json-ba:": t("console.settingsSavedImmediately") || "✅ Settings immediately saved to data.json:",
      "⚡ Performance metrikák rendszeres logolása...": t("console.performanceMetricsLogging") || "⚡ Regular performance metrics logging...",
      "✅ Performance metrikák logolva": t("console.performanceMetricsLogged") || "✅ Performance metrics logged",
      "🔍 Performance CPU metrika:": t("console.performanceCpuMetric") || "🔍 Performance CPU metric:",
      "🔍 Performance Memory metrika:": t("console.performanceMemoryMetric") || "🔍 Performance Memory metric:",
      "⚠️ No context in performance metric. Metric:": t("console.noContextInPerformanceMetric") || "⚠️ No context in performance metric. Metric:",
      "🔍 BackupReminder komponens ellenőrzés:": t("console.backupReminderComponentCheck") || "🔍 BackupReminder component check:",
    };

    // Speciális esetek kezelése (részleges egyezések)
    // Log rotáció üzenetek
    if (message.includes("Log rotáció indítása:") && message.includes("napnál régebbi fájlok törlése")) {
      const daysMatch = message.match(/(\d+)\s+napnál régebbi fájlok törlése/);
      if (daysMatch) {
        const days = daysMatch[1];
        return t("console.logRotationStart") + ` ${days} days...`;
      }
    }
    if (message.includes("Audit log rotáció indítása:") && message.includes("napnál régebbi fájlok törlése")) {
      const daysMatch = message.match(/(\d+)\s+napnál régebbi fájlok törlése/);
      if (daysMatch) {
        const days = daysMatch[1];
        return t("console.auditLogRotationStart") + ` ${days} days...`;
      }
    }
    if (message.includes("Log rotáció befejezve:") && message.includes("fájl törölve")) {
      const countMatch = message.match(/(\d+)\s+fájl törölve/);
      if (countMatch) {
        const count = countMatch[1];
        return t("console.logRotationCompleted") + ` ${count} files deleted`;
      }
    }
    if (message.includes("Audit log rotáció befejezve:") && message.includes("fájl törölve")) {
      const countMatch = message.match(/(\d+)\s+fájl törölve/);
      if (countMatch) {
        const count = countMatch[1];
        return t("console.auditLogRotationCompleted") + ` ${count} files deleted`;
      }
    }
    if (message.includes("Automatikus log rotáció ellenőrzés (") && message.includes("nap)...")) {
      const daysMatch = message.match(/\((\d+)\s+nap\)\.\.\./);
      if (daysMatch) {
        const days = daysMatch[1];
        return t("console.logRotationCheck") + `${days} days)...`;
      }
    }
    if (message.includes("Automatikus audit log rotáció ellenőrzés (") && message.includes("nap)...")) {
      const daysMatch = message.match(/\((\d+)\s+nap\)\.\.\./);
      if (daysMatch) {
        const days = daysMatch[1];
        return t("console.auditLogRotationCheck") + `${days} days)...`;
      }
    }
    // További rotációs üzenetek
    if (message.includes("régi log fájl törölve")) {
      const countMatch = message.match(/✅\s*(\d+)\s+régi log fájl törölve/);
      if (countMatch) {
        const count = countMatch[1];
        return `✅ ${count} ${t("console.oldLogFilesDeleted") || "old log files deleted"}`;
      }
    }
    if (message.includes("régi audit log fájl törölve")) {
      const countMatch = message.match(/✅\s*(\d+)\s+régi audit log fájl törölve/);
      if (countMatch) {
        const count = countMatch[1];
        return `✅ ${count} ${t("console.oldAuditLogFilesDeleted") || "old audit log files deleted"}`;
      }
    }

    // Ha az üzenet kezdete megegyezik valamelyik ismert üzenettel, cseréljük le
    for (const [key, translation] of Object.entries(knownMessages)) {
      if (message.startsWith(key)) {
        return message.replace(key, translation);
      }
    }

    // Ha az üzenet tartalmazza valamelyik ismert üzenetet, cseréljük le
    for (const [key, translation] of Object.entries(knownMessages)) {
      if (message.includes(key)) {
        return message.replace(key, translation);
      }
    }

    // Ha nem találtunk fordítást, visszaadjuk az eredeti üzenetet
    return message;
  };

  const getLogColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "#dc3545";
      case "warn":
        return "#ffc107";
      case "info":
        return "#17a2b8";
      case "debug":
        return "#6c757d";
      default:
        return theme.colors.text;
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : settings.language === "uk" ? "uk-UA" : settings.language === "ru" ? "ru-RU" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handleClear = () => {
    consoleLogger.clearLogs();
    showToast(t("console.cleared"), "success");
  };

  const handleExport = async () => {
    try {
      const logContent = consoleLogger.exportLogs();
      const filePath = await save({
        defaultPath: `console-logs-${new Date().toISOString().split("T")[0]}.json`,
        filters: [{
          name: "JSON",
          extensions: ["json"],
        }],
      });

      if (filePath) {
        await writeTextFile(filePath, logContent);
        showToast(t("console.exported"), "success");
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast(t("console.exportError"), "error");
    }
  };

  const errorCount = logs.filter(l => l.level === "error").length;
  const warnCount = logs.filter(l => l.level === "warn").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={themeStyles.pageTitle}>{t("console.title")}</h2>
        <div style={{ display: "flex", gap: "12px" }}>
          {errorCount > 0 && (
            <span style={{
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: "#dc3545",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "600",
            }}>
              ⚠️ {errorCount} {t("console.errors")}
            </span>
          )}
          {warnCount > 0 && (
            <span style={{
              padding: "4px 12px",
              borderRadius: "12px",
              backgroundColor: "#ffc107",
              color: "#000",
              fontSize: "14px",
              fontWeight: "600",
            }}>
              ⚠️ {warnCount} {t("console.warnings")}
            </span>
          )}
        </div>
      </div>

      <div style={{ ...themeStyles.card, marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            fontWeight: "500", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            <span>{t("console.filter")}:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as LogEntry["level"] | "all")}
              style={{ ...themeStyles.select }}
            >
              <option value="all">{t("console.all")}</option>
              <option value="error">{t("console.error")}</option>
              <option value="warn">{t("console.warn")}</option>
              <option value="info">{t("console.info")}</option>
              <option value="log">{t("console.log")}</option>
              <option value="debug">{t("console.debug")}</option>
            </select>
          </label>

          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            fontWeight: "500", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
            cursor: "pointer" 
          }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <span>{t("console.autoScroll")}</span>
          </label>

          <button
            onClick={handleClear}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonDanger,
            }}
          >
            {t("console.clear")}
          </button>

          <button
            onClick={handleExport}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonPrimary,
            }}
          >
            {t("console.export")}
          </button>
        </div>
      </div>

      <div style={{ ...themeStyles.card }}>
        <div
          ref={logContainerRef}
          style={{
            maxHeight: "calc(100vh - 300px)",
            overflowY: "auto",
            overflowX: "auto",
            fontFamily: "monospace",
            fontSize: "13px",
            backgroundColor: theme.colors.background?.includes('gradient')
              ? "rgba(255, 255, 255, 0.75)"
              : theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "8px",
            padding: "12px",
            backdropFilter: theme.colors.background?.includes('gradient') ? "blur(12px)" : "none",
            opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: theme.colors.textMuted || (theme.colors.background?.includes('gradient') ? theme.colors.textSecondary : theme.colors.textMuted)
            }}>
              {t("console.empty")}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "8px",
                  marginBottom: "4px",
                  borderLeft: `4px solid ${getLogColor(log.level)}`,
                  backgroundColor: theme.colors.background?.includes('gradient')
                    ? "rgba(255, 255, 255, 0.65)"
                    : theme.colors.surface,
                  borderRadius: "4px",
                  wordBreak: "break-word",
                  backdropFilter: theme.colors.background?.includes('gradient') ? "blur(8px)" : "none",
                  opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ color: getLogColor(log.level), fontWeight: "600", minWidth: "60px" }}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span style={{ 
                    color: theme.colors.background?.includes('gradient') ? "#718096" : theme.colors.textMuted, 
                    fontSize: "11px", 
                    minWidth: "100px" 
                  }}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span style={{ 
                    color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                    flex: 1 
                  }}>
                    {translateLogMessage(log.message)}
                  </span>
                </div>
                {log.data && log.data.length > 1 && (
                  <div style={{ marginTop: "8px", paddingLeft: "72px" }}>
                    <pre style={{
                      margin: 0,
                      padding: "8px",
                      backgroundColor: theme.colors.background?.includes('gradient')
                        ? "rgba(255, 255, 255, 0.9)"
                        : theme.colors.background,
                      borderRadius: "4px",
                      fontSize: "12px",
                      overflowX: "auto",
                      color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                    }}>
                      {JSON.stringify(log.data.map((item: any) => {
                        if (typeof item === 'string') {
                          // Fordítjuk a string értékeket is
                          let translated = item;
                          if (item === "dátum:") translated = t("console.date") || "date:";
                          else if (item === "timestamp:") translated = t("console.timestamp") || "timestamp:";
                          else if (item === "fájl") translated = t("console.file") || "file";
                          else if (item === "(már létezett)") translated = t("console.alreadyExisted") || "(already existed)";
                          else if (item === "(új)") translated = t("console.new") || "(new)";
                          return translated;
                        }
                        return item;
                      }), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div style={{ 
          marginTop: "12px", 
          fontSize: "12px", 
          color: theme.colors.background?.includes('gradient') ? "#718096" : theme.colors.textMuted, 
          textAlign: "right" 
        }}>
          {t("console.total")}: {filteredLogs.length} / {logs.length}
        </div>
      </div>
    </div>
  );
};

