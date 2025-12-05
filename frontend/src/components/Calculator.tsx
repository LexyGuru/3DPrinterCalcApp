import React, { useState, useMemo, useEffect, useCallback } from "react";
import type { Printer, Filament, Settings, Offer, CalculationTemplate } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { useToast } from "./Toast";
import { Tooltip } from "./Tooltip";
import { SlicerImportModal } from "./SlicerImportModal";
// Calculator feature modul importok
import { useCalculator, useFilamentSelection, useCalculationTemplates } from "../features/calculator";
import { CalculationResults, OfferDialog, CalculatorForm } from "../features/calculator";
import type { CalculationResult } from "../features/calculator";

// SelectedFilament típus most a calculator feature modulból jön

interface Props {
  printers: Printer[];
  filaments: Filament[];
  customers: import("../types").Customer[];
  settings: Settings;
  onSaveOffer?: (offer: any) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const Calculator: React.FC<Props> = ({ printers, filaments, customers, settings, onSaveOffer, theme, themeStyles }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [selectedPrinterId, setSelectedPrinterId] = useState<number | "">("");
  const [printTimeHours, setPrintTimeHours] = useState<number>(0);
  const [printTimeMinutes, setPrintTimeMinutes] = useState<number>(0);
  const [printTimeSeconds, setPrintTimeSeconds] = useState<number>(0);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [showSlicerImportModal, setShowSlicerImportModal] = useState(false);


  // Selected printer
  const selectedPrinter = useMemo(() => {
    if (selectedPrinterId === "") return null;
    return printers.find(p => p.id === selectedPrinterId) || null;
  }, [printers, selectedPrinterId]);

  // Filament selection hook
  const {
    selectedFilaments,
    maxFilaments,
    addFilament,
    removeFilament,
    updateFilament,
    resetFilaments,
    setFilaments,
  } = useFilamentSelection({ printer: selectedPrinter });

  // Reset filaments when printer changes
  useEffect(() => {
    resetFilaments();
  }, [selectedPrinterId, resetFilaments]);

  // Template load handler
  const handleTemplateLoad = useCallback((template: CalculationTemplate) => {
    setSelectedPrinterId(template.printerId);
    setFilaments(template.selectedFilaments.map(sf => ({
      filamentIndex: sf.filamentIndex,
      usedGrams: sf.usedGrams,
      needsDrying: sf.needsDrying || false,
      dryingTime: sf.dryingTime || 0,
      dryingPower: sf.dryingPower || 0,
    })));
    setPrintTimeHours(template.printTimeHours);
    setPrintTimeMinutes(template.printTimeMinutes);
    setPrintTimeSeconds(template.printTimeSeconds);
    setShowTemplateList(false);
    showToast(t("calculator.toast.templateLoadSuccess"), "success");
  }, [setFilaments, showToast, t]);

  // Calculator hook - számítások
  const calculations: CalculationResult | null = useCalculator({
    printer: selectedPrinter,
    selectedFilaments,
    printTimeHours,
    printTimeMinutes,
    printTimeSeconds,
    filaments,
    settings,
  });

  // Template management hook
  const {
    templates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
  } = useCalculationTemplates({
    printers,
    filaments,
    onTemplateLoad: handleTemplateLoad,
  });

  // Template mentése - wrapper a CalculatorForm számára
  const handleSaveTemplateWrapper = async (name: string, description?: string): Promise<boolean> => {
    if (!selectedPrinterId || selectedFilaments.length === 0) {
      return false;
    }

    return await saveTemplate({
      name,
      description,
      printerId: selectedPrinterId as number,
      selectedFilaments,
      printTimeHours,
      printTimeMinutes,
      printTimeSeconds,
    });
  };

  // Template betöltése
  const handleLoadTemplate = (template: CalculationTemplate) => {
    const success = loadTemplate(template);
    if (!success) {
      // A hook már ellenőrzi és a callback-ben van a toast, de ha nincs callback, akkor itt kell
      const printer = printers.find(p => p.id === template.printerId);
      if (!printer) {
        showToast(t("calculator.toast.templatePrinterMissing"), "error");
      } else {
        showToast(t("calculator.toast.templateFilamentMissing"), "error");
      }
    }
  };

  // Template törlése - wrapper a CalculatorForm számára
  const handleDeleteTemplateWrapper = async (id: number): Promise<boolean> => {
    return await deleteTemplate(id);
  };

  const handleCreateOfferFromSlicer = (offer: Offer) => {
    if (onSaveOffer) {
      onSaveOffer(offer);
    } else {
      showToast(t("calculator.toast.openFullApp"), "error");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h2 style={themeStyles.pageTitle}>{t("calculator.title")}</h2>
          <p style={themeStyles.pageSubtitle}>{t("calculator.subtitle")}</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <Tooltip content={t("calculator.tooltip.loadTemplate")}>
            <button
              onClick={() => setShowTemplateList(!showTemplateList)}
              disabled={templates.length === 0}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                padding: "8px 16px",
                fontSize: "12px",
                cursor: templates.length === 0 ? "not-allowed" : "pointer",
                opacity: templates.length === 0 ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (templates.length > 0) {
                  Object.assign(e.currentTarget.style, themeStyles.buttonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (templates.length > 0) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = themeStyles.buttonPrimary.boxShadow;
                }
              }}
              aria-label={t("calculator.tooltip.loadTemplate")}
            >
              📋 {t("calculator.templates")} ({templates.length})
            </button>
          </Tooltip>
          <Tooltip content={t("calculator.tooltip.saveTemplate")}>
            <button
              onClick={() => setShowTemplateDialog(true)}
              disabled={!selectedPrinterId || selectedFilaments.length === 0}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                padding: "8px 16px",
                fontSize: "12px",
                cursor: (!selectedPrinterId || selectedFilaments.length === 0) ? "not-allowed" : "pointer",
                opacity: (!selectedPrinterId || selectedFilaments.length === 0) ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (selectedPrinterId && selectedFilaments.length > 0) {
                  Object.assign(e.currentTarget.style, themeStyles.buttonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPrinterId && selectedFilaments.length > 0) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = themeStyles.buttonPrimary.boxShadow;
                }
              }}
              aria-label={t("calculator.tooltip.saveTemplate")}
            >
              💾 {t("calculator.tooltip.saveTemplate")}
            </button>
          </Tooltip>
          <Tooltip content={t("calculator.tooltip.importGcode")}>
            <button
              onClick={() => setShowSlicerImportModal(true)}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                padding: "8px 16px",
                fontSize: "12px",
              }}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, themeStyles.buttonHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = themeStyles.buttonPrimary.boxShadow;
              }}
              aria-label={t("calculator.tooltip.importGcode")}
            >
              🧾 {t("calculator.gcodeImport")}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* CalculatorForm komponens - tartalmazza a template kezelés UI-t és a fő form layout-ot */}
      <CalculatorForm
        printers={printers}
        filaments={filaments}
        settings={settings}
        theme={theme}
        themeStyles={themeStyles}
        selectedPrinterId={selectedPrinterId}
        onPrinterChange={setSelectedPrinterId}
        selectedPrinter={selectedPrinter}
        printTimeHours={printTimeHours}
        printTimeMinutes={printTimeMinutes}
        printTimeSeconds={printTimeSeconds}
        onPrintTimeHoursChange={setPrintTimeHours}
        onPrintTimeMinutesChange={setPrintTimeMinutes}
        onPrintTimeSecondsChange={setPrintTimeSeconds}
        selectedFilaments={selectedFilaments}
        maxFilaments={maxFilaments}
        onAddFilament={addFilament}
        onRemoveFilament={removeFilament}
        onUpdateFilament={updateFilament}
        onResetFilaments={resetFilaments}
        templates={templates}
        onLoadTemplate={handleLoadTemplate}
        onSaveTemplate={handleSaveTemplateWrapper}
        onDeleteTemplate={handleDeleteTemplateWrapper}
        showTemplateList={showTemplateList}
        onToggleTemplateList={() => setShowTemplateList(!showTemplateList)}
        showTemplateDialog={showTemplateDialog}
        onCloseTemplateDialog={() => setShowTemplateDialog(false)}
        onValidationError={(message) => showToast(message, "error")}
        onSuccess={(message) => showToast(message, "success")}
      />

      <CalculationResults
        calculations={calculations}
        selectedFilaments={selectedFilaments}
        hasSelectedPrinter={!!selectedPrinter}
        currency={settings.currency}
        theme={theme}
        themeStyles={themeStyles}
        settings={settings}
        onSaveOffer={onSaveOffer && selectedPrinter ? () => setShowOfferDialog(true) : undefined}
      />

      {/* Árajánlat mentése dialog */}
      <OfferDialog
        isOpen={showOfferDialog}
        onClose={() => setShowOfferDialog(false)}
        onSave={onSaveOffer!}
        customers={customers}
        selectedPrinter={selectedPrinter}
        selectedFilaments={selectedFilaments}
        calculations={calculations}
        printTimeHours={printTimeHours}
        printTimeMinutes={printTimeMinutes}
        printTimeSeconds={printTimeSeconds}
        filaments={filaments}
        settings={settings}
        theme={theme}
        themeStyles={themeStyles}
        onValidationError={(message) => showToast(message, "error")}
        onSuccess={(message) => showToast(message, "success")}
      />

      <SlicerImportModal
        isOpen={showSlicerImportModal}
        onClose={() => setShowSlicerImportModal(false)}
        settings={settings}
        theme={theme}
        themeStyles={themeStyles}
        onCreateOffer={handleCreateOfferFromSlicer}
      />

    </div>
  );
};
