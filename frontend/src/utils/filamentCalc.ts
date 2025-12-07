import type { Filament } from "../types";
import { convertCurrency, type Currency } from "./currency";

export function filamentPrice(filament: Filament, currency: Currency): number {
  const priceEUR = (filament.weight / 1000) * filament.pricePerKg; // súly alapján ár
  return convertCurrency(priceEUR, currency);
}
