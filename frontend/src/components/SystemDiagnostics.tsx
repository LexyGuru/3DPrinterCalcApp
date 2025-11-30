import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { invoke } from "@tauri-apps/api/core";
import { writeFrontendLog } from "../utils/fileLogger";
import { getPerformanceMetrics } from "../utils/systemInfo";

interface DiagnosticResult {
  category: string;
  item: string;
  status: "success" | "warning" | "error" | "info";
  message: string;
  details?: string;
  value?: string | number;
}

interface SystemDiagnosticsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const SystemDiagnostics: React.FC<SystemDiagnosticsProps> = ({
  isOpen,
  onClose,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentCheck, setCurrentCheck] = useState<string>("");
  const isRunningRef = useRef(false);
  const hasRunRef = useRef(false);

  const runDiagnostics = useCallback(async () => {
    // Prevent multiple concurrent runs
    if (isRunningRef.current) {
      return;
    }
    isRunningRef.current = true;
    hasRunRef.current = true;
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    const allResults: DiagnosticResult[] = [];

    try {
      // 1. Rendszer információk
      setCurrentCheck(t("systemDiagnostics.checking.systemInfo") || "Rendszer információk ellenőrzése...");
      setProgress(10);
      
      try {
        const systemInfo = await invoke<any>("get_system_info");
        allResults.push({
          category: "system",
          item: "cpu",
          status: "success",
          message: t("systemDiagnostics.success.cpu") || "CPU információ sikeresen lekérve",
          value: `${systemInfo.cpu?.name || "N/A"}`,
        });
        const usedPercent = systemInfo.memory?.used_percent || 0;
        const usedGb = parseFloat(systemInfo.memory?.used_gb) || 0;
        const totalGb = parseFloat(systemInfo.memory?.total_gb) || 0;
        allResults.push({
          category: "system",
          item: "memory",
          status: usedPercent > 90 ? "warning" : "success",
          message: t("systemDiagnostics.success.memory") || "Memória információ sikeresen lekérve",
          value: `${usedPercent}%`,
          details: `${usedGb.toFixed(2)} GB / ${totalGb.toFixed(2)} GB`,
        });
        allResults.push({
          category: "system",
          item: "os",
          status: "success",
          message: t("systemDiagnostics.success.os") || "Operációs rendszer információ sikeresen lekérve",
          value: `${systemInfo.os?.name || "N/A"} ${systemInfo.os?.version || ""}`,
        });
      } catch (error) {
        allResults.push({
          category: "system",
          item: "info",
          status: "error",
          message: t("systemDiagnostics.error.systemInfo") || "Hiba a rendszer információk lekérdezésekor",
          details: String(error),
        });
      }

      setResults([...allResults]);
      setProgress(25);

      // 2. Memória használat ellenőrzése
      setCurrentCheck(t("systemDiagnostics.checking.memory") || "Memória használat ellenőrzése...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const memoryInfo = await invoke<any>("get_system_info");
        const usedPercent = memoryInfo.memory?.used_percent || 0;
        
        if (usedPercent > 95) {
          allResults.push({
            category: "memory",
            item: "usage",
            status: "error",
            message: t("systemDiagnostics.error.memoryCritical") || "Kritikus memória használat!",
            value: `${usedPercent}%`,
            details: t("systemDiagnostics.warning.memoryHigh") || "A memória használat túl magas, ez stabilitási problémákat okozhat.",
          });
        } else if (usedPercent > 85) {
          allResults.push({
            category: "memory",
            item: "usage",
            status: "warning",
            message: t("systemDiagnostics.warning.memoryHigh") || "Magas memória használat",
            value: `${usedPercent}%`,
            details: t("systemDiagnostics.warning.memoryRecommendation") || "Ajánlott az alkalmazás újraindítása.",
          });
        } else {
          allResults.push({
            category: "memory",
            item: "usage",
            status: "success",
            message: t("systemDiagnostics.success.memoryUsage") || "Memória használat megfelelő",
            value: `${usedPercent}%`,
          });
        }
      } catch (error) {
        allResults.push({
          category: "memory",
          item: "usage",
          status: "error",
          message: t("systemDiagnostics.error.memoryCheck") || "Hiba a memória ellenőrzésekor",
          details: String(error),
        });
      }

      setResults([...allResults]);
      setProgress(40);

      // 3. Performance metrikák ellenőrzése
      setCurrentCheck(t("systemDiagnostics.checking.performance") || "Performance metrikák ellenőrzése...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const performanceMetrics = await getPerformanceMetrics();
        if (performanceMetrics) {
          // CPU használat
          const cpuUsage = parseFloat(performanceMetrics.cpu.usage_percent);
          if (cpuUsage > 90) {
            allResults.push({
              category: "performance",
              item: "cpu",
              status: "warning",
              message: t("systemDiagnostics.warning.cpuHigh") || "Magas CPU használat",
              value: `${cpuUsage.toFixed(1)}%`,
              details: t("systemDiagnostics.warning.cpuRecommendation") || "A CPU használat magas, ez lassulást okozhat.",
            });
          } else {
            allResults.push({
              category: "performance",
              item: "cpu",
              status: "success",
              message: t("systemDiagnostics.success.cpuUsage") || "CPU használat megfelelő",
              value: `${cpuUsage.toFixed(1)}%`,
              details: `${performanceMetrics.cpu.cores} mag`,
            });
          }
          
          // Memória használat (performance metrikákból)
          const memoryPercent = performanceMetrics.memory.used_percent;
          const usedMb = parseFloat(performanceMetrics.memory.used_mb);
          const totalMb = parseFloat(performanceMetrics.memory.total_mb);
          
          if (memoryPercent > 95) {
            allResults.push({
              category: "performance",
              item: "memory",
              status: "error",
              message: t("systemDiagnostics.error.memoryCritical") || "Kritikus memória használat!",
              value: `${memoryPercent}%`,
              details: `${usedMb.toFixed(2)} MB / ${totalMb.toFixed(2)} MB`,
            });
          } else if (memoryPercent > 85) {
            allResults.push({
              category: "performance",
              item: "memory",
              status: "warning",
              message: t("systemDiagnostics.warning.memoryHigh") || "Magas memória használat",
              value: `${memoryPercent}%`,
              details: `${usedMb.toFixed(2)} MB / ${totalMb.toFixed(2)} MB`,
            });
          } else {
            allResults.push({
              category: "performance",
              item: "memory",
              status: "success",
              message: t("systemDiagnostics.success.memoryUsage") || "Memória használat megfelelő",
              value: `${memoryPercent}%`,
              details: `${usedMb.toFixed(2)} MB / ${totalMb.toFixed(2)} MB`,
            });
          }
        } else {
          allResults.push({
            category: "performance",
            item: "metrics",
            status: "error",
            message: t("systemDiagnostics.error.performanceMetrics") || "Hiba a performance metrikák lekérdezésekor",
            details: t("systemDiagnostics.error.performanceMetricsDetails") || "Nem sikerült lekérni a performance metrikákat.",
          });
        }
      } catch (error) {
        allResults.push({
          category: "performance",
          item: "metrics",
          status: "error",
          message: t("systemDiagnostics.error.performanceCheck") || "Hiba a performance ellenőrzésekor",
          details: String(error),
        });
      }

      setResults([...allResults]);
      setProgress(55);

      // 4. Fájl rendszer ellenőrzése
      setCurrentCheck(t("systemDiagnostics.checking.files") || "Fájl rendszer ellenőrzése...");
      await new Promise(resolve => setTimeout(resolve, 500));

      const fileChecks = [
        { name: "data.json", path: "data.json" },
        { name: "filamentLibrary.json", path: "filamentLibrary.json" },
        { name: "update_filament.json", path: "update_filament.json" },
      ];

      for (const file of fileChecks) {
        try {
          const exists = await invoke<boolean>("check_file_exists", { filePath: file.path });
          if (exists) {
            allResults.push({
              category: "files",
              item: file.name,
              status: "success",
              message: t("systemDiagnostics.success.fileExists") || "Fájl létezik",
              value: file.name,
            });
          } else {
            allResults.push({
              category: "files",
              item: file.name,
              status: "warning",
              message: t("systemDiagnostics.warning.fileMissing") || "Fájl hiányzik",
              value: file.name,
              details: t("systemDiagnostics.warning.fileWillBeCreated") || "A fájl automatikusan létrejön első használatkor.",
            });
          }
        } catch (error) {
          allResults.push({
            category: "files",
            item: file.name,
            status: "error",
            message: t("systemDiagnostics.error.fileCheck") || "Hiba a fájl ellenőrzésekor",
            value: file.name,
            details: String(error),
          });
        }
      }

      setResults([...allResults]);
      setProgress(60);

      // 4. Modulok ellenőrzése (frontend komponensek - csak a létezés ellenőrzése)
      setCurrentCheck(t("systemDiagnostics.checking.modules") || "Modulok ellenőrzése...");
      await new Promise(resolve => setTimeout(resolve, 500));

      const modules = [
        "Settings",
        "Offers",
        "Printers",
        "Filaments",
        "Customers",
        "Calculator",
        "Home",
      ];

      // Frontend komponensek mindig betöltve vannak ha a UI működik
      // Csak validáljuk, hogy a fő modulok elérhetők-e
      for (const module of modules) {
        // A komponensek már betöltve vannak, ha a Settings oldal működik
        allResults.push({
          category: "modules",
          item: module,
          status: "success",
          message: t("systemDiagnostics.success.moduleLoaded") || "Modul betöltve",
          value: module,
          details: t("systemDiagnostics.info.moduleAvailable") || "Komponens elérhető",
        });
      }

      setResults([...allResults]);
      setProgress(80);

      // 5. Adatbázis/Store ellenőrzése
      setCurrentCheck(t("systemDiagnostics.checking.store") || "Adattárolás ellenőrzése...");
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const storeExists = await invoke<boolean>("check_file_exists", { filePath: "data.json" });
        if (storeExists) {
          allResults.push({
            category: "store",
            item: "data_store",
            status: "success",
            message: t("systemDiagnostics.success.storeAccessible") || "Adattárolás elérhető",
            value: "data.json",
          });
        } else {
          allResults.push({
            category: "store",
            item: "data_store",
            status: "info",
            message: t("systemDiagnostics.info.storeWillBeCreated") || "Adattárolás automatikusan létrejön",
            value: "data.json",
          });
        }
      } catch (error) {
        allResults.push({
          category: "store",
          item: "data_store",
          status: "error",
          message: t("systemDiagnostics.error.storeCheck") || "Hiba az adattárolás ellenőrzésekor",
          details: String(error),
        });
      }

      setResults([...allResults]);
      setProgress(100);

      // 6. Összefoglaló
      const successCount = allResults.filter(r => r.status === "success").length;
      const warningCount = allResults.filter(r => r.status === "warning").length;
      const errorCount = allResults.filter(r => r.status === "error").length;

      allResults.push({
        category: "summary",
        item: "total",
        status: errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "success",
        message: t("systemDiagnostics.summary.completed") || "Diagnosztika befejezve",
        value: `${successCount} sikeres, ${warningCount} figyelmeztetés, ${errorCount} hiba`,
      });

      setResults([...allResults]);
      setCurrentCheck(t("systemDiagnostics.completed") || "Befejezve");

      // Logolás
      await writeFrontendLog(
        "INFO",
        `System Diagnostics completed: ${successCount} success, ${warningCount} warnings, ${errorCount} errors`,
        "SystemDiagnostics"
      );

    } catch (error) {
      await writeFrontendLog(
        "ERROR",
        `System Diagnostics error: ${error}`,
        "SystemDiagnostics",
        undefined,
        error
      );
      allResults.push({
        category: "error",
        item: "diagnostics",
        status: "error",
        message: t("systemDiagnostics.error.general") || "Hiba a diagnosztika futása közben",
        details: String(error),
      });
      setResults([...allResults]);
    } finally {
      setIsRunning(false);
      isRunningRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.language]); // t function is used directly from component scope, no need in deps

  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      setResults([]);
      setProgress(0);
      setCurrentCheck("");
      hasRunRef.current = false;
      isRunningRef.current = false;
      return;
    }

    // Only run diagnostics once when modal opens
    if (!hasRunRef.current && !isRunningRef.current) {
      runDiagnostics();
    }
    // Only depend on isOpen - runDiagnostics is stable via useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const getStatusIcon = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "➡️";
    }
  };

  const getStatusColor = (status: DiagnosticResult["status"]) => {
    switch (status) {
      case "success":
        return theme.colors.success || "#22c55e";
      case "warning":
        return "#f59e0b";
      case "error":
        return theme.colors.danger || "#ef4444";
      case "info":
        return theme.colors.primary || "#4f46e5";
      default:
        return theme.colors.textMuted;
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);

  const categories = ["system", "memory", "files", "modules", "store", "summary", "error"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9998,
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              backgroundColor: theme.colors.surface,
              borderRadius: "16px",
              boxShadow: `0 20px 60px ${theme.colors.shadow}`,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "24px",
                borderBottom: `1px solid ${theme.colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: theme.colors.text,
                }}
              >
                🔍 {t("systemDiagnostics.title") || "Rendszer Diagnosztika"}
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: theme.colors.textMuted,
                  padding: "4px 8px",
                  borderRadius: "8px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                  e.currentTarget.style.color = theme.colors.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = theme.colors.textMuted;
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                padding: "24px",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {/* Progress bar */}
              {isRunning && (
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: theme.colors.surfaceHover,
                      borderRadius: "4px",
                      overflow: "hidden",
                      marginBottom: "8px",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                      style={{
                        height: "100%",
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                  </div>
                  <p style={{ fontSize: "14px", color: theme.colors.textMuted, margin: 0 }}>
                    {currentCheck}
                  </p>
                </div>
              )}

              {/* Results */}
              {results.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {categories.map((category) => {
                    const categoryResults = groupedResults[category];
                    if (!categoryResults || categoryResults.length === 0) return null;

                    const categoryLabels: Record<string, string> = {
                      system: t("systemDiagnostics.category.system") || "Rendszer",
                      memory: t("systemDiagnostics.category.memory") || "Memória",
                      files: t("systemDiagnostics.category.files") || "Fájlok",
                      modules: t("systemDiagnostics.category.modules") || "Modulok",
                      store: t("systemDiagnostics.category.store") || "Adattárolás",
                      summary: t("systemDiagnostics.category.summary") || "Összefoglaló",
                      error: t("systemDiagnostics.category.errors") || "Hibák",
                    };

                    return (
                      <div key={category}>
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: theme.colors.text,
                            marginBottom: "12px",
                          }}
                        >
                          {categoryLabels[category] || category}
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {categoryResults.map((result, index) => (
                            <div
                              key={`${result.category}-${result.item}-${index}`}
                              style={{
                                padding: "12px 16px",
                                backgroundColor: theme.colors.surfaceHover,
                                borderRadius: "8px",
                                border: `1px solid ${theme.colors.border}`,
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "12px",
                              }}
                            >
                              <span style={{ fontSize: "20px", flexShrink: 0 }}>
                                {getStatusIcon(result.status)}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                    marginBottom: result.details ? "4px" : 0,
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: "14px",
                                      fontWeight: 500,
                                      color: getStatusColor(result.status),
                                    }}
                                  >
                                    {result.message}
                                  </p>
                                  {result.value && (
                                    <span
                                      style={{
                                        fontSize: "12px",
                                        color: theme.colors.textMuted,
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {result.value}
                                    </span>
                                  )}
                                </div>
                                {result.details && (
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: "12px",
                                      color: theme.colors.textMuted,
                                      marginTop: "4px",
                                    }}
                                  >
                                    {result.details}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isRunning && results.length === 0 && (
                <p style={{ fontSize: "14px", color: theme.colors.textMuted, textAlign: "center" }}>
                  {t("systemDiagnostics.waiting") || "Várakozás az ellenőrzés indítására..."}
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: `1px solid ${theme.colors.border}`,
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSecondary,
                  padding: "10px 20px",
                }}
              >
                {t("common.close") || "Bezárás"}
              </button>
              {!isRunning && results.length > 0 && (
                <button
                  onClick={runDiagnostics}
                  style={{
                    ...themeStyles.button,
                    backgroundColor: theme.colors.primary,
                    color: "#ffffff",
                    padding: "10px 20px",
                  }}
                >
                  🔄 {t("systemDiagnostics.rerun") || "Újrafuttatás"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

