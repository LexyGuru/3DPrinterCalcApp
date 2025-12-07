/**
 * Format utility functions
 * Dátum, szám, pénznem formázási függvények
 */

/**
 * Dátum formázás locale alapján
 */
export function formatDate(date: Date, locale: string = "en-US"): string {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Idő formázás locale alapján
 */
export function formatTime(date: Date, locale: string = "en-US"): string {
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Dátum és idő formázás locale alapján
 */
export function formatDateTime(date: Date, locale: string = "en-US"): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

/**
 * Szám formázás ezer elválasztóval
 */
export function formatNumber(value: number, locale: string = "en-US", options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Százalék formázás
 */
export function formatPercentage(value: number, locale: string = "en-US", decimals: number = 1): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Pénz formázás
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = "en-US",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...options,
  }).format(amount);
}

/**
 * Rövidített szám formázás (pl. 1.5K, 2.3M)
 */
export function formatCompactNumber(value: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

/**
 * Fájlméret formázás
 */
export function formatFileSize(bytes: number, locale: string = "en-US"): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${formatNumber(size, locale, { maximumFractionDigits: 2 })} ${units[unitIndex]}`;
}

/**
 * Időtartam formázás (óra:perc:másodperc)
 */
export function formatDuration(hours: number, minutes: number = 0, seconds: number = 0): string {
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ");
}

/**
 * Relatív idő formázás (pl. "2 órája", "tegnap", "3 nap múlva")
 */
export function formatRelativeTime(date: Date, locale: string = "en-US"): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffDays) > 7) {
    return formatDate(date, locale);
  }

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, "day");
  }

  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, "hour");
  }

  if (Math.abs(diffMinutes) >= 1) {
    return rtf.format(diffMinutes, "minute");
  }

  return rtf.format(diffSeconds, "second");
}

