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
  const [isPositioned, setIsPositioned] = useState(false);
  const [actualPosition, setActualPosition] = useState<"top" | "bottom" | "left" | "right">(position);
  const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
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

  // Update tooltip position when visible
  useEffect(() => {
    if (!isVisible || !tooltipRef.current || !wrapperRef.current) {
      setIsPositioned(false);
      return;
    }

    const updatePosition = () => {
      const tooltip = tooltipRef.current;
      const wrapper = wrapperRef.current;
      if (!tooltip || !wrapper) {
        setIsPositioned(false);
        return;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 8;
      const gap = 8;

      // Számítsuk ki a pozíciókat
      const positions = {
        top: {
          top: wrapperRect.top - tooltipRect.height - gap,
          left: wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2,
          fits: wrapperRect.top - tooltipRect.height - gap >= padding,
        },
        bottom: {
          top: wrapperRect.bottom + gap,
          left: wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2,
          fits: wrapperRect.bottom + tooltipRect.height + gap <= viewportHeight - padding,
        },
        left: {
          top: wrapperRect.top + wrapperRect.height / 2 - tooltipRect.height / 2,
          left: wrapperRect.left - tooltipRect.width - gap,
          fits: wrapperRect.left - tooltipRect.width - gap >= padding,
        },
        right: {
          top: wrapperRect.top + wrapperRect.height / 2 - tooltipRect.height / 2,
          left: wrapperRect.right + gap,
          fits: wrapperRect.right + tooltipRect.width + gap <= viewportWidth - padding,
        },
      };

      // Válasszuk ki a legjobb pozíciót
      let selectedPos = position;
      if (!positions[position].fits) {
        // Ha a preferált pozíció nem fér el, keressük meg a legjobb alternatívát
        const alternatives: Array<"top" | "bottom" | "left" | "right"> = ["bottom", "top", "right", "left"];
        for (const altPos of alternatives) {
          if (altPos !== position && positions[altPos].fits) {
            selectedPos = altPos;
            break;
          }
        }
      }

      setActualPosition(selectedPos);
      const pos = positions[selectedPos];

      // Korrekciók, hogy ne lógjon ki
      let finalLeft = pos.left;
      let finalTop = pos.top;

      // Ha kilóg jobbról
      if (finalLeft + tooltipRect.width > viewportWidth - padding) {
        finalLeft = viewportWidth - tooltipRect.width - padding;
      }
      // Ha kilóg balról
      if (finalLeft < padding) {
        finalLeft = padding;
      }
      // Ha kilóg alulról
      if (finalTop + tooltipRect.height > viewportHeight - padding) {
        finalTop = viewportHeight - tooltipRect.height - padding;
      }
      // Ha kilóg felülről
      if (finalTop < padding) {
        finalTop = padding;
      }

      setTooltipStyles({
        position: "fixed",
        top: finalTop,
        left: finalLeft,
        transform: "none",
      });
      
      // Csak akkor jelöljük be, hogy pozícionálva van, amikor már kiszámoltuk
      setIsPositioned(true);
    };

    // Először láthatatlanul rendereljük, majd kiszámoljuk a pozíciót
    setIsPositioned(false);
    
    // Kis késleltetés, hogy a tooltip renderelődjön
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updatePosition();
      });
    });

    // Frissítés scroll és resize esetén
    const handleScroll = () => requestAnimationFrame(updatePosition);
    const handleResize = () => requestAnimationFrame(updatePosition);

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isVisible, position]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get tooltip base styles
  const getTooltipBaseStyles = (): React.CSSProperties => {
    if (!isVisible || !isPositioned) {
      return {
        position: "fixed",
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

    return {
      ...tooltipStyles,
      backgroundColor,
      color: textColor,
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      maxWidth: "300px",
      whiteSpace: "normal",
      wordWrap: "break-word",
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
  };

  // Get arrow styles based on actual position
  const getArrowStyles = (): React.CSSProperties => {
    if (!isVisible || !wrapperRef.current || !tooltipRef.current) {
      return { display: "none" };
    }

    const isGradientBg = theme && typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
    const isLight = theme && (theme.name === 'light' || theme.name === 'pastel');
    
    const arrowColor = theme
      ? (isGradientBg
          ? (isLight ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)')
          : theme.colors.surface || '#333')
      : '#333';

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const baseArrow: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      border: "6px solid transparent",
    };

    switch (actualPosition) {
      case "top":
        return {
          ...baseArrow,
          top: "100%",
          left: `${Math.max(12, Math.min(tooltipRect.width - 12, wrapperRect.left + wrapperRect.width / 2 - tooltipRect.left))}px`,
          transform: "translateX(-50%)",
          borderTopColor: arrowColor,
        };
      case "bottom":
        return {
          ...baseArrow,
          bottom: "100%",
          left: `${Math.max(12, Math.min(tooltipRect.width - 12, wrapperRect.left + wrapperRect.width / 2 - tooltipRect.left))}px`,
          transform: "translateX(-50%)",
          borderBottomColor: arrowColor,
        };
      case "left":
        return {
          ...baseArrow,
          left: "100%",
          top: `${Math.max(12, Math.min(tooltipRect.height - 12, wrapperRect.top + wrapperRect.height / 2 - tooltipRect.top))}px`,
          transform: "translateY(-50%)",
          borderLeftColor: arrowColor,
        };
      case "right":
        return {
          ...baseArrow,
          right: "100%",
          top: `${Math.max(12, Math.min(tooltipRect.height - 12, wrapperRect.top + wrapperRect.height / 2 - tooltipRect.top))}px`,
          transform: "translateY(-50%)",
          borderRightColor: arrowColor,
        };
      default:
        return { display: "none" };
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
          style={getTooltipBaseStyles()}
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

