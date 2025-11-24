import React, { useMemo } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { InteractiveChart } from "./InteractiveChart";
import { useTranslation } from "../../utils/translations";
import { getCurrencyLabel } from "../../utils/currency";

interface CustomerStatsChartWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  data: Array<{
    name: string;
    offerCount: number;
    totalRevenue: number;
    totalProfit: number;
  }>;
  onDataPointClick?: (data: any, index: number) => void;
  onExport?: () => void;
  formatNumber?: (value: number, decimals: number) => string;
  formatCurrency?: (value: number) => number;
  currencyLabel?: string;
}

export const CustomerStatsChartWidget: React.FC<CustomerStatsChartWidgetProps> = ({
  theme,
  settings,
  data,
  onDataPointClick,
  onExport,
  formatNumber = (v, d) => v.toFixed(d),
  formatCurrency = (v) => v,
  currencyLabel = getCurrencyLabel(settings.currency),
}) => {
  const t = useTranslation(settings.language);

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.offerCount,
    revenue: item.totalRevenue,
    profit: item.totalProfit,
  }));

  const totalOffers = useMemo(() => {
    return data.reduce((acc, point) => acc + point.offerCount, 0);
  }, [data]);

  const totalRevenue = useMemo(() => {
    return data.reduce((acc, point) => acc + point.totalRevenue, 0);
  }, [data]);

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      minHeight: 0,
      overflow: "hidden",
      gap: "8px",
    }}>
      <div style={{ 
        flex: "1 1 0", 
        minHeight: "150px",
        overflow: "hidden",
        position: "relative",
      }}>
        <InteractiveChart
          data={chartData}
          type="bar"
          theme={theme}
          settings={settings}
          dataKeys={["value"]}
          onDataPointClick={onDataPointClick}
          onExport={onExport}
          height="100%"
          showLegend={false}
          exportFileName={t("home.chart.customerStats").toLowerCase().replace(/\s+/g, "-")}
        />
      </div>
      {/* Összesítések */}
      <div style={{ 
        display: "flex", 
        gap: "8px", 
        flexWrap: "wrap",
        flexShrink: 0,
        paddingTop: "8px",
      }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: theme.colors.surfaceHover,
            borderRadius: "999px",
            padding: "6px 12px",
            border: `1px solid ${theme.colors.primary}30`,
            fontSize: "11px",
          }}
        >
          <span style={{
            width: "10px",
            height: "10px",
            borderRadius: "999px",
            backgroundColor: theme.colors.primary,
            flexShrink: 0,
          }} />
          <span style={{ 
            fontSize: "11px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            {t("offers.title")}:
          </span>
          <strong style={{ 
            fontSize: "12px", 
            color: theme.colors.primary,
            whiteSpace: "nowrap",
          }}>
            {totalOffers}
          </strong>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: theme.colors.surfaceHover,
            borderRadius: "999px",
            padding: "6px 12px",
            border: `1px solid #22D3EE30`,
            fontSize: "11px",
          }}
        >
          <span style={{
            width: "10px",
            height: "10px",
            borderRadius: "999px",
            backgroundColor: "#22D3EE",
            flexShrink: 0,
          }} />
          <span style={{ 
            fontSize: "11px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            {t("home.stats.totalRevenue")}:
          </span>
          <strong style={{ 
            fontSize: "12px", 
            color: "#22D3EE",
            whiteSpace: "nowrap",
          }}>
            {formatNumber(formatCurrency(totalRevenue), 2)} {currencyLabel}
          </strong>
        </div>
      </div>
    </div>
  );
};

