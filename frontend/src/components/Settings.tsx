import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  Settings,
  Printer,
  Filament,
  Offer,
} from "../types";
import { defaultSettings } from "../types";
import { useTranslation } from "../utils/translations";
import { useToast } from "./Toast";
import type { Theme } from "../utils/themes";
import { getLogHistory, type LogHistoryItem } from "../utils/logHistory";
import { listAuditLogs, type AuditLogHistoryItem } from "../utils/auditLog";
import { ShortcutHelp } from "./ShortcutHelp";
import { VersionHistory } from "./VersionHistory";
import { ConfirmDialog } from "../shared";
import { LogViewer } from "./LogViewer";
import { AuditLogViewer } from "./AuditLogViewer";
import { FactoryResetProgress } from "./FactoryResetProgress";
import { SystemDiagnostics } from "./SystemDiagnostics";
import type { FilamentFinish } from "../utils/filamentColors";
import { getFinishLabel } from "../utils/filamentColors";
import type { ColorMode } from "../types";
import { logWithLanguage } from "../utils/languages/global_console";
import { useKeyboardShortcut } from "../utils/keyboardShortcuts";
// Settings feature modul importok
import {
  useSettingsLibrary,
  FINISH_OPTIONS,
  SettingsTabs,
  GeneralTab,
  DisplayTab,
  SecurityTab,
  AdvancedTab,
  DataTab,
  LibraryTab,
} from "../features/settings";

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
  onFactoryReset?: () => void; // Callback a Factory Reset után
  initialModal?: "log-viewer" | "audit-log-viewer" | "system-diagnostics" | "backup-history" | null;
  onModalOpened?: () => void;
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
  themeStyles,
  onFactoryReset,
  initialModal,
  onModalOpened
}) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showCompanyInfoDialog, setShowCompanyInfoDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "display" | "security" | "advanced" | "data" | "library">("general");
  // showAutosaveModal - now handled by AdvancedTab component
  const [logHistory, setLogHistory] = useState<LogHistoryItem[]>([]);
  const [auditLogHistory, setAuditLogHistory] = useState<AuditLogHistoryItem[]>([]);
  const [showFactoryResetProgress, setShowFactoryResetProgress] = useState(false);
  const [showSystemDiagnostics, setShowSystemDiagnostics] = useState(false);
  const [logViewerOpen, setLogViewerOpen] = useState(false);
  const [auditLogViewerOpen, setAuditLogViewerOpen] = useState(false);
  const lastInitialModalRef = useRef<typeof initialModal>(null); // Utolsó initialModal érték
  const [selectedLogFile, setSelectedLogFile] = useState<{ path: string; name: string } | null>(null);
  const [selectedAuditLogFile, setSelectedAuditLogFile] = useState<{ path: string; name: string } | null>(null);
  // Library management - now handled by useSettingsLibrary hook (see below)
  
  // Confirm Dialog setup - must be before hooks that use it
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

  // Library settings hook - initialize after openConfirmDialog is defined
  const {
    libraryEntriesState,
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
    closeLibraryModal,
    handleLibraryDraftChange,
    handleLibraryBaseLabelChange,
    handleLibraryStartEdit,
    handleLibraryDelete,
    handleLibraryAddOrUpdate,
    handleLibrarySave,
    handleLibraryReset,
    handleLibraryExportToFile,
    handleLibraryImportFromFile,
  } = useSettingsLibrary({
    settings,
    activeTab,
    showToast,
    t: t as (key: string, params?: Record<string, string | number>) => string,
    openConfirmDialog: (config) => {
      openConfirmDialog({
        title: config.title,
        message: config.message,
        confirmText: config.confirmText ?? t("common.yes"),
        cancelText: config.cancelText ?? t("common.cancel"),
        type: config.type ?? "info",
        onConfirm: config.onConfirm,
      });
    },
  });

  // Help shortcut regisztrálása (figyelembe véve a custom shortcuts-ot)
  const helpShortcutConfig = useMemo(() => {
    const getShortcutId = (key: string, ctrl: boolean, shift: boolean, alt: boolean, meta: boolean): string => {
      return `${key.toLowerCase()}-${ctrl}-${shift}-${alt}-${meta}`;
    };

    // Alapértelmezett help shortcut (Ctrl/Cmd + ?)
    const isMac = typeof navigator !== 'undefined' && navigator.platform.includes("Mac");
    const defaultHelpShortcutId = getShortcutId("?", !isMac, false, false, isMac);
    const customHelpShortcut = settings.customShortcuts?.[defaultHelpShortcutId];
    
    // Használjuk a custom shortcut-ot, ha van, különben az alapértelmezettet
    return {
      key: customHelpShortcut?.key || "?",
      ctrl: customHelpShortcut?.ctrl ?? (!isMac),
      meta: customHelpShortcut?.meta ?? isMac,
      shift: customHelpShortcut?.shift ?? false,
      alt: customHelpShortcut?.alt ?? false,
    };
  }, [settings.customShortcuts]);

  useKeyboardShortcut(
    helpShortcutConfig.key,
    () => {
      setShowShortcutHelp(true);
    },
    {
      ctrl: helpShortcutConfig.ctrl,
      meta: helpShortcutConfig.meta,
      shift: helpShortcutConfig.shift,
      alt: helpShortcutConfig.alt,
      enabled: !showShortcutHelp, // Csak akkor engedélyezett, ha nincs megnyitva
    }
  );

  const handleConfirmDialogCancel = () => {
    setConfirmDialogConfig(null);
  };

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

  // Escape billentyű kezelése a céginformáció dialógus bezárásához
  useEffect(() => {
    if (!showCompanyInfoDialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCompanyInfoDialog(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCompanyInfoDialog]);

  // Backup history betöltése - now handled by AdvancedTab component

  // Helper függvény a log history betöltéséhez
  const loadLogHistory = useCallback(async () => {
    try {
      const history = await getLogHistory();
      setLogHistory(history);
    } catch (error) {
      console.error("❌ Hiba a log history betöltésekor:", error);
      setLogHistory([]);
    }
  }, []);

  // Log history betöltése - betöltjük amikor a Settings oldal megnyílik
  useEffect(() => {
    // Betöltjük egyszer, amikor a komponens mountolódik
    loadLogHistory();
    
    // Csak akkor frissítjük periodikusan, ha a log viewer nyitva van
    const interval = setInterval(() => {
      if (logViewerOpen) {
        loadLogHistory();
      }
    }, 60000); // 60 másodpercenként csak ha nyitva van
    return () => clearInterval(interval);
  }, [loadLogHistory, logViewerOpen]);

  // Helper függvény az audit log history betöltéséhez
  const loadAuditLogHistory = useCallback(async () => {
    try {
      const history = await listAuditLogs();
      setAuditLogHistory(history);
    } catch (error) {
      console.error("❌ Hiba az audit log history betöltésekor:", error);
      setAuditLogHistory([]);
    }
  }, []);

  // Audit log history betöltése - betöltjük amikor a Settings oldal megnyílik
  useEffect(() => {
    // Betöltjük egyszer, amikor a komponens mountolódik
    loadAuditLogHistory();
    
    // Csak akkor frissítjük periodikusan, ha az audit log viewer nyitva van
    const interval = setInterval(() => {
      if (auditLogViewerOpen) {
        loadAuditLogHistory();
      }
    }, 60000); // 60 másodpercenként csak ha nyitva van
    return () => clearInterval(interval);
  }, [loadAuditLogHistory, auditLogViewerOpen]);

  // Automatikusan megnyitjuk a megfelelő modalt, ha van initialModal prop
  useEffect(() => {
    if (!initialModal) {
      // Ha nincs initialModal, reseteljük a ref-et
      lastInitialModalRef.current = null;
      return;
    }

    // Ha az initialModal nem változott, ne nyissa meg újra
    if (lastInitialModalRef.current === initialModal) {
      return;
    }

    console.log("[Settings] initialModal beállítva:", initialModal);

    // Először beállítjuk az activeTab-ot, hogy a megfelelő tab látszódjon
    switch (initialModal) {
      case "log-viewer":
      case "audit-log-viewer":
      case "backup-history":
        console.log("[Settings] ActiveTab beállítva: data");
        setActiveTab("data");
        break;
      case "system-diagnostics":
        console.log("[Settings] ActiveTab beállítva: advanced");
        setActiveTab("advanced");
        break;
    }

    // Segédfüggvény a modal megnyitásához
    const openModal = async () => {
      console.log("[Settings] openModal hívva, initialModal:", initialModal);
      
      // Ha az initialModal nullázódott vagy változott azóta, ne nyissa meg
      if (!initialModal) {
        console.log("[Settings] initialModal null, kilépünk");
        return;
      }

      // Most frissítjük a ref-et, hogy ne nyílljon meg újra
      lastInitialModalRef.current = initialModal;

      switch (initialModal) {
        case "log-viewer":
          console.log("[Settings] Log viewer megnyitása...");
          // Közvetlenül betöltjük a log history-t
          try {
            const historyToUse = await getLogHistory();
            console.log("[Settings] Betöltött log fájlok száma:", historyToUse.length);
            // Újra ellenőrizzük, hogy az initialModal még mindig érvényes
            if (!initialModal || lastInitialModalRef.current !== initialModal) {
              console.log("[Settings] initialModal érvénytelenné vált, kilépünk");
              return;
            }
            // Frissítjük a state-et is
            if (historyToUse.length > 0) {
              setLogHistory(historyToUse);
            }
            // Megnyitjuk a log viewer-t, ha van log fájl
            if (historyToUse.length > 0) {
              const latestLog = historyToUse[0];
              console.log("[Settings] Log viewer megnyitása:", latestLog.fileName);
              setSelectedLogFile({ path: latestLog.filePath, name: latestLog.fileName });
              setLogViewerOpen(true);
            } else {
              console.warn("[Settings] Nincs log fájl a megnyitáshoz");
            }
          } catch (error) {
            console.error("[Settings] Hiba a log history betöltésekor:", error);
          }
          break;
        case "audit-log-viewer":
          console.log("[Settings] Audit log viewer megnyitása...");
          // Közvetlenül betöltjük az audit log history-t
          try {
            const auditHistoryToUse = await listAuditLogs();
            console.log("[Settings] Betöltött audit log fájlok száma:", auditHistoryToUse.length);
            // Újra ellenőrizzük, hogy az initialModal még mindig érvényes
            if (!initialModal || lastInitialModalRef.current !== initialModal) {
              console.log("[Settings] initialModal érvénytelenné vált, kilépünk");
              return;
            }
            // Frissítjük a state-et is
            if (auditHistoryToUse.length > 0) {
              setAuditLogHistory(auditHistoryToUse);
            }
            // Megnyitjuk az audit log viewer-t, ha van audit log fájl
            if (auditHistoryToUse.length > 0) {
              const latestAuditLog = auditHistoryToUse[0];
              console.log("[Settings] Audit log viewer megnyitása:", latestAuditLog.fileName);
              setSelectedAuditLogFile({ path: latestAuditLog.filePath, name: latestAuditLog.fileName });
              setAuditLogViewerOpen(true);
            } else {
              console.warn("[Settings] Nincs audit log fájl a megnyitáshoz");
            }
          } catch (error) {
            console.error("[Settings] Hiba az audit log history betöltésekor:", error);
          }
          break;
        case "system-diagnostics":
          console.log("[Settings] System diagnostics megnyitása");
          setShowSystemDiagnostics(true);
          break;
        case "backup-history":
          console.log("[Settings] Backup history tab megnyitása");
          // A backup history a data tab-ban van, csak váltunk tab-ra
          break;
      }
    };

    // Kis késleltetés, hogy a komponens teljesen betöltődjön és az activeTab beállítódjon
    const timeout = setTimeout(() => {
      console.log("[Settings] Timeout lejárt, modal megnyitása...");
      openModal();
    }, 800);

    return () => {
      console.log("[Settings] useEffect cleanup");
      clearTimeout(timeout);
    };
    // Csak az initialModal változásakor fusson le, ne a logHistory/auditLogHistory változásakor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialModal]);

  // Értesítési engedély ellenőrzése - now handled by AdvancedTab component

  // Library management functions - now handled by useSettingsLibrary hook (see hook initialization above)
  // Export/Import functions - now handled by DataTab component
  // Duplicate removal - now handled by LibraryTab component

  // handleRestoreBackupClick and handleFactoryReset - now handled by DataTab component

  const handleFactoryResetComplete = () => {
    // A Factory Reset Progress modal befejezése után
    setShowFactoryResetProgress(false);
    
    // Töröljük az összes state-et
    setPrinters([]);
    setFilaments([]);
    setOffers([]);
    // Explicit módon nullázzuk ki a lastBackupDate-et is a Factory Reset után
    onChange({ ...defaultSettings, lastBackupDate: undefined });
    
    // Ha van callback, hívjuk meg (így az App.tsx manuálisan reseteli az állapotot)
    if (onFactoryReset) {
      onFactoryReset();
    } else {
      // Fallback: ha nincs callback, akkor reload (régi viselkedés)
      window.location.reload();
    }
  };

  return (
    <div>
      <h2 style={themeStyles.pageTitle}>{t("settings.title")}</h2>
      <p style={themeStyles.pageSubtitle}>{t("settings.subtitle")}</p>
      
      {/* Tab Navigation */}
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        theme={theme}
        t={t as (key: string, params?: Record<string, string | number>) => string}
      />

      {/* Tab Content */}
      <div style={{ ...themeStyles.card, borderRadius: "0 8px 8px 8px", marginTop: "0" }}>
        
        {/* General Tab */}
        {activeTab === "general" && (
          <GeneralTab
            settings={settings}
            onChange={onChange}
            theme={theme}
            themeStyles={themeStyles}
            showToast={showToast}
          />
        )}


        {/* Display Tab */}
        {activeTab === "display" && (
          <DisplayTab
            settings={settings}
            onChange={onChange}
            theme={theme}
            themeStyles={themeStyles}
            showToast={showToast}
            openConfirmDialog={openConfirmDialog}
          />
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <SecurityTab
            settings={settings}
            onChange={onChange}
            theme={theme}
            themeStyles={themeStyles}
            showToast={showToast}
          />
        )}

        {/* Advanced Tab */}
        {activeTab === "advanced" && (
          <AdvancedTab
            settings={settings}
            onChange={onChange}
            theme={theme}
            themeStyles={themeStyles}
            showToast={showToast}
            onShowShortcutHelp={() => setShowShortcutHelp(true)}
            onShowVersionHistory={() => setShowVersionHistory(true)}
          />
        )}

        {/* Data Management Tab */}
        {activeTab === "data" && (
          <DataTab
            settings={settings}
            onChange={onChange}
            theme={theme}
            themeStyles={themeStyles}
            showToast={showToast}
            printers={printers}
            setPrinters={(value) => {
              if (typeof value === 'function') {
                setPrinters(value(printers));
              } else {
                setPrinters(value);
              }
            }}
            filaments={filaments}
            setFilaments={(value) => {
              if (typeof value === 'function') {
                setFilaments(value(filaments));
              } else {
                setFilaments(value);
              }
            }}
            offers={offers}
            setOffers={setOffers}
            logHistory={logHistory}
            auditLogHistory={auditLogHistory}
            loadAuditLogHistory={loadAuditLogHistory}
            setSelectedLogFile={setSelectedLogFile}
            setLogViewerOpen={setLogViewerOpen}
            setSelectedAuditLogFile={setSelectedAuditLogFile}
            setAuditLogViewerOpen={setAuditLogViewerOpen}
            setShowFactoryResetProgress={setShowFactoryResetProgress}
            setShowSystemDiagnostics={setShowSystemDiagnostics}
            openConfirmDialog={openConfirmDialog}
          />
        )}

        {/* Filament Library Tab */}
        {activeTab === "library" && (
          <LibraryTab
            settings={settings}
            theme={theme}
            themeStyles={themeStyles}
            showToast={showToast}
            libraryEntriesState={libraryEntriesState}
            libraryLoading={libraryLoading}
            librarySaving={librarySaving}
            libraryDirty={libraryDirty}
            libraryError={libraryError}
            libraryBrandFilter={libraryBrandFilter}
            libraryMaterialFilter={libraryMaterialFilter}
            librarySearch={librarySearch}
            editingLibraryId={editingLibraryId}
            libraryDraft={libraryDraft}
            libraryModalOpen={libraryModalOpen}
            libraryExporting={libraryExporting}
            libraryImporting={libraryImporting}
            visibleLibraryRange={visibleLibraryRange}
            filteredLibrary={filteredLibrary}
            shouldVirtualizeLibrary={shouldVirtualizeLibrary}
            visibleLibraryEntries={visibleLibraryEntries}
            topLibrarySpacerHeight={topLibrarySpacerHeight}
            bottomLibrarySpacerHeight={bottomLibrarySpacerHeight}
            duplicateGroups={duplicateGroups}
            duplicateEntryIds={duplicateEntryIds}
            setLibraryBrandFilter={setLibraryBrandFilter}
            setLibraryMaterialFilter={setLibraryMaterialFilter}
            setLibrarySearch={setLibrarySearch}
            setVisibleLibraryRange={setVisibleLibraryRange}
            openNewLibraryModal={openNewLibraryModal}
            handleLibraryStartEdit={handleLibraryStartEdit}
            handleLibraryDelete={handleLibraryDelete}
            handleLibrarySave={handleLibrarySave}
            handleLibraryReset={handleLibraryReset}
            handleLibraryExportToFile={handleLibraryExportToFile}
            handleLibraryImportFromFile={handleLibraryImportFromFile}
            openConfirmDialog={openConfirmDialog}
          />
        )}
      </div>
      
      <AnimatePresence>
        {showShortcutHelp && (
          <ShortcutHelp
            settings={settings}
            theme={theme}
            themeStyles={themeStyles}
            onClose={() => setShowShortcutHelp(false)}
            onSettingsChange={(newSettings) => {
              onChange(newSettings);
            }}
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
      {/* Autosave Info Modal - now handled by AdvancedTab component */}

      {/* Factory Reset Progress Modal */}
      <FactoryResetProgress
        theme={theme}
        settings={settings}
        isOpen={showFactoryResetProgress}
        onComplete={handleFactoryResetComplete}
      />

      {/* System Diagnostics Modal */}
      <SystemDiagnostics
        isOpen={showSystemDiagnostics}
        onClose={() => {
          setShowSystemDiagnostics(false);
          // Nullázzuk ki az initialModal-t, hogy ne nyílljon meg újra
          if (initialModal === "system-diagnostics") {
            onModalOpened?.();
          }
        }}
        settings={settings}
        theme={theme}
        themeStyles={themeStyles}
      />

      {/* Log Viewer Modal */}
      {selectedLogFile && (
        <LogViewer
          isOpen={logViewerOpen}
          onClose={() => {
            setLogViewerOpen(false);
            setSelectedLogFile(null);
            // Nullázzuk ki az initialModal-t, hogy ne nyílljon meg újra
            if (initialModal === "log-viewer") {
              onModalOpened?.();
            }
          }}
          logFilePath={selectedLogFile.path}
          logFileName={selectedLogFile.name}
          theme={theme}
          settings={settings}
        />
      )}

      {/* Audit Log Viewer Modal */}
      {selectedAuditLogFile && (
        <AuditLogViewer
          isOpen={auditLogViewerOpen}
          onClose={() => {
            setAuditLogViewerOpen(false);
            setSelectedAuditLogFile(null);
            // Nullázzuk ki az initialModal-t, hogy ne nyílljon meg újra
            if (initialModal === "audit-log-viewer") {
              onModalOpened?.();
            }
          }}
          auditLogFilePath={selectedAuditLogFile.path}
          auditLogFileName={selectedAuditLogFile.name}
          theme={theme}
          settings={settings}
        />
      )}

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
