import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import translateModule from "@vitalets/google-translate-api";
const translateFn: (text: string, options: { from: string; to: string }) => Promise<{ text: string }> =
  typeof translateModule === "function" ? translateModule : (translateModule as any).default;

import type { TranslationMap } from "../src/utils/languages/types";
import { languageEn } from "../src/utils/languages/language_en";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const languagesDir = path.resolve(__dirname, "../src/utils/languages");

type TargetLocale = {
  code: string;
  googleCode: string;
  exportName: string;
  fileName: string;
};

const TARGET_LOCALES: TargetLocale[] = [
  { code: "fr", googleCode: "fr", exportName: "languageFr", fileName: "language_fr.ts" },
  { code: "it", googleCode: "it", exportName: "languageIt", fileName: "language_it.ts" },
  { code: "es", googleCode: "es", exportName: "languageEs", fileName: "language_es.ts" },
  { code: "pl", googleCode: "pl", exportName: "languagePl", fileName: "language_pl.ts" },
  { code: "cs", googleCode: "cs", exportName: "languageCs", fileName: "language_cs.ts" },
  { code: "sk", googleCode: "sk", exportName: "languageSk", fileName: "language_sk.ts" },
  { code: "pt-BR", googleCode: "pt", exportName: "languagePt", fileName: "language_pt.ts" },
  { code: "zh", googleCode: "zh-cn", exportName: "languageZh", fileName: "language_zh.ts" },
];

type ReplacementToken = {
  token: string;
  value: string;
};

const translationCache = new Map<string, string>();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function protectText(text: string): { protectedText: string; replacements: ReplacementToken[] } {
  let result = text;
  const replacements: ReplacementToken[] = [];

  const applyProtection = (regex: RegExp, prefix: string) => {
    result = result.replace(regex, match => {
      const token = `__${prefix}_${replacements.length}__`;
      replacements.push({ token, value: match });
      return token;
    });
  };

  applyProtection(/{[^}]+}/g, "VAR");
  applyProtection(/<[^>]+>/g, "TAG");
  applyProtection(/%\d?\$?[sdif]/gi, "FMT"); // printf style
  applyProtection(/\[\[[^\]]+\]\]/g, "BRACKET");

  return { protectedText: result, replacements };
}

function restoreText(text: string, replacements: ReplacementToken[]): string {
  let result = text;
  for (const { token, value } of replacements) {
    result = result.replace(new RegExp(token, "g"), value);
  }
  return result;
}

async function translateText(text: string, googleCode: string): Promise<string> {
  if (!text.trim()) {
    return text;
  }
  const cacheKey = `${googleCode}::${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { text: translated } = await translateFn(text, { from: "en", to: googleCode });
      translationCache.set(cacheKey, translated);
      await delay(120); // be gentle with the free endpoint
      return translated;
    } catch (error) {
      console.warn(`[translate] Attempt ${attempt} failed for "${text}" -> ${googleCode}`, error);
      await delay(400 * attempt);
    }
  }

  console.warn(`[translate] Falling back to source text for "${text}" -> ${googleCode}`);
  translationCache.set(cacheKey, text);
  return text;
}

async function loadExistingTranslations(target: TargetLocale): Promise<TranslationMap | undefined> {
  try {
    const moduleUrl = pathToFileURL(path.resolve(languagesDir, target.fileName));
    const cacheBustedUrl = `${moduleUrl.href}?update=${Date.now()}`;
    const module = await import(cacheBustedUrl);
    return module[target.exportName] as TranslationMap | undefined;
  } catch (error) {
    console.warn(`[translate] Could not load existing translations for ${target.code}`, error);
    return undefined;
  }
}

function prepareOutputContent(target: TargetLocale, translations: TranslationMap): string {
  const header = `import type { TranslationMap } from "./types";\n\nexport const ${target.exportName}: TranslationMap = {\n`;
  const body = Object.entries(languageEn)
    .map(([key]) => {
      const value = translations[key as keyof TranslationMap] ?? "";
      return `  "${key}": ${JSON.stringify(value)},`;
    })
    .join("\n");
  const footer = "\n};\n";
  return `${header}${body}${footer}`;
}

async function translateLocale(target: TargetLocale) {
  console.log(`\nTranslating ${target.code} (${target.googleCode})…`);
  const existing = await loadExistingTranslations(target);
  const translatedEntries: Partial<TranslationMap> = {};

  const englishEntries = Object.entries(languageEn) as [keyof TranslationMap, string][];

  for (const [key, englishText] of englishEntries) {
    const existingValue = existing?.[key];
    if (existingValue && existingValue !== englishText) {
      translatedEntries[key] = existingValue;
      continue;
    }

    const leadingWhitespace = englishText.match(/^\s+/)?.[0] ?? "";
    const trailingWhitespace = englishText.match(/\s+$/)?.[0] ?? "";
    const core = englishText.substring(leadingWhitespace.length, englishText.length - trailingWhitespace.length);

    const { protectedText, replacements } = protectText(core);
    const translatedCore = await translateText(protectedText, target.googleCode);
    const restoredCore = restoreText(translatedCore, replacements);
    translatedEntries[key] = `${leadingWhitespace}${restoredCore}${trailingWhitespace}`;
  }

  const output = prepareOutputContent(target, translatedEntries as TranslationMap);
  await fs.writeFile(path.resolve(languagesDir, target.fileName), output, "utf8");
  console.log(`Saved translations to ${target.fileName}`);
}

async function main() {
  for (const target of TARGET_LOCALES) {
    await translateLocale(target);
  }
  console.log("\n✅ Translation complete.");
}

main().catch(error => {
  console.error("Translation script failed:", error);
  process.exitCode = 1;
});


