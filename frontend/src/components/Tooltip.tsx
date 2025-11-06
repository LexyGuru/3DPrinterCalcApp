import React, { useState, useEffect, useRef } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = "top",
  delay = 300 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get tooltip position styles based on position prop
  const getTooltipStyles = (): React.CSSProperties => {
    if (!isVisible) {
      return {
        position: "absolute",
        visibility: "hidden",
        opacity: 0,
        pointerEvents: "none",
      };
    }

    const baseStyles: React.CSSProperties = {
      position: "absolute",
      backgroundColor: "#333",
      color: "#fff",
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      whiteSpace: "nowrap",
      zIndex: 10000,
      pointerEvents: "none",
      opacity: 1,
      transition: "opacity 0.2s ease-in-out",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      visibility: "visible",
    };

    switch (position) {
      case "top":
        return {
          ...baseStyles,
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "8px",
        };
      case "bottom":
        return {
          ...baseStyles,
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "8px",
        };
      case "left":
        return {
          ...baseStyles,
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginRight: "8px",
        };
      case "right":
        return {
          ...baseStyles,
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginLeft: "8px",
        };
      default:
        return baseStyles;
    }
  };

  // Get arrow styles based on position
  const getArrowStyles = (): React.CSSProperties => {
    const baseArrow: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      border: "6px solid transparent",
    };

    switch (position) {
      case "top":
        return {
          ...baseArrow,
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          borderTopColor: "#333",
        };
      case "bottom":
        return {
          ...baseArrow,
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          borderBottomColor: "#333",
        };
      case "left":
        return {
          ...baseArrow,
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          borderLeftColor: "#333",
        };
      case "right":
        return {
          ...baseArrow,
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          borderRightColor: "#333",
        };
      default:
        return baseArrow;
    }
  };

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        position: "relative", 
        display: "inline-block",
        width: "fit-content",
        cursor: "help",
      }}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          style={getTooltipStyles()}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseLeave={(e) => e.stopPropagation()}
        >
          {content}
          <div style={getArrowStyles()} />
        </div>
      )}
    </div>
  );
};

