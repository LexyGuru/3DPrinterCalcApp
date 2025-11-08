import rawLibrary from "../data/filamentLibrarySample.json";
import type { FilamentColorOption, FilamentFinish } from "./filamentColors";
import { DEFAULT_COLOR_HEX, normalizeHex } from "./filamentColors";

interface RawLibraryEntry {
  manufacturer?: string | null;
  material?: string | null;
  name?: string | null;
  color?: string | null;
  hex?: string | null;
  id: string;
  finish?: string | null;
  labels?: {
    hu?: string;
    en?: string;
    de?: string;
  } | null;
}

export interface LibraryColorOption extends FilamentColorOption {
  manufacturer: string;
  material: string;
  rawColor: string;
}

const normalizeText = (value?: string | null) => value?.trim() ?? "";

const libraryEntries: LibraryColorOption[] = (rawLibrary as RawLibraryEntry[]).map(entry => {
  const manufacturer = normalizeText(entry.manufacturer) || "Unknown";
  const material = normalizeText(entry.material) || "Unknown";
  const rawColor = normalizeText(entry.color) || normalizeText(entry.name) || "";
  const finish = (normalizeText(entry.finish) || "standard") as FilamentFinish;
  const hex = normalizeHex(entry.hex) || DEFAULT_COLOR_HEX;
  const labels = {
    hu: normalizeText(entry.labels?.hu) || rawColor || entry.id,
    en: normalizeText(entry.labels?.en) || rawColor || entry.id,
    de: normalizeText(entry.labels?.de) || rawColor || entry.id,
  };

  return {
    id: entry.id,
    finish,
    hex,
    labels,
    manufacturer,
    material,
    rawColor,
  };
});

const uniqueSorted = (values: string[]) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "hu", { sensitivity: "base" }));

const allBrands = uniqueSorted(libraryEntries.map(entry => entry.manufacturer));
const allMaterials = uniqueSorted(libraryEntries.map(entry => entry.material));

const groupByBrand = new Map<string, LibraryColorOption[]>();
libraryEntries.forEach(entry => {
  const key = entry.manufacturer.toLowerCase();
  if (!groupByBrand.has(key)) {
    groupByBrand.set(key, []);
  }
  groupByBrand.get(key)!.push(entry);
});

export const getAllBrands = () => allBrands;

export const getAllMaterials = () => allMaterials;

export const getMaterialsForBrand = (brand?: string | null): string[] => {
  const normalized = normalizeText(brand).toLowerCase();
  if (!normalized) {
    return allMaterials;
  }
  const entries = groupByBrand.get(normalized);
  if (!entries) {
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
  const entries = filterEntries(brand, material);
  const unique = new Map<string, LibraryColorOption>();
  entries.forEach(entry => {
    if (!unique.has(entry.id)) {
      unique.set(entry.id, entry);
    }
  });
  return Array.from(unique.values());
};

export const findLibraryColorByLabel = (
  label?: string | null,
  brand?: string | null,
  material?: string | null
): LibraryColorOption | undefined => {
  const search = normalizeText(label).toLowerCase();
  if (!search) {
    return undefined;
  }

  const entries = filterEntries(brand, material);
  return entries.find(entry => {
    const candidates = [
      entry.rawColor,
      entry.labels.hu,
      entry.labels.en,
      entry.labels.de,
    ];
    return candidates.some(value => normalizeText(value).toLowerCase() === search);
  });
};

export const resolveLibraryHexFromName = (
  label?: string | null,
  brand?: string | null,
  material?: string | null
): string | undefined => {
  const match = findLibraryColorByLabel(label, brand, material);
  return match ? normalizeHex(match.hex) : undefined;
};

