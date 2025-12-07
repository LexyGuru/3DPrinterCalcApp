/**
 * useFilamentSelection hook
 * Filament kiválasztás és kezelés logika
 */

import { useState, useCallback, useMemo } from "react";
import type { SelectedFilament, Printer } from "../types";

interface UseFilamentSelectionParams {
  printer: Printer | null;
}

/**
 * Hook filament kiválasztás kezeléséhez
 */
export function useFilamentSelection({ printer }: UseFilamentSelectionParams) {
  const [selectedFilaments, setSelectedFilaments] = useState<SelectedFilament[]>([]);

  const maxFilaments = useMemo(() => {
    if (!printer) return 0;
    return (printer.amsCount || 0) * 4;
  }, [printer]);

  const addFilament = useCallback(() => {
    if (selectedFilaments.length >= maxFilaments) return;
    setSelectedFilaments(prev => [
      ...prev,
      {
        filamentIndex: -1,
        usedGrams: 0,
        needsDrying: false,
        dryingTime: 0,
        dryingPower: 0,
      },
    ]);
  }, [selectedFilaments.length, maxFilaments]);

  const removeFilament = useCallback((index: number) => {
    setSelectedFilaments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateFilament = useCallback((
    index: number,
    field: keyof SelectedFilament,
    value: number | boolean
  ) => {
    setSelectedFilaments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const resetFilaments = useCallback(() => {
    setSelectedFilaments([]);
  }, []);

  const setFilaments = useCallback((filaments: SelectedFilament[]) => {
    setSelectedFilaments(filaments);
  }, []);

  return {
    selectedFilaments,
    maxFilaments,
    addFilament,
    removeFilament,
    updateFilament,
    resetFilaments,
    setFilaments,
  };
}

