// Input validációs utility funkciók

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Szám validáció (pozitív, maximum érték)
export const validatePositiveNumber = (
  value: number,
  max?: number,
  fieldName?: string
): ValidationResult => {
  if (isNaN(value) || value < 0) {
    return {
      isValid: false,
      errorMessage: fieldName
        ? `${fieldName} must be a positive number`
        : "Value must be a positive number"
    };
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      errorMessage: fieldName
        ? `${fieldName} must not exceed ${max}`
        : `Value must not exceed ${max}`
    };
  }

  return { isValid: true };
};

// Filament súly validáció (100g - 10000g)
export const validateFilamentWeight = (weight: number, language: string = "en"): ValidationResult => {
  if (isNaN(weight) || weight < 100) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A filament súlya legalább 100g kell legyen!"
        : language === "de"
        ? "Das Filamentgewicht muss mindestens 100g betragen!"
        : "Filament weight must be at least 100g!"
    };
  }

  if (weight > 10000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A filament súlya nem lehet több mint 10000g!"
        : language === "de"
        ? "Das Filamentgewicht darf nicht mehr als 10000g betragen!"
        : "Filament weight cannot exceed 10000g!"
    };
  }

  return { isValid: true };
};

// Filament ár validáció (0 - 10000)
export const validateFilamentPrice = (price: number, language: string = "en"): ValidationResult => {
  if (isNaN(price) || price < 0) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "Az ár nem lehet negatív!"
        : language === "de"
        ? "Der Preis darf nicht negativ sein!"
        : "Price cannot be negative!"
    };
  }

  if (price > 10000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "Az ár nem lehet több mint 10000!"
        : language === "de"
        ? "Der Preis darf nicht mehr als 10000 betragen!"
        : "Price cannot exceed 10000!"
    };
  }

  return { isValid: true };
};

// Nyomtatási idő validáció (órák: 0-1000, percek: 0-59, másodpercek: 0-59)
export const validatePrintTime = (
  hours: number,
  minutes: number,
  seconds: number,
  language: string = "en"
): ValidationResult => {
  if (isNaN(hours) || hours < 0 || hours > 1000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "Az órák 0 és 1000 között kell legyenek!"
        : language === "de"
        ? "Die Stunden müssen zwischen 0 und 1000 liegen!"
        : "Hours must be between 0 and 1000!"
    };
  }

  if (isNaN(minutes) || minutes < 0 || minutes > 59) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A percek 0 és 59 között kell legyenek!"
        : language === "de"
        ? "Die Minuten müssen zwischen 0 und 59 liegen!"
        : "Minutes must be between 0 and 59!"
    };
  }

  if (isNaN(seconds) || seconds < 0 || seconds > 59) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A másodpercek 0 és 59 között kell legyenek!"
        : language === "de"
        ? "Die Sekunden müssen zwischen 0 und 59 liegen!"
        : "Seconds must be between 0 and 59!"
    };
  }

  return { isValid: true };
};

// Filament használat validáció (0.1g - 10000g)
export const validateUsedGrams = (grams: number, language: string = "en"): ValidationResult => {
  if (isNaN(grams) || grams < 0.1) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A használt filament mennyisége legalább 0.1g kell legyen!"
        : language === "de"
        ? "Die verwendete Filamentmenge muss mindestens 0.1g betragen!"
        : "Used filament amount must be at least 0.1g!"
    };
  }

  if (grams > 10000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A használt filament mennyisége nem lehet több mint 10000g!"
        : language === "de"
        ? "Die verwendete Filamentmenge darf nicht mehr als 10000g betragen!"
        : "Used filament amount cannot exceed 10000g!"
    };
  }

  return { isValid: true };
};

