/**
 * useSettingsTheme Hook
 * Theme settings kezelés - teljes funkcionalitás
 * Optimalizálva teljesítményre és kezelhetőségre
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { save, open as openDialog } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import type { Settings, ThemeSettings, CustomThemeDefinition } from "../../../types";
import { createEmptyCustomThemeDefinition } from "../../../types";
import type { ThemeName, Theme } from "../../../utils/themes";
import {
  listAvailableThemes,
  themeToCustomDefinition,
  DEFAULT_THEME_NAME,
} from "../../../utils/themes";
import { saveSettings } from "../../../utils/store";
import { auditSettingsChange } from "../../../utils/auditLog";
import { logWithLanguage } from "../../../utils/languages/global_console";
import type { TranslationKey } from "../../../utils/languages/types";
import { CUSTOM_THEME_PREFIX } from "../types";
import { sanitizeCustomThemeDefinition, resolveBaseLanguage } from "../utils";

interface UseSettingsThemeProps {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
  theme: Theme;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  t: (key: TranslationKey) => string;
  openConfirmDialog: (config: {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
  }) => void;
}

interface UseSettingsThemeReturn {
  // State
  themeSettingsState: ThemeSettings;
  customThemes: CustomThemeDefinition[];
  customThemeEditorOpen: boolean;
  editingCustomThemeIdState: string | null;
  customThemeDraft: CustomThemeDefinition;
  availableThemes: Theme[];

  // Helper functions
  ensureThemeSettings: (overrides?: Partial<ThemeSettings>) => ThemeSettings;
  getThemeDisplayName: (theme: Theme) => string;

  // Editor actions
  setCustomThemeEditorOpen: (open: boolean) => void;
  setEditingCustomThemeIdState: (id: string | null) => void;
  setCustomThemeDraft: React.Dispatch<React.SetStateAction<CustomThemeDefinition>>;
  closeCustomThemeEditor: () => void;
  beginNewCustomTheme: () => void;

  // Theme actions
  handleThemeSelect: (themeName: ThemeName) => Promise<void>;
  handleSaveCustomTheme: () => void;
  handleCustomThemeDelete: (themeId: string) => void;
  handleCustomThemeExport: (theme: CustomThemeDefinition) => Promise<void>;
  handleCopyCustomTheme: (theme: CustomThemeDefinition) => Promise<void>;
  handleDuplicateActiveTheme: () => void;
  handleCustomThemeImport: () => Promise<void>;
  handleExportAllCustomThemes: () => Promise<void>;

  // Draft actions
  handleCustomThemePaletteChange: (
    key: keyof CustomThemeDefinition["palette"],
    value: string
  ) => void;
  handleCustomThemeGradientToggle: (enabled: boolean) => void;
  handleCustomThemeGradientChange: <K extends keyof NonNullable<CustomThemeDefinition["gradient"]>>(
    key: K,
    value: NonNullable<CustomThemeDefinition["gradient"]>[K]
  ) => void;
}

export function useSettingsTheme({
  settings,
  onChange,
  theme,
  showToast,
  t,
  openConfirmDialog,
}: UseSettingsThemeProps): UseSettingsThemeReturn {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Theme settings state (memoized)
  const themeSettingsState = useMemo<ThemeSettings>(
    () => ({
      customThemes: settings.themeSettings?.customThemes ?? [],
      activeCustomThemeId: settings.themeSettings?.activeCustomThemeId,
      autoApplyGradientText: settings.themeSettings?.autoApplyGradientText ?? true,
    }),
    [settings.themeSettings]
  );

  const customThemes = themeSettingsState.customThemes;

  // Editor state
  const [customThemeEditorOpen, setCustomThemeEditorOpen] = useState(false);
  const [editingCustomThemeIdState, setEditingCustomThemeIdState] = useState<string | null>(null);
  const [customThemeDraft, setCustomThemeDraft] = useState<CustomThemeDefinition>(
    createEmptyCustomThemeDefinition()
  );

  // Available themes (memoized)
  const availableThemes = useMemo(
    () => listAvailableThemes(settings.themeSettings),
    [settings.themeSettings]
  );

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Ensure theme settings helper (memoized)
  const ensureThemeSettings = useCallback(
    (overrides?: Partial<ThemeSettings>): ThemeSettings => {
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
    },
    [customThemes, themeSettingsState]
  );

  // Get theme display name (memoized)
  const getThemeDisplayName = useCallback(
    (theme: Theme): string => {
      const translationKey = `theme.${theme.name}` as TranslationKey;
      const translated = t(translationKey);
      if (translated === translationKey) {
        const lang = resolveBaseLanguage(settings.language);
        return theme.displayName[lang] ?? theme.displayName.en ?? theme.name;
      }
      return translated;
    },
    [settings.language, t]
  );

  // ============================================
  // EDITOR ACTIONS
  // ============================================

  const closeCustomThemeEditor = useCallback(() => {
    setCustomThemeEditorOpen(false);
    setEditingCustomThemeIdState(null);
    setCustomThemeDraft(createEmptyCustomThemeDefinition());
  }, []);

  const beginNewCustomTheme = useCallback(() => {
    const draft = createEmptyCustomThemeDefinition();
    setCustomThemeDraft(draft);
    setEditingCustomThemeIdState(draft.id);
    setCustomThemeEditorOpen(true);
  }, []);

  // Load existing theme into editor when editingCustomThemeIdState changes
  useEffect(() => {
    if (!editingCustomThemeIdState) {
      return;
    }
    const existing = customThemes.find((theme) => theme.id === editingCustomThemeIdState);
    if (existing) {
      setCustomThemeDraft(JSON.parse(JSON.stringify(existing)) as CustomThemeDefinition);
      setCustomThemeEditorOpen(true);
    }
  }, [editingCustomThemeIdState, customThemes]);

  // ============================================
  // THEME ACTIONS
  // ============================================

  // Handle theme select (async, with save and audit log)
  const handleThemeSelect = useCallback(
    async (themeName: ThemeName) => {
      const isCustom = themeName.startsWith(CUSTOM_THEME_PREFIX);
      const nextThemeSettings = ensureThemeSettings({
        activeCustomThemeId: isCustom ? themeName.replace(CUSTOM_THEME_PREFIX, "") : undefined,
      });
      const newSettings = {
        ...settings,
        theme: themeName,
        themeSettings: nextThemeSettings,
      };
      onChange(newSettings);
      // Azonnal mentjük a téma változást, hogy ne veszítse el az autosave backup során
      try {
        await saveSettings(newSettings);
        // Audit log
        try {
          await auditSettingsChange("theme", settings.theme, themeName, {
            previousTheme: settings.theme,
            newTheme: themeName,
          });
        } catch (error) {
          console.warn("Audit log hiba:", error);
        }
        if (import.meta.env.DEV) {
          console.log("✅ Téma változtatva és azonnal mentve:", themeName);
        }
      } catch (error) {
        console.error("❌ Hiba a téma mentésekor:", error);
      }
    },
    [settings, onChange, ensureThemeSettings]
  );

  // Handle save custom theme
  const handleSaveCustomTheme = useCallback(() => {
    const sanitizedDraft = sanitizeCustomThemeDefinition({
      ...customThemeDraft,
      id: editingCustomThemeIdState ?? customThemeDraft.id,
    });
    if (!sanitizedDraft.name.trim()) {
      showToast(t("settings.theme.validation.nameRequired"), "error");
      return;
    }
    const exists = editingCustomThemeIdState
      ? customThemes.some((theme) => theme.id === editingCustomThemeIdState)
      : false;
    const themeId = exists ? editingCustomThemeIdState! : sanitizedDraft.id;
    const normalizedDraft: CustomThemeDefinition = {
      ...sanitizedDraft,
      id: themeId,
    };

    const nextCustomThemes = exists
      ? customThemes.map((theme) => (theme.id === themeId ? normalizedDraft : theme))
      : [...customThemes, normalizedDraft];

    const shouldActivate =
      !exists || settings.theme === (`${CUSTOM_THEME_PREFIX}${themeId}` as ThemeName);

    const nextThemeSettings = ensureThemeSettings({
      customThemes: nextCustomThemes,
      activeCustomThemeId: shouldActivate
        ? themeId
        : themeSettingsState.activeCustomThemeId &&
          nextCustomThemes.some((theme) => theme.id === themeSettingsState.activeCustomThemeId)
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
  }, [
    customThemeDraft,
    editingCustomThemeIdState,
    customThemes,
    settings,
    ensureThemeSettings,
    themeSettingsState.activeCustomThemeId,
    onChange,
    closeCustomThemeEditor,
    showToast,
    t,
  ]);

  // Handle delete custom theme
  const handleCustomThemeDelete = useCallback(
    (themeId: string) => {
      const target = customThemes.find((theme) => theme.id === themeId);
      if (!target) return;
      openConfirmDialog({
        title: t("settings.theme.delete.title"),
        message: t("settings.theme.delete.message").replace("{name}", target.name),
        type: "danger",
        confirmText: t("common.delete"),
        cancelText: t("common.cancel"),
        onConfirm: () => {
          const nextCustomThemes = customThemes.filter((theme) => theme.id !== themeId);
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
    },
    [
      customThemes,
      settings,
      themeSettingsState.activeCustomThemeId,
      editingCustomThemeIdState,
      openConfirmDialog,
      ensureThemeSettings,
      onChange,
      closeCustomThemeEditor,
      showToast,
      t,
    ]
  );

  // Handle export custom theme
  const handleCustomThemeExport = useCallback(
    async (theme: CustomThemeDefinition) => {
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
    },
    [settings.language, showToast, t]
  );

  // Handle copy custom theme
  const handleCopyCustomTheme = useCallback(
    async (theme: CustomThemeDefinition) => {
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
    },
    [settings.language, showToast, t]
  );

  // Handle duplicate active theme
  const handleDuplicateActiveTheme = useCallback(() => {
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
      setCustomThemeDraft(
        JSON.parse(JSON.stringify(duplicateDefinition)) as CustomThemeDefinition
      );
      setCustomThemeEditorOpen(true);
    } catch (error) {
      logWithLanguage(settings.language, "error", "settings.customTheme.duplicateFailed", {
        error,
      });
      showToast(t("settings.theme.toast.duplicateFailed"), "error");
    }
  }, [
    settings,
    theme,
    customThemes,
    ensureThemeSettings,
    onChange,
    showToast,
    t,
    setEditingCustomThemeIdState,
    setCustomThemeDraft,
    setCustomThemeEditorOpen,
  ]);

  // Handle import custom themes
  const handleCustomThemeImport = useCallback(async () => {
    try {
      const filePath = await openDialog({
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!filePath || Array.isArray(filePath)) {
        return;
      }
      const content = await readTextFile(filePath);
      const parsed = JSON.parse(content);
      const importedArray: CustomThemeDefinition[] = Array.isArray(parsed) ? parsed : [parsed];
      const sanitizedImported = importedArray
        .map((raw, index) => {
          const template = createEmptyCustomThemeDefinition();
          const definition: CustomThemeDefinition = {
            id:
              typeof raw.id === "string" && raw.id.trim()
                ? raw.id.trim()
                : `${template.id}-${index}`,
            name:
              typeof raw.name === "string" && raw.name.trim()
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
                  start:
                    raw.gradient.start ?? template.gradient?.start ?? template.palette.primary,
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
      customThemes.forEach((theme) => mergedMap.set(theme.id, theme));
      sanitizedImported.forEach((theme) => mergedMap.set(theme.id, theme));
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
  }, [customThemes, settings, ensureThemeSettings, onChange, showToast, t]);

  // Handle export all custom themes
  const handleExportAllCustomThemes = useCallback(async () => {
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
      logWithLanguage(settings.language, "error", "settings.customTheme.exportAllFailed", {
        error,
      });
      showToast(t("settings.theme.toast.exportFailed"), "error");
    }
  }, [customThemes, settings.language, showToast, t]);

  // ============================================
  // DRAFT ACTIONS
  // ============================================

  // Handle palette change
  const handleCustomThemePaletteChange = useCallback(
    (key: keyof CustomThemeDefinition["palette"], value: string) => {
      setCustomThemeDraft((prev) => ({
        ...prev,
        palette: {
          ...prev.palette,
          [key]: value,
        },
      }));
    },
    []
  );

  // Handle gradient toggle
  const handleCustomThemeGradientToggle = useCallback((enabled: boolean) => {
    setCustomThemeDraft((prev) => ({
      ...prev,
      gradient: enabled
        ? prev.gradient ?? {
            start: prev.palette.primary,
            end: prev.palette.secondary,
            angle: 135,
          }
        : undefined,
    }));
  }, []);

  // Handle gradient change
  type RequiredGradient = NonNullable<CustomThemeDefinition["gradient"]>;
  const handleCustomThemeGradientChange = useCallback(
    <K extends keyof RequiredGradient>(key: K, value: RequiredGradient[K]) => {
      setCustomThemeDraft((prev) => ({
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
    },
    []
  );

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    themeSettingsState,
    customThemes,
    customThemeEditorOpen,
    editingCustomThemeIdState,
    customThemeDraft,
    availableThemes,

    // Helper functions
    ensureThemeSettings,
    getThemeDisplayName,

    // Editor actions
    setCustomThemeEditorOpen,
    setEditingCustomThemeIdState,
    setCustomThemeDraft,
    closeCustomThemeEditor,
    beginNewCustomTheme,

    // Theme actions
    handleThemeSelect,
    handleSaveCustomTheme,
    handleCustomThemeDelete,
    handleCustomThemeExport,
    handleCopyCustomTheme,
    handleDuplicateActiveTheme,
    handleCustomThemeImport,
    handleExportAllCustomThemes,

    // Draft actions
    handleCustomThemePaletteChange,
    handleCustomThemeGradientToggle,
    handleCustomThemeGradientChange,
  };
}

