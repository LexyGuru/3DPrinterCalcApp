import React, { useState, useEffect, useMemo } from "react";
import type { Filament, Settings, PriceHistory, FilamentPriceHistory } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { loadPriceHistory, getFilamentPriceHistory, calculatePriceStats } from "../utils/priceHistory";
import { convertCurrency } from "../utils/currency";

const LANGUAGE_LOCALES: Record<string, string> = {
  hu: "hu-HU",
  de: "de-DE",
  fr: "fr-FR",
  it: "it-IT",
  es: "es-ES",
  pl: "pl-PL",
  cs: "cs-CZ",
  sk: "sk-SK",
  zh: "zh-CN",
  "pt-BR": "pt-BR",
  uk: "uk-UA",
  ru: "ru-RU",
  en: "en-US",
};

interface Props {
  filaments: Filament[];
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const PriceTrends: React.FC<Props> = ({ filaments, settings, theme, themeStyles }) => {
  const t = useTranslation(settings.language);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [selectedFilament, setSelectedFilament] = useState<Filament | null>(null);
  const [filamentPriceHistory, setFilamentPriceHistory] = useState<FilamentPriceHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await loadPriceHistory();
        setPriceHistory(history);
      } catch (error) {
        console.error("Hiba az ár előzmények betöltésekor:", error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    const loadFilamentHistory = async () => {
      if (!selectedFilament) {
        setFilamentPriceHistory(null);
        return;
      }

      try {
        const history = await getFilamentPriceHistory(
          selectedFilament.brand,
          selectedFilament.type,
          selectedFilament.color
        );
        const stats = calculatePriceStats(history);
        
        setFilamentPriceHistory({
          brand: selectedFilament.brand,
          type: selectedFilament.type,
          color: selectedFilament.color,
          history,
          currentPrice: selectedFilament.pricePerKg,
          ...stats,
        });
      } catch (error) {
        console.error("Hiba a filament ár előzmények betöltésekor:", error);
      }
    };

    loadFilamentHistory();
  }, [selectedFilament]);

  // Egyedi filamentek listája (brand + type + color kombinációk)
  const uniqueFilaments = useMemo(() => {
    const seen = new Set<string>();
    return filaments.filter(f => {
      const key = `${f.brand}|${f.type}|${f.color || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [filaments]);

  // Ár előzmények filament szerint csoportosítva
  const historyByFilament = useMemo(() => {
    const grouped: Record<string, PriceHistory[]> = {};
    priceHistory.forEach(entry => {
      const key = `${entry.filamentBrand}|${entry.filamentType}|${entry.filamentColor || ""}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });
    return grouped;
  }, [priceHistory]);

