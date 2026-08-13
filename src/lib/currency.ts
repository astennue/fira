// Approximate exchange rates to PHP (hardcoded, no external API)
export const EXCHANGE_RATES_TO_PHP: Record<string, number> = {
  USD: 56.50,
  EUR: 61.20,
  GBP: 72.80,
  JPY: 0.38,
  AED: 15.39,
  SAR: 15.07,
  QAR: 15.52,
  KWD: 183.70,
  BHD: 150.20,
  OMR: 146.80,
  SGD: 42.50,
  HKD: 7.24,
  MYR: 12.10,
  TWD: 1.82,
  KRW: 0.042,
  CAD: 41.50,
  AUD: 37.80,
  NZD: 34.20,
  PHP: 1,
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', AED: 'د.إ', SAR: '﷼',
  QAR: '﷼', KWD: 'د.ك', BHD: 'د.ب', OMR: 'ر.ع.', SGD: 'S$',
  HKD: 'HK$', MYR: 'RM', TWD: 'NT$', KRW: '₩', CAD: 'C$',
  AUD: 'A$', NZD: 'NZ$', PHP: '₱',
}

/**
 * Convert a foreign currency amount to Philippine Peso (PHP).
 * Returns null if the currency is unknown.
 */
export function convertToPHP(amount: number, fromCurrency: string): number | null {
  const rate = EXCHANGE_RATES_TO_PHP[fromCurrency.toUpperCase()]
  if (rate == null) return null
  return Math.round(amount * rate)
}

/**
 * Get the symbol for a currency code.
 */
export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code.toUpperCase()] || code
}

/**
 * Format a number as Philippine Peso with ₱ symbol and comma separators.
 */
export function formatPHP(amount: number): string {
  return `₱${Math.round(amount).toLocaleString()}`
}
