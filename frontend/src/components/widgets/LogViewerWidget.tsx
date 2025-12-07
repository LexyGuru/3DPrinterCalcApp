import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";
import { getLogHistory } from "../../utils/logHistory";
import { invoke } from "@tauri-apps/api/core";
import type { LogLevel } from "../../utils/structuredLog";

interface LogViewerWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  onViewFullLogs?: () => void;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  component?: string;
}

export const LogViewerWidget: React.FC<LogViewerWidgetProps> = ({
  widget,
  theme,
  settings,
  onViewFullLogs,
}) => {
  const t = useTranslation(settings.language);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<LogLevel | "all">("all");

  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = useMemo(() => widget.size === "small", [widget.size]);
  const isMedium = useMemo(() => widget.size === "medium", [widget.size]);
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const fontSize = isSmall ? "11px" : isMedium ? "13px" : "14px";
  const titleFontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";

  const maxEntries = useMemo(() => isSmall ? 5 : isMedium ? 10 : 15, [isSmall, isMedium]);

  const isLoadingRef = useRef(false); // Flag, hogy ne töltse be egyszerre többször

  const loadLogs = useCallback(async () => {
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

      // Betöltjük a log fájlok listáját
      const logHistory = await Promise.race([
        getLogHistory(),
        timeoutPromise,
      ]);

      if (logHistory.length === 0) {
        setLogEntries([]);
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }

      // A legújabb frontend log fájlt használjuk
      const latestLog = logHistory.find(log => log.type === "frontend") || logHistory[0];
      
      // Beolvassuk a log fájl tartalmát
      const content = await Promise.race([
        invoke<string>("read_log_file", { filePath: latestLog.filePath }),
        timeoutPromise,
      ]);
      
      const entries: LogEntry[] = [];
      const lines = content.split("\n");

      // Utolsó N sor beolvasása (a legutóbbi logok)
      const recentLines = lines.slice(-50).filter(line => line.trim());

      for (const line of recentLines) {
        if (!line.trim()) continue;

        try {
          // Próbáljuk JSON formátumként parse-olni
          const jsonEntry = JSON.parse(line);
          
          entries.push({
            timestamp: jsonEntry.timestamp || new Date().toISOString(),
            level: jsonEntry.level || "INFO",
            message: jsonEntry.message || "",
            component: jsonEntry.component,
          });
        } catch {
          // Ha nem JSON, próbáljuk text formátumként parse-olni
          const textMatch = line.match(/\[([^\]]+)\] \[([^\]]+)\]\s+(.+)/);
          
          if (textMatch) {
            const [, timestamp, level, message] = textMatch;
            entries.push({
              timestamp: timestamp || new Date().toISOString(),
              level: (level as LogLevel) || "INFO",
              message: message.trim(),
            });
          } else {
            // Egyszerű szövegként kezeljük
            entries.push({
              timestamp: new Date().toISOString(),
              level: "INFO",
              message: line.trim(),
            });
          }
        }
      }

      // Rendezés dátum szerint (legújabb először)
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogEntries(entries.slice(0, maxEntries));
    } catch (err) {
      console.error("❌ Hiba a log betöltésekor:", err);
      const errorMessage = err instanceof Error && err.message.includes("Timeout")
        ? "Timeout: loading takes too long"
        : t("widget.logViewer.error") || "Error loading logs";
      setError(errorMessage);
      setLogEntries([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [maxEntries, t]);

  const loadLogsRef = useRef(loadLogs);
  
  // Frissítjük a ref-et, amikor a callback változik
  useEffect(() => {
    loadLogsRef.current = loadLogs;
  }, [loadLogs]);

  useEffect(() => {
    // Csak akkor töltse be, ha a widget látható
    if (!widget.visible) {
      return;
    }

    // Kis késleltetés
    const timeoutId = setTimeout(() => {
      if (widget.visible && !isLoadingRef.current) {
        loadLogsRef.current();
      }
    }, 500);
    
    // Nincs periodikus frissítés - csak egyszer töltjük be
    // Ha frissíteni kell, manuálisan kell majd hozzáadni
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [widget.visible]); // Csak widget.visible-től függ

  const filteredEntries = filterLevel === "all"
    ? logEntries
    : logEntries.filter(entry => entry.level === filterLevel);

  const getLevelColor = (level: LogLevel): string => {
    switch (level) {
      case "ERROR":
        return theme.colors.danger || "#dc3545";
      case "WARN":
        return "#ffc107"; // warning color
      case "INFO":
        return "#17a2b8";
      case "DEBUG":
        return "#6c757d";
      default:
        return theme.colors.text;
    }
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

  const truncateMessage = (message: string, maxLength: number = 60): string => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + "...";
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isSmall ? "4px" : "8px",
        }}>
          <div style={{
            fontSize: titleFontSize,
            fontWeight: "700",
            color: theme.colors.text,
          }}>
            {t("widget.title.logViewer") || "Recent Logs"}
          </div>
          {!isSmall && (
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as LogLevel | "all")}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: cardBg,
                color: theme.colors.text,
                fontSize: fontSize,
                cursor: "pointer",
              }}
            >
              <option value="all">{t("widget.logViewer.filter.all") || "All"}</option>
              <option value="ERROR">{t("widget.logViewer.filter.error") || "Errors"}</option>
              <option value="WARN">{t("widget.logViewer.filter.warn") || "Warnings"}</option>
              <option value="INFO">{t("widget.logViewer.filter.info") || "Info"}</option>
              <option value="DEBUG">{t("widget.logViewer.filter.debug") || "Debug"}</option>
            </select>
          )}
        </div>

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
            {t("widget.logViewer.noLogs") || "No logs found"}
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
                      backgroundColor: `${getLevelColor(entry.level)}15`,
                      borderRadius: "6px",
                      border: `1px solid ${getLevelColor(entry.level)}30`,
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "8px",
                      marginBottom: "4px",
                    }}>
                      <span style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: isSmall ? "9px" : "10px",
                        fontWeight: "600",
                        backgroundColor: getLevelColor(entry.level),
                        color: "#fff",
                      }}>
                        {entry.level}
                      </span>
                      <span style={{
                        fontSize: isSmall ? "9px" : "10px",
                        color: theme.colors.textMuted,
                        whiteSpace: "nowrap",
                      }}>
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <div style={{
                      fontSize: isSmall ? "10px" : fontSize,
                      color: theme.colors.text,
                      wordBreak: "break-word",
                      fontFamily: "monospace",
                    }}>
                      {truncateMessage(entry.message, isSmall ? 40 : 60)}
                    </div>
                    {entry.component && (
                      <div style={{
                        fontSize: isSmall ? "9px" : "10px",
                        color: theme.colors.textMuted,
                        marginTop: "4px",
                      }}>
                        {entry.component}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* View full logs gomb */}
            {onViewFullLogs && (
              <button
                onClick={onViewFullLogs}
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
                {t("widget.logViewer.viewFullLogs") || "View Full Logs"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

