import { useState, useMemo, useCallback, useEffect } from "react";
import { save, open as openDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { Settings } from "../../../types";
import type { RawLibraryEntry } from "../../../utils/filamentLibrary";
import {
  getLibrarySnapshot,
  persistLibraryEntries,
  generateLibraryId,
  resetLibraryToDefaults,
  subscribeToLibraryChanges,
  ensureLibraryOverridesLoaded,
  getLocalizedLibraryColorLabel,
} from "../../../utils/filamentLibrary";
import type { FilamentFinish } from "../../../utils/filamentColors";
import type { ColorMode } from "../../../types";
import { translateText } from "../../../utils/translator";
import { logWithLanguage } from "../../../utils/languages/global_console";
import { sortLibraryEntries, sanitizeHexInput, resolveBaseLanguage } from "../utils";
import type { TranslationKey } from "../../../utils/translations";

export type LibraryDraft = {
  manufacturer: string;
  material: string;
  color: string;
  hex: string;
  finish: FilamentFinish;
  colorMode: ColorMode;
  multiColorHint: string;
  labels: { hu: string; en: string; de: string };
  baseLabel: string;
};

export const FINISH_OPTIONS: FilamentFinish[] = ["standard", "matte", "silk", "transparent", "metallic", "glow"];

export const LIBRARY_VIRTUAL_THRESHOLD = 200;
export const LIBRARY_ROW_HEIGHT = 78; // px
export const LIBRARY_OVERSCAN = 10;

const createEmptyLibraryDraft = (): LibraryDraft => ({
  manufacturer: "",
  material: "",
  color: "",
  hex: "#9CA3AF",
  finish: "standard",
  colorMode: "solid",
  multiColorHint: "",
  labels: { hu: "", en: "", de: "" },
  baseLabel: "",
});

interface UseSettingsLibraryProps {
  settings: Settings;
  activeTab: "general" | "display" | "security" | "advanced" | "data" | "library";
  showToast: (message: string, type: "success" | "error" | "info") => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
  openConfirmDialog: (config: {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: "danger" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
  }) => void;
}

interface UseSettingsLibraryReturn {
  // State
  libraryEntriesState: RawLibraryEntry[];
  libraryInitialized: boolean;
  libraryLoading: boolean;
  librarySaving: boolean;
  libraryDirty: boolean;
  libraryError: string | null;
  libraryBrandFilter: string;
  libraryMaterialFilter: string;
  librarySearch: string;
  editingLibraryId: string | null;
  libraryDraft: LibraryDraft;
  libraryModalOpen: boolean;
  libraryExporting: boolean;
  libraryImporting: boolean;
  visibleLibraryRange: { start: number; end: number };
  
  // Computed values
  filteredLibrary: { total: number; entries: RawLibraryEntry[] };
  shouldVirtualizeLibrary: boolean;
  libraryVisibleStart: number;
  libraryVisibleEnd: number;
  visibleLibraryEntries: RawLibraryEntry[];
  topLibrarySpacerHeight: number;
  bottomLibrarySpacerHeight: number;
  duplicateGroups: RawLibraryEntry[][];
  duplicateEntryIds: Set<string>;
  
  // Setters
  setLibraryBrandFilter: (value: string) => void;
  setLibraryMaterialFilter: (value: string) => void;
  setLibrarySearch: (value: string) => void;
  setVisibleLibraryRange: (value: { start: number; end: number }) => void;
  
  // Actions
  resetLibraryDraft: () => void;
  openNewLibraryModal: () => void;
  closeLibraryModal: () => void;
  loadLibraryEntries: () => void;
  handleLibraryDraftChange: <K extends keyof LibraryDraft>(field: K, value: LibraryDraft[K]) => void;
  handleLibraryBaseLabelChange: (value: string) => void;
  handleLibraryStartEdit: (entry: RawLibraryEntry) => void;
  handleLibraryDelete: (id: string | undefined) => void;
  handleLibraryAddOrUpdate: () => Promise<void>;
  handleLibrarySave: () => Promise<void>;
  handleLibraryReset: () => void;
  handleLibraryExportToFile: () => Promise<void>;
  handleLibraryImportFromFile: () => Promise<void>;
}

export function useSettingsLibrary({
  settings,
  activeTab,
  showToast,
  t,
  openConfirmDialog,
}: UseSettingsLibraryProps): UseSettingsLibraryReturn {
  // State
  const [libraryEntriesState, setLibraryEntriesState] = useState<RawLibraryEntry[]>([]);
  const [libraryInitialized, setLibraryInitialized] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [librarySaving, setLibrarySaving] = useState(false);
  const [libraryDirty, setLibraryDirty] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [libraryBrandFilter, setLibraryBrandFilter] = useState("");
  const [libraryMaterialFilter, setLibraryMaterialFilter] = useState("");
  const [librarySearch, setLibrarySearch] = useState("");
  const [editingLibraryId, setEditingLibraryId] = useState<string | null>(null);
  const [libraryDraft, setLibraryDraft] = useState<LibraryDraft>(createEmptyLibraryDraft);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [libraryExporting, setLibraryExporting] = useState(false);
  const [libraryImporting, setLibraryImporting] = useState(false);
  const [visibleLibraryRange, setVisibleLibraryRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: LIBRARY_VIRTUAL_THRESHOLD,
  });

  // Helper functions
  const resetLibraryDraft = useCallback(() => {
    setLibraryDraft(createEmptyLibraryDraft());
    setEditingLibraryId(null);
  }, []);

  const openNewLibraryModal = useCallback(() => {
    resetLibraryDraft();
    setLibraryModalOpen(true);
  }, [resetLibraryDraft]);

  const closeLibraryModal = useCallback(() => {
    resetLibraryDraft();
    setLibraryModalOpen(false);
  }, [resetLibraryDraft]);

  const loadLibraryEntries = useCallback(() => {
    logWithLanguage(settings.language, "log", "settings.library.load.start", {
      activeTab,
      initialized: libraryInitialized,
    });
    setLibraryLoading(true);
    try {
      ensureLibraryOverridesLoaded();
      const snapshot = getLibrarySnapshot();
      logWithLanguage(settings.language, "log", "settings.library.load.snapshot", {
        count: snapshot.length,
      });
      setLibraryEntriesState(sortLibraryEntries(snapshot));
      setLibraryInitialized(true);
      setLibraryDirty(false);
      setLibraryError(null);
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.library.load.error", { error });
      setLibraryError(error instanceof Error ? error.message : String(error));
    } finally {
      setLibraryLoading(false);
    }
  }, [settings.language, activeTab, libraryInitialized]);

  // Load library entries when tab becomes active
  useEffect(() => {
    if (activeTab === "library" && !libraryInitialized && !libraryLoading) {
      loadLibraryEntries();
    }
  }, [activeTab, libraryInitialized, libraryLoading, loadLibraryEntries]);

  // Subscribe to library changes
  useEffect(() => {
    if (activeTab !== "library") {
      return;
    }
    const unsubscribe = subscribeToLibraryChanges(() => {
      logWithLanguage(settings.language, "log", "settings.library.subscribe.update");
      const snapshot = getLibrarySnapshot();
      logWithLanguage(settings.language, "log", "settings.library.subscribe.snapshot", {
        count: snapshot.length,
      });
      setLibraryEntriesState(sortLibraryEntries(snapshot));
    });
    return () => {
      unsubscribe();
    };
  }, [activeTab, settings.language]);

  // Filtered library entries
  const filteredLibrary = useMemo(() => {
    const brandTerm = libraryBrandFilter.trim().toLowerCase();
    const materialTerm = libraryMaterialFilter.trim().toLowerCase();
    const searchTerm = librarySearch.trim().toLowerCase();

    const matches = libraryEntriesState.filter(entry => {
      if (brandTerm && !(entry.manufacturer ?? "").toLowerCase().includes(brandTerm)) {
        return false;
      }
      if (materialTerm && !(entry.material ?? "").toLowerCase().includes(materialTerm)) {
        return false;
      }
      if (searchTerm) {
        const haystack = [
          entry.color,
          entry.name,
          entry.labels?.hu,
          entry.labels?.en,
          entry.labels?.de,
          entry.hex,
          entry.id,
        ]
          .map(value => (value ?? "").toLowerCase())
          .some(value => value.includes(searchTerm));
        if (!haystack) {
          return false;
        }
      }
      return true;
    });

    return {
      total: matches.length,
      entries: matches,
    };
  }, [libraryEntriesState, libraryBrandFilter, libraryMaterialFilter, librarySearch]);

  // Virtual scroll computed values
  const shouldVirtualizeLibrary = filteredLibrary.total > LIBRARY_VIRTUAL_THRESHOLD;
  const libraryVisibleStart = shouldVirtualizeLibrary ? Math.max(0, visibleLibraryRange.start) : 0;
  const libraryVisibleEnd = shouldVirtualizeLibrary
    ? Math.min(filteredLibrary.entries.length - 1, visibleLibraryRange.end)
    : filteredLibrary.entries.length - 1;
  const visibleLibraryEntries = filteredLibrary.entries.slice(libraryVisibleStart, libraryVisibleEnd + 1);
  const topLibrarySpacerHeight = shouldVirtualizeLibrary ? libraryVisibleStart * LIBRARY_ROW_HEIGHT : 0;
  const bottomLibrarySpacerHeight = shouldVirtualizeLibrary
    ? (filteredLibrary.entries.length - (libraryVisibleEnd + 1)) * LIBRARY_ROW_HEIGHT
    : 0;

  // Duplicate groups
  const duplicateGroups = useMemo(() => {
    const grouping = new Map<string, RawLibraryEntry[]>();
    libraryEntriesState.forEach(entry => {
      const key = generateLibraryId(
        entry.manufacturer ?? "",
        entry.material ?? "",
        (entry.finish ?? "standard") as string,
        entry.color ?? entry.name ?? entry.labels?.en ?? entry.labels?.hu ?? entry.id ?? ""
      );
      const arr = grouping.get(key);
      if (arr) {
        arr.push(entry);
      } else {
        grouping.set(key, [entry]);
      }
    });
    return Array.from(grouping.values()).filter(group => group.length > 1);
  }, [libraryEntriesState]);

  const duplicateEntryIds = useMemo(() => {
    const ids = new Set<string>();
    duplicateGroups.forEach(group => {
      group.forEach(entry => {
        if (entry.id) {
          ids.add(entry.id);
        }
      });
    });
    return ids;
  }, [duplicateGroups]);

  // Handlers
  const handleLibraryDraftChange = useCallback(
    <K extends keyof LibraryDraft>(field: K, value: LibraryDraft[K]) => {
      setLibraryDraft(prev => {
        if (field === "hex") {
          return { ...prev, hex: sanitizeHexInput(String(value)) };
        }
        if (field === "colorMode") {
          const nextMode = value as ColorMode;
          const baseHint =
            prev.baseLabel ||
            prev.color ||
            prev.labels.hu ||
            prev.labels.en ||
            prev.labels.de ||
            "";
          return {
            ...prev,
            colorMode: nextMode,
            hex: nextMode === "multicolor" ? "" : prev.hex,
            multiColorHint: nextMode === "multicolor" ? (prev.multiColorHint || baseHint) : prev.multiColorHint,
          };
        }
        if (field === "multiColorHint") {
          return { ...prev, multiColorHint: String(value) };
        }
        return {
          ...prev,
          [field]: value,
        };
      });
    },
    []
  );

  const handleLibraryBaseLabelChange = useCallback(
    (value: string) => {
      const baseLang = resolveBaseLanguage(settings.language);
      setLibraryDraft(prev => ({
        ...prev,
        baseLabel: value,
        labels: {
          ...prev.labels,
          [baseLang]: value,
        },
        multiColorHint: prev.colorMode === "multicolor" ? (prev.multiColorHint || value) : prev.multiColorHint,
      }));
    },
    [settings.language]
  );

  const handleLibraryStartEdit = useCallback(
    (entry: RawLibraryEntry) => {
      setEditingLibraryId(entry.id ?? null);
      const labels = {
        hu: (entry.labels?.hu ?? entry.color ?? entry.name ?? "").trim(),
        en: (entry.labels?.en ?? entry.color ?? entry.name ?? "").trim(),
        de: (entry.labels?.de ?? entry.color ?? entry.name ?? "").trim(),
      };
      const baseLabel =
        labels[resolveBaseLanguage(settings.language)] ||
        labels.hu ||
        labels.en ||
        labels.de ||
        entry.color ||
        entry.name ||
        "";
      setLibraryDraft({
        manufacturer: entry.manufacturer ?? "",
        material: entry.material ?? "",
        color: entry.color ?? entry.name ?? "",
        hex: sanitizeHexInput(entry.hex ?? ""),
        finish: FINISH_OPTIONS.includes((entry.finish as FilamentFinish) ?? "standard")
          ? ((entry.finish as FilamentFinish) ?? "standard")
          : "standard",
        colorMode: (entry.colorMode as ColorMode) ?? "solid",
        multiColorHint: entry.multiColorHint ?? baseLabel,
        labels,
        baseLabel,
      });
      setLibraryModalOpen(true);
    },
    [settings.language]
  );

  const handleLibraryDelete = useCallback(
    (id: string | undefined) => {
      if (!id) return;
      const entry = libraryEntriesState.find(item => item.id === id);
      const descriptor =
        entry
          ? `${entry.manufacturer ?? "?"} / ${entry.material ?? "?"} – ${getLocalizedLibraryColorLabel(entry, settings.language) || id}`
          : id;

      openConfirmDialog({
        title: t("settings.library.confirmDelete.title"),
        message: t("settings.library.confirmDelete.message").replace("{descriptor}", descriptor),
        confirmText: t("common.delete"),
        cancelText: t("common.cancel"),
        type: "danger",
        onConfirm: async () => {
          setLibraryEntriesState(prev => prev.filter(entry => entry.id !== id));
          setLibraryDirty(true);
          if (editingLibraryId === id) {
            closeLibraryModal();
          }
        },
      });
    },
    [libraryEntriesState, settings.language, editingLibraryId, openConfirmDialog, t, closeLibraryModal]
  );

  const handleLibraryAddOrUpdate = useCallback(async () => {
    logWithLanguage(settings.language, "log", "settings.library.add.start", {
      editingLibraryId,
      draft: libraryDraft,
      entriesBefore: libraryEntriesState.length,
    });
    const trimmedManufacturer = libraryDraft.manufacturer.trim();
    const trimmedMaterial = libraryDraft.material.trim();
    const trimmedColor = libraryDraft.color.trim();
    const sanitizedHex = sanitizeHexInput(libraryDraft.hex);
    const isMulticolor = libraryDraft.colorMode === "multicolor";
    const hasHexValue = Boolean(sanitizedHex);
    const isValidHex = /^#[0-9A-F]{6}$/.test(sanitizedHex);

    if (!trimmedManufacturer || !trimmedMaterial || !trimmedColor) {
      logWithLanguage(settings.language, "warn", "settings.library.add.missingFields", {
        trimmedManufacturer,
        trimmedMaterial,
        trimmedColor,
      });
      showToast(t("settings.library.validation.requiredFields"), "error");
      return;
    }

    if ((!isMulticolor && !isValidHex) || (isMulticolor && hasHexValue && !isValidHex)) {
      showToast(t("settings.library.validation.invalidHex"), "error");
      return;
    }

    const finish = FINISH_OPTIONS.includes(libraryDraft.finish) ? libraryDraft.finish : "standard";
    const proposedId = generateLibraryId(trimmedManufacturer, trimmedMaterial, finish, trimmedColor);
    const targetId = editingLibraryId ?? proposedId;

    if (!editingLibraryId && libraryEntriesState.some(entry => entry.id === targetId)) {
      showToast(t("settings.library.validation.duplicateEntry"), "error");
      return;
    }

    if (editingLibraryId && targetId !== editingLibraryId && libraryEntriesState.some(entry => entry.id === targetId)) {
      showToast(t("settings.library.validation.duplicateId"), "error");
      return;
    }

    let baseLabel = libraryDraft.baseLabel.trim();
    const baseLang = resolveBaseLanguage(settings.language);
    const currentLanguageLabel = libraryDraft.labels[baseLang].trim();
    if (!baseLabel && currentLanguageLabel) {
      baseLabel = currentLanguageLabel;
    }
    if (!baseLabel) {
      baseLabel = trimmedColor;
    }

    if (!baseLabel) {
      logWithLanguage(settings.language, "warn", "settings.library.add.missingBaseLabel");
      showToast(t("settings.library.validation.labelRequired"), "error");
      return;
    }

    const labels = {
      hu: libraryDraft.labels.hu.trim(),
      en: libraryDraft.labels.en.trim(),
      de: libraryDraft.labels.de.trim(),
    } as Record<"hu" | "en" | "de", string>;
    labels[baseLang] = baseLabel;

    const languageOrder: Array<"hu" | "en" | "de"> = ["hu", "en", "de"];
    await Promise.all(
      languageOrder
        .filter(lang => lang !== settings.language)
        .map(async lang => {
          if (!labels[lang]) {
            try {
              const translated = await translateText(baseLabel, settings.language, lang);
              labels[lang] = translated.trim() || baseLabel;
            } catch (error) {
              logWithLanguage(settings.language, "warn", "settings.library.add.translationFallback", { error });
              labels[lang] = baseLabel;
            }
          }
        })
    );

    const finalHex = isValidHex ? sanitizedHex : "";
    const colorMode = libraryDraft.colorMode;
    const trimmedHint = libraryDraft.multiColorHint.trim();
    const multiColorHint =
      colorMode === "multicolor"
        ? trimmedHint || baseLabel || trimmedColor
        : trimmedHint || undefined;

    const entry: RawLibraryEntry = {
      id: targetId,
      manufacturer: trimmedManufacturer,
      material: trimmedMaterial,
      color: trimmedColor,
      name: trimmedColor,
      finish,
      hex: finalHex || undefined,
      labels,
      colorMode,
      multiColorHint,
    };

    logWithLanguage(settings.language, "log", "settings.library.add.upserting", entry);

    const updatedEntries = sortLibraryEntries(
      editingLibraryId
        ? libraryEntriesState.map(existing => (existing.id === editingLibraryId ? entry : existing))
        : [...libraryEntriesState, entry]
    );

    logWithLanguage(settings.language, "log", "settings.library.add.updatedEntries", {
      before: libraryEntriesState.length,
      after: updatedEntries.length,
    });

    try {
      setLibrarySaving(true);
      logWithLanguage(settings.language, "log", "settings.library.add.persisting", {
        total: updatedEntries.length,
      });
      await persistLibraryEntries(updatedEntries);
      const snapshot = sortLibraryEntries(getLibrarySnapshot());
      logWithLanguage(settings.language, "log", "settings.library.add.snapshotReceived", {
        snapshotCount: snapshot.length,
      });
      setLibraryEntriesState(snapshot);
      setLibraryDirty(false);
      logWithLanguage(settings.language, "log", "settings.library.add.persisted");
      showToast(editingLibraryId ? t("settings.library.toast.updated") : t("settings.library.toast.added"), "success");
      closeLibraryModal();
      logWithLanguage(settings.language, "log", "settings.library.add.modalClosed");
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.library.add.persistFailed", { error });
      setLibraryDirty(true);
      showToast(t("settings.library.toast.saveFailed"), "error");
    } finally {
      setLibrarySaving(false);
      logWithLanguage(settings.language, "log", "settings.library.add.completed", {
        dirty: libraryDirty,
        editing: !!editingLibraryId,
      });
    }
  }, [
    settings.language,
    editingLibraryId,
    libraryDraft,
    libraryEntriesState,
    showToast,
    t,
    closeLibraryModal,
    libraryDirty,
  ]);

  const handleLibrarySave = useCallback(async () => {
    logWithLanguage(settings.language, "log", "settings.library.save.start", {
      entries: libraryEntriesState.length,
    });
    try {
      setLibrarySaving(true);
      await persistLibraryEntries(libraryEntriesState);
      setLibraryDirty(false);
      showToast(t("settings.library.toast.saveSuccess"), "success");
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.library.save.error", { error });
      showToast(t("settings.library.toast.saveFailed"), "error");
    } finally {
      setLibrarySaving(false);
    }
  }, [settings.language, libraryEntriesState, showToast, t]);

  const handleLibraryReset = useCallback(() => {
    openConfirmDialog({
      title: t("settings.library.reset.title"),
      message: t("settings.library.reset.message"),
      confirmText: t("settings.library.reset.confirm"),
      cancelText: t("common.cancel"),
      type: "danger",
      onConfirm: async () => {
        try {
          setLibraryLoading(true);
          await resetLibraryToDefaults();
          loadLibraryEntries();
          closeLibraryModal();
          showToast(t("settings.library.toast.resetSuccess"), "success");
        } catch (error) {
          logWithLanguage(settings.language, "error", "settings.library.reset.error", { error });
          showToast(t("settings.library.toast.resetFailed"), "error");
        } finally {
          setLibraryLoading(false);
        }
      },
    });
  }, [openConfirmDialog, t, loadLibraryEntries, closeLibraryModal, showToast, settings.language]);

  const handleLibraryExportToFile = useCallback(async () => {
    logWithLanguage(settings.language, "log", "settings.library.export.start");
    try {
      setLibraryExporting(true);
      ensureLibraryOverridesLoaded();
      const snapshot = getLibrarySnapshot();
      logWithLanguage(settings.language, "log", "settings.library.export.snapshot", {
        count: snapshot.length,
      });
      const defaultFileName = `filament-library-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      const filePath = await save({
        defaultPath: defaultFileName,
        filters: [
          {
            name: "JSON",
            extensions: ["json"],
          },
        ],
      });
      if (!filePath) {
        logWithLanguage(settings.language, "log", "settings.library.export.cancelled");
        return;
      }
      await writeTextFile(filePath, JSON.stringify(snapshot, null, 2));
      showToast(t("settings.library.export.success"), "success");
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.library.export.error", { error });
      showToast(t("settings.library.export.error"), "error");
    } finally {
      setLibraryExporting(false);
    }
  }, [settings.language, showToast, t]);

  const handleLibraryImportFromFile = useCallback(async () => {
    logWithLanguage(settings.language, "log", "settings.library.import.start");
    try {
      setLibraryImporting(true);
      const filePath = await openDialog({
        filters: [
          {
            name: "JSON",
            extensions: ["json"],
          },
        ],
      });
      if (!filePath || Array.isArray(filePath)) {
        logWithLanguage(settings.language, "log", "settings.library.import.cancelled", { filePath });
        return;
      }
      const content = await readTextFile(filePath);
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid filament library format");
      }
      logWithLanguage(settings.language, "log", "settings.library.import.parsed", {
        count: parsed.length,
      });
      await persistLibraryEntries(parsed as RawLibraryEntry[]);
      const snapshot = sortLibraryEntries(getLibrarySnapshot());
      setLibraryEntriesState(snapshot);
      setLibraryDirty(false);
      setLibraryInitialized(true);
      showToast(t("settings.library.import.success"), "success");
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.library.import.error", { error });
      showToast(t("settings.library.import.error"), "error");
    } finally {
      setLibraryImporting(false);
    }
  }, [settings.language, showToast, t]);

  return {
    // State
    libraryEntriesState,
    libraryInitialized,
    libraryLoading,
    librarySaving,
    libraryDirty,
    libraryError,
    libraryBrandFilter,
    libraryMaterialFilter,
    librarySearch,
    editingLibraryId,
    libraryDraft,
    libraryModalOpen,
    libraryExporting,
    libraryImporting,
    visibleLibraryRange,
    
    // Computed values
    filteredLibrary,
    shouldVirtualizeLibrary,
    libraryVisibleStart,
    libraryVisibleEnd,
    visibleLibraryEntries,
    topLibrarySpacerHeight,
    bottomLibrarySpacerHeight,
    duplicateGroups,
    duplicateEntryIds,
    
    // Setters
    setLibraryBrandFilter,
    setLibraryMaterialFilter,
    setLibrarySearch,
    setVisibleLibraryRange,
    
    // Actions
    resetLibraryDraft,
    openNewLibraryModal,
    closeLibraryModal,
    loadLibraryEntries,
    handleLibraryDraftChange,
    handleLibraryBaseLabelChange,
    handleLibraryStartEdit,
    handleLibraryDelete,
    handleLibraryAddOrUpdate,
    handleLibrarySave,
    handleLibraryReset,
    handleLibraryExportToFile,
    handleLibraryImportFromFile,
  };
}
