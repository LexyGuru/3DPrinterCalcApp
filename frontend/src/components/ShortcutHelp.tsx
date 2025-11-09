import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Settings } from "../types";
import { useTranslation } from "../utils/translations";
import { keyboardShortcuts } from "../utils/keyboardShortcuts";

interface Props {
  settings: Settings;
  theme: any;
  themeStyles: any;
  onClose: () => void;
}

export const ShortcutHelp: React.FC<Props> = ({ settings, theme, themeStyles: _themeStyles, onClose }) => {
  const t = useTranslation(settings.language);
  const [shortcuts, setShortcuts] = useState<any[]>([]);

  useEffect(() => {
    const registeredShortcuts = keyboardShortcuts.getShortcuts();
    setShortcuts(registeredShortcuts);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + ? vagy Escape bezárja a help menüt
      if ((e.ctrlKey || e.metaKey) && e.key === "?") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const formatShortcut = (shortcut: any): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push(navigator.platform.includes("Mac") ? "Cmd" : "Ctrl");
    if (shortcut.meta) parts.push("Cmd");
    if (shortcut.shift) parts.push("Shift");
    if (shortcut.alt) parts.push("Alt");
    
    const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
    parts.push(key);
    
    return parts.join(" + ");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          backgroundColor: theme.colors.background,
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          color: theme.colors.text,
          width: "min(600px, 92vw)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: theme.colors.text }}>
            ⌨️ {t("shortcuts.title")}
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
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ✕
          </button>
        </div>

        {shortcuts.length === 0 ? (
          <p style={{ color: theme.colors.textMuted, textAlign: "center", padding: "20px" }}>
            {t("shortcuts.noShortcuts")}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  backgroundColor: theme.colors.cardBackground,
                  borderRadius: "8px",
                  transition: "background-color 0.2s",
                }}
              >
                <span style={{ color: theme.colors.text, fontSize: "14px" }}>
                  {shortcut.description || formatShortcut(shortcut)}
                </span>
                <kbd
                  style={{
                    backgroundColor: theme.colors.border,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    color: theme.colors.text,
                    fontWeight: "600",
                  }}
                >
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: `1px solid ${theme.colors.border}`, fontSize: "12px", color: theme.colors.textMuted, textAlign: "center" }}>
          {t("shortcuts.closeHint")}
        </div>
      </motion.div>
    </motion.div>
  );
};

