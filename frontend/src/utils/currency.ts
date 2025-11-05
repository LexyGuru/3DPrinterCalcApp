export function convertCurrency(
  amountEUR: number,
  currency: "EUR" | "HUF" | "USD"
): number {
  const rates: Record<string, number> = {
    EUR: 1,
    HUF: 400,   // 1 EUR = 400 Ft (példa)
    USD: 1.10,  // 1 EUR = 1.10 USD (példa)
  };
  return amountEUR * rates[currency];
}

// Konvertál egy összeget egy pénznemből egy másikba
export function convertCurrencyFromTo(
  amount: number,
  fromCurrency: "EUR" | "HUF" | "USD",
  toCurrency: "EUR" | "HUF" | "USD"
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Először konvertáljuk EUR-ba
  const ratesToEUR: Record<string, number> = {
    EUR: 1,
    HUF: 1 / 400,   // 1 Ft = 1/400 EUR
    USD: 1 / 1.10,  // 1 USD = 1/1.10 EUR
  };

  // Aztán EUR-ból a cél pénznembe
  const ratesFromEUR: Record<string, number> = {
    EUR: 1,
    HUF: 400,   // 1 EUR = 400 Ft
    USD: 1.10,  // 1 EUR = 1.10 USD
  };

  const amountInEUR = amount * ratesToEUR[fromCurrency];
  return amountInEUR * ratesFromEUR[toCurrency];
}
