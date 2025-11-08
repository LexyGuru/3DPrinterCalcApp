const TRANSLATION_CACHE = new Map<string, string>();
const BASE_URL = "https://api.mymemory.translated.net/get";

const normalizeLanguage = (lang: string): string => {
  const lower = lang.toLowerCase();
  if (lower.startsWith("hu")) return "hu";
  if (lower.startsWith("de")) return "de";
  return "en";
};

export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }

  const source = normalizeLanguage(sourceLang);
  const target = normalizeLanguage(targetLang);

  if (source === target) {
    return trimmed;
  }

  const cacheKey = `${source}|${target}|${trimmed}`;
  const cached = TRANSLATION_CACHE.get(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${BASE_URL}?q=${encodeURIComponent(trimmed)}&langpair=${source}|${target}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const translated = (data?.responseData?.translatedText as string | undefined)?.trim();
    if (translated) {
      TRANSLATION_CACHE.set(cacheKey, translated);
      return translated;
    }
  } catch (error) {
    console.warn("[translator] Translation failed", error);
  }

  TRANSLATION_CACHE.set(cacheKey, trimmed);
  return trimmed;
}
