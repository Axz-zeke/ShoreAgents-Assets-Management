"use client"

import { useSystemSettings } from "@/contexts/system-settings-context"

interface DateDisplayProps {
  date: Date | string
  format?: 'date' | 'datetime' | 'long'
  className?: string
}

export function DateDisplay({ date, format = 'date', className }: DateDisplayProps) {
  const { formatDate, formatDateTime } = useSystemSettings()

  const formattedDate = format === 'datetime' 
    ? formatDateTime(date)
    : formatDate(date)

  return <span className={className}>{formattedDate}</span>
}





