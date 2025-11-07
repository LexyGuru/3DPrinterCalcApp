export interface Filament {
  brand: string;
  type: string;
  weight: number;     // gramm
  density?: number;   // opcionális
  pricePerKg: number; // EUR
  color?: string;     // szín (opcionális)
  imageBase64?: string; // Kép base64 stringként (opcionális)
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

export interface CompanyInfo {
  name?: string;
  address?: string;
  taxNumber?: string;
  bankAccount?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoBase64?: string;
}

export type PdfTemplate = "modern" | "minimal" | "professional";

export type ThemeName =
  | "light"
  | "dark"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "gradient"
  | "neon"
  | "cyberpunk"
  | "sunset"
  | "ocean";

export interface Settings {
  currency: "EUR" | "HUF" | "USD";
  electricityPrice: number; // Ft/kWh
  language: "hu" | "en" | "de";
  checkForBetaUpdates?: boolean; // Beta release-ek ellenőrzése
  theme?: ThemeName; // Téma választás
  showConsole?: boolean; // Console/Log menüpont megjelenítése
  autosave?: boolean; // Automatikus mentés
  autosaveInterval?: number; // Automatikus mentés intervalluma (másodpercben)
  notificationEnabled?: boolean; // Toast értesítések engedélyezése
  notificationDuration?: number; // Toast értesítés időtartama (ms)
  companyInfo?: CompanyInfo;
  pdfTemplate?: PdfTemplate;
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
  companyInfo: {},
  pdfTemplate: "modern",
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
  imageBase64?: string;
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

export type OfferStatus = "draft" | "sent" | "accepted" | "rejected" | "completed";

export interface OfferStatusHistory {
  status: OfferStatus;
  date: string; // ISO date string
  note?: string; // Opcionális megjegyzés
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
  status?: OfferStatus; // Árajánlat státusz
  statusHistory?: OfferStatusHistory[]; // Státusz előzmények
  statusUpdatedAt?: string; // Utolsó státuszváltás dátuma
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

// Szűrő típusok
export interface OfferFilter {
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  minProfit?: number;
  maxProfit?: number;
  customerName?: string;
  printerNames?: string[]; // Több nyomtató kiválasztása
  filamentTypes?: string[]; // Több filament típus kiválasztása
  statuses?: OfferStatus[]; // Több státusz kiválasztása
}

export type QuickFilterType = "today" | "yesterday" | "thisWeek" | "thisMonth" | "last7Days" | "last30Days" | "all";

export interface FilterPreset {
  id: number;
  name: string;
  description?: string;
  filter: OfferFilter;
  createdAt: string; // ISO date string
  quickFilter?: QuickFilterType;
  searchTerm?: string;
  isDefault?: boolean;
}
