import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Theme } from '../utils/themes';
import type { Settings } from '../types';
import { useTranslation } from '../utils/translations';

interface SearchResult {
  id: string;
  type: 'page' | 'action';
  label: string;
  icon: string;
  description?: string;
  action: () => void;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof import('../utils/themes').getThemeStyles>;
  settings: Settings;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onNavigate,
  theme,
  themeStyles,
  settings,
}) => {
  const t = useTranslation(settings.language);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';

  // Fókusz az input mezőre amikor megnyílik
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keresési eredmények generálása
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    // Oldalak keresése
    const pages: Array<{ key: string; label: string; icon: string; description?: string }> = [
      { key: 'home', label: t('sidebar.home') || 'Home', icon: '🏠', description: t('globalSearch.page.home') || 'Főoldal' },
      { key: 'calculator', label: t('sidebar.calculator') || 'Calculator', icon: '🧮', description: t('globalSearch.page.calculator') || 'Kalkulátor' },
      { key: 'printers', label: t('sidebar.printers') || 'Printers', icon: '🖨️', description: t('globalSearch.page.printers') || 'Nyomtatók' },
      { key: 'filaments', label: t('sidebar.filaments') || 'Filaments', icon: '🧵', description: t('globalSearch.page.filaments') || 'Filamentek' },
      { key: 'customers', label: t('sidebar.customers') || 'Customers', icon: '👥', description: t('globalSearch.page.customers') || 'Ügyfelek' },
      { key: 'offers', label: t('sidebar.offers') || 'Offers', icon: '📋', description: t('globalSearch.page.offers') || 'Árajánlatok' },
      { key: 'priceTrends', label: t('sidebar.priceTrends') || 'Price Trends', icon: '📈', description: t('globalSearch.page.priceTrends') || 'Ár trendek' },
      { key: 'calendar', label: t('sidebar.calendar') || 'Calendar', icon: '📅', description: t('globalSearch.page.calendar') || 'Naptár' },
      { key: 'settings', label: t('sidebar.settings') || 'Settings', icon: '⚙️', description: t('globalSearch.page.settings') || 'Beállítások' },
    ];

    pages.forEach(page => {
      if (
        page.label.toLowerCase().includes(term) ||
        page.key.toLowerCase().includes(term) ||
        (page.description && page.description.toLowerCase().includes(term))
      ) {
        results.push({
          id: `page-${page.key}`,
          type: 'page',
          label: page.label,
          icon: page.icon,
          description: page.description,
          action: () => {
            onNavigate(page.key);
            onClose();
          },
        });
      }
    });

    // Gyors műveletek keresése
    const actions: Array<{ key: string; label: string; icon: string; description?: string; page: string }> = [
      { key: 'add-filament', label: t('header.quickActions.addFilament') || 'Új filament', icon: '➕', description: t('globalSearch.action.addFilament') || 'Filament hozzáadása', page: 'filaments' },
      { key: 'add-printer', label: t('header.quickActions.addPrinter') || 'Új nyomtató', icon: '🖨️', description: t('globalSearch.action.addPrinter') || 'Nyomtató hozzáadása', page: 'printers' },
      { key: 'add-customer', label: t('header.quickActions.addCustomer') || 'Új ügyfél', icon: '👥', description: t('globalSearch.action.addCustomer') || 'Ügyfél hozzáadása', page: 'customers' },
      { key: 'new-offer', label: t('header.quickActions.newOffer') || 'Új árajánlat', icon: '📋', description: t('globalSearch.action.newOffer') || 'Árajánlat létrehozása', page: 'calculator' },
    ];

    actions.forEach(action => {
      if (
        action.label.toLowerCase().includes(term) ||
        action.key.toLowerCase().includes(term) ||
        (action.description && action.description.toLowerCase().includes(term))
      ) {
        results.push({
          id: `action-${action.key}`,
          type: 'action',
          label: action.label,
          icon: action.icon,
          description: action.description,
          action: () => {
            onNavigate(action.page);
            onClose();
            // The page component will handle opening the form
          },
        });
      }
    });

    return results.slice(0, 10); // Maximum 10 eredmény
  }, [searchTerm, t, onNavigate, onClose]);

  // Billentyű kezelés
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && searchResults.length > 0) {
        e.preventDefault();
        searchResults[selectedIndex]?.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  // Reset selected index when search term changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '20vh',
          zIndex: 10000,
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            backgroundColor: isGradientBg
              ? 'rgba(255, 255, 255, 0.95)'
              : theme.colors.surface,
            borderRadius: '16px',
            padding: '0',
            width: 'min(600px, 90vw)',
            maxHeight: '70vh',
            boxShadow: isNeon
              ? `0 0 30px ${theme.colors.shadow}, 0 8px 32px rgba(0,0,0,0.4)`
              : `0 8px 32px rgba(0,0,0,0.3)`,
            color: isGradientBg ? '#1a202c' : theme.colors.text,
            overflow: 'hidden',
            backdropFilter: isGradientBg ? 'blur(12px)' : 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input mező */}
          <div style={{ padding: '16px', borderBottom: `1px solid ${theme.colors.border}` }}>
            <input
              ref={inputRef}
              type="text"
              placeholder={t('globalSearch.placeholder') || 'Keresés...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...themeStyles.input,
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                fontSize: '16px',
                padding: '10px 14px',
                border: `2px solid ${theme.colors.primary}`,
                borderRadius: '8px',
                backgroundColor: isGradientBg ? 'rgba(255, 255, 255, 0.9)' : theme.colors.inputBg,
                color: isGradientBg ? '#1a202c' : theme.colors.text,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.primary;
                e.target.style.boxShadow = `0 0 0 3px ${theme.colors.primary}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.primary;
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: isGradientBg ? '#6b7280' : theme.colors.textMuted,
              display: 'flex',
              gap: '16px',
            }}>
              <span>↑↓ Navigáció</span>
              <span>Enter Választás</span>
              <span>Esc Bezárás</span>
            </div>
          </div>

          {/* Eredmények */}
          <div style={{
            maxHeight: 'calc(70vh - 120px)',
            overflowY: 'auto',
            padding: '8px',
          }}>
            {searchResults.length === 0 && searchTerm.trim() ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: isGradientBg ? '#6b7280' : theme.colors.textMuted,
              }}>
                {t('globalSearch.noResults') || 'Nincs találat'}
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: isGradientBg ? '#6b7280' : theme.colors.textMuted,
              }}>
                {t('globalSearch.startTyping') || 'Kezdj el gépelni a kereséshez...'}
              </div>
            ) : (
              searchResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={result.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedIndex === index
                      ? (isGradientBg ? 'rgba(0, 0, 0, 0.05)' : theme.colors.surfaceHover)
                      : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'background-color 0.15s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{result.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '15px',
                      color: isGradientBg ? '#1a202c' : theme.colors.text,
                      marginBottom: '2px',
                    }}>
                      {result.label}
                    </div>
                    {result.description && (
                      <div style={{
                        fontSize: '12px',
                        color: isGradientBg ? '#6b7280' : theme.colors.textMuted,
                      }}>
                        {result.description}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: isGradientBg ? '#9ca3af' : theme.colors.textMuted,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: isGradientBg ? 'rgba(0, 0, 0, 0.05)' : theme.colors.surfaceHover,
                  }}>
                    {result.type === 'page' ? (t('globalSearch.type.page') || 'Oldal') : (t('globalSearch.type.action') || 'Művelet')}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

