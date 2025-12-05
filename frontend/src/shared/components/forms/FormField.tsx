import React from "react";
import type { Theme } from "../../../utils/themes";

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  theme?: Theme;
  style?: React.CSSProperties;
}

/**
 * FormField - Wrapper komponens form mezőkhöz
 * Biztosítja a konzisztens label, error és required jelölés megjelenítését
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children,
  theme,
  style,
}) => {
  const isGradientBackground = theme?.colors.background?.includes('gradient');
  const labelColor = isGradientBackground 
    ? "#1a202c" 
    : (theme?.colors.text || "#212529");
  const errorColor = theme?.colors.danger || "#dc3545";

  return (
    <div style={{ marginBottom: "16px", ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: "600",
            color: labelColor,
          }}
        >
          {label}
          {required && (
            <span style={{ color: errorColor, marginLeft: "4px" }}>*</span>
          )}
        </label>
      )}
      {children}
      {error && (
        <div
          style={{
            marginTop: "4px",
            fontSize: "12px",
            color: errorColor,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

