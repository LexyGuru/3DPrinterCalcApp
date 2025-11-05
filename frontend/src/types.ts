export interface Filament {
  brand: string;
  type: string;
  weight: number;     // gramm
  density?: number;   // opcionális
  pricePerKg: number; // EUR
  color?: string;     // szín (opcionális)
}

export type Printer = {
  id: number;
  name: string;
  type: string;
  power: number;     // watt
  usageCost: number; // €/h
  amsCount?: number; // AMS rendszerek száma (opcionális, 0-4)
  ams?: AMS[];       // AMS rendszerek listája
};

export type AMS = {
  id: number;
  brand: string;
  name: string;
  power: number;      // watt - AMS teljesítmény felhasználása
};

export interface Settings {
  currency: "EUR" | "HUF" | "USD";
  electricityPrice: number; // Ft/kWh
  language: "hu" | "en" | "de";
  checkForBetaUpdates?: boolean; // Beta release-ek ellenőrzése
  theme?: "light" | "dark" | "blue" | "green" | "purple" | "orange"; // Téma választás
}

export const defaultSettings: Settings = {
  currency: "EUR",
  electricityPrice: 70, // Ft/kWh alap
  language: "hu",
  checkForBetaUpdates: false, // Alapértelmezetten nem ellenőrzi a beta release-eket
  theme: "light", // Alapértelmezett téma
};

export interface OfferFilament {
  brand: string;
  type: string;
  color?: string;
  usedGrams: number;
  pricePerKg: number; // EUR
  needsDrying?: boolean;
  dryingTime?: number;
  dryingPower?: number;
}

export interface Offer {
  id: number;
  date: string; // ISO date string
  printerName: string;
  printerType: string;
  printerPower: number;
  printTimeHours: number;
  printTimeMinutes: number;
  printTimeSeconds: number;
  totalPrintTimeHours: number;
  filaments: OfferFilament[];
  costs: {
    filamentCost: number;
    electricityCost: number;
    dryingCost: number;
    usageCost: number;
    totalCost: number;
  };
  currency: "EUR" | "HUF" | "USD";
  customerName?: string;
  customerContact?: string; // Email vagy telefon
  description?: string;
  profitPercentage?: number; // Profit százalék (10, 20, 30, 40, 50), alapértelmezett 30%
}
