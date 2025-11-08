import React, { useEffect, useMemo, useState } from "react";
import type { Filament, Settings } from "../types";
import type { Theme } from "../utils/themes";
import { filamentPrice } from "../utils/filamentCalc";
import { useTranslation } from "../utils/translations";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "./Toast";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
import { Tooltip } from "./Tooltip";
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
} from "../utils/filamentLibrary";

interface Props {
  filaments: Filament[];
  setFilaments: (f: Filament[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const Filaments: React.FC<Props> = ({ filaments, setFilaments, settings, theme, themeStyles }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [weight, setWeight] = useState<number>(1000);
  const [pricePerKg, setPricePerKg] = useState<number>(0);
  const [color, setColor] = useState("");
  const [colorHex, setColorHex] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedFilamentIndex, setDraggedFilamentIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ index: number; x: number; y: number } | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string>("all");
  const [useCustomBrand, setUseCustomBrand] = useState(false);
  const [useCustomType, setUseCustomType] = useState(false);
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [brandPanelOpen, setBrandPanelOpen] = useState(false);
  const [typePanelOpen, setTypePanelOpen] = useState(false);
  const [brandFilter, setBrandFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const BRAND_LIMIT = 120;
  const TYPE_LIMIT = 120;
  const brandSelectPlaceholder =
    settings.language === "hu"
      ? "Válassz márkát..."
      : settings.language === "de"
      ? "Marke auswählen..."
      : "Select brand...";
  const brandCustomOptionLabel =
    settings.language === "hu"
      ? "➕ Új márka hozzáadása"
      : settings.language === "de"
      ? "➕ Neue Marke hinzufügen"
      : "➕ Add new brand";
  const brandBackToListLabel =
    settings.language === "hu"
      ? "← Vissza a márkákhoz"
      : settings.language === "de"
      ? "← Zurück zu den Marken"
      : "← Back to brands";
  const typeSelectPlaceholder =
    settings.language === "hu"
      ? "Válassz típust..."
      : settings.language === "de"
      ? "Typ auswählen..."
      : "Select type...";
  const typeCustomOptionLabel =
    settings.language === "hu"
      ? "➕ Új típus hozzáadása"
      : settings.language === "de"
      ? "➕ Neuen Typ hinzufügen"
      : "➕ Add new type";
  const typeBackToListLabel =
    settings.language === "hu"
      ? "← Vissza a típusokhoz"
      : settings.language === "de"
      ? "← Zurück zu den Typen"
      : "← Back to types";
  const colorSelectPlaceholder =
    settings.language === "hu"
      ? "Válassz színt..."
      : settings.language === "de"
      ? "Farbe auswählen..."
      : "Select color...";
  const colorCustomOptionLabel =
    settings.language === "hu"
      ? "➕ Egyedi szín megadása"
      : settings.language === "de"
      ? "➕ Eigene Farbe hinzufügen"
      : "➕ Add custom color";
  const colorBackToListLabel =
    settings.language === "hu"
      ? "← Vissza a színekhez"
      : settings.language === "de"
      ? "← Zurück zu den Farben"
      : "← Back to colors";
  const allBrands = useMemo(() => getAllBrands(), []);
  const allMaterials = useMemo(() => getAllMaterials(), []);

  const materialsForBrand = useMemo(
    () => getMaterialsForBrand(!useCustomBrand ? brand : undefined),
    [brand, useCustomBrand]
  );

  const libraryColorOptions = useMemo(() => {
    const brandForLookup = useCustomBrand ? undefined : brand;
    const typeForLookup = useCustomType ? undefined : type;
    if (!brandForLookup && !typeForLookup) {
      return [] as FilamentColorOption[];
    }
    return getLibraryColorOptions(brandForLookup, typeForLookup);
  }, [brand, type, useCustomBrand, useCustomType]);

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
    const list = term ? allBrands.filter(option => option.toLowerCase().includes(term)) : allBrands;
    return list.length > BRAND_LIMIT ? list.slice(0, BRAND_LIMIT) : list;
  }, [brandFilter, allBrands]);
  const materialsBase = useMemo(
    () => (useCustomBrand ? allMaterials : materialsForBrand),
    [useCustomBrand, allMaterials, materialsForBrand]
  );
  const filteredMaterials = useMemo<string[]>(() => {
    const term = typeFilter.trim().toLowerCase();
    const list = term ? materialsBase.filter(option => option.toLowerCase().includes(term)) : materialsBase;
    return list.length > TYPE_LIMIT ? list.slice(0, TYPE_LIMIT) : list;
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
        (labels.hu.toLowerCase() === lowered || labels.en.toLowerCase() === lowered || labels.de.toLowerCase() === lowered);
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
      return;
    }

    const presetMatch = findColorOptionByLabel(color);
    if (presetMatch) {
      setSelectedFinish(presetMatch.finish);
      const matchedHex = normalizeHex(presetMatch.hex);
      if (!normalizedSelectedHex && matchedHex) {
        setColorHex(matchedHex);
      }
      return;
    }

    setSelectedFinish("all");
  }, [brand, type, color, normalizedSelectedHex]);

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
    setColor("");
    setColorHex("");
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

