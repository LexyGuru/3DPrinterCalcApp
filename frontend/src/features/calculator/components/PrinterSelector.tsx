/**
 * PrinterSelector Component
 * Nyomtató választó komponens a Calculator feature-hez
 */

import React from "react";
import type { Printer, Settings } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";

interface PrinterSelectorProps {
  printers: Printer[];
  selectedPrinterId: number | "";
  onPrinterChange: (printerId: number | "") => void;
  selectedPrinter: Printer | null;
  maxFilaments: number;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  language: Settings["language"];
}

/**
 * Printer selector komponens
 */
export const PrinterSelector: React.FC<PrinterSelectorProps> = ({
  printers,
  selectedPrinterId,
  onPrinterChange,
  selectedPrinter,
  maxFilaments,
  theme,
  themeStyles,
  language,
}) => {
  const t = useTranslation(language);

  return (
    <div style={{ marginBottom: "20px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "12px",
          fontWeight: "600",
          fontSize: "16px",
          color: theme.colors.background?.includes("gradient")
            ? "#1a202c"
            : theme.colors.text,
        }}
      >
        🖨️ {t("calculator.printer")}
      </label>
      <select
        value={selectedPrinterId}
        onChange={(e) => {
          onPrinterChange(e.target.value === "" ? "" : Number(e.target.value));
        }}
        onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
        onBlur={(e) => {
          e.target.style.borderColor = theme.colors.inputBorder;
          e.target.style.boxShadow = "none";
        }}
        style={{
          ...themeStyles.select,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
        aria-label={t("calculator.printer")}
        aria-required="true"
      >
        <option value="">{t("calculator.selectPrinter")}</option>
        {printers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.type}) - {p.power}W{" "}
            {p.amsCount ? `- ${p.amsCount} AMS` : ""}
          </option>
        ))}
      </select>
      {selectedPrinter && (
        <p
          style={{
            marginTop: "5px",
            fontSize: "12px",
            color: theme.colors.background?.includes("gradient")
              ? "#4a5568"
              : theme.colors.textSecondary,
          }}
        >
          {t("calculator.maxFilaments")} {maxFilaments} (
          {selectedPrinter.amsCount || 0} {t("printers.ams")} × 4)
        </p>
      )}
    </div>
  );
};

