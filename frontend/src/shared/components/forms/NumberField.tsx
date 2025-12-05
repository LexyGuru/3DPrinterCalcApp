import React from "react";
import { InputField } from "./InputField";
import type { Theme } from "../../../utils/themes";

interface NumberFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  required?: boolean;
  theme?: Theme;
  fullWidth?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * NumberField - Number input mező wrapper komponens
 * Konzisztens stílus és validáció biztosítása
 */
export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  error,
  required = false,
  theme,
  fullWidth = true,
  min,
  max,
  step,
  style,
  ...inputProps
}) => {
  return (
    <InputField
      {...inputProps}
      type="number"
      label={label}
      error={error}
      required={required}
      theme={theme}
      fullWidth={fullWidth}
      min={min}
      max={max}
      step={step}
      style={style}
    />
  );
};

