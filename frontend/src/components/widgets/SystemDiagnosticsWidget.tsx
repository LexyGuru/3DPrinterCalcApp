import React, { useState, useEffect, useCallback, useRef } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";
import { getSystemInfo, getPerformanceMetrics, type SystemInfo } from "../../utils/systemInfo";
import { getLogHistory } from "../../utils/logHistory";
import { getAutomaticBackupHistory } from "../../utils/backup";

interface SystemDiagnosticsWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  onViewFullDiagnostics?: () => void;
}

export const SystemDiagnosticsWidget: React.FC<SystemDiagnosticsWidgetProps> = ({
  widget,
  theme,
  settings,
  onViewFullDiagnostics,
}) => {
  const t = useTranslation(settings.language);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any | null>(null);
  const [logStats, setLogStats] = useState({ fileCount: 0, totalSize: 0 });
  const [backupStats, setBackupStats] = useState({ fileCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const fontSize = isSmall ? "11px" : isMedium ? "13px" : "14px";
  const titleFontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";

  const isLoadingRef = useRef(false); // Flag, hogy ne töltse be egyszerre többször

  const loadDiagnostics = useCallback(async () => {
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

      // Rendszer információk betöltése
      const [sysInfo, perfMetrics] = await Promise.race([
        Promise.all([
          getSystemInfo(),
          getPerformanceMetrics(),
        ]),
        timeoutPromise,
      ]) as [any, any];

      setSystemInfo(sysInfo);
      setPerformanceMetrics(perfMetrics);

      // Log fájlok statisztikái - timeout védelemmel
      try {
        const logTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 5000);
        });
        const logHistory = await Promise.race([
          getLogHistory(),
          logTimeoutPromise,
        ]);
        setLogStats({
          fileCount: logHistory.length,
          totalSize: 0,
        });
      } catch (err) {
        console.warn("Log stats hiba:", err);
        // Alapértelmezett értékek, ha hiba van
        setLogStats({ fileCount: 0, totalSize: 0 });
      }

      // Backup fájlok statisztikái - timeout védelemmel
      try {
        const backupTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 5000);
        });
        const backupHistory = await Promise.race([
          getAutomaticBackupHistory(),
          backupTimeoutPromise,
        ]);
        setBackupStats({
          fileCount: backupHistory.length,
        });
      } catch (err) {
        console.warn("Backup stats hiba:", err);
        // Alapértelmezett értékek, ha hiba van
        setBackupStats({ fileCount: 0 });
      }
    } catch (err) {
      console.error("❌ Hiba a diagnosztika betöltésekor:", err);
      const errorMessage = err instanceof Error && err.message.includes("Timeout")
        ? "Timeout: loading takes too long"
        : "Error loading diagnostics";
      setError(errorMessage);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []); // Nincs dependency, hogy ne változzon minden rendereléskor

  const loadDiagnosticsRef = useRef(loadDiagnostics);
  
  // Frissítjük a ref-et, amikor a callback változik
  useEffect(() => {
    loadDiagnosticsRef.current = loadDiagnostics;
  }, [loadDiagnostics]);

  useEffect(() => {
    // Csak akkor töltse be, ha a widget látható
    if (!widget.visible) {
      return;
    }

    // Kis késleltetés, hogy ne blokkolja az azonnali renderelést
    const timeoutId = setTimeout(() => {
      if (widget.visible && !isLoadingRef.current) {
        loadDiagnosticsRef.current();
      }
    }, 500);
    
    // Nincs periodikus frissítés - csak egyszer töltjük be
    // Ha frissíteni kell, manuálisan kell majd hozzáadni
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [widget.visible]); // Csak widget.visible-től függ

  const getMemoryStatus = (usedPercent: number): { status: "success" | "warning" | "error"; color: string } => {
    if (usedPercent > 95) {
      return { status: "error", color: theme.colors.danger || "#dc3545" };
    } else if (usedPercent > 85) {
      return { status: "warning", color: "#ffc107" }; // warning color
    }
    return { status: "success", color: theme.colors.success || "#28a745" };
  };

  const getCpuStatus = (cpuUsage: number): { status: "success" | "warning" | "error"; color: string } => {
    if (cpuUsage > 90) {
      return { status: "warning", color: "#ffc107" }; // warning color
    }
    return { status: "success", color: theme.colors.success || "#28a745" };
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
          {t("widget.title.systemDiagnostics") || "System Diagnostics"}
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
        ) : (
          <div style={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: isSmall ? "8px" : "12px",
          }}>
            {/* Rendszer információk */}
            {systemInfo && (
              <>
                <div style={{
                  padding: "10px",
                  backgroundColor: `${theme.colors.primary || "#007bff"}15`,
                  borderRadius: "8px",
                }}>
                  <div style={{
                    fontSize: fontSize,
                    fontWeight: "600",
                    color: theme.colors.text,
                    marginBottom: "6px",
                  }}>
                    {t("widget.systemDiagnostics.os") || "Operating System"}
                  </div>
                  <div style={{
                    fontSize: isSmall ? "10px" : fontSize,
                    color: theme.colors.textMuted,
                  }}>
                    {systemInfo.system.os_name} {systemInfo.system.os_version}
                  </div>
                  <div style={{
                    fontSize: isSmall ? "10px" : fontSize,
                    color: theme.colors.textMuted,
                    marginTop: "4px",
                  }}>
                    {systemInfo.cpu.name}
                  </div>
                </div>

                {/* CPU használat */}
                {performanceMetrics && (
                  <div style={{
                    padding: "10px",
                    backgroundColor: `${getCpuStatus(parseFloat(performanceMetrics.cpu.usage_percent || "0")).color}15`,
                    borderRadius: "8px",
                    border: `1px solid ${getCpuStatus(parseFloat(performanceMetrics.cpu.usage_percent || "0")).color}30`,
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}>
                      <div style={{
                        fontSize: fontSize,
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}>
                        {t("widget.systemDiagnostics.cpu") || "CPU"}
                      </div>
                      <div style={{
                        fontSize: isSmall ? "10px" : fontSize,
                        fontWeight: "600",
                        color: getCpuStatus(parseFloat(performanceMetrics.cpu.usage_percent || "0")).color,
                      }}>
                        {parseFloat(performanceMetrics.cpu.usage_percent || "0").toFixed(1)}%
                      </div>
                    </div>
                    <div style={{
                      fontSize: isSmall ? "10px" : fontSize,
                      color: theme.colors.textMuted,
                    }}>
                      {performanceMetrics.cpu.cores} {t("widget.systemDiagnostics.cores") || "cores"}
                    </div>
                  </div>
                )}

                {/* Memória használat */}
                {performanceMetrics && (
                  <div style={{
                    padding: "10px",
                    backgroundColor: `${getMemoryStatus(performanceMetrics.memory.used_percent || 0).color}15`,
                    borderRadius: "8px",
                    border: `1px solid ${getMemoryStatus(performanceMetrics.memory.used_percent || 0).color}30`,
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}>
                      <div style={{
                        fontSize: fontSize,
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}>
                        {t("widget.systemDiagnostics.memory") || "Memory"}
                      </div>
                      <div style={{
                        fontSize: isSmall ? "10px" : fontSize,
                        fontWeight: "600",
                        color: getMemoryStatus(performanceMetrics.memory.used_percent || 0).color,
                      }}>
                        {performanceMetrics.memory.used_percent || 0}%
                      </div>
                    </div>
                    <div style={{
                      fontSize: isSmall ? "10px" : fontSize,
                      color: theme.colors.textMuted,
                    }}>
                      {parseFloat(performanceMetrics.memory.used_mb || "0").toFixed(0)} MB / {parseFloat(performanceMetrics.memory.total_mb || "0").toFixed(0)} MB
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Log fájlok statisztikái */}
            <div style={{
              padding: "10px",
              backgroundColor: "#17a2b815", // info color with opacity
              borderRadius: "8px",
            }}>
              <div style={{
                fontSize: fontSize,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: "4px",
              }}>
                {t("widget.systemDiagnostics.logFiles") || "Log Files"}
              </div>
              <div style={{
                fontSize: isSmall ? "10px" : fontSize,
                color: theme.colors.textMuted,
              }}>
                {logStats.fileCount} {t("widget.systemDiagnostics.files") || "files"}
              </div>
            </div>

            {/* Backup fájlok statisztikái */}
            <div style={{
              padding: "10px",
              backgroundColor: `${theme.colors.success || "#28a745"}15`,
              borderRadius: "8px",
            }}>
              <div style={{
                fontSize: fontSize,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: "4px",
              }}>
                {t("widget.systemDiagnostics.backupFiles") || "Backup Files"}
              </div>
              <div style={{
                fontSize: isSmall ? "10px" : fontSize,
                color: theme.colors.textMuted,
              }}>
                {backupStats.fileCount} {t("widget.systemDiagnostics.files") || "files"}
              </div>
            </div>

            {/* App verzió */}
            {systemInfo && (
              <div style={{
                padding: "10px",
                backgroundColor: `${theme.colors.textMuted}15`,
                borderRadius: "8px",
              }}>
                <div style={{
                  fontSize: fontSize,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginBottom: "4px",
                }}>
                  {t("widget.systemDiagnostics.appVersion") || "App Version"}
                </div>
                <div style={{
                  fontSize: isSmall ? "10px" : fontSize,
                  color: theme.colors.textMuted,
                }}>
                  {systemInfo.app.version || "N/A"}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View full diagnostics gomb */}
        {onViewFullDiagnostics && (
          <button
            onClick={onViewFullDiagnostics}
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
            {t("widget.systemDiagnostics.viewFull") || "View Full Diagnostics"}
          </button>
        )}
      </div>
    </div>
  );
};

