import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings } from "../../types";
import { useTranslation } from "../../utils/translations";

interface ActiveProject {
  id: number;
  name: string;
  status: "active" | "on-hold" | "completed";
  progress: number; // 0-100
  deadline?: string;
  offerCount: number;
  totalRevenue: number;
}

interface ActiveProjectsWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  projects: ActiveProject[];
  onProjectClick?: (projectId: number) => void;
}

export const ActiveProjectsWidget: React.FC<ActiveProjectsWidgetProps> = ({
  widget,
  theme,
  settings,
  projects,
  onProjectClick,
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

  const activeProjects = projects.filter(p => p.status === "active");

  if (activeProjects.length === 0) {
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
          {t("widget.activeProjects.empty") || "No active projects"}
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
          {t("widget.title.activeProjects") || "Active Projects"}
        </div>
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: isSmall ? "6px" : "8px",
          minHeight: 0,
        }}>
          {activeProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onProjectClick?.(project.id)}
              style={{
                padding: isSmall ? "8px" : "10px",
                borderRadius: "8px",
                backgroundColor: theme.colors.surfaceHover,
                border: `1px solid ${theme.colors.border}`,
                cursor: onProjectClick ? "pointer" : "default",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                gap: isSmall ? "4px" : "6px",
              }}
              onMouseEnter={(e) => {
                if (onProjectClick) {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                  e.currentTarget.style.transform = "translateX(2px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div style={{
                fontSize: fontSize,
                fontWeight: "600",
                color: theme.colors.text,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {project.name}
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}>
                <div style={{
                  flex: 1,
                  height: isSmall ? "4px" : "6px",
                  backgroundColor: theme.colors.border,
                  borderRadius: "4px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${project.progress}%`,
                    height: "100%",
                    backgroundColor: theme.colors.primary,
                    transition: "width 0.3s",
                  }} />
                </div>
                <span style={{
                  fontSize: isSmall ? "10px" : "11px",
                  color: theme.colors.textMuted,
                  fontWeight: "600",
                  minWidth: "35px",
                  textAlign: "right",
                }}>
                  {project.progress}%
                </span>
              </div>
              {project.deadline && (
                <div style={{
                  fontSize: isSmall ? "10px" : "11px",
                  color: theme.colors.textMuted,
                }}>
                  {t("common.deadline") || "Deadline"}: {new Date(project.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};






