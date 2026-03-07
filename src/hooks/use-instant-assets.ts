"use client"

import { Asset } from '@/lib/lists-data'
import { useAssets } from './use-assets-query'

// Custom hook that provides instant data when available
export function useInstantAssets() {
  const query = useAssets()
  const data = query.data as Asset[] | undefined

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
