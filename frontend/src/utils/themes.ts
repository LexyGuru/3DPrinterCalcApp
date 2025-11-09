// Téma rendszer - több modern dizájn
import type { ThemeName, CustomThemeDefinition, ThemeSettings } from "../types";
import { createEmptyCustomThemeDefinition } from "../types";
export type { ThemeName };

const CUSTOM_THEME_PREFIX = "custom:";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeHex = (value: string, fallback = "#000000"): string => {
  if (!value) return fallback;
  const raw = value.trim().replace("#", "");
  if (raw.length === 3) {
    const expanded = raw
      .split("")
      .map(char => char + char)
      .join("");
    return `#${expanded.toUpperCase()}`;
  }
  if (raw.length === 6) {
    return `#${raw.toUpperCase()}`;
  }
  return fallback;
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);
  const value = parseInt(normalized.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map(channel => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;

const adjustColor = (hex: string, factor: number) => {
  const { r, g, b } = hexToRgb(hex);
  const adjust = (channel: number) =>
    factor >= 0 ? channel + (255 - channel) * factor : channel * (1 + factor);
  return rgbToHex(adjust(r), adjust(g), adjust(b));
};

const getRelativeLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const normalize = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
  return clamp(lum, 0, 1);
};

const chooseContrastingText = (background: string) => {
  const luminance = getRelativeLuminance(background);
  return luminance > 0.55 ? "#141920" : "#F9FAFB";
};

const deriveMutedText = (textColor: string, isLight: boolean) =>
  isLight ? adjustColor(textColor, -0.45) : adjustColor(textColor, 0.4);

const deriveSecondaryText = (textColor: string, isLight: boolean) =>
  isLight ? adjustColor(textColor, -0.25) : adjustColor(textColor, 0.25);

const buildGradientString = (start: string, end: string, angle: number) =>
  `linear-gradient(${angle}deg, ${normalizeHex(start)} 0%, ${normalizeHex(end)} 100%)`;

export interface Theme {
  name: ThemeName;
  displayName: {
    hu: string;
    en: string;
    de: string;
  };
  colors: {
    // Háttérszínek
    background: string;
    surface: string;
    surfaceHover: string;
    
    // Szöveg színek
    text: string;
    textSecondary: string;
    textMuted: string;
    
    // Gombok
    primary: string;
    primaryHover: string;
    success: string;
    successHover: string;
    danger: string;
    dangerHover: string;
    secondary: string;
    secondaryHover: string;
    
    // Border és shadow
    border: string;
    borderLight: string;
    shadow: string;
    shadowHover: string;
    
    // Input
    inputBg: string;
    inputBorder: string;
    inputFocus: string;
    
    // Table
    tableHeaderBg: string;
    tableBorder: string;
    
    // Sidebar
    sidebarBg: string;
    sidebarText: string;
    sidebarActive: string;
    sidebarHover: string;
    
    // Gradient támogatás (opcionális)
    gradient?: string;
    gradientStart?: string;
    gradientEnd?: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    name: "light",
    displayName: {
      hu: "Világos",
      en: "Light",
      de: "Hell"
    },
    colors: {
      background: "#f5f5f5",
      surface: "#ffffff",
      surfaceHover: "#f0f0f0",
      text: "#1a1a1a",
      textSecondary: "#495057",
      textMuted: "#6c757d",
      primary: "#007bff",
      primaryHover: "#0056b3",
      success: "#28a745",
      successHover: "#1e7e34",
      danger: "#dc3545",
      dangerHover: "#c82333",
      secondary: "#6c757d",
      secondaryHover: "#5a6268",
      border: "#e0e0e0",
      borderLight: "#f0f0f0",
      shadow: "rgba(0,0,0,0.1)",
      shadowHover: "rgba(0,0,0,0.15)",
      inputBg: "#ffffff",
      inputBorder: "#e0e0e0",
      inputFocus: "#007bff",
      tableHeaderBg: "#f8f9fa",
      tableBorder: "#e0e0e0",
      sidebarBg: "#343a40",
      sidebarText: "#ffffff",
      sidebarActive: "#007bff",
      sidebarHover: "#495057",
    }
  },
  dark: {
    name: "dark",
    displayName: {
      hu: "Sötét",
      en: "Dark",
      de: "Dunkel"
    },
    colors: {
      background: "#1a1a1a",
      surface: "#2d2d2d",
      surfaceHover: "#3a3a3a",
      text: "#ffffff",
      textSecondary: "#e0e0e0",
      textMuted: "#b0b0b0",
      primary: "#4a9eff",
      primaryHover: "#2d7fff",
      success: "#48c774",
      successHover: "#3ab66d",
      danger: "#ff4757",
      dangerHover: "#ff3742",
      secondary: "#6c757d",
      secondaryHover: "#5a6268",
      border: "#404040",
      borderLight: "#4a4a4a",
      shadow: "rgba(0,0,0,0.5)",
      shadowHover: "rgba(0,0,0,0.7)",
      inputBg: "#2d2d2d",
      inputBorder: "#404040",
      inputFocus: "#4a9eff",
      tableHeaderBg: "#252525",
      tableBorder: "#404040",
      sidebarBg: "#0d0d0d",
      sidebarText: "#ffffff",
      sidebarActive: "#4a9eff",
      sidebarHover: "#2d2d2d",
    }
  },
  blue: {
    name: "blue",
    displayName: {
      hu: "Kék",
      en: "Blue",
      de: "Blau"
    },
    colors: {
      background: "#1a1f2e",
      surface: "#2d3548",
      surfaceHover: "#3a4258",
      text: "#ffffff",
      textSecondary: "#e0e8f0",
      textMuted: "#b0b8c8",
      primary: "#3498db",
      primaryHover: "#2980b9",
      success: "#2ecc71",
      successHover: "#27ae60",
      danger: "#e74c3c",
      dangerHover: "#c0392b",
      secondary: "#6c757d",
      secondaryHover: "#5a6268",
      border: "#404858",
      borderLight: "#4a5268",
      shadow: "rgba(0,0,0,0.5)",
      shadowHover: "rgba(0,0,0,0.7)",
      inputBg: "#2d3548",
      inputBorder: "#404858",
      inputFocus: "#3498db",
      tableHeaderBg: "#252d3e",
      tableBorder: "#404858",
      sidebarBg: "#0d1520",
      sidebarText: "#ffffff",
      sidebarActive: "#3498db",
      sidebarHover: "#2d3548",
    }
  },
  green: {
    name: "green",
    displayName: {
      hu: "Zöld",
      en: "Green",
      de: "Grün"
    },
    colors: {
      background: "#1a2e1a",
      surface: "#2d482d",
      surfaceHover: "#3a583a",
      text: "#ffffff",
      textSecondary: "#e0f0e0",
      textMuted: "#b0c8b0",
      primary: "#27ae60",
      primaryHover: "#229954",
      success: "#2ecc71",
      successHover: "#27ae60",
      danger: "#e74c3c",
      dangerHover: "#c0392b",
      secondary: "#6c757d",
      secondaryHover: "#5a6268",
      border: "#405840",
      borderLight: "#4a684a",
      shadow: "rgba(0,0,0,0.5)",
      shadowHover: "rgba(0,0,0,0.7)",
      inputBg: "#2d482d",
      inputBorder: "#405840",
      inputFocus: "#27ae60",
      tableHeaderBg: "#253e25",
      tableBorder: "#405840",
      sidebarBg: "#0d200d",
      sidebarText: "#ffffff",
      sidebarActive: "#27ae60",
      sidebarHover: "#2d482d",
    }
  },
  forest: {
    name: "forest",
    displayName: {
      hu: "Őserdő",
      en: "Forest",
      de: "Wald"
    },
    colors: {
      background: "#15261a",
      surface: "#203224",
      surfaceHover: "#2a3f2d",
      text: "#f5f7f2",
      textSecondary: "#cfe3d3",
      textMuted: "#9ab59e",
      primary: "#37b26c",
      primaryHover: "#2d9a5c",
      success: "#4ade80",
      successHover: "#32c266",
      danger: "#f87171",
      dangerHover: "#ef4444",
      secondary: "#6b8e63",
      secondaryHover: "#577552",
      border: "#2f4635",
      borderLight: "#3b5642",
      shadow: "rgba(0,0,0,0.45)",
      shadowHover: "rgba(0,0,0,0.6)",
      inputBg: "#203224",
      inputBorder: "#2f4635",
      inputFocus: "#37b26c",
      tableHeaderBg: "#1c2c20",
      tableBorder: "#2f4635",
      sidebarBg: "#101b13",
      sidebarText: "#d9fbe4",
      sidebarActive: "#37b26c",
      sidebarHover: "#233727",
      gradient: "linear-gradient(160deg, #1f8a4c 0%, #144d2d 100%)",
      gradientStart: "#1f8a4c",
      gradientEnd: "#144d2d",
    }
  },
  purple: {
    name: "purple",
    displayName: {
      hu: "Lila",
      en: "Purple",
      de: "Lila"
    },
    colors: {
      background: "#2e1a3e",
      surface: "#3d2d4d",
      surfaceHover: "#4a3a5d",
      text: "#ffffff",
      textSecondary: "#e8d0f0",
      textMuted: "#b8a0c8",
      primary: "#9b59b6",
      primaryHover: "#8e44ad",
      success: "#2ecc71",
      successHover: "#27ae60",
      danger: "#e74c3c",
      dangerHover: "#c0392b",
      secondary: "#6c757d",
      secondaryHover: "#5a6268",
      border: "#5a4a6a",
      borderLight: "#6a5a7a",
      shadow: "rgba(0,0,0,0.5)",
      shadowHover: "rgba(0,0,0,0.7)",
      inputBg: "#3d2d4d",
      inputBorder: "#5a4a6a",
      inputFocus: "#9b59b6",
      tableHeaderBg: "#352d45",
      tableBorder: "#5a4a6a",
      sidebarBg: "#0d0a15",
      sidebarText: "#ffffff",
      sidebarActive: "#9b59b6",
      sidebarHover: "#3d2d4d",
    }
  },
  orange: {
    name: "orange",
    displayName: {
      hu: "Narancs",
      en: "Orange",
      de: "Orange"
    },
    colors: {
      background: "#3e2e1a",
      surface: "#4d3d2d",
      surfaceHover: "#5d4a3a",
      text: "#ffffff",
      textSecondary: "#f0e8d0",
      textMuted: "#c8b8a0",
      primary: "#f39c12",
      primaryHover: "#e67e22",
      success: "#2ecc71",
      successHover: "#27ae60",
      danger: "#e74c3c",
      dangerHover: "#c0392b",
      secondary: "#6c757d",
      secondaryHover: "#5a6268",
      border: "#6a5a4a",
      borderLight: "#7a6a5a",
      shadow: "rgba(0,0,0,0.5)",
      shadowHover: "rgba(0,0,0,0.7)",
      inputBg: "#4d3d2d",
      inputBorder: "#6a5a4a",
      inputFocus: "#f39c12",
      tableHeaderBg: "#453d35",
      tableBorder: "#6a5a4a",
      sidebarBg: "#0d0a05",
      sidebarText: "#ffffff",
      sidebarActive: "#f39c12",
      sidebarHover: "#4d3d2d",
    }
  },
  pastel: {
    name: "pastel",
    displayName: {
      hu: "Pasztell",
      en: "Pastel",
      de: "Pastell"
    },
    colors: {
      background: "#fdf2f8",
      surface: "#ffffff",
      surfaceHover: "#fce7f3",
      text: "#3f3d56",
      textSecondary: "#5b5873",
      textMuted: "#8f8ba8",
      primary: "#ec4899",
      primaryHover: "#db2777",
      success: "#10b981",
      successHover: "#059669",
      danger: "#f97316",
      dangerHover: "#ea580c",
      secondary: "#a855f7",
      secondaryHover: "#9333ea",
      border: "#f9a8d4",
      borderLight: "#fce7f3",
      shadow: "rgba(236, 72, 153, 0.25)",
      shadowHover: "rgba(236, 72, 153, 0.35)",
      inputBg: "#ffffff",
      inputBorder: "#f9a8d4",
      inputFocus: "#ec4899",
      tableHeaderBg: "#fce7f3",
      tableBorder: "#f9a8d4",
      sidebarBg: "#db2777",
      sidebarText: "#fdf2f8",
      sidebarActive: "#fcd34d",
      sidebarHover: "rgba(255,255,255,0.2)",
      gradient: "linear-gradient(140deg, #f472b6 0%, #c084fc 40%, #38bdf8 100%)",
      gradientStart: "#f472b6",
      gradientEnd: "#38bdf8",
    }
  },
  charcoal: {
    name: "charcoal",
    displayName: {
      hu: "Szénfekete",
      en: "Charcoal",
      de: "Anthrazit"
    },
    colors: {
      background: "#111316",
      surface: "#1b1f24",
      surfaceHover: "#242830",
      text: "#f4f6fb",
      textSecondary: "#c8ccd6",
      textMuted: "#8f96a3",
      primary: "#5eead4",
      primaryHover: "#2dd4bf",
      success: "#4ade80",
      successHover: "#22c55e",
      danger: "#f87171",
      dangerHover: "#ef4444",
      secondary: "#64748b",
      secondaryHover: "#475569",
      border: "#2a3038",
      borderLight: "#343c46",
      shadow: "rgba(0,0,0,0.55)",
      shadowHover: "rgba(0,0,0,0.7)",
      inputBg: "#1b1f24",
      inputBorder: "#2a3038",
      inputFocus: "#5eead4",
      tableHeaderBg: "#161a1f",
      tableBorder: "#2a3038",
      sidebarBg: "#0b0d10",
      sidebarText: "#e2e8f0",
      sidebarActive: "#5eead4",
      sidebarHover: "#1f242b",
    }
  },
  midnight: {
    name: "midnight",
    displayName: {
      hu: "Éjfél",
      en: "Midnight",
      de: "Mitternacht"
    },
    colors: {
      background: "linear-gradient(160deg, #0f172a 0%, #111827 100%)",
      surface: "rgba(30, 41, 59, 0.92)",
      surfaceHover: "rgba(30, 41, 59, 0.98)",
      text: "#f8fafc",
      textSecondary: "#cbd5f5",
      textMuted: "#94a3b8",
      primary: "#38bdf8",
      primaryHover: "#0ea5e9",
      success: "#34d399",
      successHover: "#10b981",
      danger: "#f87171",
      dangerHover: "#ef4444",
      secondary: "#a855f7",
      secondaryHover: "#7c3aed",
      border: "rgba(148, 163, 184, 0.35)",
      borderLight: "rgba(148, 163, 184, 0.18)",
      shadow: "rgba(14, 165, 233, 0.25)",
      shadowHover: "rgba(14, 165, 233, 0.35)",
      inputBg: "rgba(30, 41, 59, 0.92)",
      inputBorder: "rgba(148, 163, 184, 0.35)",
      inputFocus: "#38bdf8",
      tableHeaderBg: "rgba(148, 163, 184, 0.08)",
      tableBorder: "rgba(148, 163, 184, 0.2)",
      sidebarBg: "linear-gradient(200deg, #0f172a 0%, #1d2534 100%)",
      sidebarText: "#f1f5f9",
      sidebarActive: "#fbbf24",
      sidebarHover: "rgba(241, 245, 249, 0.08)",
      gradient: "linear-gradient(200deg, #0f172a 0%, #1e293b 100%)",
      gradientStart: "#0f172a",
      gradientEnd: "#1e293b",
    }
  },
  gradient: {
    name: "gradient",
    displayName: {
      hu: "Gradiens",
      en: "Gradient",
      de: "Gradient"
    },
    colors: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      surface: "rgba(255, 255, 255, 0.95)",
      surfaceHover: "rgba(255, 255, 255, 0.98)",
      text: "#1a1a1a",
      textSecondary: "#4a5568",
      textMuted: "#718096",
      primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      primaryHover: "linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)",
      success: "#48bb78",
      successHover: "#38a169",
      danger: "#f56565",
      dangerHover: "#e53e3e",
      secondary: "#a0aec0",
      secondaryHover: "#718096",
      border: "rgba(102, 126, 234, 0.3)",
      borderLight: "rgba(102, 126, 234, 0.15)",
      shadow: "rgba(102, 126, 234, 0.3)",
      shadowHover: "rgba(102, 126, 234, 0.4)",
      inputBg: "rgba(255, 255, 255, 0.9)",
      inputBorder: "rgba(102, 126, 234, 0.3)",
      inputFocus: "#667eea",
      tableHeaderBg: "rgba(102, 126, 234, 0.1)",
      tableBorder: "rgba(102, 126, 234, 0.2)",
      sidebarBg: "linear-gradient(180deg, #4c51bf 0%, #553c9a 100%)",
      sidebarText: "#ffffff",
      sidebarActive: "#fbbf24",
      sidebarHover: "rgba(255, 255, 255, 0.1)",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      gradientStart: "#667eea",
      gradientEnd: "#764ba2",
    }
  },
  neon: {
    name: "neon",
    displayName: {
      hu: "Neon",
      en: "Neon",
      de: "Neon"
    },
    colors: {
      background: "#0a0a0f",
      surface: "#1a1a2e",
      surfaceHover: "#1f1f3a",
      text: "#00ff88",
      textSecondary: "#00d4ff",
      textMuted: "#7c8ba1",
      primary: "#00ff88",
      primaryHover: "#00d470",
      success: "#00ff88",
      successHover: "#00d470",
      danger: "#ff006e",
      dangerHover: "#d4005a",
      secondary: "#8338ec",
      secondaryHover: "#6a2cc0",
      border: "rgba(0, 255, 136, 0.3)",
      borderLight: "rgba(0, 255, 136, 0.15)",
      shadow: "rgba(0, 255, 136, 0.4)",
      shadowHover: "rgba(0, 255, 136, 0.6)",
      inputBg: "#1a1a2e",
      inputBorder: "rgba(0, 255, 136, 0.3)",
      inputFocus: "#00ff88",
      tableHeaderBg: "#16213e",
      tableBorder: "rgba(0, 255, 136, 0.2)",
      sidebarBg: "#0f0f1e",
      sidebarText: "#00ff88",
      sidebarActive: "#00ff88",
      sidebarHover: "rgba(0, 255, 136, 0.1)",
      gradient: "linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)",
      gradientStart: "#00ff88",
      gradientEnd: "#00d4ff",
    }
  },
  cyberpunk: {
    name: "cyberpunk",
    displayName: {
      hu: "Cyberpunk",
      en: "Cyberpunk",
      de: "Cyberpunk"
    },
    colors: {
      background: "#0d0d0d",
      surface: "#1a1a1a",
      surfaceHover: "#252525",
      text: "#ff0080",
      textSecondary: "#00ffff",
      textMuted: "#808080",
      primary: "#ff0080",
      primaryHover: "#ff3399",
      success: "#00ff00",
      successHover: "#33ff33",
      danger: "#ff0000",
      dangerHover: "#ff3333",
      secondary: "#00ffff",
      secondaryHover: "#33ffff",
      border: "rgba(255, 0, 128, 0.4)",
      borderLight: "rgba(255, 0, 128, 0.2)",
      shadow: "rgba(255, 0, 128, 0.5)",
      shadowHover: "rgba(255, 0, 128, 0.7)",
      inputBg: "#1a1a1a",
      inputBorder: "rgba(255, 0, 128, 0.4)",
      inputFocus: "#ff0080",
      tableHeaderBg: "#0f0f0f",
      tableBorder: "rgba(255, 0, 128, 0.3)",
      sidebarBg: "#000000",
      sidebarText: "#ff0080",
      sidebarActive: "#00ffff",
      sidebarHover: "rgba(255, 0, 128, 0.1)",
      gradient: "linear-gradient(135deg, #ff0080 0%, #00ffff 100%)",
      gradientStart: "#ff0080",
      gradientEnd: "#00ffff",
    }
  },
  sunset: {
    name: "sunset",
    displayName: {
      hu: "Naplemente",
      en: "Sunset",
      de: "Sonnenuntergang"
    },
    colors: {
      background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)",
      surface: "rgba(255, 255, 255, 0.95)",
      surfaceHover: "rgba(255, 255, 255, 0.98)",
      text: "#2c2c54",
      textSecondary: "#40407a",
      textMuted: "#706fd3",
      primary: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
      primaryHover: "linear-gradient(135deg, #ee5a6f 0%, #e8b94a 100%)",
      success: "#48dbfb",
      successHover: "#2ed573",
      danger: "#ff6b6b",
      dangerHover: "#ee5a6f",
      secondary: "#a55eea",
      secondaryHover: "#8854d0",
      border: "rgba(255, 107, 107, 0.3)",
      borderLight: "rgba(255, 107, 107, 0.15)",
      shadow: "rgba(255, 107, 107, 0.3)",
      shadowHover: "rgba(255, 107, 107, 0.4)",
      inputBg: "rgba(255, 255, 255, 0.9)",
      inputBorder: "rgba(255, 107, 107, 0.3)",
      inputFocus: "#ff6b6b",
      tableHeaderBg: "rgba(255, 107, 107, 0.1)",
      tableBorder: "rgba(255, 107, 107, 0.2)",
      sidebarBg: "linear-gradient(180deg, #ff6b6b 0%, #feca57 100%)",
      sidebarText: "#ffffff",
      sidebarActive: "#48dbfb",
      sidebarHover: "rgba(255, 255, 255, 0.1)",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)",
      gradientStart: "#ff6b6b",
      gradientEnd: "#48dbfb",
    }
  },
  ocean: {
    name: "ocean",
    displayName: {
      hu: "Óceán",
      en: "Ocean",
      de: "Ozean"
    },
    colors: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      surface: "rgba(255, 255, 255, 0.95)",
      surfaceHover: "rgba(255, 255, 255, 0.98)",
      text: "#1a202c",
      textSecondary: "#2d3748",
      textMuted: "#4a5568",
      primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      primaryHover: "linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)",
      success: "#48bb78",
      successHover: "#38a169",
      danger: "#f56565",
      dangerHover: "#e53e3e",
      secondary: "#4299e1",
      secondaryHover: "#3182ce",
      border: "rgba(102, 126, 234, 0.3)",
      borderLight: "rgba(102, 126, 234, 0.15)",
      shadow: "rgba(102, 126, 234, 0.3)",
      shadowHover: "rgba(102, 126, 234, 0.4)",
      inputBg: "rgba(255, 255, 255, 0.9)",
      inputBorder: "rgba(102, 126, 234, 0.3)",
      inputFocus: "#667eea",
      tableHeaderBg: "rgba(102, 126, 234, 0.1)",
      tableBorder: "rgba(102, 126, 234, 0.2)",
      sidebarBg: "linear-gradient(180deg, #4299e1 0%, #667eea 100%)",
      sidebarText: "#ffffff",
      sidebarActive: "#fbbf24",
      sidebarHover: "rgba(255, 255, 255, 0.1)",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      gradientStart: "#667eea",
      gradientEnd: "#f093fb",
    }
  }
};

