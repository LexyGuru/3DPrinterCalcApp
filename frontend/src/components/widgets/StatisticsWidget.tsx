import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";
import { getCurrencyLabel } from "../../utils/currency";
import type { Settings } from "../../types";

interface StatisticsWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  statistics: {
    totalFilamentUsed: number;
    totalRevenue: number;
    totalElectricityConsumed: number;
    totalCosts: number;
    totalProfit: number;
    totalPrintTime: number;
    offerCount: number;
  };
}

export const StatisticsWidget: React.FC<StatisticsWidgetProps> = ({
  widget,
  theme,
  settings,
  statistics,
}) => {
  const t = useTranslation(settings.language);
  const currencyLabel = getCurrencyLabel(settings.currency);

  const stats = [
    {
      label: t("home.stats.totalFilament") || "Összes filament",
      value: `${(statistics.totalFilamentUsed / 1000).toFixed(2)} kg`,
      icon: "🧵",
    },
    {
      label: t("home.stats.totalRevenue") || "Összes bevétel",
      value: `${statistics.totalRevenue.toLocaleString(settings.language === "hu" ? "hu-HU" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${currencyLabel}`,
      icon: "💰",
    },
    {
      label: t("home.stats.totalCost") || "Összes költség",
      value: `${statistics.totalCosts.toLocaleString(settings.language === "hu" ? "hu-HU" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${currencyLabel}`,
      icon: "💸",
    },
    {
      label: t("home.stats.netProfit") || "Nettó profit",
      value: `${statistics.totalProfit.toLocaleString(settings.language === "hu" ? "hu-HU" : "en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${currencyLabel}`,
      icon: "📈",
    },
  ];

  const getGridColumns = () => {
    switch (widget.size) {
      case "small":
        return 1;
      case "medium":
        return 2;
      case "large":
        return 2;
      default:
        return 2;
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
        gap: widget.size === "small" ? "4px" : "8px",
        height: "100%",
        width: "100%",
        alignContent: "stretch",
        gridAutoRows: "1fr",
        minHeight: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          style={{
            backgroundColor: theme.colors.surfaceHover || theme.colors.surface,
            borderRadius: "8px",
            padding: widget.size === "small" ? "8px" : "10px",
            border: `1px solid ${theme.colors.border}`,
            display: "flex",
            flexDirection: "column",
            gap: widget.size === "small" ? "2px" : "4px",
            justifyContent: "flex-start",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: widget.size === "small" ? "4px" : "6px",
            flexShrink: 0,
            width: "100%",
          }}>
            <span style={{ fontSize: widget.size === "small" ? "14px" : "16px", flexShrink: 0 }}>{stat.icon}</span>
            <span
              style={{
                fontSize: widget.size === "small" ? "10px" : "11px",
                color: theme.colors.textMuted,
                fontWeight: "500",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {stat.label}
            </span>
          </div>
          <div
            style={{
              fontSize: widget.size === "small" ? "12px" : widget.size === "medium" ? "16px" : "18px",
              fontWeight: "600",
              color: theme.colors.text,
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: "1.2",
              flexShrink: 0,
            }}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

