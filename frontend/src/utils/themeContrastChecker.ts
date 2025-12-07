/**
 * Theme kontraszt ellenőrző
 * Ellenőrzi a témák színpárjait WCAG AA/AAA követelmények szerint
 */

import type { Theme } from './themes';
import {
  checkAndFixColorPair,
  type WCAGLevel,
  type TextSize,
} from './colorContrast';

export interface ThemeContrastReport {
  themeName: string;
  overallPassesAA: boolean;
  overallPassesAAA: boolean;
  issues: ContrastIssue[];
  warnings: ContrastWarning[];
}

export interface ContrastIssue {
  type: 'error' | 'warning';
  colorPair: {
    foreground: string;
    background: string;
    foregroundName: string;
    backgroundName: string;
  };
  ratio: number;
  requiredRatio: number;
  level: WCAGLevel;
  textSize: TextSize;
  suggestion?: string;
}

export interface ContrastWarning {
  message: string;
  colorPair: {
    foreground: string;
    background: string;
    foregroundName: string;
    backgroundName: string;
  };
}

/**
 * Fontos színpárok ellenőrzése egy témában
 */
const getCriticalColorPairs = (theme: Theme): Array<{
  foreground: string;
  background: string;
  foregroundName: string;
  backgroundName: string;
  textSize: TextSize;
  isCritical: boolean; // Kritikus = mindenképpen jó legyen
}> => {
  const pairs: Array<{
    foreground: string;
    background: string;
    foregroundName: string;
    backgroundName: string;
    textSize: TextSize;
    isCritical: boolean;
  }> = [];

  const { colors } = theme;

  // Kritikus párok (mindig ellenőrizendő)
  pairs.push(
    // Szöveg háttéren
    { foreground: colors.text, background: colors.background, foregroundName: 'text', backgroundName: 'background', textSize: 'normal', isCritical: true },
    { foreground: colors.text, background: colors.surface, foregroundName: 'text', backgroundName: 'surface', textSize: 'normal', isCritical: true },
    { foreground: colors.textSecondary, background: colors.background, foregroundName: 'textSecondary', backgroundName: 'background', textSize: 'normal', isCritical: true },
    { foreground: colors.textMuted, background: colors.background, foregroundName: 'textMuted', backgroundName: 'background', textSize: 'normal', isCritical: false },
    
    // Gombok
    { foreground: '#FFFFFF', background: colors.primary, foregroundName: 'white', backgroundName: 'primary', textSize: 'normal', isCritical: true },
    { foreground: '#FFFFFF', background: colors.success, foregroundName: 'white', backgroundName: 'success', textSize: 'normal', isCritical: true },
    { foreground: '#FFFFFF', background: colors.danger, foregroundName: 'white', backgroundName: 'danger', textSize: 'normal', isCritical: true },
    { foreground: colors.text, background: colors.secondary, foregroundName: 'text', backgroundName: 'secondary', textSize: 'normal', isCritical: true },
    
    // Input mezők
    { foreground: colors.text, background: colors.inputBg, foregroundName: 'text', backgroundName: 'inputBg', textSize: 'normal', isCritical: true },
    
    // Táblázat
    { foreground: colors.text, background: colors.tableHeaderBg, foregroundName: 'text', backgroundName: 'tableHeaderBg', textSize: 'normal', isCritical: true },
    
    // Sidebar
    { foreground: colors.sidebarText, background: colors.sidebarBg, foregroundName: 'sidebarText', backgroundName: 'sidebarBg', textSize: 'normal', isCritical: true },
    { foreground: colors.sidebarText, background: colors.sidebarActive, foregroundName: 'sidebarText', backgroundName: 'sidebarActive', textSize: 'normal', isCritical: true },
  );

  return pairs;
};

/**
 * Téma kontraszt ellenőrzése
 */
