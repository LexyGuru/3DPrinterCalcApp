import type { Settings, ColorMode, LocaleStringMap } from "../types";

export type FilamentFinish =
  | "standard"
  | "matte"
  | "silk"
  | "transparent"
  | "metallic"
  | "glow";

export interface FilamentColorOption {
  id: string;
  finish: FilamentFinish;
  hex: string;
  labels: LocaleStringMap<string>;
  colorMode?: ColorMode;
  multiColorHint?: string;
}

export const DEFAULT_COLOR_HEX = "#9CA3AF";

const FINISH_LABELS: Record<FilamentFinish, LocaleStringMap<string>> = {
  standard: { hu: "Standard", en: "Standard", de: "Standard" },
  matte: { hu: "Matt", en: "Matte", de: "Matt" },
  silk: { hu: "Selyem", en: "Silk", de: "Seide" },
  transparent: { hu: "Átlátszó", en: "Transparent", de: "Transparent" },
  metallic: { hu: "Metál", en: "Metallic", de: "Metallisch" },
  glow: { hu: "Világító", en: "Glow", de: "Leuchtend" },
};

const COLOR_PRESETS: Record<string, FilamentColorOption[]> = {
  PLA: [
    { id: "pla-standard-white", finish: "standard", hex: "#E5E7EB", labels: { hu: "Fehér", en: "White", de: "Weiß" } },
    { id: "pla-standard-black", finish: "standard", hex: "#374151", labels: { hu: "Fekete", en: "Black", de: "Schwarz" } },
    { id: "pla-standard-grey", finish: "standard", hex: "#6B7280", labels: { hu: "Szürke", en: "Grey", de: "Grau" } },
    { id: "pla-standard-blue", finish: "standard", hex: "#2563EB", labels: { hu: "Kék", en: "Blue", de: "Blau" } },
    { id: "pla-standard-red", finish: "standard", hex: "#DC2626", labels: { hu: "Piros", en: "Red", de: "Rot" } },
    { id: "pla-standard-green", finish: "standard", hex: "#10B981", labels: { hu: "Zöld", en: "Green", de: "Grün" } },
    { id: "pla-standard-yellow", finish: "standard", hex: "#FACC15", labels: { hu: "Sárga", en: "Yellow", de: "Gelb" } },
    { id: "pla-standard-orange", finish: "standard", hex: "#EAB308", labels: { hu: "Narancs", en: "Orange", de: "Orange" } },
    { id: "pla-standard-purple", finish: "standard", hex: "#7C3AED", labels: { hu: "Lila", en: "Purple", de: "Lila" } },
    { id: "pla-matte-black", finish: "matte", hex: "#111827", labels: { hu: "Matt fekete", en: "Matte Black", de: "Matt Schwarz" } },
    { id: "pla-matte-white", finish: "matte", hex: "#F8FAFC", labels: { hu: "Matt fehér", en: "Matte White", de: "Matt Weiß" } },
    { id: "pla-matte-navy", finish: "matte", hex: "#1D4ED8", labels: { hu: "Matt kék", en: "Matte Blue", de: "Matt Blau" } },
    { id: "pla-matte-emerald", finish: "matte", hex: "#047857", labels: { hu: "Matt zöld", en: "Matte Green", de: "Matt Grün" } },
    { id: "pla-silk-gold", finish: "silk", hex: "#D4AF37", labels: { hu: "Selyem arany", en: "Silk Gold", de: "Seiden-Gold" } },
    { id: "pla-silk-silver", finish: "silk", hex: "#C0C0C0", labels: { hu: "Selyem ezüst", en: "Silk Silver", de: "Seiden-Silber" } },
    { id: "pla-silk-copper", finish: "silk", hex: "#B87333", labels: { hu: "Selyem réz", en: "Silk Copper", de: "Seiden-Kupfer" } },
    { id: "pla-silk-purple", finish: "silk", hex: "#A855F7", labels: { hu: "Selyem lila", en: "Silk Purple", de: "Seiden-Lila" } },
    { id: "pla-transparent-clear", finish: "transparent", hex: "#E5E7EB", labels: { hu: "Átlátszó", en: "Transparent", de: "Transparent" } },
    { id: "pla-glow-green", finish: "glow", hex: "#A7F3D0", labels: { hu: "Világító zöld", en: "Glow Green", de: "Leuchtgrün" } },
    { id: "pla-metallic-steel", finish: "metallic", hex: "#9CA3AF", labels: { hu: "Metál acél", en: "Metallic Steel", de: "Metallisch Stahl" } },
  ],
  PETG: [
    { id: "petg-standard-black", finish: "standard", hex: "#1F2937", labels: { hu: "Fekete", en: "Black", de: "Schwarz" } },
    { id: "petg-standard-white", finish: "standard", hex: "#F9FAFB", labels: { hu: "Fehér", en: "White", de: "Weiß" } },
    { id: "petg-standard-grey", finish: "standard", hex: "#4B5563", labels: { hu: "Szürke", en: "Grey", de: "Grau" } },
    { id: "petg-standard-blue", finish: "standard", hex: "#2563EB", labels: { hu: "Kék", en: "Blue", de: "Blau" } },
    { id: "petg-standard-red", finish: "standard", hex: "#D14343", labels: { hu: "Piros", en: "Red", de: "Rot" } },
    { id: "petg-standard-green", finish: "standard", hex: "#10B981", labels: { hu: "Zöld", en: "Green", de: "Grün" } },
    { id: "petg-transparent", finish: "transparent", hex: "#D1D5DB", labels: { hu: "Átlátszó", en: "Transparent", de: "Transparent" } },
  ],
  ABS: [
    { id: "abs-standard-black", finish: "standard", hex: "#1F2937", labels: { hu: "Fekete", en: "Black", de: "Schwarz" } },
    { id: "abs-standard-white", finish: "standard", hex: "#F3F4F6", labels: { hu: "Fehér", en: "White", de: "Weiß" } },
    { id: "abs-standard-grey", finish: "standard", hex: "#6B7280", labels: { hu: "Szürke", en: "Grey", de: "Grau" } },
    { id: "abs-standard-blue", finish: "standard", hex: "#1D4ED8", labels: { hu: "Kék", en: "Blue", de: "Blau" } },
    { id: "abs-standard-red", finish: "standard", hex: "#B91C1C", labels: { hu: "Piros", en: "Red", de: "Rot" } },
    { id: "abs-standard-green", finish: "standard", hex: "#047857", labels: { hu: "Zöld", en: "Green", de: "Grün" } },
  ],
  TPU: [
    { id: "tpu-standard-black", finish: "standard", hex: "#111827", labels: { hu: "Fekete", en: "Black", de: "Schwarz" } },
    { id: "tpu-standard-white", finish: "standard", hex: "#F9FAFB", labels: { hu: "Fehér", en: "White", de: "Weiß" } },
    { id: "tpu-standard-grey", finish: "standard", hex: "#6B7280", labels: { hu: "Szürke", en: "Grey", de: "Grau" } },
    { id: "tpu-standard-blue", finish: "standard", hex: "#3B82F6", labels: { hu: "Kék", en: "Blue", de: "Blau" } },
    { id: "tpu-standard-red", finish: "standard", hex: "#F87171", labels: { hu: "Piros", en: "Red", de: "Rot" } },
    { id: "tpu-transparent", finish: "transparent", hex: "#E5E7EB", labels: { hu: "Átlátszó", en: "Transparent", de: "Transparent" } },
  ],
  NYLON: [
    { id: "nylon-standard-natural", finish: "standard", hex: "#F5F5F5", labels: { hu: "Natúr", en: "Natural", de: "Natur" } },
    { id: "nylon-standard-black", finish: "standard", hex: "#1F2937", labels: { hu: "Fekete", en: "Black", de: "Schwarz" } },
    { id: "nylon-standard-grey", finish: "standard", hex: "#4B5563", labels: { hu: "Szürke", en: "Grey", de: "Grau" } },
    { id: "nylon-standard-blue", finish: "standard", hex: "#1E40AF", labels: { hu: "Kék", en: "Blue", de: "Blau" } },
    { id: "nylon-standard-green", finish: "standard", hex: "#0F766E", labels: { hu: "Zöld", en: "Green", de: "Grün" } },
  ],
  DEFAULT: [
    { id: "default-white", finish: "standard", hex: "#F3F4F6", labels: { hu: "Fehér", en: "White", de: "Weiß" } },
    { id: "default-black", finish: "standard", hex: "#1F2937", labels: { hu: "Fekete", en: "Black", de: "Schwarz" } },
    { id: "default-grey", finish: "standard", hex: "#9CA3AF", labels: { hu: "Szürke", en: "Grey", de: "Grau" } },
    { id: "default-blue", finish: "standard", hex: "#2563EB", labels: { hu: "Kék", en: "Blue", de: "Blau" } },
    { id: "default-red", finish: "standard", hex: "#DC2626", labels: { hu: "Piros", en: "Red", de: "Rot" } },
    { id: "default-green", finish: "standard", hex: "#16A34A", labels: { hu: "Zöld", en: "Green", de: "Grün" } },
    { id: "default-yellow", finish: "standard", hex: "#FACC15", labels: { hu: "Sárga", en: "Yellow", de: "Gelb" } },
    { id: "default-orange", finish: "standard", hex: "#F97316", labels: { hu: "Narancs", en: "Orange", de: "Orange" } },
    { id: "default-purple", finish: "standard", hex: "#8B5CF6", labels: { hu: "Lila", en: "Purple", de: "Lila" } },
  ],
};

