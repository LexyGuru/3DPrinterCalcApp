/**
 * Calculator Feature Types
 */

import type { Printer, Filament, Settings, CalculationTemplate } from "../../types";

export interface SelectedFilament {
  filamentIndex: number;
  usedGrams: number;
  needsDrying?: boolean;
  dryingTime?: number;
  dryingPower?: number;
}

export interface CalculationResult {
  filamentCost: number;
  electricityCost: number;
  totalDryingCost: number;
  usageCost: number;
  totalCost: number;
}

export interface CalculationInputs {
  printer: Printer;
  selectedFilaments: SelectedFilament[];
  printTimeHours: number;
  printTimeMinutes: number;
  printTimeSeconds: number;
  settings: Settings;
  filaments: Filament[];
}

export type { Printer, Filament, Settings, CalculationTemplate };

