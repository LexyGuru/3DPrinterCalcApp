import React, { useMemo, useState, useEffect, useRef } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type {
  Offer,
  Settings,
  Printer,
  OfferStatus,
  OfferStatusHistory,
  Filament,
  Customer,
} from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation, translations as translationRegistry, type TranslationKey } from "../utils/translations";
import { ConfirmDialog } from "../shared";
import { useToast } from "./Toast";
import { convertCurrencyFromTo, getCurrencyLabel } from "../utils/currency";
import { Tooltip } from "./Tooltip";
import { EmptyState } from "./EmptyState";
import { calculateOfferCosts } from "../utils/offerCalc";
import { logWithLanguage } from "../utils/languages/global_console";
import { validateUsedGrams, validateDryingTime, validateDryingPower } from "../utils/validation";
import { getFilamentPlaceholder } from "../utils/filamentPlaceholder";
import { DEFAULT_COLOR_HEX, normalizeHex, resolveColorHexFromName } from "../utils/filamentColors";
import { notifyExportComplete, notifyOfferStatusChange } from "../utils/platformFeatures";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
import { auditCreate, auditUpdate, auditDelete } from "../utils/auditLog";
import { saveCustomers, hasEncryptedCustomerData } from "../utils/store";
import { getEncryptionPassword } from "../utils/encryptionPasswordManager";
// Offers feature modul importok
import { OfferFilters, OfferStatusFilters, OfferSortControls, useOfferFilter } from "../features/offers";

const STATUS_ORDER: OfferStatus[] = ["draft", "sent", "accepted", "rejected", "completed"];

interface Props {
  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
  printers: Printer[];
  filaments: Filament[];
  setFilaments: (filaments: Filament[]) => void;
  customers: Customer[];
  setCustomers?: (customers: Customer[]) => void; // Callback az ügyfelek frissítéséhez
  onSettingsChange?: (newSettings: Settings) => void;
}

