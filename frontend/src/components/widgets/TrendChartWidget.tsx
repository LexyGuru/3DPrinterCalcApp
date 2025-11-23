import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { InteractiveChart } from "./InteractiveChart";

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
}

export const TrendChartWidget: React.FC<TrendChartWidgetProps> = ({
  theme,
  settings,
  data,
  onDataPointClick,
  onExport,
}) => {
  const chartData = data.map((item) => ({
    name: item.name,
    revenue: item.revenue,
    costs: item.costs,
    profit: item.profit,
  }));

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      minHeight: 0,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    }}>
      <InteractiveChart
        data={chartData}
        type="area"
        theme={theme}
        settings={settings}
        dataKeys={["revenue", "costs", "profit"]}
        onDataPointClick={onDataPointClick}
        onExport={onExport}
        height="100%"
      />
    </div>
  );
};

