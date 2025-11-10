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
  return (key: TranslationKey): string => translations[language]?.[key] ?? key;
}

