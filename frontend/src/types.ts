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
  showConsole?: boolean; // Console/Log menüpont megjelenítése
  autosave?: boolean; // Automatikus mentés
  autosaveInterval?: number; // Automatikus mentés intervalluma (másodpercben)
  notificationEnabled?: boolean; // Toast értesítések engedélyezése
  notificationDuration?: number; // Toast értesítés időtartama (ms)
}

export const defaultSettings: Settings = {
  currency: "EUR",
  electricityPrice: 70, // Ft/kWh alap
  language: "hu",
  checkForBetaUpdates: false, // Alapértelmezetten nem ellenőrzi a beta release-eket
  theme: "light", // Alapértelmezett téma
  autosave: true, // Alapértelmezetten engedélyezve
  autosaveInterval: 30, // Alapértelmezett 30 másodperc
  notificationEnabled: true, // Alapértelmezetten engedélyezve
  notificationDuration: 3000, // Alapértelmezett 3 másodperc
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

export interface OfferHistory {
  version: number;
  date: string; // ISO date string
  customerName?: string;
  customerContact?: string;
  description?: string;
  profitPercentage?: number;
  costs: {
    filamentCost: number;
    electricityCost: number;
    dryingCost: number;
    usageCost: number;
    totalCost: number;
  };
  changedBy?: string; // Opcionális: ki módosította
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
  history?: OfferHistory[]; // Előzmények/verziók
  currentVersion?: number; // Jelenlegi verzió száma
}

export interface CalculationTemplate {
  id: number;
  name: string;
  description?: string;
  printerId: number;
  selectedFilaments: {
    filamentIndex: number;
    usedGrams: number;
    needsDrying?: boolean;
    dryingTime?: number;
    dryingPower?: number;
  }[];
  printTimeHours: number;
  printTimeMinutes: number;
  printTimeSeconds: number;
  createdAt: string; // ISO date string
}
