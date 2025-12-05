/**
 * useCalculator hook
 * Fő számítás logika a Calculator feature-hez
 */

import { useMemo } from "react";
import type { Printer, Filament, Settings, SelectedFilament } from "../types";
import { calculateCosts, calculatePrintTimeHours } from "../utils/calculations";
import type { CalculationResult } from "../types";

interface UseCalculatorParams {
  printer: Printer | null;
  selectedFilaments: SelectedFilament[];
  printTimeHours: number;
  printTimeMinutes: number;
  printTimeSeconds: number;
  filaments: Filament[];
  settings: Settings;
}

/**
 * Hook a költség számításokhoz
 */
export function useCalculator({
  printer,
  selectedFilaments,
  printTimeHours,
  printTimeMinutes,
  printTimeSeconds,
  filaments,
  settings,
}: UseCalculatorParams): CalculationResult | null {
  const totalPrintTimeHours = useMemo(() => {
    return calculatePrintTimeHours(printTimeHours, printTimeMinutes, printTimeSeconds);
  }, [printTimeHours, printTimeMinutes, printTimeSeconds]);

  const calculations = useMemo(() => {
    if (!printer || selectedFilaments.length === 0 || totalPrintTimeHours <= 0) {
      return null;
    }

    // Ellenőrizzük hogy minden filament rendelkezik mennyiséggel
    if (selectedFilaments.some(sf => sf.filamentIndex < 0 || sf.usedGrams <= 0)) {
      return null;
    }

    return calculateCosts({
      printer,
      selectedFilaments,
      printTimeHours,
      printTimeMinutes,
      printTimeSeconds,
      settings,
      filaments,
    });
  }, [printer, selectedFilaments, filaments, totalPrintTimeHours, settings, printTimeHours, printTimeMinutes, printTimeSeconds]);

  return calculations;
}

