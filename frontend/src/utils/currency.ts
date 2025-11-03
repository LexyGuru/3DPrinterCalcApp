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
