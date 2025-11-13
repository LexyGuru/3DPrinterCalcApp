import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { save, open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type {
  Settings,
  Printer,
  Filament,
  Offer,
  CompanyInfo,
  PdfTemplate,
  AnimationSettings,
  ThemeSettings,
  CustomThemeDefinition,
} from "../types";
import { defaultAnimationSettings, createEmptyCustomThemeDefinition } from "../types";
import { useTranslation, availableLanguages } from "../utils/translations";
import { useToast } from "./Toast";
import {
  type ThemeName,
  type Theme,
  listAvailableThemes,
  buildThemeFromDefinition,
  themeToCustomDefinition,
  DEFAULT_THEME_NAME,
} from "../utils/themes";
import { createBackup, restoreBackup } from "../utils/backup";
import { ShortcutHelp } from "./ShortcutHelp";
import { Tooltip } from "./Tooltip";
import { VersionHistory } from "./VersionHistory";
import { ConfirmDialog } from "./ConfirmDialog";
import type { RawLibraryEntry } from "../utils/filamentLibrary";
import {
  getLibrarySnapshot,
  persistLibraryEntries,
  generateLibraryId,
  resetLibraryToDefaults,
  subscribeToLibraryChanges,
  ensureLibraryOverridesLoaded,
} from "../utils/filamentLibrary";
import type { FilamentFinish } from "../utils/filamentColors";
import { getFinishLabel } from "../utils/filamentColors";
import type { ColorMode } from "../types";
import { translateText } from "../utils/translator";
import { logWithLanguage } from "../utils/languages/global_console";
import { sendNativeNotification, setDockBadge, getPlatform, requestNotificationPermission, checkNotificationPermission } from "../utils/platformFeatures";

interface Props {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
  printers: Printer[];
  setPrinters: (printers: Printer[]) => void;
  filaments: Filament[];
  setFilaments: (filaments: Filament[]) => void;
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const SettingsPage: React.FC<Props> = ({ 
  settings, 
  onChange,
  printers,
  setPrinters,
  filaments,
  setFilaments,
  offers,
  setOffers,
  theme,
  themeStyles
}) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const CUSTOM_THEME_PREFIX = "custom:";
  const [exportFilaments, setExportFilaments] = useState(false);
  const [exportPrinters, setExportPrinters] = useState(false);
  const [exportOffers, setExportOffers] = useState(false);
  const [importFilaments, setImportFilaments] = useState(false);
  const [importPrinters, setImportPrinters] = useState(false);
  const [importOffers, setImportOffers] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "display" | "advanced" | "data" | "library">("general");
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState<boolean | null>(null);
  type LibraryDraft = {
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
  const FINISH_OPTIONS: FilamentFinish[] = ["standard", "matte", "silk", "transparent", "metallic", "glow"];
  const MAX_LIBRARY_DISPLAY = 400;
  const resolveBaseLanguage = (language: Settings["language"]): "hu" | "en" | "de" =>
    language === "hu" || language === "de" ? language : "en";
  const themeSettingsState = useMemo<ThemeSettings>(() => ({
    customThemes: settings.themeSettings?.customThemes ?? [],
    activeCustomThemeId: settings.themeSettings?.activeCustomThemeId,
    autoApplyGradientText: settings.themeSettings?.autoApplyGradientText ?? true,
  }), [settings.themeSettings]);
  const customThemes = themeSettingsState.customThemes;
  const animationSettings = useMemo<AnimationSettings>(() => ({
    ...defaultAnimationSettings,
    ...(settings.animationSettings ?? {}),
  }), [settings.animationSettings]);
  const [customThemeEditorOpen, setCustomThemeEditorOpen] = useState(false);
  const [editingCustomThemeIdState, setEditingCustomThemeIdState] = useState<string | null>(null);
  const [customThemeDraft, setCustomThemeDraft] = useState<CustomThemeDefinition>(
    createEmptyCustomThemeDefinition()
  );
  type ConfirmDialogConfig = {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
  };
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<ConfirmDialogConfig | null>(null);

  const openConfirmDialog = (config: ConfirmDialogConfig) => {
    setConfirmDialogConfig(config);
  };

  const handleConfirmDialogCancel = () => {
    setConfirmDialogConfig(null);
  };

  useEffect(() => {
    if (!editingCustomThemeIdState) {
      return;
    }
    const existing = customThemes.find(theme => theme.id === editingCustomThemeIdState);
    if (existing) {
      setCustomThemeDraft(JSON.parse(JSON.stringify(existing)) as CustomThemeDefinition);
      setCustomThemeEditorOpen(true);
    }
  }, [editingCustomThemeIdState, customThemes]);

  const handleConfirmDialogConfirm = async () => {
    if (!confirmDialogConfig) return;
    const action = confirmDialogConfig.onConfirm;
    setConfirmDialogConfig(null);
    try {
      await action();
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.confirmDialog.error", { error });
      showToast(t("settings.errors.actionFailed"), "error");
    }
  };

  const ensureThemeSettings = (overrides?: Partial<ThemeSettings>): ThemeSettings => {
    const base: ThemeSettings = {
      customThemes,
      activeCustomThemeId: themeSettingsState.activeCustomThemeId,
      autoApplyGradientText: themeSettingsState.autoApplyGradientText ?? true,
    };
    if (!overrides) {
      return base;
    }
    return {
      customThemes: overrides.customThemes ?? base.customThemes,
      activeCustomThemeId:
        overrides.activeCustomThemeId !== undefined
          ? overrides.activeCustomThemeId
          : base.activeCustomThemeId,
      autoApplyGradientText:
        overrides.autoApplyGradientText !== undefined
          ? overrides.autoApplyGradientText
          : base.autoApplyGradientText,
    };
  };

  const updateAnimationSetting = <K extends keyof AnimationSettings>(
    key: K,
    value: AnimationSettings[K]
  ) => {
    onChange({
      ...settings,
      animationSettings: {
        ...defaultAnimationSettings,
        ...(settings.animationSettings ?? {}),
        [key]: value,
      },
    });
  };

  const handleThemeSelect = (themeName: ThemeName) => {
    const isCustom = themeName.startsWith(CUSTOM_THEME_PREFIX);
    const nextThemeSettings = ensureThemeSettings({
      activeCustomThemeId: isCustom ? themeName.replace(CUSTOM_THEME_PREFIX, "") : undefined,
    });
    onChange({
      ...settings,
      theme: themeName,
      themeSettings: nextThemeSettings,
    });
  };

  // Értesítési engedély ellenőrzése betöltéskor
  useEffect(() => {
    if (settings.notificationEnabled !== false && getPlatform() === "macos") {
      checkNotificationPermission().then(setNotificationPermissionGranted);
    }
  }, [settings.notificationEnabled]);

  const clampNumber = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const normalizeColorInput = (value: string, fallback: string) => {
    const trimmed = (value ?? "").trim();
    if (!trimmed) return fallback;
    const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    if (/^#([0-9A-Fa-f]{6})$/.test(prefixed)) {
      return prefixed.toUpperCase();
    }
    if (/^#([0-9A-Fa-f]{3})$/.test(prefixed)) {
      const [, shortHex] = prefixed.match(/^#([0-9A-Fa-f]{3})$/) ?? [];
      if (shortHex) {
        const expanded = shortHex
          .split("")
          .map(char => char + char)
          .join("")
          .toUpperCase();
        return `#${expanded}`;
      }
    }
    return fallback;
  };

  const sanitizeCustomThemeDefinition = (draft: CustomThemeDefinition): CustomThemeDefinition => {
    const cleanedPalette = {
      background: normalizeColorInput(draft.palette.background, "#1f2933"),
      surface: normalizeColorInput(draft.palette.surface, "#27323f"),
      primary: normalizeColorInput(draft.palette.primary, "#4f46e5"),
      secondary: normalizeColorInput(draft.palette.secondary, "#0ea5e9"),
      success: normalizeColorInput(draft.palette.success, "#22c55e"),
      danger: normalizeColorInput(draft.palette.danger, "#ef4444"),
      text: normalizeColorInput(draft.palette.text, "#f8fafc"),
      textMuted: normalizeColorInput(
        draft.palette.textMuted,
        normalizeColorInput(draft.palette.text, "#f8fafc")
      ),
    };
    const sanitized: CustomThemeDefinition = {
      ...draft,
      name: draft.name.trim() || "Custom theme",
      description: draft.description?.trim() || undefined,
      palette: cleanedPalette,
      gradient: draft.gradient
        ? {
            start: normalizeColorInput(draft.gradient.start, cleanedPalette.primary),
            end: normalizeColorInput(draft.gradient.end, cleanedPalette.secondary),
            angle: clampNumber(
              typeof draft.gradient.angle === "number" ? draft.gradient.angle : 135,
              0,
              360
            ),
          }
        : undefined,
    };
    return sanitized;
  };

  const handleCustomThemePaletteChange = (
    key: keyof CustomThemeDefinition["palette"],
    value: string
  ) => {
    setCustomThemeDraft(prev => ({
      ...prev,
      palette: {
        ...prev.palette,
        [key]: value,
      },
    }));
  };

  const handleCustomThemeGradientToggle = (enabled: boolean) => {
    setCustomThemeDraft(prev => ({
      ...prev,
      gradient: enabled
        ? prev.gradient ?? {
            start: prev.palette.primary,
            end: prev.palette.secondary,
            angle: 135,
          }
        : undefined,
    }));
  };

  type RequiredGradient = NonNullable<CustomThemeDefinition["gradient"]>;

  const handleCustomThemeGradientChange = <K extends keyof RequiredGradient>(
    key: K,
    value: RequiredGradient[K]
  ) => {
    setCustomThemeDraft(prev => ({
      ...prev,
      gradient: {
        ...(prev.gradient ?? {
          start: prev.palette.primary,
          end: prev.palette.secondary,
          angle: 135,
        }),
        [key]: value,
      },
    }));
  };

  const closeCustomThemeEditor = () => {
    setCustomThemeEditorOpen(false);
    setEditingCustomThemeIdState(null);
    setCustomThemeDraft(createEmptyCustomThemeDefinition());
  };

  const beginNewCustomTheme = () => {
    const draft = createEmptyCustomThemeDefinition();
    setCustomThemeDraft(draft);
    setEditingCustomThemeIdState(draft.id);
    setCustomThemeEditorOpen(true);
  };

  const handleSaveCustomTheme = () => {
    const sanitizedDraft = sanitizeCustomThemeDefinition({
      ...customThemeDraft,
      id: editingCustomThemeIdState ?? customThemeDraft.id,
    });
    if (!sanitizedDraft.name.trim()) {
      showToast(t("settings.theme.validation.nameRequired"), "error");
      return;
    }
    const exists = editingCustomThemeIdState
      ? customThemes.some(theme => theme.id === editingCustomThemeIdState)
      : false;
    const themeId = exists ? editingCustomThemeIdState! : sanitizedDraft.id;
    const normalizedDraft: CustomThemeDefinition = {
      ...sanitizedDraft,
      id: themeId,
    };

    const nextCustomThemes = exists
      ? customThemes.map(theme => (theme.id === themeId ? normalizedDraft : theme))
      : [...customThemes, normalizedDraft];

    const shouldActivate =
      !exists || settings.theme === (`${CUSTOM_THEME_PREFIX}${themeId}` as ThemeName);

    const nextThemeSettings = ensureThemeSettings({
      customThemes: nextCustomThemes,
      activeCustomThemeId: shouldActivate
        ? themeId
        : themeSettingsState.activeCustomThemeId &&
          nextCustomThemes.some(theme => theme.id === themeSettingsState.activeCustomThemeId)
        ? themeSettingsState.activeCustomThemeId
        : undefined,
    });

    const nextThemeName: ThemeName = shouldActivate
      ? (`${CUSTOM_THEME_PREFIX}${themeId}` as ThemeName)
      : ((settings.theme as ThemeName | undefined) ?? DEFAULT_THEME_NAME);

    onChange({
      ...settings,
      theme: nextThemeName,
      themeSettings: nextThemeSettings,
    });

    closeCustomThemeEditor();
      showToast(t("settings.theme.toast.saved"), "success");
  };

  const handleCustomThemeDelete = (themeId: string) => {
    const target = customThemes.find(theme => theme.id === themeId);
    if (!target) return;
    openConfirmDialog({
      title: t("settings.theme.delete.title"),
      message: t("settings.theme.delete.message").replace("{name}", target.name),
      type: "danger",
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      onConfirm: () => {
        const nextCustomThemes = customThemes.filter(theme => theme.id !== themeId);
        let nextThemeName: ThemeName =
          (settings.theme as ThemeName | undefined) ?? DEFAULT_THEME_NAME;
        let nextActiveId = themeSettingsState.activeCustomThemeId;
        if (settings.theme === (`${CUSTOM_THEME_PREFIX}${themeId}` as ThemeName)) {
          nextThemeName = DEFAULT_THEME_NAME;
          nextActiveId = undefined;
        } else if (nextActiveId === themeId) {
          nextActiveId = undefined;
        }
        const nextThemeSettings = ensureThemeSettings({
          customThemes: nextCustomThemes,
          activeCustomThemeId: nextActiveId,
        });
        onChange({
          ...settings,
          theme: nextThemeName,
          themeSettings: nextThemeSettings,
        });
        if (editingCustomThemeIdState === themeId) {
          closeCustomThemeEditor();
        }
        showToast(t("settings.theme.toast.deleted"), "success");
      },
    });
  };

  const handleCustomThemeExport = async (theme: CustomThemeDefinition) => {
    try {
      const filePath = await save({
        defaultPath: `${theme.name.replace(/\s+/g, "_")}.json`,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!filePath) {
        return;
      }
      await writeTextFile(filePath, JSON.stringify(theme, null, 2));
      showToast(t("settings.theme.export.success"), "success");
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.customTheme.exportFailed", { error });
      showToast(t("settings.theme.export.error"), "error");
    }
  };

  const handleCopyCustomTheme = async (theme: CustomThemeDefinition) => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
      showToast(t("settings.theme.copy.success"), "success");
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.customTheme.copyFailed", { error });
      showToast(t("settings.theme.copy.error"), "error");
    }
  };

  const handleDuplicateActiveTheme = () => {
    try {
      const nextId = `duplicate-${Date.now().toString(36)}`;
      const baseLang = resolveBaseLanguage(settings.language);
      const baseName = theme.displayName[baseLang] ?? theme.displayName.en ?? "Theme";
      const duplicateDefinition = sanitizeCustomThemeDefinition(
        themeToCustomDefinition(theme, {
          id: nextId,
          name: `${baseName} ${t("settings.theme.duplicate.suffix")}`,
          description: t("settings.theme.duplicate.description"),
        })
      );
      const nextCustomThemes = [...customThemes, duplicateDefinition];
      const nextThemeSettings = ensureThemeSettings({
        customThemes: nextCustomThemes,
        activeCustomThemeId: duplicateDefinition.id,
      });
      onChange({
        ...settings,
        theme: `${CUSTOM_THEME_PREFIX}${duplicateDefinition.id}` as ThemeName,
        themeSettings: nextThemeSettings,
      });
      showToast(t("settings.theme.toast.duplicated"), "success");
      setEditingCustomThemeIdState(duplicateDefinition.id);
      setCustomThemeDraft(JSON.parse(JSON.stringify(duplicateDefinition)) as CustomThemeDefinition);
      setCustomThemeEditorOpen(true);
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.customTheme.duplicateFailed", { error });
      showToast(t("settings.theme.toast.duplicateFailed"), "error");
    }
  };

  const handleCustomThemeImport = async () => {
    try {
      const filePath = await open({
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!filePath || Array.isArray(filePath)) {
        return;
      }
      const content = await readTextFile(filePath);
      const parsed = JSON.parse(content);
      const importedArray: CustomThemeDefinition[] = Array.isArray(parsed)
        ? parsed
        : [parsed];
      const sanitizedImported = importedArray
        .map((raw, index) => {
          const template = createEmptyCustomThemeDefinition();
          const definition: CustomThemeDefinition = {
            id:
              typeof raw.id === "string" && raw.id.trim()
                ? raw.id.trim()
                : `${template.id}-${index}`,
            name: typeof raw.name === "string" && raw.name.trim()
              ? raw.name.trim()
              : `Imported theme ${index + 1}`,
            description:
              typeof raw.description === "string" && raw.description.trim()
                ? raw.description.trim()
                : undefined,
            palette: {
              background: raw?.palette?.background ?? template.palette.background,
              surface: raw?.palette?.surface ?? template.palette.surface,
              primary: raw?.palette?.primary ?? template.palette.primary,
              secondary: raw?.palette?.secondary ?? template.palette.secondary,
              success: raw?.palette?.success ?? template.palette.success,
              danger: raw?.palette?.danger ?? template.palette.danger,
              text: raw?.palette?.text ?? template.palette.text,
              textMuted: raw?.palette?.textMuted ?? template.palette.textMuted,
            },
            gradient: raw?.gradient
              ? {
                  start: raw.gradient.start ?? template.gradient?.start ?? template.palette.primary,
                  end: raw.gradient.end ?? template.gradient?.end ?? template.palette.secondary,
                  angle:
                    typeof raw.gradient.angle === "number"
                      ? raw.gradient.angle
                      : template.gradient?.angle ?? 135,
                }
              : undefined,
          };
          return sanitizeCustomThemeDefinition(definition);
        })
        .filter(Boolean);

      if (!sanitizedImported.length) {
        throw new Error("No valid custom themes found in file");
      }

      const mergedMap = new Map<string, CustomThemeDefinition>();
      customThemes.forEach(theme => mergedMap.set(theme.id, theme));
      sanitizedImported.forEach(theme => mergedMap.set(theme.id, theme));
      const nextCustomThemes = Array.from(mergedMap.values());

      const nextThemeSettings = ensureThemeSettings({
        customThemes: nextCustomThemes,
      });

      onChange({
        ...settings,
        themeSettings: nextThemeSettings,
      });

      showToast(t("settings.theme.toast.imported"), "success");
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.customTheme.importFailed", { error });
      showToast(t("settings.theme.toast.importFailed"), "error");
    }
  };

  const handleExportAllCustomThemes = async () => {
    if (!customThemes.length) {
      showToast(t("settings.theme.toast.exportNone"), "info");
      return;
    }
    try {
      const filePath = await save({
        defaultPath: "custom-themes.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!filePath) {
        return;
      }
      await writeTextFile(filePath, JSON.stringify(customThemes, null, 2));
      showToast(t("settings.theme.toast.exported"), "success");
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.customTheme.exportAllFailed", { error });
      showToast(t("settings.theme.toast.exportFailed"), "error");
    }
  };

  const availableThemes = useMemo(
    () => listAvailableThemes(settings.themeSettings),
    [settings.themeSettings]
  );
  const activeThemeName: ThemeName =
    (settings.theme as ThemeName | undefined) ?? DEFAULT_THEME_NAME;
  const interactionsEnabled = animationSettings.microInteractions;
  const microInteractionStyle = animationSettings.microInteractionStyle;
  const hoverTransform = useMemo(() => {
    switch (microInteractionStyle) {
      case "playful":
        return "scale(1.07) translateY(-6px) rotate(-0.4deg)";
      case "subtle":
        return "scale(1.02) translateY(-2px)";
      case "expressive":
      default:
        return "scale(1.045) translateY(-4px)";
    }
  }, [microInteractionStyle]);
  const hoverShadowStrength = useMemo(() => {
    switch (microInteractionStyle) {
      case "playful":
        return 1.35;
      case "subtle":
        return 1.05;
      case "expressive":
      default:
        return 1.18;
    }
  }, [microInteractionStyle]);
  const activeCustomThemeId = themeSettingsState.activeCustomThemeId;

  const normalizeForCompare = (value?: string | null) => (value ?? "").trim().toLowerCase();
  const sortLibraryEntries = (entries: RawLibraryEntry[]) =>
    entries
      .slice()
      .sort((a, b) => {
        const brandCompare = normalizeForCompare(a.manufacturer).localeCompare(normalizeForCompare(b.manufacturer), "hu", { sensitivity: "base" });
        if (brandCompare !== 0) return brandCompare;
        const materialCompare = normalizeForCompare(a.material).localeCompare(normalizeForCompare(b.material), "hu", { sensitivity: "base" });
        if (materialCompare !== 0) return materialCompare;
        const colorCompare = normalizeForCompare(a.color || a.name).localeCompare(normalizeForCompare(b.color || b.name), "hu", { sensitivity: "base" });
        if (colorCompare !== 0) return colorCompare;
        return normalizeForCompare(a.id).localeCompare(normalizeForCompare(b.id), "en", { sensitivity: "base" });
      });

  const resetLibraryDraft = () => {
    setLibraryDraft(createEmptyLibraryDraft());
    setEditingLibraryId(null);
  };

  const openNewLibraryModal = () => {
    resetLibraryDraft();
    setLibraryModalOpen(true);
  };

  const closeLibraryModal = () => {
    resetLibraryDraft();
    setLibraryModalOpen(false);
  };

  const loadLibraryEntries = () => {
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
  };

  useEffect(() => {
    if (activeTab === "library" && !libraryInitialized && !libraryLoading) {
      loadLibraryEntries();
    }
  }, [activeTab, libraryInitialized, libraryLoading]);

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
  }, [activeTab]);

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
      entries: matches.slice(0, MAX_LIBRARY_DISPLAY),
    };
  }, [libraryEntriesState, libraryBrandFilter, libraryMaterialFilter, librarySearch]);

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

  const sanitizeHexInput = (value: string) => {
    const stripped = value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6).toUpperCase();
    return stripped ? `#${stripped}` : "";
  };

  const handleLibraryDraftChange = <K extends keyof LibraryDraft>(field: K, value: LibraryDraft[K]) => {
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
  };

  const handleLibraryBaseLabelChange = (value: string) => {
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
  };

  const handleLibraryStartEdit = (entry: RawLibraryEntry) => {
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
  };

  const handleLibraryDelete = (id: string | undefined) => {
    if (!id) return;
    const entry = libraryEntriesState.find(item => item.id === id);
    const descriptor =
      entry
        ? `${entry.manufacturer ?? "?"} / ${entry.material ?? "?"} – ${
            entry.labels?.[resolveBaseLanguage(settings.language)] ?? entry.color ?? entry.name ?? entry.labels?.en ?? id
          }`
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
  };

  const handleLibraryAddOrUpdate = async () => {
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

    let dirtyAfter = libraryDirty;

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
      dirtyAfter = false;
      logWithLanguage(settings.language, "log", "settings.library.add.persisted");
      showToast(editingLibraryId ? t("settings.library.toast.updated") : t("settings.library.toast.added"), "success");
      closeLibraryModal();
      logWithLanguage(settings.language, "log", "settings.library.add.modalClosed");
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.library.add.persistFailed", { error });
      setLibraryDirty(true);
      dirtyAfter = true;
      showToast(t("settings.library.toast.saveFailed"), "error");
    } finally {
      setLibrarySaving(false);
      logWithLanguage(settings.language, "log", "settings.library.add.completed", {
        dirty: dirtyAfter,
        editing: !!editingLibraryId,
      });
    }
  };

  const handleLibrarySave = async () => {
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
  };

  const handleLibraryReset = () => {
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
  };

  const handleLibraryExportToFile = async () => {
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
  };

  const handleLibraryImportFromFile = async () => {
    logWithLanguage(settings.language, "log", "settings.library.import.start");
    try {
      setLibraryImporting(true);
      const filePath = await open({
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
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const companyInfo: CompanyInfo = settings.companyInfo ?? {};
  const pdfTemplate: PdfTemplate = settings.pdfTemplate ?? "modern";
  
  // Átalakítjuk az áramárat megjelenítéshez (Ft/kWh -> választott pénznem)
  const getDisplayElectricityPrice = (): number => {
    // Az electricityPrice mindig Ft/kWh-ban van tárolva
    // Konvertáljuk a választott pénznemre: 400 Ft = 1 EUR, 1 EUR = 1.10 USD
    if (settings.currency === "HUF") {
      return settings.electricityPrice;
    } else if (settings.currency === "EUR") {
      return settings.electricityPrice / 400;
    } else { // USD
      return (settings.electricityPrice / 400) * 1.10;
    }
  };

  // Konvertáljuk vissza Ft/kWh-ba amikor a felhasználó megadja az értéket
  const convertElectricityPriceToHUF = (value: number): number => {
    if (settings.currency === "HUF") {
      return value;
    } else if (settings.currency === "EUR") {
      return value * 400;
    } else { // USD
      return (value / 1.10) * 400;
    }
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as Settings["currency"];
    // Pénznem váltáskor az áram árat is át kell konvertálni
    // Az új pénznemben ugyanazt az értéket mutatjuk
    onChange({ ...settings, currency: newCurrency });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...settings, language: e.target.value as Settings["language"] });
  };

  const handleElectricityPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = Number(e.target.value);
    // Konvertáljuk Ft/kWh-ba tároláshoz
    const priceInHUF = convertElectricityPriceToHUF(displayValue);
    onChange({ ...settings, electricityPrice: priceInHUF });
  };

  const handleCompanyInfoChange = (field: keyof CompanyInfo, value: string) => {
    onChange({
      ...settings,
      companyInfo: {
        ...companyInfo,
        [field]: value,
      },
    });
  };

  const optimizeImage = (
    base64: string,
    maxWidth: number = 512,
    maxHeight: number = 512,
    quality: number = 0.85
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        try {
          const optimizedBase64 = canvas.toDataURL("image/png", quality);
          resolve(optimizedBase64);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = base64;
    });
  };

  const handleCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(
        settings.language === "hu"
          ? "Csak kép feltöltése engedélyezett."
          : settings.language === "de"
          ? "Es können nur Bilddateien hochgeladen werden."
          : "Only image files can be uploaded.",
        "error"
      );
      e.target.value = "";
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast(
        settings.language === "hu"
          ? "A logo mérete nem haladhatja meg a 4 MB-ot."
          : settings.language === "de"
          ? "Das Logo darf 4 MB nicht überschreiten."
          : "Logo size cannot exceed 4 MB.",
        "error"
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      try {
        const optimized = await optimizeImage(result);
        onChange({
          ...settings,
          companyInfo: {
            ...companyInfo,
            logoBase64: optimized,
          },
        });
        showToast(
          settings.language === "hu"
            ? "Logo sikeresen frissítve."
            : settings.language === "de"
            ? "Logo erfolgreich aktualisiert."
            : "Logo updated successfully.",
          "success"
        );
      } catch (error) {
        logWithLanguage(settings.language, "error", "settings.logo.optimizeError", { error });
        showToast(
          settings.language === "hu"
            ? "Hiba történt a logo feldolgozásakor."
            : settings.language === "de"
            ? "Bei der Verarbeitung des Logos ist ein Fehler aufgetreten."
            : "An error occurred while processing the logo.",
          "error"
        );
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCompanyLogo = () => {
    onChange({
      ...settings,
      companyInfo: {
        ...companyInfo,
        logoBase64: undefined,
      },
    });
    showToast(t("settings.company.toast.logoRemoved"), "success");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePdfTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...settings,
      pdfTemplate: e.target.value as PdfTemplate,
    });
  };

  const pdfTemplateOptions = useMemo<Array<{ value: PdfTemplate; label: string; description: string }>>(
    () => [
      {
        value: "modern",
        label: t("settings.pdf.templates.modern.label"),
        description: t("settings.pdf.templates.modern.description"),
      },
      {
        value: "minimal",
        label: t("settings.pdf.templates.minimal.label"),
        description: t("settings.pdf.templates.minimal.description"),
      },
      {
        value: "professional",
        label: t("settings.pdf.templates.professional.label"),
        description: t("settings.pdf.templates.professional.description"),
      },
    ],
    [t]
  );

  const currentPdfTemplateOption =
    pdfTemplateOptions.find(option => option.value === pdfTemplate) || pdfTemplateOptions[0];

  const handleExport = async () => {
    if (!exportFilaments && !exportPrinters && !exportOffers) {
      showToast(`${t("settings.exportError")}: ${t("settings.data.export.selectOne")}`, "error");
      return;
    }

    try {
      logWithLanguage(settings.language, "log", "settings.dataExport.start", {
        format: "JSON",
        sections: ["filaments", "printers", "offers"],
      });
      logWithLanguage(settings.language, "log", "settings.dataExport.prepared", {
        printers: exportPrinters ? printers.length : 0,
        filaments: exportFilaments ? filaments.length : 0,
        offers: exportOffers ? offers.length : 0,
      });
      
      const exportData: Record<string, unknown> = {};
      if (exportFilaments) exportData.filaments = filaments;
      if (exportPrinters) exportData.printers = printers;
      if (exportOffers) exportData.offers = offers;

      const filePath = await save({
        defaultPath: "3DPrinterCalcApp_export.json",
        filters: [{
          name: "JSON",
          extensions: ["json"],
        }],
      });

      if (filePath) {
        const jsonContent = JSON.stringify(exportData, null, 2);
        await writeTextFile(filePath, jsonContent);
        logWithLanguage(settings.language, "log", "settings.dataExport.saving", { filePath });
        logWithLanguage(settings.language, "log", "settings.dataExport.success", { filePath });
        // Reset checkboxes
        setExportFilaments(false);
        setExportPrinters(false);
        setExportOffers(false);
      } else {
        logWithLanguage(settings.language, "log", "settings.dataExport.cancelled");
        // User cancelled the save dialog
        return;
      }
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.dataExport.error", { error });
      showToast(t("settings.exportError"), "error");
    } finally {
      setLibraryExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFilaments && !importPrinters && !importOffers) {
      showToast(t("settings.importError") + ": " + (settings.language === "hu" ? "Válassz ki legalább egy elemet!" : settings.language === "de" ? "Wählen Sie mindestens ein Element aus!" : "Select at least one item!"), "error");
      return;
    }

    try {
      logWithLanguage(settings.language, "log", "settings.dataImport.start", {
        allowedSections: ["filaments", "printers", "offers"],
      });
      
      const selected = await open({
        multiple: false,
        filters: [{
          name: "JSON",
          extensions: ["json"]
        }]
      });

      if (!selected) {
        logWithLanguage(settings.language, "log", "settings.dataImport.cancelled");
        // User cancelled the open dialog
        return;
      }

      // Handle both string (single file) and array (multiple files) cases
      const filePath = Array.isArray(selected) ? selected[0] : selected;
      
      if (!filePath || typeof filePath !== "string") {
        logWithLanguage(settings.language, "error", "settings.dataImport.invalidFile");
        showToast(t("settings.noFileSelected"), "error");
        return;
      }

      logWithLanguage(settings.language, "log", "settings.dataImport.loading", { filePath });
      const fileContent = await readTextFile(filePath);
      const importData = JSON.parse(fileContent);
      logWithLanguage(settings.language, "log", "settings.dataImport.parsed", {
        printers: importData.printers?.length || 0,
        filaments: importData.filaments?.length || 0,
        offers: importData.offers?.length || 0
      });

      // Validate and import data
      if (importFilaments && importData.filaments) {
        if (Array.isArray(importData.filaments)) {
          logWithLanguage(settings.language, "log", "settings.dataImport.importFilaments", {
            count: importData.filaments.length,
          });
          setFilaments(importData.filaments);
        } else {
          throw new Error("Invalid filaments data");
        }
      }

      if (importPrinters && importData.printers) {
        if (Array.isArray(importData.printers)) {
          logWithLanguage(settings.language, "log", "settings.dataImport.importPrinters", {
            count: importData.printers.length,
          });
          setPrinters(importData.printers);
        } else {
          throw new Error("Invalid printers data");
        }
      }

      if (importOffers && importData.offers) {
        if (Array.isArray(importData.offers)) {
          logWithLanguage(settings.language, "log", "settings.dataImport.importOffers", {
            count: importData.offers.length,
          });
          setOffers(importData.offers);
        } else {
          throw new Error("Invalid offers data");
        }
      }

      logWithLanguage(settings.language, "log", "settings.dataImport.success");
      showToast(t("settings.importSuccess"), "success");
      // Reset checkboxes
      setImportFilaments(false);
      setImportPrinters(false);
      setImportOffers(false);
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.dataImport.error", { error });
      showToast(t("settings.importError") + ": " + (settings.language === "hu" ? "Érvénytelen fájl formátum!" : settings.language === "de" ? "Ungültiges Dateiformat!" : "Invalid file format!"), "error");
    }
  };




  // Tab style
  const isGradientBackground = theme.colors.background?.includes('gradient');
  const tabButtonStyle = (isActive: boolean) => ({
    padding: "12px 24px",
    border: "none",
    borderBottom: isActive ? `3px solid ${theme.colors.primary}` : `3px solid transparent`,
    backgroundColor: isActive 
      ? (isGradientBackground ? "rgba(255, 255, 255, 0.9)" : theme.colors.surfaceHover)
      : (isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent"),
    color: isActive 
      ? (isGradientBackground ? "#1a202c" : theme.colors.primary)
      : (isGradientBackground ? "#1a202c" : theme.colors.text),
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "700" : "600",
    transition: "all 0.2s",
    borderRadius: "4px 4px 0 0",
    backdropFilter: isGradientBackground ? "blur(8px)" : "none",
  });

  const handleRemoveDuplicateGroups = () => {
    if (!duplicateGroups.length) {
      return;
    }
    openConfirmDialog({
      title: t("settings.library.duplicates.title"),
      message: t("settings.library.duplicates.message"),
      confirmText: t("settings.library.duplicates.confirm"),
      cancelText: t("common.cancel"),
      type: "danger",
      onConfirm: async () => {
        const duplicateIds = new Set<string>();
        duplicateGroups.forEach(group => {
          group.slice(1).forEach(entry => {
            if (entry.id) {
              duplicateIds.add(entry.id);
            }
          });
        });
        if (duplicateIds.size === 0) {
          return;
        }
        setLibraryEntriesState(prev => prev.filter(entry => !entry.id || !duplicateIds.has(entry.id)));
        setLibraryDirty(true);
        setLibraryModalOpen(false);
        showToast(t("settings.library.duplicates.toast"), "success");
      },
    });
  };

  const handleRestoreBackupClick = () => {
    openConfirmDialog({
      title: t("settings.backupRestore"),
      message: t("backup.confirmRestore"),
      confirmText: t("settings.backupRestore"),
      cancelText: t("common.cancel"),
      type: "warning",
      onConfirm: async () => {
        try {
          const backupData = await restoreBackup();
          if (backupData) {
            if (backupData.printers) setPrinters(backupData.printers);
            if (backupData.filaments) setFilaments(backupData.filaments);
            if (backupData.offers) setOffers(backupData.offers);
            if (backupData.settings) onChange(backupData.settings);
            showToast(t("backup.restoreSuccess"), "success");
          }
        } catch (error) {
          showToast(t("backup.restoreError"), "error");
        }
      },
    });
  };

  const renderDisplayTab = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {renderThemeSelectionCard()}
        {renderAnimationSettingsCard()}
        {renderCustomThemesCard()}
      </div>
    );
  };

  const renderThemeSelectionCard = () => {
    return (
      <div style={{ ...themeStyles.card, padding: "24px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "16px",
            fontWeight: 600,
            fontSize: "16px",
            color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
          }}
        >
          🎨 {t("settings.theme")}
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {availableThemes.map(themeOption => {
            const themeName = themeOption.name as ThemeName;
            const isSelected = activeThemeName === themeName;
            const isGradientTheme =
              Boolean(themeOption.colors.gradient) || themeOption.colors.background?.includes("gradient");
            const isNeonTheme =
              themeName === "neon" || themeName === "cyberpunk" || themeOption.colors.primary === "#ff00ff";
            const customDefinition = themeName.startsWith(CUSTOM_THEME_PREFIX)
              ? customThemes.find(theme => themeName.endsWith(theme.id))
              : undefined;

            return (
              <button
                key={themeOption.name}
                onClick={() => handleThemeSelect(themeName)}
                style={{
                  ...themeStyles.button,
                  ...(isGradientTheme
                    ? {
                        backgroundImage: themeOption.colors.gradient ?? themeOption.colors.background,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }
                    : {
                        backgroundColor: themeOption.colors.background,
                      }),
                  color:
                    isGradientTheme ||
                    themeOption.colors.background === "#1a1a1a" ||
                    themeOption.colors.background === "#0a0a0f" ||
                    themeOption.colors.background === "#0d0d0d"
                      ? "#ffffff"
                      : themeOption.colors.text,
                  border: isSelected
                    ? `3px solid ${themeOption.colors.sidebarActive || themeOption.colors.primary}`
                    : `2px solid ${themeOption.colors.border}`,
                  padding: "20px 16px",
                  minHeight: "130px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: isSelected
                    ? isNeonTheme
                      ? `0 0 20px ${themeOption.colors.shadow}, 0 4px 12px ${themeOption.colors.shadow}`
                      : `0 4px 16px ${themeOption.colors.shadow}`
                    : `0 2px 8px ${themeOption.colors.shadow}`,
                  position: "relative" as const,
                  overflow: "hidden" as const,
                  transition: interactionsEnabled ? "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={event => {
                  if (!interactionsEnabled || isSelected) return;
                  event.currentTarget.style.transform = hoverTransform;
                  const expressiveShadow = isNeonTheme
                    ? `0 0 ${Math.round(16 * hoverShadowStrength)}px ${themeOption.colors.shadow}, 0 4px ${Math.round(14 * hoverShadowStrength)}px ${themeOption.colors.shadow}`
                    : `0 4px ${Math.round(12 * hoverShadowStrength)}px ${themeOption.colors.shadowHover}`;
                  event.currentTarget.style.boxShadow = expressiveShadow;
                }}
                onMouseLeave={event => {
                  if (!interactionsEnabled || isSelected) return;
                  event.currentTarget.style.transform = "scale(1)";
                  event.currentTarget.style.boxShadow = `0 2px 8px ${themeOption.colors.shadow}`;
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "8px",
                    background: isGradientTheme
                      ? themeOption.colors.gradient ?? themeOption.colors.background
                      : themeOption.colors.primary,
                    opacity: 0.9,
                  }}
                />

                <span
                  style={{
                    fontSize: "32px",
                    filter: isGradientTheme
                      ? "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                      : isNeonTheme && isSelected
                      ? `drop-shadow(0 0 8px ${themeOption.colors.sidebarActive})`
                      : "none",
                    zIndex: 1,
                  }}
                >
                  {themeName === "light" && "☀️"}
                  {themeName === "dark" && "🌙"}
                  {themeName === "blue" && "💙"}
                  {themeName === "green" && "💚"}
                  {themeName === "purple" && "💜"}
                  {themeName === "orange" && "🧡"}
                  {themeName === "forest" && "🌲"}
                  {themeName === "charcoal" && "🪨"}
                  {themeName === "pastel" && "🌸"}
                  {themeName === "midnight" && "🌃"}
                  {themeName === "gradient" && "🌈"}
                  {themeName === "neon" && "💡"}
                  {themeName === "cyberpunk" && "🤖"}
                  {themeName === "sunset" && "🌅"}
                  {themeName === "ocean" && "🌊"}
                  {themeName.startsWith(CUSTOM_THEME_PREFIX) && "🎨"}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    zIndex: 1,
                    textShadow: isGradientTheme
                      ? "0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)"
                      : isNeonTheme
                      ? "0 1px 3px rgba(0,0,0,0.3)"
                      : "none",
                    color: isGradientTheme ? "#ffffff" : undefined,
                  }}
                >
                  {themeOption.displayName[resolveBaseLanguage(settings.language)] ?? themeOption.displayName.en}
                </span>
                {customDefinition?.description && (
                  <span
                    style={{
                      fontSize: "11px",
                      textAlign: "center",
                      color: "#e2e8f0",
                      opacity: 0.85,
                      zIndex: 1,
                    }}
                  >
                    {customDefinition.description}
                  </span>
                )}
                {isSelected && (
                  <span
                    style={{
                      fontSize: "16px",
                      zIndex: 1,
                      textShadow: isGradientTheme
                        ? "0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)"
                        : isNeonTheme
                        ? "0 1px 3px rgba(0,0,0,0.3)"
                        : "none",
                      color: isGradientTheme ? "#ffffff" : undefined,
                    }}
                  >
                    ✓
                  </span>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    backgroundColor: themeOption.colors.sidebarActive || themeOption.colors.primary,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                />
              </button>
            );
          })}
        </div>
        <p
          style={{
            marginTop: "12px",
            fontSize: "12px",
            color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
          }}
        >
          {t("settings.themeDescription")}
        </p>
      </div>
    );
  };

  const renderAnimationSettingsCard = () => {
    return (
      <div style={{ ...themeStyles.card, padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text }}>
          ⚙️ {t("settings.animation.title")}
        </h3>
        <p style={{ margin: 0, fontSize: "12px", color: theme.colors.textMuted }}>
          {t("settings.animation.description")}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: theme.colors.text }}>
            <input
              type="checkbox"
              checked={animationSettings.microInteractions}
              onChange={event => updateAnimationSetting("microInteractions", event.target.checked)}
            />
            {t("settings.animation.microInteractions")}
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: theme.colors.text }}>
            <input
              type="checkbox"
              checked={animationSettings.loadingSkeletons}
              onChange={event => updateAnimationSetting("loadingSkeletons", event.target.checked)}
            />
            {t("settings.animation.loadingSkeletons")}
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: theme.colors.text }}>
            <input
              type="checkbox"
              checked={animationSettings.smoothScroll}
              onChange={event => updateAnimationSetting("smoothScroll", event.target.checked)}
            />
            {t("settings.animation.smoothScroll")}
          </label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "13px", color: theme.colors.textMuted }}>
              {t("settings.animation.microStyle.label")}
            </label>
            <select
              value={animationSettings.microInteractionStyle}
              onChange={event =>
                updateAnimationSetting(
                  "microInteractionStyle",
                  event.target.value as AnimationSettings["microInteractionStyle"]
                )
              }
              style={{
                ...themeStyles.select,
                width: "100%",
                opacity: animationSettings.microInteractions ? 1 : 0.6,
              }}
              disabled={!animationSettings.microInteractions}
            >
              <option value="subtle">{t("settings.animation.microStyle.subtle")}</option>
              <option value="expressive">{t("settings.animation.microStyle.expressive")}</option>
              <option value="playful">{t("settings.animation.microStyle.playful")}</option>
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "13px", color: theme.colors.textMuted }}>
              {t("settings.animation.pageTransition.label")}
            </label>
            <select
              value={animationSettings.pageTransition}
              onChange={event =>
                updateAnimationSetting("pageTransition", event.target.value as AnimationSettings["pageTransition"])
              }
              style={{ ...themeStyles.select, width: "100%" }}
            >
              <option value="fade">{t("settings.animation.pageTransition.fade")}</option>
              <option value="slide">{t("settings.animation.pageTransition.slide")}</option>
              <option value="scale">{t("settings.animation.pageTransition.scale")}</option>
              <option value="flip">{t("settings.animation.pageTransition.flip")}</option>
              <option value="parallax">{t("settings.animation.pageTransition.parallax")}</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "13px", color: theme.colors.textMuted }}>
              {t("settings.animation.feedback.label")}
            </label>
            <select
              value={animationSettings.feedbackAnimations}
              onChange={event =>
                updateAnimationSetting(
                  "feedbackAnimations",
                  event.target.value as AnimationSettings["feedbackAnimations"]
                )
              }
              style={{ ...themeStyles.select, width: "100%" }}
            >
              <option value="subtle">{t("settings.animation.feedback.subtle")}</option>
              <option value="emphasis">{t("settings.animation.feedback.emphasis")}</option>
              <option value="pulse">{t("settings.animation.feedback.pulse")}</option>
              <option value="none">{t("settings.animation.feedback.none")}</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomThemesCard = () => {
    return (
      <div style={{ ...themeStyles.card, padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text }}>
              🎨 {t("settings.theme.custom.title")}
            </h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.colors.textMuted }}>
              {t("settings.theme.custom.description")}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button style={{ ...themeStyles.button, ...themeStyles.buttonSecondary, padding: "8px 14px" }} onClick={handleCustomThemeImport}>
              📥 {t("settings.theme.custom.import")}
            </button>
            <button
              style={{ ...themeStyles.button, padding: "8px 14px" }}
              onClick={handleExportAllCustomThemes}
              disabled={!customThemes.length}
            >
              📤 {t("settings.theme.custom.exportAll")}
            </button>
            <button style={{ ...themeStyles.button, padding: "8px 14px" }} onClick={handleDuplicateActiveTheme}>
              📄 {t("settings.theme.custom.duplicateActive")}
            </button>
            <button style={{ ...themeStyles.button, ...themeStyles.buttonPrimary, padding: "8px 14px" }} onClick={beginNewCustomTheme}>
              ➕ {t("settings.theme.custom.new")}
            </button>
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: theme.colors.text }}>
          <input
            type="checkbox"
            checked={themeSettingsState.autoApplyGradientText !== false}
            onChange={event =>
              onChange({
                ...settings,
                themeSettings: ensureThemeSettings({
                  autoApplyGradientText: event.target.checked,
                }),
              })
            }
          />
          {t("settings.theme.custom.autoApplyGradientText")}
        </label>

        {customThemes.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
            {customThemes.map(themeDefinition => {
              const previewTheme = buildThemeFromDefinition(themeDefinition);
              const customThemeName = `${CUSTOM_THEME_PREFIX}${themeDefinition.id}` as ThemeName;
              const isActive = activeThemeName === customThemeName || activeCustomThemeId === themeDefinition.id;
              const gradientPreview = previewTheme.colors.gradient ?? previewTheme.colors.background;

              return (
                <div
                  key={themeDefinition.id}
                  style={{
                    borderRadius: "14px",
                    padding: "18px",
                    background: gradientPreview,
                    boxShadow: isActive ? `0 4px 16px ${previewTheme.colors.shadow}` : `0 2px 8px ${previewTheme.colors.shadow}`,
                    border: isActive
                      ? `3px solid ${previewTheme.colors.primary}`
                      : `1px solid ${previewTheme.colors.border}`,
                    color: previewTheme.colors.text,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <strong style={{ fontSize: "15px" }}>{themeDefinition.name}</strong>
                  {themeDefinition.description && (
                    <span style={{ fontSize: "12px", opacity: 0.85 }}>{themeDefinition.description}</span>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {Object.entries(themeDefinition.palette).map(([key, value]) => (
                      <span
                        key={`${themeDefinition.id}-${key}`}
                        title={`${key}: ${value}`}
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          border: "1px solid rgba(0,0,0,0.25)",
                          backgroundColor: value,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <button style={{ ...themeStyles.button, padding: "6px 12px" }} onClick={() => handleThemeSelect(customThemeName)}>
                      {t("settings.theme.actions.apply")}
                    </button>
                    <button
                      style={{ ...themeStyles.button, padding: "6px 12px" }}
                      onClick={() => {
                        setEditingCustomThemeIdState(themeDefinition.id);
                        setCustomThemeDraft(JSON.parse(JSON.stringify(themeDefinition)) as CustomThemeDefinition);
                        setCustomThemeEditorOpen(true);
                      }}
                    >
                      {t("settings.theme.actions.edit")}
                    </button>
                    <button
                      style={{ ...themeStyles.button, padding: "6px 12px" }}
                      onClick={() => handleCustomThemeExport(themeDefinition)}
                    >
                      {t("settings.theme.actions.export")}
                    </button>
                    <button
                      style={{ ...themeStyles.button, padding: "6px 12px" }}
                      onClick={() => handleCopyCustomTheme(themeDefinition)}
                    >
                      {t("settings.theme.actions.share")}
                    </button>
                    <button
                      style={{ ...themeStyles.button, ...themeStyles.buttonDanger, padding: "6px 12px" }}
                      onClick={() => handleCustomThemeDelete(themeDefinition.id)}
                    >
                      {t("settings.theme.actions.delete")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {customThemeEditorOpen && (
          <div
            style={{
              marginTop: "16px",
              padding: "18px",
              borderRadius: "12px",
              backgroundColor: theme.colors.surfaceHover,
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
              <strong style={{ fontSize: "14px", color: theme.colors.text }}>
                {editingCustomThemeIdState ? t("settings.theme.editor.titleEdit") : t("settings.theme.editor.titleNew")}
              </strong>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ ...themeStyles.button, padding: "6px 12px" }} onClick={handleSaveCustomTheme}>
                  💾 {t("settings.theme.editor.save")}
                </button>
                <button style={{ ...themeStyles.button, ...themeStyles.buttonSecondary, padding: "6px 12px" }} onClick={closeCustomThemeEditor}>
                  ✕ {t("settings.theme.editor.cancel")}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                  {t("settings.theme.editor.nameLabel")}
                </label>
                <input
                  value={customThemeDraft.name}
                  onChange={event =>
                    setCustomThemeDraft(prev => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  style={{ ...themeStyles.input }}
                  placeholder={t("settings.theme.editor.namePlaceholder")}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                  {t("settings.theme.editor.descriptionLabel")}
                </label>
                <textarea
                  value={customThemeDraft.description ?? ""}
                  onChange={event =>
                    setCustomThemeDraft(prev => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  style={{ ...themeStyles.input, minHeight: "60px", resize: "vertical" as const }}
                  placeholder={t("settings.theme.editor.descriptionPlaceholder")}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              {([
                ["background", t("settings.theme.palette.background")],
                ["surface", t("settings.theme.palette.surface")],
                ["primary", t("settings.theme.palette.primary")],
                ["secondary", t("settings.theme.palette.secondary")],
                ["success", t("settings.theme.palette.success")],
                ["danger", t("settings.theme.palette.danger")],
                ["text", t("settings.theme.palette.text")],
                ["textMuted", t("settings.theme.palette.textMuted")],
              ] as Array<[keyof CustomThemeDefinition["palette"], string]>).map(([key, label]) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "12px", color: theme.colors.textMuted }}>{label}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="color"
                      value={customThemeDraft.palette[key]}
                      onChange={event => handleCustomThemePaletteChange(key, event.target.value)}
                      style={{ width: "42px", height: "28px", border: "none", cursor: "pointer" }}
                    />
                    <input
                      value={customThemeDraft.palette[key]}
                      onChange={event => handleCustomThemePaletteChange(key, event.target.value)}
                      style={{ ...themeStyles.input, flex: 1 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  checked={Boolean(customThemeDraft.gradient)}
                  onChange={event => handleCustomThemeGradientToggle(event.target.checked)}
                />
                {t("settings.theme.gradient.enable")}
              </label>
              {customThemeDraft.gradient && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                      {t("settings.theme.gradient.start")}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="color"
                        value={customThemeDraft.gradient.start}
                        onChange={event => handleCustomThemeGradientChange("start", event.target.value)}
                        style={{ width: "42px", height: "28px", border: "none", cursor: "pointer" }}
                      />
                      <input
                        value={customThemeDraft.gradient.start}
                        onChange={event => handleCustomThemeGradientChange("start", event.target.value)}
                        style={{ ...themeStyles.input, flex: 1 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                      {t("settings.theme.gradient.end")}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="color"
                        value={customThemeDraft.gradient.end}
                        onChange={event => handleCustomThemeGradientChange("end", event.target.value)}
                        style={{ width: "42px", height: "28px", border: "none", cursor: "pointer" }}
                      />
                      <input
                        value={customThemeDraft.gradient.end}
                        onChange={event => handleCustomThemeGradientChange("end", event.target.value)}
                        style={{ ...themeStyles.input, flex: 1 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                      {t("settings.theme.gradient.angle")} ({Math.round(customThemeDraft.gradient.angle)}°)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={customThemeDraft.gradient.angle}
                      onChange={event => handleCustomThemeGradientChange("angle", Number(event.target.value))}
                    />
                  </div>
                  <div
                    style={{
                      borderRadius: "12px",
                      height: "60px",
                      background: buildThemeFromDefinition({
                        ...customThemeDraft,
                        id: customThemeDraft.id || "preview",
                      }).colors.gradient ?? buildThemeFromDefinition(customThemeDraft).colors.background,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("settings.title")}</h2>
      <p style={themeStyles.pageSubtitle}>{t("settings.subtitle")}</p>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        gap: "8px", 
        marginBottom: "0",
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surface,
        borderRadius: "8px 8px 0 0",
        overflow: "auto",
        backdropFilter: isGradientBackground ? "blur(10px)" : "none",
        opacity: isGradientBackground ? 0.9 : 1,
      }}>
        <button
          onClick={() => setActiveTab("general")}
          style={tabButtonStyle(activeTab === "general")}
          onMouseEnter={(e) => {
            if (activeTab !== "general") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "general") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent";
            }
          }}
        >
          ⚙️ {t("settings.tabs.general")}
        </button>
        <button
          onClick={() => setActiveTab("display")}
          style={tabButtonStyle(activeTab === "display")}
          onMouseEnter={(e) => {
            if (activeTab !== "display") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "display") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent";
            }
          }}
        >
          🎨 {t("settings.tabs.display")}
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          style={tabButtonStyle(activeTab === "advanced")}
          onMouseEnter={(e) => {
            if (activeTab !== "advanced") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "advanced") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent";
            }
          }}
        >
          🔧 {t("settings.tabs.advanced")}
        </button>
        <button
          onClick={() => setActiveTab("data")}
          style={tabButtonStyle(activeTab === "data")}
          onMouseEnter={(e) => {
            if (activeTab !== "data") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "data") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent";
            }
          }}
        >
          💾 {t("settings.tabs.data")}
        </button>
        <button
          onClick={() => setActiveTab("library")}
          style={tabButtonStyle(activeTab === "library")}
          onMouseEnter={(e) => {
            if (activeTab !== "library") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "library") {
              e.currentTarget.style.backgroundColor = isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent";
            }
          }}
        >
          🧵 {t("settings.tabs.library")}
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ ...themeStyles.card, borderRadius: "0 8px 8px 8px", marginTop: "0" }}>
        
        {/* General Tab */}
        {activeTab === "general" && (
          <div>
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={t("settings.language.tooltip")}>
            <label style={{ 
              display: "block", 
              marginBottom: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              width: "fit-content" 
            }}>
              🌐 {t("settings.language")}
            </label>
          </Tooltip>
          <select
            value={settings.language}
            onChange={handleLanguageChange}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.inputBorder;
              e.target.style.boxShadow = "none";
            }}
            style={{ ...themeStyles.select, width: "100%", maxWidth: "300px" }}
          >
            {availableLanguages.map(language => (
              <option key={language.code} value={language.code}>
                {language.flag ? `${language.flag} ${language.label}` : language.label}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={t("settings.currency.tooltip")}>
            <label style={{ 
              display: "block", 
              marginBottom: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              width: "fit-content" 
            }}>
              💰 {t("settings.currency")}
            </label>
          </Tooltip>
          <select 
            value={settings.currency} 
            onChange={handleCurrencyChange}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.select, width: "100%", maxWidth: "300px" }}
          >
            <option value="EUR">EUR (€)</option>
            <option value="HUF">HUF (Ft)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={t("settings.electricity.tooltip")}>
            <label style={{ 
              display: "block", 
              marginBottom: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              width: "fit-content" 
            }}>
              ⚡ {t("settings.electricityPrice")} ({settings.currency === "HUF" ? "Ft" : settings.currency === "EUR" ? "€" : "$"}/kWh)
            </label>
          </Tooltip>
          <input 
            type="number" 
            step="0.01"
            value={getDisplayElectricityPrice()} 
            onChange={handleElectricityPriceChange}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.input, width: "100%", maxWidth: "300px" }}
            placeholder="Pl: 70"
          />
          <p
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
            }}
          >
            {t("settings.electricity.note")}
          </p>
        </div>
        
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={t("settings.checkForBetaUpdatesDescription")}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
              <input
                type="checkbox"
                checked={settings.checkForBetaUpdates || false}
                onChange={e => onChange({ ...settings, checkForBetaUpdates: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🔬 {t("settings.checkForBetaUpdates")}</span>
            </label>
          </Tooltip>
          <p style={{ 
            marginTop: "8px", 
            marginLeft: "32px", 
            fontSize: "12px", 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted 
          }}>
            {t("settings.checkForBetaUpdatesDescription")}
          </p>
        </div>
        
        <div style={{ marginBottom: "0" }}>
          <Tooltip content={t("settings.showConsoleDescription")}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
              <input
                type="checkbox"
                checked={settings.showConsole || false}
                onChange={e => onChange({ ...settings, showConsole: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🖥️ {t("settings.showConsole")}</span>
            </label>
          </Tooltip>
          <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.showConsoleDescription")}
          </p>
        </div>

        <div style={{
          marginTop: "32px",
          padding: "24px",
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: "12px",
          border: `1px solid ${theme.colors.border}`
        }}>
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: companyInfo.logoBase64 ? "center" : "flex-start"
          }}>
            <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
              <h3 style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                🏢 {t("settings.company.title")}
              </h3>
              <p style={{
                marginTop: "8px",
                fontSize: "13px",
                color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
                lineHeight: 1.6
              }}>
                {t("settings.company.description")}
              </p>
            </div>
            {companyInfo.logoBase64 && (
              <div style={{
                width: "120px",
                height: "120px",
                borderRadius: "12px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px"
              }}>
                <img
                  src={companyInfo.logoBase64}
                  alt={t("settings.company.logoPreview")}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>
            )}
          </div>

          <div style={{
            marginTop: "20px",
            display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px"
          }}>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {t("settings.company.fields.name")}
              </label>
              <input
                type="text"
                value={companyInfo.name || ""}
                onChange={e => handleCompanyInfoChange("name", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={t("settings.company.placeholders.name")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {t("settings.company.fields.tax")}
              </label>
              <input
                type="text"
                value={companyInfo.taxNumber || ""}
                onChange={e => handleCompanyInfoChange("taxNumber", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={t("settings.company.placeholders.tax")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {t("settings.company.fields.bank")}
              </label>
              <input
                type="text"
                value={companyInfo.bankAccount || ""}
                onChange={e => handleCompanyInfoChange("bankAccount", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={t("settings.company.placeholders.bank")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {t("settings.company.fields.email")}
              </label>
              <input
                type="email"
                value={companyInfo.email || ""}
                onChange={e => handleCompanyInfoChange("email", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={t("settings.company.placeholders.email")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {t("settings.company.fields.phone")}
              </label>
              <input
                type="tel"
                value={companyInfo.phone || ""}
                onChange={e => handleCompanyInfoChange("phone", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={t("settings.company.placeholders.phone")}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "14px",
                color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
              }}>
                {t("settings.company.fields.website")}
              </label>
              <input
                type="url"
                value={companyInfo.website || ""}
                onChange={e => handleCompanyInfoChange("website", e.target.value)}
                onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                style={{ ...themeStyles.input, width: "100%", maxWidth: "340px" }}
                placeholder={t("settings.company.placeholders.website")}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 600,
              fontSize: "14px",
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
            }}>
              {t("settings.company.fields.address")}
            </label>
            <textarea
              value={companyInfo.address || ""}
              onChange={e => handleCompanyInfoChange("address", e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
              onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
              style={{ ...themeStyles.input, width: "100%", maxWidth: "700px", minHeight: "100px", resize: "vertical" as const }}
              placeholder={t("settings.company.placeholders.address")}
            />
          </div>

          <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCompanyLogoUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                padding: "10px 20px",
                fontSize: "14px"
              }}
            >
              📁 {t("settings.company.uploadLogo")}
            </button>
            {companyInfo.logoBase64 && (
              <button
                onClick={handleRemoveCompanyLogo}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonDanger,
                  padding: "10px 20px",
                  fontSize: "14px"
                }}
              >
                🗑️ {t("settings.company.removeLogo")}
              </button>
            )}
            <p style={{
              margin: "8px 0 0 0",
              fontSize: "12px",
              color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
              flexBasis: "100%"
            }}>
              {t("settings.company.logoTip")}
            </p>
          </div>
        </div>

        <div style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: "12px",
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{
            margin: "0 0 8px 0",
            fontSize: "18px",
            fontWeight: 700,
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text
          }}>
            📄 {t("settings.pdf.title")}
          </h3>
          <p style={{
            margin: "0 0 16px 0",
            fontSize: "13px",
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
            lineHeight: 1.6
          }}>
            {t("settings.pdf.description")}
          </p>
          <select
            value={pdfTemplate}
            onChange={handlePdfTemplateChange}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
            onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
            style={{ ...themeStyles.select, width: "100%", maxWidth: "320px" }}
          >
            {pdfTemplateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p style={{
            marginTop: "12px",
            fontSize: "12px",
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted
          }}>
            {currentPdfTemplateOption.description}
          </p>
          <p style={{
            marginTop: "8px",
            fontSize: "12px",
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted
          }}>
            {t("settings.pdf.tip")}
          </p>
        </div>
          </div>
        )}

        {/* Display Tab */}
         {activeTab === "display" && renderDisplayTab()}

        {/* Advanced Tab */}
        {activeTab === "advanced" && (
          <div>
        {/* Automatikus mentés */}
        <div style={{ marginBottom: "24px" }}>
          <Tooltip content={t("settings.autosaveDescription")}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "600", 
              fontSize: "16px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
              <input
                type="checkbox"
                checked={settings.autosave !== false}
                onChange={e => onChange({ ...settings, autosave: e.target.checked })}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>💾 {t("settings.autosave")}</span>
            </label>
          </Tooltip>
          <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.autosaveDescription")}
          </p>
          {settings.autosave !== false && (
            <div style={{ marginTop: "12px", marginLeft: "32px" }}>
              <Tooltip content={t("settings.autosaveIntervalDescription")}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
                }}>
                  {t("settings.autosaveInterval")}
                </label>
              </Tooltip>
              <input
                type="number"
                min="5"
                value={settings.autosaveInterval || 30}
                onChange={e => onChange({ ...settings, autosaveInterval: Math.max(5, Number(e.target.value)) })}
                style={{
                  width: "100px",
                  padding: "8px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "14px",
                }}
              />
              <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
                {t("settings.autosaveIntervalDescription")}
              </p>
            </div>
          )}
        </div>

        {/* Értesítések */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "12px", fontWeight: "600", fontSize: "16px", color: theme.colors.text, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={settings.notificationEnabled !== false}
              onChange={e => onChange({ ...settings, notificationEnabled: e.target.checked })}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>🔔 {t("settings.notificationEnabled")}</span>
          </label>
          <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.notificationEnabledDescription")}
          </p>
          {settings.notificationEnabled !== false && (
            <div style={{ marginTop: "12px", marginLeft: "32px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: theme.colors.text }}>
                {t("settings.notificationDuration")}
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={settings.notificationDuration || 3000}
                onChange={e => onChange({ ...settings, notificationDuration: Math.max(1000, Number(e.target.value)) })}
                style={{
                  width: "100px",
                  padding: "8px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "14px",
                }}
              />
              <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
                {t("settings.notificationDurationDescription")}
              </p>
              
              {/* Engedély kérés gomb (macOS) */}
              {getPlatform() === "macos" && notificationPermissionGranted === false && (
                <div style={{ marginTop: "12px", padding: "12px", borderRadius: "6px", backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                  <p style={{ marginBottom: "8px", fontSize: "14px", color: theme.colors.text, fontWeight: "500" }}>
                    ⚠️ {settings.language === "hu" ? "Értesítési engedély szükséges" : "Notification permission required"}
                  </p>
                  <p style={{ marginBottom: "12px", fontSize: "12px", color: theme.colors.textMuted }}>
                    {settings.language === "hu" 
                      ? "Az értesítések küldéséhez engedélyt kell adnod az alkalmazásnak."
                      : "You need to grant permission to send notifications."}
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const granted = await requestNotificationPermission();
                        setNotificationPermissionGranted(granted);
                        if (granted) {
                          // macOS-on az alkalmazás csak akkor jelenik meg az Értesítések beállításokban,
                          // ha már próbált értesítést küldeni. Ezért küldünk egy teszt értesítést.
                          try {
                            await sendNativeNotification(
                              settings.language === "hu" ? "Engedély megadva" : "Permission granted",
                              settings.language === "hu" 
                                ? "Az alkalmazás most már megjelenik az Értesítések beállításokban."
                                : "The app will now appear in Notification Settings."
                            );
                          } catch (notifError) {
                            // Ha az értesítés küldése sikertelen, az nem baj, az engedély mégis megadva
                            console.log("Teszt értesítés küldése:", notifError);
                          }
                          
                          showToast(
                            settings.language === "hu" 
                              ? "Értesítési engedély megadva! Az alkalmazás megjelenik az Értesítések beállításokban."
                              : "Notification permission granted! The app will appear in Notification Settings.",
                            "success"
                          );
                        } else {
                          showToast(
                            settings.language === "hu" 
                              ? "Értesítési engedély megtagadva. Engedélyezd a Rendszerbeállításokban."
                              : "Notification permission denied. Enable it in System Settings.",
                            "error"
                          );
                        }
                      } catch (error) {
                        console.error("Engedély kérése sikertelen:", error);
                        showToast(
                          settings.language === "hu" 
                            ? "Engedély kérése sikertelen"
                            : "Failed to request permission",
                          "error"
                        );
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.colors.primary}`,
                      backgroundColor: theme.colors.primary,
                      color: "#fff",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    🔐 {settings.language === "hu" ? "Engedély kérése" : "Request Permission"}
                  </button>
                </div>
              )}
              
              {/* Engedély státusz (macOS) */}
              {getPlatform() === "macos" && notificationPermissionGranted === true && (
                <div style={{ marginTop: "12px", padding: "8px 12px", borderRadius: "6px", backgroundColor: theme.colors.success + "20", border: `1px solid ${theme.colors.success}` }}>
                  <p style={{ fontSize: "12px", color: theme.colors.success, fontWeight: "500", marginBottom: "4px" }}>
                    ✅ {settings.language === "hu" ? "Értesítési engedély megadva" : "Notification permission granted"}
                  </p>
                  <p style={{ fontSize: "11px", color: theme.colors.textMuted, fontStyle: "italic" }}>
                    💡 {settings.language === "hu" 
                      ? "Az alkalmazás megjelenik a Rendszerbeállítások > Értesítések és fókusz menüben, ha már küldtél értesítést."
                      : "The app will appear in System Settings > Notifications & Focus after sending a notification."}
                  </p>
                </div>
              )}
              
              {/* Tesztelési gombok */}
              <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  onClick={async () => {
                    try {
                      const platform = getPlatform();
                      const title = platform === "macos" 
                        ? "Teszt értesítés" 
                        : platform === "windows"
                        ? "Test Notification"
                        : "Test Notification";
                      const body = platform === "macos"
                        ? "Ez egy teszt értesítés macOS-on"
                        : "This is a test notification";
                      
                      // macOS-on az értesítések csak akkor jelennek meg natív módon,
                      // ha az alkalmazás nem aktív vagy ha az értesítés megfelelően van konfigurálva
                      // Próbáljuk meg küldeni az értesítést
                      await sendNativeNotification(title, body);
                      
                      // macOS-on: várunk egy kicsit, hogy az értesítés megjelenjen
                      if (platform === "macos") {
                        await new Promise(resolve => setTimeout(resolve, 500));
                      }
                      
                      showToast(
                        platform === "macos" 
                          ? "Értesítés elküldve! Ha nem látod a Notification Center-ben, próbáld meg az alkalmazást háttérbe küldeni (Cmd+H) és újra küldeni az értesítést."
                          : "Notification sent! Check your notification center.",
                        "success"
                      );
                    } catch (error) {
                      console.error("Értesítés tesztelése sikertelen:", error);
                      showToast(
                        settings.language === "hu"
                          ? "Értesítés küldése sikertelen. Ellenőrizd az engedélyeket a Rendszerbeállításokban."
                          : "Failed to send notification. Check permissions in System Settings.",
                        "error"
                      );
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.primary,
                    color: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  🔔 {settings.language === "hu" ? "Értesítés tesztelése" : "Test Notification"}
                </button>
                
                {getPlatform() === "macos" && (
                  <button
                    onClick={async () => {
                      try {
                        await setDockBadge("5");
                        showToast("Dock badge beállítva: 5", "success");
                        setTimeout(async () => {
                          await setDockBadge(null);
                          showToast("Dock badge törölve", "info");
                        }, 3000);
                      } catch (error) {
                        console.error("Dock badge tesztelése sikertelen:", error);
                        showToast("Dock badge beállítása sikertelen", "error");
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.secondary,
                      color: "#fff",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    🏷️ {settings.language === "hu" ? "Dock badge tesztelése" : "Test Dock Badge"}
                  </button>
                )}
              </div>
              
              {getPlatform() === "macos" && (
                <div style={{ marginTop: "12px", padding: "12px", borderRadius: "6px", backgroundColor: theme.colors.surface + "80", border: `1px solid ${theme.colors.border}` }}>
                  <p style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "8px", fontWeight: "500" }}>
                    ⚠️ {settings.language === "hu" ? "macOS értesítések korlátozásai:" : "macOS notifications limitations:"}
                  </p>
                  <ul style={{ fontSize: "11px", color: theme.colors.textMuted, marginLeft: "16px", lineHeight: "1.6" }}>
                    <li>{settings.language === "hu" 
                      ? "Dev módban az értesítések nem mindig jelennek meg natív módon (code signing hiánya miatt)."
                      : "In dev mode, notifications may not always appear natively (due to missing code signing)."}</li>
                    <li>{settings.language === "hu" 
                      ? "Production build-ben az értesítések megfelelően működnek, ha az alkalmazás code signing-al van aláírva."
                      : "In production build, notifications work properly if the app is code signed."}</li>
                    <li>{settings.language === "hu" 
                      ? "Az értesítések csak akkor jelennek meg natív módon, ha az alkalmazás nem aktív (háttérben van)."
                      : "Notifications only appear natively when the app is inactive (in background)."}</li>
                    <li>{settings.language === "hu" 
                      ? "Az alkalmazás megjelenik a Rendszerbeállítások > Értesítések és fókusz menüben production build után."
                      : "The app will appear in System Settings > Notifications & Focus after production build."}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gyorsbillentyűk és Információk */}
        <div style={{ marginBottom: "0" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "12px", 
            fontWeight: "600", 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            ⚙️ {settings.language === "hu" ? "Egyéb beállítások" : settings.language === "de" ? "Sonstige Einstellungen" : "Other Settings"}
          </label>
          <p style={{ marginBottom: "16px", fontSize: "12px", color: theme.colors.textMuted }}>
            {settings.language === "hu" ? "Gyorsbillentyűk megtekintése és verzió előzmények" : settings.language === "de" ? "Tastaturkürzel anzeigen und Versionsverlauf" : "View keyboard shortcuts and version history"}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Tooltip content={t("settings.shortcutsDescription")}>
              <button
                onClick={() => setShowShortcutHelp(true)}
                style={{
                  ...themeStyles.button,
                  flex: 1,
                  minWidth: "180px",
                }}
              >
                ⌨️ {t("shortcuts.title")}
              </button>
            </Tooltip>
            <Tooltip content={settings.language === "hu" ? "Verzió előzmények megjelenítése" : settings.language === "de" ? "Versionsverlauf anzeigen" : "Show version history"}>
              <button
                onClick={() => setShowVersionHistory(true)}
                style={{
                  ...themeStyles.button,
                  flex: 1,
                  minWidth: "180px",
                }}
              >
                📋 {settings.language === "hu" ? "Verzió előzmények" : settings.language === "de" ? "Versionsverlauf" : "Version History"}
              </button>
            </Tooltip>
          </div>
        </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === "data" && (
          <div>
        {/* Backup */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "12px", 
            fontWeight: "600", 
            fontSize: "18px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            💾 {t("settings.backup")}
          </label>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
            {settings.language === "hu" ? "Készíts biztonsági mentést az összes adatról vagy állítsd vissza egy korábbi állapotot" : settings.language === "de" ? "Erstellen Sie eine Sicherungskopie aller Daten oder stellen Sie einen früheren Zustand wieder her" : "Create a backup of all data or restore a previous state"}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Tooltip content={settings.language === "hu" ? "Mentés az összes adatot egy JSON fájlba" : settings.language === "de" ? "Speichern Sie alle Daten in einer JSON-Datei" : "Save all data to a JSON file"}>
              <button
                onClick={async () => {
                  try {
                    const filePath = await createBackup(printers, filaments, offers, settings);
                    if (filePath) {
                      showToast(t("backup.createSuccess"), "success");
                    }
                  } catch (error) {
                    showToast(t("backup.restoreError"), "error");
                  }
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonPrimary,
                  flex: 1,
                  minWidth: "180px",
                }}
              >
                💾 {t("settings.backupCreate")}
              </button>
            </Tooltip>
            <Tooltip content={settings.language === "hu" ? "Visszaállítás egy korábbi backup fájlból" : settings.language === "de" ? "Wiederherstellen aus einer früheren Backup-Datei" : "Restore from a previous backup file"}>
              <button
                onClick={handleRestoreBackupClick}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSuccess,
                  flex: 1,
                  minWidth: "180px",
                }}
              >
                📥 {t("settings.backupRestore")}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Export/Import Data Section - 2 oszlop */}
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {/* Export Data Section */}
          <div style={{ ...themeStyles.card, flex: "1", minWidth: "400px" }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: "20px", 
            fontSize: "20px", 
            fontWeight: "600", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            💾 {t("settings.exportTitle")}
          </h3>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
            {t("settings.exportDescription")}
          </p>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer", 
              marginBottom: "12px" 
            }}>
              <input
                type="checkbox"
                checked={exportFilaments}
                onChange={e => setExportFilaments(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🧵 {t("settings.exportFilaments")} ({filaments.length})</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer", 
              marginBottom: "12px" 
            }}>
              <input
                type="checkbox"
                checked={exportPrinters}
                onChange={e => setExportPrinters(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🖨️ {t("settings.exportPrinters")} ({printers.length})</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
              <input
                type="checkbox"
                checked={exportOffers}
                onChange={e => setExportOffers(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>📄 {t("settings.exportOffers")} ({offers.length})</span>
            </label>
          </div>

          <Tooltip content={settings.language === "hu" ? "Adatok exportálása JSON fájlba" : settings.language === "de" ? "Daten in JSON-Datei exportieren" : "Export data to JSON file"}>
            <button
              onClick={handleExport}
              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow; }}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                width: "100%"
              }}
            >
              {t("settings.exportButton")}
            </button>
          </Tooltip>
          </div>

          {/* Import Data Section */}
          <div style={{ ...themeStyles.card, flex: "1", minWidth: "400px" }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: "20px", 
            fontSize: "20px", 
            fontWeight: "600", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
          }}>
            📥 {t("settings.importTitle")}
          </h3>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
            {t("settings.importDescription")}
          </p>
          <p style={{ marginBottom: "16px", fontSize: "12px", color: "#dc3545", fontWeight: "600" }}>
            ⚠️ {settings.language === "hu" ? "Figyelem: Az importálás felülírja a jelenlegi adatokat!" : settings.language === "de" ? "Warnung: Der Import überschreibt die aktuellen Daten!" : "Warning: Import will overwrite current data!"}
          </p>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer", 
              marginBottom: "12px" 
            }}>
              <input
                type="checkbox"
                checked={importFilaments}
                onChange={e => setImportFilaments(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🧵 {t("settings.importFilaments")}</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer", 
              marginBottom: "12px" 
            }}>
              <input
                type="checkbox"
                checked={importPrinters}
                onChange={e => setImportPrinters(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>🖨️ {t("settings.importPrinters")}</span>
            </label>
            
            <label style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              fontWeight: "500", 
              fontSize: "14px", 
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
              cursor: "pointer" 
            }}>
              <input
                type="checkbox"
                checked={importOffers}
                onChange={e => setImportOffers(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span>📄 {t("settings.importOffers")}</span>
            </label>
          </div>

          <Tooltip content={t("settings.data.import.tooltip")}>
            <button
              onClick={handleImport}
              onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, themeStyles.buttonHover)}
              onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.transform = "translateY(0)"; btn.style.boxShadow = themeStyles.buttonSuccess.boxShadow; }}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonSuccess,
                width: "100%"
              }}
            >
              {t("settings.importButton")}
            </button>
          </Tooltip>
          </div>
        </div>
          </div>
        )}

        {/* Filament Library Tab */}
        {activeTab === "library" && (
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 700,
                  color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
                }}
              >
                🧵 {t("settings.library.sectionTitle")}
              </h3>
              <p
                style={{
                  margin: "8px 0 16px 0",
                  fontSize: "13px",
                  color: theme.colors.background?.includes("gradient") ? "#4a5568" : theme.colors.textMuted,
                  lineHeight: 1.6,
                }}
              >
                {t("settings.library.sectionDescription")}
              </p>
              {libraryError && (
                <p style={{ color: theme.colors.danger, fontSize: "13px", marginBottom: "12px" }}>
                  ⚠️ {libraryError}
                </p>
              )}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  onClick={handleLibrarySave}
                  disabled={!libraryDirty || librarySaving || libraryLoading}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonPrimary,
                    opacity: !libraryDirty || librarySaving || libraryLoading ? 0.6 : 1,
                  }}
                >
                  {librarySaving ? t("settings.library.save.inProgress") : t("settings.library.save.action")}
                </button>
                <button
                  onClick={handleLibraryReset}
                  disabled={librarySaving || libraryLoading}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonDanger,
                    opacity: librarySaving || libraryLoading ? 0.6 : 1,
                  }}
                >
                  {t("settings.library.resetDefaults")}
                </button>
                <button
                  onClick={() => openNewLibraryModal()}
                  style={{ ...themeStyles.button, padding: "10px 18px" }}
                  disabled={librarySaving || libraryLoading}
                >
                  ➕ {t("settings.library.newEntry")}
                </button>
                {libraryDirty && (
                   <span style={{ fontSize: "12px", color: theme.colors.primary }}>
                     {t("settings.library.unsavedChanges")}
                   </span>
                 )}
              </div>
            </div>

            {duplicateGroups.length > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  borderRadius: "12px",
                  border: `1px solid ${theme.colors.danger}`,
                  backgroundColor: theme.colors.surfaceHover,
                  color: theme.colors.text,
                }}
              >
                <strong style={{ display: "block", marginBottom: "8px" }}>
                  ⚠️ {t("settings.library.banner.title").replace("{count}", String(duplicateGroups.length))}
                </strong>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: theme.colors.textMuted }}>
                  {t("settings.library.banner.description")}
                </p>
                <button
                  onClick={handleRemoveDuplicateGroups}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonDanger,
                    padding: "8px 16px",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                >
                  {t("settings.library.banner.action")}
                </button>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: theme.colors.textMuted }}>
                  {t("settings.library.banner.note")}
                </p>
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: theme.colors.textMuted }}>
                  {duplicateGroups.slice(0, 3).map((group, index) => {
                    const sample = group[0];
                    return (
                      <li key={`${sample.id ?? index}-dup`}> 
                        {`${sample.manufacturer ?? "?"} / ${sample.material ?? "?"} – ${sample.color ?? sample.name ?? sample.labels?.en ?? sample.id ?? ""}`} ({group.length}x)
                      </li>
                    );
                  })}
                  {duplicateGroups.length > 3 && (
                    <li>…</li>
                  )}
                </ul>
              </div>
            )}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <div style={{ ...themeStyles.card, flex: "1 1 520px", minWidth: "380px" }}>
                <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    <input
                      value={libraryBrandFilter}
                      onChange={e => setLibraryBrandFilter(e.target.value)}
                      placeholder={t("settings.library.filters.manufacturer")}
                      onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                      onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                      style={{ ...themeStyles.input, flex: "1 1 160px", minWidth: "150px" }}
                    />
                    <input
                      value={libraryMaterialFilter}
                      onChange={e => setLibraryMaterialFilter(e.target.value)}
                      placeholder={t("settings.library.filters.material")}
                      onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                      onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                      style={{ ...themeStyles.input, flex: "1 1 160px", minWidth: "150px" }}
                    />
                    <input
                      value={librarySearch}
                      onChange={e => setLibrarySearch(e.target.value)}
                      placeholder={t("settings.library.filters.search")}
                      onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                      onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                      style={{ ...themeStyles.input, flex: "2 1 220px", minWidth: "200px" }}
                    />
                  </div>
                  <div style={{ fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                    {t("settings.library.filters.matches")}: {filteredLibrary.total} / {libraryEntriesState.length}
                    {filteredLibrary.total > filteredLibrary.entries.length && (
                      <> • {t("settings.library.filters.limitNotice").replace("{count}", String(filteredLibrary.entries.length))}</>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setLibraryBrandFilter("");
                      setLibraryMaterialFilter("");
                      setLibrarySearch("");
                    }}
                    style={{ ...themeStyles.button, padding: "8px 14px", justifySelf: "flex-start" }}
                  >
                    {t("settings.library.filters.reset")}
                  </button>
                </div>
                <div style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  paddingRight: "4px"
                }}>
                  {libraryLoading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <style>
                        {`
                          @keyframes library-skeleton-shimmer {
                            0% { background-position: 200% 0; opacity: 0.5; }
                            50% { opacity: 0.9; }
                            100% { background-position: -200% 0; opacity: 0.5; }
                          }
                        `}
                      </style>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={`library-skeleton-${index}`}
                          style={{
                            borderRadius: "12px",
                            padding: "16px",
                            minHeight: "72px",
                            backgroundImage: `linear-gradient(90deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceHover} 50%, ${theme.colors.surface} 100%)`,
                            backgroundSize: "200% 100%",
                            animation: "library-skeleton-shimmer 1.4s ease-in-out infinite",
                            border: `1px solid ${theme.colors.border}`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {!libraryLoading && filteredLibrary.entries.length === 0 && (
                    <p style={{ fontSize: "13px", color: theme.colors.textMuted }}>
                      {t("settings.library.empty")}
                    </p>
                  )}
                  {filteredLibrary.entries.map(entry => {
                    const isDuplicate = entry.id ? duplicateEntryIds.has(entry.id) : false;
                    const isMulticolor = (entry.colorMode as ColorMode) === "multicolor";
                    const hasValidHex = typeof entry.hex === "string" && /^#[0-9A-F]{6}$/i.test(entry.hex);
                    const normalizedHexValue = hasValidHex ? (entry.hex as string) : "#e5e7eb";
                    return (
                      <div
                        key={entry.id}
                        style={{
                          border: `1px solid ${isDuplicate ? theme.colors.danger : theme.colors.border}`,
                          borderRadius: "10px",
                          padding: "12px 16px",
                          backgroundColor: isDuplicate ? "rgba(220, 38, 38, 0.12)" : theme.colors.surfaceHover,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                          <div>
                            <strong style={{ color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                              {entry.manufacturer}
                            </strong>
                            <span style={{ marginLeft: "6px", fontSize: "12px", color: theme.colors.textMuted }}>
                              {entry.material}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                              {getFinishLabel((entry.finish as FilamentFinish) || "standard", settings.language)}
                            </span>
                            {isMulticolor && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  padding: "2px 8px",
                                  borderRadius: "999px",
                                  background: "linear-gradient(135deg, #F97316 0%, #EC4899 33%, #6366F1 66%, #22D3EE 100%)",
                                  color: "#fff",
                                }}
                              >
                                {t("settings.library.badge.multicolor")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                          <span style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: `1px solid ${theme.colors.border}`,
                            backgroundColor: isMulticolor
                              ? "transparent"
                              : hasValidHex
                              ? normalizedHexValue
                              : "#e5e7eb",
                            backgroundImage: isMulticolor
                              ? "linear-gradient(135deg, #F97316 0%, #EC4899 33%, #6366F1 66%, #22D3EE 100%)"
                              : "none",
                          }} />
                          <div style={{ flex: "1", minWidth: "180px" }}>
                            <div style={{ fontWeight: 600, color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                              {entry.color || entry.name}
                            </div>
                            <div style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                              {[entry.labels?.hu, entry.labels?.en, entry.labels?.de]
                                .map(label => label?.trim())
                                .filter((label, index, array) => label && array.indexOf(label) === index)
                                .join(" • ")}
                            </div>
                          </div>
                          <span style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                            {isMulticolor
                              ? hasValidHex
                                ? `${t("settings.library.badge.multicolor")} • ${normalizedHexValue}`
                                : t("settings.library.badge.multicolor")
                              : hasValidHex
                              ? normalizedHexValue
                              : t("settings.library.hexMissing")}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                          <button
                            onClick={() => handleLibraryStartEdit(entry)}
                            style={{ ...themeStyles.button, padding: "8px 16px" }}
                          >
                            ✏️ {t("settings.theme.actions.edit")}
                          </button>
                          <button
                            onClick={() => handleLibraryDelete(entry.id ?? undefined)}
                            style={{ ...themeStyles.button, ...themeStyles.buttonDanger, padding: "8px 16px" }}
                          >
                            🗑️ {t("settings.theme.actions.delete")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

        <div style={{ ...themeStyles.card, marginTop: "24px" }}>
          <h3
            style={{
              marginTop: 0,
              marginBottom: "12px",
              fontSize: "20px",
              fontWeight: "600",
              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
            }}
          >
            🧵 {t("settings.library.storage.title")}
          </h3>
          <p style={{ marginBottom: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
            {t("settings.library.storage.description")}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleLibraryExportToFile}
              disabled={libraryExporting}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonPrimary,
                opacity: libraryExporting ? 0.7 : 1,
                minWidth: "200px",
              }}
            >
              {libraryExporting
                ? t("settings.library.storage.export.inProgress")
                : t("settings.library.storage.export.action")}
            </button>
            <button
              onClick={handleLibraryImportFromFile}
              disabled={libraryImporting}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonSuccess,
                opacity: libraryImporting ? 0.7 : 1,
                minWidth: "200px",
              }}
            >
              {libraryImporting
                ? t("settings.library.storage.import.inProgress")
                : t("settings.library.storage.import.action")}
            </button>
          </div>
          <p style={{ marginTop: "12px", fontSize: "12px", color: theme.colors.textMuted }}>
            {t("settings.library.storage.importNote")}
          </p>
        </div>
            </div>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {showShortcutHelp && (
          <ShortcutHelp
            settings={settings}
            theme={theme}
            themeStyles={themeStyles}
            onClose={() => setShowShortcutHelp(false)}
          />
        )}
      </AnimatePresence>
      {showVersionHistory && (
        <VersionHistory
          settings={settings}
          theme={theme}
          onClose={() => setShowVersionHistory(false)}
          isBeta={import.meta.env.VITE_IS_BETA === 'true'}
        />
      )}
      <AnimatePresence>
        {libraryModalOpen && (
          <motion.div
            key="library-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLibraryModal}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.45)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              backdropFilter: "blur(6px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              style={{
                ...themeStyles.card,
                width: "min(640px, 90vw)",
                maxHeight: "85vh",
                overflowY: "auto",
                position: "relative",
                padding: "32px",
              }}
            >
            <button
              onClick={closeLibraryModal}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                border: "none",
                background: "transparent",
                color: theme.colors.text,
                fontSize: "20px",
                cursor: "pointer",
              }}
              aria-label={t("settings.library.modal.closeAria")}
            >
              ✕
            </button>
            <h4 style={{
              margin: "0 0 16px 0",
              fontSize: "18px",
              fontWeight: 600,
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
            }}>
              {editingLibraryId ? t("settings.library.modal.titleEdit") : t("settings.library.modal.titleNew")}
            </h4>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "14px", marginBottom: "6px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                  {t("settings.library.modal.fields.manufacturer")}
                </label>
                <input
                  value={libraryDraft.manufacturer}
                  onChange={e => handleLibraryDraftChange("manufacturer", e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.input, width: "100%", maxWidth: "480px" }}
                  placeholder={t("settings.library.modal.placeholder.manufacturer")}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "14px", marginBottom: "6px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                  {t("settings.library.modal.fields.material")}
                </label>
                <input
                  value={libraryDraft.material}
                  onChange={e => handleLibraryDraftChange("material", e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.input, width: "100%", maxWidth: "480px" }}
                  placeholder={t("settings.library.modal.placeholder.material")}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "14px", marginBottom: "6px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                  {t("settings.library.modal.fields.color")}
                </label>
                <input
                  value={libraryDraft.color}
                  onChange={e => handleLibraryDraftChange("color", e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.input, width: "100%", maxWidth: "480px" }}
                  placeholder={t("settings.library.modal.placeholder.color")}
                />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: "14px", marginBottom: "6px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                  {t("settings.library.modal.fields.colorMode")}
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(["solid", "multicolor"] as ColorMode[]).map(mode => {
                    const isActive = libraryDraft.colorMode === mode;
                    const label =
                      mode === "solid"
                        ? t("settings.library.modal.colorMode.solid")
                        : t("settings.library.modal.colorMode.multicolor");
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleLibraryDraftChange("colorMode", mode)}
                        style={{
                          ...themeStyles.button,
                          padding: "6px 14px",
                          backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceHover,
                          color: isActive ? "#fff" : theme.colors.text,
                          border: `1px solid ${isActive ? theme.colors.primary : theme.colors.border}`,
                          boxShadow: isActive ? `0 0 0 2px ${theme.colors.primary}33` : "none",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {libraryDraft.colorMode === "multicolor" && (
                  <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                    {t("settings.library.modal.multicolorNote")}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ flex: "1 1 200px", minWidth: "200px", maxWidth: "240px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "14px", marginBottom: "6px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                    {t("settings.library.modal.fields.finish")}
                  </label>
                  <select
                    value={libraryDraft.finish}
                    onChange={e => handleLibraryDraftChange("finish", e.target.value as FilamentFinish)}
                    onFocus={(e) => Object.assign(e.target.style, themeStyles.selectFocus)}
                    onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                    style={{ ...themeStyles.select, width: "100%" }}
                  >
                    {FINISH_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {getFinishLabel(option, settings.language)}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: "1 1 200px", minWidth: "200px", maxWidth: "240px" }}>
                  <label style={{ display: "block", fontWeight: 600, fontSize: "14px", marginBottom: "6px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                    HEX
                  </label>
                  <input
                    value={libraryDraft.hex}
                    onChange={e => handleLibraryDraftChange("hex", e.target.value)}
                    onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                    onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                    style={{
                      ...themeStyles.input,
                      width: "100%",
                      backgroundColor: libraryDraft.colorMode === "multicolor" ? theme.colors.surfaceHover : themeStyles.input.backgroundColor,
                      cursor: libraryDraft.colorMode === "multicolor" ? "not-allowed" : "text",
                      opacity: libraryDraft.colorMode === "multicolor" ? 0.7 : 1,
                    }}
                    placeholder={libraryDraft.colorMode === "multicolor"
                      ? t("settings.library.modal.placeholder.hexOptional")
                      : "#2563EB"}
                    disabled={libraryDraft.colorMode === "multicolor"}
                  />
                </div>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor:
                      libraryDraft.colorMode === "multicolor"
                        ? "transparent"
                        : /^#[0-9A-F]{6}$/i.test(libraryDraft.hex)
                        ? libraryDraft.hex
                        : "#e5e7eb",
                    backgroundImage:
                      libraryDraft.colorMode === "multicolor"
                        ? "linear-gradient(135deg, #F97316 0%, #EC4899 33%, #6366F1 66%, #22D3EE 100%)"
                        : "none",
                  }}
                />
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                <label style={{ fontWeight: 600, fontSize: "14px", color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text }}>
                  {t("settings.library.modal.fields.displayLabel")}
                </label>
                <input
                  value={libraryDraft.baseLabel}
                  onChange={e => handleLibraryBaseLabelChange(e.target.value)}
                  onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
                  onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
                  style={{ ...themeStyles.input, width: "100%", maxWidth: "480px" }}
                  placeholder={t("settings.library.modal.placeholder.displayLabel")}
                />
                <p style={{ fontSize: "12px", margin: 0, color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted }}>
                  {t("settings.library.modal.displayLabelNote")}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                <button
                  onClick={handleLibraryAddOrUpdate}
                  style={{ ...themeStyles.button, ...themeStyles.buttonPrimary, padding: "10px 20px" }}
                  disabled={librarySaving || libraryLoading}
                >
                  {editingLibraryId
                    ? t("settings.library.modal.submit.update")
                    : t("settings.library.modal.submit.add")}
                </button>
                <button
                  onClick={closeLibraryModal}
                  style={{ ...themeStyles.button, padding: "10px 20px" }}
                >
                  {t("settings.library.modal.cancel")}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        isOpen={confirmDialogConfig !== null}
        title={confirmDialogConfig?.title ?? ""}
        message={confirmDialogConfig?.message ?? ""}
        onConfirm={handleConfirmDialogConfirm}
        onCancel={handleConfirmDialogCancel}
        confirmText={confirmDialogConfig?.confirmText ?? t("common.yes")}
        cancelText={confirmDialogConfig?.cancelText ?? t("common.cancel")}
        type={confirmDialogConfig?.type}
        theme={theme}
      />
    </div>
  );
};
