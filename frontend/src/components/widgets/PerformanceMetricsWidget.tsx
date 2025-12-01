import React, { useState, useEffect, useCallback } from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";
import { getPerformanceMetrics } from "../../utils/systemInfo";
import { getCurrentMemoryUsage } from "../../utils/performance";

interface PerformanceMetricsWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
}

interface MemoryDataPoint {
  timestamp: number;
  value: number;
}

export const PerformanceMetricsWidget: React.FC<PerformanceMetricsWidgetProps> = ({
  widget,
  theme,
  settings,
}) => {
  const t = useTranslation(settings.language);
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [memoryData, setMemoryData] = useState<MemoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const fontSize = isSmall ? "11px" : isMedium ? "13px" : "14px";
  const titleFontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";

  const loadMetrics = useCallback(async () => {
    try {
      setError(null);
      const metrics = await getPerformanceMetrics();
      
      if (metrics) {
        setCpuUsage(parseFloat(metrics.cpu.usage_percent || "0"));
        setMemoryUsage(metrics.memory.used_percent || 0);
        
        // Memória trend hozzáadása
        const currentMemory = getCurrentMemoryUsage();
        if (currentMemory !== null) {
          const newDataPoint: MemoryDataPoint = {
            timestamp: Date.now(),
            value: currentMemory,
          };
          
          setMemoryData(prev => {
            const updated = [...prev, newDataPoint];
            // Maximum 20 pontot tárolunk
            return updated.slice(-20);
          });
        }
      }
    } catch (err) {
      console.error("❌ Hiba a performance metrikák betöltésekor:", err);
      setError(t("widget.performanceMetrics.error") || "Error loading metrics");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // Csak akkor töltse be, ha a widget látható
    if (!widget.visible) {
      return;
    }

    loadMetrics();
    
    // Frissítés 10 másodpercenként (lassítva a 5 másodpercről)
    const interval = setInterval(() => {
      if (widget.visible) {
        loadMetrics();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [loadMetrics, widget.visible]);

  const getUsageColor = (usage: number, threshold: number = 85): string => {
    if (usage > 95) return theme.colors.danger || "#dc3545";
    if (usage > threshold) return "#ffc107"; // warning color
    return theme.colors.success || "#28a745";
  };

  const getUsageBarWidth = (usage: number): string => {
    return `${Math.min(usage, 100)}%`;
  };

  const maxMemoryValue = memoryData.length > 0
    ? Math.max(...memoryData.map(d => d.value))
    : 0;

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
        border: `1px solid ${theme.colors.border}`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        gap: isSmall ? "8px" : "12px",
      }}>
        <div style={{
          fontSize: titleFontSize,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: isSmall ? "4px" : "8px",
        }}>
          {t("widget.title.performanceMetrics") || "Performance Metrics"}
        </div>

        {loading ? (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.colors.textMuted,
            fontSize: fontSize,
          }}>
            {t("common.loading") || "Loading..."}
          </div>
        ) : error ? (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.colors.danger || "#dc3545",
            fontSize: fontSize,
          }}>
            {error}
          </div>
        ) : (
          <div style={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: isSmall ? "10px" : "16px",
          }}>
            {/* CPU használat */}
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}>
                <div style={{
                  fontSize: fontSize,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}>
                  {t("widget.performanceMetrics.cpu") || "CPU Usage"}
                </div>
                <div style={{
                  fontSize: isSmall ? "10px" : fontSize,
                  fontWeight: "600",
                  color: getUsageColor(cpuUsage),
                }}>
                  {cpuUsage.toFixed(1)}%
                </div>
              </div>
              <div style={{
                width: "100%",
                height: isSmall ? "8px" : "12px",
                backgroundColor: `${theme.colors.border}40`,
                borderRadius: "6px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: getUsageBarWidth(cpuUsage),
                  height: "100%",
                  backgroundColor: getUsageColor(cpuUsage),
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>

            {/* Memória használat */}
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "6px",
              }}>
                <div style={{
                  fontSize: fontSize,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}>
                  {t("widget.performanceMetrics.memory") || "Memory Usage"}
                </div>
                <div style={{
                  fontSize: isSmall ? "10px" : fontSize,
                  fontWeight: "600",
                  color: getUsageColor(memoryUsage),
                }}>
                  {memoryUsage.toFixed(1)}%
                </div>
              </div>
              <div style={{
                width: "100%",
                height: isSmall ? "8px" : "12px",
                backgroundColor: `${theme.colors.border}40`,
                borderRadius: "6px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: getUsageBarWidth(memoryUsage),
                  height: "100%",
                  backgroundColor: getUsageColor(memoryUsage),
                  transition: "width 0.3s ease",
                }} />
              </div>
            </div>

            {/* Memória trend grafikon (ha van elég adat és nincs túl kicsi a widget) */}
            {!isSmall && memoryData.length > 1 && (
              <div>
                <div style={{
                  fontSize: fontSize,
                  fontWeight: "600",
                  color: theme.colors.text,
                  marginBottom: "6px",
                }}>
                  {t("widget.performanceMetrics.memoryTrend") || "Memory Trend"}
                </div>
                <div style={{
                  height: isMedium ? "60px" : "80px",
                  width: "100%",
                  position: "relative",
                  backgroundColor: `${theme.colors.border}20`,
                  borderRadius: "6px",
                  padding: "4px",
                }}>
                  <svg width="100%" height="100%" style={{ overflow: "visible" }}>
                    {memoryData.map((point, index) => {
                      if (index === 0) return null;
                      const prevPoint = memoryData[index - 1];
                      const width = 100 / (memoryData.length - 1);
                      const x1 = ((index - 1) * width) + "%";
                      const x2 = (index * width) + "%";
                      const y1 = `${100 - ((prevPoint.value / Math.max(maxMemoryValue, 1)) * 100)}%`;
                      const y2 = `${100 - ((point.value / Math.max(maxMemoryValue, 1)) * 100)}%`;
                      
                      return (
                        <line
                          key={index}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={getUsageColor((point.value / Math.max(maxMemoryValue, 1)) * 100)}
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>
                  <div style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "4px",
                    fontSize: isSmall ? "9px" : "10px",
                    color: theme.colors.textMuted,
                  }}>
                    {maxMemoryValue.toFixed(0)} MB
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

