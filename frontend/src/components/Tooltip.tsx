import React, { useState, useEffect, useRef } from "react";
import type { Theme } from "../utils/themes";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  theme?: Theme;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = "top",
  delay = 300,
  theme
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

    // Téma-aware színek
    const isGradientBg = theme && typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
    const isLight = theme && (theme.name === 'light' || theme.name === 'pastel');
    const isNeon = theme && (theme.name === 'neon' || theme.name === 'cyberpunk');
    
    const backgroundColor = theme 
      ? (isGradientBg 
          ? (isLight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)')
          : theme.colors.surface || '#333')
      : '#333';
    
    const textColor = theme
      ? (isGradientBg && !isLight
          ? theme.colors.text || '#1a1a1a'
          : isGradientBg && isLight
          ? '#fff'
          : theme.colors.text || '#fff')
      : '#fff';

    const borderColor = theme?.colors.border || 'transparent';
    const shadowColor = theme?.colors.shadow || 'rgba(0,0,0,0.2)';

    const baseStyles: React.CSSProperties = {
      position: "absolute",
      backgroundColor,
      color: textColor,
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      whiteSpace: "nowrap",
      zIndex: 10000,
      pointerEvents: "none",
      opacity: 1,
      transition: "opacity 0.2s ease-in-out",
      boxShadow: isNeon 
        ? `0 0 12px ${shadowColor}, 0 2px 8px ${shadowColor}`
        : `0 2px 8px ${shadowColor}`,
      visibility: "visible",
      border: borderColor !== 'transparent' ? `1px solid ${borderColor}` : 'none',
      backdropFilter: isGradientBg ? 'blur(8px)' : 'none',
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
    const isGradientBg = theme && typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
    const isLight = theme && (theme.name === 'light' || theme.name === 'pastel');
    
    const arrowColor = theme
      ? (isGradientBg
          ? (isLight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)')
          : theme.colors.surface || '#333')
      : '#333';

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
          borderTopColor: arrowColor,
        };
      case "bottom":
        return {
          ...baseArrow,
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          borderBottomColor: arrowColor,
        };
      case "left":
        return {
          ...baseArrow,
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          borderLeftColor: arrowColor,
        };
      case "right":
        return {
          ...baseArrow,
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          borderRightColor: arrowColor,
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

