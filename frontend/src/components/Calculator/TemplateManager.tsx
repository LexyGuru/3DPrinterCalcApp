import React from "react";
import type { CalculationTemplate, Printer, Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";
import { Tooltip } from "../Tooltip";

interface Props {
  templates: CalculationTemplate[];
  showTemplateList: boolean;
  setShowTemplateList: (show: boolean) => void;
  printers: Printer[];
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
  onLoadTemplate: (template: CalculationTemplate) => void;
  onDeleteTemplate: (id: number) => void;
}

export const TemplateManager: React.FC<Props> = ({
  templates,
  showTemplateList,
  setShowTemplateList,
  printers,
  settings,
  theme,
  themeStyles,
  onLoadTemplate,
  onDeleteTemplate,
}) => {
  const t = useTranslation(settings.language);

  if (!showTemplateList || templates.length === 0) return null;

  return (
    <div style={{ ...themeStyles.card, marginBottom: "24px", maxWidth: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: "18px", 
          fontWeight: "600", 
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
        }}>
          📋 {t("calculator.templates")}
        </h3>
        <button
          onClick={() => setShowTemplateList(false)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {templates.map(template => {
          const printer = printers.find(p => p.id === template.printerId);
          return (
            <div
              key={template.id}
              style={{
                padding: "16px",
                backgroundColor: theme.colors.surfaceHover,
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ 
                    fontSize: "16px", 
                    color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                  }}>{template.name}</strong>
                  {template.description && (
                    <p style={{ 
                      margin: "4px 0 0 0", 
                      fontSize: "12px", 
                      color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textSecondary 
                    }}>
                      {template.description}
                    </p>
                  )}
                  <p style={{ 
                    margin: "8px 0 0 0", 
                    fontSize: "12px", 
                    color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textSecondary 
                  }}>
                    {printer ? `${printer.name} (${printer.type})` : t("calculator.templates.printerMissing")} • {template.selectedFilaments.length} {t("calculator.templates.filamentUnit")} • {template.printTimeHours}h {template.printTimeMinutes}m {template.printTimeSeconds}s
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Tooltip content={t("calculator.tooltip.loadTemplate")}>
                    <button
                      onClick={() => onLoadTemplate(template)}
                      disabled={!printer}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.primary,
                        color: "#fff",
                        fontSize: "12px",
                        cursor: printer ? "pointer" : "not-allowed",
                        opacity: printer ? 1 : 0.5
                      }}
                      aria-label={t("calculator.tooltip.loadTemplate")}
                    >
                      📥
                    </button>
                  </Tooltip>
                  <Tooltip content={t("common.delete")}>
                    <button
                      onClick={() => onDeleteTemplate(template.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.danger,
                        color: "#fff",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                      aria-label={t("common.delete")}
                    >
                      🗑️
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
