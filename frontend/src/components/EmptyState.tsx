import React from 'react';
import type { Theme } from '../utils/themes';
import type { Settings } from '../types';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  theme: Theme;
  themeStyles: ReturnType<typeof import('../utils/themes').getThemeStyles>;
  settings: Settings;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📦',
  title,
  description,
  actionLabel,
  onAction,
  theme,
  themeStyles,
  settings: _settings,
}) => {
  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');

  return (
    <div
      style={{
        ...themeStyles.card,
        textAlign: 'center',
        padding: '60px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
      }}
    >
      <div
        style={{
          fontSize: '64px',
          marginBottom: '24px',
          lineHeight: 1,
        }}
      >
        {icon}
      </div>
      
      <h3
        style={{
          margin: 0,
          marginBottom: description ? '12px' : '24px',
          fontSize: '24px',
          fontWeight: '600',
          color: isGradientBg ? '#1a202c' : theme.colors.text,
        }}
      >
        {title}
      </h3>
      
      {description && (
        <p
          style={{
            margin: 0,
            marginBottom: actionLabel ? '24px' : 0,
            fontSize: '16px',
            color: isGradientBg ? '#4a5568' : theme.colors.textMuted,
            maxWidth: '500px',
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            ...themeStyles.button,
            ...themeStyles.buttonPrimary,
            marginTop: description ? '8px' : '16px',
            padding: '12px 24px',
            fontSize: '14px',
          }}
          onMouseEnter={(e) => {
            if (e.currentTarget) {
              Object.assign(e.currentTarget.style, themeStyles.buttonHover);
            }
          }}
          onMouseLeave={(e) => {
            if (e.currentTarget) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

