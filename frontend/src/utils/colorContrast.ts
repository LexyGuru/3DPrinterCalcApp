/**
 * Színkontraszt utility WCAG AA/AAA ellenőrzéssel
 * 
 * WCAG követelmények:
 * - AA: 4.5:1 normál szöveghez, 3:1 nagy szöveghez (18pt+ vagy 14pt+ bold)
 * - AAA: 7:1 normál szöveghez, 4.5:1 nagy szöveghez
 */

export type WCAGLevel = 'AA' | 'AAA';
export type TextSize = 'normal' | 'large';

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
  level: WCAGLevel | null; // 'AA' | 'AAA' | null
}

/**
 * Hex szín normalizálása
 */
const normalizeHex = (hex: string): string => {
  if (!hex) return '#000000';
  const raw = hex.trim().replace('#', '');
  if (raw.length === 3) {
    return `#${raw.split('').map(c => c + c).join('').toUpperCase()}`;
  }
  if (raw.length === 6) {
    return `#${raw.toUpperCase()}`;
  }
  return '#000000';
};

/**
 * Hex szín RGB-re konvertálása
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const normalized = normalizeHex(hex);
  const value = parseInt(normalized.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

/**
 * RGB csatorna normalizálása (WCAG spec szerint)
 */
const normalizeChannel = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/**
 * Relatív luminance számítása (WCAG spec szerint)
 */
export const getRelativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = normalizeChannel(r);
  const gNorm = normalizeChannel(g);
  const bNorm = normalizeChannel(b);
  
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
};

/**
 * Kontraszt arány számítása két szín között
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * WCAG ellenőrzés
 */
export const checkWCAGContrast = (
  foreground: string,
  background: string,
  textSize: TextSize = 'normal'
): ContrastResult => {
  const ratio = getContrastRatio(foreground, background);
  
  // WCAG AA követelmények
  const aaNormal = 4.5;
  
  // WCAG AAA követelmények
  const aaaNormal = 7.0;
  const aaaLarge = 4.5;
  
  const passesAA = ratio >= aaNormal;
  const passesAAA = ratio >= aaaNormal;
  const passesAALarge = ratio >= aaaLarge;
  const passesAAALarge = ratio >= aaaLarge;
  
  let level: WCAGLevel | null = null;
  if (textSize === 'large') {
    if (passesAAALarge) level = 'AAA';
    else if (passesAALarge) level = 'AA';
  } else {
    if (passesAAA) level = 'AAA';
    else if (passesAA) level = 'AA';
  }
  
  return {
    ratio,
    passesAA,
    passesAAA,
    passesAALarge,
    passesAAALarge,
    level,
  };
};

/**
 * Szín világosítása/sötétítése kontraszt javításához
 */
const adjustColorBrightness = (hex: string, factor: number): string => {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (value: number) => Math.min(255, Math.max(0, value));
  
  const adjust = (channel: number) => {
    if (factor > 0) {
      // Világosítás
      return clamp(channel + (255 - channel) * factor);
    } else {
      // Sötétítés
      return clamp(channel * (1 + factor));
    }
  };
  
  const newR = Math.round(adjust(r));
  const newG = Math.round(adjust(g));
  const newB = Math.round(adjust(b));
  
  return `#${[newR, newG, newB]
    .map(channel => channel.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
};

/**
 * Automatikus szín javítás WCAG követelményekhez
 */
export const adjustColorForContrast = (
  foreground: string,
  background: string,
  targetLevel: WCAGLevel = 'AA',
  textSize: TextSize = 'normal'
): string => {
  const requiredRatio = textSize === 'large'
    ? (targetLevel === 'AAA' ? 4.5 : 3.0)
    : (targetLevel === 'AAA' ? 7.0 : 4.5);
  
  let adjusted = foreground;
  let attempts = 0;
  const maxAttempts = 50;
  
  while (attempts < maxAttempts) {
    const ratio = getContrastRatio(adjusted, background);
    
    if (ratio >= requiredRatio) {
      return adjusted;
    }
    
    // Döntés: világosítani vagy sötétíteni kell
    const fgLum = getRelativeLuminance(foreground);
    const bgLum = getRelativeLuminance(background);
    
    // Ha a háttér világosabb, akkor a szöveget sötétíteni kell
    // Ha a háttér sötétebb, akkor a szöveget világosítani kell
    const shouldDarken = bgLum > fgLum;
    const factor = shouldDarken ? -0.1 : 0.1;
    
    adjusted = adjustColorBrightness(adjusted, factor);
    attempts++;
  }
  
  // Ha nem sikerült, akkor extrém értéket adunk vissza
  const bgLum = getRelativeLuminance(background);
  return bgLum > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Színpár ellenőrzése és javítása
 */
export interface ColorPairResult {
  original: {
    foreground: string;
    background: string;
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
  };
  adjusted?: {
    foreground: string;
    background: string;
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
  };
  needsAdjustment: boolean;
}

export const checkAndFixColorPair = (
  foreground: string,
  background: string,
  targetLevel: WCAGLevel = 'AA',
  textSize: TextSize = 'normal',
  autoFix: boolean = false
): ColorPairResult => {
  const originalCheck = checkWCAGContrast(foreground, background, textSize);
  
  const result: ColorPairResult = {
    original: {
      foreground,
      background,
      ratio: originalCheck.ratio,
      passesAA: textSize === 'large' ? originalCheck.passesAALarge : originalCheck.passesAA,
      passesAAA: textSize === 'large' ? originalCheck.passesAAALarge : originalCheck.passesAAA,
    },
    needsAdjustment: !(textSize === 'large' 
      ? (targetLevel === 'AAA' ? originalCheck.passesAAALarge : originalCheck.passesAALarge)
      : (targetLevel === 'AAA' ? originalCheck.passesAAA : originalCheck.passesAA)),
  };
  
  if (result.needsAdjustment && autoFix) {
    const adjustedForeground = adjustColorForContrast(
      foreground,
      background,
      targetLevel,
      textSize
    );
    
    const adjustedCheck = checkWCAGContrast(adjustedForeground, background, textSize);
    
    result.adjusted = {
      foreground: adjustedForeground,
      background,
      ratio: adjustedCheck.ratio,
      passesAA: textSize === 'large' ? adjustedCheck.passesAALarge : adjustedCheck.passesAA,
      passesAAA: textSize === 'large' ? adjustedCheck.passesAAALarge : adjustedCheck.passesAAA,
    };
  }
  
  return result;
};

