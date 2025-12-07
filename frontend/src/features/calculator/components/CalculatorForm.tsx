/**
 * CalculatorForm Component
 * Fő form komponens a Calculator feature-hez - tartalmazza a template kezelés UI-t és a fő form layout-ot
 * 
 * Ez a komponens tartalmazza:
 * - Template kezelés UI (lista, mentés dialog)
 * - Fő form layout (PrinterSelector, PrintTimeInput, FilamentSelector)
 */

import React, { useState } from "react";
import type { Printer, Filament, Settings, CalculationTemplate } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";
import { ConfirmDialog } from "../../../shared";
import { PrinterSelector, PrintTimeInput, FilamentSelector } from "./index";
import type { SelectedFilament } from "../types";

interface CalculatorFormProps {
  printers: Printer[];
  filaments: Filament[];
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  
  // Printer state
  selectedPrinterId: number | "";
  onPrinterChange: (printerId: number | "") => void;
  selectedPrinter: Printer | null;
  
  // Print time state
  printTimeHours: number;
  printTimeMinutes: number;
  printTimeSeconds: number;
  onPrintTimeHoursChange: (hours: number) => void;
  onPrintTimeMinutesChange: (minutes: number) => void;
  onPrintTimeSecondsChange: (seconds: number) => void;
  
  // Filament selection state
  selectedFilaments: SelectedFilament[];
  maxFilaments: number;
  onAddFilament: () => void;
  onRemoveFilament: (index: number) => void;
  onUpdateFilament: (index: number, field: keyof SelectedFilament, value: any) => void;
  onResetFilaments: () => void;
  
  // Template management
  templates: CalculationTemplate[];
  onLoadTemplate: (template: CalculationTemplate) => void;
  onSaveTemplate: (name: string, description?: string) => Promise<boolean>;
  onDeleteTemplate: (id: number) => Promise<boolean>;
  
  // Template UI state (from parent)
  showTemplateList: boolean;
  onToggleTemplateList: () => void;
  showTemplateDialog: boolean;
  onCloseTemplateDialog: () => void;
  
  // Callbacks
  onValidationError: (message: string) => void;
  onSuccess: (message: string) => void;
}

/**
 * Calculator form komponens
 */
