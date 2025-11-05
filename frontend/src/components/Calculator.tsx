import React, { useState, useMemo } from "react";
import type { Printer, Filament, Settings, Offer } from "../types";
import type { Theme } from "../utils/themes";
import { convertCurrency } from "../utils/currency";
import { useTranslation } from "../utils/translations";
import { useToast } from "./Toast";

interface SelectedFilament {
  filamentIndex: number;
  usedGrams: number;
  needsDrying?: boolean;
  dryingTime?: number;
  dryingPower?: number;
}

interface Props {
  printers: Printer[];
  filaments: Filament[];
  settings: Settings;
  onSaveOffer?: (offer: any) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const Calculator: React.FC<Props> = ({ printers, filaments, settings, onSaveOffer, theme, themeStyles }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [selectedPrinterId, setSelectedPrinterId] = useState<number | "">("");
  const [selectedFilaments, setSelectedFilaments] = useState<SelectedFilament[]>([]);
  const [printTimeHours, setPrintTimeHours] = useState<number>(0);
  const [printTimeMinutes, setPrintTimeMinutes] = useState<number>(0);
  const [printTimeSeconds, setPrintTimeSeconds] = useState<number>(0);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [offerCustomerName, setOfferCustomerName] = useState("");
  const [offerCustomerContact, setOfferCustomerContact] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerProfitPercentage, setOfferProfitPercentage] = useState<number>(30);

  const selectedPrinter = useMemo(() => {
    if (selectedPrinterId === "") return null;
    return printers.find(p => p.id === selectedPrinterId) || null;
  }, [printers, selectedPrinterId]);

  const maxFilaments = useMemo(() => {
    if (!selectedPrinter) return 0;
    return (selectedPrinter.amsCount || 0) * 4;
  }, [selectedPrinter]);

  const totalPrintTimeHours = useMemo(() => {
    return printTimeHours + (printTimeMinutes / 60) + (printTimeSeconds / 3600);
  }, [printTimeHours, printTimeMinutes, printTimeSeconds]);

  const addFilament = () => {
    if (selectedFilaments.length >= maxFilaments) return;
    setSelectedFilaments([...selectedFilaments, { filamentIndex: -1, usedGrams: 0, needsDrying: false, dryingTime: 0, dryingPower: 0 }]);
  };

  const removeFilament = (index: number) => {
    setSelectedFilaments(selectedFilaments.filter((_, i) => i !== index));
  };

  const updateFilament = (index: number, field: "filamentIndex" | "usedGrams" | "dryingTime" | "dryingPower" | "needsDrying", value: number | boolean) => {
    const updated = [...selectedFilaments];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedFilaments(updated);
  };

