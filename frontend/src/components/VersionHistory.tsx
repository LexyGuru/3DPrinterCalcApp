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
// MyMemory API: ingyenes, nincs API kulcs szükséges, 10000 karakter/nap limit
const TRANSLATION_API = {
  name: "MyMemory",
  url: "https://api.mymemory.translated.net/get",
  method: "GET", // GET request, nincs CORS probléma
  requiresKey: false
};

// Cache a fordított szövegekhez (localStorage)
const TRANSLATION_CACHE_KEY = "version_history_translations";
const VERSION_HISTORY_CACHE_KEY = "version_history_data";
const CACHE_EXPIRY_DAYS = 7;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 óra (ellenőrzési időköz a GitHub frissítés ellenőrzéshez)

interface TranslationCache {
  translations: { [key: string]: string }; // key: "hu-en-text", value: translated text
  _timestamp: number;
}

interface VersionHistoryCache {
  releases: GitHubRelease[];
  translatedVersions: Record<string, { // version => { language => translatedChanges[] }
    [language: string]: string[];
  }>;
  lastFetch: number;
  lastChecksum: string; // A releases listájának hash-e
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

// Verzió történet cache kezelés
function getVersionHistoryCache(): VersionHistoryCache | null {
  try {
    const cached = localStorage.getItem(VERSION_HISTORY_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as VersionHistoryCache;
      console.log("💾 Verzió történet cache betöltve", { 
        releases: parsed.releases?.length || 0, 
        translatedVersions: Object.keys(parsed.translatedVersions || {}).length,
        lastFetch: new Date(parsed.lastFetch).toLocaleString()
      });
      return parsed;
    }
  } catch (e) {
    console.warn("⚠️ Verzió történet cache olvasási hiba:", e);
  }
  return null;
}

function saveVersionHistoryCache(cache: VersionHistoryCache) {
  try {
    localStorage.setItem(VERSION_HISTORY_CACHE_KEY, JSON.stringify(cache));
    console.log("💾 Verzió történet cache mentve", { 
      releases: cache.releases.length, 
      translatedVersions: Object.keys(cache.translatedVersions).length,
      lastFetch: new Date(cache.lastFetch).toLocaleString()
    });
  } catch (e) {
    console.warn("⚠️ Verzió történet cache mentési hiba:", e);
  }
}

// Checksum generálása a releases listájából (egyszerű hash)
function generateChecksum(releases: GitHubRelease[]): string {
  const releaseIds = releases.map(r => `${r.tag_name}:${r.published_at}`).join('|');
  // Egyszerű hash (nem kriptográfiai)
  let hash = 0;
  for (let i = 0; i < releaseIds.length; i++) {
    const char = releaseIds.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Rate limiting kezelés
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 másodperc (MyMemory API-nak nincs szigorú rate limit)
const MAX_RETRIES = 2; // Maximum 2 retry próbálkozás
let consecutiveErrors = 0; // Számláló a következő hibákhoz
const MAX_CONSECUTIVE_ERRORS = 10; // Ha 10 egymás utáni hiba van, ne próbáljuk meg fordítani
let lastErrorResetTime = Date.now(); // Utolsó hiba reset ideje
const ERROR_RESET_INTERVAL = 5 * 60 * 1000; // 5 perc után nullázzuk a hibaszámlálót

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fordító API használata (MyMemory) - rate limiting és cache kezeléssel
async function translateText(text: string, sourceLang: string, targetLang: string, retryCount: number = 0): Promise<string> {
  try {
    // Ha a forrás és cél nyelv ugyanaz, ne fordítunk
    if (sourceLang === targetLang) {
      return text;
    }

    // Ha a szöveg túl rövid, ne fordítunk
    if (!text || text.trim().length < 3) {
      return text;
    }

    // Reseteljük a hibaszámlálót, ha elég idő telt el
    const currentTime = Date.now();
    if (currentTime - lastErrorResetTime > ERROR_RESET_INTERVAL) {
      console.log(`🔄 Hibaszámláló resetelése (${ERROR_RESET_INTERVAL / 1000 / 60} perc telt el)`);
      consecutiveErrors = 0;
      lastErrorResetTime = currentTime;
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
      const cachedTranslation = cache.translations[cacheKey];
      // Ha van cache, használjuk (még ha ugyanaz is, mert az azt jelenti, hogy már próbáltuk fordítani)
      console.log(`💾 Cache találat: ${text.substring(0, 50)}... -> ${cachedTranslation.substring(0, 50)}...`);
      return cachedTranslation;
    }

    // Nyelvkódok konverzió
    const langMap: Record<string, string> = {
      "hu": "hu",
      "en": "en",
      "de": "de"
    };

    const source = langMap[sourceLang] || "hu";
    const target = langMap[targetLang] || "en";

    // Rate limiting: várunk, ha túl gyorsan küldenénk kérést
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: várakozás ${waitTime}ms`);
      await delay(waitTime);
    }
    lastRequestTime = Date.now();

    console.log(`🌐 Fordítás próbálkozás (MyMemory): ${source} -> ${target}`, { textLength: text.length });

    // MyMemory API (GET request)
    const myMemoryUrl = `${TRANSLATION_API.url}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
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
    
    // Cache-eljük az eredményt (még ha nem változott is, hogy ne próbáljuk meg újra)
    const updatedCache = getTranslationCache();
    updatedCache.translations[cacheKey] = translated;
    saveTranslationCache(updatedCache);
    
    // Ha sikerült a fordítás (megváltozott a szöveg), nullázzuk a hibaszámlálót
    if (translated !== text && translated.trim() !== text.trim()) {
      consecutiveErrors = 0;
      lastErrorResetTime = Date.now(); // Frissítjük a reset időt
      console.log(`✅ Fordítás sikeres (MyMemory): ${text.substring(0, 50)}... -> ${translated.substring(0, 50)}...`);
      return translated;
    } else {
      // Ha a fordítás nem változtatta meg a szöveget, de nem volt hiba
      console.warn(`⚠️ MyMemory nem fordította le a szöveget (lehet, hogy ugyanaz), cache-eljük és használjuk az eredetit`);
      return text;
    }
  } catch (error) {
    consecutiveErrors++;
    console.warn(`⚠️ Fordítás hiba (MyMemory):`, error, `(egymás utáni hibák: ${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS})`);
    
    // Cache-eljük az eredeti szöveget hiba esetén is, hogy ne próbáljuk meg újra
    const updatedCache = getTranslationCache();
    const cacheKey = getCacheKey(text, sourceLang, targetLang);
    updatedCache.translations[cacheKey] = text; // Hiba esetén az eredeti szöveg cache-elése
    saveTranslationCache(updatedCache);
    
    // Ha túl sok hiba van, ne próbáljuk meg újra
    if (retryCount >= MAX_RETRIES || consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.warn(`⚠️ Túl sok próbálkozás (retry: ${retryCount}, consecutive: ${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}), cache-eljük és használjuk az eredeti szöveget`);
      return text; // Fallback: eredeti szöveg
    }
    
    // Próbáljuk meg újra
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Újrapróbálkozás... (${retryCount + 1}/${MAX_RETRIES})`);
      await delay(2000); // Várunk 2 másodpercet újrapróbálkozás előtt
      return translateText(text, sourceLang, targetLang, retryCount + 1);
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
  const [refetchTrigger, setRefetchTrigger] = useState(0); // Trigger a manual refetch
  const themeStyles = getThemeStyles(theme);

  useEffect(() => {
    const fetchVersionHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        setTranslating(false);
        
        console.log("📥 Verzió előzmények betöltése...", { isBeta, language: settings.language });
        
        // 1. Ellenőrizzük a cache-t
        const cachedData = getVersionHistoryCache();
        const timeNow = Date.now();
        
        // 2. Ha van cache és friss (1 órán belüli), használjuk anélkül, hogy letöltenénk a GitHubról
        if (cachedData && (timeNow - cachedData.lastFetch < CHECK_INTERVAL_MS)) {
          console.log("💾 Cache használata (friss, nincs GitHub ellenőrzés)", {
            cacheAge: Math.round((timeNow - cachedData.lastFetch) / 1000 / 60) + " perc",
            releases: cachedData.releases.length
          });
          
          // Szűrés és megjelenítés a cache-ből
          const filteredReleases = isBeta
            ? cachedData.releases.filter(r => r.prerelease === true)
            : cachedData.releases.filter(r => r.prerelease === false);
          
          filteredReleases.sort((a, b) => {
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
          });
          
          const history: VersionEntry[] = [];
          for (const release of filteredReleases) {
            const changes = parseReleaseBody(release.body);
            const date = new Date(release.published_at).toLocaleDateString(
              settings.language === "hu" ? "hu-HU" : 
              settings.language === "de" ? "de-DE" : 
              settings.language === "uk" ? "uk-UA" : 
              settings.language === "ru" ? "ru-RU" : 
              "en-US"
            );
            
            const versionKey = release.tag_name;
            const langKey = settings.language;
            const translatedChanges = cachedData.translatedVersions[versionKey]?.[langKey];
            
            if (translatedChanges && translatedChanges.length > 0) {
              console.log(`💾 Lefordított verzió használata (${versionKey} - ${langKey})`);
              history.push({
                version: release.tag_name,
                date: date,
                changes: translatedChanges
              });
            } else if (changes.length > 0 && settings.language !== "hu") {
              // Nincs még lefordítva erre a nyelvre, fordítsuk le és mentsük el
              console.log(`🌐 Fordítás szükséges (${versionKey} - ${langKey})`);
              setTranslating(true);
              const newTranslatedChanges: string[] = [];
              for (let idx = 0; idx < changes.length; idx++) {
                const translated = await translateText(changes[idx], "hu", settings.language);
                newTranslatedChanges.push(translated);
              }
              
              // Mentsük el a lefordított verziót
              if (!cachedData.translatedVersions[versionKey]) {
                cachedData.translatedVersions[versionKey] = {};
              }
              cachedData.translatedVersions[versionKey][langKey] = newTranslatedChanges;
              saveVersionHistoryCache(cachedData);
              
              history.push({
                version: release.tag_name,
                date: date,
                changes: newTranslatedChanges
              });
            } else {
              // Magyar vagy nincs változás
              const finalChanges = changes.length > 0 ? changes : [settings.language === "hu" ? "Nincs változás leírás" : settings.language === "de" ? "Keine Änderungsbeschreibung" : "No changelog"];
              history.push({
                version: release.tag_name,
                date: date,
                changes: finalChanges
              });
              
              // Magyar esetén is mentsük el
              if (changes.length > 0 && settings.language === "hu") {
                if (!cachedData.translatedVersions[versionKey]) {
                  cachedData.translatedVersions[versionKey] = {};
                }
                cachedData.translatedVersions[versionKey]["hu"] = changes;
                saveVersionHistoryCache(cachedData);
              }
            }
          }
          
          setVersionHistory(history);
          setTranslating(false);
          setLoading(false);
          console.log("✅ Verzió előzmények betöltve cache-ből", { count: history.length });
          return;
        }
        
        // 3. Ha nincs cache vagy lejárt, letöltjük a GitHub releases-t
        console.log("🔍 GitHub releases letöltése...", { 
          reason: cachedData ? "Cache lejárt (>1 óra)" : "Nincs cache"
        });
        
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
        
        console.log(`✅ ${releases.length} release betöltve GitHubról`);
        
        // 4. Checksum generálása és összehasonlítása
        const newChecksum = generateChecksum(releases);
        const hasNewReleases = !cachedData || cachedData.lastChecksum !== newChecksum;
        
        console.log("🔎 Checksum ellenőrzés", { 
          oldChecksum: cachedData?.lastChecksum, 
          newChecksum,
          hasNewReleases
        });
        
        // 5. Inicializáljuk vagy használjuk a meglévő cache-t
        const newCache: VersionHistoryCache = {
          releases: releases,
          translatedVersions: cachedData?.translatedVersions || {},
          lastFetch: timeNow,
          lastChecksum: newChecksum
        };
        
        // Szűrés: ha beta app, akkor csak pre-release-eket, ha release app, akkor csak non-pre-release-eket
        const filteredReleases = isBeta
          ? releases.filter(r => r.prerelease === true)
          : releases.filter(r => r.prerelease === false);
        
        // Rendezés dátum szerint (legújabb elöl)
        filteredReleases.sort((a, b) => {
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        });
        
        console.log(`📊 ${filteredReleases.length} release találat`, { isBeta });
        
        // 6. Konvertálás VersionEntry formátumba és fordítása
        setTranslating(settings.language !== "hu");
        
        const history: VersionEntry[] = [];
        for (const release of filteredReleases) {
          const changes = parseReleaseBody(release.body);
          const date = new Date(release.published_at).toLocaleDateString(
            settings.language === "hu" ? "hu-HU" : 
            settings.language === "de" ? "de-DE" : 
            settings.language === "uk" ? "uk-UA" : 
            settings.language === "ru" ? "ru-RU" : 
            "en-US"
          );
          
          const versionKey = release.tag_name;
          const langKey = settings.language;
          
          // Ellenőrizzük, van-e már lefordítva erre a nyelvre
          let translatedChanges = newCache.translatedVersions[versionKey]?.[langKey];
          
          if (translatedChanges && translatedChanges.length > 0) {
            // Van már lefordítva
            console.log(`💾 Lefordított verzió használata (${versionKey} - ${langKey})`);
          } else if (changes.length > 0) {
            // Nincs még lefordítva, fordítsuk le
            if (settings.language !== "hu") {
              console.log(`🌐 Fordítás szükséges (${versionKey} - ${langKey})`);
              translatedChanges = [];
              for (let idx = 0; idx < changes.length; idx++) {
                const change = changes[idx];
                console.log(`  [${idx + 1}/${changes.length}] Fordítás: ${change.substring(0, 50)}...`);
                const translated = await translateText(change, "hu", settings.language);
                translatedChanges.push(translated);
              }
              console.log(`✅ Fordítás kész: ${versionKey}`);
              
              // Mentsük el a lefordított verziót
              if (!newCache.translatedVersions[versionKey]) {
                newCache.translatedVersions[versionKey] = {};
              }
              newCache.translatedVersions[versionKey][langKey] = translatedChanges;
            } else {
              // Magyar esetén
              translatedChanges = changes;
              if (!newCache.translatedVersions[versionKey]) {
                newCache.translatedVersions[versionKey] = {};
              }
              newCache.translatedVersions[versionKey]["hu"] = changes;
            }
          } else {
            translatedChanges = [settings.language === "hu" ? "Nincs változás leírás" : settings.language === "de" ? "Keine Änderungsbeschreibung" : "No changelog"];
          }
          
          history.push({
            version: release.tag_name,
            date: date,
            changes: translatedChanges || changes
          });
        }
        
        // 7. Mentsük el a cache-t
        saveVersionHistoryCache(newCache);
        
        setVersionHistory(history);
        setTranslating(false);
        console.log("✅ Verzió előzmények betöltve és cache-elve", { count: history.length });
      } catch (err) {
        console.error("❌ Verzió előzmények betöltése hiba:", err);
        setError(err instanceof Error ? err.message : String(err));
        setTranslating(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersionHistory();
  }, [isBeta, settings.language, refetchTrigger]);
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
                  // Újra próbálkozás - egyszerűen csak trigger-eljük a useEffect-et
                  setRefetchTrigger(prev => prev + 1);
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
            {settings.language === "hu" ? "Nincsenek elérhető verzió előzmények" : settings.language === "de" ? "Keine verfügbaren Versionshistorie" : "No version history available"}
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

