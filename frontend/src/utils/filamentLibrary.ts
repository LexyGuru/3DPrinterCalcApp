import type { FilamentColorOption, FilamentFinish } from "./filamentColors";
import type { ColorMode } from "../types";
import { normalizeHex, resolveColorHexFromName } from "./filamentColors";
import { translateText } from "./translator";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export interface RawLibraryEntry {
  manufacturer?: string | null;
  material?: string | null;
  name?: string | null;
  color?: string | null;
  hex?: string | null;
  id?: string | null;
  finish?: string | null;
  colorMode?: ColorMode | null;
  multiColorHint?: string | null;
  labels?: {
    hu?: string | null;
    en?: string | null;
    de?: string | null;
  } | null;
}

export interface LibraryColorOption extends FilamentColorOption {
  manufacturer: string;
  material: string;
  rawColor: string;
  colorMode: ColorMode;
  multiColorHint?: string;
}

type LibraryListener = () => void;

// Lazy load the default library to avoid issues on Windows with large static imports
let rawLibraryCache: RawLibraryEntry[] | null = null;

const loadDefaultLibrary = async (): Promise<RawLibraryEntry[]> => {
  if (rawLibraryCache) {
    return rawLibraryCache;
  }
  
  try {
    // Try dynamic import (works on all platforms)
    const module = await import("../data/filamentLibrarySample.json");
    rawLibraryCache = module.default as RawLibraryEntry[];
    console.log("[FilamentLibrary] Loaded default library via dynamic import", { count: rawLibraryCache.length });
    return rawLibraryCache;
  } catch (error) {
    console.warn("[FilamentLibrary] Failed to load default library via dynamic import, trying fallback", error);
    // Fallback: return empty array, the library will be loaded from disk or created
    return [];
  }
};

const CUSTOM_LIBRARY_FILE = "filamentLibrary.json";
const FALLBACK_HEX = "#9CA3AF";
const FINISH_WHITELIST: FilamentFinish[] = ["standard", "matte", "silk", "transparent", "metallic", "glow"];

const MULTICOLOR_KEYWORDS: RegExp[] = [
  /rainbow/i,
  /multi[\s-]?color/i,
  /multicolou?r/i,
  /dual[\s-]?color/i,
  /bi[\s-]?color/i,
  /tri[\s-]?color/i,
  /tricolou?r/i,
  /color\s*(?:shift|change)/i,
  /gradient/i,
  /mix(?:ed)?\s*color/i,
  /rainblow/i,
  /marble\s*(?:blend|mix)?/i,
  /silk\s*rainbow/i,
];

const detectColorMode = (entry: RawLibraryEntry, normalizedHex: string): { colorMode: ColorMode; multiColorHint?: string } => {
  if (entry.colorMode === "multicolor") {
    return { colorMode: "multicolor", multiColorHint: entry.multiColorHint ?? entry.color ?? entry.name ?? undefined };
  }
  const candidates = [
    entry.color,
    entry.name,
    entry.labels?.hu,
    entry.labels?.en,
    entry.labels?.de,
  ];
  const keywordMatch = candidates.some(value => value && MULTICOLOR_KEYWORDS.some(regex => regex.test(value)));
  if (keywordMatch) {
    const hintSource = candidates.find(value => value && MULTICOLOR_KEYWORDS.some(regex => regex.test(value)));
    return { colorMode: "multicolor", multiColorHint: entry.multiColorHint ?? hintSource ?? undefined };
  }
  if (!normalizedHex) {
    return { colorMode: "multicolor", multiColorHint: entry.multiColorHint ?? entry.color ?? entry.name ?? undefined };
  }
  return { colorMode: "solid" };
};

const normalizeText = (value?: string | null) => value?.trim() ?? "";
const normalizeHexOrFallback = (value?: string | null) => normalizeHex(value) || FALLBACK_HEX;

const slugify = (value: string) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "hu", { sensitivity: "base" }));

const listeners = new Set<LibraryListener>();

let initializePromise: Promise<void> | null = null;
let libraryLoaded = false;

