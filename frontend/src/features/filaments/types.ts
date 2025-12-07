/**
 * Filaments Feature Types
 * Filament feature specifikus típusok
 */

import type { Filament, Settings } from "../../types";

// Exportáljuk a Filament típust a feature modulból
export type { Filament };

// Filament szűrési opciók
export interface FilamentFilterOptions {
  brand?: string;
  type?: string;
  color?: string;
  finish?: string;
  searchTerm?: string;
  favoritesOnly?: boolean;
}

// Filament rendezési konfiguráció
export interface FilamentSortConfig {
  column: keyof Filament;
  direction: "asc" | "desc";
}

// Oszlop láthatóság beállítások
export interface FilamentColumnVisibility {
  image: boolean;
  brand: boolean;
  type: boolean;
  color: boolean;
  weight: boolean;
  pricePerKg: boolean;
  action: boolean;
}

// Filament form adatok
export interface FilamentFormData {
  brand: string;
  type: string;
  weight: number;
  pricePerKg: number;
  color: string;
  colorHex: string;
  colorMode: "solid" | "gradient" | "multicolor";
  multiColorHint?: string;
  finish?: string;
  favorite?: boolean;
}

// Exportáljuk a Settings típust is, ha szükséges
export type { Settings };