export const Offers: React.FC<Props> = ({
  offers,
  setOffers,
  settings,
  theme,
  themeStyles,
  printers,
  filaments,
  setFilaments,
  customers,
  setCustomers,
  onSettingsChange,
}) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  
  // Helper függvény, hogy a titkosított adatok szövegét mindig a jelenlegi nyelven jelenítse meg
  const getDisplayCustomerName = (customerName: string | undefined, customerId: number | null | undefined): string => {
    if (!customerName) {
      if (customerId) {
        return `${t("offers.details.customerId") || "Ügyfél ID"}: ${customerId}`;
      }
      return "";
    }
    
    // Ellenőrizzük, hogy a customerName egy ismert titkosított adatok szöveg-e
    // Összegyűjtjük az összes nyelv "encryption.encryptedData" fordítását
    const allEncryptedDataTexts = Object.values(translationRegistry).map(
      (lang) => lang["encryption.encryptedData"]
    ).filter(Boolean);
    
    // Ha a customerName megegyezik bármelyik nyelv "encryption.encryptedData" fordításával,
    // akkor a jelenlegi nyelvű fordítást használjuk
    if (allEncryptedDataTexts.includes(customerName)) {
      return t("encryption.encryptedData");
    }
    
    return customerName;
  };
  
  // Helper függvény, hogy az offer description-t mindig a jelenlegi nyelven jelenítse meg
  const getDisplayDescription = (description: string | undefined): string | undefined => {
    if (!description) return description;
    
    // Összegyűjtjük az összes nyelv "slicerImport.importedFilePrefix" fordítását
    const allImportedFilePrefixes = Object.values(translationRegistry).map(
      (lang) => lang["slicerImport.importedFilePrefix"]
    ).filter(Boolean);
    
    // Keresünk minden prefix-et, hogy van-e egyezés
    const matchingPrefix = allImportedFilePrefixes.find(prefix => 
      description.startsWith(`${prefix}:`) || description.startsWith(`${prefix} `)
    );
    
    if (matchingPrefix) {
      const newPrefix = t("slicerImport.importedFilePrefix");
      // Eltávolítjuk a régi prefix-et (akár ":" akár " " után jön)
      const fileName = description
        .replace(new RegExp(`^${matchingPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[:\\s]+`), "")
        .trim();
      return `${newPrefix}: ${fileName}`;
    }
    
    return description;
  };
  
  // Undo/Redo hook
  const {
    state: offersWithHistory,
    setState: setOffersWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo<Offer[]>(offers, 50);

  // Sync offers with history when external changes occur
  // Csak akkor frissítjük, ha valóban változás történt (nem csak referencia változás)
  const prevOffersRef = useRef<string>(JSON.stringify(offers));
  useEffect(() => {
    const currentOffers = JSON.stringify(offers);
    const currentHistory = JSON.stringify(offersWithHistory);
    
    // Ha az offers változott külsőleg (nem a history miatt), akkor reset history
    if (prevOffersRef.current !== currentOffers && currentOffers !== currentHistory) {
      resetHistory(offers);
      prevOffersRef.current = currentOffers;
    }
  }, [offers, offersWithHistory, resetHistory]);

  // Update parent when history changes
  // Csak akkor frissítjük, ha valóban változás történt (nem csak referencia változás)
  const prevHistoryRef = useRef<string>(JSON.stringify(offersWithHistory));
  const isUpdatingRef = useRef(false);
  
  useEffect(() => {
    const currentHistory = JSON.stringify(offersWithHistory);
    const currentOffers = JSON.stringify(offers);
    
    // Ha a history változott ÉS nem vagyunk éppen update közben ÉS különbözik az offers-től
    if (prevHistoryRef.current !== currentHistory && !isUpdatingRef.current && currentHistory !== currentOffers) {
      isUpdatingRef.current = true;
      prevHistoryRef.current = currentHistory;
      
      // setTimeout használata, hogy ne blokkolja a renderelést
      setTimeout(() => {
        setOffers(offersWithHistory);
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [offersWithHistory, offers, setOffers]);

  // Undo/Redo keyboard shortcuts
  useKeyboardShortcut("z", () => {
    if (canUndo) {
      undo();
      showToast(t("common.undo") || "Visszavonás", "info");
    }
  }, { ctrl: true });

  useKeyboardShortcut("z", () => {
    if (canUndo) {
      undo();
      showToast(t("common.undo") || "Visszavonás", "info");
    }
  }, { meta: true });

  useKeyboardShortcut("z", () => {
    if (canRedo) {
      redo();
      showToast(t("common.redo") || "Újra", "info");
    }
  }, { ctrl: true, shift: true });

  useKeyboardShortcut("z", () => {
    if (canRedo) {
      redo();
      showToast(t("common.redo") || "Újra", "info");
    }
  }, { meta: true, shift: true });

  // Egyszerű virtuális scroll az árajánlat listához
  const offersListContainerRef = useRef<HTMLDivElement | null>(null);
  const VIRTUAL_SCROLL_THRESHOLD = 80;
  const VIRTUAL_ROW_HEIGHT = 190; // px, átlagos kártya magasság + gap
  const VIRTUAL_OVERSCAN = 5;
  const [visibleOfferRange, setVisibleOfferRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: VIRTUAL_SCROLL_THRESHOLD,
  });

  // Virtuális scroll a státuszváltásokhoz
  const statusChangesContainerRef = useRef<HTMLDivElement | null>(null);
  const STATUS_CHANGES_VIRTUAL_THRESHOLD = 10;
  const STATUS_CHANGES_ROW_HEIGHT = 90; // px, átlagos bejegyzés magasság + gap
  const STATUS_CHANGES_OVERSCAN = 3;
  const [visibleStatusChangesRange, setVisibleStatusChangesRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: STATUS_CHANGES_VIRTUAL_THRESHOLD,
  });

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printContent, setPrintContent] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerContact, setEditCustomerContact] = useState("");
  const [selectedEditCustomerId, setSelectedEditCustomerId] = useState<number | "">("");

  // Ügyfél kiválasztás kezelése szerkesztésnél
  useEffect(() => {
    if (selectedEditCustomerId !== "" && selectedEditCustomerId !== null) {
      const customer = customers.find(c => c.id === selectedEditCustomerId);
      if (customer) {
        // 🔒 TITKOSÍTOTT ADATOK KEZELÉSE: Ha az ügyfél adatai titkosítva vannak, ne töltse be a nevét és elérhetőségét
        const isCustomerDataEncrypted = settings.encryptionEnabled && settings.encryptedCustomerData;
        if (isCustomerDataEncrypted) {
          // Ha titkosítva vannak az adatok, az ügyfél ID-ját írjuk be az ügyfélnév mezőbe
          // Így a felhasználó látja, hogy melyik ügyfél van kiválasztva, és a validáció is átmegy
          setEditCustomerName(`${t("offers.details.customerId")}: ${selectedEditCustomerId}`);
          setEditCustomerContact("");
        } else {
          // Ha nincsenek titkosítva, akkor betöltjük az adatokat
          setEditCustomerName(customer.name);
          setEditCustomerContact(customer.contact || "");
        }
      }
    }
  }, [selectedEditCustomerId, customers, settings.encryptionEnabled, settings.encryptedCustomerData]);
  const [editDescription, setEditDescription] = useState("");
  const [editProfitPercentage, setEditProfitPercentage] = useState<number>(30);
  const [editPrintDueDate, setEditPrintDueDate] = useState<string>("");
  const [editFilaments, setEditFilaments] = useState<Offer["filaments"]>([]);
  const [editPrinterId, setEditPrinterId] = useState<number | null>(null);
  const [selectedLibraryFilamentIndex, setSelectedLibraryFilamentIndex] = useState<number | "">("");
  const [draggedOfferId, setDraggedOfferId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ offerId: number; x: number; y: number } | null>(null);
  const [statusChangeOffer, setStatusChangeOffer] = useState<Offer | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<OfferStatus | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState("");
  const [deductOnComplete, setDeductOnComplete] = useState(false);
  // Offers feature modul hook-ok
  const {
    searchTerm,
    statusFilter,
    minAmountFilter,
    maxAmountFilter,
    fromDateFilter,
    toDateFilter,
    sortConfig: offerSortConfig,
    setSearchTerm,
    setStatusFilter,
    setMinAmountFilter,
    setMaxAmountFilter,
    setFromDateFilter,
    setToDateFilter,
    setSortConfig: setOfferSortConfig,
    filteredOffers,
    sortedOffers,
  } = useOfferFilter({
    offers: offersWithHistory,
    settings,
    initialSortConfig: settings.offerSortConfig || [],
  });
  const [selectedOfferIds, setSelectedOfferIds] = useState<Set<number>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const locale = settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : settings.language === "uk" ? "uk-UA" : settings.language === "ru" ? "ru-RU" : "en-US";
  const filamentOptions = useMemo(
    () =>
      filaments.map((filament, index) => ({
        index,
        label: `${filament.brand} ${filament.type}${filament.color ? ` (${filament.color})` : ""}`,
        data: filament,
      })),
    [filaments]
  );

  const getFilamentColorHex = (filament: Offer["filaments"][number]) =>
    normalizeHex(filament.colorHex || resolveColorHexFromName(filament.color) || DEFAULT_COLOR_HEX) || DEFAULT_COLOR_HEX;

  const getFilamentImageSrc = (filament: Offer["filaments"][number]) =>
    filament.imageBase64 || getFilamentPlaceholder(getFilamentColorHex(filament));

  const convertLibraryFilamentToOffer = (
    libraryFilament: Filament,
    existing?: Offer["filaments"][number]
  ): Offer["filaments"][number] => ({
    brand: libraryFilament.brand,
    type: libraryFilament.type,
    color: libraryFilament.color,
    colorHex: libraryFilament.colorHex,
    usedGrams: existing?.usedGrams ?? 0,
    pricePerKg: libraryFilament.pricePerKg,
    needsDrying: existing?.needsDrying,
    dryingTime: existing?.dryingTime,
    dryingPower: existing?.dryingPower,
    imageBase64: libraryFilament.imageBase64,
    colorMode: libraryFilament.colorMode,
    multiColorHint: libraryFilament.multiColorHint,
  });

  const findLibraryOptionIndex = (offerFilament: Offer["filaments"][number]): number =>
    filamentOptions.findIndex(
      option =>
        option.data.brand === offerFilament.brand &&
        option.data.type === offerFilament.type &&
        (option.data.color || "") === (offerFilament.color || "")
    );

  const selectedPrinterForEdit = useMemo(
    () => (editPrinterId != null ? printers.find(printer => printer.id === editPrinterId) : undefined),
    [editPrinterId, printers]
  );

  const replaceFilamentFromLibrary = (offerIndex: number, optionIndex: number) => {
    const option = filamentOptions[optionIndex];
    if (!option) return;
    setEditFilaments(prev => {
      const updated = [...prev];
      const current = updated[offerIndex];
      updated[offerIndex] = convertLibraryFilamentToOffer(option.data, current);
      return updated;
    });
  };

  const addFilamentFromLibrary = () => {
    if (selectedLibraryFilamentIndex === "") return;
    const option = filamentOptions[selectedLibraryFilamentIndex];
    if (!option) return;
    setEditFilaments(prev => [...prev, convertLibraryFilamentToOffer(option.data)]);
    setSelectedLibraryFilamentIndex("");
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "10px 18px",
    fontSize: "13px",
    minWidth: "150px",
  };

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

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    const id = deleteConfirmId;
    const offerToDelete = offersWithHistory.find(o => o.id === id);
    logWithLanguage(settings.language, "log", "offers.delete.start", {
      offerId: id,
      customerName: offerToDelete?.customerName,
    });
    
    // Audit log
    try {
      await auditDelete("offer", id, offerToDelete?.customerName || "Unknown", {
        status: offerToDelete?.status,
        profitPercentage: offerToDelete?.profitPercentage,
        totalCost: offerToDelete?.costs?.totalCost,
      });
    } catch (error) {
      console.warn("Audit log hiba:", error);
    }
    
    setOffersWithHistory(offersWithHistory.filter(o => o.id !== id));
    if (selectedOffer?.id === id) {
      setSelectedOffer(null);
    }
    logWithLanguage(settings.language, "log", "offers.delete.success", { offerId: id });
    
    // Toast üzenet az ügyfél nevével
    const customerName = offerToDelete?.customerName || t("offers.customerName");
    const toastMessage = `${t("common.offerDeleted")} ${t("offers.customerName")}: ${customerName}`;
    showToast(toastMessage, "success");
    
    // Natív értesítés küldése minden platformon (ha engedélyezve van)
    if (settings.notificationEnabled !== false && offerToDelete) {
      try {
        const { sendNativeNotification } = await import("../utils/platformFeatures");
        const notificationTitle = t("common.offerDeleted");
        const notificationBody = `${t("offers.customerName")}: ${customerName}`;
        await sendNativeNotification(notificationTitle, notificationBody);
      } catch (error) {
        console.log("Értesítés küldése sikertelen:", error);
        // Fallback: ha a natív értesítés nem működik, legalább a toast üzenet megjelenik
      }
    }
    setDeleteConfirmId(null);
  };

  const duplicateOffer = async (offer: Offer) => {
    // 🔒 TITKOSÍTOTT ADATOK KEZELÉSE: Ha titkosítva vannak az adatok és nincs jelszó, ne engedjük a duplikálást
    if (settings.encryptionEnabled && settings.encryptedCustomerData) {
      const encryptionPassword = getEncryptionPassword(settings.useAppPasswordForEncryption ?? false);
      if (!encryptionPassword && offer.customerId) {
        showToast(t("encryption.passwordRequiredForOfferDuplicate"), "error");
        return;
      }
    }
    
    logWithLanguage(settings.language, "log", "offers.duplicate.start", {
      originalOfferId: offer.id,
      customerName: offer.customerName,
    });
    const duplicated: Offer = {
      ...offer,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    setOffers([...offers, duplicated]);
    setSelectedOffer(duplicated);
    
    // Audit log
    try {
      await auditCreate("offer", duplicated.id, duplicated.customerName, {
        originalOfferId: offer.id,
        customerName: duplicated.customerName,
        status: duplicated.status,
        profitPercentage: duplicated.profitPercentage,
      });
    } catch (error) {
      console.warn("Audit log hiba:", error);
    }
    
    logWithLanguage(settings.language, "log", "offers.duplicate.success", {
      newOfferId: duplicated.id,
    });
    showToast(t("common.offerDuplicated"), "success");
  };

  const statusLabelKeyMap: Record<OfferStatus, TranslationKey> = {
    draft: "offers.status.draft",
    sent: "offers.status.sent",
    accepted: "offers.status.accepted",
    rejected: "offers.status.rejected",
    completed: "offers.status.completed",
  };

  const getStatusLabel = (status: OfferStatus): string => t(statusLabelKeyMap[status]);

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

  const deductStockForOffer = async (offer: Offer) => {
    const updatedFilaments = [...filaments];

    offer.filaments.forEach(offerFilament => {
      const libraryIndex = findLibraryOptionIndex(offerFilament);
      if (libraryIndex < 0) {
        return;
      }
      const current = updatedFilaments[libraryIndex];
      if (!current) return;

      const currentStock = current.weight || 0;
      const used = offerFilament.usedGrams || 0;
      const nextStock = Math.max(0, currentStock - used);

      updatedFilaments[libraryIndex] = {
        ...current,
        weight: nextStock,
      };
    });

    try {
      // 💾 Készlet mentése tartósan is, ne csak memóriában változzon
      const { saveFilaments } = await import("../utils/store");
      await saveFilaments(updatedFilaments);
      setFilaments(updatedFilaments);
      showToast(t("filamentStock.success.updated") || "Készlet frissítve", "success");
    } catch (error) {
      console.error("❌ Hiba a filament készlet mentésekor (ajánlat):", error);
      setFilaments(updatedFilaments);
      showToast(t("common.error") || "Hiba a készlet mentésekor", "error");
    }
  };

  const changeOfferStatus = async (
    offer: Offer,
    newStatus: OfferStatus,
    note?: string,
    options?: { deductOnCompleted?: boolean }
  ) => {
    // 🔒 TITKOSÍTOTT ADATOK KEZELÉSE: Ha titkosítva vannak az adatok és nincs jelszó, ne engedjük a státusz változtatást
    if (settings.encryptionEnabled && settings.encryptedCustomerData) {
      const encryptionPassword = getEncryptionPassword(settings.useAppPasswordForEncryption ?? false);
      if (!encryptionPassword && offer.customerId) {
        showToast("Titkosítási jelszó szükséges az árajánlat státuszának módosításához", "error");
        return;
      }
    }
    
    const timestamp = new Date().toISOString();
    const historyEntry: OfferStatusHistory = {
      status: newStatus,
      date: timestamp,
      note: note?.trim() || undefined,
    };

    const updatedOffers = offersWithHistory.map(o => {
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

    setOffersWithHistory(updatedOffers);
    const updated = updatedOffers.find(o => o.id === offer.id) || null;
    setSelectedOffer(updated);
    setStatusChangeOffer(null);
    setStatusChangeTarget(null);
    setStatusChangeNote("");
    setDeductOnComplete(false);

    // ⚙️ Készlet levonása státusz alapján
    if (newStatus === "accepted" && offer.status !== "accepted") {
      // Teszt nyomtatás – automatikus levonás
      deductStockForOffer(offer);
    }

    if (newStatus === "completed" && options?.deductOnCompleted) {
      // Végleges nyomtatás – csak akkor vonjuk le, ha a felhasználó kéri
      deductStockForOffer(offer);
    }

    showToast(`${t("offers.toast.statusUpdated")} ${getStatusLabel(newStatus)}`, "success");
    // Natív értesítés küldése (ha engedélyezve van)
    if (settings.notificationEnabled !== false && updated) {
      try {
        await notifyOfferStatusChange(updated.customerName || t("offers.customerName"), getStatusLabel(newStatus));
      } catch (error) {
        console.log("Értesítés küldése sikertelen:", error);
      }
    }
  };

  const startEditOffer = (offer: Offer) => {
    // 🔒 TITKOSÍTOTT ADATOK KEZELÉSE: Ha titkosítva vannak az adatok és nincs jelszó, ne engedjük a szerkesztést
    if (settings.encryptionEnabled && settings.encryptedCustomerData) {
      const encryptionPassword = getEncryptionPassword(settings.useAppPasswordForEncryption ?? false);
      if (!encryptionPassword && offer.customerId) {
        // Ha van customerId, akkor valószínűleg titkosított adatokról van szó
        showToast(t("encryption.passwordRequiredForOfferEdit"), "error");
        return;
      }
    }
    
    logWithLanguage(settings.language, "log", "offers.edit.start", {
      offerId: offer.id,
      customerName: offer.customerName,
      printDueDate: offer.printDueDate || "none",
    });
    setEditingOffer(offer);
    setEditCustomerName(offer.customerName || "");
    setEditCustomerContact(offer.customerContact || "");
    setEditDescription(offer.description || "");
    setEditProfitPercentage(offer.profitPercentage || 30);
    const dateValue = offer.printDueDate ? offer.printDueDate.split('T')[0] : "";
    logWithLanguage(settings.language, "log", "offers.save.printDueDate", {
      action: "loading",
      offerId: offer.id,
      printDueDate: offer.printDueDate || "none",
      dateValue,
    });
    setEditPrintDueDate(dateValue);
    setEditFilaments([...offer.filaments]);
    const matchedPrinter =
      (offer.printerId && printers.find(p => p.id === offer.printerId)) ||
      printers.find(p => p.name === offer.printerName) ||
      printers[0];
    setEditPrinterId(matchedPrinter ? matchedPrinter.id : null);
    setSelectedLibraryFilamentIndex("");
    
    // Próbáljuk meg megtalálni a megfelelő ügyfelet a customers listából
    // Először customerId alapján keresünk (ez a legmegbízhatóbb)
    let matchedCustomer = null;
    if (offer.customerId) {
      matchedCustomer = customers.find(c => c.id === offer.customerId);
    }
    // Ha nem találtunk customerId alapján, akkor név alapján keresünk
    if (!matchedCustomer && offer.customerName) {
      matchedCustomer = customers.find(c => c.name === offer.customerName && c.contact === (offer.customerContact || ""));
    }
    setSelectedEditCustomerId(matchedCustomer ? matchedCustomer.id : "");
  };

  const cancelEditOffer = () => {
    setEditingOffer(null);
    setEditCustomerName("");
    setEditCustomerContact("");
    setEditDescription("");
    setEditProfitPercentage(30);
    setEditPrintDueDate("");
    setSelectedEditCustomerId("");
    setEditFilaments([]);
    setEditPrinterId(null);
    setSelectedLibraryFilamentIndex("");
  };

  const saveEditOffer = async () => {
    if (!editingOffer) return;
    
    if (!editCustomerName.trim()) {
      showToast(`${t("common.error")}: ${t("offers.toast.customerNameRequired")}`, "error");
      return;
    }

    logWithLanguage(settings.language, "log", "offers.save.start", {
      offerId: editingOffer.id,
      customerName: editCustomerName,
      profitPercentage: editProfitPercentage,
    });

    // Ellenőrizzük, hogy változott-e valami
    const filamentsChanged = JSON.stringify(editingOffer.filaments) !== JSON.stringify(editFilaments);
    const selectedPrinter = editPrinterId != null ? printers.find(p => p.id === editPrinterId) : undefined;
    if (!selectedPrinter) {
      showToast(t("offers.toast.printerRequired"), "error");
      logWithLanguage(settings.language, "warn", "offers.noPrinter", {
        offerId: editingOffer.id,
        editPrinterId,
      });
      return;
    }
    const printerChanged = (editingOffer.printerId ?? null) !== selectedPrinter.id;
    const dueDateChanged = editingOffer.printDueDate !== (editPrintDueDate ? new Date(editPrintDueDate).toISOString() : undefined);
    const hasChanges =
      editingOffer.customerName !== editCustomerName.trim() ||
      editingOffer.customerContact !== (editCustomerContact.trim() || undefined) ||
      editingOffer.description !== (editDescription.trim() || undefined) ||
      editingOffer.profitPercentage !== editProfitPercentage ||
      dueDateChanged ||
      filamentsChanged ||
      printerChanged;

    // Ha változott, mentjük az előzménybe
    let history = editingOffer.history || [];
    let currentVersion = editingOffer.currentVersion || 1;
    
    // Ha a filamentek vagy a nyomtató változott, újraszámoljuk a költségeket
    let newCosts = editingOffer.costs;
    if (filamentsChanged || printerChanged) {
      const calculatedCosts = calculateOfferCosts(
        {
          ...editingOffer,
          filaments: editFilaments,
          printerId: selectedPrinter.id,
          printerName: selectedPrinter.name,
          printerType: selectedPrinter.type,
          printerPower: selectedPrinter.power,
        },
        selectedPrinter,
        settings
      );
      if (calculatedCosts) {
        newCosts = calculatedCosts;
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

    const printDueDateISO = editPrintDueDate ? new Date(editPrintDueDate).toISOString() : undefined;
    
    logWithLanguage(settings.language, "log", "offers.save.printDueDate", {
      offerId: editingOffer.id,
      printDueDate: printDueDateISO || "none",
      editPrintDueDate,
    });

    // 🔹 AUTOMATIKUS ÜGYFÉL LÉTREHOZÁS: Ha az ügyfél még nem létezik, létrehozzuk
    let customerId: number | undefined = editingOffer.customerId;
    const trimmedCustomerName = editCustomerName.trim();
    const trimmedCustomerContact = editCustomerContact.trim() || undefined;
    
    // 🔒 TITKOSÍTOTT ADATOK KEZELÉSE: Ha az ügyfélnév "Ügyfél ID: X" formátumú, akkor a selectedEditCustomerId-t használjuk
    const customerIdLabel = t("offers.details.customerId");
    const isCustomerIdFormat = new RegExp(`^${customerIdLabel}:\\s*\\d+$`, "i").test(trimmedCustomerName);
    // Ellenőrizzük, hogy titkosítva vannak-e az adatok (settings alapján)
    const isEncryptedFromSettings = settings.encryptionEnabled && settings.encryptedCustomerData;
    
    // Ha titkosítva vannak az adatok és van kiválasztott ügyfél ID, akkor azt használjuk
    if ((isCustomerIdFormat || isEncryptedFromSettings) && selectedEditCustomerId !== "" && selectedEditCustomerId !== null) {
      customerId = typeof selectedEditCustomerId === "number" ? selectedEditCustomerId : Number(selectedEditCustomerId);
      if (import.meta.env.DEV) {
        console.log("🔒 [saveEditOffer] Titkosított adatok esetén kiválasztott ügyfél ID használata:", customerId);
      }
    } else {
      // Ellenőrizzük, hogy létezik-e az ügyfél (név és contact alapján)
      let existingCustomer = customers.find(
        c => c.name === trimmedCustomerName && 
        (c.contact || "") === (trimmedCustomerContact || "")
      );
      
      // Ha nincs meglévő ügyfél, létrehozzuk
      if (!existingCustomer) {
      try {
        // Új ügyfél ID generálása
        const newCustomerId = customers.length > 0 
          ? Math.max(...customers.map(c => c.id)) + 1 
          : Date.now();
        
        const newCustomer: Customer = {
          id: newCustomerId,
          name: trimmedCustomerName,
          contact: trimmedCustomerContact,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Hozzáadjuk az új ügyfelet a listához
        const updatedCustomers = [...customers, newCustomer];
        
        // Mentjük az ügyfeleket (titkosítási jelszóval, ha van)
        const encryptionPassword = getEncryptionPassword(settings.useAppPasswordForEncryption ?? false);
        await saveCustomers(updatedCustomers, encryptionPassword || null);
        
        // Frissítjük a customers state-et (ha van callback)
        if (setCustomers) {
          setCustomers(updatedCustomers);
        }
        
        customerId = newCustomerId;
        existingCustomer = newCustomer;
        
        if (import.meta.env.DEV) {
          console.log("✅ Új ügyfél automatikusan létrehozva:", { id: newCustomerId, name: trimmedCustomerName });
        }
        showToast(t("offers.toast.customerCreated") || `Ügyfél létrehozva: ${trimmedCustomerName}`, "success");
      } catch (error) {
        console.error("❌ Hiba az ügyfél létrehozásakor:", error);
        // Folytatjuk az árajánlat mentésével, még ha az ügyfél létrehozása sikertelen volt is
      }
    } else {
      // Ha létezik az ügyfél, használjuk az ID-ját
      customerId = existingCustomer.id;
    }
    }

    // 🔒 TITKOSÍTOTT ADATOK KEZELÉSE: Ha az ügyfél adatai titkosítva vannak, ne mentsük a customerName és customerContact mezőket
    // Ellenőrizzük, hogy van-e titkosított customer data (két módon: settings-ből ÉS közvetlenül a store-ból)
    const isCustomerDataEncryptedFromSettings = settings.encryptionEnabled && settings.encryptedCustomerData;
    // KRITIKUS: Ellenőrizzük közvetlenül a store-ból is, hogy biztosan megkapjuk a helyes értéket
    const hasEncryptedData = await hasEncryptedCustomerData();
    const isCustomerDataEncrypted = isCustomerDataEncryptedFromSettings || hasEncryptedData;
    
    if (import.meta.env.DEV && isCustomerDataEncrypted) {
      console.log("🔒 [saveEditOffer] Titkosítás aktív, customerName és customerContact törlése", {
        offerId: editingOffer.id,
        isCustomerDataEncryptedFromSettings,
        hasEncryptedData,
        customerId,
        trimmedCustomerName,
        trimmedCustomerContact
      });
    }
    
    // Ha titkosítva vannak az ügyfél adatok, akkor csak a customerId-t mentjük, ne a customerName-t és customerContact-ot
    const updatedOffer: Offer = {
      ...editingOffer,
      customerId: customerId, // Ügyfél ID hozzáadása (nem titkosítva, így megjeleníthető)
      // Ha titkosítva vannak az ügyfél adatok, ne mentsük a customerName és customerContact mezőket
      customerName: isCustomerDataEncrypted ? undefined : trimmedCustomerName,
      customerContact: isCustomerDataEncrypted ? undefined : trimmedCustomerContact,
      description: editDescription.trim() || undefined,
      profitPercentage: editProfitPercentage,
      printDueDate: printDueDateISO,
      filaments: editFilaments,
      costs: newCosts,
      history: history,
      currentVersion: currentVersion,
      printerId: selectedPrinter.id,
      printerName: selectedPrinter.name,
      printerType: selectedPrinter.type,
      printerPower: selectedPrinter.power,
      date: hasChanges ? new Date().toISOString() : editingOffer.date, // Frissítjük a dátumot, ha változott
    };

    const updatedOffersRaw = offersWithHistory.map(o => o.id === editingOffer.id ? updatedOffer : o);
    
    // 🔒 DUPLIKÁLT ID ELTÁVOLÍTÁS: Biztosítjuk, hogy minden ID csak egyszer szerepeljen
    const seenOfferIds = new Set<number>();
    const updatedOffers = updatedOffersRaw.filter(offer => {
      if (seenOfferIds.has(offer.id)) {
        if (import.meta.env.DEV) {
          console.warn("⚠️ Duplikált offer ID eltávolítva saveEditOffer során:", offer.id);
        }
        return false;
      }
      seenOfferIds.add(offer.id);
      return true;
    });

    // Frissítjük a lokális undo/redo állapotot ÉS az App szintű offers state-et is,
    // így a módosítás azonnal látszik minden nézetben, nem csak az autosave után.
    setOffersWithHistory(updatedOffers);
    setOffers(updatedOffers);
    setSelectedOffer(updatedOffer);
    cancelEditOffer();
    
    // Audit log
    if (hasChanges) {
      try {
        await auditUpdate("offer", editingOffer.id, editCustomerName.trim(), {
          oldValues: {
            customerName: editingOffer.customerName,
            profitPercentage: editingOffer.profitPercentage,
            printerId: editingOffer.printerId,
          },
          newValues: {
            customerName: editCustomerName.trim(),
            profitPercentage: editProfitPercentage,
            printerId: selectedPrinter.id,
          },
          version: currentVersion,
        });
      } catch (error) {
        console.warn("Audit log hiba:", error);
      }
    }
    
    logWithLanguage(settings.language, "log", "offers.save.success", {
      offerId: editingOffer.id,
      version: currentVersion,
      hasHistory: history.length > 0,
    });
    const versionSuffix = hasChanges ? ` (${t("offers.versionPrefix")}${currentVersion})` : "";
    showToast(`${t("offers.toast.saveSuccess")}${versionSuffix}`, "success");
    // Natív értesítés küldése (ha engedélyezve van)
    if (settings.notificationEnabled !== false) {
      try {
        const { notifySaveComplete } = await import("../utils/platformFeatures");
        await notifySaveComplete();
      } catch (error) {
        console.log("Értesítés küldése sikertelen:", error);
      }
    }
  };

  const exportToPDF = (offer: Offer) => {
    try {
      logWithLanguage(settings.language, "log", "offers.pdf.start", {
        offerId: offer.id,
        customerName: offer.customerName,
        template: settings.pdfTemplate,
        totalCost: offer.costs.totalCost,
        currency: offer.currency,
      });
      
      // HTML tartalom generálása
      const htmlContent = generatePDFContent(offer, t, settings, locale, theme);
      
      // Próbáljuk meg az új ablakot megnyitni (user gesture, így működik)
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') {
        // Ha az ablak blokkolva van, mutassuk meg az előnézetet a jelenlegi oldalon
        if (import.meta.env.DEV) {
          logWithLanguage(settings.language, "log", "offers.pdf.windowBlocked");
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
        logWithLanguage(settings.language, "log", "offers.pdf.contentWritten");
      }
      
      // Várunk, hogy a tartalom betöltődjön
      printWindow.onload = () => {
        logWithLanguage(settings.language, "log", "offers.pdf.windowLoaded");
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
            logWithLanguage(settings.language, "log", "offers.pdf.completed", { offerId: offer.id });
          } catch (e) {
            logWithLanguage(settings.language, "error", "offers.pdf.error", { error: e });
            alert(t("offers.exportPDF") + " - Nyomtatási hiba: " + (e as Error).message);
          }
        }, 300);
      };
      
      // Fallback: setTimeout ha az onload nem fut le
      setTimeout(() => {
        try {
          if (printWindow && !printWindow.closed) {
            logWithLanguage(settings.language, "log", "offers.pdf.fallbackTrigger");
            printWindow.focus();
            printWindow.print();
            logWithLanguage(settings.language, "log", "offers.pdf.fallbackCompleted", { offerId: offer.id });
          }
        } catch (e) {
          logWithLanguage(settings.language, "error", "offers.pdf.fallbackError", { error: e });
        }
      }, 1000);
    } catch (error) {
      logWithLanguage(settings.language, "error", "offers.pdf.error", { error });
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
        logWithLanguage(settings.language, "log", "offers.pdf.startedForOffer", { offerId: offer.id });
      }
      
      // HTML tartalom generálása
      const htmlContent = generatePDFContent(offer, t, settings, locale, theme);
      
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
        await writeTextFile(filePath, htmlContent);
        showToast(`${t("offers.toast.exportHtmlSuccess")} ${fileName}`, "success");
        // Natív értesítés küldése (ha engedélyezve van)
        if (settings.notificationEnabled !== false) {
          try {
            await notifyExportComplete(fileName);
          } catch (error) {
            console.log("Értesítés küldése sikertelen:", error);
          }
        }
      }
    } catch (error) {
      logWithLanguage(settings.language, "error", "offers.pdf.error", { error });
      const errorMessage = error instanceof Error ? error.message : String(error);
      showToast(`${t("offers.toast.exportHtmlError")} ${errorMessage}`, "error");
    }
  };

  const openPDFPreview = (offer: Offer) => {
    const htmlContent = generatePDFContent(offer, t, settings, locale);
    setPrintContent(htmlContent);
    setShowPrintPreview(true);
  };

  // Helper függvény a PDF generáláshoz is
  const getDisplayCustomerNameForPDF = (customerName: string | undefined, customerId: number | null | undefined, currentLanguage: Settings["language"]): string => {
    if (!customerName) {
      if (customerId) {
        const customerIdLabel = translationRegistry[currentLanguage]?.["offers.details.customerId"] || "Ügyfél ID";
        return `${customerIdLabel}: ${customerId}`;
      }
      return "";
    }
    
    // Ellenőrizzük, hogy a customerName egy ismert titkosított adatok szöveg-e
    const allEncryptedDataTexts = Object.values(translationRegistry).map(
      (lang) => lang["encryption.encryptedData"]
    ).filter(Boolean);
    
    if (allEncryptedDataTexts.includes(customerName)) {
      return translationRegistry[currentLanguage]?.["encryption.encryptedData"] || "ENCRYPTED DATA";
    }
    
    return customerName;
  };

  const generatePDFContent = (
    offer: Offer,
    t: (key: TranslationKey) => string,
    settings: Settings,
    locale: string,
    theme?: Theme
  ): string => {
    const formatTime = (hours: number, minutes: number, seconds: number) => {
      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (seconds > 0) parts.push(`${seconds}s`);
      return parts.join(" ") || "0";
    };

    // Konvertáljuk a jelenlegi beállítások pénznemére
    const displayCurrency = settings.currency;
    const displayCurrencyLabel = displayCurrency === "HUF" ? "Ft" : displayCurrency;

    const date = new Date(offer.date);
    const formattedDate = date.toLocaleDateString(locale);
    const pricePerKgHeader = t("offers.pdf.table.pricePerKg").replace("{currency}", displayCurrencyLabel);

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const formatMultiline = (value: string) => escapeHtml(value).replace(/\r?\n/g, "<br />");

    const companyInfo = settings.companyInfo || {};
    const safeName = companyInfo.name?.trim();
    const safeTax = companyInfo.taxNumber?.trim();
    const safeBank = companyInfo.bankAccount?.trim();
    const safeEmail = companyInfo.email?.trim();
    const safePhone = companyInfo.phone?.trim();
    const safeWebsite = companyInfo.website?.trim();
    const safeAddress = companyInfo.address?.trim();
    const hasCompanyDetails = Boolean(
      safeName ||
      safeTax ||
      safeBank ||
      safeEmail ||
      safePhone ||
      safeWebsite ||
      safeAddress ||
      companyInfo.logoBase64
    );

    const formatLink = (label: string, href: string, display: string) =>
      `<p><strong>${label}:</strong> <a href="${href}" target="_blank" rel="noreferrer">${escapeHtml(display)}</a></p>`;

    const companyInfoBlock = hasCompanyDetails
      ? `
        <div class="company-header">
          <div class="company-details">
            ${safeName ? `<h2>${escapeHtml(safeName)}</h2>` : ""}
            ${safeAddress ? `<p><strong>${t("offers.pdf.company.headquarters")}:</strong> ${formatMultiline(safeAddress)}</p>` : ""}
            ${safeTax ? `<p><strong>${t("offers.pdf.company.tax")}:</strong> ${escapeHtml(safeTax)}</p>` : ""}
            ${safeBank ? `<p><strong>${t("offers.pdf.company.bank")}:</strong> ${escapeHtml(safeBank)}</p>` : ""}
            ${safeEmail ? formatLink(t("offers.pdf.company.email"), `mailto:${encodeURIComponent(safeEmail)}`, safeEmail) : ""}
            ${safePhone ? formatLink(t("offers.pdf.company.phone"), `tel:${encodeURIComponent(safePhone.replace(/\s+/g, ""))}`, safePhone) : ""}
            ${
              safeWebsite
                ? (() => {
                    const normalized =
                      safeWebsite.match(/^https?:\/\//i) ? safeWebsite : `https://${safeWebsite}`;
                    return formatLink(t("offers.pdf.company.website"), encodeURI(normalized), safeWebsite);
                  })()
                : ""
            }
          </div>
          ${
            companyInfo.logoBase64
              ? `<div class="company-logo"><img src="${companyInfo.logoBase64}" alt="${t("offers.pdf.company.logoAlt")}" /></div>`
              : ""
          }
        </div>
      `
      : "";

    // Téma színek használata vagy fallback az alapértelmezett színekre
    const bgColor = theme?.colors.background?.includes('gradient') 
      ? theme.colors.surface || '#ffffff'
      : (theme?.colors.background || '#ffffff');
    const surfaceColor = theme?.colors.surface || '#ffffff';
    const textColor = theme?.colors.text || '#333333';
    const textSecondaryColor = theme?.colors.textSecondary || '#666666';
    const primaryColor = theme?.colors.primary || '#007bff';
    const borderColor = theme?.colors.border || '#e5e7eb';
    const surfaceHoverColor = theme?.colors.surfaceHover || '#f5f5f5';
    const successColor = theme?.colors.success || '#28a745';
    const tableHeaderBg = theme?.colors.tableHeaderBg || surfaceHoverColor;
    const tableBorder = theme?.colors.tableBorder || borderColor;

    // Gradient háttér kezelése - ha gradient, akkor használjuk a surface-t
    const bodyBackground = theme?.colors.background?.includes('gradient')
      ? surfaceColor
      : bgColor;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${t("offers.pdf.title")} - ${offer.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: ${textColor};
            background-color: ${bodyBackground};
          }
          h1 { 
            color: ${primaryColor}; 
            border-bottom: 2px solid ${primaryColor}; 
            padding-bottom: 10px; 
          }
          h2 { 
            color: ${textSecondaryColor}; 
            margin-top: 30px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
          }
          th, td { 
            padding: 10px; 
            text-align: left; 
            border: 1px solid ${tableBorder}; 
          }
          th { 
            background-color: ${tableHeaderBg}; 
            font-weight: bold; 
            color: ${textColor};
          }
          td {
            background-color: ${surfaceColor};
            color: ${textColor};
          }
          .total { 
            font-size: 1.2em; 
            font-weight: bold; 
            color: ${primaryColor}; 
          }
          .section { 
            margin-bottom: 30px; 
          }
          .info { 
            background-color: ${surfaceHoverColor}; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px; 
            border: 1px solid ${borderColor};
            color: ${textColor};
          }
          .company-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            gap: 24px; 
            padding-bottom: 16px; 
            margin-bottom: 24px; 
            border-bottom: 2px solid ${borderColor}; 
          }
          .company-details { 
            flex: 1 1 auto; 
          }
          .company-details h2 { 
            margin: 0 0 8px 0; 
            font-size: 24px; 
            color: ${textColor}; 
          }
          .company-details p { 
            margin: 4px 0; 
            font-size: 13px; 
            color: ${textSecondaryColor}; 
          }
          .company-details a { 
            color: ${primaryColor}; 
            text-decoration: none; 
          }
          .company-details a:hover { 
            text-decoration: underline; 
          }
          .company-logo { 
            flex: 0 0 auto; 
            max-width: 160px; 
            max-height: 120px; 
            border: 1px solid ${borderColor}; 
            border-radius: 8px; 
            padding: 8px; 
            background: ${surfaceColor}; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
          }
          .company-logo img { 
            max-width: 100%; 
            max-height: 100%; 
            object-fit: contain; 
          }
        </style>
      </head>
      <body>
        ${companyInfoBlock}
        <h1>${t("offers.pdf.title")}</h1>
        
        <div class="info">
          <p><strong>${t("offers.date")}:</strong> ${formattedDate}</p>
          ${offer.customerName ? `<p><strong>${t("offers.customerName")}:</strong> ${getDisplayCustomerNameForPDF(offer.customerName, offer.customerId, settings.language)}</p>` : ""}
          ${offer.customerContact ? `<p><strong>${t("offers.customerContact")}:</strong> ${offer.customerContact}</p>` : ""}
          ${offer.description ? `<p><strong>${t("offers.description")}:</strong> ${getDisplayDescription(offer.description) || offer.description}</p>` : ""}
        </div>

        <div class="section">
          <h2>${t("offers.pdf.section.printer")}</h2>
          <p><strong>${offer.printerName}</strong> (${offer.printerType}) - ${offer.printerPower}W</p>
          <p><strong>${t("offers.printTime")}:</strong> ${formatTime(offer.printTimeHours, offer.printTimeMinutes, offer.printTimeSeconds)}</p>
        </div>

        <div class="section">
          <h2>${t("offers.pdf.section.filaments")}</h2>
          <table>
            <thead>
              <tr>
                <th>${t("offers.pdf.table.image")}</th>
                <th>${t("offers.pdf.table.brand")}</th>
                <th>${t("offers.pdf.table.type")}</th>
                <th>${t("offers.pdf.table.color")}</th>
                <th>${t("offers.pdf.table.used")}</th>
                <th>${pricePerKgHeader}</th>
                ${offer.filaments.some(f => f.needsDrying) ? `<th>${t("offers.pdf.table.drying")}</th>` : ""}
              </tr>
            </thead>
            <tbody>
              ${(() => {
                const offerCurrency = offer.currency || "EUR";
                const hasDryingInfo = offer.filaments.some(f => f.needsDrying);
                return offer.filaments.map(f => {
                  const convertedPrice = convertCurrencyFromTo(f.pricePerKg, offerCurrency, displayCurrency);
                  const safeBrand = escapeHtml(f.brand);
                  const safeType = escapeHtml(f.type);
                  const colorHex = normalizeHex(f.colorHex || resolveColorHexFromName(f.color) || DEFAULT_COLOR_HEX) || DEFAULT_COLOR_HEX;
                  const imageSrc = f.imageBase64 || getFilamentPlaceholder(colorHex);
                  const colorLabel = f.color ? escapeHtml(f.color) : colorHex;
                  const dryingInfo = f.needsDrying ? `${f.dryingTime ?? 0}h @ ${f.dryingPower ?? 0}W` : "-";
                  return `
                    <tr>
                      <td style="text-align:center;">
                        <img src="${imageSrc}" alt="${safeBrand} ${safeType}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid ${borderColor};" />
                      </td>
                      <td>${safeBrand}</td>
                      <td>${safeType}</td>
                      <td>
                        <div style="display:flex;align-items:center;gap:8px;">
                          <span style="width:14px;height:14px;border-radius:50%;background-color:${colorHex};border:1px solid rgba(0,0,0,0.15);"></span>
                          <span>${colorLabel}</span>
                        </div>
                      </td>
                      <td>${f.usedGrams}</td>
                      <td>${convertedPrice.toFixed(2)} ${displayCurrencyLabel}</td>
                      ${hasDryingInfo ? `<td>${dryingInfo}</td>` : ""}
                    </tr>
                  `;
                }).join("");
              })()}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>${t("offers.pdf.section.costs")}</h2>
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
              <td>${t("offers.pdf.cost.filament")}</td>
              <td><strong>${filamentCost.toFixed(2)} ${displayCurrencyLabel}</strong></td>
            </tr>
            <tr>
              <td>${t("offers.pdf.cost.electricity")}</td>
              <td><strong>${electricityCost.toFixed(2)} ${displayCurrencyLabel}</strong></td>
            </tr>
            ${dryingCost > 0 ? `
            <tr>
              <td>${t("offers.pdf.cost.drying")}</td>
              <td><strong>${dryingCost.toFixed(2)} ${displayCurrencyLabel}</strong></td>
            </tr>
            ` : ""}
            <tr>
              <td>${t("offers.pdf.cost.usage")}</td>
              <td><strong>${usageCost.toFixed(2)} ${displayCurrencyLabel}</strong></td>
            </tr>
            <tr>
              <td><strong>${t("offers.pdf.cost.total")}</strong></td>
              <td><strong>${totalCost.toFixed(2)} ${displayCurrencyLabel}</strong></td>
            </tr>
            <tr style="border-top: 2px solid ${textColor};">
              <td><strong>${t("offers.pdf.summary.revenue").replace("{profit}", String(offer.profitPercentage ?? 30))}:</strong></td>
              <td><strong style="color: ${successColor}; font-size: 1.1em;">${revenue.toFixed(2)} ${displayCurrencyLabel}</strong></td>
            </tr>
            <tr class="total" style="background-color: ${surfaceHoverColor};">
              <td><strong>${t("offers.pdf.summary.profit")}:</strong></td>
              <td><strong style="color: ${primaryColor}; font-size: 1.3em;">${profit.toFixed(2)} ${displayCurrencyLabel}</strong></td>
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

      offersWithHistory.forEach(offer => {
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

  const totalOffers = offersWithHistory.length;

  const recentStatusChanges = useMemo(() => {
    const entries: Array<{
      offerId: number;
      status: OfferStatus;
      date: string;
      note?: string;
      customerId?: number;
    }> = [];

    offersWithHistory.forEach(offer => {
      if (offer.statusHistory && offer.statusHistory.length > 0) {
        offer.statusHistory.forEach(history => {
          if (history.date) {
            entries.push({
              offerId: offer.id,
              status: history.status,
              date: history.date,
              note: history.note,
              customerId: offer.customerId,
            });
          }
        });
      } else if (offer.status && offer.statusUpdatedAt) {
        entries.push({
          offerId: offer.id,
          status: offer.status,
          date: offer.statusUpdatedAt,
          customerId: offer.customerId,
        });
      }
    });

    return entries
      .filter(entry => !Number.isNaN(new Date(entry.date).getTime()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [offers]);

  // Frissítjük a látható tartományt, amikor a státuszváltások változnak
  useEffect(() => {
    if (recentStatusChanges.length <= STATUS_CHANGES_VIRTUAL_THRESHOLD) {
      setVisibleStatusChangesRange({ start: 0, end: recentStatusChanges.length - 1 });
    } else {
      setVisibleStatusChangesRange({ start: 0, end: STATUS_CHANGES_VIRTUAL_THRESHOLD });
    }
  }, [recentStatusChanges.length]);

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "—";
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString(locale, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  type OfferSortKey = "date" | "amount" | "status" | "customer" | "id";

  const handleOfferSort = (key: OfferSortKey, event?: React.MouseEvent<HTMLButtonElement>) => {
    const isShiftClick = event?.shiftKey;

    setOfferSortConfig(prev => {
      const existingIndex = prev.findIndex(cfg => cfg.key === key);
      const existing = existingIndex >= 0 ? prev[existingIndex] : null;

      if (!isShiftClick) {
        // Single-column mód: csak egy kulcs aktív
        let next: Array<{ key: OfferSortKey; direction: "asc" | "desc" }>;
        if (!existing) {
          next = [{ key, direction: "asc" }];
        } else if (existing.direction === "asc") {
          next = [{ key, direction: "desc" }];
        } else {
          // desc -> kikapcsoljuk a rendezést
          next = [];
        }

        if (onSettingsChange) {
          onSettingsChange({
            ...settings,
            offerSortConfig: next,
          });
        }

        return next;
      }

      // Shift+click: többszörös rendezés
      let next: Array<{ key: OfferSortKey; direction: "asc" | "desc" }>;

      if (!existing) {
        next = [...prev, { key, direction: "asc" as const }];
      } else if (existing.direction === "asc") {
        next = prev.map(cfg =>
          cfg.key === key ? { ...cfg, direction: "desc" as const } : cfg
        );
      } else {
        // desc -> eltávolítjuk ezt a kulcsot a láncból
        next = prev.filter(cfg => cfg.key !== key);
      }

      if (onSettingsChange) {
        onSettingsChange({
          ...settings,
          offerSortConfig: next,
        });
      }

      return next;
    });
  };


  // Bulk műveletek
  const toggleSelection = (offerId: number) => {
    setSelectedOfferIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(offerId)) {
        newSet.delete(offerId);
      } else {
        newSet.add(offerId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = new Set(filteredOffers.map(o => o.id));
    setSelectedOfferIds(allIds);
  };

  const deselectAll = () => {
    setSelectedOfferIds(new Set());
  };

  const handleBulkDelete = () => {
    setBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedOfferIds.size === 0) return;
    
    const idsToDelete = Array.from(selectedOfferIds);
    const offersToDelete = offersWithHistory.filter(o => idsToDelete.includes(o.id));
    
    logWithLanguage(settings.language, "log", "offers.delete.start", {
      offerId: idsToDelete[0],
      customerName: offersToDelete[0]?.customerName,
    });
    
    const updatedOffers = offersWithHistory.filter(o => !idsToDelete.includes(o.id));
    setOffersWithHistory(updatedOffers);
    
    if (selectedOffer && idsToDelete.includes(selectedOffer.id)) {
      setSelectedOffer(null);
    }
    
    logWithLanguage(settings.language, "log", "offers.delete.success", { offerId: idsToDelete[0] });
    
    setSelectedOfferIds(new Set());
    setBulkDeleteConfirm(false);
    
    const successMessage = t("offers.bulk.delete.success").replace("{{count}}", idsToDelete.length.toString());
    showToast(successMessage, "success");
  };

  const isAllSelected = filteredOffers.length > 0 && 
    filteredOffers.every(o => selectedOfferIds.has(o.id));
  const isSomeSelected = selectedOfferIds.size > 0 && !isAllSelected;

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

    const draggedIndex = offersWithHistory.findIndex(o => o.id === draggedOfferId);
    const targetIndex = offersWithHistory.findIndex(o => o.id === targetOfferId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedOfferId(null);
      return;
    }

    // Átrendezés
    const newOffers = [...offersWithHistory];
    const [removed] = newOffers.splice(draggedIndex, 1);
    newOffers.splice(targetIndex, 0, removed);

    setOffersWithHistory(newOffers);
    setDraggedOfferId(null);
    logWithLanguage(settings.language, "log", "offers.reorder", {
      draggedId: draggedOfferId,
      targetId: targetOfferId,
    });
    showToast(t("offers.toast.reordered"), "success");
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
    const offer = offersWithHistory.find(o => o.id === contextMenu.offerId);
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

  const closeOfferDetails = () => {
    setSelectedOffer(null);
  };

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("offers.title")}</h2>
      <p style={themeStyles.pageSubtitle}>{t("offers.subtitle")}</p>
      
      {/* Kereső mező és műveletek */}
      {offersWithHistory.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Első sor: Keresés és Szűrők grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", alignItems: "start" }}>
              {/* Keresés - bal oldal */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                  }}
                >
                  🔍 {t("offers.search.label")}
                </label>
                <input
                  type="text"
                  placeholder={t("offers.search.placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => {
                    e.target.style.borderColor = theme.colors.inputBorder;
                    e.target.style.boxShadow = "none";
                  }}
                  style={{ ...themeStyles.input, width: "100%", padding: "12px 16px", fontSize: "14px", boxSizing: "border-box" }}
                  aria-label={t("offers.search.aria")}
                  aria-describedby="offers-search-description"
                />
                <span id="offers-search-description" style={{ display: "none" }}>
                  {t("offers.search.description")}
                </span>
              </div>

              {/* Szűrők grid - jobb oldal */}
              <OfferFilters
                minAmountFilter={minAmountFilter}
                maxAmountFilter={maxAmountFilter}
                fromDateFilter={fromDateFilter}
                toDateFilter={toDateFilter}
                onMinAmountChange={setMinAmountFilter}
                onMaxAmountChange={setMaxAmountFilter}
                onFromDateChange={setFromDateFilter}
                onToDateChange={setToDateFilter}
                themeStyles={themeStyles}
                settings={settings}
                theme={theme}
              />
            </div>

            {/* Második sor: Műveletek és Rendezés */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", paddingTop: "12px", borderTop: `1px solid ${theme.colors.border}` }}>
              {/* Undo/Redo gombok - bal oldal */}
              <div style={{ display: "flex", gap: "8px" }}>
                <Tooltip content={`${t("common.undo")} (Ctrl/Cmd+Z)`}>
                  <button
                    onClick={() => {
                      if (canUndo) {
                        undo();
                        showToast(t("common.undo") || "Visszavonás", "info");
                      }
                    }}
                    disabled={!canUndo}
                    style={{
                      ...themeStyles.button,
                      ...themeStyles.buttonSecondary,
                      opacity: canUndo ? 1 : 0.5,
                      cursor: canUndo ? "pointer" : "not-allowed",
                      padding: "8px 16px",
                      fontSize: "13px",
                    }}
                  >
                    ↶ {t("common.undo")}
                  </button>
                </Tooltip>
                <Tooltip content={`${t("common.redo")} (Ctrl/Cmd+Shift+Z)`}>
                  <button
                    onClick={() => {
                      if (canRedo) {
                        redo();
                        showToast(t("common.redo") || "Újra", "info");
                      }
                    }}
                    disabled={!canRedo}
                    style={{
                      ...themeStyles.button,
                      ...themeStyles.buttonSecondary,
                      opacity: canRedo ? 1 : 0.5,
                      cursor: canRedo ? "pointer" : "not-allowed",
                      padding: "8px 16px",
                      fontSize: "13px",
                    }}
                  >
                    ↷ {t("common.redo")}
                  </button>
                </Tooltip>
              </div>

              {/* Rendezés – jobb oldal */}
              <OfferSortControls
                sortConfig={offerSortConfig}
                onSort={handleOfferSort}
                theme={theme}
                settings={settings}
              />
            </div>
          </div>
        </div>
      )}
      
      {offersWithHistory.length === 0 ? (
        <EmptyState
          icon="📄"
          title={t("offers.empty")}
          theme={theme}
          themeStyles={themeStyles}
          settings={settings}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            data-tutorial="status-dashboard"
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
                <h3
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                    color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "22px" }}>📊</span>
                  {t("offers.summary.title")}
                </h3>
                <p
                  style={{
                    margin: "6px 0 0 0",
                    fontSize: "13px",
                    color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
                    maxWidth: "540px",
                  }}
                >
                  {t("offers.summary.description")}
                </p>
              </div>
              <OfferStatusFilters
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                statusSummary={statusSummary}
                totalOffers={totalOffers}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                settings={settings}
                theme={theme}
              />
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
                        ? `${t("offers.summary.lastChange")}: ${formatDateTime(summary.updatedAt)}`
                        : t("offers.summary.noStatus")}
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
                {t("offers.summary.recentChangesTitle")}
              </h4>
              {recentStatusChanges.length > 0 ? (
                <div 
                  ref={statusChangesContainerRef}
                  style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "10px",
                    maxHeight: "400px",
                    overflowY: recentStatusChanges.length > STATUS_CHANGES_VIRTUAL_THRESHOLD ? "auto" : "visible",
                    overflowX: "hidden",
                    paddingRight: "8px",
                    position: "relative",
                    // Custom scrollbar styling
                    scrollbarWidth: "thin",
                    scrollbarColor: `${theme.colors.border} transparent`,
                  }}
                  className="custom-scrollbar"
                  onScroll={() => {
                    if (!statusChangesContainerRef.current) return;
                    if (recentStatusChanges.length <= STATUS_CHANGES_VIRTUAL_THRESHOLD) return;
                    const container = statusChangesContainerRef.current;
                    const scrollTop = container.scrollTop;
                    const clientHeight = container.clientHeight;
                    const start = Math.max(0, Math.floor(scrollTop / STATUS_CHANGES_ROW_HEIGHT) - STATUS_CHANGES_OVERSCAN);
                    const end = Math.min(
                      recentStatusChanges.length - 1,
                      Math.ceil((scrollTop + clientHeight) / STATUS_CHANGES_ROW_HEIGHT) + STATUS_CHANGES_OVERSCAN
                    );
                    setVisibleStatusChangesRange((prev) => {
                      if (prev.start === start && prev.end === end) {
                        return prev;
                      }
                      return { start, end };
                    });
                  }}
                >
                  <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: transparent;
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: ${theme.colors.border};
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: ${theme.colors.textMuted};
                    }
                  `}</style>
                  {(() => {
                    const shouldVirtualize = recentStatusChanges.length > STATUS_CHANGES_VIRTUAL_THRESHOLD;
                    const entriesToRender = shouldVirtualize
                      ? recentStatusChanges.slice(
                          Math.max(0, visibleStatusChangesRange.start),
                          Math.min(recentStatusChanges.length, visibleStatusChangesRange.end + 1)
                        )
                      : recentStatusChanges;
                    const topSpacer = shouldVirtualize
                      ? Math.max(0, visibleStatusChangesRange.start) * STATUS_CHANGES_ROW_HEIGHT
                      : 0;
                    const bottomSpacer = shouldVirtualize
                      ? Math.max(
                          0,
                          (recentStatusChanges.length - (visibleStatusChangesRange.end + 1)) * STATUS_CHANGES_ROW_HEIGHT
                        )
                      : 0;

                    return (
                      <>
                        {topSpacer > 0 && (
                          <div
                            style={{
                              height: `${topSpacer}px`,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {entriesToRender.map(entry => (
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
                              flexShrink: 0,
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: "13px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                                {getStatusLabel(entry.status)}
                              </strong>
                              <span style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                                {entry.customerId 
                                  ? `🆔 ${entry.customerId}`
                                  : `${t("offers.label.quote")} #${entry.offerId}`}
                              </span>
                              {entry.note && (
                                <span style={{ fontSize: "11px", fontStyle: "italic", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, wordBreak: "break-word" }}>
                                  "{entry.note}"
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, whiteSpace: "nowrap", marginLeft: "8px" }}>
                              {formatDateTime(entry.date)}
                            </span>
                          </div>
                        ))}
                        {bottomSpacer > 0 && (
                          <div
                            style={{
                              height: `${bottomSpacer}px`,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div
                  style={{
                    padding: "24px 16px",
                    borderRadius: "12px",
                    border: `1px dashed ${theme.colors.border}`,
                    textAlign: "center",
                    color: theme.colors.textMuted,
                  }}
                >
                  {t("offers.summary.recentChangesEmpty")}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* Árajánlatok lista */}
            <div style={{ flex: "1", minWidth: "300px" }}>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                  marginBottom: "16px",
                }}
              >
                📋 {t("offers.list.title")}
              </h3>
              
              {/* Bulk műveletek toolbar */}
              {selectedOfferIds.size > 0 && (
                <div style={{
                  ...themeStyles.card,
                  padding: "12px 16px",
                  marginBottom: "16px",
                  backgroundColor: theme.colors.surfaceHover,
                  borderBottom: `1px solid ${theme.colors.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAll();
                        } else {
                          deselectAll();
                        }
                      }}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                      aria-label={t("offers.bulk.selectAll")}
                    />
                    <span style={{ color: theme.colors.text, fontSize: "14px", fontWeight: "600" }}>
                      {t("offers.bulk.selected").replace("{{count}}", selectedOfferIds.size.toString())}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={deselectAll}
                      style={{
                        ...themeStyles.button,
                        ...themeStyles.buttonSecondary,
                        padding: "6px 12px",
                        fontSize: "12px",
                      }}
                    >
                      {t("offers.bulk.deselectAll")}
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      style={{
                        ...themeStyles.button,
                        ...themeStyles.buttonDanger,
                        padding: "6px 12px",
                        fontSize: "12px",
                      }}
                    >
                      {t("offers.bulk.delete").replace("{{count}}", selectedOfferIds.size.toString())}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Select All checkbox (ha nincs kijelölve semmi) */}
              {selectedOfferIds.size === 0 && filteredOffers.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAll();
                        } else {
                          deselectAll();
                        }
                      }}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ color: theme.colors.text, fontSize: "14px" }}>
                      {t("offers.bulk.selectAll")}
                    </span>
                  </label>
                </div>
              )}
              
              <div
                data-tutorial="offers-list"
                ref={offersListContainerRef}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  maxHeight: sortedOffers.length > VIRTUAL_SCROLL_THRESHOLD ? "620px" : "none",
                  overflowY: sortedOffers.length > VIRTUAL_SCROLL_THRESHOLD ? "auto" : "visible",
                }}
                onScroll={() => {
                  if (!offersListContainerRef.current) return;
                  if (sortedOffers.length <= VIRTUAL_SCROLL_THRESHOLD) return;
                  const container = offersListContainerRef.current;
                  const scrollTop = container.scrollTop;
                  const clientHeight = container.clientHeight;
                  const start = Math.max(0, Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN);
                  const end = Math.min(
                    sortedOffers.length - 1,
                    Math.ceil((scrollTop + clientHeight) / VIRTUAL_ROW_HEIGHT) + VIRTUAL_OVERSCAN
                  );
                  setVisibleOfferRange((prev) => {
                    if (prev.start === start && prev.end === end) {
                      return prev;
                    }
                    return { start, end };
                  });
                }}
              >
                {(() => {
                  const shouldVirtualize = sortedOffers.length > VIRTUAL_SCROLL_THRESHOLD;
                  const offersToRenderRaw = shouldVirtualize
                    ? sortedOffers.slice(
                        Math.max(0, visibleOfferRange.start),
                        Math.min(sortedOffers.length, visibleOfferRange.end + 1)
                      )
                    : sortedOffers;
                  
                  // 🔒 DUPLIKÁLT ID ELTÁVOLÍTÁS: Biztosítjuk, hogy minden ID csak egyszer szerepeljen
                  const seenOfferIds = new Set<number>();
                  const offersToRender = offersToRenderRaw.filter(offer => {
                    if (seenOfferIds.has(offer.id)) {
                      if (import.meta.env.DEV) {
                        console.warn("⚠️ Duplikált offer ID eltávolítva:", offer.id);
                      }
                      return false;
                    }
                    seenOfferIds.add(offer.id);
                    return true;
                  });
                  const topSpacer = shouldVirtualize
                    ? Math.max(0, visibleOfferRange.start) * VIRTUAL_ROW_HEIGHT
                    : 0;
                  const bottomSpacer = shouldVirtualize
                    ? Math.max(
                        0,
                        (sortedOffers.length - (visibleOfferRange.end + 1)) * VIRTUAL_ROW_HEIGHT
                      )
                    : 0;

                  return (
                    <>
                      {topSpacer > 0 && (
                        <div
                          style={{
                            height: `${topSpacer}px`,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {offersToRender.map((offer) => {
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
                        backgroundColor:
                          selectedOffer?.id === offer.id ? theme.colors.primary + "15" : theme.colors.surface,
                        border:
                          selectedOffer?.id === offer.id
                            ? `2px solid ${theme.colors.primary}`
                            : `1px solid ${theme.colors.border}`,
                        cursor: draggedOfferId === offer.id ? "grabbing" : "grab",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        opacity: draggedOfferId === offer.id ? 0.5 : 1,
                        transform: draggedOfferId === offer.id ? "scale(0.96)" : "scale(1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedOffer?.id !== offer.id && draggedOfferId !== offer.id) {
                          Object.assign(e.currentTarget.style, themeStyles.cardHover);
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedOffer?.id !== offer.id) {
                          e.currentTarget.style.transform =
                            draggedOfferId === offer.id ? "scale(0.95)" : "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "16px",
                        }}
                      >
                        {/* Bal oldal: checkbox + név + státusz + részletek */}
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                            <div
                              style={{
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "4px",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedOfferIds.has(offer.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelection(offer.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  cursor: "pointer",
                                }}
                                aria-label={t("offers.bulk.select")}
                              />
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                flexWrap: "wrap",
                                minWidth: 0,
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: "16px",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                }}
                              >
                                {getDisplayCustomerName(offer.customerName, offer.customerId) || 
                                  (offer.customerId
                                    ? `${t("offers.details.customerId") || "Ügyfél ID"}: ${offer.customerId}`
                                    : `${t("offers.label.quote")} #${offer.id}`)}
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
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {getStatusLabel(offer.status)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "12px",
                              fontSize: "12px",
                              color: theme.colors.background?.includes("gradient")
                                ? "#4a5568"
                                : theme.colors.textMuted,
                            }}
                          >
                            <span>🗓️ {date.toLocaleDateString(locale)}</span>
                            {statusUpdatedDate && (
                              <span>
                                ⏱️ {t("offers.list.updated")}:{" "}
                                {statusUpdatedDate.toLocaleString(locale, {
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                            <span>🖨️ {offer.printerName}</span>
                            <span>
                              ⏳ {offer.totalPrintTimeHours.toFixed(2)} {t("calculator.hoursUnit")}
                            </span>
                          </div>

                          {offer.description && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: "13px",
                                color: theme.colors.background?.includes("gradient")
                                  ? "#1a202c"
                                  : theme.colors.textSecondary,
                              }}
                            >
                              {(() => {
                                const displayDescription = getDisplayDescription(offer.description);
                                return displayDescription && displayDescription.length > 160
                                  ? `${displayDescription.slice(0, 160)}…`
                                  : displayDescription;
                              })()}
                            </p>
                          )}
                        </div>

                        {/* Jobb oldal: összeg + kontakt */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "6px",
                            minWidth: "120px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              color: theme.colors.primary,
                            }}
                          >
                            {totalAmount} {getCurrencyLabel(settings.currency)}
                          </span>
                          {offer.customerContact && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: theme.colors.background?.includes("gradient")
                                  ? "#1a202c"
                                  : theme.colors.textSecondary,
                              }}
                            >
                              📧 {offer.customerContact}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Akciógombok (pl. törlés) */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Tooltip content={t("offers.tooltip.delete")}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteOffer(offer.id);
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                            }}
                            style={{
                              ...themeStyles.button,
                              ...themeStyles.buttonDanger,
                              padding: "6px 14px",
                              fontSize: "12px",
                            }}
                          >
                            {t("offers.delete")}
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
                      {bottomSpacer > 0 && (
                        <div
                          style={{
                            height: `${bottomSpacer}px`,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {filteredOffers.length === 0 && offersWithHistory.length > 0 && (
                        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
                          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                          <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: "16px" }}>
                            {t("offers.search.noResults")}
                          </p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Kiválasztott árajánlat részletes nézete */}
            {selectedOffer && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="offer-details-title"
                onClick={closeOfferDetails}
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
                  zIndex: 1050,
                  padding: "24px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "1100px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ ...themeStyles.card, position: "relative", minWidth: "360px" }}>
                    <button
                      onClick={closeOfferDetails}
                      aria-label={t("common.close")}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "none",
                        border: "none",
                        fontSize: "22px",
                        cursor: "pointer",
                        color: theme.colors.textMuted,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme.colors.text;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme.colors.textMuted;
                      }}
                    >
                      ✕
                    </button>
                    <div style={{ paddingTop: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 auto", minWidth: "240px" }}>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: "22px", 
                            fontWeight: "600", 
                            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                          }}>
                            📄 {selectedOffer.customerName 
                              ? selectedOffer.customerName 
                              : (selectedOffer.customerId 
                                ? `${t("offers.details.customerId") || "Ügyfél ID"}: ${selectedOffer.customerId}` 
                                : `${t("offers.label.quote")} #${selectedOffer.id}`)}
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
                          {!editingOffer && (() => {
                            const isEncryptedWithoutPassword = settings.encryptionEnabled && settings.encryptedCustomerData && 
                              !getEncryptionPassword(settings.useAppPasswordForEncryption ?? false) && !!selectedOffer.customerId;
                            return (
                              <Tooltip content={
                                isEncryptedWithoutPassword 
                                  ? t("encryption.passwordRequired")
                                  : t("offers.tooltip.edit")
                              }>
                                <button
                                  onClick={() => startEditOffer(selectedOffer)}
                                  disabled={isEncryptedWithoutPassword}
                                  onMouseEnter={(e) => {
                                    if (!isEncryptedWithoutPassword) {
                                      Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover);
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    const btn = e.currentTarget as HTMLButtonElement;
                                    btn.style.transform = "translateY(0)";
                                    btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow;
                                  }}
                                  style={{
                                    ...themeStyles.button,
                                    ...themeStyles.buttonSuccess,
                                    ...actionButtonStyle,
                                    opacity: isEncryptedWithoutPassword ? 0.5 : 1,
                                    cursor: isEncryptedWithoutPassword ? "not-allowed" : "pointer",
                                  }}
                                >
                                  ✏️ {t("common.edit")}
                                </button>
                              </Tooltip>
                            );
                          })()}
                          {(() => {
                            const isEncryptedWithoutPassword = settings.encryptionEnabled && settings.encryptedCustomerData && 
                              !getEncryptionPassword(settings.useAppPasswordForEncryption ?? false) && !!selectedOffer.customerId;
                            return (
                              <Tooltip content={
                                isEncryptedWithoutPassword 
                                  ? t("encryption.passwordRequired")
                                  : t("offers.tooltip.duplicate")
                              }>
                                <button
                                  onClick={() => duplicateOffer(selectedOffer)}
                                  disabled={isEncryptedWithoutPassword}
                                  onMouseEnter={(e) => {
                                    if (!isEncryptedWithoutPassword) {
                                      Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover);
                                    }
                                  }}
                                  onMouseLeave={(e) => { 
                                    const btn = e.currentTarget as HTMLButtonElement; 
                                    btn.style.transform = "translateY(0)"; 
                                    btn.style.boxShadow = "#6c757d 0 2px 4px"; 
                                  }}
                                  style={{
                                    ...themeStyles.button,
                                    backgroundColor: theme.colors.secondary,
                                    color: "#fff",
                                    ...actionButtonStyle,
                                    opacity: isEncryptedWithoutPassword ? 0.5 : 1,
                                    cursor: isEncryptedWithoutPassword ? "not-allowed" : "pointer",
                                  }}
                                >
                                  📋 {t("common.duplicate")}
                                </button>
                              </Tooltip>
                            );
                          })()}
                          <Tooltip content={t("offers.tooltip.exportPdf")}>
                            <button
                              onClick={() => exportToPDF(selectedOffer)}
                              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
                              style={{
                                ...themeStyles.button,
                                ...themeStyles.buttonPrimary,
                                ...actionButtonStyle,
                              }}
                            >
                              {t("offers.print")}
                            </button>
                          </Tooltip>
                          <Tooltip content={t("offers.tooltip.downloadHtml")}>
                            <button
                              onClick={() => exportAsPDF(selectedOffer)}
                              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
                              style={{
                                ...themeStyles.button,
                                ...themeStyles.buttonSuccess,
                                ...actionButtonStyle,
                              }}
                            >
                              {t("offers.downloadPDF")}
                            </button>
                          </Tooltip>
                          <Tooltip content={t("offers.previewPDF")}
                            >
                            <button
                              data-tutorial="pdf-preview-button"
                              onClick={() => openPDFPreview(selectedOffer)}
                              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
                              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSecondary.boxShadow; }}
                              style={{
                                ...themeStyles.button,
                                ...themeStyles.buttonSecondary,
                                ...actionButtonStyle,
                              }}
                            >
                              {t("offers.previewPDF")}
                            </button>
                          </Tooltip>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", minWidth: "160px" }}>
                          {selectedOfferCreatedAt && (
                            <span style={{ fontSize: "12px", color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted }}>
                              {t("offers.details.created")}{" "}
                              {selectedOfferCreatedAt.toLocaleString(locale, {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                          {selectedOfferStatusDate && (
                            <span style={{ fontSize: "11px", color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted }}>
                              {t("offers.details.statusUpdated")}{" "}
                              {selectedOfferStatusDate.toLocaleString(locale, {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
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
                          <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.textSecondary }}>
                            {t("offers.details.totalCost")}
                          </span>
                          <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.primary, marginTop: "4px" }}>
                            {convertCurrencyFromTo(selectedOffer.costs.totalCost, selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {getCurrencyLabel(settings.currency)}
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: theme.colors.surfaceHover,
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: "12px",
                          padding: "14px"
                        }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.textSecondary }}>
                            {t("offers.details.printTime")}
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
                          <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.textSecondary }}>
                            {t("offers.details.customer")}
                          </span>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text }}>
                            {selectedOffer.customerName 
                              ? selectedOffer.customerName 
                              : (selectedOffer.customerId 
                                ? `${t("offers.details.customerId") || "Ügyfél ID"}: ${selectedOffer.customerId}` 
                                : t("offers.details.customerMissing"))}
                          </div>
                          <span style={{ fontSize: "11px", color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted }}>
                            {selectedOffer.customerContact || (selectedOffer.customerId ? "" : t("offers.details.contactMissing"))}
                          </span>
                        </div>
                        {selectedOffer.printDueDate && (
                          <div style={{
                            backgroundColor: theme.colors.surfaceHover,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: "12px",
                            padding: "14px"
                          }}>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.textSecondary }}>
                              📅 {t("offers.printDueDate") || "Nyomtatás esedékességi dátuma"}
                            </span>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text }}>
                              {new Date(selectedOffer.printDueDate).toLocaleDateString(locale, {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                        {(["draft", "sent", "accepted", "rejected", "completed"] as OfferStatus[]).map(status => {
                          if (selectedOffer.status === status) return null;
                          const color = getStatusColor(status);
                          const isEncryptedWithoutPassword = settings.encryptionEnabled && settings.encryptedCustomerData && 
                            !getEncryptionPassword(settings.useAppPasswordForEncryption ?? false) && !!selectedOffer.customerId;
                          return (
                            <button
                              key={status}
                              onClick={() => {
                                if (!isEncryptedWithoutPassword) {
                                  setStatusChangeOffer(selectedOffer);
                                  setStatusChangeTarget(status);
                                  setStatusChangeNote("");
                                }
                              }}
                              disabled={isEncryptedWithoutPassword}
                              style={{
                                padding: "8px 14px",
                                fontSize: "12px",
                                fontWeight: "600",
                                backgroundColor: color + "18",
                                color,
                                border: `1px solid ${color}`,
                                borderRadius: "999px",
                                cursor: isEncryptedWithoutPassword ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                                opacity: isEncryptedWithoutPassword ? 0.5 : 1,
                              }}
                              onMouseEnter={(e) => {
                                if (!isEncryptedWithoutPassword) {
                                  e.currentTarget.style.backgroundColor = color;
                                  e.currentTarget.style.color = "#fff";
                                }
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
                            ✏️ {t("offers.editing.title")}
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
                                onChange={e => {
                                  setEditCustomerName(e.target.value);
                                  // Ha manuálisan módosítjuk, töröljük a kiválasztott ügyfelet
                                  setSelectedEditCustomerId("");
                                }}
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
                                {t("offers.selectCustomer")}
                              </label>
                              <select
                                value={selectedEditCustomerId}
                                onChange={e => setSelectedEditCustomerId(e.target.value === "" ? "" : Number(e.target.value))}
                                onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
                                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                style={{ ...themeStyles.select, width: "100%", maxWidth: "200px", boxSizing: "border-box" }}
                              >
                                <option value="">{t("offers.selectCustomer")}</option>
                                {customers.map(customer => (
                                  <option key={customer.id} value={customer.id}>
                                    {customer.name} {customer.contact ? `(${customer.contact})` : ""}
                                  </option>
                                ))}
                              </select>
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
                                {t("offers.contact.label")}
                              </label>
                              <input
                                type="text"
                                placeholder={t("offers.contact.placeholder")}
                                value={editCustomerContact}
                                onChange={e => setEditCustomerContact(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                style={{ ...themeStyles.input, width: "100%", maxWidth: "200px", boxSizing: "border-box" }}
                              />
                            </div>
                        <div style={{ width: "240px", flexShrink: 0 }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "8px",
                              fontWeight: "600",
                              fontSize: "14px",
                              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                              whiteSpace: "nowrap",
                            }}
                          >
                            🖨️ {t("offers.printer")}
                          </label>
                          {printers.length > 0 ? (
                            <>
                              <select
                                value={editPrinterId != null ? editPrinterId : ""}
                                onChange={e => {
                                  const value = e.target.value;
                                  setEditPrinterId(value === "" ? null : Number(value));
                                }}
                                onFocus={e => Object.assign(e.target.style, themeStyles.selectFocus)}
                                onBlur={e => {
                                  e.target.style.borderColor = theme.colors.inputBorder;
                                  e.target.style.boxShadow = "none";
                                }}
                                style={{ ...themeStyles.select, width: "100%", maxWidth: "240px", boxSizing: "border-box" }}
                              >
                                <option value="">{t("offers.editPrinter.placeholder")}</option>
                                {printers.map(printer => (
                                  <option key={printer.id} value={printer.id}>
                                    {printer.name} ({printer.type})
                                  </option>
                                ))}
                              </select>
                              {selectedPrinterForEdit && (
                                <div style={{ marginTop: "6px", fontSize: "12px", color: theme.colors.textMuted }}>
                                  {selectedPrinterForEdit.type} · {selectedPrinterForEdit.power}W
                                </div>
                              )}
                            </>
                          ) : (
                            <div
                              style={{
                                padding: "10px 12px",
                                borderRadius: "8px",
                                border: `1px dashed ${theme.colors.border}`,
                                backgroundColor: theme.colors.surfaceHover,
                                fontSize: "12px",
                                color: theme.colors.textMuted,
                              }}
                            >
                              {t("offers.editPrinter.noPrinters")}
                            </div>
                          )}
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
                            {/* Nyomtatás esedékességi dátuma */}
                            <div style={{ width: "250px", flexShrink: 0 }}>
                              <label style={{ 
                                display: "block", 
                                marginBottom: "8px", 
                                fontWeight: "600", 
                                fontSize: "14px", 
                                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                                whiteSpace: "nowrap"
                              }}>
                                📅 {t("offers.printDueDate") || "Nyomtatás esedékességi dátuma"}
                              </label>
                              <input
                                type="date"
                                value={editPrintDueDate}
                                onChange={e => setEditPrintDueDate(e.target.value)}
                                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                                style={{ ...themeStyles.input, width: "100%", maxWidth: "250px", boxSizing: "border-box" }}
                              />
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
                            {editPrintDueDate && (
                              <p style={{ marginTop: "8px", fontSize: "12px", color: theme.colors.textMuted }}>
                                💡 {t("offers.printDueDateHint") || "Ez a dátum megjelenik a naptárban és jelzi az esedékes nyomtatásokat."}
                              </p>
                            )}
                          </div>
                          
                          {/* Filamentek szerkesztése */}
                          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${theme.colors.border}` }}>
                            <h5 style={{ marginTop: 0, marginBottom: "16px", fontSize: "16px", fontWeight: "600", color: theme.colors.text }}>
                              🧵 {t("offers.filaments")}
                            </h5>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                              {editFilaments.map((f, idx) => {
                                const optionIndex = findLibraryOptionIndex(f);
                                return (
                                  <div key={idx} style={{ padding: "16px", backgroundColor: theme.colors.surfaceHover, borderRadius: "8px", border: `1px solid ${theme.colors.border}` }}>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start", marginBottom: "12px" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 auto", minWidth: "220px" }}>
                                        <img
                                          src={getFilamentImageSrc(f)}
                                          alt={`${f.brand} ${f.type}`}
                                          style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "10px",
                                            border: `1px solid ${theme.colors.border}`,
                                            objectFit: "cover",
                                          }}
                                        />
                                        <div>
                                          <strong style={{ fontSize: "14px", color: theme.colors.text }}>
                                            {f.brand} {f.type}
                                          </strong>
                                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: theme.colors.textMuted, marginTop: "4px" }}>
                                            <span
                                              style={{
                                                width: "12px",
                                                height: "12px",
                                                borderRadius: "50%",
                                                backgroundColor: getFilamentColorHex(f),
                                                border: "1px solid rgba(0,0,0,0.15)",
                                              }}
                                            />
                                            <span>{f.color || getFilamentColorHex(f)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      {filamentOptions.length > 0 && (
                                        <div style={{ flex: "1 1 200px", minWidth: "200px", maxWidth: "260px" }}>
                                          <label
                                            style={{
                                              display: "block",
                                              marginBottom: "8px",
                                              fontWeight: "600",
                                              fontSize: "12px",
                                              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                                            }}
                                          >
                                            {t("offers.editFilament.selectLabel")}
                                          </label>
                                          <select
                                            value={optionIndex >= 0 ? String(optionIndex) : ""}
                                            onChange={e => {
                                              const value = e.target.value;
                                              if (value === "") return;
                                              replaceFilamentFromLibrary(idx, Number(value));
                                            }}
                                            onFocus={e => Object.assign(e.target.style, themeStyles.selectFocus)}
                                            onBlur={e => {
                                              e.target.style.borderColor = theme.colors.inputBorder;
                                              e.target.style.boxShadow = "none";
                                            }}
                                            style={{ ...themeStyles.select, width: "100%", maxWidth: "260px", boxSizing: "border-box" }}
                                          >
                                            <option value="">{t("offers.editFilament.libraryPlaceholder")}</option>
                                            {filamentOptions.map(option => (
                                              <option key={option.index} value={option.index}>
                                                {option.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      )}
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
                                            fontSize: "12px",
                                            alignSelf: "flex-start",
                                          }}
                                        >
                                          {t("common.delete")}
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
                            {filamentOptions.length > 0 && (
                              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", marginTop: "12px" }}>
                                <select
                                  value={selectedLibraryFilamentIndex === "" ? "" : String(selectedLibraryFilamentIndex)}
                                  onChange={e => {
                                    const value = e.target.value;
                                    setSelectedLibraryFilamentIndex(value === "" ? "" : Number(value));
                                  }}
                                  onFocus={e => Object.assign(e.target.style, themeStyles.selectFocus)}
                                  onBlur={e => {
                                    e.target.style.borderColor = theme.colors.inputBorder;
                                    e.target.style.boxShadow = "none";
                                  }}
                                  style={{ ...themeStyles.select, width: "220px" }}
                                >
                                  <option value="">{t("offers.editFilament.libraryPlaceholder")}</option>
                                  {filamentOptions.map(option => (
                                    <option key={option.index} value={option.index}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={addFilamentFromLibrary}
                                  disabled={selectedLibraryFilamentIndex === ""}
                                  style={{
                                    ...themeStyles.button,
                                    ...themeStyles.buttonPrimary,
                                    opacity: selectedLibraryFilamentIndex === "" ? 0.6 : 1,
                                    cursor: selectedLibraryFilamentIndex === "" ? "not-allowed" : "pointer",
                                  }}
                                >
                                  ➕ {t("offers.editFilament.add")}
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${theme.colors.border}` }}>
                            <Tooltip content={t("common.save")}>
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
                                💾 {t("common.save")}
                              </button>
                            </Tooltip>
                            <Tooltip content={t("common.cancel")}>
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
                                {t("common.cancel")}
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: theme.colors.surfaceHover, borderRadius: "8px" }}>
                            {selectedOffer.customerName ? (
                              <div style={{ marginBottom: "12px" }}>
                                <strong style={{ color: theme.colors.text }}>{t("offers.customerName")}:</strong> 
                                <span style={{ marginLeft: "8px", color: theme.colors.text }}>{selectedOffer.customerName}</span>
                              </div>
                            ) : selectedOffer.customerId ? (
                              <div style={{ marginBottom: "12px" }}>
                                <strong style={{ color: theme.colors.text }}>{t("offers.details.customerId") || "Ügyfél ID"}:</strong> 
                                <span style={{ marginLeft: "8px", color: theme.colors.text }}>{selectedOffer.customerId}</span>
                                <span style={{ marginLeft: "8px", fontSize: "11px", color: theme.colors.textMuted, fontStyle: "italic" }}>
                                  ({t("offers.details.customerEncrypted") || "Titkosított adatok"})
                                </span>
                              </div>
                            ) : null}
                            {selectedOffer.customerContact && (
                              <div style={{ marginBottom: "12px" }}>
                                <strong style={{ color: theme.colors.text }}>
                                  {t("offers.contact.label")}:
                                </strong>
                                <span style={{ marginLeft: "8px", color: theme.colors.text }}>{selectedOffer.customerContact}</span>
                              </div>
                            )}
                            {selectedOffer.description && (
                              <div style={{ marginBottom: "12px" }}>
                                <strong style={{ color: theme.colors.text }}>{t("offers.description")}:</strong> 
                                <span style={{ marginLeft: "8px", color: theme.colors.text, wordWrap: "break-word", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{getDisplayDescription(selectedOffer.description)}</span>
                              </div>
                            )}
                            <div style={{ marginBottom: "12px" }}>
                              <strong style={{ color: theme.colors.text }}>{t("offers.date")}:</strong> 
                              <span style={{ marginLeft: "8px", color: theme.colors.text }}>
                                {new Date(selectedOffer.date).toLocaleDateString(locale)}
                              </span>
                              {selectedOffer.currentVersion && selectedOffer.currentVersion > 1 && (
                                <span style={{ marginLeft: "12px", fontSize: "12px", color: theme.colors.textSecondary }}>
                                  ({t("offers.details.versionLabel")} {selectedOffer.currentVersion})
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
                                  const updatedOffers = offersWithHistory.map(o => 
                                    o.id === selectedOffer.id ? { ...o, profitPercentage: value } : o
                                  );
                                  setOffersWithHistory(updatedOffers);
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
                                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                    <img
                                      src={getFilamentImageSrc(f)}
                                      alt={`${f.brand} ${f.type}`}
                                      style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "10px",
                                        border: `1px solid ${theme.colors.border}`,
                                        objectFit: "cover",
                                      }}
                                    />
                                    <div style={{ flex: "1 1 auto" }}>
                                      <strong style={{ color: theme.colors.text }}>
                                        {f.brand} {f.type}
                                      </strong>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: theme.colors.textMuted, marginTop: "4px" }}>
                                        <span
                                          style={{
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            backgroundColor: getFilamentColorHex(f),
                                            border: "1px solid rgba(0,0,0,0.15)",
                                          }}
                                        />
                                        <span>{f.color || getFilamentColorHex(f)}</span>
                                      </div>
                                      <div style={{ fontSize: "13px", color: theme.colors.text, marginTop: "6px" }}>
                                        {f.usedGrams}g @ {convertCurrencyFromTo(f.pricePerKg, selectedOffer.currency || "EUR", settings.currency).toFixed(2)}{settings.currency === "HUF" ? "Ft" : settings.currency}/kg
                                      </div>
                                      {f.needsDrying && (
                                        <div style={{ marginTop: "6px", fontSize: "12px", color: theme.colors.textMuted }}>
                                          🌡️ {t("offers.details.drying")}: {f.dryingTime}h @ {f.dryingPower}W
                                        </div>
                                      )}
                                    </div>
                                  </div>
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
                                <span style={{ color: theme.colors.text }}>
                                  {t("calculator.revenue")} ({selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30}% {t("calculator.profit")}):
                                </span>
                                <strong style={{ color: theme.colors.success }}>
                                  {convertCurrencyFromTo(selectedOffer.costs.totalCost * (1 + (selectedOffer.profitPercentage !== undefined ? selectedOffer.profitPercentage : 30) / 100), selectedOffer.currency || "EUR", settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}
                                </strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${theme.colors.border}` }}>
                                <span style={{ fontSize: "14px", color: theme.colors.text }}>{t("calculator.profit")}:</span>
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
                                📜 {t("offers.pdf.section.history")} ({selectedOffer.history.length})
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
                                          {t("offers.pdf.history.version").replace("{version}", String(historyEntry.version))}
                                        </strong>
                                        <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.colors.textSecondary }}>
                                          {new Date(historyEntry.date).toLocaleDateString(locale)} {new Date(historyEntry.date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                      </div>
                                    </div>
                                    <div style={{ fontSize: "12px", color: theme.colors.textSecondary, marginTop: "8px" }}>
                                      {historyEntry.customerName && (
                                        <div style={{ marginBottom: "4px" }}>
                                          <strong>{t("offers.pdf.history.customer")}:</strong> {historyEntry.customerName}
                                        </div>
                                      )}
                                      {historyEntry.profitPercentage !== undefined && (
                                        <div style={{ marginBottom: "4px" }}>
                                          <strong>{t("offers.pdf.history.profit")}:</strong> {historyEntry.profitPercentage}%
                                        </div>
                                      )}
                                      <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${theme.colors.border}` }}>
                                        <strong>{t("offers.pdf.history.totalCost")}:</strong>{" "}
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
                              <h4
                                style={{
                                  margin: "0 0 12px 0",
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                                }}
                              >
                                📜 {t("offers.pdf.section.statusHistory")}
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
                                      {new Date(history.date).toLocaleString(locale)}
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
                  </div>
                </div>
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
            <h3
              id="status-change-title"
              style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px", fontWeight: 600, color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text }}
            >
              {t("offers.statusModal.title")}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: theme.colors.textMuted, lineHeight: 1.6 }}>
              {statusChangeOffer?.customerId 
                ? `🆔 ${statusChangeOffer.customerId}`
                : `${t("offers.label.quote")} #${statusChangeOffer?.id}`} →{" "}
              <strong style={{ color: getStatusColor(statusChangeTarget) }}>{getStatusLabel(statusChangeTarget)}</strong>
            </p>
            <label
              htmlFor="status-change-note"
              style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: 600, color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text }}
            >
              📝 {t("offers.statusModal.noteLabel")}
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
              placeholder={t("offers.statusModal.notePlaceholder")}
            />
            <div style={{ textAlign: "right", fontSize: "11px", marginBottom: "12px", color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted }}>
              {statusChangeNote.length}/280
            </div>

            {/* Készlet levonás opció completed státusznál */}
            {statusChangeTarget === "completed" && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: theme.colors.surfaceHover,
                  border: `1px solid ${theme.colors.border}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontSize: "12px",
                  color: theme.colors.text,
                }}
              >
                <input
                  id="deduct-on-complete"
                  type="checkbox"
                  checked={deductOnComplete}
                  onChange={(e) => setDeductOnComplete(e.target.checked)}
                  style={{ marginTop: "3px" }}
                />
                <label htmlFor="deduct-on-complete" style={{ cursor: "pointer" }}>
                  <strong>{t("filamentStock.title") || "Filament készlet"}</strong>
                  <br />
                  {t("offers.statusModal.deductOnComplete") ||
                    "Szeretnéd a végleges nyomtatás filament fogyását is levonni a készletből? (Az elfogadott állapotú teszt nyomtatás már levonta a megfelelő mennyiséget.)"}
                </label>
              </div>
            )}

            {/* Státusz előzmények rövid listája */}
            {statusChangeOffer?.statusHistory && statusChangeOffer.statusHistory.length > 0 && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: theme.colors.surfaceHover,
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: "11px",
                  color: theme.colors.textMuted,
                }}
              >
                <div style={{ marginBottom: "6px", fontWeight: 600, color: theme.colors.text }}>
                  {t("offers.pdf.section.statusHistory")}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "120px", overflowY: "auto" }}>
                  {statusChangeOffer.statusHistory.map((entry, idx) => (
                    <div key={`${entry.status}-${entry.date}-${idx}`} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: "6px",
                          backgroundColor: getStatusColor(entry.status) + "20",
                          color: getStatusColor(entry.status),
                          fontSize: "10px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {getStatusLabel(entry.status)}
                      </span>
                      <span>{new Date(entry.date).toLocaleString(locale)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => {
                  setStatusChangeOffer(null);
                  setStatusChangeTarget(null);
                  setStatusChangeNote("");
                  setDeductOnComplete(false);
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSecondary,
                  padding: "8px 16px",
                }}
              >
                {t("offers.statusModal.cancel")}
              </button>
              <button
                onClick={() =>
                  statusChangeOffer &&
                  changeOfferStatus(statusChangeOffer, statusChangeTarget, statusChangeNote, {
                    deductOnCompleted: deductOnComplete,
                  })
                }
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonPrimary,
                  padding: "8px 16px",
                }}
              >
                {t("offers.statusModal.save")}
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
              ✏️ {t("common.edit")}
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
              📋 {t("common.duplicate")}
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
              📄 {t("offers.exportPDF")}
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
              🗑️ {t("common.delete")}
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
      
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        onCancel={() => setBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title={t("offers.bulk.deleteConfirm.title")}
        message={t("offers.bulk.deleteConfirm.message").replace("{{count}}", selectedOfferIds.size.toString())}
        theme={theme}
      />

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
      
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        onCancel={() => setBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title={t("offers.bulk.deleteConfirm.title")}
        message={t("offers.bulk.deleteConfirm.message").replace("{{count}}", selectedOfferIds.size.toString())}
        theme={theme}
      />
    </div>
  );
};

