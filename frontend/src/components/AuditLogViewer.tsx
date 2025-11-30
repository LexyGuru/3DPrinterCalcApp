import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
import type { Theme } from "../utils/themes";
import type { Settings } from "../types";
import { useToast } from "./Toast";
import type { AuditLogEntry, AuditLogAction, AuditLogEntity } from "../utils/auditLog";
import { useVirtualScroll } from "../hooks/useVirtualScroll";
import { useTranslation } from "../utils/translations";

interface AuditLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogFilePath: string;
  auditLogFileName: string;
  theme: Theme;
  settings: Settings;
}

interface ParsedAuditLogEntry extends AuditLogEntry {
  rawLine: string;
  lineNumber: number;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  isOpen,
  onClose,
  auditLogFilePath,
  auditLogFileName,
  theme,
  settings,
}) => {
  const { showToast } = useToast();
  const t = useTranslation(settings.language);
  const [logEntries, setLogEntries] = useState<ParsedAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<AuditLogAction | "all">("all");
  const [filterEntity, setFilterEntity] = useState<AuditLogEntity | "all">("all");
  const [filterSuccess, setFilterSuccess] = useState<"all" | "success" | "error">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  
  // Log entry fix magasság (pixel) - virtuális scroll-hoz
  const LOG_ENTRY_HEIGHT = 100; // Becsült magasság egy audit log entry-hez

  const themeStyles = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    primary: theme.colors.primary,
    border: theme.colors.border,
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  };

  // Audit log fájl betöltése
  useEffect(() => {
    if (!isOpen || !auditLogFilePath) return;

    const loadAuditLogFile = async () => {
      setLoading(true);
      setError(null);
      setLogEntries([]);

      try {
        // Backend command-ot használunk az audit log fájl olvasásához
        const content = await invoke<string>("read_audit_log_file", { filePath: auditLogFilePath });
        
        // Parse NDJSON (newline-delimited JSON) vagy JSON array formátum
        const entries: AuditLogEntry[] = [];
        const lines = content.split("\n").filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const entry = JSON.parse(line) as AuditLogEntry;
            entries.push(entry);
          } catch (parseError) {
            console.warn("Nem sikerült parse-olni az audit log sort:", line, parseError);
          }
        }
        
        // Ha nincsenek sorok, próbáljuk meg JSON array-ként parse-olni
        if (entries.length === 0 && content.trim()) {
          try {
            const arrayEntries = JSON.parse(content) as AuditLogEntry[];
            entries.push(...arrayEntries);
          } catch {
            // Ha nem sikerült, akkor üres marad
          }
        }
        
        const parsedEntries: ParsedAuditLogEntry[] = entries.map((entry, index) => ({
          ...entry,
          rawLine: JSON.stringify(entry, null, 2),
          lineNumber: index + 1,
        }));

        setLogEntries(parsedEntries);
      } catch (err) {
        console.error("❌ Hiba az audit log fájl betöltésekor:", err);
        setError(
          settings.language === "hu"
            ? "Hiba az audit log fájl betöltésekor"
            : settings.language === "de"
            ? "Fehler beim Laden der Audit-Log-Datei"
            : "Error loading audit log file"
        );
        showToast(
          settings.language === "hu"
            ? "Hiba az audit log fájl betöltésekor"
            : settings.language === "de"
            ? "Fehler beim Laden der Audit-Log-Datei"
            : "Error loading audit log file",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogFile();
  }, [isOpen, auditLogFilePath, settings.language, showToast]);

  // Szűrt és keresett audit log bejegyzések
  const filteredEntries = useMemo(() => {
    let filtered = logEntries;

    // Action filter
    if (filterAction !== "all") {
      filtered = filtered.filter(entry => entry.action === filterAction);
    }

    // Entity filter
    if (filterEntity !== "all") {
      filtered = filtered.filter(entry => entry.entity === filterEntity);
    }

    // Success filter
    if (filterSuccess !== "all") {
      filtered = filtered.filter(entry => 
        filterSuccess === "success" ? entry.success : !entry.success
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => {
        const searchableText = [
          entry.timestamp,
          entry.action,
          entry.entity,
          entry.entityId?.toString(),
          entry.entityName,
          entry.errorMessage,
          JSON.stringify(entry.details),
        ].filter(Boolean).join(" ").toLowerCase();
        
        return searchableText.includes(searchLower);
      });
    }

    return filtered;
  }, [logEntries, filterAction, filterEntity, filterSuccess, searchTerm]);

  // Virtual scroll setup
  const {
    visibleItems,
    totalHeight,
    offsetY,
    containerRef,
  } = useVirtualScroll({
    items: filteredEntries,
    itemHeight: LOG_ENTRY_HEIGHT,
    containerHeight: 600, // Modal magasság
    overscan: 5,
  });

  // Statisztikák
  const stats = useMemo(() => {
    const total = logEntries.length;
    const success = logEntries.filter(e => e.success).length;
    const error = logEntries.filter(e => !e.success).length;
    const create = logEntries.filter(e => e.action === "create").length;
    const update = logEntries.filter(e => e.action === "update").length;
    const delete_ = logEntries.filter(e => e.action === "delete").length;

    return { total, success, error, create, update, delete: delete_ };
  }, [logEntries]);

  // Export funkció
  const handleExport = async () => {
    try {
      const entriesToExport = selectedEntries.size > 0
        ? filteredEntries.filter((_, index) => selectedEntries.has(index))
        : filteredEntries;

      if (entriesToExport.length === 0) {
        showToast(t("auditLogViewer.export.noEntries"), "warning");
        return;
      }

      const exportContent = entriesToExport
        .map(entry => JSON.stringify(entry, null, 2))
        .join("\n\n");

      const filePath = await save({
        defaultPath: `audit-log-export-${new Date().toISOString().split("T")[0]}.txt`,
        filters: [
          {
            name: "Text",
            extensions: ["txt"],
          },
        ],
      });

      if (filePath) {
        await writeTextFile(filePath, exportContent);
        showToast(t("auditLogViewer.export.success"), "success");
      }
    } catch (error) {
      console.error("❌ Hiba az export során:", error);
      showToast(t("auditLogViewer.export.error"), "error");
    }
  };

  // Entry kiválasztás
  const toggleEntrySelection = (index: number) => {
    setSelectedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Timestamp formázása
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  // Action szín
  const getActionColor = (action: AuditLogAction) => {
    switch (action) {
      case "create":
        return themeStyles.success;
      case "update":
        return themeStyles.info;
      case "delete":
        return themeStyles.error;
      case "factory_reset":
        return themeStyles.error;
      case "backup_create":
      case "backup_restore":
        return themeStyles.warning;
      default:
        return themeStyles.text;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{
              width: "90%",
              maxWidth: "1200px",
              maxHeight: "90vh",
              backgroundColor: themeStyles.surface,
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: "20px",
              borderBottom: `1px solid ${themeStyles.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 600,
                  color: themeStyles.text,
                }}>
                  📋 {t("auditLogViewer.title")}
                </h2>
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: "12px",
                  color: themeStyles.textMuted,
                }}>
                  {auditLogFileName}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: themeStyles.textMuted,
                  padding: "4px 8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = themeStyles.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = themeStyles.textMuted;
                }}
              >
                ✕
              </button>
            </div>

            {/* Filters and Search */}
            <div style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${themeStyles.border}`,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}>
              {/* Search */}
              <input
                type="text"
                placeholder={t("auditLogViewer.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${themeStyles.border}`,
                  backgroundColor: themeStyles.background,
                  color: themeStyles.text,
                  fontSize: "14px",
                  width: "100%",
                }}
              />

              {/* Filters */}
              <div style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}>
                {/* Action filter */}
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value as AuditLogAction | "all")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${themeStyles.border}`,
                    backgroundColor: themeStyles.background,
                    color: themeStyles.text,
                    fontSize: "13px",
                  }}
                >
                  <option value="all">{t("auditLogViewer.filter.action.all")}</option>
                  <option value="create">{t("auditLogViewer.filter.action.create")}</option>
                  <option value="update">{t("auditLogViewer.filter.action.update")}</option>
                  <option value="delete">{t("auditLogViewer.filter.action.delete")}</option>
                  <option value="backup_create">{t("auditLogViewer.filter.action.backupCreate")}</option>
                  <option value="backup_restore">{t("auditLogViewer.filter.action.backupRestore")}</option>
                  <option value="factory_reset">{t("auditLogViewer.filter.action.factoryReset")}</option>
                  <option value="settings_change">{t("auditLogViewer.filter.action.settingsChange")}</option>
                </select>

                {/* Entity filter */}
                <select
                  value={filterEntity}
                  onChange={(e) => setFilterEntity(e.target.value as AuditLogEntity | "all")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${themeStyles.border}`,
                    backgroundColor: themeStyles.background,
                    color: themeStyles.text,
                    fontSize: "13px",
                  }}
                >
                  <option value="all">{t("auditLogViewer.filter.entity.all")}</option>
                  <option value="printer">{t("auditLogViewer.filter.entity.printer")}</option>
                  <option value="filament">{t("auditLogViewer.filter.entity.filament")}</option>
                  <option value="offer">{t("auditLogViewer.filter.entity.offer")}</option>
                  <option value="customer">{t("auditLogViewer.filter.entity.customer")}</option>
                  <option value="settings">{t("auditLogViewer.filter.entity.settings")}</option>
                  <option value="backup">{t("auditLogViewer.filter.entity.backup")}</option>
                  <option value="app">{t("auditLogViewer.filter.entity.app")}</option>
                </select>

                {/* Success filter */}
                <select
                  value={filterSuccess}
                  onChange={(e) => setFilterSuccess(e.target.value as "all" | "success" | "error")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: `1px solid ${themeStyles.border}`,
                    backgroundColor: themeStyles.background,
                    color: themeStyles.text,
                    fontSize: "13px",
                  }}
                >
                  <option value="all">{t("auditLogViewer.filter.success.all")}</option>
                  <option value="success">{t("auditLogViewer.filter.success.success")}</option>
                  <option value="error">{t("auditLogViewer.filter.success.error")}</option>
                </select>

                {/* Export button */}
                <button
                  onClick={handleExport}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${themeStyles.primary}`,
                    backgroundColor: themeStyles.primary,
                    color: "#ffffff",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {t("auditLogViewer.export")}
                </button>
              </div>

              {/* Stats */}
              <div style={{
                display: "flex",
                gap: "16px",
                fontSize: "12px",
                color: themeStyles.textMuted,
              }}>
                <span>{t("auditLogViewer.stats.total")}: {stats.total}</span>
                <span style={{ color: themeStyles.success }}>{t("auditLogViewer.stats.success")}: {stats.success}</span>
                <span style={{ color: themeStyles.error }}>{t("auditLogViewer.stats.error")}: {stats.error}</span>
                <span>{t("auditLogViewer.stats.create")}: {stats.create}</span>
                <span>{t("auditLogViewer.stats.update")}: {stats.update}</span>
                <span>{t("auditLogViewer.stats.delete")}: {stats.delete}</span>
                <span>{t("auditLogViewer.stats.filtered")}: {filteredEntries.length}</span>
              </div>
            </div>

            {/* Log entries */}
            <div style={{
              flex: 1,
              overflow: "auto",
              padding: "16px",
            }}>
              {loading ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px",
                  color: themeStyles.textMuted,
                }}>
                  {t("auditLogViewer.loading")}
                </div>
              ) : error ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px",
                  color: themeStyles.error,
                }}>
                  {error}
                </div>
              ) : filteredEntries.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px",
                  color: themeStyles.textMuted,
                }}>
                  {t("auditLogViewer.noResults")}
                </div>
              ) : (
                <div
                  ref={containerRef}
                  style={{
                    position: "relative",
                    height: `${totalHeight}px`,
                    overflow: "auto",
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${offsetY}px)`,
                  }}>
                    {visibleItems.map((entryIndex) => {
                      const entry = filteredEntries[entryIndex];
                      if (!entry) return null;
                      
                      const isSelected = selectedEntries.has(entryIndex);
                      
                      return (
                        <div
                          key={entryIndex}
                          onClick={() => toggleEntrySelection(entryIndex)}
                          style={{
                            padding: "12px",
                            marginBottom: "8px",
                            borderRadius: "6px",
                            backgroundColor: isSelected ? themeStyles.primary + "20" : themeStyles.background,
                            border: `1px solid ${isSelected ? themeStyles.primary : themeStyles.border}`,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = themeStyles.surface;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = themeStyles.background;
                            }
                          }}
                        >
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "8px",
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                marginBottom: "4px",
                              }}>
                                <span style={{
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  backgroundColor: getActionColor(entry.action) + "30",
                                  color: getActionColor(entry.action),
                                }}>
                                  {entry.action.toUpperCase()}
                                </span>
                                <span style={{
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  backgroundColor: themeStyles.surface,
                                  color: themeStyles.text,
                                }}>
                                  {entry.entity}
                                </span>
                                {entry.success ? (
                                  <span style={{
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    backgroundColor: themeStyles.success + "30",
                                    color: themeStyles.success,
                                  }}>
                                    ✓ {t("auditLogViewer.success")}
                                  </span>
                                ) : (
                                  <span style={{
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    backgroundColor: themeStyles.error + "30",
                                    color: themeStyles.error,
                                  }}>
                                    ✗ {t("auditLogViewer.error")}
                                  </span>
                                )}
                              </div>
                              <div style={{
                                fontSize: "13px",
                                fontWeight: 500,
                                color: themeStyles.text,
                                marginBottom: "4px",
                              }}>
                                {entry.entityName || entry.entityId || entry.entity}
                              </div>
                              <div style={{
                                fontSize: "11px",
                                color: themeStyles.textMuted,
                              }}>
                                {formatTimestamp(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                          {entry.errorMessage && (
                            <div style={{
                              padding: "8px",
                              marginTop: "8px",
                              borderRadius: "4px",
                              backgroundColor: themeStyles.error + "10",
                              border: `1px solid ${themeStyles.error}30`,
                              fontSize: "12px",
                              color: themeStyles.error,
                            }}>
                              {entry.errorMessage}
                            </div>
                          )}
                          {entry.details && Object.keys(entry.details).length > 0 && (
                            <details style={{
                              marginTop: "8px",
                            }}>
                              <summary style={{
                                cursor: "pointer",
                                fontSize: "12px",
                                color: themeStyles.textMuted,
                              }}>
                                {t("auditLogViewer.details")}
                              </summary>
                              <pre style={{
                                marginTop: "8px",
                                padding: "8px",
                                borderRadius: "4px",
                                backgroundColor: themeStyles.surface,
                                fontSize: "11px",
                                overflow: "auto",
                                maxHeight: "200px",
                              }}>
                                {JSON.stringify(entry.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

