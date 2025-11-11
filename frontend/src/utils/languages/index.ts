import type { LanguageDefinition, LanguageCode, TranslationMap } from "./types";
import { languageHu } from "./language_hu";
import { languageEn } from "./language_en";
import { languageDe } from "./language_de";
import { languageFr } from "./language_fr";
import { languageIt } from "./language_it";
import { languageEs } from "./language_es";
import { languagePl } from "./language_pl";
import { languageCs } from "./language_cs";
import { languageSk } from "./language_sk";
import { languageZh } from "./language_zh";
import { languagePt } from "./language_pt";

const languageDefinitions: LanguageDefinition[] = [
  { code: "hu", label: "Magyar", flag: "🇭🇺", translations: languageHu },
  { code: "en", label: "English", flag: "🇬🇧", translations: languageEn },
  { code: "de", label: "Deutsch", flag: "🇩🇪", translations: languageDe },
  { code: "fr", label: "Français", flag: "🇫🇷", translations: languageFr },
  { code: "it", label: "Italiano", flag: "🇮🇹", translations: languageIt },
  { code: "es", label: "Español", flag: "🇪🇸", translations: languageEs },
  { code: "pl", label: "Polski", flag: "🇵🇱", translations: languagePl },
  { code: "cs", label: "Čeština", flag: "🇨🇿", translations: languageCs },
  { code: "sk", label: "Slovenčina", flag: "🇸🇰", translations: languageSk },
  { code: "zh", label: "中文（简体）", flag: "🇨🇳", translations: languageZh },
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷", translations: languagePt },
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