// Theme alapú stílusok generálása - Modernizált animációkkal
export const getThemeStyles = (theme: Theme) => {
  const hasGradient = theme.colors.gradient && theme.colors.background?.includes('gradient');
  const isGlassmorphism = theme.name === 'gradient' || theme.name === 'sunset' || theme.name === 'ocean';
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';
  const isGradientBackground = theme.colors.background?.includes('gradient');
  
  // Helper színek gradient témáknál
  // Fehér háttéren (kártyák, táblázatok) sötét szöveg, fő háttéren (pageTitle, pageSubtitle) fehér szöveg
  const textColor = isGradientBackground ? "#1a202c" : theme.colors.text; // Sötét szöveg fehér háttéren
  const textSecondaryColor = isGradientBackground ? "#4a5568" : theme.colors.textSecondary; // Sötétszürke szöveg
  const textMutedColor = isGradientBackground ? "#718096" : theme.colors.textMuted; // Halványabb szürke szöveg
  const textShadow = isGradientBackground ? "none" : "none"; // Nincs szöveg árnyék fehér háttéren
  
  // Fő háttérre (pageTitle, pageSubtitle) fehér szöveg
  const pageTextColor = isGradientBackground ? "#ffffff" : theme.colors.text;
  const pageTextMutedColor = isGradientBackground ? "rgba(255,255,255,0.9)" : theme.colors.textMuted;
  const pageTextShadow = isGradientBackground ? "0 1px 3px rgba(0,0,0,0.4)" : "none";

  return {
  card: {
    backgroundColor: isGradientBackground
      ? "rgba(255, 255, 255, 0.75)"
      : isGlassmorphism
      ? theme.colors.surface
      : theme.colors.surface,
    borderRadius: "16px",
    padding: "24px",
    boxShadow: isNeon
      ? `0 0 20px ${theme.colors.shadow}, 0 2px 8px ${theme.colors.shadow}`
      : `0 4px 16px ${theme.colors.shadow}`,
    border: isNeon
      ? `1px solid ${theme.colors.border}`
      : `1px solid ${theme.colors.border}`,
    backdropFilter: isGradientBackground
      ? "blur(12px)"
      : isGlassmorphism
      ? "blur(10px)"
      : "none",
    opacity: isGradientBackground ? 0.85 : 1,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative" as const,
    overflow: "hidden" as const,
    color: isGradientBackground ? "#1a202c" : textColor,
  },
  cardHover: {
    transform: "translateY(-4px) scale(1.01)",
    boxShadow: isNeon
      ? `0 0 30px ${theme.colors.shadowHover}, 0 8px 24px ${theme.colors.shadowHover}`
      : `0 8px 24px ${theme.colors.shadowHover}`,
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: isNeon 
      ? `2px solid ${theme.colors.inputBorder}`
      : `2px solid ${theme.colors.inputBorder}`,
    fontSize: "14px",
    color: isGradientBackground ? "#1a1a1a" : theme.colors.text,
    backgroundColor: isGlassmorphism ? theme.colors.inputBg : theme.colors.inputBg,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    backdropFilter: isGlassmorphism ? "blur(5px)" : "none",
  },
  inputFocus: {
    borderColor: theme.colors.inputFocus,
    boxShadow: isNeon
      ? `0 0 15px ${theme.colors.inputFocus}, 0 0 0 3px ${theme.colors.inputFocus}30`
      : `0 0 0 3px ${theme.colors.inputFocus}20`,
    transform: "scale(1.02)",
  },
  select: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: `2px solid ${theme.colors.inputBorder}`,
    fontSize: "14px",
    color: isGradientBackground ? "#1a1a1a" : theme.colors.text,
    backgroundColor: theme.colors.inputBg,
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  selectFocus: {
    borderColor: theme.colors.inputFocus,
    boxShadow: `0 0 0 3px ${theme.colors.inputFocus}20`,
  },
  button: {
    padding: "12px 24px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  buttonPrimary: {
    background: hasGradient && theme.colors.primary?.includes('gradient')
      ? theme.colors.primary
      : theme.colors.primary,
    color: "#fff",
    boxShadow: isNeon
      ? `0 0 20px ${theme.colors.shadow}, 0 4px 8px ${theme.colors.shadow}`
      : `0 4px 12px ${theme.colors.shadow}`,
  },
  buttonSuccess: {
    backgroundColor: theme.colors.success,
    color: "#fff",
    boxShadow: `0 2px 4px ${theme.colors.shadow}`,
  },
  buttonDanger: {
    backgroundColor: theme.colors.danger,
    color: "#fff",
    boxShadow: `0 2px 4px ${theme.colors.shadow}`,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
    color: "#fff",
    boxShadow: `0 2px 4px ${theme.colors.shadow}`,
  },
  buttonHover: {
    transform: "translateY(-2px) scale(1.05)",
    boxShadow: isNeon
      ? `0 0 30px ${theme.colors.shadowHover}, 0 8px 16px ${theme.colors.shadowHover}`
      : `0 8px 16px ${theme.colors.shadowHover}`,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    backgroundColor: isGradientBackground
      ? "rgba(255, 255, 255, 0.85)"
      : isGlassmorphism
      ? theme.colors.surface
      : theme.colors.surface,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: isNeon
      ? `0 0 20px ${theme.colors.shadow}, 0 4px 16px ${theme.colors.shadow}`
      : `0 4px 16px ${theme.colors.shadow}`,
    backdropFilter: isGradientBackground
      ? "blur(8px)"
      : isGlassmorphism
      ? "blur(10px)"
      : "none",
    opacity: isGradientBackground ? 0.85 : 1,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  tableHeader: {
    backgroundColor: isGradientBackground
      ? "rgba(255, 255, 255, 0.9)"
      : theme.colors.tableHeaderBg,
    padding: "16px",
    textAlign: "left" as const,
    fontWeight: "600",
    fontSize: "14px",
    color: isGradientBackground ? "#333" : theme.colors.text,
    borderBottom: `2px solid ${theme.colors.tableBorder}`,
    textShadow: isGradientBackground ? "none" : (isNeon ? textShadow : "none"),
    backdropFilter: isGradientBackground ? "blur(8px)" : "none",
  },
  tableCell: {
    padding: "16px",
    borderBottom: `1px solid ${theme.colors.tableBorder}`,
    fontSize: "14px",
    color: isGradientBackground ? "#333" : theme.colors.text,
    textShadow: isGradientBackground ? "none" : (isNeon ? textShadow : "none"),
    backgroundColor: isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent",
    backdropFilter: isGradientBackground ? "blur(8px)" : "none",
  },
  pageTitle: {
    margin: 0,
    marginBottom: "8px",
    fontSize: "36px",
    fontWeight: "700",
    color: pageTextColor, // Fehér szöveg fő háttéren
    textShadow: isGradientBackground
      ? "0 2px 8px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)"
      : "none",
    transition: "all 0.3s ease",
  },
  pageSubtitle: {
    margin: 0,
    marginBottom: "24px",
    color: pageTextMutedColor, // Fehér szöveg fő háttéren
    fontSize: "16px",
    textShadow: isGradientBackground ? pageTextShadow : "none",
    transition: "color 0.3s ease",
  },
  // Helper színek a komponensekhez
  textColor: textColor,
  textSecondaryColor: textSecondaryColor,
  textMutedColor: textMutedColor,
  textShadow: textShadow,
  // Új modernebb stílusok
  glassCard: {
    backgroundColor: isGlassmorphism ? "rgba(255, 255, 255, 0.1)" : theme.colors.surface,
    backdropFilter: isGlassmorphism ? "blur(20px)" : "none",
    borderRadius: "20px",
    border: isGlassmorphism ? `1px solid rgba(255, 255, 255, 0.2)` : `1px solid ${theme.colors.border}`,
    boxShadow: isGlassmorphism 
      ? `0 8px 32px rgba(0, 0, 0, 0.1)`
      : `0 4px 16px ${theme.colors.shadow}`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  neonGlow: isNeon ? {
    textShadow: `0 0 10px ${theme.colors.primary}, 0 0 20px ${theme.colors.primary}, 0 0 30px ${theme.colors.primary}`,
  } : {},
  gradientText: hasGradient && theme.colors.gradient ? {
    backgroundImage: theme.colors.gradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
  } : {},
  pulseAnimation: {
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  },
  };
};

export const DEFAULT_THEME_NAME: ThemeName = "light";

export const buildThemeFromDefinition = (definition: CustomThemeDefinition): Theme => {
  const {
    id,
    name,
    description,
    palette,
    gradient,
  } = definition;

  const backgroundBase = normalizeHex(palette.background, "#1f2933");
  const surfaceBase = normalizeHex(palette.surface, "#27323f");
  const primaryBase = normalizeHex(palette.primary, "#4f46e5");
  const secondaryBase = normalizeHex(palette.secondary, "#0ea5e9");
  const successBase = normalizeHex(palette.success, "#22c55e");
  const dangerBase = normalizeHex(palette.danger, "#ef4444");
  const textBase = normalizeHex(palette.text, "#f8fafc");
  const textMutedBase = normalizeHex(palette.textMuted, deriveMutedText(textBase, getRelativeLuminance(textBase) > 0.6));

  const textIsLight = getRelativeLuminance(textBase) > 0.6;
  const surfaceHover = adjustColor(surfaceBase, textIsLight ? -0.08 : 0.12);
  const border = adjustColor(surfaceBase, textIsLight ? -0.35 : -0.25);
  const borderLight = adjustColor(surfaceBase, textIsLight ? -0.2 : 0.35);
  const shadow = textIsLight ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.4)";
  const shadowHover = textIsLight ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.55)";

  const sidebarBg = adjustColor(backgroundBase, -0.35);
  const sidebarHover = adjustColor(sidebarBg, 0.12);
  const sidebarText = chooseContrastingText(sidebarBg);

  const gradientString = gradient
    ? buildGradientString(gradient.start, gradient.end, gradient.angle ?? 135)
    : undefined;

  const themeName: ThemeName = `${CUSTOM_THEME_PREFIX}${id}`;

  return {
    name: themeName,
    displayName: {
      hu: name,
      en: name,
      de: name,
    },
    colors: {
      background: gradientString ?? backgroundBase,
      surface: surfaceBase,
      surfaceHover,
      text: textBase,
      textSecondary: deriveSecondaryText(textBase, textIsLight),
      textMuted: textMutedBase,
      primary: primaryBase,
      primaryHover: adjustColor(primaryBase, -0.12),
      success: successBase,
      successHover: adjustColor(successBase, -0.12),
      danger: dangerBase,
      dangerHover: adjustColor(dangerBase, -0.12),
      secondary: secondaryBase,
      secondaryHover: adjustColor(secondaryBase, -0.1),
      border,
      borderLight,
      shadow,
      shadowHover,
      inputBg: surfaceBase,
      inputBorder: border,
      inputFocus: primaryBase,
      tableHeaderBg: adjustColor(surfaceBase, textIsLight ? -0.05 : 0.05),
      tableBorder: border,
      sidebarBg,
      sidebarText,
      sidebarActive: primaryBase,
      sidebarHover,
      gradient: gradientString,
      gradientStart: gradient ? normalizeHex(gradient.start) : undefined,
      gradientEnd: gradient ? normalizeHex(gradient.end) : undefined,
    },
  };
};

