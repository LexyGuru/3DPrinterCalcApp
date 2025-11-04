import React from "react";
import type { Settings } from "../types";
import { useTranslation } from "../utils/translations";
import { commonStyles } from "../utils/styles";

interface Props {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
}

export const SettingsPage: React.FC<Props> = ({ settings, onChange }) => {
  const t = useTranslation(settings.language);
  
  // Átalakítjuk az áramárat megjelenítéshez (Ft/kWh -> választott pénznem)
  const getDisplayElectricityPrice = (): number => {
    // Az electricityPrice mindig Ft/kWh-ban van tárolva
    // Konvertáljuk a választott pénznemre: 400 Ft = 1 EUR, 1 EUR = 1.10 USD
    if (settings.currency === "HUF") {
      return settings.electricityPrice;
    } else if (settings.currency === "EUR") {
      return settings.electricityPrice / 400;
    } else { // USD
      return (settings.electricityPrice / 400) * 1.10;
    }
  };

  // Konvertáljuk vissza Ft/kWh-ba amikor a felhasználó megadja az értéket
  const convertElectricityPriceToHUF = (value: number): number => {
    if (settings.currency === "HUF") {
      return value;
    } else if (settings.currency === "EUR") {
      return value * 400;
    } else { // USD
      return (value / 1.10) * 400;
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Settings["currency"];
    // Pénznem váltáskor az áram árat is át kell konvertálni
    // Az új pénznemben ugyanazt az értéket mutatjuk
    onChange({ ...settings, currency: newCurrency });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...settings, language: e.target.value as Settings["language"] });
  };

  const handleElectricityPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = Number(e.target.value);
    // Konvertáljuk Ft/kWh-ba tároláshoz
    const priceInHUF = convertElectricityPriceToHUF(displayValue);
    onChange({ ...settings, electricityPrice: priceInHUF });
  };

  return (
    <div>
      <h2 style={commonStyles.pageTitle}>{t("settings.title")}</h2>
      <p style={commonStyles.pageSubtitle}>Alkalmazás beállítások kezelése</p>
      
      <div style={{ ...commonStyles.card }}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: "#495057" }}>
            🌐 {t("settings.language")}
          </label>
          <select 
            value={settings.language} 
            onChange={handleLanguageChange}
            onFocus={(e) => Object.assign(e.target.style, commonStyles.selectFocus)}
            onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
            style={{ ...commonStyles.select, width: "100%", maxWidth: "300px" }}
          >
            <option value="hu">🇭🇺 Magyar</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: "#495057" }}>
            💰 {t("settings.currency")}
          </label>
          <select 
            value={settings.currency} 
            onChange={handleCurrencyChange}
            onFocus={(e) => Object.assign(e.target.style, commonStyles.selectFocus)}
            onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
            style={{ ...commonStyles.select, width: "100%", maxWidth: "300px" }}
          >
            <option value="EUR">EUR (€)</option>
            <option value="HUF">HUF (Ft)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: "#495057" }}>
            ⚡ {t("settings.electricityPrice")} ({settings.currency === "HUF" ? "Ft" : settings.currency === "EUR" ? "€" : "$"}/kWh)
          </label>
          <input 
            type="number" 
            step="0.01"
            value={getDisplayElectricityPrice()} 
            onChange={handleElectricityPriceChange}
            onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
            onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
            style={{ ...commonStyles.input, width: "100%", maxWidth: "300px" }}
            placeholder="Pl: 70"
          />
          <p style={{ marginTop: "8px", fontSize: "12px", color: "#6c757d" }}>
            Az áram ár mindig Ft/kWh-ban van tárolva, de a választott pénznemben jelenik meg.
          </p>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", fontSize: "16px", color: "#495057", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={settings.checkForBetaUpdates || false}
              onChange={e => onChange({ ...settings, checkForBetaUpdates: e.target.checked })}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>🔬 {t("settings.checkForBetaUpdates")}</span>
          </label>
          <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: "#6c757d" }}>
            {t("settings.checkForBetaUpdatesDescription")}
          </p>
        </div>
      </div>
    </div>
  );
};
