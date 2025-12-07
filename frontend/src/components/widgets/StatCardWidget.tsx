import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";

interface StatCardWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  color: string;
}

export const StatCardWidget: React.FC<StatCardWidgetProps> = ({
  widget,
  theme,
  title,
  value,
  unit,
  icon,
  color,
}) => {
  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  // Méret alapján dinamikus méretek
  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const iconSize = isSmall ? "24px" : isMedium ? "40px" : "48px";
  const iconFontSize = isSmall ? "14px" : isMedium ? "20px" : "24px";
  const titleFontSize = isSmall ? "10px" : isMedium ? "14px" : "16px";
  const valueFontSize = isSmall ? "18px" : isMedium ? "32px" : "40px";
  const unitFontSize = isSmall ? "10px" : isMedium ? "14px" : "16px";
  const padding = isSmall ? "10px" : isMedium ? "18px" : "24px";
  const marginBottom = isSmall ? "6px" : isMedium ? "12px" : "16px";

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
        border: `2px solid ${color}40`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        flex: 1,
        position: "relative",
        overflow: "hidden",
        backdropFilter: isGradientBackground ? "blur(10px)" : "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        minHeight: 0,
        width: "100%",
        height: "100%",
        gap: isSmall ? "4px" : "8px",
        boxSizing: "border-box",
      }}>
        {/* Szín accent sáv */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          backgroundColor: color,
          borderRadius: "12px 12px 0 0",
        }} />
        
        <div style={{ 
          display: "flex", 
          alignItems: "flex-start", 
          marginBottom: marginBottom, 
          flexShrink: 0,
          minHeight: 0,
        }}>
          <div style={{
            width: iconSize,
            height: iconSize,
            borderRadius: isSmall ? "6px" : "8px",
            backgroundColor: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: isSmall ? "4px" : isMedium ? "10px" : "12px",
            fontSize: iconFontSize,
            flexShrink: 0,
          }}>
            {icon}
          </div>
          <h3 style={{ 
            margin: 0, 
            fontSize: titleFontSize, 
            color: isGradientBackground ? "#1a202c" : theme.colors.textSecondary, 
            fontWeight: "700",
            lineHeight: "1.2",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: isSmall ? 1 : 2,
            WebkitBoxOrient: "vertical",
            flex: 1,
            minHeight: 0,
          }}>
            {title}
          </h3>
        </div>
        <div style={{ 
          display: "flex",
          alignItems: "baseline",
          gap: isSmall ? "4px" : "6px",
          flexWrap: "nowrap",
          flexShrink: 0,
        }}>
          <div style={{ 
            fontSize: valueFontSize, 
            fontWeight: "700", 
            color: color,
            lineHeight: "1.2",
            wordBreak: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flexShrink: 1,
            minWidth: 0,
          }}>
            {value}
          </div>
          {unit && (
            <div style={{ 
              fontSize: unitFontSize, 
              color: isGradientBackground ? "#4a5568" : theme.colors.textMuted,
              fontWeight: "600",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}>
              {unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

