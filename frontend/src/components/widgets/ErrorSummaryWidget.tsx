import React, { useState, useEffect } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";
import { consoleLogger, type LogEntry } from "../../utils/consoleLogger";

interface ErrorSummaryWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  onViewLogs?: () => void;
}

interface ErrorSummary {
  errors: number;
  warnings: number;
  recentErrors: LogEntry[];
  recentWarnings: LogEntry[];
}

export const ErrorSummaryWidget: React.FC<ErrorSummaryWidgetProps> = ({
  widget,
  theme,
  settings,
  onViewLogs,
}) => {
  const t = useTranslation(settings.language);
  const [summary, setSummary] = useState<ErrorSummary>({
    errors: 0,
    warnings: 0,
    recentErrors: [],
    recentWarnings: [],
  });
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

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

    const updateSummary = () => {
      const logs = consoleLogger.getLogs();
      const now = Date.now();
      
      let timeFilterMs = 0;
      switch (timeRange) {
        case "24h":
          timeFilterMs = 24 * 60 * 60 * 1000;
          break;
        case "7d":
          timeFilterMs = 7 * 24 * 60 * 60 * 1000;
          break;
        case "30d":
          timeFilterMs = 30 * 24 * 60 * 60 * 1000;
          break;
      }

      const filteredLogs = logs.filter(log => {
        const logTime = log.timestamp.getTime();
        return (now - logTime) <= timeFilterMs;
      });

      const errors = filteredLogs.filter(log => log.level === "error");
      const warnings = filteredLogs.filter(log => log.level === "warn");

      setSummary({
        errors: errors.length,
        warnings: warnings.length,
        recentErrors: errors.slice(-5).reverse(), // Utolsó 5 hiba
        recentWarnings: warnings.slice(-5).reverse(), // Utolsó 5 figyelmeztetés
      });
    };

    updateSummary();
    
    // Feliratkozunk az új logokra
    const unsubscribe = consoleLogger.subscribe(() => {
      if (widget.visible) {
        updateSummary();
      }
    });

    // Frissítés 10 másodpercenként (lassítva a 5 másodpercről)
    const interval = setInterval(() => {
      if (widget.visible) {
        updateSummary();
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [timeRange, widget.visible]);

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString(settings.language === "hu" ? "hu-HU" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const truncateMessage = (message: string, maxLength: number = 50): string => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + "...";
  };

  const displayCount = isSmall ? 2 : isMedium ? 3 : 5;

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
            {t("widget.title.errorSummary") || "Error Summary"}
          </div>
          {!isSmall && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as "24h" | "7d" | "30d")}
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
              <option value="24h">{t("common.week") || "24h"}</option>
              <option value="7d">{t("common.week") || "7d"}</option>
              <option value="30d">{t("common.month") || "30d"}</option>
            </select>
          )}
        </div>

        {/* Statisztikák */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "8px",
        }}>
          <div style={{
            flex: 1,
            padding: "12px",
            backgroundColor: `${theme.colors.danger || "#dc3545"}20`,
            borderRadius: "8px",
            border: `1px solid ${theme.colors.danger || "#dc3545"}40`,
            textAlign: "center",
          }}>
            <div style={{
              fontSize: isSmall ? "20px" : "24px",
              fontWeight: "700",
              color: theme.colors.danger || "#dc3545",
              marginBottom: "4px",
            }}>
              {summary.errors}
            </div>
            <div style={{
              fontSize: isSmall ? "10px" : fontSize,
              color: theme.colors.textMuted,
            }}>
              {t("widget.errorSummary.errors") || "Errors"}
            </div>
          </div>
          <div style={{
            flex: 1,
            padding: "12px",
            backgroundColor: "#ffc10720", // warning color with opacity
            borderRadius: "8px",
            border: "1px solid #ffc10740", // warning color with opacity
            textAlign: "center",
          }}>
            <div style={{
              fontSize: isSmall ? "20px" : "24px",
              fontWeight: "700",
              color: "#ffc107", // warning color
              marginBottom: "4px",
            }}>
              {summary.warnings}
            </div>
            <div style={{
              fontSize: isSmall ? "10px" : fontSize,
              color: theme.colors.textMuted,
            }}>
              {t("widget.errorSummary.warnings") || "Warnings"}
            </div>
          </div>
        </div>

        {/* Legutóbbi hibák */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
        }}>
          {summary.errors === 0 && summary.warnings === 0 ? (
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
              {t("widget.errorSummary.noErrors") || "No errors or warnings"}
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}>
              {summary.recentErrors.slice(0, displayCount).map((error) => (
                <div
                  key={error.id}
                  style={{
                    padding: "8px 10px",
                    backgroundColor: `${theme.colors.danger || "#dc3545"}15`,
                    borderRadius: "6px",
                    border: `1px solid ${theme.colors.danger || "#dc3545"}30`,
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}>
                    <div style={{
                      flex: 1,
                      fontSize: isSmall ? "10px" : fontSize,
                      color: theme.colors.text,
                      wordBreak: "break-word",
                    }}>
                      {truncateMessage(error.message, isSmall ? 40 : 60)}
                    </div>
                    <div style={{
                      fontSize: isSmall ? "9px" : "10px",
                      color: theme.colors.textMuted,
                      whiteSpace: "nowrap",
                    }}>
                      {formatTimestamp(error.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              {summary.recentWarnings.slice(0, displayCount).map((warning) => (
                <div
                  key={warning.id}
                  style={{
                    padding: "8px 10px",
                    backgroundColor: "#ffc10715", // warning color with opacity
                    borderRadius: "6px",
                    border: "1px solid #ffc10730", // warning color with opacity
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}>
                    <div style={{
                      flex: 1,
                      fontSize: isSmall ? "10px" : fontSize,
                      color: theme.colors.text,
                      wordBreak: "break-word",
                    }}>
                      {truncateMessage(warning.message, isSmall ? 40 : 60)}
                    </div>
                    <div style={{
                      fontSize: isSmall ? "9px" : "10px",
                      color: theme.colors.textMuted,
                      whiteSpace: "nowrap",
                    }}>
                      {formatTimestamp(warning.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View logs gomb */}
        {onViewLogs && (summary.errors > 0 || summary.warnings > 0) && (
          <button
            onClick={onViewLogs}
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
            {t("widget.errorSummary.viewLogs") || "View Full Logs"}
          </button>
        )}
      </div>
    </div>
  );
};

