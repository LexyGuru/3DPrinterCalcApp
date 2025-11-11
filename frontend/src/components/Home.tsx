import React, { useMemo, useRef, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type { Settings, Offer } from "../types";
import { defaultAnimationSettings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { convertCurrency, convertCurrencyFromTo } from "../utils/currency";
import { useToast } from "./Toast";
import { Tooltip } from "./Tooltip";
import { FadeIn, StaggerContainer, StaggerItem, HoverLift } from "../utils/animations";
import { jsPDF } from "jspdf";

type TrendPoint = {
  label: string;
  revenue: number;
  costs: number;
  profit: number;
  date: Date;
};

type BreakdownSlice = {
  label: string;
  value: number;
  color?: string;
};

const CHART_PALETTE = [
  "#6366F1",
  "#22D3EE",
  "#F97316",
  "#4ADE80",
  "#A855F7",
  "#F43F5E",
  "#14B8A6",
  "#FACC15",
];

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
  en: "en-US",
};

interface Props {
  settings: Settings;
  offers: Offer[];
  theme: Theme;
}

export const Home: React.FC<Props> = ({ settings, offers, theme }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [reportPeriod, setReportPeriod] = useState<"all" | "week" | "month" | "year">("all");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "week" | "month" | "year">("all");
  const locale = LANGUAGE_LOCALES[settings.language] ?? "en-US";
  const currencyLabel = settings.currency === "HUF" ? "Ft" : settings.currency;
  const trendChartRef = useRef<SVGSVGElement | null>(null);
  const filamentChartRef = useRef<SVGSVGElement | null>(null);
  const printerChartRef = useRef<SVGSVGElement | null>(null);
  const animationSettings = useMemo(
    () => ({
      ...defaultAnimationSettings,
      ...(settings.animationSettings ?? {}),
    }),
    [settings.animationSettings]
  );
  const interactionsEnabled = animationSettings.microInteractions;
  const microInteractionStyle = animationSettings.microInteractionStyle;
  const hoverScale = microInteractionStyle === "playful" ? 1.07 : microInteractionStyle === "expressive" ? 1.05 : 1.03;
  const hoverTranslate = microInteractionStyle === "playful" ? -4 : microInteractionStyle === "expressive" ? -3 : -2;
  const periodOptionLabels: Record<"all" | "week" | "month" | "year", string> = {
    all: t("home.period.option.all"),
    week: t("home.period.option.week"),
    month: t("home.period.option.month"),
    year: t("home.period.option.year"),
  };
  const statsLabels = {
    totalFilament: t("home.stats.totalFilament"),
    totalRevenue: t("home.stats.totalRevenue"),
    totalElectricity: t("home.stats.totalElectricity"),
    totalCost: t("home.stats.totalCost"),
    netProfit: t("home.stats.netProfit"),
    totalPrintTime: t("home.stats.totalPrintTime"),
  };
  const summaryLabels = {
    title: t("home.summary.title"),
    offerCount: t("home.summary.offerCount"),
    averageProfit: t("home.summary.averageProfit"),
    profitMargin: t("home.summary.profitMargin"),
  };
  
  // Helper függvény az időszak szűréséhez
  const filterOffersByPeriod = (offers: Offer[], period: "all" | "week" | "month" | "year") => {
    if (period === "all") return offers;
    
    const now = new Date();
    // Állítsuk be az időt 00:00:00-ra a pontos összehasonlításhoz
    now.setHours(0, 0, 0, 0);
    const cutoffDate = new Date();
    cutoffDate.setHours(0, 0, 0, 0);
    
    switch (period) {
      case "week":
        // Utolsó 7 nap (ma is beleszámít)
        cutoffDate.setDate(now.getDate() - 6);
        break;
      case "month":
        // Utolsó 30 nap (ma is beleszámít)
        cutoffDate.setDate(now.getDate() - 29);
        break;
      case "year":
        // Utolsó 365 nap (ma is beleszámít)
        cutoffDate.setDate(now.getDate() - 364);
        break;
    }
    
    return offers.filter(offer => {
      const offerDate = new Date(offer.date);
      // Állítsuk be az időt 00:00:00-ra a pontos összehasonlításhoz
      offerDate.setHours(0, 0, 0, 0);
      return offerDate >= cutoffDate && offerDate <= now;
    });
  };

  const getOfferFinancials = (offer: Offer) => {
    const profitPercentage = offer.profitPercentage ?? 30;
    const revenueInOfferCurrency = offer.costs.totalCost * (1 + profitPercentage / 100);
    const revenueEUR = convertCurrencyFromTo(revenueInOfferCurrency, offer.currency, "EUR");

    const filamentCostEUR = convertCurrencyFromTo(offer.costs.filamentCost, offer.currency, "EUR");
    const electricityCostEUR = convertCurrencyFromTo(offer.costs.electricityCost, offer.currency, "EUR");
    const dryingCostEUR = convertCurrencyFromTo(offer.costs.dryingCost, offer.currency, "EUR");
    const usageCostEUR = convertCurrencyFromTo(offer.costs.usageCost, offer.currency, "EUR");

    const totalCostsEUR = filamentCostEUR + electricityCostEUR + dryingCostEUR + usageCostEUR;
    const profitEUR = revenueEUR - totalCostsEUR;

    return {
      revenueEUR,
      costsEUR: totalCostsEUR,
      profitEUR,
      electricityCostEUR,
      dryingCostEUR,
    };
  };
  
  // Statisztikák számítása
  const calculateStatistics = (offersToCalculate: Offer[]) => {
    if (offersToCalculate.length === 0) {
      return {
        totalFilamentUsed: 0,
        totalRevenue: 0,
        totalElectricityConsumed: 0,
        totalCosts: 0,
        totalProfit: 0,
        totalPrintTime: 0,
        offerCount: 0
      };
    }

    let totalFilamentUsed = 0;
    let totalRevenue = 0;
    let totalElectricityKWh = 0;
    let totalCosts = 0;
    let totalPrintTime = 0;
    let totalProfit = 0;

    offersToCalculate.forEach(offer => {
      offer.filaments.forEach(f => {
        totalFilamentUsed += f.usedGrams;
      });

      const { revenueEUR, costsEUR, profitEUR, electricityCostEUR, dryingCostEUR } = getOfferFinancials(offer);
      totalRevenue += revenueEUR;
      totalCosts += costsEUR;
      totalProfit += profitEUR;

      const electricityCostHUF = electricityCostEUR * 400;
      const electricityPriceHUF = settings.electricityPrice || 70;
      if (electricityPriceHUF > 0) {
        const electricityKWh = electricityCostHUF / electricityPriceHUF;
        totalElectricityKWh += electricityKWh;
      }

      const dryingCostHUF = dryingCostEUR * 400;
      if (electricityPriceHUF > 0) {
        const dryingKWh = dryingCostHUF / electricityPriceHUF;
        totalElectricityKWh += dryingKWh;
      }

      totalPrintTime += offer.totalPrintTimeHours;
    });

    return {
      totalFilamentUsed,
      totalRevenue,
      totalElectricityConsumed: totalElectricityKWh,
      totalCosts,
      totalProfit,
      totalPrintTime,
      offerCount: offersToCalculate.length
    };
  };
  
  const statistics = useMemo(() => {
    return calculateStatistics(offers);
  }, [offers, settings.electricityPrice]);
  
  // Időszak szerinti statisztikák
  const weeklyStats = useMemo(() => {
    return calculateStatistics(filterOffersByPeriod(offers, "week"));
  }, [offers, settings.electricityPrice]);
  
  const monthlyStats = useMemo(() => {
    return calculateStatistics(filterOffersByPeriod(offers, "month"));
  }, [offers, settings.electricityPrice]);
  
  const yearlyStats = useMemo(() => {
    return calculateStatistics(filterOffersByPeriod(offers, "year"));
  }, [offers, settings.electricityPrice]);
  
  // Aktuális statisztikák a kiválasztott időszak alapján
  const currentStats = useMemo(() => {
    const filteredOffers = filterOffersByPeriod(offers, selectedPeriod);
    return calculateStatistics(filteredOffers);
  }, [offers, selectedPeriod, settings.electricityPrice]);
  
  const trendData = useMemo<TrendPoint[]>(() => {
    const filtered = filterOffersByPeriod(offers, selectedPeriod);
    if (filtered.length === 0) {
      return [];
    }

    const buckets = new Map<
      string,
      {
        label: string;
        dateKey: Date;
        revenue: number;
        costs: number;
        profit: number;
      }
    >();

    filtered.forEach(offer => {
      const offerDate = new Date(offer.date);
      let key: string;
      let label: string;
      const normalizedDate = new Date(offerDate);
      normalizedDate.setHours(0, 0, 0, 0);

      if (selectedPeriod === "year" || selectedPeriod === "all") {
        key = `${offerDate.getFullYear()}-${offerDate.getMonth()}`;
        label = offerDate.toLocaleDateString(locale, { year: "numeric", month: "short" });
        normalizedDate.setDate(1);
      } else if (selectedPeriod === "week") {
        key = offerDate.toISOString().slice(0, 10);
        label = offerDate.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
      } else {
        key = offerDate.toISOString().slice(0, 10);
        label = offerDate.toLocaleDateString(locale, { month: "short", day: "numeric" });
      }

      const { revenueEUR, costsEUR, profitEUR } = getOfferFinancials(offer);
      const existing = buckets.get(key);
      if (existing) {
        existing.revenue += revenueEUR;
        existing.costs += costsEUR;
        existing.profit += profitEUR;
      } else {
        buckets.set(key, {
          label,
          dateKey: normalizedDate,
          revenue: revenueEUR,
          costs: costsEUR,
          profit: profitEUR,
        });
      }
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.dateKey.getTime() - b.dateKey.getTime())
      .map(item => ({
        label: item.label,
        revenue: item.revenue,
        costs: item.costs,
        profit: item.profit,
        date: item.dateKey,
      }));
  }, [offers, selectedPeriod, locale]);

  const trendTotals = useMemo(
    () =>
      trendData.reduce(
        (acc, point) => {
          acc.revenue += point.revenue;
          acc.costs += point.costs;
          acc.profit += point.profit;
          return acc;
        },
        { revenue: 0, costs: 0, profit: 0 }
      ),
    [trendData]
  );

  const filamentBreakdown = useMemo<BreakdownSlice[]>(() => {
    const filtered = filterOffersByPeriod(offers, selectedPeriod);
    if (filtered.length === 0) {
      return [];
    }

    const map = new Map<string, number>();
    filtered.forEach(offer => {
      offer.filaments.forEach(f => {
        const label =
          f.type && f.brand
            ? `${f.brand} · ${f.type}`
            : f.type || f.brand || (settings.language === "hu" ? "Ismeretlen filament" : settings.language === "de" ? "Unbekanntes Filament" : "Unknown filament");
        map.set(label, (map.get(label) ?? 0) + f.usedGrams);
      });
    });

    return Array.from(map.entries())
      .map(([label, value], index) => ({
        label,
        value,
        color: CHART_PALETTE[index % CHART_PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [offers, selectedPeriod, settings.language]);

  const printerBreakdown = useMemo<BreakdownSlice[]>(() => {
    const filtered = filterOffersByPeriod(offers, selectedPeriod);
    if (filtered.length === 0) {
      return [];
    }

    const map = new Map<string, number>();
    filtered.forEach(offer => {
      const { revenueEUR } = getOfferFinancials(offer);
      map.set(offer.printerName, (map.get(offer.printerName) ?? 0) + revenueEUR);
    });

    return Array.from(map.entries())
      .map(([label, value], index) => ({
        label,
        value,
        color: CHART_PALETTE[index % CHART_PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [offers, selectedPeriod]);

  const totalFilamentByType = useMemo(
    () => filamentBreakdown.reduce((acc, slice) => acc + slice.value, 0),
    [filamentBreakdown]
  );

  const totalRevenueByPrinter = useMemo(
    () => printerBreakdown.reduce((acc, slice) => acc + slice.value, 0),
    [printerBreakdown]
  );

  const hasTrendData = trendData.some(point => point.revenue !== 0 || point.costs !== 0 || point.profit !== 0);
  const hasFilamentData = filamentBreakdown.length > 0 && totalFilamentByType > 0;
  const hasPrinterData = printerBreakdown.length > 0 && totalRevenueByPrinter > 0;
  const availableChartsCount = [hasTrendData, hasFilamentData, hasPrinterData].filter(Boolean).length;

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportChartAsSvg = (svg: SVGSVGElement | null, filename: string) => {
    if (!svg) {
      showToast(
        settings.language === "hu" ? "Nem található a grafikon" : settings.language === "de" ? "Diagram nicht gefunden" : "Chart not found",
        "error"
      );
      return;
    }
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    downloadDataUrl(dataUrl, filename);
    showToast(
      settings.language === "hu" ? "SVG exportálva" : settings.language === "de" ? "SVG exportiert" : "SVG exported",
      "success"
    );
  };

  const svgToPngDataUrl = (svg: SVGSVGElement, backgroundColor: string) =>
    new Promise<string>((resolve, reject) => {
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www.w3.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => {
        const rect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox?.baseVal;
        const width = rect.width || viewBox?.width || 640;
        const height = rect.height || viewBox?.height || 360;
        const canvas = document.createElement("canvas");
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.scale(ratio, ratio);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG image"));
      };
      image.src = url;
    });

  const exportChartAsPng = async (svg: SVGSVGElement | null, filename: string) => {
    if (!svg) {
      showToast(
        settings.language === "hu" ? "Nem található a grafikon" : settings.language === "de" ? "Diagram nicht gefunden" : "Chart not found",
        "error"
      );
      return;
    }
    try {
      const background = theme.colors.background?.includes("gradient") ? "#ffffff" : theme.colors.surface;
      const dataUrl = await svgToPngDataUrl(svg, background || "#ffffff");
      downloadDataUrl(dataUrl, filename);
      showToast(
        settings.language === "hu" ? "PNG exportálva" : settings.language === "de" ? "PNG exportiert" : "PNG exported",
        "success"
      );
    } catch (error) {
      console.error("PNG export error", error);
      showToast(
        settings.language === "hu" ? "PNG export hiba" : settings.language === "de" ? "Fehler beim PNG-Export" : "PNG export failed",
        "error"
      );
    }
  };

  const exportChartsToPDF = async () => {
    const charts: Array<{ ref: React.MutableRefObject<SVGSVGElement | null>; title: string; available: boolean }> = [
      {
        ref: trendChartRef,
        title: settings.language === "hu" ? "Pénzügyi trendek" : settings.language === "de" ? "Finanztrends" : "Financial trends",
        available: hasTrendData,
      },
      {
        ref: filamentChartRef,
        title: settings.language === "hu" ? "Filament megoszlás" : settings.language === "de" ? "Filamentverteilung" : "Filament breakdown",
        available: hasFilamentData,
      },
      {
        ref: printerChartRef,
        title: settings.language === "hu" ? "Bevétel nyomtatónként" : settings.language === "de" ? "Umsatz je Drucker" : "Revenue by printer",
        available: hasPrinterData,
      },
    ];

    const usableCharts = charts.filter(chart => chart.available && chart.ref.current);
    if (usableCharts.length === 0) {
      showToast(
        settings.language === "hu" ? "Nincs exportálható grafikon" : settings.language === "de" ? "Keine Diagramme zum Export" : "No charts to export",
        "error"
      );
      return;
    }

    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      for (let index = 0; index < usableCharts.length; index++) {
        const chart = usableCharts[index];
        const svg = chart.ref.current!;
        const background = theme.colors.background?.includes("gradient") ? "#ffffff" : theme.colors.surface;
        const dataUrl = await svgToPngDataUrl(svg, background || "#ffffff");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 48;
        const imageWidth = pageWidth - margin * 2;
        const imageHeight = imageWidth * 0.6;

        pdf.setFontSize(18);
        pdf.text(chart.title, pageWidth / 2, margin, { align: "center" });
        pdf.addImage(dataUrl, "PNG", margin, margin + 20, imageWidth, imageHeight, undefined, "FAST");

        if (index < usableCharts.length - 1) {
          pdf.addPage();
        }
      }

      pdf.save(`charts_${new Date().toISOString().split("T")[0]}.pdf`);
      showToast(
        settings.language === "hu" ? "PDF exportálva" : settings.language === "de" ? "PDF exportiert" : "PDF exported",
        "success"
      );
    } catch (error) {
      console.error("PDF export error", error);
      showToast(
        settings.language === "hu" ? "PDF export hiba" : settings.language === "de" ? "Fehler beim PDF-Export" : "PDF export failed",
        "error"
      );
    }
  };

  const exportTrendSvg = () => exportChartAsSvg(trendChartRef.current, `financial_trends_${new Date().toISOString().split("T")[0]}.svg`);
  const exportTrendPng = () => exportChartAsPng(trendChartRef.current, `financial_trends_${new Date().toISOString().split("T")[0]}.png`);
  const exportFilamentSvg = () => exportChartAsSvg(filamentChartRef.current, `filament_breakdown_${new Date().toISOString().split("T")[0]}.svg`);
  const exportFilamentPng = () => exportChartAsPng(filamentChartRef.current, `filament_breakdown_${new Date().toISOString().split("T")[0]}.png`);
  const exportPrinterSvg = () => exportChartAsSvg(printerChartRef.current, `printer_revenue_${new Date().toISOString().split("T")[0]}.svg`);
  const exportPrinterPng = () => exportChartAsPng(printerChartRef.current, `printer_revenue_${new Date().toISOString().split("T")[0]}.png`);

  const formatCurrency = (amount: number) => {
    return convertCurrency(amount, settings.currency);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const handleExportStatistics = async () => {
    try {
      const statsToExport = currentStats;
      console.log("📊 Statisztikák export indítása...", { format: exportFormat, statistics: statsToExport, period: selectedPeriod });
      
      let content: string;
      let fileName: string;
      let filters: Array<{ name: string; extensions: string[] }>;

      if (exportFormat === "json") {
        const exportData = {
          exportDate: new Date().toISOString(),
          period: selectedPeriod,
          statistics: {
            totalFilamentUsed: statsToExport.totalFilamentUsed,
            totalFilamentUsedKg: statsToExport.totalFilamentUsed / 1000,
            totalRevenue: statsToExport.totalRevenue,
            totalElectricityConsumed: statsToExport.totalElectricityConsumed,
            totalCosts: statsToExport.totalCosts,
            totalProfit: statsToExport.totalProfit,
            totalPrintTime: statsToExport.totalPrintTime,
            offerCount: statsToExport.offerCount,
            averageProfitPerOffer: statsToExport.offerCount > 0 ? statsToExport.totalProfit / statsToExport.offerCount : 0,
            profitMargin: statsToExport.totalRevenue > 0 ? (statsToExport.totalProfit / statsToExport.totalRevenue) * 100 : 0,
          },
          periodStats: {
            weekly: weeklyStats,
            monthly: monthlyStats,
            yearly: yearlyStats,
            all: statistics,
          },
          currency: settings.currency,
          offers: filterOffersByPeriod(offers, selectedPeriod).map(o => ({
            id: o.id,
            date: o.date,
            customerName: o.customerName,
            totalCost: o.costs.totalCost,
            profitPercentage: o.profitPercentage || 30,
            revenue: o.costs.totalCost * (1 + (o.profitPercentage || 30) / 100),
            currency: o.currency,
          })),
        };
        content = JSON.stringify(exportData, null, 2);
        fileName = `statistics_${new Date().toISOString().split("T")[0]}.json`;
        filters = [{ name: "JSON", extensions: ["json"] }];
      } else {
        // CSV formátum
        const csvRows: string[] = [];
        const categoryLabel = settings.language === "hu" ? "Kategória" : settings.language === "de" ? "Kategorie" : "Category";
        const valueLabel = settings.language === "hu" ? "Érték" : settings.language === "de" ? "Wert" : "Value";
        const unitLabel = settings.language === "hu" ? "Egység" : settings.language === "de" ? "Einheit" : "Unit";
        csvRows.push(`${categoryLabel},${valueLabel},${unitLabel}`);
        const filamentLabel = statsLabels.totalFilament;
        const revenueLabel = statsLabels.totalRevenue;
        const electricityLabel = statsLabels.totalElectricity;
        const costLabel = statsLabels.totalCost;
        const profitLabel = statsLabels.netProfit;
        const printTimeLabel = statsLabels.totalPrintTime;
        const offerCountLabel = summaryLabels.offerCount;
        const avgProfitLabel = summaryLabels.averageProfit;
        const profitMarginLabel = summaryLabels.profitMargin;
        const timeUnit = t("home.stats.unit.hours");
        
        csvRows.push(`${filamentLabel},${(statsToExport.totalFilamentUsed / 1000).toFixed(2)},kg`);
        csvRows.push(`${revenueLabel},${formatCurrency(statsToExport.totalRevenue).toFixed(2)},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`${electricityLabel},${statsToExport.totalElectricityConsumed.toFixed(2)},kWh`);
        csvRows.push(`${costLabel},${formatCurrency(statsToExport.totalCosts).toFixed(2)},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`${profitLabel},${formatCurrency(statsToExport.totalProfit).toFixed(2)},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`${printTimeLabel},${statsToExport.totalPrintTime.toFixed(1)},${timeUnit}`);
        csvRows.push(`${offerCountLabel},${statsToExport.offerCount},${settings.language === "hu" ? "db" : settings.language === "de" ? "Stk" : "pcs"}`);
        csvRows.push(`${avgProfitLabel},${statsToExport.offerCount > 0 ? formatCurrency(statsToExport.totalProfit / statsToExport.offerCount).toFixed(2) : "0.00"},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`${profitMarginLabel},${statsToExport.totalRevenue > 0 ? ((statsToExport.totalProfit / statsToExport.totalRevenue) * 100).toFixed(1) : "0.0"},%`);
        csvRows.push("");
        const offerDetailsLabel = settings.language === "hu" ? "Árajánlat részletek" : settings.language === "de" ? "Angebotsdetails" : "Offer details";
        csvRows.push(offerDetailsLabel);
        const idLabel = settings.language === "hu" ? "ID" : "ID";
        const dateLabel = settings.language === "hu" ? "Dátum" : settings.language === "de" ? "Datum" : "Date";
        const customerLabel = settings.language === "hu" ? "Ügyfél név" : settings.language === "de" ? "Kundenname" : "Customer name";
        const totalCostLabel = settings.language === "hu" ? "Összes költség" : settings.language === "de" ? "Gesamtkosten" : "Total cost";
        const profitPercentLabel = settings.language === "hu" ? "Profit százalék" : settings.language === "de" ? "Gewinnprozentsatz" : "Profit percentage";
        const revenueLabel2 = settings.language === "hu" ? "Bevétel" : settings.language === "de" ? "Einnahmen" : "Revenue";
        const currencyLabel = settings.language === "hu" ? "Pénznem" : settings.language === "de" ? "Währung" : "Currency";
        
        csvRows.push(`${idLabel},${dateLabel},${customerLabel},${totalCostLabel},${profitPercentLabel},${revenueLabel2},${currencyLabel}`);
        filterOffersByPeriod(offers, selectedPeriod).forEach(o => {
          const profitPct = o.profitPercentage || 30;
          const revenue = o.costs.totalCost * (1 + profitPct / 100);
          csvRows.push(`${o.id},${o.date},${o.customerName || ""},${o.costs.totalCost.toFixed(2)},${profitPct},${revenue.toFixed(2)},${o.currency || "EUR"}`);
        });
        csvRows.push("");
        const periodLabel = t("home.period.label").replace(/[:：]\s*$/, "");
        csvRows.push(`${periodLabel}: ${periodOptionLabels[selectedPeriod]}`);
        
        content = csvRows.join("\n");
        fileName = `statistics_${selectedPeriod}_${new Date().toISOString().split("T")[0]}.csv`;
        filters = [{ name: "CSV", extensions: ["csv"] }];
      }

      const filePath = await save({
        defaultPath: fileName,
        filters,
      });

      if (filePath) {
        console.log("💾 Statisztikák mentése...", { filePath, format: exportFormat });
        await writeTextFile(filePath, content);
        console.log("✅ Statisztikák export sikeres", { filePath, format: exportFormat });
        showToast(
          settings.language === "hu" ? "Statisztikák sikeresen exportálva" :
          settings.language === "de" ? "Statistiken erfolgreich exportiert" :
          "Statistics exported successfully",
          "success"
        );
      } else {
        console.log("ℹ️ Export megszakítva");
      }
    } catch (error) {
      console.error("❌ Statisztikák export hiba:", error);
      showToast(
        settings.language === "hu" ? "Hiba történt az export során" :
        settings.language === "de" ? "Fehler beim Export" :
        "Error exporting statistics",
        "error"
      );
    }
  };

  const generateReport = async () => {
    try {
      console.log("📊 Riport generálása...", { period: reportPeriod, statistics });
      
      const now = new Date();
      let periodStart: Date;
      let periodEnd: Date = now;
      
      switch (reportPeriod) {
        case "week":
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() - 7);
          break;
        case "month":
          periodStart = new Date(now);
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case "year":
          periodStart = new Date(now);
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
        default:
          periodStart = new Date(0); // Minden időszak
      }

      const filteredOffers = offers.filter(o => {
        const offerDate = new Date(o.date);
        return offerDate >= periodStart && offerDate <= periodEnd;
      });

      // Számítások a szűrt árajánlatokra
      let reportFilamentUsed = 0;
      let reportRevenue = 0;
      let reportCosts = 0;
      let reportProfit = 0;
      let reportPrintTime = 0;

      filteredOffers.forEach(offer => {
        offer.filaments.forEach(f => {
          reportFilamentUsed += f.usedGrams;
        });
        const profitPercentage = offer.profitPercentage !== undefined ? offer.profitPercentage : 30;
        const revenueInOfferCurrency = offer.costs.totalCost * (1 + profitPercentage / 100);
        const revenueInEUR = offer.currency === "HUF" ? revenueInOfferCurrency / 400 : 
                             offer.currency === "USD" ? revenueInOfferCurrency / 1.10 : 
                             revenueInOfferCurrency;
        reportRevenue += revenueInEUR;
        
        const filamentCostEUR = offer.currency === "HUF" ? offer.costs.filamentCost / 400 : 
                                offer.currency === "USD" ? offer.costs.filamentCost / 1.10 : 
                                offer.costs.filamentCost;
        const electricityCostEUR = offer.currency === "HUF" ? offer.costs.electricityCost / 400 : 
                                    offer.currency === "USD" ? offer.costs.electricityCost / 1.10 : 
                                    offer.costs.electricityCost;
        const dryingCostEUR = offer.currency === "HUF" ? offer.costs.dryingCost / 400 : 
                             offer.currency === "USD" ? offer.costs.dryingCost / 1.10 : 
                             offer.costs.dryingCost;
        const usageCostEUR = offer.currency === "HUF" ? offer.costs.usageCost / 400 : 
                            offer.currency === "USD" ? offer.costs.usageCost / 1.10 : 
                            offer.costs.usageCost;
        reportCosts += filamentCostEUR + electricityCostEUR + dryingCostEUR + usageCostEUR;
        reportPrintTime += offer.totalPrintTimeHours;
      });

      reportProfit = reportRevenue - reportCosts;

      const reportData = {
        reportDate: new Date().toISOString(),
        period: reportPeriod,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        summary: {
          offerCount: filteredOffers.length,
          totalFilamentUsed: reportFilamentUsed,
          totalFilamentUsedKg: reportFilamentUsed / 1000,
          totalRevenue: reportRevenue,
          totalCosts: reportCosts,
          totalProfit: reportProfit,
          totalPrintTime: reportPrintTime,
          averageProfitPerOffer: filteredOffers.length > 0 ? reportProfit / filteredOffers.length : 0,
          profitMargin: reportRevenue > 0 ? (reportProfit / reportRevenue) * 100 : 0,
        },
        currency: settings.currency,
        offers: filteredOffers.map(o => ({
          id: o.id,
          date: o.date,
          customerName: o.customerName,
          printerName: o.printerName,
          totalCost: o.costs.totalCost,
          profitPercentage: o.profitPercentage || 30,
          revenue: o.costs.totalCost * (1 + (o.profitPercentage || 30) / 100),
          currency: o.currency,
        })),
      };

      const content = JSON.stringify(reportData, null, 2);
      const periodLabel = reportPeriod === "week" ? "heti" : reportPeriod === "month" ? "havi" : reportPeriod === "year" ? "eves" : "osszes";
      const fileName = `report_${periodLabel}_${new Date().toISOString().split("T")[0]}.json`;

      const filePath = await save({
        defaultPath: fileName,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (filePath) {
        console.log("💾 Riport mentése...", { filePath, period: reportPeriod });
        await writeTextFile(filePath, content);
        console.log("✅ Riport generálás sikeres", { filePath, period: reportPeriod });
        showToast(
          settings.language === "hu" ? "Riport sikeresen generálva" :
          settings.language === "de" ? "Bericht erfolgreich generiert" :
          "Report generated successfully",
          "success"
        );
        setShowReportDialog(false);
      } else {
        console.log("ℹ️ Riport generálás megszakítva");
      }
    } catch (error) {
      console.error("❌ Riport generálás hiba:", error);
      showToast(
        settings.language === "hu" ? "Hiba történt a riport generálása során" :
        settings.language === "de" ? "Fehler beim Generieren des Berichts" :
        "Error generating report",
        "error"
      );
    }
  };

  const StatCard = ({ title, value, unit, icon, color, delay = 0 }: { 
    title: string; 
    value: string | number; 
    unit?: string; 
    icon: string;
    color: string;
    delay?: number;
  }) => {
    const isGradientBackground = theme.colors.background?.includes('gradient');
    const cardBg = isGradientBackground 
      ? "rgba(255, 255, 255, 0.98)" 
      : theme.colors.surface;
    
    return (
      <FadeIn delay={delay} duration={0.5}>
        <HoverLift intensity={microInteractionStyle} disabled={!interactionsEnabled}>
          <div style={{
            backgroundColor: cardBg,
            borderRadius: "20px",
            padding: "28px",
            boxShadow: isGradientBackground
              ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
              : `0 4px 16px ${theme.colors.shadow}`,
            border: `2px solid ${color}40`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            flex: "1",
            minWidth: "200px",
            position: "relative",
            overflow: "hidden",
            backdropFilter: isGradientBackground ? "blur(10px)" : "none",
          }}>
            {/* Szín accent sáv */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              backgroundColor: color,
              borderRadius: "20px 20px 0 0",
            }} />
            
            <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: `${color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                fontSize: "24px",
              }}>
                {icon}
              </div>
              <h3 style={{ 
                margin: 0, 
                fontSize: "13px", 
                color: isGradientBackground ? "#1a202c" : theme.colors.textSecondary, 
                fontWeight: "700",
                lineHeight: "1.4",
              }}>
                {title}
              </h3>
            </div>
            <div style={{ 
              fontSize: "32px", 
              fontWeight: "700", 
              color: color,
              lineHeight: "1.2",
              marginBottom: "4px",
            }}>
              {value}
            </div>
            {unit && (
              <div style={{ 
                fontSize: "14px", 
                color: isGradientBackground ? "#4a5568" : theme.colors.textMuted,
                fontWeight: "600",
              }}>
                {unit}
              </div>
            )}
          </div>
        </HoverLift>
      </FadeIn>
    );
  };

  const TrendChart = ({ data, theme, svgRef }: { data: TrendPoint[]; theme: Theme; svgRef: React.MutableRefObject<SVGSVGElement | null> }) => {
    const width = 720;
    const height = 320;
    const paddingX = 60;
    const paddingY = 50;
    const chartHeight = height - paddingY * 1.6;
    const bottom = height - paddingY;
    const left = paddingX;
    const maxValue = Math.max(
      0,
      ...data.map(point => Math.max(point.revenue, point.costs, point.profit))
    ) || 0;
    const safeMaxValue = maxValue > 0 ? maxValue : 1;
    const xStep = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;
    const getX = (index: number) => {
      if (data.length === 1) {
        return left + (width - paddingX * 2) / 2;
      }
      return left + index * xStep;
    };
    const getY = (value: number) => bottom - (value / safeMaxValue) * chartHeight;

    const lineProps: Array<{ key: keyof TrendPoint; color: string }> = [
      {
        key: "revenue",
        color: "#22D3EE",
      },
      {
        key: "costs",
        color: "#F97316",
      },
      {
        key: "profit",
        color: "#4ADE80",
      },
    ];

    const horizontalLines = 4;

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="trendBackground" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.background?.includes("gradient") ? "rgba(255,255,255,0.9)" : theme.colors.surface} />
            <stop offset="100%" stopColor={theme.colors.background?.includes("gradient") ? "rgba(255,255,255,0.6)" : theme.colors.surfaceHover} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#trendBackground)" rx={16} />
        {Array.from({ length: horizontalLines + 1 }).map((_, index) => {
          const y = bottom - (chartHeight / horizontalLines) * index;
          const valueLabel = ((safeMaxValue / horizontalLines) * index).toFixed(0);
          return (
            <g key={`grid-${index}`}>
              <line
                x1={left}
                y1={y}
                x2={width - paddingX / 2}
                y2={y}
                stroke={"rgba(148, 163, 184, 0.25)"}
                strokeDasharray="6 6"
              />
              <text
                x={left - 12}
                y={y + 4}
                fontSize={10}
                textAnchor="end"
                fill={theme.colors.textMuted}
              >
                {valueLabel}
              </text>
            </g>
          );
        })}
        <line
          x1={left}
          y1={bottom}
          x2={width - paddingX / 2}
          y2={bottom}
          stroke={theme.colors.textMuted}
          strokeWidth={1}
        />
        <line x1={left} y1={bottom - chartHeight} x2={left} y2={bottom} stroke={theme.colors.textMuted} strokeWidth={1} />

        {lineProps.map(line => {
          const path = data
            .map((point, index) => `${index === 0 ? "M" : "L"} ${getX(index)} ${getY(point[line.key] as number)}`)
            .join(" ");
          return (
            <g key={line.key}>
              <path d={path} fill="none" stroke={line.color} strokeWidth={2.5} strokeLinecap="round" />
              {data.map((point, index) => (
                <circle
                  key={`${line.key}-dot-${index}`}
                  cx={getX(index)}
                  cy={getY(point[line.key] as number)}
                  r={4}
                  fill={line.color}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          );
        })}

        {data.map((point, index) => (
          <g key={`label-${index}`}>
            <line
              x1={getX(index)}
              y1={bottom}
              x2={getX(index)}
              y2={bottom + 6}
              stroke={theme.colors.textMuted}
            />
            <text
              x={getX(index)}
              y={bottom + 20}
              fontSize={10}
              textAnchor="middle"
              fill={theme.colors.textMuted}
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const PieChart = ({ data, theme, svgRef, emptyLabel }: { data: BreakdownSlice[]; theme: Theme; svgRef: React.MutableRefObject<SVGSVGElement | null>; emptyLabel: string }) => {
    const width = 360;
    const height = 320;
    const radius = Math.min(width, height) / 2 - 16;
    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const total = data.reduce((acc, slice) => acc + slice.value, 0);

    let cumulativeAngle = -Math.PI / 2;

    const slices = total > 0
      ? data.map(slice => {
          const angle = (slice.value / total) * Math.PI * 2;
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + angle;
          cumulativeAngle = endAngle;

          const x1 = centerX + radius * Math.cos(startAngle);
          const y1 = centerY + radius * Math.sin(startAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);
          const largeArc = angle > Math.PI ? 1 : 0;

          return {
            path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`,
            color: slice.color ?? "#6366F1",
          };
        })
      : [];

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="pieBg" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor={theme.colors.background?.includes("gradient") ? "rgba(255,255,255,0.95)" : theme.colors.surface} />
            <stop offset="100%" stopColor={theme.colors.background?.includes("gradient") ? "rgba(255,255,255,0.7)" : theme.colors.surfaceHover} />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#pieBg)" rx={16} />
        {slices.map((slice, index) => (
          <path key={index} d={slice.path} fill={slice.color} stroke="#ffffff" strokeWidth={1.5} />
        ))}
        {total === 0 && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill={theme.colors.textMuted}
            fontSize={14}
          >
            {emptyLabel}
          </text>
        )}
      </svg>
    );
  };

  const BarChart = ({ data, theme, svgRef }: { data: BreakdownSlice[]; theme: Theme; svgRef: React.MutableRefObject<SVGSVGElement | null> }) => {
    const width = 640;
    const height = 320;
    const paddingX = 60;
    const paddingY = 50;
    const chartHeight = height - paddingY * 1.6;
    const bottom = height - paddingY;
    const maxValue = Math.max(0, ...data.map(slice => slice.value)) || 0;
    const safeMaxValue = maxValue > 0 ? maxValue : 1;
    const barAreaWidth = width - paddingX * 2;
    const barWidth = data.length > 0 ? barAreaWidth / data.length * 0.6 : 0;
    const gap = data.length > 0 ? (barAreaWidth - barWidth * data.length) / (data.length + 1) : 0;

    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="barBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={theme.colors.background?.includes("gradient") ? "rgba(255,255,255,0.95)" : theme.colors.surface} />
            <stop offset="100%" stopColor={theme.colors.background?.includes("gradient") ? "rgba(255,255,255,0.7)" : theme.colors.surfaceHover} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#barBg)" rx={16} />
        <line x1={paddingX} y1={bottom} x2={width - paddingX / 2} y2={bottom} stroke={theme.colors.textMuted} strokeWidth={1} />
        <line x1={paddingX} y1={bottom - chartHeight} x2={paddingX} y2={bottom} stroke={theme.colors.textMuted} strokeWidth={1} />

        {Array.from({ length: 4 + 1 }).map((_, index) => {
          const y = bottom - (chartHeight / 4) * index;
          const valueLabel = ((safeMaxValue / 4) * index).toFixed(0);
          return (
            <g key={`bar-grid-${index}`}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX / 2}
                y2={y}
                stroke={"rgba(148, 163, 184, 0.25)"}
                strokeDasharray="6 6"
              />
              <text x={paddingX - 12} y={y + 4} fontSize={10} textAnchor="end" fill={theme.colors.textMuted}>
                {valueLabel}
              </text>
            </g>
          );
        })}

        {data.map((slice, index) => {
          const barHeight = (slice.value / safeMaxValue) * chartHeight;
          const x = paddingX + gap + index * (barWidth + gap);
          const y = bottom - barHeight;
          return (
            <g key={slice.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={slice.color ?? CHART_PALETTE[index % CHART_PALETTE.length]}
                rx={8}
              />
              <text
                x={x + barWidth / 2}
                y={bottom + 18}
                fontSize={10}
                textAnchor="middle"
                fill={theme.colors.textMuted}
              >
                {slice.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div>
      <FadeIn delay={0.1}>
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: "36px", 
              fontWeight: "700",
              color: theme.colors.background?.includes('gradient')
                ? "#ffffff"
                : theme.colors.text,
              textShadow: theme.colors.background?.includes('gradient')
                ? "0 2px 8px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)"
                : "none",
            }}>
              {t("home.title")}
            </h2>
            <p style={{ 
              marginTop: "8px", 
              color: theme.colors.background?.includes('gradient')
                ? "#ffffff"
                : theme.colors.textSecondary,
              fontSize: "16px",
              textShadow: theme.colors.background?.includes('gradient')
                ? "0 1px 4px rgba(0,0,0,0.4)"
                : "none",
            }}>
              {t("home.subtitle")}
            </p>
          </div>
        {statistics.offerCount > 0 && (
          <div style={{ 
            display: "flex", 
            gap: "16px", 
            alignItems: "center", 
            flexWrap: "wrap",
            padding: "16px 20px",
            marginBottom: "24px",
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "12px",
            boxShadow: `0 2px 8px ${theme.colors.shadow}`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            {/* Időszak választó */}
            <div style={{ 
              display: "flex", 
              gap: "12px", 
              alignItems: "center", 
              flexWrap: "wrap",
              flex: "1",
              minWidth: "200px"
            }}>
              <label style={{ 
                fontSize: "14px", 
                fontWeight: "700",
                color: theme.colors.text,
                whiteSpace: "nowrap",
              }}>
                {t("home.period.label")}
              </label>
              <div style={{ 
                display: "flex", 
                gap: "6px", 
                backgroundColor: theme.colors.surfaceHover,
                borderRadius: "10px", 
                padding: "6px", 
                border: `1px solid ${theme.colors.border}`,
                boxShadow: `inset 0 1px 3px ${theme.colors.shadow}`,
              }}>
                {(["all", "week", "month", "year"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: selectedPeriod === period 
                        ? theme.colors.primary 
                        : "transparent",
                      color: selectedPeriod === period 
                        ? "#fff" 
                        : theme.colors.text,
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: selectedPeriod === period 
                        ? `0 2px 8px ${theme.colors.shadow}` 
                        : "none",
                      transform: selectedPeriod === period ? "scale(1.02)" : "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!interactionsEnabled || selectedPeriod === period) {
                        return;
                      }
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      e.currentTarget.style.transform = `scale(${hoverScale.toFixed(3)})`;
                    }}
                    onMouseLeave={(e) => {
                      if (!interactionsEnabled || selectedPeriod === period) {
                        return;
                      }
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {periodOptionLabels[period]}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Gombok csoport */}
            <div style={{ 
              display: "flex", 
              gap: "10px", 
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <Tooltip content={t("home.actions.reportTooltip")}>
                <button
                  onClick={() => setShowReportDialog(true)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: theme.colors.success,
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    if (!interactionsEnabled) return;
                    e.currentTarget.style.backgroundColor = theme.colors.successHover;
                    e.currentTarget.style.transform = `translateY(${hoverTranslate}px) scale(${hoverScale.toFixed(3)})`;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadowHover}`;
                  }}
                  onMouseLeave={(e) => {
                    if (!interactionsEnabled) return;
                    e.currentTarget.style.backgroundColor = theme.colors.success;
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = `0 2px 8px ${theme.colors.shadow}`;
                  }}
                >
                  <span style={{ fontSize: "16px" }}>📈</span>
                  <span>{t("home.actions.report")}</span>
                </button>
              </Tooltip>
              
              <select
                value={exportFormat}
                onChange={e => setExportFormat(e.target.value as "json" | "csv")}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: `2px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: `0 2px 4px ${theme.colors.shadow}`,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary}30`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border;
                  e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadow}`;
                }}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
              
              <Tooltip content={t("home.actions.exportTooltip")}>
                <button
                  onClick={handleExportStatistics}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: theme.colors.primary,
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    if (!interactionsEnabled) return;
                    e.currentTarget.style.backgroundColor = theme.colors.primaryHover;
                    e.currentTarget.style.transform = `translateY(${hoverTranslate}px) scale(${hoverScale.toFixed(3)})`;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadowHover}`;
                  }}
                  onMouseLeave={(e) => {
                    if (!interactionsEnabled) return;
                    e.currentTarget.style.backgroundColor = theme.colors.primary;
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = `0 2px 8px ${theme.colors.shadow}`;
                  }}
                >
                  <span style={{ fontSize: "16px" }}>📊</span>
                  <span>{t("home.actions.export")}</span>
                </button>
              </Tooltip>
            </div>
          </div>
        )}
        </div>
      </FadeIn>

      {/* Időszak összehasonlító kártyák */}
      {statistics.offerCount > 0 && (
        <FadeIn delay={0.2}>
          <div style={{
            backgroundColor: theme.colors.background?.includes('gradient') 
              ? "rgba(255, 255, 255, 0.75)" 
              : theme.colors.surface,
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "30px",
            boxShadow: theme.colors.background?.includes('gradient')
              ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
              : `0 4px 16px ${theme.colors.shadow}`,
            border: `1px solid ${theme.colors.border}`,
            backdropFilter: theme.colors.background?.includes('gradient') ? "blur(12px)" : "none",
            opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: "20px", 
              fontSize: "20px", 
              fontWeight: "700",
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{ fontSize: "24px" }}>📊</span>
              {settings.language === "hu" ? "Időszak összehasonlítás" : settings.language === "de" ? "Zeitraum Vergleich" : "Period Comparison"}
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px"
            }}>
              {[
                { label: settings.language === "hu" ? "Heti" : settings.language === "de" ? "Wöchentlich" : "Weekly", stats: weeklyStats, icon: "📅", color: "#4299e1" },
                { label: settings.language === "hu" ? "Havi" : settings.language === "de" ? "Monatlich" : "Monthly", stats: monthlyStats, icon: "📆", color: "#48bb78" },
                { label: settings.language === "hu" ? "Éves" : settings.language === "de" ? "Jährlich" : "Yearly", stats: yearlyStats, icon: "📊", color: "#667eea" },
              ].map((period, index) => (
                <div key={index} style={{
                  padding: "20px",
                  borderRadius: "16px",
                  backgroundColor: theme.colors.background?.includes('gradient')
                    ? "rgba(255, 255, 255, 0.65)"
                    : theme.colors.surfaceHover,
                  border: `2px solid ${period.color}30`,
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                  backdropFilter: theme.colors.background?.includes('gradient') ? "blur(10px)" : "none",
                  opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
                }}>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    backgroundColor: period.color,
                  }} />
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    marginBottom: "12px",
                  }}>
                    <span style={{ fontSize: "20px" }}>{period.icon}</span>
                    <div style={{ 
                      fontSize: "13px", 
                      color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.textMuted,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {period.label}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: "28px", 
                    fontWeight: "700", 
                    color: period.color,
                    marginBottom: "8px",
                    lineHeight: "1.2",
                  }}>
                    {formatCurrency(period.stats.totalProfit).toFixed(2)}
                  </div>
                  <div style={{ 
                    fontSize: "13px", 
                    color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
                    fontWeight: "600",
                  }}>
                    {period.stats.offerCount} {t("home.periodComparison.offers")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Statisztikai kártyák */}
      <StaggerContainer delay={0.05}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          <StaggerItem>
            <StatCard
              title={statsLabels.totalFilament}
              value={formatNumber(currentStats.totalFilamentUsed / 1000, 2)}
              unit="kg"
              icon="🧵"
              color="#007bff"
              delay={0}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={statsLabels.totalRevenue}
              value={formatNumber(formatCurrency(currentStats.totalRevenue), 2)}
              unit={settings.currency === "HUF" ? "Ft" : settings.currency}
              icon="💰"
              color="#28a745"
              delay={0.1}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={statsLabels.totalElectricity}
              value={formatNumber(currentStats.totalElectricityConsumed, 2)}
              unit="kWh"
              icon="⚡"
              color="#ffc107"
              delay={0.2}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={statsLabels.totalCost}
              value={formatNumber(formatCurrency(currentStats.totalCosts), 2)}
              unit={settings.currency === "HUF" ? "Ft" : settings.currency}
              icon="💸"
              color="#dc3545"
              delay={0.3}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={statsLabels.netProfit}
              value={formatCurrency(currentStats.totalProfit).toFixed(2)}
              unit={settings.currency === "HUF" ? "Ft" : settings.currency}
              icon="📈"
              color={currentStats.totalProfit >= 0 ? "#28a745" : "#dc3545"}
              delay={0.4}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={statsLabels.totalPrintTime}
              value={formatNumber(currentStats.totalPrintTime, 1)}
              unit={t("home.stats.unit.hours")}
              icon="⏱️"
              color="#6c757d"
              delay={0.5}
            />
          </StaggerItem>
        </div>
      </StaggerContainer>

      {statistics.offerCount > 0 && (
        <>
          <FadeIn delay={0.35}>
            <div
              style={{
                backgroundColor: theme.colors.background?.includes('gradient') ? "rgba(255, 255, 255, 0.8)" : theme.colors.surface,
                borderRadius: "20px",
                padding: "26px",
                marginBottom: "30px",
                boxShadow: theme.colors.background?.includes('gradient')
                  ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
                  : `0 4px 16px ${theme.colors.shadow}`,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: theme.colors.background?.includes('gradient') ? "blur(12px)" : "none",
                opacity: theme.colors.background?.includes('gradient') ? 0.9 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "700",
                    color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}>
                    <span style={{ fontSize: "24px" }}>📈</span>
                    {settings.language === "hu" ? "Pénzügyi trendek" : settings.language === "de" ? "Finanztrends" : "Financial trends"}
                  </h3>
                  <p style={{
                    margin: "8px 0 0 0",
                    color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
                    fontSize: "14px",
                    maxWidth: "520px",
                  }}>
                    {settings.language === "hu"
                      ? "Heti/havi csúszkáló trend a bevételek, költségek és profit alakulásáról."
                      : settings.language === "de"
                      ? "Wöchentliche/monatliche Trends für Einnahmen, Kosten und Gewinn."
                      : "Weekly/monthly rolling trend for revenue, costs, and profit."}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Tooltip content="SVG">
                    <button
                      onClick={exportTrendSvg}
                      disabled={!hasTrendData}
                      style={{
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "999px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: hasTrendData ? theme.colors.surfaceHover : theme.colors.surface,
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                        cursor: hasTrendData ? "pointer" : "not-allowed",
                        opacity: hasTrendData ? 1 : 0.5,
                        transition: "all 0.2s",
                      }}
                    >
                      SVG
                    </button>
                  </Tooltip>
                  <Tooltip content="PNG">
                    <button
                      onClick={exportTrendPng}
                      disabled={!hasTrendData}
                      style={{
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "999px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: hasTrendData ? theme.colors.surfaceHover : theme.colors.surface,
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                        cursor: hasTrendData ? "pointer" : "not-allowed",
                        opacity: hasTrendData ? 1 : 0.5,
                        transition: "all 0.2s",
                      }}
                    >
                      PNG
                    </button>
                  </Tooltip>
                  <Tooltip content="PDF">
                    <button
                      onClick={exportChartsToPDF}
                      disabled={availableChartsCount === 0}
                      style={{
                        padding: "8px 16px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "999px",
                        border: "none",
                        backgroundColor: availableChartsCount > 0 ? theme.colors.primary : theme.colors.border,
                        color: "#fff",
                        cursor: availableChartsCount > 0 ? "pointer" : "not-allowed",
                        opacity: availableChartsCount > 0 ? 1 : 0.6,
                      }}
                    >
                      PDF
                    </button>
                  </Tooltip>
                </div>
              </div>
              {hasTrendData ? (
                <>
                  <div style={{ marginTop: "20px" }}>
                    <TrendChart data={trendData} theme={theme} svgRef={trendChartRef} />
                  </div>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "16px" }}>
                    {[{
                      label: settings.language === "hu" ? "Bevétel összesen" : settings.language === "de" ? "Gesamteinnahmen" : "Total revenue",
                      value: trendTotals.revenue,
                      color: "#22D3EE",
                    }, {
                      label: settings.language === "hu" ? "Költség összesen" : settings.language === "de" ? "Gesamtkosten" : "Total costs",
                      value: trendTotals.costs,
                      color: "#F97316",
                    }, {
                      label: settings.language === "hu" ? "Profit összesen" : settings.language === "de" ? "Gesamtgewinn" : "Total profit",
                      value: trendTotals.profit,
                      color: "#4ADE80",
                    }].map(item => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          backgroundColor: theme.colors.surfaceHover,
                          borderRadius: "999px",
                          padding: "8px 14px",
                          border: `1px solid ${item.color}30`,
                        }}
                      >
                        <span style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "999px",
                          backgroundColor: item.color,
                        }} />
                        <span style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>{item.label}:</span>
                        <strong style={{ fontSize: "13px", color: item.color }}>
                          {formatNumber(formatCurrency(item.value), 2)} {currencyLabel}
                        </strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{
                  marginTop: "32px",
                  padding: "48px 16px",
                  textAlign: "center",
                  color: theme.colors.textMuted,
                  border: `1px dashed ${theme.colors.border}`,
                  borderRadius: "16px",
                }}>
                  {settings.language === "hu" ? "Nincs elegendő adat a grafikonhoz" : settings.language === "de" ? "Nicht genügend Daten für das Diagramm" : "Not enough data to render the chart"}
                </div>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}>
              <div style={{
                backgroundColor: theme.colors.background?.includes('gradient') ? "rgba(255, 255, 255, 0.8)" : theme.colors.surface,
                borderRadius: "20px",
                padding: "24px",
                boxShadow: theme.colors.background?.includes('gradient')
                  ? `0 6px 18px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
                  : `0 4px 16px ${theme.colors.shadow}`,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: theme.colors.background?.includes('gradient') ? "blur(12px)" : "none",
                opacity: theme.colors.background?.includes('gradient') ? 0.9 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: "700",
                      color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}>
                      <span style={{ fontSize: "20px" }}>🧵</span>
                      {settings.language === "hu" ? "Filament megoszlás" : settings.language === "de" ? "Filamentverteilung" : "Filament breakdown"}
                    </h3>
                    <p style={{
                      margin: "6px 0 0 0",
                      color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
                      fontSize: "13px",
                    }}>
                      {settings.language === "hu" ? "Felhasznált filament tömeg típusonként." : settings.language === "de" ? "Verbrauchtes Filament nach Typ." : "Filament usage per type."}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Tooltip content="SVG">
                      <button
                        onClick={exportFilamentSvg}
                        disabled={!hasFilamentData}
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "999px",
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: hasFilamentData ? theme.colors.surfaceHover : theme.colors.surface,
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                          cursor: hasFilamentData ? "pointer" : "not-allowed",
                          opacity: hasFilamentData ? 1 : 0.5,
                        }}
                      >
                        SVG
                      </button>
                    </Tooltip>
                    <Tooltip content="PNG">
                      <button
                        onClick={exportFilamentPng}
                        disabled={!hasFilamentData}
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "999px",
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: hasFilamentData ? theme.colors.surfaceHover : theme.colors.surface,
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                          cursor: hasFilamentData ? "pointer" : "not-allowed",
                          opacity: hasFilamentData ? 1 : 0.5,
                        }}
                      >
                        PNG
                      </button>
                    </Tooltip>
                  </div>
                </div>
                {hasFilamentData ? (
                  <>
                    <div style={{ marginTop: "16px", height: "280px" }}>
                      <PieChart data={filamentBreakdown} theme={theme} svgRef={filamentChartRef} emptyLabel={settings.language === "hu" ? "Nincs adat" : settings.language === "de" ? "Keine Daten" : "No data"} />
                    </div>
                    <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {filamentBreakdown.map(slice => {
                        const percentage = totalFilamentByType > 0 ? (slice.value / totalFilamentByType) * 100 : 0;
                        return (
                          <div key={slice.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                              <span style={{ width: "12px", height: "12px", borderRadius: "999px", backgroundColor: slice.color ?? "#6366F1" }} />
                              {slice.label}
                            </span>
                            <span style={{ color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, fontWeight: 600 }}>
                              {(slice.value / 1000).toFixed(2)} kg · {percentage.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{
                    marginTop: "32px",
                    padding: "48px 16px",
                    textAlign: "center",
                    color: theme.colors.textMuted,
                    border: `1px dashed ${theme.colors.border}`,
                    borderRadius: "16px",
                  }}>
                    {settings.language === "hu" ? "Nincs filament adat" : settings.language === "de" ? "Keine Filamentdaten" : "No filament data"}
                  </div>
                )}
              </div>

              <div style={{
                backgroundColor: theme.colors.background?.includes('gradient') ? "rgba(255, 255, 255, 0.8)" : theme.colors.surface,
                borderRadius: "20px",
                padding: "24px",
                boxShadow: theme.colors.background?.includes('gradient')
                  ? `0 6px 18px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
                  : `0 4px 16px ${theme.colors.shadow}`,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: theme.colors.background?.includes('gradient') ? "blur(12px)" : "none",
                opacity: theme.colors.background?.includes('gradient') ? 0.9 : 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: "700",
                      color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}>
                      <span style={{ fontSize: "20px" }}>🖨️</span>
                      {settings.language === "hu" ? "Bevétel nyomtatónként" : settings.language === "de" ? "Umsatz je Drucker" : "Revenue by printer"}
                    </h3>
                    <p style={{
                      margin: "6px 0 0 0",
                      color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
                      fontSize: "13px",
                    }}>
                      {settings.language === "hu" ? "Árajánlatból származó bevétel printerenként összesítve." : settings.language === "de" ? "Summierte Angebotserlöse je Drucker." : "Aggregated quote revenue per printer."}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Tooltip content="SVG">
                      <button
                        onClick={exportPrinterSvg}
                        disabled={!hasPrinterData}
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "999px",
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: hasPrinterData ? theme.colors.surfaceHover : theme.colors.surface,
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                          cursor: hasPrinterData ? "pointer" : "not-allowed",
                          opacity: hasPrinterData ? 1 : 0.5,
                        }}
                      >
                        SVG
                      </button>
                    </Tooltip>
                    <Tooltip content="PNG">
                      <button
                        onClick={exportPrinterPng}
                        disabled={!hasPrinterData}
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "999px",
                          border: `1px solid ${theme.colors.border}`,
                          backgroundColor: hasPrinterData ? theme.colors.surfaceHover : theme.colors.surface,
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                          cursor: hasPrinterData ? "pointer" : "not-allowed",
                          opacity: hasPrinterData ? 1 : 0.5,
                        }}
                      >
                        PNG
                      </button>
                    </Tooltip>
                  </div>
                </div>
                {hasPrinterData ? (
                  <>
                    <div style={{ marginTop: "16px", height: "280px" }}>
                      <BarChart data={printerBreakdown} theme={theme} svgRef={printerChartRef} />
                    </div>
                    <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {printerBreakdown.map(slice => {
                        const percentage = totalRevenueByPrinter > 0 ? (slice.value / totalRevenueByPrinter) * 100 : 0;
                        const revenueConverted = formatCurrency(slice.value);
                        return (
                          <div key={slice.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "8px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                              <span style={{ width: "12px", height: "12px", borderRadius: "999px", backgroundColor: slice.color ?? "#6366F1" }} />
                              {slice.label}
                            </span>
                            <span style={{ color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, fontWeight: 600 }}>
                              {formatNumber(revenueConverted, 2)} {currencyLabel} · {percentage.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{
                    marginTop: "32px",
                    padding: "48px 16px",
                    textAlign: "center",
                    color: theme.colors.textMuted,
                    border: `1px dashed ${theme.colors.border}`,
                    borderRadius: "16px",
                  }}>
                    {settings.language === "hu" ? "Nincs nyomtató adat" : settings.language === "de" ? "Keine Druckerdaten" : "No printer data"}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        </>
      )}

      {/* További információ */}
      <div style={{
        backgroundColor: theme.colors.background?.includes('gradient')
          ? "rgba(255, 255, 255, 0.75)"
          : theme.colors.surface,
        borderRadius: "20px",
        padding: "28px",
        boxShadow: theme.colors.background?.includes('gradient')
          ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
          : `0 4px 16px ${theme.colors.shadow}`,
        marginBottom: "20px",
        border: `1px solid ${theme.colors.border}`,
        backdropFilter: theme.colors.background?.includes('gradient') ? "blur(12px)" : "none",
        opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
      }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: "20px", 
          fontSize: "22px", 
          fontWeight: "700",
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{ fontSize: "24px" }}>📋</span>
          {summaryLabels.title}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {[
            { 
              label: summaryLabels.offerCount,
              value: currentStats.offerCount.toString(),
              color: theme.colors.primary,
              icon: "📋"
            },
            { 
              label: summaryLabels.averageProfit,
              value: `${currentStats.offerCount > 0 ? formatNumber(formatCurrency(currentStats.totalProfit / currentStats.offerCount), 2) : "0.00"} ${settings.currency === "HUF" ? "Ft" : settings.currency}`,
              color: currentStats.totalProfit >= 0 ? theme.colors.success : theme.colors.danger,
              icon: "💰"
            },
            { 
              label: summaryLabels.profitMargin,
              value: `${currentStats.totalRevenue > 0 ? formatNumber((currentStats.totalProfit / currentStats.totalRevenue) * 100, 1) : "0.0"}%`,
              color: currentStats.totalProfit >= 0 ? theme.colors.success : theme.colors.danger,
              icon: "📈"
            },
          ].map((item, index) => (
            <div key={index} style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: theme.colors.background?.includes('gradient')
                ? "rgba(255, 255, 255, 0.65)"
                : theme.colors.surfaceHover,
              border: `2px solid ${item.color}30`,
              transition: "all 0.3s",
              backdropFilter: theme.colors.background?.includes('gradient') ? "blur(10px)" : "none",
              opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                marginBottom: "12px",
              }}>
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <strong style={{ 
                  fontSize: "14px",
                  color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.textSecondary,
                  fontWeight: "700",
                }}>
                  {item.label}
                </strong>
              </div>
              <div style={{ 
                fontSize: "28px", 
                fontWeight: "700", 
                color: item.color,
                lineHeight: "1.2",
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Üres állapot */}
      {statistics.offerCount === 0 && (
        <div style={{
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: "12px",
          padding: "40px",
          textAlign: "center",
          border: `2px dashed ${theme.colors.border}`
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h3 style={{ 
            margin: 0, 
            marginBottom: "8px", 
            color: theme.colors.background?.includes('gradient') ? "#ffffff" : theme.colors.text,
            textShadow: theme.colors.background?.includes('gradient') ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
          }}>
            {t("home.empty.title")}
          </h3>
          <p style={{ 
            margin: 0, 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : "#6c757d",
            fontSize: "14px",
            fontWeight: "500",
          }}>
            {t("home.empty.description")}
          </p>
        </div>
      )}

      {/* Riport generálás dialógus */}
      {showReportDialog && (() => {
        const filteredOffers = filterOffersByPeriod(offers, reportPeriod);
        const reportStats = calculateStatistics(filteredOffers);
        const periodLabel = reportPeriod === "all" 
          ? (settings.language === "hu" ? "Összes" : settings.language === "de" ? "Alle" : "All")
          : reportPeriod === "week"
          ? (settings.language === "hu" ? "Utolsó hét" : settings.language === "de" ? "Letzte Woche" : "Last week")
          : reportPeriod === "month"
          ? (settings.language === "hu" ? "Utolsó hónap" : settings.language === "de" ? "Letzter Monat" : "Last month")
          : (settings.language === "hu" ? "Utolsó év" : settings.language === "de" ? "Letztes Jahr" : "Last year");
        
        return (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflowY: "auto"
          }}
          onClick={() => setShowReportDialog(false)}
          >
            <div style={{
              backgroundColor: theme.colors.surface,
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              border: `1px solid ${theme.colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
            >
              {/* Fejléc */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "32px",
                paddingBottom: "20px",
                borderBottom: `2px solid ${theme.colors.border}`
              }}>
                <div>
                  <h2 style={{ 
                    margin: 0, 
                    marginBottom: "8px",
                    fontSize: "28px", 
                    fontWeight: "700", 
                    color: theme.colors.text,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <span style={{ fontSize: "32px" }}>📊</span>
                    {settings.language === "hu" ? "Statisztikai Riport" : settings.language === "de" ? "Statistikbericht" : "Statistics Report"}
                  </h2>
                  <p style={{ 
                    margin: 0,
                    fontSize: "14px",
                    color: theme.colors.textMuted
                  }}>
                    {periodLabel} • {new Date().toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US")}
                  </p>
                </div>
                <button
                  onClick={() => setShowReportDialog(false)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: theme.colors.surfaceHover,
                    color: theme.colors.text,
                    fontSize: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.danger;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    e.currentTarget.style.color = theme.colors.text;
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Időszak választó */}
              <div style={{ marginBottom: "32px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "12px", 
                  fontSize: "14px", 
                  fontWeight: "700", 
                  color: theme.colors.text
                }}>
                  {settings.language === "hu" ? "Időszak" : settings.language === "de" ? "Zeitraum" : "Period"}
                </label>
                <select
                  value={reportPeriod}
                  onChange={e => setReportPeriod(e.target.value as "all" | "week" | "month" | "year")}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: `2px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary}30`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="all">{settings.language === "hu" ? "Összes" : settings.language === "de" ? "Alle" : "All"}</option>
                  <option value="week">{settings.language === "hu" ? "Utolsó hét" : settings.language === "de" ? "Letzte Woche" : "Last week"}</option>
                  <option value="month">{settings.language === "hu" ? "Utolsó hónap" : settings.language === "de" ? "Letzter Monat" : "Last month"}</option>
                  <option value="year">{settings.language === "hu" ? "Utolsó év" : settings.language === "de" ? "Letztes Jahr" : "Last year"}</option>
                </select>
              </div>

              {/* Fő statisztikák kártyák */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "32px"
              }}>
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: theme.colors.textMuted,
                    marginBottom: "8px"
                  }}>
                    {settings.language === "hu" ? "Bevétel" : settings.language === "de" ? "Einnahmen" : "Revenue"}
                  </div>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "700", 
                    color: theme.colors.success,
                    lineHeight: "1.2"
                  }}>
                    {formatNumber(formatCurrency(reportStats.totalRevenue), 2)}
                  </div>
                </div>
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: theme.colors.textMuted,
                    marginBottom: "8px"
                  }}>
                    {settings.language === "hu" ? "Kiadás" : settings.language === "de" ? "Ausgaben" : "Costs"}
                  </div>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "700", 
                    color: theme.colors.danger,
                    lineHeight: "1.2"
                  }}>
                    {formatNumber(formatCurrency(reportStats.totalCosts), 2)}
                  </div>
                </div>
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: theme.colors.textMuted,
                    marginBottom: "8px"
                  }}>
                    {settings.language === "hu" ? "Profit" : settings.language === "de" ? "Gewinn" : "Profit"}
                  </div>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "700", 
                    color: reportStats.totalProfit >= 0 ? theme.colors.success : theme.colors.danger,
                    lineHeight: "1.2"
                  }}>
                    {formatNumber(formatCurrency(reportStats.totalProfit), 2)}
                  </div>
                </div>
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: theme.colors.textMuted,
                    marginBottom: "8px"
                  }}>
                    {settings.language === "hu" ? "Árajánlatok" : settings.language === "de" ? "Angebote" : "Offers"}
                  </div>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "700", 
                    color: theme.colors.primary,
                    lineHeight: "1.2"
                  }}>
                    {reportStats.offerCount}
                  </div>
                </div>
              </div>

              {/* Grafikon: Bevétel vs Kiadás */}
              {reportStats.totalRevenue > 0 && (
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "32px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    marginBottom: "20px",
                    fontSize: "18px", 
                    fontWeight: "700", 
                    color: theme.colors.text
                  }}>
                    📈 {settings.language === "hu" ? "Bevétel vs Kiadás" : settings.language === "de" ? "Einnahmen vs Ausgaben" : "Revenue vs Costs"}
                  </h3>
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", height: "220px", position: "relative" }}>
                    {/* Bevétel oszlop */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {/* Érték az oszlop felett */}
                      <div style={{ 
                        position: "absolute",
                        top: "-40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: theme.colors.text,
                        fontWeight: "700",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        backgroundColor: theme.colors.surface,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        boxShadow: `0 2px 4px ${theme.colors.shadow}`
                      }}>
                        {formatNumber(formatCurrency(reportStats.totalRevenue), 2)}
                      </div>
                      <div style={{
                        width: "100%",
                        backgroundColor: theme.colors.success,
                        borderRadius: "8px 8px 0 0",
                        height: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        padding: "12px 4px",
                        boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                        position: "relative"
                      }}>
                        <div style={{ 
                          color: "#fff", 
                          fontWeight: "700", 
                          fontSize: "12px",
                          textAlign: "center",
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)"
                        }}>
                          {settings.language === "hu" ? "Bevétel" : settings.language === "de" ? "Einnahmen" : "Revenue"}
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: "12px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        textAlign: "center"
                      }}>
                        {settings.language === "hu" ? "Bevétel" : settings.language === "de" ? "Einnahmen" : "Revenue"}
                      </div>
                    </div>
                    {/* Kiadás oszlop */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {/* Érték az oszlop felett */}
                      <div style={{ 
                        position: "absolute",
                        top: "-40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: theme.colors.text,
                        fontWeight: "700",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        backgroundColor: theme.colors.surface,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        boxShadow: `0 2px 4px ${theme.colors.shadow}`
                      }}>
                        {formatNumber(formatCurrency(reportStats.totalCosts), 2)}
                      </div>
                      <div style={{
                        width: "100%",
                        backgroundColor: theme.colors.danger,
                        borderRadius: "8px 8px 0 0",
                        height: `${Math.max(30, (reportStats.totalCosts / reportStats.totalRevenue) * 100)}%`,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        padding: "12px 4px",
                        boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                        position: "relative"
                      }}>
                        <div style={{ 
                          color: "#fff", 
                          fontWeight: "700", 
                          fontSize: "12px",
                          textAlign: "center",
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)"
                        }}>
                          {settings.language === "hu" ? "Kiadás" : settings.language === "de" ? "Ausgaben" : "Costs"}
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: "12px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        textAlign: "center"
                      }}>
                        {settings.language === "hu" ? "Kiadás" : settings.language === "de" ? "Ausgaben" : "Costs"}
                      </div>
                    </div>
                    {/* Profit oszlop */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {/* Érték az oszlop felett */}
                      <div style={{ 
                        position: "absolute",
                        top: "-40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: theme.colors.text,
                        fontWeight: "700",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        backgroundColor: theme.colors.surface,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        boxShadow: `0 2px 4px ${theme.colors.shadow}`
                      }}>
                        {formatNumber(formatCurrency(reportStats.totalProfit), 2)}
                      </div>
                      <div style={{
                        width: "100%",
                        backgroundColor: reportStats.totalProfit >= 0 ? theme.colors.success : theme.colors.danger,
                        borderRadius: "8px 8px 0 0",
                        height: `${Math.max(30, Math.abs((reportStats.totalProfit / reportStats.totalRevenue) * 100))}%`,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        padding: "12px 4px",
                        boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                        position: "relative"
                      }}>
                        <div style={{ 
                          color: "#fff", 
                          fontWeight: "700", 
                          fontSize: "12px",
                          textAlign: "center",
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)"
                        }}>
                          {settings.language === "hu" ? "Profit" : settings.language === "de" ? "Gewinn" : "Profit"}
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: "12px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        textAlign: "center"
                      }}>
                        {settings.language === "hu" ? "Profit" : settings.language === "de" ? "Gewinn" : "Profit"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* További statisztikák */}
              <div style={{
                backgroundColor: theme.colors.surfaceHover,
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "32px",
                border: `1px solid ${theme.colors.border}`,
                boxShadow: `0 2px 8px ${theme.colors.shadow}`
              }}>
                <h3 style={{ 
                  margin: 0, 
                  marginBottom: "20px",
                  fontSize: "18px", 
                  fontWeight: "700", 
                  color: theme.colors.text
                }}>
                  📋 {settings.language === "hu" ? "Részletes statisztikák" : settings.language === "de" ? "Detaillierte Statistiken" : "Detailed Statistics"}
                </h3>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "16px"
                }}>
                  <div style={{ padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {settings.language === "hu" ? "Felhasznált filament" : settings.language === "de" ? "Verwendetes Filament" : "Filament Used"}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                      {formatNumber(reportStats.totalFilamentUsed / 1000, 2)} kg
                    </div>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {settings.language === "hu" ? "Nyomtatási idő" : settings.language === "de" ? "Druckzeit" : "Print Time"}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                      {formatNumber(reportStats.totalPrintTime, 1)} {settings.language === "hu" ? "óra" : settings.language === "de" ? "Stunden" : "hours"}
                    </div>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {settings.language === "hu" ? "Átlagos profit/árajánlat" : settings.language === "de" ? "Durchschnittlicher Gewinn/Angebot" : "Avg Profit/Offer"}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                      {formatNumber(formatCurrency(reportStats.offerCount > 0 ? reportStats.totalProfit / reportStats.offerCount : 0), 2)}
                    </div>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {settings.language === "hu" ? "Profit margó" : settings.language === "de" ? "Gewinnmarge" : "Profit Margin"}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                      {reportStats.totalRevenue > 0 ? ((reportStats.totalProfit / reportStats.totalRevenue) * 100).toFixed(1) : "0"}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Gombok */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowReportDialog(false)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "10px",
                    border: `2px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.surface;
                  }}
                >
                  {settings.language === "hu" ? "Bezárás" : settings.language === "de" ? "Schließen" : "Close"}
                </button>
                <Tooltip content={settings.language === "hu" ? "Riport mentése JSON formátumban" : settings.language === "de" ? "Bericht als JSON speichern" : "Save report as JSON"}>
                  <button
                    onClick={generateReport}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: theme.colors.primary,
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                    onMouseEnter={(e) => {
                      if (!interactionsEnabled) return;
                      e.currentTarget.style.backgroundColor = theme.colors.primaryHover;
                      e.currentTarget.style.transform = `translateY(${hoverTranslate}px) scale(${hoverScale.toFixed(3)})`;
                      e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadowHover}`;
                    }}
                    onMouseLeave={(e) => {
                      if (!interactionsEnabled) return;
                      e.currentTarget.style.backgroundColor = theme.colors.primary;
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span>💾</span>
                    <span>{settings.language === "hu" ? "Mentés JSON" : settings.language === "de" ? "Als JSON speichern" : "Save as JSON"}</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
