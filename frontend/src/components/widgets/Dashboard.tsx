import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { getCurrencyLabel } from "../../utils/currency";
import type { WidgetConfig, WidgetSize, DashboardLayout } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings, Offer, Filament, Project, Task } from "../../types";
import { useTranslation } from "../../utils/translations";
import { WidgetContainer } from "./WidgetContainer";
import { StatisticsWidget } from "./StatisticsWidget";
import { TrendChartWidget } from "./TrendChartWidget";
import { PeriodComparisonWidget } from "./PeriodComparisonWidget";
import { FilamentBreakdownWidget } from "./FilamentBreakdownWidget";
import { PrinterBreakdownWidget } from "./PrinterBreakdownWidget";
import { SummaryWidget } from "./SummaryWidget";
import { StatCardWidget } from "./StatCardWidget";
import { WidgetGroup } from "./WidgetGroup";
import { PrintTimeChartWidget } from "./PrintTimeChartWidget";
import { CustomerStatsChartWidget } from "./CustomerStatsChartWidget";
import { OfferStatusChartWidget } from "./OfferStatusChartWidget";
import { QuickActionsWidget } from "./QuickActionsWidget";
import { RecentOffersWidget } from "./RecentOffersWidget";
import { FilamentStockAlertWidget } from "./FilamentStockAlertWidget";
import { FinancialTrendsWidget } from "./FinancialTrendsWidget";
import { ActiveProjectsWidget } from "./ActiveProjectsWidget";
import { ScheduledTasksWidget } from "./ScheduledTasksWidget";
import { BackupStatusWidget } from "./BackupStatusWidget";
import { ErrorSummaryWidget } from "./ErrorSummaryWidget";
import { LogViewerWidget } from "./LogViewerWidget";
import { AuditLogWidget } from "./AuditLogWidget";
import { SystemDiagnosticsWidget } from "./SystemDiagnosticsWidget";
import { PerformanceMetricsWidget } from "./PerformanceMetricsWidget";
import { ConsoleWidget } from "./ConsoleWidget";

const ResponsiveGridLayout = WidthProvider(Responsive);

const SIZE_DIMENSIONS: Record<WidgetSize, { w: number; h: number }> = {
  small: { w: 2, h: 2 },
  medium: { w: 4, h: 3 },
  large: { w: 6, h: 4 },
};

const getAllowedSizesForWidget = (widget: WidgetConfig): WidgetSize[] => {
  switch (widget.type) {
    // Kis stat kártyák: S és M értelmes, L opcionális
    case "stat-card-filament":
    case "stat-card-revenue":
    case "stat-card-electricity":
    case "stat-card-cost":
    case "stat-card-profit":
    case "stat-card-print-time":
      return ["small", "medium"];

    // Nagy, összetett tartalmú widgetek: minimum M
    case "trend-chart":
    case "print-time-chart":
    case "customer-stats-chart":
    case "offer-status-chart":
    case "filament-breakdown":
    case "printer-breakdown":
    case "quick-actions":
    case "recent-offers":
    case "filament-stock-alert":
    case "active-projects":
    case "scheduled-tasks":
    case "backup-status":
    case "error-summary":
    case "log-viewer":
    case "audit-log":
    case "system-diagnostics":
    case "performance-metrics":
    case "console":
      return ["medium", "large"];

    // Csak nagyban értelmes: komplex layout / több soros tartalom
    case "period-comparison":
    case "summary":
    case "financial-trends":
    case "statistics":
    case "widget-group":
      return ["large"];

    default:
      return ["small", "medium", "large"];
  }
};

const normalizeWidgetSize = (widget: WidgetConfig): WidgetConfig => {
  const allowed = getAllowedSizesForWidget(widget);
  const currentSize = widget.size;
  const normalizedSize = allowed.includes(currentSize) ? currentSize : allowed[allowed.length - 1];

  if (normalizedSize === currentSize) {
    return widget;
  }

  const dimensions = SIZE_DIMENSIONS[normalizedSize];
  return {
    ...widget,
    size: normalizedSize,
    layout: {
      ...widget.layout,
      w: dimensions.w,
      h: dimensions.h,
    },
  };
};

interface DashboardProps {
  settings: Settings;
  theme: Theme;
  statistics: {
    totalFilamentUsed: number;
    totalRevenue: number;
    totalElectricityConsumed: number;
    totalCosts: number;
    totalProfit: number;
    totalPrintTime: number;
    offerCount: number;
  };
  trendData: Array<{
    name: string;
    revenue: number;
    costs: number;
    profit: number;
  }>;
  weeklyStats?: {
    totalProfit: number;
    offerCount: number;
  };
  monthlyStats?: {
    totalProfit: number;
    offerCount: number;
  };
  yearlyStats?: {
    totalProfit: number;
    offerCount: number;
  };
  filamentBreakdown?: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  printerBreakdown?: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  printTimeData?: Array<{
    name: string;
    hours: number;
  }>;
  customerStatsData?: Array<{
    name: string;
    offerCount: number;
    totalRevenue: number;
    totalProfit: number;
  }>;
  offerStatusData?: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  summaryData?: Array<{
    label: string;
    value: string | number;
    icon: string;
    color: string;
  }>;
  statsLabels?: {
    totalFilament: string;
    totalRevenue: string;
    totalElectricity: string;
    totalCost: string;
    netProfit: string;
    totalPrintTime: string;
  };
  currencyLabel?: string;
  formatNumber?: (value: number, decimals: number) => string;
  formatCurrency?: (value: number) => number;
  onLayoutChange?: (layout: DashboardLayout) => void;
  onWidgetManagerToggle?: () => void;
  showWidgetManager?: boolean;
  onError?: (error: Error) => void;
  // New widget props
  quickActions?: Array<{
    id: string;
    label: string;
    icon: string;
    onClick: () => void;
    shortcut?: string;
  }>;
  recentOffers?: Offer[];
  filaments?: Filament[];
  financialTrendsData?: {
    period: "week" | "month" | "year";
    data: Array<{
      date: string;
      revenue: number;
      costs: number;
      profit: number;
      margin: number;
    }>;
  };
  activeProjects?: Project[];
  scheduledTasks?: Task[];
  onNavigate?: (page: string) => void;
  onOfferClick?: (offerId: number) => void;
  onFilamentClick?: (filamentIndex: number) => void;
  onProjectClick?: (projectId: number) => void;
  onTaskClick?: (taskId: number) => void;
  onPeriodChange?: (period: "week" | "month" | "year") => void;
  onTrendRangeChange?: (startIndex: number, endIndex: number) => void;
  onViewFullHistory?: () => void;
  onViewLogs?: () => void;
  onViewFullLogs?: () => void;
  onViewFullAuditLog?: () => void;
  onViewFullDiagnostics?: () => void;
  onViewFullConsole?: () => void;
}

