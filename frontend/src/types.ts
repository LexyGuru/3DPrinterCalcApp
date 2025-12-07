export type LanguageCode =
  | "hu"
  | "en"
  | "de"
  | "fr"
  | "it"
  | "es"
  | "pl"
  | "cs"
  | "sk"
  | "zh"
  | "pt-BR"
  | "uk"
  | "ru";

export type BaseLanguageCode = "hu" | "en" | "de";

export type LocaleStringMap<T = string> = Record<BaseLanguageCode, T> &
  Partial<Record<Exclude<LanguageCode, BaseLanguageCode>, T>>;

export type ColorMode = "solid" | "multicolor";

export interface Filament {
  brand: string;
  type: string;
  weight: number;     // gramm
  density?: number;   // opcionális
  pricePerKg: number; // EUR
  color?: string;     // szín (opcionális)
  colorHex?: string;  // szín hex kód (opcionális)
  imageBase64?: string; // Kép base64 stringként (opcionális)
  colorMode?: ColorMode;
  multiColorHint?: string;
  favorite?: boolean; // Kedvenc jelölés (opcionális)
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
  | "ocean"
  | "forest"
  | "charcoal"
  | "pastel"
  | "midnight"
  | `custom:${string}`;

export type PageTransitionStyle = "fade" | "slide" | "scale" | "flip" | "parallax";
export type FeedbackAnimationStyle = "subtle" | "emphasis" | "pulse" | "none";
export type MicroInteractionStyle = "subtle" | "expressive" | "playful";

export interface AnimationSettings {
  microInteractions: boolean;
  microInteractionStyle: MicroInteractionStyle;
  pageTransition: PageTransitionStyle;
  loadingSkeletons: boolean;
  feedbackAnimations: FeedbackAnimationStyle;
  smoothScroll: boolean;
}

export interface CustomThemeGradient {
  start: string;
  end: string;
  angle: number;
}

export interface CustomThemeDefinition {
  id: string;
  name: string;
  description?: string;
  palette: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    text: string;
    textMuted: string;
  };
  gradient?: CustomThemeGradient;
}

export interface ThemeSettings {
  customThemes: CustomThemeDefinition[];
  activeCustomThemeId?: string;
  autoApplyGradientText?: boolean;
}

export const defaultAnimationSettings: AnimationSettings = {
  microInteractions: true,
  microInteractionStyle: "expressive",
  pageTransition: "fade",
  loadingSkeletons: true,
  feedbackAnimations: "subtle",
  smoothScroll: true,
};

export const createEmptyCustomThemeDefinition = (): CustomThemeDefinition => ({
  id: `custom-${Date.now().toString(36)}`,
  name: "Új téma",
  palette: {
    background: "#1f2933",
    surface: "#27323f",
    primary: "#4f46e5",
    secondary: "#0ea5e9",
    success: "#22c55e",
    danger: "#ef4444",
    text: "#f8fafc",
    textMuted: "#cbd5f5",
  },
  gradient: {
    start: "#4f46e5",
    end: "#0ea5e9",
    angle: 135,
  },
});

export type CalendarProvider = "google" | "ios" | "outlook";

export interface CustomShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description?: string;
}

export type Currency = "EUR" | "HUF" | "USD" | "GBP" | "PLN" | "CZK" | "CNY" | "UAH" | "RUB";

