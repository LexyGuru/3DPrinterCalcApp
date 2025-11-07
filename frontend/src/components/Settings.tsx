import React, { useRef, useState } from "react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { Settings, Printer, Filament, Offer, CompanyInfo, PdfTemplate } from "../types";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const companyInfo: CompanyInfo = settings.companyInfo ?? {};
  const pdfTemplate: PdfTemplate = settings.pdfTemplate ?? "modern";
  const localize = (hu: string, de: string, en: string) =>
    settings.language === "hu" ? hu : settings.language === "de" ? de : en;
  
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

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    onChange({
      ...settings,
      companyInfo: {
        ...companyInfo,
        [field]: value,
      },
    });
  };

  const optimizeImage = (
    base64: string,
    maxWidth: number = 512,
    maxHeight: number = 512,
    quality: number = 0.85
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const optimizedBase64 = canvas.toDataURL("image/png", quality);
          resolve(optimizedBase64);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = base64;
    });
  };

  const handleCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(
        settings.language === "hu"
          ? "Csak kép feltöltése engedélyezett."
          : settings.language === "de"
          ? "Es können nur Bilddateien hochgeladen werden."
          : "Only image files can be uploaded.",
        "error"
      );
      e.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast(
        settings.language === "hu"
          ? "A logo mérete nem haladhatja meg a 4 MB-ot."
          : settings.language === "de"
          ? "Das Logo darf 4 MB nicht überschreiten."
          : "Logo size cannot exceed 4 MB.",
        "error"
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      try {
        const optimized = await optimizeImage(result);
        onChange({
          ...settings,
          companyInfo: {
            ...companyInfo,
            logoBase64: optimized,
          },
        });
        showToast(
          settings.language === "hu"
            ? "Logo sikeresen frissítve."
            : settings.language === "de"
            ? "Logo erfolgreich aktualisiert."
            : "Logo updated successfully.",
          "success"
        );
      } catch (error) {
        console.error("❌ Logo optimalizálási hiba:", error);
        showToast(
          settings.language === "hu"
            ? "Hiba történt a logo feldolgozásakor."
            : settings.language === "de"
            ? "Bei der Verarbeitung des Logos ist ein Fehler aufgetreten."
            : "An error occurred while processing the logo.",
          "error"
        );
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCompanyLogo = () => {
    onChange({
      ...settings,
      companyInfo: {
        ...companyInfo,
        logoBase64: undefined,
      },
    });
    showToast(
      settings.language === "hu"
        ? "Logo eltávolítva."
        : settings.language === "de"
        ? "Logo entfernt."
        : "Logo removed.",
      "success"
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePdfTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...settings,
      pdfTemplate: e.target.value as PdfTemplate,
    });
  };

  const pdfTemplateOptions: Array<{ value: PdfTemplate; label: string; description: string }> = [
    {
      value: "modern",
      label:
        settings.language === "hu"
          ? "Modern"
          : settings.language === "de"
          ? "Modern"
          : "Modern",
      description:
        settings.language === "hu"
          ? "Színes kiemelések, letisztult tipográfia és kártya stílus."
          : settings.language === "de"
          ? "Farbige Akzente, klare Typografie und Kartenstil."
          : "Color accents, clean typography and card-style layout.",
    },
    {
      value: "minimal",
      label:
        settings.language === "hu"
          ? "Minimalista"
          : settings.language === "de"
          ? "Minimalistisch"
          : "Minimal",
      description:
        settings.language === "hu"
          ? "Letisztult, monokróm megjelenés finom keretekkel."
          : settings.language === "de"
          ? "Schlankes, monochromes Layout mit feinen Rahmen."
          : "Clean, monochrome layout with subtle borders.",
    },
    {
      value: "professional",
      label:
        settings.language === "hu"
          ? "Professzionális"
          : settings.language === "de"
          ? "Professionell"
          : "Professional",
      description:
        settings.language === "hu"
          ? "Sötétebb fejlécek, strukturált információ blokkok."
          : settings.language === "de"
          ? "Dunklere Kopfzeilen, strukturierte Informationsblöcke."
          : "Darker headers with structured information blocks.",
    },
  ];

  const currentPdfTemplateOption =
    pdfTemplateOptions.find(option => option.value === pdfTemplate) || pdfTemplateOptions[0];

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
  const isGradientBackground = theme.colors.background?.includes('gradient');
  const tabButtonStyle = (isActive: boolean) => ({
    padding: "12px 24px",
    border: "none",
    borderBottom: isActive ? `3px solid ${theme.colors.primary}` : `3px solid transparent`,
    backgroundColor: isActive 
      ? (isGradientBackground ? "rgba(255, 255, 255, 0.9)" : theme.colors.surfaceHover)
      : (isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent"),
    color: isActive 
      ? (isGradientBackground ? "#1a202c" : theme.colors.primary)
      : (isGradientBackground ? "#1a202c" : theme.colors.text),
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "700" : "600",
    transition: "all 0.2s",
    borderRadius: "4px 4px 0 0",
    backdropFilter: isGradientBackground ? "blur(8px)" : "none",
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
        backgroundColor: isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surface,
        borderRadius: "8px 8px 0 0",
        overflow: "auto",
        backdropFilter: isGradientBackground ? "blur(10px)" : "none",
        opacity: isGradientBackground ? 0.9 : 1,
      }}>
        <button
          onClick={() => setActiveTab("general")}
          style={tabButtonStyle(activeTab === "general")}
          onMouseEnter={(e) => {
            if (activeTab !== "general") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "general") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent";
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
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "display") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent";
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
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "advanced") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent";
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
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "data") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent";
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
            <label style={{ 
              display: "block", 
              marginBottom: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              width: "fit-content" 
            }}>
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
            <label style={{ 
              display: "block", 
              marginBottom: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              width: "fit-content" 
            }}>
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
            <label style={{ 
              display: "block", 
              marginBottom: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              width: "fit-content" 
            }}>
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
          <p style={{ 
            marginTop: "8px", 
            fontSize: "12px", 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted 
          }}>
            {settings.language === "hu" ? "Az áram ár mindig Ft/kWh-ban van tárolva, de a választott pénznemben jelenik meg." : settings.language === "de" ? "Der Strompreis wird immer in Ft/kWh gespeichert, wird aber in der gewählten Währung angezeigt." : "The electricity price is always stored in Ft/kWh, but displayed in the selected currency."}
          </p>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={t("settings.checkForBetaUpdatesDescription")}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
              <input
                type="checkbox"
                checked={settings.checkForBetaUpdates || false}
                onChange={e => onChange({ ...settings, checkForBetaUpdates: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🔬 {t("settings.checkForBetaUpdates")}</span>
            </label>
          </Tooltip>
          <p style={{ 
            marginTop: "8px", 
            marginLeft: "32px", 
            fontSize: "12px", 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted 
          }}>
            {t("settings.checkForBetaUpdatesDescription")}
          </p>
        </div>
        
        <div style={{ marginBottom: "0" }}>
          <Tooltip content={t("settings.showConsoleDescription")}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
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

        <div style={{
          marginTop: "32px",
          padding: "24px",
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: "12px",
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: companyInfo.logoBase64 ? "center" : "flex-start"
          }}>
            <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
              <h3 style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                🏢 {localize("Céginformációk", "Unternehmensinformationen", "Company information")}
              </h3>
              <p style={{
                marginTop: "8px",
                fontSize: "13px",
                color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
                lineHeight: 1.6
              }}>
                {localize(
                  "Add meg a vállalkozás adatait, amelyek automatikusan megjelennek a PDF árajánlatokon.",
                  "Gib hier die Unternehmensdaten ein, die automatisch auf den PDF-Angeboten erscheinen.",
                  "Provide your company details and branding to include them on exported PDF quotes automatically."
                )}
              </p>
            </div>
            {companyInfo.logoBase64 && (
              <div style={{
                width: "120px",
                height: "120px",
                borderRadius: "12px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px"
              }}>
                <img
                  src={companyInfo.logoBase64}
                  alt={localize("Vállalati logo előnézet", "Logo-Vorschau", "Company logo preview")}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>
            )}
          </div>

          <div style={{
            marginTop: "20px",
            display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px"
          }}>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {localize("Cégnév", "Firmenname", "Company name")}
              </label>
              <input
                type="text"
                value={companyInfo.name || ""}
                onChange={e => handleCompanyInfoChange("name", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={localize("Pl.: Lekszikov Nyomtató Kft.", "z. B.: Lekszikov Druck GmbH", "e.g. Lekszikov Printing LLC")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {localize("Adószám", "Steuernummer", "Tax/VAT number")}
              </label>
              <input
                type="text"
                value={companyInfo.taxNumber || ""}
                onChange={e => handleCompanyInfoChange("taxNumber", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={localize("Pl.: 12345678-1-12", "z. B.: DE123456789", "e.g. TAX-123456")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {localize("Bankszámlaszám / IBAN", "Kontonummer / IBAN", "Bank account / IBAN")}
              </label>
              <input
                type="text"
                value={companyInfo.bankAccount || ""}
                onChange={e => handleCompanyInfoChange("bankAccount", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={localize("Pl.: HU12 3456 7890 1234 5678 9012 3456", "z. B.: DE12 3456 7890 1234 5678 90", "e.g. GB00 BARC 2004 0149 1234 56")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {localize("E-mail", "E-Mail", "Email")}
              </label>
              <input
                type="email"
                value={companyInfo.email || ""}
                onChange={e => handleCompanyInfoChange("email", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={localize("Pl.: info@ceg.hu", "z. B.: info@firma.de", "e.g. hello@company.com")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {localize("Telefon", "Telefon", "Phone")}
              </label>
              <input
                type="tel"
                value={companyInfo.phone || ""}
                onChange={e => handleCompanyInfoChange("phone", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={localize("Pl.: +36 30 123 4567", "z. B.: +49 30 1234567", "e.g. +1 555 123 4567")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {localize("Weboldal", "Webseite", "Website")}
              </label>
              <input
                type="url"
                value={companyInfo.website || ""}
                onChange={e => handleCompanyInfoChange("website", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={localize("Pl.: https://www.ceg.hu", "z. B.: https://www.firma.de", "e.g. https://www.company.com")}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              fontSize: "14px",
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
            }}>
              {localize("Székhely / Cím", "Firmensitz / Adresse", "Headquarters / Address")}
            </label>
            <textarea
              value={companyInfo.address || ""}
              onChange={e => handleCompanyInfoChange("address", e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%", maxWidth: "700px", minHeight: "100px", resize: "vertical" as const }}
              placeholder={localize(
                "Pl.: 1111 Budapest, Nyomtató utca 3.",
                "z. B.: Musterstraße 5, 10115 Berlin",
                "e.g. 123 Printer Ave, Suite 200"
              )}
            />
          </div>

          <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCompanyLogoUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                padding: "10px 20px",
                fontSize: "14px"
              }}
            >
              📁 {localize("Logo feltöltése", "Logo hochladen", "Upload logo")}
            </button>
            {companyInfo.logoBase64 && (
              <button
                onClick={handleRemoveCompanyLogo}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonDanger,
                  padding: "10px 20px",
                  fontSize: "14px"
                }}
              >
                🗑️ {localize("Logo eltávolítása", "Logo entfernen", "Remove logo")}
              </button>
            )}
            <p style={{
              margin: "8px 0 0 0",
              fontSize: "12px",
              color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
              flexBasis: "100%"
            }}>
              {localize(
                "Tipp: 512×512 px, átlátszó PNG javasolt. Maximum 4 MB.",
                "Tipp: Empfohlen 512×512 px, transparentes PNG. Maximal 4 MB.",
                "Tip: Prefer 512×512 px transparent PNG. Maximum size 4 MB."
              )}
            </p>
          </div>
        </div>

        <div style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: "12px",
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{
            margin: "0 0 8px 0",
            fontSize: "18px",
            fontWeight: 700,
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
          }}>
            📄 {localize("PDF beállítások", "PDF-Einstellungen", "PDF settings")}
          </h3>
          <p style={{
            margin: "0 0 16px 0",
            fontSize: "13px",
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
            lineHeight: 1.6
          }}>
            {localize(
              "Válaszd ki az árajánlatok megjelenését. A vállalati adatok automatikusan bekerülnek a fejlécbe.",
              "Wähle das Erscheinungsbild deiner Angebote. Die Unternehmensdaten erscheinen automatisch im Kopfbereich.",
              "Choose the visual style of your quotes. Company details will appear automatically in the header."
            )}
          </p>
          <select
            value={pdfTemplate}
            onChange={handlePdfTemplateChange}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.select, width: "100%", maxWidth: "320px" }}
          >
            {pdfTemplateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p style={{
            marginTop: "12px",
            fontSize: "12px",
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted
          }}>
            {currentPdfTemplateOption.description}
          </p>
          <p style={{
            marginTop: "8px",
            fontSize: "12px",
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted
          }}>
            {localize(
              "Tipp: Használd az árajánlat oldalon az \"PDF előnézet\" gombot a dizájn ellenőrzéséhez export előtt.",
              "Tipp: Nutze die Schaltfläche „PDF-Vorschau“ im Angebotsbereich, um das Design vor dem Export zu prüfen.",
              "Tip: Use the \"PDF preview\" button on the offers page to review the layout before exporting."
            )}
          </p>
        </div>
          </div>
        )}

        {/* Display Tab */}
        {activeTab === "display" && (
          <div>
        <div style={{ marginBottom: "0" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "12px", 
            fontWeight: "600", 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            🎨 {t("settings.theme")}
          </label>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "16px",
            marginBottom: "20px"
          }}>
            {(["light", "dark", "blue", "green", "purple", "orange", "gradient", "neon", "cyberpunk", "sunset", "ocean"] as ThemeName[]).map((themeName) => {
              const themeOption = themes[themeName];
              const isSelected = (settings.theme || "light") === themeName;
              const isGradientTheme = themeOption.colors.background?.includes('gradient');
              const isNeonTheme = themeName === 'neon' || themeName === 'cyberpunk';
              
              return (
                <button
                  key={themeName}
                  onClick={() => onChange({ ...settings, theme: themeName })}
                  style={{
                    ...themeStyles.button,
                    ...(isGradientTheme
                      ? {
                          backgroundImage: themeOption.colors.background,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }
                      : {
                          backgroundColor: themeOption.colors.background,
                        }
                    ),
                    color: isGradientTheme || themeOption.colors.background === "#1a1a1a" || themeOption.colors.background === "#0a0a0f" || themeOption.colors.background === "#0d0d0d"
                      ? "#ffffff"
                      : themeOption.colors.text,
                    border: isSelected 
                      ? `3px solid ${themeOption.colors.sidebarActive || themeOption.colors.primary}`
                      : `2px solid ${themeOption.colors.border}`,
                    padding: "20px 16px",
                    minHeight: "120px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    boxShadow: isSelected 
                      ? isNeonTheme
                        ? `0 0 20px ${themeOption.colors.shadow}, 0 4px 12px ${themeOption.colors.shadow}`
                        : `0 4px 16px ${themeOption.colors.shadow}`
                      : `0 2px 8px ${themeOption.colors.shadow}`,
                    position: "relative" as const,
                    overflow: "hidden" as const,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "scale(1.03) translateY(-2px)";
                      e.currentTarget.style.boxShadow = isNeonTheme
                        ? `0 0 15px ${themeOption.colors.shadow}, 0 4px 12px ${themeOption.colors.shadow}`
                        : `0 4px 12px ${themeOption.colors.shadowHover}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = `0 2px 8px ${themeOption.colors.shadow}`;
                    }
                  }}
                >
                  {/* Szín preview sávok */}
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "8px",
                    ...(isGradientTheme
                      ? {
                          backgroundImage: themeOption.colors.background,
                          backgroundSize: "cover",
                        }
                      : {
                          backgroundColor: themeOption.colors.primary,
                        }
                    ),
                    opacity: 0.8,
                  }} />
                  
                  <span style={{ 
                    fontSize: "32px",
                    filter: isGradientTheme 
                      ? "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" 
                      : (isNeonTheme && isSelected ? `drop-shadow(0 0 8px ${themeOption.colors.sidebarActive})` : "none"),
                    zIndex: 1,
                  }}>
                    {themeName === "light" && "☀️"}
                    {themeName === "dark" && "🌙"}
                    {themeName === "blue" && "💙"}
                    {themeName === "green" && "💚"}
                    {themeName === "purple" && "💜"}
                    {themeName === "orange" && "🧡"}
                    {themeName === "gradient" && "🌈"}
                    {themeName === "neon" && "💡"}
                    {themeName === "cyberpunk" && "🤖"}
                    {themeName === "sunset" && "🌅"}
                    {themeName === "ocean" && "🌊"}
                  </span>
                  <span style={{ 
                    fontSize: "14px", 
                    fontWeight: "600",
                    zIndex: 1,
                    textShadow: isGradientTheme 
                      ? "0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)"
                      : isNeonTheme 
                      ? "0 1px 3px rgba(0,0,0,0.3)"
                      : "none",
                    color: isGradientTheme ? "#ffffff" : undefined,
                  }}>
                    {themeOption.displayName[settings.language]}
                  </span>
                  {isSelected && (
                    <span style={{ 
                      fontSize: "16px",
                      zIndex: 1,
                      textShadow: isGradientTheme 
                        ? "0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)"
                        : isNeonTheme 
                        ? "0 1px 3px rgba(0,0,0,0.3)"
                        : "none",
                      color: isGradientTheme ? "#ffffff" : undefined,
                    }}>
                      ✓
                    </span>
                  )}
                  
                  {/* Szín preview alsó rész */}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: themeOption.colors.sidebarActive || themeOption.colors.primary,
                    opacity: isSelected ? 1 : 0.5,
                  }} />
                </button>
              );
            })}
          </div>
          <p style={{ 
            marginTop: "12px", 
            fontSize: "12px", 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted 
          }}>
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
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
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
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                }}>
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
          <label style={{ 
            display: "block", 
            marginBottom: "12px", 
            fontWeight: "600", 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
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
          <label style={{ 
            display: "block", 
            marginBottom: "12px", 
            fontWeight: "600", 
            fontSize: "18px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
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
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: "20px", 
            fontSize: "20px", 
            fontWeight: "600", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            💾 {t("settings.exportTitle")}
          </h3>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
            {t("settings.exportDescription")}
          </p>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer", 
              marginBottom: "12px" 
            }}>
              <input
                type="checkbox"
                checked={exportFilaments}
                onChange={e => setExportFilaments(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🧵 {t("settings.exportFilaments")} ({filaments.length})</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer", 
              marginBottom: "12px" 
            }}>
              <input
                type="checkbox"
                checked={exportPrinters}
                onChange={e => setExportPrinters(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🖨️ {t("settings.exportPrinters")} ({printers.length})</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
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
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: "20px", 
            fontSize: "20px", 
            fontWeight: "600", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            📥 {t("settings.importTitle")}
          </h3>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
            {t("settings.importDescription")}
          </p>
          <p style={{ marginBottom: "16px", fontSize: "12px", color: "#dc3545", fontWeight: "600" }}>
            ⚠️ {settings.language === "hu" ? "Figyelem: Az importálás felülírja a jelenlegi adatokat!" : settings.language === "de" ? "Warnung: Der Import überschreibt die aktuellen Daten!" : "Warning: Import will overwrite current data!"}
          </p>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer", 
              marginBottom: "12px" 
            }}>
              <input
                type="checkbox"
                checked={importFilaments}
                onChange={e => setImportFilaments(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🧵 {t("settings.importFilaments")}</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer", 
              marginBottom: "12px" 
            }}>
              <input
                type="checkbox"
                checked={importPrinters}
                onChange={e => setImportPrinters(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🖨️ {t("settings.importPrinters")}</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
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
