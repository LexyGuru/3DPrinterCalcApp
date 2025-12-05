/**
 * Printers Feature Types
 * Printer feature specifikus típusok
 */

import type { Printer, Settings } from "../../types";

// Exportáljuk a Printer típust a feature modulból
export type { Printer };

// Printer szűrési opciók
export interface PrinterFilterOptions {
  name?: string;
  type?: string;
  searchTerm?: string;
}

// Printer rendezési konfiguráció
export interface PrinterSortConfig {
  column: keyof Printer;
  direction: "asc" | "desc";
}

// Printer form adatok
export interface PrinterFormData {
  name: string;
  type: string;
  power: number;
  usageCost: number;
  ams: Array<{
    id: number;
    power: number;
  }>;
}

// Exportáljuk a Settings típust is, ha szükséges
export type { Settings };

