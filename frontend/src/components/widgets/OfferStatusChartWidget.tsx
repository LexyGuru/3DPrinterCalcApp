import React, { useMemo } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { InteractiveChart } from "./InteractiveChart";
import { useTranslation } from "../../utils/translations";
import type { TranslationKey } from "../../utils/languages/types";

interface OfferStatusChartWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  data: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  onDataPointClick?: (data: any, index: number) => void;
  onExport?: () => void;
}

export const OfferStatusChartWidget: React.FC<OfferStatusChartWidgetProps> = ({
  theme,
  settings,
  data,
  onDataPointClick,
  onExport,
}) => {
  const t = useTranslation(settings.language);

  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    color: item.color,
  }));

  const totalOffers = useMemo(() => {
    return data.reduce((acc, point) => acc + point.count, 0);
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <InteractiveChart
          data={chartData}
          type="pie"
          theme={theme}
          settings={settings}
          onDataPointClick={onDataPointClick}
          onExport={onExport}
          height="100%"
          showLegend={false}
          exportFileName={t("home.chart.offerStatus").toLowerCase().replace(/\s+/g, "-")}
          valueFormatter={(_, value) => {
            const locale = settings.language === "hu" ? "hu-HU" : "en-US";
            const countText = value.toLocaleString(locale, {
              maximumFractionDigits: 0,
            });
            const percentage =
              totalOffers > 0 ? (value / totalOffers) * 100 : 0;
            return `${countText} · ${percentage.toFixed(1)}%`;
          }}
        />
      </div>
      {/* Státusz lista */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "4px", 
        flex: "0 0 auto",
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        width: "100%",
        paddingRight: "4px",
      }}>
        {data.map((item) => {
          const percentage = totalOffers > 0 ? (item.count / totalOffers) * 100 : 0;
          return (
            <div key={item.status} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              fontSize: "11px",
              flexShrink: 0,
              width: "100%",
              gap: "8px",
            }}>
              <span style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "6px", 
                color: theme.colors.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: "1 1 0",
                minWidth: 0,
              }}>
                <span style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "999px", 
                  backgroundColor: item.color,
                  flexShrink: 0,
                }} />
                {t(`offers.status.${item.status}` as TranslationKey) || item.status}
              </span>
              <span style={{ 
                color: theme.colors.textMuted, 
                fontWeight: 600,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}>
                {item.count} · {percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

