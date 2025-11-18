import React from "react";
import type { Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";
import { getFilamentPlaceholder } from "../../utils/filamentPlaceholder";
import { DEFAULT_COLOR_HEX, normalizeHex } from "../../utils/filamentColors";

interface Props {
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  colorHex: string;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  interactionsEnabled: boolean;
}

export const FilamentImageUpload: React.FC<Props> = ({
  imagePreview,
  setImagePreview,
  colorHex,
  settings,
  theme,
  themeStyles,
  showToast,
  interactionsEnabled,
}) => {
  const t = useTranslation(settings.language);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast(t("filaments.upload.invalidType"), "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast(t("filaments.upload.sizeExceeded"), "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const fallbackHex = normalizeHex(colorHex) || DEFAULT_COLOR_HEX;

  return (
    <div style={{ marginTop: "20px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600",
          fontSize: "14px",
          color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
        }}
      >
        📷 {t("filaments.image.label")}
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
            ✕ {t("filaments.image.remove")}
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
            style={{ width: "80px", height: "80px" }}
          />
          <span
            style={{
              fontSize: "14px",
              color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
              display: "block",
              maxWidth: "220px",
            }}
          >
            {t("filaments.image.uploadPrompt")}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: theme.colors.textMuted,
              display: "block",
              marginTop: "4px",
            }}
          >
            {t("filaments.image.uploadLimit")}
          </span>
        </label>
      )}
    </div>
  );
};
