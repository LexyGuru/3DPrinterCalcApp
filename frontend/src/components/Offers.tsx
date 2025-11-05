import React, { useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type { Offer, Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation, type TranslationKey } from "../utils/translations";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { convertCurrencyFromTo } from "../utils/currency";

interface Props {
  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const Offers: React.FC<Props> = ({ offers, setOffers, settings, theme, themeStyles }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printContent, setPrintContent] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const deleteOffer = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId === null) return;
    const id = deleteConfirmId;
    setOffers(offers.filter(o => o.id !== id));
    if (selectedOffer?.id === id) {
      setSelectedOffer(null);
    }
    showToast(t("common.offerDeleted"), "success");
    setDeleteConfirmId(null);
  };

  const duplicateOffer = (offer: Offer) => {
    const duplicated: Offer = {
      ...offer,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    setOffers([...offers, duplicated]);
    setSelectedOffer(duplicated);
    showToast(t("common.offerDuplicated"), "success");
  };

  const exportToPDF = (offer: Offer) => {
    try {
      if (import.meta.env.DEV) {
        console.log("PDF export started for offer:", offer.id);
      }
      
      // HTML tartalom generálása
      const htmlContent = generatePDFContent(offer, t, settings);
      
      // Próbáljuk meg az új ablakot megnyitni (user gesture, így működik)
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') {
        // Ha az ablak blokkolva van, mutassuk meg az előnézetet a jelenlegi oldalon
        if (import.meta.env.DEV) {
          console.log("Window blocked, showing preview");
        }
        setPrintContent(htmlContent);
        setShowPrintPreview(true);
        return;
      }

      // HTML írása az ablakba
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      if (import.meta.env.DEV) {
        console.log("PDF content written to window");
      }
      
      // Várunk, hogy a tartalom betöltődjön
      printWindow.onload = () => {
        if (import.meta.env.DEV) {
          console.log("Window loaded, calling print");
        }
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (e) {
            console.error("Print error:", e);
            alert(t("offers.exportPDF") + " - Nyomtatási hiba: " + (e as Error).message);
          }
        }, 300);
      };
      
      // Fallback: setTimeout ha az onload nem fut le
      setTimeout(() => {
        try {
          if (printWindow && !printWindow.closed) {
            if (import.meta.env.DEV) {
              console.log("Fallback: calling print");
            }
            printWindow.focus();
            printWindow.print();
          }
        } catch (e) {
          console.error("Print error (fallback):", e);
        }
      }, 1000);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert(t("offers.exportPDF") + " - Hiba történt: " + (error as Error).message);
    }
  };

  const handlePrintFromPreview = () => {
    window.print();
    setShowPrintPreview(false);
  };

  const exportAsPDF = async (offer: Offer) => {
    try {
      if (import.meta.env.DEV) {
        console.log("PDF export started for offer:", offer.id);
      }
      
      // HTML tartalom generálása
      const htmlContent = generatePDFContent(offer, t, settings);
      
      // Tauri save dialog használata
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `ajánlat_${offer.id}_${dateStr}.html`;
      
      const filePath = await save({
        defaultPath: fileName,
        filters: [
          {
            name: "HTML",
            extensions: ["html"]
          },
          {
            name: "All Files",
            extensions: ["*"]
          }
        ]
      });

      if (filePath) {
        // Fájl mentése
        await writeTextFile(filePath, htmlContent);
        showToast(
          settings.language === "hu" 
            ? `HTML fájl sikeresen mentve: ${fileName}` 
            : settings.language === "de"
            ? `HTML-Datei erfolgreich gespeichert: ${fileName}`
            : `HTML file saved successfully: ${fileName}`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showToast(
        settings.language === "hu"
          ? `Hiba történt: ${errorMessage}`
          : settings.language === "de"
          ? `Fehler aufgetreten: ${errorMessage}`
          : `Error occurred: ${errorMessage}`,
        "error"
      );
    }
  };

  const generatePDFContent = (offer: Offer, t: (key: TranslationKey) => string, settings: Settings): string => {
    const formatTime = (hours: number, minutes: number, seconds: number) => {
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (seconds > 0) parts.push(`${seconds}s`);
      return parts.join(" ") || "0";
    };

    // Konvertáljuk a jelenlegi beállítások pénznemére
    const displayCurrency = settings.currency;

    const date = new Date(offer.date);
    const formattedDate = date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Árajánlat - ${offer.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          h1 { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .total { font-size: 1.2em; font-weight: bold; color: #007bff; }
          .section { margin-bottom: 30px; }
          .info { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>3D Nyomtatási Árajánlat</h1>
        
        <div class="info">
          <p><strong>${t("offers.date")}:</strong> ${formattedDate}</p>
          ${offer.customerName ? `<p><strong>${t("offers.customerName")}:</strong> ${offer.customerName}</p>` : ""}
          ${offer.customerContact ? `<p><strong>${t("offers.customerContact")}:</strong> ${offer.customerContact}</p>` : ""}
          ${offer.description ? `<p><strong>${t("offers.description")}:</strong> ${offer.description}</p>` : ""}
        </div>

        <div class="section">
          <h2>${t("offers.printer")}</h2>
          <p><strong>${offer.printerName}</strong> (${offer.printerType}) - ${offer.printerPower}W</p>
          <p><strong>${t("offers.printTime")}:</strong> ${formatTime(offer.printTimeHours, offer.printTimeMinutes, offer.printTimeSeconds)}</p>
        </div>

        <div class="section">
          <h2>${t("offers.filaments")}</h2>
          <table>
            <thead>
              <tr>
                <th>Márka</th>
                <th>Típus</th>
                <th>Szín</th>
                <th>Mennyiség (g)</th>
                <th>Ár (${displayCurrency === "HUF" ? "Ft" : displayCurrency}/kg)</th>
                ${offer.filaments.some(f => f.needsDrying) ? `<th>Szárítás</th>` : ""}
              </tr>
            </thead>
            <tbody>
              ${offer.filaments.map(f => {
                const offerCurrency = offer.currency || "EUR";
                const convertedPrice = convertCurrencyFromTo(f.pricePerKg, offerCurrency, displayCurrency);
                return `
                <tr>
                  <td>${f.brand}</td>
                  <td>${f.type}</td>
                  <td>${f.color || "-"}</td>
                  <td>${f.usedGrams}</td>
                  <td>${convertedPrice.toFixed(2)} ${displayCurrency === "HUF" ? "Ft" : displayCurrency}</td>
                  ${offer.filaments.some(f => f.needsDrying) ? `<td>${f.needsDrying ? `${f.dryingTime}h @ ${f.dryingPower}W` : "-"}</td>` : ""}
                </tr>
              `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>${t("calculator.costBreakdown")}</h2>
          <table>
            ${(() => {
              const offerCurrency = offer.currency || "EUR";
              const filamentCost = convertCurrencyFromTo(offer.costs.filamentCost, offerCurrency, displayCurrency);
              const electricityCost = convertCurrencyFromTo(offer.costs.electricityCost, offerCurrency, displayCurrency);
              const dryingCost = offer.costs.dryingCost > 0 ? convertCurrencyFromTo(offer.costs.dryingCost, offerCurrency, displayCurrency) : 0;
              const usageCost = convertCurrencyFromTo(offer.costs.usageCost, offerCurrency, displayCurrency);
              const totalCost = convertCurrencyFromTo(offer.costs.totalCost, offerCurrency, displayCurrency);
              const profitPercentage = offer.profitPercentage !== undefined ? offer.profitPercentage : 30;
              const profit = convertCurrencyFromTo(offer.costs.totalCost * (profitPercentage / 100), offerCurrency, displayCurrency);
              const revenue = convertCurrencyFromTo(offer.costs.totalCost * (1 + profitPercentage / 100), offerCurrency, displayCurrency);
              return `
            <tr>
              <td>${t("calculator.filamentCost")}</td>
              <td><strong>${filamentCost.toFixed(2)} ${displayCurrency === "HUF" ? "Ft" : displayCurrency}</strong></td>
            </tr>
            <tr>
              <td>${t("calculator.electricityCost")}</td>
              <td><strong>${electricityCost.toFixed(2)} ${displayCurrency === "HUF" ? "Ft" : displayCurrency}</strong></td>
            </tr>
            ${dryingCost > 0 ? `
            <tr>
              <td>${t("calculator.dryingCost")}</td>
              <td><strong>${dryingCost.toFixed(2)} ${displayCurrency === "HUF" ? "Ft" : displayCurrency}</strong></td>
            </tr>
            ` : ""}
            <tr>
              <td>${t("calculator.usageCost")}</td>
              <td><strong>${usageCost.toFixed(2)} ${displayCurrency === "HUF" ? "Ft" : displayCurrency}</strong></td>
            </tr>
            <tr>
              <td><strong>${t("calculator.totalCost")}</strong></td>
              <td><strong>${totalCost.toFixed(2)} ${displayCurrency === "HUF" ? "Ft" : displayCurrency}</strong></td>
            </tr>
            <tr style="border-top: 2px solid #333;">
              <td><strong>${t("calculator.profit")} (${profitPercentage}%):</strong></td>
              <td><strong style="color: #28a745; font-size: 1.1em;">${profit.toFixed(2)} ${displayCurrency === "HUF" ? "Ft" : displayCurrency}</strong></td>
            </tr>
            <tr class="total" style="background-color: #f0f8ff;">
              <td><strong>${t("calculator.revenue")} (${t("calculator.totalPrice")}):</strong></td>
              <td><strong style="color: #007bff; font-size: 1.3em;">${revenue.toFixed(2)} ${displayCurrency === "HUF" ? "Ft" : displayCurrency}</strong></td>
            </tr>
                      `;
                    })()}
          </table>
        </div>
      </body>
      </html>
    `;
  };

  // Szűrés a keresési kifejezés alapján
  const filteredOffers = offers.filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const date = new Date(o.date).toLocaleDateString();
    return (
      o.printerName.toLowerCase().includes(term) ||
      o.printerType.toLowerCase().includes(term) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      date.includes(term) ||
      o.id.toString().includes(term)
    );
  });

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("offers.title")}</h2>
      <p style={themeStyles.pageSubtitle}>Mentett árajánlatok kezelése és exportálása</p>
      
      {/* Kereső mező */}
      {offers.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text }}>
            🔍 {settings.language === "hu" ? "Keresés" : settings.language === "de" ? "Suchen" : "Search"}
          </label>
          <input
            type="text"
            placeholder={settings.language === "hu" ? "Keresés nyomtató, ügyfél vagy dátum alapján..." : settings.language === "de" ? "Suche nach Drucker, Kunde oder Datum..." : "Search by printer, customer or date..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.input, width: "100%", maxWidth: "400px" }}
          />
        </div>
      )}
      
      {offers.length === 0 ? (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "16px" }}>{t("offers.empty")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {/* Árajánlatok lista */}
          <div style={{ flex: "1", minWidth: "300px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", color: theme.colors.text, marginBottom: "16px" }}>
              📋 Mentett árajánlatok
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredOffers.map(offer => {
                const date = new Date(offer.date);
                return (
                  <div
                    key={offer.id}
                    onClick={() => setSelectedOffer(offer)}
                    style={{
                      ...themeStyles.card,
                      backgroundColor: selectedOffer?.id === offer.id ? theme.colors.primary + "20" : theme.colors.surface,
                      border: selectedOffer?.id === offer.id ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (selectedOffer?.id !== offer.id) {
                        Object.assign(e.currentTarget.style, themeStyles.cardHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedOffer?.id !== offer.id) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <strong style={{ fontSize: "16px" }}>
                          {offer.customerName ? `${offer.customerName}` : `Árajánlat #${offer.id}`}
                        </strong>
                        <p style={{ margin: "5px 0", color: theme.colors.textSecondary, fontSize: "14px" }}>
                          {date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US")}
                        </p>
                        {offer.customerName && (
                          <p style={{ margin: "5px 0", fontSize: "14px", color: theme.colors.text }}><strong>{t("offers.customerName")}:</strong> {offer.customerName}</p>
                        )}
                        {offer.customerContact && (
                          <p style={{ margin: "5px 0", fontSize: "14px", color: theme.colors.text }}>
                            <strong>{settings.language === "hu" ? "Elérhetőség" : settings.language === "de" ? "Kontakt" : "Contact"}:</strong> {offer.customerContact}
                          </p>
                        )}
                        <p style={{ margin: "5px 0", fontSize: "14px", color: theme.colors.text }}>
                          <strong>{offer.printerName}</strong> - {offer.totalPrintTimeHours.toFixed(2)} {t("calculator.hoursUnit")}
                        </p>
                        <p style={{ margin: "5px 0", fontSize: "16px", color: theme.colors.primary, fontWeight: "bold" }}>
                          {t("calculator.totalCost")}: {convertCurrencyFromTo(offer.costs.totalCost, offer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOffer(offer.id);
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                        style={{
                          ...themeStyles.button,
                          ...themeStyles.buttonDanger,
                          padding: "8px 16px",
                          fontSize: "12px"
                        }}
                      >
                        {t("offers.delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredOffers.length === 0 && offers.length > 0 && (
                <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                  <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "16px" }}>
                    {settings.language === "hu" ? "Nincs találat a keresési kifejezésre." : settings.language === "de" ? "Keine Ergebnisse für den Suchbegriff." : "No results found for the search term."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Kiválasztott árajánlat részletes nézete */}
          {selectedOffer && (
            <div style={{ ...themeStyles.card, flex: "1", minWidth: "400px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
                  📄 {selectedOffer.customerName ? `${selectedOffer.customerName}` : `Árajánlat #${selectedOffer.id}`}
                </h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => duplicateOffer(selectedOffer)}
                    onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                    onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = "#6c757d 0 2px 4px"; }}
                    style={{
                      ...themeStyles.button,
                      backgroundColor: theme.colors.secondary,
                      color: "#fff",
                      padding: "8px 16px",
                      fontSize: "14px"
                    }}
                  >
                    📋 {t("common.duplicate")}
                  </button>
                  <button
                    onClick={() => exportToPDF(selectedOffer)}
                    onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                    onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
                    style={{
                      ...themeStyles.button,
                      ...themeStyles.buttonPrimary
                    }}
                  >
                    {t("offers.print")}
                  </button>
                  <button
                    onClick={() => exportAsPDF(selectedOffer)}
                    onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                    onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
                    style={{
                      ...themeStyles.button,
                      ...themeStyles.buttonSuccess
                    }}
                  >
                    {t("offers.downloadPDF")}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: theme.colors.surfaceHover, borderRadius: "8px" }}>
                {selectedOffer.customerName && (
                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ color: theme.colors.text }}>{t("offers.customerName")}:</strong> 
                    <span style={{ marginLeft: "8px", color: theme.colors.text }}>{selectedOffer.customerName}</span>
                  </div>
                )}
                {selectedOffer.customerContact && (
                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ color: theme.colors.text }}>
                      {settings.language === "hu" ? "Elérhetőség" : settings.language === "de" ? "Kontakt" : "Contact"}:
                    </strong> 
                    <span style={{ marginLeft: "8px", color: theme.colors.text }}>{selectedOffer.customerContact}</span>
                  </div>
                )}
                {selectedOffer.description && (
                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ color: theme.colors.text }}>{t("offers.description")}:</strong> 
                    <span style={{ marginLeft: "8px", color: theme.colors.text, wordWrap: "break-word", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{selectedOffer.description}</span>
                  </div>
                )}
                <div style={{ marginBottom: "12px" }}>
                  <strong style={{ color: theme.colors.text }}>{t("offers.date")}:</strong> 
                  <span style={{ marginLeft: "8px", color: theme.colors.text }}>
                    {new Date(selectedOffer.date).toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US")}
                  </span>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text }}>
                    📈 {t("offers.profitPercentage")}
                  </label>
                  <select
                    value={selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30}
                    onChange={e => {
                      const value = Number(e.target.value);
                      const updatedOffers = offers.map(o => 
                        o.id === selectedOffer.id ? { ...o, profitPercentage: value } : o
                      );
                      setOffers(updatedOffers);
                      setSelectedOffer({ ...selectedOffer, profitPercentage: value });
                    }}
                    onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
                    onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                    style={{ ...themeStyles.select, width: "100%", maxWidth: "300px" }}
                  >
                    <option value={10}>10%</option>
                    <option value={20}>20%</option>
                    <option value={30}>30% (alapértelmezett)</option>
                    <option value={40}>40%</option>
                    <option value={50}>50%</option>
                  </select>
                  <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
                    Bevétel = Költségek × (1 + {selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30}%) = {convertCurrencyFromTo(selectedOffer.costs.totalCost * (1 + (selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30) / 100), selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "20px", ...themeStyles.card, padding: "20px" }}>
                <strong style={{ display: "block", marginBottom: "12px", fontSize: "16px", color: theme.colors.text }}>
                  🖨️ {t("offers.printer")}
                </strong>
                <div style={{ fontSize: "14px", color: theme.colors.text, lineHeight: "1.8" }}>
                  <strong>{selectedOffer.printerName}</strong> ({selectedOffer.printerType}) - {selectedOffer.printerPower}W
                  <br />
                  <strong>{t("offers.printTime")}:</strong> {selectedOffer.printTimeHours}h {selectedOffer.printTimeMinutes}m {selectedOffer.printTimeSeconds}s
                </div>
              </div>

              <div style={{ marginBottom: "20px", ...themeStyles.card, padding: "20px" }}>
                <strong style={{ display: "block", marginBottom: "12px", fontSize: "16px", color: theme.colors.text }}>
                  🧵 {t("offers.filaments")}
                </strong>
                <ul style={{ marginTop: "10px", paddingLeft: "20px", listStyle: "none" }}>
                  {selectedOffer.filaments.map((f, idx) => (
                    <li key={idx} style={{ marginBottom: "12px", padding: "12px", backgroundColor: theme.colors.surfaceHover, borderRadius: "8px", fontSize: "14px", color: theme.colors.text }}>
                      <strong style={{ color: theme.colors.text }}>{f.brand} {f.type}</strong> {f.color ? `(${f.color})` : ""} - {f.usedGrams}g @ {convertCurrencyFromTo(f.pricePerKg, selectedOffer.currency || "EUR", settings.currency).toFixed(2)}{settings.currency === "HUF" ? "Ft" : settings.currency}/kg
                      {f.needsDrying && (
                        <div style={{ marginTop: "8px", fontSize: "12px", color: theme.colors.textMuted }}>
                          🌡️ Szárítás: {f.dryingTime}h @ {f.dryingPower}W
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ ...themeStyles.card, padding: "20px", backgroundColor: theme.colors.surface }}>
                <strong style={{ display: "block", marginBottom: "16px", fontSize: "16px", color: theme.colors.text }}>
                  💰 {t("calculator.costBreakdown")}
                </strong>
                <div style={{ marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
                    <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.filamentCost")}</span>
                    <strong style={{ fontSize: "16px", color: theme.colors.success }}>{convertCurrencyFromTo(selectedOffer.costs.filamentCost, selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
                    <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.electricityCost")}</span>
                    <strong style={{ fontSize: "16px", color: "#ffc107" }}>{convertCurrencyFromTo(selectedOffer.costs.electricityCost, selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
                  </div>
                  {selectedOffer.costs.dryingCost > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `1px solid ${theme.colors.border}` }}>
                      <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.dryingCost")}</span>
                      <strong style={{ fontSize: "16px", color: theme.colors.primary }}>{convertCurrencyFromTo(selectedOffer.costs.dryingCost, selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "16px", borderBottom: `2px solid ${theme.colors.border}` }}>
                    <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.usageCost")}</span>
                    <strong style={{ fontSize: "16px", color: theme.colors.textMuted }}>{convertCurrencyFromTo(selectedOffer.costs.usageCost, selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: `2px solid ${theme.colors.border}` }}>
                    <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.totalCost")}</span>
                    <strong style={{ fontSize: "16px", color: theme.colors.text }}>{convertCurrencyFromTo(selectedOffer.costs.totalCost, selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.5em", fontWeight: "bold", paddingTop: "16px", backgroundColor: theme.colors.surfaceHover, padding: "16px", borderRadius: "8px", marginTop: "8px" }}>
                    <span style={{ color: theme.colors.text }}>Bevétel ({selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30}% profit):</span>
                    <strong style={{ color: theme.colors.success }}>
                      {convertCurrencyFromTo(selectedOffer.costs.totalCost * (1 + (selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30) / 100), selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${theme.colors.border}` }}>
                    <span style={{ fontSize: "14px", color: theme.colors.text }}>Profit:</span>
                    <strong style={{ fontSize: "18px", color: theme.colors.success, fontWeight: "bold" }}>
                      {convertCurrencyFromTo(selectedOffer.costs.totalCost * ((selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30) / 100), selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            width: "100%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflow: "auto",
            padding: "20px",
            borderRadius: "8px",
            position: "relative"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              alignItems: "center"
            }}>
              <h2 style={{ margin: 0 }}>Nyomtatási előnézet</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handlePrintFromPreview}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  {t("offers.print")}
                </button>
                {selectedOffer && (
                  <button
                    onClick={() => {
                      exportAsPDF(selectedOffer);
                      setShowPrintPreview(false);
                    }}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    {t("offers.downloadPDF")}
                  </button>
                )}
                <button
                  onClick={() => setShowPrintPreview(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: theme.colors.secondary,
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
            <div 
              dangerouslySetInnerHTML={{ __html: printContent }}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                backgroundColor: theme.colors.surface
              }}
            />
          </div>
        </div>
      )}
      
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title={t("common.confirm")}
        message={t("common.confirmDeleteOffer")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText={t("common.yes")}
        cancelText={t("common.cancel")}
        type="danger"
      />
    </div>
  );
};