const ALL_COLOR_OPTIONS: FilamentColorOption[] = Object.values(COLOR_PRESETS).flat();

const COLOR_KEYWORD_HEX: Array<{ regex: RegExp; hex: string }> = [
  { regex: /(natural\s*brown|brown\s*natural|brown|kávé|kave|coffee)/i, hex: "#8B4513" },
  { regex: /(woodfill|wood\s?grain|mahogany|walnut|chestnut|oak)/i, hex: "#8B5A2B" },
  { regex: /(beige|tan|sand)/i, hex: "#D2B48C" },
  { regex: /(ivory|cream)/i, hex: "#FFF8E1" },
  { regex: /(ég\s*kék|eg\s*kek|sky\s*blue|light\s*blue)/i, hex: "#87CEEB" },
  { regex: /(szivárvány|szivarvany|rainbow|multicolor|multi[\s-]?color)/i, hex: "#FF0000" }, // Multicolor placeholder
];

export function normalizeHex(hex?: string | null): string {
  if (!hex) return "";
  const match = hex.trim().match(/^#?([0-9a-fA-F]{6})$/);
  return match ? `#${match[1].toUpperCase()}` : "";
}

export function extractHexFromString(value: string): string | null {
  if (!value) return null;
  const match = value.match(/#([0-9a-fA-F]{6})/);
  return match ? `#${match[1].toUpperCase()}` : null;
}

export function getColorOptionsForType(type: string): FilamentColorOption[] {
  if (!type) {
    return COLOR_PRESETS.DEFAULT;
  }
  const normalized = type.toLowerCase();
  if (normalized.includes("pla")) return COLOR_PRESETS.PLA;
  if (normalized.includes("petg")) return COLOR_PRESETS.PETG;
  if (normalized.includes("abs")) return COLOR_PRESETS.ABS;
  if (normalized.includes("tpu") || normalized.includes("flex")) return COLOR_PRESETS.TPU;
  if (normalized.includes("nylon") || normalized.includes("pa6") || normalized.includes("pa12")) return COLOR_PRESETS.NYLON;
  return COLOR_PRESETS.DEFAULT;
}

export function getLocalizedColorLabel(option: FilamentColorOption, language: Settings["language"]): string {
  return option.labels[language] ?? option.labels.en;
}

export function getFinishLabel(finish: FilamentFinish, language: Settings["language"]): string {
  const labels = FINISH_LABELS[finish];
  return labels ? labels[language] ?? labels.en : finish;
}

export function findColorOptionByLabel(label?: string | null): FilamentColorOption | undefined {
  if (!label) return undefined;
  const normalized = label.trim().toLowerCase();
  if (!normalized) return undefined;
  
  // First try exact match
  let match = ALL_COLOR_OPTIONS.find(option =>
    Object.values(option.labels).some(value => value.toLowerCase() === normalized)
  );
  
  // If no exact match, try fuzzy matching (remove accents, spaces, special chars)
  if (!match) {
    const fuzzySearch = normalized
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    
    match = ALL_COLOR_OPTIONS.find(option =>
      Object.values(option.labels).some(value => {
        const normalizedValue = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "");
        return normalizedValue === fuzzySearch || normalizedValue.includes(fuzzySearch) || fuzzySearch.includes(normalizedValue);
      })
    );
  }
  
  // If still no match, try partial matching (e.g., "Ég Kék" -> "Kék")
  if (!match && normalized.includes(" ")) {
    const words = normalized.split(/\s+/).filter(w => w.length > 2);
    for (const word of words) {
      match = ALL_COLOR_OPTIONS.find(option =>
        Object.values(option.labels).some(value => {
          const normalizedValue = value.toLowerCase();
          return normalizedValue === word || normalizedValue.includes(word) || word.includes(normalizedValue);
        })
      );
      if (match) break;
    }
  }
  
  return match;
}

export function resolveColorHexFromName(label?: string | null): string | undefined {
  if (!label) return undefined;
  const hexInString = extractHexFromString(label);
  if (hexInString) return normalizeHex(hexInString);
  const option = findColorOptionByLabel(label);
  if (option) {
    return normalizeHex(option.hex);
  }
  const keywordEntry = COLOR_KEYWORD_HEX.find(entry => entry.regex.test(label));
  if (keywordEntry) {
    return normalizeHex(keywordEntry.hex);
  }
  return undefined;
}

