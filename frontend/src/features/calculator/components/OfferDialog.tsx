/**
 * OfferDialog Component
 * Árajánlat mentés dialógus komponens a Calculator feature-hez
 */

import React, { useState, useEffect } from "react";
import type { Printer, Filament, Settings, Offer, Customer } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";
import { convertCurrency } from "../../../utils/currency";
import { validateProfitPercentage } from "../../../utils/validation";
import { sendNativeNotification } from "../../../utils/platformFeatures";
import { calculatePrintTimeHours } from "../utils/calculations";
import type { CalculationResult, SelectedFilament } from "../types";

interface OfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: Offer) => void | Promise<void>;
  customers: Customer[];
  selectedPrinter: Printer | null;
  selectedFilaments: SelectedFilament[];
  calculations: CalculationResult | null;
  printTimeHours: number;
  printTimeMinutes: number;
  printTimeSeconds: number;
  filaments: Filament[];
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  onValidationError: (message: string) => void;
  onSuccess: (message: string) => void;
}

/**
 * Offer dialog komponens
 */
export const OfferDialog: React.FC<OfferDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
  selectedPrinter,
  selectedFilaments,
  calculations,
  printTimeHours,
  printTimeMinutes,
  printTimeSeconds,
  filaments,
  settings,
  theme,
  themeStyles,
  onValidationError,
  onSuccess,
}) => {
  const t = useTranslation(settings.language);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [offerCustomerName, setOfferCustomerName] = useState("");
  const [offerCustomerContact, setOfferCustomerContact] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerProfitPercentage, setOfferProfitPercentage] = useState<number>(30);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCustomerId("");
      setOfferCustomerName("");
      setOfferCustomerContact("");
      setOfferDescription("");
      setOfferProfitPercentage(30);
    }
  }, [isOpen]);

  // Ügyfél kiválasztás kezelése
  useEffect(() => {
    if (selectedCustomerId !== "" && selectedCustomerId !== null) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        setOfferCustomerName(customer.name);
        setOfferCustomerContact(customer.contact || "");
      }
    }
  }, [selectedCustomerId, customers]);

  const handleCancel = () => {
    setSelectedCustomerId("");
    setOfferCustomerName("");
    setOfferCustomerContact("");
    setOfferDescription("");
    setOfferProfitPercentage(30);
    onClose();
  };

  const handleSave = async () => {
    if (!offerCustomerName.trim()) {
      onValidationError(`${t("common.error")}: ${t("calculator.toast.customerNameRequired")}`);
      return;
    }
    
    if (!selectedPrinter || !calculations) return;
  
    const offerFilaments = selectedFilaments.map(sf => {
      const filament = filaments[sf.filamentIndex];
      // Konvertáljuk a filament árát az árajánlat pénznemére (filament ár EUR-ban van tárolva)
      const pricePerKgInOfferCurrency = convertCurrency(filament.pricePerKg, settings.currency);
      return {
        brand: filament.brand,
        type: filament.type,
        color: filament.color,
        colorHex: filament.colorHex,
        imageBase64: filament.imageBase64,
        usedGrams: sf.usedGrams,
        pricePerKg: pricePerKgInOfferCurrency,
        needsDrying: sf.needsDrying || false,
        dryingTime: sf.dryingTime || 0,
        dryingPower: sf.dryingPower || 0,
      };
    });

    const createdAt = new Date().toISOString();
    const initialStatusNote = t("calculator.offer.initialStatus");

    const offer: Offer = {
      id: Date.now(),
      date: createdAt,
      printerName: selectedPrinter.name,
      printerType: selectedPrinter.type,
      printerPower: selectedPrinter.power,
      printTimeHours,
      printTimeMinutes,
      printTimeSeconds,
      totalPrintTimeHours: calculatePrintTimeHours(printTimeHours, printTimeMinutes, printTimeSeconds),
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
      status: "draft",
      statusUpdatedAt: createdAt,
      statusHistory: [{
        status: "draft",
        date: createdAt,
        note: initialStatusNote
      }]
    };

    console.log("💾 Árajánlat mentése...", { 
      offerId: offer.id, 
      customerName: offer.customerName,
      totalCost: offer.costs.totalCost,
      currency: offer.currency 
    });
    
    await onSave(offer);
    
    console.log("✅ Árajánlat sikeresen mentve", { offerId: offer.id });
    onSuccess(t("common.offerSaved"));
    
    // Natív értesítés küldése (ha engedélyezve van)
    if (settings.notificationEnabled !== false) {
      try {
        await sendNativeNotification(
          t("common.offerSaved"),
          offer.customerName || t("offers.customerName")
        );
      } catch (error) {
        console.log("Értesítés küldése sikertelen:", error);
      }
    }
    
    handleCancel();
  };

  if (!isOpen) return null;

  return (
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
      onClick={handleCancel}
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
        <h3 style={{ 
          margin: "0 0 20px 0", 
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
          fontSize: "20px", 
          fontWeight: "600" 
        }}>
          {t("calculator.saveAsOffer")}
        </h3>
        
        <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
          {/* Ügyfél kiválasztó */}
          {customers.length > 0 && (
            <div style={{ width: "180px", flexShrink: 0 }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                whiteSpace: "nowrap" 
              }}>
                {t("customers.selectCustomer")}
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : Number(e.target.value);
                  setSelectedCustomerId(value);
                  if (value === "") {
                    setOfferCustomerName("");
                    setOfferCustomerContact("");
                  }
                }}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.select, width: "100%" }}
              >
                <option value="">{t("customers.selectCustomerPlaceholder")}</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}{customer.company ? ` (${customer.company})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div style={{ width: "180px", flexShrink: 0 }}>
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
              value={offerCustomerName}
              onChange={e => {
                setOfferCustomerName(e.target.value);
                // Ha manuálisan módosítják, töröljük a kiválasztott ügyfelet
                if (selectedCustomerId !== "") {
                  setSelectedCustomerId("");
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
            />
          </div>
          
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text, whiteSpace: "nowrap" }}>
              {t("calculator.offer.contactLabel")}
            </label>
            <input
              type="text"
              placeholder={t("calculator.offer.contactPlaceholder")}
              value={offerCustomerContact}
              onChange={e => {
                setOfferCustomerContact(e.target.value);
                // Ha manuálisan módosítják, töröljük a kiválasztott ügyfelet
                if (selectedCustomerId !== "") {
                  setSelectedCustomerId("");
                }
              }}
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
                const validation = validateProfitPercentage(val, settings.language);
                if (validation.isValid) {
                  setOfferProfitPercentage(val);
                } else if (validation.errorMessage) {
                  onValidationError(validation.errorMessage);
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
          <Tooltip content={t("common.cancel")}>
            <button
              onClick={handleCancel}
              style={{
                ...themeStyles.button,
                backgroundColor: theme.colors.secondary,
                color: "#fff",
                padding: "10px 20px",
              }}
            >
              {t("common.cancel")}
            </button>
          </Tooltip>
          <Tooltip content={t("calculator.tooltip.saveOffer")}>
            <button
              onClick={handleSave}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonSuccess,
                padding: "10px 20px",
              }}
            >
              {t("offers.save")}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

