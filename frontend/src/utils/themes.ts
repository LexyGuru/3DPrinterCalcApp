// Téma rendszer - több modern dizájn
import type { ThemeName } from "../types";
export type { ThemeName };

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

