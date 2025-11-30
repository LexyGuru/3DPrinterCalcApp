import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";

interface ScheduledTask {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  relatedOfferId?: number;
}

interface ScheduledTasksWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  tasks: ScheduledTask[];
  onTaskClick?: (taskId: number) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "#dc3545",
  medium: "#ffc107",
  low: "#28a745",
};

const PRIORITY_ICONS: Record<string, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

export const ScheduledTasksWidget: React.FC<ScheduledTasksWidgetProps> = ({
  widget,
  theme,
  settings,
  tasks,
  onTaskClick,
}) => {
  const t = useTranslation(settings.language);
  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const fontSize = isSmall ? "11px" : isMedium ? "13px" : "14px";
  const titleFontSize = isSmall ? "12px" : isMedium ? "14px" : "16px";

  // Szűrjük a pending és in-progress feladatokat, dátum szerint rendezve
  const upcomingTasks = tasks
    .filter(t => t.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5); // Maximum 5 feladat

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return t("common.overdue") || "Overdue";
    if (diffDays === 0) return t("common.today") || "Today";
    if (diffDays === 1) return t("common.tomorrow") || "Tomorrow";
    if (diffDays < 7) return `${diffDays} ${t("common.days") || "days"}`;
    
    return date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (upcomingTasks.length === 0) {
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
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.textMuted,
          fontSize: fontSize,
        }}>
          {t("widget.scheduledTasks.empty") || "No scheduled tasks"}
        </div>
      </div>
    );
  }

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
          {t("widget.title.scheduledTasks") || "Scheduled Tasks"}
        </div>
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: isSmall ? "6px" : "8px",
          minHeight: 0,
        }}>
          {upcomingTasks.map((task) => {
            const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
            const priorityIcon = PRIORITY_ICONS[task.priority] || PRIORITY_ICONS.medium;
            const isOverdue = new Date(task.dueDate).getTime() < new Date().getTime();

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick?.(task.id)}
                style={{
                  padding: isSmall ? "8px" : "10px",
                  borderRadius: "8px",
                  backgroundColor: isOverdue ? `${priorityColor}15` : theme.colors.surfaceHover,
                  border: `2px solid ${isOverdue ? priorityColor : theme.colors.border}`,
                  cursor: onTaskClick ? "pointer" : "default",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: isSmall ? "4px" : "6px",
                }}
                onMouseEnter={(e) => {
                  if (onTaskClick) {
                    e.currentTarget.style.backgroundColor = isOverdue ? `${priorityColor}25` : theme.colors.surfaceHover;
                    e.currentTarget.style.transform = "translateX(2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isOverdue ? `${priorityColor}15` : theme.colors.surfaceHover;
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flex: 1,
                    minWidth: 0,
                  }}>
                    <span style={{ fontSize: isSmall ? "14px" : "16px" }}>{priorityIcon}</span>
                    <div style={{
                      fontSize: fontSize,
                      fontWeight: "600",
                      color: theme.colors.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}>
                      {task.title}
                    </div>
                  </div>
                  <div style={{
                    fontSize: isSmall ? "10px" : "11px",
                    color: isOverdue ? priorityColor : theme.colors.textMuted,
                    fontWeight: "600",
                  }}>
                    {formatDate(task.dueDate)}
                  </div>
                </div>
                {task.description && (
                  <div style={{
                    fontSize: isSmall ? "10px" : "11px",
                    color: theme.colors.textMuted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {task.description}
                  </div>
                )}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: isSmall ? "10px" : "11px",
                  color: theme.colors.textMuted,
                }}>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: `${priorityColor}20`,
                    color: priorityColor,
                    fontSize: isSmall ? "9px" : "10px",
                    fontWeight: "600",
                  }}>
                    {task.priority}
                  </span>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: `${theme.colors.primary}20`,
                    color: theme.colors.primary,
                    fontSize: isSmall ? "9px" : "10px",
                    fontWeight: "600",
                  }}>
                    {task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};






