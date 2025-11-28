import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";
import { InteractiveChart } from "./InteractiveChart";

interface FinancialTrendsData {
  period: "week" | "month" | "year";
  data: Array<{
    date: string;
    revenue: number;
    costs: number;
    profit: number;
    margin: number; // profit margin %
  }>;
}

interface FinancialTrendsWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  data: FinancialTrendsData;
  onPeriodChange?: (period: "week" | "month" | "year") => void;
}

export const FinancialTrendsWidget: React.FC<FinancialTrendsWidgetProps> = ({
  widget,
  theme,
  settings,
  data,
  onPeriodChange,
}) => {
  const t = useTranslation(settings.language);
  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const titleFontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";
  const chartHeight = isSmall ? 160 : isMedium ? 200 : 220;

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
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: isSmall ? "4px" : "8px",
        }}>
          <div style={{
            fontSize: titleFontSize,
            fontWeight: "700",
            color: theme.colors.text,
          }}>
            {t("widget.title.financialTrends") || "Financial Trends"}
          </div>
          {onPeriodChange && (
            <div style={{
              display: "flex",
              gap: "4px",
            }}>
              {(["week", "month", "year"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => onPeriodChange(period)}
                  style={{
                    padding: "4px 8px",
                    fontSize: isSmall ? "10px" : "11px",
                    borderRadius: "4px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: data.period === period ? theme.colors.primary : "transparent",
                    color: data.period === period ? "#fff" : theme.colors.text,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {t(`common.${period}`) || period}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{
          flex: 1,
          minHeight: 0,
        }}>
          <InteractiveChart
            data={data.data.map(item => ({
              name: item.date,
              revenue: item.revenue,
              costs: item.costs,
              profit: item.profit,
            }))}
            type="line"
            theme={theme}
            settings={settings}
            dataKeys={["revenue", "costs", "profit"]}
            onDataPointClick={undefined}
            height={chartHeight}
            enableZoom={true}
            enableComparison={false}
            showLegend={false}
            exportFileName={t("widget.title.financialTrends").toLowerCase().replace(/\s+/g, "-")}
          />
        </div>
      </div>
    </div>
  );
};
