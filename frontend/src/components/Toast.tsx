import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Settings } from "../types";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: { bg: "#28a745", icon: "✅" },
    error: { bg: "#dc3545", icon: "❌" },
    info: { bg: "#17a2b8", icon: "ℹ️" },
    warning: { bg: "#ffc107", icon: "⚠️" }
  };

  const color = colors[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        backgroundColor: color.bg,
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        minWidth: "250px",
        maxWidth: "360px",
      }}
    >
      <span style={{ fontSize: "18px" }}>{color.icon}</span>
      <span style={{ flex: 1, fontWeight: "500" }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: "18px",
          cursor: "pointer",
          padding: "0",
          marginLeft: "8px",
          opacity: 0.8
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.8"; }}
      >
        ✕
      </button>
    </motion.div>
  );
};

// Toast context és provider

interface ToastContextType {
  showToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
}

export const ToastContext = React.createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode; settings?: Settings }> = ({ children, settings }) => {
  const [toasts, setToasts] = React.useState<Array<{ id: number; message: string; type: "success" | "error" | "info" | "warning" }>>([]);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
    // Ellenőrizzük, hogy az értesítések engedélyezve vannak-e
    if (settings?.notificationEnabled === false) {
      return;
    }

    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

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
              duration={notificationDuration}
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

