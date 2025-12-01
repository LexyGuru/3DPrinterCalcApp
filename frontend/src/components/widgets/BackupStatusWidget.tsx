import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";
import { getAutomaticBackupHistory, type BackupHistoryItem } from "../../utils/backup";

interface BackupStatusWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  onViewFullHistory?: () => void;
}

const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeLocal = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const BackupStatusWidget: React.FC<BackupStatusWidgetProps> = ({
  widget,
  theme,
  settings,
  onViewFullHistory,
}) => {
  const t = useTranslation(settings.language);
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false); // Flag, hogy ne töltse be egyszerre többször

  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const fontSize = isSmall ? "11px" : isMedium ? "13px" : "14px";
  const titleFontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";

  const loadBackupHistory = useCallback(async () => {
    // Ha már töltődik, ne indítsuk el újra
    if (isLoadingRef.current) {
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Timeout hozzáadása, hogy ne fagyjon le az alkalmazás
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout: backup history betöltése túl sokáig tart")), 10000); // 10 másodperc timeout
      });
      
      const history = await Promise.race([
        getAutomaticBackupHistory(),
        timeoutPromise,
      ]);
      
      setBackupHistory(history);
    } catch (err) {
      console.error("❌ Hiba a backup history betöltésekor:", err);
      const errorMessage = err instanceof Error && err.message.includes("Timeout")
        ? "Timeout: loading takes too long"
        : "Error loading backup history";
      setError(errorMessage);
      setBackupHistory([]); // Üres tömb, hogy ne jelenjen meg hiba
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []); // Nincs dependency, hogy ne változzon minden rendereléskor

  useEffect(() => {
    // Csak akkor töltse be, ha a widget látható
    if (!widget.visible) {
      return;
    }

    // Kis késleltetés, hogy ne blokkolja az azonnali renderelést
    const timeoutId = setTimeout(() => {
      if (widget.visible) {
        loadBackupHistory();
      }
    }, 500); // 500ms késleltetés
    
    // Frissítés 5 percenként, ha látható
    const interval = setInterval(() => {
      if (widget.visible && !isLoadingRef.current) {
        loadBackupHistory();
      }
    }, 300000); // 5 perc
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [widget.visible, loadBackupHistory]);

  const lastBackup = useMemo(() => {
    return backupHistory.length > 0 ? backupHistory[0] : null;
  }, [backupHistory]);

  const automaticBackupEnabled = settings.automaticBackupEnabled ?? false;

  const getStatusColor = useCallback((item: BackupHistoryItem): string => {
    if (item.willBeDeletedIn !== null) {
      const days = item.willBeDeletedIn;
      if (days <= 1) return "#dc3545"; // Piros - hamarosan törlődik
      if (days <= 2) return "#ffc107"; // Sárga - közel van a törlés
    }
    return "#22c55e"; // Zöld - még sok van hátra
  }, []);

  const displayCount = useMemo(() => {
    return isSmall ? 3 : isMedium ? 5 : 7;
  }, [isSmall, isMedium]);

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
          {t("widget.title.backupStatus") || "Backup Status"}
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
        ) : backupHistory.length === 0 ? (
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
            {t("widget.backupStatus.noBackups") || "No backups found"}
          </div>
        ) : (
          <>
            {/* Automatikus backup állapot */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: automaticBackupEnabled 
                ? `${theme.colors.success || "#22c55e"}20`
                : `${theme.colors.textMuted}20`,
              borderRadius: "8px",
              fontSize: fontSize,
            }}>
              <span style={{ fontSize: "16px" }}>
                {automaticBackupEnabled ? "✅" : "⏸️"}
              </span>
              <span style={{
                color: theme.colors.text,
                fontWeight: "600",
              }}>
                {automaticBackupEnabled
                  ? (t("widget.backupStatus.automaticEnabled") || "Automatic backup enabled")
                  : (t("widget.backupStatus.automaticDisabled") || "Automatic backup disabled")}
              </span>
            </div>

            {/* Legutóbbi backup */}
            {lastBackup && (
              <div style={{
                padding: "12px",
                backgroundColor: `${getStatusColor(lastBackup)}20`,
                borderRadius: "8px",
                border: `1px solid ${getStatusColor(lastBackup)}40`,
              }}>
                <div style={{
                  fontSize: fontSize,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginBottom: "6px",
                }}>
                  {t("widget.backupStatus.lastBackup") || "Last Backup"}
                </div>
                <div style={{
                  fontSize: isSmall ? "10px" : fontSize,
                  color: theme.colors.textMuted,
                  marginBottom: "4px",
                }}>
                  {formatDateLocal(new Date(lastBackup.timestamp))} {formatTimeLocal(new Date(lastBackup.timestamp))}
                </div>
                {lastBackup.willBeDeletedIn !== null && (
                  <div style={{
                    fontSize: isSmall ? "10px" : fontSize,
                    color: getStatusColor(lastBackup),
                    fontWeight: "600",
                  }}>
                    {lastBackup.willBeDeletedIn > 0
                      ? t("widget.backupStatus.willBeDeletedIn", { count: Math.ceil(lastBackup.willBeDeletedIn) })
                      : t("widget.backupStatus.willBeDeletedSoon") || "Will be deleted soon"}
                  </div>
                )}
              </div>
            )}

            {/* Backup történet lista */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              minHeight: 0,
            }}>
              <div style={{
                fontSize: fontSize,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: "8px",
              }}>
                {t("widget.backupStatus.recentBackups") || "Recent Backups"} ({backupHistory.length})
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}>
                {backupHistory.slice(0, displayCount).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px 10px",
                      backgroundColor: `${getStatusColor(item)}15`,
                      borderRadius: "6px",
                      border: `1px solid ${getStatusColor(item)}30`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{
                      fontSize: isSmall ? "10px" : fontSize,
                      color: theme.colors.text,
                    }}>
                      {formatDateLocal(new Date(item.timestamp))}
                    </div>
                    <div style={{
                      fontSize: isSmall ? "10px" : fontSize,
                      color: getStatusColor(item),
                      fontWeight: "600",
                    }}>
                      {item.willBeDeletedIn !== null && item.willBeDeletedIn > 0
                        ? t("widget.backupStatus.days", { count: Math.ceil(item.willBeDeletedIn) }) || `${Math.ceil(item.willBeDeletedIn)} days`
                        : item.willBeDeletedIn !== null && item.willBeDeletedIn <= 1
                        ? t("widget.backupStatus.soon") || "Soon"
                        : "✓"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* View full history gomb */}
            {onViewFullHistory && (
              <button
                onClick={onViewFullHistory}
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
                {t("widget.backupStatus.viewFullHistory") || "View Full History"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

