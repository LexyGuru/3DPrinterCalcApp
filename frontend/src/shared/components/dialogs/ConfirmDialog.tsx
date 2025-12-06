import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { commonStyles } from "../../../utils/styles";
import type { Theme } from "../../../utils/themes";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  theme?: Theme;
  customContent?: React.ReactNode; // Egyedi tartalom a message helyett
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Igen",
  cancelText = "Mégse",
  type = "danger",
  theme,
  customContent,
}) => {
  const isGradientBackground = theme?.colors.background?.includes('gradient');
  const dialogBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : (theme?.colors.surface || "#fff");
  const dialogTextColor = isGradientBackground 
    ? "#1a202c" 
    : (theme?.colors.text || "#212529");
  const dialogTextMuted = isGradientBackground 
    ? "#4a5568" 
    : (theme?.colors.textMuted || "#495057");

  const buttonStyle = type === "danger"
    ? { backgroundColor: theme?.colors.danger || "#dc3545", color: "#fff" }
    : type === "warning"
    ? { backgroundColor: "#ffc107", color: "#000" }
    : { backgroundColor: theme?.colors.primary || "#007bff", color: "#fff" };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-dialog"
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
            backdropFilter: isGradientBackground ? "blur(5px)" : "none",
          }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              backgroundColor: dialogBg,
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: isGradientBackground
                ? "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)"
                : "0 4px 20px rgba(0,0,0,0.3)",
              border: isGradientBackground ? `1px solid ${theme?.colors.border || "rgba(0,0,0,0.1)"}` : "none",
              backdropFilter: isGradientBackground ? "blur(20px)" : "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              margin: "0 0 16px 0", 
              color: dialogTextColor, 
              fontSize: "20px", 
              fontWeight: "700" 
            }}>
              {title}
            </h3>
            <div style={{ 
              maxHeight: "60vh", 
              overflowY: "auto",
              marginBottom: customContent || message ? "24px" : "0"
            }}>
              {customContent ? (
                customContent
              ) : message ? (
                <p style={{ 
                  margin: "0", 
                  color: dialogTextMuted, 
                  fontSize: "14px", 
                  lineHeight: "1.6" 
                }}>
                  {message}
                </p>
              ) : null}
            </div>
            <div style={{ 
              display: "flex", 
              gap: "12px", 
              justifyContent: "flex-end",
              position: "relative",
              zIndex: 1,
              pointerEvents: "auto"
            }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancel();
                }}
                style={{
                  ...commonStyles.button,
                  backgroundColor: theme?.colors.secondary || "#6c757d",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                  position: "relative",
                  zIndex: 10,
                  pointerEvents: "auto",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme?.colors.secondaryHover || "#5a6268";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme?.colors.secondary || "#6c757d";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {cancelText}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onConfirm();
                }}
                style={{
                  ...commonStyles.button,
                  ...buttonStyle,
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                  position: "relative",
                  zIndex: 10,
                  pointerEvents: "auto",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

