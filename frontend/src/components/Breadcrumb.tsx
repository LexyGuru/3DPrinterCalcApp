import React from 'react';
import type { Theme } from '../utils/themes';
import type { Settings } from '../types';
import { useTranslation } from '../utils/translations';

interface BreadcrumbItem {
  key: string;
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  theme: Theme;
  themeStyles: ReturnType<typeof import('../utils/themes').getThemeStyles>;
  settings: Settings;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  theme,
  settings,
}) => {
  const t = useTranslation(settings.language);
  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');

  if (items.length === 0) {
    return null;
  }

  // Ha csak egy elem van, ne mutassuk a breadcrumb-ot
  if (items.length === 1) {
    return null;
  }

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: isGradientBg ? '#1a202c' : theme.colors.textMuted || theme.colors.text,
      }}
      aria-label={t('breadcrumb.label') || 'Breadcrumb navigation'}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isClickable = !isLast && item.onClick;

        return (
          <React.Fragment key={item.key}>
            {index > 0 && (
              <span
                style={{
                  color: isGradientBg ? '#9ca3af' : theme.colors.textMuted || '#9ca3af',
                  margin: '0 4px',
                  userSelect: 'none',
                }}
                aria-hidden="true"
              >
                /
              </span>
            )}
            {isClickable ? (
              <button
                onClick={item.onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme.colors.primary;
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = isGradientBg ? '#1a202c' : theme.colors.textMuted || theme.colors.text;
                  e.currentTarget.style.textDecoration = 'none';
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  cursor: 'pointer',
                  color: isGradientBg ? '#1a202c' : theme.colors.textMuted || theme.colors.text,
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                aria-label={`${t('breadcrumb.navigateTo') || 'Navigate to'} ${item.label}`}
              >
                {item.label}
              </button>
            ) : (
              <span
                style={{
                  color: isLast
                    ? (isGradientBg ? '#1a202c' : theme.colors.text || '#1a202c')
                    : (isGradientBg ? '#1a202c' : theme.colors.textMuted || '#6b7280'),
                  fontWeight: isLast ? '600' : '400',
                  fontSize: '14px',
                }}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

