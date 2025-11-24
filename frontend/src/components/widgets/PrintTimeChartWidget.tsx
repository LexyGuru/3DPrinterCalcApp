import React, { useMemo } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { InteractiveChart } from "./InteractiveChart";
import { useTranslation } from "../../utils/translations";

interface PrintTimeChartWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  data: Array<{
    name: string;
    hours: number;
  }>;
  onDataPointClick?: (data: any, index: number) => void;
  onExport?: () => void;
}

export const PrintTimeChartWidget: React.FC<PrintTimeChartWidgetProps> = ({
  theme,
  settings,
  data,
  onDataPointClick,
  onExport,
}) => {
  const t = useTranslation(settings.language);

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.hours,
  }));

  const totalHours = useMemo(() => {
    return data.reduce((acc, point) => acc + point.hours, 0);
  }, [data]);

  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const hoursLabel = t("home.stats.unit.hours");
    const minutesLabel = t("home.stats.unit.minutes");
    if (h > 0 && m > 0) {
      return `${h} ${hoursLabel} ${m} ${minutesLabel}`;
    } else if (h > 0) {
      return `${h} ${hoursLabel}`;
    } else {
      return `${m} ${minutesLabel}`;
    }
  };

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
          exportFileName={t("home.chart.printTime").toLowerCase().replace(/\s+/g, "-")}
        />
      </div>
      {/* Összesítés */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        gap: "8px",
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
            {t("home.stats.totalPrintTime")}:
          </span>
          <strong style={{ 
            fontSize: "12px", 
            color: theme.colors.primary,
            whiteSpace: "nowrap",
          }}>
            {formatTime(totalHours)}
          </strong>
        </div>
      </div>
    </div>
  );
};

