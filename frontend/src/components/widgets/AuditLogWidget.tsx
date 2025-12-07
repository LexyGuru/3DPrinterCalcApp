import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";
import { listAuditLogs } from "../../utils/auditLog";
import { invoke } from "@tauri-apps/api/core";
import type { AuditLogEntry, AuditLogAction, AuditLogEntity } from "../../utils/auditLog";

interface AuditLogWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  onViewFullAuditLog?: () => void;
}

export const AuditLogWidget: React.FC<AuditLogWidgetProps> = ({
  widget,
  theme,
  settings,
  onViewFullAuditLog,
}) => {
  const t = useTranslation(settings.language);
  const [logEntries, setLogEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<AuditLogAction | "all">("all");
  const [filterEntity, setFilterEntity] = useState<AuditLogEntity | "all">("all");

  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = useMemo(() => widget.size === "small", [widget.size]);
  const isMedium = useMemo(() => widget.size === "medium", [widget.size]);
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const fontSize = isSmall ? "11px" : isMedium ? "13px" : "14px";
  const titleFontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";

  const maxEntries = useMemo(() => isSmall ? 5 : isMedium ? 8 : 12, [isSmall, isMedium]);

  const isLoadingRef = useRef(false); // Flag, hogy ne töltse be egyszerre többször

  const loadAuditLogs = useCallback(async () => {
    // Ha már töltődik, ne indítsuk el újra
    if (isLoadingRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      // Timeout hozzáadása
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), 10000);
      });

      // Betöltjük az audit log fájlok listáját
      const auditLogHistory = await Promise.race([
        listAuditLogs(),
        timeoutPromise,
      ]);

      if (auditLogHistory.length === 0) {
        setLogEntries([]);
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }

      // A legújabb audit log fájlt használjuk
      const latestLog = auditLogHistory[0];
      
      // Beolvassuk az audit log fájl tartalmát
      const content = await Promise.race([
        invoke<string>("read_audit_log_file", { filePath: latestLog.filePath }),
        timeoutPromise,
      ]);
      
      const entries: AuditLogEntry[] = [];
      const lines = content.split("\n").filter(line => line.trim());

      // Utolsó N sor beolvasása (a legutóbbi bejegyzések)
      const recentLines = lines.slice(-30);

      for (const line of recentLines) {
        if (!line.trim()) continue;

        try {
          const entry = JSON.parse(line) as AuditLogEntry;
          entries.push(entry);
        } catch (parseError) {
          // Ha nem sikerült parse-olni, kihagyjuk
          continue;
        }
      }

      // Ha nincsenek sorok, próbáljuk meg JSON array-ként parse-olni
      if (entries.length === 0 && content.trim()) {
        try {
          const arrayEntries = JSON.parse(content) as AuditLogEntry[];
          entries.push(...arrayEntries.slice(-30));
        } catch {
          // Ha nem sikerült, akkor üres marad
        }
      }

      // Rendezés dátum szerint (legújabb először)
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogEntries(entries.slice(0, maxEntries));
    } catch (err) {
      console.error("❌ Hiba az audit log betöltésekor:", err);
      const errorMessage = err instanceof Error && err.message.includes("Timeout")
        ? "Timeout: loading takes too long"
        : t("widget.auditLog.error") || "Error loading audit logs";
      setError(errorMessage);
      setLogEntries([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [maxEntries, t]);

  const loadAuditLogsRef = useRef(loadAuditLogs);
  
  // Frissítjük a ref-et, amikor a callback változik
  useEffect(() => {
    loadAuditLogsRef.current = loadAuditLogs;
  }, [loadAuditLogs]);

  useEffect(() => {
    // Csak akkor töltse be, ha a widget látható
    if (!widget.visible) {
      return;
    }

    // Kis késleltetés
    const timeoutId = setTimeout(() => {
      if (widget.visible && !isLoadingRef.current) {
        loadAuditLogsRef.current();
      }
    }, 500);
    
    // Nincs periodikus frissítés - csak egyszer töltjük be
    // Ha frissíteni kell, manuálisan kell majd hozzáadni
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [widget.visible]); // Csak widget.visible-től függ

  const filteredEntries = logEntries.filter(entry => {
    if (filterAction !== "all" && entry.action !== filterAction) return false;
    if (filterEntity !== "all" && entry.entity !== filterEntity) return false;
    return true;
  });

  const getActionLabel = (action: AuditLogAction): string => {
    const actionLabels: Record<AuditLogAction, string> = {
      login: "Login",
      logout: "Logout",
      create: t("auditLogViewer.filter.action.create") || "Create",
      update: t("auditLogViewer.filter.action.update") || "Update",
      delete: t("auditLogViewer.filter.action.delete") || "Delete",
      export: "Export",
      import: "Import",
      settings_change: t("auditLogViewer.filter.action.settingsChange") || "Settings Change",
      backup_create: t("auditLogViewer.filter.action.backupCreate") || "Backup Create",
      backup_restore: t("auditLogViewer.filter.action.backupRestore") || "Backup Restore",
      factory_reset: t("auditLogViewer.filter.action.factoryReset") || "Factory Reset",
      password_change: "Password Change",
      encryption_enable: "Encryption Enable",
      encryption_disable: "Encryption Disable",
    };
    return actionLabels[action] || action;
  };

  const getEntityLabel = (entity: AuditLogEntity): string => {
    const entityLabels: Record<AuditLogEntity, string> = {
      printer: t("auditLogViewer.filter.entity.printer") || "Printer",
      filament: t("auditLogViewer.filter.entity.filament") || "Filament",
      offer: t("auditLogViewer.filter.entity.offer") || "Offer",
      customer: t("auditLogViewer.filter.entity.customer") || "Customer",
      settings: t("auditLogViewer.filter.entity.settings") || "Settings",
      backup: t("auditLogViewer.filter.entity.backup") || "Backup",
      project: "Project",
      task: "Task",
      app: t("auditLogViewer.filter.entity.app") || "App",
    };
    return entityLabels[entity] || entity;
  };

  const getSettingKeyLabel = (settingKey: string): string => {
    // Beállítás kulcsok emberi olvasható nevei
    const settingLabels: Record<string, string> = {
      auditLogRetentionDays: settings.language === "hu" ? "Audit log megőrzési idő" : settings.language === "de" ? "Audit-Log-Aufbewahrungszeit" : "Audit log retention days",
      logRetentionDays: settings.language === "hu" ? "Log megőrzési idő" : settings.language === "de" ? "Log-Aufbewahrungszeit" : "Log retention days",
      logLevel: settings.language === "hu" ? "Log szint" : settings.language === "de" ? "Log-Ebene" : "Log level",
      language: settings.language === "hu" ? "Nyelv" : settings.language === "de" ? "Sprache" : "Language",
    };
    return settingLabels[settingKey] || settingKey;
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString(settings.language === "hu" ? "hu-HU" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return timestamp;
    }
  };

  const formatDate = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return timestamp.split("T")[0];
    }
  };

  return (
    <div style={{ 
      height: "100%", 
      width: "100%",
      display: "flex", 
      flexDirection: "column",
      minHeight: 0,
      boxSizing: "border-box",
    }}>
      <div style={{
        backgroundColor: cardBg,
        borderRadius: isSmall ? "8px" : "12px",
        padding: padding,
        boxShadow: isGradientBackground
          ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
          : `0 4px 16px ${theme.colors.shadow}`,
        border: `1px solid ${theme.colors.border}`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        gap: isSmall ? "8px" : "12px",
      }}>
        <div style={{
          fontSize: titleFontSize,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: isSmall ? "4px" : "8px",
        }}>
          {t("widget.title.auditLog") || "Audit Log"}
        </div>

        {/* Szűrők */}
        {!isSmall && (
          <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as AuditLogAction | "all")}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: cardBg,
                color: theme.colors.text,
                fontSize: fontSize,
                cursor: "pointer",
                flex: 1,
                minWidth: "120px",
              }}
            >
              <option value="all">{t("widget.auditLog.filter.allActions") || "All Actions"}</option>
              <option value="create">{t("auditLogViewer.filter.action.create") || "Create"}</option>
              <option value="update">{t("auditLogViewer.filter.action.update") || "Update"}</option>
              <option value="delete">{t("auditLogViewer.filter.action.delete") || "Delete"}</option>
              <option value="settings_change">{t("auditLogViewer.filter.action.settingsChange") || "Settings"}</option>
            </select>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value as AuditLogEntity | "all")}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: cardBg,
                color: theme.colors.text,
                fontSize: fontSize,
                cursor: "pointer",
                flex: 1,
                minWidth: "120px",
              }}
            >
              <option value="all">{t("widget.auditLog.filter.allEntities") || "All Entities"}</option>
              <option value="printer">{t("auditLogViewer.filter.entity.printer") || "Printer"}</option>
              <option value="filament">{t("auditLogViewer.filter.entity.filament") || "Filament"}</option>
              <option value="offer">{t("auditLogViewer.filter.entity.offer") || "Offer"}</option>
              <option value="customer">{t("auditLogViewer.filter.entity.customer") || "Customer"}</option>
            </select>
          </div>
        )}

        {loading ? (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.colors.textMuted,
            fontSize: fontSize,
          }}>
            {t("common.loading") || "Loading..."}
          </div>
        ) : error ? (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.colors.danger || "#dc3545",
            fontSize: fontSize,
          }}>
            {error}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.colors.textMuted,
            fontSize: fontSize,
            textAlign: "center",
            padding: "20px",
          }}>
            {t("widget.auditLog.noEntries") || "No audit log entries"}
          </div>
        ) : (
          <>
            <div style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}>
                {filteredEntries.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px 10px",
                      backgroundColor: entry.success
                        ? `${theme.colors.success || "#28a745"}15`
                        : `${theme.colors.danger || "#dc3545"}15`,
                      borderRadius: "6px",
                      border: `1px solid ${entry.success
                        ? `${theme.colors.success || "#28a745"}30`
                        : `${theme.colors.danger || "#dc3545"}30`}`,
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px",
                      marginBottom: "4px",
                    }}>
                      <div style={{
                        fontSize: isSmall ? "10px" : fontSize,
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}>
                        {getActionLabel(entry.action)} {getEntityLabel(entry.entity)}
                      </div>
                      <div style={{
                        fontSize: isSmall ? "9px" : "10px",
                        color: theme.colors.textMuted,
                        whiteSpace: "nowrap",
                      }}>
                        {formatTimestamp(entry.timestamp)}
                      </div>
                    </div>
                    {entry.entityName && entry.entity === "settings" && (
                      <div style={{
                        fontSize: isSmall ? "10px" : fontSize,
                        color: theme.colors.text,
                        marginBottom: "2px",
                      }}>
                        {getSettingKeyLabel(entry.entityName)}
                      </div>
                    )}
                    {entry.entityName && entry.entity !== "settings" && (
                      <div style={{
                        fontSize: isSmall ? "10px" : fontSize,
                        color: theme.colors.text,
                        marginBottom: "2px",
                      }}>
                        {entry.entityName}
                      </div>
                    )}
                    <div style={{
                      fontSize: isSmall ? "9px" : "10px",
                      color: theme.colors.textMuted,
                    }}>
                      {formatDate(entry.timestamp)}
                    </div>
                    {!entry.success && entry.errorMessage && (
                      <div style={{
                        fontSize: isSmall ? "9px" : "10px",
                        color: theme.colors.danger || "#dc3545",
                        marginTop: "4px",
                      }}>
                        {entry.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* View full audit log gomb */}
            {onViewFullAuditLog && (
              <button
                onClick={onViewFullAuditLog}
                style={{
                  padding: "8px 12px",
                  backgroundColor: theme.colors.primary || "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: fontSize,
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primaryHover || "#0056b3";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.primary || "#007bff";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {t("widget.auditLog.viewFullLog") || "View Full Audit Log"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

