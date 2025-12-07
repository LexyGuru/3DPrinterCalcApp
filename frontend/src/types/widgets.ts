// Widget típusok és definíciók

export type WidgetType = 
  | "statistics"
  | "stat-card-filament"
  | "stat-card-revenue"
  | "stat-card-electricity"
  | "stat-card-cost"
  | "stat-card-profit"
  | "stat-card-print-time"
  | "trend-chart"
  | "filament-breakdown"
  | "printer-breakdown"
  | "print-time-chart"
  | "customer-stats-chart"
  | "offer-status-chart"
  | "period-comparison"
  | "financial-trends"
  | "summary"
  | "quick-actions"
  | "recent-offers"
  | "active-projects"
  | "filament-stock-alert"
  | "scheduled-tasks"
  | "backup-status"
  | "error-summary"
  | "log-viewer"
  | "audit-log"
  | "system-diagnostics"
  | "performance-metrics"
  | "console"
  | "widget-group";

export type WidgetSize = "small" | "medium" | "large";

export interface WidgetLayout {
  i: string; // widget id
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  visible: boolean;
  layout: WidgetLayout;
  data?: any; // Widget-specifikus adatok
  groupId?: string; // Ha egy csoportba tartozik, akkor a csoport ID-ja
  children?: string[]; // Ha ez egy csoport widget, akkor a benne lévő widget ID-k
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  version: number; // Layout verzió (majd használható migration-hez)
}