export const checkThemeContrast = (
  theme: Theme,
  targetLevel: WCAGLevel = 'AA',
  autoFix: boolean = false
): ThemeContrastReport => {
  const issues: ContrastIssue[] = [];
  const warnings: ContrastWarning[] = [];
  
  const criticalPairs = getCriticalColorPairs(theme);
  
  let passesAA = true;
  let passesAAA = true;
  
  for (const pair of criticalPairs) {
    const result = checkAndFixColorPair(
      pair.foreground,
      pair.background,
      targetLevel,
      pair.textSize,
      autoFix
    );
    
    const requiredRatio = pair.textSize === 'large'
      ? (targetLevel === 'AAA' ? 4.5 : 3.0)
      : (targetLevel === 'AAA' ? 7.0 : 4.5);
    
    const passes = pair.textSize === 'large'
      ? (targetLevel === 'AAA' ? result.original.passesAAA : result.original.passesAA)
      : (targetLevel === 'AAA' ? result.original.passesAAA : result.original.passesAA);
    
    if (!passes) {
      if (pair.isCritical) {
        passesAA = false;
        if (targetLevel === 'AAA') {
          passesAAA = false;
        }
      }
      
      issues.push({
        type: pair.isCritical ? 'error' : 'warning',
        colorPair: {
          foreground: pair.foreground,
          background: pair.background,
          foregroundName: pair.foregroundName,
          backgroundName: pair.backgroundName,
        },
        ratio: result.original.ratio,
        requiredRatio,
        level: targetLevel,
        textSize: pair.textSize,
        suggestion: result.adjusted
          ? `Javasolt szín: ${result.adjusted.foreground} (kontraszt: ${result.adjusted.ratio.toFixed(2)}:1)`
          : undefined,
      });
    } else if (result.original.ratio < requiredRatio * 1.1) {
      // Figyelmeztetés, ha csak éppen átmegy
      warnings.push({
        message: `Alacsony kontraszt: ${result.original.ratio.toFixed(2)}:1 (szükséges: ${requiredRatio}:1)`,
        colorPair: {
          foreground: pair.foreground,
          background: pair.background,
          foregroundName: pair.foregroundName,
          backgroundName: pair.backgroundName,
        },
      });
    }
  }
  
  return {
    themeName: theme.name,
    overallPassesAA: passesAA,
    overallPassesAAA: passesAAA,
    issues,
    warnings,
  };
};

/**
 * Összes téma ellenőrzése
 */
export const checkAllThemes = (
  themes: Record<string, Theme>,
  targetLevel: WCAGLevel = 'AA'
): Record<string, ThemeContrastReport> => {
  const reports: Record<string, ThemeContrastReport> = {};
  
  for (const [name, theme] of Object.entries(themes)) {
    reports[name] = checkThemeContrast(theme, targetLevel, false);
  }
  
  return reports;
};

/**
 * Téma javítása kontraszt problémák esetén
 */
export const fixThemeContrast = (
  theme: Theme,
  targetLevel: WCAGLevel = 'AA'
): Theme => {
  const report = checkThemeContrast(theme, targetLevel, true);
  
  if (report.issues.length === 0) {
    return theme;
  }
  
  // Javított téma létrehozása
  const fixedTheme: Theme = {
    ...theme,
    colors: { ...theme.colors },
  };
  
  // Színpárok javítása
  const criticalPairs = getCriticalColorPairs(theme);
  
  for (let i = 0; i < criticalPairs.length; i++) {
    const pair = criticalPairs[i];
    const issue = report.issues.find(
      issue => issue.colorPair.foregroundName === pair.foregroundName &&
               issue.colorPair.backgroundName === pair.backgroundName
    );
    
    if (issue && issue.suggestion) {
      // Szín javítása a témában
      const adjustedColor = issue.suggestion.match(/#[0-9A-F]{6}/i)?.[0];
      if (adjustedColor) {
        // Szín frissítése a témában
        const colorKey = pair.foregroundName as keyof typeof fixedTheme.colors;
        if (colorKey in fixedTheme.colors) {
          (fixedTheme.colors as any)[colorKey] = adjustedColor;
        }
      }
    }
  }
  
  return fixedTheme;
};