// Initialize with empty array, will be populated during initialization
let currentEntries: RawLibraryEntry[] = [];
let rawEntries: RawLibraryEntry[] = [];
let libraryEntries: LibraryColorOption[] = [];
let allBrands: string[] = [];
let allMaterials: string[] = [];
let groupByBrand = new Map<string, LibraryColorOption[]>();

const notifyListeners = () => {
  listeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error("[FilamentLibrary] Listener error", error);
    }
  });
};

const normalizeRawEntry = (entry: RawLibraryEntry): RawLibraryEntry => {
  const manufacturer = normalizeText(entry.manufacturer) || "Unknown";
  const material = normalizeText(entry.material) || "Unknown";
  const rawColor = normalizeText(entry.color) || normalizeText(entry.name) || "";
  const finishCandidate = normalizeText(entry.finish).toLowerCase() as FilamentFinish;
  const finish = FINISH_WHITELIST.includes(finishCandidate) ? finishCandidate : "standard";
  const labels = {
    hu: normalizeText(entry.labels?.hu) || rawColor || manufacturer,
    en: normalizeText(entry.labels?.en) || rawColor || manufacturer,
    de: normalizeText(entry.labels?.de) || rawColor || manufacturer,
  };

  const id =
    normalizeText(entry.id) ||
    generateLibraryId(manufacturer, material, finish, rawColor || labels.en);

  const normalizedHexValue = normalizeHex(entry.hex);
  const { colorMode, multiColorHint } = detectColorMode(entry, normalizedHexValue);
  const hex = normalizedHexValue || "";

  return {
    id,
    manufacturer,
    material,
    color: rawColor,
    name: normalizeText(entry.name) || rawColor,
    finish,
    hex,
    labels,
    colorMode,
    multiColorHint,
  };
};

const rebuildGroupMap = () => {
  groupByBrand = new Map<string, LibraryColorOption[]>();
  libraryEntries.forEach(entry => {
    const key = entry.manufacturer.toLowerCase();
    if (!groupByBrand.has(key)) {
      groupByBrand.set(key, []);
    }
    groupByBrand.get(key)!.push(entry);
  });
};

const rebuildIndex = (entries: RawLibraryEntry[], notify = true) => {
  console.log("[FilamentLibrary] rebuildIndex invoked", {
    incoming: entries.length,
    notify,
  });
  currentEntries = dedupeRawEntries(entries);
  rawEntries = currentEntries.map(normalizeRawEntry);
  libraryEntries = rawEntries.map(entry => ({
    id: entry.id!,
    finish: (entry.finish ?? "standard") as FilamentFinish,
    hex: normalizeHexOrFallback(entry.hex),
    labels: {
      hu: normalizeText(entry.labels?.hu) || entry.color || entry.name || entry.id!,
      en: normalizeText(entry.labels?.en) || entry.color || entry.name || entry.id!,
      de: normalizeText(entry.labels?.de) || entry.color || entry.name || entry.id!,
    },
    manufacturer: entry.manufacturer ?? "Unknown",
    material: entry.material ?? "Unknown",
    rawColor: entry.color ?? entry.name ?? "",
    colorMode: (entry.colorMode as ColorMode) ?? "solid",
    multiColorHint: entry.multiColorHint ?? undefined,
  }));
  allBrands = uniqueSorted(libraryEntries.map(entry => entry.manufacturer));
  allMaterials = uniqueSorted(libraryEntries.map(entry => entry.material));
  rebuildGroupMap();
  if (notify) {
    notifyListeners();
    console.log("[FilamentLibrary] rebuildIndex notifyListeners called", {
      listeners: listeners.size,
      brands: allBrands.length,
      materials: allMaterials.length,
    });
  }
};

