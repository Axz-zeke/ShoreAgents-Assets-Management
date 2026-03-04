"use client"

import { useMaintenance } from './use-maintenance-query'

// Custom hook that provides instant data when available
export function useInstantMaintenance(filters?: {
  assetId?: string
  status?: string
  limit?: number
  offset?: number
}) {
  const query = useMaintenance(filters)
  
  // Show loading only if we have no data at all (initial load)
  const isLoading = (!query.data || query.data.length === 0) && query.isLoading
  
  return {
    ...query,
    isLoading,
    // Provide a more descriptive name
    isInitialLoading: query.isLoading && (!query.data || query.data.length === 0),
  }
}
