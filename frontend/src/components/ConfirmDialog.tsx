import { commonStyles } from "../utils/styles";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Igen",
  cancelText = "Mégse",
  type = "danger"
}) => {
  if (!isOpen) return null;

  const buttonStyle = type === "danger"
    ? commonStyles.buttonDanger
    : type === "warning"
    ? { ...commonStyles.button, backgroundColor: "#ffc107", color: "#000" }
    : commonStyles.buttonPrimary;

  return (
    <div
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
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 16px 0", color: "#212529", fontSize: "18px", fontWeight: "600" }}>
          {title}
        </h3>
        <p style={{ margin: "0 0 24px 0", color: "#495057", fontSize: "14px", lineHeight: "1.5" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              ...commonStyles.button,
              backgroundColor: "#6c757d",
              color: "#fff",
              padding: "10px 20px",
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              ...commonStyles.button,
              ...buttonStyle,
              padding: "10px 20px",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

