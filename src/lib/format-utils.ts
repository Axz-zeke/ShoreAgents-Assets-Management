/**
 * Utility functions for formatting currency and dates
 * These functions can be used in server components or outside of React context
 */

interface SystemSettings {
  timezone: string
  currency: string
}

const defaultSettings: SystemSettings = {
  timezone: 'America/New_York',
  currency: 'USD',
}

// Currency symbol map
const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CHF: 'CHF', CAD: 'C$',
  AUD: 'A$', NZD: 'NZ$', CNY: '¥', INR: '₹', KRW: '₩', SGD: 'S$',
  HKD: 'HK$', MXN: 'MX$', BRL: 'R$', ZAR: 'R', RUB: '₽', TRY: '₺',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', THB: '฿', IDR: 'Rp',
  MYR: 'RM', PHP: '₱', AED: 'AED', SAR: 'SAR', ILS: '₪', EGP: 'E£'
}

export function formatCurrency(amount: number, currency: string = defaultSettings.currency): string {
  try {
    const symbol = currencySymbols[currency] || currency
    
    // Format number with proper decimal places
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

    return `${symbol}${formatted}`
  } catch (error) {
    console.error('Error formatting currency:', error)
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatDate(date: Date | string, timezone: string = defaultSettings.timezone): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

export function formatDateTime(date: Date | string, timezone: string = defaultSettings.timezone): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return String(date)
  }
}

export function formatDateTimeLong(date: Date | string, timezone: string = defaultSettings.timezone): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj)
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return String(date)
  }
}

export function getCurrencySymbol(currency: string): string {
  return currencySymbols[currency] || currency
}





