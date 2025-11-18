import React from "react";
import type { Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";
import { Tooltip } from "../Tooltip";

interface CalculationResults {
  filamentCost: number;
  electricityCost: number;
  totalDryingCost: number;
  usageCost: number;
  totalCost: number;
}

interface Props {
  calculations: CalculationResults;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
  onSaveOffer?: () => void;
  selectedFilaments: Array<{ needsDrying?: boolean; dryingTime?: number; dryingPower?: number }>;
}

export const CalculationResults: React.FC<Props> = ({
  calculations,
  settings,
  theme,
  themeStyles,
  onSaveOffer,
  selectedFilaments,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div style={{ 
      ...themeStyles.card,
      marginTop: "30px",
      maxWidth: "100%",
      boxSizing: "border-box",
      overflow: "hidden"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: "20px", 
          fontWeight: "600", 
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
        }}>
          💰 {t("calculator.costBreakdown")} ({settings.currency})
        </h3>
        {onSaveOffer && (
          <Tooltip content={t("calculator.tooltip.saveAsOffer")}>
            <button
              onClick={onSaveOffer}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSaveOffer();
                }
              }}
              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonSuccess
              }}
              aria-label={t("calculator.aria.saveOffer")}
            >
              {t("calculator.saveAsOffer")}
            </button>
          </Tooltip>
        )}
      </div>
      <div style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
          <span style={{ 
            fontSize: "14px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>{t("calculator.filamentCost")}</span>
          <strong style={{ fontSize: "16px", color: theme.colors.success }}>{calculations.filamentCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
          <span style={{ 
            fontSize: "14px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>{t("calculator.electricityCost")}</span>
          <strong style={{ fontSize: "16px", color: "#ffc107" }}>{calculations.electricityCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
        </div>
        {selectedFilaments.some(sf => sf.needsDrying && sf.dryingTime && sf.dryingTime > 0 && sf.dryingPower && sf.dryingPower > 0) && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
            <span style={{ 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
            }}>{t("calculator.dryingCost")}</span>
            <strong style={{ fontSize: "16px", color: theme.colors.primary }}>{calculations.totalDryingCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "16px", borderBottom: `2px solid ${theme.colors.border}` }}>
          <span style={{ 
            fontSize: "14px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>{t("calculator.usageCost")}</span>
          <strong style={{ 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted 
          }}>{calculations.usageCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.5em", fontWeight: "bold", paddingTop: "16px", backgroundColor: theme.colors.surfaceHover, padding: "16px", borderRadius: "8px", marginTop: "8px" }}>
          <span style={{ 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>{t("calculator.totalCost")}</span>
          <strong style={{ color: theme.colors.primary }}>{calculations.totalCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
        </div>
      </div>
    </div>
  );
};
