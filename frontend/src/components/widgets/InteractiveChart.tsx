import React, { useState, useCallback, useRef, useMemo } from "react";
import { getCurrencyLabel } from "../../utils/currency";
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
  Brush,
  ScatterChart,
  Scatter,
} from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import type { Theme } from "../../utils/themes";
import { getThemeStyles } from "../../utils/themes";
import type { Settings } from "../../types";
import { useToast } from "../Toast";
import { useTranslation } from "../../utils/translations";

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
  type: "line" | "area" | "bar" | "pie" | "scatter" | "heatmap";
  theme: Theme;
  settings: Settings;
  dataKeys?: string[];
  colors?: string[];
  onDataPointClick?: (data: any, index: number) => void;
  onExport?: () => void;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number | string; // Lehet szám (px) vagy string ("100%")
  enableZoom?: boolean; // Zoom és pan funkciók
  enableComparison?: boolean; // Összehasonlító mód
  onPeriodFilter?: (startIndex: number, endIndex: number) => void; // Időszak szűrés callback
  exportFileName?: string; // Egyedi fájlnév az export-hoz
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
  enableZoom = false,
  enableComparison = false,
  onPeriodFilter,
  exportFileName,
}) => {
  const themeStyles = getThemeStyles(theme);
  const { showToast } = useToast();
  const t = useTranslation(settings.language);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [brushStartIndex, setBrushStartIndex] = useState<number>(0);
  const [brushEndIndex, setBrushEndIndex] = useState<number>(Math.max(0, data.length - 1));
  const [comparisonData, setComparisonData] = useState<ChartDataPoint[] | null>(null);

  // Frissítjük a brush indexeket, ha az adatok változnak
  React.useEffect(() => {
    if (data.length > 0) {
      setBrushStartIndex(0);
      setBrushEndIndex(Math.max(0, data.length - 1));
    }
  }, [data.length]);
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
          const availableHeight = Math.max(rect.height - 50, 200); // 50px a padding és export gombhoz, minimum 200px
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
  
  // Biztosítjuk, hogy a chartHeight mindig legalább 200px legyen
  const chartHeight: number = Math.max(
    typeof height === "number" ? height : containerHeight,
    200
  );

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
      if (onDataPointClick) {
        onDataPointClick(data, index);
      } else {
        // Alapértelmezett: részletes nézet modal megnyitása
        setSelectedDataPoint({ data, index });
        setShowDetailModal(true);
      }
    },
    [onDataPointClick]
  );

  const handleBrushChange = useCallback(
    (brushData: any) => {
      if (brushData && brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
        setBrushStartIndex(brushData.startIndex);
        setBrushEndIndex(brushData.endIndex);
        onPeriodFilter?.(brushData.startIndex, brushData.endIndex);
      }
    },
    [onPeriodFilter]
  );

  // Szűrt adatok a zoom-hoz
  const filteredData = useMemo(() => {
    if (enableZoom && type !== "pie") {
      return data.slice(brushStartIndex, brushEndIndex + 1);
    }
    return data;
  }, [data, brushStartIndex, brushEndIndex, enableZoom, type]);

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
              })} ${getCurrencyLabel(settings.currency)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const chartData = filteredData;
    const chartMargin = enableZoom 
      ? { top: 10, right: 10, left: 0, bottom: 80 } // Több hely a Brush-hoz és XAxis címkékhez, nincs bal oldali margin
      : { top: 10, right: 10, left: 0, bottom: 60 }; // Hely az XAxis címkékhez, nincs bal oldali margin

    switch (type) {
      case "line":
        return (
          <LineChart data={chartData} margin={chartMargin}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />}
            <XAxis
              dataKey="name"
              stroke={theme.colors.textMuted || theme.colors.text}
              tick={{ fill: theme.colors.textMuted || theme.colors.text, fontSize: "12px" }}
              angle={chartData.length > 5 ? -45 : 0}
              textAnchor={chartData.length > 5 ? "end" : "middle"}
              height={chartData.length > 5 ? 60 : 30}
            />
            <YAxis
              stroke={theme.colors.textMuted || theme.colors.text}
              tick={{ fill: theme.colors.textMuted || theme.colors.text, fontSize: "12px" }}
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
                dot={{ r: hoveredIndex !== null ? 5 : 4, onClick: (data: any) => handleClick(data, chartData.indexOf(data)) }}
                activeDot={{ r: 7, onClick: (data: any) => handleClick(data, chartData.indexOf(data)) }}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <>
            <AreaChart data={chartData} margin={chartMargin}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />}
              <XAxis
                dataKey="name"
                stroke={theme.colors.textMuted || theme.colors.text}
                tick={{ fill: theme.colors.textMuted || theme.colors.text, fontSize: "12px" }}
                angle={chartData.length > 5 ? -45 : 0}
                textAnchor={chartData.length > 5 ? "end" : "middle"}
                height={chartData.length > 5 ? 60 : 30}
              />
              <YAxis
                width={40}
                stroke={theme.colors.textMuted || theme.colors.text}
                tick={{ fill: theme.colors.textMuted || theme.colors.text, fontSize: "12px" }}
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
              {enableZoom && (
                <Brush
                  dataKey="name"
                  height={30}
                  stroke={theme.colors.border}
                  fill={theme.colors.surface}
                  onChange={handleBrushChange}
                  startIndex={brushStartIndex}
                  endIndex={brushEndIndex}
                />
              )}
              {enableComparison && comparisonData && (
                <>
                  {dataKeys.map((key, index) => (
                    <Area
                      key={`comparison-${key}`}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.3}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  ))}
                </>
              )}
            </AreaChart>
            {showLegend && <SimpleLegend dataKeys={dataKeys} colors={colors} />}
          </>
        );

      case "bar":
        return (
          <>
            <BarChart data={chartData} margin={chartMargin}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />}
              <XAxis
                dataKey="name"
                stroke={theme.colors.textMuted || theme.colors.text}
                tick={{ fill: theme.colors.textMuted || theme.colors.text, fontSize: "12px" }}
                angle={chartData.length > 5 ? -45 : 0}
                textAnchor={chartData.length > 5 ? "end" : "middle"}
                height={chartData.length > 5 ? 60 : 30}
              />
              <YAxis
                width={40}
                stroke={theme.colors.textMuted || theme.colors.text}
                tick={{ fill: theme.colors.textMuted || theme.colors.text, fontSize: "12px" }}
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
              {enableZoom && (
                <Brush
                  dataKey="name"
                  height={30}
                  stroke={theme.colors.border}
                  fill={theme.colors.surface}
                  onChange={handleBrushChange}
                  startIndex={brushStartIndex}
                  endIndex={brushEndIndex}
                />
              )}
              {enableComparison && comparisonData && (
                <>
                  {dataKeys.map((key, index) => (
                    <Bar
                      key={`comparison-${key}`}
                      dataKey={key}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.5}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </>
              )}
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

      case "scatter":
        // Scatter plot - korrelációk vizualizálásához
        // Az adatoknak x és y értékeket kell tartalmazniuk
        return (
          <>
            <ScatterChart data={chartData} margin={chartMargin}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />}
              <XAxis
                type="number"
                dataKey="x"
                name="X"
                stroke={theme.colors.textMuted || theme.colors.text}
                tick={{ fill: theme.colors.textMuted || theme.colors.text, fontSize: "12px" }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Y"
                stroke={theme.colors.textMuted || theme.colors.text}
                tick={{ fill: theme.colors.textMuted || theme.colors.text, fontSize: "12px" }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              {dataKeys.map((key, index) => (
                <Scatter
                  key={key}
                  name={key}
                  data={chartData}
                  fill={colors[index % colors.length]}
                  onClick={handleClick}
                />
              ))}
            </ScatterChart>
            {showLegend && <SimpleLegend dataKeys={dataKeys} colors={colors} />}
          </>
        );

      case "heatmap":
        // Heatmap - naptár nézet vagy korrelációs mátrix
        // Az adatoknak x, y és value értékeket kell tartalmazniuk
        const heatmapData = chartData.map((d, index) => ({
          ...d,
          x: d.x ?? index,
          y: d.y ?? 0,
          value: d.value ?? 0,
        }));

        // Színkódolás az értékek alapján
        const getHeatmapColor = (value: number, min: number, max: number) => {
          if (max === min) return colors[0];
          const ratio = (value - min) / (max - min);
          const colorIndex = Math.floor(ratio * (colors.length - 1));
          return colors[colorIndex] || colors[0];
        };

        const values = heatmapData.map(d => d.value ?? 0);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // Grid layout számítása
        const uniqueX = [...new Set(heatmapData.map(d => d.x))].sort((a, b) => (a as number) - (b as number));
        const uniqueY = [...new Set(heatmapData.map(d => d.y))].sort((a, b) => (a as number) - (b as number));
        const cellSize = Math.min(30, Math.floor((chartHeight - 60) / Math.max(uniqueY.length, 1)));

        return (
          <>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${uniqueX.length}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${uniqueY.length}, ${cellSize}px)`,
                  gap: "2px",
                  position: "relative",
                }}
              >
                {heatmapData.map((d, index) => {
                  const xIndex = uniqueX.indexOf(d.x);
                  const yIndex = uniqueY.indexOf(d.y);
                  const color = getHeatmapColor(d.value ?? 0, minValue, maxValue);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleClick(d, index)}
                      onMouseEnter={() => {
                        requestAnimationFrame(() => {
                          setHoveredIndex(index);
                        });
                      }}
                      onMouseLeave={() => {
                        requestAnimationFrame(() => {
                          setHoveredIndex(null);
                        });
                      }}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        backgroundColor: hoveredIndex === index ? color : `${color}CC`,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        color: theme.colors.text,
                        gridColumn: xIndex + 1,
                        gridRow: yIndex + 1,
                        opacity: hoveredIndex === index ? 1 : hoveredIndex !== null ? 0.6 : 0.9,
                      }}
                      title={`${d.name || `X: ${d.x}, Y: ${d.y}`}: ${d.value?.toLocaleString() || 0}`}
                    >
                      {cellSize > 20 && (d.value ?? 0) > 0 && (
                        <span style={{ fontSize: "9px", fontWeight: 600 }}>
                          {typeof d.value === "number" && d.value > 1000
                            ? `${(d.value / 1000).toFixed(1)}k`
                            : d.value?.toFixed(0)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {showLegend && (
              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: theme.colors.textMuted }}>Min:</span>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: colors[0],
                    borderRadius: "4px",
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
                <span style={{ fontSize: "11px", color: theme.colors.textMuted }}>Max:</span>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: colors[colors.length - 1],
                    borderRadius: "4px",
                    border: `1px solid ${theme.colors.border}`,
                  }}
                />
              </div>
            )}
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
      <div 
        style={{ 
          position: "absolute", 
          top: "8px", 
          right: "8px", 
          zIndex: 1000, 
          display: "flex", 
          gap: "8px",
          pointerEvents: "auto",
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {enableComparison && (
          <button
            onClick={() => {
              if (comparisonData) {
                setComparisonData(null);
              } else {
                // Összehasonlításhoz másolatot készítünk az adatokról
                setComparisonData([...data]);
              }
            }}
            style={{
              ...themeStyles.buttonSecondary,
              padding: "6px 12px",
              fontSize: "12px",
            }}
            title={comparisonData ? "Összehasonlítás kikapcsolása" : "Összehasonlítás bekapcsolása"}
          >
            {comparisonData ? "📊 Összehasonlítás" : "📈 Összehasonlítás"}
          </button>
        )}
        <button
          data-export-button="true"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("[InteractiveChart] Export button clicked", { type, hasOnExport: !!onExport });
            
            if (onExport) {
              console.log("[InteractiveChart] Calling onExport callback");
              onExport();
              return;
            }
            
            // Default export implementation
            console.log("[InteractiveChart] Starting default export", { 
              chartContainerRef: !!chartContainerRef.current,
              containerHasSVG: chartContainerRef.current?.querySelector("svg") !== null,
            });
            
            try {
              // Keresünk SVG elemet a container-ben vagy a document-ben
              let svgElement: SVGElement | null = null;
              
              if (chartContainerRef.current) {
                svgElement = chartContainerRef.current.querySelector("svg");
                console.log("[InteractiveChart] SVG found in container:", !!svgElement);
              }
              
              // Ha nem találjuk a container-ben, próbáljuk meg a document-ben keresni
              if (!svgElement) {
                const allSvgs = document.querySelectorAll("svg");
                console.log("[InteractiveChart] Searching in document, found SVGs:", allSvgs.length);
                
                // Keresünk egy SVG-t, ami a chart container közelében van
                for (const svg of Array.from(allSvgs)) {
                  if (chartContainerRef.current && chartContainerRef.current.contains(svg)) {
                    svgElement = svg;
                    console.log("[InteractiveChart] SVG found in container (second check)");
                    break;
                  }
                }
                // Ha még mindig nincs, az utolsó SVG-t használjuk (valószínűleg a chart)
                if (!svgElement && allSvgs.length > 0) {
                  svgElement = allSvgs[allSvgs.length - 1] as SVGElement;
                  console.log("[InteractiveChart] Using last SVG from document");
                }
              }
              
              if (!svgElement) {
                console.error("[InteractiveChart] Export error: SVG element not found");
                return;
              }
              
              console.log("[InteractiveChart] SVG element found, serializing...");
              const serializer = new XMLSerializer();
              let source = serializer.serializeToString(svgElement);
              if (!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) {
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
              }
              const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
              const link = document.createElement("a");
              link.href = dataUrl;
              const dateStr = new Date().toISOString().split("T")[0];
              
              // Fájlnév normalizálása: ékezetes betűk eltávolítása, speciális karakterek eltávolítása, szóközök és kötőjelek aláhúzásra cserélése
              const normalizeFileName = (name: string): string => {
                // Ékezetes betűk lecserélése
                const normalized = name
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "") // Diakritikus jelek eltávolítása
                  .replace(/[^\w\s-]/g, "") // Csak alfanumerikus, szóköz és kötőjel
                  .replace(/\s+/g, "_") // Szóközök aláhúzásra
                  .replace(/-+/g, "_") // Kötőjelek aláhúzásra
                  .replace(/_+/g, "_") // Többszörös aláhúzások egyesítése
                  .replace(/^_+|_+$/g, "") // Aláhúzások eltávolítása elejéről és végéről
                  .toLowerCase();
                return normalized;
              };
              
              const fileName = exportFileName 
                ? `${normalizeFileName(exportFileName)}_${dateStr}.svg`
                : `chart_${type}_${dateStr}.svg`;
              link.download = fileName;
              document.body.appendChild(link);
              console.log("[InteractiveChart] Triggering download:", fileName);
              link.click();
              setTimeout(() => {
                document.body.removeChild(link);
                console.log("[InteractiveChart] Export completed");
                showToast(
                  `${t("settings.exportSuccess") || "Chart exported successfully"}: ${fileName}`,
                  "success"
                );
              }, 100);
            } catch (error) {
              console.error("[InteractiveChart] Export error:", error);
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            ...themeStyles.buttonSecondary,
            padding: "6px 12px",
            fontSize: "12px",
            cursor: "pointer",
            pointerEvents: "auto",
            zIndex: 1000,
            position: "relative",
          }}
        >
          📥 Export
        </button>
      </div>
      <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }}>
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

      {/* Részletes nézet modal */}
      <AnimatePresence>
        {showDetailModal && selectedDataPoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              backdropFilter: "blur(5px)",
            }}
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 24 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: "16px",
                padding: "24px",
                maxWidth: "600px",
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
                boxShadow: themeStyles.card.boxShadow,
                border: `1px solid ${theme.colors.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, color: theme.colors.text, fontSize: "20px", fontWeight: "700" }}>
                  Részletes adatok
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: theme.colors.text,
                    padding: "0",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ color: theme.colors.text }}>
                <p style={{ margin: "0 0 12px 0", fontWeight: "600", fontSize: "16px" }}>
                  {selectedDataPoint.data.name}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {dataKeys.map((key, index) => {
                    const value = selectedDataPoint.data[key];
                    if (value === undefined) return null;
                    return (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px",
                          backgroundColor: theme.colors.surfaceHover,
                          borderRadius: "8px",
                        }}
                      >
                        <span style={{ color: theme.colors.textMuted || theme.colors.text }}>
                          {key}:
                        </span>
                        <span style={{ color: colors[index % colors.length], fontWeight: "600" }}>
                          {typeof value === "number"
                            ? `${value.toLocaleString(settings.language === "hu" ? "hu-HU" : "en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })} ${settings.currency === "HUF" ? "Ft" : settings.currency}`
                            : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

