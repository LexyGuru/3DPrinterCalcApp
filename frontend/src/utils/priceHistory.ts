import type { Filament, PriceHistory, Settings } from "../types";
import { loadPriceHistory, savePriceHistory } from "./store";

// Re-export for convenience
export { loadPriceHistory, savePriceHistory };

/**
 * Ár előzmény hozzáadása filament módosításnál
 */
export async function addPriceHistory(
  oldFilament: Filament | null,
  newFilament: Filament,
  settings: Settings
): Promise<void> {
  // Ha nincs régi filament (új filament), vagy az ár nem változott, nem kell előzmény
  if (!oldFilament || oldFilament.pricePerKg === newFilament.pricePerKg) {
    return;
  }

  // Ellenőrizzük, hogy azonos filamentről van-e szó
  if (
    oldFilament.brand !== newFilament.brand ||
    oldFilament.type !== newFilament.type ||
    (oldFilament.color !== newFilament.color && oldFilament.color && newFilament.color)
  ) {
    // Ha a brand, type vagy color változott, nem kell ár előzmény
    return;
  }

  const oldPrice = oldFilament.pricePerKg;
  const newPrice = newFilament.pricePerKg;
  const priceChange = newPrice - oldPrice;
  const priceChangePercent = oldPrice > 0 ? (priceChange / oldPrice) * 100 : 0;

  // Betöltjük a meglévő előzményeket
  const existingHistory = await loadPriceHistory();

  // Új előzmény létrehozása
  const newHistoryEntry: PriceHistory = {
    id: Date.now(),
    filamentBrand: newFilament.brand,
    filamentType: newFilament.type,
    filamentColor: newFilament.color,
    oldPrice,
    newPrice,
    priceChange,
    priceChangePercent,
    date: new Date().toISOString(),
    currency: settings.currency,
  };

  // Hozzáadjuk az új előzményt a lista elejéhez
  const updatedHistory = [newHistoryEntry, ...existingHistory];

  // Mentjük az előzményeket
  await savePriceHistory(updatedHistory);
}

/**
 * Filament ár előzmények lekérése
 */
export async function getFilamentPriceHistory(
  brand: string,
  type: string,
  color?: string
): Promise<PriceHistory[]> {
  const allHistory = await loadPriceHistory();
  return allHistory.filter(
    (entry) =>
      entry.filamentBrand === brand &&
      entry.filamentType === type &&
      (!color || entry.filamentColor === color || (!entry.filamentColor && !color))
  );
}

/**
 * Filament ár statisztikák számítása
 */
export function calculatePriceStats(history: PriceHistory[]): {
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceTrend: "increasing" | "decreasing" | "stable";
} {
  if (history.length === 0) {
    return {
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      priceTrend: "stable",
    };
  }

  const prices = history.map((h) => h.newPrice);
  const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Trend számítása: az utolsó 3-5 bejegyzés alapján
  const recentEntries = history.slice(0, Math.min(5, history.length));
  if (recentEntries.length < 2) {
    return {
      averagePrice,
      minPrice,
      maxPrice,
      priceTrend: "stable",
    };
  }

  // Átlagos változás az utolsó bejegyzésekben
  const recentChanges = recentEntries
    .slice(0, -1)
    .map((entry, idx) => entry.priceChangePercent);
  const avgChange = recentChanges.reduce((sum, c) => sum + c, 0) / recentChanges.length;

  let priceTrend: "increasing" | "decreasing" | "stable" = "stable";
  if (avgChange > 2) {
    priceTrend = "increasing";
  } else if (avgChange < -2) {
    priceTrend = "decreasing";
  }

  return {
    averagePrice,
    minPrice,
    maxPrice,
    priceTrend,
  };
}

/**
 * Jelentős ár változás ellenőrzése (pl. 10% feletti változás)
 */
export function isSignificantPriceChange(
  oldPrice: number,
  newPrice: number,
  thresholdPercent: number = 10
): boolean {
  if (oldPrice === 0) return false;
  const changePercent = Math.abs(((newPrice - oldPrice) / oldPrice) * 100);
  return changePercent >= thresholdPercent;
}

