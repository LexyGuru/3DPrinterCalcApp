import type { LanguageCode } from "../types";
import type { Currency } from "../types";

export type { Currency };

// Nyelv-pénznem mapping
export const LANGUAGE_CURRENCY_MAP: Record<LanguageCode, Currency> = {
  hu: "HUF",
  en: "USD", // USA alapértelmezett, de lehet GBP is
  de: "EUR",
  fr: "EUR",
  it: "EUR",
  es: "EUR",
  pl: "PLN",
  cs: "CZK",
  sk: "EUR", // Szlovákia is EUR-t használ, de lehet CZK is
  zh: "CNY",
  "pt-BR": "USD", // Brazília USD-t használ
  uk: "UAH",
  ru: "RUB",
};

// Pénznem szimbólumok
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: "€",
  HUF: "Ft",
  USD: "$",
  GBP: "£",
  PLN: "zł",
  CZK: "Kč",
  CNY: "¥",
  UAH: "₴",
  RUB: "₽",
};

// Pénznem címkék (megjelenítéshez)
export const CURRENCY_LABELS: Record<Currency, string> = {
  EUR: "EUR",
  HUF: "Ft",
  USD: "USD",
  GBP: "GBP",
  PLN: "PLN",
  CZK: "CZK",
  CNY: "CNY",
  UAH: "UAH",
  RUB: "RUB",
};

// Pénznem címke lekérése (megjelenítéshez)
export function getCurrencyLabel(currency: Currency): string {
  return CURRENCY_LABELS[currency];
}

// Pénznem szimbólum lekérése
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}

// Nyelv alapján pénznem lekérése
export function getCurrencyForLanguage(language: LanguageCode): Currency {
  return LANGUAGE_CURRENCY_MAP[language] || "EUR";
}

export function convertCurrency(
  amountEUR: number,
  currency: Currency
): number {
  const rates: Record<Currency, number> = {
    EUR: 1,
    HUF: 400,   // 1 EUR = 400 Ft
    USD: 1.10,  // 1 EUR = 1.10 USD
    GBP: 0.85,  // 1 EUR = 0.85 GBP
    PLN: 4.30,  // 1 EUR = 4.30 PLN
    CZK: 25.00, // 1 EUR = 25.00 CZK
    CNY: 7.80,  // 1 EUR = 7.80 CNY
    UAH: 40.00, // 1 EUR = 40.00 UAH
    RUB: 100.00, // 1 EUR = 100.00 RUB
  };
  return amountEUR * rates[currency];
}

// Konvertál egy összeget egy pénznemből egy másikba
export function convertCurrencyFromTo(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Először konvertáljuk EUR-ba
  const ratesToEUR: Record<Currency, number> = {
    EUR: 1,
    HUF: 1 / 400,   // 1 Ft = 1/400 EUR
    USD: 1 / 1.10,  // 1 USD = 1/1.10 EUR
    GBP: 1 / 0.85,  // 1 GBP = 1/0.85 EUR
    PLN: 1 / 4.30,  // 1 PLN = 1/4.30 EUR
    CZK: 1 / 25.00, // 1 CZK = 1/25.00 EUR
    CNY: 1 / 7.80,  // 1 CNY = 1/7.80 EUR
    UAH: 1 / 40.00, // 1 UAH = 1/40.00 EUR
    RUB: 1 / 100.00, // 1 RUB = 1/100.00 EUR
  };

  // Aztán EUR-ból a cél pénznembe
  const ratesFromEUR: Record<Currency, number> = {
    EUR: 1,
    HUF: 400,   // 1 EUR = 400 Ft
    USD: 1.10,  // 1 EUR = 1.10 USD
    GBP: 0.85,  // 1 EUR = 0.85 GBP
    PLN: 4.30,  // 1 EUR = 4.30 PLN
    CZK: 25.00, // 1 EUR = 25.00 CZK
    CNY: 7.80,  // 1 EUR = 7.80 CNY
    UAH: 40.00, // 1 EUR = 40.00 UAH
    RUB: 100.00, // 1 EUR = 100.00 RUB
  };

  const amountInEUR = amount * ratesToEUR[fromCurrency];
  return amountInEUR * ratesFromEUR[toCurrency];
}