// Alapértelmezett widget konfigurációk - klasszikus nézet sorrendje szerint
// ⚠️ IDEIGLENES: Minden widget kikapcsolva a teljesítmény probléma diagnosztizálásához
const createDefaultWidgets = (t: (key: import("../../utils/languages/types").TranslationKey) => string): WidgetConfig[] => {
  return [
    // 1. Időszak összehasonlítás (első sor, 3 kártya egymás mellett)
    {
      id: "period-comparison-1",
      type: "period-comparison",
      title: t("widget.title.periodComparison"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "period-comparison-1", x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
    },
    // 2. Statisztikai kártyák (6 kártya grid-ben, 2 sorban)
    {
      id: "stat-card-filament-1",
      type: "stat-card-filament",
      title: t("widget.title.totalFilament"),
      size: "small",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "stat-card-filament-1", x: 0, y: 3, w: 2, h: 3, minW: 2, minH: 2 },
    },
    {
      id: "stat-card-revenue-1",
      type: "stat-card-revenue",
      title: t("widget.title.totalRevenue"),
      size: "small",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "stat-card-revenue-1", x: 2, y: 3, w: 2, h: 3, minW: 2, minH: 2 },
    },
    {
      id: "stat-card-electricity-1",
      type: "stat-card-electricity",
      title: t("widget.title.totalElectricity"),
      size: "small",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "stat-card-electricity-1", x: 4, y: 3, w: 2, h: 3, minW: 2, minH: 2 },
    },
    {
      id: "stat-card-cost-1",
      type: "stat-card-cost",
      title: t("widget.title.totalCost"),
      size: "small",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "stat-card-cost-1", x: 6, y: 3, w: 2, h: 3, minW: 2, minH: 2 },
    },
    {
      id: "stat-card-profit-1",
      type: "stat-card-profit",
      title: t("widget.title.netProfit"),
      size: "small",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "stat-card-profit-1", x: 8, y: 3, w: 2, h: 3, minW: 2, minH: 2 },
    },
    {
      id: "stat-card-print-time-1",
      type: "stat-card-print-time",
      title: t("widget.title.totalPrintTime"),
      size: "small",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "stat-card-print-time-1", x: 10, y: 3, w: 2, h: 3, minW: 2, minH: 2 },
    },
    // 3. Pénzügyi trendek (nagy kártya, teljes szélesség)
    {
      id: "trend-chart-1",
      type: "trend-chart",
      title: t("widget.title.trends"),
      size: "large",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "trend-chart-1", x: 0, y: 6, w: 12, h: 5, minW: 6, minH: 4 },
    },
    // 4. Filament megoszlás és Bevétel nyomtatónként (2 kártya egymás mellett)
    {
      id: "filament-breakdown-1",
      type: "filament-breakdown",
      title: t("widget.title.filamentBreakdown"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "filament-breakdown-1", x: 0, y: 11, w: 6, h: 4, minW: 4, minH: 3 },
    },
    {
      id: "printer-breakdown-1",
      type: "printer-breakdown",
      title: t("widget.title.revenueByPrinter"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "printer-breakdown-1", x: 6, y: 11, w: 6, h: 4, minW: 4, minH: 3 },
    },
    // 5. Összefoglaló (utolsó sor, teljes szélesség)
    {
      id: "summary-1",
      type: "summary",
      title: t("widget.title.summary"),
      size: "large",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "summary-1", x: 0, y: 15, w: 12, h: 3, minW: 6, minH: 2 },
    },
    // 6. Nyomtatási idő grafikon
    {
      id: "print-time-chart-1",
      type: "print-time-chart",
      title: t("widget.title.printTimeChart"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "print-time-chart-1", x: 0, y: 18, w: 12, h: 4, minW: 6, minH: 3 },
    },
    // 7. Ügyfél statisztikák grafikon
    {
      id: "customer-stats-chart-1",
      type: "customer-stats-chart",
      title: t("widget.title.customerStatsChart"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "customer-stats-chart-1", x: 0, y: 22, w: 6, h: 4, minW:4, minH: 3 },
    },
    // 8. Árajánlat státusz eloszlás
    {
      id: "offer-status-chart-1",
      type: "offer-status-chart",
      title: t("widget.title.offerStatusChart"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "offer-status-chart-1", x: 6, y: 22, w: 6, h: 4, minW:4, minH: 3 },
    },
    // 9. Új widgetek
    {
      id: "quick-actions-1",
      type: "quick-actions",
      title: t("widget.title.quickActions"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "quick-actions-1", x: 0, y: 26, w: 4, h: 3, minW: 3, minH: 2 },
    },
    {
      id: "recent-offers-1",
      type: "recent-offers",
      title: t("widget.title.recentOffers"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "recent-offers-1", x: 4, y: 26, w: 4, h: 3, minW: 3, minH: 2 },
    },
    {
      id: "filament-stock-alert-1",
      type: "filament-stock-alert",
      title: t("widget.title.filamentStockAlert"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "filament-stock-alert-1", x: 8, y: 26, w: 4, h: 3, minW: 3, minH: 2 },
    },
    {
      id: "financial-trends-1",
      type: "financial-trends",
      title: t("widget.title.financialTrends"),
      size: "large",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "financial-trends-1", x: 0, y: 29, w: 12, h: 5, minW: 6, minH: 4 },
    },
    {
      id: "active-projects-1",
      type: "active-projects",
      title: t("widget.title.activeProjects"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "active-projects-1", x: 0, y: 34, w: 6, h: 4, minW: 4, minH: 3 },
    },
    {
      id: "scheduled-tasks-1",
      type: "scheduled-tasks",
      title: t("widget.title.scheduledTasks"),
      size: "medium",
      visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
      layout: { i: "scheduled-tasks-1", x: 6, y: 34, w: 6, h: 4, minW: 4, minH: 3 },
    },
    // 10. Új rendszer és log widgetek (alapértelmezettként REJTETT - csak manuálisan aktiválható)
    {
      id: "backup-status-1",
      type: "backup-status",
      title: t("widget.title.backupStatus"),
      size: "medium",
      visible: false, // Alapértelmezettként rejtett - csak manuálisan aktiválható
      layout: { i: "backup-status-1", x: 0, y: 38, w: 4, h: 4, minW: 3, minH: 3 },
    },
    {
      id: "error-summary-1",
      type: "error-summary",
      title: t("widget.title.errorSummary"),
      size: "medium",
      visible: false, // Alapértelmezettként rejtett
      layout: { i: "error-summary-1", x: 4, y: 38, w: 4, h: 4, minW: 3, minH: 3 },
    },
    {
      id: "log-viewer-1",
      type: "log-viewer",
      title: t("widget.title.logViewer"),
      size: "medium",
      visible: false, // Alapértelmezettként rejtett
      layout: { i: "log-viewer-1", x: 8, y: 38, w: 4, h: 4, minW: 3, minH: 3 },
    },
    {
      id: "audit-log-1",
      type: "audit-log",
      title: t("widget.title.auditLog"),
      size: "medium",
      visible: false, // Alapértelmezettként rejtett
      layout: { i: "audit-log-1", x: 0, y: 42, w: 4, h: 4, minW: 3, minH: 3 },
    },
    {
      id: "system-diagnostics-1",
      type: "system-diagnostics",
      title: t("widget.title.systemDiagnostics"),
      size: "medium",
      visible: false, // Alapértelmezettként rejtett
      layout: { i: "system-diagnostics-1", x: 4, y: 42, w: 4, h: 4, minW: 3, minH: 3 },
    },
    {
      id: "performance-metrics-1",
      type: "performance-metrics",
      title: t("widget.title.performanceMetrics"),
      size: "medium",
      visible: false, // Alapértelmezettként rejtett
      layout: { i: "performance-metrics-1", x: 8, y: 42, w: 4, h: 4, minW: 3, minH: 3 },
    },
    {
      id: "console-1",
      type: "console",
      title: t("widget.title.console"),
      size: "medium",
      visible: false, // Alapértelmezettként rejtett
      layout: { i: "console-1", x: 0, y: 46, w: 12, h: 5, minW: 6, minH: 4 },
    },
  ];
};

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  theme,
  statistics,
  trendData,
  weeklyStats,
  monthlyStats,
  yearlyStats,
  filamentBreakdown = [],
  printerBreakdown = [],
  printTimeData = [],
  customerStatsData = [],
  offerStatusData = [],
  summaryData = [],
  statsLabels,
  currencyLabel = getCurrencyLabel(settings.currency),
  formatNumber = (value: number, decimals: number) => value.toFixed(decimals),
  formatCurrency = (value: number) => value,
  onLayoutChange,
  onWidgetManagerToggle,
  showWidgetManager: externalShowWidgetManager,
  onError,
  quickActions = [],
  recentOffers = [],
  filaments = [],
  financialTrendsData,
  activeProjects = [],
  scheduledTasks = [],
  onNavigate,
  onOfferClick,
  onFilamentClick,
  onProjectClick,
  onTaskClick,
  onPeriodChange,
  onTrendRangeChange,
  onViewFullHistory,
  onViewLogs,
  onViewFullLogs,
  onViewFullAuditLog,
  onViewFullDiagnostics,
  onViewFullConsole,
}) => {
  const t = useTranslation(settings.language);

  // Widget konfigurációk betöltése vagy alapértelmezett
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const savedWidgets = settings.dashboardLayout?.widgets;
      if (savedWidgets && savedWidgets.length > 0) {
        // Csak development módban logoljuk, és csak console-ra (ne fájlba)
        if (import.meta.env.DEV) {
        console.log("[Dashboard] Loading saved widget layout:", {
          savedWidgetCount: savedWidgets.length,
          savedWidgetIds: savedWidgets.map(w => w.id),
        });
        }
        // Ha van mentett layout, de kevés widget van benne, akkor kiegészítjük az alapértelmezettekkel
        const defaultWidgets = createDefaultWidgets(t);
        const savedWidgetIds = new Set(savedWidgets.map(w => w.id));
        const missingWidgets = defaultWidgets.filter(w => !savedWidgetIds.has(w.id));
        const mergedWidgets = [...savedWidgets, ...missingWidgets].map(normalizeWidgetSize);
        // Csak development módban logoljuk
        if (import.meta.env.DEV) {
        console.log("[Dashboard] Merged widgets:", {
          total: mergedWidgets.length,
          saved: savedWidgets.length,
          added: missingWidgets.length,
        });
        }
        return mergedWidgets;
      }
      // Csak development módban logoljuk
      if (import.meta.env.DEV) {
      console.log("[Dashboard] No saved layout found, using default widgets");
      }
      return createDefaultWidgets(t).map(normalizeWidgetSize);
    } catch (error) {
      console.error("[Dashboard] Error initializing widgets:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Fallback to default widgets on error
      return createDefaultWidgets(t).map(normalizeWidgetSize);
    }
  });

  // Ref, hogy követni tudjuk, hogy éppen mentünk-e változást
  const isSavingLayoutRef = React.useRef(false);
  const previousLayoutRef = React.useRef<string | undefined>(undefined);
  
  // Frissítés, ha a settings.dashboardLayout változik (csak ha nem mi mentettük)
  useEffect(() => {
    // Ha éppen mentünk változást, ne töltjük be újra
    if (isSavingLayoutRef.current) {
      isSavingLayoutRef.current = false;
      return;
    }
    
    const savedWidgets = settings.dashboardLayout?.widgets;
    const currentLayoutKey = savedWidgets ? JSON.stringify(savedWidgets.map(w => ({ id: w.id, x: w.layout.x, y: w.layout.y }))) : undefined;
    
    // Ha a layout nem változott, ne töltjük be újra
    if (currentLayoutKey === previousLayoutRef.current) {
      return;
    }
    
    previousLayoutRef.current = currentLayoutKey;
    
      if (savedWidgets && savedWidgets.length > 0) {
      // Ha van mentett layout, de kevés widget van benne, akkor kiegészítjük az alapértelmezettekkel
      const defaultWidgets = createDefaultWidgets(t);
      const savedWidgetIds = new Set(savedWidgets.map(w => w.id));
      const missingWidgets = defaultWidgets.filter(w => !savedWidgetIds.has(w.id));
      if (missingWidgets.length > 0) {
        // Csak development módban logoljuk
        if (import.meta.env.DEV) {
        console.log("[Dashboard] Adding missing widgets:", missingWidgets.map(w => w.id));
        }
        const mergedWidgets = [...savedWidgets, ...missingWidgets];
        setWidgets(mergedWidgets);
        // Automatikusan mentjük a frissített layout-ot
        const dashboardLayout: DashboardLayout = {
          widgets: mergedWidgets,
          version: 1,
        };
        onLayoutChange?.(dashboardLayout);
      } else {
        setWidgets(savedWidgets);
      }
      } else if (!settings.dashboardLayout?.widgets || settings.dashboardLayout.widgets.length === 0) {
      // Csak akkor állítjuk vissza az alapértelmezettet, ha valóban nincs mentett layout
      setWidgets(createDefaultWidgets(t).map(normalizeWidgetSize));
    }
  }, [settings.dashboardLayout, onLayoutChange, t]);

  // Widget címek dinamikus fordítása
  const getWidgetTitle = useCallback((widget: WidgetConfig): string => {
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
    
    // Egyéb widget típusok fordítása - MINDIG a fordított címet adja vissza, függetlenül a widget.title-től
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
      case "quick-actions":
        return t("widget.title.quickActions");
      case "recent-offers":
        return t("widget.title.recentOffers");
      case "filament-stock-alert":
        return t("widget.title.filamentStockAlert");
      case "financial-trends":
        return t("widget.title.financialTrends");
      case "active-projects":
        return t("widget.title.activeProjects");
      case "scheduled-tasks":
        return t("widget.title.scheduledTasks");
      case "backup-status":
        return t("widget.title.backupStatus");
      case "error-summary":
        return t("widget.title.errorSummary");
      case "log-viewer":
        return t("widget.title.logViewer");
      case "audit-log":
        return t("widget.title.auditLog");
      case "system-diagnostics":
        return t("widget.title.systemDiagnostics");
      case "performance-metrics":
        return t("widget.title.performanceMetrics");
      case "console":
        return t("widget.title.console");
      default:
        return widget.title || "";
    }
  }, [t]);

  // Widget címeket nem frissítjük a state-ben, hanem csak rendereléskor fordítjuk
  // Ez elkerüli a végtelen ciklust, és a címek automatikusan frissülnek, amikor a nyelv változik

  // Layout konverzió react-grid-layout formátumra
  // Csoport widget-ek nem jelennek meg külön, csak a bennük lévő widget-ek
  const layouts = useMemo(() => {
    // Külön kezeljük a kis stat-card widgeteket, hogy biztosan egymás mellé kerüljenek
    const statCardWidgets = widgets.filter(
      (w) => w.visible && w.type.startsWith("stat-card") && !w.groupId
    );
    const otherWidgets = widgets.filter(
      (w) => w.visible && w.type !== "widget-group" && !w.groupId && !w.type.startsWith("stat-card")
    );
    
    // Stat-card widgetek - használjuk az eredeti pozíciókat, ne alkalmazzunk automatikus pozicionálást
    // Ez biztosítja, hogy a felhasználó áthelyezései megmaradjanak
    const statCardLayouts: Layout[] = statCardWidgets.map((widget) => ({
      i: widget.id,
      x: widget.layout.x,
      y: widget.layout.y,
      w: widget.layout.w,
      h: widget.layout.h,
      minW: widget.layout.minW || 2,
      minH: widget.layout.minH || 2,
      maxW: widget.layout.maxW || 12,
      maxH: widget.layout.maxH || 8,
      static: false,
    }));
    
    // Egyéb widgetek
    const otherLayouts: Layout[] = otherWidgets.map((widget) => ({
      i: widget.id,
      x: widget.layout.x,
      y: widget.layout.y,
      w: widget.layout.w,
      h: widget.layout.h,
      minW: widget.layout.minW || 2,
      minH: widget.layout.minH || 2,
      maxW: widget.layout.maxW || 12,
      maxH: widget.layout.maxH || 8,
      static: false,
    }));
    
    const lg: Layout[] = [...statCardLayouts, ...otherLayouts];
    
    // Csoport widget-ek hozzáadása
    widgets
      .filter((w) => w.visible && w.type === "widget-group")
      .forEach((groupWidget) => {
        lg.push({
          i: groupWidget.id,
          x: groupWidget.layout.x,
          y: groupWidget.layout.y,
          w: groupWidget.layout.w,
          h: groupWidget.layout.h,
          minW: groupWidget.layout.minW || 4,
          minH: groupWidget.layout.minH || 3,
          maxW: groupWidget.layout.maxW || 12,
          maxH: groupWidget.layout.maxH || 8,
        });
      });
    
    // Minden breakpoint-hoz ugyanazt a layout-ot használjuk, hogy ne változzon az ablak méretezéskor
    return { 
      lg,
      md: lg,
      sm: lg,
      xs: lg,
      xxs: lg,
    };
  }, [widgets]);

  // Layout változás kezelése - debounced, hogy ne legyen túl sok mentés
  const layoutChangeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      try {
        const newWidgets = widgets.map((widget) => {
          const layoutItem = layout.find((l) => l.i === widget.id);
          if (layoutItem) {
            const updatedWidget = {
              ...widget,
              layout: {
                ...widget.layout,
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h,
              },
            };
            
            // Ha egy csoport widget-et mozgatunk, akkor a benne lévő widget-ek pozícióját is frissítsük
            if (widget.type === "widget-group" && widget.children) {
              // A gyerek widget-ek nem jelennek meg külön a grid-ben, csak a csoport
              // A pozíciójuk relatív a csoporthoz, ezért nem kell külön frissíteni
              return updatedWidget;
            }
            
            return updatedWidget;
          }
          return widget;
        });
        
        setWidgets(newWidgets);

        // Debounced mentés - hogy ne legyen render közbeni state frissítés
        if (layoutChangeTimeoutRef.current) {
          clearTimeout(layoutChangeTimeoutRef.current);
        }
        layoutChangeTimeoutRef.current = setTimeout(() => {
          try {
            // Jelöljük, hogy éppen mentünk változást
            isSavingLayoutRef.current = true;
            const dashboardLayout: DashboardLayout = {
              widgets: newWidgets,
              version: 1,
            };
            console.log("[Dashboard] Layout change saved:", {
              widgetCount: newWidgets.length,
              layoutItems: layout.length,
            });
            onLayoutChange?.(dashboardLayout);
          } catch (error) {
            console.error("[Dashboard] Error saving layout change:", {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            });
            if (onError) {
              onError(error instanceof Error ? error : new Error(String(error)));
            }
          }
        }, 300);
      } catch (error) {
        console.error("[Dashboard] Error in handleLayoutChange:", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        if (onError) {
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    },
    [widgets, onLayoutChange, onError]
  );
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (layoutChangeTimeoutRef.current) {
        clearTimeout(layoutChangeTimeoutRef.current);
      }
    };
  }, []);

  // Csoport layout változás kezelése - debounced
  const groupLayoutChangeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const handleGroupLayoutChange = useCallback(
    (groupId: string, layouts: Layout[]) => {
      setWidgets((prevWidgets) => {
        const updatedWidgets = prevWidgets.map((w) => {
          // Ha a widget a csoportban van
          if (w.groupId === groupId) {
            const layoutItem = layouts.find((l) => l.i === w.id);
            if (layoutItem) {
              return {
                ...w,
                layout: {
                  ...w.layout,
                  x: layoutItem.x,
                  y: layoutItem.y,
                  w: layoutItem.w,
                  h: layoutItem.h,
                },
              };
            }
          }
          return w;
        });

        // Debounced mentés - hogy ne legyen render közbeni state frissítés
        if (groupLayoutChangeTimeoutRef.current) {
          clearTimeout(groupLayoutChangeTimeoutRef.current);
        }
        groupLayoutChangeTimeoutRef.current = setTimeout(() => {
          const dashboardLayout: DashboardLayout = {
            widgets: updatedWidgets.map((w) => ({
              id: w.id,
              type: w.type,
              title: w.title,
              size: w.size,
              visible: w.visible,
              layout: w.layout,
              groupId: w.groupId,
              children: w.children,
            })),
            version: 1,
          };
          onLayoutChange?.(dashboardLayout);
        }, 300);

        return updatedWidgets;
      });
    },
    [onLayoutChange]
  );
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (groupLayoutChangeTimeoutRef.current) {
        clearTimeout(groupLayoutChangeTimeoutRef.current);
      }
    };
  }, []);

  // Widget eltávolítása
  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      const widgetToRemove = widgets.find((w) => w.id === widgetId);
      let newWidgets = widgets.filter((w) => w.id !== widgetId);
      
      // Ha csoport widget-et távolítunk el, akkor a benne lévő widget-eket is eltávolítjuk vagy kivesszük a csoportból
      if (widgetToRemove?.type === "widget-group" && widgetToRemove.children) {
        // Kivesszük a widget-eket a csoportból (groupId törlése)
        newWidgets = newWidgets.map((w) => {
          if (widgetToRemove.children?.includes(w.id)) {
            return {
              ...w,
              groupId: undefined,
            };
          }
          return w;
        });
      }
      
      // Ha egy widget-et távolítunk el, akkor eltávolítjuk a csoport children listájából is
      newWidgets = newWidgets.map((w) => {
        if (w.type === "widget-group" && w.children?.includes(widgetId)) {
          return {
            ...w,
            children: w.children.filter((id) => id !== widgetId),
          };
        }
        return w;
      });
      
      setWidgets(newWidgets);
      const dashboardLayout: DashboardLayout = {
        widgets: newWidgets,
        version: 1,
      };
      onLayoutChange?.(dashboardLayout);
    },
    [widgets, onLayoutChange]
  );

  // Widget láthatóság váltása
  const handleToggleVisibility = useCallback(
    (widgetId: string) => {
      const newWidgets = widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      );
      setWidgets(newWidgets);
      const dashboardLayout: DashboardLayout = {
        widgets: newWidgets,
        version: 1,
      };
      onLayoutChange?.(dashboardLayout);
    },
    [widgets, onLayoutChange]
  );

  // Widget méretezése
  const handleResize = useCallback(
    (widgetId: string, size: WidgetSize) => {
      const newWidgets = widgets.map((w) => {
        if (w.id === widgetId) {
          const allowed = getAllowedSizesForWidget(w);
          const targetSize = allowed.includes(size) ? size : allowed[allowed.length - 1];
          const dimensions = SIZE_DIMENSIONS[targetSize];
          return {
            ...w,
            size: targetSize,
            layout: {
              ...w.layout,
              w: dimensions.w,
              h: dimensions.h,
            },
          };
        }
        return w;
      });
      setWidgets(newWidgets);
      const dashboardLayout: DashboardLayout = {
        widgets: newWidgets,
        version: 1,
      };
      onLayoutChange?.(dashboardLayout);
    },
    [widgets, onLayoutChange]
  );

  // Csoport létrehozása
  const handleCreateGroup = useCallback(
    (widgetIds: string[]) => {
      if (widgetIds.length === 0) return;
      
      // Egyedi csoport szám generálása
      const existingGroups = widgets.filter((w) => w.type === "widget-group");
      const groupNumber = existingGroups.length + 1;
      
      const groupId = `widget-group-${Date.now()}`;
      const groupWidget: WidgetConfig = {
        id: groupId,
        type: "widget-group",
        title: `${t("widget.group.name")} ${groupNumber}`,
        size: "large",
        visible: false, // ⚠️ IDEIGLENES: Kikapcsolva
        layout: {
          i: groupId,
          x: 0,
          y: 0,
          w: 6,
          h: 4,
          minW: 4,
          minH: 3,
        },
        children: widgetIds,
      };
      
      // Frissítjük a widget-eket, hogy a csoportba tartozzanak
      const newWidgets = widgets.map((w) => {
        if (widgetIds.includes(w.id)) {
          return {
            ...w,
            groupId: groupId,
          };
        }
        return w;
      });
      
      // Hozzáadjuk a csoport widget-et
      newWidgets.push(groupWidget);
      
      setWidgets(newWidgets);
      const dashboardLayout: DashboardLayout = {
        widgets: newWidgets,
        version: 1,
      };
      onLayoutChange?.(dashboardLayout);
    },
    [widgets, onLayoutChange]
  );

  // Widget hozzáadása csoporthoz
  const handleAddToGroup = useCallback(
    (widgetId: string, groupId: string) => {
      const newWidgets = widgets.map((w) => {
        if (w.id === widgetId) {
          return {
            ...w,
            groupId: groupId,
          };
        }
        if (w.id === groupId && w.type === "widget-group") {
          const currentChildren = w.children || [];
          if (!currentChildren.includes(widgetId)) {
            return {
              ...w,
              children: [...currentChildren, widgetId],
            };
          }
        }
        return w;
      });
      
      setWidgets(newWidgets);
      const dashboardLayout: DashboardLayout = {
        widgets: newWidgets,
        version: 1,
      };
      onLayoutChange?.(dashboardLayout);
    },
    [widgets, onLayoutChange]
  );

  // Widget eltávolítása csoportból
  const handleRemoveFromGroup = useCallback(
    (widgetId: string) => {
      const widget = widgets.find((w) => w.id === widgetId);
      if (!widget?.groupId) return;
      
      const groupId = widget.groupId;
      const newWidgets = widgets.map((w) => {
        if (w.id === widgetId) {
          return {
            ...w,
            groupId: undefined,
          };
        }
        if (w.id === groupId && w.type === "widget-group") {
          return {
            ...w,
            children: w.children?.filter((id) => id !== widgetId) || [],
          };
        }
        return w;
      });
      
      setWidgets(newWidgets);
      const dashboardLayout: DashboardLayout = {
        widgets: newWidgets,
        version: 1,
      };
      onLayoutChange?.(dashboardLayout);
    },
    [widgets, onLayoutChange]
  );

  // Csoport nevének módosítása
  const handleRenameGroup = useCallback(
    (groupId: string, newTitle: string) => {
      const newWidgets = widgets.map((w) => {
        if (w.id === groupId && w.type === "widget-group") {
          return {
            ...w,
            title: newTitle || w.title,
          };
        }
        return w;
      });
      
      setWidgets(newWidgets);
      const dashboardLayout: DashboardLayout = {
        widgets: newWidgets,
        version: 1,
      };
      onLayoutChange?.(dashboardLayout);
    },
    [widgets, onLayoutChange]
  );

  // Widget renderelése típus alapján
  const renderWidget = (widget: WidgetConfig) => {
    try {
      // Alapértelmezett értékek, ha hiányoznak
      const safeFormatNumber = formatNumber || ((value: number, decimals: number) => value.toFixed(decimals));
      const safeFormatCurrency = formatCurrency || ((value: number) => value);
      const safeCurrencyLabel = currencyLabel || "EUR";
      const safeStatsLabels = statsLabels || {
        totalFilament: "Összes filament",
        totalRevenue: "Összes bevétel",
        totalElectricity: "Összes áram",
        totalCost: "Összes költség",
        netProfit: "Nettó profit",
        totalPrintTime: "Összes nyomtatási idő",
      };
      const safeFilamentBreakdown = filamentBreakdown || [];
      const safePrinterBreakdown = printerBreakdown || [];
      const safePrintTimeData = printTimeData || [];
      const safeCustomerStatsData = customerStatsData || [];
      const safeOfferStatusData = offerStatusData || [];
      const safeSummaryData = summaryData || [];
      const safeTrendData = trendData || [];
      const safeWeeklyStats = weeklyStats || { totalProfit: 0, offerCount: 0 };
      const safeMonthlyStats = monthlyStats || { totalProfit: 0, offerCount: 0 };
      const safeYearlyStats = yearlyStats || { totalProfit: 0, offerCount: 0 };
      const safeQuickActions = quickActions || [];
      const safeRecentOffers = recentOffers || [];
      const safeFilaments = filaments || [];
      const safeFinancialTrendsData = financialTrendsData || { period: "month" as const, data: [] };
      const safeActiveProjects = activeProjects || [];
      const safeScheduledTasks = scheduledTasks || [];

    switch (widget.type) {
      case "statistics":
        return (
          <StatisticsWidget
            widget={widget}
            theme={theme}
            settings={settings}
            statistics={statistics}
          />
        );
      case "trend-chart":
        return (
          <TrendChartWidget
            widget={widget}
            theme={theme}
            settings={settings}
            data={safeTrendData}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
            currencyLabel={currencyLabel}
            onExport={undefined}
            onPeriodFilter={onTrendRangeChange}
          />
        );
      case "period-comparison":
        if (!weeklyStats || !monthlyStats || !yearlyStats) {
          return <div>Period comparison data not available</div>;
        }
        return (
          <PeriodComparisonWidget
            widget={widget}
            theme={theme}
            settings={settings}
            weeklyStats={safeWeeklyStats}
            monthlyStats={safeMonthlyStats}
            yearlyStats={safeYearlyStats}
          />
        );
      case "filament-breakdown":
        return (
          <FilamentBreakdownWidget
            widget={widget}
            theme={theme}
            settings={settings}
            filamentBreakdown={safeFilamentBreakdown}
          />
        );
      case "printer-breakdown":
        return (
          <PrinterBreakdownWidget
            widget={widget}
            theme={theme}
            settings={settings}
            printerBreakdown={safePrinterBreakdown}
          />
        );
      case "print-time-chart":
        return (
          <PrintTimeChartWidget
            widget={widget}
            theme={theme}
            settings={settings}
            data={safePrintTimeData}
            onExport={undefined}
          />
        );
      case "customer-stats-chart":
        return (
          <CustomerStatsChartWidget
            widget={widget}
            theme={theme}
            settings={settings}
            data={safeCustomerStatsData}
            formatNumber={formatNumber}
            formatCurrency={formatCurrency}
            currencyLabel={currencyLabel}
            onExport={undefined}
          />
        );
      case "offer-status-chart":
        return (
          <OfferStatusChartWidget
            widget={widget}
            theme={theme}
            settings={settings}
            data={safeOfferStatusData}
            onExport={undefined}
          />
        );
      case "summary":
        return (
          <SummaryWidget
            widget={widget}
            theme={theme}
            settings={settings}
            summaryData={safeSummaryData}
          />
        );
      case "stat-card-filament":
        return (
          <StatCardWidget
            widget={widget}
            theme={theme}
            settings={settings}
            title={safeStatsLabels.totalFilament}
            value={safeFormatNumber(statistics.totalFilamentUsed / 1000, 2)}
            unit="kg"
            icon="🧵"
            color="#007bff"
          />
        );
      case "stat-card-revenue":
        return (
          <StatCardWidget
            widget={widget}
            theme={theme}
            settings={settings}
            title={safeStatsLabels.totalRevenue}
            value={safeFormatNumber(safeFormatCurrency(statistics.totalRevenue), 2)}
            unit={safeCurrencyLabel}
            icon="💰"
            color="#28a745"
          />
        );
      case "stat-card-electricity":
        return (
          <StatCardWidget
            widget={widget}
            theme={theme}
            settings={settings}
            title={safeStatsLabels.totalElectricity}
            value={safeFormatNumber(statistics.totalElectricityConsumed, 2)}
            unit="kWh"
            icon="⚡"
            color="#ffc107"
          />
        );
      case "stat-card-cost":
        return (
          <StatCardWidget
            widget={widget}
            theme={theme}
            settings={settings}
            title={safeStatsLabels.totalCost}
            value={safeFormatNumber(safeFormatCurrency(statistics.totalCosts), 2)}
            unit={safeCurrencyLabel}
            icon="💸"
            color="#dc3545"
          />
        );
      case "stat-card-profit":
        return (
          <StatCardWidget
            widget={widget}
            theme={theme}
            settings={settings}
            title={safeStatsLabels.netProfit}
            value={safeFormatNumber(safeFormatCurrency(statistics.totalProfit || 0), 2)}
            unit={safeCurrencyLabel}
            icon="📈"
            color={(statistics.totalProfit || 0) >= 0 ? "#28a745" : "#dc3545"}
          />
        );
      case "stat-card-print-time":
        return (
          <StatCardWidget
            widget={widget}
            theme={theme}
            settings={settings}
            title={safeStatsLabels.totalPrintTime}
            value={safeFormatNumber(statistics.totalPrintTime, 1)}
            unit="óra"
            icon="⏱️"
            color="#6c757d"
          />
        );
      case "quick-actions":
        return (
          <QuickActionsWidget
            widget={widget}
            theme={theme}
            actions={safeQuickActions}
            onNavigate={onNavigate}
          />
        );
      case "recent-offers":
        return (
          <RecentOffersWidget
            widget={widget}
            theme={theme}
            settings={settings}
            offers={safeRecentOffers}
            onOfferClick={onOfferClick}
          />
        );
      case "filament-stock-alert":
        return (
          <FilamentStockAlertWidget
            widget={widget}
            theme={theme}
            settings={settings}
            filaments={safeFilaments}
            onFilamentClick={onFilamentClick}
          />
        );
      case "financial-trends":
        return (
          <FinancialTrendsWidget
            widget={widget}
            theme={theme}
            settings={settings}
            data={safeFinancialTrendsData}
            onPeriodChange={onPeriodChange}
          />
        );
      case "active-projects":
        return (
          <ActiveProjectsWidget
            widget={widget}
            theme={theme}
            settings={settings}
            projects={safeActiveProjects}
            onProjectClick={onProjectClick}
          />
        );
      case "scheduled-tasks":
        return (
          <ScheduledTasksWidget
            widget={widget}
            theme={theme}
            settings={settings}
            tasks={safeScheduledTasks}
            onTaskClick={onTaskClick}
          />
        );
      case "backup-status":
        return (
          <BackupStatusWidget
            widget={widget}
            theme={theme}
            settings={settings}
            onViewFullHistory={onViewFullHistory}
          />
        );
      case "error-summary":
        return (
          <ErrorSummaryWidget
            widget={widget}
            theme={theme}
            settings={settings}
            onViewLogs={onViewLogs}
          />
        );
      case "log-viewer":
        return (
          <LogViewerWidget
            widget={widget}
            theme={theme}
            settings={settings}
            onViewFullLogs={onViewFullLogs}
          />
        );
      case "audit-log":
        return (
          <AuditLogWidget
            widget={widget}
            theme={theme}
            settings={settings}
            onViewFullAuditLog={onViewFullAuditLog}
          />
        );
      case "system-diagnostics":
        return (
          <SystemDiagnosticsWidget
            widget={widget}
            theme={theme}
            settings={settings}
            onViewFullDiagnostics={onViewFullDiagnostics}
          />
        );
      case "performance-metrics":
        return (
          <PerformanceMetricsWidget
            widget={widget}
            theme={theme}
            settings={settings}
          />
        );
      case "console":
        return (
          <ConsoleWidget
            widget={widget}
            theme={theme}
            settings={settings}
            onViewFullConsole={onViewFullConsole}
          />
        );
      case "widget-group":
        return (
          <WidgetGroup
            widget={widget}
            theme={theme}
            settings={settings}
            allWidgets={widgets}
            onRemove={handleRemoveWidget}
            onToggleVisibility={handleToggleVisibility}
            onResize={handleResize}
            onLayoutChange={handleGroupLayoutChange}
            renderWidget={renderWidget}
          />
        );
      default:
        return <div>Unknown widget type: {widget.type}</div>;
    }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.error("[Dashboard] Error rendering widget:", {
        widgetId: widget.id,
        widgetType: widget.type,
        error: errorObj.message,
        stack: errorObj.stack,
      });
      
      // Hiba callback hívása, ha van
      if (onError) {
        try {
          onError(errorObj);
        } catch (callbackError) {
          console.error("[Dashboard] Error in onError callback:", callbackError);
        }
      }
      
      return (
        <div style={{
          padding: "20px",
          backgroundColor: theme.colors.surface,
          border: `2px solid ${theme.colors.danger}`,
          borderRadius: "8px",
          color: theme.colors.danger,
        }}>
          <strong>{t("widget.error.loading")}:</strong> {widget.type}
          {import.meta.env.DEV && errorObj.stack && (
            <pre style={{ marginTop: "10px", fontSize: "12px" }}>{errorObj.stack}</pre>
          )}
        </div>
      );
    }
  };

  const visibleWidgets = widgets.filter((w) => w.visible);
  const [internalShowWidgetManager, setInternalShowWidgetManager] = React.useState(false);
  const showWidgetManager = externalShowWidgetManager !== undefined ? externalShowWidgetManager : internalShowWidgetManager;
  const setShowWidgetManager = onWidgetManagerToggle || setInternalShowWidgetManager;

  // Debug log
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("Dashboard widgets:", {
        total: widgets.length,
        visible: visibleWidgets.length,
        widgets: widgets.map(w => ({ id: w.id, type: w.type, visible: w.visible })),
      });
    }
  }, [widgets, visibleWidgets.length]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "calc(100vh - 200px)",
        padding: "0",
        backgroundColor: theme.colors.background,
        position: "relative",
        overflow: "visible",
      }}
    >

      {/* Widget kezelő panel */}
      {showWidgetManager && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2000,
            backgroundColor: theme.colors.surface,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: "16px",
            padding: "24px",
            boxShadow: `0 8px 32px ${theme.colors.shadow}`,
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "12px",
            borderBottom: `1px solid ${theme.colors.border}`,
          }}>
            <h2 style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "700",
              color: theme.colors.text,
            }}>
              {t("widget.manager.title")}
            </h2>
            <button
              onClick={() => {
                if (onWidgetManagerToggle) {
                  onWidgetManagerToggle();
                } else {
                  setShowWidgetManager(false);
                }
              }}
              style={{
                padding: "6px 12px",
                backgroundColor: theme.colors.surfaceHover,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              ✕ {t("widget.manager.close")}
            </button>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            {widgets.map((widget) => (
              <div
                key={widget.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  backgroundColor: widget.visible ? theme.colors.surfaceHover : theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: "8px",
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flex: 1,
                }}>
                  <span style={{
                    fontSize: "20px",
                  }}>
                    {widget.type === "widget-group" ? "📦" : 
                     widget.type.includes("stat-card") ? "📊" :
                     widget.type.includes("chart") || widget.type.includes("trend") ? "📈" :
                     widget.type === "summary" ? "📋" : "🔹"}
                  </span>
                  <div>
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: theme.colors.text,
                    }}>
                      {getWidgetTitle(widget)}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: theme.colors.textMuted,
                    }}>
                      {widget.type} • {widget.size}
                    </div>
                  </div>
                </div>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}>
                  <input
                    type="checkbox"
                    checked={widget.visible}
                    onChange={() => handleToggleVisibility(widget.id)}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                    }}
                  />
                  <span style={{
                    fontSize: "14px",
                    color: theme.colors.text,
                    fontWeight: widget.visible ? "600" : "400",
                  }}>
                    {widget.visible ? t("widget.manager.visible") : t("widget.manager.hidden")}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlay a panel mögött */}
      {showWidgetManager && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1999,
          }}
          onClick={() => {
            if (onWidgetManagerToggle) {
              onWidgetManagerToggle();
            } else {
              setShowWidgetManager(false);
            }
          }}
        />
      )}
      {visibleWidgets.length === 0 ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          color: theme.colors.textMuted,
          fontSize: "16px",
        }}>
          {t("widget.manager.noVisible")}. {t("widget.manager.noVisibleDescription")}
        </div>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
          rowHeight={80}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
          draggableHandle=".widget-header, .widget-drag-handle"
          margin={[2, 2]}
          containerPadding={[20, 20]}
          allowOverlap={false}
          isBounded={false}
          useCSSTransforms={true}
          transformScale={1}
          measureBeforeMount={false}
          style={{
            backgroundColor: theme.colors.background,
            width: "100%",
          }}
        >
          {visibleWidgets
            .filter((w) => w.type === "widget-group" || !w.groupId) // Csoport widget-eket és a csoportban nem lévő widget-eket jelenítjük meg
            .map((widget) => {
              // Ha widget-group, akkor csak akkor legyen draggable, ha nincs aktív drag a csoporton belül
              const isGroupWidget = widget.type === "widget-group";
              return (
                <div 
                  key={widget.id} 
                  style={{ 
                    height: "100%", 
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    position: "relative",
                  }}
                  onMouseDown={(e) => {
                    // Ha a csoport widget-en belül történik drag, akkor megakadályozzuk
                    if (isGroupWidget) {
                      const target = e.target as HTMLElement;
                      // Csak akkor blokkoljuk, ha nem a drag handle-ról vagy header-ről van szó
                      if (target.closest('.react-grid-item') && 
                          target.closest('.widget-header') && 
                          !target.closest('.widget-drag-handle')) {
                        // Csak akkor blokkoljuk, ha gombra vagy input mezőre kattintunk
                        if (target.closest('button') || target.closest('input') || target.closest('select')) {
                          e.stopPropagation();
                        }
                      }
                    }
                  }}
                >
                  <WidgetContainer
                    widget={widget}
                    theme={theme}
                    settings={settings}
                    allowedSizes={getAllowedSizesForWidget(widget)}
                    onRemove={handleRemoveWidget}
                    onToggleVisibility={handleToggleVisibility}
                    onResize={handleResize}
                    onAddToGroup={widget.type !== "widget-group" ? handleAddToGroup : undefined}
                    onRemoveFromGroup={widget.groupId ? handleRemoveFromGroup : undefined}
                    onCreateGroup={widget.type !== "widget-group" ? handleCreateGroup : undefined}
                    onRenameGroup={widget.type === "widget-group" ? handleRenameGroup : undefined}
                    availableGroups={widgets.filter((w) => w.type === "widget-group" && w.visible).map((w) => ({ id: w.id, title: w.title }))}
                  >
                    {renderWidget(widget)}
                  </WidgetContainer>
                </div>
              );
            })}
          </ResponsiveGridLayout>
      )}
    </div>
  );
};

