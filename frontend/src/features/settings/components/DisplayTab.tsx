import React, { useMemo } from "react";
import type { Settings, AnimationSettings, CustomThemeDefinition } from "../../../types";
import type { Theme, ThemeName } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { buildThemeFromDefinition, DEFAULT_THEME_NAME } from "../../../utils/themes";
import { useSettingsAnimation, useSettingsTheme, CUSTOM_THEME_PREFIX } from "../";

interface DisplayTabProps {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  openConfirmDialog: (config: {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
  }) => void;
}

export const DisplayTab: React.FC<DisplayTabProps> = ({
  settings,
  onChange,
  theme,
  themeStyles,
  showToast,
  openConfirmDialog,
}) => {
  const t = useTranslation(settings.language);

  // Animation settings hook
  const { animationSettings, updateAnimationSetting } = useSettingsAnimation({
    settings,
    onChange,
  });

  // Theme settings hook
  const {
    themeSettingsState,
    customThemes,
    customThemeEditorOpen,
    editingCustomThemeIdState,
    customThemeDraft,
    availableThemes,
    ensureThemeSettings,
    getThemeDisplayName,
    setCustomThemeEditorOpen,
    setEditingCustomThemeIdState,
    setCustomThemeDraft,
    closeCustomThemeEditor,
    beginNewCustomTheme,
    handleThemeSelect,
    handleSaveCustomTheme,
    handleCustomThemeDelete,
    handleCustomThemeExport,
    handleCopyCustomTheme,
    handleDuplicateActiveTheme,
    handleCustomThemeImport,
    handleExportAllCustomThemes,
    handleCustomThemePaletteChange,
    handleCustomThemeGradientToggle,
    handleCustomThemeGradientChange,
  } = useSettingsTheme({
    settings,
    onChange,
    theme,
    showToast,
    t,
    openConfirmDialog,
  });

  // Computed values
  const activeThemeName: ThemeName = (settings.theme as ThemeName | undefined) ?? DEFAULT_THEME_NAME;
  const interactionsEnabled = animationSettings.microInteractions;
  const microInteractionStyle = animationSettings.microInteractionStyle;
  const activeCustomThemeId = themeSettingsState.activeCustomThemeId;

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
                  {getThemeDisplayName(themeOption)}
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {renderThemeSelectionCard()}
      {renderAnimationSettingsCard()}
      {renderCustomThemesCard()}
    </div>
  );
};

