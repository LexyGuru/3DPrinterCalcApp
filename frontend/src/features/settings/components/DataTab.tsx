import React, { useState, useCallback } from "react";
import type { Settings, Printer, Filament, Offer } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";
import { createBackup, restoreBackup } from "../../../utils/backup";
import type { LogHistoryItem } from "../../../utils/logHistory";
import type { AuditLogHistoryItem } from "../../../utils/auditLog";
import { auditSettingsChange } from "../../../utils/auditLog";
import { cleanupOldAuditLogs } from "../../../utils/auditLogCleanup";
import { saveSettings } from "../../../utils/store";
import { logWithLanguage } from "../../../utils/languages/global_console";
import { save, open as openDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";

type ConfirmDialogConfig = {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
};

interface DataTabProps {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  printers: Printer[];
  setPrinters: React.Dispatch<React.SetStateAction<Printer[]>>;
  filaments: Filament[];
  setFilaments: React.Dispatch<React.SetStateAction<Filament[]>>;
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  logHistory: LogHistoryItem[];
  auditLogHistory: AuditLogHistoryItem[];
  loadAuditLogHistory: () => Promise<void>;
  setSelectedLogFile: React.Dispatch<React.SetStateAction<{ path: string; name: string } | null>>;
  setLogViewerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedAuditLogFile: React.Dispatch<React.SetStateAction<{ path: string; name: string } | null>>;
  setAuditLogViewerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFactoryResetProgress: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSystemDiagnostics: React.Dispatch<React.SetStateAction<boolean>>;
  openConfirmDialog: (config: ConfirmDialogConfig) => void;
}

export const DataTab: React.FC<DataTabProps> = ({
  settings,
  onChange,
  theme,
  themeStyles,
  showToast,
  printers,
  setPrinters,
  filaments,
  setFilaments,
  offers,
  setOffers,
  logHistory,
  auditLogHistory,
  loadAuditLogHistory,
  setSelectedLogFile,
  setLogViewerOpen,
  setSelectedAuditLogFile,
  setAuditLogViewerOpen,
  setShowFactoryResetProgress,
  setShowSystemDiagnostics,
  openConfirmDialog,
}) => {
  const t = useTranslation(settings.language);
  const [exportFilaments, setExportFilaments] = useState(false);
  const [exportPrinters, setExportPrinters] = useState(false);
  const [exportOffers, setExportOffers] = useState(false);
  const [importFilaments, setImportFilaments] = useState(false);
  const [importPrinters, setImportPrinters] = useState(false);
  const [importOffers, setImportOffers] = useState(false);

  const handleRestoreBackupClick = useCallback(() => {
    openConfirmDialog({
      title: t("settings.backupRestore"),
      message: t("backup.confirmRestore"),
      confirmText: t("settings.backupRestore"),
      cancelText: t("common.cancel"),
      type: "warning",
      onConfirm: async () => {
        try {
          const backupData = await restoreBackup();
          if (backupData) {
            if (backupData.printers) setPrinters(backupData.printers);
            if (backupData.filaments) setFilaments(backupData.filaments);
            if (backupData.offers) setOffers(backupData.offers);
            if (backupData.settings) onChange(backupData.settings);
            showToast(t("backup.restoreSuccess"), "success");
          }
        } catch (error) {
          showToast(t("backup.restoreError"), "error");
        }
      },
    });
  }, [openConfirmDialog, t, setPrinters, setFilaments, setOffers, onChange, showToast]);

  const handleFactoryReset = useCallback(() => {
    openConfirmDialog({
      title: t("settings.backup.factoryResetTitle"),
      message: t("settings.backup.factoryResetMessage"),
      confirmText: t("settings.backup.factoryResetConfirm"),
      cancelText: t("common.cancel"),
      type: "danger",
      onConfirm: () => {
        setShowFactoryResetProgress(true);
      },
    });
  }, [openConfirmDialog, t, setShowFactoryResetProgress]);

  const handleExport = useCallback(async () => {
    if (!exportFilaments && !exportPrinters && !exportOffers) {
      showToast(`${t("settings.exportError")}: ${t("settings.data.export.selectOne")}`, "error");
      return;
    }

    try {
      logWithLanguage(settings.language, "log", "settings.dataExport.start", {
        format: "JSON",
        sections: ["filaments", "printers", "offers"],
      });
      logWithLanguage(settings.language, "log", "settings.dataExport.prepared", {
        printers: exportPrinters ? printers.length : 0,
        filaments: exportFilaments ? filaments.length : 0,
        offers: exportOffers ? offers.length : 0,
      });
      
      const exportData: Record<string, unknown> = {};
      if (exportFilaments) exportData.filaments = filaments;
      if (exportPrinters) exportData.printers = printers;
      if (exportOffers) exportData.offers = offers;

      const filePath = await save({
        defaultPath: "3DPrinterCalcApp_export.json",
        filters: [{
          name: "JSON",
          extensions: ["json"],
        }],
      });

      if (filePath) {
        const jsonContent = JSON.stringify(exportData, null, 2);
        await writeTextFile(filePath, jsonContent);
        logWithLanguage(settings.language, "log", "settings.dataExport.saving", { filePath });
        logWithLanguage(settings.language, "log", "settings.dataExport.success", { filePath });
        setExportFilaments(false);
        setExportPrinters(false);
        setExportOffers(false);
        showToast(t("settings.exportSuccess") || "Export successful", "success");
      } else {
        logWithLanguage(settings.language, "log", "settings.dataExport.cancelled");
      }
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.dataExport.error", { error });
      showToast(t("settings.exportError"), "error");
    }
  }, [exportFilaments, exportPrinters, exportOffers, printers, filaments, offers, settings.language, t, showToast]);

  const handleImport = useCallback(async () => {
    if (!importFilaments && !importPrinters && !importOffers) {
      showToast(t("settings.importError") + ": " + t("settings.data.selectOneItem"), "error");
      return;
    }

    try {
      logWithLanguage(settings.language, "log", "settings.dataImport.start", {
        allowedSections: ["filaments", "printers", "offers"],
      });
      
      const selected = await openDialog({
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }]
      });

      if (!selected) {
        logWithLanguage(settings.language, "log", "settings.dataImport.cancelled");
        return;
      }

      const filePath = Array.isArray(selected) ? selected[0] : selected;
      
      if (!filePath || typeof filePath !== "string") {
        logWithLanguage(settings.language, "error", "settings.dataImport.invalidFile");
        showToast(t("settings.noFileSelected"), "error");
        return;
      }

      logWithLanguage(settings.language, "log", "settings.dataImport.loading", { filePath });
      const fileContent = await readTextFile(filePath);
      const importData = JSON.parse(fileContent);
      logWithLanguage(settings.language, "log", "settings.dataImport.parsed", {
        printers: importData.printers?.length || 0,
        filaments: importData.filaments?.length || 0,
        offers: importData.offers?.length || 0
      });

      if (importFilaments && importData.filaments) {
        if (Array.isArray(importData.filaments)) {
          logWithLanguage(settings.language, "log", "settings.dataImport.importFilaments", {
            count: importData.filaments.length,
          });
          setFilaments(importData.filaments);
        } else {
          throw new Error("Invalid filaments data");
        }
      }

      if (importPrinters && importData.printers) {
        if (Array.isArray(importData.printers)) {
          logWithLanguage(settings.language, "log", "settings.dataImport.importPrinters", {
            count: importData.printers.length,
          });
          setPrinters(importData.printers);
        } else {
          throw new Error("Invalid printers data");
        }
      }

      if (importOffers && importData.offers) {
        if (Array.isArray(importData.offers)) {
          logWithLanguage(settings.language, "log", "settings.dataImport.importOffers", {
            count: importData.offers.length,
          });
          setOffers(importData.offers);
        } else {
          throw new Error("Invalid offers data");
        }
      }

      logWithLanguage(settings.language, "log", "settings.dataImport.success");
      showToast(t("settings.importSuccess"), "success");
      setImportFilaments(false);
      setImportPrinters(false);
      setImportOffers(false);
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.dataImport.error", { error });
      showToast(t("settings.importError") + ": " + t("settings.data.invalidFileFormat"), "error");
    }
  }, [importFilaments, importPrinters, importOffers, settings.language, t, showToast, setFilaments, setPrinters, setOffers]);

  return (
    <div>
      {/* Backup */}
      <div data-tutorial="backup-restore-section" style={{ marginBottom: "24px" }}>
        <label style={{ 
          display: "block", 
          marginBottom: "12px", 
          fontWeight: "600", 
          fontSize: "18px", 
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
        }}>
          💾 {t("settings.backup")}
        </label>
        <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
          {t("settings.backup.description")}
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Tooltip content={t("settings.backup.exportTooltip")}>
            <button
              onClick={async () => {
                try {
                  const result = await createBackup(printers, filaments, offers, settings);
                  if (result) {
                    const updatedSettings = {
                      ...settings,
                      lastBackupDate: result.timestamp,
                    };
                    await saveSettings(updatedSettings);
                    onChange(updatedSettings);
                    showToast(t("backup.createSuccess"), "success");
                  }
                } catch (error) {
                  showToast(t("backup.restoreError"), "error");
                }
              }}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                flex: 1,
                minWidth: "180px",
              }}
            >
              💾 {t("settings.backupCreate")}
            </button>
          </Tooltip>
          <Tooltip content={t("settings.backup.importTooltip")}>
            <button
              onClick={handleRestoreBackupClick}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonSuccess,
                flex: 1,
                minWidth: "180px",
              }}
            >
              📥 {t("settings.backupRestore")}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Factory Reset */}
      <div style={{ 
        ...themeStyles.card, 
        marginTop: "32px",
        border: `2px solid ${theme.colors.danger || "#e74c3c"}`,
        backgroundColor: theme.colors.background?.includes('gradient') 
          ? "rgba(231, 76, 60, 0.1)" 
          : theme.colors.surface,
      }}>
        <label style={{ 
          display: "block", 
          marginBottom: "12px", 
          fontWeight: "600", 
          fontSize: "18px", 
          color: theme.colors.danger || "#e74c3c"
        }}>
          ⚠️ {t("settings.backup.factoryReset")}
        </label>
        <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
          {t("settings.backup.factoryResetDescription")}
        </p>
        <Tooltip content={t("settings.backup.factoryResetTooltip")}>
          <button
            onClick={handleFactoryReset}
            style={{
              ...themeStyles.button,
              backgroundColor: theme.colors.danger || "#e74c3c",
              color: "#ffffff",
              border: `1px solid ${theme.colors.danger || "#e74c3c"}`,
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: "600",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.dangerHover || "#c0392b";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.danger || "#e74c3c";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🔄 {t("settings.backup.factoryReset")}
          </button>
        </Tooltip>
      </div>

      {/* Log Management - két oszlopos layout */}
      <div style={{ 
        ...themeStyles.card, 
        marginTop: "32px",
      }}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "12px", 
            fontWeight: "600", 
            fontSize: "18px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            📋 {t("settings.logs.auditLogManagement" as any) || (settings.language === "hu" ? "Log és Audit Log kezelés" : settings.language === "de" ? "Log- und Audit-Log-Verwaltung" : "Log & Audit Log Management")}
          </label>
          <p style={{ marginBottom: "20px", fontSize: "14px", color: theme.colors.textMuted }}>
            {t("settings.logs.description")}
          </p>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "24px",
        }}>
          {/* BAL OSZLOP: Log Management */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ 
              fontSize: "16px", 
              fontWeight: 600, 
              color: theme.colors.text,
              marginBottom: "8px"
            }}>
              📋 {t("settings.logs.title")}
            </h3>
            
            {/* Log törlési beállítás */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              }}>
                {t("settings.logs.deleteOld")}
              </label>
              <select
                value={settings.logRetentionDays ?? 0}
                onChange={async (e) => {
                  const days = parseInt(e.target.value) || 0;
                  const newSettings = { ...settings, logRetentionDays: days };
                  onChange(newSettings);
                  await saveSettings(newSettings);
                  
                  try {
                    await auditSettingsChange("logRetentionDays", settings.logRetentionDays ?? 0, days, {
                      previousLogRetentionDays: settings.logRetentionDays ?? 0,
                      newLogRetentionDays: days,
                    });
                  } catch (error) {
                    console.warn("Audit log hiba:", error);
                  }
                  
                  if (days > 0) {
                    try {
                      const deletedCount = await invoke<number>("delete_old_logs", { days });
                      if (deletedCount > 0) {
                        showToast(
                          settings.language === "hu" 
                            ? `${deletedCount} régi log fájl törölve`
                            : settings.language === "de"
                            ? `${deletedCount} alte Log-Dateien gelöscht`
                            : `${deletedCount} old log files deleted`,
                          "success"
                        );
                      }
                    } catch (error) {
                      console.error("Log törlési hiba:", error);
                      showToast(
                        settings.language === "hu" 
                          ? "Hiba a log fájlok törlésekor"
                          : settings.language === "de"
                          ? "Fehler beim Löschen der Log-Dateien"
                          : "Error deleting log files",
                        "error"
                      );
                    }
                  }
                }}
                style={{
                  ...themeStyles.input,
                  padding: "10px 14px",
                  fontSize: "14px",
                  width: "100%",
                  maxWidth: "300px",
                }}
              >
                <option value="0">{t("settings.logs.neverDelete")}</option>
                <option value="5">5 {t("settings.logs.daysOrOlder")}</option>
                <option value="10">10 {t("settings.logs.daysOrOlder")}</option>
                <option value="15">15 {t("settings.logs.daysOrOlder")}</option>
                <option value="30">30 {t("settings.logs.daysOrOlder")}</option>
                <option value="60">60 {t("settings.logs.daysOrOlder")}</option>
                <option value="90">90 {t("settings.logs.daysOrOlder")}</option>
              </select>
            </div>
            
            {/* Log formátum beállítás */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              }}>
                {t("settings.logs.format")}
              </label>
              <select
                value={settings.logFormat || "text"}
                onChange={async (e) => {
                  const format = e.target.value as "text" | "json";
                  const newSettings = { ...settings, logFormat: format };
                  onChange(newSettings);
                  await saveSettings(newSettings);
                  
                  try {
                    await auditSettingsChange("logFormat", settings.logFormat || "text", format, {
                      previousLogFormat: settings.logFormat || "text",
                      newLogFormat: format,
                    });
                  } catch (error) {
                    console.warn("Audit log hiba:", error);
                  }
                  
                  showToast(
                    settings.language === "hu" 
                      ? `Log formátum módosítva: ${format === "json" ? "JSON" : "Szöveges"}`
                      : settings.language === "de"
                      ? `Log-Format geändert: ${format === "json" ? "JSON" : "Text"}`
                      : `Log format changed: ${format === "json" ? "JSON" : "Text"}`,
                    "success"
                  );
                }}
                style={{
                  ...themeStyles.input,
                  padding: "10px 14px",
                  fontSize: "14px",
                  width: "100%",
                  maxWidth: "300px",
                }}
              >
                <option value="text">{t("settings.logs.format.text")}</option>
                <option value="json">{t("settings.logs.format.json")}</option>
              </select>
              <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
                {t("settings.logs.format.description")}
              </p>
            </div>
            
            {/* Log szint beállítás */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              }}>
                {t("settings.logs.level")}
              </label>
              <select
                value={settings.logLevel || "INFO"}
                onChange={async (e) => {
                  const level = e.target.value as "DEBUG" | "INFO" | "WARN" | "ERROR";
                  const newSettings = { ...settings, logLevel: level };
                  onChange(newSettings);
                  await saveSettings(newSettings);
                  
                  try {
                    await auditSettingsChange("logLevel", settings.logLevel || "INFO", level, {
                      previousLogLevel: settings.logLevel || "INFO",
                      newLogLevel: level,
                    });
                  } catch (error) {
                    console.warn("Audit log hiba:", error);
                  }
                  
                  showToast(
                    settings.language === "hu" 
                      ? `Log szint módosítva: ${level}`
                      : settings.language === "de"
                      ? `Log-Ebene geändert: ${level}`
                      : `Log level changed: ${level}`,
                    "success"
                  );
                }}
                style={{
                  ...themeStyles.input,
                  padding: "10px 14px",
                  fontSize: "14px",
                  width: "100%",
                  maxWidth: "300px",
                }}
              >
                <option value="DEBUG">{t("settings.logs.level.debug")}</option>
                <option value="INFO">{t("settings.logs.level.info")}</option>
                <option value="WARN">{t("settings.logs.level.warn")}</option>
                <option value="ERROR">{t("settings.logs.level.error")}</option>
              </select>
              <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
                {t("settings.logs.level.description")}
              </p>
            </div>
            
            {/* Log mappa megnyitása */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              }}>
                {t("settings.logs.location")}
              </label>
              <Tooltip content={settings.language === "hu" 
                ? "Log mappa megnyitása a fájlkezelőben" 
                : settings.language === "de"
                ? "Log-Ordner im Datei-Explorer öffnen"
                : "Open log folder in file manager"}>
                <button
                  onClick={async () => {
                    try {
                      const logDirPath = await invoke<string>("get_log_directory_path");
                      await invoke("open_directory", { path: logDirPath });
                    } catch (error) {
                      console.error("Log mappa megnyitási hiba:", error);
                      showToast(
                        settings.language === "hu" 
                          ? "Hiba a log mappa megnyitásakor"
                          : settings.language === "de"
                          ? "Fehler beim Öffnen des Log-Ordners"
                          : "Error opening log folder",
                        "error"
                      );
                    }
                  }}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    padding: "10px 20px",
                    fontSize: "14px",
                  }}
                >
                  📁 {t("settings.logs.openFolder")}
                </button>
              </Tooltip>
            </div>

            {/* Log History */}
            <div style={{ marginTop: "24px" }}>
              <h3 style={{ 
                fontSize: "16px", 
                fontWeight: 600, 
                color: theme.colors.text,
                marginBottom: "12px"
              }}>
                📋 {t("settings.logs.logHistory" as any) || (settings.language === "hu" ? "Log történet" : settings.language === "de" ? "Log-Verlauf" : "Log History")}
              </h3>
              {logHistory.length > 0 ? (
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
                  {logHistory.map((item, index) => {
                    const dateStr = item.date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    });

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedLogFile({ path: item.filePath, name: item.fileName });
                          setLogViewerOpen(true);
                        }}
                        style={{
                          padding: "12px",
                          borderRadius: "6px",
                          backgroundColor: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
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
                            color: theme.colors.text,
                            marginBottom: "4px"
                          }}>
                            {item.type === "frontend" 
                              ? (settings.language === "hu" ? "Frontend log" : settings.language === "de" ? "Frontend-Log" : "Frontend log")
                              : (settings.language === "hu" ? "Backend log" : settings.language === "de" ? "Backend-Log" : "Backend log")}
                          </div>
                          <div style={{ 
                            fontSize: "11px", 
                            color: theme.colors.textMuted 
                          }}>
                            {dateStr} • {item.fileName}
                          </div>
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
                    ? "Még nincsenek log fájlok. A log fájlok automatikusan létrejönnek, amikor az alkalmazás használatban van." 
                    : settings.language === "de"
                    ? "Noch keine Log-Dateien vorhanden. Log-Dateien werden automatisch erstellt, wenn die Anwendung verwendet wird."
                    : "No log files yet. Log files will be created automatically when the application is in use."}
                </div>
              )}
            </div>
          </div>

          {/* JOBB OSZLOP: Audit Log Management */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ 
              fontSize: "16px", 
              fontWeight: 600, 
              color: theme.colors.text,
              marginBottom: "8px"
            }}>
              🔐 {settings.language === "hu" ? "Audit Logok" : settings.language === "de" ? "Audit-Logs" : "Audit Logs"}
            </h3>
            
            {/* Audit log törlési beállítás */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              }}>
                {t("settings.logs.deleteOlderAuditLogs" as any) || (settings.language === "hu" ? "Törlés régebbi audit log fájlok" : settings.language === "de" ? "Ältere Audit-Log-Dateien löschen" : "Delete older audit log files")}
              </label>
              <select
                value={settings.auditLogRetentionDays ?? 0}
                onChange={async (e) => {
                  const days = parseInt(e.target.value) || 0;
                  const newSettings = { ...settings, auditLogRetentionDays: days };
                  onChange(newSettings);
                  await saveSettings(newSettings);
                  
                  try {
                    await auditSettingsChange("auditLogRetentionDays", settings.auditLogRetentionDays ?? 0, days, {
                      previousAuditLogRetentionDays: settings.auditLogRetentionDays ?? 0,
                      newAuditLogRetentionDays: days,
                    });
                  } catch (error) {
                    console.warn("Audit log hiba:", error);
                  }
                  
                  if (days > 0) {
                    try {
                      const deletedCount = await cleanupOldAuditLogs(days);
                      if (deletedCount > 0) {
                        showToast(
                          settings.language === "hu" 
                            ? `${deletedCount} régi audit log fájl törölve`
                            : settings.language === "de"
                            ? `${deletedCount} alte Audit-Log-Dateien gelöscht`
                            : `${deletedCount} old audit log files deleted`,
                          "success"
                        );
                        loadAuditLogHistory();
                      }
                    } catch (error) {
                      console.error("Audit log törlési hiba:", error);
                      showToast(
                        settings.language === "hu" 
                          ? "Hiba az audit log fájlok törlésekor"
                          : settings.language === "de"
                          ? "Fehler beim Löschen der Audit-Log-Dateien"
                          : "Error deleting audit log files",
                        "error"
                      );
                    }
                  }
                }}
                style={{
                  ...themeStyles.input,
                  padding: "10px 14px",
                  fontSize: "14px",
                  width: "100%",
                  maxWidth: "300px",
                  marginBottom: "12px",
                }}
              >
                <option value="0">{t("settings.logs.neverDelete")}</option>
                <option value="5">5 {t("settings.logs.daysOrOlder")}</option>
                <option value="10">10 {t("settings.logs.daysOrOlder")}</option>
                <option value="15">15 {t("settings.logs.daysOrOlder")}</option>
                <option value="30">30 {t("settings.logs.daysOrOlder")}</option>
                <option value="60">60 {t("settings.logs.daysOrOlder")}</option>
                <option value="90">90 {t("settings.logs.daysOrOlder")}</option>
              </select>
            </div>

            {/* Audit log mappa megnyitása */}
            <div>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              }}>
                {t("settings.logs.folderLocation" as any) || (settings.language === "hu" ? "Mappa helye" : settings.language === "de" ? "Ordnerstandort" : "Folder Location")}
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Tooltip content={settings.language === "hu" 
                  ? "Audit log mappa megnyitása a fájlkezelőben" 
                  : settings.language === "de"
                  ? "Audit-Log-Ordner im Datei-Explorer öffnen"
                  : "Open audit log folder in file manager"}>
                  <button
                    onClick={async () => {
                      try {
                        const auditLogDirPath = await invoke<string>("get_audit_log_directory_path");
                        await invoke("open_directory", { path: auditLogDirPath });
                      } catch (error) {
                        console.error("Audit log mappa megnyitási hiba:", error);
                        showToast(
                          settings.language === "hu" 
                            ? "Hiba az audit log mappa megnyitásakor"
                            : settings.language === "de"
                            ? "Fehler beim Öffnen des Audit-Log-Ordners"
                            : "Error opening audit log folder",
                          "error"
                        );
                      }
                    }}
                    style={{
                      ...themeStyles.button,
                      ...themeStyles.buttonSecondary,
                      padding: "6px 14px",
                      fontSize: "12px",
                    }}
                  >
                    📁 {t("settings.logs.openFolder" as any) || (settings.language === "hu" ? "Mappa megnyitása" : settings.language === "de" ? "Ordner öffnen" : "Open Folder")}
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Audit Log History */}
            <div style={{ marginTop: "24px" }}>
              <h3 style={{ 
                fontSize: "16px", 
                fontWeight: 600, 
                color: theme.colors.text,
                marginBottom: "12px"
              }}>
                🔐 {t("settings.logs.auditLogHistory" as any) || (settings.language === "hu" ? "Audit Log történet" : settings.language === "de" ? "Audit-Log-Verlauf" : "Audit Log History")}
              </h3>
              {auditLogHistory.length > 0 ? (
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
                  {auditLogHistory.map((item, index) => {
                    const dateStr = item.date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    });

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedAuditLogFile({ path: item.filePath, name: item.fileName });
                          setAuditLogViewerOpen(true);
                        }}
                        style={{
                          padding: "12px",
                          borderRadius: "6px",
                          backgroundColor: theme.colors.background,
                          border: `1px solid ${theme.colors.border}`,
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
                            color: theme.colors.text,
                            marginBottom: "4px"
                          }}>
                            {settings.language === "hu" ? "Audit Log" : settings.language === "de" ? "Audit-Log" : "Audit Log"}
                          </div>
                          <div style={{ 
                            fontSize: "11px", 
                            color: theme.colors.textMuted 
                          }}>
                            {dateStr} • {item.fileName} • {item.size}
                          </div>
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
                    ? "Még nincsenek audit log fájlok. Az audit log fájlok automatikusan létrejönnek, amikor kritikus műveletek történnek." 
                    : settings.language === "de"
                    ? "Noch keine Audit-Log-Dateien vorhanden. Audit-Log-Dateien werden automatisch erstellt, wenn kritische Aktionen durchgeführt werden."
                    : "No audit log files yet. Audit log files will be created automatically when critical actions are performed."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Diagnostics */}
      <div style={{ 
        ...themeStyles.card,
        marginTop: "32px",
      }}>
        <h3 style={{ 
          fontSize: "16px", 
          fontWeight: 600, 
          color: theme.colors.text,
          marginBottom: "12px"
        }}>
          🔍 {t("settings.backup.systemDiagnostics") || "Rendszer Diagnosztika"}
        </h3>
        <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
          {t("settings.backup.systemDiagnosticsTooltip") || "Rendszer diagnosztika és stabilitás ellenőrzése"}
        </p>
        <Tooltip content={t("settings.backup.systemDiagnosticsTooltip") || "Rendszer diagnosztika és stabilitás ellenőrzése"}>
          <button
            onClick={() => setShowSystemDiagnostics(true)}
            style={{
              ...themeStyles.button,
              backgroundColor: theme.colors.primary || "#4f46e5",
              color: "#ffffff",
              border: `1px solid ${theme.colors.primary || "#4f46e5"}`,
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "600",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primaryHover || "#4338ca";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary || "#4f46e5";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🔍 {t("settings.backup.systemDiagnostics") || "Rendszer Diagnosztika"}
          </button>
        </Tooltip>
      </div>

      {/* Export/Import Data Section - 2 oszlop */}
      <div data-tutorial="export-import-section" style={{ 
        display: "flex", 
        flexDirection: "row",
        gap: "24px", 
        marginTop: "32px",
        flexWrap: "wrap"
      }}>
        {/* Export Data Section */}
        <div style={{ flex: "1 1 400px", minWidth: "300px" }}>
          <div style={{ ...themeStyles.card }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: "20px", 
              fontSize: "20px", 
              fontWeight: "600", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
            }}>
              💾 {t("settings.exportTitle")}
            </h3>
            <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
              {t("settings.exportDescription")}
            </p>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                cursor: "pointer", 
                marginBottom: "12px" 
              }}>
                <input
                  type="checkbox"
                  checked={exportFilaments}
                  onChange={e => setExportFilaments(e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
                <span>🧵 {t("settings.exportFilaments")} ({filaments.length})</span>
              </label>
              
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                cursor: "pointer", 
                marginBottom: "12px" 
              }}>
                <input
                  type="checkbox"
                  checked={exportPrinters}
                  onChange={e => setExportPrinters(e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
                <span>🖨️ {t("settings.exportPrinters")} ({printers.length})</span>
              </label>
              
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                cursor: "pointer" 
              }}>
                <input
                  type="checkbox"
                  checked={exportOffers}
                  onChange={e => setExportOffers(e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
                <span>📄 {t("settings.exportOffers")} ({offers.length})</span>
              </label>
            </div>

            <Tooltip content={t("settings.data.exportTooltip")}>
              <button
                onClick={handleExport}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonPrimary,
                  width: "100%"
                }}
              >
                {t("settings.exportButton")}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Import Data Section */}
        <div style={{ flex: "1 1 400px", minWidth: "300px" }}>
          <div style={{ ...themeStyles.card }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: "20px", 
              fontSize: "20px", 
              fontWeight: "600", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
            }}>
              📥 {t("settings.importTitle")}
            </h3>
            <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
              {t("settings.importDescription")}
            </p>
            <p style={{ marginBottom: "16px", fontSize: "12px", color: "#dc3545", fontWeight: "600" }}>
              ⚠️ {t("settings.data.importWarning")}
            </p>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                cursor: "pointer", 
                marginBottom: "12px" 
              }}>
                <input
                  type="checkbox"
                  checked={importFilaments}
                  onChange={e => setImportFilaments(e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
                <span>🧵 {t("settings.importFilaments")}</span>
              </label>
              
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                cursor: "pointer", 
                marginBottom: "12px" 
              }}>
                <input
                  type="checkbox"
                  checked={importPrinters}
                  onChange={e => setImportPrinters(e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
                <span>🖨️ {t("settings.importPrinters")}</span>
              </label>
              
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                fontWeight: "500", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                cursor: "pointer" 
              }}>
                <input
                  type="checkbox"
                  checked={importOffers}
                  onChange={e => setImportOffers(e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
                <span>📄 {t("settings.importOffers")}</span>
              </label>
            </div>

            <Tooltip content={t("settings.data.import.tooltip")}>
              <button
                onClick={handleImport}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSuccess,
                  width: "100%"
                }}
              >
                {t("settings.importButton")}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