export interface Settings {
  currency: Currency;
  electricityPrice: number; // Ft/kWh
  language: LanguageCode;
  checkForBetaUpdates?: boolean; // Beta release-ek ellenőrzése
  theme?: ThemeName; // Téma választás
  showConsole?: boolean; // Console/Log menüpont megjelenítése
  autosave?: boolean; // Automatikus mentés
  autosaveInterval?: number; // Automatikus mentés intervalluma (másodpercben)
  notificationEnabled?: boolean; // Toast értesítések engedélyezése
  notificationDuration?: number; // Toast értesítés időtartama (ms)
  companyInfo?: CompanyInfo;
  pdfTemplate?: PdfTemplate;
  animationSettings?: AnimationSettings;
  themeSettings?: ThemeSettings;
  calendarProvider?: CalendarProvider; // Naptár szolgáltató (Google Calendar, iOS Calendar, Outlook)
  customShortcuts?: Record<string, CustomShortcut>; // Egyedi gyorsbillentyűk (kulcs: egyedi azonosító)
  printerColumnsVisibility?: {
    name: boolean;
    type: boolean;
    power: boolean;
    usageCost: boolean;
    ams: boolean;
    action: boolean;
  }; // Nyomtatók oszlopok láthatósága
  filamentColumnsVisibility?: {
    image: boolean;
    brand: boolean;
    type: boolean;
    color: boolean;
    weight: boolean;
    pricePerKg: boolean;
    action: boolean;
  }; // Filamentek oszlopok láthatósága
  filamentSortConfig?: Array<{ column: keyof Filament; direction: "asc" | "desc" }>; // Filament táblázat rendezési beállításai
  offerSortConfig?: Array<{ key: "date" | "amount" | "status" | "customer" | "id"; direction: "asc" | "desc" }>; // Offers lista rendezési beállításai
  showTutorialOnStartup?: boolean; // Kezdő tutorial megjelenítése indításkor
  tutorialCompleted?: boolean; // Kezdő tutorial megtekintve
  showWelcomeMessageOnStartup?: boolean; // Üdvözlő üzenet megjelenítése indításkor
  showHelpInMenu?: boolean; // Help menüpont megjelenítése a Sidebar-ban
  logRetentionDays?: number; // Log fájlok megtartása napokban (0 = soha ne törölje)
  auditLogRetentionDays?: number; // Audit log fájlok megtartása napokban (0 = soha ne törölje)
  logFormat?: "text" | "json"; // Log fájl formátum (szöveges vagy JSON) - v1.8.0
  logLevel?: "DEBUG" | "INFO" | "WARN" | "ERROR"; // Minimum log szint (csak e feletti szintű logok kerülnek fájlba) - v1.8.0
  hideMacOSNotificationWarning?: boolean; // macOS értesítési figyelmeztetés elrejtése
  dashboardLayout?: import("./types/widgets").DashboardLayout; // Dashboard widget layout
  useWidgetDashboard?: boolean; // Widget dashboard használata (true) vagy klasszikus nézet (false)
  // Backup és emlékeztető beállítások (v1.7.0)
  backupReminderEnabled?: boolean; // Backup emlékeztető bekapcsolása
  backupReminderIntervalDays?: number; // Backup emlékeztető intervallum (napokban)
  automaticBackupEnabled?: boolean; // Automatikus backup bekapcsolása
  automaticBackupIntervalHours?: number; // Automatikus backup intervallum (órákban)
  maxAutomaticBackups?: number; // Maximum automatikus backup-ok száma (régi törlése)
  lastBackupDate?: string; // Utolsó backup dátuma (ISO string)
  // App jelszavas védelem beállítások (v3.0.0)
  appPasswordEnabled?: boolean; // App jelszavas védelem be/kikapcsolása
  autoLockMinutes?: number; // Auto-lock időtartama (0 = nincs auto-lock)
  appPasswordHash?: string | null; // Jelszó hash tárolása (nem plain text!)
  // Ügyféladat titkosítás beállítások (v3.0.0)
  encryptionEnabled?: boolean; // Ügyféladat titkosítás be/kikapcsolása
  encryptionPassword?: string | null; // Titkosítási jelszó hash (nem plain text!) - csak akkor van értéke, ha useAppPasswordForEncryption = false
  encryptedCustomerData?: boolean; // Jelzi, hogy a customer adatok titkosítottak-e
  useAppPasswordForEncryption?: boolean; // Ha true, akkor az app jelszavas védelem jelszavát használja a titkosításhoz
}

export const defaultSettings: Settings = {
  currency: "EUR",
  electricityPrice: 70, // Ft/kWh alap
  language: "hu",
  checkForBetaUpdates: false, // Alapértelmezetten nem ellenőrzi a beta release-eket
  theme: "light", // Alapértelmezett téma
  autosave: false, // Alapértelmezetten ki van kapcsolva
  autosaveInterval: 30, // Alapértelmezett 30 másodperc
  notificationEnabled: true, // Alapértelmezetten engedélyezve
  notificationDuration: 3000, // Alapértelmezett 3 másodperc
  companyInfo: {},
  pdfTemplate: "modern",
  animationSettings: { ...defaultAnimationSettings },
  themeSettings: {
    customThemes: [],
    activeCustomThemeId: undefined,
    autoApplyGradientText: true,
  },
  calendarProvider: "google", // Alapértelmezett naptár szolgáltató
  showTutorialOnStartup: true, // Alapértelmezetten mutassa a tutorialt
  tutorialCompleted: false, // Alapértelmezetten nem tekintették meg
  showWelcomeMessageOnStartup: true, // Alapértelmezetten mutassa az üdvözlő üzenetet
  showHelpInMenu: true, // Alapértelmezetten mutassa a Help menüpontot
  logFormat: "text", // Alapértelmezett log formátum: szöveges (v1.8.0)
  logLevel: "INFO", // Alapértelmezett minimum log szint: INFO (v1.8.0)
  // App jelszavas védelem beállítások (v3.0.0)
  appPasswordEnabled: false, // Alapértelmezetten ki van kapcsolva
  autoLockMinutes: 0, // Alapértelmezetten nincs auto-lock (0 = kikapcsolva)
  appPasswordHash: null, // Alapértelmezetten nincs jelszó hash
  // Ügyféladat titkosítás beállítások (v3.0.0)
  encryptionEnabled: false, // Alapértelmezetten ki van kapcsolva
  encryptionPassword: null, // Alapértelmezetten nincs titkosítási jelszó hash
  encryptedCustomerData: false, // Alapértelmezetten a customer adatok nincsenek titkosítva
  useAppPasswordForEncryption: false, // Alapértelmezetten külön jelszó a titkosításhoz
};

