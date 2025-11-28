import React, { useMemo } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { InteractiveChart } from "./InteractiveChart";
import { useTranslation } from "../../utils/translations";
import { getCurrencyLabel } from "../../utils/currency";

interface TrendChartWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  data: Array<{
    name: string;
    revenue: number;
    costs: number;
    profit: number;
  }>;
  onDataPointClick?: (data: any, index: number) => void;
  onExport?: () => void;
  formatNumber?: (value: number, decimals: number) => string;
  formatCurrency?: (value: number) => number;
  currencyLabel?: string;
}

export const TrendChartWidget: React.FC<TrendChartWidgetProps> = ({
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
    revenue: item.revenue,
    costs: item.costs,
    profit: item.profit,
  }));

  // Összesítések számítása
  const trendTotals = useMemo(() => {
    return data.reduce(
      (acc, point) => {
        acc.revenue += point.revenue;
        acc.costs += point.costs;
        acc.profit += point.profit;
        return acc;
      },
      { revenue: 0, costs: 0, profit: 0 }
    );
  }, [data]);

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      minHeight: 0,
      overflow: "hidden",
      gap: "4px",
    }}>
      <div style={{ 
        flex: "1 1 0", 
        minHeight: "140px",
        overflow: "hidden",
        position: "relative",
      }}>
        <InteractiveChart
          data={chartData}
          type="area"
          theme={theme}
          settings={settings}
          dataKeys={["revenue", "costs", "profit"]}
          onDataPointClick={onDataPointClick}
          onExport={onExport}
          height={220}
          enableZoom={true}
          enableComparison={true}
          showLegend={false}
          exportFileName={t("home.chart.financialTrends").toLowerCase().replace(/\s+/g, "-")}
          valueFormatter={(_key, value) =>
            `${formatNumber(formatCurrency(value), 2)} ${currencyLabel}`
          }
        />
      </div>
      {/* Összesítések - egymás mellett, mint a klasszikus nézetben */}
      <div style={{ 
        display: "flex", 
        gap: "8px", 
        flexWrap: "wrap",
        flexShrink: 0,
        paddingTop: "8px",
      }}>
        {[{
          label: t("home.stats.totalRevenue"),
          value: trendTotals.revenue,
          color: "#22D3EE",
        }, {
          label: t("home.stats.totalCost"),
          value: trendTotals.costs,
          color: "#F97316",
        }, {
          label: t("home.stats.netProfit"),
          value: trendTotals.profit,
          color: "#4ADE80",
        }].map(item => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: theme.colors.surfaceHover,
              borderRadius: "999px",
              padding: "6px 12px",
              border: `1px solid ${item.color}30`,
              fontSize: "11px",
            }}
          >
            <span style={{
              width: "10px",
              height: "10px",
              borderRadius: "999px",
              backgroundColor: item.color,
              flexShrink: 0,
            }} />
            <span style={{ 
              fontSize: "11px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
            }}>
              {item.label}:
            </span>
            <strong style={{ 
              fontSize: "12px", 
              color: item.color,
              whiteSpace: "nowrap",
            }}>
              {formatNumber(formatCurrency(item.value), 2)} {currencyLabel}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
};

