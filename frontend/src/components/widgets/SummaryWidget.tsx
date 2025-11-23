import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";

interface SummaryWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  summaryData: Array<{
    label: string;
    value: string | number;
    icon: string;
    color: string;
  }>;
}

export const SummaryWidget: React.FC<SummaryWidgetProps> = ({
  theme,
  summaryData,
}) => {

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
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "10px",
        flex: 1,
        minHeight: 0,
        alignContent: "stretch",
      }}>
        {summaryData.map((item, index) => (
          <div key={index} style={{
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: theme.colors.surfaceHover,
            border: `1px solid ${theme.colors.border}`,
            transition: "all 0.3s",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            justifyContent: "flex-start",
            minHeight: 0,
            overflow: "hidden",
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px",
              flexShrink: 0,
              width: "100%",
            }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
              <div style={{ 
                fontSize: "11px", 
                color: theme.colors.textMuted,
                fontWeight: "600",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}>
                {item.label}
              </div>
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "700", 
              color: item.color || theme.colors.text,
              lineHeight: "1.2",
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

