import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";
import { InteractiveChart } from "./InteractiveChart";

interface FilamentBreakdownWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  filamentBreakdown: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export const FilamentBreakdownWidget: React.FC<FilamentBreakdownWidgetProps> = ({
  theme,
  settings,
  filamentBreakdown,
}) => {
  const t = useTranslation(settings.language);

  const totalFilamentByType = filamentBreakdown.reduce((acc, slice) => acc + slice.value, 0);

  const chartData = filamentBreakdown.map(slice => ({
    name: slice.label,
    value: slice.value / 1000, // Convert to kg
    color: slice.color,
  }));

  return (
    <div style={{ 
      height: "100%", 
      width: "100%",
      display: "flex", 
      flexDirection: "column",
      minHeight: 0,
      overflow: "hidden",
      gap: "8px",
    }}>
      {filamentBreakdown.length > 0 && totalFilamentByType > 0 ? (
        <>
          <div style={{ 
            width: "100%", 
            flex: "1 1 0",
            minHeight: 0,
            position: "relative", 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}>
            <InteractiveChart
              type="pie"
              data={chartData}
              theme={theme}
              settings={settings}
              height="100%"
            />
          </div>
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
            {filamentBreakdown.map(slice => {
              const percentage = totalFilamentByType > 0 ? (slice.value / totalFilamentByType) * 100 : 0;
              return (
                <div key={slice.label} style={{ 
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
                      backgroundColor: slice.color ?? "#6366F1",
                      flexShrink: 0,
                    }} />
                    {slice.label}
                  </span>
                  <span style={{ 
                    color: theme.colors.textMuted, 
                    fontWeight: 600,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}>
                    {(slice.value / 1000).toFixed(2)} kg · {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          textAlign: "center",
          color: theme.colors.textMuted,
          border: `1px dashed ${theme.colors.border}`,
          borderRadius: "12px",
        }}>
          {t("home.chart.noFilamentData")}
        </div>
      )}
    </div>
  );
};

