import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "medium", 
  message 
}) => {
  const sizes = {
    small: "20px",
    medium: "40px",
    large: "60px"
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
      gap: "16px"
    }}>
      <div
        style={{
          width: sizes[size],
          height: sizes[size],
          border: `4px solid #e9ecef`,
          borderTop: `4px solid #007bff`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      >
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
      {message && (
        <p style={{ 
          color: "#6c757d", 
          fontSize: "14px",
          margin: 0
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

