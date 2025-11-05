import React, { useState } from "react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { Settings, Printer, Filament, Offer } from "../types";
import { useTranslation } from "../utils/translations";
import { useToast } from "./Toast";
import { themes, type ThemeName, type Theme } from "../utils/themes";

interface Props {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
  printers: Printer[];
  setPrinters: (printers: Printer[]) => void;
  filaments: Filament[];
  setFilaments: (filaments: Filament[]) => void;
  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const SettingsPage: React.FC<Props> = ({ 
  settings, 
  onChange,
  printers,
  setPrinters,
  filaments,
  setFilaments,
  offers,
  setOffers,
  theme,
  themeStyles
}) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [exportFilaments, setExportFilaments] = useState(false);
  const [exportPrinters, setExportPrinters] = useState(false);
  const [exportOffers, setExportOffers] = useState(false);
  const [importFilaments, setImportFilaments] = useState(false);
  const [importPrinters, setImportPrinters] = useState(false);
  const [importOffers, setImportOffers] = useState(false);
  
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

  const handleExport = async () => {
    if (!exportFilaments && !exportPrinters && !exportOffers) {
      showToast(t("settings.exportError") + ": " + (settings.language === "hu" ? "Válassz ki legalább egy elemet!" : settings.language === "de" ? "Wählen Sie mindestens ein Element aus!" : "Select at least one item!"), "error");
      return;
    }

    try {
      const exportData: any = {};
      if (exportFilaments) exportData.filaments = filaments;
      if (exportPrinters) exportData.printers = printers;
      if (exportOffers) exportData.offers = offers;

      const jsonContent = JSON.stringify(exportData, null, 2);

      const filePath = await save({
        defaultPath: "3DPrinterCalcApp_export.json",
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }]
      });