  // Grafikon adatok előkészítése
  const chartData = useMemo(() => {
    if (!filamentPriceHistory || filamentPriceHistory.history.length === 0) {
      return null;
    }

    // Utolsó 20 bejegyzés (vagy kevesebb, ha nincs ennyi)
    const recentHistory = filamentPriceHistory.history.slice(0, 20).reverse();
    
    return {
      labels: recentHistory.map((entry) => {
        const date = new Date(entry.date);
        const locale = LANGUAGE_LOCALES[settings.language] ?? "en-US";
        return date.toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
        });
      }),
      prices: recentHistory.map(entry => entry.newPrice),
      dates: recentHistory.map(entry => entry.date),
    };
  }, [filamentPriceHistory, settings.language]);

  // Grafikon rajzolása SVG-vel
  const renderChart = () => {
    if (!chartData || chartData.prices.length === 0) {
      return (
        <div style={{
          padding: "40px",
          textAlign: "center",
          color: theme.colors.textSecondary,
        }}>
          {t("priceTrends.noData")}
        </div>
      );
    }

    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const minPrice = Math.min(...chartData.prices, filamentPriceHistory!.currentPrice);
    const maxPrice = Math.max(...chartData.prices, filamentPriceHistory!.currentPrice);
    const priceRange = maxPrice - minPrice || 1;

    // Y tengely skálázás
    const scaleY = (price: number) => {
      return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };

    // X tengely pozíciók
    const stepX = chartWidth / (chartData.prices.length - 1 || 1);

    // Pontok generálása
    const points = chartData.prices.map((price, idx) => ({
      x: padding.left + idx * stepX,
      y: padding.top + scaleY(price),
      price,
    }));

    // Vonal path generálása
    const pathData = points.map((point, idx) => 
      `${idx === 0 ? "M" : "L"} ${point.x} ${point.y}`
    ).join(" ");

    return (
      <div style={{ overflowX: "auto" }}>
        <svg width={width} height={height} style={{ display: "block" }}>
          {/* Háttér */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            fill={theme.colors.surface}
            stroke={theme.colors.border}
            strokeWidth="1"
          />

          {/* Grid vonalak */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * (1 - ratio);
            const price = minPrice + priceRange * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke={theme.colors.border}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.3"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill={theme.colors.textSecondary}
                >
                  {price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Ár vonal */}
          <path
            d={pathData}
            fill="none"
            stroke={theme.colors.primary}
            strokeWidth="2"
          />

          {/* Pontok */}
          {points.map((point, idx) => (
            <circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={theme.colors.primary}
              stroke={theme.colors.background}
              strokeWidth="2"
            />
          ))}

          {/* Jelenlegi ár vonal */}
          {filamentPriceHistory && (
            <line
              x1={padding.left}
              y1={padding.top + scaleY(filamentPriceHistory.currentPrice)}
              x2={padding.left + chartWidth}
              y2={padding.top + scaleY(filamentPriceHistory.currentPrice)}
              stroke={theme.colors.success}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.7"
            />
          )}

          {/* X tengely címkék */}
          {chartData.labels.map((label, idx) => {
            const x = padding.left + idx * stepX;
            return (
              <text
                key={idx}
                x={x}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="10"
                fill={theme.colors.textSecondary}
                transform={`rotate(-45 ${x} ${height - padding.bottom + 20})`}
              >
                {label}
              </text>
            );
          })}

          {/* Tooltip (hover esetén) */}
          <text
            x={width / 2}
            y={padding.top - 5}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill={theme.colors.text}
          >
            {selectedFilament && `${selectedFilament.brand} ${selectedFilament.type}${selectedFilament.color ? ` - ${selectedFilament.color}` : ""}`}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <h2 style={{ 
        ...themeStyles.heading, 
        marginBottom: "24px",
        color: theme.colors.text 
      }}>
        📈 {t("priceTrends.title")}
      </h2>

      {/* Filament kiválasztó */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ 
          display: "block", 
          marginBottom: "8px", 
          fontWeight: "600",
          fontSize: "14px",
          color: theme.colors.text 
        }}>
          {t("priceTrends.selectFilament")}
        </label>
        <select
          value={selectedFilament ? `${selectedFilament.brand}|${selectedFilament.type}|${selectedFilament.color || ""}` : ""}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              setSelectedFilament(null);
              return;
            }
            const [brand, type, color] = value.split("|");
            const filament = filaments.find(
              f => f.brand === brand && f.type === type && (f.color || "") === color
            );
            setSelectedFilament(filament || null);
          }}
          onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.inputBorder;
            e.target.style.boxShadow = "none";
          }}
          style={{ ...themeStyles.select, width: "100%", maxWidth: "500px", boxSizing: "border-box" }}
        >
          <option value="">{t("priceTrends.selectFilamentPlaceholder")}</option>
          {uniqueFilaments.map((filament, idx) => {
            const key = `${filament.brand}|${filament.type}|${filament.color || ""}`;
            const hasHistory = historyByFilament[key] && historyByFilament[key].length > 0;
            return (
              <option key={idx} value={key}>
                {filament.brand} {filament.type}{filament.color ? ` - ${filament.color}` : ""}
                {hasHistory ? ` (${historyByFilament[key].length} ${t("priceTrends.historyEntries")})` : ""}
              </option>
            );
          })}
        </select>
      </div>

      {loading ? (
        <div style={{
          padding: "40px",
          textAlign: "center",
          color: theme.colors.textSecondary,
        }}>
          {t("priceTrends.loading")}...
        </div>
      ) : selectedFilament && filamentPriceHistory ? (
        <div>
          {/* Statisztikák */}
          <div style={{
            ...themeStyles.card,
            padding: "20px",
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}>
            <div>
              <div style={{ fontSize: "12px", color: theme.colors.textSecondary, marginBottom: "4px" }}>
                {t("priceTrends.currentPrice")}
              </div>
              <div style={{ fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
                {convertCurrency(filamentPriceHistory.currentPrice, settings.currency).toFixed(2)} {settings.currency}/kg
              </div>
            </div>
            {filamentPriceHistory.averagePrice !== undefined && (
              <div>
                <div style={{ fontSize: "12px", color: theme.colors.textSecondary, marginBottom: "4px" }}>
                  {t("priceTrends.averagePrice")}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
                  {convertCurrency(filamentPriceHistory.averagePrice, settings.currency).toFixed(2)} {settings.currency}/kg
                </div>
              </div>
            )}
            {filamentPriceHistory.minPrice !== undefined && (
              <div>
                <div style={{ fontSize: "12px", color: theme.colors.textSecondary, marginBottom: "4px" }}>
                  {t("priceTrends.minPrice")}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "600", color: theme.colors.success }}>
                  {convertCurrency(filamentPriceHistory.minPrice, settings.currency).toFixed(2)} {settings.currency}/kg
                </div>
              </div>
            )}
            {filamentPriceHistory.maxPrice !== undefined && (
              <div>
                <div style={{ fontSize: "12px", color: theme.colors.textSecondary, marginBottom: "4px" }}>
                  {t("priceTrends.maxPrice")}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "600", color: theme.colors.danger }}>
                  {convertCurrency(filamentPriceHistory.maxPrice, settings.currency).toFixed(2)} {settings.currency}/kg
                </div>
              </div>
            )}
            {filamentPriceHistory.priceTrend && (
              <div>
                <div style={{ fontSize: "12px", color: theme.colors.textSecondary, marginBottom: "4px" }}>
                  {t("priceTrends.trend")}
                </div>
                <div style={{ fontSize: "20px", fontWeight: "600", color: 
                  filamentPriceHistory.priceTrend === "increasing" ? theme.colors.danger :
                  filamentPriceHistory.priceTrend === "decreasing" ? theme.colors.success :
                  theme.colors.textSecondary
                }}>
                  {filamentPriceHistory.priceTrend === "increasing" ? "📈" :
                   filamentPriceHistory.priceTrend === "decreasing" ? "📉" : "➡️"} {t(`priceTrends.trend.${filamentPriceHistory.priceTrend}`)}
                </div>
              </div>
            )}
          </div>

          {/* Grafikon */}
          <div style={{
            ...themeStyles.card,
            padding: "20px",
            marginBottom: "24px",
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: "16px", 
              fontSize: "18px", 
              fontWeight: "600",
              color: theme.colors.text 
            }}>
              {t("priceTrends.chartTitle")}
            </h3>
            {renderChart()}
          </div>

          {/* Ár előzmények táblázat */}
          {filamentPriceHistory.history.length > 0 && (
            <div style={{
              ...themeStyles.card,
              padding: "20px",
            }}>
              <h3 style={{ 
                marginTop: 0, 
                marginBottom: "16px", 
                fontSize: "18px", 
                fontWeight: "600",
                color: theme.colors.text 
              }}>
                {t("priceTrends.historyTable")}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${theme.colors.border}` }}>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: theme.colors.text }}>
                        {t("priceTrends.table.date")}
                      </th>
                      <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: theme.colors.text }}>
                        {t("priceTrends.table.oldPrice")}
                      </th>
                      <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: theme.colors.text }}>
                        {t("priceTrends.table.newPrice")}
                      </th>
                      <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: theme.colors.text }}>
                        {t("priceTrends.table.change")}
                      </th>
                      <th style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: theme.colors.text }}>
                        {t("priceTrends.table.changePercent")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filamentPriceHistory.history.map((entry) => {
                      const isIncrease = entry.priceChange > 0;
                      const changeColor = isIncrease ? theme.colors.danger : theme.colors.success;
                      return (
                        <tr 
                          key={entry.id}
                          style={{ 
                            borderBottom: `1px solid ${theme.colors.border}`,
                            backgroundColor: theme.colors.surface,
                          }}
                        >
                          <td style={{ padding: "12px", color: theme.colors.text }}>
                            {new Date(entry.date).toLocaleDateString(
                              LANGUAGE_LOCALES[settings.language] ?? "en-US",
                              { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                            )}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: theme.colors.text }}>
                            {convertCurrency(entry.oldPrice, settings.currency).toFixed(2)} {settings.currency}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: theme.colors.text, fontWeight: "600" }}>
                            {convertCurrency(entry.newPrice, settings.currency).toFixed(2)} {settings.currency}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: changeColor, fontWeight: "600" }}>
                            {isIncrease ? "+" : ""}{convertCurrency(entry.priceChange, settings.currency).toFixed(2)} {settings.currency}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: changeColor, fontWeight: "600" }}>
                            {isIncrease ? "+" : ""}{entry.priceChangePercent.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          ...themeStyles.card,
          padding: "40px",
          textAlign: "center",
          color: theme.colors.textSecondary,
        }}>
          {t("priceTrends.selectFilamentToView")}
        </div>
      )}
    </div>
  );
};

