import type { Filament } from "../types";
import { convertCurrency } from "./currency";

export function filamentPrice(filament: Filament, currency: "EUR" | "HUF" | "USD"): number {
  const priceEUR = (filament.weight / 1000) * filament.pricePerKg; // súly alapján ár
  return convertCurrency(priceEUR, currency);
}
