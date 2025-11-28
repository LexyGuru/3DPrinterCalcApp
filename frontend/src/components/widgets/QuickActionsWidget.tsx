import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  shortcut?: string;
}

interface QuickActionsWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  actions: QuickAction[];
  onNavigate?: (page: string) => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  widget,
  theme,
  actions,
  onNavigate,
}) => {
  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const buttonPadding = isSmall ? "8px 12px" : isMedium ? "10px 16px" : "12px 20px";
  const fontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";
  const iconSize = isSmall ? "16px" : isMedium ? "20px" : "24px";
  const gap = isSmall ? "8px" : isMedium ? "12px" : "16px";

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
        padding: isSmall ? "12px" : isMedium ? "16px" : "20px",
        boxShadow: isGradientBackground
          ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
          : `0 4px 16px ${theme.colors.shadow}`,
        border: `1px solid ${theme.colors.border}`,
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
        gap: gap,
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isSmall ? "1fr" : "repeat(auto-fit, minmax(120px, 1fr))",
          gap: gap,
          flex: 1,
          minHeight: 0,
          alignContent: "flex-start",
        }}>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.onClick();
                if (onNavigate && action.id.includes('-')) {
                  const page = action.id.split('-')[1]; // 'add-offer' -> 'offers', 'add-filament' -> 'filaments'
                  if (['offer', 'filament', 'printer', 'customer'].includes(page)) {
                    onNavigate(page === 'offer' ? 'offers' : `${page}s`);
                  }
                }
              }}
              style={{
                padding: buttonPadding,
                borderRadius: isSmall ? "8px" : "10px",
                backgroundColor: theme.colors.primary,
                color: "#ffffff",
                border: "none",
                fontSize: fontSize,
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isSmall ? "6px" : "8px",
                boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                minHeight: isSmall ? "36px" : isMedium ? "44px" : "52px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 2px 8px ${theme.colors.shadow}`;
              }}
              aria-label={action.label}
            >
              <span style={{ fontSize: iconSize }}>{action.icon}</span>
              <span>{action.label}</span>
              {action.shortcut && (
                <span style={{
                  fontSize: isSmall ? "10px" : "11px",
                  opacity: 0.7,
                  marginLeft: "auto",
                }}>
                  {action.shortcut}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

