import React, { useState, useEffect } from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { getThemeStyles } from "../utils/themes";
import { LoadingSpinner } from "./LoadingSpinner";
import { open } from "@tauri-apps/plugin-shell";

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
// Ingyenes fordító API-k (prioritás szerint)
// MyMemory API: ingyenes, nincs API kulcs szükséges, 10000 karakter/nap limit
// LibreTranslate: rate limiting van (10 kérés/perc)
const TRANSLATION_APIS = [
  {
    name: "MyMemory",
    url: "https://api.mymemory.translated.net/get",
    method: "GET", // GET request, nincs CORS probléma
    requiresKey: false
  },
  {
    name: "LibreTranslate",
    url: "https://libretranslate.com/translate",
    method: "POST",
    requiresKey: false
  }
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
const MIN_REQUEST_INTERVAL = 1000; // 1 másodperc (MyMemory API-nak nincs szigorú rate limit)
const MAX_RETRIES = 1; // Maximum 1 retry próbálkozás
let consecutiveErrors = 0; // Számláló a következő hibákhoz
const MAX_CONSECUTIVE_ERRORS = 5; // Ha 5 egymás utáni hiba van, ne próbáljuk meg fordítani (növelve, mert MyMemory jobban működik)

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fordító API használata (MyMemory vagy LibreTranslate) - rate limiting és cache kezeléssel
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

    // Nyelvkódok konverzió
    const langMap: Record<string, string> = {
      "hu": "hu",
      "en": "en",
      "de": "de"
    };

    const source = langMap[sourceLang] || "hu";
    const target = langMap[targetLang] || "en";

    // Próbáljuk meg az elérhető API-kat
    const api = TRANSLATION_APIS[retryIndex] || TRANSLATION_APIS[0];

    // Rate limiting: várunk, ha túl gyorsan küldenénk kérést
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: várakozás ${waitTime}ms`);
      await delay(waitTime);
    }
    lastRequestTime = Date.now();

    console.log(`🌐 Fordítás próbálkozás (${api.name}): ${source} -> ${target}`, { apiUrl: api.url, textLength: text.length });

    // MyMemory API (GET request)
    if (api.name === "MyMemory") {
      const myMemoryUrl = `${api.url}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
      const response = await fetch(myMemoryUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`MyMemory API hiba: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const translated = data.responseData?.translatedText || text;
      
      // Sikeres fordítás esetén nullázzuk a hibaszámlálót
      if (translated !== text) {
        consecutiveErrors = 0;
        const updatedCache = getTranslationCache();
        updatedCache.translations[cacheKey] = translated;
        saveTranslationCache(updatedCache);
        console.log(`✅ Fordítás sikeres (MyMemory): ${text.substring(0, 50)}... -> ${translated.substring(0, 50)}...`);
      } else {
        // Ha a fordítás nem sikerült (pl. rate limit), növeljük a hibaszámlálót
        consecutiveErrors++;
      }
      
      return translated;
    }

    // LibreTranslate API (POST request)
    const response = await fetch(api.url, {
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
      
      console.warn(`⚠️ ${api.name} API hiba (${api.url}):`, response.status, response.statusText, errorData);
      
      // 429 (Rate Limit) vagy 403 (Forbidden) esetén ne próbáljuk meg újra, csak használjuk az eredeti szöveget
      if (response.status === 429 || response.status === 403) {
        consecutiveErrors++;
        console.warn(`⚠️ Rate limit elérve (${response.status}), azonnal eredeti szöveget használunk (egymás utáni hibák: ${consecutiveErrors})`);
        return text; // Fallback: eredeti szöveg (NINCS VÁRAKOZÁS!)
      }
      
      // Egyéb hibák esetén is növeljük a számlálót
      consecutiveErrors++;
      
      // Ha túl sok hiba van, ne próbáljuk meg újra
      if (retryCount >= MAX_RETRIES || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.warn(`⚠️ Túl sok próbálkozás (retry: ${retryCount}, consecutive: ${consecutiveErrors}), használjuk az eredeti szöveget`);
        return text; // Fallback: eredeti szöveg
      }
      
      // Próbáljuk meg a következő API-t (ha van)
      if (retryIndex < TRANSLATION_APIS.length - 1) {
        console.log(`🔄 Próbálkozás következő API-val: ${TRANSLATION_APIS[retryIndex + 1].name}`);
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
      console.log(`✅ Fordítás sikeres (${api.name}): ${text.substring(0, 50)}... -> ${translated.substring(0, 50)}...`);
    }
    
    return translated;
  } catch (error) {
    consecutiveErrors++;
    const currentApi = TRANSLATION_APIS[retryIndex] || TRANSLATION_APIS[0];
    console.warn(`⚠️ Fordítás hiba (${currentApi.name}):`, error, `(egymás utáni hibák: ${consecutiveErrors})`);
    
    // Ha túl sok hiba van, ne próbáljuk meg újra
    if (retryCount >= MAX_RETRIES || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.warn(`⚠️ Túl sok próbálkozás (retry: ${retryCount}, consecutive: ${consecutiveErrors}), használjuk az eredeti szöveget`);
      return text; // Fallback: eredeti szöveg
    }
    
    // Próbáljuk meg a következő API-t (ha van)
    if (retryIndex < TRANSLATION_APIS.length - 1) {
      console.log(`🔄 Próbálkozás következő API-val: ${TRANSLATION_APIS[retryIndex + 1].name}`);
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
  const themeStyles = getThemeStyles(theme);

  useEffect(() => {
    const fetchVersionHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        setTranslating(false);
        
        console.log("📥 Verzió előzmények betöltése...", { isBeta, language: settings.language });
        
        // GitHub Releases API
        const url = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=50`;
        
        console.log("📡 GitHub API hívás...", { url });
        
        let response: Response;
        try {
          response = await fetch(url, {
            method: "GET",
            headers: {
              "Accept": "application/vnd.github.v3+json",
            },
          });
        } catch (fetchError) {
          console.error("❌ Fetch hiba:", fetchError);
          throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        }
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText);
          let errorData: any = {};
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            // Nem JSON válasz
          }
          
          console.error("❌ GitHub API hiba:", response.status, response.statusText, errorData);
          
          // Rate limit esetén speciális hibaüzenet
          if (response.status === 403 && errorData.message?.includes("rate limit")) {
            const rateLimitMessage = settings.language === "hu" 
              ? "GitHub API rate limit túllépve. Kérjük, próbálja meg később újra, vagy várjon néhány percet."
              : settings.language === "de"
              ? "GitHub API Rate-Limit überschritten. Bitte versuchen Sie es später erneut oder warten Sie einige Minuten."
              : "GitHub API rate limit exceeded. Please try again later or wait a few minutes.";
            throw new Error(rateLimitMessage);
          }
          
          throw new Error(`Failed to fetch releases: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : errorText ? ` - ${errorText}` : ""}`);
        }
        
        let releases: GitHubRelease[];
        try {
          releases = await response.json();
        } catch (parseError) {
          console.error("❌ JSON parse hiba:", parseError);
          throw new Error(`Failed to parse releases: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
        
        if (!Array.isArray(releases)) {
          console.error("❌ Érvénytelen válasz formátum:", releases);
          throw new Error("Invalid response format: expected array");
        }
        
        console.log(`✅ ${releases.length} release betöltve`);
        
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
            <div style={{ marginBottom: "12px" }}>
              <strong>{settings.language === "hu" ? "Hiba történt:" : settings.language === "de" ? "Fehler aufgetreten:" : "Error occurred:"}</strong>
            </div>
            <div style={{ marginBottom: "16px", fontSize: "14px" }}>
              {error}
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Újra próbálkozás
                  const fetchVersionHistory = async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    setTranslating(false);
                    
                    console.log("📥 Verzió előzmények újratöltése...", { isBeta, language: settings.language });
                    
                    const url = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=50`;
                    console.log("📡 GitHub API hívás...", { url });
                    
                    let response: Response;
                    try {
                      response = await fetch(url, {
                        method: "GET",
                        headers: {
                          "Accept": "application/vnd.github.v3+json",
                        },
                      });
                    } catch (fetchError) {
                      console.error("❌ Fetch hiba:", fetchError);
                      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
                    }
                    
                    if (!response.ok) {
                      const errorText = await response.text().catch(() => response.statusText);
                      let errorData: any = {};
                      try {
                        errorData = JSON.parse(errorText);
                      } catch (e) {
                        // Nem JSON válasz
                      }
                      
                      console.error("❌ GitHub API hiba:", response.status, response.statusText, errorData);
                      
                      if (response.status === 403 && errorData.message?.includes("rate limit")) {
                        const rateLimitMessage = settings.language === "hu" 
                          ? "GitHub API rate limit túllépve. Kérjük, próbálja meg később újra, vagy várjon néhány percet."
                          : settings.language === "de"
                          ? "GitHub API Rate-Limit überschritten. Bitte versuchen Sie es später erneut oder warten Sie einige Minuten."
                          : "GitHub API rate limit exceeded. Please try again later or wait a few minutes.";
                        throw new Error(rateLimitMessage);
                      }
                      
                      throw new Error(`Failed to fetch releases: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : errorText ? ` - ${errorText}` : ""}`);
                    }
                    
                    let releases: GitHubRelease[];
                    try {
                      releases = await response.json();
                    } catch (parseError) {
                      console.error("❌ JSON parse hiba:", parseError);
                      throw new Error(`Failed to parse releases: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
                    }
                    
                    if (!Array.isArray(releases)) {
                      console.error("❌ Érvénytelen válasz formátum:", releases);
                      throw new Error("Invalid response format: expected array");
                    }
                    
                    console.log(`✅ ${releases.length} release betöltve`);
                    
                    const filteredReleases = isBeta
                      ? releases.filter(r => r.prerelease === true)
                      : releases.filter(r => r.prerelease === false);
                    
                    filteredReleases.sort((a, b) => {
                      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
                    });
                    
                    console.log(`📊 ${filteredReleases.length} release találat`, { isBeta });
                    
                    setTranslating(settings.language !== "hu");
                    
                    const history: VersionEntry[] = [];
                    for (const release of filteredReleases) {
                      const changes = parseReleaseBody(release.body);
                      const date = new Date(release.published_at).toLocaleDateString(
                        settings.language === "hu" ? "hu-HU" : 
                        settings.language === "de" ? "de-DE" : 
                        "en-US"
                      );
                      
                      let translatedChanges: string[] = [];
                      if (changes.length > 0) {
                        if (settings.language !== "hu") {
                          console.log(`🌐 Fordítás indítása: ${changes.length} változás`, { version: release.tag_name, targetLang: settings.language });
                          try {
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
                            translatedChanges = changes;
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
              }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonPrimary,
                  padding: "8px 16px",
                  fontSize: "14px"
                }}
              >
                {settings.language === "hu" ? "🔄 Újra próbálkozás" : settings.language === "de" ? "🔄 Erneut versuchen" : "🔄 Retry"}
              </button>
              <button
                onClick={async () => {
                  try {
                    const releasesUrl = `https://github.com/${GITHUB_REPO}/releases${isBeta ? "?prerelease=1" : ""}`;
                    console.log("🌐 GitHub releases oldal megnyitása...", { url: releasesUrl });
                    await open(releasesUrl);
                    console.log("✅ GitHub releases oldal sikeresen megnyitva");
                  } catch (error) {
                    console.error("❌ GitHub releases oldal megnyitása hiba:", error);
                    // Fallback: window.open
                    try {
                      const releasesUrl = `https://github.com/${GITHUB_REPO}/releases${isBeta ? "?prerelease=1" : ""}`;
                      window.open(releasesUrl, '_blank', 'noopener,noreferrer');
                    } catch (fallbackError) {
                      console.error("❌ Fallback hiba is:", fallbackError);
                    }
                  }
                }}
                style={{
                  ...themeStyles.button,
                  ...themeStyles.buttonSecondary,
                  padding: "8px 16px",
                  fontSize: "14px"
                }}
              >
                {settings.language === "hu" ? "🌐 GitHub oldal megnyitása" : settings.language === "de" ? "🌐 GitHub-Seite öffnen" : "🌐 Open GitHub page"}
              </button>
            </div>
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

