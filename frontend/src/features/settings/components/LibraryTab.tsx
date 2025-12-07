import React from "react";
import type { Settings } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { getLocalizedLibraryColorLabel } from "../../../utils/filamentLibrary";
import type { FilamentFinish } from "../../../utils/filamentColors";
import { getFinishLabel } from "../../../utils/filamentColors";
import type { ColorMode } from "../../../types";
import type { RawLibraryEntry } from "../../../utils/filamentLibrary";
import { LIBRARY_ROW_HEIGHT, LIBRARY_OVERSCAN, type LibraryDraft } from "../hooks/useSettingsLibrary";

type ConfirmDialogConfig = {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
};

interface LibraryTabProps {
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  // useSettingsLibrary return values
  libraryEntriesState: RawLibraryEntry[];
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
  filteredLibrary: { total: number; entries: RawLibraryEntry[] };
  shouldVirtualizeLibrary: boolean;
  visibleLibraryEntries: RawLibraryEntry[];
  topLibrarySpacerHeight: number;
  bottomLibrarySpacerHeight: number;
  duplicateGroups: RawLibraryEntry[][];
  duplicateEntryIds: Set<string>;
  setLibraryBrandFilter: (value: string) => void;
  setLibraryMaterialFilter: (value: string) => void;
  setLibrarySearch: (value: string) => void;
  setVisibleLibraryRange: (value: { start: number; end: number }) => void;
  openNewLibraryModal: () => void;
  handleLibraryStartEdit: (entry: RawLibraryEntry) => void;
  handleLibraryDelete: (id?: string) => void;
  handleLibrarySave: () => void | Promise<void>;
  handleLibraryReset: () => void | Promise<void>;
  handleLibraryExportToFile: () => void | Promise<void>;
  handleLibraryImportFromFile: () => void | Promise<void>;
  openConfirmDialog: (config: ConfirmDialogConfig) => void;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  settings,
  theme,
  themeStyles,
  showToast,
  libraryEntriesState,
  libraryLoading,
  librarySaving,
  libraryDirty,
  libraryError,
  libraryBrandFilter,
  libraryMaterialFilter,
  librarySearch,
  libraryExporting,
  libraryImporting,
  visibleLibraryRange,
  filteredLibrary,
  shouldVirtualizeLibrary,
  visibleLibraryEntries,
  topLibrarySpacerHeight,
  bottomLibrarySpacerHeight,
  duplicateGroups,
  duplicateEntryIds,
  setLibraryBrandFilter,
  setLibraryMaterialFilter,
  setLibrarySearch,
  setVisibleLibraryRange,
  openNewLibraryModal,
  handleLibraryStartEdit,
  handleLibraryDelete,
  handleLibrarySave,
  handleLibraryReset,
  handleLibraryExportToFile,
  handleLibraryImportFromFile,
  openConfirmDialog,
}) => {
  const t = useTranslation(settings.language);

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
        // TODO: Implement duplicate removal using hook actions
        showToast(t("settings.library.duplicates.toast"), "success");
      },
    });
  };

  return (
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
            onClick={openNewLibraryModal}
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
          <div
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              paddingRight: "4px",
            }}
            onScroll={(e) => {
              if (!shouldVirtualizeLibrary) return;
              const target = e.currentTarget;
              const scrollTop = target.scrollTop;
              const clientHeight = target.clientHeight;
              const start = Math.max(
                0,
                Math.floor(scrollTop / LIBRARY_ROW_HEIGHT) - LIBRARY_OVERSCAN
              );
              const end = Math.min(
                filteredLibrary.entries.length - 1,
                Math.ceil((scrollTop + clientHeight) / LIBRARY_ROW_HEIGHT) + LIBRARY_OVERSCAN
              );
              if (start !== visibleLibraryRange.start || end !== visibleLibraryRange.end) {
                setVisibleLibraryRange({ start, end });
              }
            }}
          >
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
            {shouldVirtualizeLibrary && topLibrarySpacerHeight > 0 && (
              <div
                style={{
                  height: `${topLibrarySpacerHeight}px`,
                  flexShrink: 0,
                }}
              />
            )}
            {visibleLibraryEntries.map(entry => {
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
                        {getLocalizedLibraryColorLabel(entry, settings.language) || entry.color || entry.name}
                      </div>
                      <div style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                        {entry.manufacturer || ""} / {entry.material || ""}
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
            {shouldVirtualizeLibrary && bottomLibrarySpacerHeight > 0 && (
              <div
                style={{
                  height: `${bottomLibrarySpacerHeight}px`,
                  flexShrink: 0,
                }}
              />
            )}
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
  );
};
