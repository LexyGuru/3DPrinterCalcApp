import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Settings, AnimationSettings } from "../types";
import { defaultAnimationSettings } from "../types";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number; // ha <= 0, akkor csak manuálisan záródik be
  animationSettings?: AnimationSettings;
  actionButton?: {
    label: string;
    onClick: () => void;
  }; // Opcionális gomb a toast-ban
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
  animationSettings,
  actionButton,
}) => {
  useEffect(() => {
    // Ha a duration <= 0, vagy info típusú toast, nem indítunk automatikus időzítőt –
    // ilyenkor mindig kézzel kell bezárni (pl. fontos emlékeztetők esetén).
    if (duration <= 0 || type === "info") {
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, type]);

  const colors = {
    success: { bg: "#28a745", icon: "✅" },
    error: { bg: "#dc3545", icon: "❌" },
    info: { bg: "#17a2b8", icon: "ℹ️" },
    warning: { bg: "#ffc107", icon: "⚠️" }
  };

  const color = colors[type];

  const animationConfig = {
    ...defaultAnimationSettings,
    ...(animationSettings ?? {}),
  };

  if (animationConfig.feedbackAnimations === "none") {
    return (
      <div
        style={{
          backgroundColor: color.bg,
          color: "#fff",
          padding: actionButton ? "16px 20px" : "12px 20px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: actionButton ? "column" : "row",
          alignItems: actionButton ? "flex-start" : "center",
          gap: actionButton ? "12px" : "10px",
          minWidth: "280px",
          maxWidth: "400px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
          <span style={{ fontSize: "20px", flexShrink: 0 }}>{color.icon}</span>
          <span style={{ flex: 1, fontWeight: "500", fontSize: "14px", lineHeight: "1.4" }}>{message}</span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "6px",
              opacity: 0.9,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (animationConfig.microInteractions) {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.9";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            }}
          >
            ✕
          </button>
        </div>
        {actionButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // 🔒 TOAST BEZÁRÁS: Amikor rákattintanak a gombra, bezárjuk a toast-ot is
              onClose();
              actionButton.onClick();
            }}
            style={{
              background: "#fff",
              border: "none",
              color: color.bg,
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 20px",
              borderRadius: "8px",
              width: "100%",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) => {
              if (animationConfig.microInteractions) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
            }}
          >
            {actionButton.label}
          </button>
        )}
      </div>
    );
  }

  const feedbackVariant = (() => {
    switch (animationConfig.feedbackAnimations) {
      case "emphasis":
        return {
          initial: { opacity: 0, x: 36, scale: 0.88, rotate: -2 },
          animate: { opacity: 1, x: 0, scale: [0.95, 1.04, 1], rotate: 0 },
          exit: { opacity: 0, x: 48, scale: 0.9, rotate: 2 },
          transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        };
      case "pulse":
        return {
          initial: { opacity: 0, y: 24, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -24, scale: 0.9 },
          transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
        };
      case "subtle":
      default:
        return {
          initial: { opacity: 0, x: 30, scale: 0.95 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: 30, scale: 0.95 },
          transition: { duration: 0.24, ease: "easeOut" as const },
        };
    }
  })();

  const iconMotionProps =
    animationConfig.feedbackAnimations === "pulse"
      ? {
          animate: { scale: [1, 1.18, 0.94, 1], rotate: [0, 3, -3, 0] },
          transition: { duration: 0.9, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 1.6 },
        }
      : animationConfig.feedbackAnimations === "emphasis"
      ? {
          animate: { scale: [1, 1.12, 1], rotate: [0, -4, 0] },
          transition: { duration: 0.6, ease: "easeOut" as const },
        }
      : {
          animate: { scale: 1, rotate: 0 },
          transition: { duration: 0.3, ease: "easeOut" as const },
        };

  return (
    <motion.div
      layout
      initial={feedbackVariant.initial}
      animate={feedbackVariant.animate}
      exit={feedbackVariant.exit}
      transition={feedbackVariant.transition}
      style={{
        backgroundColor: color.bg,
        color: "#fff",
        padding: actionButton ? "16px 20px" : "12px 20px",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: actionButton ? "column" : "row",
        alignItems: actionButton ? "flex-start" : "center",
        gap: actionButton ? "12px" : "10px",
        minWidth: "280px",
        maxWidth: "400px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
        <motion.span style={{ fontSize: "20px", display: "inline-flex", flexShrink: 0 }} {...iconMotionProps}>
          {color.icon}
        </motion.span>
        <span style={{ flex: 1, fontWeight: "500", fontSize: "14px", lineHeight: "1.4" }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            border: "none",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "6px",
            opacity: 0.9,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (animationConfig.microInteractions) {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
              e.currentTarget.style.transform = "scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ✕
        </button>
      </div>
      {actionButton && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // 🔒 TOAST BEZÁRÁS: Amikor rákattintanak a gombra, bezárjuk a toast-ot is
            onClose();
            actionButton.onClick();
          }}
          style={{
            background: "#fff",
            border: "none",
            color: color.bg,
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 20px",
            borderRadius: "8px",
            width: "100%",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
          onMouseEnter={(e) => {
            if (animationConfig.microInteractions) {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
          }}
        >
          {actionButton.label}
        </button>
      )}
    </motion.div>
  );
};

// Toast context és provider

interface ToastContextType {
  showToast: (message: string, type: "success" | "error" | "info" | "warning", actionButton?: { label: string; onClick: () => void }) => void;
}

export const ToastContext = React.createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode; settings?: Settings }> = ({ children, settings }) => {
  const [toasts, setToasts] = React.useState<Array<{ id: number; message: string; type: "success" | "error" | "info" | "warning"; actionButton?: { label: string; onClick: () => void } }>>([]);

  const showToast = React.useCallback((message: string, type: "success" | "error" | "info" | "warning", actionButton?: { label: string; onClick: () => void }) => {
    // Ellenőrizzük, hogy az értesítések engedélyezve vannak-e
    if (settings?.notificationEnabled === false) {
      return;
    }

    // 🔒 DUPLIKÁLT TOAST ELTÁVOLÍTÁS: Ha már van ilyen toast üzenet, ne jelenítse meg újra
    setToasts(prev => {
      // Ellenőrizzük, hogy van-e már ilyen toast üzenet (ugyanaz az üzenet és típus)
      const existingToast = prev.find(t => t.message === message && t.type === type);
      if (existingToast) {
        // Ha van már ilyen toast, ne jelenítse meg újra
        return prev;
      }
      // Ha nincs ilyen toast, hozzáadjuk az újat
      const id = Date.now();
      return [...prev, { id, message, type, actionButton }];
    });
  }, [settings?.notificationEnabled]);

  // Notification service inicializálása és frissítése
  React.useEffect(() => {
    if (settings) {
      import("../utils/notificationService").then(({ initNotificationService }) => {
        // Mindig inicializáljuk újra, hogy a showToast callback friss legyen
        initNotificationService(settings, showToast);
      });
    }
  }, [settings, showToast]);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const notificationDuration = settings?.notificationDuration || 3000;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              duration={toast.type === "info" ? -1 : notificationDuration} // Info típusú toast nem tűnik el automatikusan
              animationSettings={settings?.animationSettings}
              actionButton={toast.actionButton}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

