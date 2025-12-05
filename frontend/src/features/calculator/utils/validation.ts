/**
 * Calculator validation utilities
 * Calculator specifikus validációs függvények
 */

import type { ValidationResult } from "@shared/utils/validation";

// Nyomtatási idő validáció (órák: 0-1000, percek: 0-59, másodpercek: 0-59)
export function validatePrintTime(
  hours: number,
  minutes: number,
  seconds: number,
  language: string = "en"
): ValidationResult {
  if (isNaN(hours) || hours < 0 || hours > 1000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "Az órák 0 és 1000 között kell legyenek!"
        : language === "de"
        ? "Die Stunden müssen zwischen 0 und 1000 liegen!"
        : "Hours must be between 0 and 1000!",
    };
  }

  if (isNaN(minutes) || minutes < 0 || minutes > 59) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A percek 0 és 59 között kell legyenek!"
        : language === "de"
        ? "Die Minuten müssen zwischen 0 und 59 liegen!"
        : "Minutes must be between 0 and 59!",
    };
  }

  if (isNaN(seconds) || seconds < 0 || seconds > 59) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A másodpercek 0 és 59 között kell legyenek!"
        : language === "de"
        ? "Die Sekunden müssen zwischen 0 und 59 liegen!"
        : "Seconds must be between 0 and 59!",
    };
  }

  return { isValid: true };
}

// Filament használat validáció (0.1g - 10000g)
export function validateUsedGrams(grams: number, language: string = "en"): ValidationResult {
  if (isNaN(grams) || grams < 0.1) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A használt filament mennyisége legalább 0.1g kell legyen!"
        : language === "de"
        ? "Die verwendete Filamentmenge muss mindestens 0.1g betragen!"
        : "Used filament amount must be at least 0.1g!",
    };
  }

  if (grams > 10000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A használt filament mennyisége nem lehet több mint 10000g!"
        : language === "de"
        ? "Die verwendete Filamentmenge darf nicht mehr als 10000g betragen!"
        : "Used filament amount cannot exceed 10000g!",
    };
  }

  return { isValid: true };
}

// Szárítási idő validáció (0-100 óra)
export function validateDryingTime(hours: number, language: string = "en"): ValidationResult {
  if (isNaN(hours) || hours < 0) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A szárítási idő nem lehet negatív!"
        : language === "de"
        ? "Die Trocknungszeit darf nicht negativ sein!"
        : "Drying time cannot be negative!",
    };
  }

  if (hours > 100) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A szárítási idő nem lehet több mint 100 óra!"
        : language === "de"
        ? "Die Trocknungszeit darf nicht mehr als 100 Stunden betragen!"
        : "Drying time cannot exceed 100 hours!",
    };
  }

  return { isValid: true };
}

// Szárítási teljesítmény validáció (0-10000W)
export function validateDryingPower(power: number, language: string = "en"): ValidationResult {
  if (isNaN(power) || power < 0) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A szárítási teljesítmény nem lehet negatív!"
        : language === "de"
        ? "Die Trocknungsleistung darf nicht negativ sein!"
        : "Drying power cannot be negative!",
    };
  }

  if (power > 10000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A szárítási teljesítmény nem lehet több mint 10000W!"
        : language === "de"
        ? "Die Trocknungsleistung darf nicht mehr als 10000W betragen!"
        : "Drying power cannot exceed 10000W!",
    };
  }

  return { isValid: true };
}

// Profit százalék validáció (0-100%)
export function validateProfitPercentage(percentage: number, language: string = "en"): ValidationResult {
  if (isNaN(percentage) || percentage < 0) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A profit százalék nem lehet negatív!"
        : language === "de"
        ? "Der Gewinnprozentsatz darf nicht negativ sein!"
        : "Profit percentage cannot be negative!",
    };
  }

  if (percentage > 100) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A profit százalék nem lehet több mint 100%!"
        : language === "de"
        ? "Der Gewinnprozentsatz darf nicht mehr als 100% betragen!"
        : "Profit percentage cannot exceed 100%!",
    };
  }

  return { isValid: true };
}