const dedupeRawEntries = (entries: RawLibraryEntry[]): RawLibraryEntry[] => {
  const map = new Map<string, RawLibraryEntry>();
  entries.forEach(entry => {
    const normalized = normalizeRawEntry(entry);
    const key = generateLibraryId(
      normalized.manufacturer ?? "",
      normalized.material ?? "",
      (normalized.finish as string) ?? "standard",
      normalized.color ?? normalized.name ?? normalized.labels?.en ?? normalized.labels?.hu ?? normalized.id ?? ""
    );
    map.set(key, {
      id: normalized.id || key,
      manufacturer: normalized.manufacturer,
      material: normalized.material,
      color: normalized.color,
      name: normalized.name,
      finish: normalized.finish,
      hex: normalizeHexOrFallback(normalized.hex),
      labels: normalized.labels,
      colorMode: normalized.colorMode,
      multiColorHint: normalized.multiColorHint,
    });
  });
  return Array.from(map.values());
};

const readLibraryFromDisk = async (): Promise<RawLibraryEntry[]> => {
  console.log("[FilamentLibrary] Attempting to read library from disk", {
    baseDir: "AppConfig",
    file: CUSTOM_LIBRARY_FILE,
  });
  let baseEntries: RawLibraryEntry[] | null = null;
  try {
    const content = await readTextFile(CUSTOM_LIBRARY_FILE, {
      baseDir: BaseDirectory.AppConfig,
    });
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      baseEntries = parsed as RawLibraryEntry[];
      console.log("[FilamentLibrary] Loaded base library entries", { count: baseEntries.length });
    }
  } catch (error) {
    console.error("[FilamentLibrary] Failed to read base library file", error);
    try {
      // Load default library dynamically (works on all platforms)
      const defaults = await loadDefaultLibrary();
      if (defaults.length > 0) {
        console.warn("[FilamentLibrary] Recreating library file from bundled defaults", { count: defaults.length });
        await writeTextFile(
          CUSTOM_LIBRARY_FILE,
          JSON.stringify(defaults, null, 2),
          {
            baseDir: BaseDirectory.AppConfig,
          }
        );
        baseEntries = defaults;
      } else {
        console.error("[FilamentLibrary] Default library is empty, cannot recreate file");
      }
    } catch (writeError) {
      console.error("[FilamentLibrary] Failed to recreate library file", writeError);
    }
  }

  if (!baseEntries || baseEntries.length === 0) {
    // Final fallback: try to load default library
    baseEntries = await loadDefaultLibrary();
    if (baseEntries.length === 0) {
      console.error("[FilamentLibrary] No library entries available, using empty array");
      baseEntries = [];
    }
  }

  let updateEntries: RawLibraryEntry[] = [];
  try {
    console.log("[FilamentLibrary] Attempting to read update library file", {
      baseDir: "AppConfig",
      file: "update_filamentLibrary.json",
    });
    
    const updateContent = await readTextFile("update_filamentLibrary.json", {
      baseDir: BaseDirectory.AppConfig,
    });
    
    if (!updateContent || updateContent.trim().length === 0) {
      console.log("[FilamentLibrary] Update filament library file is empty");
      return baseEntries;
    }
    
    console.log("[FilamentLibrary] Update library file read successfully", {
      contentLength: updateContent.length,
      firstChars: updateContent.substring(0, 100),
    });
    
    const parsed = JSON.parse(updateContent);
    if (Array.isArray(parsed)) {
      updateEntries = parsed as RawLibraryEntry[];
      console.log("[FilamentLibrary] Loaded update library entries", { count: updateEntries.length });
    } else {
      console.warn("[FilamentLibrary] Update filament library file does not contain an array", { 
        type: typeof parsed,
        keys: parsed ? Object.keys(parsed) : null 
      });
    }
  } catch (error) {
    // Check if the error is a "file not found" error (ENOENT or Windows equivalent)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = (error as { code?: string }).code;
    const isFileNotFound = 
      errorCode === "ENOENT" || 
      errorMessage.includes("not found") ||
      errorMessage.includes("nem találja") ||
      errorMessage.includes("os error 2") ||
      errorMessage.includes("No such file") ||
      errorMessage.includes("cannot find the file") ||
      errorMessage.includes("cannot find the path");
    
    if (!isFileNotFound) {
      console.warn("[FilamentLibrary] Update filament library not applied", {
        error: errorMessage,
        code: errorCode,
        fullError: error
      });
    } else {
      console.log("[FilamentLibrary] No update filament library found (file does not exist)", {
        errorCode,
        errorMessage,
      });
    }
  }

  if (!updateEntries.length) {
    return baseEntries;
  }

  console.log("[FilamentLibrary] Merging base library with update entries");
  const merged = dedupeRawEntries([...baseEntries, ...updateEntries]);
  console.log("[FilamentLibrary] Merge completed", {
    base: baseEntries.length,
    updates: updateEntries.length,
    result: merged.length,
  });
  return merged;
};

