import React, { useMemo, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { WidgetContainer } from "./WidgetContainer";
import { useTranslation } from "../../utils/translations";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetGroupProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  allWidgets: WidgetConfig[];
  onRemove?: (widgetId: string) => void;
  onToggleVisibility?: (widgetId: string) => void;
  onResize?: (widgetId: string, size: import("../../types/widgets").WidgetSize) => void;
  onLayoutChange?: (groupId: string, layouts: Layout[]) => void;
  renderWidget: (widget: WidgetConfig) => React.ReactNode;
}

export const WidgetGroup: React.FC<WidgetGroupProps> = ({
  widget,
  theme,
  settings,
  allWidgets,
  onRemove,
  onToggleVisibility,
  onResize,
  onLayoutChange,
  renderWidget,
}) => {
  const t = useTranslation(settings.language);
  // A csoportban lévő widget-ek lekérése
  const childWidgets = useMemo(() => {
    if (!widget.children || widget.children.length === 0) {
      return [];
    }
    return allWidgets.filter((w) => widget.children?.includes(w.id));
  }, [widget.children, allWidgets]);

  // Layout konverzió react-grid-layout formátumra
  // A layout változásokat is figyelembe vesszük a dependency array-ben
  const layouts = useMemo(() => {
    const lg: Layout[] = childWidgets.map((childWidget, index) => {
      // A csoporton belüli layout relatív pozíciókat használ
      // Ha nincs mentett layout, akkor alapértelmezett értékeket használunk
      const savedLayout = childWidget.layout;
      // Alapértelmezett: 3 oszlopos elrendezés (12 oszlop / 4 = 3 widget egymás mellett)
      const defaultCols = 4; // 12 oszlopban 4 oszlop = 1 widget
      return {
        i: childWidget.id,
        x: savedLayout?.x ?? (index % 3) * defaultCols, // Alapértelmezett: 3 oszlopos elrendezés
        y: savedLayout?.y ?? Math.floor(index / 3) * 2, // Alapértelmezett: 3 oszlopos elrendezés
        w: savedLayout?.w ?? defaultCols,
        h: savedLayout?.h ?? 2,
        minW: savedLayout?.minW ?? 2,
        minH: savedLayout?.minH ?? 2,
        maxW: savedLayout?.maxW ?? 12,
        maxH: savedLayout?.maxH ?? 6,
      };
    });
    // Minden breakpoint-hoz ugyanazt a layout-ot használjuk, hogy ne változzon az ablak méretezéskor
    return { 
      lg,
      md: lg,
      sm: lg,
      xs: lg,
      xxs: lg,
    };
  }, [childWidgets, childWidgets.map(w => `${w.id}:${w.layout.x},${w.layout.y},${w.layout.w},${w.layout.h}`).join('|')]);

  // Layout változás kezelése
  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      if (onLayoutChange && layout && layout.length > 0) {
        // A layout paraméter már a jelenlegi breakpoint layout-ja
        onLayoutChange(widget.id, layout);
      }
    },
    [widget.id, onLayoutChange]
  );

  if (childWidgets.length === 0) {
    return (
      <div style={{
        padding: "20px",
        textAlign: "center",
        color: theme.colors.textMuted,
        border: `2px dashed ${theme.colors.border}`,
        borderRadius: "12px",
        backgroundColor: theme.colors.surface,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p style={{ margin: 0 }}>{t("widget.group.empty")}. {t("widget.group.dragHere")}</p>
      </div>
    );
  }

  return (
    <div 
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        position: "relative",
      }}
      onMouseDown={(e) => {
        // Ha a csoporton belül kezdünk drag-elni, akkor megakadályozzuk a külső grid drag-jét
        const target = e.target as HTMLElement;
        if (target.closest('.widget-header') && target.closest('.react-grid-item')) {
          // Megakadályozzuk, hogy a drag esemény a külső grid-hez jusson
          e.stopPropagation();
        }
      }}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={60}
        onLayoutChange={(layout) => {
          // A layout paraméter már a jelenlegi breakpoint layout-ja
          if (layout && layout.length > 0) {
            handleLayoutChange(layout);
          }
        }}
        isDraggable={true}
        isResizable={true}
        draggableHandle=".widget-header"
        compactType="vertical"
        preventCollision={false}
        margin={[8, 8]}
        containerPadding={[4, 4]}
        useCSSTransforms={true}
        transformScale={1}
        style={{
          height: "100%",
        }}
      >
        {childWidgets.map((childWidget) => (
          <div 
            key={childWidget.id} 
            style={{ 
              height: "100%", 
              width: "100%",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              position: "relative",
            }}
          >
            <WidgetContainer
              widget={childWidget}
              theme={theme}
              settings={settings}
              onRemove={onRemove}
              onToggleVisibility={onToggleVisibility}
              onResize={onResize}
            >
              {renderWidget(childWidget)}
            </WidgetContainer>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

