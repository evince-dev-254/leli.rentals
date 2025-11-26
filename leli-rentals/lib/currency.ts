/**
 * Currency formatting utility
 * Default currency is KSh (Kenyan Shilling)
 */

export const DEFAULT_CURRENCY = 'KSh' as const
export const DEFAULT_CURRENCY_CODE = 'KES' as const

/**
 * Format amount with default KSh currency
 */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  if (currency === 'KSh' || currency === 'KES') {
    return `KSh ${amount.toLocaleString('en-KE')}`
  }
  
  // For other currencies, use Intl formatter
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency || DEFAULT_CURRENCY_CODE,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  } catch {
    // Fallback to KSh
    return `KSh ${amount.toLocaleString('en-KE')}`
  }
}

/**
 * Format currency with day/hour/etc suffix
 */
export function formatCurrencyWithUnit(amount: number, unit: string = 'day', currency: string = DEFAULT_CURRENCY): string {
  return `${formatCurrency(amount, currency)}/${unit}`
}