const pickHexOrFallback = (value: string | undefined, fallback: string) =>
  value && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim())
    ? normalizeHex(value)
    : normalizeHex(fallback);

export const themeToCustomDefinition = (
  theme: Theme,
  overrides?: Partial<Pick<CustomThemeDefinition, "name" | "description">> & { id?: string }
): CustomThemeDefinition => {
  const template = createEmptyCustomThemeDefinition();
  const backgroundFallback = typeof theme.colors.background === "string" && theme.colors.background.startsWith("#")
    ? theme.colors.background
    : theme.colors.gradientStart ?? template.palette.background;
  const definition: CustomThemeDefinition = {
    id: overrides?.id ?? template.id,
    name: overrides?.name ?? theme.displayName.en ?? theme.name,
    description: overrides?.description ?? theme.displayName.hu,
    palette: {
      background: pickHexOrFallback(backgroundFallback, template.palette.background),
      surface: pickHexOrFallback(
        typeof theme.colors.surface === "string" ? theme.colors.surface : template.palette.surface,
        template.palette.surface
      ),
      primary: pickHexOrFallback(
        typeof theme.colors.primary === "string" ? theme.colors.primary : template.palette.primary,
        template.palette.primary
      ),
      secondary: pickHexOrFallback(
        typeof theme.colors.secondary === "string" ? theme.colors.secondary : template.palette.secondary,
        template.palette.secondary
      ),
      success: pickHexOrFallback(
        typeof theme.colors.success === "string" ? theme.colors.success : template.palette.success,
        template.palette.success
      ),
      danger: pickHexOrFallback(
        typeof theme.colors.danger === "string" ? theme.colors.danger : template.palette.danger,
        template.palette.danger
      ),
      text: pickHexOrFallback(theme.colors.text, template.palette.text),
      textMuted: pickHexOrFallback(theme.colors.textMuted, template.palette.textMuted),
    },
    gradient:
      theme.colors.gradientStart && theme.colors.gradientEnd
        ? {
            start: normalizeHex(theme.colors.gradientStart),
            end: normalizeHex(theme.colors.gradientEnd),
            angle: 135,
          }
        : undefined,
  };
  return definition;
};

export const getCustomThemesRecord = (
  themeSettings?: ThemeSettings
): Record<ThemeName, Theme> => {
  if (!themeSettings?.customThemes?.length) {
    return {} as Record<ThemeName, Theme>;
  }
  const record: Record<ThemeName, Theme> = {} as Record<ThemeName, Theme>;
  themeSettings.customThemes.forEach(definition => {
    const theme = buildThemeFromDefinition(definition);
    record[theme.name] = theme;
  });
  return record;
};

export const getAllThemes = (themeSettings?: ThemeSettings): Record<ThemeName, Theme> => {
  return {
    ...themes,
    ...getCustomThemesRecord(themeSettings),
  };
};

export const resolveTheme = (
  themeName: ThemeName | undefined,
  themeSettings?: ThemeSettings
): Theme => {
  const allThemes = getAllThemes(themeSettings);
  const name = themeName && allThemes[themeName] ? themeName : DEFAULT_THEME_NAME;
  return allThemes[name] ?? themes[DEFAULT_THEME_NAME];
};

export const listAvailableThemes = (themeSettings?: ThemeSettings): Theme[] => {
  return Object.values(getAllThemes(themeSettings));
};

