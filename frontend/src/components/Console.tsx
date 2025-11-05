import React, { useState, useEffect, useRef } from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { consoleLogger, type LogEntry } from "../utils/consoleLogger";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { save } from "@tauri-apps/plugin-dialog";
import { useToast } from "./Toast";

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
    return date.toLocaleTimeString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", {
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
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500", color: theme.colors.text }}>
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

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500", color: theme.colors.text, cursor: "pointer" }}>
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
            backgroundColor: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "8px",
            padding: "12px",
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: theme.colors.textMuted }}>
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
                  backgroundColor: theme.colors.surface,
                  borderRadius: "4px",
                  wordBreak: "break-word",
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ color: getLogColor(log.level), fontWeight: "600", minWidth: "60px" }}>
                    [{log.level.toUpperCase()}]
                  </span>
                  <span style={{ color: theme.colors.textMuted, fontSize: "11px", minWidth: "100px" }}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span style={{ color: theme.colors.text, flex: 1 }}>
                    {log.message}
                  </span>
                </div>
                {log.data && log.data.length > 1 && (
                  <div style={{ marginTop: "8px", paddingLeft: "72px" }}>
                    <pre style={{
                      margin: 0,
                      padding: "8px",
                      backgroundColor: theme.colors.background,
                      borderRadius: "4px",
                      fontSize: "12px",
                      overflowX: "auto",
                      color: theme.colors.text,
                    }}>
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <div style={{ marginTop: "12px", fontSize: "12px", color: theme.colors.textMuted, textAlign: "right" }}>
          {t("console.total")}: {filteredLogs.length} / {logs.length}
        </div>
      </div>
    </div>
  );
};

