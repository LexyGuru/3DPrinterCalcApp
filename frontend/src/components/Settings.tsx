import React, { useState } from "react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { Settings, Printer, Filament, Offer } from "../types";
import { useTranslation } from "../utils/translations";
import { useToast } from "./Toast";
import { themes, type ThemeName, type Theme } from "../utils/themes";
import { createBackup, restoreBackup } from "../utils/backup";
import { ShortcutHelp } from "./ShortcutHelp";
import { Tooltip } from "./Tooltip";
import { VersionHistory } from "./VersionHistory";

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
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "display" | "advanced" | "data">("general");
  
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
      console.log("📤 Export indítása...", { 
        filaments: exportFilaments, 
        printers: exportPrinters, 
        offers: exportOffers 
      });
      
      const exportData: any = {};
      if (exportFilaments) exportData.filaments = filaments;
      if (exportPrinters) exportData.printers = printers;
      if (exportOffers) exportData.offers = offers;

      const jsonContent = JSON.stringify(exportData, null, 2);
      console.log("📊 Export adatok előkészítve", {
        filamentsCount: exportData.filaments?.length || 0,
        printersCount: exportData.printers?.length || 0,
        offersCount: exportData.offers?.length || 0,
        jsonSize: jsonContent.length
      });

      const filePath = await save({
        defaultPath: "3DPrinterCalcApp_export.json",
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }]
      });

      if (filePath) {
        console.log("💾 Fájl mentése...", { filePath });
        await writeTextFile(filePath, jsonContent);
        console.log("✅ Export sikeres", { filePath });
        showToast(t("settings.exportSuccess"), "success");
        // Reset checkboxes
        setExportFilaments(false);
        setExportPrinters(false);
        setExportOffers(false);
      } else {
        console.log("ℹ️ Export megszakítva (felhasználó megszakította)");
        // User cancelled the save dialog
        return;
      }
    } catch (error) {
      console.error("❌ Export hiba:", error);
      showToast(t("settings.exportError"), "error");
    }
  };

  const handleImport = async () => {
    if (!importFilaments && !importPrinters && !importOffers) {
      showToast(t("settings.importError") + ": " + (settings.language === "hu" ? "Válassz ki legalább egy elemet!" : settings.language === "de" ? "Wählen Sie mindestens ein Element aus!" : "Select at least one item!"), "error");
      return;
    }

    try {
      console.log("📥 Import indítása...", { 
        filaments: importFilaments, 
        printers: importPrinters, 
        offers: importOffers 
      });
      
      const selected = await open({
        multiple: false,
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }]
      });

      if (!selected) {
        console.log("ℹ️ Import megszakítva (felhasználó megszakította)");
        // User cancelled the open dialog
        return;
      }

      // Handle both string (single file) and array (multiple files) cases
      const filePath = Array.isArray(selected) ? selected[0] : selected;
      
      if (!filePath || typeof filePath !== "string") {
        console.error("❌ Érvénytelen fájl kiválasztás");
        showToast(t("settings.noFileSelected"), "error");
        return;
      }

      console.log("📂 Fájl betöltése...", { filePath });
      const fileContent = await readTextFile(filePath);
      const importData = JSON.parse(fileContent);
      console.log("📊 Import adatok betöltve", {
        filamentsCount: importData.filaments?.length || 0,
        printersCount: importData.printers?.length || 0,
        offersCount: importData.offers?.length || 0
      });

      // Validate and import data
      if (importFilaments && importData.filaments) {
        if (Array.isArray(importData.filaments)) {
          console.log("✅ Filamentek importálása...", { count: importData.filaments.length });
          setFilaments(importData.filaments);
        } else {
          throw new Error("Invalid filaments data");
        }
      }

      if (importPrinters && importData.printers) {
        if (Array.isArray(importData.printers)) {
          console.log("✅ Nyomtatók importálása...", { count: importData.printers.length });
          setPrinters(importData.printers);
        } else {
          throw new Error("Invalid printers data");
        }
      }

      if (importOffers && importData.offers) {
        if (Array.isArray(importData.offers)) {
          console.log("✅ Árajánlatok importálása...", { count: importData.offers.length });
          setOffers(importData.offers);
        } else {
          throw new Error("Invalid offers data");
        }
      }

      console.log("✅ Import sikeres");
      showToast(t("settings.importSuccess"), "success");
      // Reset checkboxes
      setImportFilaments(false);
      setImportPrinters(false);
      setImportOffers(false);
    } catch (error) {
      console.error("❌ Import hiba:", error);
      showToast(t("settings.importError") + ": " + (settings.language === "hu" ? "Érvénytelen fájl formátum!" : settings.language === "de" ? "Ungültiges Dateiformat!" : "Invalid file format!"), "error");
    }
  };

  // Tab style
  const tabButtonStyle = (isActive: boolean) => ({
    padding: "12px 24px",
    border: "none",
    borderBottom: isActive ? `3px solid ${theme.colors.primary}` : `3px solid transparent`,
    backgroundColor: isActive ? theme.colors.surfaceHover : "transparent",
    color: isActive ? theme.colors.primary : theme.colors.text,
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "600" : "500",
    transition: "all 0.2s",
    borderRadius: "4px 4px 0 0",
  });

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("settings.title")}</h2>
      <p style={themeStyles.pageSubtitle}>
        {settings.language === "hu" ? "Alkalmazás beállítások kezelése" : settings.language === "de" ? "Anwendungseinstellungen verwalten" : "Manage application settings"}
      </p>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        gap: "8px", 
        marginBottom: "0",
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.surface,
        borderRadius: "8px 8px 0 0",
        overflow: "auto",
      }}>
        <button
          onClick={() => setActiveTab("general")}
          style={tabButtonStyle(activeTab === "general")}
          onMouseEnter={(e) => {
            if (activeTab !== "general") {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "general") {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          ⚙️ {settings.language === "hu" ? "Általános" : settings.language === "de" ? "Allgemein" : "General"}
        </button>
        <button
          onClick={() => setActiveTab("display")}
          style={tabButtonStyle(activeTab === "display")}
          onMouseEnter={(e) => {
            if (activeTab !== "display") {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "display") {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          🎨 {settings.language === "hu" ? "Megjelenés" : settings.language === "de" ? "Aussehen" : "Appearance"}
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          style={tabButtonStyle(activeTab === "advanced")}
          onMouseEnter={(e) => {
            if (activeTab !== "advanced") {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "advanced") {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          🔧 {settings.language === "hu" ? "Speciális" : settings.language === "de" ? "Erweitert" : "Advanced"}
        </button>
        <button
          onClick={() => setActiveTab("data")}
          style={tabButtonStyle(activeTab === "data")}
          onMouseEnter={(e) => {
            if (activeTab !== "data") {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "data") {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          💾 {settings.language === "hu" ? "Adatkezelés" : settings.language === "de" ? "Datenverwaltung" : "Data Management"}
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ ...themeStyles.card, borderRadius: "0 8px 8px 8px", marginTop: "0" }}>
        
        {/* General Tab */}
        {activeTab === "general" && (
          <div>
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={t("settings.language") + " - " + (settings.language === "hu" ? "Válaszd ki az alkalmazás nyelvét" : settings.language === "de" ? "Wähle die Sprache der Anwendung" : "Choose the application language")}>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, width: "fit-content" }}>
              🌐 {t("settings.language")}
            </label>
          </Tooltip>
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
          <Tooltip content={settings.language === "hu" ? "Válaszd ki a pénznemet az árak megjelenítéséhez" : settings.language === "de" ? "Wählen Sie die Währung für die Preisanzeige" : "Choose the currency for price display"}>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, width: "fit-content" }}>
              💰 {t("settings.currency")}
            </label>
          </Tooltip>
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
          <Tooltip content={settings.language === "hu" ? "Adja meg az áram árát kilowattóránként" : settings.language === "de" ? "Geben Sie den Strompreis pro Kilowattstunde ein" : "Enter the electricity price per kilowatt hour"}>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, width: "fit-content" }}>
              ⚡ {t("settings.electricityPrice")} ({settings.currency === "HUF" ? "Ft" : settings.currency === "EUR" ? "€" : "$"}/kWh)
            </label>
          </Tooltip>
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
            {settings.language === "hu" ? "Az áram ár mindig Ft/kWh-ban van tárolva, de a választott pénznemben jelenik meg." : settings.language === "de" ? "Der Strompreis wird immer in Ft/kWh gespeichert, wird aber in der gewählten Währung angezeigt." : "The electricity price is always stored in Ft/kWh, but displayed in the selected currency."}
          </p>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={t("settings.checkForBetaUpdatesDescription")}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.checkForBetaUpdates || false}
                onChange={e => onChange({ ...settings, checkForBetaUpdates: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🔬 {t("settings.checkForBetaUpdates")}</span>
            </label>
          </Tooltip>
          <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.checkForBetaUpdatesDescription")}
          </p>
        </div>
        
        <div style={{ marginBottom: "0" }}>
          <Tooltip content={t("settings.showConsoleDescription")}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.showConsole || false}
                onChange={e => onChange({ ...settings, showConsole: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🖥️ {t("settings.showConsole")}</span>
            </label>
          </Tooltip>
          <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.showConsoleDescription")}
          </p>
        </div>
          </div>
        )}

        {/* Display Tab */}
        {activeTab === "display" && (
          <div>
        <div style={{ marginBottom: "0" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text }}>
            🎨 {t("settings.theme")}
          </label>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {(["light", "dark", "blue", "green", "purple", "orange"] as ThemeName[]).map((themeName) => {
              const themeOption = themes[themeName];
              const isSelected = (settings.theme || "light") === themeName;
              return (
                <button
                  key={themeName}
                  onClick={() => onChange({ ...settings, theme: themeName })}
                  style={{
                    ...themeStyles.button,
                    backgroundColor: isSelected ? themeOption.colors.primary : themeOption.colors.surface,
                    color: isSelected ? "#fff" : themeOption.colors.text,
                    border: `2px solid ${isSelected ? themeOption.colors.primary : themeOption.colors.border}`,
                    padding: "16px 20px",
                    flex: "1",
                    minWidth: "120px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: isSelected ? `0 4px 12px ${themeOption.colors.shadow}` : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = themeOption.colors.surfaceHover;
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = themeOption.colors.surface;
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
                    {themeOption.displayName[settings.language]}
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
        )}

        {/* Advanced Tab */}
        {activeTab === "advanced" && (
          <div>
        {/* Automatikus mentés */}
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={t("settings.autosaveDescription")}>
            <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settings.autosave !== false}
                onChange={e => onChange({ ...settings, autosave: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>💾 {t("settings.autosave")}</span>
            </label>
          </Tooltip>
          <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.autosaveDescription")}
          </p>
          {settings.autosave !== false && (
            <div style={{ marginTop: "12px", marginLeft: "32px" }}>
              <Tooltip content={t("settings.autosaveIntervalDescription")}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: theme.colors.text }}>
                  {t("settings.autosaveInterval")}
                </label>
              </Tooltip>
              <input
                type="number"
                min="5"
                value={settings.autosaveInterval || 30}
                onChange={e => onChange({ ...settings, autosaveInterval: Math.max(5, Number(e.target.value)) })}
                style={{
                  width: "100px",
                  padding: "8px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "14px",
                }}
              />
              <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
                {t("settings.autosaveIntervalDescription")}
              </p>
            </div>
          )}
        </div>

        {/* Értesítések */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={settings.notificationEnabled !== false}
              onChange={e => onChange({ ...settings, notificationEnabled: e.target.checked })}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>🔔 {t("settings.notificationEnabled")}</span>
          </label>
          <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.notificationEnabledDescription")}
          </p>
          {settings.notificationEnabled !== false && (
            <div style={{ marginTop: "12px", marginLeft: "32px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: theme.colors.text }}>
                {t("settings.notificationDuration")}
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={settings.notificationDuration || 3000}
                onChange={e => onChange({ ...settings, notificationDuration: Math.max(1000, Number(e.target.value)) })}
                style={{
                  width: "100px",
                  padding: "8px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "14px",
                }}
              />
              <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
                {t("settings.notificationDurationDescription")}
              </p>
            </div>
          )}
        </div>

        {/* Gyorsbillentyűk és Információk */}
        <div style={{ marginBottom: "0" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text }}>
            ⚙️ {settings.language === "hu" ? "Egyéb beállítások" : settings.language === "de" ? "Sonstige Einstellungen" : "Other Settings"}
          </label>
          <p style={{ marginBottom: "16px", fontSize: "12px", color: theme.colors.textMuted }}>
            {settings.language === "hu" ? "Gyorsbillentyűk megtekintése és verzió előzmények" : settings.language === "de" ? "Tastaturkürzel anzeigen und Versionsverlauf" : "View keyboard shortcuts and version history"}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Tooltip content={t("settings.shortcutsDescription")}>
              <button
                onClick={() => setShowShortcutHelp(true)}
                style={{
                  ...themeStyles.button,
                  flex: 1,
                  minWidth: "180px",
                }}
              >
                ⌨️ {t("shortcuts.title")}
              </button>
            </Tooltip>
            <Tooltip content={settings.language === "hu" ? "Verzió előzmények megjelenítése" : settings.language === "de" ? "Versionsverlauf anzeigen" : "Show version history"}>
              <button
                onClick={() => setShowVersionHistory(true)}
                style={{
                  ...themeStyles.button,
                  flex: 1,
                  minWidth: "180px",
                }}
              >
                📋 {settings.language === "hu" ? "Verzió előzmények" : settings.language === "de" ? "Versionsverlauf" : "Version History"}
              </button>
            </Tooltip>
          </div>
        </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === "data" && (
          <div>
        {/* Backup */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "18px", color: theme.colors.text }}>
            💾 {t("settings.backup")}
          </label>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
            {settings.language === "hu" ? "Készíts biztonsági mentést az összes adatról vagy állítsd vissza egy korábbi állapotot" : settings.language === "de" ? "Erstellen Sie eine Sicherungskopie aller Daten oder stellen Sie einen früheren Zustand wieder her" : "Create a backup of all data or restore a previous state"}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Tooltip content={settings.language === "hu" ? "Mentés az összes adatot egy JSON fájlba" : settings.language === "de" ? "Speichern Sie alle Daten in einer JSON-Datei" : "Save all data to a JSON file"}>
              <button
                onClick={async () => {
                  try {
                    const filePath = await createBackup(printers, filaments, offers, settings);
                    if (filePath) {
                      showToast(t("backup.createSuccess"), "success");
                    }
                  } catch (error) {
                    showToast(t("backup.restoreError"), "error");
                  }
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonPrimary,
                  flex: 1,
                  minWidth: "180px",
                }}
              >
                💾 {t("settings.backupCreate")}
              </button>
            </Tooltip>
            <Tooltip content={settings.language === "hu" ? "Visszaállítás egy korábbi backup fájlból" : settings.language === "de" ? "Wiederherstellen aus einer früheren Backup-Datei" : "Restore from a previous backup file"}>
              <button
                onClick={async () => {
                  try {
                    if (confirm(t("backup.confirmRestore"))) {
                      const backupData = await restoreBackup();
                      if (backupData) {
                        if (backupData.printers) setPrinters(backupData.printers);
                        if (backupData.filaments) setFilaments(backupData.filaments);
                        if (backupData.offers) setOffers(backupData.offers);
                        if (backupData.settings) onChange(backupData.settings);
                        showToast(t("backup.restoreSuccess"), "success");
                      }
                    }
                  } catch (error) {
                    showToast(t("backup.restoreError"), "error");
                  }
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSuccess,
                  flex: 1,
                  minWidth: "180px",
                }}
              >
                📥 {t("settings.backupRestore")}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Export/Import Data Section - 2 oszlop */}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
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

          <Tooltip content={settings.language === "hu" ? "Adatok exportálása JSON fájlba" : settings.language === "de" ? "Daten in JSON-Datei exportieren" : "Export data to JSON file"}>
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
          </Tooltip>
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

          <Tooltip content={settings.language === "hu" ? "Adatok importálása JSON fájlból" : settings.language === "de" ? "Daten aus JSON-Datei importieren" : "Import data from JSON file"}>
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
          </Tooltip>
          </div>
        </div>
          </div>
        )}
      </div>
      
      {showShortcutHelp && (
        <ShortcutHelp
          settings={settings}
          theme={theme}
          themeStyles={themeStyles}
          onClose={() => setShowShortcutHelp(false)}
        />
      )}
      {showVersionHistory && (
        <VersionHistory
          settings={settings}
          theme={theme}
          onClose={() => setShowVersionHistory(false)}
          isBeta={import.meta.env.VITE_IS_BETA === 'true'}
        />
      )}
    </div>
  );
};