const writeLibraryToDisk = async (entries: RawLibraryEntry[]) => {
  try {
    console.log("[FilamentLibrary] Writing library to disk", {
      count: entries.length,
      file: CUSTOM_LIBRARY_FILE,
    });
    await writeTextFile(
      CUSTOM_LIBRARY_FILE,
      JSON.stringify(entries, null, 2),
      {
        baseDir: BaseDirectory.AppConfig,
      }
    );
  } catch (error) {
    console.error("[FilamentLibrary] Failed to write library file", error);
    throw error;
  }
};

const initializeLibrary = async () => {
  if (libraryLoaded) {
    return;
  }
  if (!initializePromise) {
    initializePromise = (async () => {
      const entries = await readLibraryFromDisk();
      rebuildIndex(entries, false);
      libraryLoaded = true;
      if (import.meta.env.DEV) {
        console.log("[FilamentLibrary] initializeLibrary completed", { entries: entries.length });
      }
    })().finally(() => {
      initializePromise = null;
    });
  }
  return initializePromise;
};

export const ensureLibraryOverridesLoaded = () => {
  // Silently ensure library is loaded (no logging to reduce noise)
  void initializeLibrary();
};

export const subscribeToLibraryChanges = (listener: LibraryListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const generateLibraryId = (
  manufacturer: string,
  material: string,
  finish: string,
  color: string
) => {
  const parts = [manufacturer, material, finish, color].map(slugify).filter(Boolean);
  return parts.join("-") || `custom-${Date.now()}`;
};

export const getLibrarySnapshot = (): RawLibraryEntry[] =>
  rawEntries.map(entry => ({
    ...entry,
    labels: entry.labels
      ? { ...entry.labels }
      : { hu: "", en: "", de: "" },
  }));

export const getAllBrands = () => {
  ensureLibraryOverridesLoaded();
  return allBrands;
};

export const getAllMaterials = () => {
  ensureLibraryOverridesLoaded();
  return allMaterials;
};

export const getAllLibraryEntries = (): LibraryColorOption[] => {
  ensureLibraryOverridesLoaded();
  return libraryEntries;
};

export const getMaterialsForBrand = (brand?: string | null): string[] => {
  ensureLibraryOverridesLoaded();
  const normalized = normalizeText(brand).toLowerCase();
  if (!normalized) {
    return allMaterials;
  }
  const entries = groupByBrand.get(normalized);
  if (!entries) {
    console.warn(`[FilamentLibrary] No materials found for brand: ${brand ?? "<empty>"}`);
    return [];
  }
  return uniqueSorted(entries.map(entry => entry.material));
};

const filterEntries = (brand?: string | null, material?: string | null): LibraryColorOption[] => {
  const normalizedBrand = normalizeText(brand).toLowerCase();
  const normalizedMaterial = normalizeText(material).toLowerCase();

  return libraryEntries.filter(entry => {
    const brandMatch = !normalizedBrand || entry.manufacturer.toLowerCase() === normalizedBrand;
    const materialMatch = !normalizedMaterial || entry.material.toLowerCase() === normalizedMaterial;
    return brandMatch && materialMatch;
  });
};

export const getLibraryColorOptions = (brand?: string | null, material?: string | null): LibraryColorOption[] => {
  ensureLibraryOverridesLoaded();
  const entries = filterEntries(brand, material);
  const unique = new Map<string, LibraryColorOption>();
  entries.forEach(entry => {
    if (!unique.has(entry.id)) {
      unique.set(entry.id, entry);
    }
  });
  const options = Array.from(unique.values());
  if (!options.length) {
    console.warn("[FilamentLibrary] No color options found for", { brand, material });
  }
  return options;
};

const containsHungarianCharacters = (text: string): boolean => {
  // Check for Hungarian-specific characters (á, é, í, ó, ö, ő, ú, ü, ű)
  return /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/.test(text);
};

export const findLibraryColorByLabel = (
  label?: string | null,
  brand?: string | null,
  material?: string | null
): LibraryColorOption | undefined => {
  ensureLibraryOverridesLoaded();
  const search = normalizeText(label).toLowerCase();
  if (!search) {
    return undefined;
  }

  const entries = filterEntries(brand, material);
  const isHungarian = containsHungarianCharacters(normalizeText(label));
  
  // First try exact match
  let match = entries.find(entry => {
    const candidates = [
      entry.rawColor,
      entry.labels.hu,
      entry.labels.en,
      entry.labels.de,
    ];
    return candidates.some(value => normalizeText(value).toLowerCase() === search);
  });
  
  // If no exact match and Hungarian text, try fuzzy matching (remove accents, spaces, special chars)
  if (!match && isHungarian) {
    const fuzzySearch = search
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    
    match = entries.find(entry => {
      const candidates = [
        entry.rawColor,
        entry.labels.hu,
        entry.labels.en,
        entry.labels.de,
      ];
      return candidates.some(value => {
        const normalized = normalizeText(value)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "");
        return normalized === fuzzySearch || normalized.includes(fuzzySearch) || fuzzySearch.includes(normalized);
      });
    });
  }
  
  // If still no match and Hungarian text, try partial matching (e.g., "Ég Kék" -> "Kék")
  if (!match && isHungarian && search.includes(" ")) {
    const words = search.split(/\s+/).filter(w => w.length > 2);
    for (const word of words) {
      match = entries.find(entry => {
        const candidates = [
          entry.rawColor,
          entry.labels.hu,
          entry.labels.en,
          entry.labels.de,
        ];
        return candidates.some(value => {
          const normalized = normalizeText(value).toLowerCase();
          return normalized === word || normalized.includes(word) || word.includes(normalized);
        });
      });
      if (match) break;
    }
  }
  
  if (match) {
    console.log("[FilamentLibrary] Matched library color", {
      label,
      brand,
      material,
      entryId: match.id,
      rawColor: match.rawColor,
      labels: match.labels,
      hex: match.hex,
    });
  }
  return match;
};

