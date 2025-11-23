import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Theme } from "../../utils/themes";
import { getThemeStyles } from "../../utils/themes";
import type { Settings } from "../../types";

interface ChartDataPoint {
  name: string;
  value?: number; // Opcionális, mert lehet több adatkulcs is (revenue, costs, profit)
  revenue?: number;
  costs?: number;
  profit?: number;
  [key: string]: string | number | undefined;
}

interface InteractiveChartProps {
  data: ChartDataPoint[];
  type: "line" | "area" | "bar" | "pie";
  theme: Theme;
  settings: Settings;
  dataKeys?: string[];
  colors?: string[];
  onDataPointClick?: (data: any, index: number) => void;
  onExport?: () => void;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number | string; // Lehet szám (px) vagy string ("100%")
}

const CHART_COLORS = [
  "#6366F1",
  "#22D3EE",
  "#F97316",
  "#4ADE80",
  "#A855F7",
  "#F43F5E",
  "#14B8A6",
  "#FACC15",
];

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  type,
  theme,
  settings,
  dataKeys = ["value"],
  colors = CHART_COLORS,
  onDataPointClick,
  onExport,
  showLegend = true,
  showGrid = true,
  height = 300,
}) => {
  const themeStyles = getThemeStyles(theme);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(typeof height === "number" ? height : 300);

  // Ha height "100%", akkor a container magasságát használjuk
  React.useEffect(() => {
    if (height === "100%" && containerRef.current) {
      const updateHeight = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          // A container teljes magasságát használjuk, mínusz a padding és export gomb
          const availableHeight = Math.max(rect.height - 50, 150); // 50px a padding és export gombhoz, minimum 150px
          // requestAnimationFrame használata, hogy ne történjen renderelés közben state frissítés
          requestAnimationFrame(() => {
            setContainerHeight(availableHeight);
          });
        }
      };
      
      // Azonnal frissítjük, de requestAnimationFrame-ben
      requestAnimationFrame(updateHeight);
      
      // ResizeObserver a dinamikus méretezéshez
      const resizeObserver = new ResizeObserver(() => {
        // ResizeObserver callback-ben is requestAnimationFrame használata
        requestAnimationFrame(updateHeight);
      });
      resizeObserver.observe(containerRef.current);
      
      // Window resize esemény is
      const handleResize = () => {
        requestAnimationFrame(updateHeight);
      };
      window.addEventListener("resize", handleResize);
      
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    } else if (typeof height === "number") {
      setContainerHeight(height);
    }
  }, [height]);
  
  const chartHeight: number = typeof height === "number" ? height : containerHeight;

  // Egyszerű, statikus Legend komponens, ami nem használ state-et
  const SimpleLegend = useMemo(() => {
    return ({ dataKeys, colors }: { dataKeys: string[]; colors: string[] }) => {
      if (!showLegend) return null;
      return (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            padding: "8px 0",
            fontSize: "12px",
            color: theme.colors.text,
          }}
        >
          {dataKeys.map((key, index) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: colors[index % colors.length],
                  borderRadius: "2px",
                }}
              />
              <span style={{ color: theme.colors.textMuted || theme.colors.text }}>
                {key}
              </span>
            </div>
          ))}
        </div>
      );
    };
  }, [showLegend, theme.colors.text, theme.colors.textMuted]);

  const handleClick = useCallback(
    (data: any, index: number) => {
      onDataPointClick?.(data, index);
    },
    [onDataPointClick]
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "8px",
            padding: "12px",
            boxShadow: themeStyles.card.boxShadow,
          }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
              fontWeight: "600",
              color: theme.colors.text,
            }}
          >
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{
                margin: "4px 0",
                color: entry.color,
                fontSize: "14px",
              }}
            >
              {`${entry.name}: ${entry.value.toLocaleString(settings.language === "hu" ? "hu-HU" : "en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${settings.currency === "HUF" ? "Ft" : settings.currency}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />}
            <XAxis
              dataKey="name"
              stroke={theme.colors.textMuted}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke={theme.colors.textMuted}
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: hoveredIndex !== null ? 5 : 4 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <>
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />}
              <XAxis
                dataKey="name"
                stroke={theme.colors.textMuted}
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke={theme.colors.textMuted}
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
            {showLegend && <SimpleLegend dataKeys={dataKeys} colors={colors} />}
          </>
        );

      case "bar":
        return (
          <>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />}
              <XAxis
                dataKey="name"
                stroke={theme.colors.textMuted}
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke={theme.colors.textMuted}
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                  onClick={handleClick}
                />
              ))}
            </BarChart>
            {showLegend && <SimpleLegend dataKeys={dataKeys} colors={colors} />}
          </>
        );

      case "pie":
        // Dinamikus outerRadius a container magassága alapján
        const pieOuterRadius = Math.min(80, (chartHeight - 60) / 2); // 60px margin-öknek (top + bottom)
        return (
          <>
            <PieChart margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={pieOuterRadius}
                fill="#8884d8"
                dataKey="value"
                onClick={handleClick}
                onMouseEnter={(_, index) => {
                  // requestAnimationFrame használata, hogy ne történjen renderelés közben state frissítés
                  requestAnimationFrame(() => {
                    setHoveredIndex(index);
                  });
                }}
                onMouseLeave={() => {
                  // requestAnimationFrame használata, hogy ne történjen renderelés közben state frissítés
                  requestAnimationFrame(() => {
                    setHoveredIndex(null);
                  });
                }}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                    opacity={hoveredIndex === index ? 1 : hoveredIndex !== null ? 0.5 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
            {showLegend && <SimpleLegend dataKeys={data.map(d => d.name)} colors={colors} />}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: height === "100%" ? "100%" : `${height}px`,
        minHeight: height === "100%" ? "150px" : `${height}px`,
        minWidth: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flex: height === "100%" ? "1 1 auto" : "0 0 auto",
      }}
    >
      <button
        onClick={async () => {
          if (onExport) {
            onExport();
            return;
          }
          // Default export implementation
          if (!chartContainerRef.current) return;
          const svgElement = chartContainerRef.current.querySelector("svg");
          if (!svgElement) return;
          try {
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgElement);
            if (!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) {
              source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `chart-${type}-${new Date().toISOString().split("T")[0]}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.error("Export error:", error);
          }
        }}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          zIndex: 10,
          ...themeStyles.buttonSecondary,
          padding: "6px 12px",
          fontSize: "12px",
        }}
      >
        📥 Export
      </button>
      <ResponsiveContainer width="100%" height={chartHeight}>
        {(() => {
          try {
            return renderChart();
          } catch (error) {
            console.error("[InteractiveChart] Error rendering chart:", {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              type: type,
            });
            return (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: theme.colors.danger,
                padding: "20px",
                textAlign: "center",
              }}>
                <div>
                  <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>Chart rendering error</p>
                  <p style={{ margin: 0, fontSize: "12px", opacity: 0.8 }}>
                    {error instanceof Error ? error.message : String(error)}
                  </p>
                </div>
              </div>
            );
          }
        })()}
      </ResponsiveContainer>
    </div>
  );
};

