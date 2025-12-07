import React from "react";
import { FormField } from "./FormField";
import type { Theme } from "../../../utils/themes";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  theme?: Theme;
  fullWidth?: boolean;
}

/**
 * InputField - Text input mező wrapper komponens
 * Konzisztens stílus és hiba kezelés biztosítása
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  required = false,
  theme,
  fullWidth = true,
  style,
  ...inputProps
}) => {
  const isGradientBackground = theme?.colors.background?.includes('gradient');
  const inputBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.9)" 
    : (theme?.colors.surface || "#fff");
  const inputTextColor = isGradientBackground 
    ? "#1a202c" 
    : (theme?.colors.text || "#212529");
  const borderColor = error 
    ? (theme?.colors.danger || "#dc3545")
    : (theme?.colors.border || "#ced4da");
  const focusBorderColor = theme?.colors.primary || "#007bff";

  return (
    <FormField label={label} error={error} required={required} theme={theme}>
      <input
        {...inputProps}
        style={{
          width: fullWidth ? "100%" : "auto",
          padding: "10px 12px",
          fontSize: "14px",
          borderRadius: "8px",
          border: `1px solid ${borderColor}`,
          backgroundColor: inputBg,
          color: inputTextColor,
          outline: "none",
          transition: "all 0.2s",
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = focusBorderColor;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${focusBorderColor}20`;
          if (inputProps.onFocus) inputProps.onFocus(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = borderColor;
          e.currentTarget.style.boxShadow = "none";
          if (inputProps.onBlur) inputProps.onBlur(e);
        }}
      />
    </FormField>
  );
};