export const resolveLibraryHexFromName = (
  label?: string | null,
  brand?: string | null,
  material?: string | null
): string | undefined => {
  const match = findLibraryColorByLabel(label, brand, material);
  if (match) {
    return normalizeHex(match.hex);
  }
  
  // Fallback to filamentColors.ts color resolution (only for Hungarian labels)
  const isHungarian = label ? containsHungarianCharacters(normalizeText(label)) : false;
  if (isHungarian) {
    const fallbackHex = resolveColorHexFromName(label);
    if (fallbackHex) {
      if (import.meta.env.DEV) {
        console.log("[FilamentLibrary] Resolved hex via fallback", { label, brand, material, hex: fallbackHex });
      }
      return fallbackHex;
    }
  }
  
  // Only warn if library is already loaded and we still couldn't resolve the color
  // This prevents false warnings during initial library loading
  if (libraryLoaded) {
    console.warn("[FilamentLibrary] Could not resolve hex for", { label, brand, material });
  }
  return undefined;
};

export const persistLibraryEntries = async (entries: RawLibraryEntry[]) => {
  console.log("[FilamentLibrary] persistLibraryEntries invoked", { incoming: entries.length });
  await initializeLibrary();
  const deduped = dedupeRawEntries(entries);
  console.log("[FilamentLibrary] persistLibraryEntries after dedupe", { deduped: deduped.length });
  await writeLibraryToDisk(deduped);
  rebuildIndex(deduped);
};

export const resetLibraryToDefaults = async () => {
  await initializeLibrary();
  const defaults = await loadDefaultLibrary();
  await writeLibraryToDisk(defaults);
  rebuildIndex(defaults);
};

