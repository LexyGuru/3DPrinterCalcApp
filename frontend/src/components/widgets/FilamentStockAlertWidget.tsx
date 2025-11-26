import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings, Filament } from "../../types";
import { useTranslation } from "../../utils/translations";

interface FilamentStockAlertWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  filaments: Filament[];
  criticalThreshold?: number; // gramm - default: 500g
  lowThreshold?: number; // gramm - default: 1000g
  onFilamentClick?: (filamentIndex: number) => void;
}

export const FilamentStockAlertWidget: React.FC<FilamentStockAlertWidgetProps> = ({
  widget,
  theme,
  settings,
  filaments,
  criticalThreshold = 200,
  lowThreshold = 400,
  onFilamentClick,
}) => {
  const t = useTranslation(settings.language);
  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const fontSize = isSmall ? "11px" : isMedium ? "13px" : "14px";
  const titleFontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";

  // Szűrjük az alacsony készletű filamenteket
  const alerts = filaments
    .map((filament, index) => ({
      filament,
      index,
      stock: filament.weight || 0,
      alertLevel: 
        filament.weight <= criticalThreshold ? "critical" as const :
        filament.weight <= lowThreshold ? "low" as const :
        "normal" as const,
    }))
    .filter(item => item.alertLevel !== "normal")
    .sort((a, b) => a.stock - b.stock); // Legkisebb készlet először

  const getAlertColor = (level: "critical" | "low" | "normal") => {
    if (level === "critical") return "#dc3545";
    if (level === "low") return "#ffc107";
    return "#28a745";
  };

  const getAlertIcon = (level: "critical" | "low" | "normal") => {
    if (level === "critical") return "🔴";
    if (level === "low") return "🟡";
    return "🟢";
  };

  if (alerts.length === 0) {
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
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.textMuted,
          fontSize: fontSize,
        }}>
          {t("widget.filamentStockAlert.allGood") || "All filaments in stock"}
        </div>
      </div>
    );
  }

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
          {t("widget.title.filamentStockAlert") || "Low Stock Alerts"}
        </div>
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: isSmall ? "6px" : "8px",
          minHeight: 0,
        }}>
          {alerts.map((alert) => {
            const alertColor = getAlertColor(alert.alertLevel);
            const alertIcon = getAlertIcon(alert.alertLevel);
            const stockKg = (alert.stock / 1000).toFixed(2);

            return (
              <div
                key={alert.index}
                onClick={() => onFilamentClick?.(alert.index)}
                style={{
                  padding: isSmall ? "8px" : "10px",
                  borderRadius: "8px",
                  backgroundColor: `${alertColor}15`,
                  border: `2px solid ${alertColor}40`,
                  cursor: onFilamentClick ? "pointer" : "default",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: isSmall ? "4px" : "6px",
                }}
                onMouseEnter={(e) => {
                  if (onFilamentClick) {
                    e.currentTarget.style.backgroundColor = `${alertColor}25`;
                    e.currentTarget.style.transform = "translateX(2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${alertColor}15`;
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flex: 1,
                    minWidth: 0,
                  }}>
                    <span style={{ fontSize: isSmall ? "14px" : "16px" }}>{alertIcon}</span>
                    <div style={{
                      fontSize: fontSize,
                      fontWeight: "600",
                      color: theme.colors.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}>
                      {alert.filament.brand} {alert.filament.type}
                    </div>
                  </div>
                  <div style={{
                    fontSize: fontSize,
                    fontWeight: "700",
                    color: alertColor,
                  }}>
                    {stockKg} kg
                  </div>
                </div>
                {alert.filament.color && (
                  <div style={{
                    fontSize: isSmall ? "10px" : "11px",
                    color: theme.colors.textMuted,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    <span>{alert.filament.color}</span>
                    {alert.filament.colorHex && (
                      <span style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: alert.filament.colorHex,
                        border: `1px solid ${theme.colors.border}`,
                      }} />
                    )}
                  </div>
                )}
                <div style={{
                  fontSize: isSmall ? "10px" : "11px",
                  color: alertColor,
                  fontWeight: "600",
                }}>
                  {alert.alertLevel === "critical" 
                    ? (t("widget.filamentStockAlert.critical") || "Critical stock level")
                    : (t("widget.filamentStockAlert.low") || "Low stock level")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

