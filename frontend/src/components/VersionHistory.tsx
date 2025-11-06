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
// Több LibreTranslate endpoint próbálása (CORS problémák miatt)
// Jelenleg csak a libretranslate.com működik, de rate limiting van (10 kérés/perc)
const LIBRETRANSLATE_APIS = [
  "https://libretranslate.com/translate" // Eredeti endpoint (egyelőre csak ez működik)
];

// Cache a fordított szövegekhez (localStorage)
const TRANSLATION_CACHE_KEY = "version_history_translations";
const CACHE_EXPIRY_DAYS = 7;

interface TranslationCache {
  translations: { [key: string]: string }; // key: "hu-en-text", value: translated text
  _timestamp: number;
}

function getTranslationCache(): TranslationCache {
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as TranslationCache;
      // Ellenőrizzük, hogy a cache még érvényes-e
      if (parsed._timestamp && Date.now() - parsed._timestamp < CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("⚠️ Cache olvasási hiba:", e);
  }
  return { translations: {}, _timestamp: Date.now() };
}

function saveTranslationCache(cache: TranslationCache) {
  try {
    cache._timestamp = Date.now();
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("⚠️ Cache mentési hiba:", e);
  }
}

function getCacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${sourceLang}-${targetLang}-${text.substring(0, 100)}`;
}

// Rate limiting kezelés
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 8000; // 8 másodperc (10 kérés/perc = 6 másodperc/kérés, +2 másodperc buffer)
const MAX_RETRIES = 1; // Maximum 1 retry próbálkozás (csökkentve, mert túl sok hiba van)
let consecutiveErrors = 0; // Számláló a következő hibákhoz
const MAX_CONSECUTIVE_ERRORS = 3; // Ha 3 egymás utáni hiba van, ne próbáljuk meg fordítani

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// LibreTranslate API használata fordításhoz (rate limiting és cache kezeléssel)
async function translateText(text: string, sourceLang: string, targetLang: string, retryIndex: number = 0, retryCount: number = 0): Promise<string> {
  try {
    // Ha a forrás és cél nyelv ugyanaz, ne fordítunk
    if (sourceLang === targetLang) {
      return text;
    }

    // Ha a szöveg túl rövid, ne fordítunk
    if (!text || text.trim().length < 3) {
      return text;
    }

    // Ha túl sok egymás utáni hiba volt, ne próbáljuk meg fordítani
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.warn(`⚠️ Túl sok egymás utáni hiba (${consecutiveErrors}), használjuk az eredeti szöveget`);
      return text; // Fallback: eredeti szöveg
    }

    // Cache ellenőrzés
    const cache = getTranslationCache();
    const cacheKey = getCacheKey(text, sourceLang, targetLang);
    if (cache.translations[cacheKey]) {
      console.log(`💾 Cache találat: ${text.substring(0, 50)}...`);
      return cache.translations[cacheKey];
    }

    // LibreTranslate nyelvkódok
    const langMap: Record<string, string> = {
      "hu": "hu",
      "en": "en",
      "de": "de"
    };

    const source = langMap[sourceLang] || "hu";
    const target = langMap[targetLang] || "en";

    // Próbáljuk meg az elérhető API-kat
    const apiUrl = LIBRETRANSLATE_APIS[retryIndex] || LIBRETRANSLATE_APIS[0];

    // Rate limiting: várunk, ha túl gyorsan küldenénk kérést
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: várakozás ${waitTime}ms`);
      await delay(waitTime);
    }
    lastRequestTime = Date.now();

    console.log(`🌐 Fordítás próbálkozás: ${source} -> ${target}`, { apiUrl, textLength: text.length });

    const response = await fetch(apiUrl, {
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
      const errorText = await response.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        // Nem JSON válasz
      }
      
      console.warn(`⚠️ LibreTranslate API hiba (${apiUrl}):`, response.status, response.statusText, errorData);
      
      // 429 (Rate Limit) vagy 403 (Forbidden) esetén ne próbáljuk meg újra, csak használjuk az eredeti szöveget
      if (response.status === 429 || response.status === 403) {
        consecutiveErrors++;
        console.warn(`⚠️ Rate limit elérve (${response.status}), használjuk az eredeti szöveget (egymás utáni hibák: ${consecutiveErrors})`);
        return text; // Fallback: eredeti szöveg
      }
      
      // Egyéb hibák esetén is növeljük a számlálót
      consecutiveErrors++;
      
      // Ha túl sok hiba van, ne próbáljuk meg újra
      if (retryCount >= MAX_RETRIES || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.warn(`⚠️ Túl sok próbálkozás (retry: ${retryCount}, consecutive: ${consecutiveErrors}), használjuk az eredeti szöveget`);
        return text; // Fallback: eredeti szöveg
      }
      
      // Próbáljuk meg a következő API-t (ha van)
      if (retryIndex < LIBRETRANSLATE_APIS.length - 1) {
        console.log(`🔄 Próbálkozás következő API-val: ${retryIndex + 1}`);
        return translateText(text, sourceLang, targetLang, retryIndex + 1, 0);
      }
      
      return text; // Fallback: eredeti szöveg
    }

    const data = await response.json();
    const translated = data.translatedText || text;
    
    // Sikeres fordítás esetén nullázzuk a hibaszámlálót
    if (translated !== text) {
      consecutiveErrors = 0; // Sikeres fordítás, nullázzuk a hibaszámlálót
      const updatedCache = getTranslationCache();
      updatedCache.translations[cacheKey] = translated;
      saveTranslationCache(updatedCache);
      console.log(`✅ Fordítás sikeres: ${text.substring(0, 50)}... -> ${translated.substring(0, 50)}...`);
    }
    
    return translated;
  } catch (error) {
    consecutiveErrors++;
    console.warn(`⚠️ Fordítás hiba (${LIBRETRANSLATE_APIS[retryIndex] || LIBRETRANSLATE_APIS[0]}):`, error, `(egymás utáni hibák: ${consecutiveErrors})`);
    
    // Ha túl sok hiba van, ne próbáljuk meg újra
    if (retryCount >= MAX_RETRIES || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.warn(`⚠️ Túl sok próbálkozás (retry: ${retryCount}, consecutive: ${consecutiveErrors}), használjuk az eredeti szöveget`);
      return text; // Fallback: eredeti szöveg
    }
    
    // Próbáljuk meg a következő API-t (ha van)
    if (retryIndex < LIBRETRANSLATE_APIS.length - 1) {
      console.log(`🔄 Próbálkozás következő API-val: ${retryIndex + 1}`);
      return translateText(text, sourceLang, targetLang, retryIndex + 1, 0);
    }
    
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
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const fetchVersionHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        setTranslating(false);
        
        console.log("📥 Verzió előzmények betöltése...", { isBeta, language: settings.language });
        
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
        
        console.log(`📊 ${filteredReleases.length} release találat`, { isBeta });
        
        // Konvertálás VersionEntry formátumba és fordítása
        setTranslating(settings.language !== "hu");
        
        // Sorban dolgozzuk fel a release-eket (nem párhuzamosan) a rate limiting miatt
        const history: VersionEntry[] = [];
        for (const release of filteredReleases) {
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
              console.log(`🌐 Fordítás indítása: ${changes.length} változás`, { version: release.tag_name, targetLang: settings.language });
              try {
                // Sorban fordítunk (nem párhuzamosan) a rate limiting miatt
                translatedChanges = [];
                for (let idx = 0; idx < changes.length; idx++) {
                  const change = changes[idx];
                  console.log(`  [${idx + 1}/${changes.length}] Fordítás: ${change.substring(0, 50)}...`);
                  const translated = await translateText(change, "hu", settings.language);
                  translatedChanges.push(translated);
                }
                console.log(`✅ Fordítás kész: ${release.tag_name}`);
              } catch (translateError) {
                console.error(`❌ Fordítás hiba (${release.tag_name}):`, translateError);
                translatedChanges = changes; // Fallback: eredeti szöveg
              }
            } else {
              translatedChanges = changes;
            }
          } else {
            translatedChanges = [settings.language === "hu" ? "Nincs változás leírás" : settings.language === "de" ? "Keine Änderungsbeschreibung" : "No changelog"];
          }
          
          history.push({
            version: release.tag_name,
            date: date,
            changes: translatedChanges
          });
        }
        
        setVersionHistory(history);
        setTranslating(false);
        console.log("✅ Verzió előzmények betöltve", { count: history.length });
      } catch (err) {
        console.error("❌ Verzió előzmények betöltése hiba:", err);
        setError(err instanceof Error ? err.message : String(err));
        setTranslating(false);
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
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px", flexDirection: "column", gap: "16px" }}>
            <LoadingSpinner message={
              translating 
                ? (settings.language === "hu" ? "Verzió előzmények betöltése és fordítása..." : 
                   settings.language === "de" ? "Versionsverlauf wird geladen und übersetzt..." : 
                   "Loading and translating version history...")
                : (settings.language === "hu" ? "Verzió előzmények betöltése..." : 
                   settings.language === "de" ? "Versionsverlauf wird geladen..." : 
                   "Loading version history...")
            } />
            {translating && (
              <p style={{ fontSize: "12px", color: theme.colors.textMuted, marginTop: "8px" }}>
                {settings.language === "hu" ? "Ez eltarthat egy ideig..." : 
                 settings.language === "de" ? "Dies kann einen Moment dauern..." : 
                 "This may take a moment..."}
              </p>
            )}
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

