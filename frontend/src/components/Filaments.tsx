import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { open } from "@tauri-apps/plugin-shell";
import type { Filament, Settings, ColorMode } from "../types";
import { defaultAnimationSettings } from "../types";
import type { Theme } from "../utils/themes";
import { filamentPrice } from "../utils/filamentCalc";
import { useTranslation } from "../utils/translations";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
import { Tooltip } from "./Tooltip";
import { EmptyState } from "./EmptyState";
import { useUndoRedo } from "../hooks/useUndoRedo";
import { useOptimisticUpdate } from "../hooks/useOptimisticUpdate";
import { saveFilaments } from "../utils/store";
import { validateFilamentWeight, validateFilamentPrice } from "../utils/validation";
import type { FilamentFinish, FilamentColorOption } from "../utils/filamentColors";
import {
  DEFAULT_COLOR_HEX,
  getColorOptionsForType,
  getLocalizedColorLabel,
  getFinishLabel,
  extractHexFromString,
  findColorOptionByLabel,
  normalizeHex,
  resolveColorHexFromName,
} from "../utils/filamentColors";
import { getFilamentPlaceholder } from "../utils/filamentPlaceholder";
import {
  getAllBrands,
  getAllMaterials,
  getMaterialsForBrand,
  getLibraryColorOptions,
  findLibraryColorByLabel,
  resolveLibraryHexFromName,
  subscribeToLibraryChanges,
  ensureLibraryOverridesLoaded,
  ensureLibraryEntry,
} from "../utils/filamentLibrary";
import { logWithLanguage } from "../utils/languages/global_console";
import { addPriceHistory, isSignificantPriceChange, getFilamentPriceHistory } from "../utils/priceHistory";
import type { PriceHistory } from "../types";

const DEFAULT_WEIGHT_UNITS = ["g", "kg"] as const;