  // Számítások
  const calculations = useMemo(() => {
    if (!selectedPrinter || selectedFilaments.length === 0 || totalPrintTimeHours <= 0) {
      return null;
    }

    // Ellenőrizzük hogy minden filament rendelkezik mennyiséggel
    if (selectedFilaments.some(sf => sf.filamentIndex < 0 || sf.usedGrams <= 0)) {
      return null;
    }

    // Filament költségek (összes kiválasztott filament)
    let totalFilamentCostEUR = 0;
    selectedFilaments.forEach(sf => {
      const filament = filaments[sf.filamentIndex];
      if (filament) {
        totalFilamentCostEUR += (sf.usedGrams / 1000) * filament.pricePerKg;
      }
    });
    const filamentCost = convertCurrency(totalFilamentCostEUR, settings.currency);

    // Áram költség: nyomtató + AMS-ek
    let totalPowerW = selectedPrinter.power;
    if (selectedPrinter.ams && selectedPrinter.ams.length > 0) {
      totalPowerW += selectedPrinter.ams.reduce((sum, ams) => sum + ams.power, 0);
    }
    const powerConsumedKWh = (totalPowerW / 1000) * totalPrintTimeHours;
    // Az electricityPrice mindig Ft/kWh-ban van tárolva
    // Ellenőrizzük hogy az electricityPrice érvényes érték-e
    const electricityPrice = settings.electricityPrice || 0;
    if (electricityPrice <= 0) {
      if (import.meta.env.DEV) {
        console.warn("⚠️ Áram ár nincs beállítva vagy 0:", electricityPrice, "- Kérlek állíts be egy érvényes áramárat a Beállításokban!");
      }
    }
    const electricityCostHUF = powerConsumedKWh * electricityPrice;
    // Konvertáljuk EUR-ra (400 Ft = 1 EUR), majd a választott pénznemre
    const electricityCostEUR = electricityCostHUF / 400;
    const electricityCost = convertCurrency(electricityCostEUR, settings.currency);

    // Szárítás költség minden filamentnél külön
    let totalDryingCostEUR = 0;
    selectedFilaments.forEach((sf) => {
      if (sf.needsDrying && sf.dryingTime && sf.dryingTime > 0 && sf.dryingPower && sf.dryingPower > 0) {
        // Szárítás teljesítmény felhasználás kWh-ban
        const dryingPowerConsumedKWh = (sf.dryingPower / 1000) * sf.dryingTime;
        // Az electricityPrice mindig Ft/kWh-ban van tárolva
        const dryingCostHUF = dryingPowerConsumedKWh * electricityPrice;
        // Konvertáljuk EUR-ra (400 Ft = 1 EUR)
        const dryingCostEUR = dryingCostHUF / 400;
        totalDryingCostEUR += dryingCostEUR;
      }
    });
    // Konvertáljuk a választott pénznemre
    const totalDryingCost = convertCurrency(totalDryingCostEUR, settings.currency);

    // Használati költség (kopás)
    const usageCost = convertCurrency(selectedPrinter.usageCost * totalPrintTimeHours, settings.currency);

    // Összes költség
    const totalCost = filamentCost + electricityCost + totalDryingCost + usageCost;

    return {
      filamentCost,
      electricityCost,
      totalDryingCost,
      usageCost,
      totalCost,
    };
  }, [selectedPrinter, selectedFilaments, filaments, totalPrintTimeHours, settings]);

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("calculator.title")}</h2>
      <p style={themeStyles.pageSubtitle}>3D nyomtatási költség számítás</p>
      
      <div style={{ ...themeStyles.card, marginBottom: "24px", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
        <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
          ⚙️ {t("calculator.parameters")}
        </h3>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text }}>
            🖨️ {t("calculator.printer")}
          </label>
          <select
            value={selectedPrinterId}
            onChange={e => {
              setSelectedPrinterId(e.target.value === "" ? "" : Number(e.target.value));
              setSelectedFilaments([]); // Reset filaments when printer changes
            }}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.select, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
          >
            <option value="">{t("calculator.selectPrinter")}</option>
            {printers.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type}) - {p.power}W {p.amsCount ? `- ${p.amsCount} AMS` : ""}
              </option>
            ))}
          </select>
          {selectedPrinter && (
            <p style={{ marginTop: "5px", fontSize: "12px", color: theme.colors.textSecondary }}>
              {t("calculator.maxFilaments")} {maxFilaments} ({(selectedPrinter.amsCount || 0)} {t("printers.ams")} × 4)
            </p>
          )}
        </div>

        {/* Nyomtatási idő: óra, perc, másodperc */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text }}>
            ⏱️ {t("calculator.printTimeLabel")}
          </label>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.colors.text }}>{t("calculator.hours")}</label>
              <input
                type="number"
                min="0"
                value={printTimeHours}
                onChange={e => setPrintTimeHours(Math.max(0, Number(e.target.value)))}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.colors.text }}>{t("calculator.minutes")}</label>
              <input
                type="number"
                min="0"
                max="59"
                value={printTimeMinutes}
                onChange={e => setPrintTimeMinutes(Math.min(59, Math.max(0, Number(e.target.value))))}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.colors.text }}>{t("calculator.seconds")}</label>
              <input
                type="number"
                min="0"
                max="59"
                value={printTimeSeconds}
                onChange={e => setPrintTimeSeconds(Math.min(59, Math.max(0, Number(e.target.value))))}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100px" }}
              />
            </div>
          </div>
          <p style={{ marginTop: "5px", fontSize: "12px", color: theme.colors.textSecondary }}>
            {t("calculator.totalTime")} {totalPrintTimeHours.toFixed(2)} {t("calculator.hoursUnit")}
          </p>
        </div>

        {/* Filamentek kiválasztása */}
        <div style={{ marginBottom: "20px", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <label style={{ fontWeight: "600", fontSize: "16px", color: theme.colors.text }}>
              🧵 {t("calculator.filaments")} ({selectedFilaments.length}/{maxFilaments})
            </label>
            {maxFilaments > 0 && selectedFilaments.length < maxFilaments && (
              <button 
                onClick={addFilament}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
                style={{ 
                  ...themeStyles.button,
                  ...themeStyles.buttonPrimary,
                  padding: "10px 20px",
                  fontSize: "14px"
                }}
              >
                ➕ {t("calculator.addFilament")}
              </button>
            )}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "100%", overflow: "hidden" }}>
            {selectedFilaments.map((sf, idx) => (
              <div key={idx} style={{ ...themeStyles.card, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <strong style={{ fontSize: "16px", color: theme.colors.text }}>{t("calculator.filament")} {idx + 1}:</strong>
                <button 
                  onClick={() => removeFilament(idx)}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                  style={{ 
                    ...themeStyles.button,
                    ...themeStyles.buttonDanger,
                    padding: "8px 16px",
                    fontSize: "12px",
                    flexShrink: 0
                  }}
                >
                  {t("filaments.delete")}
                </button>
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", marginBottom: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: "1", minWidth: "200px", maxWidth: "100%" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.colors.text }}>{t("calculator.filament")}:</label>
                  <select
                    value={sf.filamentIndex}
                    onChange={e => updateFilament(idx, "filamentIndex", Number(e.target.value))}
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
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.colors.text }}>{t("calculator.usedGrams")}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={sf.usedGrams || ""}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val >= 0 && val <= 100000) {
                        updateFilament(idx, "usedGrams", val);
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
                <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", marginBottom: "12px", fontSize: "14px", color: theme.colors.text }}>
                  <input
                    type="checkbox"
                    checked={sf.needsDrying || false}
                    onChange={e => updateFilament(idx, "needsDrying", e.target.checked)}
                    style={{ width: "20px", height: "20px", cursor: "pointer", flexShrink: 0 }}
                  />
                  <span>🌡️ {t("calculator.dryingNeeded")}</span>
                </label>
                {sf.needsDrying && (
                  <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1", minWidth: "150px", maxWidth: "100%" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.colors.text }}>{t("calculator.dryingTime")}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={sf.dryingTime || ""}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val <= 1000) {
                            updateFilament(idx, "dryingTime", val);
                          }
                        }}
                        onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                        onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                        style={{ ...themeStyles.input, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
                      />
                    </div>
                    <div style={{ flex: "1", minWidth: "150px", maxWidth: "100%" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: theme.colors.text }}>{t("calculator.dryingPower")}</label>
                      <input
                        type="number"
                        min="0"
                        value={sf.dryingPower || ""}
                        onChange={e => {
                          const val = Number(e.target.value);
                          if (val >= 0 && val <= 5000) {
                            updateFilament(idx, "dryingPower", val);
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

      </div>

      {calculations && (
        <div style={{ 
          ...themeStyles.card,
          marginTop: "30px",
          maxWidth: "100%",
          boxSizing: "border-box",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
              💰 {t("calculator.costBreakdown")} ({settings.currency})
            </h3>
            {onSaveOffer && (
              <button
                onClick={() => {
                  if (!selectedPrinter) return;
                  setShowOfferDialog(true);
                }}
                onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSuccess
                }}
              >
                {t("calculator.saveAsOffer")}
              </button>
            )}
          </div>
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
              <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.filamentCost")}</span>
              <strong style={{ fontSize: "16px", color: theme.colors.success }}>{calculations.filamentCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
              <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.electricityCost")}</span>
              <strong style={{ fontSize: "16px", color: "#ffc107" }}>{calculations.electricityCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
            </div>
            {selectedFilaments.some(sf => sf.needsDrying && sf.dryingTime && sf.dryingTime > 0 && sf.dryingPower && sf.dryingPower > 0) && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
                <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.dryingCost")}</span>
                <strong style={{ fontSize: "16px", color: theme.colors.primary }}>{calculations.totalDryingCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "16px", borderBottom: `2px solid ${theme.colors.border}` }}>
              <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.usageCost")}</span>
              <strong style={{ fontSize: "16px", color: theme.colors.textMuted }}>{calculations.usageCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.5em", fontWeight: "bold", paddingTop: "16px", backgroundColor: theme.colors.surfaceHover, padding: "16px", borderRadius: "8px", marginTop: "8px" }}>
              <span style={{ color: theme.colors.text }}>{t("calculator.totalCost")}</span>
              <strong style={{ color: theme.colors.primary }}>{calculations.totalCost.toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
            </div>
          </div>
        </div>
      )}

      {(!selectedPrinter || selectedFilaments.length === 0 || !calculations) && (
        <div style={{ 
          ...themeStyles.card,
          marginTop: "30px",
          textAlign: "center",
          padding: "40px",
          backgroundColor: theme.colors.surfaceHover
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "16px" }}>{t("calculator.fillFields")}</p>
        </div>
      )}

      {/* Árajánlat mentése dialog */}
      {showOfferDialog && (
        <div
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
          }}
          onClick={() => setShowOfferDialog(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px 0", color: theme.colors.text, fontSize: "20px", fontWeight: "600" }}>
              {t("calculator.saveAsOffer")}
            </h3>
            
            <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ width: "180px", flexShrink: 0 }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
                  {t("offers.customerName")} *
                </label>
                <input
                  type="text"
                  placeholder={t("offers.customerName")}
                  value={offerCustomerName}
                  onChange={e => setOfferCustomerName(e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.input, width: "100%" }}
                />
              </div>
              
              <div style={{ width: "180px", flexShrink: 0 }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
                  {settings.language === "hu" ? "Elérhetőség" : settings.language === "de" ? "Kontakt" : "Contact"}
                </label>
                <input
                  type="text"
                  placeholder={settings.language === "hu" ? "Email/telefon" : settings.language === "de" ? "E-Mail/Telefon" : "Email/phone"}
                  value={offerCustomerContact}
                  onChange={e => setOfferCustomerContact(e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.input, width: "100%" }}
                />
              </div>
              
              <div style={{ width: "180px", flexShrink: 0 }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
                  {t("offers.profitPercentage")} (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={offerProfitPercentage}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (val >= 0 && val <= 100) {
                      setOfferProfitPercentage(val);
                    }
                  }}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.input, width: "100%" }}
                />
              </div>
            </div>
            
            <div style={{ marginTop: "24px" }}>
              <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
                  {t("offers.description")}
                </label>
                <textarea
                  placeholder={t("offers.description")}
                  value={offerDescription}
                  onChange={e => setOfferDescription(e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.input, width: "100%", maxWidth: "100%", height: "50px", minHeight: "50px", maxHeight: "100px", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                onClick={() => {
                  setShowOfferDialog(false);
                  setOfferCustomerName("");
                  setOfferCustomerContact("");
                  setOfferDescription("");
                  setOfferProfitPercentage(30);
                }}
                style={{
                  ...themeStyles.button,
                  backgroundColor: theme.colors.secondary,
                  color: "#fff",
                  padding: "10px 20px",
                }}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => {
                  if (!offerCustomerName.trim()) {
                    showToast(t("common.error") + ": " + (settings.language === "hu" ? "Kérlek add meg az ügyfél nevét!" : settings.language === "de" ? "Bitte geben Sie den Kundennamen ein!" : "Please enter customer name!"), "error");
                    return;
                  }
                  
                  if (!selectedPrinter || !calculations || !onSaveOffer) return;
                  
                  const offerFilaments = selectedFilaments.map(sf => {
                    const filament = filaments[sf.filamentIndex];
                    return {
                      brand: filament.brand,
                      type: filament.type,
                      color: filament.color,
                      usedGrams: sf.usedGrams,
                      pricePerKg: filament.pricePerKg,
                      needsDrying: sf.needsDrying || false,
                      dryingTime: sf.dryingTime || 0,
                      dryingPower: sf.dryingPower || 0,
                    };
                  });

                  const offer: Offer = {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    printerName: selectedPrinter.name,
                    printerType: selectedPrinter.type,
                    printerPower: selectedPrinter.power,
                    printTimeHours,
                    printTimeMinutes,
                    printTimeSeconds,
                    totalPrintTimeHours,
                    filaments: offerFilaments,
                    costs: {
                      filamentCost: calculations.filamentCost,
                      electricityCost: calculations.electricityCost,
                      dryingCost: calculations.totalDryingCost,
                      usageCost: calculations.usageCost,
                      totalCost: calculations.totalCost,
                    },
                    currency: settings.currency,
                    profitPercentage: offerProfitPercentage,
                    customerName: offerCustomerName.trim(),
                    customerContact: offerCustomerContact.trim() || undefined,
                    description: offerDescription.trim() || undefined,
                  };

                  onSaveOffer(offer);
                  showToast(t("common.offerSaved"), "success");
                  setShowOfferDialog(false);
                  setOfferCustomerName("");
                  setOfferCustomerContact("");
                  setOfferDescription("");
                  setOfferProfitPercentage(30);
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSuccess,
                  padding: "10px 20px",
                }}
              >
                {t("offers.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