      if (filePath) {
        await writeTextFile(filePath, jsonContent);
        showToast(t("settings.exportSuccess"), "success");
        // Reset checkboxes
        setExportFilaments(false);
        setExportPrinters(false);
        setExportOffers(false);
      } else {
        // User cancelled the save dialog
        return;
      }
    } catch (error) {
      console.error("Export error:", error);
      showToast(t("settings.exportError"), "error");
    }
  };

  const handleImport = async () => {
    if (!importFilaments && !importPrinters && !importOffers) {
      showToast(t("settings.importError") + ": " + (settings.language === "hu" ? "Válassz ki legalább egy elemet!" : settings.language === "de" ? "Wählen Sie mindestens ein Element aus!" : "Select at least one item!"), "error");
      return;
    }

    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }]
      });

      if (!selected) {
        // User cancelled the open dialog
        return;
      }

      // Handle both string (single file) and array (multiple files) cases
      const filePath = Array.isArray(selected) ? selected[0] : selected;
      
      if (!filePath || typeof filePath !== "string") {
        showToast(t("settings.noFileSelected"), "error");
        return;
      }

      const fileContent = await readTextFile(filePath);
      const importData = JSON.parse(fileContent);

      // Validate and import data
      if (importFilaments && importData.filaments) {
        if (Array.isArray(importData.filaments)) {
          setFilaments(importData.filaments);
        } else {
          throw new Error("Invalid filaments data");
        }
      }

      if (importPrinters && importData.printers) {
        if (Array.isArray(importData.printers)) {
          setPrinters(importData.printers);
        } else {
          throw new Error("Invalid printers data");
        }
      }

      if (importOffers && importData.offers) {
        if (Array.isArray(importData.offers)) {
          setOffers(importData.offers);
        } else {
          throw new Error("Invalid offers data");
        }
      }

      showToast(t("settings.importSuccess"), "success");
      // Reset checkboxes
      setImportFilaments(false);
      setImportPrinters(false);
      setImportOffers(false);
    } catch (error) {
      console.error("Import error:", error);
      showToast(t("settings.importError") + ": " + (settings.language === "hu" ? "Érvénytelen fájl formátum!" : settings.language === "de" ? "Ungültiges Dateiformat!" : "Invalid file format!"), "error");
    }
  };

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("settings.title")}</h2>
      <p style={themeStyles.pageSubtitle}>Alkalmazás beállítások kezelése</p>
      
      <div style={{ ...themeStyles.card }}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text }}>
            🌐 {t("settings.language")}
          </label>
          <select 
            value={settings.language} 
            onChange={handleLanguageChange}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.select, width: "100%", maxWidth: "300px" }}
          >
            <option value="hu">🇭🇺 Magyar</option>
            <option value="de">🇩🇪 Deutsch</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text }}>
            💰 {t("settings.currency")}
          </label>
          <select 
            value={settings.currency} 
            onChange={handleCurrencyChange}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.select, width: "100%", maxWidth: "300px" }}
          >
            <option value="EUR">EUR (€)</option>
            <option value="HUF">HUF (Ft)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text }}>
            ⚡ {t("settings.electricityPrice")} ({settings.currency === "HUF" ? "Ft" : settings.currency === "EUR" ? "€" : "$"}/kWh)
          </label>
          <input 
            type="number" 
            step="0.01"
            value={getDisplayElectricityPrice()} 
            onChange={handleElectricityPriceChange}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.input, width: "100%", maxWidth: "300px" }}
            placeholder="Pl: 70"
          />
          <p style={{ marginTop: "8px", fontSize: "12px", color: theme.colors.textMuted }}>
            Az áram ár mindig Ft/kWh-ban van tárolva, de a választott pénznemben jelenik meg.
          </p>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={settings.checkForBetaUpdates || false}
              onChange={e => onChange({ ...settings, checkForBetaUpdates: e.target.checked })}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>🔬 {t("settings.checkForBetaUpdates")}</span>
          </label>
          <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.checkForBetaUpdatesDescription")}
          </p>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text }}>
            🎨 {t("settings.theme")}
          </label>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {(["light", "dark", "blue", "green", "purple", "orange"] as ThemeName[]).map((themeName) => {
              const theme = themes[themeName];
              const isSelected = (settings.theme || "light") === themeName;
              return (
                <button
                  key={themeName}
                  onClick={() => onChange({ ...settings, theme: themeName })}
                  style={{
                    ...themeStyles.button,
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    color: isSelected ? "#fff" : theme.colors.text,
                    border: `2px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
                    padding: "16px 20px",
                    flex: "1",
                    minWidth: "120px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: isSelected ? `0 4px 12px ${theme.colors.shadow}` : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}
                >
                  <span style={{ fontSize: "24px" }}>
                    {themeName === "light" && "☀️"}
                    {themeName === "dark" && "🌙"}
                    {themeName === "blue" && "💙"}
                    {themeName === "green" && "💚"}
                    {themeName === "purple" && "💜"}
                    {themeName === "orange" && "🧡"}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>
                    {theme.displayName[settings.language]}
                  </span>
                  {isSelected && <span style={{ fontSize: "12px" }}>✓</span>}
                </button>
              );
            })}
          </div>
          <p style={{ marginTop: "12px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.themeDescription")}
          </p>
        </div>
      </div>

      {/* Export/Import Data Section - 2 oszlop */}
      <div style={{ display: "flex", gap: "24px", marginTop: "24px", flexWrap: "wrap" }}>
        {/* Export Data Section */}
        <div style={{ ...themeStyles.card, flex: "1", minWidth: "400px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
            💾 {t("settings.exportTitle")}
          </h3>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
            {t("settings.exportDescription")}
          </p>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "500", fontSize: "14px", color: theme.colors.text, cursor: "pointer", marginBottom: "12px" }}>
              <input
                type="checkbox"
                checked={exportFilaments}
                onChange={e => setExportFilaments(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🧵 {t("settings.exportFilaments")} ({filaments.length})</span>
            </label>
            
            <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "500", fontSize: "14px", color: theme.colors.text, cursor: "pointer", marginBottom: "12px" }}>
              <input
                type="checkbox"
                checked={exportPrinters}
                onChange={e => setExportPrinters(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🖨️ {t("settings.exportPrinters")} ({printers.length})</span>
            </label>
            
            <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "500", fontSize: "14px", color: theme.colors.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={exportOffers}
                onChange={e => setExportOffers(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>📄 {t("settings.exportOffers")} ({offers.length})</span>
            </label>
          </div>

          <button
            onClick={handleExport}
            onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
            onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonPrimary,
              width: "100%"
            }}
          >
            {t("settings.exportButton")}
          </button>
        </div>

        {/* Import Data Section */}
        <div style={{ ...themeStyles.card, flex: "1", minWidth: "400px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
            📥 {t("settings.importTitle")}
          </h3>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
            {t("settings.importDescription")}
          </p>
          <p style={{ marginBottom: "16px", fontSize: "12px", color: "#dc3545", fontWeight: "600" }}>
            ⚠️ {settings.language === "hu" ? "Figyelem: Az importálás felülírja a jelenlegi adatokat!" : settings.language === "de" ? "Warnung: Der Import überschreibt die aktuellen Daten!" : "Warning: Import will overwrite current data!"}
          </p>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "500", fontSize: "14px", color: theme.colors.text, cursor: "pointer", marginBottom: "12px" }}>
              <input
                type="checkbox"
                checked={importFilaments}
                onChange={e => setImportFilaments(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🧵 {t("settings.importFilaments")}</span>
            </label>
            
            <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "500", fontSize: "14px", color: theme.colors.text, cursor: "pointer", marginBottom: "12px" }}>
              <input
                type="checkbox"
                checked={importPrinters}
                onChange={e => setImportPrinters(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🖨️ {t("settings.importPrinters")}</span>
            </label>
            
            <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "500", fontSize: "14px", color: theme.colors.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={importOffers}
                onChange={e => setImportOffers(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>📄 {t("settings.importOffers")}</span>
            </label>
          </div>

          <button
            onClick={handleImport}
            onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
            onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonSuccess,
              width: "100%"
            }}
          >
            {t("settings.importButton")}
          </button>
        </div>
      </div>
    </div>
  );
};
