/**
 * CalculationResults Component
 * Eredmények megjelenítése a Calculator feature-hez
 */

import React from "react";
import type { Settings } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";
import type { CalculationResult, SelectedFilament } from "../types";

interface CalculationResultsProps {
  calculations: CalculationResult | null;
  selectedFilaments: SelectedFilament[];
  hasSelectedPrinter: boolean;
  currency: string;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  settings: Settings;
  onSaveOffer?: () => void;
}

/**
 * Calculation results komponens
 */
export const CalculationResults: React.FC<CalculationResultsProps> = ({
  calculations,
  selectedFilaments,
  hasSelectedPrinter,
  currency,
  theme,
  themeStyles,
  settings,
  onSaveOffer,
}) => {
  const t = useTranslation(settings.language);

  // Ha nincs számítás vagy nincs kiválasztott nyomtató/filament, üres állapotot jelenítünk meg
  if (!hasSelectedPrinter || selectedFilaments.length === 0 || !calculations) {
    return (
      <div style={{ 
        ...themeStyles.card,
        marginTop: "30px",
        textAlign: "center",
        padding: "40px",
        backgroundColor: theme.colors.surfaceHover
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
        <p style={{ 
          margin: 0, 
          color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, 
          fontSize: "16px" 
        }}>
          {!hasSelectedPrinter 
            ? t("calculator.selectPrinter")
            : selectedFilaments.length === 0
            ? t("calculator.addFilament")
            : t("calculator.fillFields")
          }
        </p>
      </div>
    );
  }

  const hasDrying = selectedFilaments.some(
    sf => sf.needsDrying && sf.dryingTime && sf.dryingTime > 0 && sf.dryingPower && sf.dryingPower > 0
  );

  const currencySymbol = currency === "HUF" ? "Ft" : currency;

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
          💰 {t("calculator.costBreakdown")} ({currency})
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
          <strong style={{ fontSize: "16px", color: theme.colors.success }}>
            {calculations.filamentCost.toFixed(2)} {currencySymbol}
          </strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
          <span style={{ 
            fontSize: "14px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>{t("calculator.electricityCost")}</span>
          <strong style={{ fontSize: "16px", color: "#ffc107" }}>
            {calculations.electricityCost.toFixed(2)} {currencySymbol}
          </strong>
        </div>
        {hasDrying && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
            <span style={{ 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
            }}>{t("calculator.dryingCost")}</span>
            <strong style={{ fontSize: "16px", color: theme.colors.primary }}>
              {calculations.totalDryingCost.toFixed(2)} {currencySymbol}
            </strong>
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
          }}>
            {calculations.usageCost.toFixed(2)} {currencySymbol}
          </strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.5em", fontWeight: "bold", paddingTop: "16px", backgroundColor: theme.colors.surfaceHover, padding: "16px", borderRadius: "8px", marginTop: "8px" }}>
          <span style={{ 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>{t("calculator.totalCost")}</span>
          <strong style={{ color: theme.colors.primary }}>
            {calculations.totalCost.toFixed(2)} {currencySymbol}
          </strong>
        </div>
      </div>
    </div>
  );
};

