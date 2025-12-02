import React, { useState, useEffect, useRef } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";
import { consoleLogger, type LogEntry } from "../../utils/consoleLogger";

interface ConsoleWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  onViewFullConsole?: () => void;
}

export const ConsoleWidget: React.FC<ConsoleWidgetProps> = ({
  widget,
  theme,
  settings,
  onViewFullConsole,
}) => {
  const t = useTranslation(settings.language);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogEntry["level"] | "all">("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const fontSize = isSmall ? "11px" : isMedium ? "13px" : "14px";
  const titleFontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";

  useEffect(() => {
    // Csak akkor töltse be, ha a widget látható
    if (!widget.visible) {
      return;
    }

    // Először betöltjük a meglévő logokat
    setLogs(consoleLogger.getLogs());

    // Feliratkozunk az új logokra
    const unsubscribe = consoleLogger.subscribe((newLogs) => {
      if (widget.visible) {
        setTimeout(() => {
          setLogs(newLogs);
        }, 0);
      }
    });

    return unsubscribe;
  }, [widget.visible]);

  // Auto-scroll az új logokhoz
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter(log => log.level === filter);

  const getLogColor = (level: LogEntry["level"]): string => {
    switch (level) {
      case "error":
        return theme.colors.danger || "#dc3545";
      case "warn":
        return "#ffc107"; // warning color
      case "info":
        return "#17a2b8";
      case "debug":
        return "#6c757d";
      default:
        return theme.colors.text;
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString(settings.language === "hu" ? "hu-HU" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const truncateMessage = (message: string, maxLength: number = 60): string => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + "...";
  };

  const displayCount = isSmall ? 5 : isMedium ? 10 : 15;

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
            {t("widget.title.console") || "Console"}
          </div>
          {!isSmall && (
            <div style={{
              display: "flex",
              gap: "4px",
              alignItems: "center",
            }}>
              <label style={{
                fontSize: fontSize,
                color: theme.colors.textMuted,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  style={{
                    cursor: "pointer",
                  }}
                />
                <span>{t("widget.console.autoScroll") || "Auto-scroll"}</span>
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as LogEntry["level"] | "all")}
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
                <option value="all">{t("widget.console.filter.all") || "All"}</option>
                <option value="error">{t("widget.console.filter.error") || "Errors"}</option>
                <option value="warn">{t("widget.console.filter.warn") || "Warnings"}</option>
                <option value="info">{t("widget.console.filter.info") || "Info"}</option>
                <option value="debug">{t("widget.console.filter.debug") || "Debug"}</option>
              </select>
            </div>
          )}
        </div>

        <div
          ref={logContainerRef}
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            backgroundColor: `${theme.colors.border}15`,
            borderRadius: "6px",
            padding: "8px",
            fontFamily: "monospace",
            fontSize: isSmall ? "10px" : fontSize,
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: theme.colors.textMuted,
              fontSize: fontSize,
              textAlign: "center",
              padding: "20px",
            }}>
              {t("widget.console.noLogs") || "No console logs"}
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}>
              {filteredLogs.slice(-displayCount).map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: "6px 8px",
                    backgroundColor: `${getLogColor(log.level)}15`,
                    borderRadius: "4px",
                    borderLeft: `3px solid ${getLogColor(log.level)}`,
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{
                    fontSize: isSmall ? "9px" : "10px",
                    color: theme.colors.textMuted,
                    whiteSpace: "nowrap",
                  }}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span style={{
                    fontSize: isSmall ? "9px" : "10px",
                    fontWeight: "600",
                    color: getLogColor(log.level),
                    textTransform: "uppercase",
                    minWidth: "45px",
                  }}>
                    {log.level}
                  </span>
                  <span style={{
                    flex: 1,
                    color: theme.colors.text,
                    wordBreak: "break-word",
                  }}>
                    {truncateMessage(log.message, isSmall ? 40 : 60)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View full console gomb */}
        {onViewFullConsole && (
          <button
            onClick={onViewFullConsole}
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
            {t("widget.console.viewFull") || "View Full Console"}
          </button>
        )}
      </div>
    </div>
  );
};

