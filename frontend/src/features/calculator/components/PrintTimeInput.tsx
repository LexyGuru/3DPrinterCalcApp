/**
 * PrintTimeInput Component
 * Nyomtatási idő input komponens (óra, perc, másodperc)
 */

import React, { useMemo } from "react";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import type { Settings } from "../../../types";
import { useTranslation } from "../../../utils/translations";
import { validatePrintTime } from "../utils/validation";
import { calculatePrintTimeHours } from "../utils/calculations";

interface PrintTimeInputProps {
  hours: number;
  minutes: number;
  seconds: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  onSecondsChange: (seconds: number) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  settings: Settings;
  onValidationError?: (message: string) => void;
}

/**
 * Print time input komponens
 */
export const PrintTimeInput: React.FC<PrintTimeInputProps> = ({
  hours,
  minutes,
  seconds,
  onHoursChange,
  onMinutesChange,
  onSecondsChange,
  theme,
  themeStyles,
  settings,
  onValidationError,
}) => {
  const t = useTranslation(settings.language);

  const totalPrintTimeHours = useMemo(() => {
    return calculatePrintTimeHours(hours, minutes, seconds);
  }, [hours, minutes, seconds]);

  const handleHoursChange = (val: number) => {
    const validation = validatePrintTime(val, minutes, seconds, settings.language);
    if (validation.isValid) {
      onHoursChange(val);
    } else if (validation.errorMessage && onValidationError) {
      onValidationError(validation.errorMessage);
    }
  };

  const handleMinutesChange = (val: number) => {
    const validation = validatePrintTime(hours, val, seconds, settings.language);
    if (validation.isValid) {
      onMinutesChange(val);
    } else if (validation.errorMessage && onValidationError) {
      onValidationError(validation.errorMessage);
    }
  };

  const handleSecondsChange = (val: number) => {
    const validation = validatePrintTime(hours, minutes, val, settings.language);
    if (validation.isValid) {
      onSecondsChange(val);
    } else if (validation.errorMessage && onValidationError) {
      onValidationError(validation.errorMessage);
    }
  };

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
        ⏱️ {t("calculator.printTimeLabel")}
      </label>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: theme.colors.background?.includes("gradient")
                ? "#1a202c"
                : theme.colors.text,
            }}
          >
            {t("calculator.hours")}
          </label>
          <input
            type="number"
            min="0"
            max="1000"
            value={hours}
            onChange={(e) => {
              const val = Number(e.target.value);
              handleHoursChange(val);
            }}
            onFocus={(e) =>
              Object.assign(e.target.style, themeStyles.inputFocus)
            }
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.inputBorder;
              e.target.style.boxShadow = "none";
            }}
            style={{ ...themeStyles.input, width: "100px" }}
            aria-label={t("calculator.hours")}
            aria-describedby="print-time-hours-description"
          />
          <span id="print-time-hours-description" style={{ display: "none" }}>
            {t("calculator.printTime.hoursDescription")}
          </span>
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: theme.colors.background?.includes("gradient")
                ? "#1a202c"
                : theme.colors.text,
            }}
          >
            {t("calculator.minutes")}
          </label>
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => {
              const val = Number(e.target.value);
              handleMinutesChange(val);
            }}
            onFocus={(e) =>
              Object.assign(e.target.style, themeStyles.inputFocus)
            }
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.inputBorder;
              e.target.style.boxShadow = "none";
            }}
            style={{ ...themeStyles.input, width: "100px" }}
            aria-label={t("calculator.minutes")}
            aria-describedby="print-time-minutes-description"
          />
          <span id="print-time-minutes-description" style={{ display: "none" }}>
            {t("calculator.printTime.minutesDescription")}
          </span>
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: theme.colors.background?.includes("gradient")
                ? "#1a202c"
                : theme.colors.text,
            }}
          >
            {t("calculator.seconds")}
          </label>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => {
              const val = Number(e.target.value);
              handleSecondsChange(val);
            }}
            onFocus={(e) =>
              Object.assign(e.target.style, themeStyles.inputFocus)
            }
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.inputBorder;
              e.target.style.boxShadow = "none";
            }}
            style={{ ...themeStyles.input, width: "100px" }}
            aria-label={t("calculator.seconds")}
            aria-describedby="print-time-seconds-description"
          />
          <span id="print-time-seconds-description" style={{ display: "none" }}>
            {t("calculator.printTime.secondsDescription")}
          </span>
        </div>
      </div>
      <p
        style={{
          marginTop: "5px",
          fontSize: "12px",
          color: theme.colors.background?.includes("gradient")
            ? "#4a5568"
            : theme.colors.textSecondary,
        }}
      >
        {t("calculator.totalTime")} {totalPrintTimeHours.toFixed(2)}{" "}
        {t("calculator.hoursUnit")}
      </p>
    </div>
  );
};

