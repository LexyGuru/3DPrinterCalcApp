import React, { useState } from "react";
import type { Offer, Settings } from "../types";
import { useTranslation, type TranslationKey } from "../utils/translations";
import { commonStyles } from "../utils/styles";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";

interface Props {
  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
  settings: Settings;
}

export const Offers: React.FC<Props> = ({ offers, setOffers, settings }) => {
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

  const exportAsPDF = (offer: Offer) => {
    try {
      if (import.meta.env.DEV) {
        console.log("PDF export started for offer:", offer.id);
      }
      
      // HTML tartalom generálása
      const htmlContent = generatePDFContent(offer, t, settings);
      
      // Blob létrehozása és letöltés
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ajánlat_${offer.id}_${new Date().toISOString().split('T')[0]}.html`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(t("offers.exportPDF") + " - A HTML fájl letöltve! Megnyithatod és PDF-ként mentheted (Fájl → Nyomtatás → Mentés PDF-ként).");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert(t("offers.exportPDF") + " - Hiba történt: " + (error as Error).message);
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
                <th>Ár (${offer.currency === "HUF" ? "Ft" : offer.currency}/kg)</th>
                ${offer.filaments.some(f => f.needsDrying) ? `<th>Szárítás</th>` : ""}
              </tr>
            </thead>
            <tbody>
              ${offer.filaments.map(f => `
                <tr>
                  <td>${f.brand}</td>
                  <td>${f.type}</td>
                  <td>${f.color || "-"}</td>
                  <td>${f.usedGrams}</td>
                  <td>${f.pricePerKg} ${offer.currency === "HUF" ? "Ft" : offer.currency}</td>
                  ${offer.filaments.some(f => f.needsDrying) ? `<td>${f.needsDrying ? `${f.dryingTime}h @ ${f.dryingPower}W` : "-"}</td>` : ""}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>${t("calculator.costBreakdown")}</h2>
          <table>
            <tr>
              <td>${t("calculator.filamentCost")}</td>
              <td><strong>${offer.costs.filamentCost.toFixed(2)} ${offer.currency === "HUF" ? "Ft" : offer.currency}</strong></td>
            </tr>
            <tr>
              <td>${t("calculator.electricityCost")}</td>
              <td><strong>${offer.costs.electricityCost.toFixed(2)} ${offer.currency === "HUF" ? "Ft" : offer.currency}</strong></td>
            </tr>
            ${offer.costs.dryingCost > 0 ? `
            <tr>
              <td>${t("calculator.dryingCost")}</td>
              <td><strong>${offer.costs.dryingCost.toFixed(2)} ${offer.currency === "HUF" ? "Ft" : offer.currency}</strong></td>
            </tr>
            ` : ""}
            <tr>
              <td>${t("calculator.usageCost")}</td>
              <td><strong>${offer.costs.usageCost.toFixed(2)} ${offer.currency === "HUF" ? "Ft" : offer.currency}</strong></td>
            </tr>
            <tr>
              <td><strong>${t("calculator.totalCost")}</strong></td>
              <td><strong>${offer.costs.totalCost.toFixed(2)} ${offer.currency === "HUF" ? "Ft" : offer.currency}</strong></td>
            </tr>
            ${(() => {
              const profitPercentage = offer.profitPercentage !== undefined ? offer.profitPercentage : 30;
              const revenue = offer.costs.totalCost * (1 + profitPercentage / 100);
              return `
            <tr class="total" style="background-color: #f0f8ff; border-top: 2px solid #333;">
              <td><strong>Összes ár:</strong></td>
              <td><strong style="color: #007bff; font-size: 1.3em;">${revenue.toFixed(2)} ${offer.currency === "HUF" ? "Ft" : offer.currency}</strong></td>
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
      <h2 style={commonStyles.pageTitle}>{t("offers.title")}</h2>
      <p style={commonStyles.pageSubtitle}>Mentett árajánlatok kezelése és exportálása</p>
      
      {/* Kereső mező */}
      {offers.length > 0 && (
        <div style={{ ...commonStyles.card, marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#212529" }}>
            🔍 {settings.language === "hu" ? "Keresés" : settings.language === "de" ? "Suchen" : "Search"}
          </label>
          <input
            type="text"
            placeholder={settings.language === "hu" ? "Keresés nyomtató, ügyfél vagy dátum alapján..." : settings.language === "de" ? "Suche nach Drucker, Kunde oder Datum..." : "Search by printer, customer or date..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, commonStyles.inputFocus)}
            onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
            style={{ ...commonStyles.input, width: "100%", maxWidth: "400px" }}
          />
        </div>
      )}
      
      {offers.length === 0 ? (
        <div style={{ ...commonStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <p style={{ margin: 0, color: "#6c757d", fontSize: "16px" }}>{t("offers.empty")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {/* Árajánlatok lista */}
          <div style={{ flex: "1", minWidth: "300px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#495057", marginBottom: "16px" }}>
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
                      ...commonStyles.card,
                      backgroundColor: selectedOffer?.id === offer.id ? "#e3f2fd" : "#fff",
                      border: selectedOffer?.id === offer.id ? "2px solid #007bff" : "1px solid #e9ecef",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (selectedOffer?.id !== offer.id) {
                        Object.assign(e.currentTarget.style, commonStyles.cardHover);
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
                        <p style={{ margin: "5px 0", color: "#666", fontSize: "14px" }}>
                          {date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US")}
                        </p>
                        {offer.customerName && (
                          <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>{t("offers.customerName")}:</strong> {offer.customerName}</p>
                        )}
                        {offer.customerContact && (
                          <p style={{ margin: "5px 0", fontSize: "14px" }}>
                            <strong>{settings.language === "hu" ? "Elérhetőség" : settings.language === "de" ? "Kontakt" : "Contact"}:</strong> {offer.customerContact}
                          </p>
                        )}
                        <p style={{ margin: "5px 0", fontSize: "14px" }}>
                          <strong>{offer.printerName}</strong> - {offer.totalPrintTimeHours.toFixed(2)} {t("calculator.hoursUnit")}
                        </p>
                        <p style={{ margin: "5px 0", fontSize: "16px", color: "#007bff", fontWeight: "bold" }}>
                          {t("calculator.totalCost")}: {offer.costs.totalCost.toFixed(2)} {offer.currency === "HUF" ? "Ft" : offer.currency}
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
                          ...commonStyles.button,
                          ...commonStyles.buttonDanger,
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
                <div style={{ ...commonStyles.card, textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                  <p style={{ margin: 0, color: "#6c757d", fontSize: "16px" }}>
                    {settings.language === "hu" ? "Nincs találat a keresési kifejezésre." : settings.language === "de" ? "Keine Ergebnisse für den Suchbegriff." : "No results found for the search term."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Kiválasztott árajánlat részletes nézete */}
          {selectedOffer && (
            <div style={{ ...commonStyles.card, flex: "1", minWidth: "400px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#495057" }}>
                  📄 {selectedOffer.customerName ? `${selectedOffer.customerName}` : `Árajánlat #${selectedOffer.id}`}
                </h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => duplicateOffer(selectedOffer)}
                    onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, commonStyles.buttonHover)}
                    onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = "#6c757d 0 2px 4px"; }}
                    style={{
                      ...commonStyles.button,
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      padding: "8px 16px",
                      fontSize: "14px"
                    }}
                  >
                    📋 {t("common.duplicate")}
                  </button>
                  <button
                    onClick={() => exportToPDF(selectedOffer)}
                    onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, commonStyles.buttonHover)}
                    onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = commonStyles.buttonPrimary.boxShadow; }}
                    style={{
                      ...commonStyles.button,
                      ...commonStyles.buttonPrimary
                    }}
                  >
                    {t("offers.print")}
                  </button>
                  <button
                    onClick={() => exportAsPDF(selectedOffer)}
                    onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, commonStyles.buttonHover)}
                    onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = commonStyles.buttonSuccess.boxShadow; }}
                    style={{
                      ...commonStyles.button,
                      ...commonStyles.buttonSuccess
                    }}
                  >
                    {t("offers.downloadPDF")}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                {selectedOffer.customerName && (
                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ color: "#495057" }}>{t("offers.customerName")}:</strong> 
                    <span style={{ marginLeft: "8px", color: "#212529" }}>{selectedOffer.customerName}</span>
                  </div>
                )}
                {selectedOffer.customerContact && (
                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ color: "#495057" }}>
                      {settings.language === "hu" ? "Elérhetőség" : settings.language === "de" ? "Kontakt" : "Contact"}:
                    </strong> 
                    <span style={{ marginLeft: "8px", color: "#212529" }}>{selectedOffer.customerContact}</span>
                  </div>
                )}
                {selectedOffer.description && (
                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ color: "#495057" }}>{t("offers.description")}:</strong> 
                    <span style={{ marginLeft: "8px", color: "#212529" }}>{selectedOffer.description}</span>
                  </div>
                )}
                <div style={{ marginBottom: "12px" }}>
                  <strong style={{ color: "#495057" }}>{t("offers.date")}:</strong> 
                  <span style={{ marginLeft: "8px", color: "#212529" }}>
                    {new Date(selectedOffer.date).toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US")}
                  </span>
                </div>

                {selectedOffer.description && (
                  <div style={{ marginBottom: "12px" }}>
                    <strong style={{ color: "#495057" }}>{t("offers.description")}:</strong> 
                    <span style={{ marginLeft: "8px", color: "#212529" }}>{selectedOffer.description}</span>
                  </div>
                )}

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#495057" }}>
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
                    onFocus={(e) => Object.assign(e.target.style, commonStyles.selectFocus)}
                    onBlur={(e) => { e.target.style.borderColor = "#e9ecef"; e.target.style.boxShadow = "none"; }}
                    style={{ ...commonStyles.select, width: "100%", maxWidth: "300px" }}
                  >
                    <option value={10}>10%</option>
                    <option value={20}>20%</option>
                    <option value={30}>30% (alapértelmezett)</option>
                    <option value={40}>40%</option>
                    <option value={50}>50%</option>
                  </select>
                  <p style={{ marginTop: "4px", fontSize: "12px", color: "#6c757d" }}>
                    Bevétel = Költségek × (1 + {selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30}%) = {(selectedOffer.costs.totalCost * (1 + (selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30) / 100)).toFixed(2)} {selectedOffer.currency === "HUF" ? "Ft" : selectedOffer.currency}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "20px", ...commonStyles.card, padding: "20px" }}>
                <strong style={{ display: "block", marginBottom: "12px", fontSize: "16px", color: "#495057" }}>
                  🖨️ {t("offers.printer")}
                </strong>
                <div style={{ fontSize: "14px", color: "#212529", lineHeight: "1.8" }}>
                  <strong>{selectedOffer.printerName}</strong> ({selectedOffer.printerType}) - {selectedOffer.printerPower}W
                  <br />
                  <strong>{t("offers.printTime")}:</strong> {selectedOffer.printTimeHours}h {selectedOffer.printTimeMinutes}m {selectedOffer.printTimeSeconds}s
                </div>
              </div>

              <div style={{ marginBottom: "20px", ...commonStyles.card, padding: "20px" }}>
                <strong style={{ display: "block", marginBottom: "12px", fontSize: "16px", color: "#495057" }}>
                  🧵 {t("offers.filaments")}
                </strong>
                <ul style={{ marginTop: "10px", paddingLeft: "20px", listStyle: "none" }}>
                  {selectedOffer.filaments.map((f, idx) => (
                    <li key={idx} style={{ marginBottom: "12px", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", fontSize: "14px" }}>
                      <strong>{f.brand} {f.type}</strong> {f.color ? `(${f.color})` : ""} - {f.usedGrams}g @ {f.pricePerKg}{selectedOffer.currency === "HUF" ? "Ft" : selectedOffer.currency}/kg
                      {f.needsDrying && (
                        <div style={{ marginTop: "8px", fontSize: "12px", color: "#6c757d" }}>
                          🌡️ Szárítás: {f.dryingTime}h @ {f.dryingPower}W
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ ...commonStyles.card, padding: "20px", backgroundColor: "#fff" }}>
                <strong style={{ display: "block", marginBottom: "16px", fontSize: "16px", color: "#495057" }}>
                  💰 {t("calculator.costBreakdown")}
                </strong>
                <div style={{ marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e9ecef" }}>
                    <span style={{ fontSize: "14px", color: "#495057" }}>{t("calculator.filamentCost")}</span>
                    <strong style={{ fontSize: "16px", color: "#28a745" }}>{selectedOffer.costs.filamentCost.toFixed(2)} {selectedOffer.currency === "HUF" ? "Ft" : selectedOffer.currency}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e9ecef" }}>
                    <span style={{ fontSize: "14px", color: "#495057" }}>{t("calculator.electricityCost")}</span>
                    <strong style={{ fontSize: "16px", color: "#ffc107" }}>{selectedOffer.costs.electricityCost.toFixed(2)} {selectedOffer.currency === "HUF" ? "Ft" : selectedOffer.currency}</strong>
                  </div>
                  {selectedOffer.costs.dryingCost > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #e9ecef" }}>
                      <span style={{ fontSize: "14px", color: "#495057" }}>{t("calculator.dryingCost")}</span>
                      <strong style={{ fontSize: "16px", color: "#17a2b8" }}>{selectedOffer.costs.dryingCost.toFixed(2)} {selectedOffer.currency === "HUF" ? "Ft" : selectedOffer.currency}</strong>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "16px", borderBottom: "2px solid #dee2e6" }}>
                    <span style={{ fontSize: "14px", color: "#495057" }}>{t("calculator.usageCost")}</span>
                    <strong style={{ fontSize: "16px", color: "#6c757d" }}>{selectedOffer.costs.usageCost.toFixed(2)} {selectedOffer.currency === "HUF" ? "Ft" : selectedOffer.currency}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "12px", borderBottom: "2px solid #dee2e6" }}>
                    <span style={{ fontSize: "14px", color: "#495057" }}>{t("calculator.totalCost")}</span>
                    <strong style={{ fontSize: "16px", color: "#007bff" }}>{selectedOffer.costs.totalCost.toFixed(2)} {selectedOffer.currency === "HUF" ? "Ft" : selectedOffer.currency}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.5em", fontWeight: "bold", paddingTop: "16px", backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px", marginTop: "8px" }}>
                    <span style={{ color: "#495057" }}>Bevétel ({selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30}% profit):</span>
                    <strong style={{ color: "#28a745" }}>
                      {(selectedOffer.costs.totalCost * (1 + (selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30) / 100)).toFixed(2)} {selectedOffer.currency === "HUF" ? "Ft" : selectedOffer.currency}
                    </strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e9ecef" }}>
                    <span style={{ fontSize: "14px", color: "#495057" }}>Profit:</span>
                    <strong style={{ fontSize: "18px", color: "#28a745", fontWeight: "bold" }}>
                      {(selectedOffer.costs.totalCost * ((selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30) / 100)).toFixed(2)} {selectedOffer.currency === "HUF" ? "Ft" : selectedOffer.currency}
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
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  ❌ Bezárás
                </button>
              </div>
            </div>
            <div 
              dangerouslySetInnerHTML={{ __html: printContent }}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                backgroundColor: "#fff"
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

