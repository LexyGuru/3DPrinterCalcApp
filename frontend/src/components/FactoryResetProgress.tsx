import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Theme } from "../utils/themes";
import type { Settings } from "../types";
import { useTranslation } from "../utils/translations";

interface FactoryResetProgressProps {
  theme: Theme;
  settings: Settings;
  isOpen: boolean;
  onComplete: () => void;
}

interface ResetStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed" | "error";
  message?: string;
}

export const FactoryResetProgress: React.FC<FactoryResetProgressProps> = ({
  theme,
  settings,
  isOpen,
  onComplete,
}) => {
  const t = useTranslation(settings.language);
  const [steps, setSteps] = useState<ResetStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [allComplete, setAllComplete] = useState(false);

  const themeStyles = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    primary: theme.colors.primary,
    border: theme.colors.border,
    success: theme.colors.success || "#28a745",
    error: theme.colors.danger || "#dc3545",
  };

  // Kikapcsoljuk a logolást, amikor a modal megnyílik (még mielőtt bármi törlés történik)
  // És NEM kapcsoljuk vissza, amikor a modal bezárul - a nyelvválasztó után fogjuk
  useEffect(() => {
    if (isOpen) {
      // Dinamikus import, hogy elkerüljük a circular dependency-t
      import("../utils/fileLogger").then(({ setLoggingEnabled }) => {
        setLoggingEnabled(false);
      });
    }
    // NE kapcsoljuk vissza itt - a logolás továbbra is letiltva marad az app újraindításáig
  }, [isOpen]);

  // Inicializáljuk a lépéseket
  useEffect(() => {
    if (isOpen && steps.length === 0) {
      const initialSteps: ResetStep[] = [
        {
          id: "delete-backups",
          label: t("factoryResetProgress.step.deleteBackups"),
          status: "pending",
        },
        {
          id: "delete-logs",
          label: t("factoryResetProgress.step.deleteLogs"),
          status: "pending",
        },
        {
          id: "delete-config",
          label: t("factoryResetProgress.step.deleteConfig"),
          status: "pending",
        },
        {
          id: "reset-complete",
          label: t("factoryResetProgress.step.complete"),
          status: "pending",
        },
      ];
      setSteps(initialSteps);
      setCurrentStepIndex(0);
      setAllComplete(false);
      setCountdown(null);
    }
  }, [isOpen, settings.language, steps.length, t]);

  // Factory Reset folyamat indítása
  useEffect(() => {
    if (!isOpen || steps.length === 0) return;

    const executeFactoryReset = async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      const { clearAllData } = await import("../utils/store");

      try {
        // A logolás már ki van kapcsolva a modal megnyitásakor (a fenti useEffect-ben)
        
        // 1. Automatikus backup fájlok törlése
        setCurrentStepIndex(0);
        setSteps(prev => prev.map((s, i) => 
          i === 0 ? { ...s, status: "in_progress" as const } : s
        ));

        await new Promise(resolve => setTimeout(resolve, 500)); // Kis késleltetés az animációhoz

        try {
          const deletedBackupCount = await invoke<number>("delete_all_backups");
          
          // Ellenőrizzük, hogy a fájlok valóban törlődtek-e (2 másodperc késleltetéssel)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          setSteps(prev => prev.map((s, i) => 
            i === 0 
              ? { 
                  ...s, 
                  status: "completed" as const,
                  message: deletedBackupCount > 0 
                    ? `${deletedBackupCount} ${t("factoryResetProgress.message.filesDeleted")}`
                    : t("factoryResetProgress.message.noFilesToDelete")
                }
              : s
          ));
        } catch (error) {
          setSteps(prev => prev.map((s, i) => 
            i === 0 
              ? { ...s, status: "error" as const, message: String(error) }
              : s
          ));
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Várakozás az ellenőrzéshez

        // 2. Log fájlok törlése
        setCurrentStepIndex(1);
        setSteps(prev => prev.map((s, i) => 
          i === 1 ? { ...s, status: "in_progress" as const } : s
        ));

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
          const deletedLogCount = await invoke<number>("delete_all_logs");
          const deletedAuditLogCount = await invoke<number>("delete_all_audit_logs");
          
          // Ellenőrizzük, hogy a fájlok valóban törlődtek-e (2 másodperc késleltetéssel)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const totalDeleted = deletedLogCount + deletedAuditLogCount;
          
          setSteps(prev => prev.map((s, i) => 
            i === 1 
              ? { 
                  ...s, 
                  status: "completed" as const,
                  message: totalDeleted > 0
                    ? `${totalDeleted} ${t("factoryResetProgress.message.filesDeleted")} (${deletedLogCount} log, ${deletedAuditLogCount} audit)`
                    : t("factoryResetProgress.message.noFilesToDelete")
                }
              : s
          ));
        } catch (error) {
          setSteps(prev => prev.map((s, i) => 
            i === 1 
              ? { ...s, status: "error" as const, message: String(error) }
              : s
          ));
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Konfigurációs fájlok törlése és adatok resetelése
        setCurrentStepIndex(2);
        setSteps(prev => prev.map((s, i) => 
          i === 2 ? { ...s, status: "in_progress" as const } : s
        ));

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
          await clearAllData();
          
          // Nagyobb szünet az ellenőrzéshez, hogy a fájlok törlődtek-e
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          setSteps(prev => prev.map((s, i) => 
            i === 2 
              ? { 
                  ...s, 
                  status: "completed" as const,
                  message: t("factoryResetProgress.message.filesDeletedShort")
                }
              : s
          ));
        } catch (error) {
          setSteps(prev => prev.map((s, i) => 
            i === 2 
              ? { ...s, status: "error" as const, message: String(error) }
              : s
          ));
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Reset befejezve
        setCurrentStepIndex(3);
        setSteps(prev => prev.map((s, i) => 
          i === 3 ? { ...s, status: "completed" as const } : s
        ));

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Audit log (Factory Reset befejezve)
        try {
          // Dinamikus import, hogy elkerüljük a circular dependency-t
          const { auditFactoryReset } = await import("../utils/auditLog");
          await auditFactoryReset({
            deletedBackupCount: await invoke<number>("delete_all_backups").catch(() => 0),
            deletedLogCount: await invoke<number>("delete_all_logs").catch(() => 0),
            deletedAuditLogCount: await invoke<number>("delete_all_audit_logs").catch(() => 0),
          });
        } catch (error) {
          // Csendben ignoráljuk, mert a logolás ki van kapcsolva
        }

        // Összes lépés kész
        setAllComplete(true);

        // 10 másodperces visszaszámláló a nyelvválasztó megjelenítéséhez
        setCountdown(10);
      } catch (error) {
        console.error("❌ Hiba a Factory Reset során:", error);
      }
      // A logolás újra bekapcsolása a modal bezárásakor történik (a fenti useEffect cleanup függvényében)
    };

    executeFactoryReset();
  }, [isOpen, steps.length, settings.language]);

  // Visszaszámláló
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0 && allComplete) {
        // Visszaszámláló befejezve, meghívjuk az onComplete callback-et
        setTimeout(() => {
          onComplete();
        }, 500);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, allComplete, onComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 20000,
          backdropFilter: "blur(8px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            backgroundColor: themeStyles.surface,
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "500px",
            width: "90%",
            boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
            border: `2px solid ${themeStyles.border}`,
          }}
        >
          <h2 style={{
            margin: "0 0 24px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: themeStyles.text,
            textAlign: "center",
          }}>
            🔄 {t("factoryResetProgress.title")}
          </h2>

          <div style={{ marginBottom: "24px" }}>
            {steps.map((step, index) => (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  marginBottom: "8px",
                  borderRadius: "8px",
                  backgroundColor: index === currentStepIndex 
                    ? themeStyles.primary + "20"
                    : "transparent",
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: step.status === "completed"
                    ? themeStyles.success
                    : step.status === "error"
                    ? themeStyles.error
                    : step.status === "in_progress"
                    ? themeStyles.primary
                    : themeStyles.border,
                  color: step.status === "pending" ? themeStyles.textMuted : "#fff",
                  fontWeight: "bold",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                }}>
                  {step.status === "completed" ? (
                    "✓"
                  ) : step.status === "error" ? (
                    "✕"
                  ) : step.status === "in_progress" ? (
                    <div style={{
                      width: "20px",
                      height: "20px",
                      border: "3px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}>
                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                    </div>
                  ) : (
                    index + 1
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: step.status === "error" 
                      ? themeStyles.error
                      : step.status === "completed"
                      ? themeStyles.success
                      : themeStyles.text,
                    marginBottom: step.message ? "4px" : "0",
                  }}>
                    {step.label}
                  </div>
                  {step.message && (
                    <div style={{
                      fontSize: "12px",
                      color: themeStyles.textMuted,
                    }}>
                      {step.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {allComplete && countdown !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                textAlign: "center",
                padding: "16px",
                backgroundColor: themeStyles.success + "20",
                borderRadius: "12px",
                border: `1px solid ${themeStyles.success}`,
                marginTop: "16px",
              }}
            >
              <div style={{
                fontSize: "18px",
                fontWeight: "600",
                color: themeStyles.success,
                marginBottom: "8px",
              }}>
                ✅ {t("factoryResetProgress.completed.title")}
              </div>
              <div style={{
                fontSize: "14px",
                color: themeStyles.textMuted,
              }}>
                {t("factoryResetProgress.completed.countdown", { seconds: countdown })}
              </div>
              <div style={{
                marginTop: "12px",
                fontSize: "32px",
                fontWeight: "700",
                color: themeStyles.primary,
              }}>
                {countdown}
              </div>
            </motion.div>
          )}

          {!allComplete && (
            <div style={{
              textAlign: "center",
              fontSize: "13px",
              color: themeStyles.textMuted,
              marginTop: "16px",
              fontStyle: "italic",
            }}>
              {t("factoryResetProgress.waiting")}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