// Szárítási idő validáció (0-100 óra)
export const validateDryingTime = (hours: number, language: string = "en"): ValidationResult => {
  if (isNaN(hours) || hours < 0) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A szárítási idő nem lehet negatív!"
        : language === "de"
        ? "Die Trocknungszeit darf nicht negativ sein!"
        : "Drying time cannot be negative!"
    };
  }

  if (hours > 100) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A szárítási idő nem lehet több mint 100 óra!"
        : language === "de"
        ? "Die Trocknungszeit darf nicht mehr als 100 Stunden betragen!"
        : "Drying time cannot exceed 100 hours!"
    };
  }

  return { isValid: true };
};

// Szárítási teljesítmény validáció (0-10000W)
export const validateDryingPower = (power: number, language: string = "en"): ValidationResult => {
  if (isNaN(power) || power < 0) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A szárítási teljesítmény nem lehet negatív!"
        : language === "de"
        ? "Die Trocknungsleistung darf nicht negativ sein!"
        : "Drying power cannot be negative!"
    };
  }

  if (power > 10000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A szárítási teljesítmény nem lehet több mint 10000W!"
        : language === "de"
        ? "Die Trocknungsleistung darf nicht mehr als 10000W betragen!"
        : "Drying power cannot exceed 10000W!"
    };
  }

  return { isValid: true };
};

// Nyomtató teljesítmény validáció (1W - 10000W)
export const validatePrinterPower = (power: number, language: string = "en"): ValidationResult => {
  if (isNaN(power) || power < 1) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A nyomtató teljesítménye legalább 1W kell legyen!"
        : language === "de"
        ? "Die Druckerleistung muss mindestens 1W betragen!"
        : "Printer power must be at least 1W!"
    };
  }

  if (power > 10000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A nyomtató teljesítménye nem lehet több mint 10000W!"
        : language === "de"
        ? "Die Druckerleistung darf nicht mehr als 10000W betragen!"
        : "Printer power cannot exceed 10000W!"
    };
  }

  return { isValid: true };
};

// Nyomtató használati költség validáció (0 - 1000)
export const validateUsageCost = (cost: number, language: string = "en"): ValidationResult => {
  if (isNaN(cost) || cost < 0) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A használati költség nem lehet negatív!"
        : language === "de"
        ? "Die Nutzungskosten dürfen nicht negativ sein!"
        : "Usage cost cannot be negative!"
    };
  }

  if (cost > 1000) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A használati költség nem lehet több mint 1000!"
        : language === "de"
        ? "Die Nutzungskosten dürfen nicht mehr als 1000 betragen!"
        : "Usage cost cannot exceed 1000!"
    };
  }

  return { isValid: true };
};

// AMS szám validáció (0-10)
export const validateAMSCount = (count: number, language: string = "en"): ValidationResult => {
  if (isNaN(count) || count < 0) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "Az AMS szám nem lehet negatív!"
        : language === "de"
        ? "Die AMS-Anzahl darf nicht negativ sein!"
        : "AMS count cannot be negative!"
    };
  }

  if (count > 10) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "Az AMS szám nem lehet több mint 10!"
        : language === "de"
        ? "Die AMS-Anzahl darf nicht mehr als 10 betragen!"
        : "AMS count cannot exceed 10!"
    };
  }

  return { isValid: true };
};

// Profit százalék validáció (0-100%)
export const validateProfitPercentage = (percentage: number, language: string = "en"): ValidationResult => {
  if (isNaN(percentage) || percentage < 0) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A profit százalék nem lehet negatív!"
        : language === "de"
        ? "Der Gewinnprozentsatz darf nicht negativ sein!"
        : "Profit percentage cannot be negative!"
    };
  }

  if (percentage > 100) {
    return {
      isValid: false,
      errorMessage: language === "hu"
        ? "A profit százalék nem lehet több mint 100%!"
        : language === "de"
        ? "Der Gewinnprozentsatz darf nicht mehr als 100% betragen!"
        : "Profit percentage cannot exceed 100%!"
    };
  }

  return { isValid: true };
};

