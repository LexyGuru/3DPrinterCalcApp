import rawLibrary from "../data/filamentLibrarySample.json";
import type { FilamentColorOption, FilamentFinish } from "./filamentColors";
import { normalizeHex } from "./filamentColors";
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
}

type LibraryListener = () => void;

const CUSTOM_LIBRARY_FILE = "filamentLibrary.json";
const FALLBACK_HEX = "#9CA3AF";
const FINISH_WHITELIST: FilamentFinish[] = ["standard", "matte", "silk", "transparent", "metallic", "glow"];

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

let currentEntries: RawLibraryEntry[] = (rawLibrary as RawLibraryEntry[]).map(entry => ({ ...entry }));
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

  return {
    id,
    manufacturer,
    material,
    color: rawColor,
    name: normalizeText(entry.name) || rawColor,
    finish,
    hex: normalizeHexOrFallback(entry.hex),
    labels,
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
    });
  });
  return Array.from(map.values());
};

const readLibraryFromDisk = async (): Promise<RawLibraryEntry[]> => {
  console.log("[FilamentLibrary] Attempting to read library from disk", {
    baseDir: "AppConfig",
    file: CUSTOM_LIBRARY_FILE,
  });
  try {
    const content = await readTextFile(CUSTOM_LIBRARY_FILE, {
      baseDir: BaseDirectory.AppConfig,
    });
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      console.log("[FilamentLibrary] Loaded library entries", { count: parsed.length });
      return parsed as RawLibraryEntry[];
    }
  } catch (error) {
    console.error("[FilamentLibrary] Failed to read library file", error);
    try {
      const defaults = rawLibrary as RawLibraryEntry[];
      console.warn("[FilamentLibrary] Recreating library file from bundled defaults", { count: defaults.length });
      await writeTextFile(
        CUSTOM_LIBRARY_FILE,
        JSON.stringify(defaults, null, 2),
        {
          baseDir: BaseDirectory.AppConfig,
        }
      );
      return defaults;
    } catch (writeError) {
      console.error("[FilamentLibrary] Failed to recreate library file", writeError);
    }
  }
  return rawLibrary as RawLibraryEntry[];
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
    console.log("[FilamentLibrary] initializeLibrary skipped (already loaded)");
    return;
  }
  console.log("[FilamentLibrary] initializeLibrary starting");
  if (!initializePromise) {
    initializePromise = (async () => {
      const entries = await readLibraryFromDisk();
      rebuildIndex(entries, false);
      libraryLoaded = true;
      console.log("[FilamentLibrary] initializeLibrary completed", { entries: entries.length });
    })().finally(() => {
      initializePromise = null;
    });
  }
  return initializePromise;
};

export const ensureLibraryOverridesLoaded = () => {
  console.log("[FilamentLibrary] ensureLibraryOverridesLoaded invoked");
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
  const match = entries.find(entry => {
    const candidates = [
      entry.rawColor,
      entry.labels.hu,
      entry.labels.en,
      entry.labels.de,
    ];
    return candidates.some(value => normalizeText(value).toLowerCase() === search);
  });
  if (!match) {
    console.warn("[FilamentLibrary] No matching color label found", { label, brand, material });
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
  if (!match) {
    console.warn("[FilamentLibrary] Could not resolve hex for", { label, brand, material });
  }
  return match ? normalizeHex(match.hex) : undefined;
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
  const defaults = (rawLibrary as RawLibraryEntry[]).map(entry => ({ ...entry }));
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

  const entry: RawLibraryEntry = {
    id: generateLibraryId(manufacturer, material, finish, color),
    manufacturer,
    material,
    color,
    name: color,
    finish,
    hex: resolvedHex,
    labels,
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

// Seed with bundled data synchronously for initial render.
rebuildIndex(currentEntries, false);
void initializeLibrary();



