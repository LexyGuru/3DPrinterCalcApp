import React from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";

interface Props {
  settings: Settings;
  theme: Theme;
  onClose: () => void;
}

interface VersionEntry {
  version: string;
  date: string;
  changes: string[];
}

const versionHistory: VersionEntry[] = [
  {
    version: "v0.2.55",
    date: "2025",
    changes: [
      "🖥️ Console/Log funkció - Új Console menüpont a hibakereséshez és logok megtekintéséhez",
      "🖥️ Console beállítás - Beállításokban lehet bekapcsolni a Console menüpont megjelenítését",
      "📊 Log gyűjtés - Automatikus rögzítés minden console.log, console.error, console.warn üzenetről",
      "📊 Globális hibák rögzítése - Automatikus rögzítés window error és unhandled promise rejection eseményekről",
      "🔍 Log szűrés - Szűrés szintenként (all, error, warn, info, log, debug)",
      "🔍 Log export - Logok exportálása JSON formátumban",
      "🧹 Log törlés - Logok törlése egy gombbal",
      "📜 Auto-scroll - Automatikus görgetés az új logokhoz",
      "💾 Teljes logolás - Minden kritikus művelet logolva (mentés, export, import, törlés, PDF export, frissítés letöltés)",
      "🔄 Frissítés gomb javítás - A letöltés gomb most Tauri shell plugin-t használ, megbízhatóan működik",
      "🔄 Frissítés logolás - Frissítés ellenőrzés és letöltés teljes logolása",
      "🐛 React render hiba javítás - Console logger aszinkron működés, hogy ne akadályozza a renderelést",
      "🔧 num-bigint-dig frissítés - v0.9.1-re frissítve (deprecation warning javítása)",
    ],
  },
  {
    version: "v0.2.0",
    date: "2025",
    changes: [
      "🎨 Téma rendszer - 6 modern téma (Light, Dark, Blue, Green, Purple, Orange)",
      "🎨 Téma választó - Beállításokban választható téma, azonnal érvénybe lép",
      "🎨 Teljes téma integráció - Minden komponens használja a témákat",
      "🎨 Dinamikus színek - Minden hard-coded szín lecserélve a téma színeire",
      "🎨 Responsive téma - Az árajánlatok és a Sidebar footer is használja a témákat",
      "💱 Dinamikus pénznem konverzió - Az árajánlatok most a jelenlegi beállítások pénznemében jelennek meg",
      "💱 Pénznem váltás - A beállításokban megváltoztatott pénznem azonnal érvénybe lép",
      "💱 PDF pénznem konverzió - A PDF export is a jelenlegi beállítások pénznemében készül",
      "💱 Filament ár konverzió - A filament árak is automatikusan konvertálva jelennek meg",
    ],
  },
  {
    version: "v0.1.85",
    date: "2025",
    changes: [
      "🎨 UI/UX Javítások - Duplikált ikonok eltávolítva, Export/Import szekciók 2 oszlopos layoutban",
      "💾 PDF mentésnél natív save dialog használata (Tauri dialog)",
      "📊 Toast értesítések PDF mentésnél (sikeres/hiba)",
      "🖼️ Alkalmazás ablakméret: 1280x720",
      "🐛 Bugfixek - PDF generálásban hiányzó információk hozzáadva",
      "📄 PDF Export javítások - Ügyfél kapcsolat, Profit számítás, Revenue külön sorban",
    ],
  },
  {
    version: "v0.1.56",
    date: "2025",
    changes: [
      "✨ Calculator layout javítások - Filament kártyák túlcsordulás javítva, responsive flexbox layout",
      "✨ Költség bontás responsive - Most dinamikusan reagál az ablakméret változására",
      "🐛 Bugfix - Filament hozzáadásakor nem csúszik ki a tartalom az ablakból",
    ],
  },
  {
    version: "v0.1.55",
    date: "2025",
    changes: [
      "✨ Megerősítő dialógusok - Törlés előtt megerősítés kérése",
      "✨ Toast értesítések - Sikeres műveletek után értesítések",
      "✨ Input validáció - Negatív számok eltiltása, maximum értékek beállítása",
      "✨ Loading states - Betöltési spinner az alkalmazás indításakor",
      "✨ Error Boundary - Alkalmazás szintű hibakezelés",
      "✨ Keresés és szűrés - Filamentek, nyomtatók és árajánlatok keresése",
      "✨ Duplikálás - Árajánlatok könnyű duplikálása",
      "✨ Collapsible formok - Filament és nyomtató hozzáadási formok összecsukhatóak",
      "✨ Árajánlat bővítések - Ügyfél név, elérhetőség és leírás mezők hozzáadása",
    ],
  },
];

export const VersionHistory: React.FC<Props> = ({ settings, theme, onClose }) => {
  const translations: Record<string, Record<string, string>> = {
    hu: {
      title: "Verzió előzmények",
      close: "Bezárás",
      version: "Verzió",
      date: "Dátum",
      changes: "Változások",
    },
    en: {
      title: "Version History",
      close: "Close",
      version: "Version",
      date: "Date",
      changes: "Changes",
    },
    de: {
      title: "Versionsverlauf",
      close: "Schließen",
      version: "Version",
      date: "Datum",
      changes: "Änderungen",
    },
  };

  const t = translations[settings.language] || translations.hu;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: theme.colors.surface,
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "800px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: theme.colors.text }}>
            📋 {t.title}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surface;
            }}
          >
            {t.close}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {versionHistory.map((entry) => (
            <div
              key={entry.version}
              style={{
                border: `1px solid ${theme.colors.border}`,
                borderRadius: "8px",
                padding: "20px",
                backgroundColor: theme.colors.surfaceHover,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.colors.primary }}>
                  {entry.version}
                </h3>
                <span style={{ fontSize: "14px", color: theme.colors.textSecondary }}>
                  {entry.date}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "20px", listStyle: "none" }}>
                {entry.changes.map((change, changeIndex) => (
                  <li
                    key={changeIndex}
                    style={{
                      marginBottom: "8px",
                      fontSize: "14px",
                      color: theme.colors.text,
                      lineHeight: "1.6"
                    }}
                  >
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

