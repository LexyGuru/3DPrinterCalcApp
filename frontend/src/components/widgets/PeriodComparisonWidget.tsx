import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";

interface PeriodComparisonWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  weeklyStats: {
    totalProfit: number;
    offerCount: number;
  };
  monthlyStats: {
    totalProfit: number;
    offerCount: number;
  };
  yearlyStats: {
    totalProfit: number;
    offerCount: number;
  };
}

export const PeriodComparisonWidget: React.FC<PeriodComparisonWidgetProps> = ({
  theme,
  settings,
  weeklyStats,
  monthlyStats,
  yearlyStats,
}) => {
  const t = useTranslation(settings.language);

  const formatCurrency = (value: number): number => {
    if (settings.currency === "HUF") {
      // EUR to HUF conversion (400 is a default fallback)
      return value * 400;
    }
    return value;
  };

  const periods = [
    { label: t("home.period.option.week"), stats: weeklyStats, icon: "📅", color: "#4299e1" },
    { label: t("home.period.option.month"), stats: monthlyStats, icon: "📆", color: "#48bb78" },
    { label: t("home.period.option.year"), stats: yearlyStats, icon: "📊", color: "#667eea" },
  ];

  return (
    <div style={{ 
      height: "100%", 
      width: "100%",
      display: "flex", 
      flexDirection: "column",
      minHeight: 0,
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "8px",
        flex: 1,
        minHeight: 0,
        alignContent: "stretch",
      }}>
        {periods.map((period, index) => (
          <div key={index} style={{
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: theme.colors.surfaceHover,
            border: `2px solid ${period.color}30`,
            transition: "all 0.3s",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            minHeight: 0,
            gap: "4px",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              backgroundColor: period.color,
            }} />
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{period.icon}</span>
              <div style={{ 
                fontSize: "10px", 
                color: theme.colors.textMuted,
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}>
                {period.label}
              </div>
            </div>
            <div style={{ 
              fontSize: "18px", 
              fontWeight: "700", 
              color: period.color,
              lineHeight: "1.2",
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>
              {formatCurrency(period.stats.totalProfit).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}
            </div>
            <div style={{ 
              fontSize: "10px", 
              color: theme.colors.textMuted,
              fontWeight: "600",
              flexShrink: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {period.stats.offerCount} {t("home.periodComparison.offers")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

