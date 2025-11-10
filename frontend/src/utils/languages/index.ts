import type { LanguageDefinition, LanguageCode, TranslationMap } from "./types";
import { languageHu } from "./language_hu";
import { languageEn } from "./language_en";
import { languageDe } from "./language_de";

const languageDefinitions: LanguageDefinition[] = [
  { code: "hu", label: "Magyar", flag: "🇭🇺", translations: languageHu },
  { code: "en", label: "English", flag: "🇬🇧", translations: languageEn },
  { code: "de", label: "Deutsch", flag: "🇩🇪", translations: languageDe },
];

export const translations: Record<LanguageCode, TranslationMap> = languageDefinitions.reduce(
  (acc, definition) => {
    acc[definition.code] = definition.translations;
    return acc;
  },
  {} as Record<LanguageCode, TranslationMap>
);

export const availableLanguages = languageDefinitions.map(({ translations, ...meta }) => meta);

export type { LanguageDefinition, LanguageCode, TranslationMap, TranslationKey } from "./types";

