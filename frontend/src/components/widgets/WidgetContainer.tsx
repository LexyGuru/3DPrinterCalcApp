import React, { type ReactNode } from "react";
import type { WidgetConfig, WidgetSize } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import { getThemeStyles } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";

interface WidgetContainerProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  children: ReactNode;
  onRemove?: (widgetId: string) => void;
  onToggleVisibility?: (widgetId: string) => void;
  onResize?: (widgetId: string, size: WidgetSize) => void;
  onAddToGroup?: (widgetId: string, groupId: string) => void;
  onRemoveFromGroup?: (widgetId: string) => void;
  onCreateGroup?: (widgetIds: string[]) => void;
  onRenameGroup?: (groupId: string, newTitle: string) => void;
  availableGroups?: Array<{ id: string; title: string }>;
  isDragging?: boolean;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widget,
  theme,
  settings,
  children,
  onRemove,
  onToggleVisibility,
  onResize,
  onAddToGroup,
  onRemoveFromGroup,
  onCreateGroup,
  onRenameGroup,
  availableGroups = [],
  isDragging = false,
}) => {
  const themeStyles = getThemeStyles(theme);
  const t = useTranslation(settings.language);
  const [showControls, setShowControls] = React.useState(false);
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(widget.title);

  // Widget cím dinamikus fordítása
  const getWidgetTitle = React.useCallback((widget: WidgetConfig): string => {
    // Ha a widget egy csoport és van egyedi címe (nem az alapértelmezett), akkor azt használjuk
    if (widget.type === "widget-group") {
      const defaultGroupName = t("widget.group.name");
      // Ha a cím nem az alapértelmezett csoport név formátumú, akkor egyedi név
      if (widget.title && !widget.title.match(new RegExp(`^${defaultGroupName} \\d+$`))) {
        return widget.title;
      }
      // Ha az alapértelmezett formátumú, akkor fordítjuk
      const match = widget.title?.match(/^Csoport (\d+)$/) || widget.title?.match(new RegExp(`^${defaultGroupName} (\\d+)$`));
      if (match) {
        return `${t("widget.group.name")} ${match[1]}`;
      }
      return widget.title || `${t("widget.group.name")} 1`;
    }
    
    // Egyéb widget típusok fordítása
    switch (widget.type) {
      case "period-comparison":
        return t("widget.title.periodComparison");
      case "stat-card-filament":
        return t("widget.title.totalFilament");
      case "stat-card-revenue":
        return t("widget.title.totalRevenue");
      case "stat-card-electricity":
        return t("widget.title.totalElectricity");
      case "stat-card-cost":
        return t("widget.title.totalCost");
      case "stat-card-profit":
        return t("widget.title.netProfit");
      case "stat-card-print-time":
        return t("widget.title.totalPrintTime");
      case "trend-chart":
        return t("widget.title.trends");
      case "filament-breakdown":
        return t("widget.title.filamentBreakdown");
      case "printer-breakdown":
        return t("widget.title.revenueByPrinter");
      case "summary":
        return t("widget.title.summary");
      case "print-time-chart":
        return t("widget.title.printTimeChart");
      case "customer-stats-chart":
        return t("widget.title.customerStatsChart");
      case "offer-status-chart":
        return t("widget.title.offerStatusChart");
      default:
        return widget.title || "";
    }
  }, [t, widget]);

  // Frissítjük az editedTitle-t, ha a widget.title változik
  React.useEffect(() => {
    setEditedTitle(widget.title);
  }, [widget.title]);

  if (!widget.visible) {
    return null;
  }

  // Méret alapján dinamikus padding
  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  const containerPadding = isSmall ? "8px" : isMedium ? "12px" : "16px";

  return (
    <div
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: "12px",
        padding: containerPadding,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: themeStyles.card.boxShadow,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        opacity: isDragging ? 0.8 : 1,
        transition: "opacity 0.2s ease",
        overflow: "hidden",
        boxSizing: "border-box",
        minHeight: 0,
        minWidth: 0,
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onMouseDown={(e) => {
        // Ne blokkoljuk az export gomb eseményeit
        const target = e.target as HTMLElement;
        if (target.closest('[data-export-button]')) {
          return;
        }
      }}
    >
        {/* Widget Header */}
        <div
          className="widget-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
            paddingBottom: "6px",
            borderBottom: `1px solid ${theme.colors.border}`,
            position: "relative",
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {isEditingTitle && widget.type === "widget-group" && onRenameGroup ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={() => {
                if (editedTitle.trim()) {
                  onRenameGroup(widget.id, editedTitle.trim());
                } else {
                  setEditedTitle(widget.title);
                }
                setIsEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (editedTitle.trim()) {
                    onRenameGroup(widget.id, editedTitle.trim());
                  } else {
                    setEditedTitle(widget.title);
                  }
                  setIsEditingTitle(false);
                } else if (e.key === "Escape") {
                  setEditedTitle(widget.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.primary}`,
                borderRadius: "4px",
                padding: "2px 6px",
                flex: 1,
                outline: "none",
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <h3
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
                color: theme.colors.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
                cursor: widget.type === "widget-group" && onRenameGroup ? "pointer" : "default",
              }}
              onDoubleClick={() => {
                if (widget.type === "widget-group" && onRenameGroup) {
                  setIsEditingTitle(true);
                  setEditedTitle(widget.title);
                }
              }}
              title={widget.type === "widget-group" && onRenameGroup ? t("widget.action.doubleClickToEdit") : getWidgetTitle(widget)}
            >
              {getWidgetTitle(widget)}
            </h3>
          )}
          
          {showControls && (
            <div
              style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
                pointerEvents: "auto",
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Size selector */}
              <select
                value={widget.size}
                onChange={(e) => onResize?.(widget.id, e.target.value as WidgetSize)}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                style={{
                  ...themeStyles.select,
                  padding: "4px 8px",
                  fontSize: "12px",
                  marginRight: "4px",
                }}
              >
                <option value="small">S</option>
                <option value="medium">M</option>
                <option value="large">L</option>
              </select>
              
              {/* Hide button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility?.(widget.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  ...themeStyles.buttonSecondary,
                  padding: "4px 8px",
                  fontSize: "12px",
                  minWidth: "auto",
                }}
                title={t("widget.action.hide")}
              >
                👁️
              </button>
              
              {/* Remove button */}
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(widget.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    ...themeStyles.buttonDanger,
                    padding: "4px 8px",
                    fontSize: "12px",
                    minWidth: "auto",
                  }}
                  title={t("widget.action.remove")}
                >
                  ✕
                </button>
              )}
              
              {/* Rename group button - csak csoport widget-ekhez */}
              {widget.type === "widget-group" && onRenameGroup && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                    setEditedTitle(widget.title);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    ...themeStyles.buttonSecondary,
                    padding: "4px 8px",
                    fontSize: "12px",
                    minWidth: "auto",
                  }}
                  title={t("widget.action.renameGroup")}
                >
                  ✏️
                </button>
              )}
              
              {/* Group actions - csak ha nem csoport widget */}
              {widget.type !== "widget-group" && (
                <>
                  {widget.groupId ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromGroup?.(widget.id);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        ...themeStyles.buttonSecondary,
                        padding: "4px 8px",
                        fontSize: "12px",
                        minWidth: "auto",
                      }}
                      title={t("widget.action.removeFromGroup")}
                    >
                      📤
                    </button>
                  ) : (
                    <>
                      {availableGroups.length > 0 && (
                        <select
                          onChange={(e) => {
                            if (e.target.value && onAddToGroup) {
                              onAddToGroup(widget.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            ...themeStyles.select,
                            padding: "4px 8px",
                            fontSize: "12px",
                            marginRight: "4px",
                          }}
                          title={t("widget.action.addToGroup")}
                        >
                          <option value="">📦 {t("widget.group.name")}</option>
                          {availableGroups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.title}
                            </option>
                          ))}
                        </select>
                      )}
                      {onCreateGroup && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateGroup([widget.id]);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          style={{
                            ...themeStyles.buttonSecondary,
                            padding: "4px 8px",
                            fontSize: "12px",
                            minWidth: "auto",
                          }}
                          title={t("widget.action.createGroup")}
                        >
                          ➕
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Widget Content */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            position: "relative",
          }}
        >
          <div style={{
            width: "100%",
            height: "100%",
            minHeight: 0,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}>
            {children}
          </div>
        </div>
      </div>
  );
};