  const handleColorInputChange = (value: string) => {
    if (!useCustomColor) {
      setUseCustomColor(true);
    }
    setColor(value);
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
    if (!file.type.startsWith('image/')) {
      showToast(
        settings.language === "hu" ? "Csak kép fájlok tölthetők fel!" :
        settings.language === "de" ? "Nur Bilddateien können hochgeladen werden!" :
        "Only image files can be uploaded!",
        "error"
      );
      return;
    }

    // Ellenőrizzük a fájl méretét (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(
        settings.language === "hu" ? "A kép mérete nem lehet nagyobb 5MB-nál!" :
        settings.language === "de" ? "Die Bildgröße darf 5 MB nicht überschreiten!" :
        "Image size cannot exceed 5MB!",
        "error"
      );
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
    if (!brand || !type || !pricePerKg) {
      showToast(t("common.error") + ": " + (settings.language === "hu" ? "Kérlek töltsd ki az összes kötelező mezőt!" : settings.language === "de" ? "Bitte füllen Sie alle Pflichtfelder aus!" : "Please fill in all required fields!"), "error");
      return;
    }
    
    if (weight <= 0 || pricePerKg <= 0) {
      showToast(t("common.error") + ": " + (settings.language === "hu" ? "A súly és az ár pozitív szám kell legyen!" : settings.language === "de" ? "Gewicht und Preis müssen positive Zahlen sein!" : "Weight and price must be positive numbers!"), "error");
      return;
    }
    
    // Kép optimalizálása, ha van
    let optimizedImage: string | undefined = undefined;
    if (imagePreview) {
      try {
        optimizedImage = await optimizeImage(imagePreview, 800, 800, 0.8);
      } catch (error) {
        console.error("❌ Kép optimalizálás hiba:", error);
        showToast(
          settings.language === "hu" ? "Hiba a kép optimalizálása során, az eredeti kép használata..." :
          settings.language === "de" ? "Fehler bei der Bildoptimierung, ursprüngliches Bild wird verwendet..." :
          "Error optimizing image, using original...",
          "error"
        );
        optimizedImage = imagePreview;
      }
    }
    
    const normalizedSaveHex = normalizeHex(colorHex) || undefined;

