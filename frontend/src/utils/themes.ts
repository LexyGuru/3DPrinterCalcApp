// Téma rendszer - több modern dizájn

export type ThemeName = "light" | "dark" | "blue" | "green" | "purple" | "orange";

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
      background: "#ffffff",
      surface: "#ffffff",
      surfaceHover: "#f8f9fa",
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
      border: "#e9ecef",
      borderLight: "#f1f3f5",
      shadow: "rgba(0,0,0,0.1)",
      shadowHover: "rgba(0,0,0,0.15)",
      inputBg: "#ffffff",
      inputBorder: "#e9ecef",
      inputFocus: "#007bff",
      tableHeaderBg: "#f8f9fa",
      tableBorder: "#e9ecef",
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
      background: "#f0f4f8",
      surface: "#ffffff",
      surfaceHover: "#e8f0f7",
      text: "#1a1a1a",
      textSecondary: "#2c3e50",
      textMuted: "#5a6c7d",
      primary: "#3498db",
      primaryHover: "#2980b9",
      success: "#2ecc71",
      successHover: "#27ae60",
      danger: "#e74c3c",
      dangerHover: "#c0392b",
      secondary: "#95a5a6",
      secondaryHover: "#7f8c8d",
      border: "#bdc3c7",
      borderLight: "#ecf0f1",
      shadow: "rgba(52, 152, 219, 0.2)",
      shadowHover: "rgba(52, 152, 219, 0.3)",
      inputBg: "#ffffff",
      inputBorder: "#bdc3c7",
      inputFocus: "#3498db",
      tableHeaderBg: "#e8f0f7",
      tableBorder: "#bdc3c7",
      sidebarBg: "#2c3e50",
      sidebarText: "#ffffff",
      sidebarActive: "#3498db",
      sidebarHover: "#34495e",
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
      background: "#f5faf5",
      surface: "#ffffff",
      surfaceHover: "#f0f8f0",
      text: "#1a1a1a",
      textSecondary: "#2d5016",
      textMuted: "#5a7a3a",
      primary: "#27ae60",
      primaryHover: "#229954",
      success: "#2ecc71",
      successHover: "#27ae60",
      danger: "#e74c3c",
      dangerHover: "#c0392b",
      secondary: "#7f8c8d",
      secondaryHover: "#6c7a7b",
      border: "#b8d4b8",
      borderLight: "#e8f5e8",
      shadow: "rgba(39, 174, 96, 0.2)",
      shadowHover: "rgba(39, 174, 96, 0.3)",
      inputBg: "#ffffff",
      inputBorder: "#b8d4b8",
      inputFocus: "#27ae60",
      tableHeaderBg: "#f0f8f0",
      tableBorder: "#b8d4b8",
      sidebarBg: "#1e5f2e",
      sidebarText: "#ffffff",
      sidebarActive: "#27ae60",
      sidebarHover: "#2d5016",
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
      background: "#f8f5fa",
      surface: "#ffffff",
      surfaceHover: "#f3eef8",
      text: "#1a1a1a",
      textSecondary: "#4a2c5a",
      textMuted: "#6a4a7a",
      primary: "#9b59b6",
      primaryHover: "#8e44ad",
      success: "#2ecc71",
      successHover: "#27ae60",
      danger: "#e74c3c",
      dangerHover: "#c0392b",
      secondary: "#95a5a6",
      secondaryHover: "#7f8c8d",
      border: "#d4b8e0",
      borderLight: "#f0e8f5",
      shadow: "rgba(155, 89, 182, 0.2)",
      shadowHover: "rgba(155, 89, 182, 0.3)",
      inputBg: "#ffffff",
      inputBorder: "#d4b8e0",
      inputFocus: "#9b59b6",
      tableHeaderBg: "#f3eef8",
      tableBorder: "#d4b8e0",
      sidebarBg: "#4a2c5a",
      sidebarText: "#ffffff",
      sidebarActive: "#9b59b6",
      sidebarHover: "#5a3c6a",
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
      background: "#fff8f0",
      surface: "#ffffff",
      surfaceHover: "#fff0e0",
      text: "#1a1a1a",
      textSecondary: "#5a3a1a",
      textMuted: "#7a5a3a",
      primary: "#f39c12",
      primaryHover: "#e67e22",
      success: "#2ecc71",
      successHover: "#27ae60",
      danger: "#e74c3c",
      dangerHover: "#c0392b",
      secondary: "#95a5a6",
      secondaryHover: "#7f8c8d",
      border: "#e0c8a8",
      borderLight: "#f5e8d8",
      shadow: "rgba(243, 156, 18, 0.2)",
      shadowHover: "rgba(243, 156, 18, 0.3)",
      inputBg: "#ffffff",
      inputBorder: "#e0c8a8",
      inputFocus: "#f39c12",
      tableHeaderBg: "#fff0e0",
      tableBorder: "#e0c8a8",
      sidebarBg: "#5a3a1a",
      sidebarText: "#ffffff",
      sidebarActive: "#f39c12",
      sidebarHover: "#6a4a2a",
    }
  }
};

// Theme alapú stílusok generálása
export const getThemeStyles = (theme: Theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: "12px",
    padding: "24px",
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
    border: `1px solid ${theme.colors.border}`,
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: `0 4px 12px ${theme.colors.shadowHover}`,
  },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: `2px solid ${theme.colors.inputBorder}`,
    fontSize: "14px",
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBg,
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
  },
  inputFocus: {
    borderColor: theme.colors.inputFocus,
    boxShadow: `0 0 0 3px ${theme.colors.inputFocus}20`,
  },
  select: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: `2px solid ${theme.colors.inputBorder}`,
    fontSize: "14px",
    color: theme.colors.text,
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
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    outline: "none",
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    color: "#fff",
    boxShadow: `0 2px 4px ${theme.colors.shadow}`,
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
    transform: "translateY(-1px)",
    boxShadow: `0 4px 8px ${theme.colors.shadowHover}`,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    backgroundColor: theme.colors.surface,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
  },
  tableHeader: {
    backgroundColor: theme.colors.tableHeaderBg,
    padding: "16px",
    textAlign: "left" as const,
    fontWeight: "600",
    fontSize: "14px",
    color: theme.colors.text,
    borderBottom: `2px solid ${theme.colors.tableBorder}`,
  },
  tableCell: {
    padding: "16px",
    borderBottom: `1px solid ${theme.colors.tableBorder}`,
    fontSize: "14px",
    color: theme.colors.text,
  },
  pageTitle: {
    margin: 0,
    marginBottom: "8px",
    fontSize: "32px",
    fontWeight: "bold",
    color: theme.colors.text,
  },
  pageSubtitle: {
    margin: 0,
    marginBottom: "24px",
    color: theme.colors.textMuted,
    fontSize: "16px",
  },
});

