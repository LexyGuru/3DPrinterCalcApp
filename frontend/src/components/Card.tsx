import React, { useState } from 'react';
import type { Theme } from '../utils/themes';

type ThemeStyles = ReturnType<typeof import('../utils/themes').getThemeStyles>;

interface CardProps {
  children: React.ReactNode;
  theme: Theme;
  themeStyles: ThemeStyles;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  theme,
  themeStyles,
  onClick,
  style = {},
  className = '',
  hoverable = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';

  // Base card styles
  const baseCardStyles: React.CSSProperties = {
    ...themeStyles.card,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick || hoverable ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
  };

  // Hover styles
  const hoverStyles: React.CSSProperties = hoverable && isHovered ? {
    ...themeStyles.cardHover,
    transform: 'translateY(-4px)',
    boxShadow: isNeon
      ? `0 8px 24px ${theme.colors.shadow}, 0 0 16px ${theme.colors.primary}40`
      : `0 8px 24px ${theme.colors.shadow}`,
  } : {};

  // Combined styles
  const cardStyles: React.CSSProperties = {
    ...baseCardStyles,
    ...hoverStyles,
    ...style,
  };

  // Hover glow effect for neon themes
  const glowEffect = isHovered && isNeon ? (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at center, ${theme.colors.primary}20 0%, transparent 70%)`,
        pointerEvents: 'none',
        opacity: 0.6,
        transition: 'opacity 0.3s ease',
      }}
    />
  ) : null;

  return (
    <div
      className={className}
      style={cardStyles}
      onMouseEnter={() => hoverable && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-pressed={onClick ? undefined : undefined}
    >
      {glowEffect}
      {children}
    </div>
  );
};

