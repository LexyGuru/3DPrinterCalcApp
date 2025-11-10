import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useToast } from "./Toast";
import { parseSlicerFile, type SlicerJobData, SlicerParseError } from "../utils/slicerImport";
import type { Settings, Offer, ColorMode } from "../types";
import type { Theme } from "../utils/themes";

interface SlicerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
  onCreateOffer?: (offer: Offer) => void;
}

export const SlicerImportModal: React.FC<SlicerImportModalProps> = ({
  isOpen,
  onClose,
  settings,
  theme,
  themeStyles,
  onCreateOffer,
}) => {
  const { showToast } = useToast();
  const localize = (hu: string, de: string, en: string) =>
    settings.language === "hu" ? hu : settings.language === "de" ? de : en;
  const [lastImport, setLastImport] = useState<SlicerJobData | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const sumNumbers = (values?: number[]): number | undefined =>
    values && values.length ? values.reduce((acc: number, value: number) => acc + value, 0) : undefined;

  const handleSlicerImport = async () => {
    try {
      setIsImporting(true);
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Slicer export",
            extensions: ["gcode", "json"],
          },
        ],
      });

      if (!selected) {
        return;
      }

      const filePath = Array.isArray(selected) ? selected[0] : selected;
      if (!filePath || typeof filePath !== "string") {
        showToast(
          localize("Érvénytelen fájl kiválasztás.", "Ungültige Dateiauswahl.", "Invalid file selection."),
          "error"
        );
        return;
      }

      if (filePath.toLowerCase().endsWith(".3mf")) {
        showToast(
          localize(
            "A 3MF projektfájlok importja még fejlesztés alatt áll. Exportálj G-code vagy JSON meta fájlt a slicerből.",
            "3MF-Projektdateien werden noch nicht unterstützt. Exportiere bitte eine G-code- oder JSON-Datei aus dem Slicer.",
            "3MF project files are not supported yet. Please export a G-code or JSON meta file from the slicer."
          ),
          "error"
        );
        return;
      }

      const fileContent = await readTextFile(filePath);
      const job = await parseSlicerFile(filePath, fileContent);
      setLastImport(job);

      showToast(localize("Slicer adatok importálva.", "Slicer-Daten importiert.", "Slicer data imported."), "success");
    } catch (error) {
      if (error instanceof SlicerParseError) {
        showToast(
          localize(
            `Sikertelen slicer import: ${error.message}`,
            `Slicer-Import fehlgeschlagen: ${error.message}`,
            `Could not import slicer metadata: ${error.message}`
          ),
          "error"
        );
      } else {
        console.error("[SlicerImportModal] unknown error", error);
        showToast(
          localize(
            "Ismeretlen hiba történt a slicer import során.",
            "Beim Slicer-Import ist ein unbekannter Fehler aufgetreten.",
            "An unknown error occurred while importing slicer data."
          ),
          "error"
        );
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleCreateOfferDraft = () => {
    if (!lastImport) {
      showToast(
        localize(
          "Előbb importálj slicer adatokat!",
          "Bitte importiere zuerst Slicer-Daten!",
          "Import slicer data first!"
        ),
        "error"
      );
      return;
    }

    if (!onCreateOffer) {
      showToast(
        localize(
          "Az árajánlat mentéséhez nyisd meg a kalkulátort az alkalmazás fő nézetéből.",
          "Zum Speichern des Angebots bitte die Kalkulationsansicht verwenden.",
          "Open the calculator view to save quotes."
        ),
        "error"
      );
      return;
    }

    try {
      const seconds = lastImport.estimatedPrintTimeSec ?? 0;
      const printTimeHour = Math.floor(seconds / 3600);
      const printTimeMin = Math.floor((seconds % 3600) / 60);
      const printTimeSec = seconds % 60;
      const totalPrintTimeHours = seconds / 3600;

      const fileName = lastImport.filePath.split(/[\\/]/).pop() ?? lastImport.filePath;

      const gramsSource =
        lastImport.filamentPerExtruderGrams && lastImport.filamentPerExtruderGrams.length > 0
          ? [...lastImport.filamentPerExtruderGrams]
          : lastImport.totalHeaderGrams && lastImport.totalHeaderGrams.length > 0
          ? [...lastImport.totalHeaderGrams]
          : lastImport.filamentUsedGrams !== undefined
          ? [lastImport.filamentUsedGrams]
          : [];

      if (gramsSource.length === 0) {
        gramsSource.push(0);
      }

      const multiExtruder = gramsSource.length > 1;

      const offerFilaments: Offer["filaments"] = gramsSource.map((grams, index) => {
        const extruderId = lastImport.extrudersUsed?.[index];
        const extruderLabel = extruderId !== undefined
          ? `E${extruderId}`
          : `${localize("Extruder", "Extruder", "Extruder")} ${index + 1}`;
        const meters = lastImport.filamentPerExtruderMeters?.[index] ?? (index === 0 ? lastImport.filamentUsedMeters : undefined);
        const millimeters = lastImport.filamentPerExtruderMillimeters?.[index] ?? (index === 0 ? lastImport.filamentUsedMillimeters : undefined);
        const amountSummary = [
          `${(grams ?? 0).toFixed(2)} g`,
          meters !== undefined ? `${meters.toFixed(2)} m` : undefined,
          millimeters !== undefined && meters === undefined ? `${millimeters.toFixed(0)} mm` : undefined,
        ]
          .filter(Boolean)
          .join(" • ");

        const hintPrefix = multiExtruder
          ? `${extruderLabel} – ${fileName}`
          : `${localize("Importált adat", "Importierte Daten", "Imported data")} – ${fileName}`;

        return {
          brand: "",
          type: "",
          color: "",
          usedGrams: grams ?? 0,
          pricePerKg: 0,
          multiColorHint: amountSummary ? `${hintPrefix} (${amountSummary})` : hintPrefix,
          colorMode: multiExtruder ? ("multicolor" as ColorMode) : undefined,
        };
      });

      const createdAt = new Date().toISOString();
      const statusNote = localize(
        "Slicer importból létrehozva",
        "Über Slicer-Import erstellt",
        "Created from slicer import"
      );

      const totalWeight = sumNumbers(lastImport.totalHeaderGrams) ?? sumNumbers(gramsSource) ?? 0;
      const totalLengthMeters = (() => {
        const totalMm =
          sumNumbers(lastImport.totalHeaderMillimeters) ??
          sumNumbers(lastImport.filamentPerExtruderMillimeters);
        if (totalMm !== undefined) {
          return totalMm / 1000;
        }
        return lastImport.filamentUsedMeters ?? 0;
      })();

      const newOffer: Offer = {
        id: Date.now(),
        date: createdAt,
        printerName: localize("Slicer import", "Slicer-Import", "Slicer import"),
        printerType: localize("Ismeretlen", "Unbekannt", "Unknown"),
        printerPower: 0,
        printTimeHours: printTimeHour,
        printTimeMinutes: printTimeMin,
        printTimeSeconds: printTimeSec,
        totalPrintTimeHours,
        filaments: offerFilaments,
        costs: {
          filamentCost: 0,
          electricityCost: 0,
          dryingCost: 0,
          usageCost: 0,
          totalCost: 0,
        },
        currency: settings.currency,
        profitPercentage: 30,
        description: `${localize("Importált fájl", "Importierte Datei", "Imported file")}: ${fileName}`,
        status: "draft",
        statusUpdatedAt: createdAt,
        statusHistory: [
          {
            status: "draft",
            date: createdAt,
            note: statusNote,
          },
        ],
        totalFilamentWeightSummary: {
          perExtruder: lastImport.totalHeaderGrams ?? gramsSource,
          total: totalWeight,
        },
        totalFilamentLengthSummary: {
          perExtruderMm: lastImport.totalHeaderMillimeters ?? lastImport.filamentPerExtruderMillimeters,
          totalMeters: totalLengthMeters,
        },
        totalFilamentVolumeCm3: lastImport.totalVolumeCm3,
      };

      onCreateOffer(newOffer);
      showToast(
        localize(
          "Árajánlat piszkozat létrehozva. Nyisd meg az Árajánlatok menüt a részletekhez.",
          "Angebotsentwurf erstellt. Öffne den Angebotsbereich für Details.",
          "Quote draft created. Open the Offers section to review it."
        ),
        "success"
      );
      onClose();
      setLastImport(null);
    } catch (error) {
      console.error("[SlicerImportModal] failed to create offer draft", error);
      showToast(
        localize(
          "Nem sikerült létrehozni az árajánlat piszkozatot.",
          "Entwurf konnte nicht erstellt werden.",
          "Failed to create quote draft."
        ),
        "error"
      );
    }
  };

  const renderSummary = () => {
    if (!lastImport) {
      return (
        <p style={{ margin: 0, fontSize: "13px", color: theme.colors.textMuted }}>
          {localize("Még nincs slicer adat importálva.", "Es wurden noch keine Slicer-Daten importiert.", "No slicer data has been imported yet.")}
        </p>
      );
    }

    const baseCardStyle: React.CSSProperties = {
      borderRadius: "12px",
      padding: "12px 16px",
      backgroundColor: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: `0 2px 8px ${theme.colors.shadow}`,
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      minHeight: "72px",
      justifyContent: "center",
    };

    const seconds = lastImport.estimatedPrintTimeSec ?? 0;
    const printTimeHour = Math.floor(seconds / 3600);
    const printTimeMin = Math.floor((seconds % 3600) / 60);
    const printTimeSec = seconds % 60;

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginTop: "12px",
        }}
      >
        <div style={baseCardStyle}>
          <strong style={{ fontSize: "13px", color: theme.colors.text }}>{localize("Slicer", "Slicer", "Slicer")}</strong>
          <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
            {lastImport.slicer === "prusa-slicer"
              ? "PrusaSlicer"
              : lastImport.slicer === "cura"
              ? "Cura"
              : lastImport.slicer === "orca-slicer"
              ? "OrcaSlicer"
              : lastImport.slicer === "qidi-studio"
              ? "Qidi Studio"
              : localize("Ismeretlen", "Unbekannt", "Unknown")}
          </span>
        </div>
        <div style={baseCardStyle}>
          <strong style={{ fontSize: "13px", color: theme.colors.text }}>{localize("Becsült idő", "Geschätzte Zeit", "Estimated time")}</strong>
          <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
            {lastImport.estimatedPrintTimeSec
              ? `${printTimeHour}h ${printTimeMin}m ${printTimeSec}s`
              : localize("ismeretlen", "unbekannt", "unknown")}
          </span>
        </div>
        <div style={baseCardStyle}>
          <strong style={{ fontSize: "13px", color: theme.colors.text }}>{localize("Filament mennyiség", "Filamentmenge", "Filament amount")}</strong>
          <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
            {sumNumbers(lastImport.totalHeaderGrams) !== undefined
              ? `${(sumNumbers(lastImport.totalHeaderGrams) ?? 0).toFixed(2)} g`
              : lastImport.filamentUsedGrams
              ? `${lastImport.filamentUsedGrams.toFixed(2)} g`
              : lastImport.filamentUsedMeters
              ? `${lastImport.filamentUsedMeters.toFixed(2)} m`
              : localize("ismeretlen", "unbekannt", "unknown")}
          </span>
        </div>
        {lastImport.material && (
          <div style={baseCardStyle}>
            <strong style={{ fontSize: "13px", color: theme.colors.text }}>{localize("Anyag", "Material", "Material")}</strong>
            <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>{lastImport.material}</span>
          </div>
        )}
        {lastImport.profileName && (
          <div style={baseCardStyle}>
            <strong style={{ fontSize: "13px", color: theme.colors.text }}>{localize("Profil", "Profil", "Profile")}</strong>
            <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>{lastImport.profileName}</span>
          </div>
        )}
        {lastImport.projectName && (
          <div style={baseCardStyle}>
            <strong style={{ fontSize: "13px", color: theme.colors.text }}>{localize("Projekt", "Projekt", "Project")}</strong>
            <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>{lastImport.projectName}</span>
          </div>
        )}
        {lastImport.warnings.length > 0 && (
          <div style={{ ...baseCardStyle, border: `1px solid ${theme.colors.danger}` }}>
            <strong style={{ fontSize: "13px", color: theme.colors.danger }}>
              {localize("Figyelmeztetések", "Warnungen", "Warnings")}
            </strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: "16px", color: theme.colors.textMuted }}>
              {lastImport.warnings.map((warning, index) => (
                <li key={`slicer-warning-${index}`} style={{ fontSize: "12px" }}>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
        {lastImport.filamentPerExtruderGrams && lastImport.filamentPerExtruderGrams.length > 1 && (
          <div style={{ ...baseCardStyle, gridColumn: "1 / -1", padding: "16px", gap: "8px" }}>
            <strong style={{ fontSize: "13px", color: theme.colors.text }}>
              {localize(
                "Filament csere részletei",
                "Filamentwechsel Details",
                "Filament swap details"
              )}
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {lastImport.filamentPerExtruderGrams.map((grams, index) => {
                const extruderId = lastImport.extrudersUsed?.[index];
                const extruderLabel = extruderId !== undefined ? `E${extruderId}` : `#${index + 1}`;
                const meters = lastImport.filamentPerExtruderMeters?.[index];
                const millimeters = lastImport.filamentPerExtruderMillimeters?.[index];
                const metersText = meters !== undefined ? `${meters.toFixed(2)} m` : undefined;
                const mmText = millimeters !== undefined && meters === undefined ? `${millimeters.toFixed(0)} mm` : undefined;
                const amountSummary = [
                  `${grams.toFixed(2)} g`,
                  metersText,
                  mmText,
                ]
                  .filter(Boolean)
                  .join(" • ");

                return (
                  <div key={`filament-extruder-${index}`} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: theme.colors.text }}>
                      {localize("Extruder", "Extruder", "Extruder")} {extruderLabel}
                    </span>
                    <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>{amountSummary}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {lastImport.totalVolumeCm3 !== undefined && (
          <div
            style={{
              ...baseCardStyle,
              gridColumn: "1 / -1",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <strong style={{ fontSize: "13px", color: theme.colors.text }}>
                {localize("Teljes filament tömeg", "Gesamtfilamentgewicht", "Total filament weight")}
              </strong>
              <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                {lastImport.totalHeaderGrams?.length
                  ? lastImport.totalHeaderGrams
                      .map((value, index) => `#${index + 1}: ${value.toFixed(2)} g`)
                      .join(" • ")
                  : `${lastImport.filamentUsedGrams?.toFixed(2) ?? "0.00"} g`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <strong style={{ fontSize: "13px", color: theme.colors.text }}>
                {localize("Teljes filament hossz", "Gesamte Filamentlänge", "Total filament length")}
              </strong>
              <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                {lastImport.totalHeaderMillimeters?.length
                  ? lastImport.totalHeaderMillimeters
                      .map((value, index) => `#${index + 1}: ${(value / 1000).toFixed(2)} m`)
                      .join(" • ")
                  : `${lastImport.filamentUsedMeters?.toFixed(2) ?? "0.00"} m`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <strong style={{ fontSize: "13px", color: theme.colors.text }}>
                {localize("Teljes filament térfogat", "Gesamtvolumen", "Total filament volume")}
              </strong>
              <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                {`${(lastImport.totalVolumeCm3 ?? 0).toFixed(2)} cm³`}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backdropFilter: "blur(6px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={event => event.stopPropagation()}
            style={{
              ...themeStyles.card,
              width: "min(920px, 95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                border: "none",
                background: "transparent",
                color: theme.colors.text,
                fontSize: "20px",
                cursor: "pointer",
              }}
              aria-label={localize("Bezárás", "Schließen", "Close")}
            >
              ✕
            </button>

            <div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                }}
              >
                🧾 {localize("Slicer adatok importálása", "Slicer-Daten importieren", "Import slicer data")}
              </h3>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: theme.colors.textMuted }}>
                {localize(
                  "Tölts be G-code vagy JSON exportot (Prusa, Cura, Orca, Qidi) és emeld át az idő/filament adatokat.",
                  "Lade G-code- oder JSON-Exporte (Prusa, Cura, Orca, Qidi) und übernimm Zeit/Filamentdaten.",
                  "Load G-code or JSON exports (Prusa, Cura, Orca, Qidi) to capture time and filament usage data."
                )}
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={handleSlicerImport}
                disabled={isImporting}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSecondary,
                  padding: "10px 20px",
                  minWidth: "200px",
                  opacity: isImporting ? 0.65 : 1,
                }}
              >
                {isImporting
                  ? localize("Importálás...", "Import läuft...", "Importing...")
                  : localize("Slicer fájl kiválasztása", "Slicer-Datei auswählen", "Choose slicer file")}
              </button>
              <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                {localize(
                  "Támogatott formátumok: G-code és JSON meta fájlok (PrusaSlicer, Cura, OrcaSlicer, Qidi Studio).",
                  "Unterstützte Formate: G-code und JSON-Metadateien (PrusaSlicer, Cura, OrcaSlicer, Qidi Studio).",
                  "Supported formats: G-code and JSON metadata exports (PrusaSlicer, Cura, OrcaSlicer, Qidi Studio)."
                )}
              </span>
            </div>

            {renderSummary()}

            {lastImport && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginTop: "8px" }}>
                <button
                  onClick={handleCreateOfferDraft}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonPrimary,
                    padding: "10px 20px",
                    minWidth: "220px",
                  }}
                >
                  {localize("Árajánlat piszkozat létrehozása", "Angebotsentwurf erstellen", "Create quote draft")}
                </button>
                <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                  {localize(
                    "Az importált idő- és filament adatokkal új piszkozat jön létre az Árajánlatok menüben.",
                    "Mit den importierten Zeit- und Filamentdaten wird ein Entwurf im Angebotsbereich erstellt.",
                    "Creates a draft in the Offers section using the imported time and filament data."
                  )}
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
