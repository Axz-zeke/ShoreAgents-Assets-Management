"use client"

import { useSystemSettings } from "@/contexts/system-settings-context"

interface CurrencyDisplayProps {
  amount: number
  className?: string
}

export function CurrencyDisplay({ amount, className }: CurrencyDisplayProps) {
  const { formatCurrency } = useSystemSettings()

  return <span className={className}>{formatCurrency(amount)}</span>
}





