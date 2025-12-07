import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Settings, CompanyInfo, PdfTemplate } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation, availableLanguages } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";
import { convertCurrencyFromTo, getCurrencySymbol } from "../../../utils/currency";
import { saveSettings } from "../../../utils/store";
import { auditSettingsChange } from "../../../utils/auditLog";
import { logWithLanguage } from "../../../utils/languages/global_console";

interface GeneralTabProps {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  onChange,
  theme,
  themeStyles,
  showToast,
}) => {
  const t = useTranslation(settings.language);
  const [showCompanyInfoDialog, setShowCompanyInfoDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const companyInfo: CompanyInfo = settings.companyInfo ?? {};
  const pdfTemplate: PdfTemplate = settings.pdfTemplate ?? "modern";

  // Helper functions
  const getDisplayElectricityPrice = (): number => {
    const converted = convertCurrencyFromTo(settings.electricityPrice, "HUF", settings.currency);
    return parseFloat(converted.toFixed(2));
  };

  const convertElectricityPriceToHUF = (value: number): number => {
    return convertCurrencyFromTo(value, settings.currency, "HUF");
  };

  const handleCurrencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Settings["currency"];
    const oldCurrency = settings.currency;
    const newSettings = { ...settings, currency: newCurrency };
    onChange(newSettings);
    try {
      await saveSettings(newSettings);
      try {
        await auditSettingsChange("currency", oldCurrency, newCurrency, {
          previousCurrency: oldCurrency,
          newCurrency: newCurrency,
        });
      } catch (error) {
        console.warn("Audit log hiba:", error);
      }
    } catch (error) {
      console.error("❌ Hiba a pénznem mentésekor:", error);
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value as Settings["language"];
    const newSettings = { ...settings, language: newLanguage };
    onChange(newSettings);
    try {
      await saveSettings(newSettings);
      try {
        await auditSettingsChange("language", settings.language, newLanguage, {
          previousLanguage: settings.language,
          newLanguage: newLanguage,
        });
      } catch (error) {
        console.warn("Audit log hiba:", error);
      }
      if (import.meta.env.DEV) {
        console.log("✅ Nyelv változtatva és mentve:", newLanguage);
      }
    } catch (error) {
      console.error("❌ Hiba a nyelv mentésekor:", error);
    }
  };

  const handleElectricityPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = Number(e.target.value);
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
        showToast(t("settings.company.toast.logoUpdated"), "success");
      } catch (error) {
        logWithLanguage(settings.language, "error", "settings.logo.optimizeError", { error });
        showToast(t("settings.company.toast.logoProcessError"), "error");
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
  };

  const handlePdfTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...settings,
      pdfTemplate: e.target.value as PdfTemplate,
    });
  };

  const pdfTemplateOptions = useMemo<Array<{ value: PdfTemplate; label: string; description: string }>>(
    () => [
      {
        value: "modern",
        label: t("settings.pdf.templates.modern.label"),
        description: t("settings.pdf.templates.modern.description"),
      },
      {
        value: "minimal",
        label: t("settings.pdf.templates.minimal.label"),
        description: t("settings.pdf.templates.minimal.description"),
      },
      {
        value: "professional",
        label: t("settings.pdf.templates.professional.label"),
        description: t("settings.pdf.templates.professional.description"),
      },
    ],
    [t]
  );

  const currentPdfTemplateOption =
    pdfTemplateOptions.find(option => option.value === pdfTemplate) || pdfTemplateOptions[0];

  return (
    <div>
      {/* Language */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.language.tooltip")}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "600",
              fontSize: "16px",
              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
              width: "fit-content",
            }}
          >
            🌐 {t("settings.language")}
          </label>
        </Tooltip>
        <select
          value={settings.language}
          onChange={handleLanguageChange}
          onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.inputBorder;
            e.target.style.boxShadow = "none";
          }}
          style={{ ...themeStyles.select, width: "100%", maxWidth: "300px" }}
        >
          {availableLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.flag ? `${language.flag} ${language.label}` : language.label}
            </option>
          ))}
        </select>
      </div>

      {/* Currency */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.currency.tooltip")}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "600",
              fontSize: "16px",
              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
              width: "fit-content",
            }}
          >
            💰 {t("settings.currency")}
          </label>
        </Tooltip>
        <select
          value={settings.currency}
          onChange={handleCurrencyChange}
          onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.inputBorder;
            e.target.style.boxShadow = "none";
          }}
          style={{ ...themeStyles.select, width: "100%", maxWidth: "300px" }}
        >
          <option value="EUR">EUR (€)</option>
          <option value="HUF">HUF (Ft)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
          <option value="PLN">PLN (zł)</option>
          <option value="CZK">CZK (Kč)</option>
          <option value="CNY">CNY (¥)</option>
          <option value="UAH">UAH (₴)</option>
          <option value="RUB">RUB (₽)</option>
        </select>
      </div>

      {/* Electricity Price */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.electricity.tooltip")}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "600",
              fontSize: "16px",
              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
              width: "fit-content",
            }}
          >
            ⚡ {t("settings.electricityPrice")} ({getCurrencySymbol(settings.currency)}/kWh)
          </label>
        </Tooltip>
        <input
          type="number"
          step="0.01"
          value={getDisplayElectricityPrice()}
          onChange={handleElectricityPriceChange}
          onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.inputBorder;
            e.target.style.boxShadow = "none";
          }}
          style={{ ...themeStyles.input, width: "100%", maxWidth: "300px" }}
          placeholder="Pl: 70"
        />
        <p
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
          }}
        >
          {t("settings.electricity.note")}
        </p>
      </div>

      {/* Beta Updates */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.checkForBetaUpdatesDescription")}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: "600",
              fontSize: "16px",
              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={settings.checkForBetaUpdates || false}
              onChange={(e) => onChange({ ...settings, checkForBetaUpdates: e.target.checked })}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>🔬 {t("settings.checkForBetaUpdates")}</span>
          </label>
        </Tooltip>
        <p
          style={{
            marginTop: "8px",
            marginLeft: "32px",
            fontSize: "12px",
            color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
          }}
        >
          {t("settings.checkForBetaUpdatesDescription")}
        </p>
      </div>

      {/* Show Console */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.showConsoleDescription")}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: "600",
              fontSize: "16px",
              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={settings.showConsole || false}
              onChange={(e) => onChange({ ...settings, showConsole: e.target.checked })}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>🖥️ {t("settings.showConsole")}</span>
          </label>
        </Tooltip>
        <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
          {t("settings.showConsoleDescription")}
        </p>
      </div>

      {/* Calendar Provider */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={t("settings.calendar.provider.tooltip") || "Válaszd ki, melyik naptár alkalmazást szeretnéd használni az ICS fájlok megnyitásához"}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "600",
              fontSize: "16px",
              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
              width: "fit-content",
            }}
          >
            📅 {t("settings.calendar.provider" as any) || t("settings.calendar.provider.label") || "Naptár szolgáltató"}
          </label>
        </Tooltip>
        <select
          value={settings.calendarProvider || "google"}
          onChange={(e) => onChange({ ...settings, calendarProvider: e.target.value as Settings["calendarProvider"] })}
          onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.inputBorder;
            e.target.style.boxShadow = "none";
          }}
          style={{ ...themeStyles.select, width: "100%", maxWidth: "300px" }}
        >
          <option value="google">📅 Google Calendar</option>
          <option value="ios">🍎 iOS Calendar (macOS)</option>
          <option value="outlook">📧 Outlook</option>
        </select>
        <p
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
          }}
        >
          {t("settings.calendar.provider.description") ||
            "Ez a beállítás határozza meg, melyik naptár alkalmazás nyílik meg az ICS fájl exportálásakor."}
        </p>
      </div>

      {/* Company Info Section */}
      <div
        style={{
          marginTop: "32px",
          padding: "24px",
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: "12px",
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div style={{ flex: "1" }}>
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
              }}
            >
              🏢 {t("settings.company.title")}
            </h3>
            <p
              style={{
                marginTop: "8px",
                fontSize: "13px",
                color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
                lineHeight: 1.6,
              }}
            >
              {t("settings.company.description")}
            </p>
          </div>
          {companyInfo.logoBase64 && (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "12px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                flexShrink: 0,
              }}
            >
              <img
                src={companyInfo.logoBase64}
                alt={t("settings.company.logoPreview")}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
          )}
          <button
            onClick={() => setShowCompanyInfoDialog(true)}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonPrimary,
              padding: "12px 24px",
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            {companyInfo.name || companyInfo.email || companyInfo.phone ? "✏️ " : "➕ "}
            {t("settings.company.editButton") || "Cégadatok"}
          </button>
        </div>
      </div>

      {/* Company Info Dialog */}
      <AnimatePresence>
        {showCompanyInfoDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              backdropFilter: "blur(4px)",
              overflowY: "auto",
              padding: "20px",
            }}
            onClick={() => setShowCompanyInfoDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                backgroundColor:
                  typeof theme.colors.background === "string" && theme.colors.background.includes("gradient")
                    ? "rgba(255, 255, 255, 0.95)"
                    : theme.colors.surface,
                borderRadius: "16px",
                padding: "24px",
                width: "min(900px, 95vw)",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow:
                  theme.name === "neon" || theme.name === "cyberpunk"
                    ? `0 0 30px ${theme.colors.shadow}, 0 8px 32px rgba(0,0,0,0.4)`
                    : `0 8px 32px rgba(0,0,0,0.3)`,
                color:
                  typeof theme.colors.background === "string" && theme.colors.background.includes("gradient")
                    ? "#1a202c"
                    : theme.colors.text,
                backdropFilter:
                  typeof theme.colors.background === "string" && theme.colors.background.includes("gradient")
                    ? "blur(12px)"
                    : "none",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "600",
                    color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                  }}
                >
                  🏢 {t("settings.company.title")}
                </h3>
                <button
                  onClick={() => setShowCompanyInfoDialog(false)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  }}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    padding: "8px 16px",
                    fontSize: "16px",
                    minWidth: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label={t("common.close") || "Bezárás"}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  gap: "20px",
                  alignItems: companyInfo.logoBase64 ? "center" : "flex-start",
                  marginBottom: "24px",
                }}
              >
                <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
                      lineHeight: 1.6,
                    }}
                  >
                    {t("settings.company.description")}
                  </p>
                </div>
                {companyInfo.logoBase64 && (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "12px",
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.surface,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "12px",
                    }}
                  >
                    <img
                      src={companyInfo.logoBase64}
                      alt={t("settings.company.logoPreview")}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                    }}
                  >
                    {t("settings.company.fields.name")}
                  </label>
                  <input
                    type="text"
                    value={companyInfo.name || ""}
                    onChange={(e) => handleCompanyInfoChange("name", e.target.value)}
                    onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.inputBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                    placeholder={t("settings.company.placeholders.name")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                    }}
                  >
                    {t("settings.company.fields.tax")}
                  </label>
                  <input
                    type="text"
                    value={companyInfo.taxNumber || ""}
                    onChange={(e) => handleCompanyInfoChange("taxNumber", e.target.value)}
                    onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.inputBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                    placeholder={t("settings.company.placeholders.tax")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                    }}
                  >
                    {t("settings.company.fields.bank")}
                  </label>
                  <input
                    type="text"
                    value={companyInfo.bankAccount || ""}
                    onChange={(e) => handleCompanyInfoChange("bankAccount", e.target.value)}
                    onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.inputBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                    placeholder={t("settings.company.placeholders.bank")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                    }}
                  >
                    {t("settings.company.fields.email")}
                  </label>
                  <input
                    type="email"
                    value={companyInfo.email || ""}
                    onChange={(e) => handleCompanyInfoChange("email", e.target.value)}
                    onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.inputBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                    placeholder={t("settings.company.placeholders.email")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                    }}
                  >
                    {t("settings.company.fields.phone")}
                  </label>
                  <input
                    type="tel"
                    value={companyInfo.phone || ""}
                    onChange={(e) => handleCompanyInfoChange("phone", e.target.value)}
                    onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.inputBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                    placeholder={t("settings.company.placeholders.phone")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                    }}
                  >
                    {t("settings.company.fields.website")}
                  </label>
                  <input
                    type="url"
                    value={companyInfo.website || ""}
                    onChange={(e) => handleCompanyInfoChange("website", e.target.value)}
                    onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                    onBlur={(e) => {
                      e.target.style.borderColor = theme.colors.inputBorder;
                      e.target.style.boxShadow = "none";
                    }}
                    style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                    placeholder={t("settings.company.placeholders.website")}
                  />
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                  }}
                >
                  {t("settings.company.fields.address")}
                </label>
                <textarea
                  value={companyInfo.address || ""}
                  onChange={(e) => handleCompanyInfoChange("address", e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.inputBorder;
                    e.target.style.boxShadow = "none";
                  }}
                  style={{ ...themeStyles.input, width: "100%", maxWidth: "700px", minHeight: "100px", resize: "vertical" as const }}
                  placeholder={t("settings.company.placeholders.address")}
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
                    fontSize: "14px",
                  }}
                >
                  📁 {t("settings.company.uploadLogo")}
                </button>
                {companyInfo.logoBase64 && (
                  <button
                    onClick={handleRemoveCompanyLogo}
                    style={{
                      ...themeStyles.button,
                      ...themeStyles.buttonDanger,
                      padding: "10px 20px",
                      fontSize: "14px",
                    }}
                  >
                    🗑️ {t("settings.company.removeLogo")}
                  </button>
                )}
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "12px",
                    color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
                    flexBasis: "100%",
                  }}
                >
                  {t("settings.company.logoTip")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Template Section */}
      <div
        style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: "12px",
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h3
          style={{
            margin: "0 0 8px 0",
            fontSize: "18px",
            fontWeight: 700,
            color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
          }}
        >
          📄 {t("settings.pdf.title")}
        </h3>
        <p
          style={{
            margin: "0 0 16px 0",
            fontSize: "13px",
            color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
            lineHeight: 1.6,
          }}
        >
          {t("settings.pdf.description")}
        </p>
        <select
          value={pdfTemplate}
          onChange={handlePdfTemplateChange}
          onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.inputBorder;
            e.target.style.boxShadow = "none";
          }}
          style={{ ...themeStyles.select, width: "100%", maxWidth: "320px" }}
        >
          {pdfTemplateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
          }}
        >
          {currentPdfTemplateOption.description}
        </p>
        <p
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
          }}
        >
          {t("settings.pdf.tip")}
        </p>
      </div>
    </div>
  );
};