export interface OfferFilament {
  brand: string;
  type: string;
  color?: string;
  colorHex?: string;
  usedGrams: number;
  pricePerKg: number; // EUR
  needsDrying?: boolean;
  dryingTime?: number;
  dryingPower?: number;
  imageBase64?: string;
  colorMode?: ColorMode;
  multiColorHint?: string;
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
  printDueDate?: string; // ISO date string - mikor kell kinyomtatni
  printerName: string;
  printerType: string;
  printerId?: number;
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
  currency: Currency;
  customerId?: number; // Ügyfél ID (nem titkosítva, így megjeleníthető, ha az ügyfél titkosítva van)
  customerName?: string;
  customerContact?: string; // Email vagy telefon
  description?: string;
  profitPercentage?: number; // Profit százalék (10, 20, 30, 40, 50), alapértelmezett 30%
  history?: OfferHistory[]; // Előzmények/verziók
  currentVersion?: number; // Jelenlegi verzió száma
  status?: OfferStatus; // Árajánlat státusz
  statusHistory?: OfferStatusHistory[]; // Státusz előzmények
  statusUpdatedAt?: string; // Utolsó státuszváltás dátuma
  paymentStatus?: "paid" | "unpaid" | "gift"; // Fizetési státusz (csak completed státusz esetén releváns)
  totalFilamentWeightSummary?: {
    perExtruder?: number[];
    total?: number;
  };
  totalFilamentLengthSummary?: {
    perExtruderMm?: number[];
    totalMeters?: number;
  };
  totalFilamentVolumeCm3?: number;
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

// Ügyfél adatbázis
export interface Customer {
  id: number;
  name: string;
  contact?: string; // Email vagy telefon
  company?: string; // Cégnév (opcionális)
  address?: string; // Cím (opcionális)
  notes?: string; // Megjegyzések
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  totalOffers?: number; // Összes árajánlat száma (számított mező)
  lastOfferDate?: string; // Utolsó árajánlat dátuma (számított mező)
}

// Ár előzmények és trendek
export interface PriceHistory {
  id: number;
  filamentBrand: string;
  filamentType: string;
  filamentColor?: string;
  oldPrice: number; // EUR/kg
  newPrice: number; // EUR/kg
  priceChange: number; // Változás összege
  priceChangePercent: number; // Változás százalékban
  date: string; // ISO date string
  currency: Currency;
}

// Filament ár előzmények egy adott filamenthez
export interface FilamentPriceHistory {
  brand: string;
  type: string;
  color?: string;
  history: PriceHistory[];
  currentPrice: number;
  averagePrice?: number; // Átlagos ár az időszakban
  minPrice?: number; // Minimum ár
  maxPrice?: number; // Maximum ár
  priceTrend?: "increasing" | "decreasing" | "stable"; // Ár trend
}

// Projekt adatstruktúra
export type ProjectStatus = "active" | "on-hold" | "completed" | "cancelled";

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  progress: number; // 0-100%
  deadline?: string; // ISO date string
  offerIds: number[]; // Kapcsolt árajánlatok ID-k
  budget?: number; // Költségvetés (EUR)
  actualCost?: number; // Tényleges költség (EUR)
  tags?: string[]; // Projekt címkék/kategóriák
  assignee?: string; // Opcionális: felelős személy (ha multi-user lesz később)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  startedAt?: string; // ISO date string - projekt kezdés dátuma
  completedAt?: string; // ISO date string - projekt befejezés dátuma
}

// Feladat adatstruktúra
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled";

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // ISO date string
  relatedOfferId?: number; // Kapcsolt árajánlat ID (opcionális)
  relatedProjectId?: number; // Kapcsolt projekt ID (opcionális)
  tags?: string[]; // Feladat kategóriák/címkék
  assignee?: string; // Opcionális: felelős személy (ha multi-user lesz később)
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  completedAt?: string; // ISO date string - feladat befejezés dátuma
  isRecurring?: boolean; // Opcionális: ismétlődő feladat
  recurringPattern?: string; // Opcionális: ismétlődési minta (daily, weekly, monthly, stb.)
  nextRecurrenceDate?: string; // Opcionális: következő ismétlődés dátuma
}
