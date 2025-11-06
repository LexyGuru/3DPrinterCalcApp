import React, { useState, useEffect } from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { LoadingSpinner } from "./LoadingSpinner";

interface Props {
  settings: Settings;
  theme: Theme;
  onClose: () => void;
  isBeta?: boolean;
}

interface VersionEntry {
  version: string;
  date: string;
  changes: string[];
}

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  body: string;
  prerelease: boolean;
}

const GITHUB_REPO = "LexyGuru/3DPrinterCalcApp";
const LIBRETRANSLATE_API = "https://libretranslate.com/translate"; // Ingyenes publikus API

// LibreTranslate API használata fordításhoz
async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  try {
    // Ha a forrás és cél nyelv ugyanaz, ne fordítunk
    if (sourceLang === targetLang) {
      return text;
    }

    // LibreTranslate nyelvkódok
    const langMap: Record<string, string> = {
      "hu": "hu",
      "en": "en",
      "de": "de"
    };

    const source = langMap[sourceLang] || "hu";
    const target = langMap[targetLang] || "en";

    const response = await fetch(LIBRETRANSLATE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: "text"
      })
    });

    if (!response.ok) {
      console.warn("⚠️ LibreTranslate API hiba:", response.statusText);
      return text; // Fallback: eredeti szöveg
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.warn("⚠️ Fordítás hiba:", error);
    return text; // Fallback: eredeti szöveg
  }
}

// Parse markdown release body-t változások listájává
function parseReleaseBody(body: string): string[] {
  if (!body) return [];
  
  // Távolítsuk el a markdown formázást és bontsuk sorokra
  const lines = body
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('##'));
  
  // Szűrjük ki az üres sorokat és a markdown list jelöléseket
  const changes = lines
    .filter(line => {
      // Távolítsuk el a markdown list jelöléseket (-, *, •, stb.)
      const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
      return cleaned.length > 0;
    })
    .map(line => {
      // Távolítsuk el a markdown formázást
      return line
        .replace(/^[-*•]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1') // Italic
        .replace(/`(.*?)`/g, '$1') // Code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
        .trim();
    })
    .filter(line => line.length > 0);
  
  return changes.length > 0 ? changes : [body]; // Ha nem sikerült parse-olni, használjuk az egész body-t
}

export const VersionHistory: React.FC<Props> = ({ settings, theme, onClose, isBeta = false }) => {
  const [versionHistory, setVersionHistory] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersionHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // GitHub Releases API
        const url = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=50`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch releases: ${response.statusText}`);
        }
        
        const releases: GitHubRelease[] = await response.json();
        
        // Szűrés: ha beta app, akkor csak pre-release-eket, ha release app, akkor csak non-pre-release-eket
        const filteredReleases = isBeta
          ? releases.filter(r => r.prerelease === true)
          : releases.filter(r => r.prerelease === false);
        
        // Rendezés dátum szerint (legújabb elöl)
        filteredReleases.sort((a, b) => {
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        });
        
        // Konvertálás VersionEntry formátumba és fordítása
        const historyPromises = filteredReleases.map(async (release) => {
          const changes = parseReleaseBody(release.body);
          const date = new Date(release.published_at).toLocaleDateString(
            settings.language === "hu" ? "hu-HU" : 
            settings.language === "de" ? "de-DE" : 
            "en-US"
          );
          
          // Feltételezzük, hogy a release notes magyarul vannak (source: "hu")
          // Fordítjuk a kiválasztott nyelvre
          let translatedChanges: string[] = [];
          if (changes.length > 0) {
            // Ha nem magyar a célnyelv, fordítunk
            if (settings.language !== "hu") {
              translatedChanges = await Promise.all(
                changes.map(change => translateText(change, "hu", settings.language))
              );
            } else {
              translatedChanges = changes;
            }
          } else {
            translatedChanges = [settings.language === "hu" ? "Nincs változás leírás" : settings.language === "de" ? "Keine Änderungsbeschreibung" : "No changelog"];
          }
          
          return {
            version: release.tag_name,
            date: date,
            changes: translatedChanges
          };
        });
        
        const history = await Promise.all(historyPromises);
        setVersionHistory(history);
      } catch (err) {
        console.error("❌ Verzió előzmények betöltése hiba:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersionHistory();
  }, [isBeta, settings.language]);
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
            📋 {t.title} {isBeta ? "(Beta)" : "(Release)"}
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

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
            <LoadingSpinner message={settings.language === "hu" ? "Verzió előzmények betöltése..." : settings.language === "de" ? "Versionsverlauf wird geladen..." : "Loading version history..."} />
          </div>
        ) : error ? (
          <div style={{ 
            padding: "20px", 
            backgroundColor: theme.colors.surfaceHover, 
            borderRadius: "8px", 
            border: `1px solid ${theme.colors.danger}`,
            color: theme.colors.danger
          }}>
            <strong>{settings.language === "hu" ? "Hiba történt:" : settings.language === "de" ? "Fehler aufgetreten:" : "Error occurred:"}</strong> {error}
          </div>
        ) : versionHistory.length === 0 ? (
          <div style={{ 
            padding: "20px", 
            textAlign: "center",
            color: theme.colors.textMuted
          }}>
            {settings.language === "hu" 
              ? "Nincsenek elérhető verzió előzmények" 
              : settings.language === "de" 
              ? "Keine Versionsverläufe verfügbar" 
              : "No version history available"}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

