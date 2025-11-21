import React from 'react';
import type { Theme } from '../utils/themes';

interface ProgressBarProps {
  progress: number; // 0-100
  theme: Theme;
  label?: string;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  animated?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  theme,
  label,
  showPercentage = true,
  size = 'medium',
  variant = 'primary',
  animated = true,
  style,
  className,
}) => {
  // Progress érték korlátozása 0-100 közé
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Méret alapú stílusok
  const sizeStyles = {
    small: {
      height: '6px',
      fontSize: '12px',
      padding: '4px 0',
    },
    medium: {
      height: '8px',
      fontSize: '14px',
      padding: '8px 0',
    },
    large: {
      height: '12px',
      fontSize: '16px',
      padding: '12px 0',
    },
  };

  // Variáns alapú színek
  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return theme.colors.success || '#10b981';
      case 'warning':
        // Warning nincs a Theme-ben, fix fallback színt használunk
        return '#f59e0b';
      case 'danger':
        return theme.colors.danger || '#ef4444';
      case 'primary':
      default:
        return theme.colors.primary || '#3b82f6';
    }
  };

  const variantColor = getVariantColor();
  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';

  // Progress bar háttér színe
  const trackColor = isGradientBg 
    ? 'rgba(0, 0, 0, 0.1)' 
    : theme.colors.border || 'rgba(0, 0, 0, 0.1)';

  // Progress bar kitöltés színe
  const fillColor = variantColor;

  // Szöveg színe
  const textColor = isGradientBg 
    ? '#1a202c' 
    : theme.colors.text || '#1a202c';

  const currentSize = sizeStyles[size];

  return (
    <div
      className={className}
      style={{
        width: '100%',
        ...currentSize,
        ...style,
      }}
    >
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            fontSize: currentSize.fontSize,
            color: textColor,
          }}
        >
          {label && (
            <span style={{ fontWeight: '500' }}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span style={{ 
              fontWeight: '600',
              color: isGradientBg ? '#1a202c' : theme.colors.textMuted || '#6b7280',
            }}>
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      
      <div
        style={{
          width: '100%',
          height: currentSize.height,
          backgroundColor: trackColor,
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: isNeon 
            ? `inset 0 0 10px ${theme.colors.shadow}` 
            : 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
            backgroundColor: fillColor,
            borderRadius: '9999px',
            transition: animated ? 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isNeon
              ? `0 0 10px ${variantColor}, 0 0 20px ${variantColor}40`
              : `0 1px 3px rgba(0, 0, 0, 0.2)`,
          }}
        >
          {/* Shimmer animáció animált progress bar esetén */}
          {animated && clampedProgress > 0 && clampedProgress < 100 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(
                  90deg,
                  transparent,
                  rgba(255, 255, 255, 0.3),
                  transparent
                )`,
                animation: 'shimmer 2s infinite',
              }}
            >
              <style>{`
                @keyframes shimmer {
                  0% {
                    transform: translateX(-100%);
                  }
                  100% {
                    transform: translateX(100%);
                  }
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