export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  printers,
  filaments,
  settings,
  theme,
  themeStyles,
  selectedPrinterId,
  onPrinterChange,
  selectedPrinter,
  printTimeHours,
  printTimeMinutes,
  printTimeSeconds,
  onPrintTimeHoursChange,
  onPrintTimeMinutesChange,
  onPrintTimeSecondsChange,
  selectedFilaments,
  maxFilaments,
  onAddFilament,
  onRemoveFilament,
  onUpdateFilament,
  onResetFilaments,
  templates,
  onLoadTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  showTemplateList,
  onToggleTemplateList,
  showTemplateDialog,
  onCloseTemplateDialog,
  onValidationError,
  onSuccess,
}) => {
  const t = useTranslation(settings.language);
  
  // Local state for template dialog
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [deleteTemplateId, setDeleteTemplateId] = useState<number | null>(null);

  // Template mentése
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      onValidationError(t("calculator.toast.templateNameRequired"));
      return;
    }

    if (!selectedPrinterId || selectedFilaments.length === 0) {
      onValidationError(t("calculator.toast.templateSelectionRequired"));
      return;
    }

    const success = await onSaveTemplate(templateName.trim(), templateDescription.trim() || undefined);

    if (success) {
      onCloseTemplateDialog();
      setTemplateName("");
      setTemplateDescription("");
      onSuccess(t("calculator.toast.templateSaveSuccess"));
    } else {
      onValidationError(t("calculator.toast.templateSaveError"));
    }
  };

  // Template törlése
  const handleDeleteTemplate = async () => {
    if (deleteTemplateId === null) return;
    const success = await onDeleteTemplate(deleteTemplateId);
    if (success) {
      setDeleteTemplateId(null);
      onSuccess(t("calculator.toast.templateDeleteSuccess"));
    } else {
      onValidationError(t("calculator.toast.templateDeleteError"));
    }
  };

  return (
    <div>
      {/* Template lista */}
      {showTemplateList && templates.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px", maxWidth: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: "18px", 
              fontWeight: "600", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
            }}>
              📋 {t("calculator.templates")}
            </h3>
            <button
              onClick={onToggleTemplateList}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {templates.map(template => {
              const printer = printers.find(p => p.id === template.printerId);
              return (
                <div
                  key={template.id}
                  style={{
                    padding: "16px",
                    backgroundColor: theme.colors.surfaceHover,
                    borderRadius: "8px",
                    border: `1px solid ${theme.colors.border}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ 
                        fontSize: "16px", 
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                      }}>{template.name}</strong>
                      {template.description && (
                        <p style={{ 
                          margin: "4px 0 0 0", 
                          fontSize: "12px", 
                          color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textSecondary 
                        }}>
                          {template.description}
                        </p>
                      )}
                      <p style={{ 
                        margin: "8px 0 0 0", 
                        fontSize: "12px", 
                        color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textSecondary 
                      }}>
                        {printer ? `${printer.name} (${printer.type})` : t("calculator.templates.printerMissing")} • {template.selectedFilaments.length} {t("calculator.templates.filamentUnit")} • {template.printTimeHours}h {template.printTimeMinutes}m {template.printTimeSeconds}s
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Tooltip content={t("calculator.tooltip.loadTemplate")}>
                        <button
                          onClick={() => {
                            onLoadTemplate(template);
                            onToggleTemplateList();
                          }}
                          disabled={!printer}
                          style={{
                            ...themeStyles.button,
                            ...themeStyles.buttonPrimary,
                            padding: "6px 12px",
                            fontSize: "12px",
                            cursor: printer ? "pointer" : "not-allowed",
                            opacity: printer ? 1 : 0.5
                          }}
                          aria-label={t("calculator.tooltip.loadTemplate")}
                        >
                          📥
                        </button>
                      </Tooltip>
                      <Tooltip content={t("common.delete")}>
                        <button
                          onClick={() => setDeleteTemplateId(template.id)}
                          style={{
                            ...themeStyles.button,
                            ...themeStyles.buttonDanger,
                            padding: "6px 12px",
                            fontSize: "12px",
                            cursor: "pointer"
                          }}
                          aria-label={t("common.delete")}
                        >
                          🗑️
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Template mentés dialógus */}
      {showTemplateDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}
        onClick={onCloseTemplateDialog}
        >
          <div style={{
            ...themeStyles.card,
            maxWidth: "500px",
            width: "90%",
            maxHeight: "90vh",
            overflow: "auto"
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: "20px", 
              fontSize: "20px", 
              fontWeight: "600", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
            }}>
              💾 {t("calculator.dialog.saveTemplateTitle")}
            </h3>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
              }}>
                {t("calculator.dialog.nameLabel")}
              </label>
              <input
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder={t("calculator.dialog.namePlaceholder")}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                marginBottom: "8px", 
                fontWeight: "600", 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
              }}>
                {t("calculator.dialog.descriptionLabel")}
              </label>
              <textarea
                value={templateDescription}
                onChange={e => setTemplateDescription(e.target.value)}
                placeholder={t("calculator.dialog.descriptionPlaceholder")}
                rows={3}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  onCloseTemplateDialog();
                  setTemplateName("");
                  setTemplateDescription("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onCloseTemplateDialog();
                    setTemplateName("");
                    setTemplateDescription("");
                  }
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSecondary,
                  padding: "10px 20px"
                }}
                aria-label={t("common.cancel")}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSaveTemplate}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSaveTemplate();
                  }
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonPrimary,
                  padding: "10px 20px"
                }}
                aria-label={t("calculator.tooltip.saveTemplate")}
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fő form layout */}
      <div style={{ ...themeStyles.card, marginBottom: "24px", maxWidth: "100%", boxSizing: "border-box", overflow: "hidden" }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: "20px", 
          fontSize: "20px", 
          fontWeight: "600", 
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
        }}>
          ⚙️ {t("calculator.parameters")}
        </h3>
        
        <PrinterSelector
          printers={printers}
          selectedPrinterId={selectedPrinterId}
          onPrinterChange={(printerId) => {
            onPrinterChange(printerId);
            onResetFilaments(); // Reset filaments when printer changes
          }}
          selectedPrinter={selectedPrinter}
          maxFilaments={maxFilaments}
          theme={theme}
          themeStyles={themeStyles}
          language={settings.language}
        />

        <PrintTimeInput
          hours={printTimeHours}
          minutes={printTimeMinutes}
          seconds={printTimeSeconds}
          onHoursChange={onPrintTimeHoursChange}
          onMinutesChange={onPrintTimeMinutesChange}
          onSecondsChange={onPrintTimeSecondsChange}
          theme={theme}
          themeStyles={themeStyles}
          settings={settings}
          onValidationError={onValidationError}
        />

        {/* Filamentek kiválasztása */}
        <FilamentSelector
          filaments={filaments}
          selectedFilaments={selectedFilaments}
          maxFilaments={maxFilaments}
          onAddFilament={onAddFilament}
          onRemoveFilament={onRemoveFilament}
          onUpdateFilament={onUpdateFilament}
          theme={theme}
          themeStyles={themeStyles}
          settings={settings}
          onValidationError={onValidationError}
        />
      </div>

      {/* Confirm dialog a törléshez */}
      <ConfirmDialog
        isOpen={deleteTemplateId !== null}
        title={t("calculator.confirmDelete.title")}
        message={t("calculator.confirmDelete.message")}
        theme={theme}
        onConfirm={handleDeleteTemplate}
        onCancel={() => setDeleteTemplateId(null)}
        confirmText={t("common.yes")}
        cancelText={t("common.cancel")}
        type="danger"
      />
    </div>
  );
};
