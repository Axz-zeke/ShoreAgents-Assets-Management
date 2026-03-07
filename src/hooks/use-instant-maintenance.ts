"use client"

import { MaintenanceRecord } from './use-maintenance'
import { useMaintenance } from './use-maintenance-query'

// Custom hook that provides instant data when available
export function useInstantMaintenance(filters?: {
  assetId?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const query = useMaintenance(filters)
  const data = query.data as MaintenanceRecord[] | undefined

  // Show loading only if we have no data at all (initial load)
  const isLoading = (!data || data.length === 0) && query.isLoading

  return {
    ...query,
    data: data || [],
    isLoading,
    // Provide a more descriptive name
    isInitialLoading: query.isLoading && (!data || data.length === 0),
  }
}
