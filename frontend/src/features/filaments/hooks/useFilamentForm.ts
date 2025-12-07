/**
 * useFilamentForm hook
 * Filament form kezelés hook
 */

import { useState, useCallback } from "react";
import type { FilamentFormData } from "../types";
import type { ColorMode } from "../../../types";

interface UseFilamentFormParams {
  initialData?: Partial<FilamentFormData>;
}

const DEFAULT_FORM_DATA: FilamentFormData = {
  brand: "",
  type: "",
  weight: 1000,
  pricePerKg: 0,
  color: "",
  colorHex: "",
  colorMode: "solid",
  multiColorHint: "",
  finish: undefined,
  favorite: false,
};

/**
 * Hook filament form kezeléséhez
 */
export function useFilamentForm({
  initialData,
}: UseFilamentFormParams) {
  const [formData, setFormData] = useState<FilamentFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });

  const [pricePerKgRaw, setPricePerKgRaw] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [useCustomType, setUseCustomType] = useState(false);
  const [useCustomColor, setUseCustomColor] = useState(false);

  // Form mezők frissítése
  const updateField = useCallback(
    <K extends keyof FilamentFormData>(
      field: K,
      value: FilamentFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Form reset
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setPricePerKgRaw("");
    setImagePreview(null);
    setUseCustomBrand(false);
    setUseCustomType(false);
    setUseCustomColor(false);
  }, []);

  // Form feltöltése meglévő filament adatokkal
  const loadFormData = useCallback((data: Partial<FilamentFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (data.pricePerKg !== undefined) {
      setPricePerKgRaw(formatPriceForInput(data.pricePerKg));
    }
  }, []);

  // Ár formázás input számára
  const formatPriceForInput = useCallback((value: number): string => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "";
    }
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    return Number.isInteger(rounded)
      ? rounded.toString()
      : rounded.toFixed(2);
  }, []);

  // Ár input kezelés
  const handlePriceInputChange = useCallback(
    (rawValue: string) => {
      const sanitized = rawValue.replace(/,/g, ".").replace(/\s+/g, "");
      setPricePerKgRaw(sanitized);
      if (sanitized === "") {
        updateField("pricePerKg", 0);
        return;
      }
      const numeric = Number(sanitized);
      if (!Number.isNaN(numeric)) {
        updateField("pricePerKg", numeric);
      }
    },
    [updateField]
  );

  // Szín mód változtatás
  const handleColorModeChange = useCallback(
    (mode: ColorMode) => {
      updateField("colorMode", mode);
      if (mode === "multicolor") {
        if (!formData.multiColorHint) {
          updateField(
            "multiColorHint",
            formData.color || formData.multiColorHint || ""
          );
        }
        if (formData.colorHex) {
          updateField("colorHex", "");
        }
      } else {
        updateField("multiColorHint", "");
      }
    },
    [formData, updateField]
  );

  return {
    formData,
    pricePerKgRaw,
    imagePreview,
    useCustomBrand,
    useCustomType,
    useCustomColor,
    updateField,
    resetForm,
    loadFormData,
    formatPriceForInput,
    handlePriceInputChange,
    handleColorModeChange,
    setPricePerKgRaw,
    setImagePreview,
    setUseCustomBrand,
    setUseCustomType,
    setUseCustomColor,
  };
}

