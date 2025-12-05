/**
 * FilamentSelector Component
 * Filament választó komponens a Calculator feature-hez
 */

import React from "react";
import type { Filament, Settings } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";
import { validateUsedGrams, validateDryingTime, validateDryingPower } from "../../../utils/validation";
import type { SelectedFilament } from "../types";

interface FilamentSelectorProps {
  filaments: Filament[];
  selectedFilaments: SelectedFilament[];
  maxFilaments: number;
  onAddFilament: () => void;
  onRemoveFilament: (index: number) => void;
  onUpdateFilament: (index: number, field: keyof SelectedFilament, value: any) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  settings: Settings;
  onValidationError: (message: string) => void;
}

/**
 * Filament selector komponens
 */
export const FilamentSelector: React.FC<FilamentSelectorProps> = ({
  filaments,
  selectedFilaments,
  maxFilaments,
  onAddFilament,
  onRemoveFilament,
  onUpdateFilament,
  theme,
  themeStyles,
  settings,
  onValidationError,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div style={{ marginBottom: "20px", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <label style={{ 
          fontWeight: "600", 
          fontSize: "16px", 
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
        }}>
          🧵 {t("calculator.filaments")} ({selectedFilaments.length}/{maxFilaments})
        </label>
        {maxFilaments > 0 && selectedFilaments.length < maxFilaments && (
          <Tooltip content={t("calculator.tooltip.addFilament")}>
            <button 
              onClick={onAddFilament}
              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onAddFilament();
                }
              }}
              style={{ 
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                padding: "10px 20px",
                fontSize: "14px"
              }}
              aria-label={t("calculator.aria.addFilament")}
            >
              ➕ {t("calculator.addFilament")}
            </button>
          </Tooltip>
        )}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "100%", overflow: "hidden" }}>
        {selectedFilaments.map((sf, idx) => (
          <div key={idx} style={{ ...themeStyles.card, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <strong style={{ fontSize: "16px", color: theme.colors.text }}>{t("calculator.filament")} {idx + 1}:</strong>
              <Tooltip content={t("calculator.tooltip.removeFilament")}>
                <button 
                  onClick={() => onRemoveFilament(idx)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRemoveFilament(idx);
                    }
                  }}
                  style={{ 
                    ...themeStyles.button,
                    ...themeStyles.buttonDanger,
                    padding: "8px 16px",
                    fontSize: "12px",
                    flexShrink: 0
                  }}
                  aria-label={`${t("calculator.aria.removeFilament")} ${idx + 1}`}
                >
                  {t("filaments.delete")}
                </button>
              </Tooltip>
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: "1", minWidth: "200px", maxWidth: "100%" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500", 
                  color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                }}>{t("calculator.filament")}:</label>
                <select
                  value={sf.filamentIndex}
                  onChange={e => onUpdateFilament(idx, "filamentIndex", Number(e.target.value))}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.select, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
                >
                  <option value={-1}>{t("calculator.selectFilamentOption")}</option>
                  {filaments.map((f, i) => (
                    <option key={i} value={i}>
                      {f.brand} {f.type} {f.color ? `(${f.color})` : ""} - {f.pricePerKg}€/kg
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flexShrink: 0 }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500", 
                  color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                }}>{t("calculator.usedGrams")}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={sf.usedGrams || ""}
                  onChange={e => {
                    const val = Number(e.target.value);
                    const validation = validateUsedGrams(val, settings.language);
                    if (validation.isValid) {
                      onUpdateFilament(idx, "usedGrams", val);
                    } else if (validation.errorMessage) {
                      onValidationError(validation.errorMessage);
                    }
                  }}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.input, width: "140px", boxSizing: "border-box" }}
                />
              </div>
            </div>
            {/* Szárítás opció minden filamentnél */}
            <div style={{ ...themeStyles.card, padding: "16px", backgroundColor: theme.colors.surfaceHover, marginTop: "16px", maxWidth: "100%", boxSizing: "border-box" }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                fontWeight: "600", 
                marginBottom: "12px", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
              }}>
                <input
                  type="checkbox"
                  checked={sf.needsDrying || false}
                  onChange={e => onUpdateFilament(idx, "needsDrying", e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer", flexShrink: 0 }}
                />
                <span>🌡️ {t("calculator.dryingNeeded")}</span>
              </label>
              {sf.needsDrying && (
                <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                  <div style={{ flex: "1", minWidth: "150px", maxWidth: "100%" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontSize: "14px", 
                      fontWeight: "500", 
                      color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                    }}>{t("calculator.dryingTime")}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={sf.dryingTime || ""}
                      onChange={e => {
                        const val = Number(e.target.value);
                        const validation = validateDryingTime(val, settings.language);
                        if (validation.isValid) {
                          onUpdateFilament(idx, "dryingTime", val);
                        } else if (validation.errorMessage) {
                          onValidationError(validation.errorMessage);
                        }
                      }}
                      onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                      onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                      style={{ ...themeStyles.input, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ flex: "1", minWidth: "150px", maxWidth: "100%" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontSize: "14px", 
                      fontWeight: "500", 
                      color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                    }}>{t("calculator.dryingPower")}</label>
                    <input
                      type="number"
                      min="0"
                      value={sf.dryingPower || ""}
                      onChange={e => {
                        const val = Number(e.target.value);
                        const validation = validateDryingPower(val, settings.language);
                        if (validation.isValid) {
                          onUpdateFilament(idx, "dryingPower", val);
                        } else if (validation.errorMessage) {
                          onValidationError(validation.errorMessage);
                        }
                      }}
                      onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                      onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                      style={{ ...themeStyles.input, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedFilaments.length === 0 && (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px", backgroundColor: theme.colors.surfaceHover }}>
          <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "16px" }}>{t("calculator.selectPrinter")}, {t("calculator.addFilament").toLowerCase()}.</p>
        </div>
      )}
    </div>
  );
};