interface Props {
  filaments: Filament[];
  setFilaments: (f: Filament[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
  triggerAddForm?: boolean; // Gyors művelet gomb esetén automatikusan megnyitja a formot
  onSettingsChange?: (newSettings: Settings) => void; // Beállítások változtatása callback
}

export const Filaments: React.FC<Props> = ({ filaments, setFilaments, settings, theme, themeStyles, triggerAddForm, onSettingsChange }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  
  // Optimistic UI update hook
  const {
    optimisticState: optimisticFilaments,
    updateOptimistically,
    isSaving: isOptimisticSaving,
  } = useOptimisticUpdate<Filament[]>(
    filaments,
    async (newFilaments) => {
      await saveFilaments(newFilaments);
      setFilaments(newFilaments);
    },
    (error) => {
      console.error("Filament mentési hiba:", error);
      showToast(t("common.error") || "Hiba", "error");
    }
  );

  // Undo/Redo hook (optimistic state-t használ)
  const {
    state: filamentsWithHistory,
    setState: setFilamentsWithHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo<Filament[]>(optimisticFilaments, 50);

  // Sync optimistic filaments with history when external changes occur
  // Csak akkor frissítjük, ha valóban változás történt (nem csak referencia változás)
  const prevOptimisticRef = useRef<string>(JSON.stringify(optimisticFilaments));
  useEffect(() => {
    const currentOptimistic = JSON.stringify(optimisticFilaments);
    const currentHistory = JSON.stringify(filamentsWithHistory);
    
    // Ha az optimistic változott (külső forrásból, pl. parent update), akkor reset history
    if (prevOptimisticRef.current !== currentOptimistic && currentOptimistic !== currentHistory) {
      resetHistory(optimisticFilaments);
      prevOptimisticRef.current = currentOptimistic;
    }
  }, [optimisticFilaments, filamentsWithHistory, resetHistory]);

  // Update parent when history changes (optimistic update-t használ)
  // Csak akkor hívjuk meg, ha a filamentsWithHistory változott (nem az optimisticFilaments miatt)
  const prevHistoryRef = useRef<string>(JSON.stringify(filamentsWithHistory));
  const isUpdatingRef = useRef(false);
  
  useEffect(() => {
    const currentHistory = JSON.stringify(filamentsWithHistory);
    const currentOptimistic = JSON.stringify(optimisticFilaments);
    
    // Ha a history változott ÉS nem vagyunk éppen update közben ÉS különbözik az optimistic-től
    if (prevHistoryRef.current !== currentHistory && !isUpdatingRef.current && currentHistory !== currentOptimistic) {
      isUpdatingRef.current = true;
      prevHistoryRef.current = currentHistory;
      
      updateOptimistically(filamentsWithHistory)
        .then(() => {
          isUpdatingRef.current = false;
        })
        .catch((error) => {
          console.error("Optimistic update hiba:", error);
          isUpdatingRef.current = false;
        });
    }
  }, [filamentsWithHistory, optimisticFilaments, updateOptimistically]);
  
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [weight, setWeight] = useState<number>(1000);
  const [pricePerKg, setPricePerKg] = useState<number>(0);
  const [pricePerKgRaw, setPricePerKgRaw] = useState<string>("");
  const [color, setColor] = useState("");
  const [colorHex, setColorHex] = useState<string>("");
  const [colorMode, setColorMode] = useState<ColorMode>("solid");
  const [multiColorHint, setMultiColorHint] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedFilamentIndex, setDraggedFilamentIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ index: number; x: number; y: number } | null>(null);
  const [selectedFilamentIds, setSelectedFilamentIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState<string>("all");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [sortConfig, setSortConfig] = useState<Array<{ column: keyof Filament; direction: "asc" | "desc" }>>(
    (settings as Settings & { filamentSortConfig?: Array<{ column: keyof Filament; direction: "asc" | "desc" }> }).filamentSortConfig || []
  );
  const [tableBrandFilter, setTableBrandFilter] = useState<string>("all");
  const [tableTypeFilter, setTableTypeFilter] = useState<string>("all");
  const [tableColorFilter, setTableColorFilter] = useState<string>("all");

  // Egyszerű virtuális scroll a filament táblázathoz (12k+ sorhoz)
  const filamentsListContainerRef = useRef<HTMLDivElement | null>(null);
  const FILAMENT_VIRTUAL_THRESHOLD = 400;
  const FILAMENT_ROW_HEIGHT = 56; // átlagos sor + padding
  const FILAMENT_OVERSCAN = 5;
  const [visibleFilamentRange, setVisibleFilamentRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: FILAMENT_VIRTUAL_THRESHOLD,
  });

  // Egyszerű virtuális scroll a filament szín könyvtárhoz (sok palette elemhez)
  const PALETTE_VIRTUAL_THRESHOLD = 150;
  const PALETTE_ITEM_HEIGHT = 40; // px, átlagos button magasság
  const PALETTE_OVERSCAN = 10;
  const [visiblePaletteRange, setVisiblePaletteRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: PALETTE_VIRTUAL_THRESHOLD,
  });

  // Oszlop láthatóság beállítások
  const defaultColumnVisibility = {
    image: true,
    brand: true,
    type: true,
    color: true,
    weight: true,
    pricePerKg: true,
    action: true,
  };
  const columnVisibility = useMemo(() => {
    return settings.filamentColumnsVisibility || defaultColumnVisibility;
  }, [settings.filamentColumnsVisibility]);

  // Oszlop láthatóság váltása
  const toggleColumnVisibility = (column: keyof typeof columnVisibility) => {
    const newVisibility = {
      ...columnVisibility,
      [column]: !columnVisibility[column],
    };
    const newSettings = {
      ...settings,
      filamentColumnsVisibility: newVisibility,
    };
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };
  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [useCustomType, setUseCustomType] = useState(false);
  const [useCustomColor, setUseCustomColor] = useState(false);
  const animationConfig = useMemo(
    () => ({
      ...defaultAnimationSettings,
      ...(settings.animationSettings ?? {}),
    }),
    [settings.animationSettings]
  );
  const interactionsEnabled = animationConfig.microInteractions;
  const [brandPanelOpen, setBrandPanelOpen] = useState(false);
  const [typePanelOpen, setTypePanelOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [libraryVersion, setLibraryVersion] = useState(0);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const LIBRARY_FINISHES: FilamentFinish[] = ["standard", "matte", "silk", "transparent", "metallic", "glow"];
  const resolveBaseLanguage = (language: Settings["language"]): "hu" | "en" | "de" =>
    language === "hu" || language === "de" ? language : "en";
  const brandSelectPlaceholder = t("filaments.brandSelect.placeholder");
  const brandCustomOptionLabel = t("filaments.brandSelect.addNew");
  const brandBackToListLabel = t("filaments.brandSelect.backToList");
  const typeSelectPlaceholder = t("filaments.typeSelect.placeholder");
  const typeCustomOptionLabel = t("filaments.typeSelect.addNew");
  const typeBackToListLabel = t("filaments.typeSelect.backToList");
  const shortSearchPlaceholder = t("filaments.search.shortPlaceholder");
  const noMatchesLabel = t("filaments.search.noMatches");
  const multicolorLabel = t("filaments.multicolor.label");
  useEffect(() => {
    ensureLibraryOverridesLoaded();
    const unsubscribe = subscribeToLibraryChanges(() => {
      setLibraryVersion(prev => prev + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Gyors művelet gomb esetén automatikusan megnyitja a formot
  useEffect(() => {
    if (triggerAddForm && !showAddForm && editingIndex === null) {
      setShowAddForm(true);
    }
  }, [triggerAddForm, showAddForm, editingIndex]);

  // Escape billentyű kezelése a modal bezárásához
  useEffect(() => {
    if (!showAddForm && editingIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddForm) {
          setShowAddForm(false);
          resetForm();
        } else if (editingIndex !== null) {
          cancelEdit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddForm, editingIndex]);

  const allBrands = useMemo(() => getAllBrands(), [libraryVersion]);
  const allMaterials = useMemo(() => getAllMaterials(), [libraryVersion]);

  const materialsForBrand = useMemo(
    () => getMaterialsForBrand(!useCustomBrand ? brand : undefined),
    [brand, useCustomBrand, libraryVersion]
  );

  const libraryColorOptions = useMemo(() => {
    const brandForLookup = useCustomBrand ? undefined : brand;
    const typeForLookup = useCustomType ? undefined : type;
    if (!brandForLookup && !typeForLookup) {
      return [] as FilamentColorOption[];
    }
    return getLibraryColorOptions(brandForLookup, typeForLookup);
  }, [brand, type, useCustomBrand, useCustomType, libraryVersion]);

  const colorOptions = useMemo<FilamentColorOption[]>(() => {
    if (libraryColorOptions.length > 0) {
      return libraryColorOptions;
    }
    return getColorOptionsForType(type);
  }, [libraryColorOptions, type]);
  const paletteColorOptions = useMemo<FilamentColorOption[]>(
    () => (libraryColorOptions.length > 0 ? libraryColorOptions : []),
    [libraryColorOptions]
  );
  const filteredBrands = useMemo<string[]>(() => {
    const term = brandFilter.trim().toLowerCase();
    return term ? allBrands.filter(option => option.toLowerCase().includes(term)) : allBrands;
  }, [brandFilter, allBrands]);
  const materialsBase = useMemo(
    () => (useCustomBrand ? allMaterials : materialsForBrand),
    [useCustomBrand, allMaterials, materialsForBrand]
  );
  const filteredMaterials = useMemo<string[]>(() => {
    const term = typeFilter.trim().toLowerCase();
    return term ? materialsBase.filter(option => option.toLowerCase().includes(term)) : materialsBase;
  }, [typeFilter, materialsBase]);
  const finishOptions = useMemo(() => {
    const finishes = new Set<string>();
    paletteColorOptions.forEach(option => finishes.add(option.finish));
    return Array.from(finishes);
  }, [paletteColorOptions]);
  const filteredPaletteOptions = useMemo(
    () =>
      selectedFinish === "all"
        ? paletteColorOptions
        : paletteColorOptions.filter(option => option.finish === selectedFinish),
    [paletteColorOptions, selectedFinish]
  );
  const normalizedSelectedHex = normalizeHex(colorHex);
  const fallbackHex = normalizedSelectedHex || DEFAULT_COLOR_HEX;
  const colorOptionById = useMemo(() => {
    const map = new Map<string, FilamentColorOption>();
    colorOptions.forEach(option => {
      map.set(option.id, option);
    });
    return map;
  }, [colorOptions]);
  const getOptionHex = (option: FilamentColorOption): string => {
    const manufacturer = (option as any).manufacturer as string | undefined;
    const material = (option as any).material as string | undefined;
    const rawColor = (option as any).rawColor as string | undefined;
    const libraryMatch = resolveLibraryHexFromName(option.labels.en, manufacturer, material);
    const localizedMatch =
      libraryMatch ||
      resolveLibraryHexFromName(option.labels.hu, manufacturer, material) ||
      resolveLibraryHexFromName(option.labels.de, manufacturer, material) ||
      resolveColorHexFromName(option.labels.en) ||
      resolveColorHexFromName(option.labels.hu) ||
      resolveColorHexFromName(option.labels.de);
    const rawMatch = rawColor
      ? resolveLibraryHexFromName(rawColor, manufacturer, material) || resolveColorHexFromName(rawColor)
      : undefined;
    const normalized = normalizeHex(
      localizedMatch ||
        rawMatch ||
        option.hex
    );
    return normalized || DEFAULT_COLOR_HEX;
  };
  const selectedColorOption = useMemo(() => {
    if (useCustomColor || !color) {
      return undefined;
    }
    const lowered = color.trim().toLowerCase();
    if (!lowered) {
      return undefined;
    }
    return colorOptions.find(option => {
      const localized = getLocalizedColorLabel(option, settings.language).toLowerCase();
      const labels = option.labels;
      const matchesLabel =
        !!labels &&
        Object.values(labels as Partial<Record<Settings["language"], string>>)
          .filter((value): value is string => typeof value === "string")
          .some(value => value.toLowerCase() === lowered);
      const matchesRaw = "rawColor" in option && typeof (option as any).rawColor === "string" && (option as any).rawColor.toLowerCase() === lowered;
      return localized === lowered || matchesLabel || matchesRaw;
    });
  }, [colorOptions, color, useCustomColor, settings.language]);
  const selectedColorOptionId = !useCustomColor && selectedColorOption ? selectedColorOption.id : "";

  useEffect(() => {
    if (!color) {
      setSelectedFinish("all");
      return;
    }

    const libraryMatch = findLibraryColorByLabel(color, brand, type);
    if (libraryMatch) {
      setSelectedFinish(libraryMatch.finish);
      const matchedHex = normalizeHex(libraryMatch.hex);
      if (!normalizedSelectedHex && matchedHex) {
        setColorHex(matchedHex);
      }
      const nextMode = (libraryMatch.colorMode as ColorMode) ?? "solid";
      setColorMode(nextMode);
      const localized =
        libraryMatch.labels?.[resolveBaseLanguage(settings.language)] ?? libraryMatch.rawColor ?? color;
      setMultiColorHint(nextMode === "multicolor" ? libraryMatch.multiColorHint ?? localized ?? "" : "");
      return;
    }

    const presetMatch = findColorOptionByLabel(color);
    if (presetMatch) {
      setSelectedFinish(presetMatch.finish);
      const matchedHex = normalizeHex(presetMatch.hex);
      if (!normalizedSelectedHex && matchedHex) {
        setColorHex(matchedHex);
      }
      const nextMode = (presetMatch.colorMode as ColorMode) ?? "solid";
      setColorMode(nextMode);
      const localized = getLocalizedColorLabel(presetMatch, settings.language);
      setMultiColorHint(nextMode === "multicolor" ? presetMatch.multiColorHint ?? localized ?? "" : "");
      return;
    }

    setSelectedFinish("all");
  }, [brand, type, color, normalizedSelectedHex, settings.language]);

  useEffect(() => {
    if (!color || useCustomColor) {
      return;
    }
    if (!selectedColorOption) {
      setUseCustomColor(true);
    }
  }, [color, useCustomColor, selectedColorOption]);

  useEffect(() => {
    if (selectedFinish === "all") {
      return;
    }
    if (!finishOptions.includes(selectedFinish)) {
      setSelectedFinish("all");
    }
  }, [finishOptions, selectedFinish]);

  useEffect(() => {
    const extractedHex = extractHexFromString(color);
    if (extractedHex) {
      const normalized = normalizeHex(extractedHex);
      if (normalized && normalized !== normalizedSelectedHex) {
        setColorHex(normalized);
      }
      return;
    }
    const libraryMatch = findLibraryColorByLabel(color, brand, type);
    if (libraryMatch) {
      const matchedHex = normalizeHex(libraryMatch.hex);
      if (matchedHex && matchedHex !== normalizedSelectedHex) {
        setColorHex(matchedHex);
      }
      return;
    }
    const presetMatch = findColorOptionByLabel(color);
    if (presetMatch) {
      const matchedHex = normalizeHex(presetMatch.hex);
      if (matchedHex && matchedHex !== normalizedSelectedHex) {
        setColorHex(matchedHex);
      }
    }
  }, [brand, type, color, normalizedSelectedHex]);

  useEffect(() => {
    if (useCustomBrand) {
      return;
    }
    if (brand && !allBrands.includes(brand)) {
      setUseCustomBrand(true);
    }
  }, [brand, useCustomBrand, allBrands]);

  useEffect(() => {
    if (useCustomType) {
      return;
    }
    if (type && !materialsForBrand.includes(type)) {
      setUseCustomType(true);
    }
  }, [type, useCustomType, materialsForBrand]);

  useEffect(() => {
    if (useCustomColor) {
      setSelectedFinish("all");
    }
  }, [useCustomColor]);

  useEffect(() => {
    if (useCustomBrand) {
      setBrandPanelOpen(false);
    }
  }, [useCustomBrand]);

  useEffect(() => {
    if (useCustomType) {
      setTypePanelOpen(false);
    }
  }, [useCustomType]);

  const resetForm = () => {
    setBrand("");
    setType("");
    setWeight(1000);
    setPricePerKg(0);
    setPricePerKgRaw("");
    setColor("");
    setColorHex("");
    setColorMode("solid");
    setMultiColorHint("");
    setImagePreview(null);
    setEditingIndex(null);
    setShowAddForm(false);
    setSelectedFinish("all");
    setUseCustomBrand(false);
    setUseCustomType(false);
    setUseCustomColor(false);
    setBrandPanelOpen(false);
    setTypePanelOpen(false);
    setBrandFilter("");
    setTypeFilter("");
  };

  const formatPriceForInput = (value: number): string => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "";
    }
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(2);
  };

  const handlePriceInputChange = (rawValue: string) => {
    const sanitized = rawValue.replace(/,/g, ".").replace(/\s+/g, "");
    setPricePerKgRaw(sanitized);
    if (sanitized === "") {
      setPricePerKg(0);
      return;
    }
    const numeric = Number(sanitized);
    if (Number.isNaN(numeric)) {
      return;
    }
    setPricePerKg(numeric);
  };

  const handlePriceInputBlur = () => {
    const sanitized = pricePerKgRaw.trim();
    if (sanitized === "") {
      return;
    }
    const numeric = Number(sanitized);
    if (Number.isNaN(numeric)) {
      showToast(t("filaments.validation.invalidPriceFormat"), "error");
      setPricePerKgRaw("");
      setPricePerKg(0);
      return;
    }
    const validation = validateFilamentPrice(numeric, settings.language);
    if (!validation.isValid) {
      if (validation.errorMessage) {
        showToast(validation.errorMessage, "error");
      }
      return;
    }
    setPricePerKg(numeric);
    setPricePerKgRaw(formatPriceForInput(numeric));
  };

  const handleColorInputChange = (value: string) => {
    if (!useCustomColor) {
      setUseCustomColor(true);
    }
    setColor(value);
    if (colorMode === "multicolor") {
      setMultiColorHint(prev => (prev ? prev : value));
    }
    const extractedHex = extractHexFromString(value);
    if (extractedHex) {
      const normalized = normalizeHex(extractedHex);
      if (normalized) {
        setColorHex(normalized);
      }
    }
  };

  const handleCustomColorPick = (hexValue: string) => {
    const normalized = normalizeHex(hexValue);
    if (normalized) {
      setUseCustomColor(true);
      setColorHex(normalized);
      setColor(normalized);
      setSelectedFinish("all");
    }
  };

  const handleColorModeChange = (mode: ColorMode) => {
    setColorMode(mode);
    if (mode === "multicolor") {
      if (!multiColorHint) {
        const baseHint =
          color ||
          (selectedColorOption ? getLocalizedColorLabel(selectedColorOption, settings.language) : "") ||
          "";
        setMultiColorHint(baseHint);
      }
      if (normalizedSelectedHex) {
        setColorHex("");
      }
    } else {
      setMultiColorHint("");
    }
  };

  const handleBrandSelectChange = (value: string) => {
    if (value === "__custom__") {
      setUseCustomBrand(true);
      setBrand("");
      setType("");
      setUseCustomType(true);
      setBrandPanelOpen(false);
      setBrandFilter("");
      setTypeFilter("");
      return;
    }
    setUseCustomBrand(false);
    setBrand(value);
    setBrandPanelOpen(false);
    setBrandFilter("");
    const materials = getMaterialsForBrand(value);
    if (type && materials.includes(type)) {
      setUseCustomType(false);
    } else {
      setType("");
      setUseCustomType(false);
    }
    setTypeFilter("");
  };

  const handleTypeSelectChange = (value: string) => {
    if (value === "__custom__") {
      setUseCustomType(true);
      setType("");
      setTypePanelOpen(false);
      setTypeFilter("");
      return;
    }
    setUseCustomType(false);
    setType(value);
    setTypePanelOpen(false);
    setTypeFilter("");
  };

  const handleColorSelectChange = (value: string) => {
    if (value === "__custom__") {
      setUseCustomColor(true);
      setColor("");
      setColorHex("");
      setSelectedFinish("all");
      return;
    }
    if (!value) {
      setUseCustomColor(false);
      setColor("");
      setColorHex("");
      setSelectedFinish("all");
      return;
    }
    const option = colorOptionById.get(value);
    if (option) {
      setUseCustomColor(false);
      const optionHex = getOptionHex(option);
      setColorHex(optionHex);
      setColor(getLocalizedColorLabel(option, settings.language));
      setSelectedFinish(option.finish);
      const nextMode = (option.colorMode as ColorMode) ?? "solid";
      setColorMode(nextMode);
      const localized = getLocalizedColorLabel(option, settings.language);
      setMultiColorHint(nextMode === "multicolor" ? option.multiColorHint ?? localized ?? "" : "");
    }
  };

  const toggleBrandPanel = () => {
    setBrandPanelOpen(prev => {
      const next = !prev;
      if (next) {
        setTypePanelOpen(false);
      }
      return next;
    });
  };

  const toggleTypePanel = () => {
    setTypePanelOpen(prev => {
      const next = !prev;
      if (next) {
        setBrandPanelOpen(false);
      }
      return next;
    });
  };

  // Kép feltöltés és base64 konverzió
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Ellenőrizzük a fájl típusát
    if (!file.type.startsWith("image/")) {
      showToast(t("filaments.upload.invalidType"), "error");
      return;
    }

    // Ellenőrizzük a fájl méretét (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(t("filaments.upload.sizeExceeded"), "error");
      return;
    }

    // Preview létrehozása
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Kép törlése
  const removeImage = () => {
    setImagePreview(null);
  };

  // Kép optimalizálása (átméretezés, kompresszió)
  const optimizeImage = (base64: string, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Méret számítás
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(optimizedBase64);
      };
      img.onerror = reject;
      img.src = base64;
    });
  };

  const addFilament = async () => {
    logWithLanguage(settings.language, "log", "filaments.add.invoked", {
      imageQuality: imagePreview,
      brand,
      type,
      color,
      pricePerKg,
      selectedFinish,
      selectedPaletteColor: paletteColorOptions.find(option => option.finish === selectedFinish),
      weight,
      unit: DEFAULT_WEIGHT_UNITS[0],
    });
    if (!brand || !type || !pricePerKg) {
      showToast(`${t("common.error")}: ${t("filaments.validation.requiredFields")}`, "error");
      return;
    }
    
    if (weight <= 0 || pricePerKg <= 0) {
      showToast(`${t("common.error")}: ${t("filaments.validation.positiveNumbers")}`, "error");
      return;
    }
    
    // Kép optimalizálása, ha van
    let optimizedImage: string | undefined = undefined;
    if (imagePreview) {
      try {
        optimizedImage = await optimizeImage(imagePreview, 800, 800, 0.8);
      } catch (error) {
        logWithLanguage(settings.language, "error", "filaments.image.optimizeError", error);
        showToast(t("filaments.upload.optimizeError"), "error");
        optimizedImage = imagePreview;
      }
    }
    
    const normalizedSaveHex = normalizeHex(colorHex) || undefined;
    const optionHex = selectedColorOption ? normalizeHex(selectedColorOption.hex) : undefined;
    const presetHex = color ? resolveColorHexFromName(color) : undefined;
    const finalLibraryHex = normalizedSaveHex || optionHex || presetHex;
    const libraryFinish = LIBRARY_FINISHES.includes(selectedFinish as FilamentFinish)
      ? (selectedFinish as FilamentFinish)
      : "standard";
    const entryColorMode = colorMode;
    const entryMultiColorHint = multiColorHint.trim();

    if (color) {
      logWithLanguage(settings.language, "log", "filaments.library.sync", {
        libraryColor: paletteColorOptions.find(option => option.finish === selectedFinish),
        selectedFinish,
        brand,
        type,
        color,
      });
      try {
        await ensureLibraryEntry({
          manufacturer: brand,
          material: type,
          color,
          hex: finalLibraryHex,
          finish: libraryFinish,
          baseLabel: color,
          sourceLanguage: settings.language,
          colorMode: entryColorMode,
          multiColorHint: entryMultiColorHint,
        });
      } catch (error) {
        logWithLanguage(settings.language, "warn", "filaments.library.syncFailed", error);
      }
    } else {
      logWithLanguage(settings.language, "warn", "filaments.library.syncSkipped", {
        selectedPaletteColor: paletteColorOptions.find(option => option.finish === selectedFinish),
        selectedFinish,
        brand,
        type,
        color,
      });
    }

    if (editingIndex !== null) {
      // Szerkesztési mód: frissítjük a filamentet
      logWithLanguage(settings.language, "log", "filaments.edit.start", {
        index: editingIndex,
        brand,
        type,
        pricePerKg,
        hasImage: !!optimizedImage,
      });
      const oldFilament = filamentsWithHistory[editingIndex];
      const updated = [...filamentsWithHistory];
      const newFilament: Filament = { 
        brand, 
        type, 
        weight, 
        pricePerKg, 
        color: color || undefined,
        colorHex: normalizedSaveHex,
        imageBase64: optimizedImage,
        colorMode: entryColorMode,
        multiColorHint: entryColorMode === "multicolor" ? entryMultiColorHint || color || undefined : undefined,
      };
      updated[editingIndex] = newFilament;
      
      // Ár előzmény mentése, ha az ár változott
      if (oldFilament.pricePerKg !== newFilament.pricePerKg) {
        try {
          await addPriceHistory(oldFilament, newFilament, settings);
          
          // Jelentős ár változás esetén figyelmeztetés
          if (isSignificantPriceChange(oldFilament.pricePerKg, newFilament.pricePerKg, 10)) {
            const changePercent = Math.abs(
              ((newFilament.pricePerKg - oldFilament.pricePerKg) / oldFilament.pricePerKg) * 100
            );
            const message = t("filaments.priceChange.significant")
              .replace("{changePercent}", changePercent.toFixed(1))
              .replace("{oldPrice}", oldFilament.pricePerKg.toFixed(2))
              .replace("{newPrice}", newFilament.pricePerKg.toFixed(2));
            showToast(message, "info");
          }
        } catch (error) {
          logWithLanguage(settings.language, "error", "filaments.priceHistory.saveError", error);
        }
      }
      
      setFilamentsWithHistory(updated);
      logWithLanguage(settings.language, "log", "filaments.edit.success", {
        index: editingIndex,
      });
      showToast(t("common.filamentUpdated"), "success");
      resetForm();
      setPriceHistory([]);
      setShowPriceHistory(false);
    } else {
      // Új filament hozzáadása
      logWithLanguage(settings.language, "log", "filaments.addNew.start", {
        brand,
        type,
        pricePerKg,
        hasImage: !!optimizedImage,
      });
      setFilamentsWithHistory([...filamentsWithHistory, { 
        brand, 
        type, 
        weight, 
        pricePerKg, 
        color: color || undefined,
        colorHex: normalizedSaveHex,
        imageBase64: optimizedImage,
        colorMode: entryColorMode,
        multiColorHint: entryColorMode === "multicolor" ? entryMultiColorHint || color || undefined : undefined,
      }]);
      logWithLanguage(settings.language, "log", "filaments.addNew.success", {
        brand,
        type,
      });
      showToast(t("common.filamentAdded"), "success");
      resetForm();
    }
  };

  const startEdit = (index: number) => {
    const filament = filamentsWithHistory[index];
    setBrand(filament.brand);
    setType(filament.type);
    setWeight(filament.weight);
    setPricePerKg(filament.pricePerKg);
    setPricePerKgRaw(formatPriceForInput(filament.pricePerKg));
    setColor(filament.color || "");
    setBrandPanelOpen(false);
    setTypePanelOpen(false);
    setBrandFilter("");
    setTypeFilter("");
    const brandKnown = allBrands.includes(filament.brand);
    setUseCustomBrand(!brandKnown);
    const availableMaterials = getMaterialsForBrand(brandKnown ? filament.brand : undefined);
    const typeKnown = availableMaterials.includes(filament.type);
    setUseCustomType(!typeKnown);
    const libraryResolvedHex = resolveLibraryHexFromName(filament.color, filament.brand, filament.type);
    const resolvedHex = normalizeHex(
      filament.colorHex || libraryResolvedHex || resolveColorHexFromName(filament.color) || ""
    );
    setColorHex(resolvedHex);
    const libraryMatch = findLibraryColorByLabel(filament.color, filament.brand, filament.type);
    const presetMatch = findColorOptionByLabel(filament.color);
    const shouldUseCustomColor = !libraryMatch && !presetMatch;
    setUseCustomColor(shouldUseCustomColor);
    setSelectedFinish(libraryMatch?.finish ?? presetMatch?.finish ?? "all");
    const detectedMode = (filament.colorMode as ColorMode) ?? (libraryMatch?.colorMode as ColorMode) ?? (presetMatch?.colorMode as ColorMode) ?? "solid";
    setColorMode(detectedMode);
    const detectedHint =
      filament.multiColorHint ||
      libraryMatch?.multiColorHint ||
      presetMatch?.multiColorHint ||
      filament.color ||
      "";
    setMultiColorHint(detectedMode === "multicolor" ? detectedHint : "");
    setImagePreview(filament.imageBase64 || null);
    setEditingIndex(index);
    
    // Ár előzmények betöltése
    const loadHistory = async () => {
      try {
        const history = await getFilamentPriceHistory(
          filament.brand,
          filament.type,
          filament.color
        );
        setPriceHistory(history);
        setShowPriceHistory(false);
      } catch (error) {
        console.error("Hiba az ár előzmények betöltésekor:", error);
        setPriceHistory([]);
      }
    };
    loadHistory();
  };

  const cancelEdit = () => {
    resetForm();
    setPriceHistory([]);
    setShowPriceHistory(false);
  };

  const deleteFilament = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const confirmDelete = () => {
    if (deleteConfirmIndex === null) return;
    const index = deleteConfirmIndex;
    const filamentToDelete = filamentsWithHistory[index];
    logWithLanguage(settings.language, "log", "filaments.delete.start", {
      index,
      brand: filamentToDelete?.brand,
      type: filamentToDelete?.type,
    });
    setFilamentsWithHistory(filamentsWithHistory.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
    logWithLanguage(settings.language, "log", "filaments.delete.success", { index });
    showToast(t("common.filamentDeleted"), "success");
    setDeleteConfirmIndex(null);
  };


  const handleOpenPriceSearch = async (filament: Filament) => {
    const queryParts = [filament.brand, filament.type, filament.color]
      .filter(Boolean)
      .map(part => part?.toString().trim())
      .filter(Boolean) as string[];
    const currencyHint =
      settings.currency === "EUR"
        ? "EUR"
        : settings.currency === "HUF"
        ? "HUF"
        : "USD";
    const query = encodeURIComponent(`${queryParts.join(" ")} filament price ${currencyHint}`);
    const url = `https://www.google.com/search?q=${query}`;
    try {
      await open(url);
    } catch (error) {
      logWithLanguage(settings.language, "warn", "filaments.priceSearch.error", error);
      const fallbackWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!fallbackWindow) {
        showToast(t("filaments.priceSearch.error"), "error");
      }
    }
  };

  // Kedvenc váltás funkció
  const toggleFavorite = (index: number) => {
    const updated = [...filamentsWithHistory];
    updated[index] = { ...updated[index], favorite: !updated[index].favorite };
    setFilamentsWithHistory(updated);
    logWithLanguage(settings.language, "log", "filaments.favorite.toggled", {
      brand: updated[index].brand,
      type: updated[index].type,
      favorite: updated[index].favorite,
    });
  };

  // Szűrés a keresési kifejezés és kedvenc alapján
  const filteredFilaments = useMemo(() => {
    return filamentsWithHistory.filter(f => {
      // Kedvenc szűrés
      if (showFavoritesOnly && !f.favorite) return false;

      // Oszlop szűrők: márka / típus / szín
      if (tableBrandFilter !== "all" && f.brand !== tableBrandFilter) return false;
      if (tableTypeFilter !== "all" && f.type !== tableTypeFilter) return false;
      if (tableColorFilter !== "all") {
        const colorName = (f.color || "").toLowerCase();
        const hex = (f.colorHex || "").toLowerCase();
        const filterValue = tableColorFilter.toLowerCase();
        if (!colorName.includes(filterValue) && !hex.includes(filterValue)) {
          return false;
        }
      }

      // Keresési kifejezés szűrés
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        f.brand.toLowerCase().includes(term) ||
        f.type.toLowerCase().includes(term) ||
        (f.color && f.color.toLowerCase().includes(term)) ||
        (f.colorHex && f.colorHex.toLowerCase().includes(term))
      );
    });
  }, [filamentsWithHistory, showFavoritesOnly, searchTerm, tableBrandFilter, tableTypeFilter, tableColorFilter]);

  const tableBrandOptions = useMemo(() => {
    const set = new Set<string>();
    filamentsWithHistory.forEach(f => {
      if (f.brand) set.add(f.brand);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filamentsWithHistory]);

  const tableTypeOptions = useMemo(() => {
    const set = new Set<string>();
    filamentsWithHistory.forEach(f => {
      if (f.type) set.add(f.type);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filamentsWithHistory]);

  // Rendezés logika (többszörös rendezés támogatása)
  const sortedFilaments = useMemo(() => {
    if (sortConfig.length === 0) return filteredFilaments;

    const sorted = [...filteredFilaments].sort((a: Filament, b: Filament) => {
      for (const { column, direction } of sortConfig) {
        let aValue: any = a[column];
        let bValue: any = b[column];

        // Szöveges értékek esetén
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        let cmp = 0;

        // Számértékek esetén
        if (typeof aValue === "number" && typeof bValue === "number") {
          cmp = aValue - bValue;
        } else if (aValue < bValue) {
          cmp = -1;
        } else if (aValue > bValue) {
          cmp = 1;
        }

        if (cmp !== 0) {
          return direction === "asc" ? cmp : -cmp;
        }
      }
      return 0;
    });

    return sorted;
  }, [filteredFilaments, sortConfig]);

  // Rendezés váltása (Shift+click = többszörös rendezés)
  const handleSort = (column: keyof Filament, event?: React.MouseEvent<HTMLTableHeaderCellElement>) => {
    const isShiftClick = event?.shiftKey;

    setSortConfig(prev => {
      const existingIndex = prev.findIndex(cfg => cfg.column === column);
      const existing = existingIndex >= 0 ? prev[existingIndex] : null;

      // Nincs Shift: single-column mód
      if (!isShiftClick) {
        let next: Array<{ column: keyof Filament; direction: "asc" | "desc" }>;
        if (!existing) {
          // új oszlop, növekvő rendezés
          next = [{ column, direction: "asc" }];
        } else if (existing.direction === "asc") {
          // ugyanaz az oszlop: asc -> desc
          next = [{ column, direction: "desc" }];
        } else {
          // desc -> töröljük a rendezést teljesen
          next = [];
        }

        if (onSettingsChange) {
          onSettingsChange({
            ...settings,
            filamentSortConfig: next,
          } as Settings);
        }

        return next;
      }

      // Shift+click: többszörös rendezés
      let next: Array<{ column: keyof Filament; direction: "asc" | "desc" }>;

      if (!existing) {
        // hozzáadjuk a lánc végére asc irányban
        next = [...prev, { column, direction: "asc" as const }];
      } else if (existing.direction === "asc") {
        // már benne van: asc -> desc
        next = prev.map(cfg =>
          cfg.column === column ? { ...cfg, direction: "desc" as const } : cfg
        );
      } else {
        // desc -> eltávolítjuk ebből a láncból
        next = prev.filter(cfg => cfg.column !== column);
      }

      if (onSettingsChange) {
        onSettingsChange({
          ...settings,
          filamentSortConfig: next,
        } as Settings);
      }

      return next;
    });
  };

  // Oszlop menü bezárása kattintásra kívülre
  useEffect(() => {
    if (!showColumnMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-column-menu]')) {
        setShowColumnMenu(false);
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [showColumnMenu]);

  // Bulk műveletek
  const getFilamentId = (_f: Filament, index: number): string => {
    return `filament-${index}`;
  };

  const toggleSelection = (filamentId: string) => {
    setSelectedFilamentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filamentId)) {
        newSet.delete(filamentId);
      } else {
        newSet.add(filamentId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = new Set(sortedFilaments.map((f) => {
      const originalIndex = filamentsWithHistory.findIndex(orig => orig === f);
      return getFilamentId(f, originalIndex);
    }));
    setSelectedFilamentIds(allIds);
  };

  const deselectAll = () => {
    setSelectedFilamentIds(new Set());
  };

  const handleBulkDelete = () => {
    setBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = () => {
    if (selectedFilamentIds.size === 0) return;
    
    const idsToDelete = Array.from(selectedFilamentIds);
    const filamentsToDelete = filamentsWithHistory.filter((f, index) => 
      idsToDelete.includes(getFilamentId(f, index))
    );
    
    logWithLanguage(settings.language, "log", "filaments.delete.start", {
      count: idsToDelete.length,
      brands: filamentsToDelete.map(f => f.brand).join(", "),
    });
    
    const updatedFilaments = filamentsWithHistory.filter((f, index) => 
      !idsToDelete.includes(getFilamentId(f, index))
    );
    
    setFilamentsWithHistory(updatedFilaments);
    setSelectedFilamentIds(new Set());
    setBulkDeleteConfirm(false);
    
    logWithLanguage(settings.language, "log", "filaments.delete.success", { count: idsToDelete.length });
    const successMessage = t("filaments.bulk.delete.success").replace("{{count}}", idsToDelete.length.toString());
    showToast(successMessage, "success");
  };

  const isAllSelected = sortedFilaments.length > 0 && 
    sortedFilaments.every((f) => {
      const originalIndex = filamentsWithHistory.findIndex(orig => orig === f);
      return selectedFilamentIds.has(getFilamentId(f, originalIndex));
    });
  const isSomeSelected = selectedFilamentIds.size > 0 && !isAllSelected;

  // Undo/Redo billentyűk
  useKeyboardShortcut('z', () => {
    if (canUndo) {
      undo();
      showToast(t("common.undo") || "Visszavonás", "info");
    }
  }, { ctrl: true });

  useKeyboardShortcut('z', () => {
    if (canUndo) {
      undo();
      showToast(t("common.undo") || "Visszavonás", "info");
    }
  }, { meta: true });

  useKeyboardShortcut('z', () => {
    if (canRedo) {
      redo();
      showToast(t("common.redo") || "Újra", "info");
    }
  }, { ctrl: true, shift: true });

  useKeyboardShortcut('z', () => {
    if (canRedo) {
      redo();
      showToast(t("common.redo") || "Újra", "info");
    }
  }, { meta: true, shift: true });

  // Gyorsbillentyűk
  // macOS-en metaKey (Cmd), Windows/Linux-en ctrlKey (Ctrl)
  // Mindkettőt regisztráljuk platform-független működéshez
  useKeyboardShortcut('n', () => {
    if (!showAddForm && editingIndex === null) {
      setShowAddForm(true);
    }
  }, { ctrl: true }); // Windows/Linux

  useKeyboardShortcut('n', () => {
    if (!showAddForm && editingIndex === null) {
      setShowAddForm(true);
    }
  }, { meta: true }); // macOS

  useKeyboardShortcut('s', () => {
    if (showAddForm && brand && type && pricePerKg) {
      addFilament();
    }
  }, { ctrl: true }); // Windows/Linux

  useKeyboardShortcut('s', () => {
    if (showAddForm && brand && type && pricePerKg) {
      addFilament();
    }
  }, { meta: true }); // macOS

  useKeyboardShortcut('Escape', () => {
    if (editingIndex !== null || showAddForm) {
      resetForm();
    }
  });

  // Drag & Drop funkciók
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedFilamentIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedFilamentIndex === null || draggedFilamentIndex === targetIndex) {
      setDraggedFilamentIndex(null);
      return;
    }

    const newFilaments = [...filaments];
    const [removed] = newFilaments.splice(draggedFilamentIndex, 1);
    newFilaments.splice(targetIndex, 0, removed);

    setFilaments(newFilaments);
    setDraggedFilamentIndex(null);
    logWithLanguage(settings.language, "log", "filaments.reorder", {
      draggedIndex: draggedFilamentIndex,
      targetIndex,
    });
    showToast(t("filaments.toast.reordered"), "success");
  };

  const handleDragEnd = () => {
    setDraggedFilamentIndex(null);
  };

  // Kontextus menü funkciók
  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ index, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleContextMenuAction = (action: "edit" | "delete") => {
    if (!contextMenu) return;
    const filament = filaments[contextMenu.index];
    if (!filament) {
      closeContextMenu();
      return;
    }

    switch (action) {
      case "edit":
        startEdit(contextMenu.index);
        break;
      case "delete":
        deleteFilament(contextMenu.index);
        break;
    }
    closeContextMenu();
  };

  const panelInputStyle = {
    height: "32px",
    minHeight: "32px",
    maxHeight: "32px",
    lineHeight: "32px",
  };

  // Virtuális scrollhoz kapcsolódó származtatott értékek
  const shouldVirtualizeFilaments = sortedFilaments.length > FILAMENT_VIRTUAL_THRESHOLD;
  const filamentVisibleStart = shouldVirtualizeFilaments ? Math.max(0, visibleFilamentRange.start) : 0;
  const filamentVisibleEnd = shouldVirtualizeFilaments
    ? Math.min(sortedFilaments.length - 1, visibleFilamentRange.end)
    : sortedFilaments.length - 1;
  const visibleFilaments = sortedFilaments.slice(filamentVisibleStart, filamentVisibleEnd + 1);
  const topFilamentSpacerHeight = shouldVirtualizeFilaments ? filamentVisibleStart * FILAMENT_ROW_HEIGHT : 0;
  const bottomFilamentSpacerHeight = shouldVirtualizeFilaments
    ? (sortedFilaments.length - (filamentVisibleEnd + 1)) * FILAMENT_ROW_HEIGHT
    : 0;
  const visibleFilamentColumnCount =
    1 + // checkbox oszlop
    (columnVisibility.image ? 1 : 0) +
    (columnVisibility.brand ? 1 : 0) +
    (columnVisibility.type ? 1 : 0) +
    (columnVisibility.color ? 1 : 0) +
    (columnVisibility.weight ? 1 : 0) +
    (columnVisibility.pricePerKg ? 1 : 0) +
    (columnVisibility.action ? 1 : 0);

  // Virtuális scroll a színpaletta (filament library) listához
  const shouldVirtualizePalette = filteredPaletteOptions.length > PALETTE_VIRTUAL_THRESHOLD;
  const paletteVisibleStart = shouldVirtualizePalette ? Math.max(0, visiblePaletteRange.start) : 0;
  const paletteVisibleEnd = shouldVirtualizePalette
    ? Math.min(filteredPaletteOptions.length - 1, visiblePaletteRange.end)
    : filteredPaletteOptions.length - 1;
  const visiblePaletteOptions = filteredPaletteOptions.slice(paletteVisibleStart, paletteVisibleEnd + 1);
  const topPaletteSpacerHeight = shouldVirtualizePalette ? paletteVisibleStart * PALETTE_ITEM_HEIGHT : 0;
  const bottomPaletteSpacerHeight = shouldVirtualizePalette
    ? (filteredPaletteOptions.length - (paletteVisibleEnd + 1)) * PALETTE_ITEM_HEIGHT
    : 0;

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("filaments.title")}</h2>
      <p style={themeStyles.pageSubtitle}>{t("filaments.subtitle")}</p>
      
      {/* Kereső mező */}
      {filamentsWithHistory.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "600", 
            fontSize: "14px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            🔍 {t("filaments.search.label")}
          </label>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder={t("filaments.search.placeholder")}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, flex: "1", minWidth: "200px", maxWidth: "400px" }}
              aria-label={t("filaments.search.ariaLabel")}
              aria-describedby="filament-search-description"
            />
            <span id="filament-search-description" style={{ display: "none" }}>
              {t("filaments.search.description")}
            </span>
            {/* Undo/Redo és Kedvencek gombok */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {isOptimisticSaving && (
                <span style={{ 
                  fontSize: "12px", 
                  color: theme.colors.textMuted,
                  fontStyle: "italic"
                }}>
                  💾 Mentés folyamatban...
                </span>
              )}
              <Tooltip content={`${t("common.undo")} (Ctrl/Cmd+Z)`}>
                <button
                  onClick={() => {
                    if (canUndo) {
                      undo();
                      showToast(t("common.undo"), "info");
                    }
                  }}
                  disabled={!canUndo}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    opacity: canUndo ? 1 : 0.5,
                    cursor: canUndo ? "pointer" : "not-allowed",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "14px",
                  }}
                >
                  <span>↶</span>
                  <span>{t("common.undo")}</span>
                </button>
              </Tooltip>
              <Tooltip content={`${t("common.redo")} (Ctrl/Cmd+Shift+Z)`}>
                <button
                  onClick={() => {
                    if (canRedo) {
                      redo();
                      showToast(t("common.redo"), "info");
                    }
                  }}
                  disabled={!canRedo}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    opacity: canRedo ? 1 : 0.5,
                    cursor: canRedo ? "pointer" : "not-allowed",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "14px",
                  }}
                >
                  <span>↷</span>
                  <span>{t("common.redo")}</span>
                </button>
              </Tooltip>
              <Tooltip content={showFavoritesOnly ? t("filaments.favorite.showAll") : t("filaments.favorite.showOnly")}>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  onMouseEnter={(e) => {
                    if (!interactionsEnabled) return;
                    Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover);
                  }}
                  onMouseLeave={(e) => {
                    if (!interactionsEnabled) return;
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.transform = "translateY(0)";
                    btn.style.boxShadow = showFavoritesOnly 
                      ? themeStyles.buttonPrimary.boxShadow 
                      : themeStyles.buttonSecondary.boxShadow;
                  }}
                  style={{
                    ...themeStyles.button,
                    ...(showFavoritesOnly ? themeStyles.buttonPrimary : themeStyles.buttonSecondary),
                    padding: "8px 12px",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  aria-label={showFavoritesOnly ? t("filaments.favorite.showAll") : t("filaments.favorite.showOnly")}
                >
                  <span style={{ fontSize: "16px" }}>{showFavoritesOnly ? "⭐" : "☆"}</span>
                  {showFavoritesOnly ? t("filaments.favorite.showing") : t("filaments.favorite.filter")}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Oszlop szűrők a táblázathoz */}
      {!showAddForm && editingIndex === null && (
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "flex-end",
          }}
        >
          {/* Márka szűrő */}
          <div style={{ minWidth: "180px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "12px",
                fontWeight: 600,
                color: theme.colors.textMuted,
              }}
            >
              {t("filaments.brand")}
            </label>
            <select
              value={tableBrandFilter}
              onChange={(e) => setTableBrandFilter(e.target.value)}
              style={{
                ...themeStyles.input,
                padding: "6px 10px",
                fontSize: "13px",
              }}
            >
              <option value="all">{t("common.all" as any)}</option>
              {tableBrandOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Típus / anyag szűrő */}
          <div style={{ minWidth: "180px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "12px",
                fontWeight: 600,
                color: theme.colors.textMuted,
              }}
            >
              {t("filaments.type")}
            </label>
            <select
              value={tableTypeFilter}
              onChange={(e) => setTableTypeFilter(e.target.value)}
              style={{
                ...themeStyles.input,
                padding: "6px 10px",
                fontSize: "13px",
              }}
            >
              <option value="all">{t("common.all" as any)}</option>
              {tableTypeOptions.map((mt) => (
                <option key={mt} value={mt}>
                  {mt}
                </option>
              ))}
            </select>
          </div>

          {/* Szín / HEX szűrő (szabad szöveg) */}
          <div style={{ minWidth: "180px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "12px",
                fontWeight: 600,
                color: theme.colors.textMuted,
              }}
            >
              {t("filaments.color")}
            </label>
            <input
              type="text"
              value={tableColorFilter === "all" ? "" : tableColorFilter}
              onChange={(e) => setTableColorFilter(e.target.value || "all")}
              placeholder={t("filaments.color")}
              style={{
                ...themeStyles.input,
                padding: "6px 10px",
                fontSize: "13px",
              }}
            />
          </div>
        </div>
      )}
      
      {/* Új filament hozzáadása gomb és oszlop kezelő */}
      {!showAddForm && editingIndex === null && (
        <div style={{ marginBottom: "24px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <Tooltip content={t("filaments.tooltip.addShortcut")}>
            <button
              onClick={() => setShowAddForm(true)}
              onMouseEnter={(e) => {
                if (!interactionsEnabled) return;
                Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover);
              }}
              onMouseLeave={(e) => {
                if (!interactionsEnabled) return;
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.transform = "translateY(0)";
                btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowAddForm(true);
                }
              }}
              style={{ 
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                fontSize: "16px",
                padding: "14px 28px"
              }}
              aria-label={t("filaments.actions.addAria")}
            >
              ➕ {t("filaments.addTitle")}
            </button>
          </Tooltip>
          
          {/* Oszlop kezelő gomb */}
          {sortedFilaments.length > 0 && (
            <div style={{ position: "relative" }} data-column-menu>
              <Tooltip content={t("filaments.columns.manage")}>
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  onMouseEnter={(e) => {
                    Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover);
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement;
                    btn.style.transform = "translateY(0)";
                    btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow;
                  }}
                  style={{ 
                    ...themeStyles.button,
                    ...themeStyles.buttonPrimary,
                    fontSize: "16px",
                    padding: "14px 28px"
                  }}
                  aria-label={t("filaments.columns.manage")}
                >
                  📋 {t("filaments.columns.manage")}
                </button>
              </Tooltip>
              
              {/* Oszlop kezelő menü */}
              {showColumnMenu && (
                <div
                  data-column-menu
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "8px",
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: "8px",
                    padding: "12px",
                    minWidth: "200px",
                    boxShadow: theme.name === 'neon' || theme.name === 'cyberpunk'
                      ? `0 0 20px ${theme.colors.shadow}, 0 4px 16px rgba(0,0,0,0.3)`
                      : `0 4px 16px rgba(0,0,0,0.2)`,
                    zIndex: 1000,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: theme.colors.text }}>
                    {t("filaments.columns.manage")}
                  </div>
                  {Object.entries(columnVisibility).map(([column, visible]) => (
                    <label
                      key={column}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px",
                        cursor: "pointer",
                        borderRadius: "4px",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleColumnVisibility(column as keyof typeof columnVisibility)}
                        style={{
                          cursor: "pointer",
                          width: "18px",
                          height: "18px",
                        }}
                      />
                      <span style={{ fontSize: "14px", color: theme.colors.text }}>
                        {t(`filaments.columns.${column}` as any) || t(`printers.columns.${column}` as any) || column}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Új filament hozzáadása form modal */}
      <AnimatePresence>
        {(showAddForm || editingIndex !== null) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              backdropFilter: 'blur(4px)',
              overflowY: 'auto',
              padding: '20px',
            }}
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
                resetForm();
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                backgroundColor: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                  ? 'rgba(255, 255, 255, 0.95)'
                  : theme.colors.surface,
                borderRadius: '16px',
                padding: '24px',
                width: 'min(900px, 95vw)',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: theme.name === 'neon' || theme.name === 'cyberpunk'
                  ? `0 0 30px ${theme.colors.shadow}, 0 8px 32px rgba(0,0,0,0.4)`
                  : `0 8px 32px rgba(0,0,0,0.3)`,
                color: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                  ? '#1a202c'
                  : theme.colors.text,
                backdropFilter: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                  ? 'blur(12px)'
                  : 'none',
                border: editingIndex !== null ? `2px solid ${theme.colors.primary}` : 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: "20px", 
            fontWeight: "600", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            {editingIndex !== null ? t("filaments.edit") : "➕ " + t("filaments.addTitle")}
          </h3>
          {editingIndex !== null && (
            <button 
              onClick={cancelEdit}
              onMouseEnter={(e) => {
                if (!interactionsEnabled) return;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                if (!interactionsEnabled) return;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
              style={{ 
                ...themeStyles.button,
                ...themeStyles.buttonSecondary,
                padding: "8px 16px",
                fontSize: "12px"
              }}
            >
              {t("filaments.cancel")}
            </button>
          )}
        </div>
              
              {/* Fő tartalom: két oszlopos elrendezés */}
              <div style={{ 
                display: "flex", 
                flexDirection: "row",
                gap: "24px", 
                marginBottom: "24px",
                flexWrap: "wrap"
              }}>
                <div style={{ flex: "1 1 300px", minWidth: "280px" }}>
                  <h4 style={{
                    margin: "0 0 20px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                    borderBottom: `2px solid ${theme.colors.border}`,
                    paddingBottom: "12px"
                  }}>
                    📋 Alapadatok
                  </h4>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Márka */}
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        fontSize: "14px", 
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                      }}>
                        {t("filaments.brand")}
                      </label>
            {!useCustomBrand ? (
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    border: `1px solid ${theme.colors.inputBorder}`,
                    borderRadius: themeStyles.input.borderRadius,
                    backgroundColor: theme.colors.surface,
                    boxShadow: themeStyles.card.boxShadow,
                    cursor: "pointer",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onClick={toggleBrandPanel}
                >
                  <span style={{ fontSize: "13px", color: brand ? theme.colors.text : theme.colors.textMuted }}>
                    {brand || brandSelectPlaceholder}
                  </span>
                  <span style={{ fontSize: "12px" }}>{brandPanelOpen ? "✕" : "▼"}</span>
                </div>
                {brandPanelOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      zIndex: 1200,
                      width: "260px",
                      padding: "12px",
                      border: `1px solid ${theme.colors.inputBorder}`,
                      borderRadius: "12px",
                      backgroundColor: theme.colors.surface,
                      boxShadow: themeStyles.card.boxShadow,
                    }}
                  >
                    <input
                      type="text"
                      value={brandFilter}
                      onChange={e => setBrandFilter(e.target.value)}
                      placeholder={shortSearchPlaceholder}
                      style={{
                        ...themeStyles.input,
                        ...panelInputStyle,
                        width: "87%",
                      }}
                      autoFocus
                    />
                    <div
                      style={{
                        marginTop: "8px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "10px",
                        width: "100%",
                      }}
                    >
                      {filteredBrands.length > 0 ? (
                        filteredBrands.map((option: string) => {
                          const isSelected = brand === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleBrandSelectChange(option)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 12px",
                                border: "none",
                                backgroundColor: isSelected ? theme.colors.primary : "transparent",
                                color: isSelected ? "#fff" : theme.colors.text,
                                fontSize: "13px",
                                cursor: "pointer",
                              }}
                              onMouseEnter={e => {
                                if (!interactionsEnabled || isSelected) {
                                  return;
                                }
                                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                              }}
                              onMouseLeave={e => {
                                if (!interactionsEnabled || isSelected) {
                                  return;
                                }
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              {option}
                            </button>
                          );
                        })
                      ) : (
                        <div style={{ padding: "10px", fontSize: "12px", color: theme.colors.textMuted }}>
                          {noMatchesLabel}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBrandSelectChange("__custom__")}
                      style={{
                        ...themeStyles.button,
                        ...themeStyles.buttonSecondary,
                        width: "100%",
                        marginTop: "10px",
                        fontSize: "12px",
                        padding: "8px 12px",
                      }}
                    >
                      {brandCustomOptionLabel}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  placeholder={t("filaments.brand")}
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  onFocus={e => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={e => {
                    e.target.style.borderColor = theme.colors.inputBorder;
                    e.target.style.boxShadow = "none";
                  }}
                  style={{ 
                    ...themeStyles.input, 
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                  aria-label={t("filaments.brand")}
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomBrand(false);
                    setBrand("");
                  }}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    padding: "6px 10px",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {brandBackToListLabel}
                </button>
              </div>
            )}
                    </div>
                    
                    {/* Típus */}
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        fontSize: "14px", 
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                      }}>
                        {t("filaments.type")}
                      </label>
            {!useCustomType ? (
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    border: `1px solid ${theme.colors.inputBorder}`,
                    borderRadius: themeStyles.input.borderRadius,
                    backgroundColor: theme.colors.surface,
                    boxShadow: themeStyles.card.boxShadow,
                    cursor: "pointer",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onClick={toggleTypePanel}
                >
                  <span style={{ fontSize: "13px", color: type ? theme.colors.text : theme.colors.textMuted }}>
                    {type || typeSelectPlaceholder}
                  </span>
                  <span style={{ fontSize: "12px" }}>{typePanelOpen ? "✕" : "▼"}</span>
                </div>
                {typePanelOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      zIndex: 1200,
                      width: "260px",
                      padding: "12px",
                      border: `1px solid ${theme.colors.inputBorder}`,
                      borderRadius: "12px",
                      backgroundColor: theme.colors.surface,
                      boxShadow: themeStyles.card.boxShadow,
                    }}
                  >
                    <input
                      type="text"
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                      placeholder={shortSearchPlaceholder}
                      style={{
                        ...themeStyles.input,
                        ...panelInputStyle,
                        width: "87%",
                      }}
                      autoFocus
                    />
                    <div
                      style={{
                        marginTop: "8px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "10px",
                        width: "100%",
                      }}
                    >
                      {filteredMaterials.length > 0 ? (
                        filteredMaterials.map((option: string) => {
                          const isSelected = type === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleTypeSelectChange(option)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "8px 12px",
                                border: "none",
                                backgroundColor: isSelected ? theme.colors.primary : "transparent",
                                color: isSelected ? "#fff" : theme.colors.text,
                                fontSize: "13px",
                                cursor: "pointer",
                              }}
                              onMouseEnter={e => {
                                if (!interactionsEnabled || isSelected) {
                                  return;
                                }
                                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                              }}
                              onMouseLeave={e => {
                                if (!interactionsEnabled || isSelected) {
                                  return;
                                }
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              {option}
                            </button>
                          );
                        })
                      ) : (
                        <div style={{ padding: "10px", fontSize: "12px", color: theme.colors.textMuted }}>
                          {noMatchesLabel}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTypeSelectChange("__custom__")}
                      style={{
                        ...themeStyles.button,
                        ...themeStyles.buttonSecondary,
                        width: "100%",
                        marginTop: "10px",
                        fontSize: "12px",
                        padding: "8px 12px",
                      }}
                    >
                      {typeCustomOptionLabel}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  placeholder={t("filaments.type")}
                  value={type}
                  onChange={e => setType(e.target.value)}
                  onFocus={e => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={e => {
                    e.target.style.borderColor = theme.colors.inputBorder;
                    e.target.style.boxShadow = "none";
                  }}
                  style={{ 
                    ...themeStyles.input, 
                    width: "100%",
                    maxWidth: "100%",
                    boxSizing: "border-box",
                  }}
                  aria-label={t("filaments.type")}
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomType(false);
                    setType("");
                  }}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    padding: "6px 10px",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {typeBackToListLabel}
                </button>
              </div>
            )}
                    </div>
                    
                    {/* Súly */}
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        fontSize: "14px", 
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                      }}>
                        {t("filaments.weight")}
                      </label>
            <input 
              type="number" 
              min="1"
              max="10000"
              placeholder={t("filaments.weight")} 
              value={weight} 
              onChange={e => {
                const val = Number(e.target.value);
                const validation = validateFilamentWeight(val, settings.language);
                if (validation.isValid) {
                  setWeight(val);
                } else if (validation.errorMessage) {
                  showToast(validation.errorMessage, "error");
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ 
                ...themeStyles.input, 
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
              aria-label={t("filaments.weight")}
              aria-required="true"
              aria-describedby="filament-weight-description"
            />
                      <span id="filament-weight-description" style={{ display: "none" }}>
                        {t("filaments.weightDescription")}
                      </span>
                    </div>
                    
                    {/* Ár */}
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        fontSize: "14px", 
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                      }}>
                        {t("filaments.pricePerKg")}
                      </label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              inputMode="decimal"
              lang="en-US"
              placeholder={t("filaments.pricePerKg")} 
              value={pricePerKgRaw}
              onChange={e => handlePriceInputChange(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.inputBorder;
                e.target.style.boxShadow = "none";
                handlePriceInputBlur();
              }}
              style={{ 
                ...themeStyles.input, 
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            />
            {/* Ár előzmények gomb és megjelenítés */}
            {editingIndex !== null && priceHistory.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <button
                  data-tutorial="price-history-button"
                  type="button"
                  onClick={() => setShowPriceHistory(!showPriceHistory)}
                  style={{
                    ...themeStyles.buttonSecondary,
                    padding: "4px 8px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {showPriceHistory ? "📉" : "📈"} {t("filaments.priceHistory.show")} ({priceHistory.length})
                </button>
                {showPriceHistory && (
                  <div style={{
                    marginTop: "8px",
                    padding: "8px",
                    backgroundColor: theme.colors.surface,
                    borderRadius: "6px",
                    border: `1px solid ${theme.colors.border}`,
                    fontSize: "12px",
                  }}>
                    <div style={{ fontWeight: "600", marginBottom: "4px", color: theme.colors.text }}>
                      {t("filaments.priceHistory.title")}
                    </div>
                    <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                      {priceHistory.slice(0, 5).map((entry) => {
                        const isIncrease = entry.priceChange > 0;
                        const changeColor = isIncrease ? theme.colors.danger : theme.colors.success;
                        return (
                          <div key={entry.id} style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            marginBottom: "4px",
                            padding: "4px 0",
                            borderBottom: `1px solid ${theme.colors.border}`,
                          }}>
                            <span style={{ color: theme.colors.textSecondary }}>
                              {new Date(entry.date).toLocaleDateString((() => {
                                const LANGUAGE_LOCALES: Record<string, string> = {
                                  hu: "hu-HU", de: "de-DE", fr: "fr-FR", it: "it-IT", es: "es-ES",
                                  pl: "pl-PL", cs: "cs-CZ", sk: "sk-SK", zh: "zh-CN", "pt-BR": "pt-BR",
                                  uk: "uk-UA", ru: "ru-RU", en: "en-US",
                                };
                                return LANGUAGE_LOCALES[settings.language] ?? "en-US";
                              })(), {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span style={{ color: theme.colors.textSecondary }}>
                              {entry.oldPrice.toFixed(2)} →
                            </span>
                            <span style={{ fontWeight: "600", color: theme.colors.text }}>
                              {entry.newPrice.toFixed(2)} {entry.currency}
                            </span>
                            <span style={{ color: changeColor, fontWeight: "600" }}>
                              {isIncrease ? "+" : ""}{entry.priceChangePercent.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                      {priceHistory.length > 5 && (
                        <div style={{ 
                          textAlign: "center", 
                          marginTop: "4px", 
                          fontSize: "11px", 
                          color: theme.colors.textSecondary,
                          fontStyle: "italic",
                        }}>
                          {t("filaments.priceHistory.more").replace("{count}", String(priceHistory.length - 5))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
                    </div>
                    
                    {/* Kép feltöltés */}
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        fontSize: "14px", 
                        color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text, 
                      }}>
                        📷 {t("filaments.image.label")}
                      </label>
                      {imagePreview ? (
                        <div style={{ position: "relative", display: "inline-block", marginBottom: "8px" }}>
                          <img 
                            src={imagePreview} 
                            alt={t("filaments.imagePreviewAlt")} 
                            style={{ 
                              maxWidth: "100%", 
                              maxHeight: "200px", 
                              borderRadius: "8px",
                              border: `2px solid ${theme.colors.border}`,
                              objectFit: "cover",
                              boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                              width: "100%"
                            }} 
                          />
                          <button
                            onClick={removeImage}
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              padding: "6px 12px",
                              fontSize: "14px",
                              backgroundColor: theme.colors.danger,
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              boxShadow: `0 2px 4px ${theme.colors.shadow}`,
                            }}
                          >
                            ✕ {t("filaments.image.remove")}
                          </button>
                        </div>
                      ) : (
                        <label
                          style={{
                            display: "flex",
                            padding: "20px",
                            border: `2px dashed ${theme.colors.border}`,
                            borderRadius: "8px",
                            textAlign: "center",
                            cursor: "pointer",
                            backgroundColor: theme.colors.surfaceHover,
                            transition: "all 0.2s",
                            width: "100%",
                            boxSizing: "border-box",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "12px",
                            minHeight: "120px"
                          }}
                          onMouseEnter={(e) => {
                            if (!interactionsEnabled) return;
                            e.currentTarget.style.borderColor = theme.colors.primary;
                            e.currentTarget.style.backgroundColor = theme.colors.primary + "10";
                          }}
                          onMouseLeave={(e) => {
                            if (!interactionsEnabled) return;
                            e.currentTarget.style.borderColor = theme.colors.border;
                            e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                          <img
                            src={getFilamentPlaceholder(fallbackHex)}
                            alt={t("filaments.placeholderAlt")}
                            style={{ width: "60px", height: "60px" }}
                          />
                          <span
                            style={{
                              fontSize: "13px",
                              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                              display: "block",
                            }}
                          >
                            {t("filaments.image.uploadPrompt")}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: theme.colors.textMuted,
                              display: "block",
                            }}
                          >
                            {t("filaments.image.uploadLimit")}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Jobb oszlop: Szín választás */}
                <div style={{ flex: "1 1 300px", minWidth: "280px" }}>
                <div style={{
                  ...themeStyles.card,
                  padding: "20px",
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  <h4 style={{
                    margin: "0 0 20px 0",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                    borderBottom: `2px solid ${theme.colors.border}`,
                    paddingBottom: "12px"
                  }}>
                    🎨 {t("filaments.color")}
                  </h4>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Szín név */}
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        fontSize: "14px", 
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                      }}>
                        {t("filaments.color")}
                      </label>
                      <input
                        placeholder={t("filaments.color")}
                        value={color}
                        onChange={e => handleColorInputChange(e.target.value)}
                        onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                        onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                        style={{ 
                          ...themeStyles.input, 
                          width: "100%",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    
                    {/* Egyedi szín */}
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        fontSize: "14px", 
                        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                      }}>
                        {t("filaments.customColor")}
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                        <input
                          type="color"
                          value={fallbackHex}
                          onChange={e => handleCustomColorPick(e.target.value)}
                          disabled={colorMode === "multicolor"}
                          style={{
                            width: "48px",
                            height: "32px",
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: "6px",
                            background: "none",
                            cursor: colorMode === "multicolor" ? "not-allowed" : "pointer",
                            opacity: colorMode === "multicolor" ? 0.6 : 1,
                          }}
                          aria-label={t("filaments.customColor")}
                        />
                        <span style={{ fontSize: "13px", color: theme.colors.textMuted, fontFamily: "monospace" }}>
                          {colorMode === "multicolor" ? multicolorLabel : fallbackHex}
                        </span>
                      </div>
                    </div>
                    
                    {/* Szín mód */}
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600", 
                        fontSize: "14px", 
                        color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text, 
                      }}>
                        {t("filaments.colorMode.label")}
                      </label>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(["solid", "multicolor"] as ColorMode[]).map(mode => {
                const isActive = colorMode === mode;
                const label =
                  mode === "solid"
                    ? t("filaments.colorMode.option.solid")
                    : t("filaments.colorMode.option.multicolor");
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleColorModeChange(mode)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      border: `1px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
                      backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceHover,
                      color: isActive ? "#fff" : theme.colors.text,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {label}
                  </button>
                );
                      })}
                      </div>
                    </div>
                    
                    {/* Többszínű megjegyzés */}
                    {colorMode === "multicolor" && (
                      <div>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "8px", 
                          fontWeight: "600", 
                          fontSize: "14px", 
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                        }}>
                          {t("filaments.colorMode.placeholder")}
                        </label>
                        <input
                          value={multiColorHint}
                          onChange={e => setMultiColorHint(e.target.value)}
                          onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                          onBlur={(e) => {
                            e.target.style.borderColor = theme.colors.inputBorder;
                            e.target.style.boxShadow = "none";
                          }}
                          placeholder={t("filaments.colorMode.placeholder")}
                          style={{ 
                            ...themeStyles.input, 
                            width: "100%",
                            boxSizing: "border-box",
                          }}
                        />
                        <p style={{ fontSize: "11px", color: theme.colors.textMuted, marginTop: "6px", marginBottom: 0 }}>
                          {t("filaments.colorMode.note")}
                        </p>
                      </div>
                    )}
                    
                    {/* Ajánlott színek */}
                    {paletteColorOptions.length > 0 && (
                      <div>
                        <label style={{ 
                          display: "block", 
                          marginBottom: "8px", 
                          fontWeight: "600", 
                          fontSize: "14px", 
                          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
                        }}>
                          {t("filaments.colorPaletteTitle")}
                        </label>
                        <p style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, marginBottom: "12px" }}>
                          {t("filaments.colorPaletteHint")}
                        </p>
                        {finishOptions.length > 1 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                            <button
                              type="button"
                              onClick={() => setSelectedFinish("all")}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                border: `1px solid ${selectedFinish === "all" ? theme.colors.primary : theme.colors.border}`,
                                backgroundColor: selectedFinish === "all" ? theme.colors.primary : theme.colors.surfaceHover,
                                color: selectedFinish === "all" ? "#fff" : theme.colors.text,
                                cursor: "pointer",
                                transition: "all 0.2s"
                              }}
                            >
                              {t("filaments.finishAll")}
                            </button>
                            {finishOptions.map((finish: string) => {
                              const isActive = selectedFinish === finish;
                              return (
                                <button
                                  key={finish}
                                  type="button"
                                  onClick={() => setSelectedFinish(finish)}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "999px",
                                    fontSize: "12px",
                                    border: `1px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
                                    backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceHover,
                                    color: isActive ? "#fff" : theme.colors.text,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  {getFinishLabel(finish as FilamentFinish, settings.language)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            maxHeight: "200px",
                            overflowY: "auto",
                            padding: "4px",
                          }}
                          onScroll={(e) => {
                            if (!shouldVirtualizePalette) return;
                            const target = e.currentTarget;
                            const scrollTop = target.scrollTop;
                            const clientHeight = target.clientHeight;
                            const start = Math.max(
                              0,
                              Math.floor(scrollTop / PALETTE_ITEM_HEIGHT) - PALETTE_OVERSCAN
                            );
                            const end = Math.min(
                              filteredPaletteOptions.length - 1,
                              Math.ceil((scrollTop + clientHeight) / PALETTE_ITEM_HEIGHT) + PALETTE_OVERSCAN
                            );
                            setVisiblePaletteRange((prev) => {
                              if (prev.start === start && prev.end === end) {
                                return prev;
                              }
                              return { start, end };
                            });
                          }}
                        >
                  {shouldVirtualizePalette && topPaletteSpacerHeight > 0 && (
                    <div style={{ height: `${topPaletteSpacerHeight}px`, flexShrink: 0 }} />
                  )}
                  {visiblePaletteOptions.map(option => {
                    const optionHex = getOptionHex(option);
                    const optionIsMulticolor = option.colorMode === "multicolor";
                    const optionGradient = "linear-gradient(135deg, #F97316 0%, #EC4899 33%, #6366F1 66%, #22D3EE 100%)";
                    const localizedLabel = getLocalizedColorLabel(option, settings.language);
                    const isActive = !useCustomColor && selectedColorOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleColorSelectChange(option.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          border: isActive
                            ? `2px solid ${optionIsMulticolor ? theme.colors.primary : optionHex}`
                            : `1px solid ${theme.colors.border}`,
                          background:
                            isActive && optionIsMulticolor
                              ? optionGradient
                              : isActive
                              ? optionHex
                              : optionIsMulticolor
                              ? optionGradient
                              : theme.colors.surfaceHover,
                          color: isActive || optionIsMulticolor ? "#fff" : theme.colors.text,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <span
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            backgroundColor: optionIsMulticolor ? "transparent" : optionHex,
                            backgroundImage: optionIsMulticolor ? optionGradient : "none",
                            border: "1px solid rgba(0,0,0,0.15)"
                          }}
                        />
                        <span style={{ fontSize: "12px" }}>{localizedLabel}</span>
                      </button>
                    );
                  })}
                  {shouldVirtualizePalette && bottomPaletteSpacerHeight > 0 && (
                    <div style={{ height: `${bottomPaletteSpacerHeight}px`, flexShrink: 0 }} />
                  )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>
              
              {/* Akció gombok */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", paddingTop: "20px", borderTop: `2px solid ${theme.colors.border}` }}>
          <Tooltip content={editingIndex !== null ? t("filaments.tooltip.saveShortcut") : t("filaments.tooltip.addShortcut")}>
            <button 
              onClick={addFilament}
              onMouseEnter={(e) => {
                if (!interactionsEnabled) return;
                Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover);
              }}
              onMouseLeave={(e) => {
                if (!interactionsEnabled) return;
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.transform = "translateY(0)";
                btn.style.boxShadow =
                  editingIndex !== null ? themeStyles.buttonSuccess.boxShadow : themeStyles.buttonPrimary.boxShadow;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  addFilament();
                }
              }}
              style={{ 
                ...themeStyles.button, 
                ...(editingIndex !== null ? themeStyles.buttonSuccess : themeStyles.buttonPrimary),
                fontSize: "16px",
                padding: "14px 28px"
              }}
              aria-label={editingIndex !== null ? t("filaments.actions.saveAria") : t("filaments.actions.addAria")}
            >
              {editingIndex !== null ? t("filaments.save") : "➕ " + t("filaments.add")}
            </button>
          </Tooltip>
          {showAddForm && editingIndex === null && (
            <Tooltip content={t("filaments.tooltip.cancelShortcut")}>
              <button
                onClick={() => setShowAddForm(false)}
                onMouseEnter={(e) => {
                  if (!interactionsEnabled) return;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  if (!interactionsEnabled) return;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowAddForm(false);
                  }
                }}
                style={{ 
                  ...themeStyles.button,
                  ...themeStyles.buttonSecondary,
                  padding: "8px 16px",
                  fontSize: "12px",
                  marginLeft: "10px"
                }}
                aria-label={t("filaments.actions.cancelAria")}
              >
                {t("filaments.cancel")}
              </button>
                </Tooltip>
              )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {sortedFilaments.length > 0 ? (
        <div style={{ ...themeStyles.card, overflow: "hidden", padding: 0 }}>
          {/* Bulk műveletek toolbar */}
          {selectedFilamentIds.size > 0 && (
            <div style={{
              padding: "12px 16px",
              backgroundColor: theme.colors.surfaceHover,
              borderBottom: `1px solid ${theme.colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}>
              <span style={{ color: theme.colors.text, fontSize: "14px", fontWeight: "600" }}>
                {t("filaments.bulk.selected").replace("{{count}}", selectedFilamentIds.size.toString())}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={deselectAll}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonSecondary,
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                >
                  {t("filaments.bulk.deselectAll")}
                </button>
                <button
                  onClick={handleBulkDelete}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonDanger,
                    padding: "6px 12px",
                    fontSize: "12px",
                  }}
                >
                  {t("filaments.bulk.delete").replace("{{count}}", selectedFilamentIds.size.toString())}
                </button>
              </div>
            </div>
          )}
          <div
            ref={filamentsListContainerRef}
            style={{
              maxHeight: shouldVirtualizeFilaments ? "600px" : "auto",
              overflowY: shouldVirtualizeFilaments ? "auto" : "visible",
            }}
            onScroll={() => {
              if (!filamentsListContainerRef.current) return;
              if (!shouldVirtualizeFilaments) return;

              const container = filamentsListContainerRef.current;
              const scrollTop = container.scrollTop;
              const clientHeight = container.clientHeight;

              const start = Math.max(
                0,
                Math.floor(scrollTop / FILAMENT_ROW_HEIGHT) - FILAMENT_OVERSCAN
              );
              const end = Math.min(
                sortedFilaments.length - 1,
                Math.ceil((scrollTop + clientHeight) / FILAMENT_ROW_HEIGHT) + FILAMENT_OVERSCAN
              );

              setVisibleFilamentRange((prev) => {
                if (prev.start === start && prev.end === end) {
                  return prev;
                }
                return { start, end };
              });
            }}
          >
          <table style={themeStyles.table}>
            <thead>
              <tr>
                <th style={{ ...themeStyles.tableHeader, width: "50px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                    aria-label={t("filaments.bulk.selectAll")}
                  />
                </th>
                {columnVisibility.image && (
                  <th style={themeStyles.tableHeader}>{t("common.image")}</th>
                )}
                {columnVisibility.brand && (
                  <th 
                    style={{ 
                      ...themeStyles.tableHeader, 
                      cursor: "pointer",
                      userSelect: "none",
                      position: "relative",
                      paddingRight: "28px",
                      whiteSpace: "nowrap",
                    }}
                    onClick={(e) => handleSort("brand", e)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                    }}
                  >
                    {t("filaments.brand")}
                    {(() => {
                      const idx = sortConfig.findIndex(cfg => cfg.column === "brand");
                      if (idx === -1) return null;
                      const cfg = sortConfig[idx];
                      const isPrimary = idx === 0;
                      return (
                        <span style={{ marginLeft: "6px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span>{cfg.direction === "asc" ? "↑" : "↓"}</span>
                          {!isPrimary && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "0 4px",
                                borderRadius: "999px",
                                backgroundColor: theme.colors.surfaceHover,
                                color: theme.colors.textMuted,
                              }}
                            >
                              {idx + 1}
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </th>
                )}
                {columnVisibility.type && (
                  <th 
                    style={{ 
                      ...themeStyles.tableHeader, 
                      cursor: "pointer",
                      userSelect: "none",
                      position: "relative",
                      paddingRight: "28px",
                      whiteSpace: "nowrap",
                    }}
                    onClick={(e) => handleSort("type", e)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                    }}
                  >
                    {t("filaments.type")}
                    {(() => {
                      const idx = sortConfig.findIndex(cfg => cfg.column === "type");
                      if (idx === -1) return null;
                      const cfg = sortConfig[idx];
                      const isPrimary = idx === 0;
                      return (
                        <span style={{ marginLeft: "6px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span>{cfg.direction === "asc" ? "↑" : "↓"}</span>
                          {!isPrimary && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "0 4px",
                                borderRadius: "999px",
                                backgroundColor: theme.colors.surfaceHover,
                                color: theme.colors.textMuted,
                              }}
                            >
                              {idx + 1}
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </th>
                )}
                {columnVisibility.color && (
                  <th style={themeStyles.tableHeader}>{t("filaments.color")}</th>
                )}
                {columnVisibility.weight && (
                  <th 
                    style={{ 
                      ...themeStyles.tableHeader, 
                      cursor: "pointer",
                      userSelect: "none",
                      position: "relative",
                      paddingRight: "28px",
                      whiteSpace: "nowrap",
                    }}
                    onClick={(e) => handleSort("weight", e)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                    }}
                  >
                    {t("filaments.weight")}
                    {(() => {
                      const idx = sortConfig.findIndex(cfg => cfg.column === "weight");
                      if (idx === -1) return null;
                      const cfg = sortConfig[idx];
                      const isPrimary = idx === 0;
                      return (
                        <span style={{ marginLeft: "6px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span>{cfg.direction === "asc" ? "↑" : "↓"}</span>
                          {!isPrimary && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "0 4px",
                                borderRadius: "999px",
                                backgroundColor: theme.colors.surfaceHover,
                                color: theme.colors.textMuted,
                              }}
                            >
                              {idx + 1}
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </th>
                )}
                {columnVisibility.pricePerKg && (
                  <th 
                    style={{ 
                      ...themeStyles.tableHeader, 
                      cursor: "pointer",
                      userSelect: "none",
                      position: "relative",
                      paddingRight: "28px",
                      whiteSpace: "nowrap",
                    }}
                    onClick={(e) => handleSort("pricePerKg", e)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface;
                    }}
                  >
                    {t("filaments.pricePerKg").replace("€", settings.currency)}
                    {(() => {
                      const idx = sortConfig.findIndex(cfg => cfg.column === "pricePerKg");
                      if (idx === -1) return null;
                      const cfg = sortConfig[idx];
                      const isPrimary = idx === 0;
                      return (
                        <span style={{ marginLeft: "6px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <span>{cfg.direction === "asc" ? "↑" : "↓"}</span>
                          {!isPrimary && (
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "0 4px",
                                borderRadius: "999px",
                                backgroundColor: theme.colors.surfaceHover,
                                color: theme.colors.textMuted,
                              }}
                            >
                              {idx + 1}
                            </span>
                          )}
                        </span>
                      );
                    })()}
                  </th>
                )}
                {columnVisibility.action && (
                  <th style={themeStyles.tableHeader}>{t("filaments.action")}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {shouldVirtualizeFilaments && topFilamentSpacerHeight > 0 && (
                <tr style={{ height: `${topFilamentSpacerHeight}px` }}>
                  <td
                    colSpan={visibleFilamentColumnCount}
                    style={{ padding: 0, border: "none" }}
                  />
                </tr>
              )}
              {visibleFilaments.map((f) => {
                const originalIndex = filamentsWithHistory.findIndex(orig => orig === f);
                const storedHex = normalizeHex(f.colorHex) || "";
                const nameBasedHex = resolveLibraryHexFromName(f.color, f.brand, f.type) || resolveColorHexFromName(f.color);
                const resolvedHex = normalizeHex(
                  (nameBasedHex && storedHex && nameBasedHex !== storedHex ? nameBasedHex : storedHex) ||
                    nameBasedHex ||
                    ""
                ) || DEFAULT_COLOR_HEX;
                const filamentColorMode = (f.colorMode as ColorMode) ?? (f.multiColorHint ? "multicolor" : "solid");
                const isMulticolor = filamentColorMode === "multicolor";
                const displayHex = resolvedHex;
                const previewSrc = f.imageBase64 || getFilamentPlaceholder(resolvedHex);
                const hasUploadedImage = Boolean(f.imageBase64);
                const multiLabel = multicolorLabel;
                const swatchGradient = "linear-gradient(135deg, #F97316 0%, #EC4899 33%, #6366F1 66%, #22D3EE 100%)";
                const displayName =
                  f.color || (isMulticolor ? f.multiColorHint || multiLabel : displayHex);
                const secondaryText = isMulticolor
                  ? f.multiColorHint
                    ? `${multiLabel} • ${f.multiColorHint}`
                    : multiLabel
                  : displayHex;
                const handleThumbnailClick = () => {
                  if (!f.imageBase64) return;
                  const newWindow = window.open("", "_blank");
                  if (newWindow) {
                    newWindow.document.write(`
                      <html>
                        <head><title>${f.brand} ${f.type}</title></head>
                        <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                          <img src="${f.imageBase64}" style="max-width:90%; max-height:90vh; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.2);" />
                        </body>
                      </html>
                    `);
                  }
                };
                const filamentId = getFilamentId(f, originalIndex);
                const isSelected = selectedFilamentIds.has(filamentId);
                
                return (
                  <tr 
                    key={filamentId} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, originalIndex)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, originalIndex)}
                    onDragEnd={handleDragEnd}
                    onContextMenu={(e) => handleContextMenu(e, originalIndex)}
                    style={{ 
                      transition: "background-color 0.2s",
                      cursor: draggedFilamentIndex === originalIndex ? "grabbing" : "grab",
                      opacity: draggedFilamentIndex === originalIndex ? 0.5 : 1,
                      backgroundColor: isSelected ? theme.colors.primary + "15" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (draggedFilamentIndex !== originalIndex) {
                        e.currentTarget.style.backgroundColor = isSelected 
                          ? theme.colors.primary + "20" 
                          : theme.colors.surfaceHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (draggedFilamentIndex !== originalIndex) {
                        e.currentTarget.style.backgroundColor = isSelected 
                          ? theme.colors.primary + "15" 
                          : theme.colors.surface;
                      }
                    }}
                  >
                    <td style={{ ...themeStyles.tableCell, padding: "8px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(filamentId)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                        aria-label={t("filaments.bulk.select").replace("{{brand}}", f.brand).replace("{{type}}", f.type)}
                      />
                    </td>
                    {columnVisibility.image && (
                      <td style={{ ...themeStyles.tableCell, padding: "8px", textAlign: "center" }}>
                        <img
                          src={previewSrc}
                          alt={hasUploadedImage ? `${f.brand} ${f.type}` : t("filaments.placeholderAlt")}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: `1px solid ${theme.colors.border}`,
                            cursor: hasUploadedImage ? "pointer" : "default",
                            boxShadow: hasUploadedImage ? `0 2px 6px ${theme.colors.shadow}` : "none"
                          }}
                          onClick={handleThumbnailClick}
                          title={hasUploadedImage ? t("filaments.tooltip.viewImage") : undefined}
                        />
                      </td>
                    )}
                    {columnVisibility.brand && (
                      <td style={themeStyles.tableCell}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(originalIndex);
                            }}
                            onMouseEnter={(e) => {
                              if (!interactionsEnabled) return;
                              e.currentTarget.style.transform = "scale(1.2)";
                            }}
                            onMouseLeave={(e) => {
                              if (!interactionsEnabled) return;
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              fontSize: "18px",
                              color: f.favorite ? "#fbbf24" : theme.colors.textMuted,
                              transition: "all 0.2s",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            aria-label={f.favorite ? t("filaments.favorite.remove") : t("filaments.favorite.add")}
                            title={f.favorite ? t("filaments.favorite.remove") : t("filaments.favorite.add")}
                          >
                            {f.favorite ? "⭐" : "☆"}
                          </button>
                          <span>{f.brand}</span>
                        </div>
                      </td>
                    )}
                    {columnVisibility.type && (
                      <td style={themeStyles.tableCell}>{f.type}</td>
                    )}
                    {columnVisibility.color && (
                      <td style={themeStyles.tableCell}>
                        {displayName ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                backgroundColor: isMulticolor ? "transparent" : displayHex,
                                backgroundImage: isMulticolor ? swatchGradient : "none",
                                border: "1px solid rgba(0,0,0,0.15)",
                              }}
                            />
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span>{displayName}</span>
                              <span style={{ fontSize: "11px", color: theme.colors.textMuted }}>
                                {secondaryText}
                              </span>
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    )}
                    {columnVisibility.weight && (
                      <td style={themeStyles.tableCell}>{f.weight}g</td>
                    )}
                    {columnVisibility.pricePerKg && (
                      <td style={themeStyles.tableCell}>
                        <strong style={{ color: theme.colors.success }}>
                          {filamentPrice(f, settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}/kg
                        </strong>
                      </td>
                    )}
                    {columnVisibility.action && (
                      <td style={themeStyles.tableCell}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <Tooltip content={t("filaments.priceSearch")}>
                            <button
                              data-tutorial="online-price-button"
                              onClick={() => void handleOpenPriceSearch(f)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.backgroundColor = theme.colors.surface;
                              }}
                              style={{
                                ...themeStyles.button,
                                padding: "8px 12px",
                                fontSize: "14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                border: `1px solid ${theme.colors.border}`,
                                minWidth: "40px"
                              }}
                              aria-label={t("filaments.priceSearch")}
                            >
                              🔍
                            </button>
                          </Tooltip>
                          <Tooltip content={t("filaments.tooltip.edit")}>
                            <button 
                              onClick={() => startEdit(originalIndex)}
                              disabled={editingIndex !== null && editingIndex !== originalIndex}
                              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                              style={{ 
                                ...themeStyles.button,
                                ...themeStyles.buttonPrimary,
                                padding: "8px 16px",
                                fontSize: "12px",
                                opacity: editingIndex !== null && editingIndex !== originalIndex ? 0.5 : 1,
                                cursor: editingIndex !== null && editingIndex !== originalIndex ? "not-allowed" : "pointer"
                              }}
                            >
                              {t("filaments.edit")}
                            </button>
                          </Tooltip>
                          <Tooltip content={t("filaments.tooltip.delete")}>
                            <button 
                              onClick={() => deleteFilament(originalIndex)}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                              style={{ 
                                ...themeStyles.button,
                                ...themeStyles.buttonDanger,
                                padding: "8px 16px",
                                fontSize: "12px"
                              }}
                            >
                              {t("filaments.delete")}
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {shouldVirtualizeFilaments && bottomFilamentSpacerHeight > 0 && (
                <tr style={{ height: `${bottomFilamentSpacerHeight}px` }}>
                  <td
                    colSpan={visibleFilamentColumnCount}
                    style={{ padding: 0, border: "none" }}
                  />
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      ) : filamentsWithHistory.length > 0 && searchTerm ? (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p
            style={{
              margin: 0,
              color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
              fontSize: "16px",
            }}
          >
            {t("filaments.search.noResults")}
          </p>
        </div>
      ) : (
        <EmptyState
          icon="🧵"
          title={t("filaments.empty")}
          actionLabel={t("filaments.add")}
          onAction={() => setShowAddForm(true)}
          theme={theme}
          themeStyles={themeStyles}
          settings={settings}
        />
      )}
      
      <ConfirmDialog
        isOpen={deleteConfirmIndex !== null}
        title={t("common.confirm")}
        message={t("common.confirmDeleteFilament")}
        theme={theme}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmIndex(null)}
        confirmText={t("common.yes")}
        cancelText={t("common.cancel")}
        type="danger"
      />
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title={t("filaments.bulk.deleteConfirm.title")}
        message={t("filaments.bulk.deleteConfirm.message").replace("{{count}}", selectedFilamentIds.size.toString())}
        theme={theme}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
        confirmText={t("common.yes")}
        cancelText={t("common.cancel")}
        type="danger"
      />

      {/* Kontextus menü */}
      {contextMenu && (
        <div
          onClick={closeContextMenu}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1500,
            backgroundColor: "transparent"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: "8px",
              boxShadow: `0 4px 12px ${theme.colors.shadow}`,
              padding: "8px 0",
              minWidth: "180px",
              zIndex: 1501
            }}
          >
            <button
              onClick={() => handleContextMenuAction("edit")}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                backgroundColor: "transparent",
                border: "none",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ✏️ {t("filaments.edit")}
            </button>
            <div style={{ height: "1px", backgroundColor: theme.colors.border, margin: "4px 0" }} />
            <button
              onClick={() => handleContextMenuAction("delete")}
              style={{
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                backgroundColor: "transparent",
                border: "none",
                color: theme.colors.danger,
                cursor: "pointer",
                fontSize: "14px",
                transition: "background-color 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              🗑️ {t("common.delete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
