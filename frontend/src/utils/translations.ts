import type { Settings } from "../types";
import type {
  TranslationKey,
  TranslationMap,
  LanguageDefinition,
  LanguageCode,
} from "./languages";
import {
  translations as translationRegistry,
  availableLanguages,
} from "./languages";

export type { TranslationKey, TranslationMap, LanguageDefinition, LanguageCode };
export { availableLanguages };
export const translations = translationRegistry;

export function useTranslation(language: Settings["language"]) {
  return (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language]?.[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    return text;
  };
}

