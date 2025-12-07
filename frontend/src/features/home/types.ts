/**
 * Home Feature Types
 * Home feature specifikus típusok
 */

import type { Offer, Settings } from "../../types";

// Trend pont típus
export type TrendPoint = {
  label: string;
  revenue: number;
  costs: number;
  profit: number;
  date: Date;
};

// Breakdown slice típus
export type BreakdownSlice = {
  label: string;
  value: number;
  color?: string;
};

// Scheduled task típus
export type ScheduledTask = {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  relatedOfferId?: number;
};

// Exportáljuk a Settings típust is
export type { Settings, Offer };

// Chart palette konstans
export const CHART_PALETTE = [
  "#6366F1",
  "#22D3EE",
  "#F97316",
  "#4ADE80",
  "#A855F7",
  "#F43F5E",
  "#14B8A6",
  "#FACC15",
];

// Language locales konstans
export const LANGUAGE_LOCALES: Record<string, string> = {
  hu: "hu-HU",
  de: "de-DE",
  fr: "fr-FR",
  it: "it-IT",
  es: "es-ES",
  pl: "pl-PL",
  cs: "cs-CZ",
  sk: "sk-SK",
  zh: "zh-CN",
  "pt-BR": "pt-BR",
  uk: "uk-UA",
  ru: "ru-RU",
  en: "en-US",
};