const SUPPORTED_LANGS: Array<"hu" | "en" | "de"> = ["hu", "en", "de"];

const normalizeLanguageCode = (lang?: string): "hu" | "en" | "de" => {
  const value = (lang ?? "en").toLowerCase();
  if (value.startsWith("hu")) return "hu";
  if (value.startsWith("de")) return "de";
  return "en";
};

export interface EnsureLibraryEntryOptions {
  manufacturer: string;
  material: string;
  color: string;
  hex?: string;
  finish?: string;
  baseLabel?: string;
  sourceLanguage?: string;
  colorMode?: ColorMode;
  multiColorHint?: string;
}

const FILAMENT_FINISHES: FilamentFinish[] = ["standard", "matte", "silk", "transparent", "metallic", "glow"];

export const ensureLibraryEntry = async (options: EnsureLibraryEntryOptions) => {
  console.log("[FilamentLibrary] ensureLibraryEntry invoked", options);
  await initializeLibrary();
  const manufacturer = normalizeText(options.manufacturer);
  const material = normalizeText(options.material);
  const color = normalizeText(options.color);
  if (!manufacturer || !material || !color) {
    console.warn("[FilamentLibrary] ensureLibraryEntry skipped due to missing fields", options);
    return;
  }

  const finishCandidate = normalizeText(options.finish)?.toLowerCase() as FilamentFinish | undefined;
  const finish: FilamentFinish = finishCandidate && FILAMENT_FINISHES.includes(finishCandidate)
    ? finishCandidate
    : "standard";

  const sourceLanguage = normalizeLanguageCode(options.sourceLanguage);
  const baseLabel = normalizeText(options.baseLabel) || color;

  const labels: Record<"hu" | "en" | "de", string> = {
    hu: "",
    en: "",
    de: "",
  };
  labels[sourceLanguage] = baseLabel;

  await Promise.all(
    SUPPORTED_LANGS.map(async lang => {
      if (!labels[lang]) {
        if (lang === sourceLanguage) {
          labels[lang] = baseLabel;
          return;
        }
        try {
          const translated = await translateText(baseLabel, sourceLanguage, lang);
          labels[lang] = translated.trim() || baseLabel;
        } catch (error) {
          console.warn("[FilamentLibrary] Translation failed, reusing base label", { baseLabel, lang, error });
          labels[lang] = baseLabel;
        }
      }
    })
  );

  const resolvedHex = options.hex ? normalizeHex(options.hex) : undefined;
  const requestedColorMode = options.colorMode === "multicolor" ? "multicolor" : "solid";
  const colorMode: ColorMode =
    requestedColorMode === "multicolor" || (!resolvedHex && !options.hex) ? "multicolor" : "solid";
  const multiColorHint = options.multiColorHint ?? (colorMode === "multicolor" ? baseLabel : undefined);

  const entry: RawLibraryEntry = {
    id: generateLibraryId(manufacturer, material, finish, color),
    manufacturer,
    material,
    color,
    name: color,
    finish,
    hex: resolvedHex,
    labels,
    colorMode,
    multiColorHint,
  };

  const updated = dedupeRawEntries([...currentEntries, entry]);
  console.log("[FilamentLibrary] ensureLibraryEntry deduped entries", {
    previous: currentEntries.length,
    next: updated.length,
    entryId: entry.id,
  });
  await writeLibraryToDisk(updated);
  rebuildIndex(updated);
};

// Initialize library asynchronously (will load default library and then disk version)
void (async () => {
  try {
    // Load default library first to seed the initial state
    const defaults = await loadDefaultLibrary();
    if (defaults.length > 0) {
      currentEntries = defaults.map(entry => ({ ...entry }));
      rebuildIndex(currentEntries, false);
    }
    // Then initialize from disk (which will merge with defaults if needed)
    await initializeLibrary();
  } catch (error) {
    console.error("[FilamentLibrary] Failed to initialize library", error);
    // Continue with empty library if initialization fails
    rebuildIndex([], false);
  }
})();