    if (editingIndex !== null) {
      // Szerkesztési mód: frissítjük a filamentet
      console.log("✏️ Filament szerkesztése...", { index: editingIndex, brand, type, pricePerKg, hasImage: !!optimizedImage });
      const updated = [...filaments];
      updated[editingIndex] = { 
        brand, 
        type, 
        weight, 
        pricePerKg, 
        color: color || undefined,
        colorHex: normalizedSaveHex,
        imageBase64: optimizedImage
      };
      setFilaments(updated);
      console.log("✅ Filament sikeresen frissítve", { index: editingIndex });
      showToast(t("common.filamentUpdated"), "success");
      resetForm();
    } else {
      // Új filament hozzáadása
      console.log("➕ Új filament hozzáadása...", { brand, type, pricePerKg, hasImage: !!optimizedImage });
      setFilaments([...filaments, { 
        brand, 
        type, 
        weight, 
        pricePerKg, 
        color: color || undefined,
        colorHex: normalizedSaveHex,
        imageBase64: optimizedImage
      }]);
      console.log("✅ Filament sikeresen hozzáadva", { brand, type });
      showToast(t("common.filamentAdded"), "success");
      resetForm();
    }
  };

  const startEdit = (index: number) => {
    const filament = filaments[index];
    setBrand(filament.brand);
    setType(filament.type);
    setWeight(filament.weight);
    setPricePerKg(filament.pricePerKg);
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
    setImagePreview(filament.imageBase64 || null);
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const deleteFilament = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const confirmDelete = () => {
    if (deleteConfirmIndex === null) return;
    const index = deleteConfirmIndex;
    const filamentToDelete = filaments[index];
    console.log("🗑️ Filament törlése...", { index, brand: filamentToDelete?.brand, type: filamentToDelete?.type });
    setFilaments(filaments.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
    console.log("✅ Filament sikeresen törölve", { index });
    showToast(t("common.filamentDeleted"), "success");
    setDeleteConfirmIndex(null);
  };

  // Szűrés a keresési kifejezés alapján
  const filteredFilaments = filaments.filter(f => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.brand.toLowerCase().includes(term) ||
      f.type.toLowerCase().includes(term) ||
      (f.color && f.color.toLowerCase().includes(term)) ||
      (f.colorHex && f.colorHex.toLowerCase().includes(term))
    );
  });

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
    console.log("🔄 Filamentek átrendezve", { draggedIndex: draggedFilamentIndex, targetIndex });
    showToast(
      settings.language === "hu" ? "Filamentek átrendezve" :
      settings.language === "de" ? "Filamente neu angeordnet" :
      "Filaments reordered",
      "success"
    );
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

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("filaments.title")}</h2>
      <p style={themeStyles.pageSubtitle}>
        {settings.language === "hu" ? "Filamentek kezelése és szerkesztése" : settings.language === "de" ? "Filamente verwalten und bearbeiten" : "Manage and edit filaments"}
      </p>
      
      {/* Kereső mező */}
      {filaments.length > 0 && (
        <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "600", 
            fontSize: "14px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            🔍 {settings.language === "hu" ? "Keresés" : settings.language === "de" ? "Suchen" : "Search"}
          </label>
          <input
            type="text"
            placeholder={settings.language === "hu" ? "Keresés márka, típus vagy szín alapján..." : settings.language === "de" ? "Suche nach Marke, Typ oder Farbe..." : "Search by brand, type or color..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.input, width: "100%", maxWidth: "400px" }}
            aria-label={settings.language === "hu" ? "Keresés filamentek között" : settings.language === "de" ? "Filamente durchsuchen" : "Search filaments"}
            aria-describedby="filament-search-description"
          />
          <span id="filament-search-description" style={{ display: "none" }}>
            {settings.language === "hu" ? "Keresés filamentek között márka, típus vagy szín alapján" : settings.language === "de" ? "Filamente nach Marke, Typ oder Farbe durchsuchen" : "Search filaments by brand, type or color"}
          </span>
        </div>
      )}
      
      {/* Új filament hozzáadása gomb */}
      {!showAddForm && editingIndex === null && (
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={settings.language === "hu" ? "Új filament hozzáadása (Ctrl/Cmd+N)" : settings.language === "de" ? "Neues Filament hinzufügen (Strg/Cmd+N)" : "Add new filament (Ctrl/Cmd+N)"}>
            <button
              onClick={() => setShowAddForm(true)}
              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
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
              aria-label={settings.language === "hu" ? "Új filament hozzáadása" : settings.language === "de" ? "Neues Filament hinzufügen" : "Add new filament"}
            >
              ➕ {t("filaments.addTitle")}
            </button>
          </Tooltip>
        </div>
      )}
      
      {/* Új filament hozzáadása form */}
      {(showAddForm || editingIndex !== null) && (
      <div style={{ ...themeStyles.card, marginBottom: "24px", backgroundColor: editingIndex !== null ? theme.colors.primary + "20" : theme.colors.surfaceHover, border: editingIndex !== null ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}` }}>
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
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
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
        <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ width: "200px", flexShrink: 0 }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
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
                      placeholder={settings.language === "hu" ? "Keresés..." : settings.language === "de" ? "Suchen..." : "Search..."}
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
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }
                              }}
                            >
                              {option}
                            </button>
                          );
                        })
                      ) : (
                        <div style={{ padding: "10px", fontSize: "12px", color: theme.colors.textMuted }}>
                          {settings.language === "hu"
                            ? "Nincs találat."
                            : settings.language === "de"
                            ? "Keine Treffer."
                            : "No matches."}
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
                  style={{ ...themeStyles.input, width: "100%" }}
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
          <div style={{ width: "240px", flexShrink: 0 }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
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
                      placeholder={settings.language === "hu" ? "Keresés..." : settings.language === "de" ? "Suchen..." : "Search..."}
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
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isSelected) {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }
                              }}
                            >
                              {option}
                            </button>
                          );
                        })
                      ) : (
                        <div style={{ padding: "10px", fontSize: "12px", color: theme.colors.textMuted }}>
                          {settings.language === "hu"
                            ? "Nincs találat."
                            : settings.language === "de"
                            ? "Keine Treffer."
                            : "No matches."}
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
                  style={{ ...themeStyles.input, width: "100%" }}
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
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
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
              style={{ ...themeStyles.input, width: "100%" }}
              aria-label={t("filaments.weight")}
              aria-required="true"
              aria-describedby="filament-weight-description"
            />
            <span id="filament-weight-description" style={{ display: "none" }}>
              {settings.language === "hu" ? "Filament súlya grammban (1-10000)" : settings.language === "de" ? "Filamentgewicht in Gramm (1-10000)" : "Filament weight in grams (1-10000)"}
            </span>
          </div>
          <div style={{ width: "180px", flexShrink: 0 }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
              {t("filaments.pricePerKg")}
            </label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              placeholder={t("filaments.pricePerKg")} 
              value={pricePerKg} 
              onChange={e => {
                const val = Number(e.target.value);
                const validation = validateFilamentPrice(val, settings.language);
                if (validation.isValid) {
                  setPricePerKg(val);
                } else if (validation.errorMessage) {
                  showToast(validation.errorMessage, "error");
                }
              }}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%" }}
            />
          </div>
          <div style={{ flex: "1 1 280px", minWidth: "220px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              whiteSpace: "nowrap" 
            }}>
              {t("filaments.color")}
            </label>
            <input
              placeholder={t("filaments.color")}
              value={color}
              onChange={e => handleColorInputChange(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "30%" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                {t("filaments.customColor")}
              </span>
              <input
                type="color"
                value={fallbackHex}
                onChange={e => handleCustomColorPick(e.target.value)}
                style={{ width: "36px", height: "24px", border: "none", background: "none", cursor: "pointer" }}
                aria-label={t("filaments.customColor")}
              />
              <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>{fallbackHex}</span>
            </div>
            {paletteColorOptions.length > 0 && (
              <div style={{ marginTop: "14px" }}>
                <strong style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                  {t("filaments.colorPaletteTitle")}
                </strong>
                <p style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, marginTop: "4px" }}>
                  {t("filaments.colorPaletteHint")}
                </p>
                {finishOptions.length > 1 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
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
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
                  {filteredPaletteOptions.map(option => {
                    const optionHex = getOptionHex(option);
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
                          border: isActive ? `2px solid ${optionHex}` : `1px solid ${theme.colors.border}`,
                          backgroundColor: isActive ? optionHex : theme.colors.surfaceHover,
                          color: isActive ? "#fff" : theme.colors.text,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <span
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            backgroundColor: optionHex,
                            border: "1px solid rgba(0,0,0,0.15)"
                          }}
                        />
                        <span style={{ fontSize: "12px" }}>{localizedLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Kép feltöltés */}
        <div style={{ marginTop: "20px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "600", 
            fontSize: "14px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            📷 {settings.language === "hu" ? "Kép (opcionális)" : settings.language === "de" ? "Bild (optional)" : "Image (optional)"}
          </label>
          {imagePreview ? (
            <div style={{ position: "relative", display: "inline-block", marginBottom: "8px" }}>
              <img 
                src={imagePreview} 
                alt={t("filaments.imagePreviewAlt")} 
                style={{ 
                  maxWidth: "300px", 
                  maxHeight: "300px", 
                  borderRadius: "8px",
                  border: `2px solid ${theme.colors.border}`,
                  objectFit: "cover",
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
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
                ✕ {settings.language === "hu" ? "Törlés" : settings.language === "de" ? "Löschen" : "Remove"}
              </button>
            </div>
          ) : (
            <label
              style={{
              display: "inline-flex",
                padding: "20px",
                border: `2px dashed ${theme.colors.border}`,
                borderRadius: "8px",
              textAlign: "center",
                cursor: "pointer",
                backgroundColor: theme.colors.surfaceHover,
                transition: "all 0.2s",
                minWidth: "200px",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary;
                e.currentTarget.style.backgroundColor = theme.colors.primary + "10";
              }}
              onMouseLeave={(e) => {
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
                style={{ width: "80px", height: "80px" }}
              />
              <span style={{ 
                fontSize: "14px", 
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                display: "block",
                maxWidth: "220px"
              }}>
                {settings.language === "hu" ? "Kattints a kép feltöltéséhez" : settings.language === "de" ? "Klicken Sie, um ein Bild hochzuladen" : "Click to upload image"}
              </span>
              <span style={{ 
                fontSize: "11px", 
                color: theme.colors.textMuted,
                display: "block",
                marginTop: "4px"
              }}>
                {settings.language === "hu" ? "Max. 5MB, JPG/PNG/WebP" : settings.language === "de" ? "Max. 5MB, JPG/PNG/WebP" : "Max. 5MB, JPG/PNG/WebP"}
              </span>
            </label>
          )}
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: `2px solid ${theme.colors.border}` }}>
          <Tooltip content={settings.language === "hu" ? (editingIndex !== null ? "Mentés (Ctrl/Cmd+S)" : "Hozzáadás (Ctrl/Cmd+S)") : settings.language === "de" ? (editingIndex !== null ? "Speichern (Strg/Cmd+S)" : "Hinzufügen (Strg/Cmd+S)") : (editingIndex !== null ? "Save (Ctrl/Cmd+S)" : "Add (Ctrl/Cmd+S)")}>
            <button 
              onClick={addFilament}
              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = editingIndex !== null ? themeStyles.buttonSuccess.boxShadow : themeStyles.buttonPrimary.boxShadow; }}
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
              aria-label={editingIndex !== null ? (settings.language === "hu" ? "Filament mentése" : settings.language === "de" ? "Filament speichern" : "Save filament") : (settings.language === "hu" ? "Filament hozzáadása" : settings.language === "de" ? "Filament hinzufügen" : "Add filament")}
            >
              {editingIndex !== null ? t("filaments.save") : "➕ " + t("filaments.add")}
            </button>
          </Tooltip>
          {showAddForm && editingIndex === null && (
            <Tooltip content={settings.language === "hu" ? "Mégse (Escape)" : settings.language === "de" ? "Abbrechen (Escape)" : "Cancel (Escape)"}>
              <button
                onClick={() => setShowAddForm(false)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
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
                aria-label={settings.language === "hu" ? "Mégse" : settings.language === "de" ? "Abbrechen" : "Cancel"}
              >
                {t("filaments.cancel")}
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      )}

      {filteredFilaments.length > 0 ? (
        <div style={{ ...themeStyles.card, overflow: "hidden", padding: 0 }}>
          <table style={themeStyles.table}>
            <thead>
              <tr>
                <th style={themeStyles.tableHeader}>{t("common.image")}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.brand")}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.type")}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.color")}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.weight")}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.pricePerKg").replace("€", settings.currency)}</th>
                <th style={themeStyles.tableHeader}>{t("filaments.action")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredFilaments.map((f, i) => {
                const originalIndex = filaments.findIndex(orig => orig === f);
                const storedHex = normalizeHex(f.colorHex) || "";
                const nameBasedHex = resolveLibraryHexFromName(f.color, f.brand, f.type) || resolveColorHexFromName(f.color);
                const resolvedHex = normalizeHex(
                  (nameBasedHex && storedHex && nameBasedHex !== storedHex ? nameBasedHex : storedHex) ||
                    nameBasedHex ||
                    ""
                ) || DEFAULT_COLOR_HEX;
                const displayHex = resolvedHex;
                const previewSrc = f.imageBase64 || getFilamentPlaceholder(resolvedHex);
                const hasUploadedImage = Boolean(f.imageBase64);
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
                return (
                  <tr 
                    key={i} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, originalIndex)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, originalIndex)}
                    onDragEnd={handleDragEnd}
                    onContextMenu={(e) => handleContextMenu(e, originalIndex)}
                    style={{ 
                      transition: "background-color 0.2s",
                      cursor: draggedFilamentIndex === originalIndex ? "grabbing" : "grab",
                      opacity: draggedFilamentIndex === originalIndex ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (draggedFilamentIndex !== originalIndex) {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (draggedFilamentIndex !== originalIndex) {
                        e.currentTarget.style.backgroundColor = theme.colors.surface;
                      }
                    }}
                  >
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
                        title={
                          hasUploadedImage
                            ? settings.language === "hu"
                              ? "Kattints a nagyobb kép megtekintéséhez"
                              : settings.language === "de"
                              ? "Klicken Sie, um ein größeres Bild anzuzeigen"
                              : "Click to view larger image"
                            : undefined
                        }
                      />
                    </td>
                    <td style={themeStyles.tableCell}>{f.brand}</td>
                    <td style={themeStyles.tableCell}>{f.type}</td>
                    <td style={themeStyles.tableCell}>
                      {f.color || f.colorHex ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              backgroundColor: displayHex,
                              border: "1px solid rgba(0,0,0,0.15)"
                            }}
                          />
                          <span>{f.color || displayHex}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  <td style={themeStyles.tableCell}>{f.weight}g</td>
                  <td style={themeStyles.tableCell}>
                    <strong style={{ color: theme.colors.success }}>
                      {filamentPrice(f, settings.currency).toFixed(2)} {settings.currency === "HUF" ? "Ft" : settings.currency}/kg
                    </strong>
                  </td>
                  <td style={themeStyles.tableCell}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Tooltip content={settings.language === "hu" ? "Szerkesztés" : settings.language === "de" ? "Bearbeiten" : "Edit"}>
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
                      <Tooltip content={settings.language === "hu" ? "Filament törlése" : settings.language === "de" ? "Filament löschen" : "Delete filament"}>
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
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : filaments.length > 0 && searchTerm ? (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p style={{ 
            margin: 0, 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, 
            fontSize: "16px" 
          }}>
            {settings.language === "hu" ? "Nincs találat a keresési kifejezésre." : settings.language === "de" ? "Keine Ergebnisse für den Suchbegriff." : "No results found for the search term."}
          </p>
        </div>
      ) : (
        <div style={{ ...themeStyles.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧵</div>
          <p style={{ 
            margin: 0, 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted, 
            fontSize: "16px" 
          }}>{t("filaments.empty")}</p>
        </div>
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
              ✏️ {settings.language === "hu" ? "Szerkesztés" : settings.language === "de" ? "Bearbeiten" : "Edit"}
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
              🗑️ {settings.language === "hu" ? "Törlés" : settings.language === "de" ? "Löschen" : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
