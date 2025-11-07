import React, { useMemo, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type { Offer, Settings, Printer, OfferStatus, OfferStatusHistory } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation, type TranslationKey } from "../utils/translations";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { convertCurrencyFromTo } from "../utils/currency";
import { Tooltip } from "./Tooltip";
import { calculateOfferCosts } from "../utils/offerCalc";
import { validateUsedGrams, validateDryingTime, validateDryingPower } from "../utils/validation";

const STATUS_ORDER: OfferStatus[] = ["draft", "sent", "accepted", "rejected", "completed"];

interface Props {
  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
  printers: Printer[];
}

export const Offers: React.FC<Props> = ({ offers, setOffers, settings, theme, themeStyles, printers }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printContent, setPrintContent] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerContact, setEditCustomerContact] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editProfitPercentage, setEditProfitPercentage] = useState<number>(30);
  const [editFilaments, setEditFilaments] = useState<Offer["filaments"]>([]);
  const [draggedOfferId, setDraggedOfferId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ offerId: number; x: number; y: number } | null>(null);
  const [statusChangeOffer, setStatusChangeOffer] = useState<Offer | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<OfferStatus | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState("");
  const [statusFilter, setStatusFilter] = useState<OfferStatus | "all">("all");
  const locale = settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US";

  const selectedOfferCreatedAt = useMemo(() => {
    return selectedOffer ? new Date(selectedOffer.date) : null;
  }, [selectedOffer]);

  const selectedOfferStatusDate = useMemo(() => {
    if (!selectedOffer) return null;
    const stamp =
      selectedOffer.statusUpdatedAt ||
      (selectedOffer.statusHistory && selectedOffer.statusHistory.length > 0
        ? selectedOffer.statusHistory[selectedOffer.statusHistory.length - 1].date
        : undefined);
    return stamp ? new Date(stamp) : null;
  }, [selectedOffer]);

  const deleteOffer = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId === null) return;
    const id = deleteConfirmId;
    const offerToDelete = offers.find(o => o.id === id);
    console.log("🗑️ Árajánlat törlése...", { offerId: id, customerName: offerToDelete?.customerName });
    setOffers(offers.filter(o => o.id !== id));
    if (selectedOffer?.id === id) {
      setSelectedOffer(null);
    }
    console.log("✅ Árajánlat sikeresen törölve", { offerId: id });
    showToast(t("common.offerDeleted"), "success");
    setDeleteConfirmId(null);
  };

  const duplicateOffer = (offer: Offer) => {
    console.log("📋 Árajánlat duplikálása...", { originalOfferId: offer.id, customerName: offer.customerName });
    const duplicated: Offer = {
      ...offer,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    setOffers([...offers, duplicated]);
    setSelectedOffer(duplicated);
    console.log("✅ Árajánlat sikeresen duplikálva", { newOfferId: duplicated.id });
    showToast(t("common.offerDuplicated"), "success");
  };

  const getStatusLabel = (status: OfferStatus): string => {
    const hu: Record<OfferStatus, string> = {
      draft: "Tervezés",
      sent: "Kiküldve",
      accepted: "Elfogadva",
      rejected: "Elutasítva",
      completed: "Befejezve",
    };
    const de: Record<OfferStatus, string> = {
      draft: "Entwurf",
      sent: "Gesendet",
      accepted: "Akzeptiert",
      rejected: "Abgelehnt",
      completed: "Abgeschlossen",
    };
    const en: Record<OfferStatus, string> = {
      draft: "Draft",
      sent: "Sent",
      accepted: "Accepted",
      rejected: "Rejected",
      completed: "Completed",
    };
    if (settings.language === "hu") return hu[status];
    if (settings.language === "de") return de[status];
    return en[status];
  };

  const getStatusColor = (status: OfferStatus): string => {
    switch (status) {
      case "draft":
        return "#6c757d";
      case "sent":
        return "#0d6efd";
      case "accepted":
        return "#20c997";
      case "rejected":
        return "#dc3545";
      case "completed":
        return "#6610f2";
      default:
        return "#6c757d";
    }
  };

  const changeOfferStatus = (offer: Offer, newStatus: OfferStatus, note?: string) => {
    const timestamp = new Date().toISOString();
    const historyEntry: OfferStatusHistory = {
      status: newStatus,
      date: timestamp,
      note: note?.trim() || undefined,
    };

    const updatedOffers = offers.map(o => {
      if (o.id !== offer.id) return o;
      const existingHistory = o.statusHistory ?? [];
      const nextHistory =
        existingHistory.length === 0 && o.status
          ? [...existingHistory, { status: o.status, date: o.date }]
          : existingHistory;

      return {
        ...o,
        status: newStatus,
        statusHistory: [...nextHistory, historyEntry],
        statusUpdatedAt: timestamp,
      };
    });

    setOffers(updatedOffers);
    const updated = updatedOffers.find(o => o.id === offer.id) || null;
    setSelectedOffer(updated);
    setStatusChangeOffer(null);
    setStatusChangeTarget(null);
    setStatusChangeNote("");

    showToast(
      settings.language === "hu"
        ? `Státusz frissítve: ${getStatusLabel(newStatus)}`
        : settings.language === "de"
        ? `Status aktualisiert: ${getStatusLabel(newStatus)}`
        : `Status updated: ${getStatusLabel(newStatus)}`,
      "success"
    );
  };

  const startEditOffer = (offer: Offer) => {
    console.log("✏️ Árajánlat szerkesztése indítása...", { offerId: offer.id, customerName: offer.customerName });
    setEditingOffer(offer);
    setEditCustomerName(offer.customerName || "");
    setEditCustomerContact(offer.customerContact || "");
    setEditDescription(offer.description || "");
    setEditProfitPercentage(offer.profitPercentage || 30);
    setEditFilaments([...offer.filaments]);
  };

  const cancelEditOffer = () => {
    setEditingOffer(null);
    setEditCustomerName("");
    setEditCustomerContact("");
    setEditDescription("");
    setEditProfitPercentage(30);
    setEditFilaments([]);
  };

  const saveEditOffer = () => {
    if (!editingOffer) return;
    
    if (!editCustomerName.trim()) {
      showToast(t("common.error") + ": " + (settings.language === "hu" ? "Kérlek add meg az ügyfél nevét!" : settings.language === "de" ? "Bitte geben Sie den Kundennamen ein!" : "Please enter customer name!"), "error");
      return;
    }

    console.log("💾 Árajánlat mentése...", { 
      offerId: editingOffer.id, 
      customerName: editCustomerName,
      profitPercentage: editProfitPercentage
    });

    // Ellenőrizzük, hogy változott-e valami
    const filamentsChanged = JSON.stringify(editingOffer.filaments) !== JSON.stringify(editFilaments);
    const hasChanges = 
      editingOffer.customerName !== editCustomerName.trim() ||
      editingOffer.customerContact !== (editCustomerContact.trim() || undefined) ||
      editingOffer.description !== (editDescription.trim() || undefined) ||
      editingOffer.profitPercentage !== editProfitPercentage ||
      filamentsChanged;

    // Ha változott, mentjük az előzménybe
    let history = editingOffer.history || [];
    let currentVersion = editingOffer.currentVersion || 1;
    
    // Ha a filamentek változtak, újraszámoljuk a költségeket
    let newCosts = editingOffer.costs;
    if (filamentsChanged) {
      const printer = printers.find(p => p.name === editingOffer.printerName);
      if (printer) {
        const calculatedCosts = calculateOfferCosts(
          {
            ...editingOffer,
            filaments: editFilaments,
          },
          printer,
          settings
        );
        if (calculatedCosts) {
          newCosts = calculatedCosts;
        }
      }
    }
    
    if (hasChanges) {
      // Mentjük a régi verziót az előzményekbe
      const historyEntry: import("../types").OfferHistory = {
        version: currentVersion,
        date: editingOffer.date,
        customerName: editingOffer.customerName,
        customerContact: editingOffer.customerContact,
        description: editingOffer.description,
        profitPercentage: editingOffer.profitPercentage,
        costs: { ...editingOffer.costs },
      };
      
      history = [historyEntry, ...history];
      currentVersion = currentVersion + 1;
    }

    const updatedOffer: Offer = {
      ...editingOffer,
      customerName: editCustomerName.trim(),
      customerContact: editCustomerContact.trim() || undefined,
      description: editDescription.trim() || undefined,
      profitPercentage: editProfitPercentage,
      filaments: editFilaments,
      costs: newCosts,
      history: history,
      currentVersion: currentVersion,
      date: hasChanges ? new Date().toISOString() : editingOffer.date, // Frissítjük a dátumot, ha változott
    };

    const updatedOffers = offers.map(o => o.id === editingOffer.id ? updatedOffer : o);
    setOffers(updatedOffers);
    setSelectedOffer(updatedOffer);
    cancelEditOffer();
    
    console.log("✅ Árajánlat sikeresen mentve", { 
      offerId: editingOffer.id, 
      version: currentVersion,
      hasHistory: history.length > 0
    });
    showToast(
      settings.language === "hu" ? `Árajánlat sikeresen mentve${hasChanges ? ` (v${currentVersion})` : ""}` :
      settings.language === "de" ? `Angebot erfolgreich gespeichert${hasChanges ? ` (v${currentVersion})` : ""}` :
      `Offer saved successfully${hasChanges ? ` (v${currentVersion})` : ""}`,
      "success"
    );
  };

  const exportToPDF = (offer: Offer) => {
    try {
      console.log("📄 PDF export indítása...", { 
        offerId: offer.id, 
        customerName: offer.customerName,
        totalCost: offer.costs.totalCost,
        currency: offer.currency 
      });
      
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
        console.log("📄 PDF ablak betöltve, nyomtatás indítása...");
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
            console.log("✅ PDF export sikeres", { offerId: offer.id });
          } catch (e) {
            console.error("❌ PDF export hiba:", e);
            alert(t("offers.exportPDF") + " - Nyomtatási hiba: " + (e as Error).message);
          }
        }, 300);
      };
      
      // Fallback: setTimeout ha az onload nem fut le
      setTimeout(() => {
        try {
          if (printWindow && !printWindow.closed) {
            console.log("📄 PDF export fallback: nyomtatás indítása...");
            printWindow.focus();
            printWindow.print();
            console.log("✅ PDF export sikeres (fallback)", { offerId: offer.id });
          }
        } catch (e) {
          console.error("❌ PDF export hiba (fallback):", e);
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

  const openPDFPreview = (offer: Offer) => {
    const htmlContent = generatePDFContent(offer, t, settings);
    setPrintContent(htmlContent);
    setShowPrintPreview(true);
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

  const statusSummary = useMemo(() => {
    return STATUS_ORDER.map(status => {
      let count = 0;
      let latestChange: string | null = null;

      offers.forEach(offer => {
        const currentStatus = offer.status ?? "draft";
        if (currentStatus === status) {
          count += 1;
          const candidate = offer.statusUpdatedAt || (offer.statusHistory && offer.statusHistory.length > 0
            ? offer.statusHistory[offer.statusHistory.length - 1].date
            : offer.date);
          if (candidate) {
            const candidateTime = new Date(candidate).getTime();
            if (!latestChange || candidateTime > new Date(latestChange).getTime()) {
              latestChange = candidate;
            }
          }
        }
      });

      return {
        status,
        count,
        updatedAt: latestChange,
      };
    });
  }, [offers]);

  const totalOffers = offers.length;

  const recentStatusChanges = useMemo(() => {
    const entries: Array<{
      offerId: number;
      status: OfferStatus;
      date: string;
      note?: string;
      customerName?: string;
    }> = [];

    offers.forEach(offer => {
      if (offer.statusHistory && offer.statusHistory.length > 0) {
        offer.statusHistory.forEach(history => {
          if (history.date) {
            entries.push({
              offerId: offer.id,
              status: history.status,
              date: history.date,
              note: history.note,
              customerName: offer.customerName,
            });
          }
        });
      } else if (offer.status && offer.statusUpdatedAt) {
        entries.push({
          offerId: offer.id,
          status: offer.status,
          date: offer.statusUpdatedAt,
          customerName: offer.customerName,
        });
      }
    });

    return entries
      .filter(entry => !Number.isNaN(new Date(entry.date).getTime()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [offers]);

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "—";
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString(locale, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const filteredOffers = offers.filter(o => {
    if (!searchTerm && statusFilter === "all") return true;
    const term = searchTerm.toLowerCase();
    const date = new Date(o.date).toLocaleDateString();
    const matchesSearch = !searchTerm ||
      o.printerName.toLowerCase().includes(term) ||
      o.printerType.toLowerCase().includes(term) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      date.includes(term) ||
      o.id.toString().includes(term);

    if (!matchesSearch) {
      return false;
    }

    if (statusFilter !== "all") {
      const currentStatus = o.status ?? "draft";
      return currentStatus === statusFilter;
    }

    return true;
  });

  // Drag & Drop funkciók
  const handleDragStart = (e: React.DragEvent, offerId: number) => {
    setDraggedOfferId(offerId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", offerId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetOfferId: number) => {
    e.preventDefault();
    if (draggedOfferId === null || draggedOfferId === targetOfferId) {
      setDraggedOfferId(null);
      return;
    }

    const draggedIndex = offers.findIndex(o => o.id === draggedOfferId);
    const targetIndex = offers.findIndex(o => o.id === targetOfferId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedOfferId(null);
      return;
    }

    // Átrendezés
    const newOffers = [...offers];
    const [removed] = newOffers.splice(draggedIndex, 1);
    newOffers.splice(targetIndex, 0, removed);

    setOffers(newOffers);
    setDraggedOfferId(null);
    console.log("🔄 Árajánlatok átrendezve", { draggedId: draggedOfferId, targetId: targetOfferId });
    showToast(
      settings.language === "hu" ? "Árajánlatok átrendezve" :
      settings.language === "de" ? "Angebote neu angeordnet" :
      "Offers reordered",
      "success"
    );
  };

  const handleDragEnd = () => {
    setDraggedOfferId(null);
  };

  // Kontextus menü funkciók
  const handleContextMenu = (e: React.MouseEvent, offer: Offer) => {
    e.preventDefault();
    setContextMenu({ offerId: offer.id, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleContextMenuAction = (action: "edit" | "duplicate" | "delete" | "export") => {
    if (!contextMenu) return;
    const offer = offers.find(o => o.id === contextMenu.offerId);
    if (!offer) {
      closeContextMenu();
      return;
    }

    switch (action) {
      case "edit":
        startEditOffer(offer);
        break;
      case "duplicate":
        duplicateOffer(offer);
        break;
      case "delete":
        deleteOffer(offer.id);
        break;
      case "export":
        exportToPDF(offer);
        break;
    }
    closeContextMenu();
  };

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("offers.title")}</h2>
      <p style={themeStyles.pageSubtitle}>
        {settings.language === "hu" ? "Mentett árajánlatok kezelése és exportálása" : settings.language === "de" ? "Gespeicherte Angebote verwalten und exportieren" : "Manage and export saved offers"}
      </p>
      
      {/* Kereső mező */}
      {offers.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "600", 
            fontSize: "14px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
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
          <p style={{ 
            margin: 0, 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, 
            fontSize: "16px" 
          }}>{t("offers.empty")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              ...themeStyles.card,
              marginBottom: "24px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "700",
                  color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <span style={{ fontSize: "22px" }}>📊</span>
                  {settings.language === "hu"
                    ? "Státusz összefoglaló"
                    : settings.language === "de"
                    ? "Status-Übersicht"
                    : "Status overview"}
                </h3>
                <p style={{
                  margin: "6px 0 0 0",
                  fontSize: "13px",
                  color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
                  maxWidth: "540px",
                }}>
                  {settings.language === "hu"
                    ? "Gyors áttekintés az árajánlatok állapotáról, legutóbbi módosításokról és egy kattintásos státusz szűrés."
                    : settings.language === "de"
                    ? "Schneller Überblick über Angebotsstatus, letzte Änderungen und Ein-Klick-Filter."
                    : "Quick glance at quote statuses, recent changes, and one-click status filtering."}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setStatusFilter("all")}
                  style={{
                    padding: "8px 14px",
                    fontSize: "12px",
                    fontWeight: statusFilter === "all" ? 700 : 600,
                    borderRadius: "999px",
                    border: statusFilter === "all" ? `1px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                    backgroundColor: statusFilter === "all" ? theme.colors.primary : theme.colors.surfaceHover,
                    color: statusFilter === "all" ? "#fff" : (theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text),
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {settings.language === "hu"
                    ? `Összes (${totalOffers})`
                    : settings.language === "de"
                    ? `Alle (${totalOffers})`
                    : `All (${totalOffers})`}
                </button>
                {statusSummary.map(summary => {
                  const isActive = statusFilter === summary.status;
                  const color = getStatusColor(summary.status);
                  return (
                    <button
                      key={summary.status}
                      onClick={() => setStatusFilter(summary.status)}
                      style={{
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: isActive ? 700 : 600,
                        borderRadius: "999px",
                        border: `1px solid ${isActive ? color : theme.colors.border}`,
                        backgroundColor: isActive ? color : theme.colors.surfaceHover,
                        color: isActive ? "#fff" : (theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text),
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {getStatusLabel(summary.status)} ({summary.count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
            }}>
              {statusSummary.map(summary => {
                const color = getStatusColor(summary.status);
                return (
                  <div
                    key={`summary-${summary.status}`}
                    style={{
                      backgroundColor: theme.colors.background?.includes('gradient') ? "rgba(255,255,255,0.75)" : theme.colors.surfaceHover,
                      borderRadius: "16px",
                      padding: "16px",
                      border: `1px solid ${color}30`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                        {getStatusLabel(summary.status)}
                      </span>
                      <span style={{ fontSize: "20px", fontWeight: 700, color }}>{summary.count}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                      {summary.updatedAt
                        ? `${settings.language === "hu" ? "Utolsó módosítás" : settings.language === "de" ? "Letzte Änderung" : "Last change"}: ${formatDateTime(summary.updatedAt)}`
                        : settings.language === "hu"
                        ? "Még nem érkezett ide státusz"
                        : settings.language === "de"
                        ? "Noch kein Statuswechsel"
                        : "No status updates yet"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <h4 style={{
                margin: "4px 0 10px 0",
                fontSize: "14px",
                fontWeight: 700,
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                <span>⏱️</span>
                {settings.language === "hu"
                  ? "Legutóbbi státuszváltások"
                  : settings.language === "de"
                  ? "Neueste Statusänderungen"
                  : "Recent status changes"}
              </h4>
              {recentStatusChanges.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {recentStatusChanges.map(entry => (
                    <div
                      key={`${entry.offerId}-${entry.date}-${entry.status}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: `1px solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.surface,
                        borderLeft: `4px solid ${getStatusColor(entry.status)}`,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <strong style={{ fontSize: "13px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                          {getStatusLabel(entry.status)}
                        </strong>
                        <span style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                          {(entry.customerName || (settings.language === "hu" ? "Árajánlat" : settings.language === "de" ? "Angebot" : "Quote"))} #{entry.offerId}
                        </span>
                        {entry.note && (
                          <span style={{ fontSize: "11px", fontStyle: "italic", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                            “{entry.note}”
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                        {formatDateTime(entry.date)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: "24px 16px",
                  borderRadius: "12px",
                  border: `1px dashed ${theme.colors.border}`,
                  textAlign: "center",
                  color: theme.colors.textMuted,
                }}>
                  {settings.language === "hu" ? "Még nem történt státuszváltás" : settings.language === "de" ? "Noch keine Statusänderungen" : "No status changes recorded yet"}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* Árajánlatok lista */}
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h3 style={{ 
                fontSize: "20px", 
                fontWeight: "600", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                marginBottom: "16px" 
              }}>
                📋 Mentett árajánlatok
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredOffers.map(offer => {
                  const date = new Date(offer.date);
                  const statusEntry =
                    offer.statusHistory && offer.statusHistory.length > 0
                      ? offer.statusHistory[offer.statusHistory.length - 1]
                      : null;
                  const statusUpdatedAt = offer.statusUpdatedAt || statusEntry?.date || offer.date;
                  const statusUpdatedDate = statusUpdatedAt ? new Date(statusUpdatedAt) : null;
                  const totalAmount = convertCurrencyFromTo(
                    offer.costs.totalCost,
                    offer.currency || "EUR",
                    settings.currency
                  ).toFixed(2);
                  return (
                    <div
                      key={offer.id}
                      onClick={() => setSelectedOffer(offer)}
                      onContextMenu={(e) => handleContextMenu(e, offer)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, offer.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, offer.id)}
                      onDragEnd={handleDragEnd}
                      style={{
                        ...themeStyles.card,
                        padding: "18px 20px",
                        backgroundColor: selectedOffer?.id === offer.id ? theme.colors.primary + "15" : theme.colors.surface,
                        border: selectedOffer?.id === offer.id ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                        cursor: draggedOfferId === offer.id ? "grabbing" : "grab",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: draggedOfferId === offer.id ? 0.5 : 1,
                        transform: draggedOfferId === offer.id ? "scale(0.96)" : "scale(1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px"
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOffer?.id !== offer.id && draggedOfferId !== offer.id) {
                          Object.assign(e.currentTarget.style, themeStyles.cardHover);
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedOffer?.id !== offer.id) {
                          e.currentTarget.style.transform = draggedOfferId === offer.id ? "scale(0.95)" : "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                        }
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <strong style={{ fontSize: "16px" }}>
                            {offer.customerName
                              ? `${offer.customerName}`
                              : settings.language === "hu"
                              ? `Árajánlat #${offer.id}`
                              : settings.language === "de"
                              ? `Angebot #${offer.id}`
                              : `Quote #${offer.id}`}
                            </strong>
                            {offer.status && (
                              <span
                                style={{
                                  padding: "4px 12px",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  borderRadius: "999px",
                                  backgroundColor: getStatusColor(offer.status) + "18",
                                  color: getStatusColor(offer.status),
                                  border: `1px solid ${getStatusColor(offer.status)}`,
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase"
                                }}
                              >
                                {getStatusLabel(offer.status)}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                            <span>🗓️ {date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US")}</span>
                            {statusUpdatedDate && (
                              <span>
                                ⏱️ {settings.language === "hu" ? "Frissítve" : settings.language === "de" ? "Aktualisiert" : "Updated"}: {statusUpdatedDate.toLocaleString(
                                  settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US",
                                  { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }
                                )}
                              </span>
                            )}
                            <span>🖨️ {offer.printerName}</span>
                            <span>⏳ {offer.totalPrintTimeHours.toFixed(2)} {t("calculator.hoursUnit")}</span>
                          </div>
                          {offer.description && (
                            <p style={{ margin: 0, fontSize: "13px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.textSecondary }}>
                              {offer.description.length > 160 ? `${offer.description.slice(0, 160)}…` : offer.description}
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", minWidth: "120px" }}>
                          <span style={{ fontSize: "18px", fontWeight: "700", color: theme.colors.primary }}>
                            {totalAmount} {settings.currency === "HUF" ? "Ft" : settings.currency}
                          </span>
                          {offer.customerContact && (
                            <span style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.textSecondary }}>
                              📧 {offer.customerContact}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap" }}>
                        <Tooltip content={settings.language === "hu" ? "Árajánlat törlése" : settings.language === "de" ? "Angebot löschen" : "Delete offer"}>
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
                              padding: "6px 14px",
                              fontSize: "12px"
                            }}
                          >
                            {t("offers.delete")}
                          </button>
                        </Tooltip>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 auto", minWidth: "240px" }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: "22px", 
                      fontWeight: "600", 
                      color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                    }}>
                      📄 {selectedOffer.customerName ? `${selectedOffer.customerName}` : settings.language === "hu" ? `Árajánlat #${selectedOffer.id}` : settings.language === "de" ? `Angebot #${selectedOffer.id}` : `Quote #${selectedOffer.id}`}
                    </h3>
                    {selectedOffer.status && (
                      <span
                        style={{
                          padding: "6px 16px",
                          fontSize: "12px",
                          fontWeight: "700",
                          borderRadius: "999px",
                          backgroundColor: getStatusColor(selectedOffer.status) + "18",
                          color: getStatusColor(selectedOffer.status),
                          border: `2px solid ${getStatusColor(selectedOffer.status)}`,
                          letterSpacing: "0.6px",
                          textTransform: "uppercase"
                        }}
                      >
                        {getStatusLabel(selectedOffer.status)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {!editingOffer && (
                      <Tooltip content={settings.language === "hu" ? "Árajánlat szerkesztése" : settings.language === "de" ? "Angebot bearbeiten" : "Edit offer"}>
                        <button
                          onClick={() => startEditOffer(selectedOffer)}
                          onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                          onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
                          style={{
                            ...themeStyles.button,
                            ...themeStyles.buttonSuccess,
                            padding: "8px 16px",
                            fontSize: "14px"
                          }}
                        >
                          ✏️ {settings.language === "hu" ? "Szerkesztés" : settings.language === "de" ? "Bearbeiten" : "Edit"}
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip content={settings.language === "hu" ? "Árajánlat duplikálása" : settings.language === "de" ? "Angebot duplizieren" : "Duplicate offer"}>
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
                    </Tooltip>
                    <Tooltip content={settings.language === "hu" ? "PDF export vagy nyomtatás" : settings.language === "de" ? "PDF-Export oder Drucken" : "PDF export or print"}>
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
                    </Tooltip>
                    <Tooltip content={settings.language === "hu" ? "PDF letöltése HTML fájlként" : settings.language === "de" ? "PDF als HTML-Datei herunterladen" : "Download PDF as HTML file"}>
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
                    </Tooltip>
                    <Tooltip content={t("offers.previewPDF")}
                      >
                      <button
                        onClick={() => openPDFPreview(selectedOffer)}
                        onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                        onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSecondary.boxShadow; }}
                        style={{
                          ...themeStyles.button,
                          ...themeStyles.buttonSecondary,
                          padding: "8px 16px"
                        }}
                      >
                        {t("offers.previewPDF")}
                      </button>
                    </Tooltip>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", minWidth: "160px" }}>
                    {selectedOfferCreatedAt && (
                      <span style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                        {selectedOfferCreatedAt.toLocaleString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    {selectedOfferStatusDate && (
                      <span style={{ fontSize: "11px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                        {settings.language === "hu" ? "Státusz frissítve:" : settings.language === "de" ? "Status aktualisiert:" : "Status updated:"}{" "}
                        {selectedOfferStatusDate.toLocaleString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "14px",
                  marginBottom: "18px"
                }}>
                  <div style={{
                    backgroundColor: theme.colors.surfaceHover,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: "12px",
                    padding: "14px"
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.textSecondary }}>
                      {settings.language === "hu" ? "Összköltség" : settings.language === "de" ? "Gesamtkosten" : "Total cost"}
                    </span>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.primary, marginTop: "4px" }}>
                      {convertCurrencyFromTo(selectedOffer.costs.totalCost, selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: theme.colors.surfaceHover,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: "12px",
                    padding: "14px"
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.textSecondary }}>
                      {settings.language === "hu" ? "Nyomtatási idő" : settings.language === "de" ? "Druckzeit" : "Print time"}
                    </span>
                    <div style={{ fontSize: "16px", fontWeight: "600", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                      {selectedOffer.totalPrintTimeHours.toFixed(2)} {t("calculator.hoursUnit")}
                    </div>
                    <span style={{ fontSize: "11px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                      {selectedOffer.printerName} · {selectedOffer.printerPower}W
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: theme.colors.surfaceHover,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: "12px",
                    padding: "14px"
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.textSecondary }}>
                      {settings.language === "hu" ? "Ügyfél" : settings.language === "de" ? "Kunde" : "Customer"}
                    </span>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                      {selectedOffer.customerName || (settings.language === "hu" ? "Nincs megadva" : settings.language === "de" ? "Nicht angegeben" : "Not specified")}
                    </div>
                    <span style={{ fontSize: "11px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                      {selectedOffer.customerContact || (settings.language === "hu" ? "Elérhetőség nélkül" : settings.language === "de" ? "Keine Kontaktdaten" : "No contact info")}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                  {(["draft", "sent", "accepted", "rejected", "completed"] as OfferStatus[]).map(status => {
                    if (selectedOffer.status === status) return null;
                    const color = getStatusColor(status);
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusChangeOffer(selectedOffer);
                          setStatusChangeTarget(status);
                          setStatusChangeNote("");
                        }}
                        style={{
                          padding: "8px 14px",
                          fontSize: "12px",
                          fontWeight: "600",
                          backgroundColor: color + "18",
                          color,
                          border: `1px solid ${color}`,
                          borderRadius: "999px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = color;
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = color + "18";
                          e.currentTarget.style.color = color;
                        }}
                      >
                        → {getStatusLabel(status)}
                      </button>
                    );
                  })}
                </div>

                {editingOffer && editingOffer.id === selectedOffer.id ? (
                  <div style={{ ...themeStyles.card, marginBottom: "20px", backgroundColor: theme.colors.primary + "20", border: `2px solid ${theme.colors.primary}` }}>
                    <h4 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: "600", color: theme.colors.text }}>
                      ✏️ {settings.language === "hu" ? "Árajánlat szerkesztése" : settings.language === "de" ? "Angebot bearbeiten" : "Edit offer"}
                    </h4>
                    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ width: "200px", flexShrink: 0 }}>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "8px", 
                          fontWeight: "600", 
                          fontSize: "14px", 
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                          whiteSpace: "nowrap" 
                        }}>
                          {t("offers.customerName")} *
                        </label>
                        <input
                          type="text"
                          placeholder={t("offers.customerName")}
                          value={editCustomerName}
                          onChange={e => setEditCustomerName(e.target.value)}
                          onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                          onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                          style={{ ...themeStyles.input, width: "100%", maxWidth: "200px", boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ width: "200px", flexShrink: 0 }}>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "8px", 
                          fontWeight: "600", 
                          fontSize: "14px", 
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                          whiteSpace: "nowrap" 
                        }}>
                          {settings.language === "hu" ? "Elérhetőség" : settings.language === "de" ? "Kontakt" : "Contact"}
                        </label>
                        <input
                          type="text"
                          placeholder={settings.language === "hu" ? "Email vagy telefon" : settings.language === "de" ? "E-Mail oder Telefon" : "Email or phone"}
                          value={editCustomerContact}
                          onChange={e => setEditCustomerContact(e.target.value)}
                          onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                          onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                          style={{ ...themeStyles.input, width: "100%", maxWidth: "200px", boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ width: "150px", flexShrink: 0 }}>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "8px", 
                          fontWeight: "600", 
                          fontSize: "14px", 
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                          whiteSpace: "nowrap" 
                        }}>
                          📈 {t("offers.profitPercentage")}
                        </label>
                        <select
                          value={editProfitPercentage}
                          onChange={e => setEditProfitPercentage(Number(e.target.value))}
                          onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
                          onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                          style={{ ...themeStyles.select, width: "100%", maxWidth: "150px", boxSizing: "border-box" }}
                        >
                          <option value={10}>10%</option>
                          <option value={20}>20%</option>
                          <option value={30}>30%</option>
                          <option value={40}>40%</option>
                          <option value={50}>50%</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginTop: "20px", width: "100%", maxWidth: "600px" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        fontSize: "14px", 
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                      }}>
                        {t("offers.description")}
                      </label>
                      <textarea
                        placeholder={t("offers.description")}
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                        onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                        style={{ ...themeStyles.input, width: "100%", maxWidth: "600px", minHeight: "100px", maxHeight: "200px", resize: "vertical", boxSizing: "border-box" }}
                      />
                    </div>
                    
                    {/* Filamentek szerkesztése */}
                    <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${theme.colors.border}` }}>
                      <h5 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", fontWeight: "600", color: theme.colors.text }}>
                        🧵 {t("offers.filaments")}
                      </h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {editFilaments.map((f, idx) => {
                          return (
                            <div key={idx} style={{ padding: "16px", backgroundColor: theme.colors.surfaceHover, borderRadius: "8px", border: `1px solid ${theme.colors.border}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <strong style={{ fontSize: "14px", color: theme.colors.text }}>
                                  {f.brand} {f.type} {f.color ? `(${f.color})` : ""}
                                </strong>
                                {editFilaments.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const newFilaments = editFilaments.filter((_, i) => i !== idx);
                                      setEditFilaments(newFilaments);
                                    }}
                                    style={{
                                      ...themeStyles.button,
                                      ...themeStyles.buttonDanger,
                                      padding: "4px 8px",
                                      fontSize: "12px"
                                    }}
                                  >
                                    {settings.language === "hu" ? "Törlés" : settings.language === "de" ? "Löschen" : "Delete"}
                                  </button>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
                                <div style={{ width: "150px", flexShrink: 0 }}>
                                  <label style={{ 
                                    display: "block", 
                                    marginBottom: "8px", 
                                    fontWeight: "600", 
                                    fontSize: "12px", 
                                    color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                                  }}>
                                    {t("calculator.usedGrams")}
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={f.usedGrams || ""}
                                    onChange={e => {
                                      const val = Number(e.target.value);
                                      const validation = validateUsedGrams(val, settings.language);
                                      if (validation.isValid) {
                                        const newFilaments = [...editFilaments];
                                        newFilaments[idx] = { ...f, usedGrams: val };
                                        setEditFilaments(newFilaments);
                                      } else if (validation.errorMessage) {
                                        showToast(validation.errorMessage, "error");
                                      }
                                    }}
                                    onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                                    onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                    style={{ ...themeStyles.input, width: "100%", maxWidth: "150px", boxSizing: "border-box" }}
                                  />
                                </div>
                                {f.needsDrying && (
                                  <>
                                    <div style={{ width: "120px", flexShrink: 0 }}>
                                      <label style={{ 
                                    display: "block", 
                                    marginBottom: "8px", 
                                    fontWeight: "600", 
                                    fontSize: "12px", 
                                    color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                                  }}>
                                        {t("calculator.dryingTime")}
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={f.dryingTime || ""}
                                        onChange={e => {
                                          const val = Number(e.target.value);
                                          const validation = validateDryingTime(val, settings.language);
                                          if (validation.isValid) {
                                            const newFilaments = [...editFilaments];
                                            newFilaments[idx] = { ...f, dryingTime: val };
                                            setEditFilaments(newFilaments);
                                          } else if (validation.errorMessage) {
                                            showToast(validation.errorMessage, "error");
                                          }
                                        }}
                                        onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                                        onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                        style={{ ...themeStyles.input, width: "100%", maxWidth: "120px", boxSizing: "border-box" }}
                                      />
                                    </div>
                                    <div style={{ width: "120px", flexShrink: 0 }}>
                                      <label style={{ 
                                    display: "block", 
                                    marginBottom: "8px", 
                                    fontWeight: "600", 
                                    fontSize: "12px", 
                                    color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                                  }}>
                                        {t("calculator.dryingPower")}
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={f.dryingPower || ""}
                                        onChange={e => {
                                          const val = Number(e.target.value);
                                          const validation = validateDryingPower(val, settings.language);
                                          if (validation.isValid) {
                                            const newFilaments = [...editFilaments];
                                            newFilaments[idx] = { ...f, dryingPower: val };
                                            setEditFilaments(newFilaments);
                                          } else if (validation.errorMessage) {
                                            showToast(validation.errorMessage, "error");
                                          }
                                        }}
                                        onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                                        onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                        style={{ ...themeStyles.input, width: "100%", maxWidth: "120px", boxSizing: "border-box" }}
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${theme.colors.border}` }}>
                      <Tooltip content={settings.language === "hu" ? "Mentés" : settings.language === "de" ? "Speichern" : "Save"}>
                        <button
                          onClick={saveEditOffer}
                          onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                          onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
                          style={{
                            ...themeStyles.button,
                            ...themeStyles.buttonSuccess,
                            fontSize: "16px",
                            padding: "14px 28px"
                          }}
                        >
                          💾 {settings.language === "hu" ? "Mentés" : settings.language === "de" ? "Speichern" : "Save"}
                        </button>
                      </Tooltip>
                      <Tooltip content={settings.language === "hu" ? "Mégse" : settings.language === "de" ? "Abbrechen" : "Cancel"}>
                        <button
                          onClick={cancelEditOffer}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                          style={{
                            ...themeStyles.button,
                            ...themeStyles.buttonSecondary,
                            padding: "8px 16px",
                            fontSize: "12px"
                          }}
                        >
                          {settings.language === "hu" ? "Mégse" : settings.language === "de" ? "Abbrechen" : "Cancel"}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <>
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
                        {selectedOffer.currentVersion && selectedOffer.currentVersion > 1 && (
                          <span style={{ marginLeft: "12px", fontSize: "12px", color: theme.colors.textSecondary }}>
                            ({settings.language === "hu" ? "Verzió" : settings.language === "de" ? "Version" : "Version"} {selectedOffer.currentVersion})
                          </span>
                        )}
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "8px", 
                          fontWeight: "600", 
                          fontSize: "14px", 
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                        }}>
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

                {/* Előzmények/Verziózás */}
                {selectedOffer.history && selectedOffer.history.length > 0 && (
                  <div style={{ ...themeStyles.card, padding: "20px", marginBottom: "20px" }}>
                    <strong style={{ display: "block", marginBottom: "16px", fontSize: "16px", color: theme.colors.text }}>
                      📜 {settings.language === "hu" ? "Előzmények" : settings.language === "de" ? "Verlauf" : "History"} ({selectedOffer.history.length})
                    </strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto" }}>
                      {selectedOffer.history.map((historyEntry, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "12px",
                            backgroundColor: theme.colors.surfaceHover,
                            borderRadius: "8px",
                            border: `1px solid ${theme.colors.border}`
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                            <div>
                              <strong style={{ fontSize: "14px", color: theme.colors.text }}>
                                {settings.language === "hu" ? "Verzió" : settings.language === "de" ? "Version" : "Version"} {historyEntry.version}
                              </strong>
                              <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.colors.textSecondary }}>
                                {new Date(historyEntry.date).toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US")} {new Date(historyEntry.date).toLocaleTimeString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          <div style={{ fontSize: "12px", color: theme.colors.textSecondary, marginTop: "8px" }}>
                            {historyEntry.customerName && (
                              <div style={{ marginBottom: "4px" }}>
                                <strong>{settings.language === "hu" ? "Ügyfél" : settings.language === "de" ? "Kunde" : "Customer"}:</strong> {historyEntry.customerName}
                              </div>
                            )}
                            {historyEntry.profitPercentage !== undefined && (
                              <div style={{ marginBottom: "4px" }}>
                                <strong>{settings.language === "hu" ? "Profit" : settings.language === "de" ? "Gewinn" : "Profit"}:</strong> {historyEntry.profitPercentage}%
                              </div>
                            )}
                            <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${theme.colors.border}` }}>
                              <strong>{settings.language === "hu" ? "Összköltség" : settings.language === "de" ? "Gesamtkosten" : "Total Cost"}:</strong>{" "}
                              {convertCurrencyFromTo(historyEntry.costs.totalCost, selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOffer.statusHistory && selectedOffer.statusHistory.length > 0 && (
                  <div style={{
                    marginTop: "20px",
                    padding: "12px",
                    backgroundColor: theme.colors.surfaceHover,
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    <h4 style={{
                      margin: "0 0 12px 0",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
                    }}>
                      📜 {settings.language === "hu" ? "Státusz előzmények" : settings.language === "de" ? "Status-Verlauf" : "Status history"}
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {selectedOffer.statusHistory.map((history, idx) => (
                        <div
                          key={`${history.status}-${history.date}-${idx}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px",
                            backgroundColor: theme.colors.surface,
                            borderRadius: "6px"
                          }}
                        >
                          <span
                            style={{
                              padding: "4px 8px",
                              fontSize: "10px",
                              fontWeight: "700",
                              borderRadius: "8px",
                              backgroundColor: getStatusColor(history.status) + "20",
                              color: getStatusColor(history.status),
                              border: `1px solid ${getStatusColor(history.status)}`,
                              textTransform: "uppercase"
                            }}
                          >
                            {getStatusLabel(history.status)}
                          </span>
                          <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                            {new Date(history.date).toLocaleString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US")}
                          </span>
                          {history.note && (
                            <span style={{ fontSize: "11px", color: theme.colors.textMuted, fontStyle: "italic" }}>
                              — {history.note}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {statusChangeOffer && statusChangeTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-change-title"
          onClick={() => {
            setStatusChangeOffer(null);
            setStatusChangeTarget(null);
            setStatusChangeNote("");
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
        >
          <div
            style={{
              ...themeStyles.card,
              maxWidth: "520px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 18px 40px rgba(15,23,42,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="status-change-title" style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px", fontWeight: 600, color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
              {settings.language === "hu" ? "Státusz módosítása" : settings.language === "de" ? "Status ändern" : "Change status"}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: theme.colors.textMuted, lineHeight: 1.6 }}>
              {statusChangeOffer?.customerName || (settings.language === "hu" ? "Árajánlat" : settings.language === "de" ? "Angebot" : "Quote")} #{statusChangeOffer?.id} →{" "}
              <strong style={{ color: getStatusColor(statusChangeTarget) }}>{getStatusLabel(statusChangeTarget)}</strong>
            </p>
            <label htmlFor="status-change-note" style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
              📝 {settings.language === "hu" ? "Megjegyzés (opcionális)" : settings.language === "de" ? "Notiz (optional)" : "Note (optional)"}
            </label>
            <textarea
              id="status-change-note"
              value={statusChangeNote}
              autoFocus
              maxLength={280}
              onChange={e => setStatusChangeNote(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  statusChangeOffer && changeOfferStatus(statusChangeOffer, statusChangeTarget, statusChangeNote);
                }
              }}
              style={{
                ...themeStyles.input,
                width: "100%",
                minHeight: "72px",
                maxHeight: "140px",
                resize: "vertical",
                marginBottom: "8px",
                color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
              }}
              placeholder={
                settings.language === "hu"
                  ? "Rövid megjegyzés (max. 280 karakter)…"
                  : settings.language === "de"
                  ? "Kurze Notiz (max. 280 Zeichen)…"
                  : "Short note (max. 280 chars)…"
              }
            />
            <div style={{ textAlign: "right", fontSize: "11px", marginBottom: "12px", color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted }}>
              {statusChangeNote.length}/280
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => {
                  setStatusChangeOffer(null);
                  setStatusChangeTarget(null);
                  setStatusChangeNote("");
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSecondary,
                  padding: "8px 16px",
                }}
              >
                {settings.language === "hu" ? "Mégse" : settings.language === "de" ? "Abbrechen" : "Cancel"}
              </button>
              <button
                onClick={() => statusChangeOffer && changeOfferStatus(statusChangeOffer, statusChangeTarget, statusChangeNote)}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonPrimary,
                  padding: "8px 16px",
                }}
              >
                {settings.language === "hu" ? "Státusz mentése" : settings.language === "de" ? "Status speichern" : "Save status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kontextus menü */}
      {contextMenu && (
        <div
          onClick={closeContextMenu}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1500,
            backgroundColor: "transparent"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              boxShadow: `0 4px 12px ${theme.colors.shadow}`,
              padding: "8px 0",
              minWidth: "180px",
              zIndex: 1501
            }}
          >
            <button
              onClick={() => handleContextMenuAction("edit")}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                backgroundColor: "transparent",
                border: "none",
                color: theme.colors.text,
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ✏️ {settings.language === "hu" ? "Szerkesztés" : settings.language === "de" ? "Bearbeiten" : "Edit"}
            </button>
            <button
              onClick={() => handleContextMenuAction("duplicate")}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                backgroundColor: "transparent",
                border: "none",
                color: theme.colors.text,
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              📋 {settings.language === "hu" ? "Duplikálás" : settings.language === "de" ? "Duplizieren" : "Duplicate"}
            </button>
            <button
              onClick={() => handleContextMenuAction("export")}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                backgroundColor: "transparent",
                border: "none",
                color: theme.colors.text,
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              📄 {settings.language === "hu" ? "PDF export" : settings.language === "de" ? "PDF exportieren" : "PDF export"}
            </button>
            <div style={{ height: "1px", backgroundColor: theme.colors.border, margin: "4px 0" }} />
            <button
              onClick={() => handleContextMenuAction("delete")}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                backgroundColor: "transparent",
                border: "none",
                color: theme.colors.danger,
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              🗑️ {settings.language === "hu" ? "Törlés" : settings.language === "de" ? "Löschen" : "Delete"}
            </button>
          </div>
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
        theme={theme}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
        confirmText={t("common.yes")}
        cancelText={t("common.cancel")}
        type="danger"
      />
    </div>
  );
};

