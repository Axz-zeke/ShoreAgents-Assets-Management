"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SystemSettings {
  timezone: string
  currency: string
  company: string
  organizationType: string
  logoUrl: string | null
}

interface SystemSettingsContextType {
  settings: SystemSettings
  isLoading: boolean
  refreshSettings: () => Promise<void>
  formatCurrency: (amount: number) => string
  formatDate: (date: Date | string) => string
  formatDateTime: (date: Date | string) => string
}

const defaultSettings: SystemSettings = {
  timezone: 'America/New_York',
  currency: 'USD',
  company: 'ShoreAgents Assets',
  organizationType: 'Enterprise',
  logoUrl: null,
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined)

export function SystemSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/company-info')
      if (response.ok) {
        const data = await response.json()
        const newSettings = {
          timezone: data.timezone || defaultSettings.timezone,
          currency: data.currency || defaultSettings.currency,
          company: data.company || defaultSettings.company,
          organizationType: data.organizationType || defaultSettings.organizationType,
          logoUrl: data.logoUrl || null,
        }
        setSettings(newSettings)
        // Cache in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('systemSettings', JSON.stringify(newSettings))
        }
      }
    } catch (error) {
      console.error('Error fetching system settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true)
    
    // Load from cache immediately after hydration
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('systemSettings')
      if (cached) {
        try {
          const cachedSettings = JSON.parse(cached)
          setSettings(cachedSettings)
        } catch (e) {
          console.error('Error parsing cached settings:', e)
        }
      }
    }

    // Then fetch fresh data in background
    fetchSettings()

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      fetchSettings()
    }
    window.addEventListener('companyInfoUpdated', handleSettingsUpdate)

    return () => {
      window.removeEventListener('companyInfoUpdated', handleSettingsUpdate)
    }
  }, [])

  const formatCurrency = (amount: number): string => {
    try {
      // Currency symbol map
      const currencySymbols: Record<string, string> = {
        USD: '$', EUR: '€', GBP: '£', JPY: '¥', CHF: 'CHF', CAD: 'C$',
        AUD: 'A$', NZD: 'NZ$', CNY: '¥', INR: '₹', KRW: '₩', SGD: 'S$',
        HKD: 'HK$', MXN: 'MX$', BRL: 'R$', ZAR: 'R', RUB: '₽', TRY: '₺',
        SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', THB: '฿', IDR: 'Rp',
        MYR: 'RM', PHP: '₱', AED: 'AED', SAR: 'SAR', ILS: '₪', EGP: 'E£'
      }

      const symbol = currencySymbols[settings.currency] || settings.currency
      
      // Format number with proper decimal places
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)

      return `${symbol}${formatted}`
    } catch (error) {
      console.error('Error formatting currency:', error)
      return `${settings.currency} ${amount.toFixed(2)}`
    }
  }

  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return new Intl.DateTimeFormat('en-US', {
        timeZone: settings.timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(dateObj)
    } catch (error) {
      console.error('Error formatting date:', error)
      return String(date)
    }
  }

  const formatDateTime = (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return new Intl.DateTimeFormat('en-US', {
        timeZone: settings.timezone,
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

  const value = {
    settings,
    isLoading,
    refreshSettings: fetchSettings,
    formatCurrency,
    formatDate,
    formatDateTime,
  }

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  )
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext)
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider')
  }
  return context
}

