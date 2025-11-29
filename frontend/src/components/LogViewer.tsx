import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import type { Theme } from "../utils/themes";
import type { Settings } from "../types";
import { useToast } from "./Toast";
import type { StructuredLogEntry, LogLevel } from "../utils/structuredLog";
import { useVirtualScroll } from "../hooks/useVirtualScroll";

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  logFilePath: string;
  logFileName: string;
  theme: Theme;
  settings: Settings;
}

interface ParsedLogEntry {
  timestamp: string;
  level: LogLevel;
  component?: string;
  message: string;
  stackTrace?: string;
  context?: Record<string, any>;
  rawLine: string;
  lineNumber: number;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  isOpen,
  onClose,
  logFilePath,
  logFileName,
  theme,
  settings,
}) => {
  const { showToast } = useToast();
  const [logEntries, setLogEntries] = useState<ParsedLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<LogLevel | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  
  // Log entry fix magasság (pixel) - virtuális scroll-hoz
  const LOG_ENTRY_HEIGHT = 80; // Becsült magasság egy log entry-hez (kontextussal/stack trace-sel együtt lehet nagyobb)

  const themeStyles = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    primary: theme.colors.primary,
    border: theme.colors.border,
    error: "#dc3545",
    warn: "#ffc107",
    info: "#17a2b8",
    debug: "#6c757d",
  };

  // Log fájl betöltése
  useEffect(() => {
    if (!isOpen || !logFilePath) return;

    const loadLogFile = async () => {
      setLoading(true);
      setError(null);
      setLogEntries([]);

      try {
        // Backend command-ot használunk a log fájl olvasásához
        const content = await invoke<string>("read_log_file", { filePath: logFilePath });
        
        const entries: ParsedLogEntry[] = [];
        const lines = content.split("\n");
        let lineNumber = 0;

        for (const line of lines) {
          lineNumber++;
          if (!line.trim()) continue;

          try {
            // Próbáljuk JSON formátumként parse-olni (newline-delimited JSON)
            const jsonEntry = JSON.parse(line) as StructuredLogEntry;
            
            entries.push({
              timestamp: jsonEntry.timestamp,
              level: jsonEntry.level,
              component: jsonEntry.component,
              message: jsonEntry.message,
              stackTrace: jsonEntry.stackTrace,
              context: jsonEntry.context,
              rawLine: line,
              lineNumber,
            });
          } catch {
            // Ha nem JSON, próbáljuk text formátumként parse-olni: [timestamp] [level] message
            const textMatch = line.match(/\[([^\]]+)\] \[([^\]]+)\]\s+(.+)/);
            
            if (textMatch) {
              const [, timestamp, level, message] = textMatch;
              entries.push({
                timestamp,
                level: level as LogLevel,
                message: message.trim(),
                rawLine: line,
                lineNumber,
              });
            } else {
              // Ha nem sikerült parse-olni, egyszerű szövegként kezeljük
              entries.push({
                timestamp: new Date().toISOString(),
                level: "INFO" as LogLevel,
                message: line.trim(),
                rawLine: line,
                lineNumber,
              });
            }
          }
        }

        setLogEntries(entries);
      } catch (err) {
        console.error("❌ Hiba a log fájl betöltésekor:", err);
        setError(
          settings.language === "hu"
            ? "Hiba a log fájl betöltésekor"
            : settings.language === "de"
            ? "Fehler beim Laden der Log-Datei"
            : "Error loading log file"
        );
        showToast(
          settings.language === "hu"
            ? "Hiba a log fájl betöltésekor"
            : settings.language === "de"
            ? "Fehler beim Laden der Log-Datei"
            : "Error loading log file",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadLogFile();
  }, [isOpen, logFilePath, settings.language, showToast]);

  // Szűrt és keresett log bejegyzések
  const filteredEntries = useMemo(() => {
    let filtered = logEntries;

    // Szűrés szint szerint
    if (filterLevel !== "all") {
      filtered = filtered.filter((entry) => entry.level === filterLevel);
    }

    // Keresés szöveg alapján
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((entry) => {
        return (
          entry.message.toLowerCase().includes(searchLower) ||
          entry.component?.toLowerCase().includes(searchLower) ||
          entry.timestamp.toLowerCase().includes(searchLower) ||
          JSON.stringify(entry.context || {}).toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [logEntries, filterLevel, searchTerm]);

  // Szűrt találatok számolása
  const stats = useMemo(() => {
    return {
      total: logEntries.length,
      filtered: filteredEntries.length,
      errors: logEntries.filter((e) => e.level === "ERROR").length,
      warnings: logEntries.filter((e) => e.level === "WARN").length,
      info: logEntries.filter((e) => e.level === "INFO").length,
      debug: logEntries.filter((e) => e.level === "DEBUG").length,
    };
  }, [logEntries, filteredEntries]);

  // Container magasság követése (virtuális scroll-hoz)
  const [containerHeight, setContainerHeight] = useState(600);

  // Virtuális scroll hook - csak a látható elemeket rendereljük
  const virtualScroll = useVirtualScroll({
    items: filteredEntries,
    itemHeight: LOG_ENTRY_HEIGHT,
    containerHeight: containerHeight,
    overscan: 5, // 5 extra elem renderelése a látható terület körül (smooth scroll)
  });
  
  // Container magasság frissítése
  useEffect(() => {
    const updateHeight = () => {
      if (virtualScroll.containerRef.current) {
        const height = virtualScroll.containerRef.current.clientHeight;
        if (height > 0) {
          setContainerHeight(height);
        }
      }
    };
    
    // Első frissítés amikor a modal megnyílik
    if (isOpen) {
      const timeoutId = setTimeout(updateHeight, 100);
      window.addEventListener("resize", updateHeight);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", updateHeight);
      };
    }
  }, [isOpen, filteredEntries.length, virtualScroll.containerRef]);

  // Auto-scroll az új betöltés után (top-ra scroll)
  useEffect(() => {
    if (logEntries.length > 0 && virtualScroll.containerRef.current) {
      virtualScroll.containerRef.current.scrollTop = 0;
    }
  }, [logEntries.length, virtualScroll.containerRef]);

  // Kijelölés kezelése
  const handleToggleSelection = (lineNumber: number) => {
    setSelectedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lineNumber)) {
        newSet.delete(lineNumber);
      } else {
        newSet.add(lineNumber);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedEntries.size === filteredEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredEntries.map((e) => e.lineNumber)));
    }
  };

  // Exportálás
  const handleExport = async () => {
    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");

      const entriesToExport =
        selectedEntries.size > 0
          ? logEntries.filter((e) => selectedEntries.has(e.lineNumber))
          : filteredEntries;

      const exportContent = entriesToExport.map((e) => e.rawLine).join("\n");

      const filePath = await save({
        defaultPath: `${logFileName.replace(/\.[^/.]+$/, "")}-export-${new Date().toISOString().split("T")[0]}.txt`,
        filters: [
          { name: "Text", extensions: ["txt"] },
          { name: "All", extensions: ["*"] },
        ],
      });

      if (filePath) {
        await writeTextFile(filePath, exportContent);
        showToast(
          settings.language === "hu"
            ? `${entriesToExport.length} log bejegyzés exportálva`
            : settings.language === "de"
            ? `${entriesToExport.length} Log-Einträge exportiert`
            : `${entriesToExport.length} log entries exported`,
          "success"
        );
        setSelectedEntries(new Set());
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast(
        settings.language === "hu"
          ? "Hiba az exportálás során"
          : settings.language === "de"
          ? "Fehler beim Exportieren"
          : "Error during export",
        "error"
      );
    }
  };

  // Színek szint szerint
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "ERROR":
        return themeStyles.error;
      case "WARN":
        return themeStyles.warn;
      case "INFO":
        return themeStyles.info;
      case "DEBUG":
        return themeStyles.debug;
      default:
        return themeStyles.text;
    }
  };

  // Timestamp formázás
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
        hour12: false,
      });
    } catch {
      return timestamp;
    }
  };

  // Highlight keresési találatok
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: "#ffeb3b", padding: "2px 0" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 15000,
          backdropFilter: "blur(8px)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            backgroundColor: themeStyles.surface,
            borderRadius: "20px",
            width: "90%",
            maxWidth: "1200px",
            height: "85vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
            border: `2px solid ${themeStyles.border}`,
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: "24px",
              borderBottom: `1px solid ${themeStyles.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: themeStyles.text,
                }}
              >
                📋 {logFileName}
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  fontSize: "13px",
                  color: themeStyles.textMuted,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  {settings.language === "hu"
                    ? `Összes: ${stats.total}`
                    : settings.language === "de"
                    ? `Gesamt: ${stats.total}`
                    : `Total: ${stats.total}`}
                </span>
                {stats.filtered !== stats.total && (
                  <span>
                    {settings.language === "hu"
                      ? `Szűrt: ${stats.filtered}`
                      : settings.language === "de"
                      ? `Gefiltert: ${stats.filtered}`
                      : `Filtered: ${stats.filtered}`}
                  </span>
                )}
                {stats.errors > 0 && (
                  <span style={{ color: themeStyles.error }}>
                    ⚠️ {settings.language === "hu" ? `${stats.errors} hiba` : settings.language === "de" ? `${stats.errors} Fehler` : `${stats.errors} errors`}
                  </span>
                )}
                {stats.warnings > 0 && (
                  <span style={{ color: themeStyles.warn }}>
                    ⚠️ {settings.language === "hu" ? `${stats.warnings} figyelmeztetés` : settings.language === "de" ? `${stats.warnings} Warnungen` : `${stats.warnings} warnings`}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1px solid ${themeStyles.border}`,
                backgroundColor: themeStyles.background,
                color: themeStyles.text,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeStyles.surface;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = themeStyles.background;
              }}
            >
              ✕ {settings.language === "hu" ? "Bezárás" : settings.language === "de" ? "Schließen" : "Close"}
            </button>
          </div>

          {/* Toolbar - Szűrés és keresés */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: `1px solid ${themeStyles.border}`,
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Szint szűrő */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: themeStyles.text,
                }}
              >
                {settings.language === "hu" ? "Szint:" : settings.language === "de" ? "Ebene:" : "Level:"}
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as LogLevel | "all")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${themeStyles.border}`,
                  backgroundColor: themeStyles.background,
                  color: themeStyles.text,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <option value="all">
                  {settings.language === "hu" ? "Összes" : settings.language === "de" ? "Alle" : "All"}
                </option>
                <option value="ERROR">ERROR</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>

            {/* Keresés */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: themeStyles.text,
                }}
              >
                {settings.language === "hu" ? "Keresés:" : settings.language === "de" ? "Suchen:" : "Search:"}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  settings.language === "hu"
                    ? "Keresés a logokban..."
                    : settings.language === "de"
                    ? "In Logs suchen..."
                    : "Search in logs..."
                }
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${themeStyles.border}`,
                  backgroundColor: themeStyles.background,
                  color: themeStyles.text,
                  fontSize: "13px",
                }}
              />
            </div>

            {/* Export gomb */}
            <button
              onClick={handleExport}
              disabled={filteredEntries.length === 0}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: filteredEntries.length > 0 ? themeStyles.primary : themeStyles.border,
                color: "#fff",
                cursor: filteredEntries.length > 0 ? "pointer" : "not-allowed",
                fontSize: "13px",
                fontWeight: "600",
                opacity: filteredEntries.length > 0 ? 1 : 0.5,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (filteredEntries.length > 0) {
                  e.currentTarget.style.opacity = "0.9";
                }
              }}
              onMouseLeave={(e) => {
                if (filteredEntries.length > 0) {
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              💾 {settings.language === "hu" ? "Exportálás" : settings.language === "de" ? "Exportieren" : "Export"}
              {selectedEntries.size > 0 && ` (${selectedEntries.size})`}
            </button>

            {/* Kijelölés mind */}
            {filteredEntries.length > 0 && (
              <button
                onClick={handleSelectAll}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: `1px solid ${themeStyles.border}`,
                  backgroundColor: themeStyles.background,
                  color: themeStyles.text,
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = themeStyles.surface;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = themeStyles.background;
                }}
              >
                {selectedEntries.size === filteredEntries.length
                  ? settings.language === "hu"
                    ? "Kijelölés megszüntetése"
                    : settings.language === "de"
                    ? "Auswahl aufheben"
                    : "Deselect All"
                  : settings.language === "hu"
                  ? "Összes kijelölése"
                  : settings.language === "de"
                  ? "Alle auswählen"
                  : "Select All"}
              </button>
            )}
          </div>

          {/* Log tartalom */}
          <div
            ref={virtualScroll.containerRef}
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "auto",
              backgroundColor: themeStyles.background,
              position: "relative",
            }}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: themeStyles.textMuted,
                }}
              >
                {settings.language === "hu" ? "Betöltés..." : settings.language === "de" ? "Laden..." : "Loading..."}
              </div>
            ) : error ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: themeStyles.error,
                }}
              >
                ❌ {error}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: themeStyles.textMuted,
                }}
              >
                {settings.language === "hu"
                  ? "Nincsenek log bejegyzések"
                  : settings.language === "de"
                  ? "Keine Log-Einträge"
                  : "No log entries"}
              </div>
            ) : (
              <div
                style={{
                  height: `${virtualScroll.totalHeight}px`,
                  position: "relative",
                  padding: "16px 24px",
                }}
              >
                {/* Top padding a láthatatlan elemekhez */}
                <div style={{ height: `${virtualScroll.offsetY}px` }} />
                
                {/* Látható elemek */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {virtualScroll.visibleItems.map((index) => {
                    const entry = filteredEntries[index];
                    if (!entry) return null;
                    const isSelected = selectedEntries.has(entry.lineNumber);
                    const levelColor = getLevelColor(entry.level);

                  return (
                    <div
                      key={`${entry.lineNumber}-${index}`}
                      onClick={() => handleToggleSelection(entry.lineNumber)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "6px",
                        backgroundColor: isSelected
                          ? `${themeStyles.primary}20`
                          : index % 2 === 0
                          ? themeStyles.surface
                          : themeStyles.background,
                        border: `1px solid ${isSelected ? themeStyles.primary : themeStyles.border}`,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        lineHeight: "1.5",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = themeStyles.surface;
                          e.currentTarget.style.borderColor = levelColor;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor =
                            index % 2 === 0 ? themeStyles.surface : themeStyles.background;
                          e.currentTarget.style.borderColor = themeStyles.border;
                        }
                      }}
                    >
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <div
                          style={{
                            minWidth: "80px",
                            color: themeStyles.textMuted,
                            fontSize: "11px",
                          }}
                        >
                          {formatTimestamp(entry.timestamp)}
                        </div>
                        <div
                          style={{
                            minWidth: "60px",
                            color: levelColor,
                            fontWeight: "700",
                            fontSize: "11px",
                          }}
                        >
                          [{entry.level}]
                        </div>
                        {entry.component && (
                          <div
                            style={{
                              minWidth: "80px",
                              color: themeStyles.textMuted,
                              fontSize: "11px",
                            }}
                          >
                            [{entry.component}]
                          </div>
                        )}
                        <div style={{ flex: 1, color: themeStyles.text }}>
                          {highlightSearchTerm(entry.message, searchTerm)}
                        </div>
                        {isSelected && (
                          <div style={{ color: themeStyles.primary, fontSize: "14px" }}>✓</div>
                        )}
                      </div>
                      {entry.context && Object.keys(entry.context).length > 0 && (
                        <div
                          style={{
                            marginTop: "4px",
                            paddingLeft: "148px",
                            fontSize: "11px",
                            color: themeStyles.textMuted,
                            fontStyle: "italic",
                          }}
                        >
                          {JSON.stringify(entry.context)}
                        </div>
                      )}
                      {entry.stackTrace && (
                        <div
                          style={{
                            marginTop: "4px",
                            paddingLeft: "148px",
                            fontSize: "11px",
                            color: themeStyles.error,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {entry.stackTrace}
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
                
                {/* Bottom padding a láthatatlan elemekhez */}
                <div
                  style={{
                    height: `${Math.max(0, virtualScroll.totalHeight - virtualScroll.offsetY - (virtualScroll.visibleItems.length * LOG_ENTRY_HEIGHT))}px`,
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

