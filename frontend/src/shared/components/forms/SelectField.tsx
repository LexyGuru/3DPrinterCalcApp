import React from "react";
import { FormField } from "./FormField";
import type { Theme } from "../../../utils/themes";

interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  label?: string;
  error?: string;
  required?: boolean;
  theme?: Theme;
  fullWidth?: boolean;
  placeholder?: string;
  options: Array<{ value: string | number; label: string }>;
}

/**
 * SelectField - Select dropdown wrapper komponens
 * Konzisztens stílus és hiba kezelés biztosítása
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  required = false,
  theme,
  fullWidth = true,
  options,
  placeholder,
  style,
  ...selectProps
}) => {
  const isGradientBackground = theme?.colors.background?.includes('gradient');
  const selectBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.9)" 
    : (theme?.colors.surface || "#fff");
  const selectTextColor = isGradientBackground 
    ? "#1a202c" 
    : (theme?.colors.text || "#212529");
  const borderColor = error 
    ? (theme?.colors.danger || "#dc3545")
    : (theme?.colors.border || "#ced4da");
  const focusBorderColor = theme?.colors.primary || "#007bff";

  return (
    <FormField label={label} error={error} required={required} theme={theme}>
      <select
        {...selectProps}
        style={{
          width: fullWidth ? "100%" : "auto",
          padding: "10px 12px",
          fontSize: "14px",
          borderRadius: "8px",
          border: `1px solid ${borderColor}`,
          backgroundColor: selectBg,
          color: selectTextColor,
          outline: "none",
          transition: "all 0.2s",
          cursor: "pointer",
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = focusBorderColor;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${focusBorderColor}20`;
          if (selectProps.onFocus) selectProps.onFocus(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = borderColor;
          e.currentTarget.style.boxShadow = "none";
          if (selectProps.onBlur) selectProps.onBlur(e);
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

