import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from '../utils/themes';

interface TooltipState {
  content: string;
  position: { x: number; y: number };
  isVisible: boolean;
}

interface TooltipContextType {
  showTooltip: (content: string, x: number, y: number) => void;
  hideTooltip: () => void;
  tooltipState: TooltipState | null;
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const TooltipProvider: React.FC<{ children: ReactNode; theme?: Theme }> = ({ 
  children, 
  theme: initialTheme 
}) => {
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
  const [theme, setTheme] = useState<Theme | null>(initialTheme || null);

  const showTooltip = useCallback((content: string, x: number, y: number) => {
    setTooltipState({
      content,
      position: { x, y },
      isVisible: true,
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltipState((prev) => prev ? { ...prev, isVisible: false } : null);
    // Teljes eltávolítás kis késleltetéssel (animáció miatt)
    setTimeout(() => {
      setTooltipState(null);
    }, 200);
  }, []);

  return (
    <TooltipContext.Provider value={{ 
      showTooltip, 
      hideTooltip, 
      tooltipState, 
      theme, 
      setTheme 
    }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
};

